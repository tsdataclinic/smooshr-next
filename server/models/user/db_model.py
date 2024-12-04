"""This file holds the User model as represented in the database."""

from datetime import datetime

from sqlalchemy import DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from server.database import Base


class DBUser(Base):
    """User table"""

    __tablename__: str = "user"
    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True)
    email: Mapped[str]
    identity_provider: Mapped[str]
    family_name: Mapped[str]
    given_name: Mapped[str]
    created_date: Mapped[DateTime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False,
    )
