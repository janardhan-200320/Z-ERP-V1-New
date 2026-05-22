-- =====================================================
-- Frontend Supabase compatibility schema
-- =====================================================
-- Run this in the Supabase SQL Editor after backend/sql/hrm-tables.sql.
-- It adds the tables/columns used by frontend/client/src/lib/api.ts and
-- frontend/client/src/lib/recruitment-api.ts without removing the backend
-- HRM tables that already exist.

-- Required by gen_random_uuid().
create extension if not exists pgcrypto;

-- -----------------------------------------------------
-- Employees: make the existing backend table also support
-- the frontend profile fields.
-- -----------------------------------------------------
alter table public.employees
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists employee_code text unique,
  add column if not exists full_name text,
  add column if not exists alternate_phone text,
  add column if not exists department text,
  add column if not exists position text,
  add column if not exists designation text,
  add column if not exists manager text,
  add column if not exists join_date date,
  add column if not exists location text,
  add column if not exists blood_group text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_relationship text,
  add column if not exists emergency_contact_phone text,
  add column if not exists bank_name text,
  add column if not exists bank_account_number text,
  add column if not exists bank_routing_number text,
  add column if not exists avatar_url text,
  add column if not exists exit_workflow jsonb,
  add column if not exists employee_type text,
  add column if not exists probation_period_days integer,
  add column if not exists bank_branch text,
  add column if not exists ifsc_code text,
  add column if not exists pan_number text,
  add column if not exists aadhaar_number text,
  add column if not exists documents jsonb;

create unique index if not exists idx_employees_user_id
  on public.employees(user_id)
  where user_id is not null;

create or replace function public.sync_employee_frontend_fields()
returns trigger as $$
declare
  normalized_name text;
  first_part text;
  rest_part text;
begin
  normalized_name := nullif(trim(coalesce(new.full_name, '')), '');

  if normalized_name is null then
    normalized_name := nullif(trim(concat_ws(' ', new.first_name, new.last_name)), '');
  end if;

  if normalized_name is null then
    normalized_name := coalesce(new.email, 'Employee');
  end if;

  first_part := split_part(normalized_name, ' ', 1);
  rest_part := nullif(trim(substr(normalized_name, length(first_part) + 1)), '');

  new.full_name := normalized_name;
  new.first_name := coalesce(nullif(new.first_name, ''), first_part, 'Employee');
  new.last_name := coalesce(nullif(new.last_name, ''), rest_part, '');
  new.date_of_joining := coalesce(new.date_of_joining, new.join_date, current_date);
  new.join_date := coalesce(new.join_date, new.date_of_joining);
  new.updated_at := now();

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_employee_frontend_fields on public.employees;
create trigger trg_sync_employee_frontend_fields
before insert or update on public.employees
for each row execute function public.sync_employee_frontend_fields();

