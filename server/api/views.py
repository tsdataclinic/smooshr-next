"""Entry point for the API server"""

import json
import logging
from collections.abc import Generator
from contextlib import contextmanager
from datetime import datetime
from typing import Any, ClassVar, Generator, Optional
import secrets

from fastapi.security import APIKeyHeader
import frictionless.exception
from fastapi import Depends, FastAPI, Form, HTTPException, Security, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from fastapi_azure_auth import B2CMultiTenantAuthorizationCodeBearer
from fastapi_azure_auth.user import User as AzureUser
from frictionless import Resource
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.orm import Session
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

from server.api.api_keys.db_api_key_provider import DbApiKeyProvider
from server.api.api_keys.azure_api_key_provider import AzureApiKeyProvider
from server.database import SessionLocal
from server.models.apikey.api_schemas import ApiKey, ApiKeyCreate, ApiKeyDelete
from server.models.user.api_schemas import User
from server.models.user.db_model import DBUser
from server.models.workflow.api_schemas import (
    BaseWorkflow,
    FullWorkflow,
    WorkflowCreate,
    WorkflowRunReport,
    WorkflowUpdate,
)
from server.models.workflow.db_model import DBWorkflow
from server.models.workflow.workflow_schema import WorkflowSchema
from server.workflow_runner.validators import WorkflowParamValue
from server.workflow_runner.workflow_runner import process_workflow

LOG = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelprefix)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


class Settings(BaseSettings):
    """Core configurations for the API server"""

    BACKEND_CORS_ORIGINS: list[str | AnyHttpUrl] = ["http://localhost:5173"]
    AZURE_APP_CLIENT_ID: str = Field(default="")
    AZURE_OPENAPI_CLIENT_ID: str = Field(default="")
    AZURE_DOMAIN_NAME: str = Field(default="")
    AZURE_POLICY_AUTH_NAME: str = Field(default="")
    AZURE_B2C_SCOPES: str = Field(default="")

    AZURE_KEY_VAULT_URL: str = Field(default="")
      
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env.server", case_sensitive=True
    )


def custom_generate_unique_id(route: APIRoute) -> str:
    """Change the unique id that FastAPI gives each function so it's formatted
    as [apiTag]-[routeName]. This makes our autogenerated TypeScript functions
    a lot cleaner.
    """
    return f"{route.name}"

def generate_api_key() -> str:
    """Generate a random 32 character API key"""
    return secrets.token_hex(20)

settings = Settings()

