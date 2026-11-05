from app.schemas.auth import (
    InstitutionLoginRequest,
    TokenResponse,
    UserResponse,
    InstitutionMinimalResponse,
)
from app.schemas.institution import (
    InstitutionProfileUpdate,
    InstitutionResponse,
)
from app.schemas.application import (
    ApplicationCreateRequest,
    ApplicationUpdateRequest,
    ApplicationAcademicDetailCreate,
    ApplicationAcademicDetailResponse,
    ApplicationResponse,
    ApplicationStatusHistoryResponse,
    PaginatedApplicationsResponse,
    ApplicationTypeResponse,
)
from app.schemas.document import DocumentResponse
from app.schemas.deficiency import (
    DeficiencyResponseRequest,
    DeficiencyResponse,
    DeficiencyHistoryResponse,
)
from app.schemas.compliance import (
    ComplianceRequirementResponse,
    InstitutionUndertakingRequest,
    ComplianceSubmissionRequest,
    ComplianceSubmissionResponse,
    ComplianceVerificationHistoryResponse,
)
from app.schemas.notification import (
    NotificationResponse,
    UnreadCountResponse,
)
from app.schemas.dashboard import DashboardSummaryResponse

__all__ = [
    "InstitutionLoginRequest",
    "TokenResponse",
    "UserResponse",
    "InstitutionMinimalResponse",
    "InstitutionProfileUpdate",
    "InstitutionResponse",
    "ApplicationCreateRequest",
    "ApplicationUpdateRequest",
    "ApplicationAcademicDetailCreate",
    "ApplicationAcademicDetailResponse",
    "ApplicationResponse",
    "ApplicationStatusHistoryResponse",
    "PaginatedApplicationsResponse",
    "ApplicationTypeResponse",
    "DocumentResponse",
    "DeficiencyResponseRequest",
    "DeficiencyResponse",
    "DeficiencyHistoryResponse",
    "ComplianceRequirementResponse",
    "InstitutionUndertakingRequest",
    "ComplianceSubmissionRequest",
    "ComplianceSubmissionResponse",
    "ComplianceVerificationHistoryResponse",
    "NotificationResponse",
    "UnreadCountResponse",
    "DashboardSummaryResponse",
]

