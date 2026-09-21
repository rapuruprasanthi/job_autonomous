from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.entities import OperatingMode

class AgentSettingsUpdate(BaseModel):
    mode: Optional[OperatingMode] = None
    max_apps_per_day: Optional[int] = None
    max_apps_per_portal: Optional[int] = None
    follow_up_delay_days: Optional[int] = None
    max_follow_ups: Optional[int] = None
    min_relevance_score: Optional[float] = None
    is_running: Optional[bool] = None

class AgentSettingsResponse(BaseModel):
    id: int
    user_id: int
    mode: OperatingMode
    max_apps_per_day: int
    max_apps_per_portal: int
    follow_up_delay_days: int
    max_follow_ups: int
    min_relevance_score: float
    is_running: bool
    last_run_at: Optional[datetime] = None

    class Config:
        from_attributes = True
