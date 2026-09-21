import { 
  User, CandidateProfile, MasterResume, Preferences, AgentSettings, 
  Portal, Job, Application, Contact, OutreachEmail, ActivityLog, KnowledgeEntry, DashboardStats 
} from './types';

export const MOCK_USER: User = {
  id: 1,
  email: "prasanthi@example.com",
  full_name: "Prasanthi",
  is_active: true,
  created_at: new Date().toISOString()
};

export const MOCK_PROFILE: CandidateProfile = {
  id: 1,
  phone: "+91 98765 43210",
  location: "Bengaluru, Karnataka",
  bio: "Senior Full Stack Engineer specializing in Python, FastAPI, React, and cloud microservices.",
  experience_years: 5.0,
  linkedin_url: "https://linkedin.com/in/prasanthi",
  github_url: "https://github.com/prasanthi",
  portfolio_url: "https://prasanthi.dev",
  notice_period_days: 30,
  current_ctc: "₹18 LPA",
  expected_ctc: "₹26 LPA"
};

export const MOCK_MASTER_RESUME: MasterResume = {
  id: 1,
  raw_text: "Prasanthi - Senior Full Stack Engineer (Python, FastAPI, React, TypeScript, SQL, Docker)",
  structured_json: {
    contact: { email: "prasanthi@example.com", phone: "+91 98765 43210", location: "Bengaluru, Karnataka" },
    summary: "Senior Full Stack Engineer with 5+ years building scalable microservices and React dashboards.",
    skills: ["Python", "FastAPI", "React", "TypeScript", "SQLAlchemy", "PostgreSQL", "Redis", "Docker", "AWS"],
    experience: [
      {
        company: "Razorpay",
        title: "Senior Software Engineer",
        dates: "2022 - Present",
        bullets: [
          "Architected FastAPI REST APIs handling ₹50Cr+ daily transaction volume with PostgreSQL & Redis.",
          "Built merchant portal React dashboards in TypeScript improving onboarding by 25%."
        ]
      }
    ],
    projects: [
      { name: "Autonomous Job Agent", tech: ["Python", "FastAPI", "React"], description: "Automated job application and recruiter cold outreach agent." }
    ],
    education: [{ degree: "B.Tech in Computer Science", institution: "Tier-1 Engineering College", year: "2019" }]
  },
  updated_at: new Date().toISOString()
};

export const MOCK_PREFERENCES: Preferences = {
  id: 1,
  target_titles: ["Senior Full Stack Engineer", "Backend Software Engineer", "SDE-2 Python Developer"],
  target_locations: ["Bengaluru", "Hyderabad", "Remote (India)"],
  min_salary: 2000000,
  preferred_work_modes: ["Remote", "Hybrid"],
  allowed_job_types: ["Full-time"],
  experience_level: "Senior Level"
};

export const MOCK_SETTINGS: AgentSettings = {
  id: 1,
  mode: "APPROVAL",
  max_apps_per_day: 15,
  max_apps_per_portal: 5,
  follow_up_delay_days: 3,
  max_follow_ups: 2,
  min_relevance_score: 75.0,
  is_running: false,
  last_run_at: new Date().toISOString()
};

