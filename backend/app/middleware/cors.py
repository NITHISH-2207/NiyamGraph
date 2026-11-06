from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def setup_cors(app: FastAPI) -> None:
    """
    Configure CORS strictly adhering to project specifications.
    Explicit origin whitelist prevents wildcard credential leakage.
    Supports https://niyamgraph.vercel.app, local dev ports, and Vercel branch previews.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=r"^https://niyamgraph(-[a-z0-9-]+)?\.vercel\.app$",
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "X-Request-ID",
            "Accept",
            "Origin",
            "X-Requested-With",
        ],
        expose_headers=["X-Request-ID", "Content-Disposition"],
    )
