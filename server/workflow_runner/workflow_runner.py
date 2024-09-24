from typing import Any
import csv
import io

from server.models.workflow.workflow_schema import CsvData, FieldsetSchema, FieldsetSchemaValidation, FileTypeValidation, ParamReference, RowCountValidation, WorkflowParam, WorkflowSchema
from .exceptions import FieldsetSchemaNotFoundException, ParameterDefinitionNotFoundException
from .validators import ValidationFailure, validate_fieldset, validate_file_type, validate_row_count

def run_workflow(
        file_name: str,
        file_contents: str,
        param_values: dict[str, Any],
        schema: WorkflowSchema
    ) -> list[ValidationFailure]:
    """Validate and execute a workflow based on the configured schema and user-provided parameters."""
    _validate_param_values(param_values, schema)
    csv_data = _get_csv_contents(file_contents)
    return _validate_csv(file_name, csv_data, param_values, schema)


def _validate_param_values(param_values: dict[str, Any], schema: WorkflowSchema):
    """
    Validate the user-provided parameter values each correspond to
    a parameter definition in the workflo schema.
    """
    for param_name in param_values:
        if not any(param.name == param_name for param in schema.params):
            raise ParameterDefinitionNotFoundException(f"Parameter definition for {param_name} not found in schema.")

def _get_csv_contents(contents: str) -> CsvData:
    """Get the CSV data from the contents of a file."""
    reader = csv.DictReader(io.StringIO(contents))
    if reader.fieldnames:
        fieldnames = list(reader.fieldnames)
    else:
        fieldnames = []
    return CsvData(column_names=fieldnames, data=list(reader))


def _get_fieldset_schema(fieldset_name: str, fieldsets: list[FieldsetSchema]) -> FieldsetSchema:
    """Get the fieldset schema from the list of fieldsets."""
    for fieldset in fieldsets:
        if fieldset.name == fieldset_name:
            return fieldset
    raise FieldsetSchemaNotFoundException(f"Fieldset schema {fieldset_name} not found in schema.")

def _validate_csv(
        file_name: str,
        csv_data: CsvData,
        param_values: dict[str, Any],
        schema: WorkflowSchema
    ) -> list[ValidationFailure]:
    """Validate the CSV data based on the configured schema and user-provided parameters."""
    validations = []
    for operation in schema.operations:
        match operation:
            case FieldsetSchemaValidation():
                match operation.fieldset_schema:
                    case str():
                        fieldset_schema_name = operation.fieldset_schema
                    case ParamReference():
                        param_name = operation.fieldset_schema.param_name
                        fieldset_schema_name = param_values[param_name]

                fieldset_schema = _get_fieldset_schema(fieldset_schema_name, schema.fieldset_schemas)
                validations.extend(validate_fieldset(csv_data.column_names, csv_data.data, fieldset_schema, param_values))
            case FileTypeValidation():
                validations.extend(validate_file_type(file_name, operation))
            case RowCountValidation():
                validations.extend(validate_row_count(csv_data.data, operation))

    return validations
