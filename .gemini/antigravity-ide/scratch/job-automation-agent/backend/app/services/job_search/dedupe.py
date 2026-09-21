import re
import hashlib
from typing import Tuple

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return ' '.join(text.split())

def generate_job_fingerprint(company: str, title: str, location: str, description: str = "") -> str:
    """
    Generates a canonical fingerprint string to prevent duplicate applications across portals.
    """
    norm_company = normalize_text(company)
    norm_title = normalize_text(title)
    norm_location = normalize_text(location)
    
    # Extract top keywords from description
    desc_words = normalize_text(description).split()
    key_tokens = [w for w in desc_words if len(w) > 4][:10]
    tokens_str = "".join(sorted(key_tokens))

    raw_str = f"{norm_company}:{norm_title}:{norm_location}:{tokens_str}"
    return hashlib.sha256(raw_str.encode('utf-8')).hexdigest()[:32]

def is_fuzzy_duplicate(fp1: str, fp2: str) -> bool:
    if fp1 == fp2:
        return True
    return False
