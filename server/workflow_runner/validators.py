from typing import Any
from dataclasses import dataclass
import datetime 
from server.models.workflow.workflow_schema import BasicFieldDataTypeSchema, FieldSchema, FieldsetSchema, FileTypeValidation, RowCountValidation, TimestampDataTypeSchema
from server.models.workflow.api_schemas import ValidationFailure
from pydantic import BaseModel, Field


def validate_file_type(file_name: str, validation: FileTypeValidation) -> list[ValidationFailure]:
    """Validate the file type of a file."""
    if not file_name.endswith(validation.expected_file_type):
        return [
            ValidationFailure(
                message=f"File {file_name} does not have the expected file type {validation.expected_file_type}"
            )
        ]
    return []

def validate_row_count(file_contents: list[dict], validation: RowCountValidation) -> list[ValidationFailure]:
    """Validate the row count of a file."""
    min_row_count = validation.min_row_count or 0
    max_row_count = validation.max_row_count or float('inf')
    if not (min_row_count <= len(file_contents) <= max_row_count):
        return [
            ValidationFailure(
                message=f"File does not have the expected row count (min: {validation.min_row_count}, max: {validation.max_row_count})"
            )
        ]
    return []


def _check_csv_columns(csv_columns: list[str], fieldset_schema: FieldsetSchema) -> list[ValidationFailure]:
    """
    Check if the columns in the CSV file match the fieldset schema.

    If the schema specifies that order matters, the columns must be in the same order as in the schema.
    If the schema specifies that extra columns are allowed, those columns must abide by the allow_extra_columns value.
    
    """
    validations = []
    columnns_in_schema = [field.name for field in fieldset_schema.fields]

    # check that all columns in the schema are present in the file
    if not set(columnns_in_schema) <= set(csv_columns):
        validations.append(
            ValidationFailure(
                message=f"File is missing columns required by the schema: {set(columnns_in_schema) - set(csv_columns)}" 
            )
        )

    if fieldset_schema.order_matters:
        # check that csv_columns is a subsequence of columns_in_schema
        schema_iter = iter(columnns_in_schema)
        if not all (column in schema_iter for column in csv_columns):
            validations.append(
                ValidationFailure(
                    message="Columns in file are not in the same order as in the schema"
                )
            )

    if set(csv_columns) != set(columnns_in_schema):
        if fieldset_schema.allow_extra_columns == "no":
            validations.append(
                ValidationFailure(
                    message="File has extra columns not allowed by the schema"
                )
            )
        elif fieldset_schema.allow_extra_columns == "onlyAfterSchemaFields":
            if csv_columns[:len(columnns_in_schema)] != columnns_in_schema:
                validations.append(
                    ValidationFailure(
                        message="Extra columns are only allowed after the schema columns"
                    )
                )

    return validations
    
def _validate_field(row_num: int, row: dict, field: FieldSchema, params: dict[str, Any]) -> list[ValidationFailure]:
    """Validate a field in a row."""
    validations = []

    # Get the value of the field from the row. If the field is case insensitive, 
    # we need to case-insensitively match the field name to the row keys.
    if field.case_sensitive:
        value = row.get(field.name)
    else:
        case_insensitive_values = {key.lower(): value for key, value in row.items()}
        value = case_insensitive_values.get(field.name.lower())

    # If the field is required and the value is missing, add a validation failure.
    if field.required and value == None:
        validations.append(
            ValidationFailure(
                row_number=row_num,
                message=f"Missing a value for the required field '{field.name}'"
            )
        )

    # If the field does not allow empty values and the value is empty, add a validation failure.
    if not field.allow_empty_values and value == "":
        validations.append(
            ValidationFailure(
                row_number=row_num,
                message=f"Empty value for the field '{field.name}'"
            )
        )

    # Validate the data type of each field
    match field.data_type_validation:
        case BasicFieldDataTypeSchema(data_type="string"):
            pass  # no additional validation needed
        case BasicFieldDataTypeSchema(data_type="number"):
            try:
                float(value)
            except ValueError:
                validations.append(
                    ValidationFailure(
                        row_number=row_num,
                        message=f"Value '{value}' for field '{field.name}' is not a valid number"
                    )
                )
        case TimestampDataTypeSchema(data_type="timestamp", date_time_format=date_time_format):
            try:
                datetime.datetime.strptime(value, date_time_format)
            except ValueError:
                validations.append(
                    ValidationFailure(
                        row_number=row_num,
                        message=f"Value '{value}' for field '{field.name}' does not match the expected timestamp format {date_time_format}"
                    )
                )

    # If the field has a list of allowed values, check if the value is in the list.
    if field.allowed_values:
        if isinstance(field.allowed_values, list):
            allowed_values = field.allowed_values
        else:
            allowed_values = params[field.allowed_values.param_name]
        if value not in allowed_values:
            validations.append(
                ValidationFailure(
                    row_number=row_num,
                    message=f"Value '{value}' is not allowed for field '{field.name}'"
                )
            )

    return validations


def validate_fieldset(csv_columns, csv_data: list[dict], fieldset_schema: FieldsetSchema, params: dict[str, any]) -> list[ValidationFailure]:
    """Validate the fieldset schema of a file."""
    validations = []

    validations.extend(_check_csv_columns(csv_columns, fieldset_schema))
    for row_num, row in enumerate(csv_data):
        for field in fieldset_schema.fields:
            validations.extend(_validate_field(row_num + 1, row, field, params))

    return validations

