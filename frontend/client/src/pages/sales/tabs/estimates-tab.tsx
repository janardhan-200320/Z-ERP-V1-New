import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Download, 
  Filter, 
  Search,
  Eye,
  Edit,
  FileText,
  ArrowRight,
  MoreVertical,
  X,
  Trash2,
  CheckCircle,
  FileCheck,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Send,
  Mail,
  CheckSquare,
  Check,
  Building2,
  Tag
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV } from '@/lib/csv-export';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';

export default function EstimatesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [viewEstimate, setViewEstimate] = useState<typeof estimates[0] | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const { toast } = useToast();

  // Edit Form State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<typeof estimates[0] | null>(null);
  const [editCustomer, setEditCustomer] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editBillTo, setEditBillTo] = useState({ address: '', city: '' });
  const [editShipTo, setEditShipTo] = useState({ address: '', city: '' });
  const [editTags, setEditTags] = useState('');
  const [editCurrency, setEditCurrency] = useState('INR');
  const [editStatus, setEditStatus] = useState('draft');
  const [editReference, setEditReference] = useState('');
  const [editSaleAgent, setEditSaleAgent] = useState('zervos-erp-admin');
  const [editDiscountType, setEditDiscountType] = useState('no-discount');
  const [editAdminNote, setEditAdminNote] = useState('');
  const [editEstimateNumber, setEditEstimateNumber] = useState('000001');
  const [editEstimatePrefix, setEditEstimatePrefix] = useState('EST-');
  const [editEstimateDate, setEditEstimateDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editClientNote, setEditClientNote] = useState('');
  const [editTerms, setEditTerms] = useState('');
  const [editItems, setEditItems] = useState<Array<{ id: number; item: string; description: string; qty: number; rate: number; tax: string; amount: number }>>([
    { id: 1, item: '', description: '', qty: 1, rate: 0, tax: 'No Tax', amount: 0 }
  ]);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editDiscountPercent, setEditDiscountPercent] = useState(0);
  const [editAdjustment, setEditAdjustment] = useState(0);
  const [showQtyAs, setShowQtyAs] = useState<'qty' | 'hours' | 'both'>('qty');

  // Load estimate data into edit form
  const loadEstimateForEdit = (estimate: typeof estimates[0]) => {
    setEditingEstimate(estimate);
    setEditCustomer(estimate.customer || '');
    setEditProject(estimate.project || '');
    setEditBillTo({ address: '', city: '' });
    setEditShipTo({ address: '', city: '' });
    setEditTags('');
    setEditCurrency('INR');
    setEditStatus(estimate.status || 'draft');
    setEditReference(estimate.reference || '');
    setEditSaleAgent('zervos-erp-admin');
    setEditDiscountType('no-discount');
    setEditAdminNote('');
    setEditEstimateNumber(estimate.id?.split('-')[1] || '000001');
    setEditEstimatePrefix('EST-');
    setEditEstimateDate(estimate.date || new Date().toISOString().split('T')[0]);
    setEditExpiryDate(estimate.expiryDate || '');
    setEditClientNote('');
    setEditTerms('');
    const amountNum = parseFloat(estimate.amount?.replace(/[$,]/g, '') || '0');
    setEditItems([
      { id: 1, item: 'Item 1', description: estimate.project || '', qty: 1, rate: amountNum, tax: 'No Tax', amount: amountNum }
    ]);
    setEditDiscount(0);
    setEditDiscountPercent(0);
    setEditAdjustment(0);
    setShowQtyAs('qty');
    setIsEditOpen(true);
  };

  // Calculate edit totals
  const calculateEditTotals = () => {
    const subTotal = editItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const discountAmount = editDiscountType === 'percentage' 
      ? subTotal * (editDiscountPercent / 100) 
      : editDiscount;
    const total = subTotal - discountAmount + editAdjustment;
    return { subTotal, discountAmount, total };
  };

  // Add new item
  const addEditItem = () => {
    const newId = editItems.length > 0 ? Math.max(...editItems.map(i => i.id)) + 1 : 1;
    setEditItems([...editItems, { id: newId, item: '', description: '', qty: 1, rate: 0, tax: 'No Tax', amount: 0 }]);
  };

  // Remove item
  const removeEditItem = (id: number) => {
    if (editItems.length > 1) {
      setEditItems(editItems.filter(item => item.id !== id));
    }
  };

  // Update item
  const updateEditItem = (id: number, field: string, value: string | number) => {
    setEditItems(editItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.amount = updated.qty * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  // Mock data
  const [estimates, setEstimates] = useState([
    {
      id: 'EST-001',
      customer: 'Acme Corporation',
      amount: '$42,000',
      tax: '$4,200',
      date: '2026-01-03',
      expiryDate: '2026-02-03',
      reference: 'REF-2026-001',
      project: 'Web Development',
      status: 'sent',
      invoiced: false
    },
    {
      id: 'EST-002',
      customer: 'TechStart Inc.',
      amount: '$78,000',
      tax: '$7,800',
      date: '2026-01-06',
      expiryDate: '2026-02-06',
      reference: 'REF-2026-002',
      project: 'Mobile App',
      status: 'accepted',
      invoiced: true
    },
    {
      id: 'EST-003',
      customer: 'Global Brands Ltd.',
      amount: '$22,000',
      tax: '$2,200',
      date: '2026-01-09',
      expiryDate: '2026-02-09',
      reference: 'REF-2026-003',
      project: 'Marketing',
      status: 'draft',
      invoiced: false
    },
    {
      id: 'EST-004',
      customer: 'Enterprise Solutions',
      amount: '$115,000',
      tax: '$11,500',
      date: '2026-01-11',
      expiryDate: '2026-02-11',
      reference: 'REF-2026-004',
      project: 'ERP',
      status: 'expired',
      invoiced: false
    }
  ]);

  const filteredEstimates = useMemo(() => {
    return estimates.filter(est => {
      const matchesSearch = 
        est.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.customer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || est.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, estimates]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({ title: "Exporting...", description: `Preparing estimate list in ${type.toUpperCase()}.` });

    setTimeout(() => {
      if (type === 'excel') {
        exportToCSV(filteredEstimates, `Estimates_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const doc = new jsPDF();
        doc.text("Sales Estimates Report", 14, 15);
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Customer', 'Amount', 'Tax', 'Expiry Date', 'Status']],
          body: filteredEstimates.map(e => [e.id, e.customer, e.amount, e.tax, e.expiryDate, e.status]),
        });
        doc.save(`Estimates_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      setIsExporting(false);
      toast({ title: "Export Ready", description: "Download started." });
    }, 1200);
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    draft: { label: 'Draft', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    sent: { label: 'Sent', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    accepted: { label: 'Accepted', class: 'bg-green-100 text-green-700 border-green-200' },
    declined: { label: 'Declined', class: 'bg-red-100 text-red-700 border-red-200' },
    expired: { label: 'Expired', class: 'bg-orange-100 text-orange-700 border-orange-200' }
  };

  const handleUpdateEstimate = () => {
    if (!editingEstimate) return;
    
    const { total } = calculateEditTotals();
    const taxAmount = total * 0.1; // 10% tax
    
    const updatedEstimate = {
      ...editingEstimate,
      id: `${editEstimatePrefix}${editEstimateNumber}`,
      customer: editCustomer,
      project: editProject,
      amount: `$${total.toLocaleString()}`,
      tax: `$${taxAmount.toLocaleString()}`,
      date: editEstimateDate,
      expiryDate: editExpiryDate,
      reference: editReference,
      status: editStatus
    };
    
    setEstimates(estimates.map(est => 
      est.id === editingEstimate.id ? updatedEstimate : est
    ));
    setIsEditOpen(false);
    setEditingEstimate(null);
    toast({ 
      title: "Estimate Updated", 
      description: `${updatedEstimate.id} has been updated successfully.` 
    });
  };

  const handleSendEstimate = (estimate: typeof estimates[0]) => {
    toast({ 
      title: "Sending Estimate", 
      description: `Preparing to send ${estimate.id} to ${estimate.customer}...` 
    });
    // Update status to sent
    setEstimates(estimates.map(est => 
      est.id === estimate.id ? { ...est, status: 'sent' } : est
    ));
  };

  return (
    <>
      {/* View Estimate Dialog */}
      <Dialog open={!!viewEstimate} onOpenChange={(open) => !open && setViewEstimate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Estimate Details - {viewEstimate?.id}
            </DialogTitle>
            <DialogDescription>
              View complete estimate information
            </DialogDescription>
          </DialogHeader>
          {viewEstimate && (
            <div className="space-y-6 py-4">
              {/* Header Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-slate-500">Customer</Label>
                    <p className="text-base font-semibold text-slate-900">{viewEstimate.customer}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Project</Label>
                    <p className="text-base font-semibold text-slate-900">{viewEstimate.project}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Reference</Label>
                    <p className="text-base font-mono text-slate-900">{viewEstimate.reference}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-slate-500">Estimate Date</Label>
                    <p className="text-base font-semibold text-slate-900">{viewEstimate.date}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Expiry Date</Label>
                    <p className="text-base font-semibold text-slate-900">{viewEstimate.expiryDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Status</Label>
                    <div className="pt-1">
                      <Badge variant="outline" className={statusConfig[viewEstimate.status].class}>
                        {statusConfig[viewEstimate.status].label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="border rounded-lg p-6 bg-slate-50">
                <h3 className="font-semibold text-slate-900 mb-4">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-900">{viewEstimate.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tax:</span>
                    <span className="font-semibold text-slate-900">{viewEstimate.tax}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-700">
                      ${(parseFloat(viewEstimate.amount.replace(/[$,]/g, '')) + parseFloat(viewEstimate.tax.replace(/[$,]/g, ''))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Status */}
              <div className="flex items-center gap-2 p-4 border rounded-lg bg-white">
                {viewEstimate.invoiced ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Converted to Invoice</p>
                      <p className="text-sm text-slate-600">This estimate has been invoiced</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-slate-900">Not Yet Invoiced</p>
                      <p className="text-sm text-slate-600">This estimate can be converted to an invoice</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {viewEstimate && !viewEstimate.invoiced && (
                <Button variant="outline" onClick={() => {
                  toast({ title: "Converting", description: "Generating invoice from estimate..." });
                  setViewEstimate(null);
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert to Invoice
                </Button>
              )}
            </div>
            <Button onClick={() => setViewEstimate(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Edit Estimate Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingEstimate(null); } }}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
          <ScrollArea className="max-h-[95vh]">
            <div className="p-6">
              {/* Header with EST Number and Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{editEstimatePrefix}{editEstimateNumber}</span>
                  <Badge variant="outline" className={statusConfig[editStatus]?.class || 'bg-slate-100 text-slate-700'}>
                    {statusConfig[editStatus]?.label || 'Draft'}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setIsEditOpen(false); setEditingEstimate(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Two Column Layout - Left */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Customer */}
                    <div className="space-y-2">
                      <Label className="text-xs text-red-500">* Customer</Label>
                      <Select value={editCustomer} onValueChange={setEditCustomer}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Acme Corporation">Acme Corporation</SelectItem>
                          <SelectItem value="TechStart Inc.">TechStart Inc.</SelectItem>
                          <SelectItem value="Global Brands Ltd.">Global Brands Ltd.</SelectItem>
                          <SelectItem value="Enterprise Solutions">Enterprise Solutions</SelectItem>
                          <SelectItem value="Arun Pools Studio">Arun Pools Studio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Project</Label>
                      <Select value={editProject} onValueChange={setEditProject}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Mobile App">Mobile App</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="ERP">ERP</SelectItem>
                          <SelectItem value="Support and Design System">Support and Design System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bill To / Ship To */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <Label className="text-xs text-slate-600">Bill To</Label>
                        </div>
                        <div className="p-3 border rounded-lg bg-slate-50 text-sm text-slate-600">
                          <p>{editBillTo.address || '-'}</p>
                          <p>{editBillTo.city || '-'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Ship To</Label>
                        <div className="p-3 border rounded-lg bg-slate-50 text-sm text-slate-600">
                          <p>{editShipTo.address || '-'}</p>
                          <p>{editShipTo.city || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Estimate Number */}
                    <div className="space-y-2">
                      <Label className="text-xs text-red-500">* Estimate Number</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <Tag className="h-3 w-3 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">{editEstimatePrefix}</span>
                        </div>
                        <Input 
                          value={editEstimateNumber}
                          onChange={(e) => setEditEstimateNumber(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-red-500">* Estimate Date</Label>
                        <Input 
                          type="date" 
                          value={editEstimateDate}
                          onChange={(e) => setEditEstimateDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Expiry Date</Label>
                        <Input 
                          type="date" 
                          value={editExpiryDate}
                          onChange={(e) => setEditExpiryDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-400" />
                        <Label className="text-xs text-slate-600">Tags</Label>
                      </div>
                      <Input 
                        placeholder="Add tags..."
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                      />
                    </div>

                    {/* Currency / Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Currency</Label>
                        <Select value={editCurrency} onValueChange={setEditCurrency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Status</Label>
                        <Select value={editStatus} onValueChange={setEditStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Reference */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Reference #</Label>
                      <Input 
                        placeholder="Enter reference number"
                        value={editReference}
                        onChange={(e) => setEditReference(e.target.value)}
                      />
                    </div>

                    {/* Sale Agent / Discount Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Sale Agent</Label>
                        <Select value={editSaleAgent} onValueChange={setEditSaleAgent}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zervos-erp-admin">Zervos ERP Admin</SelectItem>
                            <SelectItem value="sales-team">Sales Team</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Discount type</Label>
                        <Select value={editDiscountType} onValueChange={setEditDiscountType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-discount">No discount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Admin Note */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Admin Note</Label>
                      <Textarea 
                        placeholder="Internal notes (not visible to client)"
                        value={editAdminNote}
                        onChange={(e) => setEditAdminNote(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Select defaultValue="">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Add Item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="item1">Service Item</SelectItem>
                          <SelectItem value="item2">Product Item</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={addEditItem}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show quantity as:</span>
                      <Button 
                        variant={showQtyAs === 'qty' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowQtyAs('qty')}
                      >
                        Qty
                      </Button>
                      <Button 
                        variant={showQtyAs === 'hours' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowQtyAs('hours')}
                      >
                        Hours
                      </Button>
                      <Button 
                        variant={showQtyAs === 'both' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowQtyAs('both')}
                      >
                        Qty/Hours
                      </Button>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="w-8"></TableHead>
                          <TableHead className="text-blue-600 font-medium">Item</TableHead>
                          <TableHead className="text-slate-600">Description</TableHead>
                          <TableHead className="text-slate-600 w-24">{showQtyAs === 'hours' ? 'Hours' : 'Qty'}</TableHead>
                          <TableHead className="text-slate-600 w-28">Rate</TableHead>
                          <TableHead className="text-blue-600 font-medium w-32">Tax</TableHead>
                          <TableHead className="text-right text-slate-600 w-28">Amount</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editItems.map((item, index) => (
                          <TableRow key={item.id} className="border-l-2 border-l-blue-500">
                            <TableCell className="text-xs text-slate-400 font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <Textarea 
                                placeholder="Item name"
                                value={item.item}
                                onChange={(e) => updateEditItem(item.id, 'item', e.target.value)}
                                className="min-h-[60px] resize-none text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea 
                                placeholder="Long description"
                                value={item.description}
                                onChange={(e) => updateEditItem(item.id, 'description', e.target.value)}
                                className="min-h-[60px] resize-none text-sm text-emerald-600"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateEditItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                              <span className="text-[10px] text-slate-400 block mt-1">Unit</span>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number"
                                value={item.rate}
                                onChange={(e) => updateEditItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={item.tax} 
                                onValueChange={(value) => updateEditItem(item.id, 'tax', value)}
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="No Tax">No Tax</SelectItem>
                                  <SelectItem value="GST 5%">GST 5%</SelectItem>
                                  <SelectItem value="GST 12%">GST 12%</SelectItem>
                                  <SelectItem value="GST 18%">GST 18%</SelectItem>
                                  <SelectItem value="GST 28%">GST 28%</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              {index === 0 ? (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                  <Check className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                                  onClick={() => removeEditItem(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals Section */}
                  <div className="flex justify-end">
                    <div className="w-96 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-blue-600 font-medium">Discount%</Label>
                          <Input 
                            type="number"
                            value={editDiscountPercent}
                            onChange={(e) => setEditDiscountPercent(parseFloat(e.target.value) || 0)}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-sm text-slate-600">%</span>
                        </div>
                        <div className="text-right">
                          <Label className="text-xs text-slate-500">Sub Total</Label>
                          <p className="font-semibold">${calculateEditTotals().subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div></div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">${calculateEditTotals().discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-blue-600 font-medium">Adjustment</Label>
                          <Input 
                            type="number"
                            value={editAdjustment}
                            onChange={(e) => setEditAdjustment(parseFloat(e.target.value) || 0)}
                            className="w-24 h-8 text-sm"
                          />
                        </div>
                        <p className="text-sm text-slate-600">${editAdjustment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <Label className="text-lg font-bold">Total</Label>
                        <p className="text-2xl font-bold text-green-700">${calculateEditTotals().total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Note */}
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-xs text-blue-600">Client Note</Label>
                  <Textarea 
                    placeholder="Add a note visible to the client..."
                    value={editClientNote}
                    onChange={(e) => setEditClientNote(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-2">
                  <Label className="text-xs text-blue-600">Terms & Conditions</Label>
                  <Textarea 
                    placeholder="Enter terms and conditions..."
                    value={editTerms}
                    onChange={(e) => setEditTerms(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleUpdateEstimate} className="bg-blue-600 hover:bg-blue-700">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Estimates</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search estimates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn(statusFilter !== 'all' && "border-indigo-500 bg-indigo-50")}>
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === 'all' ? 'Filters' : `Status: ${statusFilter}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('sent')}>Sent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>Accepted</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('expired')}>Expired</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200 hover:bg-slate-50" disabled={isExporting}>
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4 text-red-600" /> Export PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4 text-blue-600" /> Print Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Estimate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] p-0">
              <ScrollArea className="max-h-[95vh]">
                <div className="p-6">
                  {/* Header */}
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-xl font-bold">Create New Estimate</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Two Column Layout */}
                    <div className="grid grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Customer */}
                        <div className="space-y-2">
                          <Label className="text-xs text-blue-600">* Customer</Label>
                          <Select>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select and begin typing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="acme">Acme Corporation</SelectItem>
                              <SelectItem value="techstart">TechStart Inc.</SelectItem>
                              <SelectItem value="global">Global Brands Ltd.</SelectItem>
                              <SelectItem value="enterprise">Enterprise Solutions</SelectItem>
                              <SelectItem value="arun">Arun Pools Studio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Bill To / Ship To */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-600" />
                              <Label className="text-xs text-blue-600">Bill To</Label>
                            </div>
                            <div className="p-3 border rounded-lg bg-slate-50 text-sm text-slate-600 min-h-[80px]">
                              <p>--</p>
                              <p>--, --</p>
                              <p>--, --</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-600">Ship to</Label>
                            <div className="p-3 border rounded-lg bg-slate-50 text-sm text-slate-600 min-h-[80px]">
                              <p>--</p>
                              <p>--, --</p>
                              <p>--, --</p>
                            </div>
                          </div>
                        </div>

                        {/* Estimate Number */}
                        <div className="space-y-2">
                          <Label className="text-xs text-blue-600">* Estimate Number</Label>
                          <div className="flex gap-2">
                            <div className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <Tag className="h-3 w-3 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">EST-</span>
                            </div>
                            <Input defaultValue="000003" className="flex-1 h-10" />
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-600">* Estimate Date</Label>
                            <Input type="date" defaultValue="2026-02-11" className="h-10" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-slate-600">Expiry Date</Label>
                            <Input type="date" defaultValue="2026-02-18" className="h-10" />
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Tags */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-slate-400" />
                            <Label className="text-xs text-slate-600">Tags</Label>
                          </div>
                          <Input placeholder="tag" className="h-10" />
                        </div>

                        {/* Currency / Status */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-600">* Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD $</SelectItem>
                                <SelectItem value="eur">EUR €</SelectItem>
                                <SelectItem value="gbp">GBP £</SelectItem>
                                <SelectItem value="inr">INR ₹</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-slate-600">Status</Label>
                            <Select defaultValue="draft">
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Reference */}
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-600">Reference #</Label>
                          <Input placeholder="" className="h-10" />
                        </div>

                        {/* Sale Agent / Discount Type */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-orange-600">Sale Agent</Label>
                            <Select defaultValue="zedunix">
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="zedunix">Zedunix ERP Admin</SelectItem>
                                <SelectItem value="sales-team">Sales Team</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-orange-600">Discount type</Label>
                            <Select defaultValue="no-discount">
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no-discount">No discount</SelectItem>
                                <SelectItem value="percent">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Admin Note */}
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-600">Admin Note</Label>
                          <Textarea 
                            placeholder="Internal notes (not visible to client)"
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Select>
                            <SelectTrigger className="w-40 h-10">
                              <SelectValue placeholder="Add Item" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="item1">Service Item</SelectItem>
                              <SelectItem value="item2">Product Item</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="icon" className="h-10 w-10">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span>Show quantity as:</span>
                          <label className="flex items-center gap-1">
                            <input type="radio" name="qty-type-new" defaultChecked className="text-blue-600" />
                            <span>Qty</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input type="radio" name="qty-type-new" />
                            <span>Hours</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input type="radio" name="qty-type-new" />
                            <span>Qty/Hours</span>
                          </label>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead className="w-8"></TableHead>
                              <TableHead className="text-blue-600 font-medium">Item</TableHead>
                              <TableHead className="text-slate-600">Description</TableHead>
                              <TableHead className="text-slate-600 w-24">Qty</TableHead>
                              <TableHead className="text-slate-600 w-28">Rate</TableHead>
                              <TableHead className="text-blue-600 font-medium w-32">Tax</TableHead>
                              <TableHead className="text-right text-slate-600 w-28">Amount</TableHead>
                              <TableHead className="w-10"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-l-2 border-l-transparent">
                              <TableCell className="text-xs text-slate-400 font-medium"></TableCell>
                              <TableCell>
                                <Textarea 
                                  placeholder="Description"
                                  className="min-h-[60px] resize-none text-sm"
                                />
                              </TableCell>
                              <TableCell>
                                <Textarea 
                                  placeholder="Long description"
                                  className="min-h-[60px] resize-none text-sm"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number"
                                  defaultValue="1"
                                  className="text-center h-10"
                                />
                                <span className="text-[10px] text-blue-500 block mt-1">Unit</span>
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number"
                                  placeholder="Rate"
                                  className="h-10"
                                />
                              </TableCell>
                              <TableCell>
                                <Select defaultValue="no-tax">
                                  <SelectTrigger className="text-xs h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="no-tax">No Tax</SelectItem>
                                    <SelectItem value="gst-5">GST 5%</SelectItem>
                                    <SelectItem value="gst-12">GST 12%</SelectItem>
                                    <SelectItem value="gst-18">GST 18%</SelectItem>
                                    <SelectItem value="gst-28">GST 28%</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Totals Section */}
                      <div className="flex justify-end">
                        <div className="w-96 space-y-3">
                          <div className="flex justify-between items-center">
                            <div></div>
                            <div className="text-right">
                              <Label className="text-xs text-blue-600">Sub Total:</Label>
                              <p className="font-semibold">$0.00</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-blue-600 font-medium">Discount</Label>
                              <Input 
                                type="number"
                                defaultValue="0"
                                className="w-20 h-8 text-sm"
                              />
                              <Select defaultValue="percent">
                                <SelectTrigger className="w-16 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percent">%</SelectItem>
                                  <SelectItem value="fixed">$</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-sm text-slate-600">$0.00</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-blue-600 font-medium">Adjustment</Label>
                              <Input 
                                type="number"
                                defaultValue="0"
                                className="w-24 h-8 text-sm"
                              />
                            </div>
                            <p className="text-sm text-slate-600">$0.00</p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t">
                            <Label className="text-lg font-bold text-blue-600">Total:</Label>
                            <p className="text-xl font-bold text-green-700">$0.00</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Client Note */}
                    <div className="space-y-2 pt-4 border-t">
                      <Label className="text-xs text-blue-600">Client Note</Label>
                      <Textarea 
                        placeholder="Add a note visible to the client..."
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-2">
                      <Label className="text-xs text-blue-600">Terms & Conditions</Label>
                      <Textarea 
                        placeholder="Enter terms and conditions..."
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estimate Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invoiced</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEstimates.map((estimate, index) => (
              <TableRow 
                key={estimate.id} 
                className="hover:bg-slate-50 transition-colors relative group"
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <TableCell className="font-mono text-sm font-semibold relative">
                  <div className="flex items-center gap-2">
                    {estimate.id}
                    {/* Hover Actions - View | Edit | Send */}
                    {hoveredRow === index && (
                      <div className="flex items-center gap-1 ml-2 animate-in fade-in duration-150">
                        <button 
                          onClick={() => setViewEstimate(estimate)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                        >
                          View
                        </button>
                        <span className="text-slate-300">|</span>
                        <button 
                          onClick={() => loadEstimateForEdit(estimate)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button 
                          onClick={() => handleSendEstimate(estimate)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{estimate.customer}</TableCell>
                <TableCell className="font-semibold text-green-700">{estimate.amount}</TableCell>
                <TableCell className="text-sm">{estimate.tax}</TableCell>
                <TableCell className="text-sm">{estimate.date}</TableCell>
                <TableCell className="text-sm">{estimate.expiryDate}</TableCell>
                <TableCell className="font-mono text-xs">{estimate.reference}</TableCell>
                <TableCell className="text-sm">{estimate.project}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusConfig[estimate.status].class}>
                    {statusConfig[estimate.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {estimate.invoiced ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                      No
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );
}
