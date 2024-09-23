import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.api.views import (
    app, 
    get_session,
    azure_scheme
)
from server.database import Base
from server.models.user.db_model import DBUser
from server.models.workflow.db_model import DBWorkflow

class MockAzureUser:
    def __init__(self, claims):
        self.claims = claims

MOCK_USER_ID = str(uuid.uuid4())

def mock_azure_scheme():
    # Mocking the claims that would be provided by Azure AD
    return MockAzureUser(
        claims={
            "oid": MOCK_USER_ID, 
            "emails": ["waymond@everythingeverywhere.com"], 
            "idp": "azure", 
            "family_name": "Wang", 
            "given_name": "Waymond"
        }
    )

@pytest.fixture(scope="function")
def setup_db():
    engine = create_engine('sqlite:///./test.db', connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables before running tests
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    
    # Override dependencies
    app.dependency_overrides[get_session] = lambda: session
    app.dependency_overrides[azure_scheme] = mock_azure_scheme
    
    yield session
    
    session.close()
    Base.metadata.drop_all(bind=engine)

# Fixture for an empty DB
@pytest.fixture(scope="function")
def empty_db(setup_db):
    yield setup_db

# Fixture for a DB with a user
@pytest.fixture(scope="function")
def db_with_user(setup_db):
    test_user = DBUser(
        id=MOCK_USER_ID,
        email="waymond@everythingeverywhere.com",
        identity_provider="azure",
        family_name="Wang",
        given_name="Waymond",
    )
    setup_db.add(test_user)
    setup_db.commit()
    yield setup_db


client = TestClient(app)

def test_get_self_user(db_with_user):
    response = client.get("/api/users/self")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == MOCK_USER_ID
    assert data["email"] == "waymond@everythingeverywhere.com"
    assert data["family_name"] == "Wang"
    assert data["given_name"] == "Waymond"


def test_create_new_user(empty_db):
    response = client.get("/api/users/self")
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == MOCK_USER_ID
    assert data["email"] == "waymond@everythingeverywhere.com"
    assert data["family_name"] == "Wang"
    assert data["given_name"] == "Waymond"

    # Ensure the user was created in the database
    user_in_db = empty_db.query(DBUser).filter_by(id=MOCK_USER_ID).first()
    assert user_in_db is not None
    assert data["email"] == "waymond@everythingeverywhere.com"
    assert data["family_name"] == "Wang"
    assert data["given_name"] == "Waymond"


def test_create_workflow(db_with_user):
    response = client.post(
        "/api/workflows/", 
        json={
            "title": "Test Workflow"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Workflow"
    assert data["owner"] == MOCK_USER_ID
    assert data["id"] is not None

    # Ensure the workflow was created in the database
    workflow_in_db = db_with_user.query(DBWorkflow).filter_by(id=data["id"]).first()
    assert workflow_in_db is not None
    assert workflow_in_db.title == "Test Workflow"
    assert workflow_in_db.owner == MOCK_USER_ID

def test_get_workflow(db_with_user):
    
    test_workflow = DBWorkflow(
        title="Test Workflow",
        owner=MOCK_USER_ID,
    )
    db_with_user.add(test_workflow)
    db_with_user.commit()
    
    response = client.get(f"/api/workflows/{test_workflow.id}")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == str(test_workflow.id)
    assert data["title"] == "Test Workflow"
    assert data["owner"] == MOCK_USER_ID

def test_fetch_workflow_with_incorrect_user(db_with_user):
    client = TestClient(app)

    workflow = DBWorkflow(
        title="Test Workflow",
        owner=MOCK_USER_ID,
    )
 
    db_with_user.add(workflow)
    db_with_user.commit()
    
    def mock_incorrect_azure_scheme():
        # Mocking the claims that would be provided by Azure AD
        return MockAzureUser(
            claims={
                "oid": str(uuid.uuid4()), 
                "emails": ["evelyn@everythingeverywhere.com"], 
                "idp": "azure", 
                "family_name": "Wang", 
                "given_name": "Evelyn"
            }
        )

    app.dependency_overrides[azure_scheme] = mock_incorrect_azure_scheme
    
    # Attempt to fetch the workflow with the incorrect user
    response = client.get(f"/api/workflows/{workflow.id}")
    
    # Check that the response status code is 404 Not Found
    assert response.status_code == 404
    
    # Clean up the dependency override
    del app.dependency_overrides[azure_scheme]

def test_get_workflows(db_with_user):
    test_workflow = DBWorkflow(
        title="Test Workflow",
        owner=MOCK_USER_ID,
    )
    db_with_user.add(test_workflow)
    db_with_user.commit()
    
    response = client.get("/api/workflows")
    
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["id"] == str(test_workflow.id)
    assert data[0]["title"] == "Test Workflow"
    assert data[0]["owner"] == MOCK_USER_ID


def test_update_workflow(db_with_user):
    # TODO: nothing can be updated right now
    pass 

def test_delete_workflow(db_with_user):
    test_workflow = DBWorkflow(
        title="Test Workflow",
        owner=MOCK_USER_ID,
    )
    db_with_user.add(test_workflow)
    db_with_user.commit()

    response = client.delete(f"/api/workflows/{test_workflow.id}")
    assert response.status_code == 200

    # Ensure the workflow was deleted from the database
    workflow_in_db = db_with_user.query(DBWorkflow).filter_by(id=test_workflow.id).first()
    assert workflow_in_db is None


def test_delete_workflow_with_incorrect_user(db_with_user):
    client = TestClient(app)

    workflow = DBWorkflow(
        title="Test Workflow",
        owner=MOCK_USER_ID,
    )
 
    db_with_user.add(workflow)
    db_with_user.commit()
    
    def mock_incorrect_azure_scheme():
        # Mocking the claims that would be provided by Azure AD
        return MockAzureUser(
            claims={
                "oid": str(uuid.uuid4()), 
                "emails": ["evelyn@everythingeverywhere.com"], 
                "idp": "azure", 
                "family_name": "Wang", 
                "given_name": "Evelyn"
            }
        )
    
    app.dependency_overrides[azure_scheme] = mock_incorrect_azure_scheme

    # Attempt to delete the workflow with the incorrect user
    response = client.delete(f"/api/workflows/{workflow.id}")

    # Check that the response status code is 404 Not Found
    assert response.status_code == 404

    # Clean up the dependency override
    del app.dependency_overrides[azure_scheme]
