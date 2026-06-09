-- Z-ERP Initial Schema
-- Run this migration in your Supabase project

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  customer TEXT,
  description TEXT,
  start_date DATE,
  deadline DATE,
  members INTEGER DEFAULT 0,
  team_members TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  calculate_progress BOOLEAN DEFAULT TRUE,
  billing_type TEXT DEFAULT 'fixed-rate',
  total_rate NUMERIC,
  estimated_hours NUMERIC,
  send_email BOOLEAN DEFAULT FALSE,
  project_documents JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  budget NUMERIC,
  spent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.projects
  ADD COLUMN IF NOT EXISTS team_members TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS calculate_progress BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'fixed-rate',
  ADD COLUMN IF NOT EXISTS total_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC,
  ADD COLUMN IF NOT EXISTS send_email BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS project_documents JSONB DEFAULT '[]'::jsonb;

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  primary_contact TEXT,
  primary_email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT TRUE,
  groups TEXT[] DEFAULT '{}',
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vat_number TEXT,
  website TEXT,
  currency TEXT,
  language TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  billing_street TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip_code TEXT,
  billing_country TEXT,
  shipping_street TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip_code TEXT,
  shipping_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Groups table
CREATE TABLE IF NOT EXISTS public.customer_groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Group Members table
CREATE TABLE IF NOT EXISTS public.customer_group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES public.customer_groups(id) ON DELETE CASCADE,
  customer_id BIGINT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (group_id, customer_id)
);

