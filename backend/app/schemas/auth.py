from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class InstitutionLoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Accepts AICTE Permanent ID (PID) or registry identifier (e.g. 1-93821094)
    institution_id: str = Field(..., description="AICTE Permanent ID or Institution Identifier")
    email: EmailStr = Field(..., description="Registered official email address")
    password: str = Field(..., min_length=1, description="Password")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: Optional[str] = None
    is_active: bool
    must_change_password: bool
    created_at: datetime


class InstitutionMinimalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    identifier: str
    official_name: str
    institution_type: str
    regional_office: str
    state: str
    status: str
    verification_status: str


class TokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    token_type: str
    expires_in: int
    expires_at: str
    user: UserResponse
    role: str
    institution: InstitutionMinimalResponse


class OfficialLoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    identifier: str = Field(..., description="Statutory official email or official User ID")
    password: str = Field(..., min_length=1, description="Password")


class WorkspaceInfo(BaseModel):
    id: str
    name: str
    route: str
    is_available: bool = True


class OfficialTokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    expires_at: str
    user: UserResponse
    roles: list[str]
    primary_role: str
    workspace: WorkspaceInfo

