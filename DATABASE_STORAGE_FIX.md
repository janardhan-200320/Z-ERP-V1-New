# Database Storage Issue - Root Cause & Fix

## 🔍 Root Cause Analysis

Data was not being stored in the database due to **3 critical issues**:

### Issue 1: Missing Bank Accounts Table
- **Problem**: Frontend form collects bank information (bank name, branch, account number, IFSC code)
- **Issue**: Database schema had NO table for bank account storage
- **Impact**: Bank data was being collected but discarded during API call

### Issue 2: Department/Designation Lookup Missing
- **Problem**: Frontend sends department and designation as **string names** (e.g., "Engineering", "Manager")
- **Issue**: Database schema expects `department_id` and `designation_id` as **UUID references** to departments/designations tables
- **Impact**: Employee records couldn't link to departments/designations, causing database errors or null references

### Issue 3: Schema Mismatch
- **Frontend sends**: `full_name`, `email`, `phone`, `department`, `designation`, `location`, `bank_name`, etc.
- **Database expects**: `first_name`, `last_name`, `email`, `phone`, `department_id`, `designation_id`, `address`, (no bank fields)
- **Backend was**: Converting names correctly but NOT looking up department/designation IDs

---

## ✅ Fixes Applied

### Fix 1: Added bank_accounts Table
**File**: `/backend/sql/hrm-tables.sql`

```sql
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

CREATE INDEX idx_bank_accounts_employee_id ON bank_accounts(employee_id);
```

### Fix 2: Updated Employee Creation Logic
**File**: `/backend/src/controllers/hrm.controller.ts` - `createEmployee` function

**Before**: Directly inserted employee data without department/designation lookup
**After**: 
1. **Look up department** by name in departments table
2. **If not found** → Create the department automatically
3. **Look up designation** by name in designations table
4. **If not found** → Create the designation automatically
5. **Insert employee** with correct `department_id` and `designation_id`
6. **Create bank account** record after employee creation

### Fix 3: Updated Employee Update Logic
**File**: `/backend/src/controllers/hrm.controller.ts` - `updateEmployee` function

Same improvements as createEmployee:
- Lookup/create departments and designations
- Update or create bank account records as needed

---

## 🚀 How to Apply the Fixes

### Step 1: Update Database Schema
Run the SQL migration in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the bank_accounts table creation from `hrm-tables.sql`
3. Execute the query

```sql
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

CREATE INDEX idx_bank_accounts_employee_id ON bank_accounts(employee_id);
```

### Step 2: Restart Backend Server
```bash
cd backend
npm run dev  # or your start command
```

### Step 3: Test the Fix
1. Go to HRM → Employees
2. Click "Add New Employee"
3. Fill in all required fields (including bank details)
4. Click "Save"
5. Verify in Supabase Dashboard:
   - Check `employees` table - new record should appear
   - Check `bank_accounts` table - bank record should appear
   - Check `departments` and `designations` tables if new ones were created

---

## 📊 What Now Works

✅ Employees table stores: name, email, phone, gender, location, joining date, department_id, designation_id  
✅ Bank accounts table stores: bank name, branch, account number, IFSC code  
✅ Department/Designation automatic creation when non-existent  
✅ Proper foreign key relationships established  
✅ Full data persistence in database  

---

## 🧪 Verification Checklist

- [ ] Bank accounts table created in Supabase
- [ ] Backend server restarted
- [ ] Test adding a new employee with all fields
- [ ] Verify employee appears in Supabase employees table
- [ ] Verify bank account appears in Supabase bank_accounts table
- [ ] Verify departments/designations tables have correct references
- [ ] Test editing an existing employee with bank updates
- [ ] Check console for any errors

---

## 📝 Data Flow After Fix

```
Frontend Form
    ↓
API POST /hrm/employees
    ↓
Backend Controller
    ├→ Split full_name into first_name, last_name
    ├→ Lookup department by name (create if missing)
    ├→ Lookup designation by name (create if missing)
    ├→ Insert into employees table with department_id, designation_id
    └→ Insert bank account record in bank_accounts table
    ↓
Database (Supabase)
    ├→ employees table
    ├→ bank_accounts table
    ├→ departments table (auto-created if needed)
    └→ designations table (auto-created if needed)
    ↓
Response: Employee with ID
    ↓
Frontend: Show success toast, refresh employee list
```

---

## 🔧 Technical Details

### Environment Requirements
- Node.js with Express server running
- Supabase project with PostgreSQL database
- Environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

### API Payload (Frontend → Backend)
```javascript
{
  full_name: "John Doe",
  email: "john@company.com",
  phone: "+1-555-0000",
  department: "Engineering",  // Will be looked up/created
  designation: "Senior Dev",   // Will be looked up/created
  location: "Remote",
  gender: "Male",
  join_date: "2026-05-11",
  bank_name: "Chase Bank",
  bank_account_number: "1234567890",
  bank_routing_number: "123456789",
  status: "onboarding"
}
```

### Database Result
Employee record in `employees` table + Bank record in `bank_accounts` table
