"""Entry point for the API server"""

from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    """Stub root API function"""
    return {"Hello": "World"}
