# 01 - Backend Basics (FastAPI)

What a backend does
- Receives HTTP requests.
- Runs logic (AI, research, files).
- Returns a JSON response.

In this project
- Backend code: `backend/main.py`.
- Framework: FastAPI.
- Runs at: `http://localhost:8000`.

Run it
- `cd backend`
- `uvicorn main:app --reload --port 8000`
- Visit `http://localhost:8000/health`.

Think of endpoints as functions
- URL + HTTP method -> Python function.
- Example: `POST /api/chat` -> `chat()` in `backend/main.py`.
