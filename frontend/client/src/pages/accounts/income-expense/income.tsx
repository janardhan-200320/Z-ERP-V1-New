import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Download, TrendingUp, DollarSign, 
  ArrowUpRight, Filter, MoreHorizontal, Eye, 
  Edit, Trash2, Calendar, Landmark, User, 
  Layers, Package, ChevronRight, CheckCircle2,
  Clock, AlertCircle, FileText, ArrowRight,
  TrendingDown, Info, FileSpreadsheet, FileText as FilePdf
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

type IncomeEntry = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  customer?: string;
  project?: string;
  status: 'received' | 'pending' | 'partially_paid' | 'overdue';
  attachments?: number;
  tags?: string[];
};

export default function Income() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [viewedIncome, setViewedIncome] = useState<IncomeEntry | null>(null);

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [incomeForm, setIncomeForm] = useState<Partial<IncomeEntry>>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    paymentMethod: 'Bank Transfer',
    status: 'received',
    customer: '',
    reference: ''
  });

  const [categories, setCategories] = useState([
    "Sales Revenue", "Consulting Income", "Service Revenue", "Product Sales", 
    "Subscription Revenue", "Interest Income", "Affiliate Commission", "Asset Disposal"
  ]);

  const [incomes, setIncomes] = useState<IncomeEntry[]>([
    { id: 'INC-001', date: '2026-01-15', category: 'Sales Revenue', description: 'Product Sales - Q1 Batch 1', amount: 125000, paymentMethod: 'Bank Transfer', reference: 'INV-2026-001', customer: 'Acme Corp', project: 'Project Alpha', status: 'received', attachments: 2, tags: ['q1', 'products'] },
    { id: 'INC-002', date: '2026-01-14', category: 'Consulting Income', description: 'IT Infrastructure Strategy', amount: 45000, paymentMethod: 'Wire', reference: 'INV-2026-002', customer: 'Tech Solutions', project: 'Project Beta', status: 'received', tags: ['consulting'] },
    { id: 'INC-003', date: '2026-01-13', category: 'Service Revenue', description: 'Annual Maintenance Contract', amount: 8500, paymentMethod: 'Check', reference: 'INV-2026-003', customer: 'Global Tech', status: 'pending', attachments: 1 },
    { id: 'INC-004', date: '2026-01-12', category: 'Product Sales', description: 'Enterprise Software Licenses', amount: 32000, paymentMethod: 'Credit Card', reference: 'INV-2026-004', customer: 'StartupCo', status: 'partially_paid', tags: ['subscription'] },
    { id: 'INC-005', date: '2026-01-10', category: 'Sales Revenue', description: 'Bulk Hardware Supply', amount: 89000, paymentMethod: 'Bank Transfer', reference: 'INV-2026-005', customer: 'Metro Systems', status: 'received' },
  ]);

  const handleExportExcel = () => {
    const data = filteredIncomes.map(inc => ({
      ID: inc.id,
      Date: inc.date,
      Category: inc.category,
      Description: inc.description,
      Amount: inc.amount,
      Payer: inc.customer || 'N/A',
      Status: inc.status,
      Method: inc.paymentMethod
    }));
    exportToExcel(data, 'income_records');
    toast({ title: "Export Success", description: "Excel report downloaded." });
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Date', 'Category', 'Amount', 'Customer', 'Status'];
    const data = filteredIncomes.map(inc => [
      inc.id,
      inc.date,
      inc.category,
      inc.amount.toString(),
      inc.customer || '-',
      inc.status
    ]);
    exportToPDF('Revenue Report', headers, data, 'income_report');
    toast({ title: "Export Success", description: "PDF report downloaded." });
  };

  const handleSaveIncome = () => {
    if (!incomeForm.amount || !incomeForm.category || !incomeForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    const newEntry: IncomeEntry = {
      id: incomeForm.id || `INC-00${incomes.length + 1}`,
      date: incomeForm.date || new Date().toISOString().split('T')[0],
      category: incomeForm.category || 'Other',
      description: incomeForm.description || '',
      amount: Number(incomeForm.amount),
      paymentMethod: incomeForm.paymentMethod || 'Bank Transfer',
      status: incomeForm.status as any || 'received',
      customer: incomeForm.customer,
      reference: incomeForm.reference,
      project: incomeForm.project
    };

    if (incomeForm.id) {
      setIncomes(incomes.map(inc => inc.id === incomeForm.id ? newEntry : inc));
      toast({ title: "Income Updated", description: "The records have been updated successfully." });
    } else {
      setIncomes([newEntry, ...incomes]);
      toast({ title: "Income Added", description: "New income entry has been recorded." });
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setIncomeForm({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0,
      paymentMethod: 'Bank Transfer',
      status: 'received',
      customer: '',
      reference: ''
    });
  };

  const handleDelete = (id: string) => {
    setIncomes(incomes.filter(inc => inc.id !== id));
    toast({ title: "Entry Deleted", description: "The income record has been removed.", variant: "destructive" });
  };

  const stats = useMemo(() => {
    const total = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const confirmed = incomes.filter(inc => inc.status === 'received').reduce((sum, inc) => sum + inc.amount, 0);
    const pending = incomes.filter(inc => inc.status === 'pending' || inc.status === 'partially_paid').reduce((sum, inc) => sum + inc.amount, 0);
    return { total, confirmed, pending };
  }, [incomes]);

  const filteredIncomes = incomes.filter(inc => {
    const matchesSearch = inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || inc.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || inc.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-100">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Revenue Stream</h2>
          </div>
          <p className="text-slate-500 font-medium ml-12">Track, categorize and manage your income flows</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-11 border-slate-200 bg-white hover:bg-slate-50 font-bold shrink-0 gap-2 px-5 text-slate-600 shadow-sm"
            onClick={() => setIsCategoryDialogOpen(true)}
          >
            <Layers className="h-4 w-4" />
            Manage Categories
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100 gap-2 font-bold px-8 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-5 w-5" />
                Record Income
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[800px] flex flex-col p-0 overflow-hidden shadow-2xl border-none sm:rounded-2xl bg-white">
              <DialogHeader className="px-6 py-5 bg-white border-b shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-100">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-800">New Revenue Entry</DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs font-medium uppercase tracking-widest">Financial Transaction Logging</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction Date *</Label>
                      <Input 
                        type="date" 
                        value={incomeForm.date} 
                        onChange={e => setIncomeForm({...incomeForm, date: e.target.value})}
                        className="h-11 border-slate-200 focus:ring-green-500/20 focus:border-green-500 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-green-600 uppercase tracking-widest">Gross Amount *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={incomeForm.amount || ''}
                          onChange={e => setIncomeForm({...incomeForm, amount: Number(e.target.value)})}
                          className="h-11 pl-9 border-green-100 bg-green-50/30 text-green-700 font-bold text-lg rounded-xl" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Classification *</Label>
                    <Select value={incomeForm.category} onValueChange={val => setIncomeForm({...incomeForm, category: val})}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200">
                        <SelectValue placeholder="Select income category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat} className="rounded-lg focus:bg-green-50 focus:text-green-700">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction Memo *</Label>
                    <Textarea 
                      placeholder="What is this income for? e.g. Payment for Invoice #001" 
                      value={incomeForm.description}
                      onChange={e => setIncomeForm({...incomeForm, description: e.target.value})}
                      className="min-h-[100px] border-slate-200 rounded-xl resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Payer / Customer</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="Acme Corp" 
                          value={incomeForm.customer}
                          onChange={e => setIncomeForm({...incomeForm, customer: e.target.value})}
                          className="h-11 pl-9 border-slate-200 rounded-xl" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Reference #</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="INV-2026-001" 
                          value={incomeForm.reference}
                          onChange={e => setIncomeForm({...incomeForm, reference: e.target.value})}
                          className="h-11 pl-9 border-slate-200 rounded-xl" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Settlement Method</Label>
                      <Select value={incomeForm.paymentMethod} onValueChange={val => setIncomeForm({...incomeForm, paymentMethod: val})}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200">
                          <SelectValue placeholder="Bank Transfer" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Wire">Wire Transfer</SelectItem>
                          <SelectItem value="Check">Check Payment</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Cash">Cash Settlement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Status</Label>
                      <Select value={incomeForm.status} onValueChange={val => setIncomeForm({...incomeForm, status: val as any})}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                          <SelectItem value="received">Received (Full)</SelectItem>
                          <SelectItem value="pending">Awaiting Payment</SelectItem>
                          <SelectItem value="partially_paid">Partially Received</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="h-11 px-8 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">
                  Close
                </Button>
                <Button onClick={handleSaveIncome} className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 h-11 px-10 font-bold transition-all transform active:scale-95 rounded-xl">
                  Finalize Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-green-500 to-emerald-600 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-20 w-20" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-green-100 uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Gross Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-green-100 font-bold mt-2 flex items-center gap-1.5 bg-white/10 w-fit px-2 py-1 rounded-full backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" /> +12.5% vs Last Period
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Settled Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{formatCurrency(stats.confirmed)}</div>
            <p className="text-xs text-slate-400 font-medium mt-2">Ready for reallocation</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Receivables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{formatCurrency(stats.pending)}</div>
            <p className="text-xs text-amber-600 font-bold mt-2">Pending verification</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" /> Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{Math.round((stats.confirmed / (stats.total || 1)) * 100)}%</div>
            <p className="text-xs text-slate-400 font-medium mt-2">Collection conversion rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Transaction History</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-widest mt-1">Detailed Revenue Records</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                <Input 
                  placeholder="Search ledger..." 
                  className="h-10 pl-9 w-[280px] border-slate-200 focus:ring-green-500/20 rounded-xl" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
              <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-10 gap-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Records</DialogTitle>
                    <DialogDescription>
                      Narrow down the income records by category or status.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="partially_paid">Partially Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setFilterCategory('all'); setFilterStatus('all'); }}>Reset</Button>
                    <Button onClick={() => setIsFilterDialogOpen(false)}>Apply Filters</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-10 gap-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportExcel} className="gap-2 py-2 cursor-pointer font-medium">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
                    Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="gap-2 py-2 cursor-pointer font-medium">
                    <FilePdf className="h-3.5 w-3.5 text-red-600" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[120px] font-black uppercase tracking-widest text-[10px] text-slate-400 pl-6">ID / Date</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Classification</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Merchant/Desc</TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-slate-400">Net Amount</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Modality</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Record Status</TableHead>
                <TableHead className="text-right pr-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncomes.map((income) => (
                <TableRow key={income.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100 cursor-default">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{income.id}</span>
                      <span className="text-xs font-bold text-slate-600">{income.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-100/50 text-slate-600 border-none font-black text-[10px] uppercase tracking-widest px-2 py-0.5">
                      {income.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[250px]">
                      <span className="text-[13px] font-bold text-slate-700 truncate group-hover:text-green-600 transition-colors">{income.description}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User className="h-3 w-3 text-slate-300" />
                        <span className="text-[11px] font-medium text-slate-400 truncate">{income.customer || 'Internal Recipt'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-green-700">{formatCurrency(income.amount)}</span>
                      <span className="text-[10px] font-bold text-slate-400">INC-TAX Incl.</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-slate-200" />
                       <span className="text-xs font-bold text-slate-500">{income.paymentMethod}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "font-black text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 border-none",
                        income.status === 'received' ? "bg-green-100 text-green-700" : 
                        income.status === 'pending' ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      )}
                    >
                      {income.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-3 py-2">Quick Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setViewedIncome(income)} className="gap-2 px-3 py-2 cursor-pointer font-bold text-slate-600 focus:bg-green-50 focus:text-green-700">
                          <Eye className="h-3.5 w-3.5" />
                          Full Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setIncomeForm(income);
                            setIsAddDialogOpen(true);
                          }}
                          className="gap-2 px-3 py-2 cursor-pointer font-bold text-slate-600 focus:bg-blue-50 focus:text-blue-700"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Update Record
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(income.id)}
                          className="gap-2 px-3 py-2 cursor-pointer font-bold text-red-600 focus:bg-red-50 focus:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Void Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
             <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
               Showing {filteredIncomes.length} of {incomes.length} records
             </div>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest border-slate-200">Previous</Button>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest border-slate-200">Next Page</Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <Layers className="h-6 w-6 text-green-400" />
              <DialogTitle className="text-xl font-black">Revenue Structure</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-4 bg-white">
            <div className="flex gap-2">
              <Input 
                id="newCategory" 
                placeholder="New classification name..." 
                className="h-10 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    if (input.value) {
                      setCategories([...categories, input.value]);
                      input.value = '';
                      toast({ title: "Classification Added", description: "New revenue stream type created." });
                    }
                  }
                }}
              />
              <Button 
                onClick={() => {
                  const input = document.getElementById('newCategory') as HTMLInputElement;
                  if (input.value) {
                    setCategories([...categories, input.value]);
                    input.value = '';
                    toast({ title: "Classification Added", description: "New revenue stream type created." });
                  }
                }}
                className="bg-slate-900 hover:bg-slate-800 rounded-xl px-4"
              >
                Add
              </Button>
            </div>
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-2">
                {categories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                    <span className="text-sm font-bold text-slate-700">{cat}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => setCategories(categories.filter(c => c !== cat))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="p-4 bg-slate-50 border-t">
            <Button onClick={() => setIsCategoryDialogOpen(false)} className="w-full bg-slate-900 font-bold rounded-xl h-11">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={!!viewedIncome} onOpenChange={(open) => !open && setViewedIncome(null)}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-3xl bg-white">
           {viewedIncome && (
             <>
               <div className="p-8 bg-gradient-to-br from-green-600 to-emerald-700 text-white relative">
                  <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                     <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Revenue Settlement Origin</p>
                    <h2 className="text-3xl font-black">{formatCurrency(viewedIncome.amount)}</h2>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <Badge className="bg-white/20 text-white border-none font-bold text-[10px] uppercase px-3">{viewedIncome.category}</Badge>
                    <Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] uppercase px-3">{viewedIncome.status}</Badge>
                  </div>
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Post Date</Label>
                        <p className="text-sm font-bold text-slate-700">{viewedIncome.date}</p>
                     </div>
                     <div className="space-y-1 text-right">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reference SKU</Label>
                        <p className="text-sm font-mono font-bold text-slate-700">{viewedIncome.id}</p>
                     </div>
                  </div>
                  
                  <div className="space-y-1 border-t border-slate-100 pt-4">
                     <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction Memo</Label>
                     <p className="text-sm font-medium text-slate-600 leading-relaxed">{viewedIncome.description}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400">Merchant / Payer</span>
                        <span className="text-xs font-bold text-slate-700">{viewedIncome.customer || 'Direct Entry'}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400">Modality</span>
                        <span className="text-xs font-bold text-slate-700">{viewedIncome.paymentMethod}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400">Document Ref</span>
                        <span className="text-xs font-mono font-bold text-blue-600">{viewedIncome.reference || 'N/A'}</span>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <Button className="flex-1 bg-slate-900 font-bold rounded-2xl h-11" onClick={() => setViewedIncome(null)}>Close</Button>
                     <Button 
                      variant="outline" 
                      className="h-11 w-11 p-0 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                      onClick={() => {
                        handleDelete(viewedIncome.id);
                        setViewedIncome(null);
                      }}
                     >
                        <Trash2 className="h-5 w-5" />
                     </Button>
                  </div>
               </div>
             </>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

