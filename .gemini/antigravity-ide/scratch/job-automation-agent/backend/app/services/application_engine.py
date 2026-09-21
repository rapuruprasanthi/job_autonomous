import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.entities import KnowledgeEntry, MasterResume, OperatingMode, ApplicationStatus
from app.services.llm import get_llm_client

SENSITIVE_KEYWORDS = ["salary", "ctc", "visa", "sponsorship", "disability", "veteran", "race", "gender", "convicted", "legal"]

def resolve_screening_question(
    question: str, 
    user_id: int, 
    db: Session, 
    master_resume_json: Dict[str, Any]
) -> Tuple[str, str, float, bool]:
    """
    Resolves screening question in 3 tiers:
    1. Knowledge Base match
    2. LLM grounded in Master Resume
    3. Approval request fallback for sensitive/uncertain items.
    
    Returns (answer, source, confidence, needs_approval).
    """
    q_lower = question.lower()
    
    # Check sensitivity
    is_sensitive = any(kw in q_lower for kw in SENSITIVE_KEYWORDS)

    # Tier 1: Knowledge Base match
    kb_entries = db.query(KnowledgeEntry).filter(KnowledgeEntry.user_id == user_id).all()
    for entry in kb_entries:
        p_words = entry.question_pattern.lower().split()
        if any(w in q_lower for w in p_words if len(w) > 3):
            if entry.sensitive or is_sensitive:
                return entry.answer, "knowledge_base", 1.0, True
            return entry.answer, "knowledge_base", 1.0, False

    # Tier 2: LLM grounded answer
    llm = get_llm_client()
    prompt = f"""
    Answer the job application screening question using ONLY candidate facts:
    Candidate Resume: {master_resume_json}
    Question: {question}
    
    Return JSON with fields: answer, confidence (0-1), is_sensitive (bool)
    """
    res = llm.generate_json(prompt)
    answer = res.get("answer", "Yes, I am qualified for this position.")
    confidence = float(res.get("confidence", 0.90))

    if confidence < 0.75 or is_sensitive:
        return answer, "llm_grounded", confidence, True

    return answer, "llm_grounded", confidence, False

def determine_application_initial_status(mode: OperatingMode, questions_need_approval: bool) -> ApplicationStatus:
    """
    Determines status based on operating mode and approval flags.
    """
    if mode == OperatingMode.AUTONOMOUS and not questions_need_approval:
        return ApplicationStatus.APPLIED
    elif mode == OperatingMode.ASSISTED:
        return ApplicationStatus.PREPARED
    else:
        # Default APPROVAL mode or when sensitive questions require approval
        return ApplicationStatus.QUEUED_FOR_APPROVAL
