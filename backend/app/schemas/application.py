from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ApplicationTypeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    description: Optional[str] = None
    required_fields_json: List[str]
    required_documents_json: List[str]


class ApplicationCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    application_type_id: UUID
    academic_year: str = Field(default="2026-27")
    application_data: Dict[str, Any] = Field(default_factory=dict)


class ApplicationUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    application_data: Dict[str, Any]


class ApplicationAcademicDetailCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    program_name: str
    course_name: str
    intake_approved: int = Field(default=0, ge=0)
    intake_applied: int = Field(default=0, ge=0)
    nba_accreditation_status: str = Field(default="Not Eligible")
    faculty_count: int = Field(default=0, ge=0)
    details_json: Dict[str, Any] = Field(default_factory=dict)


class ApplicationAcademicDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    program_name: str
    course_name: str
    intake_approved: int
    intake_applied: int
    nba_accreditation_status: str
    faculty_count: int
    details_json: Dict[str, Any]
    created_at: datetime


class ApplicationStatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    from_status: str
    to_status: str
    remarks: Optional[str] = None
    created_at: datetime
    changed_by_user_id: Optional[UUID] = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    reference_number: str
    institution_id: UUID
    application_type_id: UUID
    application_type: Optional[ApplicationTypeResponse] = None
    academic_year: str
    status: str
    current_stage: str
    application_data: Dict[str, Any]
    submitted_at: Optional[datetime] = None
    decision_at: Optional[datetime] = None
    decision_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    academic_details: List[ApplicationAcademicDetailResponse] = Field(default_factory=list)


class PaginatedApplicationsResponse(BaseModel):
    items: List[ApplicationResponse]
    total: int
    page: int
    limit: int
    pages: int

