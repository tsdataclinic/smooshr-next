import datetime
from typing import Any

from frictionless import Resource, validate

from server.models.workflow.api_schemas import ValidationFailure
from server.models.workflow.workflow_schema import (
    BasicFieldDataTypeSchema,
    FieldSchema,
    FieldsetSchema,
    FileTypeValidation,
    RowCountValidation,
    TimestampDataTypeSchema,
    WorkflowParam,
)

from .exceptions import ParameterDefinitionNotFoundException

WorkflowParamValue = int | str | list[str] | None


def get_param_schema_by_id(
    param_schemas: dict[str, WorkflowParam], param_id: str
) -> WorkflowParam:
    if param_id in param_schemas:
        return param_schemas[param_id]
    raise ParameterDefinitionNotFoundException(
        f"Parameter definition for id '{param_id}' not found in schema."
    )


def parse_frictionless(
    file_contents: str | Resource,
) -> tuple[Resource, list[ValidationFailure]]:
    """Validate the file using the Frictionless baseline checks and parse the file contents into a
    Frictionless Resource if not already."""

    if isinstance(file_contents, str):
        # Resource expects bytes when the first argument is the actual csv contents
        # A string is interpreted as a filename
        resource = Resource(file_contents.encode("utf-8"), format="csv")
    else:
        resource = file_contents

    report = validate(resource, skip_errors=["missing-cell"])
    if not report.valid:
        return resource, [
            ValidationFailure(row_number=error[0], message=error[1])
            for error in report.flatten(["rowNumber", "message"])
        ]
    return resource, []


def validate_file_type(
    file_name: str, validation: FileTypeValidation
) -> list[ValidationFailure]:
    """Validate the file type of a file."""
    if not file_name.endswith(validation.expected_file_type):
        return [
            ValidationFailure(
                message=(
                    f"File {file_name} does not have the expected file type "
                    f"{validation.expected_file_type}"
                )
            )
        ]
    return []


def validate_row_count(
    file_contents: list[dict[str, Any]], validation: RowCountValidation
) -> list[ValidationFailure]:
    """Validate the row count of a file."""
    min_row_count = validation.min_row_count or 0
    max_row_count = validation.max_row_count or float("inf")
    if not min_row_count <= len(file_contents) <= max_row_count:
        return [
            ValidationFailure(
                message=(
                    f"File does not have the expected row count (min: {validation.min_row_count}, "
                    f"max: {validation.max_row_count})"
                )
            )
        ]
    return []


def check_csv_columns(
    csv_columns: list[str], fieldset_schema: FieldsetSchema
) -> list[ValidationFailure]:
    """
    Check if the columns in the CSV file match the fieldset schema.

    If the schema specifies that order matters, the columns must be in the same order as in the
    schema. If the schema specifies that extra columns are allowed, those columns must abide
    by the allow_extra_columns value.
    """
    validations: list[ValidationFailure] = []
    required_columns_in_schema = [
        field.name for field in fieldset_schema.fields if field.required
    ]
    columnns_in_schema = [field.name for field in fieldset_schema.fields]

    # check that all required columns in the schema are present in the file
    if not set(required_columns_in_schema) <= set(csv_columns):
        validations.append(
            ValidationFailure(
                message=(
                    f"File is missing columns required by the schema: "
                    f"{set(required_columns_in_schema) - set(csv_columns)}"
                )
            )
        )

    if fieldset_schema.order_matters:
        # check that csv_columns is a subsequence of columns_in_schema
        schema_iter = iter(columnns_in_schema)
        if not all(column in schema_iter for column in csv_columns):
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
            if csv_columns[: len(columnns_in_schema)] != columnns_in_schema:
                validations.append(
                    ValidationFailure(
                        message="Extra columns are only allowed after the schema columns"
                    )
                )

    return validations


def validate_field(
    row_num: int,
    row: dict[str, Any],
    field: FieldSchema,
    param_schemas: dict[str, WorkflowParam],
    param_values: dict[str, WorkflowParamValue],
) -> list[ValidationFailure]:
    """Validate a field in a row."""
    validations: list[ValidationFailure] = []

    # Get the value of the field from the row. If the field is case insensitive,
    # we need to case-insensitively match the field name to the row keys.
    if field.case_sensitive:
        value = row.get(field.name)
    else:
        case_insensitive_values = {key.lower(): value for key, value in row.items()}
        value = case_insensitive_values.get(field.name.lower())

    # If the field does not allow empty values and the value is empty, add a validation failure.
    if not field.allow_empty_values and (value == "" or value is None):
        validations.append(
            ValidationFailure(
                row_number=row_num,
                message=(f"Empty value for the field '{field.name}'"),
            )
        )

    # Validate the data type of each field
    match field.data_type_validation:
        case BasicFieldDataTypeSchema(data_type="any"):
            pass  # no additional validation needed
        case BasicFieldDataTypeSchema(data_type="string"):
            pass  # no additional validation needed
        case BasicFieldDataTypeSchema(data_type="number"):
            try:
                _ = float(value)  # pyright: ignore[reportArgumentType]
            # TypeError is raised if value is None
            except (TypeError, ValueError) as e:
                # if value is None, and we haven't already added a validation failure for a
                # missing value, create a validation failure
                if (isinstance(e, TypeError) and not field.required) or isinstance(
                    e, ValueError
                ):
                    validations.append(
                        ValidationFailure(
                            row_number=row_num,
                            message=(
                                f"Value '{value}' for field '{field.name}' "
                                f"is not a valid number"
                            ),
                        )
                    )
        case TimestampDataTypeSchema(
            data_type="timestamp", date_time_format=date_time_format
        ):
            try:
                _ = datetime.datetime.strptime(str(value), date_time_format)
            except ValueError:
                validations.append(
                    ValidationFailure(
                        row_number=row_num,
                        message=(
                            f"Value '{value}' for field '{field.name}' does not match "
                            f"the expected timestamp format {date_time_format}"
                        ),
                    )
                )
        case _:
            pass

    # If the field has a list of allowed values, check if the value is in the list.
    if field.allowed_values:
        if isinstance(field.allowed_values, list):
            allowed_values = field.allowed_values
        else:
            param = get_param_schema_by_id(param_schemas, field.allowed_values.param_id)
            allowed_values: WorkflowParamValue = param_values[param.name]
            if not isinstance(allowed_values, list):
                validations.append(
                    ValidationFailure(
                        row_number=row_num,
                        message=(
                            f"Param value referenced with {param.name} is not a list."
                        ),
                    )
                )
                return validations

        if value not in allowed_values:
            validations.append(
                ValidationFailure(
                    row_number=row_num,
                    message=(
                        f"Value '{value}' is not allowed for field '{field.name}'"
                    ),
                )
            )

    return validations


def validate_fieldset(
    csv_columns: list[str],
    csv_data: list[dict[str, Any]],
    fieldset_schema: FieldsetSchema,
    param_schemas: dict[str, WorkflowParam],
    param_values: dict[str, WorkflowParamValue],
) -> list[ValidationFailure]:
    """Validate the fieldset schema of a file."""
    validations: list[ValidationFailure] = []

    validations.extend(check_csv_columns(csv_columns, fieldset_schema))
    for row_num, row in enumerate(csv_data):
        for field in fieldset_schema.fields:
            validations.extend(
                validate_field(
                    row_num=row_num + 1,
                    row=row,
                    field=field,
                    param_schemas=param_schemas,
                    param_values=param_values,
                )
            )

    return validations
