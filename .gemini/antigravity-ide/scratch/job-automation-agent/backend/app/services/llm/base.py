from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLLMClient(ABC):
    @abstractmethod
    def generate_json(self, prompt: str, schema_description: str = "") -> Dict[str, Any]:
        """Generate structured JSON response from LLM."""
        pass

    @abstractmethod
    def generate_text(self, prompt: str) -> str:
        """Generate text response from LLM."""
        pass
