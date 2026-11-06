import uuid
from app.models import User, Role, UserRole, Institution, InstitutionUser, Application, ApplicationType
from app.core.security import hash_password


def test_cross_institution_isolation_returns_404(client, db_session):
    # Setup Institution A
    inst_a = Institution(
        id=uuid.uuid4(),
        identifier="PID-INST-A",
        official_name="Institution Alpha",
        institution_type="Engineering & Technology",
        state="Maharashtra",
        district="Mumbai",
        address="Alpha Campus",
        official_email="admin@alpha.edu",
        contact_number="1111111111",
        regional_office="Western Regional Office",
    )
    # Setup Institution B
    inst_b = Institution(
        id=uuid.uuid4(),
        identifier="PID-INST-B",
        official_name="Institution Beta",
        institution_type="Engineering & Technology",
        state="Karnataka",
        district="Bengaluru",
        address="Beta Campus",
        official_email="admin@beta.edu",
        contact_number="2222222222",
        regional_office="South-Western Regional Office",
    )
    role_admin = Role(id=uuid.uuid4(), name="Institution Admin")

    user_a = User(
        id=uuid.uuid4(),
        email="admin@alpha.edu",
        password_hash=hash_password("PasswordA123!"),
        is_active=True,
    )
    user_b = User(
        id=uuid.uuid4(),
        email="admin@beta.edu",
        password_hash=hash_password("PasswordB123!"),
        is_active=True,
    )

    db_session.add_all([inst_a, inst_b, role_admin, user_a, user_b])
    db_session.flush()

    db_session.add_all([
        UserRole(id=uuid.uuid4(), user_id=user_a.id, role_id=role_admin.id),
        InstitutionUser(id=uuid.uuid4(), user_id=user_a.id, institution_id=inst_a.id),
        UserRole(id=uuid.uuid4(), user_id=user_b.id, role_id=role_admin.id),
        InstitutionUser(id=uuid.uuid4(), user_id=user_b.id, institution_id=inst_b.id),
    ])
    db_session.flush()

    # Create an application owned by Institution B
    app_type = ApplicationType(
        id=uuid.uuid4(),
        code="TYPE-ISOLATION",
        name="Isolation Test Type",
        required_fields_json=[],
        required_documents_json=[],
    )
    db_session.add(app_type)
    db_session.flush()

    app_b = Application(
        id=uuid.uuid4(),
        reference_number="NG-2026-AP-9999",
        institution_id=inst_b.id,
        application_type_id=app_type.id,
        academic_year="2026-27",
        status="Draft",
        created_by_user_id=user_b.id,
        application_data={"test": "data"},
    )
    db_session.add(app_b)
    db_session.flush()

    # Login as User A (Institution Alpha)
    login_a = client.post(
        "/api/v1/auth/institution/login",
        json={
            "institution_id": "PID-INST-A",
            "email": "admin@alpha.edu",
            "password": "PasswordA123!",
        },
    )
    token_a = login_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Attempt to read Institution B's application -> MUST return 404 (not 403)
    res_get = client.get(f"/api/v1/applications/{app_b.id}", headers=headers_a)
    assert res_get.status_code == 404
    assert res_get.json()["error"]["code"] == "NOT_FOUND"

    # Attempt to update Institution B's application -> MUST return 404
    res_put = client.put(
        f"/api/v1/applications/{app_b.id}",
        json={"application_data": {"malicious": "update"}},
        headers=headers_a,
    )
    assert res_put.status_code == 404
    assert res_put.json()["error"]["code"] == "NOT_FOUND"

