from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.entities import User, KnowledgeEntry
from app.schemas.knowledge import KnowledgeEntryCreate, KnowledgeEntryUpdate, KnowledgeEntryResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/knowledge", tags=["Candidate Knowledge Base"])

DEFAULT_KNOWLEDGE_ENTRIES = [
    {
        "category": "Work Authorization",
        "question_pattern": "Are you legally authorized to work in the United States / country?",
        "answer": "Yes, I am legally authorized to work full-time without requiring sponsorship.",
        "verified": True,
        "sensitive": False
    },
    {
        "category": "Notice Period",
        "question_pattern": "What is your official notice period?",
        "answer": "My notice period is 30 days, negotiable to 15 days if required.",
        "verified": True,
        "sensitive": False
    },
    {
        "category": "Compensation",
        "question_pattern": "What is your current and expected salary/CTC?",
        "answer": "Current CTC is $120,000/year; expected compensation is $145,000 - $160,000/year depending on role and equity.",
        "verified": True,
        "sensitive": True
    },
    {
        "category": "Relocation",
        "question_pattern": "Are you willing to relocate?",
        "answer": "Prefer Remote or Hybrid work, open to relocation for exceptional opportunities with relocation assistance.",
        "verified": True,
        "sensitive": False
    }
]

def seed_default_knowledge_if_empty(user_id: int, db: Session):
    count = db.query(KnowledgeEntry).filter(KnowledgeEntry.user_id == user_id).count()
    if count == 0:
        for item in DEFAULT_KNOWLEDGE_ENTRIES:
            entry = KnowledgeEntry(
                user_id=user_id,
                category=item["category"],
                question_pattern=item["question_pattern"],
                answer=item["answer"],
                verified=item["verified"],
                sensitive=item["sensitive"]
            )
            db.add(entry)
        db.commit()

@router.get("", response_model=List[KnowledgeEntryResponse])
def get_knowledge_entries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    seed_default_knowledge_if_empty(current_user.id, db)
    return db.query(KnowledgeEntry).filter(KnowledgeEntry.user_id == current_user.id).order_by(KnowledgeEntry.category).all()

@router.post("", response_model=KnowledgeEntryResponse, status_code=status.HTTP_201_CREATED)
def create_knowledge_entry(
    entry_in: KnowledgeEntryCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    entry = KnowledgeEntry(
        user_id=current_user.id,
        category=entry_in.category,
        question_pattern=entry_in.question_pattern,
        answer=entry_in.answer,
        verified=entry_in.verified,
        sensitive=entry_in.sensitive
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.put("/{entry_id}", response_model=KnowledgeEntryResponse)
def update_knowledge_entry(
    entry_id: int, 
    entry_in: KnowledgeEntryUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    entry = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.id == entry_id,
        KnowledgeEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")

    for field, val in entry_in.model_dump(exclude_unset=True).items():
        setattr(entry, field, val)

    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_knowledge_entry(
    entry_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    entry = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.id == entry_id,
        KnowledgeEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")

    db.delete(entry)
    db.commit()
    return {"message": "Knowledge entry deleted successfully"}
