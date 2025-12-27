# Clauseflow - Project Overview

This document captures the high-level structure, data flow, and commands needed to understand or rebuild Clauseflow.

## What this app is
- Clauseflow is a Next.js (App Router) frontend with a FastAPI backend.
- The UI is minimal, research-first, and uses Framer Motion + Tailwind v4 (CSS-first config).
- The backend orchestrates AI (Gemini) and research (Tavily), plus document processing.

## High-level architecture
Frontend (Next.js)
- Routes live in `app/` and `app/(app)/`.
- `app/api/*` routes proxy to the Python backend for server-side requests.
- UI pages call `/api/*` endpoints, not the backend directly.

Backend (FastAPI)
- `backend/main.py` exposes all core APIs.
- AI: Gemini (google-genai) for chat/analysis/rewrite.
- Research: Tavily for web research summaries.
- Document generation: python-docx + PDF tools.

## Key routes (frontend)
- `/dashboard` - Overview workspace with upload, analyze, rewrite, and preview flows.
- `/settings` - Workspace settings.
- `/see-chat` - Chat UI (wrapped by a sidebar layout).

## Key routes (API proxy)
All proxy routes use `PYTHON_BACKEND_URL` (default: `http://localhost:8000`).
- `POST /api/chat` -> FastAPI `/api/chat`
- `POST /api/research` -> FastAPI `/api/research`
- `POST /api/upload` -> FastAPI `/api/upload`
- `POST /api/analyze` -> FastAPI `/api/analyze`
- `POST /api/rewrite` -> FastAPI `/api/rewrite`
- `POST /api/preview` -> FastAPI `/api/preview`
- `POST /api/format` -> FastAPI `/api/format`
- `POST /api/generate` -> FastAPI `/api/generate`

## Key routes (backend)
- `POST /api/chat` - Gemini chat response.
- `POST /api/research` - Tavily research results.
- `POST /api/upload` - Extract text from uploaded files.
- `POST /api/analyze` - Analyze contract text using AI + research.
- `POST /api/rewrite` - Rewrite contract based on recommendations.
- `POST /api/preview` - Generate preview file.
- `POST /api/format` - Format document output.
- `POST /api/generate` - Generate new contract from inputs.

## UI structure
- `components/layout/AppShell.tsx` - Shared layout for most app routes.
- `components/layout/SidebarFrame.tsx` - Dedicated sidebar layout for `/see-chat`.
- `app/(app)/see-chat/page.tsx` - Chat UI with history modal.
- `app/(app)/dashboard/page.tsx` - Overview UI with upload, analyze, rewrite.

## Styling system
- Tailwind CSS v4 with CSS-first config in `app/globals.css`.
- No `tailwind.config.js` (all theme variables in `@theme` block).
- Framer Motion is used for UI motion; AppShell default motion is disabled.

## Environment variables
Frontend
- `PYTHON_BACKEND_URL` - Base URL for the FastAPI backend.

Backend (`.env.local` for local dev)
- `GEMINI_API_KEY`
- `TAVILY_API_KEY`
- `STORAGE_PATH` (optional, defaults to `./storage`)

## Commands
Frontend
- `npm run dev` - Run Next.js (Turbopack)
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint

Backend
- `uvicorn main:app --reload --port 8000`

## Data flow (typical)
1) User triggers an action in UI (chat, research, analyze, upload).
2) UI calls `/api/*` (Next.js proxy route).
3) Proxy forwards to FastAPI backend.
4) Backend calls Gemini or Tavily or document tools.
5) Response returns to frontend and UI updates.

## Notes for new agents
- Use the latest package docs before making changes (see `Agents.md`).
- Tailwind is v4 (CSS-first config in `app/globals.css`).
- App routes are under `app/(app)/` and use `AppShell` or `SidebarFrame`.
- Avoid direct calls to the Python backend from the browser; use `/api/*` proxies.
- Keep Framer Motion usage consistent (no CSS transitions for layout shifts).

## System map (terms to reference)
UI / Frontend
- App Router: Next.js routing via `app/` and `app/(app)/`.
- Shell layout: `components/layout/AppShell.tsx` (shared layout + sidebar).
- SidebarFrame: `components/layout/SidebarFrame.tsx` (sidebar-only wrapper for chat).
- Chat UI: `app/(app)/see-chat/page.tsx` (Gemini + Tavily + history modal).
- Overview UI: `app/(app)/dashboard/page.tsx` (upload/analyze/rewrite/preview pipeline).
- Settings UI: `app/(app)/settings/page.tsx` (workspace controls).
- UI tokens: Tailwind v4 theme variables in `app/globals.css`.

API / Backend
- API proxy: `app/api/*` (Next.js routes that forward to FastAPI).
- FastAPI app: `backend/main.py` (all AI + document endpoints).
- Gemini client: `backend/ai/gemini.py` (Gemini model wrapper).
- Tavily research: `backend/research/searcher.py` (research orchestration).
- Contract pipeline: `backend/contracts/*` (parse, format, generate).

