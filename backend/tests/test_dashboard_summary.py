import uuid
from datetime import datetime, timezone, timedelta
from app.models import (
    User,
    Role,
    UserRole,
    Institution,
    InstitutionUser,
    Application,
    ApplicationType,
    Deficiency,
    Notification,
)
from app.core.security import hash_password


def test_dashboard_summary_auth_and_cache_headers(client, db_session):
    inst = Institution(
        id=uuid.uuid4(),
        identifier="PID-DASH-01",
        official_name="Apex Test Institute of Tech",
        institution_type="Engineering & Technology",
        state="Maharashtra",
        district="Mumbai",
        address="Test Address",
        official_email="contact@apexdash.edu",
        contact_number="9998887776",
        regional_office="Western Regional Office",
    )
    role_admin = Role(id=uuid.uuid4(), name="Institution Admin")
    user = User(
        id=uuid.uuid4(),
        email="admin@apexdash.edu",
        full_name="Prof. Ananya Sen",
        password_hash=hash_password("ApexPass123!"),
        is_active=True,
    )
    db_session.add_all([inst, role_admin, user])
    db_session.flush()

    db_session.add_all([
        UserRole(id=uuid.uuid4(), user_id=user.id, role_id=role_admin.id),
        InstitutionUser(id=uuid.uuid4(), user_id=user.id, institution_id=inst.id),
    ])
    db_session.flush()

    # 1. Unauthenticated request -> MUST return 401
    unauth_res = client.get("/api/v1/dashboard/summary")
    assert unauth_res.status_code == 401

    # 2. Authenticated login
    login_res = client.post(
        "/api/v1/auth/institution/login",
        json={
            "institution_id": "PID-DASH-01",
            "email": "admin@apexdash.edu",
            "password": "ApexPass123!",
        },
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Authenticated request -> MUST return 200, valid structure, and Cache-Control: no-store
    dash_res = client.get("/api/v1/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    assert "no-store" in dash_res.headers.get("Cache-Control", "")

    data = dash_res.json()
    assert data["institution"]["status"] == "ok"
    assert data["institution"]["data"]["identifier"] == "PID-DASH-01"
    assert data["institution"]["data"]["user"]["display_name"] == "Prof. Ananya Sen"
    assert data["stats"]["status"] == "ok"
    assert data["stats"]["data"]["total"] == 0
    assert data["stats"]["data"]["breakdown"]["total"] == 0
    assert data["pending_actions"]["status"] == "ok"
    assert data["pending_actions"]["data"]["total_count"] == 0
    assert data["recent_applications"]["status"] == "ok"
    assert len(data["recent_applications"]["data"]) == 0


def test_dashboard_stats_and_reconciliation(client, db_session):
    inst = Institution(
        id=uuid.uuid4(),
        identifier="PID-DASH-02",
        official_name="Bharat Test Academy",
        institution_type="Engineering & Technology",
        state="Karnataka",
        district="Bengaluru",
        address="Test Road",
        official_email="admin@bharatdash.edu",
        contact_number="8887776665",
        regional_office="South-Western Regional Office",
    )
    role_admin = Role(id=uuid.uuid4(), name="Institution Admin")
    user = User(
        id=uuid.uuid4(),
        email="admin@bharatdash.edu",
        password_hash=hash_password("BharatPass123!"),
        is_active=True,
    )
    app_type = ApplicationType(
        id=uuid.uuid4(),
        code="DASH-TYPE",
        name="Extension of Approval (EoA)",
        required_fields_json=[],
        required_documents_json=[],
    )
    db_session.add_all([inst, role_admin, user, app_type])
    db_session.flush()

    db_session.add_all([
        UserRole(id=uuid.uuid4(), user_id=user.id, role_id=role_admin.id),
        InstitutionUser(id=uuid.uuid4(), user_id=user.id, institution_id=inst.id),
    ])
    db_session.flush()

    # Seed 3 applications with different statuses
    now = datetime.now(timezone.utc)
    app1 = Application(
        id=uuid.uuid4(),
        reference_number="NG-2026-AP-0001",
        institution_id=inst.id,
        application_type_id=app_type.id,
        academic_year="2026-27",
        status="Draft",
        created_by_user_id=user.id,
        application_data={},
        updated_at=now - timedelta(hours=3),
    )
    app2 = Application(
        id=uuid.uuid4(),
        reference_number="NG-2026-AP-0002",
        institution_id=inst.id,
        application_type_id=app_type.id,
        academic_year="2026-27",
        status="Submitted",
        created_by_user_id=user.id,
        application_data={},
        updated_at=now - timedelta(hours=2),
    )
    app3 = Application(
        id=uuid.uuid4(),
        reference_number="NG-2026-AP-0003",
        institution_id=inst.id,
        application_type_id=app_type.id,
        academic_year="2026-27",
        status="Deficiency Raised",
        created_by_user_id=user.id,
        application_data={},
        updated_at=now - timedelta(hours=1),
    )
    db_session.add_all([app1, app2, app3])
    db_session.flush()

    # Add open deficiency for app3
    defic = Deficiency(
        id=uuid.uuid4(),
        reference_number="DEF-2026-0001",
        institution_id=inst.id,
        application_id=app3.id,
        description="Provide approved cadre faculty ratio document",
        raised_by_user_id=user.id,
        raised_at=now - timedelta(days=2),
        response_deadline=now + timedelta(days=5),
        status="Open",
    )
    db_session.add(defic)
    db_session.flush()

    # Login
    login_res = client.post(
        "/api/v1/auth/institution/login",
        json={
            "institution_id": "PID-DASH-02",
            "email": "admin@bharatdash.edu",
            "password": "BharatPass123!",
        },
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    dash_res = client.get("/api/v1/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    data = dash_res.json()

    # Verify Counts
    stats = data["stats"]["data"]
    assert stats["total"] == 3
    assert stats["under_review"] == 1  # app2 (Submitted)
    assert stats["requiring_action"] == 1  # app3 (Deficiency Raised)
    assert stats["breakdown"]["draft"] == 1  # app1 (Draft)

    # Verify Exact Reconciliation Math
    breakdown = stats["breakdown"]
    reconciled_sum = (
        breakdown["approved"]
        + breakdown["under_review"]
        + breakdown["requiring_action"]
        + breakdown["draft"]
        + breakdown["rejected"]
        + breakdown["closed"]
    )
    assert reconciled_sum == stats["total"]
    assert reconciled_sum == 3

    # Verify Pending Actions
    pending = data["pending_actions"]["data"]
    assert pending["total_count"] >= 2  # Open deficiency + Incomplete draft
    defic_item = next((item for item in pending["items"] if item["type"] == "deficiency"), None)
    assert defic_item is not None
    assert defic_item["is_due_soon"] is True
    assert defic_item["reference"] == "DEF-2026-0001"

    # Verify Recent Applications Ordering (app3 newest updated, then app2, then app1)
    recent = data["recent_applications"]["data"]
    assert len(recent) == 3
    assert recent[0]["reference_number"] == "NG-2026-AP-0003"
    assert recent[1]["reference_number"] == "NG-2026-AP-0002"
    assert recent[2]["reference_number"] == "NG-2026-AP-0001"

