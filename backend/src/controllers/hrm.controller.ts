import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { Employee, Department, Designation, Attendance, LeaveApplication, LeaveType, Salary, InsurancePolicy, InsuranceClaim, PayrollRecord, Asset, TravelRequest, ExpenseClaim, PublicHoliday, Announcement, HRLetter } from '../types/hrm.types';

// ==================== EMPLOYEE ENDPOINTS ====================

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const client = supabaseAdmin || supabase;
    
    // Fetch all employees
    const { data: employees, error: empError } = await client
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (empError) throw empError;

    if (!employees || employees.length === 0) {
      return res.json([]);
    }

    // Fetch departments and designations
    const { data: departments } = await client.from('departments').select('id, name');
    const { data: designations } = await client.from('designations').select('id, name');

    // Create lookup maps
    const deptMap = new Map(departments?.map((d: any) => [d.id, d.name]) || []);
    const desigMap = new Map(designations?.map((d: any) => [d.id, d.name]) || []);

    // Transform employee data to include department and designation names
    const transformedData = employees.map((emp: any) => ({
      ...emp,
      department: emp.department_id ? deptMap.get(emp.department_id) : null,
      designation: emp.designation_id ? desigMap.get(emp.designation_id) : null
    }));

    res.json(transformedData);
  } catch (err: any) {
    console.error('Get Employees Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;

    // Fetch single employee
    const { data: emp, error: empError } = await client
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (empError) throw empError;
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch departments and designations
    const { data: departments } = await client.from('departments').select('id, name');
    const { data: designations } = await client.from('designations').select('id, name');

    // Create lookup maps
    const deptMap = new Map(departments?.map((d: any) => [d.id, d.name]) || []);
    const desigMap = new Map(designations?.map((d: any) => [d.id, d.name]) || []);

    // Transform employee data
    const transformedData = {
      ...emp,
      department: emp.department_id ? deptMap.get(emp.department_id) : null,
      designation: emp.designation_id ? desigMap.get(emp.designation_id) : null
    };

    res.json(transformedData);
  } catch (err: any) {
    console.error('Get Employee By ID Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      email,
      phone,
      department,
      designation,
      gender,
      join_date,
      bank_name,
      bank_account_number,
      bank_routing_number,
      location,
      status = 'onboarding'
    } = req.body;

    // Split full_name into first_name and last_name
    const nameParts = full_name?.trim().split(' ') || ['', ''];
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    if (!email || !first_name) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    const client = supabaseAdmin || supabase;

    // Get or create department
    let departmentId = null;
    if (department) {
      const { data: deptData } = await client
        .from('departments')
        .select('id')
        .eq('name', department)
        .single();

      if (deptData) {
        departmentId = deptData.id;
      } else {
        // Create department if it doesn't exist
        const { data: newDept, error: deptError } = await client
          .from('departments')
          .insert([{ name: department, description: '' }])
          .select('id')
          .single();

        if (!deptError && newDept) {
          departmentId = newDept.id;
        }
      }
    }

    // Get or create designation
    let designationId = null;
    if (designation) {
      const { data: desigData } = await client
        .from('designations')
        .select('id')
        .eq('name', designation)
        .single();

      if (desigData) {
        designationId = desigData.id;
      } else {
        // Create designation if it doesn't exist
        const { data: newDesig, error: desigError } = await client
          .from('designations')
          .insert([{ name: designation, description: '' }])
          .select('id')
          .single();

        if (!desigError && newDesig) {
          designationId = newDesig.id;
        }
      }
    }

    // Prepare employee data for database
    const employeeData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      gender: gender || null,
      address: location || null,
      status: status,
      date_of_joining: join_date ? new Date(join_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      department_id: departmentId,
      designation_id: designationId
    };

    // Insert employee
    const { data: employeeResult, error: empError } = await client
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (empError) {
      console.error('Supabase Insert Error:', empError);
      
      // Parse database error for better user messages
      let userMessage = empError.message;
      
      if (empError.code === '23505') {
        // Unique constraint violation
        if (empError.details?.includes('email')) {
          userMessage = `An employee with the email "${email}" already exists.`;
        } else {
          userMessage = 'Duplicate record detected. Please check your information.';
        }
      }
      
      throw new Error(userMessage);
    }

    // Insert bank account information if provided
    if (employeeResult && bank_name && bank_account_number) {
      const bankData = {
        employee_id: employeeResult.id,
        bank_name,
        branch_name: req.body.bank_branch || null,
        account_number: bank_account_number,
        ifsc_code: bank_routing_number || null,
        is_primary: true
      };

      try {
        await client
          .from('bank_accounts')
          .insert([bankData]);
      } catch (bankErr: any) {
        console.error('Bank account insert error:', bankErr);
      }
    }

    res.status(201).json(employeeResult);
  } catch (err: any) {
    console.error('Create Employee Error:', err);
    res.status(500).json({ error: err.message || 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      email,
      phone,
      department,
      designation,
      gender,
      join_date,
      bank_name,
      bank_account_number,
      bank_routing_number,
      location,
      status
    } = req.body;

    const client = supabaseAdmin || supabase;

    // Prepare update data
    const updateData: any = {};

    if (full_name) {
      const nameParts = full_name.trim().split(' ');
      updateData.first_name = nameParts[0] || '';
      updateData.last_name = nameParts.slice(1).join(' ') || '';
    }

    if (email) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (location !== undefined) updateData.address = location || null;
    if (status !== undefined) updateData.status = status;
    if (join_date) {
      updateData.date_of_joining = new Date(join_date).toISOString().split('T')[0];
    }

    // Get or create department
    if (department) {
      const { data: deptData } = await client
        .from('departments')
        .select('id')
        .eq('name', department)
        .single();

      if (deptData) {
        updateData.department_id = deptData.id;
      } else {
        // Create department if it doesn't exist
        const { data: newDept } = await client
          .from('departments')
          .insert([{ name: department, description: '' }])
          .select('id')
          .single();

        if (newDept) {
          updateData.department_id = newDept.id;
        }
      }
    }

    // Get or create designation
    if (designation) {
      const { data: desigData } = await client
        .from('designations')
        .select('id')
        .eq('name', designation)
        .single();

      if (desigData) {
        updateData.designation_id = desigData.id;
      } else {
        // Create designation if it doesn't exist
        const { data: newDesig } = await client
          .from('designations')
          .insert([{ name: designation, description: '' }])
          .select('id')
          .single();

        if (newDesig) {
          updateData.designation_id = newDesig.id;
        }
      }
    }

    // Update employee
    const { data, error } = await client
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Update Error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Update bank account information if provided
    if (bank_name && bank_account_number) {
      // Check if bank account exists
      const { data: bankData } = await client
        .from('bank_accounts')
        .select('id')
        .eq('employee_id', id)
        .single();

      const bankInfo = {
        bank_name,
        branch_name: req.body.bank_branch || null,
        account_number: bank_account_number,
        ifsc_code: bank_routing_number || null
      };

      if (bankData) {
        // Update existing bank account
        try {
          await client
            .from('bank_accounts')
            .update(bankInfo)
            .eq('employee_id', id);
        } catch (bankErr: any) {
          console.error('Bank account update error:', bankErr);
        }
      } else {
        // Insert new bank account
        try {
          await client
            .from('bank_accounts')
            .insert([{
              employee_id: id,
              ...bankInfo,
              is_primary: true
            }]);
        } catch (bankErr: any) {
          console.error('Bank account insert error:', bankErr);
        }
      }
    }

    res.json(data);
  } catch (err: any) {
    console.error('Update Employee Error:', err);
    res.status(500).json({ error: err.message || 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Employee deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== ATTENDANCE ENDPOINTS ====================

export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { employee_id, date } = req.query;
    let query = supabase.from('attendance').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (date) query = query.eq('date', date);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const attendance: Attendance = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('attendance')
      .insert([attendance])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== LEAVE ENDPOINTS ====================

export const getLeaveApplications = async (req: Request, res: Response) => {
  try {
    const { employee_id, status } = req.query;
    let query = supabase.from('leave_applications').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createLeaveApplication = async (req: Request, res: Response) => {
  try {
    const leave: LeaveApplication = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('leave_applications')
      .insert([leave])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLeaveApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('leave_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const leaveType: LeaveType = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('leave_types')
      .insert([leaveType])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== SALARY ENDPOINTS ====================

export const getSalaries = async (req: Request, res: Response) => {
  try {
    const { employee_id, salary_month } = req.query;
    let query = supabase.from('salaries').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (salary_month) query = query.eq('salary_month', salary_month);

    const { data, error } = await query.order('salary_month', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createSalary = async (req: Request, res: Response) => {
  try {
    const salary: Salary = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('salaries')
      .insert([salary])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSalary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('salaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== PAYROLL RECORD ENDPOINTS ====================

export const getPayrollRecords = async (req: Request, res: Response) => {
  try {
    const { employee_id, month, status } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('payroll_records').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (month) query = query.eq('month', month);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('month', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createPayrollRecord = async (req: Request, res: Response) => {
  try {
    const record: PayrollRecord = req.body;
    const client = supabaseAdmin || supabase;

    if (record.net_salary == null && record.gross_salary != null) {
      const deductions = Number(record.deductions || 0);
      const gross = Number(record.gross_salary || 0);
      record.net_salary = gross - deductions;
    }

    const { data, error } = await client
      .from('payroll_records')
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePayrollRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;

    if (updates.net_salary == null && updates.gross_salary != null) {
      const deductions = Number(updates.deductions || 0);
      const gross = Number(updates.gross_salary || 0);
      updates.net_salary = gross - deductions;
    }

    const { data, error } = await client
      .from('payroll_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePayrollRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('payroll_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Payroll record deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== ASSET ENDPOINTS ====================

export const getAssets = async (req: Request, res: Response) => {
  try {
    const { status, category, assigned_to_employee_id, department } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('hrm_assets').select('*');

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (assigned_to_employee_id) query = query.eq('assigned_to_employee_id', assigned_to_employee_id);
    if (department) query = query.eq('department', department);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const asset: Asset = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_assets')
      .insert([asset])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('hrm_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Asset deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== TRAVEL REQUEST ENDPOINTS ====================

export const getTravelRequests = async (req: Request, res: Response) => {
  try {
    const { employee_id, status } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('hrm_travel_requests').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTravelRequest = async (req: Request, res: Response) => {
  try {
    const request: TravelRequest = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_travel_requests')
      .insert([request])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTravelRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_travel_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTravelRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('hrm_travel_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Travel request deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== EXPENSE CLAIM ENDPOINTS ====================

export const getExpenseClaims = async (req: Request, res: Response) => {
  try {
    const { employee_id, status, claim_date } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('hrm_expense_claims').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (status) query = query.eq('status', status);
    if (claim_date) query = query.eq('claim_date', claim_date);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createExpenseClaim = async (req: Request, res: Response) => {
  try {
    const claim: ExpenseClaim = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_expense_claims')
      .insert([claim])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateExpenseClaim = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_expense_claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteExpenseClaim = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('hrm_expense_claims')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Expense claim deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== PUBLIC HOLIDAY ENDPOINTS ====================

export const getPublicHolidays = async (req: Request, res: Response) => {
  try {
    const { from_date, to_date } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('public_holidays').select('*');

    if (from_date && typeof from_date === 'string') {
      query = query.gte('holiday_date', from_date);
    }
    if (to_date && typeof to_date === 'string') {
      query = query.lte('holiday_date', to_date);
    }

    const { data, error } = await query.order('holiday_date', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createPublicHoliday = async (req: Request, res: Response) => {
  try {
    const holiday: PublicHoliday = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('public_holidays')
      .insert([holiday])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePublicHoliday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('public_holidays')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePublicHoliday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('public_holidays')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Public holiday deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== ANNOUNCEMENT ENDPOINTS ====================

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { active, priority } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('hrm_announcements').select('*');

    if (priority && typeof priority === 'string') {
      query = query.eq('priority', priority);
    }

    if (active === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query = query.or(`expires_at.is.null,expires_at.gte.${today}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const announcement: Announcement = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_announcements')
      .insert([announcement])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('hrm_announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== HR LETTER ENDPOINTS ====================

export const getHrLetters = async (req: Request, res: Response) => {
  try {
    const { employee_id, status, letter_type } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('hrm_letters').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (status) query = query.eq('status', status);
    if (letter_type) query = query.eq('letter_type', letter_type);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createHrLetter = async (req: Request, res: Response) => {
  try {
    const letter: HRLetter = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_letters')
      .insert([letter])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHrLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('hrm_letters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteHrLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('hrm_letters')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'HR letter deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== DEPARTMENT ENDPOINTS ====================

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const department: Department = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('departments')
      .insert([department])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Department deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== DESIGNATION ENDPOINTS ====================

export const getDesignations = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('designations')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createDesignation = async (req: Request, res: Response) => {
  try {
    const designation: Designation = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('designations')
      .insert([designation])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('designations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('designations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Designation deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== INSURANCE POLICY ENDPOINTS ====================

export const getInsurancePolicies = async (req: Request, res: Response) => {
  try {
    const { employee_id, status, policy_type, provider } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('insurance_policies').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (status) query = query.eq('status', status);
    if (policy_type) query = query.eq('policy_type', policy_type);
    if (provider) query = query.eq('provider', provider);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json([]);
    }

    const employeeIds = Array.from(new Set(data.map((policy: any) => policy.employee_id).filter(Boolean)));
    let employeeMap = new Map<string, any>();

    if (employeeIds.length > 0) {
      const { data: employees, error: empError } = await (supabaseAdmin || supabase)
        .from('employees')
        .select('id, first_name, last_name, email')
        .in('id', employeeIds);

      if (empError) throw empError;
      employeeMap = new Map(
        (employees || []).map((emp: any) => [emp.id, {
          id: emp.id,
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
          email: emp.email || ''
        }])
      );
    }

    const enriched = data.map((policy: any) => ({
      ...policy,
      employee: employeeMap.get(policy.employee_id) || null
    }));

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createInsurancePolicy = async (req: Request, res: Response) => {
  try {
    const policy: InsurancePolicy = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('insurance_policies')
      .insert([policy])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateInsurancePolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('insurance_policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteInsurancePolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('insurance_policies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Insurance policy deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== INSURANCE CLAIM ENDPOINTS ====================

export const getInsuranceClaims = async (req: Request, res: Response) => {
  try {
    const { employee_id, policy_id, status } = req.query;
    const client = supabaseAdmin || supabase;
    let query = client.from('insurance_claims').select('*');

    if (employee_id) query = query.eq('employee_id', employee_id);
    if (policy_id) query = query.eq('policy_id', policy_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createInsuranceClaim = async (req: Request, res: Response) => {
  try {
    const claim: InsuranceClaim = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('insurance_claims')
      .insert([claim])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateInsuranceClaim = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('insurance_claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteInsuranceClaim = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('insurance_claims')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Insurance claim deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
