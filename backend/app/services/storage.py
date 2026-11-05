import os
import uuid
import hashlib
from abc import ABC, abstractmethod
from typing import BinaryIO, Generator, Optional, Tuple
import filetype
from app.core.config import settings
from app.core.exceptions import ValidationError


class StorageInterface(ABC):
    @abstractmethod
    def save(self, file_obj: BinaryIO, storage_key: str) -> int:
        """Save file stream to storage. Return bytes written."""
        pass

    @abstractmethod
    def open_stream(self, storage_key: str, chunk_size: int = 65536) -> Generator[bytes, None, None]:
        """Stream file contents in chunks."""
        pass

    @abstractmethod
    def delete(self, storage_key: str) -> bool:
        """Delete file from storage."""
        pass

    @abstractmethod
    def exists(self, storage_key: str) -> bool:
        """Check if file exists."""
        pass


class LocalStorageBackend(StorageInterface):
    def __init__(self, base_path: str = settings.STORAGE_LOCAL_PATH):
        self.base_path = os.path.abspath(base_path)
        os.makedirs(self.base_path, exist_ok=True)

    def _get_path(self, storage_key: str) -> str:
        # Sanitize storage_key to prevent directory traversal
        clean_key = os.path.basename(storage_key)
        target_path = os.path.abspath(os.path.join(self.base_path, clean_key))
        if not target_path.startswith(self.base_path):
            raise ValidationError("Invalid storage path or potential traversal detected.")
        return target_path

    def save(self, file_obj: BinaryIO, storage_key: str) -> int:
        target_path = self._get_path(storage_key)
        bytes_written = 0
        with open(target_path, "wb") as f:
            while chunk := file_obj.read(65536):
                f.write(chunk)
                bytes_written += len(chunk)
        return bytes_written

    def open_stream(self, storage_key: str, chunk_size: int = 65536) -> Generator[bytes, None, None]:
        target_path = self._get_path(storage_key)
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"File {storage_key} not found.")
        with open(target_path, "rb") as f:
            while chunk := f.read(chunk_size):
                yield chunk

    def delete(self, storage_key: str) -> bool:
        target_path = self._get_path(storage_key)
        if os.path.exists(target_path):
            os.remove(target_path)
            return True
        return False

    def exists(self, storage_key: str) -> bool:
        return os.path.exists(self._get_path(storage_key))


class CloudStorageAdapterStub(StorageInterface):
    """
    Adapter stub for future Production Object Storage (S3 / Supabase Storage).
    Configurable via environment variables when approved.
    """
    def __init__(self, provider: str = "s3"):
        self.provider = provider

    def save(self, file_obj: BinaryIO, storage_key: str) -> int:
        raise NotImplementedError("Cloud storage adapter requires production credentials configuration.")

    def open_stream(self, storage_key: str, chunk_size: int = 65536) -> Generator[bytes, None, None]:
        raise NotImplementedError("Cloud storage adapter requires production credentials configuration.")

    def delete(self, storage_key: str) -> bool:
        raise NotImplementedError("Cloud storage adapter requires production credentials configuration.")

    def exists(self, storage_key: str) -> bool:
        raise NotImplementedError("Cloud storage adapter requires production credentials configuration.")


def get_storage_backend() -> StorageInterface:
    if settings.STORAGE_BACKEND == "local":
        return LocalStorageBackend()
    elif settings.STORAGE_BACKEND in ("s3", "supabase"):
        return CloudStorageAdapterStub(provider=settings.STORAGE_BACKEND)
    return LocalStorageBackend()


def scan_antivirus_hook(file_bytes: bytes, filename: str) -> bool:
    """
    Antivirus scanning hook. Currently a documented hook (pass-through).
    Pending integration with ClamAV / VirusTotal in production.
    """
    return True


def validate_file_content(
    header_bytes: bytes,
    original_filename: str,
    allowed_extensions: list,
) -> Tuple[str, str]:
    """
    Validates file extension and magic-byte signature.
    Returns (detected_ext, mime_type).
    """
    ext = os.path.splitext(original_filename)[1].lower().lstrip(".")
    if ext not in allowed_extensions:
        raise ValidationError(
            f"File extension '.{ext}' is not permitted. Allowed: {', '.join(allowed_extensions)}"
        )

    # Magic-byte detection using pure-Python filetype library
    kind = filetype.guess(header_bytes)

    # Specific handling for PDF / images
    detected_mime = kind.mime if kind else None
    detected_ext = kind.extension if kind else None

    # Fallback for plain PDF or specialized formats if filetype guesses differently
    if header_bytes.startswith(b"%PDF-"):
        detected_mime = "application/pdf"
        detected_ext = "pdf"

    if not detected_mime or not detected_ext:
        raise ValidationError("Unable to determine valid file signature or format.")

    # Prevent extension / signature mismatch (e.g. executable disguised as PDF)
    # Map jpeg / jpg
    norm_detected = "jpg" if detected_ext == "jpeg" else detected_ext
    norm_ext = "jpg" if ext == "jpeg" else ext

    if norm_detected != norm_ext:
        raise ValidationError(
            f"File content signature ('{detected_mime}') does not match extension '.{ext}'."
        )

    return detected_ext, detected_mime

