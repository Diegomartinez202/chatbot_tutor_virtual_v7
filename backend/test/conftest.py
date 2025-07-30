import pytest
from fastapi.testclient import TestClient
from main import app
from services.jwt_manager import create_access_token
from db.mongodb import get_users_collection

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="module")
def admin_token():
    token = create_access_token({"sub": "admin@example.com", "rol": "admin"})
    return token

@pytest.fixture(scope="module", autouse=True)
def setup_admin_user():
    users = get_users_collection()
    if not users.find_one({"email": "admin@example.com"}):
        users.insert_one({
            "nombre": "Admin",
            "email": "admin@example.com",
            "password": "hashedPassword",  # Usa hash real en producción
            "rol": "admin"
        })
    yield
    users.delete_many({"email": "admin@example.com"})