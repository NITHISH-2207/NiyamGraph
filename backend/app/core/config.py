import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "NiyamGraph"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development")

    # Neon PostgreSQL Database URL (sync Psycopg 3 dialect: postgresql+psycopg://)
    DATABASE_URL: str = Field(default="")
    DEV_DATABASE_URL: Optional[str] = Field(default=None)
    TEST_DATABASE_URL: Optional[str] = Field(default=None)

    # JWT Authentication
    JWT_SECRET_KEY: str = Field(
        default="development_super_secret_jwt_signing_key_change_in_production_32b_min"
    )
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # Login Security & Lockout
    LOGIN_MAX_ATTEMPTS: int = Field(default=5)
    LOGIN_LOCKOUT_MINUTES: int = Field(default=15)

    # CORS Configuration
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://niyamgraph.vercel.app"
    )
    BACKEND_CORS_ORIGINS: Optional[str] = Field(default=None)

    # Documentation
    DOCS_ENABLED: bool = Field(default=True)
    LOG_LEVEL: str = Field(default="INFO")

    # Storage Backend (uses /tmp on Vercel serverless environment)
    STORAGE_BACKEND: str = Field(default="local")
    STORAGE_LOCAL_PATH: str = Field(
        default="/tmp/uploads" if os.getenv("VERCEL") else "uploads"
    )
    MAX_UPLOAD_SIZE_MB: int = Field(default=10)
    ALLOWED_FILE_EXTENSIONS: str = Field(default="pdf,png,jpg,jpeg")

    # Development Seeding
    DEV_SEED_PASSWORD: Optional[str] = Field(default=None)

    @property
    def cors_origins(self) -> List[str]:
        raw_list = []
        if self.ALLOWED_ORIGINS:
            raw_list.extend(self.ALLOWED_ORIGINS.split(","))
        if self.BACKEND_CORS_ORIGINS:
            raw_list.extend(self.BACKEND_CORS_ORIGINS.split(","))

        # Always include required production and development origins
        mandatory = [
            "https://niyamgraph.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]
        raw_list.extend(mandatory)

        # De-duplicate while preserving cleanliness
        seen = set()
        cleaned = []
        for origin in raw_list:
            item = origin.strip().rstrip("/")
            if item and item not in seen:
                seen.add(item)
                cleaned.append(item)
        return cleaned

    @property
    def allowed_extensions_list(self) -> List[str]:
        return [
            ext.strip().lower().lstrip(".")
            for ext in self.ALLOWED_FILE_EXTENSIONS.split(",")
            if ext.strip()
        ]

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        env = os.getenv("ENVIRONMENT", "development")
        if env.lower() == "production" and (
            not v or "development" in v or len(v) < 32
        ):
            raise ValueError(
                "In production, JWT_SECRET_KEY must be a cryptographically secure key of at least 32 characters."
            )
        return v

    model_config = {
        "env_file": ("backend/.env", ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
