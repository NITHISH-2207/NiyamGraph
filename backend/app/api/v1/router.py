from fastapi import APIRouter
from app.api.v1.auth import router as scrutiny_auth_router
from app.api.v1.scrutiny import router as scrutiny_router
from app.api.v1.documents import router as scrutiny_documents_router

from app.api.v1.endpoints import (
    auth,
    institutions,
    applications,
    documents,
    deficiencies,
    compliance,
    notifications,
    dashboard,
)

api_router = APIRouter()
api_v1_router = api_router  # Alias for compatibility with both modules

# Scrutiny Officer Endpoints
api_router.include_router(scrutiny_auth_router)
api_router.include_router(scrutiny_router)
api_router.include_router(scrutiny_documents_router)

# Institution Portal Endpoints
api_router.include_router(auth.router)
api_router.include_router(institutions.router)
api_router.include_router(applications.router)
api_router.include_router(documents.router)
api_router.include_router(deficiencies.router)
api_router.include_router(compliance.router)
api_router.include_router(notifications.router)
api_router.include_router(dashboard.router)
