import os
import logging
from typing import Optional

logger = logging.getLogger("niyamgraph.ai.groq")

class GroqProvider:
    def __init__(self):
        self.api_key_primary = os.getenv("GROQ_API_KEY_PRIMARY", "").strip()
        self.api_key_backup = os.getenv("GROQ_API_KEY_BACKUP", "").strip()
        self.model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

    def is_configured(self) -> bool:
        return bool(self.api_key_primary or self.api_key_backup)

    async def generate_completion(self, system_prompt: str, prompt: str) -> Optional[str]:
        api_key = self.api_key_primary or self.api_key_backup
        if not api_key:
            return None

        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            return completion.choices[0].message.content
        except Exception as exc:
            logger.warning(f"Groq API request failed: {exc}")
            return None

