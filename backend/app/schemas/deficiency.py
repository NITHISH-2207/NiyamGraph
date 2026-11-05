from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class DeficiencyResponseRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    response_text: str = Field(..., min_length=5, description="Institutional response explanation")


class DeficiencyHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    action: str
    actor_user_id: UUID
    remarks: Optional[str] = None
    created_at: datetime


class DeficiencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    reference_number: str
    institution_id: UUID
    application_id: UUID
    description: str
    clause_reference: Optional[str] = None
    raised_at: datetime
    response_deadline: datetime
    status: str
    institution_response_text: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    review_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    history: List[DeficiencyHistoryResponse] = Field(default_factory=list)

