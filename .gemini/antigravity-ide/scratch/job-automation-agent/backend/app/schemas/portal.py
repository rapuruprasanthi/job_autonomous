from pydantic import BaseModel
from typing import Optional

class PortalUpdate(BaseModel):
    allowed_to_search: Optional[bool] = None
    allowed_to_apply: Optional[bool] = None

class PortalCredentialCreate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    api_key: Optional[str] = None

class PortalResponse(BaseModel):
    id: int
    name: str
    slug: str
    base_url: str
    allowed_to_search: bool
    allowed_to_apply: bool
    is_active: bool
    has_credential: bool = False
    credential_username_masked: Optional[str] = None

    class Config:
        from_attributes = True
