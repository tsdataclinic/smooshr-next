"""This file defines a new PydanticType, which is a custom SQLAlchemy type
to store Pydantic models in JSON columns."""

from fastapi.encoders import jsonable_encoder
from pydantic import parse_obj_as
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.engine import Dialect
from sqlalchemy.types import JSON, TypeDecorator


class PydanticType(TypeDecorator):
    """SQLAlchemy type to store Pydantic models as JSON objects.

    It accepts a Pydantic model and converts it to a dict on save. The
    SQLAlchemy engine will then encode the dict to a string.
    On retrieval, the SQLAlchemy engine will convert the JSON string to
    a dict and then create a Pydantic model.

    Code based on the gist here:
        https://gist.github.com/imankulov/4051b7805ad737ace7d8de3d3f934d6b
    """

    impl = JSON

    def __init__(self, pydantic_type):
        super().__init__()
        self.pydantic_type = pydantic_type

    def load_dialect_impl(self, dialect: Dialect):
        """Use JSONB for PostgresSQL. Use JSON for other dbs, like SQLite"""
        return dialect.type_descriptor(
            JSONB() if dialect.name == "postgresql" else JSON()
        )

    def process_bind_param(self, value, dialect: Dialect):
        return jsonable_encoder(value) if value else None

    def process_result_value(self, value, dialect: Dialect):
        return parse_obj_as(self.pydantic_type, value) if value else None
