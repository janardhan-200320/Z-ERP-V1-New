import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

export default function ExpenseAllocation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PieChart className="h-6 w-6 text-purple-600" />
          Expense Allocation
        </h2>
        <p className="text-sm text-slate-600 mt-1">Assign expenses to projects or departments</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Expense Allocation - Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Allocate expenses to specific projects and departments.</p>
        </CardContent>
      </Card>
    </div>
  );
}
