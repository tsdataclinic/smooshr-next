import unittest
from unittest.mock import MagicMock

from server.models.workflow.workflow_schema import (
    BasicFieldDataTypeSchema,
    FieldSchema,
    FileTypeValidation,
    ParamReference,
    RowCountValidation,
    FieldsetSchema,
    TimestampDataTypeSchema,
)
from server.workflow_runner.validators import (
    ValidationFailure,
    _check_csv_columns,
    _validate_field,
    validate_file_type,
    validate_row_count,
    validate_fieldset,
)


class TestValidateFile(unittest.TestCase):
    def test_validate_file_type(self):
        validation = FileTypeValidation(
            type="fileTypeValidation",
            id="123",
            expectedFileType="csv",
            title="File type validation",
            description=None,
        )
        self.assertEqual(validate_file_type("file.csv", validation), [])
        self.assertEqual(
            validate_file_type("file.txt", validation),
            [
                ValidationFailure(
                    message="File file.txt does not have the expected file type csv",
                    row_number=None,
                )
            ],
        )


class TestValidateRowCount(unittest.TestCase):

    def test_validate_row_count(self):
        validation = RowCountValidation(
            type="rowCountValidation",
            id="123",
            minRowCount=2,
            maxRowCount=4,
            title="Row count validation",
            description=None,
        )
        self.assertEqual(validate_row_count([{}] * 2, validation), [])
        self.assertEqual(validate_row_count([{}] * 3, validation), [])
        self.assertEqual(validate_row_count([{}] * 4, validation), [])
        self.assertEqual(
            validate_row_count([{}], validation),
            [
                ValidationFailure(
                    message="File does not have the expected row count (min: 2, max: 4)",
                    row_number=None,
                )
            ],
        )
        self.assertEqual(
            validate_row_count([{}] * 5, validation),
            [
                ValidationFailure(
                    message="File does not have the expected row count (min: 2, max: 4)",
                    row_number=None,
                )
            ],
        )

    def test_validate_row_count_without_min_rows(self):
        validation = RowCountValidation(
            type="rowCountValidation",
            id="123",
            minRowCount=None,
            maxRowCount=4,
            title="Row count validation",
            description=None,
        )
        self.assertEqual(validate_row_count([], validation), [])
        self.assertEqual(validate_row_count([{}], validation), [])
        self.assertEqual(validate_row_count([{}] * 3, validation), [])
        self.assertEqual(validate_row_count([{}] * 4, validation), [])
        self.assertEqual(
            validate_row_count([{}] * 5, validation),
            [
                ValidationFailure(
                    message="File does not have the expected row count (min: None, max: 4)",
                    row_number=None,
                )
            ],
        )

    def test_validate_row_count_without_max_rows(self):
        validation = RowCountValidation(
            type="rowCountValidation",
            id="123",
            minRowCount=2,
            maxRowCount=None,
            title="Row count validation",
            description=None,
        )
        self.assertEqual(
            validate_row_count([{}], validation),
            [
                ValidationFailure(
                    message="File does not have the expected row count (min: 2, max: None)",
                    row_number=None,
                )
            ],
        )
        self.assertEqual(validate_row_count([{}] * 3, validation), [])
        self.assertEqual(validate_row_count([{}] * 4, validation), [])
        self.assertEqual(validate_row_count([{}] * 42, validation), [])


def mock_field_schema(
    name: str,
    case_sensitive: bool = True,
    required: bool = True,
    data_type_validation={"dataType": "any"},
    allow_empty_values: bool = False,
    allowed_values=None,
):
    mock = MagicMock(
        FieldSchema,
        name=name,
        case_sensitive=case_sensitive,
        required=required,
        data_type_validation=data_type_validation,
        allow_empty_values=allow_empty_values,
        allowed_values=allowed_values,
    )
    mock.configure_mock(name=name)
    return mock


