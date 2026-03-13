import { useState, useRef } from 'react';
import {
  TrendingDown, Plus, Upload, X, FileText, CreditCard,
  Banknote, Smartphone, Building2, Car, BarChart3,
  Calendar, Tag, Receipt, Edit, Trash2, CheckCircle,
  Clock, Paperclip, Search, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

// ─── Types ───────────────────────────────────────────────────────────────────
type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Custom';
type ExpenseStatus = 'Paid' | 'Pending' | 'Overdue';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  notes: string;
  status: ExpenseStatus;
  bill: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Rent & Lease', 'Utilities', 'Travel', 'Meals & Entertainment',
  'Office Supplies', 'Salaries', 'Marketing', 'IT & Software',
  'Insurance', 'Maintenance', 'Other',
];

const CAT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#a855f7',
];

const PM_META: Record<string, { icon: any; bg: string; iconColor: string; border: string }> = {
  'Cash':          { icon: Banknote,   bg: '#eff6ff', iconColor: '#3b82f6', border: '#bfdbfe' },
  'UPI':           { icon: Smartphone, bg: '#f0fdf4', iconColor: '#22c55e', border: '#bbf7d0' },
  'Bank Transfer': { icon: Building2,  bg: '#fdf4ff', iconColor: '#a855f7', border: '#e9d5ff' },
  'Card':          { icon: CreditCard, bg: '#fff7ed', iconColor: '#f97316', border: '#fed7aa' },
};

const SEED: Expense[] = [
  { id:'1', date:'2026-03-01', description:'Office Rent – March',    category:'Rent & Lease',        amount:45000, paymentMethod:'Bank Transfer', reference:'TXN-001', notes:'',                                         status:'Paid',    bill:'rent_march.pdf'    },
  { id:'2', date:'2026-03-03', description:'Team Lunch',              category:'Meals & Entertainment',amount:3200,  paymentMethod:'Card',          reference:'TXN-002', notes:'',                                         status:'Paid',    bill:null                },
  { id:'3', date:'2026-03-05', description:'Cloud Hosting – AWS',     category:'IT & Software',        amount:8750,  paymentMethod:'Card',          reference:'TXN-003', notes:'Monthly plan',                            status:'Paid',    bill:'aws_invoice.pdf'   },
  { id:'4', date:'2026-03-07', description:'Electricity Bill',         category:'Utilities',            amount:6800,  paymentMethod:'UPI',           reference:'TXN-004', notes:'',                                         status:'Paid',    bill:'electricity.pdf'   },
  { id:'5', date:'2026-03-08', description:'Sales Team Travel',        category:'Travel',               amount:12400, paymentMethod:'Cash',          reference:'TXN-005', notes:'Outstation meeting',                      status:'Pending', bill:null                },
  { id:'6', date:'2026-03-09', description:'Printer Cartridges',       category:'Office Supplies',      amount:1850,  paymentMethod:'Cash',          reference:'TXN-006', notes:'',                                         status:'Paid',    bill:'receipt.pdf'       },
  { id:'7', date:'2026-03-10', description:'Google Ads Campaign',      category:'Marketing',            amount:22000, paymentMethod:'Card',          reference:'TXN-007', notes:'Q1 campaign',                             status:'Pending', bill:null                },
  { id:'8', date:'2026-03-10', description:'Internet Broadband',       category:'Utilities',            amount:4200,  paymentMethod:'Bank Transfer', reference:'TXN-008', notes:'',                                         status:'Overdue', bill:'isp_bill.pdf'      },
];

