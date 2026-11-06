import io
import uuid
import hashlib
from typing import Optional, List, Tuple, Generator
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.application import Application
from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationError, ForbiddenError
from app.services.storage import get_storage_backend, validate_file_content, scan_antivirus_hook
from app.services.audit_service import log_audit


def upload_document(
    db: Session,
    institution_id: uuid.UUID,
    user_id: uuid.UUID,
    file_bytes: bytes,
    original_filename: str,
    entity_type: str,
    entity_id: Optional[uuid.UUID],
    document_type: str = "GENERAL",
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Document:
    """
    Validate, store, and record an uploaded document with versioning support.
    """
    # 1. Size check
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise ValidationError(
            f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # 2. Antivirus hook
    if not scan_antivirus_hook(file_bytes, original_filename):
        raise ValidationError("File failed security scanning.")

    # 3. Extension and magic byte signature verification
    detected_ext, mime_type = validate_file_content(
        header_bytes=file_bytes[:2048],
        original_filename=original_filename,
        allowed_extensions=settings.allowed_extensions_list,
    )

    # 4. Check entity ownership if application-related
    if entity_type == "application" and entity_id:
        app = db.query(Application).filter(Application.id == entity_id).first()
        if not app or app.institution_id != institution_id:
            raise NotFoundError("Referenced application not found.")

    # 5. Compute SHA256 checksum
    checksum = hashlib.sha256(file_bytes).hexdigest()

    # 6. Versioning check: see if a document of same type already exists for this entity
    prev_doc = None
    version_number = 1
    if entity_id:
        prev_doc = (
            db.query(Document)
            .filter(
                Document.institution_id == institution_id,
                Document.entity_type == entity_type,
                Document.entity_id == entity_id,
                Document.document_type == document_type,
                Document.is_deleted.is_(False),
            )
            .order_by(Document.version_number.desc())
            .first()
        )
        if prev_doc:
            version_number = prev_doc.version_number + 1

    # 7. Generate random, unguessable storage key
    storage_key = f"{uuid.uuid4().hex}.{detected_ext}"

    # 8. Save to storage backend
    storage = get_storage_backend()
    file_stream = io.BytesIO(file_bytes)
    storage.save(file_stream, storage_key)

    # 9. Create Document record
    now = datetime.now(timezone.utc)
    doc = Document(
        id=uuid.uuid4(),
        institution_id=institution_id,
        entity_type=entity_type,
        entity_id=entity_id,
        document_type=document_type,
        original_filename=original_filename,
        storage_key=storage_key,
        file_size_bytes=len(file_bytes),
        mime_type=mime_type,
        checksum_sha256=checksum,
        uploaded_by_user_id=user_id,
        review_status="Pending",
        version_number=version_number,
        previous_version_id=prev_doc.id if prev_doc else None,
        is_deleted=False,
        created_at=now,
    )
    db.add(doc)
    db.flush()

    log_audit(
        db=db,
        action="DOCUMENT_UPLOADED",
        entity_type="document",
        entity_id=str(doc.id),
        actor_user_id=user_id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={
            "document_type": document_type,
            "version_number": version_number,
            "file_size": len(file_bytes),
            "mime_type": mime_type,
        },
    )

    return doc


def get_document(
    db: Session,
    document_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> Document:
    """Retrieve document metadata, enforcing institution ownership."""
    doc = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.institution_id == institution_id,
            Document.is_deleted.is_(False),
        )
        .first()
    )
    if not doc:
        raise NotFoundError("Document not found.")
    return doc


def list_documents(
    db: Session,
    institution_id: uuid.UUID,
    entity_type: Optional[str] = None,
    entity_id: Optional[uuid.UUID] = None,
    document_type: Optional[str] = None,
    review_status: Optional[str] = None,
) -> List[Document]:
    """List documents for the institution with optional filters."""
    query = (
        db.query(Document)
        .filter(
            Document.institution_id == institution_id,
            Document.is_deleted.is_(False),
        )
    )
    if entity_type:
        query = query.filter(Document.entity_type == entity_type)
    if entity_id:
        query = query.filter(Document.entity_id == entity_id)
    if document_type:
        query = query.filter(Document.document_type == document_type)
    if review_status:
        query = query.filter(Document.review_status == review_status)

    return query.order_by(Document.created_at.desc()).all()


def delete_document(
    db: Session,
    document_id: uuid.UUID,
    institution_id: uuid.UUID,
    user_id: uuid.UUID,
    role: str,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Document:
    """
    Soft-delete a document.
    Allowed only for Institution Admin.
    Allowed only when attached to a Draft application or when unreviewed.
    """
    if role != "Institution Admin":
        raise ForbiddenError("Only Institution Admin is permitted to delete documents.")

    doc = get_document(db, document_id, institution_id)

    # If attached to an application, check application status
    if doc.entity_type == "application" and doc.entity_id:
        app = db.query(Application).filter(Application.id == doc.entity_id).first()
        if app and app.status != "Draft":
            raise ValidationError(
                f"Cannot delete document attached to an application in '{app.status}' status."
            )

    if doc.review_status in ("Approved", "Verified"):
        raise ValidationError("Cannot delete a verified or approved document.")

    now = datetime.now(timezone.utc)
    doc.is_deleted = True
    doc.deleted_at = now
    doc.deleted_by_user_id = user_id
    db.flush()

    log_audit(
        db=db,
        action="DOCUMENT_DELETED",
        entity_type="document",
        entity_id=str(doc.id),
        actor_user_id=user_id,
        ip_address=ip_address,
        request_id=request_id,
        metadata={"document_type": doc.document_type, "version": doc.version_number},
    )

    return doc


def download_document_stream(
    db: Session,
    document_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> Tuple[Generator[bytes, None, None], str, str, int]:
    """
    Returns (content_stream, filename, mime_type, file_size_bytes).
    Enforces ownership.
    """
    doc = get_document(db, document_id, institution_id)
    storage = get_storage_backend()

    if not storage.exists(doc.storage_key):
        raise NotFoundError("Document storage file is missing.")

    stream = storage.open_stream(doc.storage_key)
    return stream, doc.original_filename, doc.mime_type, doc.file_size_bytes

