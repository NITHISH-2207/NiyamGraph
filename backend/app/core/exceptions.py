from typing import Any, Optional


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Any] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Authentication required or invalid credentials"):
        super().__init__(
            code="UNAUTHORIZED",
            message=message,
            status_code=401,
        )


class ForbiddenError(AppException):
    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__(
            code="FORBIDDEN",
            message=message,
            status_code=403,
        )


class NotFoundError(AppException):
    def __init__(self, message: str = "Requested resource was not found"):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=404,
        )


class ConflictError(AppException):
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(
            code="CONFLICT",
            message=message,
            status_code=409,
        )


class ValidationError(AppException):
    def __init__(self, message: str = "Validation failed", details: Optional[Any] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422,
            details=details,
        )


class RateLimitExceededError(AppException):
    def __init__(self, message: str = "Too many requests. Please try again later."):
        super().__init__(
            code="RATE_LIMIT_EXCEEDED",
            message=message,
            status_code=429,
        )

