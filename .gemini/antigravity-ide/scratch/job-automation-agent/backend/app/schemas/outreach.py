from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.entities import EmailStatus, EmailClassification

class ContactResponse(BaseModel):
    id: int
    company_name: str
    name: str
    title: Optional[str] = None
    email: str
    linkedin_url: Optional[str] = None
    confidence_score: float
    do_not_contact: bool

    class Config:
        from_attributes = True

class EmailEventResponse(BaseModel):
    id: int
    event_type: str
    classification: Optional[EmailClassification] = None
    payload: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class OutreachEmailResponse(BaseModel):
    id: int
    user_id: int
    contact_id: int
    contact: Optional[ContactResponse] = None
    application_id: Optional[int] = None
    subject: str
    body: str
    template_variant: str
    subject_variant: str
    status: EmailStatus
    sent_at: Optional[datetime] = None
    follow_up_count: int
    next_follow_up_at: Optional[datetime] = None
    events: List[EmailEventResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ColdEmailDraftRequest(BaseModel):
    contact_id: int
    application_id: Optional[int] = None