class TestCheckCsvColumns(unittest.TestCase):
    def test_check_csv_columns(self):
        fieldset_schema = FieldsetSchema(
            id="123",
            name="schema",
            fields=[
                mock_field_schema("name"),
                mock_field_schema("age"),
                mock_field_schema("city"),
            ],
            orderMatters=True,
            allowExtraColumns="anywhere",
        )

        self.assertEqual(
            _check_csv_columns(["name", "age", "city"], fieldset_schema), []
        )
        self.assertEqual(
            _check_csv_columns(["name", "city"], fieldset_schema),
            [
                ValidationFailure(
                    message="File is missing columns required by the schema: {'age'}",
                    row_number=None,
                )
            ],
        )
        self.assertEqual(
            _check_csv_columns(["name", "city", "age"], fieldset_schema),
            [
                ValidationFailure(
                    message="Columns in file are not in the same order as in the schema",
                    row_number=None,
                )
            ],
        )

    def test_check_csv_columns_extra_columns(self):
        fieldset_schema = FieldsetSchema(
            id="123",
            name="schema",
            fields=[
                mock_field_schema("name"),
                mock_field_schema("age"),
                mock_field_schema("city"),
            ],
            orderMatters=False,
            allowExtraColumns="no",
        )

        self.assertEqual(
            _check_csv_columns(["name", "age", "city"], fieldset_schema), []
        )
        self.assertEqual(
            _check_csv_columns(["name", "age", "city", "extra"], fieldset_schema),
            [
                ValidationFailure(
                    message="File has extra columns not allowed by the schema",
                    row_number=None,
                )
            ],
        )

    def test_check_csv_columns_extra_after(self):
        fieldset_schema = FieldsetSchema(
            id="123",
            name="schema",
            fields=[
                mock_field_schema("name"),
                mock_field_schema("age"),
                mock_field_schema("city"),
            ],
            orderMatters=False,
            allowExtraColumns="onlyAfterSchemaFields",
        )

        self.assertEqual(
            _check_csv_columns(["name", "age", "city"], fieldset_schema), []
        )
        self.assertEqual(
            _check_csv_columns(["name", "age", "city", "extra"], fieldset_schema), []
        )
        self.assertEqual(
            _check_csv_columns(["name", "age", "extra", "city"], fieldset_schema),
            [
                ValidationFailure(
                    message="Extra columns are only allowed after the schema columns",
                    row_number=None,
                )
            ],
        )


