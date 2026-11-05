import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.core.exceptions import AppException

logger = logging.getLogger("niyamgraph.errors")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        req_id = getattr(request.state, "request_id", None)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "request_id": req_id,
                    "details": exc.details,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        req_id = getattr(request.state, "request_id", None)
        # Clean pydantic validation details
        details = []
        for error in exc.errors():
            loc = " -> ".join([str(x) for x in error.get("loc", []) if x != "body"])
            msg = error.get("msg", "Invalid value")
            details.append({"field": loc, "issue": msg})

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request payload validation failed.",
                    "request_id": req_id,
                    "details": details,
                }
            },
        )

    @app.exception_handler(IntegrityError)
    async def db_integrity_exception_handler(request: Request, exc: IntegrityError):
        req_id = getattr(request.state, "request_id", None)
        logger.warning(f"Database integrity conflict [req_id={req_id}]: {str(exc.orig) if hasattr(exc, 'orig') else str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": {
                    "code": "CONFLICT",
                    "message": "Resource state conflict or unique constraint violation.",
                    "request_id": req_id,
                }
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def db_exception_handler(request: Request, exc: SQLAlchemyError):
        req_id = getattr(request.state, "request_id", None)
        logger.error(f"Database error [req_id={req_id}]: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "DATABASE_ERROR",
                    "message": "A database error occurred. Please try again later.",
                    "request_id": req_id,
                }
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        req_id = getattr(request.state, "request_id", None)
        logger.error(f"Unhandled exception [req_id={req_id}]: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected internal server error occurred.",
                    "request_id": req_id,
                }
            },
        )

