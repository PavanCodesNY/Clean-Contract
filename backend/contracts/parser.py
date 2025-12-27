from typing import Tuple

from io import BytesIO

import pymupdf
from docx import Document


def extract_text(filename: str, content_type: str, data: bytes) -> Tuple[str, str]:
    if content_type in {"text/plain"} or filename.endswith(".txt"):
        return data.decode("utf-8", errors="ignore"), "txt"
    if content_type in {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"} or filename.endswith(
        ".docx"
    ):
        doc = Document(BytesIO(data))
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        return text, "docx"
    if filename.endswith(".pdf") or content_type == "application/pdf":
        doc = pymupdf.open(stream=data, filetype="pdf")
        pages = [page.get_text(sort=True) for page in doc]
        text = "\n".join(text for text in pages if text.strip())
        if not text.strip():
            raise ValueError("No text found in PDF. It may be scanned or image-based.")
        return text, "pdf"
    raise ValueError("Unsupported file type. Use .docx, .txt, or .pdf.")
