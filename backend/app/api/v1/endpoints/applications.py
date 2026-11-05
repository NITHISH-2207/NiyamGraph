import uuid
import math
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.application import (
    ApplicationCreateRequest,
    ApplicationUpdateRequest,
    ApplicationResponse,
    ApplicationStatusHistoryResponse,
    PaginatedApplicationsResponse,
    ApplicationAcademicDetailCreate,
    ApplicationAcademicDetailResponse,
)
from app.api.deps import (
    get_request_id,
    get_client_ip,
    get_current_institution_user,
    AuthenticatedContext,
    require_roles,
)
from app.services.application_service import (
    create_application_draft,
    get_application,
    list_applications,
    update_application_draft,
    submit_application,
    add_academic_detail,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get(
    "",
    response_model=PaginatedApplicationsResponse,
    summary="List Institution Applications",
    description="Retrieve paginated applications for the authenticated institution with optional filters.",
)
def get_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    academic_year: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    application_type_id: Optional[uuid.UUID] = Query(None),
    search: Optional[str] = Query(None),
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    items, total = list_applications(
        db=db,
        institution_id=ctx.institution_id,
        page=page,
        limit=limit,
        academic_year=academic_year,
        status=status,
        application_type_id=application_type_id,
        search=search,
    )
    pages = math.ceil(total / limit) if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }


@router.post(
    "",
    response_model=ApplicationResponse,
    summary="Create Application Draft",
    description="Initiate a new regulatory application in Draft status.",
)
def create_draft(
    payload: ApplicationCreateRequest,
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    return create_application_draft(
        db=db,
        institution_id=ctx.institution_id,
        user_id=ctx.user.id,
        data=payload,
        ip_address=ip_addr,
        request_id=req_id,
    )


@router.get(
    "/{id}",
    response_model=ApplicationResponse,
    summary="Get Application by ID",
    description="Retrieve application details. Cross-institution access returns 404.",
)
def get_application_by_id(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return get_application(db=db, application_id=id, institution_id=ctx.institution_id)


@router.put(
    "/{id}",
    response_model=ApplicationResponse,
    summary="Update Application Draft",
    description="Update application fields. Modification allowed only while application is in 'Draft' status.",
)
def update_draft(
    id: uuid.UUID,
    payload: ApplicationUpdateRequest,
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    return update_application_draft(
        db=db,
        application_id=id,
        institution_id=ctx.institution_id,
        data=payload,
        user_id=ctx.user.id,
        ip_address=ip_addr,
        request_id=req_id,
    )


@router.post(
    "/{id}/submit",
    response_model=ApplicationResponse,
    summary="Submit Application",
    description="Submit draft application for regulatory scrutiny. Validates required fields and documents. Allowed for Institution Admin and Staff.",
)
def submit_app(
    id: uuid.UUID,
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    return submit_application(
        db=db,
        application_id=id,
        institution_id=ctx.institution_id,
        user=ctx.user,
        role=ctx.role,
        ip_address=ip_addr,
        request_id=req_id,
    )


@router.get(
    "/{id}/history",
    response_model=List[ApplicationStatusHistoryResponse],
    summary="Get Application Status History",
    description="Retrieve the complete status transition history for an application.",
)
def get_history(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    app = get_application(db=db, application_id=id, institution_id=ctx.institution_id)
    return app.status_history


@router.post(
    "/{id}/academic-details",
    response_model=ApplicationAcademicDetailResponse,
    summary="Add Academic Detail to Draft Application",
    description="Add course, intake and accreditation details to an application draft.",
)
def add_academic(
    id: uuid.UUID,
    payload: ApplicationAcademicDetailCreate,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return add_academic_detail(
        db=db,
        application_id=id,
        institution_id=ctx.institution_id,
        data=payload,
    )

