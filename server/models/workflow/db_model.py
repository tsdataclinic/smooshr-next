"""This file holds the Workflow model as represented in the database."""
import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Uuid

from server.database import Base
from server.models import DBUser


class DBWorkflow(Base):
    """Workflow table"""

    __tablename__ = "workflow"

    id = Column(
        Uuid(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title = Column(String, nullable=False)
    owner: Column[str] = Column(
        Uuid(as_uuid=False), ForeignKey(DBUser.id), nullable=False
    )
    created_date = Column(DateTime, default=datetime.now, nullable=False)
    schema = Column(JSON, default={})

    def __init__(self, title, owner, created_date=None):
        # TODO sqlite doesn't have a func.utcnow(), so figure out what to do here for local testing
        self.title = title
        self.owner = owner
        if created_date:
            self.created_date = created_date
