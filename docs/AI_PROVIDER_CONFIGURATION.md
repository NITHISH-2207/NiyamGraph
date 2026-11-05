# NiyamGraph — Free AI Provider Configuration & Failover Guide

NiyamGraph enforces a strict free-tier architecture with bounded retries and automatic deterministic fallback.

## 1. Provider Priority Chain
1. **Gemini API (Primary):** `gemini-1.5-flash` using `GEMINI_API_KEY_PRIMARY` or `GEMINI_API_KEY_BACKUP`.
2. **Groq API (Secondary):** `llama-3.3-70b-versatile` using `GROQ_API_KEY_PRIMARY` or `GROQ_API_KEY_BACKUP`.
3. **OpenRouter Free Models (Tertiary):** `openrouter/free` using `OPENROUTER_API_KEY`.
4. **Deterministic & Local Heuristics Engine (Zero Cost Fallback):** Executes regex, rule criteria matching, date validity analysis, and page boundary checks locally. Always available even when offline or when no API keys are provided.

## 2. Environment Variables (.env)
```env
GEMINI_API_KEY_PRIMARY=
GEMINI_API_KEY_BACKUP=
GEMINI_MODEL=gemini-1.5-flash

GROQ_API_KEY_PRIMARY=
GROQ_API_KEY_BACKUP=
GROQ_MODEL=llama-3.3-70b-versatile

OPENROUTER_API_KEY=
OPENROUTER_MODEL=openrouter/free

AI_PRIMARY_PROVIDER=gemini
AI_FALLBACK_PROVIDERS=groq,openrouter
AI_FAILOVER_ENABLED=true
AI_MAX_RETRIES=1
AI_REQUEST_TIMEOUT_SECONDS=45
```

## 3. Human In The Loop Principle
AI observations are NEVER automatically committed as formal legal decisions. Human Scrutiny Officers must independently verify every finding, modify observations, or confirm deficiencies before statutory notices are dispatched.

