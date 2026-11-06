from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.institution import InstitutionProfileUpdate, InstitutionResponse
from app.schemas.document import DocumentResponse
from app.api.deps import (
    get_request_id,
    get_client_ip,
    get_current_institution_user,
    AuthenticatedContext,
)
from app.services.institution_service import (
    update_institution_profile,
    get_institution_profile_documents,
)

router = APIRouter(prefix="/institutions", tags=["Institutions"])


@router.get(
    "/me",
    response_model=InstitutionResponse,
    summary="Get Authenticated Institution Profile",
    description="Retrieve the profile of the institution to which the user belongs.",
)
def get_my_institution(
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
):
    return ctx.institution


@router.put(
    "/me",
    response_model=InstitutionResponse,
    summary="Update Institution Profile",
    description="Update permitted contact and address fields of the institution profile. Allowed for Institution Admin only.",
)
def update_my_institution(
    payload: InstitutionProfileUpdate,
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    return update_institution_profile(
        db=db,
        institution_id=ctx.institution_id,
        data=payload,
        actor_user_id=ctx.user.id,
        actor_role=ctx.role,
        ip_address=ip_addr,
        request_id=req_id,
    )


@router.get(
    "/me/documents",
    response_model=List[DocumentResponse],
    summary="List Institution Profile Documents",
    description="Retrieve documents specifically associated with the institution profile.",
)
def list_my_institution_documents(
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return get_institution_profile_documents(db=db, institution_id=ctx.institution_id)

