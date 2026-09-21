import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, Float, JSON, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class OperatingMode(str, enum.Enum):
    AUTONOMOUS = "AUTONOMOUS"
    APPROVAL = "APPROVAL"
    ASSISTED = "ASSISTED"

class ApplicationStatus(str, enum.Enum):
    PREPARED = "PREPARED"
    QUEUED_FOR_APPROVAL = "QUEUED_FOR_APPROVAL"
    APPLIED = "APPLIED"
    REJECTED = "REJECTED"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    SKIPPED = "SKIPPED"

class EmailStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    QUEUED = "QUEUED"
    SENT = "SENT"
    FAILED = "FAILED"
    REPLIED = "REPLIED"

class EmailClassification(str, enum.Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    INTERVIEW_OPPORTUNITY = "interview_opportunity"
    REJECTION = "rejection"
    FOLLOW_UP_REQUIRED = "follow_up_required"
    ACTION_REQUIRED = "action_required"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    master_resume = relationship("MasterResume", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("Preferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    settings = relationship("AgentSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    credentials = relationship("PortalCredential", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    resume_versions = relationship("ResumeVersion", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    knowledge_entries = relationship("KnowledgeEntry", back_populates="user", cascade="all, delete-orphan")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    experience_years = Column(Float, default=0.0)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    notice_period_days = Column(Integer, default=30)
    current_ctc = Column(String(100), nullable=True)
    expected_ctc = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")

class MasterResume(Base):
    __tablename__ = "master_resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    raw_text = Column(Text, nullable=True)
    structured_json = Column(JSON, nullable=True)  # {contact, summary, skills, experience, projects, education, certs}
    file_path = Column(String(512), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="master_resume")

class Preferences(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    target_titles = Column(JSON, default=list)  # Enforced max 3
    target_locations = Column(JSON, default=list)
    min_salary = Column(Integer, default=0)
    preferred_work_modes = Column(JSON, default=list)  # ["Remote", "Hybrid", "Onsite"]
    allowed_job_types = Column(JSON, default=list)      # ["Full-time", "Contract", "Internship"]
    experience_level = Column(String(50), default="Mid-Level")
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="preferences")

class Portal(Base):
    __tablename__ = "portals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # LinkedIn, Naukri, Indeed, etc.
    slug = Column(String(100), unique=True, nullable=False)
    base_url = Column(String(255), nullable=False)
    allowed_to_search = Column(Boolean, default=True)
    allowed_to_apply = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    credentials = relationship("PortalCredential", back_populates="portal")
    jobs = relationship("Job", back_populates="portal")

class PortalCredential(Base):
    __tablename__ = "portal_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    portal_id = Column(Integer, ForeignKey("portals.id"), nullable=False)
    username = Column(String(255), nullable=True)
    encrypted_password = Column(Text, nullable=True)
    encrypted_api_key = Column(Text, nullable=True)
    is_valid = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="credentials")
    portal = relationship("Portal", back_populates="credentials")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    portal_id = Column(Integer, ForeignKey("portals.id"), nullable=False)
    external_id = Column(String(255), nullable=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    work_mode = Column(String(50), default="Remote")  # Remote, Hybrid, Onsite
    salary_range = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    url = Column(String(512), nullable=False)
    raw_data = Column(JSON, nullable=True)
    fingerprint = Column(String(255), unique=True, index=True, nullable=False)
    score = Column(Float, default=0.0)
    reasoning = Column(Text, nullable=True)
    is_relevant = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    portal = relationship("Portal", back_populates="jobs")
    applications = relationship("Application", back_populates="job")
    resume_versions = relationship("ResumeVersion", back_populates="job")

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    template_used = Column(String(100), default="resume_classic.tex.j2")
    keywords_added = Column(JSON, default=list)
    tex_content = Column(Text, nullable=False)
    pdf_path = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="resume_versions")
    job = relationship("Job", back_populates="resume_versions")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    resume_version_id = Column(Integer, ForeignKey("resume_versions.id"), nullable=True)
    portal_id = Column(Integer, ForeignKey("portals.id"), nullable=False)
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.PREPARED)
    screening_qa = Column(JSON, default=list)  # [{question, answer, source, confidence}]
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    resume_version = relationship("ResumeVersion")
    portal = relationship("Portal")
    outreach_emails = relationship("OutreachEmail", back_populates="application")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=True)
    email = Column(String(255), nullable=False, index=True)
    linkedin_url = Column(String(255), nullable=True)
    source_url = Column(String(512), nullable=True)
    confidence_score = Column(Float, default=0.8)
    do_not_contact = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    outreach_emails = relationship("OutreachEmail", back_populates="contact")

class OutreachEmail(Base):
    __tablename__ = "outreach_emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    template_variant = Column(String(50), default="standard")
    subject_variant = Column(String(50), default="direct")
    status = Column(SQLEnum(EmailStatus), default=EmailStatus.DRAFT)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    follow_up_count = Column(Integer, default=0)
    next_follow_up_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    contact = relationship("Contact", back_populates="outreach_emails")
    application = relationship("Application", back_populates="outreach_emails")
    events = relationship("EmailEvent", back_populates="email", cascade="all, delete-orphan")

class EmailEvent(Base):
    __tablename__ = "email_events"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(Integer, ForeignKey("outreach_emails.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # SENT, REPLIED, BOUNCED, etc.
    classification = Column(SQLEnum(EmailClassification), nullable=True)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    email = relationship("OutreachEmail", back_populates="events")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String(100), nullable=False)  # JOB_FOUND, RESUME_CUSTOMIZED, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    portal_name = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="activities")

class KnowledgeEntry(Base):
    __tablename__ = "knowledge_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), default="General")  # Compensation, Work Auth, Experience, Legal
    question_pattern = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)
    verified = Column(Boolean, default=True)
    sensitive = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="knowledge_entries")

class AgentSettings(Base):
    __tablename__ = "agent_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    mode = Column(SQLEnum(OperatingMode), default=OperatingMode.APPROVAL)
    max_apps_per_day = Column(Integer, default=15)
    max_apps_per_portal = Column(Integer, default=5)
    follow_up_delay_days = Column(Integer, default=3)
    max_follow_ups = Column(Integer, default=2)
    min_relevance_score = Column(Float, default=70.0)
    is_running = Column(Boolean, default=False)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="settings")
