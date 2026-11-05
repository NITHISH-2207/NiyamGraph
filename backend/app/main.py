from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.database.init_db import seed_database
from app.core.config import settings
from app.api.v1.router import api_v1_router

app = FastAPI(
    title="NiyamGraph - AICTE Statutory Approval & Scrutiny Engine API",
    description="Centralized REST API for Scrutiny, Regional Officer, EVC and Institutional Portals",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local Vite dev server and cross-origin frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 API router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as exc:
        print(f"[NiyamGraph] Startup database seeding notice: {exc}")

@app.get("/db-health")
def database_health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {
        "status": "success",
        "database": "connected",
        "service": settings.PROJECT_NAME,
        "api_prefix": settings.API_V1_STR
    }

@app.get("/")
def root():
    return {
        "project": "NiyamGraph Rule-Aware Scrutiny & Regulatory Compliance Engine",
        "status": "online",
        "api_docs": "/docs",
        "endpoints": f"{settings.API_V1_STR}/scrutiny/dashboard"
    }