export const MOCK_PORTALS: Portal[] = [
  { id: 1, name: "Naukri.com", slug: "naukri", base_url: "https://www.naukri.com", allowed_to_search: true, allowed_to_apply: true, is_active: true, has_credential: true, credential_username_masked: "pr****@gmail.com" },
  { id: 2, name: "Instahyre", slug: "instahyre", base_url: "https://www.instahyre.com", allowed_to_search: true, allowed_to_apply: true, is_active: true, has_credential: true, credential_username_masked: "pr****@gmail.com" },
  { id: 3, name: "Cutshort", slug: "cutshort", base_url: "https://cutshort.io", allowed_to_search: true, allowed_to_apply: true, is_active: true, has_credential: true, credential_username_masked: "pr****@gmail.com" },
  { id: 4, name: "Hirist", slug: "hirist", base_url: "https://www.hirist.com", allowed_to_search: true, allowed_to_apply: true, is_active: true },
  { id: 5, name: "Foundit (Monster India)", slug: "foundit", base_url: "https://www.foundit.in", allowed_to_search: true, allowed_to_apply: true, is_active: true },
  { id: 6, name: "LinkedIn India", slug: "linkedin_in", base_url: "https://www.linkedin.com/jobs", allowed_to_search: true, allowed_to_apply: true, is_active: true },
  { id: 7, name: "Wellfound (AngelList India)", slug: "wellfound_in", base_url: "https://wellfound.com/l/india", allowed_to_search: true, allowed_to_apply: true, is_active: true },
  { id: 8, name: "Internshala", slug: "internshala", base_url: "https://internshala.com", allowed_to_search: true, allowed_to_apply: true, is_active: true },
  { id: 9, name: "Shine.com", slug: "shine", base_url: "https://www.shine.com", allowed_to_search: true, allowed_to_apply: true, is_active: true },
  { id: 10, name: "Company Careers (India)", slug: "careers_india", base_url: "https://careers.google.com", allowed_to_search: true, allowed_to_apply: true, is_active: true }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 1,
    portal_id: 1,
    portal_name: "Naukri.com",
    external_id: "nk-101",
    title: "Senior Full Stack Engineer",
    company: "Razorpay",
    location: "Bengaluru, Karnataka (Hybrid)",
    work_mode: "Hybrid",
    salary_range: "₹22 LPA - ₹30 LPA",
    description: "Razorpay is hiring a Senior Full Stack Engineer in Bengaluru to build core merchant checkout interfaces using Python, FastAPI, React, and TypeScript.",
    url: "https://www.naukri.com/razorpay-jobs",
    score: 94.0,
    reasoning: "94% relevance match. Strong alignment with Prasanthi's Python, FastAPI, React, and PostgreSQL skill set.",
    is_relevant: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    portal_id: 2,
    portal_name: "Instahyre",
    external_id: "ih-102",
    title: "SDE-2 Backend Engineer",
    company: "Swiggy",
    location: "Bengaluru, Karnataka",
    work_mode: "Hybrid",
    salary_range: "₹24 LPA - ₹32 LPA",
    description: "Swiggy is hiring SDE-2 Backend Engineer for delivery optimization systems utilizing Python microservices and Redis.",
    url: "https://www.instahyre.com/swiggy-sde2",
    score: 89.0,
    reasoning: "89% match. Candidate's distributed microservices and Redis caching experience fits Swiggy logistics stack.",
    is_relevant: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    portal_id: 3,
    portal_name: "Cutshort",
    external_id: "cs-103",
    title: "Lead Python Developer",
    company: "CRED",
    location: "Bengaluru, Karnataka (Remote)",
    work_mode: "Remote",
    salary_range: "₹28 LPA - ₹38 LPA",
    description: "CRED is looking for a Lead Python Developer for rewards and payments services in Bengaluru.",
    url: "https://cutshort.io/cred-python-lead",
    score: 96.0,
    reasoning: "96% match. Excellent fit for Prasanthi's Python FastAPI and high-scale architecture experience.",
    is_relevant: true,
    created_at: new Date().toISOString()
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 1,
    job_id: 3,
    job: MOCK_JOBS[2],
    portal_id: 3,
    portal_name: "Cutshort",
    resume_version_id: 1,
    resume_version: {
      id: 1,
      job_id: 3,
      template_used: "resume_classic.tex.j2",
      keywords_added: ["FastAPI", "React", "TypeScript", "PostgreSQL", "Redis"],
      tex_content: "\\documentclass{article}\\begin{document}Resume for CRED Lead Python Developer\\end{document}",
      created_at: new Date().toISOString()
    },
    status: "INTERVIEW",
    screening_qa: [
      { question: "What is your official notice period?", answer: "30 days, negotiable to 15 days.", source: "knowledge_base", confidence: 1.0 },
      { question: "What is your current and expected CTC?", answer: "Current CTC is ₹18 LPA; expected CTC is ₹26 LPA.", source: "knowledge_base", confidence: 1.0 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    job_id: 1,
    job: MOCK_JOBS[0],
    portal_id: 1,
    portal_name: "Naukri.com",
    resume_version_id: 2,
    status: "QUEUED_FOR_APPROVAL",
    screening_qa: [
      { question: "Are you legally authorized to work in India?", answer: "Yes, I am an Indian citizen legally authorized to work full-time.", source: "knowledge_base", confidence: 1.0 },
      { question: "What is your current and expected CTC?", answer: "Current CTC is ₹18 LPA; expected CTC is ₹26 LPA.", source: "knowledge_base", confidence: 1.0, needs_approval: true }
    ],
    created_at: new Date().toISOString()
  }
];

export const MOCK_CONTACTS: Contact[] = [
  { id: 1, company_name: "Razorpay", name: "Priya Sharma", title: "Senior Technical Recruiter", email: "priya.sharma@razorpay.com", linkedin_url: "https://linkedin.com/in/priyasharma", confidence_score: 0.96, do_not_contact: false },
  { id: 2, company_name: "Swiggy", name: "Rahul Verma", title: "Talent Acquisition Manager", email: "rahul.verma@swiggy.in", linkedin_url: "https://linkedin.com/in/rahulverma", confidence_score: 0.94, do_not_contact: false },
  { id: 3, company_name: "CRED", name: "Neha Gupta", title: "Lead Engineering Recruiter", email: "neha.gupta@cred.club", linkedin_url: "https://linkedin.com/in/nehagupta", confidence_score: 0.98, do_not_contact: false }
];

export const MOCK_EMAILS: OutreachEmail[] = [
  {
    id: 1,
    contact_id: 3,
    contact: MOCK_CONTACTS[2],
    application_id: 1,
    subject: "Application for Lead Python Developer - Prasanthi",
    body: "Hi Neha,\n\nI recently applied for the Lead Python Developer position at CRED. With 5+ years building FastAPI microservices and React web apps, I would love to connect.",
    template_variant: "standard",
    subject_variant: "direct",
    status: "REPLIED",
    follow_up_count: 0,
    created_at: new Date().toISOString()
  }
];

export const MOCK_KNOWLEDGE: KnowledgeEntry[] = [
  { id: 1, category: "Notice Period", question_pattern: "What is your official notice period?", answer: "My notice period is 30 days, negotiable to 15 days.", verified: true, sensitive: false, created_at: new Date().toISOString() },
  { id: 2, category: "Compensation", question_pattern: "What is your current and expected CTC?", answer: "Current CTC is ₹18 LPA; expected compensation is ₹26 LPA.", verified: true, sensitive: true, created_at: new Date().toISOString() },
  { id: 3, category: "Work Authorization", question_pattern: "Are you legally authorized to work in India?", answer: "Yes, Indian citizen with full work authorization.", verified: true, sensitive: false, created_at: new Date().toISOString() },
  { id: 4, category: "Relocation", question_pattern: "Are you open to relocation?", answer: "Based in Bengaluru, open to Remote or Hybrid roles in Hyderabad/Pune.", verified: true, sensitive: false, created_at: new Date().toISOString() }
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  jobs_discovered: 14,
  jobs_relevant: 10,
  apps_submitted: 6,
  apps_queued: 2,
  contacts_found: 8,
  emails_sent: 6,
  replies_received: 3,
  interviews: 2,
  portal_breakdown: [
    { portal: "Naukri.com", count: 6 },
    { portal: "Instahyre", count: 4 },
    { portal: "Cutshort", count: 3 },
    { portal: "LinkedIn India", count: 1 }
  ],
  funnel: [
    { stage: "Discovered", count: 14 },
    { stage: "Relevant (75%+)", count: 10 },
    { stage: "Prepared / Queued", count: 8 },
    { stage: "Applied", count: 6 },
    { stage: "Interviews", count: 2 }
  ],
  conversion_rate: 33.3
};

export const MOCK_ACTIVITIES: ActivityLog[] = [
  { id: 1, event_type: "JOB_DISCOVERED", title: "Discovered Lead Python Developer at CRED", description: "Relevance score 96%. ₹28 LPA - ₹38 LPA", portal_name: "Cutshort", created_at: new Date().toISOString() },
  { id: 2, event_type: "RESUME_CUSTOMIZED", title: "Tailored LaTeX Resume generated for CRED", description: "Weaved in FastAPI, TypeScript, PostgreSQL", portal_name: "Cutshort", created_at: new Date().toISOString() },
  { id: 3, event_type: "APPLICATION_CREATED", title: "Application Prepared for Razorpay", description: "Status: QUEUED_FOR_APPROVAL", portal_name: "Naukri.com", created_at: new Date().toISOString() },
  { id: 4, event_type: "RECRUITER_RESPONSE_RECEIVED", title: "Recruiter Reply from CRED", description: "Interview opportunity confirmed by TA Lead", portal_name: "Cutshort", created_at: new Date().toISOString() }
];
