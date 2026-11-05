import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class ComplianceRequirement(Base):
    __tablename__ = "compliance_requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)  # e.g. "COMP-ANTI-RAGGING"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    mandatory = Column(Boolean, default=True, nullable=False)
    applicable_academic_year = Column(String(20), default="2026-27", nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    submissions = relationship("ComplianceSubmission", back_populates="requirement")
    undertakings = relationship("InstitutionUndertaking", back_populates="requirement")


class InstitutionUndertaking(Base):
    __tablename__ = "institution_undertakings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("compliance_requirements.id", ondelete="CASCADE"), nullable=False, index=True)
    accepted = Column(Boolean, default=False, nullable=False)
    accepted_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    accepted_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    requirement = relationship("ComplianceRequirement", back_populates="undertakings")
    user = relationship("User", foreign_keys=[accepted_by_user_id])


class ComplianceSubmission(Base):
    __tablename__ = "compliance_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("compliance_requirements.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # "Pending", "Submitted", "Verified", "Rejected"
    status = Column(String(50), default="Pending", nullable=False, index=True)
    notes = Column(Text, nullable=True)
    
    submitted_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    
    verified_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verification_remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    institution = relationship("Institution", back_populates="compliance_submissions")
    requirement = relationship("ComplianceRequirement", back_populates="submissions")
    submitted_by = relationship("User", foreign_keys=[submitted_by_user_id])
    verified_by = relationship("User", foreign_keys=[verified_by_user_id])
    history = relationship("ComplianceVerificationHistory", back_populates="submission", cascade="all, delete-orphan", order_by="ComplianceVerificationHistory.created_at.desc()")


class ComplianceVerificationHistory(Base):
    __tablename__ = "compliance_verification_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("compliance_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    status_from = Column(String(50), nullable=False)
    status_to = Column(String(50), nullable=False)
    verified_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    submission = relationship("ComplianceSubmission", back_populates="history")
    verifier = relationship("User", foreign_keys=[verified_by_user_id])

