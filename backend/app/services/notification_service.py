import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.notification import Notification
from app.models.user import InstitutionUser
from app.core.exceptions import NotFoundError, ForbiddenError


def create_notification(
    db: Session,
    user_id: uuid.UUID,
    title: str,
    message: str,
    notification_type: str = "system",
    related_application_id: Optional[uuid.UUID] = None,
    institution_id: Optional[uuid.UUID] = None,
) -> Notification:
    """Create a single user notification."""
    notif = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        institution_id=institution_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_application_id=related_application_id,
        is_read=False,
    )
    db.add(notif)
    db.flush()
    return notif


def notify_institution_users(
    db: Session,
    institution_id: uuid.UUID,
    title: str,
    message: str,
    notification_type: str = "system",
    related_application_id: Optional[uuid.UUID] = None,
) -> List[Notification]:
    """Broadcast notification to all active users belonging to an institution."""
    links = db.query(InstitutionUser).filter(InstitutionUser.institution_id == institution_id).all()
    created = []
    for link in links:
        n = create_notification(
            db=db,
            user_id=link.user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            related_application_id=related_application_id,
            institution_id=institution_id,
        )
        created.append(n)
    return created


def get_user_notifications(
    db: Session,
    user_id: uuid.UUID,
    limit: int = 50,
) -> List[Notification]:
    """Retrieve notifications strictly for the authenticated recipient."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def get_unread_count(db: Session, user_id: uuid.UUID) -> int:
    """Get count of unread notifications for a user."""
    return (
        db.query(func.count(Notification.id))
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .scalar()
        or 0
    )


def mark_as_read(db: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> Notification:
    """Mark a notification as read if owned by the user."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise NotFoundError("Notification not found.")
    if notif.user_id != user_id:
        raise ForbiddenError("Cannot access another user's notifications.")
    
    if not notif.is_read:
        notif.is_read = True
        notif.read_at = datetime.now(timezone.utc)
        db.flush()
    return notif


def mark_all_read(db: Session, user_id: uuid.UUID) -> int:
    """Mark all unread notifications as read for a user."""
    now = datetime.now(timezone.utc)
    updated = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .update(
            {"is_read": True, "read_at": now},
            synchronize_session="fetch",
        )
    )
    db.flush()
    return updated

