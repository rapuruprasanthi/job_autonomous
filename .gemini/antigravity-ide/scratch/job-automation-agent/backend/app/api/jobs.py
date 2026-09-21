from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.entities import User, Job, Portal
from app.schemas.job import JobResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs Discovery"])

@router.get("", response_model=List[JobResponse])
def get_jobs(
    is_relevant: Optional[bool] = None,
    portal_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    if is_relevant is not None:
        query = query.filter(Job.is_relevant == is_relevant)
    if portal_id:
        query = query.filter(Job.portal_id == portal_id)
    if search:
        s = f"%{search}%"
        query = query.filter((Job.title.ilike(s)) | (Job.company.ilike(s)))

    jobs = query.order_by(Job.score.desc()).all()
    res = []
    for j in jobs:
        portal = db.query(Portal).filter(Portal.id == j.portal_id).first()
        res.append(JobResponse(
            id=j.id,
            portal_id=j.portal_id,
            portal_name=portal.name if portal else "Unknown",
            external_id=j.external_id,
            title=j.title,
            company=j.company,
            location=j.location,
            work_mode=j.work_mode,
            salary_range=j.salary_range,
            description=j.description,
            url=j.url,
            score=j.score,
            reasoning=j.reasoning,
            is_relevant=j.is_relevant,
            created_at=j.created_at
        ))
    return res

@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(
    job_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    j = db.query(Job).filter(Job.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job posting not found")

    portal = db.query(Portal).filter(Portal.id == j.portal_id).first()
    return JobResponse(
        id=j.id,
        portal_id=j.portal_id,
        portal_name=portal.name if portal else "Unknown",
        external_id=j.external_id,
        title=j.title,
        company=j.company,
        location=j.location,
        work_mode=j.work_mode,
        salary_range=j.salary_range,
        description=j.description,
        url=j.url,
        score=j.score,
        reasoning=j.reasoning,
        is_relevant=j.is_relevant,
        created_at=j.created_at
    )
