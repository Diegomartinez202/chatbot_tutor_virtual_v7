import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chat_con_mensaje_valido(monkeypatch):
    # 👉 Simular respuesta de Rasa
    def mock_post(url, json):
        class MockResponse:
            def json(self):
                return [{"recipient_id": json["sender"], "text": "Hola, ¿cómo puedo ayudarte?"}]
        return MockResponse()

    monkeypatch.setattr("httpx.AsyncClient.post", lambda *args, **kwargs: mock_post(*args, **kwargs))

    response = client.post("/api/chat", json={"message": "Hola"}, headers={"X-User-Id": "test-user"})

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert "text" in response.json()[0]

def test_chat_sin_mensaje():
    response = client.post("/api/chat", json={})
    assert response.status_code == 400
    assert response.json() == {"error": "Mensaje vacío"}