"""Entry point for the API server"""

import csv
import shutil
import tempfile

from fastapi import Depends, FastAPI, HTTPException, UploadFile
from frictionless import Resource, Checklist, validate

from server.database import SessionLocal
from server.models.user import User
from server.schemas.workflows import WorkflowRunReport, WorkflowJsonSerialized

app = FastAPI()


def get_session():
    """Get a DB session"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@app.get("/")
def read_root():
    """Stub root API function"""
    return {"Hello": "World"}


@app.post("/users", tags=["users"])
def create_user(user_data: dict, session=Depends(get_session)):
    """Create a user. This is a test function just to see if FastAPI and SQLAlchemy are working. This function should be deleted soon."""
    user = User(**user_data)
    session.add(User)
    session.commit()
    session.refresh(user)
    return user


@app.post("/api/workflows/{workflow_id}/run", status_code=200)
def run_workflow(workflow_id: int, upload_csv: UploadFile) -> WorkflowRunReport:
    """Runs the workflow associated with id `workflow_id` on the passed in csv,
    and returns any results or errors from the run. The workflow_id must be
    associated with a workflow the calling user owns."""

    resource = Resource(upload_csv.file.read(), format='csv')
    resource.infer(stats=True)

    # POC of validating the input csv just for basic CSV formatting
    # see https://framework.frictionlessdata.io/docs/checks/baseline.html#reference-checks.baseline
    # for list of baseline checks
    report = validate(resource)

    if not report.valid:
        raise HTTPException(
            status_code=400, detail={
                "errors": report.flatten(["message"])
            }
        )

    return WorkflowRunReport(
        row_count=len(resource.read_rows()),
        filename=upload_csv.filename,
        workflow_id=workflow_id
    )


@ app.get("/api/workflows/{workflow_id}/run")
def return_workflow(workflow_id: int) -> WorkflowJsonSerialized:
    """Returns a json description of the workflow with id `workflow_id`. The
    workflow_id must be associated with a workflow the calling user owns."""
    raise HTTPException(status_code=501, detail="Not implemented")
