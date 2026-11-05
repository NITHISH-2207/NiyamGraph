import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from app.core.config import settings

# Initialize Argon2 password hasher
ph = PasswordHasher()

# Dummy hash for timing attack protection during user lookup failure
# Constant precomputed hash of a dummy string
_DUMMY_HASH = ph.hash("DummyPasswordVerificationForTimingProtectionOnly!")


def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against Argon2 hash."""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError):
        return False


def verify_dummy_password() -> bool:
    """Perform dummy Argon2 verification to equalize timing when user is not found."""
    try:
        ph.verify(_DUMMY_HASH, "DummyPasswordVerificationForTimingProtectionOnly!")
    except Exception:
        pass
    return False


def create_access_token(
    user_id: str,
    role: str,
    institution_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> Dict[str, Any]:
    """Generate PyJWT access token with standard claims."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    jti = str(uuid.uuid4())
    payload = {
        "sub": str(user_id),
        "role": role,
        "institution_id": str(institution_id) if institution_id else None,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": int((expire - now).total_seconds()),
        "expires_at": expire.isoformat(),
        "jti": jti,
    }


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate PyJWT access token."""
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        options={"require": ["sub", "exp", "jti", "iat"]},
    )

