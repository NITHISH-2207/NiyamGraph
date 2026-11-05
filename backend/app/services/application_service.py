import uuid
import random
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.application import (
    Application,
    ApplicationType,
    ApplicationAcademicDetail,
    ApplicationSubmission,
)
from app.models.document import Document
from app.models.user import User
from app.schemas.application import (
    ApplicationCreateRequest,
    ApplicationUpdateRequest,
    ApplicationAcademicDetailCreate,
)
from app.core.exceptions import NotFoundError, ValidationError, ForbiddenError
from app.services.workflow_service import transition_application_status
from app.services.audit_service import log_audit


def generate_reference_number(db: Session, academic_year: str = "2026-27") -> str:
    """
    Generate unique, concurrency-safe application reference number.
    Format: NG-2026-AP-XXXX
    """
    year_prefix = academic_year.split("-")[0] if "-" in academic_year else academic_year
    for _ in range(10):
        rand_num = random.randint(1000, 9999)
        ref = f"NG-{year_prefix}-AP-{rand_num}"
        existing = db.query(Application.id).filter(Application.reference_number == ref).first()
        if not existing:
            return ref
    # Fallback to UUID segment
    return f"NG-{year_prefix}-AP-{uuid.uuid4().hex[:6].upper()}"


def create_application_draft(
    db: Session,
    institution_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ApplicationCreateRequest,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Application:
    """Create a new application in Draft status."""
    app_type = db.query(ApplicationType).filter(ApplicationType.id == data.application_type_id).first()
    if not app_type or not app_type.is_active:
        raise ValidationError("Invalid or inactive application type.")

    ref_number = generate_reference_number(db, data.academic_year)
    now = datetime.now(timezone.utc)

    application = Application(
        id=uuid.uuid4(),
        reference_number=ref_number,
        institution_id=institution_id,
        application_type_id=app_type.id,
        academic_year=data.academic_year,
        status="Draft",
        current_stage="Draft Preparation",
        created_by_user_id=user_id,
        application_data=data.application_data,
        created_at=now,
        updated_at=now,
    )
    db.add(application)
    db.flush()

    log_audit(
        db=db,
        action="APPLICATION_DRAFT_CREATED",
        entity_type="application",
        entity_id=str(application.id),
        actor_user_id=user_id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"reference_number": ref_number, "type": app_type.name},
    )

    return application


def get_application(
    db: Session,
    application_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> Application:
    """
    Retrieve application enforcing institution ownership.
    Returns 404 on mismatch to prevent ID enumeration.
    """
    app = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.institution_id == institution_id,
        )
        .first()
    )
    if not app:
        raise NotFoundError("Application not found.")
    return app


def list_applications(
    db: Session,
    institution_id: uuid.UUID,
    page: int = 1,
    limit: int = 10,
    academic_year: Optional[str] = None,
    status: Optional[str] = None,
    application_type_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
) -> Tuple[List[Application], int]:
    """List applications strictly scoped to authenticated institution."""
    query = db.query(Application).filter(Application.institution_id == institution_id)

    if academic_year:
        query = query.filter(Application.academic_year == academic_year)
    if status:
        query = query.filter(Application.status == status)
    if application_type_id:
        query = query.filter(Application.application_type_id == application_type_id)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(Application.reference_number.ilike(pattern))

    total = query.count()
    offset = (page - 1) * limit
    items = query.order_by(Application.created_at.desc()).offset(offset).limit(limit).all()

    return items, total


