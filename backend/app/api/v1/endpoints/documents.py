import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Request, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.document import DocumentResponse
from app.api.deps import (
    get_request_id,
    get_client_ip,
    get_current_institution_user,
    AuthenticatedContext,
)
from app.services.document_service import (
    upload_document,
    get_document,
    list_documents,
    delete_document,
    download_document_stream,
)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentResponse,
    summary="Upload Document",
    description="Upload a supporting document with magic-byte validation, antivirus hook, and versioning.",
)
async def upload_doc(
    request: Request,
    file: UploadFile = File(...),
    entity_type: str = Form(..., description="Target entity: 'institution_profile', 'application', 'deficiency_response', 'compliance_submission'"),
    entity_id: Optional[uuid.UUID] = Form(None, description="Optional target entity UUID"),
    document_type: str = Form("GENERAL", description="Document category code (e.g. LAND_DOC, FIRE_NOC, PROFILE_DOC)"),
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    contents = await file.read()
    return upload_document(
        db=db,
        institution_id=ctx.institution_id,
        user_id=ctx.user.id,
        file_bytes=contents,
        original_filename=file.filename or "uploaded_file",
        entity_type=entity_type,
        entity_id=entity_id,
        document_type=document_type,
        ip_address=ip_addr,
        request_id=req_id,
    )


@router.get(
    "",
    response_model=List[DocumentResponse],
    summary="List Documents",
    description="List active documents belonging to the authenticated institution with optional filters.",
)
def get_documents(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[uuid.UUID] = Query(None),
    document_type: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return list_documents(
        db=db,
        institution_id=ctx.institution_id,
        entity_type=entity_type,
        entity_id=entity_id,
        document_type=document_type,
        review_status=review_status,
    )


@router.get(
    "/{id}",
    response_model=DocumentResponse,
    summary="Get Document Metadata",
    description="Retrieve document metadata. Enforces institution ownership.",
)
def get_document_by_id(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return get_document(db=db, document_id=id, institution_id=ctx.institution_id)


@router.get(
    "/{id}/download",
    summary="Download Document File",
    description="Securely stream document file with nosniff and content disposition headers.",
)
def download_doc(
    id: uuid.UUID,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    stream, filename, mime_type, file_size = download_document_stream(
        db=db,
        document_id=id,
        institution_id=ctx.institution_id,
    )
    safe_filename = filename.replace('"', '\\"')
    headers = {
        "Content-Disposition": f'attachment; filename="{safe_filename}"',
        "X-Content-Type-Options": "nosniff",
        "Content-Length": str(file_size),
    }
    return StreamingResponse(stream, media_type=mime_type, headers=headers)


@router.delete(
    "/{id}",
    response_model=DocumentResponse,
    summary="Soft-Delete Document",
    description="Soft delete document. Allowed only for Institution Admin on draft applications or unreviewed files.",
)
def delete_doc(
    id: uuid.UUID,
    request: Request,
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
    req_id: str = Depends(get_request_id),
    ip_addr: str = Depends(get_client_ip),
):
    return delete_document(
        db=db,
        document_id=id,
        institution_id=ctx.institution_id,
        user_id=ctx.user.id,
        role=ctx.role,
        ip_address=ip_addr,
        request_id=req_id,
    )

