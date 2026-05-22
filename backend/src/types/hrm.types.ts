export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  designation_id?: string;
  date_of_joining: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveType {
  id: string;
  name: string;
  days_per_year: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveApplication {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason?: string;
  status: string;
  approved_by?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Salary {
  id: string;
  employee_id: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  salary_month: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  reviewer_id: string;
  review_date: string;
  rating: number;
  feedback?: string;
  performance_comments?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicHoliday {
  id: string;
  name: string;
  holiday_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface HRLetter {
  id: string;
  employee_id?: string;
  candidate_id?: string;
  employee_name?: string;
  letter_type: string;
  generated_date: string;
  generated_by?: string;
  status: string;
  format: string;
  recipient_email?: string;
  subject?: string;
  content?: string;
  signature_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeBenefit {
  id: string;
  employee_id: string;
  benefit_name: string;
  benefit_amount?: number;
  effective_from?: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeShift {
  id: string;
  employee_id: string;
  shift_id: string;
  effective_from?: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingRecord {
  id: string;
  employee_id: string;
  training_name: string;
  training_date: string;
  duration_days?: number;
  provider?: string;
  certificate_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmploymentContract {
  id: string;
  employee_id: string;
  contract_type: string;
  start_date: string;
  end_date?: string;
  contract_document_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicy {
  id: string;
  employee_id: string;
  policy_type: string;
  provider: string;
  policy_number: string;
  coverage_amount: number;
  premium_amount: number;
  premium_frequency: string;
  start_date: string;
  end_date: string;
  status: string;
  documents?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceClaim {
  id: string;
  policy_id: string;
  employee_id: string;
  claim_amount: number;
  approved_amount?: number;
  claim_date: string;
  description?: string;
  status: string;
  documents?: any;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: string;
  base_salary?: number;
  allowances?: number;
  pf_amount?: number;
  tax_amount?: number;
  other_deductions?: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  payment_date?: string;
  payment_method?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  asset_name: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_value?: number;
  current_value?: number;
  depreciation?: number;
  assigned_to_employee_id?: string;
  department?: string;
  assigned_date?: string;
  location?: string;
  condition?: string;
  status: string;
  warranty_expiry?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  insurance_value?: number;
  documents?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TravelRequest {
  id: string;
  employee_id: string;
  destination: string;
  purpose?: string;
  start_date: string;
  end_date: string;
  estimated_cost?: number;
  status: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseClaim {
  id: string;
  employee_id: string;
  category?: string;
  claim_date: string;
  amount: number;
  status: string;
  description?: string;
  receipt_url?: string;
  payment_method?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}
