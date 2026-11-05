import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class Deficiency(Base):
    __tablename__ = "deficiencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Formatted reference: e.g. "DEF-2026-0012"
    reference_number = Column(String(100), unique=True, nullable=False, index=True)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    
    description = Column(Text, nullable=False)
    clause_reference = Column(String(100), nullable=True)  # AICTE Approval Process Handbook (APH) clause
    
    raised_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    raised_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    response_deadline = Column(DateTime(timezone=True), nullable=False)
    
    # "Open", "Responded", "Accepted", "Rejected", "Overdue"
    status = Column(String(50), default="Open", nullable=False, index=True)
    
    institution_response_text = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    review_remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    institution = relationship("Institution", back_populates="deficiencies")
    application = relationship("Application", back_populates="deficiencies")
    raised_by = relationship("User", foreign_keys=[raised_by_user_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_user_id])
    history = relationship("DeficiencyHistory", back_populates="deficiency", cascade="all, delete-orphan", order_by="DeficiencyHistory.created_at.desc()")


class DeficiencyHistory(Base):
    __tablename__ = "deficiency_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deficiency_id = Column(UUID(as_uuid=True), ForeignKey("deficiencies.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # "RAISED", "RESPONDED", "ACCEPTED", "REJECTED", "DEADLINE_EXTENDED"
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    deficiency = relationship("Deficiency", back_populates="history")
    actor = relationship("User", foreign_keys=[actor_user_id])

