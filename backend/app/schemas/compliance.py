from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ComplianceRequirementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    title: str
    description: str
    mandatory: bool
    applicable_academic_year: str
    due_date: Optional[datetime] = None
    created_at: datetime


class InstitutionUndertakingRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    requirement_id: UUID
    accepted: bool = Field(..., description="Confirmation of undertaking acceptance")


class ComplianceSubmissionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    requirement_id: UUID
    notes: Optional[str] = Field(None, max_length=2000)


class ComplianceVerificationHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status_from: str
    status_to: str
    remarks: Optional[str] = None
    created_at: datetime
    verified_by_user_id: UUID


class ComplianceSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    institution_id: UUID
    requirement_id: UUID
    requirement: Optional[ComplianceRequirementResponse] = None
    status: str
    notes: Optional[str] = None
    submitted_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    verification_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    history: List[ComplianceVerificationHistoryResponse] = Field(default_factory=list)

