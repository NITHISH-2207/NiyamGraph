import uuid
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.deficiency import Deficiency, DeficiencyHistory
from app.models.application import Application
from app.models.user import User
from app.core.exceptions import NotFoundError, ValidationError, ForbiddenError
from app.services.workflow_service import transition_application_status
from app.services.audit_service import log_audit
from app.services.notification_service import notify_institution_users, create_notification


def list_deficiencies(
    db: Session,
    institution_id: uuid.UUID,
    application_id: Optional[uuid.UUID] = None,
    status: Optional[str] = None,
) -> List[Deficiency]:
    """List deficiencies scoped strictly to authenticated institution."""
    query = db.query(Deficiency).filter(Deficiency.institution_id == institution_id)

    if application_id:
        query = query.filter(Deficiency.application_id == application_id)
    if status:
        query = query.filter(Deficiency.status == status)

    return query.order_by(Deficiency.created_at.desc()).all()


def get_deficiency(
    db: Session,
    deficiency_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> Deficiency:
    """Retrieve single deficiency, enforcing institution ownership."""
    defic = (
        db.query(Deficiency)
        .filter(
            Deficiency.id == deficiency_id,
            Deficiency.institution_id == institution_id,
        )
        .first()
    )
    if not defic:
        raise NotFoundError("Deficiency not found.")
    return defic


def get_deficiency_history(
    db: Session,
    deficiency_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> List[DeficiencyHistory]:
    """Retrieve history for a deficiency."""
    defic = get_deficiency(db, deficiency_id, institution_id)
    return (
        db.query(DeficiencyHistory)
        .filter(DeficiencyHistory.deficiency_id == defic.id)
        .order_by(DeficiencyHistory.created_at.desc())
        .all()
    )


def respond_to_deficiency(
    db: Session,
    deficiency_id: uuid.UUID,
    institution_id: uuid.UUID,
    user: User,
    role: str,
    response_text: str,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Deficiency:
    """
    Submit institutional response to an open deficiency.
    Validates deadline, updates status, writes history,
    and transitions application from 'Deficiency Raised' to 'Resubmitted'.
    """
    defic = get_deficiency(db, deficiency_id, institution_id)

    if defic.status != "Open":
        raise ValidationError(f"Cannot respond to deficiency in '{defic.status}' status. Must be 'Open'.")

    now = datetime.now(timezone.utc)

    # Validate response deadline
    if defic.response_deadline and now > defic.response_deadline:
        defic.status = "Overdue"
        db.flush()
        raise ValidationError("Deficiency response deadline has passed. Late responses require an official extension.")

    # Update deficiency
    defic.status = "Responded"
    defic.institution_response_text = response_text
    defic.submitted_at = now
    defic.updated_at = now

    # Append to deficiency history
    history = DeficiencyHistory(
        id=uuid.uuid4(),
        deficiency_id=defic.id,
        action="RESPONDED",
        actor_user_id=user.id,
        remarks=f"Institution responded: {response_text[:100]}...",
        created_at=now,
    )
    db.add(history)
    db.flush()

    # Move application to Resubmitted via centralized workflow service
    app = db.query(Application).filter(Application.id == defic.application_id).first()
    if app and app.status == "Deficiency Raised":
        transition_application_status(
            db=db,
            application=app,
            target_status="Resubmitted",
            actor_user=user,
            actor_role=role,
            remarks=f"Resubmitted following response to deficiency {defic.reference_number}.",
            request_id=request_id,
            ip_address=ip_address,
        )

    log_audit(
        db=db,
        action="DEFICIENCY_RESPONDED",
        entity_type="deficiency",
        entity_id=str(defic.id),
        actor_user_id=user.id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"reference_number": defic.reference_number},
    )

    return defic


# --- Official AICTE Actions (Service Layer Only, Reusable by AICTE Portal) ---

def official_raise_deficiency(
    db: Session,
    application_id: uuid.UUID,
    description: str,
    clause_reference: Optional[str],
    deadline: datetime,
    official_user: User,
    official_role: str,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Deficiency:
    """Official service function to raise a deficiency on an application."""
    if official_role not in ("AICTE Official", "Super Administrator"):
        raise ForbiddenError("Only AICTE Officials may raise deficiencies.")

    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise NotFoundError("Application not found.")

    now = datetime.now(timezone.utc)
    ref_num = f"DEF-{now.year}-{uuid.uuid4().hex[:6].upper()}"

    defic = Deficiency(
        id=uuid.uuid4(),
        reference_number=ref_num,
        institution_id=app.institution_id,
        application_id=app.id,
        description=description,
        clause_reference=clause_reference,
        raised_by_user_id=official_user.id,
        raised_at=now,
        response_deadline=deadline,
        status="Open",
        created_at=now,
        updated_at=now,
    )
    db.add(defic)
    db.flush()

    # History entry
    hist = DeficiencyHistory(
        id=uuid.uuid4(),
        deficiency_id=defic.id,
        action="RAISED",
        actor_user_id=official_user.id,
        remarks=f"Deficiency raised under clause {clause_reference or 'N/A'}",
        created_at=now,
    )
    db.add(hist)
    db.flush()

    # Transition application status if needed
    if app.status in ("Under Scrutiny", "Submitted", "Resubmitted"):
        transition_application_status(
            db=db,
            application=app,
            target_status="Deficiency Raised",
            actor_user=official_user,
            actor_role=official_role,
            remarks=f"Deficiency {ref_num} raised: {description[:100]}",
            request_id=request_id,
            ip_address=ip_address,
        )

    # Notify institution
    notify_institution_users(
        db=db,
        institution_id=app.institution_id,
        title=f"Deficiency Notice Issued: {ref_num}",
        message=f"Deficiency raised on application {app.reference_number}. Response deadline: {deadline.strftime('%Y-%m-%d')}.",
        notification_type="deficiency",
        related_application_id=app.id,
    )

    return defic

