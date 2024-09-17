"""The models to represent a WorkflowSchema"""
from typing import Literal

from pydantic import BaseModel


class ParamReference(BaseModel):
    """A simple object that references a param name"""

    param_name: str


class FieldsetSchemaValidation(BaseModel):
    """A validation operation to validate the dataset columns and their values"""

    type: Literal["fieldsetSchemaValidation"]
    id: str  # uuid
    fieldset_schema: str | ParamReference


class FileTypeValidation(BaseModel):
    """A validation operation to check file type"""

    type: Literal["fileTypeValidation"]
    id: str  # uuid
    expected_file_type: str


class RowCountValidation(BaseModel):
    """A validation operation to check row counts"""

    type: Literal["rowCountValidation"]
    id: str  # uuid
    min_row_count: int | None
    max_row_count: int | None


WorkflowOperation = FieldsetSchemaValidation | FileTypeValidation | RowCountValidation


class TimestampDataTypeSchema(BaseModel):
    """Represents a Timestamp data type. It requires a `date_time_format` to
    represent how a timestamp should be represented."""

    data_type: Literal["timestamp"]
    date_time_format: str


class BasicFieldDataTypeSchema(BaseModel):
    """Represents a data type with no additional configuration other
    than its literal type"""

    data_type: Literal["any", "string", "number"]


class FieldSchema(BaseModel):
    """The validation schema for a dataset column"""

    id: str
    name: str
    case_sensitive: bool
    required: bool
    data_type_validation: BasicFieldDataTypeSchema | TimestampDataTypeSchema
    allow_empty_values: bool
    allowed_values: list[str] | ParamReference | None


class FieldsetSchema(BaseModel):
    """The validation schema for a dataset's fieldset. Or, in other words,
    the column schemas. E.g. the column names, order, data types, allowable values.
    """

    id: str  # uuid
    name: str  # name of this fieldset, e.g. "demographic data columns"
    order_matters: bool  # enforces column order
    fields: list[FieldSchema]
    allow_extra_columns: Literal["no", "anywhere", "onlyAfterSchemaFields"]


class WorkflowParam(BaseModel):
    """The schema representing an argument (an input) for the Workflow that
    is passed in when a Workflow is kicked off.
    """

    name: str
    display_name: str
    description: str
    required: bool
    type: Literal["string", "number", "string list"]


class WorkflowSchema(BaseModel):
    """A schema represents the sequence of operations a Workflow should apply."""

    # The display title of this Workflow
    title: str

    # the list of operations that this Workflow executes
    operations: list[WorkflowOperation]

    # the list of fieldsetSchemas that this Workflow can support
    fieldset_schemas: list[FieldsetSchema]

    # the list of params that are input at time a Workflow is executed
    params: list[WorkflowParam]

    # The schema version
    version: Literal["0.1"]
