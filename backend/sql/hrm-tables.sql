-- ================================================
-- ERP HRM Module - Complete Database Schema
-- PostgreSQL (Supabase)
-- ================================================

-- ================================================
-- 1. DEPARTMENTS TABLE
-- ================================================
CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- 2. DESIGNATIONS TABLE
-- ================================================
CREATE TABLE designations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- 3. EMPLOYEES TABLE
-- ================================================
CREATE TABLE employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
    designation_id uuid REFERENCES designations(id) ON DELETE SET NULL,
    date_of_joining DATE NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- 4. ATTENDANCE TABLE
-- ================================================
CREATE TABLE attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(50) DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(employee_id, date)
);

-- Create index for faster queries
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- ================================================
-- 5. LEAVE TYPES TABLE
-- ================================================
CREATE TABLE leave_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    days_per_year INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- 6. LEAVE APPLICATIONS TABLE
-- ================================================
CREATE TABLE leave_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id uuid NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days DECIMAL(5, 2),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by uuid REFERENCES employees(id) ON DELETE SET NULL,
    approval_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_leave_applications_employee_id ON leave_applications(employee_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);

-- ================================================
-- 7. SALARIES TABLE
-- ================================================
CREATE TABLE salaries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    base_salary DECIMAL(15, 2) NOT NULL,
    allowances DECIMAL(15, 2) DEFAULT 0,
    deductions DECIMAL(15, 2) DEFAULT 0,
    net_salary DECIMAL(15, 2),
    salary_month DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_salaries_employee_id ON salaries(employee_id);
CREATE INDEX idx_salaries_salary_month ON salaries(salary_month);

-- ================================================
-- 7A. PAYROLL RECORDS TABLE
-- ================================================
CREATE TABLE payroll_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    base_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
    allowances DECIMAL(15, 2) NOT NULL DEFAULT 0,
    pf_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    other_deductions DECIMAL(15, 2) NOT NULL DEFAULT 0,
    gross_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
    deductions DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
    payment_date DATE,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_payroll_records_employee_id ON payroll_records(employee_id);
CREATE INDEX idx_payroll_records_month ON payroll_records(month);
CREATE INDEX idx_payroll_records_status ON payroll_records(status);

-- ================================================
-- 8. PERFORMANCE REVIEWS TABLE
-- ================================================
CREATE TABLE performance_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    performance_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);

-- ================================================
-- 9. BANK ACCOUNTS TABLE
-- ================================================
CREATE TABLE bank_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    bank_name VARCHAR(150) NOT NULL,
    branch_name VARCHAR(150),
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20),
    account_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_bank_accounts_employee_id ON bank_accounts(employee_id);

-- ================================================
-- 10. PUBLIC HOLIDAYS TABLE
-- ================================================
CREATE TABLE public_holidays (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    holiday_date DATE NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- 10A. ANNOUNCEMENTS TABLE
-- ================================================
CREATE TABLE hrm_announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    expires_at DATE,
    created_by uuid REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_hrm_announcements_priority ON hrm_announcements(priority);
CREATE INDEX idx_hrm_announcements_expires_at ON hrm_announcements(expires_at);

-- ================================================
-- 10B. HR LETTERS TABLE
-- ================================================
CREATE TABLE hrm_letters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
    candidate_id VARCHAR(100),
    employee_name VARCHAR(200),
    letter_type VARCHAR(100) NOT NULL,
    generated_date DATE NOT NULL,
    generated_by VARCHAR(150),
    status VARCHAR(50) DEFAULT 'draft',
    format VARCHAR(20) DEFAULT 'PDF',
    recipient_email TEXT,
    subject TEXT,
    content TEXT,
    signature_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_hrm_letters_employee_id ON hrm_letters(employee_id);
CREATE INDEX idx_hrm_letters_status ON hrm_letters(status);
CREATE INDEX idx_hrm_letters_type ON hrm_letters(letter_type);

-- ================================================
-- 10. EMPLOYEE BENEFITS TABLE
-- ================================================
CREATE TABLE employee_benefits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    benefit_name VARCHAR(150) NOT NULL,
    benefit_amount DECIMAL(15, 2),
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_employee_benefits_employee_id ON employee_benefits(employee_id);

-- ================================================
-- 11. SHIFTS TABLE
-- ================================================
CREATE TABLE shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- 12. EMPLOYEE SHIFTS TABLE
-- ================================================
CREATE TABLE employee_shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id uuid NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_employee_shifts_employee_id ON employee_shifts(employee_id);

-- ================================================
-- 13. TRAINING RECORDS TABLE
-- ================================================
CREATE TABLE training_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    training_name VARCHAR(200) NOT NULL,
    training_date DATE NOT NULL,
    duration_days INT,
    provider VARCHAR(200),
    certificate_url TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_training_records_employee_id ON training_records(employee_id);

-- ================================================
-- 14. EMPLOYMENT CONTRACTS TABLE
-- ================================================
CREATE TABLE employment_contracts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contract_type VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    contract_document_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX idx_employment_contracts_employee_id ON employment_contracts(employee_id);

-- ================================================
-- 15. HRM ASSETS TABLE
-- ================================================
CREATE TABLE hrm_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_value DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    depreciation DECIMAL(8, 2),
    assigned_to_employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
    department VARCHAR(150),
    assigned_date DATE,
    location TEXT,
    condition VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    warranty_expiry DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    insurance_value DECIMAL(15, 2),
    documents JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_hrm_assets_status ON hrm_assets(status);
CREATE INDEX idx_hrm_assets_category ON hrm_assets(category);
CREATE INDEX idx_hrm_assets_assigned_to ON hrm_assets(assigned_to_employee_id);

-- ================================================
-- 16. HRM TRAVEL REQUESTS TABLE
-- ================================================
CREATE TABLE hrm_travel_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    purpose TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    estimated_cost DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    approved_by uuid REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_hrm_travel_requests_employee_id ON hrm_travel_requests(employee_id);
CREATE INDEX idx_hrm_travel_requests_status ON hrm_travel_requests(status);

-- ================================================
-- 17. HRM EXPENSE CLAIMS TABLE
-- ================================================
CREATE TABLE hrm_expense_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    category VARCHAR(150),
    claim_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    description TEXT,
    receipt_url TEXT,
    payment_method VARCHAR(50),
    approved_by uuid REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_hrm_expense_claims_employee_id ON hrm_expense_claims(employee_id);
CREATE INDEX idx_hrm_expense_claims_status ON hrm_expense_claims(status);

-- ================================================
-- END OF SCHEMA
-- ================================================
