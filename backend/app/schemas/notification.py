from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    message: str
    notification_type: str
    related_application_id: Optional[UUID] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None


class UnreadCountResponse(BaseModel):
    unread_count: int

