import json
import unittest

from pathlib import Path

from server.workflow_runner.workflow_runner import process_workflow
from server.models.workflow.workflow_schema import WorkflowSchema

DIR = Path(__file__).resolve().parent
SCHEMA_PATH = DIR / "sample_schema/workflow_schema.json"
GOOD_DATA_PATH = DIR / "data/good.csv"
BAD_DATA_PATH = DIR / "data/bad.csv"

class TestWorkflowRunner(unittest.TestCase):

    def setUp(self):
        self.schema = WorkflowSchema.model_validate(json.loads(SCHEMA_PATH.read_text()))

    def test_on_good_data(self):
        with GOOD_DATA_PATH.open() as f:
            contents = f.read()
        failures = process_workflow("good.csv", contents, {"fieldset_schema": "demographic_fields"}, self.schema)
        self.assertEqual(failures, [])

    def test_on_bad_data(self):
        with BAD_DATA_PATH.open() as f:
            contents = f.read()
        failures = process_workflow("bad.csv", contents, {"fieldset_schema": "demographic_fields"}, self.schema)
        # 4 rows are missing population, which is a required field and also not a valid number
        self.assertEqual(len(failures), 8)
