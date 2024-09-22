import csv
from server.models.workflow.workflow_schema import CsvData, FieldsetSchema, FieldsetSchemaValidation, FileTypeValidation, ParamReference, RowCountValidation, WorkflowParam, WorkflowSchema
from .exceptions import FieldsetSchemaNotFoundException, ParameterDefinitionNotFoundException
from .validators import ValidationFailure, validate_fieldset, validate_file_type, validate_row_count

def run_workflow(
        file_name, str,
        file_contents: str, 
        param_values: dict[str, any], 
        schema: WorkflowSchema
    ) -> list[ValidationFailure]:
    """Validate and execute a workflow based on the configured schema and user-provided parameters."""
    _validate_param_values(param_values, schema)
    csv_data = _get_csv_contents(file_contents)
    return _validate_csv(file_name, csv_data, param_values, schema)


def _validate_param_values(param_values: dict[str, any], schema: WorkflowSchema):
    """
    Validate the user-provided parameter values each correspond to 
    a parameter definition in the workflo schema.
    """
    for param_name in param_values:
        if param_name not in schema.parameters:
            raise ParameterDefinitionNotFoundException(f"Parameter definition for {param_name} not found in schema.")

def _get_csv_contents(contents: str) -> CsvData:
    """Get the CSV data from the contents of a file."""
    reader = csv.DictReader(contents)
    return CsvData(column_names=reader.fieldnames, data=list(reader))


def _get_fieldset_schema(fieldset_name: str, fieldsets: list[FieldsetSchema]) -> FieldsetSchema:
    """Get the fieldset schema from the list of fieldsets."""
    for fieldset in fieldsets:
        if fieldset.name == fieldset_name:
            return fieldset
    raise FieldsetSchemaNotFoundException(f"Fieldset schema {fieldset_name} not found in schema.")

def _validate_csv(
        file_name: str, 
        csv_data: str, 
        param_values: dict[str, any], 
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

                fieldset_schema = _get_fieldset_schema(fieldset_schema_name, schema.fieldsets)
                validations.append(validate_fieldset(csv_data.data, fieldset_schema))
            case FileTypeValidation():
                validations.append(validate_file_type(file_name, operation))
            case RowCountValidation():
                validations.append(validate_row_count(csv_data.data, operation))

    return validations