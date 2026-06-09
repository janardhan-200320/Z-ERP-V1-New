/**
 * API Client for Employee Profile Module
 * Provides functions for employee, attendance, leave, insurance, and payroll operations
 */

import { supabase } from './superbase';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const activeSessionStorageKey = 'z_erp_active_session';

const readActiveSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(activeSessionStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const buildHeaders = async () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
};

const requestJson = async <T>(path: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> => {
  const headers = await buildHeaders();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }

  if (!response.ok) {
    return { error: body?.error || response.statusText || 'Request failed' };
  }

  return { data: body as T };
};

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Employee {
  id: string;
  user_id?: string;
  employee_code?: string;
  full_name: string;
  email: string;
  phone?: string | null;
  alternate_phone?: string | null;
  department?: string | null;
  position?: string | null;
  designation?: string | null;
  manager?: string | null;
  join_date?: string | null;
  status?: string;
  location?: string | null;
  blood_group?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_routing_number?: string | null;
  avatar_url?: string | null;
  exit_workflow?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  break_start?: string | null;
  break_end?: string | null;
  total_break_duration_ms?: number | null;
  work_mode?: string | null;
  location?: string | null;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  work_hours?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason?: string | null;
  attachment_url?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicy {
  id: string;
  employee_id: string;
  policy_name: string;
  policy_number?: string | null;
  provider?: string | null;
  coverage?: string | null;
  premium?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: string;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  payment_date?: string | null;
  payment_method?: string | null;
  status: 'pending' | 'processed' | 'paid' | 'cancelled';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// EMPLOYEE PROFILE API
// =====================================================

/**
 * Fetch the current user's employee profile
 * Auto-creates if not exists
 */
export async function getMyEmployee(): Promise<{ 
  data?: Employee; 
  error?: string 
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const session = readActiveSession();
      const sessionEmail = String(session?.email || '').trim();

      if (!sessionEmail) {
        return { error: 'Not authenticated' };
      }

      const { data: employees, error } = await requestJson<Employee[]>(
        `/hrm/employees?email=${encodeURIComponent(sessionEmail)}`
      );

      if (error) {
        return { error };
      }

      const employee = Array.isArray(employees) ? employees[0] : undefined;

      if (!employee) {
        return { error: 'Email not found in HRM' };
      }

      return { data: employee as Employee };
    }

    const { data: employees, error } = await requestJson<Employee[]>(
      `/hrm/employees?user_id=${encodeURIComponent(user.id)}`
    );

    if (error) {
      return { error };
    }

    let employee = Array.isArray(employees) ? employees[0] : undefined;

    if (!employee) {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Employee';

      const { data: created, error: createError } = await requestJson<Employee>('/hrm/employees', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          full_name: fullName,
          email: user.email,
          status: 'active'
        })
      });

      if (createError) {
        return { error: createError };
      }

      employee = created;
    }

    return { data: employee as Employee };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch employee' };
  }
}

/**
 * Update the current user's employee profile
 */
export async function updateMyEmployee(
  payload: Partial<Employee>
): Promise<{ data?: Employee; error?: string }> {
  try {
    const { data: employee, error } = await getMyEmployee();
    if (error || !employee) {
      return { error: error || 'Employee record not found' };
    }

    const { data, error: updateError } = await requestJson<Employee>(
      `/hrm/employees/${employee.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      }
    );

    if (updateError) {
      return { error: updateError };
    }

    return { data: data as Employee };
  } catch (err: any) {
    return { error: err.message || 'Failed to update employee' };
  }
}

/**
 * Fetch all employees (admin)
 */
export async function getAllEmployees(params?: {
  search?: string;
  status?: string;
  department?: string;
}): Promise<{ 
  data?: Employee[]; 
  error?: string 
}> {
  try {
    let query = supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (params?.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,employee_code.ilike.%${params.search}%`);
    }

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.department) {
      query = query.eq('department', params.department);
    }

    const { data, error } = await query;

    if (error) {
      return { error: error.message };
    }

    return { data: data as Employee[] };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch employees' };
  }
}

// =====================================================
// ATTENDANCE API
// =====================================================

/**
 * Check in
 */
export async function checkIn(payload: {
  work_mode: string;
  location?: string;
}): Promise<{ data?: AttendanceRecord; error?: string }> {
  try {
    const { data: employee, error: employeeError } = await getMyEmployee();
    if (employeeError) {
      return { error: employeeError };
    }
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const { data, error } = await requestJson<AttendanceRecord>('/hrm/attendance-records/check-in', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: employee.id,
        work_mode: payload.work_mode,
        location: payload.location
      })
    });

    if (error) {
      return { error };
    }

    return { data: data as AttendanceRecord };
  } catch (err: any) {
    return { error: err.message || 'Failed to check in' };
  }
}

/**
 * Check out
 */
export async function checkOut(payload?: {
  location?: string;
}): Promise<{ data?: AttendanceRecord; error?: string }> {
  try {
    const { data: employee, error: employeeError } = await getMyEmployee();
    if (employeeError) {
      return { error: employeeError };
    }
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const { data, error } = await requestJson<AttendanceRecord>('/hrm/attendance-records/check-out', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: employee.id,
        location: payload?.location
      })
    });

    if (error) {
      return { error };
    }

    return { data: data as AttendanceRecord };
  } catch (err: any) {
    return { error: err.message || 'Failed to check out' };
  }
}

