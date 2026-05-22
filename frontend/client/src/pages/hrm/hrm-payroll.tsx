import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useHRM } from '@/contexts/HRMContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type PayrollRecord = {
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
  payment_method?: string | null;
  status: string;
  created_at?: string;
};

const toNumber = (value: string | number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getMonthValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default function HRMPayroll() {
  const { employees } = useHRM();
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [month, setMonth] = useState(getMonthValue());
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [additionalAllowance, setAdditionalAllowance] = useState('');
  const [pfAmount, setPfAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [status, setStatus] = useState('processed');

  const monthDate = `${month}-01`;
  const selectedYear = month.split('-')[0] || String(new Date().getFullYear());
  const selectedMonth = month.split('-')[1] || '01';
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => String(currentYear - 2 + index));
  }, []);

  const employeeMap = useMemo(() => {
    return new Map(employees.map((emp) => [emp.id, emp]));
  }, [employees]);

  const totalAllowances = toNumber(allowances) + toNumber(additionalAllowance);
  const grossSalary = toNumber(baseSalary) + totalAllowances;
  const totalDeductions =
    toNumber(pfAmount) + toNumber(taxAmount) + toNumber(otherDeductions);
  const netSalary = grossSalary - totalDeductions;

  const fetchPayroll = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/hrm/payroll-records?month=${monthDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payroll records');
      }
      const data = await response.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Unable to load payroll records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month]);

  const resetForm = () => {
    setEmployeeId('');
    setBaseSalary('');
    setAllowances('');
    setAdditionalAllowance('');
    setPfAmount('');
    setTaxAmount('');
    setOtherDeductions('');
    setPaymentMethod('bank_transfer');
    setStatus('processed');
  };

  const handleSubmit = async () => {
    if (!employeeId) {
      toast({
        title: 'Select an employee',
        description: 'Please choose an employee before saving payroll.',
        variant: 'destructive'
      });
      return;
    }

    if (grossSalary <= 0) {
      toast({
        title: 'Enter salary details',
        description: 'Base salary or allowances must be greater than 0.',
        variant: 'destructive'
      });
      return;
    }

    const payload = {
      employee_id: employeeId,
      month: monthDate,
      base_salary: toNumber(baseSalary),
      allowances: totalAllowances,
      pf_amount: toNumber(pfAmount),
      tax_amount: toNumber(taxAmount),
      other_deductions: toNumber(otherDeductions),
      gross_salary: grossSalary,
      deductions: totalDeductions,
      net_salary: netSalary,
      payment_method: paymentMethod,
      status
    };

    try {
      const response = await fetch(`${apiUrl}/hrm/payroll-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save payroll');
      }

      await fetchPayroll();
      toast({
        title: 'Payroll saved',
        description: 'Payroll details saved successfully.'
      });
      resetForm();
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err.message || 'Unable to save payroll details.',
        variant: 'destructive'
      });
    }
  };

  const summary = useMemo(() => {
    const totalGross = records.reduce((sum, record) => sum + Number(record.gross_salary || 0), 0);
    const totalDeductions = records.reduce((sum, record) => sum + Number(record.deductions || 0), 0);
    const totalNet = records.reduce((sum, record) => sum + Number(record.net_salary || 0), 0);
    return { totalGross, totalDeductions, totalNet };
  }, [records]);

  const updatePayrollStatus = async (recordId: string, nextStatus: string) => {
    try {
      const response = await fetch(`${apiUrl}/hrm/payroll-records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update payroll status');
      }

      await fetchPayroll();
      toast({
        title: 'Payroll updated',
        description: `Status set to ${nextStatus}.`
      });
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.message || 'Unable to update payroll status.',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="text-sm text-slate-600">Simple payroll entry and review.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Payroll Entry</CardTitle>
            <CardDescription>Pick an employee and enter salary and deductions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Month</Label>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={employeeId} onValueChange={setEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Base Salary</Label>
                <Input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Allowance</Label>
                <Input type="number" value={allowances} onChange={(e) => setAllowances(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Custom Allowance</Label>
                <Input
                  type="number"
                  value={additionalAllowance}
                  onChange={(e) => setAdditionalAllowance(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>PF</Label>
                <Input type="number" value={pfAmount} onChange={(e) => setPfAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input type="number" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Other Deductions</Label>
                <Input type="number" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Gross Salary</p>
                <p className="text-lg font-semibold">₹{grossSalary.toLocaleString()}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Total Deductions</p>
                <p className="text-lg font-semibold">₹{totalDeductions.toLocaleString()}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Net Salary</p>
                <p className="text-lg font-semibold">₹{netSalary.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit}>Save Payroll</Button>
              <Button variant="outline" onClick={resetForm}>Clear</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Month Wise Payroll</CardTitle>
            <CardDescription>Select year and month to view payroll details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={selectedYear}
                  onValueChange={(value) => setMonth(`${value}-${selectedMonth}`)}
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Select
                  value={selectedMonth}
                  onValueChange={(value) => setMonth(`${selectedYear}-${value}`)}
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((label, index) => {
                      const value = String(index + 1).padStart(2, '0');
                      return (
                        <SelectItem key={label} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
            <CardDescription>{monthDate} records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(isLoading || error) && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                {isLoading && <span className="text-slate-600">Loading payroll records...</span>}
                {error && <span className="text-rose-600">{error}</span>}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Total Gross</p>
                <p className="text-lg font-semibold">₹{summary.totalGross.toLocaleString()}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Total Deductions</p>
                <p className="text-lg font-semibold">₹{summary.totalDeductions.toLocaleString()}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Total Net</p>
                <p className="text-lg font-semibold">₹{summary.totalNet.toLocaleString()}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-slate-500 py-6">
                      No payroll records for this month.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => {
                    const employee = employeeMap.get(record.employee_id);
                    const name = employee?.name || employee?.full_name || record.employee_id;
                    const statusOptions = ['processed', 'pending', 'paid'];
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{name}</TableCell>
                        <TableCell className="text-right">₹{Number(record.gross_salary || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{Number(record.deductions || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{Number(record.net_salary || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Select
                            value={record.status}
                            onValueChange={(value) => {
                              if (value !== record.status) {
                                updatePayrollStatus(record.id, value);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-36 capitalize">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option} value={option} className="capitalize">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}