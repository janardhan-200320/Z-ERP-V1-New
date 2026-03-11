-- =====================================================
-- EMPLOYEE PROFILE MODULE - DATABASE SCHEMA
-- =====================================================
-- This schema supports the complete employee profile module
-- with personal info, attendance, leave, insurance, and payroll

-- =====================================================
-- 1. EMPLOYEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NULL,  -- Link to auth.users
  employee_code VARCHAR(50) NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  alternate_phone TEXT NULL,
  department VARCHAR(100) NULL,
  position VARCHAR(100) NULL,
  designation TEXT NULL,
  manager VARCHAR(255) NULL,
  join_date DATE NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  location TEXT NULL,
  blood_group TEXT NULL,
  
  -- Address
  address TEXT NULL,
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255) NULL,
  emergency_contact_relationship VARCHAR(100) NULL,
  emergency_contact_phone VARCHAR(50) NULL,
  
  -- Bank Details
  bank_name VARCHAR(255) NULL,
  bank_account_number VARCHAR(100) NULL,
  bank_routing_number VARCHAR(100) NULL,
  
  -- Profile
  avatar_url TEXT NULL,
  
  -- Exit Management
  exit_workflow JSONB NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_email_key UNIQUE (email),
  CONSTRAINT employees_employee_code_key UNIQUE (employee_code),
  CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT employees_status_check CHECK (
    status IN ('active', 'inactive', 'on_leave', 'terminated', 
               'probation', 'onboarding', 'exit')
  )
);

-- Indexes for employees
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- =====================================================
-- 2. ATTENDANCE RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE NULL,
  check_out TIMESTAMP WITH TIME ZONE NULL,
  break_start TIMESTAMP WITH TIME ZONE NULL,
  break_end TIMESTAMP WITH TIME ZONE NULL,
  total_break_duration_ms BIGINT NOT NULL DEFAULT 0,
  work_mode VARCHAR(50) NOT NULL DEFAULT 'office',
  location TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT attendance_records_pkey PRIMARY KEY (id),
  CONSTRAINT uq_employee_date UNIQUE (employee_id, date),
  CONSTRAINT attendance_records_employee_id_fkey FOREIGN KEY (employee_id) 
    REFERENCES employees (id) ON DELETE CASCADE,
  CONSTRAINT attendance_status_check CHECK (
    status IN ('present', 'absent', 'late', 'half_day', 'on_leave')
  ),
  CONSTRAINT work_mode_check CHECK (
    work_mode IN ('office', 'remote', 'hybrid', 'onsite')
  )
);

-- Indexes for attendance
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);

-- =====================================================
-- 3. LEAVE REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  leave_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT NULL,
  attachment_url TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  approved_by UUID NULL,
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT leave_requests_pkey PRIMARY KEY (id),
  CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) 
    REFERENCES employees (id) ON DELETE CASCADE,
  CONSTRAINT leave_requests_days_check CHECK (days > 0),
  CONSTRAINT leave_status_check CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled')
  )
);

-- Indexes for leave requests
CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_requests(start_date, end_date);

-- =====================================================
-- 4. INSURANCE POLICIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  policy_name VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100) NULL,
  provider VARCHAR(255) NULL,
  coverage VARCHAR(100) NULL,
  premium VARCHAR(100) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT insurance_policies_pkey PRIMARY KEY (id),
  CONSTRAINT insurance_policies_employee_id_fkey FOREIGN KEY (employee_id) 
    REFERENCES employees (id) ON DELETE CASCADE,
  CONSTRAINT insurance_status_check CHECK (
    status IN ('active', 'expired', 'cancelled')
  )
);

-- Indexes for insurance
CREATE INDEX IF NOT EXISTS idx_insurance_employee ON insurance_policies(employee_id);
CREATE INDEX IF NOT EXISTS idx_insurance_status ON insurance_policies(status);

-- =====================================================
-- 5. PAYROLL RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  month VARCHAR(20) NOT NULL,
  gross_salary DECIMAL(10,2) NOT NULL,
  deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  payment_date DATE NULL,
  payment_method VARCHAR(50) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT payroll_records_pkey PRIMARY KEY (id),
  CONSTRAINT payroll_records_employee_id_fkey FOREIGN KEY (employee_id) 
    REFERENCES employees (id) ON DELETE CASCADE,
  CONSTRAINT payroll_status_check CHECK (
    status IN ('pending', 'processed', 'paid', 'cancelled')
  ),
  CONSTRAINT uq_employee_month UNIQUE (employee_id, month)
);

-- Indexes for payroll
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON payroll_records(month);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll_records(status);

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables
DROP TRIGGER IF EXISTS employees_updated_at ON employees;
CREATE TRIGGER employees_updated_at 
BEFORE UPDATE ON employees 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS attendance_updated_at ON attendance_records;
CREATE TRIGGER attendance_updated_at 
BEFORE UPDATE ON attendance_records 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS leave_updated_at ON leave_requests;
CREATE TRIGGER leave_updated_at 
BEFORE UPDATE ON leave_requests 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS insurance_updated_at ON insurance_policies;
CREATE TRIGGER insurance_updated_at 
BEFORE UPDATE ON insurance_policies 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS payroll_updated_at ON payroll_records;
CREATE TRIGGER payroll_updated_at 
BEFORE UPDATE ON payroll_records 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "Users can view their own employee record"
  ON employees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee record"
  ON employees FOR UPDATE
  USING (auth.uid() = user_id);

-- Attendance policies
CREATE POLICY "Users can view their own attendance"
  ON attendance_records FOR SELECT
  USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own attendance"
  ON attendance_records FOR INSERT
  WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own attendance"
  ON attendance_records FOR UPDATE
  USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- Leave requests policies
CREATE POLICY "Users can view their own leave requests"
  ON leave_requests FOR SELECT
  USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own leave requests"
  ON leave_requests FOR INSERT
  WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own pending leave requests"
  ON leave_requests FOR UPDATE
  USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
    AND status = 'pending'
  );

-- Insurance policies
CREATE POLICY "Users can view their own insurance"
  ON insurance_policies FOR SELECT
  USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- Payroll policies
CREATE POLICY "Users can view their own payroll"
  ON payroll_records FOR SELECT
  USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- =====================================================
-- 8. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample insurance policies
-- INSERT INTO insurance_policies (employee_id, policy_name, coverage, premium, status)
-- SELECT id, 'Health Insurance Premium', '$500,000', '$250/month', 'active'
-- FROM employees LIMIT 1;

-- INSERT INTO insurance_policies (employee_id, policy_name, coverage, premium, status)
-- SELECT id, 'Life Insurance', '$1,000,000', '$100/month', 'active'
-- FROM employees LIMIT 1;

-- INSERT INTO insurance_policies (employee_id, policy_name, coverage, premium, status)
-- SELECT id, 'Dental Coverage', '$50,000', '$50/month', 'active'
-- FROM employees LIMIT 1;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- Run this script in Supabase SQL Editor to create all tables
