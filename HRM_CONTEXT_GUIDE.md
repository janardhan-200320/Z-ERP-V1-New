# HRM Context Implementation Guide

## Overview

All HRM modules (Employees, Attendance, Insurance, Payroll, Performance, Letters, Travel Expense, Announcements, Public Holidays, Assets) now have access to centralized employee data through the **HRMContext**.

## What Has Been Implemented

### 1. **HRM Context Provider** (`frontend/client/src/contexts/HRMContext.tsx`)
- Centralized state management for employee data
- Fetches employee data from backend API
- Provides normalized employee data to all HRM pages
- Includes refetch functionality for data updates

### 2. **HRM Router** (`frontend/client/src/App.tsx`)
- All HRM routes are wrapped with `<HRMProvider>`
- Ensures all HRM pages have access to employee data
- Automatically loads employee data once when entering HRM module

### 3. **Updated HRM Pages**
The following pages have been updated to use `useHRM()` hook:
- ✅ `hrm-employees.tsx` - (Already had its own implementation)
- ✅ `hrm-attendance.tsx` - Now uses `{ employees }` from context
- ✅ `hrm-insurance.tsx` - Now uses `{ employees }` from context  
- ✅ `hrm-payroll.tsx` - Now uses `{ employees }` from context
- ✅ `hrm-performance.tsx` - Now uses `{ employees }` from context

## How to Use the HRM Context in Other Pages

### In Any HRM Page Component:

#### Step 1: Import the hook
```typescript
import { useHRM } from '@/contexts/HRMContext';
```

#### Step 2: Use the hook in your component
```typescript
export default function YourHRMPage() {
  const { 
    employees,              // Array of all employees (normalized)
    isLoadingEmployees,     // Boolean - true while fetching
    employeesError,         // Error message if fetch fails
    refetchEmployees        // Function to manually refresh data
  } = useHRM();

  // Now use employees array in your component
  return (
    <div>
      {employees.map(emp => (
        <div key={emp.id}>
          {emp.name} - {emp.department}
        </div>
      ))}
    </div>
  );
}
```

### Employee Data Structure

Each employee object includes:
```typescript
{
  id: string;              // Unique identifier (UUID)
  name: string;            // Full name (normalized from first_name + last_name)
  email: string;           // Official email
  phone: string;           // Primary phone number
  first_name?: string;     // First name
  last_name?: string;      // Last name
  department: string;      // Department name
  designation: string;     // Job designation
  status: string;          // Employee status (active, onboarding, exit, etc.)
  gender?: string;         // Employee gender
  address?: string;        // Employee address
  date_of_joining?: string;// Joining date
  created_at?: string;     // Record creation timestamp
  updated_at?: string;     // Record update timestamp
  [key: string]: any;      // Additional custom fields
}
```

## Pages That Still Need Updates

The following HRM pages should be updated to use the HRM context. They currently don't use it:

1. **hrm-assets.tsx**
   - Add: `import { useHRM } from '@/contexts/HRMContext';`
   - Add: `const { employees } = useHRM();`

2. **hrm-letters.tsx**
   - Add: `import { useHRM } from '@/contexts/HRMContext';`
   - Add: `const { employees } = useHRM();`

3. **hrm-travel-expense.tsx**
   - Add: `import { useHRM } from '@/contexts/HRMContext';`
   - Add: `const { employees } = useHRM();`

4. **hrm-announcements.tsx**
   - Add: `import { useHRM } from '@/contexts/HRMContext';`
   - Add: `const { employees } = useHRM();` (if needed)

5. **hrm-public-holidays.tsx**
   - Add: `import { useHRM } from '@/contexts/HRMContext';`
   - Add: `const { employees } = useHRM();` (if needed)

6. **hrm-dashboard.tsx**
   - Add: `import { useHRM } from '@/contexts/HRMContext';`
   - Add: `const { employees } = useHRM();` (for dashboard stats)

## Updating an HRM Page - Step-by-Step

### Example: Updating `hrm-assets.tsx`

**Before:**
```typescript
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function HRMAssets() {
  const [, setLocation] = useLocation();
  const [employees, setEmployees] = useState([]);
  // ... rest of component
}
```

**After:**
```typescript
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useHRM } from '@/contexts/HRMContext';  // ✅ Add this

export default function HRMAssets() {
  const [, setLocation] = useLocation();
  const { employees } = useHRM();  // ✅ Use this instead of state
  // ... rest of component
  // ✅ Remove: const [employees, setEmployees] = useState([]);
}
```

## Key Benefits

1. **Single Source of Truth** - Employee data is fetched once and shared across all HRM modules
2. **Performance** - No duplicate API calls when navigating between HRM pages
3. **Data Consistency** - All pages always see the same employee data
4. **Easy Refetching** - Call `refetchEmployees()` to update data after creating/editing employees
5. **Automatic Normalization** - All employee data is normalized uniformly across the app

## Data Flow

```
App.tsx (HRMRouter)
    ↓
HRMProvider (HRMContext)
    ├→ Fetches employees from backend API on mount
    ├→ Normalizes employee data (first_name + last_name → name)
    └→ Provides to all child HRM pages
        ↓
    Any HRM Page (useHRM hook)
        ├→ hrm-employees.tsx
        ├→ hrm-attendance.tsx
        ├→ hrm-insurance.tsx
        ├→ hrm-payroll.tsx
        ├→ hrm-performance.tsx
        └→ ... and others
```

## Backend Integration

The HRM context uses the following endpoint:
- **Endpoint:** `GET /api/hrm/employees`
- **Returns:** Array of employees with normalized data
- **Includes:** Department and designation names (not just IDs)

## Troubleshooting

### "useHRM must be used within HRMProvider"
- **Cause:** Component is not inside HRMRouter
- **Solution:** Make sure your HRM page is routed through App.tsx HRMRouter

### Employee data is empty
- **Cause:** Backend is not running or returning empty array
- **Solution:** Ensure backend is running on port 5000 and has employee records in database

### "Cannot read property 'name' of undefined"
- **Cause:** Accessing employee field before data loads
- **Solution:** Check `isLoadingEmployees` before rendering employee data
```typescript
if (isLoadingEmployees) return <LoadingSpinner />;
```

## Custom Hook for Individual Pages

If a specific page needs its own employee management (like hrm-employees.tsx does), you can still use the HRM context as a fallback:

```typescript
const HRMEmployees = () => {
  const { employees: contextEmployees } = useHRM();  // Fallback
  const [employees, setEmployees] = useState([]);     // Local state
  
  // Use local state if populated, otherwise use context
  const displayEmployees = employees.length > 0 ? employees : contextEmployees;
};
```

## Next Steps

1. Update remaining HRM pages to use the HRM context
2. Ensure all employee-dependent features work across modules
3. Test data persistence when navigating between sections
4. Verify employee creation updates reflect in all modules