-- -----------------------------------------------------
-- Employee self-service tables used by frontend lib/api.ts
-- -----------------------------------------------------
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  break_start timestamptz,
  break_end timestamptz,
  total_break_duration_ms bigint,
  work_mode text,
  location text,
  status text not null default 'present',
  work_hours numeric(8, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(employee_id, date)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  days numeric(6, 2) not null,
  reason text,
  attachment_url text,
  status text not null default 'pending',
  approved_by uuid references public.employees(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  policy_name text not null,
  policy_number text,
  provider text,
  coverage text,
  premium text,
  start_date date,
  end_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  month date not null,
  base_salary numeric(15, 2) not null default 0,
  allowances numeric(15, 2) not null default 0,
  pf_amount numeric(15, 2) not null default 0,
  tax_amount numeric(15, 2) not null default 0,
  other_deductions numeric(15, 2) not null default 0,
  gross_salary numeric(15, 2) not null default 0,
  deductions numeric(15, 2) not null default 0,
  net_salary numeric(15, 2) not null default 0,
  payment_date date,
  payment_method text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hrm_assets (
  id uuid primary key default gen_random_uuid(),
  asset_name text not null,
  category text,
  subcategory text,
  brand text,
  model text,
  serial_number text,
  purchase_date date,
  purchase_value numeric(15, 2),
  current_value numeric(15, 2),
  depreciation numeric(8, 2),
  assigned_to_employee_id uuid references public.employees(id) on delete set null,
  department text,
  assigned_date date,
  location text,
  condition text,
  status text not null default 'available',
  warranty_expiry date,
  last_maintenance date,
  next_maintenance date,
  insurance_value numeric(15, 2),
  documents jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hrm_travel_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  destination text not null,
  purpose text,
  start_date date not null,
  end_date date not null,
  estimated_cost numeric(15, 2) default 0,
  status text not null default 'pending',
  notes text,
  approved_by uuid references public.employees(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hrm_expense_claims (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  category text,
  claim_date date not null,
  amount numeric(15, 2) not null,
  status text not null default 'pending',
  description text,
  receipt_url text,
  payment_method text,
  approved_by uuid references public.employees(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.public_holidays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  holiday_date date not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hrm_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  priority text not null default 'medium',
  expires_at date,
  created_by uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hrm_announcements_priority
  on public.hrm_announcements(priority);
create index if not exists idx_hrm_announcements_expires_at
  on public.hrm_announcements(expires_at);

create table if not exists public.hrm_letters (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  candidate_id text,
  employee_name text,
  letter_type text not null,
  generated_date date not null,
  generated_by text,
  status text not null default 'draft',
  format text not null default 'PDF',
  recipient_email text,
  subject text,
  content text,
  signature_id text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hrm_letters_employee_id
  on public.hrm_letters(employee_id);
create index if not exists idx_hrm_letters_status
  on public.hrm_letters(status);
create index if not exists idx_hrm_letters_type
  on public.hrm_letters(letter_type);

-- -----------------------------------------------------
-- Recruitment tables used by frontend lib/recruitment-api.ts
-- -----------------------------------------------------
create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  title text not null,
  department text not null,
  location text not null,
  employment_type text not null,
  work_mode text not null,
  salary_min numeric(15, 2),
  salary_max numeric(15, 2),
  salary_currency text default 'INR',
  description text not null,
  responsibilities text,
  requirements text,
  benefits text,
  skills text[],
  experience text,
  education text,
  openings integer not null default 1,
  duration text,
  deadline date,
  status text not null default 'Draft',
  form_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_postings(id) on delete cascade,
  workspace_id text not null,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text,
  resume_url text,
  cover_letter text,
  linkedin_url text,
  portfolio_url text,
  experience_years numeric(5, 2),
  current_ctc numeric(15, 2),
  expected_ctc numeric(15, 2),
  notice_period text,
  skills text[],
  source text,
  status text not null default 'Screening',
  rating integer,
  notes text,
  rejected_reason text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  unique(job_id, applicant_email)
);

create table if not exists public.recruitment_interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
  workspace_id text not null,
  interview_type text not null,
  interview_round text,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  location text,
  meeting_link text,
  interviewers text[],
  interviewer_names text[],
  status text not null default 'Scheduled',
  feedback text,
  rating integer,
  recommendation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.recruitment_forms (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  title text not null,
  description text,
  fields jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  allow_multiple_submissions boolean not null default false,
  send_confirmation_email boolean not null default false,
  confirmation_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'job_postings_form_id_fkey'
      and conrelid = 'public.job_postings'::regclass
  ) then
    alter table public.job_postings
      add constraint job_postings_form_id_fkey
      foreign key (form_id) references public.recruitment_forms(id) on delete set null
      not valid;
  end if;

  alter table public.job_postings validate constraint job_postings_form_id_fkey;
exception
  when others then null;
end $$;

create table if not exists public.recruitment_form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.recruitment_forms(id) on delete cascade,
  job_id uuid references public.job_postings(id) on delete set null,
  workspace_id text not null,
  responses jsonb not null default '{}'::jsonb,
  respondent_email text,
  respondent_name text,
  ip_address text,
  user_agent text,
  submitted_at timestamptz not null default now()
);

create or replace view public.recruitment_stats as
select
  jp.workspace_id,
  count(*) filter (where jp.status = 'Active')::integer as active_jobs,
  count(distinct ja.id)::integer as total_applications,
  count(distinct ja.id) filter (where ja.status = 'Screening')::integer as screening_count,
  count(distinct ja.id) filter (where ja.status = 'Interviewing')::integer as interviewing_count,
  count(distinct ja.id) filter (where ja.status = 'Offer Sent')::integer as offer_sent_count,
  count(distinct ja.id) filter (where ja.status = 'Hired')::integer as hired_count,
  count(distinct ja.id) filter (where ja.status = 'Rejected')::integer as rejected_count,
  count(distinct ri.id) filter (where ri.scheduled_at >= now() and ri.status <> 'Cancelled')::integer as scheduled_interviews,
  avg(ja.rating) as avg_candidate_rating
from public.job_postings jp
left join public.job_applications ja on ja.job_id = jp.id
left join public.recruitment_interviews ri on ri.application_id = ja.id
group by jp.workspace_id;

-- -----------------------------------------------------
-- Common indexes
-- -----------------------------------------------------
create index if not exists idx_attendance_records_employee_date on public.attendance_records(employee_id, date);
create index if not exists idx_leave_requests_employee_id on public.leave_requests(employee_id);
create index if not exists idx_leave_requests_status on public.leave_requests(status);
create index if not exists idx_job_postings_workspace_id on public.job_postings(workspace_id);
create index if not exists idx_job_applications_workspace_id on public.job_applications(workspace_id);
create index if not exists idx_job_applications_job_id on public.job_applications(job_id);
create index if not exists idx_recruitment_interviews_workspace_id on public.recruitment_interviews(workspace_id);
create index if not exists idx_recruitment_forms_workspace_id on public.recruitment_forms(workspace_id);

-- Keep updated_at fresh for frontend-created records.
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'attendance_records',
    'leave_requests',
    'insurance_policies',
    'payroll_records',
    'job_postings',
    'job_applications',
    'recruitment_interviews',
    'recruitment_forms'
  ]
  loop
    execute format('drop trigger if exists trg_touch_updated_at on public.%I', table_name);
    execute format(
      'create trigger trg_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      table_name
    );
  end loop;
end $$;

-- Supabase API permissions. Tighten these later with RLS policies when auth
-- roles/workspace membership are fully defined.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  public.employees,
  public.attendance_records,
  public.leave_requests,
  public.insurance_policies,
  public.payroll_records,
  public.job_postings,
  public.job_applications,
  public.recruitment_interviews,
  public.recruitment_forms,
  public.recruitment_form_responses
to anon, authenticated;
grant select on public.recruitment_stats to anon, authenticated;
