/**
 * API Client for Employee Profile Module
 * Provides functions for employee, attendance, leave, insurance, and payroll operations
 */

import { supabase } from './superbase';

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
      return { error: 'Not authenticated' };
    }

    let { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Auto-create employee record if doesn't exist
    if (error && error.code === 'PGRST116') {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Employee';

      const { data: created, error: createError } = await supabase
        .from('employees')
        .insert({
          user_id: user.id,
          full_name: fullName,
          email: user.email,
          status: 'active',
        })
        .select()
        .single();

      if (createError) {
        return { error: createError.message };
      }

      employee = created;
    } else if (error) {
      return { error: error.message };
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('employees')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
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
    const { data: employee } = await getMyEmployee();
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_records')
      .upsert({
        employee_id: employee.id,
        date: today,
        check_in: new Date().toISOString(),
        work_mode: payload.work_mode,
        location: payload.location,
        status: 'present',
      }, {
        onConflict: 'employee_id,date'
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
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
    const { data: employee } = await getMyEmployee();
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        check_out: new Date().toISOString(),
        location: payload?.location,
      })
      .eq('employee_id', employee.id)
      .eq('date', today)
      .select()
      .single();

    if (error) {
      return { error: error.message };
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
    const { data: employee } = await getMyEmployee();
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employee.id)
      .order('date', { ascending: false });

    if (params?.month) {
      query = query.gte('date', `${params.month}-01`)
                   .lt('date', `${params.month}-32`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      return { error: error.message };
    }

    return { data: data as AttendanceRecord[] };
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
    const { data: employee } = await getMyEmployee();
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { error: error.message };
    }

    return { data: data as AttendanceRecord };
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
    const { data: employee } = await getMyEmployee();
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: data as LeaveRequest[] };
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
    const { data: employee } = await getMyEmployee();
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    // Calculate days
    const start = new Date(payload.start_date);
    const end = new Date(payload.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: employee.id,
        leave_type: payload.leave_type,
        start_date: payload.start_date,
        end_date: payload.end_date,
        days,
        reason: payload.reason,
        attachment_url: payload.attachment_url,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
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
    const { error } = await supabase
      .from('leave_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('status', 'pending'); // Only allow cancelling pending requests

    if (error) {
      return { error: error.message };
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
    const { data: employee } = await getMyEmployee();
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: data as InsurancePolicy[] };
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
    const { data: employee } = await getMyEmployee();
    if (!employee) {
      return { error: 'Employee record not found' };
    }

    const { data, error } = await supabase
      .from('payroll_records')
      .select('*')
      .eq('employee_id', employee.id)
      .order('month', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: data as PayrollRecord[] };
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
    currency: 'USD'
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
