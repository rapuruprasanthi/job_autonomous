from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[float] = 0.0
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    notice_period_days: Optional[int] = 30
    current_ctc: Optional[str] = None
    expected_ctc: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    experience_years: float
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    notice_period_days: int
    current_ctc: Optional[str] = None
    expected_ctc: Optional[str] = None

    class Config:
        from_attributes = True

class MasterResumePaste(BaseModel):
    raw_text: str

class MasterResumeResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    raw_text: Optional[str] = None
    structured_json: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True

class PreferencesUpdate(BaseModel):
    target_titles: List[str] = Field(default_factory=list, description="Target job titles (maximum 3)")
    target_locations: List[str] = Field(default_factory=list)
    min_salary: int = 0
    preferred_work_modes: List[str] = Field(default_factory=lambda: ["Remote"])
    allowed_job_types: List[str] = Field(default_factory=lambda: ["Full-time"])
    experience_level: str = "Mid-Level"

    @field_validator("target_titles")
    def validate_target_titles(cls, v):
        if len(v) > 3:
            raise ValueError("You can select a maximum of 3 target job titles.")
        return v

class PreferencesResponse(BaseModel):
    id: int
    user_id: int
    target_titles: List[str]
    target_locations: List[str]
    min_salary: int
    preferred_work_modes: List[str]
    allowed_job_types: List[str]
    experience_level: str

    class Config:
        from_attributes = True
