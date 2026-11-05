import uuid
from datetime import datetime, timezone, timedelta
from app.models import User, Role, UserRole, Institution, InstitutionUser, RevokedToken
from app.core.security import hash_password, create_access_token


def test_auth_login_success(client, db_session):
    # Setup Institution & User
    inst = Institution(
        id=uuid.uuid4(),
        identifier="PID-TEST-1001",
        official_name="Test Engineering College",
        institution_type="Engineering & Technology",
        state="Maharashtra",
        district="Mumbai",
        address="Test Road",
        official_email="admin@test.edu",
        contact_number="1234567890",
        regional_office="Western Regional Office",
    )
    role = Role(id=uuid.uuid4(), name="Institution Admin")
    user = User(
        id=uuid.uuid4(),
        email="admin@test.edu",
        password_hash=hash_password("ValidPassword123!"),
        is_active=True,
    )
    db_session.add_all([inst, role, user])
    db_session.flush()

    db_session.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=role.id))
    db_session.add(InstitutionUser(id=uuid.uuid4(), user_id=user.id, institution_id=inst.id))
    db_session.flush()

    # Attempt login
    response = client.post(
        "/api/v1/auth/institution/login",
        json={
            "institution_id": "PID-TEST-1001",
            "email": "admin@test.edu",
            "password": "ValidPassword123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "Institution Admin"
    assert data["institution"]["identifier"] == "PID-TEST-1001"


def test_auth_login_invalid_credentials_uniform_error(client, db_session):
    # Test wrong password, wrong email, wrong institution ID all return identical 401 error
    payloads = [
        {"institution_id": "UNKNOWN", "email": "admin@test.edu", "password": "pass"},
        {"institution_id": "PID-TEST-1001", "email": "wrong@test.edu", "password": "pass"},
        {"institution_id": "PID-TEST-1001", "email": "admin@test.edu", "password": "WrongPassword!"},
    ]
    for p in payloads:
        res = client.post("/api/v1/auth/institution/login", json=p)
        assert res.status_code == 401
        err = res.json()["error"]
        assert err["code"] == "UNAUTHORIZED"
        assert "Invalid institution ID, email or password" in err["message"]


def test_auth_logout_revokes_token(client, db_session):
    inst = Institution(
        id=uuid.uuid4(),
        identifier="PID-TEST-1002",
        official_name="Test College 2",
        institution_type="Engineering & Technology",
        state="Maharashtra",
        district="Pune",
        address="Pune Road",
        official_email="staff@test.edu",
        contact_number="1234567890",
        regional_office="Western Regional Office",
    )
    role = Role(id=uuid.uuid4(), name="Institution Staff")
    user = User(
        id=uuid.uuid4(),
        email="staff@test.edu",
        password_hash=hash_password("ValidPassword123!"),
        is_active=True,
    )
    db_session.add_all([inst, role, user])
    db_session.flush()

    db_session.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=role.id))
    db_session.add(InstitutionUser(id=uuid.uuid4(), user_id=user.id, institution_id=inst.id))
    db_session.flush()

    # Login to obtain token
    login_res = client.post(
        "/api/v1/auth/institution/login",
        json={
            "institution_id": "PID-TEST-1002",
            "email": "staff@test.edu",
            "password": "ValidPassword123!",
        },
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify access to /auth/me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200

    # Logout
    logout_res = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200

    # Verify subsequent call is rejected (401)
    subsequent_res = client.get("/api/v1/auth/me", headers=headers)
    assert subsequent_res.status_code == 401
    assert "revoked" in subsequent_res.json()["error"]["message"].lower()

