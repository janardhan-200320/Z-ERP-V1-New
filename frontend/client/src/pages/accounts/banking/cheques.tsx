import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  AlertCircle,
  Bell,
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

type Cheque = {
  id: string;
  chequeNumber: string;
  date: string;
  payee: string;
  amount: number;
  bankAccount: string;
  type: 'issued' | 'received';
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  clearanceDate?: string;
  reference?: string;
  notes?: string;
};

export default function ChequeManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  const [cheques, setCheques] = useState<Cheque[]>([
    {
      id: 'CHQ-001',
      chequeNumber: '000001',
      date: '2026-01-15',
      payee: 'TechSupply Inc.',
      amount: 25000,
      bankAccount: 'Chase Bank - ****5678',
      type: 'issued',
      status: 'cleared',
      clearanceDate: '2026-01-17',
      reference: 'PO-458',
      notes: 'Payment for office supplies'
    },
    {
      id: 'CHQ-002',
      chequeNumber: '000002',
      date: '2026-01-14',
      payee: 'Acme Corporation',
      amount: 45000,
      bankAccount: 'Chase Bank - ****5678',
      type: 'received',
      status: 'cleared',
      clearanceDate: '2026-01-16',
      reference: 'INV-2345'
    },
    {
      id: 'CHQ-003',
      chequeNumber: '000003',
      date: '2026-01-12',
      payee: 'Office Rentals LLC',
      amount: 15000,
      bankAccount: 'Bank of America - ****1234',
      type: 'issued',
      status: 'pending',
      reference: 'RENT-JAN-2026'
    },
    {
      id: 'CHQ-004',
      chequeNumber: '000004',
      date: '2026-01-10',
      payee: 'Global Tech Solutions',
      amount: 8500,
      bankAccount: 'Chase Bank - ****5678',
      type: 'received',
      status: 'bounced',
      reference: 'INV-2340',
      notes: 'Insufficient funds - contact customer'
    },
    {
      id: 'CHQ-005',
      chequeNumber: '000005',
      date: '2026-01-08',
      payee: 'Marketing Agency',
      amount: 12000,
      bankAccount: 'Wells Fargo - ****9012',
      type: 'issued',
      status: 'cancelled',
      notes: 'Payment method changed to wire transfer'
    },
  ]);

  const getStatusConfig = (status: Cheque['status']) => {
    const config = {
      pending: { 
        label: 'Pending', 
        icon: Clock, 
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300' 
      },
      cleared: { 
        label: 'Cleared', 
        icon: CheckCircle, 
        className: 'bg-green-100 text-green-700 border-green-300' 
      },
      bounced: { 
        label: 'Bounced', 
        icon: XCircle, 
        className: 'bg-red-100 text-red-700 border-red-300' 
      },
      cancelled: { 
        label: 'Cancelled', 
        icon: AlertCircle, 
        className: 'bg-slate-100 text-slate-700 border-slate-300' 
      },
    };
    return config[status];
  };

  const filteredCheques = cheques.filter(cheque => {
    const matchesSearch = 
      cheque.chequeNumber.includes(searchQuery) ||
      cheque.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cheque.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || cheque.status === filterStatus;
    const matchesType = filterType === 'all' || cheque.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportExcel = () => {
    const data = filteredCheques.map(c => ({
      'ID': c.id,
      'Number': c.chequeNumber,
      'Date': c.date,
      'Payee': c.payee,
      'Amount': c.amount,
      'Bank Account': c.bankAccount,
      'Type': c.type,
      'Status': c.status,
      'Clearance Date': c.clearanceDate || '',
      'Reference': c.reference || ''
    }));
    exportToExcel(data, 'cheques_report');
  };

  const handleExportPDF = () => {
    const headers = ['Number', 'Date', 'Payee', 'Amount', 'Type', 'Status'];
    const data = filteredCheques.map(c => [
      c.chequeNumber,
      c.date,
      c.payee,
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c.amount),
      c.type,
      c.status
    ]);
    exportToPDF('Cheque Management Report', headers, data, 'cheques_report');
  };

  const stats = {
    total: cheques.length,
    pending: cheques.filter(c => c.status === 'pending').length,
    cleared: cheques.filter(c => c.status === 'cleared').length,
    bounced: cheques.filter(c => c.status === 'bounced').length,
    totalIssued: cheques.filter(c => c.type === 'issued').reduce((sum, c) => sum + c.amount, 0),
    totalReceived: cheques.filter(c => c.type === 'received').reduce((sum, c) => sum + c.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Cheque Management
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Track issued and received cheques
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Cheque Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Cheque Entry</DialogTitle>
              <DialogDescription>
                Record a new cheque transaction
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="issued">Issued (Payment)</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chequeNumber">Cheque Number *</Label>
                  <Input id="chequeNumber" placeholder="e.g., 000001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Cheque Date *</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payee">Payee Name *</Label>
                <Input id="payee" placeholder="Enter payee name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACC-001">Chase Bank - ****5678</SelectItem>
                    <SelectItem value="ACC-002">Bank of America - ****1234</SelectItem>
                    <SelectItem value="ACC-003">Wells Fargo - ****9012</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input id="reference" placeholder="Invoice/PO number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add any additional notes" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Add Cheque
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Cheques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Cleared</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.cleared}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Bounced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.bounced}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-700">{formatCurrency(stats.totalIssued)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-700">{formatCurrency(stats.totalReceived)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Cheque Transactions</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search cheques..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cheque #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payee</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheques.map((cheque) => {
                const statusConfig = getStatusConfig(cheque.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={cheque.id}>
                    <TableCell className="font-mono font-semibold">
                      {cheque.chequeNumber}
                    </TableCell>
                    <TableCell>{cheque.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        cheque.type === 'issued' 
                          ? 'border-red-300 bg-red-50 text-red-700' 
                          : 'border-green-300 bg-green-50 text-green-700'
                      }>
                        {cheque.type === 'issued' ? 'Issued' : 'Received'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{cheque.payee}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {cheque.bankAccount}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(cheque.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {cheque.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="h-8">
                              Mark Cleared
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8">
                              <Bell className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {cheque.status === 'bounced' && (
                          <Button size="sm" variant="outline" className="h-8">
                            Follow Up
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