Data flow
- Frontend action -> `/api/*` proxy -> FastAPI -> AI/Research -> response -> UI render.

Common failure points
- Backend not running or wrong `PYTHON_BACKEND_URL`.
- Missing `GEMINI_API_KEY` or `TAVILY_API_KEY`.
- Hydration/layout issues in layout components (`AppShell`, `SidebarFrame`).

## Build-from-scratch checklist
- Initialize Next.js App Router with TypeScript (Next 15 + React 19 + TS 5.7).
- Add Tailwind v4 (CSS-first config) and set theme in `app/globals.css`.
- Install Framer Motion + lucide-react.
- Build layout components: `AppShell` and `SidebarFrame`.
- Create routes: `/dashboard`, `/settings`, `/see-chat`.
- Add Next.js API proxy routes under `app/api/*`.
- Build FastAPI backend in `backend/main.py` with core endpoints.
- Implement Gemini client and Tavily researcher.
- Wire UI actions to `/api/*` and handle errors.
- Set env vars and run frontend + backend.

## Agent prompt pack
1) “Set up Next.js 15 App Router + React 19 + TS 5.7 with Tailwind v4 CSS-first config. Use `app/globals.css` for `@theme` and no `tailwind.config.js`.”
2) “Create `AppShell` layout with a fixed sidebar (collapsed state persisted in localStorage) and a main content area. No page animations.”
3) “Create `/dashboard`, `/settings`, `/see-chat` pages. `/see-chat` uses `SidebarFrame`, not `AppShell`.”
4) “Build a chat UI on `/see-chat` with message list, input, quick prompt chips, and a small history modal button.”
5) “Add Next.js API proxy routes under `app/api/*` to forward to FastAPI backend.”
6) “Create FastAPI backend in `backend/main.py` with endpoints: chat, research, upload, analyze, rewrite, preview, format, generate.”
7) “Implement Gemini client and Tavily research; wire them to `/api/chat` and `/api/research`.”
8) “Connect frontend buttons to `/api/*` endpoints and handle errors cleanly.”

## How frontend integrates with backend (practical overview)
Concepts
- The browser talks to Next.js routes at `/api/*` (same origin).
- Those routes proxy the request to the FastAPI server (`PYTHON_BACKEND_URL`).
- FastAPI performs the real work (Gemini, Tavily, file parsing) and returns JSON.
- The frontend updates UI state based on that JSON.

Why a proxy layer exists
- Avoids CORS headaches and leaking backend URLs in the browser.
- Lets you keep API keys only on the backend.
- Provides a single place to handle errors and timeouts.

Typical flow
1) User clicks a button in the UI (e.g., “Run research”).
2) Frontend `fetch("/api/research", { method: "POST", body: ... })`.
3) Next.js `app/api/research/route.ts` forwards the request to FastAPI.
4) FastAPI runs Tavily, returns JSON results.
5) UI shows the results or an error banner.

What to check when backend calls fail
- Is FastAPI running on the expected port?
- Is `PYTHON_BACKEND_URL` set correctly?
- Do you have `GEMINI_API_KEY` / `TAVILY_API_KEY` in `.env.local`?
- Does the FastAPI endpoint exist and return valid JSON?

## Backend learning path (short, step-by-step)
Goal: understand enough backend fundamentals to debug and extend Clauseflow.

Step 1: What a backend is
- It’s a separate server that receives requests, runs logic, and returns JSON.
- In this project, the backend is FastAPI (`backend/main.py`).

Step 2: Run the backend locally
- `cd backend`
- `uvicorn main:app --reload --port 8000`
- Visit `http://localhost:8000/health` to confirm it’s running.

Step 3: Learn the request/response shape
- Read `ChatRequest` and `ChatResponse` in `backend/main.py`.
- Notice: request is JSON (`message`, `conversation_id`), response is JSON.

Step 4: Trace a real call end-to-end
- Frontend: `app/(app)/see-chat/page.tsx` sends `fetch("/api/chat")`.
- Proxy: `app/api/chat/route.ts` forwards to FastAPI.
- Backend: `/api/chat` in `backend/main.py` calls Gemini and returns JSON.

Step 5: Understand environment variables
- Backend uses `.env.local` for secrets (Gemini/Tavily keys).
- Frontend only needs `PYTHON_BACKEND_URL`.
- If a key is missing, FastAPI returns a 500 error.

Step 6: Learn the core endpoints (what they do)
- `/api/chat`: Gemini response for chat.
- `/api/research`: Tavily research bundle.
- `/api/upload`: parse files and extract text.
- `/api/analyze`: analyze contract text with research.
- `/api/rewrite`: apply decisions to rewrite the contract.

Step 7: Basic debugging
- If UI fails, check Network tab in DevTools for the `/api/*` call.
- If proxy fails, check FastAPI logs.
- If FastAPI fails, check env vars and request payload.

Optional: Databases (not used yet)
- This project is file + API driven; there is no DB right now.
- If you add a DB later, the backend would read/write data in FastAPI.
