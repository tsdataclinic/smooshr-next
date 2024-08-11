"""Entry point for the API server"""

from fastapi import Depends, FastAPI, HTTPException

from server.database import SessionLocal
from server.models.user import User
from server.models.workflow import Workflow
from server.schema.workflow import WorkflowCreationData, WorkflowUpdateData

from sqlalchemy.orm import load_only

app = FastAPI()


def _commit_or_rollback(session):
    # Helper function to commit or rollback a session
    try:
        yield
        session.commit()
    except:
        session.rollback()
        raise

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


@app.get("/workflows/{workflow_id}", tags=["workflows"])
def get_workflow(workflow_id: int, session=Depends(get_session)):
    """Get a workflow by ID"""
    # TODO - This should be updated to only return workflows for
    #        the current user once authentication is implemented.
    workflow = session.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@app.get("/workflows", tags=["workflows"])
def get_workflows(session=Depends(get_session)):
    """Get all workflows for the current user."""
    # TODO - This should be updated to only return workflows for 
    #        the current user once authentication is implemented.
    workflows = session.query(Workflow).options(
        load_only('id', 'title', 'owner', 'created_date')
    ).all()
    return workflows

@app.post("/workflows", tags=["workflows"])
def create_workflow(workflow_data: WorkflowCreationData, session=Depends(get_session)):
    """Create a new workflow"""
    workflow = Workflow(**workflow_data)
    with _commit_or_rollback(session):
        session.add(workflow)
    return workflow

@app.put("/workflows/{workflow_id}", tags=["workflows"])
def update_workflow(workflow_id: int, workflow_data: WorkflowUpdateData, session=Depends(get_session)):
    """Update a workflow by ID"""
    # TODO - This should be updated to only allow the owner of the workflow 
    #        or admins to update it once authentication is implemented.
    workflow = session.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    for key, value in workflow_data.items():
        setattr(workflow, key, value)
    session.commit()
    session.refresh(workflow)
    return workflow

@app.delete("/workflows/{workflow_id}", tags=["workflows"])
def delete_workflow(workflow_id: int, session=Depends(get_session)):
    """Delete a workflow by ID"""
    # TODO - This should be updated to only allow the owner of the workflow
    #        or admins to delete it once authentication is implemented.
    workflow = session.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    with _commit_or_rollback(session):
        session.delete(workflow)
    return {"message": "Workflow deleted"}


