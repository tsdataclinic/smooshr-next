from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String 
from sqlalchemy.sql import func 

from server.database import Base
from .user import User

class Workflow(Base):
    __tablename__ = 'workflows'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    owner = Column(Integer, ForeignKey(User.id), nullable=False)
    created_date = Column(DateTime, default=func.utcnow())
    schema = Column(JSON, default={})

    def __init__(self, title, owner, created_date=None):
        # TODO sqlite doesn't have a func.utcnow(), so figure out what to do here for local testing
        self.title = title
        self.owner = owner
        if created_date:
            self.created_date = created_date