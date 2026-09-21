import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend root is in PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal, Base, engine
import app.models  # noqa
from app.models.entities import (
    User, CandidateProfile, MasterResume, Preferences, AgentSettings,
    Portal, Job, ResumeVersion, Application, Contact, OutreachEmail,
    EmailEvent, ActivityLog, KnowledgeEntry, OperatingMode, ApplicationStatus,
    EmailStatus, EmailClassification
)
from app.core.security import get_password_hash
from app.api.portals import seed_portals_if_empty
from app.api.knowledge import seed_default_knowledge_if_empty
from app.services.resume_parser import parse_raw_resume_text

def seed_database():
    print("Seeding database for candidate Prasanthi (Indian tech ecosystem)...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seed_portals_if_empty(db)
        portals = db.query(Portal).all()
        p_naukri = db.query(Portal).filter(Portal.slug == "naukri").first() or portals[0]
        p_instahyre = db.query(Portal).filter(Portal.slug == "instahyre").first() or portals[1]
        p_cutshort = db.query(Portal).filter(Portal.slug == "cutshort").first() or portals[2]

        # 1. Create Prasanthi User Account
        demo_email = "prasanthi@example.com"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                email=demo_email,
                hashed_password=get_password_hash("Password123!"),
                full_name="Prasanthi"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Also support candidate@example.com fallback
        cand_user = db.query(User).filter(User.email == "candidate@example.com").first()
        if not cand_user:
            cand_user = User(
                email="candidate@example.com",
                hashed_password=get_password_hash("Password123!"),
                full_name="Prasanthi"
            )
            db.add(cand_user)
            db.commit()

        # 2. Prasanthi's Master Resume
        raw_resume = """
        Prasanthi - Senior Full Stack Engineer
        Email: prasanthi@example.com | Phone: +91 98765 43210 | Bengaluru, Karnataka
        LinkedIn: linkedin.com/in/prasanthi | GitHub: github.com/prasanthi

        PROFESSIONAL SUMMARY:
        Senior Full Stack Engineer with 5+ years of experience building high-performance web applications, scalable REST microservices, and interactive UI dashboards using Python, FastAPI, React, TypeScript, SQL, and AWS.

        CORE SKILLS:
        Python, FastAPI, React, TypeScript, SQL, SQLAlchemy, PostgreSQL, Redis, Docker, AWS, System Design, CI/CD, PyTest

        EXPERIENCE:
        Senior Software Engineer - Razorpay (2022 - Present) | Bengaluru
        - Architected Python FastAPI microservices handling ₹50Cr+ daily transaction volume with PostgreSQL & Redis caching.
        - Built dark-mode React & TypeScript merchant portal dashboards improving developer onboarding efficiency by 25%.

        Software Developer - Swiggy (2019 - 2022) | Bengaluru
        - Implemented microservices and deployment pipelines using Docker, GitHub Actions, and AWS ECS.
        """
        parsed_resume = parse_raw_resume_text(raw_resume)

        for u in [user, cand_user]:
            master_resume = db.query(MasterResume).filter(MasterResume.user_id == u.id).first()
            if not master_resume:
                master_resume = MasterResume(
                    user_id=u.id,
                    raw_text=raw_resume,
                    structured_json=parsed_resume
                )
                db.add(master_resume)

            profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == u.id).first()
            if not profile:
                profile = CandidateProfile(
                    user_id=u.id,
                    location="Bengaluru, Karnataka",
                    experience_years=5.0,
                    linkedin_url="https://linkedin.com/in/prasanthi",
                    github_url="https://github.com/prasanthi",
                    notice_period_days=30,
                    current_ctc="₹18 LPA",
                    expected_ctc="₹26 LPA"
                )
                db.add(profile)

            prefs = db.query(Preferences).filter(Preferences.user_id == u.id).first()
            if not prefs:
                prefs = Preferences(
                    user_id=u.id,
                    target_titles=["Senior Full Stack Engineer", "Backend Software Engineer", "SDE-2 Python Developer"],
                    target_locations=["Bengaluru", "Hyderabad", "Remote (India)"],
                    min_salary=2000000,
                    preferred_work_modes=["Remote", "Hybrid"]
                )
                db.add(prefs)

            settings_obj = db.query(AgentSettings).filter(AgentSettings.user_id == u.id).first()
            if not settings_obj:
                settings_obj = AgentSettings(
                    user_id=u.id,
                    mode=OperatingMode.APPROVAL,
                    max_apps_per_day=15,
                    min_relevance_score=75.0
                )
                db.add(settings_obj)

            seed_default_knowledge_if_empty(u.id, db)
            db.commit()

        # 3. Seed Jobs for Prasanthi
        demo_jobs = [
            {
                "title": "Senior Full Stack Engineer",
                "company": "Razorpay",
                "portal": p_naukri,
                "score": 94.0,
                "reasoning": "94% relevance match. Strong alignment with Prasanthi's Python, FastAPI, React, and PostgreSQL background.",
                "url": "https://www.naukri.com/razorpay-jobs",
                "desc": "Razorpay is hiring a Senior Full Stack Engineer in Bengaluru for core merchant checkout systems.",
                "salary": "₹22 LPA - ₹30 LPA"
            },
            {
                "title": "SDE-2 Backend Engineer",
                "company": "Swiggy",
                "portal": p_instahyre,
                "score": 89.0,
                "reasoning": "89% match. Prasanthi's distributed microservices and Redis caching experience fits Swiggy logistics stack.",
                "url": "https://www.instahyre.com/swiggy-sde2",
                "desc": "Swiggy is hiring SDE-2 Backend Engineer for delivery optimization systems.",
                "salary": "₹24 LPA - ₹32 LPA"
            },
            {
                "title": "Lead Python Developer",
                "company": "CRED",
                "portal": p_cutshort,
                "score": 96.0,
                "reasoning": "96% match. Excellent fit for Prasanthi's Python FastAPI and high-scale architecture experience.",
                "url": "https://cutshort.io/cred-python-lead",
                "desc": "CRED is looking for a Lead Python Developer for rewards and payments services in Bengaluru.",
                "salary": "₹28 LPA - ₹38 LPA"
            }
        ]

        for dj in demo_jobs:
            fp = f"demo-fp-prasanthi-{dj['company'].lower()}"
            job = db.query(Job).filter(Job.fingerprint == fp).first()
            if not job:
                job = Job(
                    portal_id=dj["portal"].id,
                    external_id=f"demo-prasanthi-{dj['company'].lower()}",
                    title=dj["title"],
                    company=dj["company"],
                    location="Bengaluru, Karnataka (Hybrid)",
                    work_mode="Hybrid",
                    salary_range=dj["salary"],
                    description=dj["desc"],
                    url=dj["url"],
                    fingerprint=fp,
                    score=dj["score"],
                    reasoning=dj["reasoning"],
                    is_relevant=True
                )
                db.add(job)
                db.commit()
                db.refresh(job)

            # Resume version
            rv = ResumeVersion(
                user_id=user.id,
                job_id=job.id,
                template_used="resume_classic.tex.j2",
                keywords_added=["FastAPI", "React", "TypeScript", "PostgreSQL", "Redis"],
                tex_content=f"\\documentclass{{article}}\\begin{{document}}Resume for Prasanthi - {job.title} at {job.company}\\end{{document}}"
            )
            db.add(rv)
            db.commit()
            db.refresh(rv)

            # Application
            status_choice = ApplicationStatus.INTERVIEW if dj["company"] == "CRED" else ApplicationStatus.QUEUED_FOR_APPROVAL
            app = Application(
                user_id=user.id,
                job_id=job.id,
                resume_version_id=rv.id,
                portal_id=dj["portal"].id,
                status=status_choice,
                screening_qa=[
                    {"question": "What is your official notice period?", "answer": "30 days, negotiable to 15 days.", "source": "knowledge_base", "confidence": 1.0, "needs_approval": False},
                    {"question": "What is your current and expected CTC?", "answer": "Current CTC is ₹18 LPA; expected CTC is ₹26 LPA.", "source": "knowledge_base", "confidence": 1.0, "needs_approval": True}
                ],
                applied_at=datetime.now(timezone.utc) if status_choice != ApplicationStatus.QUEUED_FOR_APPROVAL else None
            )
            db.add(app)
            db.commit()
            db.refresh(app)

            # Seed HR Contact & Cold Email
            contact = Contact(
                company_name=job.company,
                name=f"TA Lead at {job.company}",
                title="Senior Technical Recruiter",
                email=f"ta@{job.company.lower()}.com",
                confidence_score=0.96
            )
            db.add(contact)
            db.commit()
            db.refresh(contact)

            email = OutreachEmail(
                user_id=user.id,
                contact_id=contact.id,
                application_id=app.id,
                subject=f"Application for {job.title} - Prasanthi",
                body=f"Hi {contact.name},\n\nI applied for {job.title} at {job.company}. With 5+ years building FastAPI and React microservices, I would love to connect.",
                template_variant="standard",
                subject_variant="direct",
                status=EmailStatus.REPLIED if dj["company"] == "CRED" else EmailStatus.SENT,
                sent_at=datetime.now(timezone.utc) - timedelta(days=2)
            )
            db.add(email)
            db.commit()

            # Seed activity logs
            db.add(ActivityLog(
                user_id=user.id,
                event_type="JOB_DISCOVERED",
                title=f"Discovered {job.title} at {job.company}",
                description=f"Match Score: {job.score}% ({job.salary_range})",
                portal_name=dj["portal"].name
            ))
            db.add(ActivityLog(
                user_id=user.id,
                event_type="APPLICATION_CREATED",
                title=f"Prepared application for {job.title} at {job.company}",
                description=f"Status: {status_choice.value}",
                portal_name=dj["portal"].name
            ))

        db.commit()
        print("Database seed completed successfully for Prasanthi!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
