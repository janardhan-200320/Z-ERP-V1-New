import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowDownCircle, Search, Filter, Download, Plus, 
  MoreHorizontal, Eye, Mail, CheckCircle2, 
  Clock, AlertCircle, TrendingUp, DollarSign,
  FileText, Calendar, User, ArrowRight, Trash2,
  ChevronRight, Landmark, Building2, CreditCard,
  Briefcase, FileSpreadsheet, FileText as FilePdf
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

type Invoice = {
  id: string;
  customer: string;
  date: string;
  due: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  email: string;
};

export default function Receivables({ includeLayout = true }: any) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "INV-2026-001", customer: "Acme Corp", date: "2026-01-01", due: "2026-01-31", amount: 12500, status: "overdue", email: "billing@acme.com" },
    { id: "INV-2026-002", customer: "Global Tech", date: "2026-01-05", due: "2026-02-04", amount: 8400, status: "pending", email: "finance@globaltech.io" },
    { id: "INV-2026-003", customer: "Nexus Solutions", date: "2026-01-10", due: "2026-02-09", amount: 15000, status: "pending", email: "accounts@nexus.net" },
    { id: "INV-2026-004", customer: "Stellar Innovations", date: "2025-12-15", due: "2026-01-14", amount: 5200, status: "overdue", email: "ap@stellar.com" },
    { id: "INV-2026-005", customer: "Quantum Labs", date: "2026-01-12", due: "2026-02-11", amount: 22000, status: "paid", email: "billing@quantum.edu" },
  ]);

  const [invoiceForm, setInvoiceForm] = useState({
    customer: "",
    email: "",
    date: new Date().toISOString().split('T')[0],
    due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: "",
    items: [{ desc: "", qty: 1, price: 0 }]
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => 
      inv.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery]);

  const totals = useMemo(() => {
    const totalRec = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const overdue = invoices.filter(i => i.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0);
    const collected = invoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
    return { totalRec, overdue, collected };
  }, [invoices]);

  const handleCreateInvoice = () => {
    if (!invoiceForm.customer || !invoiceForm.amount) {
      toast({ title: "Error", description: "Please fill in customer and amount", variant: "destructive" });
      return;
    }
    const newInv: Invoice = {
      id: `INV-2026-00${invoices.length + 1}`,
      customer: invoiceForm.customer,
      date: invoiceForm.date,
      due: invoiceForm.due,
      amount: Number(invoiceForm.amount),
      status: "pending",
      email: invoiceForm.email || "client@example.com"
    };
    setInvoices([newInv, ...invoices]);
    setIsInvoiceDialogOpen(false);
    toast({ title: "Invoice Created", description: `Successfully generated ${newInv.id}` });
  };

  const handleStatusChange = (id: string, newStatus: Invoice["status"]) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    toast({ title: "Status Updated", description: `Invoice ${id} marked as ${newStatus}` });
  };

  const handleExportAudit = (format: 'excel' | 'pdf') => {
    if (format === 'excel') {
      const data = filteredInvoices.map(inv => ({
        'Invoice ID': inv.id,
        Customer: inv.customer,
        Date: inv.date,
        'Due Date': inv.due,
        Amount: inv.amount,
        Status: inv.status,
        Email: inv.email
      }));
      exportToExcel(data, 'accounts_receivable_audit');
    } else {
      const headers = ['ID', 'Customer', 'Date', 'Due Date', 'Amount', 'Status'];
      const data = filteredInvoices.map(inv => [
        inv.id,
        inv.customer,
        inv.date,
        inv.due,
        inv.amount.toString(),
        inv.status
      ]);
      exportToPDF('Receivables Audit Report', headers, data, 'receivables_audit');
    }
    toast({
      title: "Audit Exported",
      description: `Successfully generated ${format.toUpperCase()} audit report.`
    });
  };

  const content = (
    <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
               <ArrowDownCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Accounts Receivable</h2>
          </div>
          <p className="text-slate-500 font-medium ml-12">Monitor outgoing invoices and optimize collection cycles</p>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 border-slate-200 bg-white hover:bg-slate-50 font-bold gap-2 px-5 text-slate-600 shadow-sm">
                <Download className="h-4 w-4" />
                Export Audit
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleExportAudit('excel')} className="gap-2 py-2 cursor-pointer font-medium">
                <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAudit('pdf')} className="gap-2 py-2 cursor-pointer font-medium">
                <FilePdf className="h-3.5 w-3.5 text-red-600" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 gap-2 font-bold px-8 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-5 w-5" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-[95vw] h-[90vh] max-h-[850px] flex flex-col p-0 overflow-hidden shadow-2xl border-none sm:rounded-2xl bg-white">
               <DialogHeader className="px-8 py-6 bg-slate-900 text-white shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                     </div>
                     <div>
                        <DialogTitle className="text-2xl font-black">Generate New Invoice</DialogTitle>
                        <DialogDescription className="text-blue-100/60 font-bold uppercase tracking-widest text-xs mt-0.5">Commercial Settlement Document</DialogDescription>
                     </div>
                  </div>
               </DialogHeader>

               <ScrollArea className="flex-1">
                  <div className="p-8 space-y-10">
                     {/* Client Information */}
                     <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">
                           <User className="h-3.5 w-3.5" /> Client Identification
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-600">Customer Name *</Label>
                              <Input 
                                placeholder="e.g. Acme Corp Inc." 
                                className="h-11 rounded-xl border-slate-200"
                                value={invoiceForm.customer}
                                onChange={e => setInvoiceForm({...invoiceForm, customer: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-600">Billing Email *</Label>
                              <Input 
                                placeholder="billing@client.com" 
                                className="h-11 rounded-xl border-slate-200"
                                value={invoiceForm.email}
                                onChange={e => setInvoiceForm({...invoiceForm, email: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>

                     {/* Terms & Logistics */}
                     <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">
                           <Calendar className="h-3.5 w-3.5" /> Billing Cycle
                        </h4>
                        <div className="grid grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-600">Issue Date</Label>
                              <Input 
                                type="date" 
                                className="h-11 rounded-xl border-slate-200"
                                value={invoiceForm.date}
                                onChange={e => setInvoiceForm({...invoiceForm, date: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-600">Payment Terms</Label>
                              <Select defaultValue="net30">
                                 <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Net 30" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="due">Due on Receipt</SelectItem>
                                    <SelectItem value="net15">Net 15</SelectItem>
                                    <SelectItem value="net30">Net 30</SelectItem>
                                    <SelectItem value="net60">Net 60</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-600">Due Date</Label>
                              <Input 
                                type="date" 
                                className="h-11 rounded-xl border-slate-200"
                                value={invoiceForm.due}
                                onChange={e => setInvoiceForm({...invoiceForm, due: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>

                     {/* Financial Particulars */}
                     <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">
                           <DollarSign className="h-3.5 w-3.5" /> Financial Summary
                        </h4>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 gap-6">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">Total Contract Value (Gross) *</Label>
                              <div className="relative">
                                 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                                 <Input 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="h-14 pl-12 rounded-xl border-blue-100 bg-white text-2xl font-black text-slate-800 focus:ring-blue-100"
                                    value={invoiceForm.amount}
                                    onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Memo */}
                     <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Internal Memo / Notes</Label>
                        <Textarea 
                           placeholder="Additional details for the financial record..." 
                           className="min-h-[100px] rounded-xl border-slate-200 resize-none"
                        />
                     </div>
                  </div>
               </ScrollArea>

               <DialogFooter className="px-8 py-5 bg-slate-50 border-t flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <Clock className="h-3.5 w-3.5" /> Draft Auto-saved
                  </div>
                  <div className="flex gap-3">
                     <Button variant="outline" className="h-11 px-8 rounded-xl font-bold border-slate-200" onClick={() => setIsInvoiceDialogOpen(false)}>Discard</Button>
                     <Button className="h-11 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 font-black shadow-lg shadow-blue-100 gap-2" onClick={handleCreateInvoice}>
                        Generate & Send
                        <ArrowRight className="h-4 w-4" />
                     </Button>
                  </div>
               </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Landmark className="h-20 w-20" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-100 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Receivables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{formatCurrency(totals.totalRec)}</div>
            <p className="text-xs text-blue-100 font-bold mt-2 flex items-center gap-1.5 bg-white/10 w-fit px-2 py-1 rounded-full">
              Across {invoices.length} Active Accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" /> Past Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{formatCurrency(totals.overdue)}</div>
            <p className="text-xs text-red-600 font-bold mt-2">Requires Immediate Action</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Collected (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{formatCurrency(totals.collected)}</div>
            <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
               <TrendingUp className="h-3 w-3" /> +15.2% vs Last Mo
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="pb-2 text-slate-400">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" /> Avg. Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">28.4 Days</div>
            <p className="text-xs text-slate-400 font-medium mt-2">Cycle Efficiency: High</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Invoice Portfolio</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Managed Receivables Ledger</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="ID or Client Name..." 
                  className="h-10 pl-9 w-[280px] border-slate-200 focus:ring-blue-100 rounded-xl" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-10 border-slate-200 rounded-xl font-bold text-slate-600 flex gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[140px] pl-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Invoice ID</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Client/Merchant</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Timeline</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Valuation</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50 cursor-default">
                  <TableCell className="pl-6 py-4">
                    <span className="text-xs font-black text-blue-600 group-hover:underline cursor-pointer tracking-tighter">{inv.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700">{inv.customer}</span>
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{inv.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                         <Calendar className="h-3 w-3 text-slate-300" />
                         <span className="text-[11px] font-bold text-slate-600">{inv.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Clock className={cn("h-3 w-3", inv.status === 'overdue' ? 'text-red-400' : 'text-slate-300')} />
                         <span className={cn("text-[10px] font-black uppercase tracking-tighter", inv.status === 'overdue' ? 'text-red-600' : 'text-slate-400')}>Due: {inv.due}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-black text-slate-800">{formatCurrency(inv.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 border-none",
                        inv.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                        inv.status === "overdue" ? "bg-red-100 text-red-700 animate-pulse" :
                        "bg-amber-100 text-amber-700"
                      )}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                             <MoreHorizontal className="h-4 w-4" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-slate-100">
                          <DropdownMenuLabel className="text-[9px] font-black uppercase text-slate-400 px-3 py-2 tracking-[0.2em]">Settlement Operations</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer font-bold text-slate-600" onClick={() => setSelectedInvoice(inv)}>
                             <Eye className="h-3.5 w-3.5 text-blue-500" /> View Summary
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer font-bold text-slate-600" onClick={() => toast({ title: "Reminder Sent", description: `Follow-up email dispatched to ${inv.email}`})}>
                             <Mail className="h-3.5 w-3.5 text-amber-500" /> Send Reminder
                          </DropdownMenuItem>
                          {inv.status !== 'paid' && (
                             <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer font-bold text-green-600 focus:text-green-700 focus:bg-green-50" onClick={() => handleStatusChange(inv.id, 'paid')}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Paid
                             </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer font-bold text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => {
                             setInvoices(invoices.filter(i => i.id !== inv.id));
                             toast({ title: "Invoice Voided", description: "Record has been removed from ledger", variant: "destructive" });
                          }}>
                             <Trash2 className="h-3.5 w-3.5" /> Void Invoice
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Sync: {new Date().toLocaleTimeString()} • {filteredInvoices.length} active entries</span>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black border-slate-200">Previous</Button>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black border-slate-200">Next</Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Overview Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={open => !open && setSelectedInvoice(null)}>
         <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-3xl bg-slate-50">
            {selectedInvoice && (
               <>
                  <div className="p-10 bg-slate-900 text-white flex justify-between items-start">
                     <div className="space-y-2">
                        <Badge className="bg-blue-600 text-white border-none font-black text-[10px] uppercase tracking-widest">{selectedInvoice.status}</Badge>
                        <h2 className="text-4xl font-black tracking-tighter">{selectedInvoice.id}</h2>
                        <p className="text-slate-400 font-bold flex items-center gap-2">
                           <User className="h-4 w-4" /> {selectedInvoice.customer}
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Due</p>
                        <p className="text-4xl font-black">{formatCurrency(selectedInvoice.amount)}</p>
                     </div>
                  </div>

                  <div className="p-10 space-y-8">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Issue Date</p>
                           <p className="text-sm font-bold text-slate-700">{selectedInvoice.date}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="h-3 w-3" /> Settlement Deadline</p>
                           <p className="text-sm font-bold text-slate-700">{selectedInvoice.due}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Briefcase className="h-4 w-4 text-blue-500" /> Line Item Summary
                        </h4>
                        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                           <Table>
                              <TableBody>
                                 <TableRow>
                                    <TableCell className="font-bold text-slate-700">Enterprise Consulting Services</TableCell>
                                    <TableCell className="text-right font-black text-slate-800">{formatCurrency(selectedInvoice.amount)}</TableCell>
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <Button className="flex-1 h-12 rounded-2xl bg-blue-600 font-black text-xs uppercase tracking-widest" onClick={() => setSelectedInvoice(null)}>Close Overview</Button>
                        <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-slate-200 text-slate-400" onClick={() => toast({ title: "PDF Export", description: "Downloading high-res invoice..."})}>
                           <Download className="h-5 w-5" />
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

