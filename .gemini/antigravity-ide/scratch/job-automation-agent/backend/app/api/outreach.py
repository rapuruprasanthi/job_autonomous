from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.session import get_db
from app.models.entities import User, Contact, Application, OutreachEmail, AgentSettings, OperatingMode
from app.schemas.outreach import ContactResponse, OutreachEmailResponse, ColdEmailDraftRequest
from app.core.deps import get_current_user
from app.services.contact_discovery import ContactDiscoveryService
from app.services.email_service import send_or_queue_outreach, simulate_recruiter_reply
from app.services.learning import compute_learning_insights

router = APIRouter(prefix="/outreach", tags=["HR Outreach & Emailing"])

@router.get("/contacts", response_model=List[ContactResponse])
def get_contacts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Contact).filter(Contact.do_not_contact == False).order_by(Contact.company_name).all()

@router.post("/discover/{company_name}", response_model=List[ContactResponse])
def discover_contacts(
    company_name: str, 
    role: Optional[str] = "Software Engineer",
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    service = ContactDiscoveryService()
    contacts = service.discover_contacts_for_company(company_name, role, db, current_user.id)
    return contacts

@router.get("/emails", response_model=List[OutreachEmailResponse])
def get_outreach_emails(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    emails = db.query(OutreachEmail).filter(OutreachEmail.user_id == current_user.id).order_by(OutreachEmail.created_at.desc()).all()
    res = []
    for e in emails:
        c = db.query(Contact).filter(Contact.id == e.contact_id).first()
        contact_resp = ContactResponse(
            id=c.id, company_name=c.company_name, name=c.name, title=c.title,
            email=c.email, linkedin_url=c.linkedin_url, confidence_score=c.confidence_score,
            do_not_contact=c.do_not_contact
        ) if c else None

        res.append(OutreachEmailResponse(
            id=e.id, user_id=e.user_id, contact_id=e.contact_id, contact=contact_resp,
            application_id=e.application_id, subject=e.subject, body=e.body,
            template_variant=e.template_variant, subject_variant=e.subject_variant,
            status=e.status, sent_at=e.sent_at, follow_up_count=e.follow_up_count,
            next_follow_up_at=e.next_follow_up_at, events=e.events or [], created_at=e.created_at
        ))
    return res

@router.post("/emails/draft", response_model=OutreachEmailResponse)
def draft_cold_email(
    req: ColdEmailDraftRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(Contact).filter(Contact.id == req.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    app = db.query(Application).filter(Application.id == req.application_id).first() if req.application_id else None
    settings_obj = db.query(AgentSettings).filter(AgentSettings.user_id == current_user.id).first()
    mode = settings_obj.mode if settings_obj else OperatingMode.APPROVAL

    email = send_or_queue_outreach(db, current_user.id, contact, app, mode)

    contact_resp = ContactResponse(
        id=contact.id, company_name=contact.company_name, name=contact.name, title=contact.title,
        email=contact.email, linkedin_url=contact.linkedin_url, confidence_score=contact.confidence_score,
        do_not_contact=contact.do_not_contact
    )

    return OutreachEmailResponse(
        id=email.id, user_id=email.user_id, contact_id=email.contact_id, contact=contact_resp,
        application_id=email.application_id, subject=email.subject, body=email.body,
        template_variant=email.template_variant, subject_variant=email.subject_variant,
        status=email.status, sent_at=email.sent_at, follow_up_count=email.follow_up_count,
        next_follow_up_at=email.next_follow_up_at, events=email.events or [], created_at=email.created_at
    )

@router.post("/emails/{email_id}/simulate-reply")
def simulate_reply(
    email_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = simulate_recruiter_reply(db, email_id)
    return {"message": "Simulated recruiter reply received and classified.", "event_id": event.id}

@router.get("/insights")
def get_insights(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Dict[str, Any]:
    return compute_learning_insights(db, current_user.id)
