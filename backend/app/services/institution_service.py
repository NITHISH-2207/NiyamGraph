import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.institution import Institution
from app.models.document import Document
from app.schemas.institution import InstitutionProfileUpdate
from app.core.exceptions import NotFoundError, ForbiddenError
from app.services.audit_service import log_audit


def get_institution_by_id(db: Session, institution_id: uuid.UUID) -> Institution:
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise NotFoundError("Institution not found.")
    return inst


def update_institution_profile(
    db: Session,
    institution_id: uuid.UUID,
    data: InstitutionProfileUpdate,
    actor_user_id: uuid.UUID,
    actor_role: str,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Institution:
    """
    Update permitted profile fields only.
    Protected fields (identifier, official_name, status, verification_status, regional_office)
    cannot be altered by institution users.
    Only Institution Admin can update profile.
    """
    if actor_role != "Institution Admin":
        raise ForbiddenError("Only Institution Admin can modify the institution profile.")

    inst = get_institution_by_id(db, institution_id)

    update_dict = data.model_dump(exclude_unset=True)
    changed_fields = {}

    for field, val in update_dict.items():
        if val is not None and getattr(inst, field) != val:
            changed_fields[field] = {"old": getattr(inst, field), "new": val}
            setattr(inst, field, val)

    if changed_fields:
        inst.updated_at = datetime.now(timezone.utc)
        db.flush()

        log_audit(
            db=db,
            action="INSTITUTION_PROFILE_UPDATED",
            entity_type="institution",
            entity_id=str(inst.id),
            actor_user_id=actor_user_id,
            ip_address=ip_address,
            request_id=request_id,
            metadata={"changes": list(changed_fields.keys())},
        )

    return inst


def get_institution_profile_documents(
    db: Session,
    institution_id: uuid.UUID,
) -> List[Document]:
    """Return institution-level profile documents."""
    return (
        db.query(Document)
        .filter(
            Document.institution_id == institution_id,
            Document.entity_type == "institution_profile",
            Document.is_deleted.is_(False),
        )
        .order_by(Document.created_at.desc())
        .all()
    )

