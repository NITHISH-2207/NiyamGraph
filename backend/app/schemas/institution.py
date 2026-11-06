from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class InstitutionProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    contact_number: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=1000)
    district: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    official_email: Optional[EmailStr] = Field(None)
    affiliation_or_university: Optional[str] = Field(None, max_length=255)


class InstitutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    identifier: str
    official_name: str
    institution_type: str
    state: str
    district: str
    address: str
    official_email: str
    contact_number: str
    affiliation_or_university: Optional[str] = None
    status: str
    verification_status: str
    regional_office: str
    created_at: datetime
    updated_at: datetime

