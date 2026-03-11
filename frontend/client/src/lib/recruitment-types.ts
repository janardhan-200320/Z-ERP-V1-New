// Recruitment Module Types and Interfaces

// Note: Update these types to match your actual Supabase database schema
// For now, we'll define types manually until you generate database types

// Database Types
export interface JobPosting {
  id: string;
  workspace_id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  work_mode: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency?: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  skills: string[] | null;
  experience: string | null;
  education: string | null;
  openings: number;
  duration: string | null;
  deadline: string | null;
  status: string;
  form_id: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  workspace_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  resume_url: string | null;
  cover_letter: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  experience_years: number | null;
  current_ctc: number | null;
  expected_ctc: number | null;
  notice_period: string | null;
  skills: string[] | null;
  source: string | null;
  status: string;
  rating: number | null;
  notes: string | null;
  rejected_reason: string | null;
  applied_at: string;
  updated_at: string;
  reviewed_by?: string;
}

export interface RecruitmentInterview {
  id: string;
  application_id: string;
  workspace_id: string;
  interview_type: string;
  interview_round: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  meeting_link: string | null;
  interviewers: string[] | null;
  interviewer_names: string[] | null;
  status: string;
  feedback: string | null;
  rating: number | null;
  recommendation: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface RecruitmentForm {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  fields: any; // JSONB
  is_active: boolean;
  allow_multiple_submissions: boolean;
  send_confirmation_email: boolean;
  confirmation_message: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  job_id: string | null;
  workspace_id: string;
  responses: any; // JSONB
  respondent_email: string | null;
  respondent_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  submitted_at: string;
}

// Insert Types
export type NewJobPosting = Omit<JobPosting, 'id' | 'created_at' | 'updated_at' | 'form_id' | 'created_by'>;
export type NewJobApplication = Omit<JobApplication, 'id' | 'applied_at' | 'updated_at' | 'reviewed_by'>;
export type NewInterview = Omit<RecruitmentInterview, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

// UI Types
export interface JobWithApplicationCount extends JobPosting {
  application_count?: number;
}

export interface ApplicationWithJob extends JobApplication {
  job_posting?: JobPosting;
}

export interface InterviewWithDetails extends RecruitmentInterview {
  application?: JobApplication;
  job_title?: string;
}

// Form Field Types
export type FieldType = 
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'url'
  | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface RecruitmentFormData {
  title: string;
  description?: string;
  fields: FormField[];
  is_active: boolean;
  allow_multiple_submissions: boolean;
  send_confirmation_email: boolean;
  confirmation_message?: string;
}

// Dashboard Stats
export interface RecruitmentStats {
  active_jobs: number;
  total_applications: number;
  screening_count: number;
  interviewing_count: number;
  offer_sent_count: number;
  hired_count: number;
  rejected_count: number;
  scheduled_interviews: number;
  avg_candidate_rating: number | null;
}

// Pipeline Stages
export const APPLICATION_STATUSES = [
  'Screening',
  'Interviewing',
  'Offer Sent',
  'Hired',
  'Rejected'
] as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

export const INTERVIEW_TYPES = [
  'Video',
  'Phone',
  'On-site',
  'Technical'
] as const;

export type InterviewType = typeof INTERVIEW_TYPES[number];

export const INTERVIEW_ROUNDS = [
  'Initial',
  'Technical',
  'Cultural Fit',
  'Final',
  'Case Study',
  'Panel'
] as const;

export type InterviewRound = typeof INTERVIEW_ROUNDS[number];

export const INTERVIEW_RECOMMENDATIONS = [
  'Strong Hire',
  'Hire',
  'Maybe',
  'No Hire'
] as const;

export type InterviewRecommendation = typeof INTERVIEW_RECOMMENDATIONS[number];

// Job Constants
export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship'
] as const;

export const WORK_MODES = [
  'Remote',
  'Hybrid',
  'On-site'
] as const;

export const EXPERIENCE_LEVELS = [
  'Entry (0-2 yrs)',
  'Mid (3-5 yrs)',
  'Senior (5+ yrs)',
  'Lead (8+ yrs)',
  'Director (10+ yrs)'
] as const;

export const EDUCATION_LEVELS = [
  'High School Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Professional Certification',
  'Not Required'
] as const;

export const JOB_STATUSES = [
  'Active',
  'Closing Soon',
  'Closed',
  'Draft'
] as const;

export type JobStatus = typeof JOB_STATUSES[number];

// Application Sources
export const APPLICATION_SOURCES = [
  'Career Site',
  'LinkedIn',
  'Indeed',
  'Referral',
  'Manual',
  'Job Board',
  'Company Website',
  'Other'
] as const;

export type ApplicationSource = typeof APPLICATION_SOURCES[number];
