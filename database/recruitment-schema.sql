-- =====================================================
-- RECRUITMENT MODULE - DATABASE SCHEMA
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. JOB POSTINGS TABLE
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  employment_type VARCHAR(50) NOT NULL, -- Full-time, Part-time, Contract, Internship
  work_mode VARCHAR(50) NOT NULL, -- Remote, Hybrid, On-site
  
  -- Compensation
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  salary_currency VARCHAR(10) DEFAULT 'USD',
  
  -- Job Details
  description TEXT NOT NULL,
  responsibilities TEXT,
  requirements TEXT,
  benefits TEXT,
  skills TEXT[], -- Array of skills
  
  -- Requirements
  experience VARCHAR(100), -- Entry (0-2 yrs), Mid (3-5 yrs), Senior (5+ yrs)
  education VARCHAR(100), -- High School, Bachelor's, Master's, PhD
  
  -- Logistics
  openings INTEGER DEFAULT 1,
  duration VARCHAR(100), -- Permanent, 3 months, 6 months, 1 year
  deadline DATE,
  
  -- Status & Meta
  status VARCHAR(50) DEFAULT 'Active', -- Active, Closing Soon, Closed, Draft
  form_id UUID, -- Link to custom application form (optional)
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_salary CHECK (salary_max >= salary_min OR salary_max IS NULL),
  CONSTRAINT valid_openings CHECK (openings > 0)
);

-- 2. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Applicant Info
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(50),
  resume_url TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  
  -- Application Details
  experience_years DECIMAL(4, 1),
  current_ctc DECIMAL(12, 2),
  expected_ctc DECIMAL(12, 2),
  notice_period VARCHAR(100),
  skills TEXT[], -- Array of skills
  
  -- Metadata
  source VARCHAR(100), -- Career Site, LinkedIn, Referral, Indeed, Manual, etc.
  status VARCHAR(50) DEFAULT 'Screening', -- Screening, Interviewing, Offer Sent, Hired, Rejected
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  rejected_reason TEXT,
  
  -- Timestamps
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT unique_email_per_job UNIQUE(job_id, applicant_email)
);

-- 3. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS recruitment_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Interview Details
  interview_type VARCHAR(50) NOT NULL, -- Video, Phone, On-site, Technical
  interview_round VARCHAR(100), -- Initial, Technical, Cultural Fit, Final, etc.
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  
  -- Location/Link
  location TEXT, -- For on-site
  meeting_link TEXT, -- For video calls
  
  -- Participants
  interviewers UUID[], -- Array of user IDs
  interviewer_names TEXT[], -- Fallback for external interviewers
  
  -- Status & Feedback
  status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled, Rescheduled
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  recommendation VARCHAR(50), -- Strong Hire, Hire, Maybe, No Hire
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 4. RECRUITMENT FORMS TABLE (Custom Application Forms)
CREATE TABLE IF NOT EXISTS recruitment_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Form Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB NOT NULL, -- Array of field configurations
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  allow_multiple_submissions BOOLEAN DEFAULT false,
  send_confirmation_email BOOLEAN DEFAULT true,
  confirmation_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 5. FORM RESPONSES TABLE
