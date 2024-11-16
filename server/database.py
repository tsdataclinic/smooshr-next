"""This file initializes the SQLAlchemy database engine"""

import json
import logging
import sqlite3
from typing import Any

import sqlalchemy.pool
from pydantic.json import pydantic_encoder
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import DeclarativeMeta, sessionmaker

SQLITE_DB_PATH = "./db.sqlite"
LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def json_serializer(*args: dict[str, Any], **kwargs: dict[str, Any]) -> str:
    """JSON serializer to use in the SQLAlchemy engine"""
    return json.dumps(*args, default=pydantic_encoder, **kwargs)


# By default sqlite doesn't enforce foreign key constraints
# ths code ensures that it is enforced for all connections
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(
    dbapi_connection: sqlite3.Connection,
    # pylint: disable=unused-argument
    connection_record: sqlalchemy.pool._ConnectionRecord,  # pyright: ignore[reportUnusedParameter, reportPrivateUsage, reportPrivateImportUsage]
):
    cursor = dbapi_connection.cursor()
    _ = cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def create_fk_constraint_engine(file_path: str = SQLITE_DB_PATH):
    """Create SQLite engine that supports foreign key constraints"""
    return create_engine(
        f"sqlite:///{file_path}",
        connect_args={"check_same_thread": False},
        json_serializer=json_serializer,
    )


engine = create_fk_constraint_engine(SQLITE_DB_PATH)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base: DeclarativeMeta = declarative_base()
