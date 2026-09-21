from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from app.db.session import get_db
from app.models.entities import (
    User, Job, Application, ApplicationStatus, Contact, OutreachEmail, EmailStatus, EmailClassification, Portal
)
from app.core.deps import get_current_user
from app.services.learning import compute_learning_insights

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])

@router.get("/stats")
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Dict[str, Any]:
    jobs_discovered = db.query(Job).count()
    jobs_relevant = db.query(Job).filter(Job.is_relevant == True).count()
    
    apps_submitted = db.query(Application).filter(
        Application.user_id == current_user.id, 
        Application.status == ApplicationStatus.APPLIED
    ).count()
    
    apps_queued = db.query(Application).filter(
        Application.user_id == current_user.id, 
        Application.status == ApplicationStatus.QUEUED_FOR_APPROVAL
    ).count()

    interviews = db.query(Application).filter(
        Application.user_id == current_user.id, 
        Application.status == ApplicationStatus.INTERVIEW
    ).count()

    contacts_found = db.query(Contact).count()
    emails_sent = db.query(OutreachEmail).filter(OutreachEmail.user_id == current_user.id).count()
    replies_received = db.query(OutreachEmail).filter(
        OutreachEmail.user_id == current_user.id, 
        OutreachEmail.status == EmailStatus.REPLIED
    ).count()

    # Portal distribution
    portals = db.query(Portal).all()
    portal_breakdown = []
    for p in portals:
        count = db.query(Job).filter(Job.portal_id == p.id).count()
        if count > 0:
            portal_breakdown.append({"portal": p.name, "count": count})

    # Application funnel
    funnel = [
        {"stage": "Discovered", "count": jobs_discovered},
        {"stage": "Relevant (70%+)", "count": jobs_relevant},
        {"stage": "Prepared / Queued", "count": apps_queued + apps_submitted},
        {"stage": "Applied", "count": apps_submitted},
        {"stage": "Interviews", "count": interviews}
    ]

    learning_insights = compute_learning_insights(db, current_user.id)

    return {
        "jobs_discovered": jobs_discovered,
        "jobs_relevant": jobs_relevant,
        "apps_submitted": apps_submitted,
        "apps_queued": apps_queued,
        "interviews": interviews,
        "contacts_found": contacts_found,
        "emails_sent": emails_sent,
        "replies_received": replies_received,
        "portal_breakdown": portal_breakdown,
        "funnel": funnel,
        "learning_insights": learning_insights
    }
