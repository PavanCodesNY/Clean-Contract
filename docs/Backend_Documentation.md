
## Overview
This document explains the backend implementation in detail: architecture, endpoints, dependencies, data flow, and the bugs encountered along the way. It is written to help you recreate or debug the backend without reading the source code.

---

## Architecture Summary
- **Backend framework**: FastAPI
- **Core services**:
  - Gemini 2.5 Flash for chat, analysis, and rewriting
  - Tavily for research across 10 mandatory areas
  - Local storage for uploads and generated files
  - LaTeX (tectonic) for premium PDF generation
- **Local file storage**:
  - Uploads: `STORAGE_PATH/uploads`
  - Generated files: `GENERATED_CONTRACTS_PATH`

---

## Installed Dependencies (Key)
- **google-genai**: Gemini SDK
- **tavily-python**: research/search
- **python-docx**: `.docx` generation
- **pymupdf**: PDF text extraction
- **reportlab**: (legacy PDF fallback; now superseded by LaTeX for PDFs)
- **python-dotenv**: environment loading

---

## Environment Variables
Required:
- `GEMINI_API_KEY` (Gemini Developer API key)
- `TAVILY_API_KEY` (Tavily API key)

Optional:
- `PYTHON_BACKEND_URL` (frontend → backend proxy)
- `STORAGE_PATH` (where uploads are saved)
- `GENERATED_CONTRACTS_PATH` (where formatted files are saved)

Note:
- If you run the backend inside `backend/`, keep a `backend/.env.local`.
- If you run from the project root, `.env.local` in root works.

---

## API Endpoints (Current)

### `POST /api/chat`
- **Purpose**: Gemini conversational assistant for contract intake.
- **Input**: `{ message, conversation_id? }`
- **Output**: `{ response, conversation_id }`
- **Notes**: Uses a system prompt focused on contract intake.

### `POST /api/research`
- **Purpose**: Tavily research across 10 mandatory areas.
- **Input**: `{ contract_type, jurisdiction?, industry? }`
- **Output**: `results` map keyed by research area + `completed_areas`.
- **Notes**: Runs all 10 areas. Only triggers calls when invoked.

### `POST /api/upload`
- **Purpose**: Upload a file and extract text.
- **Input**: multipart file (`.pdf`, `.docx`, `.txt`)
- **Output**: `{ file_id, filename, stored_path, text, file_type }`
- **Notes**: Files are persisted to `STORAGE_PATH/uploads`.

### `POST /api/analyze`
- **Purpose**: Gemini analysis with Tavily research signals.
- **Input**: `{ contract_text, contract_type, jurisdiction?, industry? }`
- **Output**: `{ recommendations, research }`
- **Notes**: Returns structured sections in markdown for UI parsing.

### `POST /api/rewrite`
- **Purpose**: Rewrite contract after recommendation decisions.
- **Input**:
  - contract text
  - recommendations list with `action` + optional `user_note`
- **Output**: `{ rewritten_text }`
- **Notes**: Only runs when user has decided all recommendations.

### `POST /api/format`
- **Purpose**: Export final contract as `.docx` or `.pdf`.
- **Input**: form data (`title`, `body`, `party_a`, `party_b`, `output_format`)
- **Output**: file response
- **Notes**: PDF uses LaTeX (tectonic). DOCX uses python-docx.

### `POST /api/preview`
- **Purpose**: Generate LaTeX PDF preview for embedded viewer.
- **Input**: same as `/api/format`
- **Output**: PDF stream
- **Notes**: This is used for live preview only.

---

## Document Parsing
- **TXT**: UTF-8 decode
- **DOCX**: python-docx paragraph extraction
- **PDF**: PyMuPDF text extraction (non‑OCR). Scanned/image PDFs return a clean error.

---

## LaTeX PDF Generation
- **Renderer**: `tectonic` CLI
- **Output**: Consistent formatting + signature blocks
- **Behavior**: Generates a PDF on demand for preview and export

---

## Known Limitations
- **Scanned PDFs**: No OCR yet (textless PDFs return a warning).
- **.doc export**: Not supported; only `.docx` and `.pdf`.
- **Preview performance**: LaTeX compilation is heavier than HTML rendering.

---

## Bugs Encountered & Fixes

1) **Missing python-dotenv**
- Error: `ModuleNotFoundError: No module named 'dotenv'`
- Cause: Not installed in the active interpreter.
- Fix: Install dependencies with the same Python interpreter (`python3 -m pip install -r requirements.txt`).

2) **Python 3.14 build failure**
- Error: `pyo3-ffi ... configured Python interpreter version (3.14) is newer than PyO3's maximum supported version`
- Cause: Pip was installing against Python 3.14.
- Fix: Use Python 3.12/3.11 with a dedicated venv.

3) **reportlab missing**
- Error: `ModuleNotFoundError: No module named 'reportlab'`
- Fix: Install from `backend/requirements.txt`, then restart backend.

4) **GEMINI_API_KEY not found**
- Error: `GEMINI_API_KEY is not set`
- Cause: Running backend from `backend/` without a local `.env.local`.
- Fix: Copy `.env.local` into `backend/.env.local` or run backend from root.

5) **PDF parsing not enabled**
- Initially blocked PDF uploads with a message.
- Fix: Added PyMuPDF extraction for PDF text.

6) **Hydration mismatch in frontend (not backend)**
- Occurred due to sidebar state rendering, fixed with state persistence and hydration suppression.

---

## Setup Checklist
1) Create venv with Python 3.12  
2) Install deps from `backend/requirements.txt`  
3) Create `backend/.env.local` with Gemini + Tavily keys  
4) Install `tectonic` for LaTeX PDF rendering  
5) Run `python main.py` from `backend/`  

---

## Safety Notes
- No external calls are made until you explicitly trigger `/api/research` or `/api/analyze`.
- Uploads and generated files remain local only.
- Tavily and Gemini are invoked only by explicit UI actions.

---

## Prompt Template for Full Backend Rebuild
“Build the Clauseflow backend in FastAPI with Gemini 2.5 Flash and Tavily. Include endpoints for chat, research (10 mandatory areas), upload (docx/txt/pdf), analyze (Gemini + Tavily), rewrite (after all recommendations are decided), format (docx + LaTeX PDF), and preview (LaTeX PDF stream). Persist uploads locally, generate signature‑ready docs, and use PyMuPDF for PDF text extraction. Use python-dotenv for `.env.local`, and document required keys. Keep all external calls behind explicit API actions.”
