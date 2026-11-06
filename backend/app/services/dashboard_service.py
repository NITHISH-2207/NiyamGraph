import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.application import Application
from app.models.compliance import ComplianceSubmission, ComplianceRequirement
from app.models.notification import Notification


STATUS_BUCKET_MAP: Dict[str, str] = {
    "Approved": "Approved",
    "Submitted": "Under Review",
    "Under Scrutiny": "Under Review",
    "Resubmitted": "Under Review",
    "Under Evaluation": "Under Review",
    "Decision Pending": "Under Review",
    "Deficiency Raised": "Requiring Action",
    "Draft": "Draft",
    "Rejected": "Rejected",
    "Closed": "Closed",
}


def get_status_bucket(status: str) -> str:
    """Map application status string to its single canonical bucket."""
    return STATUS_BUCKET_MAP.get(status, "Other")


def get_institution_dashboard_summary(
    db: Session,
    institution_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Dict[str, int]:
    """
    Computes dashboard metric cards using real SQL aggregate queries,
    scoped strictly to the authenticated institution and user.
    No hardcoded counts.
    """
    # 1. Application counts by status
    app_status_counts = (
        db.query(Application.status, func.count(Application.id))
        .filter(Application.institution_id == institution_id)
        .group_by(Application.status)
        .all()
    )
    status_map = {status: count for status, count in app_status_counts}

    total_apps = sum(status_map.values())
    draft_apps = status_map.get("Draft", 0)
    submitted_apps = status_map.get("Submitted", 0) + status_map.get("Resubmitted", 0)
    under_scrutiny_apps = (
        status_map.get("Under Scrutiny", 0)
        + status_map.get("Under Evaluation", 0)
        + status_map.get("Decision Pending", 0)
    )
    with_deficiencies_apps = status_map.get("Deficiency Raised", 0)
    approved_apps = status_map.get("Approved", 0)
    rejected_apps = status_map.get("Rejected", 0)

    # 2. Compliance status counts
    total_requirements = (
        db.query(func.count(ComplianceRequirement.id))
        .filter(ComplianceRequirement.applicable_academic_year == "2026-27")
        .scalar()
        or 0
    )

    verified_compliance = (
        db.query(func.count(ComplianceSubmission.id))
        .filter(
            ComplianceSubmission.institution_id == institution_id,
            ComplianceSubmission.status == "Verified",
        )
        .scalar()
        or 0
    )

    pending_compliance = max(0, total_requirements - verified_compliance)

    # 3. Unread notifications count for current user
    unread_notifications = (
        db.query(func.count(Notification.id))
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .scalar()
        or 0
    )

    return {
        "total_applications": total_apps,
        "draft_applications": draft_apps,
        "submitted_applications": submitted_apps,
        "under_scrutiny_applications": under_scrutiny_apps,
        "with_deficiencies_applications": with_deficiencies_apps,
        "approved_applications": approved_apps,
        "rejected_applications": rejected_apps,
        "pending_compliance": pending_compliance,
        "verified_compliance": verified_compliance,
        "unread_notifications": unread_notifications,
    }