class TestValidateField(unittest.TestCase):
    def test_validate_field_case_insensitive(self):
        field = mock_field_schema(
            "name",
            required=True,
            case_sensitive=False,
            allow_empty_values=False,
            allowed_values=None,
        )
        self.assertEqual(_validate_field(1, {"Name": "John"}, field, {}), [])
        self.assertEqual(
            _validate_field(1, {"Name": ""}, field, {}),
            [
                ValidationFailure(
                    row_number=1, message="Empty value for the field 'name'"
                )
            ],
        )

    def test_validate_field_allow_empty(self):
        # allow empty values
        field = mock_field_schema(
            "name",
            allow_empty_values=True,
        )
        self.assertEqual(_validate_field(1, {"name": "John"}, field, {}), [])
        self.assertEqual(_validate_field(1, {"name": ""}, field, {}), [])
        self.assertEqual(_validate_field(1, {"name": None}, field, {}), [])

        # now disallow empty values
        field = mock_field_schema(
            "name",
            allow_empty_values=False,
        )
        self.assertEqual(_validate_field(1, {"name": "John"}, field, {}), [])
        self.assertEqual(
            _validate_field(1, {"name": ""}, field, {}),
            [
                ValidationFailure(
                    row_number=1, message="Empty value for the field 'name'"
                )
            ],
        )
        self.assertEqual(
            _validate_field(1, {"name": None}, field, {}),
            [
                ValidationFailure(
                    row_number=1, message="Empty value for the field 'name'"
                )
            ],
        )

    def test_validate_field_allowed_values(self):
        field = mock_field_schema(
            "name",
            required=True,
            case_sensitive=True,
            allow_empty_values=False,
            allowed_values=["John", "Jane"],
        )
        self.assertEqual(_validate_field(1, {"name": "John"}, field, {}), [])
        self.assertEqual(_validate_field(1, {"name": "Jane"}, field, {}), [])
        self.assertEqual(
            _validate_field(1, {"name": "Bob"}, field, {}),
            [
                ValidationFailure(
                    row_number=1, message="Value 'Bob' is not allowed for field 'name'"
                )
            ],
        )

    def test_validate_field_allowed_values_from_param(self):
        field = mock_field_schema(
            "name",
            required=True,
            case_sensitive=True,
            allow_empty_values=False,
            allowed_values=ParamReference(paramName="allowed_names"),
        )
        params = {"allowed_names": ["John", "Jane"]}
        self.assertEqual(_validate_field(1, {"name": "John"}, field, params), [])
        self.assertEqual(_validate_field(1, {"name": "Jane"}, field, params), [])
        self.assertEqual(
            _validate_field(1, {"name": "Bob"}, field, params),
            [
                ValidationFailure(
                    row_number=1, message="Value 'Bob' is not allowed for field 'name'"
                )
            ],
        )

    def test_validate_field_number_type(self):
        field = mock_field_schema(
            "age",
            required=True,
            case_sensitive=True,
            allow_empty_values=False,
            allowed_values=None,
            data_type_validation=BasicFieldDataTypeSchema(dataType="number"),
        )
        self.assertEqual(_validate_field(1, {"age": "42"}, field, {}), [])
        self.assertEqual(_validate_field(1, {"age": "42.0"}, field, {}), [])
        self.assertEqual(
            _validate_field(1, {"age": "42.0.0"}, field, {}),
            [
                ValidationFailure(
                    row_number=1,
                    message="Value '42.0.0' for field 'age' is not a valid number",
                )
            ],
        )

    def test_validate_field_timestamp_type(self):
        field = mock_field_schema(
            "date",
            required=True,
            case_sensitive=True,
            allow_empty_values=False,
            allowed_values=None,
            data_type_validation=TimestampDataTypeSchema(
                dataType="timestamp", dateTimeFormat="%Y-%m-%d"
            ),
        )
        self.assertEqual(_validate_field(1, {"date": "2021-01-01"}, field, {}), [])
        self.assertEqual(
            _validate_field(1, {"date": "2021-01-01 00:00:00.000"}, field, {}),
            [
                ValidationFailure(
                    row_number=1,
                    message="Value '2021-01-01 00:00:00.000' for field 'date' does not match the expected timestamp format %Y-%m-%d",
                )
            ],
        )


class TestValidateFieldSet(unittest.TestCase):
    def test_validate_fieldset_with_bad_data(self):
        fieldset_schema = FieldsetSchema(
            id="123",
            name="schema",
            fields=[
                mock_field_schema(
                    "name",
                    required=True,
                    case_sensitive=True,
                    allow_empty_values=False,
                    allowed_values=None,
                ),
                mock_field_schema(
                    "age",
                    required=True,
                    case_sensitive=True,
                    allow_empty_values=False,
                    allowed_values=None,
                ),
                mock_field_schema(
                    "city",
                    required=True,
                    case_sensitive=True,
                    allow_empty_values=False,
                    allowed_values=None,
                ),
            ],
            orderMatters=True,
            allowExtraColumns="anywhere",
        )

        self.assertEqual(
            validate_fieldset(
                ["name", "age", "city"],
                [{"name": "John", "age": "42", "city": "New York"}],
                fieldset_schema,
                {},
            ),
            [],
        )
        self.assertEqual(
            validate_fieldset(
                ["name", "age", "city"],
                [{"name": "John", "age": "42", "city": ""}],
                fieldset_schema,
                {},
            ),
            [
                ValidationFailure(
                    message="Empty value for the field 'city'", row_number=1
                )
            ],
        )
        self.assertEqual(
            validate_fieldset(
                ["name", "age", "city"],
                [{"name": "John", "age": None, "city": "New York"}],
                fieldset_schema,
                {},
            ),
            [
                ValidationFailure(
                    message="Empty value for the field 'age'", row_number=1
                )
            ],
        )
