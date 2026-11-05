import os
import hashlib
import io
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

from typing import Dict, Any, Tuple

try:
    import docx
except ImportError:
    docx = None

class DocumentProcessorService:
    @staticmethod
    def calculate_sha256(file_bytes: bytes) -> str:
        return hashlib.sha256(file_bytes).hexdigest()

    @classmethod
    def extract_text_from_pdf(cls, file_bytes: bytes) -> Tuple[str, Dict[str, Any]]:
        """
        Extract text from PDF pages with explicit [Page N] markers for regulatory evidence ledger.
        """
        if fitz is None:
            return "PDF extraction engine (PyMuPDF) not installed.", {"page_count": 0, "is_scanned": False}

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(doc)
        extracted_pages = []
        is_scanned = True

        for page_idx in range(page_count):
            page = doc[page_idx]
            page_text = page.get_text("text").strip()
            if page_text and len(page_text) > 30:
                is_scanned = False
            extracted_pages.append(f"--- [Page {page_idx + 1}] ---\n{page_text}\n")

        full_text = "\n".join(extracted_pages).strip()

        # If digital text is sparse, mark OCR needed or extract embedded image text
        metadata = {
            "page_count": page_count,
            "engine": "pymupdf",
            "is_scanned_pdf": is_scanned,
            "word_count": len(full_text.split()) if full_text else 0
        }

        return full_text, metadata

    @classmethod
    def extract_text_from_docx(cls, file_bytes: bytes) -> Tuple[str, Dict[str, Any]]:
        if not docx:
            return "python-docx library not installed", {"engine": "none", "error": "docx_unavailable"}
        
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n".join(paragraphs)
        metadata = {
            "paragraph_count": len(paragraphs),
            "engine": "python-docx",
            "word_count": len(full_text.split())
        }
        return full_text, metadata

    @classmethod
    def process_document(cls, filename: str, file_bytes: bytes) -> Tuple[str, Dict[str, Any]]:
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            return cls.extract_text_from_pdf(file_bytes)
        elif ext in [".docx", ".doc"]:
            return cls.extract_text_from_docx(file_bytes)
        elif ext in [".txt", ".json", ".csv"]:
            text_content = file_bytes.decode("utf-8", errors="replace")
            return text_content, {"engine": "plain_text", "word_count": len(text_content.split())}
        else:
            return f"[Binary or unsupported document format: {ext}]", {"engine": "binary", "word_count": 0}

document_processor = DocumentProcessorService()

