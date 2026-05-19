import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  FileSpreadsheet,
  FileText as FilePdf
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'matched' | 'unmatched' | 'discrepancy';
  bankRef?: string;
  erpRef?: string;
};

export default function BankReconciliation() {
  const [selectedAccount, setSelectedAccount] = useState('ACC-001');
  const [reconciliationPeriod, setReconciliationPeriod] = useState('2026-01');

  // Mock data
  const bankTransactions: Transaction[] = [
    { id: 'B1', date: '2026-01-15', description: 'Payment from Acme Corp', amount: 45000, type: 'credit', status: 'matched', bankRef: 'BANK-001', erpRef: 'ERP-001' },
    { id: 'B2', date: '2026-01-14', description: 'Vendor Payment TechSupply', amount: 12500, type: 'debit', status: 'matched', bankRef: 'BANK-002', erpRef: 'ERP-002' },
    { id: 'B3', date: '2026-01-13', description: 'Check Deposit #5678', amount: 8500, type: 'credit', status: 'unmatched', bankRef: 'BANK-003' },
    { id: 'B4', date: '2026-01-12', description: 'Wire Transfer Out', amount: 25000, type: 'debit', status: 'discrepancy', bankRef: 'BANK-004', erpRef: 'ERP-004' },
  ];

  const erpTransactions: Transaction[] = [
    { id: 'E1', date: '2026-01-15', description: 'Payment from Acme Corp', amount: 45000, type: 'credit', status: 'matched', erpRef: 'ERP-001', bankRef: 'BANK-001' },
    { id: 'E2', date: '2026-01-14', description: 'Vendor Payment TechSupply', amount: 12500, type: 'debit', status: 'matched', erpRef: 'ERP-002', bankRef: 'BANK-002' },
    { id: 'E3', date: '2026-01-12', description: 'Supplier Payment', amount: 24000, type: 'debit', status: 'discrepancy', erpRef: 'ERP-004', bankRef: 'BANK-004' },
    { id: 'E4', date: '2026-01-11', description: 'Customer Receipt', amount: 15000, type: 'credit', status: 'unmatched', erpRef: 'ERP-005' },
  ];

  const getStatusBadge = (status: Transaction['status']) => {
    const config = {
      matched: { label: 'Matched', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
      unmatched: { label: 'Unmatched', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-700' },
      discrepancy: { label: 'Discrepancy', icon: XCircle, className: 'bg-red-100 text-red-700' },
    };

    const { label, icon: Icon, className } = config[status];

    return (
      <Badge variant="outline" className={cn('gap-1', className)}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const matchedCount = bankTransactions.filter(t => t.status === 'matched').length;
  const unmatchedCount = bankTransactions.filter(t => t.status === 'unmatched').length;
  const discrepancyCount = bankTransactions.filter(t => t.status === 'discrepancy').length;

  const handleExportExcel = () => {
    const data = bankTransactions.map(t => ({
      'ID': t.id,
      'Date': t.date,
      'Description': t.description,
      'Amount': t.amount,
      'Type': t.type,
      'Status': t.status,
      'Bank Ref': t.bankRef || '',
      'ERP Ref': t.erpRef || ''
    }));
    exportToExcel(data, 'bank_reconciliation');
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Date', 'Description', 'Amount', 'Status'];
    const data = bankTransactions.map(t => [
      t.id,
      t.date,
      t.description,
      formatCurrency(t.amount),
      t.status
    ]);
    exportToPDF('Bank Reconciliation Report', headers, data, 'bank_reconciliation');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-blue-600" />
            Bank Reconciliation
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Match system transactions with bank statements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import Statement
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel} className="gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
                <FilePdf className="h-4 w-4 text-red-600" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Auto Match
          </Button>
        </div>
      </div>

      {/* Reconciliation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reconciliation Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACC-001">Chase Bank - ****5678</SelectItem>
                  <SelectItem value="ACC-002">Bank of America - ****1234</SelectItem>
                  <SelectItem value="ACC-003">Wells Fargo - ****9012</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reconciliation Period</Label>
              <Input 
                type="month" 
                value={reconciliationPeriod}
                onChange={(e) => setReconciliationPeriod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Statement Balance</Label>
              <Input type="number" placeholder="Enter closing balance" />
            </div>
            <div className="space-y-2">
              <Label>Upload Statement</Label>
              <Button variant="outline" className="w-full gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Choose File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Matched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{matchedCount}</div>
            <p className="text-xs text-slate-600 mt-1">Transactions matched</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Unmatched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{unmatchedCount}</div>
            <p className="text-xs text-slate-600 mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Discrepancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{discrepancyCount}</div>
            <p className="text-xs text-slate-600 mt-1">Amount mismatches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Match Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {Math.round((matchedCount / bankTransactions.length) * 100)}%
            </div>
            <p className="text-xs text-slate-600 mt-1">Reconciliation progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Matching Interface */}
      <Tabs defaultValue="side-by-side" className="space-y-4">
        <TabsList>
          <TabsTrigger value="side-by-side">Side-by-Side View</TabsTrigger>
          <TabsTrigger value="bank">Bank Transactions</TabsTrigger>
          <TabsTrigger value="erp">ERP Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Bank Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bank Statement</CardTitle>
                <CardDescription>Transactions from bank statement</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankTransactions.map((txn) => (
                      <TableRow key={txn.id} className={cn(
                        txn.status === 'unmatched' && 'bg-yellow-50',
                        txn.status === 'discrepancy' && 'bg-red-50'
                      )}>
                        <TableCell className="text-sm">{txn.date}</TableCell>
                        <TableCell className="text-sm">{txn.description}</TableCell>
                        <TableCell className="text-right">
                          <span className={txn.type === 'credit' ? 'text-green-700' : 'text-red-700'}>
                            {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(txn.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* ERP Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ERP System</CardTitle>
                <CardDescription>Transactions from ERP records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {erpTransactions.map((txn) => (
                      <TableRow key={txn.id} className={cn(
                        txn.status === 'unmatched' && 'bg-yellow-50',
                        txn.status === 'discrepancy' && 'bg-red-50'
                      )}>
                        <TableCell className="text-sm">{txn.date}</TableCell>
                        <TableCell className="text-sm">{txn.description}</TableCell>
                        <TableCell className="text-right">
                          <span className={txn.type === 'credit' ? 'text-green-700' : 'text-red-700'}>
                            {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(txn.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Transactions</CardTitle>
              <CardDescription>All transactions from imported bank statement</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">{txn.bankRef}</TableCell>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell>{txn.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {txn.type === 'credit' ? 'CR' : 'DR'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(txn.status)}</TableCell>
                      <TableCell>
                        {txn.status === 'unmatched' && (
                          <Button size="sm" variant="outline">
                            Match
                          </Button>
                        )}
                        {txn.status === 'matched' && (
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        )}
                        {txn.status === 'discrepancy' && (
                          <Button size="sm" variant="destructive">
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ERP Transactions</CardTitle>
              <CardDescription>All transactions recorded in ERP system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {erpTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">{txn.erpRef}</TableCell>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell>{txn.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {txn.type === 'credit' ? 'CR' : 'DR'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(txn.status)}</TableCell>
                      <TableCell>
                        {txn.status === 'unmatched' && (
                          <Button size="sm" variant="outline">
                            Match
                          </Button>
                        )}
                        {txn.status === 'matched' && (
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        )}
                        {txn.status === 'discrepancy' && (
                          <Button size="sm" variant="destructive">
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
