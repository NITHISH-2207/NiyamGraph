import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "AUTH_LOGIN_SUCCESS", "APP_SUBMITTED", "DEF_RESPONDED"
    entity_type = Column(String(50), nullable=False, index=True)  # e.g., "auth", "application", "document", "deficiency"
    entity_id = Column(String(100), nullable=True, index=True)
    ip_address = Column(String(50), nullable=True)
    request_id = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)

    actor = relationship("User", foreign_keys=[actor_user_id])

