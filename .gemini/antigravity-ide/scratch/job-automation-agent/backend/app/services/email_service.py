import random
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.entities import (
    User, Contact, Application, OutreachEmail, EmailEvent, EmailStatus, EmailClassification, OperatingMode, ActivityLog
)
from app.services.llm import get_llm_client
from app.services.email_classifier import classify_incoming_email
from app.services.audit import log_activity

logger = logging.getLogger("job_agent.email")

SUBJECT_VARIANTS = [
    ("direct", "Application for {role} - {candidate_name}"),
    ("value_prop", "Full-Stack Engineer with FastAPI & React experience - {role}"),
    ("intro", "Connecting regarding the {role} position at {company}")
]

def generate_cold_email_draft(
    candidate_name: str,
    role: str,
    company: str,
    contact_name: str,
    master_resume_json: Dict[str, Any],
    variant_idx: int = 0
) -> Tuple[str, str, str, str]:
    """
    Generates personalized cold email with A/B subject line variants and unsubscribe opt-out line.
    Returns (subject, body, template_variant, subject_variant).
    """
    subject_type, subject_fmt = SUBJECT_VARIANTS[variant_idx % len(SUBJECT_VARIANTS)]
    subject = subject_fmt.format(role=role, candidate_name=candidate_name, company=company)

    skills_str = ", ".join(master_resume_json.get("skills", ["Python", "FastAPI", "React"])[:4])

    body = f"""Hi {contact_name},

I noticed {company} is hiring for a {role} and wanted to reach out directly.

I am a Senior Full Stack Engineer specializing in {skills_str}. In my recent work, I built high-throughput web APIs and modern React frontends that reduced latency and improved user conversion.

I have attached my tailored resume for your reference. Would you have 10 minutes next week for a brief conversation regarding this role?

Best regards,
{candidate_name}

---
If you prefer not to receive further emails regarding this application, please reply with 'unsubscribe'.
"""
    return subject, body, "natural_concise", subject_type

def send_or_queue_outreach(
    db: Session,
    user_id: int,
    contact: Contact,
    application: Optional[Application],
    mode: OperatingMode
) -> OutreachEmail:
    """
    Drafts and sends/queues cold email outreach according to mode.
    """
    user = db.query(User).filter(User.id == user_id).first()
    master_resume_json = user.master_resume.structured_json if (user.master_resume and user.master_resume.structured_json) else {}
    
    role = application.job.title if (application and application.job) else "Software Engineer"
    company = contact.company_name

    subject, body, temp_var, subj_var = generate_cold_email_draft(
        user.full_name, role, company, contact.name, master_resume_json
    )

    initial_status = EmailStatus.SENT if mode == OperatingMode.AUTONOMOUS else EmailStatus.QUEUED

    email = OutreachEmail(
        user_id=user_id,
        contact_id=contact.id,
        application_id=application.id if application else None,
        subject=subject,
        body=body,
        template_variant=temp_var,
        subject_variant=subj_var,
        status=initial_status,
        sent_at=datetime.now(timezone.utc) if initial_status == EmailStatus.SENT else None,
        follow_up_count=0,
        next_follow_up_at=datetime.now(timezone.utc) + timedelta(days=3) if initial_status == EmailStatus.SENT else None
    )
    db.add(email)
    db.commit()
    db.refresh(email)

    event = EmailEvent(
        email_id=email.id,
        event_type="SENT" if initial_status == EmailStatus.SENT else "QUEUED",
        payload={"subject_variant": subj_var, "template_variant": temp_var}
    )
    db.add(event)
    db.commit()

    log_activity(
        db, user_id, "OUTREACH_EMAIL_SENT" if initial_status == EmailStatus.SENT else "OUTREACH_EMAIL_QUEUED",
        f"Cold Email to {contact.name} ({company})",
        f"Subject: '{subject}' | Status: {initial_status.value}",
        metadata_json={"email_id": email.id, "contact_id": contact.id}
    )

    return email

def simulate_recruiter_reply(db: Session, email_id: int) -> EmailEvent:
    """
    Simulates receiving a recruiter reply for testing and analytics.
    """
    email = db.query(OutreachEmail).filter(OutreachEmail.id == email_id).first()
    if not email:
        raise ValueError("Email not found")

    email.status = EmailStatus.REPLIED
    
    # Classify response
    sample_replies = [
        ("Re: Application", "Hi! Thanks for reaching out. We would love to set up an introductory call with our engineering manager. What is your availability this Thursday?"),
        ("Re: Application", "Thank you for your interest. Unfortunately we have decided to proceed with other candidates at this time.")
    ]
    subj_reply, body_reply = random.choice(sample_replies)
    category, conf, summary = classify_incoming_email(subj_reply, body_reply)

    event = EmailEvent(
        email_id=email.id,
        event_type="REPLIED",
        classification=category,
        payload={"subject": subj_reply, "body": body_reply, "confidence": conf, "summary": summary}
    )
    db.add(event)

    # Update associated application status
    if email.application_id:
        app = db.query(Application).filter(Application.id == email.application_id).first()
        if app:
            if category == EmailClassification.INTERVIEW_OPPORTUNITY:
                app.status = ApplicationStatus.INTERVIEW
            elif category == EmailClassification.REJECTION:
                app.status = ApplicationStatus.REJECTED

    db.commit()
    db.refresh(event)

    log_activity(
        db, email.user_id, "RECRUITER_RESPONSE_RECEIVED",
        f"Recruiter Reply from {email.contact.name} ({email.contact.company_name})",
        f"Classification: {category.value}. Summary: {summary}",
        metadata_json={"email_id": email.id, "classification": category.value}
    )

    return event
