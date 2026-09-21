from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.entities import User, Application, ApplicationStatus, KnowledgeEntry, Job, Portal, ResumeVersion
from app.schemas.application import ApplicationResponse, ApplicationApprovalAction, ResumeVersionResponse
from app.schemas.job import JobResponse
from app.core.deps import get_current_user
from app.services.audit import log_activity

router = APIRouter(prefix="/approvals", tags=["Human Approval Queue"])

@router.get("", response_model=List[ApplicationResponse])
def get_approval_queue(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apps = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.status == ApplicationStatus.QUEUED_FOR_APPROVAL
    ).order_by(Application.created_at.desc()).all()

    res = []
    for a in apps:
        job = db.query(Job).filter(Job.id == a.job_id).first()
        portal = db.query(Portal).filter(Portal.id == a.portal_id).first()
        rv = db.query(ResumeVersion).filter(ResumeVersion.id == a.resume_version_id).first() if a.resume_version_id else None

        job_resp = JobResponse(
            id=job.id, portal_id=job.portal_id, portal_name=portal.name if portal else "",
            external_id=job.external_id, title=job.title, company=job.company, location=job.location,
            work_mode=job.work_mode, salary_range=job.salary_range, description=job.description,
            url=job.url, score=job.score, reasoning=job.reasoning, is_relevant=job.is_relevant,
            created_at=job.created_at
        ) if job else None

        rv_resp = ResumeVersionResponse(
            id=rv.id, template_used=rv.template_used, keywords_added=rv.keywords_added or [],
            tex_content=rv.tex_content, pdf_path=rv.pdf_path, created_at=rv.created_at
        ) if rv else None

        res.append(ApplicationResponse(
            id=a.id, user_id=a.user_id, job_id=a.job_id, job=job_resp,
            portal_id=a.portal_id, portal_name=portal.name if portal else "Unknown",
            resume_version_id=a.resume_version_id, resume_version=rv_resp,
            status=a.status, screening_qa=a.screening_qa or [], notes=a.notes,
            applied_at=a.applied_at, created_at=a.created_at
        ))
    return res

@router.post("/{app_id}/action", response_model=ApplicationResponse)
def execute_approval_action(
    app_id: int,
    action_in: ApplicationApprovalAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    a = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found in queue")

    job = db.query(Job).filter(Job.id == a.job_id).first()

    if action_in.action == "approve":
        a.status = ApplicationStatus.APPLIED
        a.applied_at = datetime.now(timezone.utc)
        
        # Save confirmed answers to Knowledge Base for future automation
        if action_in.edited_qa:
            a.screening_qa = [q.model_dump() for q in action_in.edited_qa]

        for qa in a.screening_qa or []:
            if isinstance(qa, dict) and qa.get("answer"):
                kb_entry = KnowledgeEntry(
                    user_id=current_user.id,
                    category="General",
                    question_pattern=qa.get("question", ""),
                    answer=qa.get("answer", ""),
                    verified=True,
                    sensitive=qa.get("needs_approval", False)
                )
                db.add(kb_entry)

        log_activity(
            db, current_user.id, "APPLICATION_APPROVED",
            f"User approved application for {job.title} at {job.company}",
            "Application submitted successfully via human approval.",
            metadata_json={"application_id": a.id}
        )

    elif action_in.action == "reject":
        a.status = ApplicationStatus.REJECTED
        log_activity(
            db, current_user.id, "APPLICATION_REJECTED",
            f"User rejected application for {job.title} at {job.company}",
            f"Reason: {action_in.notes or 'User declined to apply'}",
            metadata_json={"application_id": a.id}
        )

    elif action_in.action == "edit" and action_in.edited_qa:
        a.screening_qa = [q.model_dump() for q in action_in.edited_qa]
        if action_in.notes:
            a.notes = action_in.notes

    db.commit()
    db.refresh(a)

    portal = db.query(Portal).filter(Portal.id == a.portal_id).first()
    rv = db.query(ResumeVersion).filter(ResumeVersion.id == a.resume_version_id).first() if a.resume_version_id else None

    job_resp = JobResponse(
        id=job.id, portal_id=job.portal_id, portal_name=portal.name if portal else "",
        external_id=job.external_id, title=job.title, company=job.company, location=job.location,
        work_mode=job.work_mode, salary_range=job.salary_range, description=job.description,
        url=job.url, score=job.score, reasoning=job.reasoning, is_relevant=job.is_relevant,
        created_at=job.created_at
    ) if job else None

    rv_resp = ResumeVersionResponse(
        id=rv.id, template_used=rv.template_used, keywords_added=rv.keywords_added or [],
        tex_content=rv.tex_content, pdf_path=rv.pdf_path, created_at=rv.created_at
    ) if rv else None

    return ApplicationResponse(
        id=a.id, user_id=a.user_id, job_id=a.job_id, job=job_resp,
        portal_id=a.portal_id, portal_name=portal.name if portal else "Unknown",
        resume_version_id=a.resume_version_id, resume_version=rv_resp,
        status=a.status, screening_qa=a.screening_qa or [], notes=a.notes,
        applied_at=a.applied_at, created_at=a.created_at
    )
