"""Workflow schemas that are used in the API."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WorkflowCreate(BaseModel):
    """Data model to create a new Workflow"""

    title: str


class WorkflowUpdate(BaseModel):
    """Data model to update a Workflow"""

    # TODO: What do we want to allow to update?
    pass


class Workflow(BaseModel):
    """The base Workflow schema to use in the API."""

    id: int
    title: str
    owner: int
    created_date: datetime
    workflow_schema: dict | None = Field(None, alias="schema")

    model_config = ConfigDict(from_attributes=True)
