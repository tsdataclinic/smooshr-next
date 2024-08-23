"""This file holds the User model as represented in the database."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Uuid

from server.database import Base


class DBUser(Base):
    """User table"""

    __tablename__ = "user"
    id = Column(Uuid(as_uuid=False), primary_key=True)
    email = Column(String, nullable=False)
    identity_provider = Column(String)
    family_name = Column(String)
    given_name = Column(String)
    created_date = Column(
        DateTime,
        default=datetime.now,
        nullable=False,
    )
