from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.entities import User, Portal, PortalCredential
from app.schemas.portal import PortalUpdate, PortalCredentialCreate, PortalResponse
from app.core.deps import get_current_user
from app.core.crypto import encrypt_credential, mask_credential

router = APIRouter(prefix="/portals", tags=["Portals & Permissions"])

DEFAULT_INDIAN_PORTALS = [
    {"name": "Naukri.com", "slug": "naukri", "base_url": "https://www.naukri.com"},
    {"name": "Instahyre", "slug": "instahyre", "base_url": "https://www.instahyre.com"},
    {"name": "Cutshort", "slug": "cutshort", "base_url": "https://cutshort.io"},
    {"name": "Hirist", "slug": "hirist", "base_url": "https://www.hirist.com"},
    {"name": "Foundit (Monster India)", "slug": "foundit", "base_url": "https://www.foundit.in"},
    {"name": "LinkedIn India", "slug": "linkedin_in", "base_url": "https://www.linkedin.com/jobs"},
    {"name": "Wellfound (AngelList India)", "slug": "wellfound_in", "base_url": "https://wellfound.com/l/india"},
    {"name": "Internshala", "slug": "internshala", "base_url": "https://internshala.com"},
    {"name": "Shine.com", "slug": "shine", "base_url": "https://www.shine.com"},
    {"name": "TimesJobs", "slug": "timesjobs", "base_url": "https://www.timesjobs.com"},
    {"name": "Company Careers (India)", "slug": "careers_india", "base_url": "https://careers.google.com"},
]

def seed_portals_if_empty(db: Session):
    if db.query(Portal).count() == 0:
        for p in DEFAULT_INDIAN_PORTALS:
            portal = Portal(
                name=p["name"],
                slug=p["slug"],
                base_url=p["base_url"],
                allowed_to_search=True,
                allowed_to_apply=True,
                is_active=True
            )
            db.add(portal)
        db.commit()

@router.get("", response_model=List[PortalResponse])
def get_portals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    seed_portals_if_empty(db)
    portals = db.query(Portal).all()
    user_creds = {
        c.portal_id: c 
        for c in db.query(PortalCredential).filter(PortalCredential.user_id == current_user.id).all()
    }

    res = []
    for p in portals:
        cred = user_creds.get(p.id)
        has_cred = bool(cred and (cred.encrypted_password or cred.encrypted_api_key))
        masked_user = mask_credential(cred.username) if (cred and cred.username) else None
        
        res.append(PortalResponse(
            id=p.id,
            name=p.name,
            slug=p.slug,
            base_url=p.base_url,
            allowed_to_search=p.allowed_to_search,
            allowed_to_apply=p.allowed_to_apply,
            is_active=p.is_active,
            has_credential=has_cred,
            credential_username_masked=masked_user
        ))
    return res

@router.put("/{portal_id}", response_model=PortalResponse)
def update_portal_permissions(
    portal_id: int, 
    portal_in: PortalUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    portal = db.query(Portal).filter(Portal.id == portal_id).first()
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")

    for field, val in portal_in.model_dump(exclude_unset=True).items():
        setattr(portal, field, val)

    db.commit()
    db.refresh(portal)

    cred = db.query(PortalCredential).filter(
        PortalCredential.portal_id == portal_id,
        PortalCredential.user_id == current_user.id
    ).first()

    has_cred = bool(cred and (cred.encrypted_password or cred.encrypted_api_key))
    masked_user = mask_credential(cred.username) if (cred and cred.username) else None

    return PortalResponse(
        id=portal.id,
        name=portal.name,
        slug=portal.slug,
        base_url=portal.base_url,
        allowed_to_search=portal.allowed_to_search,
        allowed_to_apply=portal.allowed_to_apply,
        is_active=portal.is_active,
        has_credential=has_cred,
        credential_username_masked=masked_user
    )

@router.post("/{portal_id}/credential", response_model=PortalResponse)
def save_portal_credential(
    portal_id: int, 
    cred_in: PortalCredentialCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    portal = db.query(Portal).filter(Portal.id == portal_id).first()
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")

    cred = db.query(PortalCredential).filter(
        PortalCredential.portal_id == portal_id,
        PortalCredential.user_id == current_user.id
    ).first()

    if not cred:
        cred = PortalCredential(user_id=current_user.id, portal_id=portal_id)
        db.add(cred)

    if cred_in.username is not None:
        cred.username = cred_in.username
    if cred_in.password:
        cred.encrypted_password = encrypt_credential(cred_in.password)
    if cred_in.api_key:
        cred.encrypted_api_key = encrypt_credential(cred_in.api_key)

    cred.is_valid = True
    db.commit()

    return PortalResponse(
        id=portal.id,
        name=portal.name,
        slug=portal.slug,
        base_url=portal.base_url,
        allowed_to_search=portal.allowed_to_search,
        allowed_to_apply=portal.allowed_to_apply,
        is_active=portal.is_active,
        has_credential=True,
        credential_username_masked=mask_credential(cred.username) if cred.username else "Set"
    )
