import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple
from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User, Role, UserRole, InstitutionUser, RevokedToken
from app.models.institution import Institution
from app.core.security import verify_password, verify_dummy_password, create_access_token
from app.core.config import settings
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.services.audit_service import log_audit

# Basic in-memory rate limiting tracker: IP/identifier -> list of timestamps
_RATE_LIMIT_BUCKET: Dict[str, list] = defaultdict(list)
_MAX_REQUESTS_PER_MINUTE = 60


def check_rate_limit(key: str, max_requests: int = _MAX_REQUESTS_PER_MINUTE) -> bool:
    """Simple sliding window rate limiter for Render single-instance."""
    now = datetime.now(timezone.utc).timestamp()
    window = now - 60
    # Filter out entries older than 60s
    timestamps = [t for t in _RATE_LIMIT_BUCKET[key] if t > window]
    if len(timestamps) >= max_requests:
        return False
    timestamps.append(now)
    _RATE_LIMIT_BUCKET[key] = timestamps
    return True


def authenticate_institution_user(
    db: Session,
    institution_identifier: str,
    email: str,
    password: str,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Authenticate an institution user.
    Enforces identical timing protection via dummy hash,
    account lockout, strict institution link, and role segregation.
    """
    clean_email = email.strip().lower()
    clean_identifier = institution_identifier.strip()

    # Rate limiting by IP and identifier
    rate_key = f"{ip_address or 'unknown'}:{clean_identifier}"
    if not check_rate_limit(rate_key):
        raise UnauthorizedError("Too many login attempts. Please try again in a few moments.")

    generic_error = "Invalid institution ID, email or password."

    # 1. Lookup institution
    institution = (
        db.query(Institution)
        .filter(func.lower(Institution.identifier) == clean_identifier.lower())
        .first()
    )

    # 2. Lookup user
    user = (
        db.query(User)
        .filter(func.lower(User.email) == clean_email)
        .first()
    )

    if not institution or not user:
        verify_dummy_password()
        log_audit(
            db=db,
            action="AUTH_LOGIN_FAILED_UNKNOWN_TARGET",
            entity_type="auth",
            ip_address=ip_address,
            request_id=request_id,
            metadata={"identifier_hint": clean_identifier[:10]},
        )
        raise UnauthorizedError(generic_error)

    now = datetime.now(timezone.utc)

    # 3. Check account lockout
    if user.locked_until and user.locked_until > now:
        log_audit(
            db=db,
            action="AUTH_LOGIN_LOCKED_ACCOUNT_ATTEMPT",
            entity_type="user",
            entity_id=str(user.id),
            actor_user_id=user.id,
            ip_address=ip_address,
            request_id=request_id,
        )
        raise UnauthorizedError(
            f"Account is temporarily locked due to failed login attempts. Please try again after {user.locked_until.strftime('%H:%M:%S UTC')}."
        )

    # 4. Check user active status
    if not user.is_active:
        verify_dummy_password()
        log_audit(
            db=db,
            action="AUTH_LOGIN_INACTIVE_USER",
            entity_type="user",
            entity_id=str(user.id),
            actor_user_id=user.id,
            ip_address=ip_address,
            request_id=request_id,
        )
        raise UnauthorizedError(generic_error)

    # 5. Check institution link
    institution_link = (
        db.query(InstitutionUser)
        .filter(
            InstitutionUser.user_id == user.id,
            InstitutionUser.institution_id == institution.id,
        )
        .first()
    )
    if not institution_link:
        verify_dummy_password()
        log_audit(
            db=db,
            action="AUTH_LOGIN_INSTITUTION_MISMATCH",
            entity_type="user",
            entity_id=str(user.id),
            actor_user_id=user.id,
            ip_address=ip_address,
            request_id=request_id,
        )
        raise UnauthorizedError(generic_error)

    # 6. Check user role: AICTE Official & Super Administrator cannot use institution login
    user_roles = (
        db.query(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .filter(UserRole.user_id == user.id)
        .all()
    )
    role_names = [r[0] for r in user_roles]
    institution_roles = [r for r in role_names if r in ("Institution Admin", "Institution Staff")]

    if not institution_roles or any(r in ("AICTE Official", "Super Administrator") for r in role_names):
        verify_dummy_password()
        log_audit(
            db=db,
            action="AUTH_LOGIN_DISALLOWED_ROLE",
            entity_type="user",
            entity_id=str(user.id),
            actor_user_id=user.id,
            ip_address=ip_address,
            request_id=request_id,
        )
        raise UnauthorizedError(generic_error)

    active_role = "Institution Admin" if "Institution Admin" in institution_roles else "Institution Staff"

    # 7. Verify password
    if not verify_password(password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.LOGIN_MAX_ATTEMPTS:
            user.locked_until = now + timedelta(minutes=settings.LOGIN_LOCKOUT_MINUTES)
            log_audit(
                db=db,
                action="AUTH_ACCOUNT_LOCKED",
                entity_type="user",
                entity_id=str(user.id),
                actor_user_id=user.id,
                ip_address=ip_address,
                request_id=request_id,
            )
        else:
            log_audit(
                db=db,
                action="AUTH_LOGIN_FAILED_PASSWORD",
                entity_type="user",
                entity_id=str(user.id),
                actor_user_id=user.id,
                ip_address=ip_address,
                request_id=request_id,
                metadata={"failed_attempts": user.failed_login_attempts},
            )
        db.flush()
        raise UnauthorizedError(generic_error)

    # 8. Success: reset failed attempts
    user.failed_login_attempts = 0
    user.locked_until = None
    db.flush()

    token_data = create_access_token(
        user_id=str(user.id),
        role=active_role,
        institution_id=str(institution.id),
    )

    log_audit(
        db=db,
        action="AUTH_LOGIN_SUCCESS",
        entity_type="user",
        entity_id=str(user.id),
        actor_user_id=user.id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"role": active_role, "institution_identifier": institution.identifier},
    )

    return {
        **token_data,
        "user": user,
        "role": active_role,
        "institution": institution,
    }


def revoke_token(
    db: Session,
    jti: str,
    exp_timestamp: int,
    user_id: Optional[uuid.UUID] = None,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> RevokedToken:
    """Revoke JWT token upon logout."""
    now = datetime.now(timezone.utc)
    # Lazy cleanup of expired tokens (older than now)
    db.query(RevokedToken).filter(RevokedToken.token_expiry < now).delete(synchronize_session=False)

    expiry_dt = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    revoked = RevokedToken(
        id=uuid.uuid4(),
        jti=jti,
        token_expiry=expiry_dt,
    )
    db.add(revoked)
    db.flush()

    log_audit(
        db=db,
        action="AUTH_LOGOUT",
        entity_type="auth",
        actor_user_id=user_id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"jti": jti},
    )
    return revoked


def is_token_revoked(db: Session, jti: str) -> bool:
    """Check if token JTI is in revoked_tokens table."""
    return db.query(RevokedToken).filter(RevokedToken.jti == jti).first() is not None


# Canonical workspace destinations mapped by AICTE officer role
OFFICER_ROLE_WORKSPACE_MAP: Dict[str, Dict[str, Any]] = {
    "AICTE Scrutiny Officer": {
        "id": "scrutiny",
        "name": "Scrutiny Portal",
        "route": "/scrutiny/dashboard",
        "is_available": True,
    },
    "AICTE EVC Officer": {
        "id": "evc",
        "name": "EVC Portal",
        "route": "/aicte/evc/dashboard",
        "is_available": False,
    },
    "AICTE Regional Officer": {
        "id": "regional",
        "name": "Regional Portal",
        "route": "/aicte/regional/dashboard",
        "is_available": False,
    },
    "AICTE Complaints Officer": {
        "id": "complaints",
        "name": "Complaints Portal",
        "route": "/aicte/complaints/dashboard",
        "is_available": False,
    },
    # Backward compatibility mappings
    "AICTE Official": {
        "id": "scrutiny",
        "name": "Scrutiny Portal",
        "route": "/scrutiny/dashboard",
        "is_available": True,
    },
    "SCRUTINY_OFFICER": {
        "id": "scrutiny",
        "name": "Scrutiny Portal",
        "route": "/scrutiny/dashboard",
        "is_available": True,
    },
    "REGIONAL_OFFICER": {
        "id": "regional",
        "name": "Regional Portal",
        "route": "/aicte/regional/dashboard",
        "is_available": False,
    },
    "Super Administrator": {
        "id": "scrutiny",
        "name": "Governance & Scrutiny Administration",
        "route": "/scrutiny/dashboard",
        "is_available": True,
    },
}


def authenticate_official_user(
    db: Session,
    identifier: str,
    password: str,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Authenticate an AICTE administration officer across the four distinct officer roles:
    - AICTE Scrutiny Officer
    - AICTE EVC Officer
    - AICTE Regional Officer
    - AICTE Complaints Officer

    Enforces timing protection, account lockouts, active check, Argon2 verification,
    and returns role-based workspace routing.
    """
    clean_identifier = identifier.strip().lower()

    # Rate limit check
    rate_key = f"{ip_address or 'unknown'}:official:{clean_identifier}"
    if not check_rate_limit(rate_key):
        raise UnauthorizedError("Too many login attempts. Please try again in a few moments.")

    generic_error = "Invalid statutory credentials or password."
    now = datetime.now(timezone.utc)

    # 1. Lookup User by email or ID
    user = (
        db.query(User)
        .filter(func.lower(User.email) == clean_identifier)
        .first()
    )

    if not user:
        verify_dummy_password()
        log_audit(
            db=db,
            action="AUTH_OFFICIAL_LOGIN_USER_NOT_FOUND",
            entity_type="user",
            metadata={"identifier": clean_identifier},
            ip_address=ip_address,
            request_id=request_id,
        )
        raise UnauthorizedError(generic_error)

    # 2. Check lockout status
    if user.locked_until:
        if user.locked_until > now:
            verify_dummy_password()
            remaining_mins = int((user.locked_until - now).total_seconds() / 60) + 1
            raise UnauthorizedError(
                f"Account temporarily locked due to failed attempts. Please try again in {remaining_mins} minutes."
            )
        else:
            user.locked_until = None
            user.failed_login_attempts = 0

    # 3. Check account active status
    if not user.is_active:
        verify_dummy_password()
        raise UnauthorizedError("Account is inactive. Please contact the system administrator.")

    # 4. Check user roles: Must have an authorized AICTE role
    user_roles = (
        db.query(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .filter(UserRole.user_id == user.id)
        .all()
    )
    role_names = [r[0] for r in user_roles]

    # Find matching AICTE roles
    authorized_aicte_roles = [r for r in role_names if r in OFFICER_ROLE_WORKSPACE_MAP]

    if not authorized_aicte_roles:
        verify_dummy_password()
        log_audit(
            db=db,
            action="AUTH_OFFICIAL_LOGIN_UNAUTHORIZED_ROLE",
            entity_type="user",
            entity_id=str(user.id),
            actor_user_id=user.id,
            ip_address=ip_address,
            request_id=request_id,
        )
        raise ForbiddenError("User account is not authorized for any AICTE Administration workspace.")

    # 5. Verify password using Argon2
    if not verify_password(password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.LOGIN_MAX_ATTEMPTS:
            user.locked_until = now + timedelta(minutes=settings.LOGIN_LOCKOUT_MINUTES)
            log_audit(
                db=db,
                action="AUTH_ACCOUNT_LOCKED",
                entity_type="user",
                entity_id=str(user.id),
                actor_user_id=user.id,
                ip_address=ip_address,
                request_id=request_id,
            )
        else:
            log_audit(
                db=db,
                action="AUTH_OFFICIAL_LOGIN_FAILED_PASSWORD",
                entity_type="user",
                entity_id=str(user.id),
                actor_user_id=user.id,
                ip_address=ip_address,
                request_id=request_id,
            )
        db.commit()
        raise UnauthorizedError(generic_error)

    # 6. Reset failed attempts upon successful password check
    if user.failed_login_attempts > 0 or user.locked_until is not None:
        user.failed_login_attempts = 0
        user.locked_until = None

    db.commit()

    # 7. Determine primary role and workspace routing
    # Specific AICTE roles take precedence over generic AICTE Official
    primary_role = authorized_aicte_roles[0]
    for r in ["AICTE Scrutiny Officer", "AICTE EVC Officer", "AICTE Regional Officer", "AICTE Complaints Officer"]:
        if r in authorized_aicte_roles:
            primary_role = r
            break

    workspace = OFFICER_ROLE_WORKSPACE_MAP[primary_role]

    # 8. Issue JWT Token
    token_data = create_access_token(
        user_id=str(user.id),
        role=primary_role,
        institution_id=None,
    )

    log_audit(
        db=db,
        action="AUTH_OFFICIAL_LOGIN_SUCCESS",
        entity_type="user",
        entity_id=str(user.id),
        actor_user_id=user.id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"role": primary_role, "workspace": workspace["id"]},
    )

    return {
        "access_token": token_data["access_token"],
        "token_type": "bearer",
        "expires_in": token_data["expires_in"],
        "expires_at": token_data["expires_at"],
        "user": user,
        "roles": role_names,
        "primary_role": primary_role,
        "workspace": workspace,
    }


