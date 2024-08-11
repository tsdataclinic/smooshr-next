from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from server.database import Base


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False)
    identity_provider = Column(String)
    family_name = Column(String)
    given_name = Column(String)
    created_date = Column(DateTime, default=func.utcnow(), nullable=False)

    
