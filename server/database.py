"""This file initializes the SQLAlchemy database engine"""
import json
import logging

from pydantic.json import pydantic_encoder
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import DeclarativeMeta, sessionmaker

SQLITE_DB_PATH = "./db.sqlite"
LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def json_serializer(*args, **kwargs) -> str:
    """JSON serializer to use in the SQLAlchemy engine"""
    return json.dumps(*args, default=pydantic_encoder, **kwargs)


# By default sqlite doesn't enforce foreign key constraints
# ths code ensures that it is enforced for all connections
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
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
