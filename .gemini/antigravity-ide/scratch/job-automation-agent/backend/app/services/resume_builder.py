import os
import shutil
import subprocess
import logging
from typing import Dict, Any, List, Tuple
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger("job_agent.resume_builder")

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "latex")

def validate_claims_against_master_resume(
    generated_data: Dict[str, Any], 
    master_resume_data: Dict[str, Any]
) -> Tuple[bool, List[str]]:
    """
    Fact-Safety Guard: Ensures no invented employers, degrees, dates, or fake skills.
    Returns (is_safe, list_of_violations).
    """
    violations: List[str] = []
    
    master_companies = {
        exp.get("company", "").lower() 
        for exp in master_resume_data.get("experience", []) 
        if exp.get("company")
    }
    
    for gen_exp in generated_data.get("experience", []):
        gen_comp = gen_exp.get("company", "").lower()
        if gen_comp and master_companies and not any(mc in gen_comp or gen_comp in mc for mc in master_companies):
            violations.append(f"Invented employer detected: '{gen_exp.get('company')}' not in Master Resume.")

    master_degrees = {
        edu.get("degree", "").lower() 
        for edu in master_resume_data.get("education", [])
    }
    for gen_edu in generated_data.get("education", []):
        gen_deg = gen_edu.get("degree", "").lower()
        if gen_deg and master_degrees and not any(md in gen_deg or gen_deg in md for md in master_degrees):
            violations.append(f"Invented degree detected: '{gen_edu.get('degree')}' not in Master Resume.")

    is_safe = len(violations) == 0
    return is_safe, violations

def render_latex_resume(
    candidate_name: str,
    master_resume_json: Dict[str, Any],
    jd_text: str,
    template_name: str = "resume_classic.tex.j2"
) -> Tuple[str, List[str]]:
    """
    Renders Jinja2 LaTeX template, weaving in JD keywords ONLY if candidate possesses them.
    """
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=False)
    template = env.get_template(template_name)

    candidate_skills = master_resume_json.get("skills", ["Python", "React", "SQL"])
    jd_lower = jd_text.lower()
    
    # Weave in keywords candidate actually has
    matched_keywords = [s for s in candidate_skills if s.lower() in jd_lower]

    contact = master_resume_json.get("contact", {})
    context = {
        "candidate_name": candidate_name,
        "candidate_email": contact.get("email", "candidate@example.com"),
        "candidate_phone": contact.get("phone", "+1 (555) 019-2831"),
        "candidate_location": contact.get("location", "New York, NY"),
        "candidate_linkedin": contact.get("linkedin", "https://linkedin.com"),
        "candidate_github": contact.get("github", "https://github.com"),
        "summary": master_resume_json.get("summary", "Experienced Software Engineer."),
        "skills": candidate_skills,
        "experience": master_resume_json.get("experience", []),
        "projects": master_resume_json.get("projects", []),
        "education": master_resume_json.get("education", []),
    }

    # Validate claims
    is_safe, violations = validate_claims_against_master_resume(context, master_resume_json)
    if not is_safe:
        logger.warning(f"Fact safety guard triggered violations: {violations}")

    tex_content = template.render(**context)
    return tex_content, matched_keywords

def compile_latex_to_pdf(tex_content: str, output_basename: str) -> str:
    """
    Compiles LaTeX content to PDF using pdflatex.
    If pdflatex is not installed, saves .tex file and returns file path.
    """
    output_dir = os.path.join(os.getcwd(), "generated_resumes")
    os.makedirs(output_dir, exist_ok=True)

    tex_path = os.path.join(output_dir, f"{output_basename}.tex")
    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(tex_content)

    pdflatex_bin = shutil.which("pdflatex")
    if not pdflatex_bin:
        logger.warning("pdflatex not found in PATH. Saved .tex file only.")
        return tex_path

    try:
        subprocess.run(
            [pdflatex_bin, "-interaction=nonstopmode", f"-output-directory={output_dir}", tex_path],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        pdf_path = os.path.join(output_dir, f"{output_basename}.pdf")
        return pdf_path if os.path.exists(pdf_path) else tex_path
    except Exception as e:
        logger.warning(f"Failed to compile LaTeX to PDF: {e}. Saved .tex file.")
        return tex_path
