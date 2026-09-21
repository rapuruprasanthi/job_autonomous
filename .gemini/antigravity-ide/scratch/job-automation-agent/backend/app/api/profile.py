from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.session import get_db
from app.models.entities import User, CandidateProfile, MasterResume, Preferences
from app.schemas.profile import (
    ProfileUpdate, ProfileResponse, 
    MasterResumePaste, MasterResumeResponse,
    PreferencesUpdate, PreferencesResponse
)
from app.core.deps import get_current_user
from app.services.resume_parser import parse_raw_resume_text

router = APIRouter(prefix="/profile", tags=["Candidate Profile"])

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile_in: ProfileUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
    
    for field, val in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, val)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/resume", response_model=MasterResumeResponse)
def get_master_resume(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(MasterResume).filter(MasterResume.user_id == current_user.id).first()
    if not resume:
        resume = MasterResume(user_id=current_user.id, raw_text="", structured_json={})
        db.add(resume)
        db.commit()
        db.refresh(resume)
    return resume

@router.post("/resume/paste", response_model=MasterResumeResponse)
def paste_master_resume(
    body: MasterResumePaste, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    parsed = parse_raw_resume_text(body.raw_text)
    resume = db.query(MasterResume).filter(MasterResume.user_id == current_user.id).first()
    if not resume:
        resume = MasterResume(user_id=current_user.id)
        db.add(resume)
        
    resume.raw_text = body.raw_text
    resume.structured_json = parsed
    db.commit()
    db.refresh(resume)
    return resume

@router.post("/resume/upload", response_model=MasterResumeResponse)
async def upload_master_resume(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    content_bytes = await file.read()
    try:
        raw_text = content_bytes.decode("utf-8", errors="ignore")
    except Exception:
        raw_text = f"Resume uploaded: {file.filename}"
        
    parsed = parse_raw_resume_text(raw_text)
    resume = db.query(MasterResume).filter(MasterResume.user_id == current_user.id).first()
    if not resume:
        resume = MasterResume(user_id=current_user.id)
        db.add(resume)
        
    resume.raw_text = raw_text
    resume.structured_json = parsed
    resume.file_path = f"uploads/{current_user.id}_{file.filename}"
    db.commit()
    db.refresh(resume)
    return resume

@router.put("/resume/structured", response_model=MasterResumeResponse)
def update_structured_resume(
    structured_json: Dict[str, Any], 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    resume = db.query(MasterResume).filter(MasterResume.user_id == current_user.id).first()
    if not resume:
        resume = MasterResume(user_id=current_user.id)
        db.add(resume)
        
    resume.structured_json = structured_json
    db.commit()
    db.refresh(resume)
    return resume

@router.get("/preferences", response_model=PreferencesResponse)
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prefs = db.query(Preferences).filter(Preferences.user_id == current_user.id).first()
    if not prefs:
        prefs = Preferences(user_id=current_user.id, target_titles=["Software Engineer"])
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs

@router.put("/preferences", response_model=PreferencesResponse)
def update_preferences(
    prefs_in: PreferencesUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    prefs = db.query(Preferences).filter(Preferences.user_id == current_user.id).first()
    if not prefs:
        prefs = Preferences(user_id=current_user.id)
        db.add(prefs)
        
    for field, val in prefs_in.model_dump(exclude_unset=True).items():
        setattr(prefs, field, val)
        
    db.commit()
    db.refresh(prefs)
    return prefs
