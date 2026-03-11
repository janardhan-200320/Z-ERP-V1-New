import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Repeat } from 'lucide-react';

export default function RecurringExpenses() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Repeat className="h-6 w-6 text-blue-600" />
          Recurring Expenses
        </h2>
        <p className="text-sm text-slate-600 mt-1">Automate monthly payments</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recurring Expenses - Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Manage recurring expense transactions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
