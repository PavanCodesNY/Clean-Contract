import os

from google import genai
from google.genai import types


class GeminiClient:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.model = model or "gemini-2.5-flash"
        self.client = genai.Client(api_key=api_key)

    def generate(self, message: str, system_instruction: str) -> str:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
        )
        response = self.client.models.generate_content(
            model=self.model,
            contents=message,
            config=config,
        )
        return response.text or ""


def build_gemini_client() -> GeminiClient:
    api_key = os.getenv("GEMINI_API_KEY")
    return GeminiClient(api_key=api_key)
