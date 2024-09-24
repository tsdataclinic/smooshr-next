"""Workflow schemas that are used in the API."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field
from .workflow_schema import WorkflowSchema


class BaseWorkflow(BaseModel):
    """The base Workflow model"""

    id: str
    title: str
    owner: str
    created_date: datetime

    model_config = ConfigDict(from_attributes=True)


class FullWorkflow(BaseWorkflow):
    """A full workflow object, including the JSON schema"""

    schema: WorkflowSchema = Field(default_factory=dict)


class WorkflowCreate(BaseModel):
    """Data model to create a new Workflow"""

    title: str


class WorkflowRunReport(BaseModel):
    """Run report schema for a server-side run of a workflow."""

    row_count: int
    filename: str
    workflow_id: str
