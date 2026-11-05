import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Application, ApplicationDocument, DocumentVersion, AuditLog
from app.services.document_processor import document_processor

router = APIRouter(tags=["Document Intelligence"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class VerifyDocumentPayload(BaseModel):
    action: str  # "APPROVE" or "REVERSE"
    remarks: Optional[str] = None
    deficiency_reason: Optional[str] = None

@router.patch("/documents/{document_id}/verify")
def verify_document(document_id: str, payload: VerifyDocumentPayload, db: Session = Depends(get_db)):
    doc = db.query(ApplicationDocument).filter(ApplicationDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    meta = doc.extraction_metadata or {}
    if payload.action == "APPROVE":
        doc.extraction_status = "VERIFIED_COMPLIANT"
        meta["officer_decision"] = "APPROVED"
        meta["officer_remarks"] = payload.remarks or "Document verified compliant against statutory norms."
    elif payload.action == "REVERSE":
        doc.extraction_status = "REVERSED_TO_INSTITUTION"
        meta["officer_decision"] = "REVERSED"
        meta["reversal_reason"] = payload.deficiency_reason or payload.remarks or "Document returned for rectification."
        meta["officer_remarks"] = payload.remarks or "Deficiency noted. Sponsoring institution must upload required corrected version."

    doc.extraction_metadata = meta

    db.add(AuditLog(
        actor_user_id="USR-SCRUTINY-01",
        actor_name="Dr. Rajeshwar Sharma",
        actor_role="SCRUTINY_OFFICER",
        action=f"DOCUMENT_{payload.action}D",
        application_id=doc.application_id,
        entity_type="APPLICATION_DOCUMENT",
        entity_id=doc.id,
        remarks=f"Document {doc.file_name} action: {payload.action}. Reason: {payload.remarks or payload.deficiency_reason or 'Evaluated'}"
    ))
    db.commit()

    return {
        "success": True,
        "document_id": doc.id,
        "status": doc.extraction_status,
        "action": payload.action,
        "metadata": doc.extraction_metadata,
    }

@router.post("/documents/{document_id}/extract")
def extract_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(ApplicationDocument).filter(ApplicationDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.extracted_text and len(doc.extracted_text) > 10:
        return {
            "document_id": doc.id,
            "status": doc.extraction_status,
            "extracted_text": doc.extracted_text,
            "metadata": doc.extraction_metadata or {},
        }

    file_bytes = b""
    if os.path.exists(doc.file_path):
        with open(doc.file_path, "rb") as f:
            file_bytes = f.read()
    else:
        file_bytes = f"Synthetically regenerated text for document {doc.file_name} under AICTE verification.".encode()

    text_extracted, meta = document_processor.process_document(doc.file_name, file_bytes)
    doc.extracted_text = text_extracted
    doc.extraction_status = "EXTRACTED"
    doc.extraction_metadata = meta

    db.add(AuditLog(
        actor_user_id="USR-SCRUTINY-01",
        actor_name="Dr. Rajeshwar Sharma",
        actor_role="SCRUTINY_OFFICER",
        action="DOCUMENT_EXTRACTED",
        application_id=doc.application_id,
        entity_type="APPLICATION_DOCUMENT",
        entity_id=doc.id,
        remarks=f"Document text extracted ({doc.file_name}) using {meta.get('engine', 'parser')}."
    ))
    db.commit()

    return {
        "document_id": doc.id,
        "status": doc.extraction_status,
        "extracted_text": doc.extracted_text,
        "metadata": doc.extraction_metadata,
    }

@router.get("/documents/{document_id}/extraction")
def get_document_extraction(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(ApplicationDocument).filter(ApplicationDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "document_id": doc.id,
        "file_name": doc.file_name,
        "document_category": doc.document_category,
        "extraction_status": doc.extraction_status,
        "extracted_text": doc.extracted_text or "No extracted text available yet.",
        "metadata": doc.extraction_metadata or {},
        "sha256_checksum": doc.sha256_checksum,
    }

@router.post("/applications/{application_id}/documents/upload")
async def upload_application_document(
    application_id: str,
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    file_bytes = await file.read()
    checksum = document_processor.calculate_sha256(file_bytes)

    save_path = os.path.join(UPLOAD_DIR, f"{application_id}_{file.filename}")
    with open(save_path, "wb") as f:
        f.write(file_bytes)

    extracted_text, meta = document_processor.process_document(file.filename, file_bytes)

    existing_doc = db.query(ApplicationDocument).filter(
        ApplicationDocument.application_id == application_id,
        ApplicationDocument.document_category == category
    ).first()

    if existing_doc:
        new_version_num = existing_doc.current_version + 1
        existing_doc.current_version = new_version_num
        existing_doc.file_name = file.filename
        existing_doc.file_path = save_path
        existing_doc.file_size_bytes = len(file_bytes)
        existing_doc.sha256_checksum = checksum
        existing_doc.extracted_text = extracted_text
        existing_doc.extraction_metadata = meta
        existing_doc.extraction_status = "EXTRACTED"

        v_obj = DocumentVersion(
            document_id=existing_doc.id,
            version_number=new_version_num,
            file_name=file.filename,
            file_path=save_path,
            sha256_checksum=checksum,
            extracted_text=extracted_text,
            change_summary=f"Version {new_version_num} uploaded.",
        )
        db.add(v_obj)
        target_doc = existing_doc
    else:
        doc_id = f"DOC-{application_id[-4:]}-{int(os.urandom(2).hex(), 16)}"
        target_doc = ApplicationDocument(
            id=doc_id,
            application_id=application_id,
            document_category=category,
            file_name=file.filename,
            file_path=save_path,
            file_size_bytes=len(file_bytes),
            file_mime_type=file.content_type or "application/octet-stream",
            sha256_checksum=checksum,
            current_version=1,
            extraction_status="EXTRACTED",
            extracted_text=extracted_text,
            extraction_metadata=meta,
        )
        db.add(target_doc)
        db.flush()

        v_obj = DocumentVersion(
            document_id=target_doc.id,
            version_number=1,
            file_name=file.filename,
            file_path=save_path,
            sha256_checksum=checksum,
            extracted_text=extracted_text,
            change_summary="Initial statutory submission.",
        )
        db.add(v_obj)

    db.commit()

    return {
        "success": True,
        "document_id": target_doc.id,
        "file_name": target_doc.file_name,
        "version": target_doc.current_version,
        "sha256_checksum": checksum,
    }
