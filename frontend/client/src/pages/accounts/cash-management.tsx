import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Download } from 'lucide-react';

export default function CashManagementModule() {
  const cashbook = [
    { date: '2026-01-15', voucher: 'Cash', reference: 'CV-001', receipt: '$5,000', payment: '-', balance: '$25,000', approvedBy: 'John Doe' },
    { date: '2026-01-14', voucher: 'Cash', reference: 'CV-002', receipt: '-', payment: '$2,500', balance: '$20,000', approvedBy: 'Jane Smith' },
    { date: '2026-01-13', voucher: 'Petty Cash', reference: 'PC-001', receipt: '-', payment: '$500', balance: '$22,500', approvedBy: 'John Doe' }
  ];

  const denominations = [
    { note: '$100', quantity: 50, total: '$5,000' },
    { note: '$50', quantity: 100, total: '$5,000' },
    { note: '$20', quantity: 250, total: '$5,000' },
    { note: '$10', quantity: 500, total: '$5,000' },
    { note: '$5', quantity: 1000, total: '$5,000' }
  ];

  return (
    <Tabs defaultValue="cashbook" className="space-y-6">
      <TabsList>
        <TabsTrigger value="cashbook">Cash Book</TabsTrigger>
        <TabsTrigger value="petty">Petty Cash</TabsTrigger>
        <TabsTrigger value="denomination">Denomination</TabsTrigger>
      </TabsList>

      <TabsContent value="cashbook">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cash Book Entries</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Voucher Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Approved By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashbook.map((entry, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50">
                    <TableCell className="text-sm">{entry.date}</TableCell>
                    <TableCell className="text-sm">{entry.voucher}</TableCell>
                    <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                    <TableCell className="font-semibold text-green-700">{entry.receipt}</TableCell>
                    <TableCell className="font-semibold text-red-700">{entry.payment}</TableCell>
                    <TableCell className="font-bold text-blue-700">{entry.balance}</TableCell>
                    <TableCell className="text-sm">{entry.approvedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="denomination">
        <Card>
          <CardHeader>
            <CardTitle>Cash Denomination</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Denomination</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {denominations.map((denom, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50">
                    <TableCell className="font-semibold">{denom.note}</TableCell>
                    <TableCell>
                      <Input type="number" defaultValue={denom.quantity} className="w-32" />
                    </TableCell>
                    <TableCell className="font-bold text-blue-700">{denom.total}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-100">
                  <TableCell className="font-bold">Total Cash</TableCell>
                  <TableCell className="font-bold">1,900</TableCell>
                  <TableCell className="font-bold text-xl text-blue-700">$25,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="petty">
        <Card>
          <CardHeader>
            <CardTitle>Petty Cash Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Petty cash tracking view coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
