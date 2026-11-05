import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.compliance import (
    ComplianceRequirement,
    InstitutionUndertaking,
    ComplianceSubmission,
    ComplianceVerificationHistory,
)
from app.models.user import User
from app.core.exceptions import NotFoundError, ValidationError, ForbiddenError
from app.services.audit_service import log_audit
from app.services.notification_service import notify_institution_users


def list_compliance_requirements(
    db: Session,
    academic_year: str = "2026-27",
) -> List[ComplianceRequirement]:
    """List regulatory compliance requirements for the academic year."""
    return (
        db.query(ComplianceRequirement)
        .filter(ComplianceRequirement.applicable_academic_year == academic_year)
        .order_by(ComplianceRequirement.created_at.asc())
        .all()
    )


def list_institution_compliance_submissions(
    db: Session,
    institution_id: uuid.UUID,
) -> List[ComplianceSubmission]:
    """List compliance submissions for an institution."""
    return (
        db.query(ComplianceSubmission)
        .filter(ComplianceSubmission.institution_id == institution_id)
        .order_by(ComplianceSubmission.created_at.desc())
        .all()
    )


def get_compliance_submission(
    db: Session,
    submission_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> ComplianceSubmission:
    """Retrieve compliance submission enforcing institution ownership."""
    sub = (
        db.query(ComplianceSubmission)
        .filter(
            ComplianceSubmission.id == submission_id,
            ComplianceSubmission.institution_id == institution_id,
        )
        .first()
    )
    if not sub:
        raise NotFoundError("Compliance submission not found.")
    return sub


def get_compliance_submission_history(
    db: Session,
    submission_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> List[ComplianceVerificationHistory]:
    """Retrieve verification history for a compliance submission."""
    sub = get_compliance_submission(db, submission_id, institution_id)
    return (
        db.query(ComplianceVerificationHistory)
        .filter(ComplianceVerificationHistory.submission_id == sub.id)
        .order_by(ComplianceVerificationHistory.created_at.desc())
        .all()
    )


def submit_compliance(
    db: Session,
    institution_id: uuid.UUID,
    requirement_id: uuid.UUID,
    user: User,
    notes: Optional[str] = None,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> ComplianceSubmission:
    """
    Submit compliance record for a requirement.
    Institutions CANNOT set verification status (always 'Submitted').
    """
    req = db.query(ComplianceRequirement).filter(ComplianceRequirement.id == requirement_id).first()
    if not req:
        raise NotFoundError("Compliance requirement not found.")

    now = datetime.now(timezone.utc)

    # Check for existing submission
    sub = (
        db.query(ComplianceSubmission)
        .filter(
            ComplianceSubmission.institution_id == institution_id,
            ComplianceSubmission.requirement_id == requirement_id,
        )
        .first()
    )

    if not sub:
        sub = ComplianceSubmission(
            id=uuid.uuid4(),
            institution_id=institution_id,
            requirement_id=requirement_id,
            status="Submitted",
            notes=notes,
            submitted_by_user_id=user.id,
            submitted_at=now,
            created_at=now,
            updated_at=now,
        )
        db.add(sub)
    else:
        if sub.status == "Verified":
            raise ValidationError("Compliance requirement has already been verified and locked.")
        sub.status = "Submitted"
        sub.notes = notes
        sub.submitted_by_user_id = user.id
        sub.submitted_at = now
        sub.updated_at = now

    db.flush()

    log_audit(
        db=db,
        action="COMPLIANCE_SUBMITTED",
        entity_type="compliance",
        entity_id=str(sub.id),
        actor_user_id=user.id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"requirement_code": req.code},
    )

    return sub


def record_institution_undertaking(
    db: Session,
    institution_id: uuid.UUID,
    requirement_id: uuid.UUID,
    user: User,
    accepted: bool,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> InstitutionUndertaking:
    """Record statutory undertaking agreement by authorized institution user."""
    req = db.query(ComplianceRequirement).filter(ComplianceRequirement.id == requirement_id).first()
    if not req:
        raise NotFoundError("Compliance requirement not found.")

    if not accepted:
        raise ValidationError("Undertaking must be explicitly accepted.")

    now = datetime.now(timezone.utc)
    undertaking = (
        db.query(InstitutionUndertaking)
        .filter(
            InstitutionUndertaking.institution_id == institution_id,
            InstitutionUndertaking.requirement_id == requirement_id,
        )
        .first()
    )

    if not undertaking:
        undertaking = InstitutionUndertaking(
            id=uuid.uuid4(),
            institution_id=institution_id,
            requirement_id=requirement_id,
            accepted=True,
            accepted_by_user_id=user.id,
            accepted_at=now,
        )
        db.add(undertaking)
    else:
        undertaking.accepted = True
        undertaking.accepted_by_user_id = user.id
        undertaking.accepted_at = now

    db.flush()

    log_audit(
        db=db,
        action="UNDERTAKING_ACCEPTED",
        entity_type="compliance_undertaking",
        entity_id=str(undertaking.id),
        actor_user_id=user.id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"requirement_code": req.code},
    )

    return undertaking


# --- Official AICTE Actions (Service Layer Only) ---

def official_verify_compliance_submission(
    db: Session,
    submission_id: uuid.UUID,
    official_user: User,
    official_role: str,
    verified: bool,
    remarks: Optional[str] = None,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> ComplianceSubmission:
    """Official service function to verify or reject a compliance submission."""
    if official_role not in ("AICTE Official", "Super Administrator"):
        raise ForbiddenError("Only AICTE Officials may verify compliance submissions.")

    sub = db.query(ComplianceSubmission).filter(ComplianceSubmission.id == submission_id).first()
    if not sub:
        raise NotFoundError("Compliance submission not found.")

    now = datetime.now(timezone.utc)
    old_status = sub.status
    new_status = "Verified" if verified else "Rejected"

    sub.status = new_status
    sub.verified_by_user_id = official_user.id
    sub.verified_at = now
    sub.verification_remarks = remarks
    sub.updated_at = now

    # Write verification history
    history = ComplianceVerificationHistory(
        id=uuid.uuid4(),
        submission_id=sub.id,
        status_from=old_status,
        status_to=new_status,
        verified_by_user_id=official_user.id,
        remarks=remarks,
        created_at=now,
    )
    db.add(history)
    db.flush()

    notify_institution_users(
        db=db,
        institution_id=sub.institution_id,
        title=f"Compliance Submission {new_status}",
        message=f"Compliance submission for requirement {sub.requirement.title if sub.requirement else ''} was {new_status.lower()}.",
        notification_type="compliance",
    )

    log_audit(
        db=db,
        action=f"COMPLIANCE_{new_status.upper()}",
        entity_type="compliance",
        entity_id=str(sub.id),
        actor_user_id=official_user.id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"from_status": old_status, "to_status": new_status, "remarks": remarks},
    )

    return sub

