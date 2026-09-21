import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.entities import (
    User, CandidateProfile, MasterResume, Preferences, AgentSettings,
    Portal, Job, ResumeVersion, Application, OperatingMode, ApplicationStatus
)
from app.services.job_search.mock_connector import MockJobConnector
from app.services.job_search.dedupe import generate_job_fingerprint
from app.services.matching import score_job_relevance
from app.services.resume_builder import render_latex_resume, compile_latex_to_pdf
from app.services.application_engine import resolve_screening_question, determine_application_initial_status
from app.services.audit import log_activity

logger = logging.getLogger("job_agent.orchestrator")

def run_agent_pipeline(user_id: int, db: Session) -> Dict[str, Any]:
    """
    Executes the full agent pipeline:
    1. Fetch preferences, settings, and master resume
    2. Search jobs across enabled portals
    3. Deduplicate postings
    4. Score relevance against master resume
    5. Build Jinja2 LaTeX resume & fact-safety check
    6. Resolve screening Q&A
    7. Submit or queue for approval based on operating mode
    8. Write audit logs
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    settings_obj = db.query(AgentSettings).filter(AgentSettings.user_id == user_id).first()
    if not settings_obj:
        settings_obj = AgentSettings(user_id=user_id)
        db.add(settings_obj)
        db.commit()

    mode = settings_obj.mode or OperatingMode.APPROVAL
    min_score = settings_obj.min_relevance_score or 70.0

    prefs = db.query(Preferences).filter(Preferences.user_id == user_id).first()
    target_titles = prefs.target_titles if (prefs and prefs.target_titles) else ["Software Engineer"]
    locations = prefs.target_locations if (prefs and prefs.target_locations) else ["Remote"]
    min_salary = prefs.min_salary if prefs else 0

    master_resume = db.query(MasterResume).filter(MasterResume.user_id == user_id).first()
    master_resume_json = master_resume.structured_json if (master_resume and master_resume.structured_json) else {
        "skills": ["Python", "FastAPI", "React", "TypeScript", "SQL"],
        "experience": [{"company": "Tech Inc", "title": "Senior Engineer", "dates": "2021-Present", "bullets": ["Built APIs"]}]
    }

    portals = db.query(Portal).filter(Portal.allowed_to_search == True).all()
    if not portals:
        # Fallback to seed portals if empty
        from app.api.portals import seed_portals_if_empty
        seed_portals_if_empty(db)
        portals = db.query(Portal).filter(Portal.allowed_to_search == True).all()

    summary_stats = {
        "jobs_discovered": 0,
        "jobs_deduped": 0,
        "relevant_jobs": 0,
        "applications_created": 0,
        "queued_for_approval": 0,
        "applied_automatically": 0
    }

    for portal in portals[:4]:  # Search top portals
        connector = MockJobConnector(portal_slug=portal.slug)
        postings = connector.search(target_titles, locations, min_salary)
        summary_stats["jobs_discovered"] += len(postings)

        for post in postings:
            fp = generate_job_fingerprint(post.company, post.title, post.location, post.description)
            
            # Check duplicate
            existing_job = db.query(Job).filter(Job.fingerprint == fp).first()
            if existing_job:
                summary_stats["jobs_deduped"] += 1
                continue

            # Score relevance
            score, reasoning, is_rel = score_job_relevance(
                post.title, post.description, post.company, master_resume_json,
                {"target_titles": target_titles, "min_relevance_score": min_score}
            )

            job = Job(
                portal_id=portal.id,
                external_id=post.external_id,
                title=post.title,
                company=post.company,
                location=post.location,
                work_mode=post.work_mode,
                salary_range=post.salary_range,
                description=post.description,
                url=post.url,
                raw_data=post.raw_data,
                fingerprint=fp,
                score=score,
                reasoning=reasoning,
                is_relevant=is_rel
            )
            db.add(job)
            db.commit()
            db.refresh(job)

            log_activity(
                db, user_id, "JOB_DISCOVERED",
                f"Discovered: {job.title} at {job.company}",
                f"Relevance Score: {job.score}/100. {job.reasoning}",
                portal.name,
                {"job_id": job.id, "score": job.score}
            )

            if not is_rel:
                continue

            summary_stats["relevant_jobs"] += 1

            # Render tailored LaTeX resume
            tex_content, keywords_added = render_latex_resume(
                user.full_name, master_resume_json, post.description
            )
            pdf_path = compile_latex_to_pdf(tex_content, f"resume_{user_id}_{job.id}")

            resume_version = ResumeVersion(
                user_id=user_id,
                job_id=job.id,
                template_used="resume_classic.tex.j2",
                keywords_added=keywords_added,
                tex_content=tex_content,
                pdf_path=pdf_path
            )
            db.add(resume_version)
            db.commit()
            db.refresh(resume_version)

            log_activity(
                db, user_id, "RESUME_CUSTOMIZED",
                f"Tailored Resume generated for {job.title}",
                f"Weaved in keywords: {', '.join(keywords_added[:5])}",
                portal.name,
                {"resume_version_id": resume_version.id}
            )

            # Resolve screening Q&A
            sample_questions = [
                "Are you legally authorized to work in this country?",
                "What is your expected salary range?"
            ]
            screening_qa = []
            questions_need_approval = False

            for q in sample_questions:
                ans, src, conf, needs_app = resolve_screening_question(q, user_id, db, master_resume_json)
                if needs_app:
                    questions_need_approval = True
                screening_qa.append({
                    "question": q,
                    "answer": ans,
                    "source": src,
                    "confidence": conf,
                    "needs_approval": needs_app
                })

            app_status = determine_application_initial_status(mode, questions_need_approval)
            application = Application(
                user_id=user_id,
                job_id=job.id,
                resume_version_id=resume_version.id,
                portal_id=portal.id,
                status=app_status,
                screening_qa=screening_qa,
                applied_at=datetime.now(timezone.utc) if app_status == ApplicationStatus.APPLIED else None
            )
            db.add(application)
            db.commit()
            db.refresh(application)

            summary_stats["applications_created"] += 1
            if app_status == ApplicationStatus.APPLIED:
                summary_stats["applied_automatically"] += 1
            elif app_status == ApplicationStatus.QUEUED_FOR_APPROVAL:
                summary_stats["queued_for_approval"] += 1

            log_activity(
                db, user_id, "APPLICATION_CREATED",
                f"Application {app_status.value}: {job.title} at {job.company}",
                f"Status: {app_status.value}. Portal: {portal.name}",
                portal.name,
                {"application_id": application.id, "status": app_status.value}
            )

    settings_obj.last_run_at = datetime.now(timezone.utc)
    settings_obj.is_running = False
    db.commit()

    return summary_stats