-- Customer Communications table
CREATE TABLE IF NOT EXISTS public.customer_communications (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  contact_person TEXT,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  priority TEXT,
  follow_up_date DATE,
  status TEXT,
  notes TEXT,
  outcome TEXT,
  attachments INTEGER DEFAULT 0,
  attachment_files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Space Members table
CREATE TABLE IF NOT EXISTS public.team_space_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'offline',
  avatar TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Files table
CREATE TABLE IF NOT EXISTS public.project_files (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  folder_id BIGINT,
  name TEXT NOT NULL,
  description TEXT,
  file_size_bytes INTEGER,
  version TEXT,
  uploaded_by TEXT,
  status TEXT,
  visibility TEXT DEFAULT 'private',
  storage_path TEXT,
  file_url TEXT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure Supabase Storage bucket exists for project documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Ensure Supabase Storage bucket exists for customer communication attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-communications', 'customer-communications', false)
ON CONFLICT (id) DO NOTHING;

-- Project Milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  target_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'not-started',
  due_date DATE,
  estimated_hours NUMERIC,
  subtasks_completed INTEGER DEFAULT 0,
  subtasks_total INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  attachments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Task Subtasks table (individual subtasks for a task)
CREATE TABLE IF NOT EXISTS public.project_task_subtasks (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Timesheets table
CREATE TABLE IF NOT EXISTS public.project_timesheets (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee TEXT,
  date DATE,
  task TEXT,
  hours NUMERIC,
  billable BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Task Time Entries (timer-based tracking)
CREATE TABLE IF NOT EXISTS public.project_task_time_entries (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id BIGINT NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  employee TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_active ON public.customers(active);
CREATE INDEX IF NOT EXISTS idx_customer_groups_active ON public.customer_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_group_members_group_id ON public.customer_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_customer_group_members_customer_id ON public.customer_group_members(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON public.customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_date ON public.customer_communications(date);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_project_id ON public.project_timesheets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_task_subtasks_task_id ON public.project_task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_project_task_time_entries_project_id ON public.project_task_time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_task_time_entries_task_id ON public.project_task_time_entries(task_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_task_time_entries ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist (to make migration rerunnable)
DROP POLICY IF EXISTS "Allow public read on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated insert on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated update on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated delete on projects" ON public.projects;

DROP POLICY IF EXISTS "Allow public read on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated write on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated update on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated delete on customers" ON public.customers;

DROP POLICY IF EXISTS "Allow public read on customer_groups" ON public.customer_groups;
DROP POLICY IF EXISTS "Allow authenticated write on customer_groups" ON public.customer_groups;
DROP POLICY IF EXISTS "Allow authenticated update on customer_groups" ON public.customer_groups;
DROP POLICY IF EXISTS "Allow authenticated delete on customer_groups" ON public.customer_groups;

DROP POLICY IF EXISTS "Allow public read on customer_group_members" ON public.customer_group_members;
DROP POLICY IF EXISTS "Allow authenticated write on customer_group_members" ON public.customer_group_members;
DROP POLICY IF EXISTS "Allow authenticated update on customer_group_members" ON public.customer_group_members;
DROP POLICY IF EXISTS "Allow authenticated delete on customer_group_members" ON public.customer_group_members;

DROP POLICY IF EXISTS "Allow public read on customer_communications" ON public.customer_communications;
DROP POLICY IF EXISTS "Allow authenticated write on customer_communications" ON public.customer_communications;
DROP POLICY IF EXISTS "Allow authenticated update on customer_communications" ON public.customer_communications;
DROP POLICY IF EXISTS "Allow authenticated delete on customer_communications" ON public.customer_communications;

DROP POLICY IF EXISTS "Allow public read on team_space_members" ON public.team_space_members;
DROP POLICY IF EXISTS "Allow authenticated write on team_space_members" ON public.team_space_members;
DROP POLICY IF EXISTS "Allow authenticated update on team_space_members" ON public.team_space_members;
DROP POLICY IF EXISTS "Allow authenticated delete on team_space_members" ON public.team_space_members;

DROP POLICY IF EXISTS "Allow public read on project_files" ON public.project_files;
DROP POLICY IF EXISTS "Allow authenticated write on project_files" ON public.project_files;
DROP POLICY IF EXISTS "Allow authenticated update on project_files" ON public.project_files;
DROP POLICY IF EXISTS "Allow authenticated delete on project_files" ON public.project_files;

DROP POLICY IF EXISTS "Allow public read on project_milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Allow authenticated write on project_milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Allow authenticated update on project_milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Allow authenticated delete on project_milestones" ON public.project_milestones;

DROP POLICY IF EXISTS "Allow public read on project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow authenticated write on project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow authenticated update on project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow authenticated delete on project_tasks" ON public.project_tasks;

DROP POLICY IF EXISTS "Allow public read on project_task_subtasks" ON public.project_task_subtasks;
DROP POLICY IF EXISTS "Allow authenticated write on project_task_subtasks" ON public.project_task_subtasks;
DROP POLICY IF EXISTS "Allow authenticated update on project_task_subtasks" ON public.project_task_subtasks;
DROP POLICY IF EXISTS "Allow authenticated delete on project_task_subtasks" ON public.project_task_subtasks;

DROP POLICY IF EXISTS "Allow public read on project_timesheets" ON public.project_timesheets;
DROP POLICY IF EXISTS "Allow authenticated write on project_timesheets" ON public.project_timesheets;
DROP POLICY IF EXISTS "Allow authenticated update on project_timesheets" ON public.project_timesheets;
DROP POLICY IF EXISTS "Allow authenticated delete on project_timesheets" ON public.project_timesheets;

DROP POLICY IF EXISTS "Allow public read on project_task_time_entries" ON public.project_task_time_entries;
DROP POLICY IF EXISTS "Allow authenticated write on project_task_time_entries" ON public.project_task_time_entries;
DROP POLICY IF EXISTS "Allow authenticated update on project_task_time_entries" ON public.project_task_time_entries;
DROP POLICY IF EXISTS "Allow authenticated delete on project_task_time_entries" ON public.project_task_time_entries;

-- Create RLS policies to allow authenticated users full access
CREATE POLICY "Allow public read on projects" ON public.projects
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated insert on projects" ON public.projects
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on projects" ON public.projects
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on projects" ON public.projects
  FOR DELETE USING (TRUE);

-- Similar policies for other tables (allowing all for now - restrict as needed)
CREATE POLICY "Allow public read on customers" ON public.customers
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on customers" ON public.customers
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on customers" ON public.customers
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on customers" ON public.customers
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on customer_groups" ON public.customer_groups
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on customer_groups" ON public.customer_groups
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on customer_groups" ON public.customer_groups
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on customer_groups" ON public.customer_groups
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on customer_group_members" ON public.customer_group_members
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on customer_group_members" ON public.customer_group_members
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on customer_group_members" ON public.customer_group_members
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on customer_group_members" ON public.customer_group_members
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on customer_communications" ON public.customer_communications
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on customer_communications" ON public.customer_communications
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on customer_communications" ON public.customer_communications
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on customer_communications" ON public.customer_communications
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on team_space_members" ON public.team_space_members
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on team_space_members" ON public.team_space_members
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on team_space_members" ON public.team_space_members
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on team_space_members" ON public.team_space_members
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on project_files" ON public.project_files
  FOR SELECT USING (visibility = 'public' OR TRUE);

CREATE POLICY "Allow authenticated write on project_files" ON public.project_files
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on project_files" ON public.project_files
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on project_files" ON public.project_files
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on project_milestones" ON public.project_milestones
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on project_milestones" ON public.project_milestones
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on project_milestones" ON public.project_milestones
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on project_milestones" ON public.project_milestones
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on project_tasks" ON public.project_tasks
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow public read on project_task_subtasks" ON public.project_task_subtasks
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on project_tasks" ON public.project_tasks
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on project_tasks" ON public.project_tasks
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on project_tasks" ON public.project_tasks
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow authenticated write on project_task_subtasks" ON public.project_task_subtasks
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on project_task_subtasks" ON public.project_task_subtasks
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on project_task_subtasks" ON public.project_task_subtasks
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on project_timesheets" ON public.project_timesheets
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on project_timesheets" ON public.project_timesheets
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on project_timesheets" ON public.project_timesheets
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on project_timesheets" ON public.project_timesheets
  FOR DELETE USING (TRUE);

CREATE POLICY "Allow public read on project_task_time_entries" ON public.project_task_time_entries
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated write on project_task_time_entries" ON public.project_task_time_entries
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on project_task_time_entries" ON public.project_task_time_entries
  FOR UPDATE USING (TRUE);

CREATE POLICY "Allow authenticated delete on project_task_time_entries" ON public.project_task_time_entries
  FOR DELETE USING (TRUE);
