"""This file holds the Workflow model as represented in the database."""
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from server.database import Base
from server.models import DBUser


class DBWorkflow(Base):
    """Workflow table"""

    __tablename__ = "workflow"

    id: Mapped[str] = mapped_column(
        Uuid(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str]
    owner: Mapped[str] = mapped_column(
        Uuid(as_uuid=False), ForeignKey(DBUser.id), nullable=False
    )
    created_date: Mapped[DateTime] = mapped_column(
        DateTime, default=datetime.now, nullable=False
    )
    schema: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
