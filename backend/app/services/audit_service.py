import uuid
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

# Sensitive keys that must NEVER be written to audit logs
_SENSITIVE_KEYS = {
    "password",
    "password_hash",
    "secret",
    "token",
    "access_token",
    "refresh_token",
    "jwt",
    "key",
    "api_key",
    "credentials",
}


def _sanitize_metadata(data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not data or not isinstance(data, dict):
        return data

    sanitized = {}
    for k, v in data.items():
        lower_k = k.lower()
        if any(sensitive in lower_k for sensitive in _SENSITIVE_KEYS):
            sanitized[k] = "[REDACTED]"
        elif isinstance(v, dict):
            sanitized[k] = _sanitize_metadata(v)
        elif isinstance(v, str) and len(v) > 500:
            sanitized[k] = v[:500] + "...[TRUNCATED]"
        else:
            sanitized[k] = v
    return sanitized


def log_audit(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    actor_user_id: Optional[uuid.UUID] = None,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """
    Append-only audit logging service.
    No update or delete paths exist for audit logs.
    """
    clean_metadata = _sanitize_metadata(metadata)
    
    audit_entry = AuditLog(
        id=uuid.uuid4(),
        actor_user_id=actor_user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        ip_address=ip_address,
        request_id=request_id,
        metadata_json=clean_metadata,
    )
    db.add(audit_entry)
    db.flush()
    return audit_entry

