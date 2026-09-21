import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import ActivityLog

logger = logging.getLogger("job_agent.audit")

def log_activity(
    db: Session,
    user_id: int,
    event_type: str,
    title: str,
    description: Optional[str] = None,
    portal_name: Optional[str] = None,
    metadata_json: Optional[Dict[str, Any]] = None
) -> ActivityLog:
    """
    Appends an immutable activity event log entry.
    """
    activity = ActivityLog(
        user_id=user_id,
        event_type=event_type,
        title=title,
        description=description,
        portal_name=portal_name,
        metadata_json=metadata_json
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    logger.info(f"Audit Activity [{event_type}]: {title}")
    return activity
