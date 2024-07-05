"""Entry point for the API server"""

from fastapi import Depends, FastAPI

from server.database import SessionLocal
from server.models.user import User

app = FastAPI()


def get_session():
    """Get a DB session"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@app.get("/")
def read_root():
    """Stub root API function"""
    return {"Hello": "World"}


@app.post("/users", tags=["users"])
def create_user(user_data: dict, session=Depends(get_session)):
    """Create a user. This is a test function just to see if FastAPI and SQLAlchemy are working. This function should be deleted soon."""
    user = User(**user_data)
    session.add(User)
    session.commit()
    session.refresh(user)
    return user
