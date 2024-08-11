from pydantic import BaseModel 

class WorkflowCreationData(BaseModel):
    name: str
    description: str

class WorkflowUpdateData(BaseModel):
    # TODO: What do we want to allow to update?
    pass

class Workflow(BaseModel):
    id: int
    name: str
    description: str
    owner: int
    created_date: str
    schema: dict | None = None

    class Config:
        orm_mode = True