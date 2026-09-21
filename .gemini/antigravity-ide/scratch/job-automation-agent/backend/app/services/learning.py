from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import OutreachEmail, EmailEvent, EmailStatus, EmailClassification, Application, ApplicationStatus, Job

def compute_learning_insights(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Computes performance conversion analytics across email subject variants,
    resume templates, and portals. Produces prompt hints for future LLM generation.
    NOTE: Learning changes emphasis, style, ordering, never factual information.
    """
    total_emails = db.query(OutreachEmail).filter(OutreachEmail.user_id == user_id).count()
    total_replies = db.query(OutreachEmail).filter(
        OutreachEmail.user_id == user_id, 
        OutreachEmail.status == EmailStatus.REPLIED
    ).count()

    reply_rate = (total_replies / total_emails * 100.0) if total_emails > 0 else 0.0

    # Subject variant performance
    subject_stats: Dict[str, Dict[str, int]] = {}
    emails = db.query(OutreachEmail).filter(OutreachEmail.user_id == user_id).all()
    for e in emails:
        sv = e.subject_variant or "direct"
        if sv not in subject_stats:
            subject_stats[sv] = {"sent": 0, "replied": 0}
        subject_stats[sv]["sent"] += 1
        if e.status == EmailStatus.REPLIED:
            subject_stats[sv]["replied"] += 1

    best_subject_variant = "direct"
    best_rate = -1.0
    variant_conversion: Dict[str, float] = {}

    for sv, counts in subject_stats.items():
        rate = (counts["replied"] / counts["sent"] * 100.0) if counts["sent"] > 0 else 0.0
        variant_conversion[sv] = round(rate, 1)
        if rate > best_rate:
            best_rate = rate
            best_subject_variant = sv

    # Generate prompt hint
    prompt_hint = (
        f"Optimization Hint: Subject variant '{best_subject_variant}' achieves highest response rate ({best_rate:.1f}%). "
        f"Emphasize concise technical achievements and lead with core stack alignment."
    )

    return {
        "total_emails_sent": total_emails,
        "total_replies_received": total_replies,
        "overall_reply_rate": round(reply_rate, 1),
        "best_subject_variant": best_subject_variant,
        "subject_variant_rates": variant_conversion,
        "prompt_hint": prompt_hint
    }
