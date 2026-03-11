import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar, Repeat } from 'lucide-react';

export default function RecurringTransactionsModule() {
  const recurring = [
    { id: '1', name: 'Monthly Rent Payment', amount: '$15,000', frequency: 'Monthly', nextRun: '2026-02-01', type: 'expense', active: true },
    { id: '2', name: 'SaaS Subscription Income', amount: '$5,000', frequency: 'Monthly', nextRun: '2026-02-01', type: 'income', active: true },
    { id: '3', name: 'Quarterly Tax Payment', amount: '$45,000', frequency: 'Quarterly', nextRun: '2026-04-01', type: 'expense', active: true },
    { id: '4', name: 'Annual License Fee', amount: '$12,000', frequency: 'Yearly', nextRun: '2027-01-01', type: 'expense', active: false }
  ];

  const history = [
    { date: '2026-01-01', name: 'Monthly Rent Payment', status: 'success', reference: 'REC-001', amount: '$15,000' },
    { date: '2026-01-01', name: 'SaaS Subscription Income', status: 'success', reference: 'REC-002', amount: '$5,000' },
    { date: '2025-12-01', name: 'Monthly Rent Payment', status: 'success', reference: 'REC-003', amount: '$15,000' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recurring Transactions</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Recurring
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recurring.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">{item.name}</CardTitle>
                </div>
                <Badge variant="outline" className={item.type === 'income' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                  {item.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Amount</p>
                  <p className={`text-xl font-bold ${item.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                    {item.amount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Frequency</p>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.frequency}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600">Next Run Date</p>
                <p className="text-sm font-semibold">{item.nextRun}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium">Active</span>
                <Switch checked={item.active} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, idx) => (
                <TableRow key={idx} className="hover:bg-slate-50">
                  <TableCell className="text-sm">{entry.date}</TableCell>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="font-semibold">{entry.amount}</TableCell>
                  <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      Success
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
