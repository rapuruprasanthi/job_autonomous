from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class KnowledgeEntryCreate(BaseModel):
    category: str = "General"
    question_pattern: str
    answer: str
    verified: bool = True
    sensitive: bool = False

class KnowledgeEntryUpdate(BaseModel):
    category: Optional[str] = None
    question_pattern: Optional[str] = None
    answer: Optional[str] = None
    verified: Optional[bool] = None
    sensitive: Optional[bool] = None

class KnowledgeEntryResponse(BaseModel):
    id: int
    user_id: int
    category: str
    question_pattern: str
    answer: str
    verified: bool
    sensitive: bool
    created_at: datetime

    class Config:
        from_attributes = True
