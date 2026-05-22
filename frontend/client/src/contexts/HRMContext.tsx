import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  department: string;
  designation: string;
  status: string;
  gender?: string;
  address?: string;
  date_of_joining?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface HRMContextType {
  employees: Employee[];
  isLoadingEmployees: boolean;
  employeesError: string | null;
  refetchEmployees: () => Promise<void>;
}

const HRMContext = createContext<HRMContextType | undefined>(undefined);

/**
 * Provider component for HRM data (employees, etc.)
 * Wrap your HRM pages with this to access employee data across all sections
 */
export const HRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      setEmployeesError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/hrm/employees`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      const employeesArray = Array.isArray(data) ? data : (data.data || []);

      // Normalize employee data structure
      const normalizedEmployees = employeesArray.map((emp: any) => ({
        ...emp,
        name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        designation: emp.designation || 'N/A',
        department: emp.department || 'N/A',
        email: emp.email || '',
        phone: emp.phone || '',
        status: emp.status || 'active'
      }));

      setEmployees(normalizedEmployees);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load employees';
      setEmployeesError(errorMsg);
      console.error('Error fetching employees:', err);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <HRMContext.Provider
      value={{
        employees,
        isLoadingEmployees,
        employeesError,
        refetchEmployees: fetchEmployees
      }}
    >
      {children}
    </HRMContext.Provider>
  );
};

/**
 * Hook to use HRM context data (employees, etc.)
 * Use this in any HRM page component to access employee data
 */
export const useHRM = (): HRMContextType => {
  const context = useContext(HRMContext);
  if (context === undefined) {
    throw new Error('useHRM must be used within HRMProvider');
  }
  return context;
};
