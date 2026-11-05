import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.models.user import User, Role, UserRole
from app.core.security import hash_password, decode_access_token
from app.services.auth_service import (
    authenticate_official_user,
    OFFICER_ROLE_WORKSPACE_MAP,
)
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.api.deps import require_official_roles, AuthenticatedContext


@pytest.fixture
def in_memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create Roles
    roles = {}
    for role_name in [
        "AICTE Scrutiny Officer",
        "AICTE EVC Officer",
        "AICTE Regional Officer",
        "AICTE Complaints Officer",
        "Institution Admin",
    ]:
        r = Role(id=uuid.uuid4(), name=role_name, description=f"{role_name} description")
        session.add(r)
        roles[role_name] = r
    session.flush()

    common_password = "YourTestPassword123!"
    common_hash = hash_password(common_password)

    # 1. Scrutiny Officer
    scrutiny_user = User(
        id=uuid.uuid4(),
        email="test.official@aicte.gov.in",
        full_name="Dr. K. N. Rao",
        password_hash=common_hash,
        is_active=True,
    )
    session.add(scrutiny_user)
    session.flush()
    session.add(UserRole(id=uuid.uuid4(), user_id=scrutiny_user.id, role_id=roles["AICTE Scrutiny Officer"].id))

    # 2. EVC Officer
    evc_user = User(
        id=uuid.uuid4(),
        email="test.evc@aicte.gov.in",
        full_name="Prof. M. S. Sundaram",
        password_hash=common_hash,
        is_active=True,
    )
    session.add(evc_user)
    session.flush()
    session.add(UserRole(id=uuid.uuid4(), user_id=evc_user.id, role_id=roles["AICTE EVC Officer"].id))

    # 3. Regional Officer
    regional_user = User(
        id=uuid.uuid4(),
        email="test.regional@aicte.gov.in",
        full_name="Dr. S. K. Verma",
        password_hash=common_hash,
        is_active=True,
    )
    session.add(regional_user)
    session.flush()
    session.add(UserRole(id=uuid.uuid4(), user_id=regional_user.id, role_id=roles["AICTE Regional Officer"].id))

    # 4. Complaints Officer
    complaints_user = User(
        id=uuid.uuid4(),
        email="test.complaints@aicte.gov.in",
        full_name="Smt. Radha Iyer",
        password_hash=common_hash,
        is_active=True,
    )
    session.add(complaints_user)
    session.flush()
    session.add(UserRole(id=uuid.uuid4(), user_id=complaints_user.id, role_id=roles["AICTE Complaints Officer"].id))

    # 5. Inactive Officer
    inactive_user = User(
        id=uuid.uuid4(),
        email="test.inactive@aicte.gov.in",
        full_name="Inactive Officer",
        password_hash=common_hash,
        is_active=False,
    )
    session.add(inactive_user)
    session.flush()
    session.add(UserRole(id=uuid.uuid4(), user_id=inactive_user.id, role_id=roles["AICTE Scrutiny Officer"].id))

    # 6. Institution Admin (Should be blocked from official login)
    inst_admin = User(
        id=uuid.uuid4(),
        email="admin@apex.edu.in",
        full_name="Prof. Ananya Sen",
        password_hash=common_hash,
        is_active=True,
    )
    session.add(inst_admin)
    session.flush()
    session.add(UserRole(id=uuid.uuid4(), user_id=inst_admin.id, role_id=roles["Institution Admin"].id))

    session.commit()
    yield session
    session.close()


def test_scrutiny_officer_login_and_routing(in_memory_db):
    res = authenticate_official_user(
        db=in_memory_db,
        identifier="test.official@aicte.gov.in",
        password="YourTestPassword123!",
    )
    assert res["primary_role"] == "AICTE Scrutiny Officer"
    assert res["workspace"]["id"] == "scrutiny"
    assert res["workspace"]["route"] == "/scrutiny/dashboard"
    assert res["workspace"]["is_available"] is True
    assert res["access_token"] is not None

    # Validate JWT claims
    claims = decode_access_token(res["access_token"])
    assert claims["role"] == "AICTE Scrutiny Officer"


