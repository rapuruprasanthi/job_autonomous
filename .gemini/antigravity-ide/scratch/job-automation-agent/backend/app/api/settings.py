from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import User, AgentSettings
from app.schemas.settings import AgentSettingsUpdate, AgentSettingsResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["Agent Settings"])

@router.get("/me", response_model=AgentSettingsResponse)
def get_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings_obj = db.query(AgentSettings).filter(AgentSettings.user_id == current_user.id).first()
    if not settings_obj:
        settings_obj = AgentSettings(user_id=current_user.id)
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj

@router.put("/me", response_model=AgentSettingsResponse)
def update_settings(
    settings_in: AgentSettingsUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    settings_obj = db.query(AgentSettings).filter(AgentSettings.user_id == current_user.id).first()
    if not settings_obj:
        settings_obj = AgentSettings(user_id=current_user.id)
        db.add(settings_obj)
        
    for field, val in settings_in.model_dump(exclude_unset=True).items():
        setattr(settings_obj, field, val)
        
    db.commit()
    db.refresh(settings_obj)
    return settings_obj
