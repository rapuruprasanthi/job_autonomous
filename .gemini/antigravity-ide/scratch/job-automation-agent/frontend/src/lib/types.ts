export type OperatingMode = 'AUTONOMOUS' | 'APPROVAL' | 'ASSISTED';

export type ApplicationStatus = 
  | 'PREPARED' 
  | 'QUEUED_FOR_APPROVAL' 
  | 'APPLIED' 
  | 'REJECTED' 
  | 'INTERVIEW' 
  | 'OFFER' 
  | 'SKIPPED';

export type EmailStatus = 'DRAFT' | 'QUEUED' | 'SENT' | 'FAILED' | 'REPLIED';

export type EmailClassification = 
  | 'positive' 
  | 'negative' 
  | 'neutral' 
  | 'interview_opportunity' 
  | 'rejection' 
  | 'follow_up_required' 
  | 'action_required';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface CandidateProfile {
  id?: number;
  phone?: string;
  location?: string;
  bio?: string;
  experience_years: number;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  notice_period_days: number;
  current_ctc?: string;
  expected_ctc?: string;
}

export interface MasterResume {
  id?: number;
  raw_text?: string;
  structured_json?: {
    contact?: Record<string, string>;
    summary?: string;
    skills?: string[];
    experience?: Array<{
      company: string;
      title: string;
      dates: string;
      location?: string;
      bullets: string[];
    }>;
    projects?: Array<{
      name: string;
      tech: string[];
      description: string;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      year: string;
    }>;
    certifications?: string[];
  };
  file_path?: string;
  updated_at?: string;
}

export interface Preferences {
  id?: number;
  target_titles: string[]; // max 3
  target_locations: string[];
  min_salary: number;
  preferred_work_modes: string[]; // Remote, Hybrid, Onsite
  allowed_job_types: string[]; // Full-time, Contract, Internship
  experience_level: string;
}

export interface AgentSettings {
  id?: number;
  mode: OperatingMode;
  max_apps_per_day: number;
  max_apps_per_portal: number;
  follow_up_delay_days: number;
  max_follow_ups: number;
  min_relevance_score: number;
  is_running: boolean;
  last_run_at?: string;
}

export interface Portal {
  id: number;
  name: string;
  slug: string;
  base_url: string;
  allowed_to_search: boolean;
  allowed_to_apply: boolean;
  is_active: boolean;
  has_credential?: boolean;
  credential_username_masked?: string;
}

export interface Job {
  id: number;
  portal_id: number;
  portal_name?: string;
  external_id?: string;
  title: string;
  company: string;
  location?: string;
  work_mode: string;
  salary_range?: string;
  description: string;
  url: string;
  score: number;
  reasoning?: string;
  is_relevant: boolean;
  created_at: string;
}

export interface ResumeVersion {
  id: number;
  job_id: number;
  template_used: string;
  keywords_added: string[];
  tex_content: string;
  pdf_path?: string;
  created_at: string;
}

export interface ScreeningQA {
  question: string;
  answer: string;
  source: 'knowledge_base' | 'llm_grounded' | 'human_confirmed';
  confidence: number;
  needs_approval?: boolean;
}

export interface Application {
  id: number;
  job_id: number;
  job?: Job;
  portal_id: number;
  portal_name?: string;
  resume_version_id?: number;
  resume_version?: ResumeVersion;
  status: ApplicationStatus;
  screening_qa: ScreeningQA[];
  notes?: string;
  applied_at?: string;
  created_at: string;
}

export interface Contact {
  id: number;
  company_name: string;
  name: string;
  title?: string;
  email: string;
  linkedin_url?: string;
  confidence_score: number;
  do_not_contact: boolean;
}

export interface OutreachEmail {
  id: number;
  contact_id: number;
  contact?: Contact;
  application_id?: number;
  subject: string;
  body: string;
  template_variant: string;
  subject_variant: string;
  status: EmailStatus;
  sent_at?: string;
  follow_up_count: number;
  next_follow_up_at?: string;
  classification?: EmailClassification;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  event_type: string;
  title: string;
  description?: string;
  portal_name?: string;
  metadata_json?: Record<string, any>;
  created_at: string;
}

export interface KnowledgeEntry {
  id: number;
  category: string;
  question_pattern: string;
  answer: string;
  verified: boolean;
  sensitive: boolean;
  created_at: string;
}

export interface DashboardStats {
  jobs_discovered: number;
  jobs_relevant: number;
  apps_submitted: number;
  apps_queued: number;
  contacts_found: number;
  emails_sent: number;
  replies_received: number;
  interviews: number;
  portal_breakdown: Array<{ portal: string; count: number }>;
  funnel: Array<{ stage: string; count: number }>;
  conversion_rate: number;
}
