"""Workflow schemas that are used in the API."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BaseWorkflow(BaseModel):
    """The base Workflow model"""

    id: str
    title: str
    owner: str
    created_date: datetime

    model_config = ConfigDict(from_attributes=True)


class FullWorkflow(BaseWorkflow):
    """A full workflow object, including the JSON schema"""

    workflow_schema: dict | None = Field(None, alias="schema")


class WorkflowCreate(BaseModel):
    """Data model to create a new Workflow"""

    title: str


class WorkflowUpdate(BaseModel):
    """Data model to update a Workflow"""

    # TODO: What do we want to allow to update?
    pass
