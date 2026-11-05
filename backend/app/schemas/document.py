from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    institution_id: UUID
    entity_type: str
    entity_id: Optional[UUID] = None
    document_type: str
    original_filename: str
    storage_key: str
    file_size_bytes: int
    mime_type: str
    checksum_sha256: str
    review_status: str
    version_number: int
    previous_version_id: Optional[UUID] = None
    created_at: datetime

