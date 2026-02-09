import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
from models import User, UserRole
from auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

@pytest.fixture
def test_recruiter(db_session):
    user = User(
        email="recruiter@test.com",
        username="recruiter",
        hashed_password=get_password_hash("password123"),
        full_name="Test Recruiter",
        role=UserRole.RECRUITER
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_interviewee(db_session):
    user = User(
        email="interviewee@test.com",
        username="interviewee",
        hashed_password=get_password_hash("password123"),
        full_name="Test Interviewee",
        role=UserRole.INTERVIEWEE
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to Smart Recruiter API"

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_user(client):
    response = client.post("/api/auth/register", json={
        "email": "newuser@test.com",
        "username": "newuser",
        "password": "password123",
        "role": "recruiter"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "newuser@test.com"

def test_register_duplicate_user(client, test_recruiter):
    response = client.post("/api/auth/register", json={
        "email": "recruiter@test.com",
        "username": "recruiter",
        "password": "password123",
        "role": "recruiter"
    })
    assert response.status_code == 400

def test_login_success(client, test_recruiter):
    response = client.post("/api/auth/login", data={
        "username": "recruiter",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials(client, test_recruiter):
    response = client.post("/api/auth/login", data={
        "username": "recruiter",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_current_user(client, test_recruiter):
    login_response = client.post("/api/auth/login", data={
        "username": "recruiter",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["username"] == "recruiter"

def test_create_assessment(client, test_recruiter):
    login_response = client.post("/api/auth/login", data={
        "username": "recruiter",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    response = client.post("/api/assessments", 
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Python Assessment",
            "description": "Test Python skills",
            "time_limit": 60
        }
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Python Assessment"

def test_get_assessments(client, test_recruiter):
    login_response = client.post("/api/auth/login", data={
        "username": "recruiter",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    response = client.get("/api/assessments", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_logout(client, test_recruiter):
    login_response = client.post("/api/auth/login", data={
        "username": "recruiter",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    response = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
