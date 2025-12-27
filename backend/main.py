"""
Clauseflow - FastAPI Backend

Main entry point for the Python backend services.
Handles:
- AI chat via Claude API
- Research via Tavily API
- Contract generation via python-docx
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
import uuid

from dotenv import load_dotenv
from ai.gemini import build_gemini_client
from ai.prompts import ANALYSIS_PROMPT, REWRITE_PROMPT, SYSTEM_PROMPT
from contracts.formatter import build_contract_doc, save_contract_doc, save_contract_pdf
from contracts.latex import compile_latex_to_pdf, render_latex
from contracts.parser import extract_text
from research.searcher import TavilyResearcher

load_dotenv(".env.local")

# Initialize FastAPI app
app = FastAPI(
    title="Clauseflow API",
    description="AI-powered contract generation with research-first methodology",
    version="1.0.0",
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str


class ResearchRequest(BaseModel):
    contract_type: str
    jurisdiction: Optional[str] = None
    industry: Optional[str] = None


class ResearchResponse(BaseModel):
    results: dict
    completed_areas: list[str]


class AnalyzeRequest(BaseModel):
    contract_text: str
    contract_type: str
    jurisdiction: Optional[str] = None
    industry: Optional[str] = None


class AnalyzeResponse(BaseModel):
    recommendations: str
    research: dict


class RecommendationAction(BaseModel):
    section: str
    text: str
    action: str
    user_note: Optional[str] = None


class RewriteRequest(BaseModel):
    contract_text: str
    contract_type: str
    jurisdiction: Optional[str] = None
    industry: Optional[str] = None
    recommendations: list[RecommendationAction]


class RewriteResponse(BaseModel):
    rewritten_text: str


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "contract-generator-api"}


# Chat endpoint (placeholder - will be implemented in Phase 3)
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process chat message through Gemini 2.5 Flash.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")

    client = build_gemini_client()
    response_text = client.generate(request.message, SYSTEM_PROMPT)
    conversation_id = request.conversation_id or str(uuid.uuid4())
    return ChatResponse(response=response_text, conversation_id=conversation_id)


# Research endpoint (placeholder - will be implemented in Phase 4)
@app.post("/api/research", response_model=ResearchResponse)
async def research(request: ResearchRequest):
    """
    Conduct research for contract generation.
    """
    try:
        researcher = TavilyResearcher()
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    topic_parts = [request.contract_type]
    if request.industry:
        topic_parts.append(request.industry)
    if request.jurisdiction:
        topic_parts.append(f"{request.jurisdiction} jurisdiction")
    topic = " / ".join(topic_parts)

    results = researcher.run(topic)
    return ResearchResponse(
        results=results,
        completed_areas=list(results.keys()),
    )


@app.post("/api/upload")
async def upload_contract(file: UploadFile = File(...)):
    data = await file.read()
    try:
        text, file_type = extract_text(file.filename or "", file.content_type or "", data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    storage_path = os.getenv("STORAGE_PATH", "./storage")
    uploads_path = os.path.join(storage_path, "uploads")
    os.makedirs(uploads_path, exist_ok=True)
    file_id = uuid.uuid4().hex
    safe_name = file.filename or f"upload-{file_id}"
    stored_path = os.path.join(uploads_path, f"{file_id}-{safe_name}")
    with open(stored_path, "wb") as handle:
        handle.write(data)
    return {
        "file_id": file_id,
        "filename": safe_name,
        "stored_path": stored_path,
        "text": text,
        "file_type": file_type,
    }


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_contract(request: AnalyzeRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")

    try:
        researcher = TavilyResearcher()
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    topic_parts = [request.contract_type]
    if request.industry:
        topic_parts.append(request.industry)
    if request.jurisdiction:
        topic_parts.append(f"{request.jurisdiction} jurisdiction")
    topic = " / ".join(topic_parts)
    research_results = researcher.run(topic)

    prompt = (
        f"Contract type: {request.contract_type}\n"
        f"Jurisdiction: {request.jurisdiction or 'Not specified'}\n"
        f"Industry: {request.industry or 'Not specified'}\n\n"
        "Contract text:\n"
        f"{request.contract_text}\n\n"
        "Research signals:\n"
        f"{research_results}\n"
    )

    client = build_gemini_client()
    recommendations = client.generate(prompt, ANALYSIS_PROMPT)
    return AnalyzeResponse(recommendations=recommendations, research=research_results)


@app.post("/api/rewrite", response_model=RewriteResponse)
async def rewrite_contract(request: RewriteRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")

    accepted = [
        r
        for r in request.recommendations
        if r.action.lower() in {"apply", "user"}
    ]
    rec_text = "\n".join(
        f"- {r.section}: {r.text} (note: {r.user_note or 'none'})" for r in accepted
    )
    prompt = (
        f"Contract type: {request.contract_type}\n"
        f"Jurisdiction: {request.jurisdiction or 'Not specified'}\n"
        f"Industry: {request.industry or 'Not specified'}\n\n"
        "Accepted recommendations:\n"
        f"{rec_text}\n\n"
        "Original contract:\n"
        f"{request.contract_text}\n"
    )

    client = build_gemini_client()
    rewritten_text = client.generate(prompt, REWRITE_PROMPT)
    return RewriteResponse(rewritten_text=rewritten_text)


@app.post("/api/preview")
async def preview_contract(
    title: str = Form(...),
    body: str = Form(...),
    party_a: str | None = Form(None),
    party_b: str | None = Form(None),
    effective_date: str | None = Form(None),
):
    storage_path = os.getenv("GENERATED_CONTRACTS_PATH", "./generated")
    filename = f"preview-{uuid.uuid4().hex}.pdf"
    output_path = os.path.join(storage_path, filename)
    latex = render_latex(
        title=title,
        body=body,
        party_a=party_a,
        party_b=party_b,
        effective_date=effective_date,
    )
    output_path = compile_latex_to_pdf(latex, output_path)
    return FileResponse(output_path, filename=filename, media_type="application/pdf")


@app.post("/api/format")
async def format_contract(
    title: str = Form(...),
    body: str = Form(...),
    party_a: str | None = Form(None),
    party_b: str | None = Form(None),
    effective_date: str | None = Form(None),
    output_format: str = Form("docx"),
):
    storage_path = os.getenv("GENERATED_CONTRACTS_PATH", "./generated")
    if output_format == "pdf":
        filename = f"contract-{uuid.uuid4().hex}.pdf"
        output_path = os.path.join(storage_path, filename)
        latex = render_latex(
            title=title,
            body=body,
            party_a=party_a,
            party_b=party_b,
            effective_date=effective_date,
        )
        output_path = compile_latex_to_pdf(latex, output_path)
        return FileResponse(output_path, filename=filename, media_type="application/pdf")
    if output_format == "docx":
        filename = f"contract-{uuid.uuid4().hex}.docx"
        doc = build_contract_doc(
            title=title,
            body=body,
            party_a=party_a,
            party_b=party_b,
            effective_date=effective_date,
        )
        output_path = save_contract_doc(doc, filename, storage_path)
        return FileResponse(
            output_path,
            filename=filename,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    raise HTTPException(status_code=400, detail="Unsupported format. Use pdf or docx.")

# Contract generation endpoint (placeholder - will be implemented in Phase 5)
@app.post("/api/generate")
async def generate_contract(terms: dict):
    """
    Generate contract document from terms.

    This is a placeholder - full implementation in Phase 5.
    """
    return {"status": "Contract generation coming in Phase 5"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