CREATE TABLE IF NOT EXISTS recruitment_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES recruitment_forms(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Response Data
  responses JSONB NOT NULL, -- Key-value pairs of field_id: value
  respondent_email VARCHAR(255),
  respondent_name VARCHAR(255),
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_job_postings_workspace ON job_postings(workspace_id);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_deadline ON job_postings(deadline);
CREATE INDEX idx_job_postings_department ON job_postings(department);

CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_workspace ON job_applications(workspace_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_email ON job_applications(applicant_email);

CREATE INDEX idx_interviews_application ON recruitment_interviews(application_id);
CREATE INDEX idx_interviews_workspace ON recruitment_interviews(workspace_id);
CREATE INDEX idx_interviews_scheduled_at ON recruitment_interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON recruitment_interviews(status);

CREATE INDEX idx_recruitment_forms_workspace ON recruitment_forms(workspace_id);
CREATE INDEX idx_form_responses_form ON recruitment_form_responses(form_id);
CREATE INDEX idx_form_responses_job ON recruitment_form_responses(job_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_form_responses ENABLE ROW LEVEL SECURITY;

-- Job Postings Policies
CREATE POLICY "Users can view active jobs in their workspace"
  ON job_postings FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active jobs"
  ON job_postings FOR SELECT
  USING (status = 'Active');

CREATE POLICY "Users can create jobs in their workspace"
  ON job_postings FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update jobs in their workspace"
  ON job_postings FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete jobs in their workspace"
  ON job_postings FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Job Applications Policies
CREATE POLICY "Users can view applications in their workspace"
  ON job_applications FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit application"
  ON job_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update applications in their workspace"
  ON job_applications FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Interviews Policies
CREATE POLICY "Users can manage interviews in their workspace"
  ON recruitment_interviews FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Forms Policies
CREATE POLICY "Users can manage forms in their workspace"
  ON recruitment_forms FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active forms"
  ON recruitment_forms FOR SELECT
  USING (is_active = true);

-- Form Responses Policies
CREATE POLICY "Users can view responses in their workspace"
  ON recruitment_form_responses FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit form response"
  ON recruitment_form_responses FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruitment_interviews_updated_at
  BEFORE UPDATE ON recruitment_interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruitment_forms_updated_at
  BEFORE UPDATE ON recruitment_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update job status based on deadline
CREATE OR REPLACE FUNCTION update_job_status_based_on_deadline()
RETURNS void AS $$
BEGIN
  UPDATE job_postings
  SET status = 'Closing Soon'
  WHERE status = 'Active'
    AND deadline IS NOT NULL
    AND deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days';
  
  UPDATE job_postings
  SET status = 'Closed'
  WHERE status IN ('Active', 'Closing Soon')
    AND deadline IS NOT NULL
    AND deadline < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Schedule this function to run daily using pg_cron or external scheduler
-- SELECT update_job_status_based_on_deadline();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View for recruitment dashboard statistics
CREATE OR REPLACE VIEW recruitment_stats AS
SELECT
  jp.workspace_id,
  COUNT(DISTINCT jp.id) FILTER (WHERE jp.status = 'Active') as active_jobs,
  COUNT(DISTINCT ja.id) as total_applications,
  COUNT(DISTINCT ja.id) FILTER (WHERE ja.status = 'Screening') as screening_count,
  COUNT(DISTINCT ja.id) FILTER (WHERE ja.status = 'Interviewing') as interviewing_count,
  COUNT(DISTINCT ja.id) FILTER (WHERE ja.status = 'Offer Sent') as offer_sent_count,
  COUNT(DISTINCT ja.id) FILTER (WHERE ja.status = 'Hired') as hired_count,
  COUNT(DISTINCT ja.id) FILTER (WHERE ja.status = 'Rejected') as rejected_count,
  COUNT(DISTINCT ri.id) FILTER (WHERE ri.status = 'Scheduled') as scheduled_interviews,
  AVG(ja.rating) FILTER (WHERE ja.rating IS NOT NULL) as avg_candidate_rating
FROM job_postings jp
LEFT JOIN job_applications ja ON jp.id = ja.job_id
LEFT JOIN recruitment_interviews ri ON ja.id = ri.application_id
GROUP BY jp.workspace_id;

-- =====================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =====================================================

-- Insert sample job posting (Replace workspace_id with your actual workspace UUID)
/*
INSERT INTO job_postings (
  workspace_id, title, department, location, employment_type, work_mode,
  salary_min, salary_max, description, skills, experience, education,
  openings, duration, deadline, status, responsibilities, requirements, benefits
) VALUES (
  'YOUR_WORKSPACE_ID_HERE',
  'Senior Full Stack Developer',
  'Engineering',
  'Remote',
  'Full-time',
  'Remote',
  120000,
  180000,
  'Build and maintain scalable web applications using modern technologies.',
  ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
  'Senior (5+ yrs)',
  'Bachelor''s Degree',
  2,
  'Permanent',
  CURRENT_DATE + INTERVAL '30 days',
  'Active',
  E'• Lead technical architecture decisions\n• Mentor junior developers\n• Conduct code reviews',
  E'• 5+ years full-stack experience\n• Proficiency in React & Node.js\n• Cloud services experience',
  E'• Health & dental insurance\n• Flexible PTO\n• Remote work\n• 401k matching'
);
*/

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Replace 'YOUR_WORKSPACE_ID_HERE' in sample data with actual UUID
-- 3. Ensure workspaces and workspace_members tables exist
-- 4. Set up pg_cron or external scheduler for deadline updates
-- 5. Grant appropriate permissions to your application role
-- =====================================================
