# tests/conftest.py
import os
from pathlib import Path
from dotenv import load_dotenv
import pytest

# ── 1) Cargar .env.test antes de importar la app ─────────────────────────────
test_env = Path(".env.test")
if test_env.exists():
    load_dotenv(dotenv_path=test_env, override=True)

# ── 2) Flags para testing ────────────────────────────────────────────────────
os.environ.setdefault("APP_ENV", "test")   # desactiva limiter en main.py
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ.setdefault("DEBUG", "true")

# ── Helpers de hash para tests ───────────────────────────────────────────────
def _hash_for_tests(plain: str) -> str:
    """
    Intenta usar el hasher real del proyecto; si no, usa bcrypt;
    si tampoco está disponible, devuelve el texto plano (solo tests).
    """
    # a) Tu función real (recomendada)
    try:
        from backend.utils.security import get_password_hash  # tu helper
        return get_password_hash(plain)
    except Exception:
        pass
    # b) bcrypt directo
    try:
        import bcrypt
        return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    except Exception:
        # c) Último recurso (solo tests sin login real)
        return plain

# ── 3) App y cliente ────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def app():
    from backend.main import app as fastapi_app
    return fastapi_app

@pytest.fixture()
def client(app):
    from fastapi.testclient import TestClient
    return TestClient(app)

# ── 4) Seed de usuarios: admin + usuario normal ─────────────────────────────
@pytest.fixture(scope="session", autouse=True)
def setup_seed_users():
    try:
        from backend.db.mongodb import get_users_collection
    except Exception:
        yield
        return

    users = get_users_collection()

    # Admin
    admin_email = "admin@example.com"
    if not users.find_one({"email": admin_email}):
        users.insert_one({
            "nombre": "Admin",
            "email": admin_email,
            "password": _hash_for_tests("Admin123!*"),  # ⚠️ hash real según tu proyecto
            "rol": "admin",
            "is_active": True,
            "created_by": "pytest",
        })

    # Usuario normal
    user_email = "user@example.com"
    if not users.find_one({"email": user_email}):
        users.insert_one({
            "nombre": "User",
            "email": user_email,
            "password": _hash_for_tests("User123!*"),
            "rol": "usuario",
            "is_active": True,
            "created_by": "pytest",
        })

    try:
        yield
    finally:
        users.delete_many({"email": {"$in": [admin_email, user_email]}})

# ── 5) Tokens: admin y user (con fallback de import) ────────────────────────
def _create_token(payload: dict) -> str:
    try:
        from backend.utils.jwt_manager import create_access_token
    except Exception:
        from backend.services.jwt_manager import create_access_token  # fallback
    return create_access_token(payload)

@pytest.fixture(scope="session")
def admin_token():
    return _create_token({"sub": "admin@example.com", "rol": "admin"})

@pytest.fixture(scope="session")
def user_token():
    return _create_token({"sub": "user@example.com", "rol": "usuario"})

# ── 6) Clients con Authorization listo ───────────────────────────────────────
@pytest.fixture()
def client_admin(app, admin_token):
    from fastapi.testclient import TestClient
    c = TestClient(app)
    c.headers.update({"Authorization": f"Bearer {admin_token}"})
    return c

@pytest.fixture()
def client_user(app, user_token):
    from fastapi.testclient import TestClient
    c = TestClient(app)
    c.headers.update({"Authorization": f"Bearer {user_token}"})
    return c