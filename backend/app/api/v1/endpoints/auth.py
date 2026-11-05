from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import InstitutionLoginRequest, TokenResponse, UserResponse
from app.api.deps import (
    get_request_id,
    get_client_ip,
    get_current_user_context,
    AuthenticatedContext,
)
from app.services.auth_service import authenticate_institution_user, revoke_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/institution/login",
    response_model=TokenResponse,
    summary="Institution User Login",
    description="Authenticate an institutional user via AICTE Permanent ID (PID) / registry identifier, email, and password.",
)
def login_institution(
    payload: InstitutionLoginRequest,
    request: Request,
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    result = authenticate_institution_user(
        db=db,
        institution_identifier=payload.institution_id,
        email=payload.email,
        password=payload.password,
        ip_address=ip_addr,
        request_id=req_id,
    )
    return result


@router.get(
    "/me",
    summary="Get Current User Profile",
    description="Retrieve the profile of the currently authenticated user.",
)
def get_me(
    ctx: AuthenticatedContext = Depends(get_current_user_context),
):
    return {
        "user": ctx.user,
        "role": ctx.role,
        "institution": ctx.institution,
    }


@router.post(
    "/logout",
    summary="Logout User",
    description="Revoke the current JWT access token.",
)
def logout_user(
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_user_context),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    revoke_token(
        db=db,
        jti=ctx.jti,
        exp_timestamp=ctx.token_exp,
        user_id=ctx.user.id,
        ip_address=ip_addr,
        request_id=req_id,
    )
    return {"message": "Successfully logged out."}

