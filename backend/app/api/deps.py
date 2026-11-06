import uuid
from typing import Optional, List, Generator
from fastapi import Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from app.database.session import get_db
from app.core.security import decode_access_token
from app.models.user import User, Role, UserRole, InstitutionUser
from app.models.institution import Institution
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.services.auth_service import is_token_revoked

# Bearer token security scheme (auto_error=False to provide custom standardized JSON error response)
bearer_scheme = HTTPBearer(auto_error=False)


def get_request_id(
    request: Request,
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID"),
) -> str:
    """Extract or return current request ID."""
    if hasattr(request.state, "request_id"):
        return request.state.request_id
    req_id = x_request_id or str(uuid.uuid4())
    request.state.request_id = req_id
    return req_id


def get_client_ip(request: Request) -> str:
    """Extract client IP address safely."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


class AuthenticatedContext:
    def __init__(
        self,
        user: User,
        role: str,
        institution: Optional[Institution],
        jti: str,
        token_exp: int,
    ):
        self.user = user
        self.role = role
        self.institution = institution
        self.jti = jti
        self.token_exp = token_exp

    @property
    def institution_id(self) -> uuid.UUID:
        if not self.institution:
            raise ForbiddenError("User is not associated with an institution.")
        return self.institution.id


def get_current_user_context(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> AuthenticatedContext:
    """
    Authenticate request via Bearer JWT token.
    Validates token, checks token revocation, and reloads user and institution
    from the database to immediately enforce deactivations and role modifications.
    """
    if not credentials or not credentials.credentials:
        raise UnauthorizedError("Authentication credentials were not provided.")

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired. Please log in again.")
    except (jwt.InvalidTokenError, Exception):
        raise UnauthorizedError("Invalid authentication token.")

    user_id_str = payload.get("sub")
    jti = payload.get("jti")
    exp = payload.get("exp")

    if not user_id_str or not jti or not exp:
        raise UnauthorizedError("Malformed authentication token claims.")

    try:
        user_id = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise UnauthorizedError("Invalid user token claim.")

    # 1. Check if token is revoked
    if is_token_revoked(db, jti):
        raise UnauthorizedError("Token has been revoked.")

    # 2. Reload user from DB (never trust claims alone)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise UnauthorizedError("User account not found or is inactive.")

    # 3. Reload current user role from DB
    user_roles = (
        db.query(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .filter(UserRole.user_id == user.id)
        .all()
    )
    role_names = [r[0] for r in user_roles]
    claim_role = payload.get("role")
    
    # Verify the claimed role is still assigned to the user
    if claim_role not in role_names:
        if role_names:
            active_role = role_names[0]
        else:
            raise ForbiddenError("No roles assigned to user.")
    else:
        active_role = claim_role

    # 4. Reload institution link from DB
    inst_link = db.query(InstitutionUser).filter(InstitutionUser.user_id == user.id).first()
    institution = None
    if inst_link:
        institution = db.query(Institution).filter(Institution.id == inst_link.institution_id).first()

    return AuthenticatedContext(
        user=user,
        role=active_role,
        institution=institution,
        jti=jti,
        token_exp=exp,
    )


def get_current_institution_user(
    ctx: AuthenticatedContext = Depends(get_current_user_context),
) -> AuthenticatedContext:
    """Enforces that authenticated user belongs to an active institution."""
    if not ctx.institution or ctx.institution.status != "Active":
        raise ForbiddenError("Access restricted to active institution members.")
    return ctx


def require_roles(allowed_roles: List[str]):
    """Role-based authorization dependency factory."""
    def role_checker(ctx: AuthenticatedContext = Depends(get_current_institution_user)) -> AuthenticatedContext:
        if ctx.role not in allowed_roles:
            raise ForbiddenError(
                f"Role '{ctx.role}' does not have permission for this resource. Required: {', '.join(allowed_roles)}."
            )
        return ctx
    return role_checker


def require_official_roles(allowed_roles: List[str]):
    """Role-based authorization dependency for AICTE administration officers (no institution link required)."""
    def role_checker(ctx: AuthenticatedContext = Depends(get_current_user_context)) -> AuthenticatedContext:
        if ctx.role not in allowed_roles:
            raise ForbiddenError(
                f"Role '{ctx.role}' does not have permission for this resource. Required: {', '.join(allowed_roles)}."
            )
        return ctx
    return role_checker

