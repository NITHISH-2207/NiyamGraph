import io
import pytest
from app.core.security import (
    hash_password,
    verify_password,
    verify_dummy_password,
    create_access_token,
    decode_access_token,
)
from app.services.storage import (
    LocalStorageBackend,
    validate_file_content,
    scan_antivirus_hook,
)
from app.schemas.auth import InstitutionLoginRequest
from app.schemas.application import ApplicationCreateRequest
from pydantic import ValidationError


def test_password_hashing_and_verification():
    raw_pwd = "StrongDevPassword2026!"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False


def test_dummy_password_timing_protection():
    # Calling dummy password verification should always safely return False
    assert verify_dummy_password() is False


def test_jwt_token_creation_and_decoding():
    user_id = "11111111-1111-1111-1111-111111111111"
    token_dict = create_access_token(
        user_id=user_id,
        role="Institution Admin",
        institution_id="22222222-2222-2222-2222-222222222222",
    )
    assert "access_token" in token_dict
    payload = decode_access_token(token_dict["access_token"])
    assert payload["sub"] == user_id
    assert payload["role"] == "Institution Admin"
    assert payload["institution_id"] == "22222222-2222-2222-2222-222222222222"
    assert "jti" in payload


def test_schema_extra_fields_forbidden():
    # Extra field injection must raise ValidationError due to extra="forbid"
    with pytest.raises(ValidationError):
        InstitutionLoginRequest(
            institution_id="TEST-123",
            email="test@domain.com",
            password="pass",
            malicious_role="Super Administrator",  # Forbidden extra field
        )


def test_storage_path_traversal_blocked(tmp_path):
    storage = LocalStorageBackend(base_path=str(tmp_path))
    # Path traversal attack key
    traversal_key = "../../etc/passwd"
    # LocalStorageBackend strips traversal with os.path.basename
    clean_path = storage._get_path(traversal_key)
    assert clean_path.startswith(str(tmp_path))
    assert "passwd" in clean_path


def test_filetype_signature_validation():
    # Valid PDF signature
    valid_pdf_bytes = b"%PDF-1.4\n%...\ntrailer\n%%EOF"
    ext, mime = validate_file_content(valid_pdf_bytes, "document.pdf", ["pdf", "png", "jpg"])
    assert ext == "pdf"
    assert mime == "application/pdf"

    # Mismatch: PNG extension with executable or invalid bytes
    with pytest.raises(Exception):
        validate_file_content(b"MZ\x90\x00\x03\x00\x00\x00", "malware.png", ["pdf", "png", "jpg"])

