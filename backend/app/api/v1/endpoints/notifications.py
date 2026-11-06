import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.api.deps import (
    get_current_user_context,
    AuthenticatedContext,
)
from app.services.notification_service import (
    get_user_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_read,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="List Current User Notifications",
    description="Retrieve notifications specifically belonging to the authenticated user.",
)
def list_notifications(
    ctx: AuthenticatedContext = Depends(get_current_user_context),
    db: Session = Depends(get_db),
):
    return get_user_notifications(db=db, user_id=ctx.user.id)


@router.get(
    "/unread-count",
    response_model=UnreadCountResponse,
    summary="Get Unread Notifications Count",
    description="Retrieve the count of unread notifications for the authenticated user.",
)
def get_unread(
    ctx: AuthenticatedContext = Depends(get_current_user_context),
    db: Session = Depends(get_db),
):
    count = get_unread_count(db=db, user_id=ctx.user.id)
    return {"unread_count": count}


@router.patch(
    "/{id}/read",
    response_model=NotificationResponse,
    summary="Mark Notification as Read",
    description="Mark a specific notification as read. Enforces recipient authorization.",
)
def mark_read(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_user_context),
    db: Session = Depends(get_db),
):
    return mark_as_read(db=db, notification_id=id, user_id=ctx.user.id)


@router.patch(
    "/read-all",
    summary="Mark All Notifications as Read",
    description="Mark all unread notifications as read for the authenticated user.",
)
def mark_all_as_read(
    ctx: AuthenticatedContext = Depends(get_current_user_context),
    db: Session = Depends(get_db),
):
    count = mark_all_read(db=db, user_id=ctx.user.id)
    return {"message": f"Marked {count} notifications as read."}

