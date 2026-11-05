import uuid
from typing import Optional, Set, Dict, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.application import Application, ApplicationStatusHistory
from app.models.user import User
from app.core.exceptions import ValidationError, ForbiddenError
from app.services.audit_service import log_audit
from app.services.notification_service import notify_institution_users

# Transition Table: (From Status, To Status) -> Allowed Roles
TRANSITION_RULES: Dict[Tuple[str, str], Set[str]] = {
    # Institution users can only trigger:
    ("Draft", "Submitted"): {"Institution Admin", "Institution Staff"},
    ("Deficiency Raised", "Resubmitted"): {"Institution Admin", "Institution Staff"},

    # AICTE Officials / Administrators trigger regulatory transitions:
    ("Submitted", "Under Scrutiny"): {"AICTE Official", "Super Administrator"},
    ("Under Scrutiny", "Deficiency Raised"): {"AICTE Official", "Super Administrator"},
    ("Resubmitted", "Under Scrutiny"): {"AICTE Official", "Super Administrator"},
    ("Under Scrutiny", "Under Evaluation"): {"AICTE Official", "Super Administrator"},
    ("Under Evaluation", "Decision Pending"): {"AICTE Official", "Super Administrator"},
    ("Decision Pending", "Approved"): {"AICTE Official", "Super Administrator"},
    ("Decision Pending", "Rejected"): {"AICTE Official", "Super Administrator"},
    
    # Administrative closures:
    ("Draft", "Closed"): {"Super Administrator"},
    ("Submitted", "Closed"): {"Super Administrator"},
    ("Under Scrutiny", "Closed"): {"Super Administrator"},
    ("Deficiency Raised", "Closed"): {"Super Administrator"},
    ("Resubmitted", "Closed"): {"Super Administrator"},
    ("Under Evaluation", "Closed"): {"Super Administrator"},
    ("Decision Pending", "Closed"): {"Super Administrator"},
    ("Approved", "Closed"): {"Super Administrator"},
    ("Rejected", "Closed"): {"Super Administrator"},
}

STAGE_MAPPING: Dict[str, str] = {
    "Draft": "Draft Preparation",
    "Submitted": "Regional Scrutiny",
    "Under Scrutiny": "Regional Scrutiny",
    "Deficiency Raised": "Deficiency Resolution",
    "Resubmitted": "Deficiency Re-Scrutiny",
    "Under Evaluation": "Technical Committee Evaluation",
    "Decision Pending": "Executive Committee Review",
    "Approved": "Sanctioned & Issued",
    "Rejected": "Rejected",
    "Closed": "Archived",
}


def transition_application_status(
    db: Session,
    application: Application,
    target_status: str,
    actor_user: User,
    actor_role: str,
    remarks: Optional[str] = None,
    request_id: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Application:
    """
    Centralized state transition function for Application lifecycle.
    Enforces authorization, transition legality, writes status history,
    dispatches notifications and logs audit trail.
    """
    from_status = application.status
    transition_key = (from_status, target_status)

    if transition_key not in TRANSITION_RULES:
        raise ValidationError(
            f"Illegal status transition from '{from_status}' to '{target_status}'."
        )

    allowed_roles = TRANSITION_RULES[transition_key]
    if actor_role not in allowed_roles:
        raise ForbiddenError(
            f"Role '{actor_role}' is not authorized to transition application from '{from_status}' to '{target_status}'."
        )

    now = datetime.now(timezone.utc)

    # Update application status and stage
    application.status = target_status
    application.current_stage = STAGE_MAPPING.get(target_status, target_status)
    application.updated_at = now

    if target_status == "Submitted" and not application.submitted_at:
        application.submitted_at = now
    elif target_status in ("Approved", "Rejected"):
        application.decision_at = now
        application.decision_remarks = remarks

    # Record history row (append-only)
    history_entry = ApplicationStatusHistory(
        id=uuid.uuid4(),
        application_id=application.id,
        from_status=from_status,
        to_status=target_status,
        changed_by_user_id=actor_user.id,
        remarks=remarks,
        created_at=now,
    )
    db.add(history_entry)
    db.flush()

    # Log audit event
    log_audit(
        db=db,
        action="APPLICATION_STATUS_TRANSITION",
        entity_type="application",
        entity_id=str(application.id),
        actor_user_id=actor_user.id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={
            "reference_number": application.reference_number,
            "from_status": from_status,
            "to_status": target_status,
            "actor_role": actor_role,
            "remarks": remarks,
        },
    )

    # Dispatch notification to institution users
    notify_institution_users(
        db=db,
        institution_id=application.institution_id,
        title=f"Application {application.reference_number} Status Update",
        message=f"Application {application.reference_number} transitioned from '{from_status}' to '{target_status}'.",
        notification_type="application",
        related_application_id=application.id,
    )

    return application

