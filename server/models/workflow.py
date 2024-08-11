from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String 
from sqlalchemy.sql import func 

from server.database import Base
from .user import User

class Workflow(Base):
    __tablename__ = 'workflows'

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    owner = Column(Integer, ForeignKey(User.id), nullable=False)
    created_date = Column(DateTime, default=func.utcnow())
    schema = Column(JSON, default={})

    def __init__(self, title, owner):
        self.title = title
        self.owner = owner