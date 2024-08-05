from pydantic import BaseModel


class WorkflowRunReport(BaseModel):
    """Run report schema for a server-side run of a workflow."""
    row_count: int
    filename: str
    workflow_id: int


class WorkflowJsonSerialized(BaseModel):
    """Serialized workflow JSON schema. Can be used directly for running client-side."""
    pass
