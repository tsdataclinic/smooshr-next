from pydantic import BaseModel, Field
from datetime import datetime


class WorkflowCreationData(BaseModel):
    title: str


class WorkflowUpdateData(BaseModel):
    # TODO: What do we want to allow to update?
    pass


class WorkflowData(BaseModel):
    id: int
    title: str
    owner: int
    created_date: datetime
    workflow_schema: dict | None = Field(None, alias='schema')

    class Config:
        from_attributes = True


class WorkflowRunReport(BaseModel):
    """Run report schema for a server-side run of a workflow."""
    row_count: int
    filename: str
    workflow_id: int