import csv
import io
from fastapi import APIRouter, Depends, Response, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.entities import User, ActivityLog, Application, Job, OutreachEmail, CandidateProfile, MasterResume, Preferences
from app.core.deps import get_current_user

router = APIRouter(prefix="/activity", tags=["Activity Timeline & Audit"])

@router.get("")
def get_activity_timeline(
    event_type: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id)
    if event_type:
        query = query.filter(ActivityLog.event_type == event_type)

    logs = query.order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return logs

@router.get("/export/csv")
def export_audit_csv(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).order_by(ActivityLog.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Event Type", "Title", "Description", "Portal Name"])

    for l in logs:
        writer.writerow([l.id, l.created_at.isoformat(), l.event_type, l.title, l.description or "", l.portal_name or ""])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=activity_audit_trail.csv"}
    )

@router.delete("/privacy/delete-my-data")
def delete_candidate_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Data privacy endpoint: Purges candidate profile, master resume, applications, and logs.
    """
    db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).delete()
    db.query(OutreachEmail).filter(OutreachEmail.user_id == current_user.id).delete()
    db.query(Application).filter(Application.user_id == current_user.id).delete()
    db.query(MasterResume).filter(MasterResume.user_id == current_user.id).delete()
    db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).delete()
    db.query(Preferences).filter(Preferences.user_id == current_user.id).delete()
    db.commit()

    return {"message": "All personal data for candidate has been permanently deleted."}
