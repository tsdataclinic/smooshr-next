"""User schemas that are used in the API."""
from datetime import date

from pydantic import BaseModel, ConfigDict


class User(BaseModel):
    """The base User schema to use in the API."""

    id: str
    email: str
    identity_provider: str
    family_name: str
    given_name: str
    created_date: date

    model_config = ConfigDict(from_attributes=True)
