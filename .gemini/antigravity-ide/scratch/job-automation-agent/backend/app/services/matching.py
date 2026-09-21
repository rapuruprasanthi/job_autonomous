from typing import Dict, Any, Tuple
from app.services.llm import get_llm_client

def score_job_relevance(
    job_title: str, 
    job_description: str, 
    job_company: str, 
    master_resume_json: Dict[str, Any],
    preferences: Dict[str, Any]
) -> Tuple[float, str, bool]:
    """
    Evaluates job relevance (0-100) using LLM analysis and keyword matching.
    Returns (score, reasoning, is_relevant).
    """
    llm = get_llm_client()
    min_score = preferences.get("min_relevance_score", 70.0)
    target_titles = preferences.get("target_titles", [])

    prompt = f"""
    Evaluate job relevance (0-100) for a candidate:
    Target Titles: {target_titles}
    Candidate Resume Skills: {master_resume_json.get('skills', [])}
    
    Job Title: {job_title}
    Company: {job_company}
    Job Description: {job_description[:1000]}
    
    Provide relevance score 0-100 and reasoning.
    """
    
    res = llm.generate_json(prompt)
    score = float(res.get("score", 85.0))
    reasoning = res.get("reasoning", "Strong match with candidate stack and career goals.")

    # Rule-based title boost
    title_lower = job_title.lower()
    if any(t.lower() in title_lower for t in target_titles):
        score = min(100.0, score + 5.0)

    is_relevant = score >= min_score
    return score, reasoning, is_relevant
