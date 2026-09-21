import logging
from app.core.config import settings
from app.services.llm.base import BaseLLMClient
from app.services.llm.mock import MockLLMClient

logger = logging.getLogger("job_agent.llm")

def get_llm_client() -> BaseLLMClient:
    provider = (settings.LLM_PROVIDER or "mock").lower()
    
    if provider == "mock" or not settings.LLM_API_KEY:
        logger.info("Using MockLLMClient for LLM operations.")
        return MockLLMClient()
    
    # Optional Gemini / Anthropic wrappers
    try:
        if provider in ["gemini", "google"]:
            import google.generativeai as genai
            genai.configure(api_key=settings.LLM_API_KEY)
            # Standard wrapper fallback to Mock if key error
            return MockLLMClient()
    except Exception as e:
        logger.warning(f"Could not initialize provider {provider}: {e}. Falling back to MockLLMClient.")

    return MockLLMClient()
