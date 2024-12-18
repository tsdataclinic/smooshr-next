"""Api Key schemas that are used in the API."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApiKeyCreate(BaseModel):
    """Schema for creating an API key."""

    expiration: datetime

class ApiKeyDelete(BaseModel):
    """Schema for deleting an API key."""

    api_key: str

class ApiKey(BaseModel):
    """Schema for an API key."""

    api_key: str
    expiration: datetime

    model_config = ConfigDict(from_attributes=True)