/**
 * Get attendance history
 */
export async function getAttendanceHistory(params?: {
  month?: string; // YYYY-MM
  limit?: number;
}): Promise<{ data?: AttendanceRecord[]; error?: string }> {
  try {
    const { data: employee, error: employeeError } = await getMyEmployee();
    if (employeeError) {
      return { error: employeeError };
    }
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const search = new URLSearchParams({ employee_id: employee.id });
    if (params?.month) {
      search.set('month', params.month);
    }

    const { data, error } = await requestJson<AttendanceRecord[]>(
      `/hrm/attendance-records?${search.toString()}`
    );

    if (error) {
      return { error };
    }

    let records = Array.isArray(data) ? data : [];
    if (params?.limit) {
      records = records.slice(0, params.limit);
    }

    return { data: records as AttendanceRecord[] };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch attendance history' };
  }
}

/**
 * Get today's attendance
 */
export async function getTodayAttendance(): Promise<{ 
  data?: AttendanceRecord; 
  error?: string 
}> {
  try {
    const { data: employee, error: employeeError } = await getMyEmployee();
    if (employeeError) {
      return { error: employeeError };
    }
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const today = new Date().toISOString().split('T')[0];

    const search = new URLSearchParams({
      employee_id: employee.id,
      date: today
    });

    const { data, error } = await requestJson<AttendanceRecord[]>(
      `/hrm/attendance-records?${search.toString()}`
    );

    if (error) {
      return { error };
    }

    const record = Array.isArray(data) ? data[0] : undefined;
    return { data: record as AttendanceRecord };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch today\'s attendance' };
  }
}

// =====================================================
// LEAVE REQUESTS API
// =====================================================

/**
 * Get my leave requests
 */
export async function getMyLeaveRequests(): Promise<{ 
  data?: LeaveRequest[]; 
  error?: string 
}> {
  try {
    const { data: employee, error: employeeError } = await getMyEmployee();
    if (employeeError) {
      return { error: employeeError };
    }
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const { data, error } = await requestJson<LeaveRequest[]>(
      `/hrm/leave-requests?employee_id=${encodeURIComponent(employee.id)}`
    );

    if (error) {
      return { error };
    }

    return { data: (data || []) as LeaveRequest[] };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch leave requests' };
  }
}

/**
 * Create leave request
 */
export async function createLeaveRequest(payload: {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  attachment_url?: string;
}): Promise<{ data?: LeaveRequest; error?: string }> {
  try {
    const { data: employee, error: employeeError } = await getMyEmployee();
    if (employeeError) {
      return { error: employeeError };
    }
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    // Calculate days
    const start = new Date(payload.start_date);
    const end = new Date(payload.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const { data, error } = await requestJson<LeaveRequest>('/hrm/leave-requests', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: employee.id,
        leave_type: payload.leave_type,
        start_date: payload.start_date,
        end_date: payload.end_date,
        days,
        reason: payload.reason,
        attachment_url: payload.attachment_url,
        status: 'pending'
      })
    });

    if (error) {
      return { error };
    }

    return { data: data as LeaveRequest };
  } catch (err: any) {
    return { error: err.message || 'Failed to create leave request' };
  }
}

/**
 * Cancel leave request
 */
export async function cancelLeaveRequest(id: string): Promise<{ error?: string }> {
  try {
    const { error } = await requestJson<LeaveRequest>(`/hrm/leave-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' })
    });

    if (error) {
      return { error };
    }

    return {};
  } catch (err: any) {
    return { error: err.message || 'Failed to cancel leave request' };
  }
}

// =====================================================
// INSURANCE POLICIES API
// =====================================================

/**
 * Get my insurance policies
 */
export async function getMyInsurancePolicies(): Promise<{ 
  data?: InsurancePolicy[]; 
  error?: string 
}> {
  try {
    const { data: employee, error: employeeError } = await getMyEmployee();
    if (employeeError) {
      return { error: employeeError };
    }
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const { data, error } = await requestJson<InsurancePolicy[]>(
      `/hrm/insurance-policies?employee_id=${encodeURIComponent(employee.id)}`
    );

    if (error) {
      return { error };
    }

    return { data: (data || []) as InsurancePolicy[] };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch insurance policies' };
  }
}

// =====================================================
// PAYROLL RECORDS API
// =====================================================

/**
 * Get my payroll records
 */
export async function getMyPayrollRecords(): Promise<{ 
  data?: PayrollRecord[]; 
  error?: string 
}> {
  try {
    const { data: employee, error: employeeError } = await getMyEmployee();
    if (employeeError) {
      return { error: employeeError };
    }
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const { data, error } = await requestJson<PayrollRecord[]>(
      `/hrm/payroll-records?employee_id=${encodeURIComponent(employee.id)}`
    );

    if (error) {
      return { error };
    }

    return { data: (data || []) as PayrollRecord[] };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch payroll records' };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time
 */
export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculate work hours from check in and check out
 */
export function calculateWorkHours(
  checkIn?: string | null,
  checkOut?: string | null,
  breakDurationMs?: number | null
): number {
  if (!checkIn || !checkOut) return 0;
  
  const checkInTime = new Date(checkIn).getTime();
  const checkOutTime = new Date(checkOut).getTime();
  const workMs = checkOutTime - checkInTime - (breakDurationMs || 0);
  
  return Math.round((workMs / (1000 * 60 * 60)) * 100) / 100; // hours with 2 decimals
}
