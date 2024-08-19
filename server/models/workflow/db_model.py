"""This file holds the Workflow model as represented in the database."""
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String

from server.database import Base
from server.models import DBUser


class DBWorkflow(Base):
    """Workflow table"""

    __tablename__ = "workflow"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    owner = Column(Integer, ForeignKey(DBUser.id), nullable=False)
    created_date = Column(DateTime, default=datetime.now, nullable=False)
    schema = Column(JSON, default={})

    def __init__(self, title, owner, created_date=None):
        # TODO sqlite doesn't have a func.utcnow(), so figure out what to do here for local testing
        self.title = title
        self.owner = owner
        if created_date:
            self.created_date = created_date
