import logging
from fastapi import FastAPI, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.database import get_db
from app.middleware import setup_cors, RequestIdMiddleware, register_error_handlers
from app.api.v1.router import api_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
)
logger = logging.getLogger("niyamgraph.main")

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="NiyamGraph - Rule-driven Approvals & Compliance Intelligence (AICTE / SIH 2026)",
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None,
    openapi_url="/openapi.json" if settings.DOCS_ENABLED else None,
)

# 1. Register Request ID Middleware
app.add_middleware(RequestIdMiddleware)

# 2. Configure CORS
setup_cors(app)

# 3. Register Centralized Error Handlers
register_error_handlers(app)

# 4. Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


# Health Check Endpoints
@app.get(
    "/health",
    tags=["Health"],
    summary="Application Health Check",
    description="Root service health check returning service status.",
)
def root_health():
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@app.get(
    "/db-health",
    tags=["Health"],
    summary="Database Connectivity Check",
    description="Safe database probe performing SELECT 1. Never exposes credentials.",
)
def database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "database": "connected",
        }
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unavailable",
                "database": "disconnected",
            },
        )
