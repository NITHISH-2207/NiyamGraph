from fastapi import APIRouter
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

api_router.include_router(auth.router)
api_router.include_router(institutions.router)
api_router.include_router(applications.router)
api_router.include_router(documents.router)
api_router.include_router(deficiencies.router)
api_router.include_router(compliance.router)
api_router.include_router(notifications.router)
api_router.include_router(dashboard.router)

