"""Workflow schemas that are used in the API."""

from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, Field

from .workflow_schema import WorkflowSchema


class BaseWorkflow(BaseModel):
    """The base Workflow model"""

    id: str
    title: str
    owner: str
    created_date: datetime

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)


class FullWorkflow(BaseWorkflow):
    """A full workflow object, including the JSON schema"""

    workflow_schema: WorkflowSchema = Field(alias="schema")


class WorkflowCreate(BaseModel):
    """Data model to create a new Workflow"""

    title: str


class WorkflowUpdate(FullWorkflow):
    """Data model to update a Workflow"""


class ValidationFailure(BaseModel):
    """
    A validation failure with a message.

    Arguments:
    - message (str) -- The error message
    - row_number (int | None) -- The row number of the error. Or None if there
        is no row number (e.g. if this is a file type error).
    """

    message: str
    row_number: int | None = Field(default=None, serialization_alias="rowNumber")


class WorkflowRunReport(BaseModel):
    """Report for a server-side run of a workflow."""

    row_count: int = Field(serialization_alias="rowCount")
    filename: str
    workflow_id: str = Field(serialization_alias="workflowId")
    validation_failures: list[ValidationFailure] = Field(
        serialization_alias="validationFailures"
    )