app = FastAPI(
    title="Smooshr2 API",
    generate_unique_id_function=custom_generate_unique_id,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key_scheme = APIKeyHeader(name="X-API-Key", auto_error=False)

azure_scheme = B2CMultiTenantAuthorizationCodeBearer(
    app_client_id=settings.AZURE_APP_CLIENT_ID,
    scopes={
        f"https://{settings.AZURE_B2C_SCOPES}": "API Scope",
    },
    openid_config_url=(
        f"https://{settings.AZURE_DOMAIN_NAME}.b2clogin.com/{settings.AZURE_DOMAIN_NAME}"
        f".onmicrosoft.com/{settings.AZURE_POLICY_AUTH_NAME}/v2.0/.well-known/"
        f"openid-configuration"
    ),
    openapi_authorization_url=(
        f"https://{settings.AZURE_DOMAIN_NAME}.b2clogin.com/{settings.AZURE_DOMAIN_NAME}"
        f".onmicrosoft.com/{settings.AZURE_POLICY_AUTH_NAME}/oauth2/v2.0/token"
    ),
    validate_iss=False,
    auto_error=False
)

azure_credential = DefaultAzureCredential()
azure_kv_client = SecretClient(vault_url=settings.AZURE_KEY_VAULT_URL, credential=azure_credential)

# Change this to switch between Azure and DB key providers
KEY_PROVIDER_CLASS = AzureApiKeyProvider

@contextmanager
def _commit_or_rollback(session: Session):
    # Helper function to commit or rollback a session
    try:
        yield
        session.commit()
    except:
        session.rollback()
        raise


def get_session() -> Generator[Session, Any, None]:
    """Get a DB session"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def get_current_user(
    azure_user: Optional[AzureUser] = Depends(azure_scheme),
    api_key: Optional[str] = Depends(api_key_scheme),
    session: Session = Depends(get_session),
) -> DBUser:
    """This function authenticates and returns the currently signed in user. This function
    supports both Azure and API key authentication."""
    if azure_user is not None:
        return _get_current_user_from_azure(azure_user, session=session)
    elif api_key is not None:
        return _get_current_user_from_api_key(api_key, session=session)
    else:
        raise HTTPException(
            status_code=401, detail="Not authenticated."
        )

def get_current_user_no_api_key(
    azure_user: AzureUser = Depends(azure_scheme),
    session: Session = Depends(get_session),
) -> DBUser:
    """This function authenticates and returns the currently signed in user. This function
    supports only Azure authentication, and should be used for private API endpoints that are
    only accessible via the Smooshr2 frontend."""
    return get_current_user(azure_user, api_key=None, session=session)

def _get_current_user_from_api_key(
    api_key: str = Depends(api_key_scheme),
    session: Session = Depends(get_session),
) -> DBUser:
    """This function returns the currently authenticated user given an API key."""
    api_key_provider = KEY_PROVIDER_CLASS(session, azure_kv_client)
    result = api_key_provider.get_user_and_expiration(api_key)

    if result is None:
        raise HTTPException(
            status_code=401, detail="Invalid or expired API key."
        )

    user_id, _ = result
    db_user = session.get(DBUser, user_id)

    return db_user 

def _get_current_user_from_azure(
    azure_user: AzureUser = Depends(azure_scheme),
    session: Session = Depends(get_session),
) -> DBUser:
    """This function returns the currently authenticated user given an AzureUser."""
    # check if the azure user exists in our database already
    user_id: str = azure_user.claims.get("oid", "")

    db_user = session.get(DBUser, user_id)

    if db_user:
        return db_user

    # user doesn't exist yet, so create the user
    token = azure_user.claims
    new_db_user = DBUser(
        id=user_id,
        email=token.get("emails", ["no_email"])[0],
        identity_provider=token.get("idp", "local"),
        family_name=token.get("family_name", ""),
        given_name=token.get("given_name", ""),
    )
    session.add(new_db_user)
    session.commit()
    session.refresh(new_db_user)
    return new_db_user

def fetch_workflow_or_raise(
    workflow_id: str, session: Session, user: DBUser
) -> DBWorkflow:
    """Fetches a workflow orm object with the given workflow_id from the
    database, or raises an exception if the workflow cannot be found, or
    if the user does not own the workflow."""

    workflow = session.query(DBWorkflow).filter(DBWorkflow.id == workflow_id).first()

    if not workflow:
        raise HTTPException(
            status_code=404, detail=f"Workflow with id {workflow_id} was not found."
        )

    # currently we just check if the user owns the workflow, but in the future
    # there may be other ways of sharing workflows with non-owner users
    if workflow.owner != user.id:
        raise HTTPException(
            status_code=404, detail=f"Workflow {workflow_id} not found."
        )

    return workflow


@app.get(
    "/api/users/self",
    dependencies=[Security(azure_scheme)],
    tags=["users"],
)
def get_self_user(user: DBUser = Depends(get_current_user)) -> User:
    """Get the currently signed in user"""
    return user


@app.get("/api/workflows/{workflow_id}", tags=["workflows"])
def get_workflow(
    workflow_id: str,
    session: Session = Depends(get_session),
    user: DBUser = Depends(get_current_user),
) -> FullWorkflow:
    """Get a workflow by ID"""
    db_workflow = fetch_workflow_or_raise(workflow_id, session, user)
    return FullWorkflow.model_validate(db_workflow)


@app.get("/api/workflows", tags=["workflows"])
def get_workflows(
    user: DBUser = Depends(get_current_user), session: Session = Depends(get_session)
) -> list[BaseWorkflow]:
    """Get all workflows for the current user."""
    db_workflows = session.query(DBWorkflow).filter(DBWorkflow.owner == user.id).all()
    return [BaseWorkflow.model_validate(db_workflow) for db_workflow in db_workflows]


@app.post("/api/workflows", tags=["workflows"])
def create_workflow(
    workflow_data: WorkflowCreate,
    user: DBUser = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> FullWorkflow:
    """Create a new workflow"""
    db_workflow = DBWorkflow(
        **workflow_data.model_dump(),
        owner=user.id,
        created_date=datetime.now(),
    )
    with _commit_or_rollback(session):
        session.add(db_workflow)
    session.refresh(db_workflow)

    return FullWorkflow.model_validate(db_workflow)


@app.put("/api/workflows/{workflow_id}", tags=["workflows"])
def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowUpdate,
    user: DBUser = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> FullWorkflow:
    """Update a workflow by ID"""
    # TODO - This should be updated to only allow the owner of the workflow
    #        or admins to update it once authentication is implemented.
    workflow = fetch_workflow_or_raise(workflow_id, session, user)

    for key, value in workflow_data.model_dump(by_alias=True).items():
        setattr(workflow, key, value)

    session.commit()
    session.refresh(workflow)

    return FullWorkflow.model_validate(workflow)


@app.delete("/api/workflows/{workflow_id}", tags=["workflows"])
def delete_workflow(
    workflow_id: str,
    session: Session = Depends(get_session),
    user: DBUser = Depends(get_current_user),
):
    """Delete a workflow by ID"""
    # TODO - This should be updated to only allow the owner of the workflow
    #        or admins to delete it once authentication is implemented.
    workflow = fetch_workflow_or_raise(workflow_id, session, user)
    with _commit_or_rollback(session):
        session.delete(workflow)

    return {"message": "Workflow deleted"}


@app.post("/api/workflows/{workflow_id}/run", status_code=200, tags=["workflows"])
def run_workflow(
    workflow_id: str,
    file: UploadFile,
    workflow_inputs: str = Form(),
    session: Session = Depends(get_session),
    user: DBUser = Depends(get_current_user),
) -> WorkflowRunReport:
    """Runs the workflow associated with id `workflow_id` on the passed in csv,
    and returns any results or errors from the run. The workflow_id must be
    associated with a workflow the calling user has access to.

    Args:
        workflow_id (str): The id of the workflow to run.
        file (UploadFile): The csv file to run the workflow on.
        workflow_inputs (str): The inputs to pass to the workflow. This is a
            stringified JSON object.
    """
    # deserialize the stringified JSON object into a dictionary
    workflow_param_values: dict[str, WorkflowParamValue] = json.loads(workflow_inputs)

    db_workflow = fetch_workflow_or_raise(workflow_id, session, user)

    # load the uploaded file to a Frictionless Resource
    resource = Resource(file.file.read(), format="csv")

    try:
        # check if the csv is even a valid csv file. Note that this is a stronger
        # check than what is performed in `process_workflow` because we are checking
        # for if the file adheres to the csv format, and not just the data within it
        resource.infer(stats=True)
    except frictionless.exception.FrictionlessException as e:
        raise HTTPException(
            status_code=400,
            detail="Could not parse the input file. Please check that it is a valid .csv file!",
        ) from e

    # get the CSV data from the Frictionless Resource to run our workflow
    filename = file.filename if file.filename else ""
    # run our workflow
    validation_results = process_workflow(
        file_name=filename,
        file_contents=resource,
        param_values=workflow_param_values,
        schema=db_workflow.schema,
    )

    return WorkflowRunReport(
        row_count=resource.rows if resource.rows else 0,
        filename=file.filename if file.filename else "",
        workflow_id=workflow_id,
        validation_failures=validation_results,
    )


@app.get("/api/workflows/{workflow_id}/run", tags=["workflows"], response_model=None)
def return_workflow(
    workflow_id: str,
    session: Session = Depends(get_session),
    user: DBUser = Depends(get_current_user),
) -> WorkflowSchema:
    """Returns a serialized json representation of the workflow that can be used
    to run the workflow locally. The workflow_id must be associated with a
    workflow the calling user has access to."""

    workflow = fetch_workflow_or_raise(workflow_id, session, user)
    return workflow.schema

@app.post("/api/keys", tags=["api_keys"])
def create_api_key(
    api_key_params: ApiKeyCreate,
    user: DBUser = Depends(get_current_user_no_api_key),
    session: Session = Depends(get_session),
) -> ApiKey:
    """Creates an API key for the current user."""
    api_key_provider = KEY_PROVIDER_CLASS(session, azure_kv_client)
    api_key = generate_api_key()
    return api_key_provider.create_api_key(user.id, api_key, api_key_params.expiration)

@app.get('/api/keys', tags=['api_keys'])
def get_api_keys(
    user: DBUser = Depends(get_current_user_no_api_key),
    session: Session = Depends(get_session),
) -> list[ApiKey]:
    """Gets all API keys for the current user."""
    api_key_provider = KEY_PROVIDER_CLASS(session, azure_kv_client)
    return api_key_provider.get_api_keys(user.id)

@app.delete('/api/keys', tags=['api_keys'])
def delete_api_key(
    api_key_params: ApiKeyDelete,
    user: DBUser = Depends(get_current_user_no_api_key),
    session: Session = Depends(get_session),
):
    """Deletes an API key for the current user."""
    api_key_provider = KEY_PROVIDER_CLASS(session, azure_kv_client)
    
    if api_key_provider.delete_api_key(user.id, api_key_params.api_key):
        return {"message": "API key deleted"}
    else:
        raise HTTPException(
            status_code=404, detail="API key not found."
        )