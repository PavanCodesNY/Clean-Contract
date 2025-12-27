import os
from typing import Any

from tavily import TavilyClient


MANDATORY_AREAS = [
    "Contract standards",
    "Industry norms",
    "Jurisdiction requirements",
    "Deal benchmarks",
    "Common disputes",
    "Recent developments",
    "Power dynamics",
    "Termination scenarios",
    "Enforceability",
    "Alternative structures",
]


class TavilyResearcher:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("TAVILY_API_KEY")
        if not self.api_key:
            raise ValueError("TAVILY_API_KEY is not set")
        self.client = TavilyClient(api_key=self.api_key)

    def search_area(self, topic: str, area: str) -> dict[str, Any]:
        query = f"{topic} — {area}"
        return self.client.search(query=query, search_depth="advanced", max_results=5)

    def run(self, topic: str) -> dict[str, Any]:
        results: dict[str, Any] = {}
        for area in MANDATORY_AREAS:
            results[area] = self.search_area(topic, area)
        return results
