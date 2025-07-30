def test_protected_endpoint_requires_auth(client):
    res = client.get("/api/admin/intents")
    assert res.status_code == 401

def test_admin_access_with_token(client, admin_token):
    res = client.get("/api/admin/intents", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code in [200, 204]