import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.deficiency import (
    DeficiencyResponseRequest,
    DeficiencyResponse,
    DeficiencyHistoryResponse,
)
from app.api.deps import (
    get_request_id,
    get_client_ip,
    get_current_institution_user,
    AuthenticatedContext,
)
from app.services.deficiency_service import (
    list_deficiencies,
    get_deficiency,
    get_deficiency_history,
    respond_to_deficiency,
)

router = APIRouter(prefix="/deficiencies", tags=["Deficiencies"])


@router.get(
    "",
    response_model=List[DeficiencyResponse],
    summary="List Institution Deficiencies",
    description="List deficiencies raised against the authenticated institution's applications.",
)
def get_deficiencies(
    application_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return list_deficiencies(
        db=db,
        institution_id=ctx.institution_id,
        application_id=application_id,
        status=status,
    )


@router.get(
    "/{id}",
    response_model=DeficiencyResponse,
    summary="Get Deficiency Details",
    description="Retrieve details of a deficiency. Enforces institution ownership.",
)
def get_deficiency_by_id(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return get_deficiency(db=db, deficiency_id=id, institution_id=ctx.institution_id)


@router.post(
    "/{id}/respond",
    response_model=DeficiencyResponse,
    summary="Respond to Deficiency",
    description="Submit institutional response to an open deficiency. Moves application to Resubmitted.",
)
def respond_deficiency(
    id: uuid.UUID,
    payload: DeficiencyResponseRequest,
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    return respond_to_deficiency(
        db=db,
        deficiency_id=id,
        institution_id=ctx.institution_id,
        user=ctx.user,
        role=ctx.role,
        response_text=payload.response_text,
        ip_address=ip_addr,
        request_id=req_id,
    )


@router.get(
    "/{id}/history",
    response_model=List[DeficiencyHistoryResponse],
    summary="Get Deficiency History",
    description="Retrieve the chronological action history for a deficiency.",
)
def get_defic_history(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return get_deficiency_history(
        db=db,
        deficiency_id=id,
        institution_id=ctx.institution_id,
    )

