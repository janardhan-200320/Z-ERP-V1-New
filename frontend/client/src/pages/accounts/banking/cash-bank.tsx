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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Search,
  Download,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  FileText,
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

type CashBankEntry = {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'petty-cash';
  category: string;
  description: string;
  amount: number;
  bankAccount?: string;
  reference?: string;
  paymentMethod: string;
  createdBy: string;
  notes?: string;
};

export default function CashBankEntries() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'deposit' | 'withdrawal' | 'petty-cash'>('deposit');

  // Mock data
  const [entries, setEntries] = useState<CashBankEntry[]>([
    {
      id: 'CBE-001',
      date: '2026-01-15',
      type: 'deposit',
      category: 'Sales Revenue',
      description: 'Cash sales deposit',
      amount: 15000,
      bankAccount: 'Chase Bank - ****5678',
      reference: 'DEP-001',
      paymentMethod: 'Cash',
      createdBy: 'John Doe',
    },
    {
      id: 'CBE-002',
      date: '2026-01-14',
      type: 'withdrawal',
      category: 'Office Supplies',
      description: 'Purchase of stationery',
      amount: 2500,
      bankAccount: 'Chase Bank - ****5678',
      reference: 'WITH-001',
      paymentMethod: 'ATM',
      createdBy: 'Jane Smith',
      notes: 'Emergency purchase'
    },
    {
      id: 'CBE-003',
      date: '2026-01-13',
      type: 'petty-cash',
      category: 'Transportation',
      description: 'Taxi fare for client meeting',
      amount: 150,
      reference: 'PC-001',
      paymentMethod: 'Petty Cash',
      createdBy: 'Mike Johnson',
    },
    {
      id: 'CBE-004',
      date: '2026-01-12',
      type: 'deposit',
      category: 'Customer Payment',
      description: 'Invoice payment - Acme Corp',
      amount: 45000,
      bankAccount: 'Bank of America - ****1234',
      reference: 'DEP-002',
      paymentMethod: 'Check',
      createdBy: 'Sarah Williams',
    },
    {
      id: 'CBE-005',
      date: '2026-01-11',
      type: 'petty-cash',
      category: 'Refreshments',
      description: 'Coffee and snacks for meeting',
      amount: 85,
      reference: 'PC-002',
      paymentMethod: 'Petty Cash',
      createdBy: 'Tom Brown',
    },
  ]);

  const getTypeConfig = (type: CashBankEntry['type']) => {
    const config = {
      deposit: {
        label: 'Deposit',
        icon: ArrowDownCircle,
        className: 'bg-green-100 text-green-700 border-green-300',
      },
      withdrawal: {
        label: 'Withdrawal',
        icon: ArrowUpCircle,
        className: 'bg-red-100 text-red-700 border-red-300',
      },
      'petty-cash': {
        label: 'Petty Cash',
        icon: Wallet,
        className: 'bg-blue-100 text-blue-700 border-blue-300',
      },
    };
    return config[type];
  };

  const filteredEntries = entries.filter(entry =>
    entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const data = filteredEntries.map(e => ({
      'ID': e.id,
      'Date': e.date,
      'Type': e.type,
      'Category': e.category,
      'Description': e.description,
      'Amount': e.amount,
      'Bank Account': e.bankAccount || '',
      'Reference': e.reference || '',
      'Payment Method': e.paymentMethod,
      'Created By': e.createdBy
    }));
    exportToExcel(data, 'cash_bank_entries');
  };

  const handleExportPDF = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const data = filteredEntries.map(e => [
      e.date,
      e.type,
      e.category,
      e.description,
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(e.amount)
    ]);
    exportToPDF('Cash & Bank Entries', headers, data, 'cash_bank_entries');
  };

  const depositEntries = entries.filter(e => e.type === 'deposit');
  const withdrawalEntries = entries.filter(e => e.type === 'withdrawal');
  const pettyCashEntries = entries.filter(e => e.type === 'petty-cash');

  const stats = {
    totalDeposits: depositEntries.reduce((sum, e) => sum + e.amount, 0),
    totalWithdrawals: withdrawalEntries.reduce((sum, e) => sum + e.amount, 0),
    totalPettyCash: pettyCashEntries.reduce((sum, e) => sum + e.amount, 0),
    netCashFlow: depositEntries.reduce((sum, e) => sum + e.amount, 0) - 
                 (withdrawalEntries.reduce((sum, e) => sum + e.amount, 0) + 
                  pettyCashEntries.reduce((sum, e) => sum + e.amount, 0)),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            Cash & Bank Entries
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Record cash and bank movements (Deposit, Withdrawal, Petty Cash)
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Cash/Bank Entry</DialogTitle>
              <DialogDescription>
                Record a new cash or bank transaction
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Transaction Type *</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={selectedType === 'deposit' ? 'default' : 'outline'}
                    className="gap-2"
                    onClick={() => setSelectedType('deposit')}
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                    Deposit
                  </Button>
                  <Button
                    type="button"
                    variant={selectedType === 'withdrawal' ? 'default' : 'outline'}
                    className="gap-2"
                    onClick={() => setSelectedType('withdrawal')}
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                    Withdrawal
                  </Button>
                  <Button
                    type="button"
                    variant={selectedType === 'petty-cash' ? 'default' : 'outline'}
                    className="gap-2"
                    onClick={() => setSelectedType('petty-cash')}
                  >
                    <Wallet className="h-4 w-4" />
                    Petty Cash
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>
              </div>

              {selectedType !== 'petty-cash' && (
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
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedType === 'deposit' ? (
                        <>
                          <SelectItem value="sales">Sales Revenue</SelectItem>
                          <SelectItem value="customer">Customer Payment</SelectItem>
                          <SelectItem value="refund">Refund Received</SelectItem>
                          <SelectItem value="other">Other Income</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="supplies">Office Supplies</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="transport">Transportation</SelectItem>
                          <SelectItem value="refreshments">Refreshments</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="other">Other Expenses</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="atm">ATM</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                      <SelectItem value="petty-cash">Petty Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input id="description" placeholder="Enter description" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input id="reference" placeholder="Receipt/Transaction reference" />
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
                Add Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(stats.totalDeposits)}
            </div>
            <p className="text-xs text-slate-600 mt-1">{depositEntries.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(stats.totalWithdrawals)}
            </div>
            <p className="text-xs text-slate-600 mt-1">{withdrawalEntries.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Petty Cash Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(stats.totalPettyCash)}
            </div>
            <p className="text-xs text-slate-600 mt-1">{pettyCashEntries.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              stats.netCashFlow >= 0 ? "text-emerald-700" : "text-red-700"
            )}>
              {formatCurrency(stats.netCashFlow)}
            </div>
            <p className="text-xs text-slate-600 mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Entries Table with Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Entries ({entries.length})</TabsTrigger>
          <TabsTrigger value="deposits">Deposits ({depositEntries.length})</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals ({withdrawalEntries.length})</TabsTrigger>
          <TabsTrigger value="petty-cash">Petty Cash ({pettyCashEntries.length})</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cash & Bank Transactions</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search entries..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
            <TabsContent value="all" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const typeConfig = getTypeConfig(entry.type);
                    const TypeIcon = typeConfig.icon;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeConfig.className}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {entry.bankAccount || '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span className={
                            entry.type === 'deposit' ? 'text-green-700' : 'text-red-700'
                          }>
                            {entry.type === 'deposit' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {entry.reference || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="deposits" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depositEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-sm text-slate-600">{entry.bankAccount}</TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        +{formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{entry.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="withdrawals" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-sm text-slate-600">{entry.bankAccount}</TableCell>
                      <TableCell className="text-right font-semibold text-red-700">
                        -{formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{entry.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="petty-cash" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pettyCashEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right font-semibold text-blue-700">
                        -{formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell>{entry.createdBy}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
