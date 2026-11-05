import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class ApplicationType(Base):
    __tablename__ = "application_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "EOA", "NEW_INST"
    name = Column(String(255), nullable=False)  # e.g., "Extension of Approval (EoA)"
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    # Required data/config stored as JSON to avoid hardcoded rules
    required_fields_json = Column(JSON, default=list, nullable=False)
    required_documents_json = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    applications = relationship("Application", back_populates="application_type")


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Formatted reference number: e.g. "NG-2026-AP-8941"
    reference_number = Column(String(100), unique=True, nullable=False, index=True)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    application_type_id = Column(UUID(as_uuid=True), ForeignKey("application_types.id"), nullable=False, index=True)
    academic_year = Column(String(20), nullable=False, default="2026-27", index=True)
    
    # Controlled statuses
    status = Column(
        String(50),
        nullable=False,
        default="Draft",
        index=True,
    )
    # Granular regulatory stage (e.g., "Draft Preparation", "Regional Scrutiny", "Deficiency Resolution", "Evaluation", "Final Sanction")
    current_stage = Column(String(100), nullable=False, default="Draft Preparation")
    
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    application_data = Column(JSON, default=dict, nullable=False)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    decision_at = Column(DateTime(timezone=True), nullable=True)
    decision_remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('Draft', 'Submitted', 'Under Scrutiny', 'Deficiency Raised', 'Resubmitted', 'Under Evaluation', 'Decision Pending', 'Approved', 'Rejected', 'Closed')",
            name="check_application_status"
        ),
    )

    institution = relationship("Institution", back_populates="applications")
    application_type = relationship("ApplicationType", back_populates="applications")
    creator = relationship("User", foreign_keys=[created_by_user_id])
    status_history = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan", order_by="ApplicationStatusHistory.created_at.desc()")
    academic_details = relationship("ApplicationAcademicDetail", back_populates="application", cascade="all, delete-orphan")
    submissions = relationship("ApplicationSubmission", back_populates="application", cascade="all, delete-orphan")
    deficiencies = relationship("Deficiency", back_populates="application")


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status = Column(String(50), nullable=False)
    to_status = Column(String(50), nullable=False)
    changed_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    application = relationship("Application", back_populates="status_history")
    actor = relationship("User", foreign_keys=[changed_by_user_id])


class ApplicationAcademicDetail(Base):
    __tablename__ = "application_academic_details"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    program_name = Column(String(100), nullable=False)  # e.g. "Engineering & Technology"
    course_name = Column(String(255), nullable=False)   # e.g. "Computer Science and Engineering"
    intake_approved = Column(Integer, default=0, nullable=False)
    intake_applied = Column(Integer, default=0, nullable=False)
    nba_accreditation_status = Column(String(50), default="Not Eligible", nullable=False)
    faculty_count = Column(Integer, default=0, nullable=False)
    details_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    application = relationship("Application", back_populates="academic_details")


class ApplicationSubmission(Base):
    __tablename__ = "application_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_number = Column(Integer, default=1, nullable=False)
    submitted_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    submitted_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    snapshot_json = Column(JSON, nullable=False)

    application = relationship("Application", back_populates="submissions")
    submitter = relationship("User", foreign_keys=[submitted_by_user_id])
