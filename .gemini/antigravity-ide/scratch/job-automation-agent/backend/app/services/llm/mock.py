import json
from typing import Dict, Any
from app.services.llm.base import BaseLLMClient

class MockLLMClient(BaseLLMClient):
    """
    Mock LLM client providing realistic responses for offline demo and testing.
    """
    def generate_json(self, prompt: str, schema_description: str = "") -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        
        # Scoring request
        if "score" in prompt_lower or "relevance" in prompt_lower:
            return {
                "score": 88.5,
                "reasoning": "Strong match in core stack (FastAPI, React, TypeScript, Python). Candidate has 4+ years relevant full-stack experience aligning with Senior Full Stack Developer position.",
                "matched_skills": ["Python", "FastAPI", "React", "TypeScript", "SQLAlchemy", "Docker"],
                "missing_skills": ["Kubernetes", "GraphQL"]
            }

        # Q&A answer request
        if "screening" in prompt_lower or "question" in prompt_lower:
            return {
                "answer": "I have 4+ years of professional experience building scalable web applications with Python, FastAPI, and React.",
                "confidence": 0.95,
                "is_sensitive": False
            }

        # Email classifier request
        if "classify" in prompt_lower or "email" in prompt_lower:
            return {
                "category": "interview_opportunity",
                "confidence": 0.92,
                "summary": "Recruiter invited candidate for an initial 30-minute introductory phone call."
            }

        return {
            "result": "Mock LLM structured response",
            "confidence": 0.90
        }

    def generate_text(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "cover letter" in prompt_lower:
            return "Dear Hiring Manager,\n\nI am excited to submit my application for this role. With strong technical expertise in Python, FastAPI, React, and cloud architecture, I look forward to contributing to your engineering team.\n\nBest regards,\nCandidate"
        
        if "cold email" in prompt_lower:
            return "Hi [Recruiter Name],\n\nI noticed your opening for a Senior Full Stack Engineer. Given my background building high-throughput FastAPI services and React interfaces, I would love to connect.\n\nBest,\nCandidate"

        return "Mock LLM generated text response."
