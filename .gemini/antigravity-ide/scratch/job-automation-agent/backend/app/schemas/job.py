from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobResponse(BaseModel):
    id: int
    portal_id: int
    portal_name: str
    external_id: Optional[str] = None
    title: str
    company: str
    location: Optional[str] = None
    work_mode: str
    salary_range: Optional[str] = None
    description: str
    url: str
    score: float
    reasoning: Optional[str] = None
    is_relevant: bool
    created_at: datetime

    class Config:
        from_attributes = True
