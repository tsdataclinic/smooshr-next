from typing import Any
import csv
import io

from frictionless import Resource

from server.models.workflow.workflow_schema import CsvData, FieldsetSchema, FieldsetSchemaValidation, FileTypeValidation, ParamReference, RowCountValidation, WorkflowParam, WorkflowSchema
from server.models.workflow.api_schemas import ValidationFailure
from .exceptions import FieldsetSchemaNotFoundException, ParameterDefinitionNotFoundException
from .validators import validate_fieldset, validate_file_type, validate_row_count, parse_frictionless

def process_workflow(
        file_name: str,
        file_contents: Resource | str,
        param_values: dict[str, Any],
        schema: WorkflowSchema,
        implicit_frictionless_validation: bool = True
    ) -> list[ValidationFailure]:
    """Validate and execute a workflow based on the configured schema and user-provided parameters."""

    workflow_validation_failures: list[ValidationFailure] = []

    # generally, workflows will have an implicit frictionless baseline validation
    # but this can be turned off if we want the schema to be a completely faithful
    # representation of the total validations that will be performed
    file_resource, frictionless_baseline_validation_failures = parse_frictionless(file_contents)
    if implicit_frictionless_validation:
        workflow_validation_failures.extend(frictionless_baseline_validation_failures)

    _validate_param_values(param_values, schema)

    csv_data = _get_csv_contents_from_resource(file_resource) 
    workflow_validation_failures.extend(_validate_csv(file_name, csv_data, param_values, schema))

    return workflow_validation_failures


def _validate_param_values(param_values: dict[str, Any], schema: WorkflowSchema):
    """
    Validate the user-provided parameter values each correspond to
    a parameter definition in the workflo schema.
    """
    for param_name in param_values:
        if not any(param.name == param_name for param in schema.params):
            raise ParameterDefinitionNotFoundException(f"Parameter definition for {param_name} not found in schema.")

def _get_csv_contents_from_resource(file_resource: Resource) -> CsvData:
    """Get the CSV data from the contents of a file."""
    all_rows: list[dict[str, Any]] = [row.to_dict() for row in file_resource.read_rows()] # type: ignore
    fieldnames = [field.name for field in file_resource.schema.fields]

    return CsvData(
        column_names=fieldnames,
        data=all_rows,
    )


def _get_fieldset_schema(fieldset_id: str, fieldsets: list[FieldsetSchema]) -> FieldsetSchema:
    """Get the fieldset schema from the list of fieldsets."""
    for fieldset in fieldsets:
        if fieldset.id == fieldset_id:
            return fieldset
    raise FieldsetSchemaNotFoundException(f"Fieldset schema {fieldset_id} not found in schema.")

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
