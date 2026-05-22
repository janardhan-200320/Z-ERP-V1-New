# ERP HRM Module - Complete Setup Guide

## Overview

This guide covers the complete setup for the ERP system's HRM module, including backend API, frontend integration, and environment configuration.

---

## Part 1: Backend Setup

### Step 1: Install Dependencies

Navigate to the backend directory and install all required packages:

```bash
cd backend
npm install
```

### Step 2: Environment Configuration - Backend

Create or update the `.env` file in the backend directory with your Supabase credentials:

```bash
# backend/.env

# Server Configuration
NODE_ENV=development
PORT=5000

# Supabase Configuration
# Go to Supabase Dashboard → Settings → API to find these values
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
```

**How to find Supabase Credentials:**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. You'll find:
   - Project URL → `SUPABASE_URL`
   - Anon Key (public) → `SUPABASE_ANON_KEY`
   - Service Role Key (keep secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Database Tables

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the complete SQL script (provided earlier in this conversation)
5. Click "Run"

**Tables created:**
- departments
- designations
- employees
- attendance
- leave_types
- leave_applications
- salaries
- performance_reviews
- public_holidays
- employee_benefits
- shifts
- employee_shifts
- training_records
- employment_contracts

### Step 4: Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Or build and run
npm run build
npm start
```

The backend server will start on `http://localhost:5000`

**Check if server is running:**
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status": "OK", "message": "Server is running"}
```

---

## Part 2: Frontend Setup

### Step 1: Install Dependencies

Navigate to the frontend directory and install packages:

```bash
cd frontend
npm install
```

### Step 2: Environment Configuration - Frontend

Create or update the `.env` file in the frontend directory:

```bash
# frontend/.env

# API Configuration - Must match your backend URL
VITE_API_URL=http://localhost:5000/api

# Supabase Configuration - Same as backend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
VITE_APP_NAME=ERP System
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true

# Environment
VITE_NODE_ENV=development
```

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## Part 3: Creating the Frontend API Client

Create a file to communicate with your backend API:

**File: `frontend/src/lib/hrm-api.ts`**

```typescript
const API_URL = import.meta.env.VITE_API_URL;

// Employee API
export const employeeApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/hrm/employees`);
    return res.json();
  },
  
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/hrm/employees/${id}`);
    return res.json();
  },
  
  create: async (data: any) => {
    const res = await fetch(`${API_URL}/hrm/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/hrm/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  delete: async (id: string) => {
    await fetch(`${API_URL}/hrm/employees/${id}`, { method: 'DELETE' });
  },
};

// Department API
export const departmentApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/hrm/departments`);
    return res.json();
  },
  
  create: async (data: any) => {
    const res = await fetch(`${API_URL}/hrm/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// Add more API functions as needed...
```

---

## Part 4: Environment Variables Quick Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | development |
| `PORT` | Server port | 5000 |
| `SUPABASE_URL` | Supabase project URL | https://xxx.supabase.co |
| `SUPABASE_ANON_KEY` | Public Supabase key | eyJhbGc... |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Supabase key | eyJhbGc... |
| `FRONTEND_URL` | Frontend origin | http://localhost:5173 |
| `JWT_SECRET` | JWT signing key | your-secret-here |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:5000/api |
| `VITE_SUPABASE_URL` | Supabase project URL | https://xxx.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase key | eyJhbGc... |
| `VITE_APP_NAME` | Application name | ERP System |
| `VITE_APP_VERSION` | App version | 1.0.0 |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | true |
| `VITE_NODE_ENV` | Environment | development |

---

## Part 5: Testing the Setup

### Test Backend Endpoints

**1. Get all employees:**
```bash
curl http://localhost:5000/api/hrm/employees
```

**2. Create a department:**
```bash
curl -X POST http://localhost:5000/api/hrm/departments \
  -H "Content-Type: application/json" \
  -d '{"name": "Engineering", "description": "Engineering Department"}'
```

**3. Create an employee:**
```bash
curl -X POST http://localhost:5000/api/hrm/employees \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "date_of_joining": "2024-01-15",
    "status": "active"
  }'
```

### Test Frontend Integration

In your React component:

```typescript
import { employeeApi } from '@/lib/hrm-api';

export function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    employeeApi.getAll().then(setEmployees);
  }, []);

  return (
    <div>
      {employees.map(emp => (
        <div key={emp.id}>{emp.first_name} {emp.last_name}</div>
      ))}
    </div>
  );
}
```

---

## Part 6: Production Deployment

### Backend Deployment

**Environment variables for production:**

```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=generate-strong-random-key
```

**Build:**
```bash
npm run build
npm start
```

**Deploy to:**
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean
- Vercel (Node.js)

### Frontend Deployment

**Environment variables for production:**

```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_APP_NAME=ERP System
VITE_NODE_ENV=production
```

**Build:**
```bash
npm run build
```

**Deploy to:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Cloudflare Pages

---

## Part 7: Troubleshooting

### Backend Won't Start

**Check 1:** Verify Node.js version
```bash
node --version  # Should be v16 or higher
```

**Check 2:** Install dependencies again
```bash
npm install
```

**Check 3:** Check port availability
```bash
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows
```

### CORS Errors

**Solution:** Update `FRONTEND_URL` in backend `.env` to match your frontend URL exactly.

### Supabase Connection Failed

**Check:**
1. Internet connection
2. Supabase credentials are correct
3. Supabase project is active
4. Check Supabase status page

### Frontend Can't Connect to Backend

**Check:**
1. Backend is running on correct port
2. `VITE_API_URL` matches backend URL
3. Backend CORS settings include frontend URL
4. No firewall blocking the connection

---

## Summary

✅ Backend created with Express + Supabase
✅ All HRM tables created in Supabase
✅ Environment variables configured
✅ API endpoints ready
✅ Frontend integrated with backend

You're now ready to build your HRM module features!
