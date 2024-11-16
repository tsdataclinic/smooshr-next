import json
import unittest
from pathlib import Path
from typing import override

from frictionless import Resource

from server.models.workflow.workflow_schema import WorkflowSchema
from server.workflow_runner.workflow_runner import process_workflow

DIR = Path(__file__).resolve().parent
SCHEMA_PATH = DIR / "sample_schema/workflow_schema.json"
GOOD_DATA_PATH = DIR / "data/good.csv"
BAD_DATA_PATH = DIR / "data/bad.csv"


class TestWorkflowRunner(unittest.TestCase):
    @override
    def setUp(self):
        self.schema: WorkflowSchema = WorkflowSchema.model_validate(
            json.loads(SCHEMA_PATH.read_text())
        )

    def test_on_good_data(self):
        with GOOD_DATA_PATH.open() as f:
            contents = f.read()
        failures = process_workflow(
            "good.csv", contents, {"fieldset_schema": "demographic_fields"}, self.schema
        )
        self.assertEqual(failures, [])

    def test_on_bad_data(self):
        with BAD_DATA_PATH.open() as f:
            contents = f.read()
        failures = process_workflow(
            "bad.csv", contents, {"fieldset_schema": "demographic_fields"}, self.schema
        )
        # 4 rows are missing population, which is a required field and also not a valid number
        self.assertEqual(len(failures), 11)

    def test_on_resource(self):
        """Tests that we can use a Resource as the file_contents argument in process_workflow."""
        with GOOD_DATA_PATH.open() as f:
            contents = f.read()
        resource = Resource(contents.encode("utf-8"), format="csv")
        failures = process_workflow(
            "good.csv", resource, {"fieldset_schema": "demographic_fields"}, self.schema
        )
        self.assertEqual(failures, [])

        with BAD_DATA_PATH.open() as f:
            contents = f.read()
        resource = Resource(contents.encode("utf-8"), format="csv")
        failures = process_workflow(
            "bad.csv", resource, {"fieldset_schema": "demographic_fields"}, self.schema
        )
        self.assertEqual(len(failures), 11)

    def test_implicit_frictionless_validation_flag(self):
        """Tests that the implicit_frictionless_validation flag works by passing in a csv
        that would cause a frictionless error."""
        with BAD_DATA_PATH.open() as f:
            contents = f.read()
        resource = Resource(contents.encode("utf-8"), format="csv")

        failures_without_flag = process_workflow(
            "bad.csv",
            resource,
            {"fieldset_schema": "demographic_fields"},
            self.schema,
            implicit_frictionless_validation=False,
        )
        self.assertEqual(len(failures_without_flag), 10)
