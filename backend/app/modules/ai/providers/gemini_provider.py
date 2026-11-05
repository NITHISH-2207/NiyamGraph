import os
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("niyamgraph.ai.gemini")

class GeminiProvider:
    def __init__(self):
        self.api_key_primary = os.getenv("GEMINI_API_KEY_PRIMARY", "").strip()
        self.api_key_backup = os.getenv("GEMINI_API_KEY_BACKUP", "").strip()
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

    def is_configured(self) -> bool:
        return bool(self.api_key_primary or self.api_key_backup)

    async def generate_completion(self, system_prompt: str, prompt: str) -> Optional[str]:
        api_key = self.api_key_primary or self.api_key_backup
        if not api_key:
            return None

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=self.model_name,
                contents=f"{system_prompt}\n\n{prompt}",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            return response.text
        except Exception as exc:
            logger.warning(f"Gemini API request failed: {exc}")
            return None

