"""
Configuration management for the backend.

Uses pydantic-settings for environment variable validation.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Keys
    anthropic_api_key: str = ""
    tavily_api_key: str = ""

    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # File storage
    storage_path: str = "./storage"
    generated_contracts_path: str = "./generated"

    # Claude configuration
    claude_model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 4096

    class Config:
        env_file = "../.env.local"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
