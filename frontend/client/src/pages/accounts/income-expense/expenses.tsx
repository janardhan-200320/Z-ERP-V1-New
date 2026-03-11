import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';

export default function Expenses() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingDown className="h-6 w-6 text-red-600" />
          Expenses
        </h2>
        <p className="text-sm text-slate-600 mt-1">Track operational expenses</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Expenses Module - Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">This module will track all expense transactions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
