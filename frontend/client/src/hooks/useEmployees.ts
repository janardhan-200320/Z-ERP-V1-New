import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

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

interface UseEmployeesReturn {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and normalize employee data from the backend
 * Provides normalized employee data that can be used across all HRM modules
 */
export const useEmployees = (): UseEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
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
      setError(errorMsg);
      console.error('Error fetching employees:', err);
      toast({
        title: 'Error',
        description: 'Failed to load employees. Check if backend is running.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    isLoading,
    error,
    refetch: fetchEmployees
  };
};
