import requests

BASE_URL = "http://localhost:8000"

def test_login():
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert response.status_code == 200
    print("✅ Login exitoso")

def test_logs_protegidos():
    token = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "admin",
        "password": "admin123"
    }).json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/logs/", headers=headers)

    assert response.status_code == 200
    print("✅ Acceso a logs con JWT exitoso")

if __name__ == "__main__":
    test_login()
    test_logs_protegidos()
