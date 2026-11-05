import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # AICTE Permanent ID (PID) or registry identifier (e.g., 1-93821094)
    identifier = Column(String(100), unique=True, nullable=False, index=True)
    official_name = Column(String(255), nullable=False)
    institution_type = Column(String(100), nullable=False)  # e.g., "Engineering & Technology", "Management"
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    official_email = Column(String(255), nullable=False)
    contact_number = Column(String(50), nullable=False)
    affiliation_or_university = Column(String(255), nullable=True)
    status = Column(String(50), default="Active", nullable=False)  # "Active", "Suspended", "Defunct"
    verification_status = Column(String(50), default="Verified", nullable=False)  # "Verified", "Pending", "Under Scrutiny"
    regional_office = Column(String(100), nullable=False)  # e.g., "Western Regional Office"
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    users = relationship("InstitutionUser", back_populates="institution")
    applications = relationship("Application", back_populates="institution")
    documents = relationship("Document", back_populates="institution")
    deficiencies = relationship("Deficiency", back_populates="institution")
    compliance_submissions = relationship("ComplianceSubmission", back_populates="institution")

