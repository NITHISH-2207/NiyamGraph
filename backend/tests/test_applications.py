import uuid
from app.models import User, Role, UserRole, Institution, InstitutionUser, Application, ApplicationType, Document
from app.core.security import hash_password


def test_application_lifecycle_draft_submit(client, db_session):
    inst = Institution(
        id=uuid.uuid4(),
        identifier="PID-APP-TEST",
        official_name="Application Lifecycle Institute",
        institution_type="Engineering & Technology",
        state="Maharashtra",
        district="Mumbai",
        address="Campus Road",
        official_email="principal@lifecycle.edu",
        contact_number="9876543210",
        regional_office="Western Regional Office",
    )
    role_admin = Role(id=uuid.uuid4(), name="Institution Admin")
    user = User(
        id=uuid.uuid4(),
        email="principal@lifecycle.edu",
        password_hash=hash_password("Pass1234!"),
        is_active=True,
    )
    app_type = ApplicationType(
        id=uuid.uuid4(),
        code="APP-TYPE-EOA",
        name="Extension of Approval",
        required_fields_json=["principal_name"],
        required_documents_json=["FIRE_NOC"],
    )
    db_session.add_all([inst, role_admin, user, app_type])
    db_session.flush()

    db_session.add_all([
        UserRole(id=uuid.uuid4(), user_id=user.id, role_id=role_admin.id),
        InstitutionUser(id=uuid.uuid4(), user_id=user.id, institution_id=inst.id),
    ])
    db_session.flush()

    # Login
    login_res = client.post(
        "/api/v1/auth/institution/login",
        json={
            "institution_id": "PID-APP-TEST",
            "email": "principal@lifecycle.edu",
            "password": "Pass1234!",
        },
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create draft application
    create_res = client.post(
        "/api/v1/applications",
        json={
            "application_type_id": str(app_type.id),
            "academic_year": "2026-27",
            "application_data": {"principal_name": "Dr. Smith"},
        },
        headers=headers,
    )
    assert create_res.status_code == 200
    app_id = create_res.json()["id"]
    assert create_res.json()["status"] == "Draft"
    assert create_res.json()["reference_number"].startswith("NG-2026-AP-")

    # 2. Attempt submit without required document FIRE_NOC -> MUST fail
    submit_fail_res = client.post(f"/api/v1/applications/{app_id}/submit", headers=headers)
    assert submit_fail_res.status_code == 400
    assert "Missing required documents" in submit_fail_res.json()["error"]["message"]

    # 3. Add mock required document
    doc = Document(
        id=uuid.uuid4(),
        institution_id=inst.id,
        entity_type="application",
        entity_id=uuid.UUID(app_id),
        document_type="FIRE_NOC",
        original_filename="fire_noc.pdf",
        storage_key="test_key.pdf",
        file_size_bytes=1024,
        mime_type="application/pdf",
        checksum_sha256="abc123",
        uploaded_by_user_id=user.id,
        review_status="Pending",
    )
    db_session.add(doc)
    db_session.flush()

    # 4. Submit application -> MUST succeed and transition to Submitted
    submit_ok_res = client.post(f"/api/v1/applications/{app_id}/submit", headers=headers)
    assert submit_ok_res.status_code == 200
    assert submit_ok_res.json()["status"] == "Submitted"

    # 5. Subsequent edit attempts MUST be rejected
    edit_fail = client.put(
        f"/api/v1/applications/{app_id}",
        json={"application_data": {"principal_name": "Tampered Name"}},
        headers=headers,
    )
    assert edit_fail.status_code == 400
    assert "cannot be modified" in edit_fail.json()["error"]["message"]

