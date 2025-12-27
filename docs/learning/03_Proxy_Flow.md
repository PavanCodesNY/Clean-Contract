# 03 - Frontend to Backend Flow

Why a proxy exists
- Keeps API keys on the backend.
- Avoids CORS issues.
- Single place for error handling.

Flow in this project
1) UI calls `/api/chat`.
2) Next.js proxy forwards to FastAPI.
3) FastAPI calls Gemini and returns JSON.
4) UI renders the answer.

Files involved
- UI: `app/(app)/see-chat/page.tsx`
- Proxy: `app/api/chat/route.ts`
- Backend: `backend/main.py`

Debug tip
- Check DevTools Network tab for `/api/*` requests.
- If it fails, check FastAPI logs.
