from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.dashboard import DashboardSummaryResponse
from app.api.deps import (
    get_current_institution_user,
    AuthenticatedContext,
)
from app.services.dashboard_service import get_institution_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    summary="Get Institution Dashboard Summary",
    description="Retrieve real-time aggregate statistics and compliance counts scoped strictly to the authenticated institution.",
)
def get_dashboard_summary(
    ctx: AuthenticatedContext = Depends(get_current_institution_user),
    db: Session = Depends(get_db),
):
    return get_institution_dashboard_summary(
        db=db,
        institution_id=ctx.institution_id,
        user_id=ctx.user.id,
    )

