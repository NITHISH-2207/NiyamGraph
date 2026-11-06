from pydantic import BaseModel, ConfigDict


class DashboardSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_applications: int
    draft_applications: int
    submitted_applications: int
    under_scrutiny_applications: int
    with_deficiencies_applications: int
    approved_applications: int
    rejected_applications: int
    pending_compliance: int
    verified_compliance: int
    unread_notifications: int

