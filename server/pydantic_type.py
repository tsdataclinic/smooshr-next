"""This file defines a new PydanticType, which is a custom SQLAlchemy type
to store Pydantic models in JSON columns."""

from typing import Any, override

from fastapi.encoders import jsonable_encoder
from pydantic import TypeAdapter
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.engine import Dialect
from sqlalchemy.types import JSON, TypeDecorator


# pylint: disable=abstract-method
class PydanticType(TypeDecorator):  # pyright: ignore[reportMissingTypeArgument]
    """SQLAlchemy type to store Pydantic models as JSON objects.

    It accepts a Pydantic model and converts it to a dict on save. The
    SQLAlchemy engine will then encode the dict to a string.
    On retrieval, the SQLAlchemy engine will convert the JSON string to
    a dict and then create a Pydantic model.

    Code based on the gist here:
        https://gist.github.com/imankulov/4051b7805ad737ace7d8de3d3f934d6b
    """

    impl = JSON  # pyright: ignore[reportUnannotatedClassAttribute]

    def __init__(self, pydantic_type: Any):
        super().__init__()
        self.pydantic_type: Any = pydantic_type

    @override
    def load_dialect_impl(self, dialect: Dialect):
        """Use JSONB for PostgresSQL. Use JSON for other dbs, like SQLite"""
        return dialect.type_descriptor(
            JSONB() if dialect.name == "postgresql" else JSON()
        )

    @override
    def process_bind_param(self, value: Any, dialect: Dialect):
        return jsonable_encoder(value) if value else None

    @override
    def process_result_value(self, value: Any, dialect: Dialect):
        return TypeAdapter(self.pydantic_type).validate_python(value) if value else None
