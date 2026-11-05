import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.compliance import (
    ComplianceRequirementResponse,
    InstitutionUndertakingRequest,
    ComplianceSubmissionRequest,
    ComplianceSubmissionResponse,
    ComplianceVerificationHistoryResponse,
)
from app.api.deps import (
    get_request_id,
    get_client_ip,
    get_current_institution_user,
    AuthenticatedContext,
)
from app.services.compliance_service import (
    list_compliance_requirements,
    list_institution_compliance_submissions,
    get_compliance_submission,
    get_compliance_submission_history,
    submit_compliance,
    record_institution_undertaking,
)

router = APIRouter(prefix="/compliance", tags=["Compliance"])


@router.get(
    "",
    response_model=List[ComplianceSubmissionResponse],
    summary="List Institution Compliance Submissions",
    description="Retrieve all compliance filings for the authenticated institution.",
)
def get_compliance_submissions(
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return list_institution_compliance_submissions(
        db=db,
        institution_id=ctx.institution_id,
    )


@router.get(
    "/requirements",
    response_model=List[ComplianceRequirementResponse],
    summary="List Regulatory Compliance Requirements",
    description="List all statutory compliance obligations for the active academic cycle.",
)
def get_requirements(
    academic_year: str = Query("2026-27"),
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return list_compliance_requirements(
        db=db,
        academic_year=academic_year,
    )


@router.post(
    "/submissions",
    response_model=ComplianceSubmissionResponse,
    summary="Submit Compliance Filing",
    description="Submit a compliance record. Institutions cannot set verification status directly.",
)
def submit_comp(
    payload: ComplianceSubmissionRequest,
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    return submit_compliance(
        db=db,
        institution_id=ctx.institution_id,
        requirement_id=payload.requirement_id,
        user=ctx.user,
        notes=payload.notes,
        ip_address=ip_addr,
        request_id=req_id,
    )


@router.get(
    "/submissions/{id}",
    response_model=ComplianceSubmissionResponse,
    summary="Get Compliance Submission Details",
    description="Retrieve single compliance submission. Enforces institution ownership.",
)
def get_submission_by_id(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return get_compliance_submission(
        db=db,
        submission_id=id,
        institution_id=ctx.institution_id,
    )


@router.get(
    "/submissions/{id}/history",
    response_model=List[ComplianceVerificationHistoryResponse],
    summary="Get Compliance Verification History",
    description="Retrieve verification history for a compliance submission.",
)
def get_comp_history(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return get_compliance_submission_history(
        db=db,
        submission_id=id,
        institution_id=ctx.institution_id,
    )


@router.post(
    "/undertaking",
    summary="Accept Statutory Undertaking",
    description="Sign and record institutional undertaking for a compliance requirement.",
)
def accept_undertaking(
    payload: InstitutionUndertakingRequest,
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    record_institution_undertaking(
        db=db,
        institution_id=ctx.institution_id,
        requirement_id=payload.requirement_id,
        user=ctx.user,
        accepted=payload.accepted,
        ip_address=ip_addr,
        request_id=req_id,
    )
    return {"message": "Statutory undertaking recorded successfully."}

