import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Download, CreditCard, CheckCircle, XCircle } from 'lucide-react';

export default function ChequeManagementModule() {
  const cheques = [
    { id: 'CHQ-001', chequeNumber: '100001', bank: 'Chase Bank', party: 'Acme Corp', amount: '$45,000', chequeDate: '2026-01-20', status: 'issued', type: 'outgoing' },
    { id: 'CHQ-002', chequeNumber: '200015', bank: 'Bank of America', party: 'TechStart Inc', amount: '$25,000', chequeDate: '2026-01-18', status: 'deposited', type: 'incoming' },
    { id: 'CHQ-003', chequeNumber: '100002', bank: 'Chase Bank', party: 'Office Supplies', amount: '$5,000', chequeDate: '2026-02-15', status: 'pdc', type: 'outgoing' },
    { id: 'CHQ-004', chequeNumber: '300012', bank: 'Wells Fargo', party: 'GlobalTech', amount: '$85,000', chequeDate: '2026-01-15', status: 'cleared', type: 'incoming' },
    { id: 'CHQ-005', chequeNumber: '100003', bank: 'Chase Bank', party: 'Vendor XYZ', amount: '$12,000', chequeDate: '2026-01-10', status: 'bounced', type: 'outgoing' }
  ];

  const statusConfig: Record<string, { label: string; class: string }> = {
    issued: { label: 'Issued', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    deposited: { label: 'Deposited', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    cleared: { label: 'Cleared', class: 'bg-green-100 text-green-700 border-green-200' },
    bounced: { label: 'Bounced', class: 'bg-red-100 text-red-700 border-red-200' },
    pdc: { label: 'PDC', class: 'bg-purple-100 text-purple-700 border-purple-200' }
  };

  return (
    <Tabs defaultValue="outgoing" className="space-y-6">
      <TabsList>
        <TabsTrigger value="outgoing">Outgoing Cheques</TabsTrigger>
        <TabsTrigger value="incoming">Incoming Cheques</TabsTrigger>
        <TabsTrigger value="pdc">Post-Dated Cheques</TabsTrigger>
      </TabsList>

      <TabsContent value="outgoing" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Outgoing Cheques</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search cheques..." className="pl-10 w-48" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Issue Cheque
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cheque Number</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cheque Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cheques.filter(c => c.type === 'outgoing').map((cheque) => (
                  <TableRow key={cheque.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono font-semibold">{cheque.chequeNumber}</TableCell>
                    <TableCell className="text-sm">{cheque.bank}</TableCell>
                    <TableCell className="font-medium">{cheque.party}</TableCell>
                    <TableCell className="font-semibold text-red-700">{cheque.amount}</TableCell>
                    <TableCell className="text-sm">{cheque.chequeDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[cheque.status].class}>
                        {statusConfig[cheque.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="text-blue-600">View</Button>
                        {cheque.status === 'issued' && (
                          <Button variant="ghost" size="sm" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Status Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cheque Status Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-blue-700" />
                </div>
                <span className="text-sm font-medium">Issued</span>
              </div>
              <div className="h-0.5 flex-1 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-yellow-700" />
                </div>
                <span className="text-sm font-medium">Deposited</span>
              </div>
              <div className="h-0.5 flex-1 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-700" />
                </div>
                <span className="text-sm font-medium">Cleared</span>
              </div>
              <div className="text-slate-400">/</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-700" />
                </div>
                <span className="text-sm font-medium">Bounced</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="incoming">
        <Card>
          <CardHeader>
            <CardTitle>Incoming Cheques</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {cheques.filter(c => c.type === 'incoming').map((cheque) => (
                  <TableRow key={cheque.id}>
                    <TableCell className="font-mono font-semibold">{cheque.chequeNumber}</TableCell>
                    <TableCell>{cheque.party}</TableCell>
                    <TableCell className="font-semibold text-green-700">{cheque.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[cheque.status].class}>
                        {statusConfig[cheque.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pdc">
        <Card>
          <CardHeader>
            <CardTitle>Post-Dated Cheques</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {cheques.filter(c => c.status === 'pdc').map((cheque) => (
                  <TableRow key={cheque.id}>
                    <TableCell className="font-mono font-semibold">{cheque.chequeNumber}</TableCell>
                    <TableCell>{cheque.party}</TableCell>
                    <TableCell className="font-semibold">{cheque.amount}</TableCell>
                    <TableCell className="text-sm">{cheque.chequeDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[cheque.status].class}>
                        {statusConfig[cheque.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
