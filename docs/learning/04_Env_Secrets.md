# 04 - Environment Variables and Secrets

What they are
- Config values stored outside code.
- Used for API keys and service URLs.

Frontend
- `PYTHON_BACKEND_URL` (points to FastAPI).

Backend
- `GEMINI_API_KEY`
- `TAVILY_API_KEY`
- `STORAGE_PATH` (optional)

Where to set
- Use `.env.local` for local dev.

Common errors
- Missing keys -> 500 errors from FastAPI.
- Wrong backend URL -> proxy fetch fails.
