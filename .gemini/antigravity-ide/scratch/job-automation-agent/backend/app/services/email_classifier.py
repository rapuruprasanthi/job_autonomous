from typing import Tuple, Dict, Any
from app.models.entities import EmailClassification
from app.services.llm import get_llm_client

def classify_incoming_email(subject: str, body: str) -> Tuple[EmailClassification, float, str]:
    """
    Classifies incoming recruiter email responses into actionable categories.
    Returns (classification, confidence, summary).
    """
    text_lower = f"{subject} {body}".lower()

    # Rule-based fast heuristics
    if any(w in text_lower for w in ["interview", "schedule a call", "introductory call", "phone screen", "time to chat"]):
        return EmailClassification.INTERVIEW_OPPORTUNITY, 0.95, "Recruiter proposed an interview or phone screen call."

    if any(w in text_lower for w in ["unfortunately", "not moving forward", "other candidates", "regret to inform"]):
        return EmailClassification.REJECTION, 0.95, "Application declined by employer."

    if any(w in text_lower for w in ["please provide", "send over your", "availability", "questionnaire"]):
        return EmailClassification.ACTION_REQUIRED, 0.90, "Recruiter requested additional information or availability."

    # LLM classification fallback
    llm = get_llm_client()
    prompt = f"""
    Classify incoming recruiter email response:
    Subject: {subject}
    Body: {body}
    
    Choose category from: positive, negative, neutral, interview_opportunity, rejection, follow_up_required, action_required.
    Return JSON: category, confidence, summary.
    """
    res = llm.generate_json(prompt)
    cat_str = res.get("category", "positive").lower()
    
    try:
        category = EmailClassification(cat_str)
    except ValueError:
        category = EmailClassification.POSITIVE

    return category, float(res.get("confidence", 0.88)), res.get("summary", "Processed response.")