def test_evc_officer_login_and_routing(in_memory_db):
    res = authenticate_official_user(
        db=in_memory_db,
        identifier="test.evc@aicte.gov.in",
        password="YourTestPassword123!",
    )
    assert res["primary_role"] == "AICTE EVC Officer"
    assert res["workspace"]["id"] == "evc"
    assert res["workspace"]["route"] == "/aicte/evc/dashboard"
    assert res["workspace"]["is_available"] is False


def test_regional_officer_login_and_routing(in_memory_db):
    res = authenticate_official_user(
        db=in_memory_db,
        identifier="test.regional@aicte.gov.in",
        password="YourTestPassword123!",
    )
    assert res["primary_role"] == "AICTE Regional Officer"
    assert res["workspace"]["id"] == "regional"
    assert res["workspace"]["route"] == "/aicte/regional/dashboard"
    assert res["workspace"]["is_available"] is False


def test_complaints_officer_login_and_routing(in_memory_db):
    res = authenticate_official_user(
        db=in_memory_db,
        identifier="test.complaints@aicte.gov.in",
        password="YourTestPassword123!",
    )
    assert res["primary_role"] == "AICTE Complaints Officer"
    assert res["workspace"]["id"] == "complaints"
    assert res["workspace"]["route"] == "/aicte/complaints/dashboard"
    assert res["workspace"]["is_available"] is False


def test_incorrect_password_rejected(in_memory_db):
    with pytest.raises(UnauthorizedError) as exc_info:
        authenticate_official_user(
            db=in_memory_db,
            identifier="test.official@aicte.gov.in",
            password="WrongPassword123!",
        )
    assert "Invalid statutory credentials" in exc_info.value.message


def test_inactive_account_rejected(in_memory_db):
    with pytest.raises(UnauthorizedError) as exc_info:
        authenticate_official_user(
            db=in_memory_db,
            identifier="test.inactive@aicte.gov.in",
            password="YourTestPassword123!",
        )
    assert "inactive" in exc_info.value.message.lower()


def test_institution_admin_blocked_from_aicte_login(in_memory_db):
    with pytest.raises(ForbiddenError) as exc_info:
        authenticate_official_user(
            db=in_memory_db,
            identifier="admin@apex.edu.in",
            password="YourTestPassword123!",
        )
    assert "not authorized for any AICTE Administration workspace" in exc_info.value.message


def test_role_based_access_control_guards():
    # Helper to simulate AuthenticatedContext
    def make_ctx(role_name: str) -> AuthenticatedContext:
        mock_user = User(id=uuid.uuid4(), email=f"{role_name.lower().replace(' ', '')}@aicte.gov.in")
        return AuthenticatedContext(
            user=mock_user,
            role=role_name,
            institution=None,
            jti="test-jti",
            token_exp=9999999999,
        )

    scrutiny_guard = require_official_roles(["AICTE Scrutiny Officer", "Super Administrator"])
    evc_guard = require_official_roles(["AICTE EVC Officer", "Super Administrator"])
    complaints_guard = require_official_roles(["AICTE Complaints Officer", "Super Administrator"])

    # Scrutiny role allowed on Scrutiny routes
    assert scrutiny_guard(ctx=make_ctx("AICTE Scrutiny Officer")).role == "AICTE Scrutiny Officer"

    # EVC role BLOCKED on Scrutiny routes
    with pytest.raises(ForbiddenError):
        scrutiny_guard(ctx=make_ctx("AICTE EVC Officer"))

    # Regional role BLOCKED on Complaints routes
    with pytest.raises(ForbiddenError):
        complaints_guard(ctx=make_ctx("AICTE Regional Officer"))

    # Complaints role BLOCKED on EVC routes
    with pytest.raises(ForbiddenError):
        evc_guard(ctx=make_ctx("AICTE Complaints Officer"))