def update_application_draft(
    db: Session,
    application_id: uuid.UUID,
    institution_id: uuid.UUID,
    data: ApplicationUpdateRequest,
    user_id: uuid.UUID,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Application:
    """Update application draft fields. Block updates if not in Draft status."""
    app = get_application(db, application_id, institution_id)

    if app.status != "Draft":
        raise ValidationError(
            f"Application cannot be modified while in '{app.status}' status. Only 'Draft' applications may be edited."
        )

    # Merge or update application data
    app.application_data = {**app.application_data, **data.application_data}
    app.updated_at = datetime.now(timezone.utc)
    db.flush()

    log_audit(
        db=db,
        action="APPLICATION_DRAFT_UPDATED",
        entity_type="application",
        entity_id=str(app.id),
        actor_user_id=user_id,
        ip_address=ip_address,
        request_id=request_id,
    )

    return app


def submit_application(
    db: Session,
    application_id: uuid.UUID,
    institution_id: uuid.UUID,
    user: User,
    role: str,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Application:
    """
    Submit draft application.
    Validates required fields and required documents config before submitting.
    Transitions status to 'Submitted'.
    """
    app = get_application(db, application_id, institution_id)

    if app.status != "Draft":
        raise ValidationError(f"Cannot submit application with status '{app.status}'. Must be in 'Draft'.")

    app_type = app.application_type
    if not app_type:
        app_type = db.query(ApplicationType).filter(ApplicationType.id == app.application_type_id).first()

    # 1. Validate required fields
    required_fields = app_type.required_fields_json or []
    missing_fields = [f for f in required_fields if f not in app.application_data or not app.application_data[f]]
    if missing_fields:
        raise ValidationError(
            f"Missing required fields for application submission: {', '.join(missing_fields)}"
        )

    # 2. Validate required documents
    required_docs = app_type.required_documents_json or []
    if required_docs:
        uploaded_doc_types = (
            db.query(Document.document_type)
            .filter(
                Document.institution_id == institution_id,
                Document.entity_type == "application",
                Document.entity_id == app.id,
                Document.is_deleted.is_(False),
            )
            .all()
        )
        uploaded_types_set = {t[0] for t in uploaded_doc_types}
        missing_docs = [dt for dt in required_docs if dt not in uploaded_types_set]
        if missing_docs:
            raise ValidationError(
                f"Missing required documents for submission: {', '.join(missing_docs)}"
            )

    # 3. Create submission snapshot
    submission_count = db.query(ApplicationSubmission).filter(ApplicationSubmission.application_id == app.id).count()
    submission_snapshot = ApplicationSubmission(
        id=uuid.uuid4(),
        application_id=app.id,
        submission_number=submission_count + 1,
        submitted_by_user_id=user.id,
        submitted_at=datetime.now(timezone.utc),
        snapshot_json={
            "reference_number": app.reference_number,
            "application_data": app.application_data,
            "academic_details": [
                {
                    "program_name": ad.program_name,
                    "course_name": ad.course_name,
                    "intake_approved": ad.intake_approved,
                    "intake_applied": ad.intake_applied,
                }
                for ad in app.academic_details
            ],
        },
    )
    db.add(submission_snapshot)

    # 4. Perform state transition via workflow service
    app = transition_application_status(
        db=db,
        application=app,
        target_status="Submitted",
        actor_user=user,
        actor_role=role,
        remarks="Application submitted by institution.",
        request_id=request_id,
        ip_address=ip_address,
    )

    return app


def add_academic_detail(
    db: Session,
    application_id: uuid.UUID,
    institution_id: uuid.UUID,
    data: ApplicationAcademicDetailCreate,
) -> ApplicationAcademicDetail:
    """Add academic detail to draft application."""
    app = get_application(db, application_id, institution_id)
    if app.status != "Draft":
        raise ValidationError("Cannot modify academic details of a non-draft application.")

    now = datetime.now(timezone.utc)
    detail = ApplicationAcademicDetail(
        id=uuid.uuid4(),
        application_id=app.id,
        program_name=data.program_name,
        course_name=data.course_name,
        intake_approved=data.intake_approved,
        intake_applied=data.intake_applied,
        nba_accreditation_status=data.nba_accreditation_status,
        faculty_count=data.faculty_count,
        details_json=data.details_json,
        created_at=now,
        updated_at=now,
    )
    db.add(detail)
    db.flush()
    return detail

