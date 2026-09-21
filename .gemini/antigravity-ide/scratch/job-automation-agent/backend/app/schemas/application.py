from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.entities import ApplicationStatus
from app.schemas.job import JobResponse

class ScreeningQASchema(BaseModel):
    question: str
    answer: str
    source: str
    confidence: float
    needs_approval: bool = False

class ResumeVersionResponse(BaseModel):
    id: int
    template_used: str
    keywords_added: List[str]
    tex_content: str
    pdf_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    job: Optional[JobResponse] = None
    portal_id: int
    portal_name: str
    resume_version_id: Optional[int] = None
    resume_version: Optional[ResumeVersionResponse] = None
    status: ApplicationStatus
    screening_qa: List[ScreeningQASchema]
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationApprovalAction(BaseModel):
    action: str  # approve, reject, edit
    edited_qa: Optional[List[ScreeningQASchema]] = None
    notes: Optional[str] = None
