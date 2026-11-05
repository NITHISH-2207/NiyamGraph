import os
import logging
import httpx
from typing import Optional

logger = logging.getLogger("niyamgraph.ai.openrouter")

class OpenRouterProvider:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
        self.model_name = os.getenv("OPENROUTER_MODEL", "openrouter/free").strip()

    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def generate_completion(self, system_prompt: str, prompt: str) -> Optional[str]:
        if not self.api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://niyamgraph.gov.in",
            "X-Title": "NiyamGraph Scrutiny Portal"
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"OpenRouter returned status {resp.status_code}: {resp.text}")
                    return None
        except Exception as exc:
            logger.warning(f"OpenRouter API request failed: {exc}")
            return None

