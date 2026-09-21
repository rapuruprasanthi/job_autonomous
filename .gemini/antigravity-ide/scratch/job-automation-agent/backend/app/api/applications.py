from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.db.session import get_db
from app.models.entities import User, Application, Job, Portal, ResumeVersion, ApplicationStatus
from app.schemas.application import ApplicationResponse, ResumeVersionResponse
from app.schemas.job import JobResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/applications", tags=["Applications Engine"])

@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    status_filter: Optional[ApplicationStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Application).filter(Application.user_id == current_user.id)
    if status_filter:
        query = query.filter(Application.status == status_filter)
        
    apps = query.order_by(Application.created_at.desc()).all()
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

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application_by_id(
    app_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    a = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")

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

    return ApplicationResponse(
        id=a.id, user_id=a.user_id, job_id=a.job_id, job=job_resp,
        portal_id=a.portal_id, portal_name=portal.name if portal else "Unknown",
        resume_version_id=a.resume_version_id, resume_version=rv_resp,
        status=a.status, screening_qa=a.screening_qa or [], notes=a.notes,
        applied_at=a.applied_at, created_at=a.created_at
    )

@router.get("/{app_id}/resume/download")
def download_tailored_resume(
    app_id: int, 
    format: str = "tex",
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    a = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not a or not a.resume_version_id:
        raise HTTPException(status_code=404, detail="Resume version not found for application")

    rv = db.query(ResumeVersion).filter(ResumeVersion.id == a.resume_version_id).first()
    if not rv:
        raise HTTPException(status_code=404, detail="Resume version not found")

    if format == "pdf" and rv.pdf_path and os.path.exists(rv.pdf_path) and rv.pdf_path.endswith(".pdf"):
        return FileResponse(rv.pdf_path, media_type="application/pdf", filename=f"resume_{a.job_id}.pdf")
    
    # Return LaTeX text
    return PlainTextResponse(rv.tex_content, media_type="text/x-tex", headers={
        "Content-Disposition": f"attachment; filename=resume_{a.job_id}.tex"
    })