const BLANK_FORM = {
  date: new Date().toISOString().split('T')[0],
  description: '', category: '', amount: '',
  paymentMethod: '' as PaymentMethod | '',
  reference: '', notes: '', status: 'Paid' as ExpenseStatus,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(SEED);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState({ ...BLANK_FORM });
  const [customPM, setCustomPM]   = useState('');
  const [billFile, setBillFile]   = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('All');
  const [filterPay, setFilterPay]   = useState('All');

  // ── derived ──────────────────────────────────────────────────────────────
  const total     = expenses.reduce((s, e) => s + e.amount, 0);
  const monthExp  = expenses.filter(e => e.date.startsWith('2026-03')).reduce((s, e) => s + e.amount, 0);
  const pendingAmt = expenses.filter(e => e.status !== 'Paid').reduce((s, e) => s + e.amount, 0);
  const pendingCnt = expenses.filter(e => e.status !== 'Paid').length;
  const avgDay    = Math.round(monthExp / 11);

  const catTotals = CATEGORIES
    .map((c, i) => ({ name: c, total: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0), color: CAT_COLORS[i] }))
    .filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCat = Math.max(...catTotals.map(c => c.total), 1);

  const pmCards = Object.entries(PM_META).map(([name, meta]) => ({
    name, ...meta,
    total: expenses.filter(e => e.paymentMethod === name).reduce((s, e) => s + e.amount, 0),
    count: expenses.filter(e => e.paymentMethod === name).length,
  }));
  const customTotal = expenses.filter(e => !Object.keys(PM_META).includes(e.paymentMethod)).reduce((s, e) => s + e.amount, 0);
  const customCount = expenses.filter(e => !Object.keys(PM_META).includes(e.paymentMethod)).length;

  const filtered = expenses.filter(e => {
    const mc = filterCat === 'All' || e.category === filterCat;
    const mp = filterPay === 'All' || e.paymentMethod === filterPay;
    const ms = e.description.toLowerCase().includes(search.toLowerCase()) ||
               e.reference.toLowerCase().includes(search.toLowerCase());
    return mc && mp && ms;
  });

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  const statusCls = (s: ExpenseStatus) => ({
    Paid:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Pending: 'bg-amber-50  text-amber-700  border border-amber-200',
    Overdue: 'bg-red-50    text-red-700    border border-red-200',
  }[s]);

  // ── handlers ─────────────────────────────────────────────────────────────
  const openNew = () => {
    setForm({ ...BLANK_FORM }); setEditId(null); setBillFile(null); setCustomPM('');
    setShowForm(true);
  };
  const cancel  = () => { setShowForm(false); setEditId(null); };

  const handleEdit = (exp: Expense) => {
    setForm({
      date: exp.date, description: exp.description, category: exp.category,
      amount: exp.amount.toString(), paymentMethod: exp.paymentMethod as any,
      reference: exp.reference, notes: exp.notes, status: exp.status,
    });
    setEditId(exp.id);
    setBillFile(null);
    setCustomPM('');
    setShowForm(true);
  };

  const handleDelete = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pm = form.paymentMethod === 'Custom' ? (customPM.trim() || 'Custom') : form.paymentMethod;
    const saved: Expense = {
      id: editId ?? Date.now().toString(),
      date: form.date, description: form.description, category: form.category,
      amount: parseFloat(form.amount) || 0, paymentMethod: pm,
      reference: form.reference || `TXN-${Date.now().toString().slice(-4)}`,
      notes: form.notes, status: form.status,
      bill: billFile ? billFile.name : (editId ? (expenses.find(e => e.id === editId)?.bill ?? null) : null),
    };
    setExpenses(prev => editId ? prev.map(e => e.id === editId ? saved : e) : [saved, ...prev]);
    cancel();
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ─── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-500" />
            Expenses
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage all your business expenses</p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* ─── ADD / EDIT EXPENSE DIALOG ────────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) cancel(); }}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-red-500" />
              {editId ? 'Edit Expense' : 'New Expense'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            {/* Row 1 — Date + Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Date *</Label>
                <Input type="date" required className="h-9 text-sm"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Description *</Label>
                <Input required placeholder="e.g. Office Rent, Team Lunch…" className="h-9 text-sm"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            {/* Row 2 — Category + Amount + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Category *</Label>
                <Select required value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Amount (₹) *</Label>
                <Input required type="number" min="0" step="0.01" placeholder="0.00" className="h-9 text-sm"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ExpenseStatus }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">✅ Paid</SelectItem>
                    <SelectItem value="Pending">⏳ Pending</SelectItem>
                    <SelectItem value="Overdue">🔴 Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3 — Payment Method + Custom + Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Payment Method *</Label>
                <Select required value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v as PaymentMethod }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">💵 Cash</SelectItem>
                    <SelectItem value="UPI">📱 UPI</SelectItem>
                    <SelectItem value="Bank Transfer">🏦 Bank Transfer</SelectItem>
                    <SelectItem value="Card">💳 Card</SelectItem>
                    <SelectItem value="Custom">✏️ Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.paymentMethod === 'Custom' ? (
                <div>
                  <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Custom Method Name *</Label>
                  <Input required placeholder="e.g. Cheque, Voucher…" className="h-9 text-sm"
                    value={customPM} onChange={e => setCustomPM(e.target.value)} />
                </div>
              ) : <div />}
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Reference / Txn ID</Label>
                <Input placeholder="TXN-XXXX (auto if blank)" className="h-9 text-sm"
                  value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Notes / Remarks</Label>
              <Textarea placeholder="Additional details about this expense…" className="text-sm resize-none h-20"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            {/* Bill Upload */}
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Bill / Invoice Upload</Label>
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/20 transition-all duration-200"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={e => setBillFile(e.target.files?.[0] ?? null)} />
                {billFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{billFile.name}</p>
                      <p className="text-xs text-slate-400">{(billFile.size / 1024).toFixed(1)} KB · Click to change</p>
                    </div>
                    <button type="button" className="ml-auto text-slate-400 hover:text-red-500 shrink-0"
                      onClick={ev => { ev.stopPropagation(); setBillFile(null); }}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-1.5">
                      <Upload className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Drop file or click to upload</p>
                    <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG — up to 10 MB</p>
                  </>
                )}
              </div>
            </div>

            <DialogFooter className="pt-1 gap-2">
              <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <CheckCircle className="h-4 w-4" />
                {editId ? 'Update Expense' : 'Save Expense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* ─── STAT CARDS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Expenses',      value: fmt(total),     sub: 'All time',    icon: TrendingDown, col: '#ef4444', bg: '#fef2f2' },
          { label: 'This Month',          value: fmt(monthExp),  sub: 'March 2026',  icon: Calendar,     col: '#f97316', bg: '#fff7ed' },
          { label: 'Pending / Overdue',   value: fmt(pendingAmt),sub: `${pendingCnt} bills`, icon: Clock, col: '#eab308', bg: '#fefce8' },
          { label: 'Avg per Day',         value: fmt(avgDay),    sub: 'March 2026',  icon: BarChart3,    col: '#8b5cf6', bg: '#f5f3ff' },
        ].map((c, i) => (
          <Card key={i} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500 truncate">{c.label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1 truncate">{c.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.bg }}>
                  <c.icon className="h-5 w-5" style={{ color: c.col }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── BREAKDOWN: CATEGORY + PAYMENT METHOD ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Breakdown */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" />
              Expense by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {catTotals.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No data yet</p>
            ) : catTotals.map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 font-medium truncate max-w-[140px]">{c.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{Math.round((c.total / total) * 100)}%</span>
                    <span className="text-sm font-bold text-slate-800">{fmt(c.total)}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(c.total / maxCat) * 100}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" />
              Expense by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {pmCards.map(pm => (
                <div key={pm.name} className="rounded-xl p-3 border"
                  style={{ background: pm.bg, borderColor: pm.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <pm.icon className="h-4 w-4" style={{ color: pm.iconColor }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{pm.name}</span>
                  </div>
                  <p className="text-base font-bold text-slate-800">{fmt(pm.total)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pm.count} transactions</p>
                </div>
              ))}

              {/* Custom */}
              <div className="rounded-xl p-3 border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Receipt className="h-4 w-4 text-slate-500" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Custom</span>
                </div>
                <p className="text-base font-bold text-slate-800">{fmt(customTotal)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{customCount} transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ─── EXPENSE TABLE ────────────────────────────────────────────────── */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              Expense Records
              <span className="text-xs font-normal text-slate-400">({filtered.length} entries)</span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <Input placeholder="Search…" className="h-8 text-xs pl-7 w-40"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {/* Category filter */}
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {/* Payment filter */}
              <Select value={filterPay} onValueChange={setFilterPay}>
                <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Scrollable table area */}
          <ScrollArea className="h-[420px] w-full rounded-b-lg">
            <div className="min-w-[860px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 sticky top-0 z-10">
                    <TableHead className="text-xs font-semibold text-slate-500 w-10">#</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Description</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Category</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Payment</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Reference</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Bill</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-14 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Receipt className="h-10 w-10 opacity-30" />
                          <p className="text-sm">No expenses found</p>
                          <p className="text-xs">Try adjusting filters or add a new expense</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((exp, idx) => (
                    <TableRow key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="text-xs text-slate-400 font-mono tabular-nums">{idx + 1}</TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-800 max-w-[170px]">
                        <div className="truncate" title={exp.description}>{exp.description}</div>
                        {exp.notes && <div className="text-xs text-slate-400 truncate mt-0.5" title={exp.notes}>{exp.notes}</div>}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium whitespace-nowrap">
                          {exp.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-bold text-right text-red-600 whitespace-nowrap tabular-nums">
                        {fmt(exp.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">{exp.paymentMethod}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-500">{exp.reference}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusCls(exp.status)}`}>
                          {exp.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {exp.bill ? (
                          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors">
                            <Paperclip className="h-3 w-3" /> View
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(exp)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(exp.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
              <p className="text-xs text-slate-500">Showing {filtered.length} of {expenses.length} records</p>
              <p className="text-sm font-bold text-slate-700">
                Filtered Total: <span className="text-red-600">{fmt(filtered.reduce((s, e) => s + e.amount, 0))}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
