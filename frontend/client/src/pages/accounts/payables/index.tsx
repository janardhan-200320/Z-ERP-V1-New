import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpCircle, Search, Filter, Download, Plus, 
  MoreHorizontal, Eye, CheckCircle2, 
  Clock, AlertCircle, TrendingUp, DollarSign,
  FileText, Calendar, User, ArrowRight, Trash2,
  ChevronRight, Landmark, Building2, CreditCard,
  Briefcase, ShoppingCart, Power, Receipt,
  Send, ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

type Bill = {
  id: string;
  vendor: string;
  date: string;
  due: string;
  amount: number;
  category: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
};

export default function Payables({ includeLayout = true }: any) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);

  const [bills, setBills] = useState<Bill[]>([
    { id: 'BILL-1025', vendor: 'Azure Cloud Services', date: '2026-01-20', due: '2026-02-20', amount: 4200.50, category: 'Infrastructure', status: 'unpaid', priority: 'high' },
    { id: 'BILL-1026', vendor: 'Office Rentals Inc', date: '2026-01-15', due: '2026-02-01', amount: 15000.00, category: 'Rent', status: 'scheduled', priority: 'high' },
    { id: 'BILL-1027', vendor: 'Stellar Logistics', date: '2026-01-18', due: '2026-02-18', amount: 850.00, category: 'Shipping', status: 'paid', priority: 'low' },
    { id: 'BILL-1028', vendor: 'Global Office Supplies', date: '2025-12-28', due: '2026-01-28', amount: 2450.00, category: 'Supplies', status: 'overdue', priority: 'medium' },
    { id: 'BILL-1029', vendor: 'Marketing Wizards', date: '2026-01-10', due: '2026-02-10', amount: 6000.00, category: 'Marketing', status: 'unpaid', priority: 'medium' },
  ]);

  const [billForm, setBillForm] = useState({
    vendor: "",
    category: "Operations",
    date: new Date().toISOString().split('T')[0],
    due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: "",
    priority: "medium"
  });

  const filteredBills = useMemo(() => {
    return bills.filter(bill => 
      bill.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bills, searchQuery]);

  const totals = useMemo(() => {
    const totalPay = bills.reduce((sum, b) => sum + b.amount, 0);
    const unpaid = bills.filter(b => b.status === 'unpaid' || b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0);
    const overdue = bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0);
    return { totalPay, unpaid, overdue };
  }, [bills]);

  const handleAddBill = () => {
    if (!billForm.vendor || !billForm.amount) {
      toast({ title: "Error", description: "Please enter vendor and amount", variant: "destructive" });
      return;
    }
    const newBill: Bill = {
      id: `BILL-${1025 + bills.length}`,
      vendor: billForm.vendor,
      date: billForm.date,
      due: billForm.due,
      amount: Number(billForm.amount),
      category: billForm.category,
      status: "unpaid",
      priority: billForm.priority as any
    };
    setBills([newBill, ...bills]);
    setIsBillDialogOpen(false);
    toast({ title: "Bill Recorded", description: `Financial liability added for ${newBill.vendor}` });
  };

  const handleBatchCheck = () => {
    if (selectedBills.length === 0) {
      toast({
        title: "No Bills Selected",
        description: "Please select at least one bill to perform a batch check.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Batch Check Initiated",
      description: `Verifying ${selectedBills.length} obligations...`
    });

    setTimeout(() => {
      setBills(bills.map(b => 
        selectedBills.includes(b.id) && b.status === "unpaid" 
          ? { ...b, status: "scheduled" } 
          : b
      ));
      setSelectedBills([]);
      toast({
        title: "Batch Check Complete",
        description: "Selected bills have been verified and scheduled for payment."
      });
    }, 1500);
  };

  const toggleBillSelection = (id: string) => {
    setSelectedBills(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const content = (
    <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-100">
               <ArrowUpCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Accounts Payable</h2>
          </div>
          <p className="text-slate-500 font-medium ml-12">Manage vendor obligations and payment schedules</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className={cn(
              "h-11 border-slate-200 bg-white hover:bg-slate-50 font-bold gap-2 px-5 shadow-sm transition-all",
              selectedBills.length > 0 ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100" : "text-slate-600"
            )}
            onClick={handleBatchCheck}
          >
            <Download className="h-4 w-4" />
            {selectedBills.length > 0 ? `Batch Check (${selectedBills.length})` : 'Batch Check'}
          </Button>
          
          <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100 gap-2 font-bold px-8 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-5 w-5" />
                Add Vendor Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[750px] flex flex-col p-0 overflow-hidden shadow-2xl border-none sm:rounded-2xl bg-white">
               <DialogHeader className="px-8 py-6 bg-slate-900 text-white shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg">
                        <Receipt className="h-6 w-6 text-white" />
                     </div>
                     <div>
                        <DialogTitle className="text-2xl font-black">Record Liability</DialogTitle>
                        <DialogDescription className="text-red-100/60 font-bold uppercase tracking-widest text-xs mt-0.5">Accounts Payable Entry</DialogDescription>
                     </div>
                  </div>
               </DialogHeader>

               <ScrollArea className="flex-1">
                  <div className="p-8 space-y-8">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Vendor / Payee *</Label>
                           <Input 
                              placeholder="e.g. AWS, Office Depot..." 
                              className="h-11 rounded-xl border-slate-200"
                              value={billForm.vendor}
                              onChange={e => setBillForm({...billForm, vendor: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-black text-red-600 uppercase tracking-widest">Bill Amount *</Label>
                           <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                              <Input 
                                 type="number" 
                                 placeholder="0.00" 
                                 className="h-11 pl-9 rounded-xl border-red-50 bg-red-50/20 text-red-700 font-bold"
                                 value={billForm.amount}
                                 onChange={e => setBillForm({...billForm, amount: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Posting Date</Label>
                           <Input 
                              type="date" 
                              className="h-11 rounded-xl"
                              value={billForm.date}
                              onChange={e => setBillForm({...billForm, date: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Payment Deadline</Label>
                           <Input 
                              type="date" 
                              className="h-11 rounded-xl"
                              value={billForm.due}
                              onChange={e => setBillForm({...billForm, due: e.target.value})}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expense Category</Label>
                           <Select value={billForm.category} onValueChange={v => setBillForm({...billForm, category: v})}>
                              <SelectTrigger className="h-11 rounded-xl">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                 <SelectItem value="Rent">Office Rent</SelectItem>
                                 <SelectItem value="Marketing">Marketing</SelectItem>
                                 <SelectItem value="Utilities">Utilities</SelectItem>
                                 <SelectItem value="Supplies">Supplies</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Disbursement Priority</Label>
                           <Select value={billForm.priority} onValueChange={v => setBillForm({...billForm, priority: v})}>
                              <SelectTrigger className="h-11 rounded-xl">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="low">Low (Standard)</SelectItem>
                                 <SelectItem value="medium">Medium (Regular)</SelectItem>
                                 <SelectItem value="high">High (Immediate)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Liability Memo</Label>
                        <Textarea 
                           placeholder="Internal comments for the accounts manager..." 
                           className="min-h-[100px] rounded-xl resize-none"
                        />
                     </div>
                  </div>
               </ScrollArea>

               <DialogFooter className="px-8 py-5 bg-slate-50 border-t flex gap-3 shrink-0">
                  <Button variant="outline" className="h-11 px-8 rounded-xl font-bold" onClick={() => setIsBillDialogOpen(false)}>Cancel</Button>
                  <Button className="h-11 px-10 rounded-xl bg-red-600 hover:bg-red-700 font-black shadow-lg shadow-red-100" onClick={handleAddBill}>
                     Record Obligation
                  </Button>
               </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-gradient-to-br from-red-600 to-rose-700 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShoppingCart className="h-20 w-20" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-100 uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Total Obligations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{formatCurrency(totals.totalPay)}</div>
            <p className="text-xs text-red-100 font-bold mt-2">Aggregated Vendor Liability</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" /> Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{formatCurrency(totals.unpaid)}</div>
            <p className="text-xs text-orange-600 font-bold mt-2">Current Disbursement Queue</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Disbursed (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">$248,500</div>
            <p className="text-xs text-green-600 font-bold mt-2">Settled Vendor Invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <CardTitle className="text-xl font-bold text-slate-800">Obligation Ledger</CardTitle>
                 <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Managed Accounts Payable</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    <Input 
                       placeholder="Find vendor or bill ID..." 
                       className="h-10 pl-9 w-[280px] border-slate-200 focus:ring-red-100 rounded-xl"
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Button variant="outline" className="h-10 bg-white border-slate-200 rounded-xl font-bold text-slate-600 gap-2">
                    <Filter className="h-4 w-4" /> Filter
                 </Button>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
              <TableHeader className="bg-slate-50/70">
                 <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[40px] pl-6">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBills(filteredBills.map(b => b.id));
                          else setSelectedBills([]);
                        }}
                        checked={selectedBills.length === filteredBills.length && filteredBills.length > 0}
                      />
                    </TableHead>
                    <TableHead className="w-[140px] font-black uppercase text-[10px] tracking-widest text-slate-400">Reference</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Vendor Entity</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Category</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Obligation</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Priority</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
                    <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredBills.map((bill) => (
                    <TableRow key={bill.id} className={cn(
                        "group hover:bg-slate-50/50 transition-colors border-slate-50 cursor-default",
                        selectedBills.includes(bill.id) && "bg-red-50/30"
                      )}>
                       <TableCell className="pl-6">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                            checked={selectedBills.includes(bill.id)}
                            onChange={() => toggleBillSelection(bill.id)}
                          />
                       </TableCell>
                       <TableCell className="py-4">
                          <span className="text-xs font-black text-red-600 tracking-tighter">{bill.id}</span>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{bill.date}</p>
                       </TableCell>
                       <TableCell>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-700">{bill.vendor}</span>
                             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Due: {bill.due}
                             </span>
                          </div>
                       </TableCell>
                       <TableCell>
                          <Badge variant="outline" className="bg-slate-50 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 text-slate-500">
                             {bill.category}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-right">
                          <span className="text-sm font-black text-slate-800">{formatCurrency(bill.amount)}</span>
                       </TableCell>
                       <TableCell>
                          <div className="flex items-center gap-1.5">
                             <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                bill.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                                bill.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                             )} />
                             <span className="text-[10px] font-black uppercase text-slate-500">{bill.priority}</span>
                          </div>
                       </TableCell>
                       <TableCell>
                          <Badge className={cn(
                             "font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 border-none",
                             bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                             bill.status === 'overdue' ? 'bg-red-100 text-red-700 animate-pulse' :
                             bill.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                             'bg-amber-100 text-amber-700'
                          )}>
                             {bill.status}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-right pr-6">
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                   <MoreHorizontal className="h-4 w-4" />
                                </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-slate-100">
                                <DropdownMenuLabel className="text-[9px] font-black uppercase text-slate-400 px-3 py-2">Payable Ops</DropdownMenuLabel>
                                <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer font-bold text-slate-600" onClick={() => setSelectedBill(bill)}>
                                   <Eye className="h-3.5 w-3.5 text-blue-500" /> View Liability
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer font-bold text-slate-600" onClick={() => toast({ title: "Portal Redirect", description: "Navigating to vendor payment portal..."})}>
                                   <ExternalLink className="h-3.5 w-3.5 text-slate-500" /> External Portal
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                   className="gap-2 px-3 py-2 cursor-pointer font-bold text-green-600 focus:bg-green-50 focus:text-green-700"
                                   onClick={() => {
                                      setBills(bills.map(b => b.id === bill.id ? {...b, status: 'paid'} : b));
                                      toast({ title: "Payment Recorded", description: `Full settlement for ${bill.vendor} recorded.` });
                                   }}
                                >
                                   <CreditCard className="h-3.5 w-3.5" /> Confirm Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                   className="gap-2 px-3 py-2 cursor-pointer font-bold text-red-600 focus:bg-red-50 focus:text-red-700"
                                   onClick={() => {
                                      setBills(bills.filter(b => b.id !== bill.id));
                                      toast({ title: "Bill Removed", description: "Record purged from payables ledger.", variant: "destructive" });
                                   }}
                                >
                                   <Trash2 className="h-3.5 w-3.5" /> Remove Entry
                                </DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
           <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Total Queue: {bills.length} Liabilities</span>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="h-8 text-[10px] font-black border-slate-200">Export PDF</Button>
                 <Button variant="outline" size="sm" className="h-8 text-[10px] font-black border-slate-200">Batch Pay</Button>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Bill Overview Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={open => !open && setSelectedBill(null)}>
         <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-3xl bg-slate-50">
            {selectedBill && (
               <>
                  <div className="p-10 bg-slate-900 text-white flex justify-between items-start">
                     <div className="space-y-2">
                        <Badge className="bg-red-600 text-white border-none font-black text-[10px] uppercase tracking-widest">{selectedBill.status}</Badge>
                        <h2 className="text-4xl font-black tracking-tighter">{selectedBill.id}</h2>
                        <p className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
                           <Building2 className="h-4 w-4" /> {selectedBill.vendor}
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Obligation Val.</p>
                        <p className="text-4xl font-black">{formatCurrency(selectedBill.amount)}</p>
                     </div>
                  </div>

                  <div className="p-10 space-y-8">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Recorded On</p>
                           <p className="text-sm font-bold text-slate-700">{selectedBill.date}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="h-3 w-3" /> Final Deadline</p>
                           <p className="text-sm font-bold text-slate-700 tracking-tight">{selectedBill.due}</p>
                        </div>
                     </div>

                     <div className="p-6 rounded-2xl bg-slate-200/50 border border-slate-200/50">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Priority Rating</span>
                           <Badge className={cn(
                              "font-black text-[10px] uppercase tracking-widest px-3",
                              selectedBill.priority === 'high' ? 'bg-red-500' : 'bg-slate-400'
                           )}>{selectedBill.priority}</Badge>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                           "Internal procurement record for {selectedBill.category} expenses associated with Q4 operational scalability."
                        </p>
                     </div>

                     <div className="flex gap-4">
                        <Button className="flex-1 h-12 rounded-2xl bg-slate-900 font-black text-xs uppercase tracking-widest" onClick={() => setSelectedBill(null)}>Close Overview</Button>
                        <Button 
                           className="h-12 px-6 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-xs uppercase tracking-widest gap-2"
                           onClick={() => {
                              setBills(bills.map(b => b.id === selectedBill.id ? {...b, status: 'paid'} : b));
                              setSelectedBill(null);
                              toast({ title: "Instant Settlement", description: "Disbursement complete." });
                           }}
                        >
                           <Send className="h-4 w-4" /> Pay Now
                        </Button>
                     </div>
                  </div>
               </>
            )}
         </DialogContent>
      </Dialog>
    </div>
  );

  if (!includeLayout) return content;

  return (
    <DashboardLayout>
      {content}
    </DashboardLayout>
  );
}

