# Quick Start Guide - ERP HRM Module

## 🚀 5-Minute Setup

### Prerequisites
- Node.js v16+
- Supabase Account (free at supabase.com)
- Git

---

## Step 1: Get Supabase Credentials (2 min)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Once created, go to **Settings → API**
3. Copy these three values:
   - **Project URL** 
   - **Anon Key (public)**
   - **Service Role Key** (keep it secret!)

---

## Step 2: Create Database Tables (1 min)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Departments Table
CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Designations Table
CREATE TABLE designations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employees Table
CREATE TABLE employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id uuid REFERENCES departments(id),
    designation_id uuid REFERENCES designations(id),
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

-- Attendance Table
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

-- Leave Types Table
CREATE TABLE leave_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    days_per_year INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Leave Applications Table
CREATE TABLE leave_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id uuid NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days DECIMAL(5, 2),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by uuid REFERENCES employees(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Salaries Table
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

-- Performance Reviews Table
CREATE TABLE performance_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id uuid NOT NULL REFERENCES employees(id),
    review_date DATE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    performance_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Public Holidays Table
CREATE TABLE public_holidays (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    holiday_date DATE NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employee Benefits Table
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

-- Shifts Table
CREATE TABLE shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employee Shifts Assignment Table
CREATE TABLE employee_shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id uuid NOT NULL REFERENCES shifts(id),
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Training Records Table
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

-- Employment Contracts Table
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
```

4. Click **Run**

---

## Step 3: Setup Backend (1 min)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Edit .env file and add your Supabase credentials
# Copy this:
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key

# Start the backend server
npm run dev
```

The server will run on `http://localhost:5000`

---

## Step 4: Setup Frontend (1 min)

```bash
# Navigate to frontend
cd frontend

# Edit .env file and add Supabase credentials
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=ERP System
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development

# Start the frontend server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## Step 5: Test Everything (Opening both terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should show: "Server running on port 5000"
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Should show: "Local: http://localhost:5173"
```

Open browser: **http://localhost:5173**

---

## Test API Endpoints

### Create a Department
```bash
curl -X POST http://localhost:5000/api/hrm/departments \
  -H "Content-Type: application/json" \
  -d '{"name": "Engineering", "description": "Engineering Team"}'
```

### Get All Employees
```bash
curl http://localhost:5000/api/hrm/employees
```

### Create an Employee
```bash
curl -X POST http://localhost:5000/api/hrm/employees \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@company.com",
    "phone": "1234567890",
    "date_of_joining": "2024-01-15",
    "status": "active"
  }'
```

---

## Common Issues & Fixes

### Backend won't start
```bash
# Check Node version
node --version  # Should be v16+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check if port 5000 is free
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### CORS Errors
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL

### Connection to Supabase failed
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `VITE_API_URL` is correct
- Try `curl http://localhost:5000/health` to test backend

---

## 📚 Next Steps

1. Create HRM UI components in React
2. Add authentication
3. Implement data validation
4. Add role-based access control
5. Create performance reports

---

## 📖 Detailed Guides

- **SETUP_GUIDE.md** - Complete setup with explanations
- **BACKEND_CREATION_SUMMARY.md** - All files created
- **backend/README.md** - Backend documentation

---

**🎉 You're all set! Start building your ERP HRM module!**
