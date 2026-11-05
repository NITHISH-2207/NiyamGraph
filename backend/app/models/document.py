import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Entity reference: "institution_profile", "application", "deficiency_response", "compliance_submission"
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    document_type = Column(String(100), nullable=False, default="GENERAL")
    original_filename = Column(String(255), nullable=False)
    storage_key = Column(String(255), unique=True, nullable=False, index=True)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    checksum_sha256 = Column(String(64), nullable=False)
    
    uploaded_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    review_status = Column(String(50), default="Pending", nullable=False)  # "Pending", "Approved", "Deficient"
    
    version_number = Column(Integer, default=1, nullable=False)
    previous_version_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    
    # Soft deletion
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deleted_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    institution = relationship("Institution", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by_user_id])
    deleter = relationship("User", foreign_keys=[deleted_by_user_id])
    previous_version = relationship("Document", remote_side=[id])

