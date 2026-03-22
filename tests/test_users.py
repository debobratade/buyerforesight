import os
os.environ["DB_PATH"] = ":memory:"

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db

# Manually init the DB for the test session
init_db()

client = TestClient(app, raise_server_exceptions=True)

BASE = "/api/v1/users"

# ── Helpers ────────────────────────────────────────────────────────────────────

def make_user(name="Alice", email="alice@example.com", age=30, role="user"):
    return client.post(BASE, json={"name": name, "email": email, "age": age, "role": role})

# ── Create ─────────────────────────────────────────────────────────────────────

class TestCreateUser:
    def test_create_user_success(self):
        r = make_user(name="Alice", email="alice@test.com")
        assert r.status_code == 201
        assert r.json()["name"] == "Alice"
        assert "id" in r.json()

    def test_create_user_duplicate_email(self):
        make_user(name="Bob", email="bob@test.com")
        r = make_user(name="Bob2", email="bob@test.com")
        assert r.status_code == 409

    def test_create_user_invalid_email(self):
        r = client.post(BASE, json={"name": "Bad", "email": "not-an-email"})
        assert r.status_code == 422

    def test_create_user_missing_name(self):
        r = client.post(BASE, json={"email": "test@test.com"})
        assert r.status_code == 422

    def test_create_user_invalid_role(self):
        r = client.post(BASE, json={"name": "X", "email": "x@x.com", "role": "superuser"})
        assert r.status_code == 422

# ── Read ───────────────────────────────────────────────────────────────────────

class TestGetUser:
    def test_get_user_success(self):
        uid = make_user(name="Charlie", email="charlie@test.com").json()["id"]
        r = client.get(f"{BASE}/{uid}")
        assert r.status_code == 200
        assert r.json()["id"] == uid

    def test_get_user_not_found(self):
        assert client.get(f"{BASE}/99999").status_code == 404

# ── List ───────────────────────────────────────────────────────────────────────

class TestListUsers:
    def test_list_users(self):
        r = client.get(BASE)
        assert r.status_code == 200
        assert "users" in r.json() and "total" in r.json()

    def test_search_by_name(self):
        make_user(name="SearchableUser", email="searchable@test.com")
        r = client.get(f"{BASE}?search=SearchableUser")
        assert r.status_code == 200
        assert any("SearchableUser" in u["name"] for u in r.json()["users"])

    def test_sort_by_name_asc(self):
        r = client.get(f"{BASE}?sort=name&order=asc")
        assert r.status_code == 200
        names = [u["name"] for u in r.json()["users"]]
        assert names == sorted(names)

# ── Update ─────────────────────────────────────────────────────────────────────

class TestUpdateUser:
    def test_update_user_success(self):
        uid = make_user(name="Dave", email="dave@test.com").json()["id"]
        r = client.put(f"{BASE}/{uid}", json={"name": "Dave Updated"})
        assert r.status_code == 200
        assert r.json()["name"] == "Dave Updated"

    def test_update_user_not_found(self):
        assert client.put(f"{BASE}/99999", json={"name": "Ghost"}).status_code == 404

    def test_update_user_no_fields(self):
        uid = make_user(name="Eve", email="eve@test.com").json()["id"]
        assert client.put(f"{BASE}/{uid}", json={}).status_code == 400

# ── Delete ─────────────────────────────────────────────────────────────────────

class TestDeleteUser:
    def test_delete_user_success(self):
        uid = make_user(name="Frank", email="frank@test.com").json()["id"]
        assert client.delete(f"{BASE}/{uid}").status_code == 200
        assert client.get(f"{BASE}/{uid}").status_code == 404

    def test_delete_user_not_found(self):
        assert client.delete(f"{BASE}/99999").status_code == 404
