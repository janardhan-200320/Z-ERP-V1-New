// Recruitment API - Supabase Integration

import { supabase } from './superbase';
import {
  JobPosting,
  JobApplication,
  RecruitmentInterview,
  RecruitmentForm,
  FormResponse,
  NewJobPosting,
  NewJobApplication,
  NewInterview,
  RecruitmentStats,
  JobWithApplicationCount,
  ApplicationWithJob,
  InterviewWithDetails
} from './recruitment-types';

// =====================================================
// JOB POSTINGS API
// =====================================================

export const recruitmentApi = {
  // Get all jobs for current workspace with application counts
  async getJobs(workspaceId: string): Promise<JobWithApplicationCount[]> {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        job_applications(count)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(job => ({
      ...job,
      application_count: job.job_applications[0]?.count || 0
    }));
  },

  // Get active jobs (public endpoint)
  async getActiveJobs(): Promise<JobPosting[]> {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single job
  async getJob(id: string): Promise<JobPosting | null> {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new job
  async createJob(job: NewJobPosting): Promise<JobPosting> {
    const { data, error } = await supabase
      .from('job_postings')
      .insert(job)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update job
  async updateJob(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
    const { data, error } = await supabase
      .from('job_postings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete job
  async deleteJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =====================================================
  // JOB APPLICATIONS API
  // =====================================================

  // Get all applications with job details
  async getApplications(
    workspaceId: string,
    filters?: {
      jobId?: string;
      status?: string;
      search?: string;
    }
  ): Promise<ApplicationWithJob[]> {
    let query = supabase
      .from('job_applications')
      .select(`
        *,
        job_posting:job_postings(*)
      `)
      .eq('workspace_id', workspaceId)
      .order('applied_at', { ascending: false });

    if (filters?.jobId) {
      query = query.eq('job_id', filters.jobId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`applicant_name.ilike.%${filters.search}%,applicant_email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get applications for a specific job
  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Submit job application (public)
  async submitApplication(application: NewJobApplication): Promise<JobApplication> {
    // Check for duplicate application
    const { data: existing } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', application.job_id)
      .eq('applicant_email', application.applicant_email)
      .single();

    if (existing) {
      throw new Error('You have already applied for this position');
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        ...application,
        status: 'Screening'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update application status
  async updateApplicationStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status, notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update application
  async updateApplication(
    id: string,
    updates: Partial<JobApplication>
  ): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete application
  async deleteApplication(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =====================================================
  // INTERVIEWS API
  // =====================================================

  // Get all interviews
  async getInterviews(
    workspaceId: string,
    filters?: {
      applicationId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<InterviewWithDetails[]> {
    let query = supabase
      .from('recruitment_interviews')
      .select(`
        *,
        application:job_applications(
          *,
          job_posting:job_postings(title)
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('scheduled_at', { ascending: true });

    if (filters?.applicationId) {
      query = query.eq('application_id', filters.applicationId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('scheduled_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('scheduled_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(interview => ({
      ...interview,
      job_title: interview.application?.job_posting?.title
    }));
  },

  // Create interview
  async createInterview(interview: NewInterview): Promise<RecruitmentInterview> {
    const { data, error } = await supabase
      .from('recruitment_interviews')
      .insert(interview)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update interview
  async updateInterview(
    id: string,
    updates: Partial<RecruitmentInterview>
  ): Promise<RecruitmentInterview> {
    const { data, error } = await supabase
      .from('recruitment_interviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete interview
  async deleteInterview(id: string): Promise<void> {
    const { error } = await supabase
      .from('recruitment_interviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =====================================================
  // RECRUITMENT FORMS API
  // =====================================================

  // Get all forms
  async getForms(workspaceId: string): Promise<RecruitmentForm[]> {
    const { data, error } = await supabase
      .from('recruitment_forms')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single form
  async getForm(id: string): Promise<RecruitmentForm | null> {
    const { data, error } = await supabase
      .from('recruitment_forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get active forms (public)
  async getActiveForms(): Promise<RecruitmentForm[]> {
    const { data, error } = await supabase
      .from('recruitment_forms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create form
  async createForm(form: Omit<RecruitmentForm, 'id' | 'created_at' | 'updated_at'>): Promise<RecruitmentForm> {
    const { data, error } = await supabase
      .from('recruitment_forms')
      .insert(form)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update form
  async updateForm(id: string, updates: Partial<RecruitmentForm>): Promise<RecruitmentForm> {
    const { data, error } = await supabase
      .from('recruitment_forms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete form
  async deleteForm(id: string): Promise<void> {
    const { error } = await supabase
      .from('recruitment_forms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =====================================================
  // FORM RESPONSES API
  // =====================================================

  // Get responses for a form
  async getFormResponses(formId: string): Promise<FormResponse[]> {
    const { data, error } = await supabase
      .from('recruitment_form_responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Submit form response (public)
  async submitFormResponse(response: Omit<FormResponse, 'id' | 'submitted_at'>): Promise<FormResponse> {
    const { data, error } = await supabase
      .from('recruitment_form_responses')
      .insert(response)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // =====================================================
  // DASHBOARD STATS API
  // =====================================================

  // Get recruitment statistics
  async getStats(workspaceId: string): Promise<RecruitmentStats> {
    const { data, error } = await supabase
      .from('recruitment_stats')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();

    if (error) {
      // If view doesn't exist or no data, return defaults
      return {
        active_jobs: 0,
        total_applications: 0,
        screening_count: 0,
        interviewing_count: 0,
        offer_sent_count: 0,
        hired_count: 0,
        rejected_count: 0,
        scheduled_interviews: 0,
        avg_candidate_rating: null
      };
    }

    return data;
  },

  // =====================================================
  // FILE UPLOAD (for resumes, etc.)
  // =====================================================

  // Upload file to storage
  async uploadFile(
    file: File,
    bucket: string = 'recruitment-files',
    folder: string = 'resumes'
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  // Bulk update application statuses
  async bulkUpdateApplicationStatus(
    applicationIds: string[],
    status: string
  ): Promise<void> {
    const { error } = await supabase
      .from('job_applications')
      .update({ status })
      .in('id', applicationIds);

    if (error) throw error;
  },

  // Export applications to CSV
  exportApplicationsToCSV(applications: ApplicationWithJob[]): string {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Job Title',
      'Status',
      'Experience (Years)',
      'Expected CTC',
      'Source',
      'Applied Date'
    ];

    const rows = applications.map(app => [
      app.applicant_name,
      app.applicant_email,
      app.applicant_phone || '',
      app.job_posting?.title || '',
      app.status,
      app.experience_years || '',
      app.expected_ctc || '',
      app.source || '',
      new Date(app.applied_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
};

export default recruitmentApi;
