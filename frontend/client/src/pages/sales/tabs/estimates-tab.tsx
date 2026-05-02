import { useEffect, useMemo, useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { BANK_ACCOUNTS_UPDATED_EVENT, getActiveBankAccountOptions } from '@/lib/bank-accounts';
import { ESIGN_SIGNATURES_UPDATED_EVENT, getDefaultESignatureProfile, getESignatureProfiles } from '@/lib/esign-signatures';

type EstimateLineItem = {
  id: number;
  item: string;
  description: string;
  qty: number;
  rate: number;
  tax: string;
  amount: number;
};

type EstimateCatalogItem = {
  id: string;
  type: 'service' | 'product';
  name: string;
  description: string;
  defaultRate: number;
  defaultTax: string;
};

const parseEstimateTaxRate = (taxLabel: string): number => {
  const match = taxLabel.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : 0;
};

const getEstimateTaxBreakdown = (taxLabel: string) => {
  const rate = parseEstimateTaxRate(taxLabel);
  if (taxLabel.includes('GST') && !taxLabel.includes('IGST')) {
    return { cgstPercent: rate / 2, sgstPercent: rate / 2, otherPercent: 0 };
  }
  return { cgstPercent: 0, sgstPercent: 0, otherPercent: rate };
};

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

  // Create Form State
  const [createPaymentMode, setCreatePaymentMode] = useState('bank');
  const [createBankAccountId, setCreateBankAccountId] = useState('');
  const [bankAccountOptions, setBankAccountOptions] = useState(() => getActiveBankAccountOptions());
  const [eSignatures, setESignatures] = useState(() => getESignatureProfiles());
  const [createESignatureId, setCreateESignatureId] = useState('');
  const [createSignatureDesignation, setCreateSignatureDesignation] = useState('');
  const [createCatalogTab, setCreateCatalogTab] = useState<'service' | 'product'>('service');
  const [createCatalogSelection, setCreateCatalogSelection] = useState('');
  const [createDiscountValue, setCreateDiscountValue] = useState(0);
  const [createDiscountMode, setCreateDiscountMode] = useState<'percent' | 'fixed'>('percent');
  const [createAdjustment, setCreateAdjustment] = useState(0);
  const [createShowQtyAs, setCreateShowQtyAs] = useState<'qty' | 'hours' | 'both'>('qty');
  const [createItems, setCreateItems] = useState<EstimateLineItem[]>([
    { id: 1, item: '', description: '', qty: 1, rate: 0, tax: 'No Tax', amount: 0 }
  ]);
  const [createCustomFields, setCreateCustomFields] = useState<Array<{ id: number; label: string; value: string }>>([]);
  const [createCustomSections, setCreateCustomSections] = useState<Array<{ id: number; title: string; content: string }>>([]);

  useEffect(() => {
    const reloadBankAccounts = () => {
      setBankAccountOptions(getActiveBankAccountOptions());
    };

    window.addEventListener(BANK_ACCOUNTS_UPDATED_EVENT, reloadBankAccounts);
    window.addEventListener('storage', reloadBankAccounts);

    return () => {
      window.removeEventListener(BANK_ACCOUNTS_UPDATED_EVENT, reloadBankAccounts);
      window.removeEventListener('storage', reloadBankAccounts);
    };
  }, []);

  useEffect(() => {
    const refreshESignatures = () => {
      setESignatures(getESignatureProfiles());
    };

    window.addEventListener(ESIGN_SIGNATURES_UPDATED_EVENT, refreshESignatures);
    window.addEventListener('storage', refreshESignatures);

    return () => {
      window.removeEventListener(ESIGN_SIGNATURES_UPDATED_EVENT, refreshESignatures);
      window.removeEventListener('storage', refreshESignatures);
    };
  }, []);

  useEffect(() => {
    if (createESignatureId) return;

    const defaultSignature = getDefaultESignatureProfile();
    if (!defaultSignature) return;

    setCreateESignatureId(defaultSignature.id);
    setCreateSignatureDesignation(defaultSignature.designation || '');
  }, [createESignatureId, eSignatures]);

  useEffect(() => {
    if (!createESignatureId) return;

    const selectedSignature = eSignatures.find((signature) => signature.id === createESignatureId);
    if (!selectedSignature) return;

    setCreateSignatureDesignation(selectedSignature.designation || '');
  }, [createESignatureId, eSignatures]);

  const createCatalog = useMemo<EstimateCatalogItem[]>(() => [
    {
      id: 'svc-consulting',
      type: 'service',
      name: 'Consulting Service',
      description: 'Professional advisory and consulting service.',
      defaultRate: 5000,
      defaultTax: 'GST 18%',
    },
    {
      id: 'svc-development',
      type: 'service',
      name: 'Development Service',
      description: 'Application or website development work.',
      defaultRate: 10000,
      defaultTax: 'GST 18%',
    },
    {
      id: 'prd-license',
      type: 'product',
      name: 'Software License',
      description: 'Annual software license subscription.',
      defaultRate: 8000,
      defaultTax: 'GST 18%',
    },
    {
      id: 'prd-maintenance',
      type: 'product',
      name: 'Maintenance Package',
      description: 'Maintenance and support package.',
      defaultRate: 3000,
      defaultTax: 'GST 18%',
    },
  ], []);

  const createServiceCatalog = useMemo(
    () => createCatalog.filter((item) => item.type === 'service'),
    [createCatalog],
  );

  const createProductCatalog = useMemo(
    () => createCatalog.filter((item) => item.type === 'product'),
    [createCatalog],
  );

  const addCreateItem = () => {
    const newId = createItems.length > 0 ? Math.max(...createItems.map((i) => i.id)) + 1 : 1;
    setCreateItems([...createItems, { id: newId, item: '', description: '', qty: 1, rate: 0, tax: 'No Tax', amount: 0 }]);
  };

  const updateCreateItem = (id: number, field: keyof EstimateLineItem, value: string | number) => {
    setCreateItems(createItems.map((line) => {
      if (line.id !== id) return line;
      const updated = { ...line, [field]: value };
      updated.amount = updated.qty * updated.rate;
      return updated;
    }));
  };

  const removeCreateItem = (id: number) => {
    if (createItems.length <= 1) return;
    setCreateItems(createItems.filter((line) => line.id !== id));
  };

  const addCreateCatalogItem = (catalogId: string) => {
    if (catalogId === 'custom') {
      addCreateItem();
      setCreateCatalogSelection('');
      return;
    }

    const found = createCatalog.find((item) => item.id === catalogId);
    if (!found) return;

    const newId = createItems.length > 0 ? Math.max(...createItems.map((i) => i.id)) + 1 : 1;
    setCreateItems([
      ...createItems,
      {
        id: newId,
        item: found.name,
        description: found.description,
        qty: 1,
        rate: found.defaultRate,
        tax: found.defaultTax,
        amount: found.defaultRate,
      },
    ]);
    setCreateCatalogSelection('');
  };

  const calculateCreateTotals = () => {
    const subTotal = createItems.reduce((sum, line) => sum + (line.qty * line.rate), 0);
    const cgstAmount = createItems.reduce((sum, line) => {
      const rates = getEstimateTaxBreakdown(line.tax);
      return sum + ((line.qty * line.rate) * rates.cgstPercent / 100);
    }, 0);
    const sgstAmount = createItems.reduce((sum, line) => {
      const rates = getEstimateTaxBreakdown(line.tax);
      return sum + ((line.qty * line.rate) * rates.sgstPercent / 100);
    }, 0);
    const otherTaxAmount = createItems.reduce((sum, line) => {
      const rates = getEstimateTaxBreakdown(line.tax);
      return sum + ((line.qty * line.rate) * rates.otherPercent / 100);
    }, 0);
    const taxAmount = cgstAmount + sgstAmount + otherTaxAmount;
    const discountAmount = createDiscountMode === 'percent'
      ? (subTotal * createDiscountValue) / 100
      : createDiscountValue;
    const total = subTotal + taxAmount - discountAmount + createAdjustment;
    return { subTotal, cgstAmount, sgstAmount, otherTaxAmount, discountAmount, total };
  };

  const addCreateCustomField = () => {
    setCreateCustomFields([
      ...createCustomFields,
      { id: Date.now(), label: '', value: '' },
    ]);
  };

  const updateCreateCustomField = (id: number, field: 'label' | 'value', value: string) => {
    setCreateCustomFields(createCustomFields.map((entry) => (
      entry.id === id ? { ...entry, [field]: value } : entry
    )));
  };

  const removeCreateCustomField = (id: number) => {
    setCreateCustomFields(createCustomFields.filter((entry) => entry.id !== id));
  };

  const addCreateCustomSection = () => {
    setCreateCustomSections([
      ...createCustomSections,
      { id: Date.now(), title: '', content: '' },
    ]);
  };

  const updateCreateCustomSection = (id: number, field: 'title' | 'content', value: string) => {
    setCreateCustomSections(createCustomSections.map((entry) => (
      entry.id === id ? { ...entry, [field]: value } : entry
    )));
  };

  const removeCreateCustomSection = (id: number) => {
    setCreateCustomSections(createCustomSections.filter((entry) => entry.id !== id));
  };

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
    const amountNum = parseFloat(estimate.amount?.replace(/[₹$,]/g, '') || '0');
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
      amount: '₹42,000',
      tax: '₹4,200',
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
      amount: '₹78,000',
      tax: '₹7,800',
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
      amount: '₹22,000',
      tax: '₹2,200',
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
      amount: '₹115,000',
      tax: '₹11,500',
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
      amount: `₹${total.toLocaleString()}`,
      tax: `₹${taxAmount.toLocaleString()}`,
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
                    <span className="text-2xl font-bold text-green-700">₹{(parseFloat(viewEstimate.amount.replace(/[₹$,]/g, '')) + parseFloat(viewEstimate.tax.replace(/[₹$,]/g, ''))).toLocaleString()}
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
                            <SelectItem value="USD">INR (₹)</SelectItem>
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
                              <div className="space-y-2">
                                <Input
                                  placeholder="Item name"
                                  value={item.item}
                                  onChange={(e) => updateEditItem(item.id, 'item', e.target.value)}
                                  className="h-9 text-sm"
                                />
                                <Textarea
                                  placeholder="Long description"
                                  value={item.description}
                                  onChange={(e) => updateEditItem(item.id, 'description', e.target.value)}
                                  className="min-h-[60px] resize-none text-sm text-emerald-600"
                                />
                              </div>
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
                            <TableCell className="text-right font-semibold">₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                          <p className="font-semibold">₹{calculateEditTotals().subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div></div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">₹{calculateEditTotals().discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                        <p className="text-sm text-slate-600">₹{editAdjustment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <Label className="text-lg font-bold">Total</Label>
                        <p className="text-2xl font-bold text-green-700">₹{calculateEditTotals().total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                        {/* Currency / Status */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-600">* Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">INR ₹</SelectItem>
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

                        {/* Payment Mode */}
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-600">Payment Mode</Label>
                          <Select
                            value={createPaymentMode}
                            onValueChange={(value) => {
                              setCreatePaymentMode(value);
                              if (value !== 'bank') {
                                setCreateBankAccountId('');
                              }
                            }}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank">Bank</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="stripe">Stripe</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {createPaymentMode === 'bank' && (
                          <div className="space-y-2">
                            <Label className="text-xs text-slate-600">Bank Name</Label>
                            <Select value={createBankAccountId} onValueChange={setCreateBankAccountId}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select bank account" />
                              </SelectTrigger>
                              <SelectContent>
                                {bankAccountOptions.length > 0 ? (
                                  bankAccountOptions.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                      {account.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="__no_accounts__" disabled>
                                    No active bank accounts found
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-xs text-slate-600">E-Signature</Label>
                          <Select value={createESignatureId} onValueChange={setCreateESignatureId}>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select signature from E-Sign Settings" />
                            </SelectTrigger>
                            <SelectContent>
                              {eSignatures.map((signature) => (
                                <SelectItem key={signature.id} value={signature.id}>
                                  {signature.signerName} - {signature.designation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-slate-600">Designation</Label>
                          <Input
                            value={createSignatureDesignation}
                            onChange={(e) => setCreateSignatureDesignation(e.target.value)}
                            placeholder="Signer designation"
                            className="h-10"
                          />
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

                      </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Tabs
                            value={createCatalogTab}
                            onValueChange={(value) => {
                              setCreateCatalogTab(value as 'service' | 'product');
                              setCreateCatalogSelection('');
                            }}
                            className="w-fit"
                          >
                            <TabsList className="h-8">
                              <TabsTrigger value="service" className="text-xs px-3">Services</TabsTrigger>
                              <TabsTrigger value="product" className="text-xs px-3">Products</TabsTrigger>
                            </TabsList>
                          </Tabs>
                          <div className="flex items-center gap-2">
                            <Select
                              value={createCatalogSelection}
                              onValueChange={(value) => {
                                setCreateCatalogSelection(value);
                                addCreateCatalogItem(value);
                              }}
                            >
                              <SelectTrigger className="w-56 h-10">
                                <SelectValue placeholder={`Add ${createCatalogTab === 'service' ? 'service' : 'product'}`} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="custom">Custom Item</SelectItem>
                                {(createCatalogTab === 'service' ? createServiceCatalog : createProductCatalog).map((catalogItem) => (
                                  <SelectItem key={catalogItem.id} value={catalogItem.id}>
                                    {catalogItem.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={addCreateItem}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span>Show quantity as:</span>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="qty-type-new"
                              checked={createShowQtyAs === 'qty'}
                              onChange={() => setCreateShowQtyAs('qty')}
                              className="text-blue-600"
                            />
                            <span>Qty</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="qty-type-new"
                              checked={createShowQtyAs === 'hours'}
                              onChange={() => setCreateShowQtyAs('hours')}
                            />
                            <span>Hours</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="qty-type-new"
                              checked={createShowQtyAs === 'both'}
                              onChange={() => setCreateShowQtyAs('both')}
                            />
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
                              <TableHead className="text-slate-600 w-24">
                                {createShowQtyAs === 'hours' ? 'Hours' : createShowQtyAs === 'both' ? 'Qty/Hours' : 'Qty'}
                              </TableHead>
                              <TableHead className="text-slate-600 w-28">Rate</TableHead>
                              <TableHead className="text-blue-600 font-medium w-32">Tax</TableHead>
                              <TableHead className="text-right text-slate-600 w-28">Amount</TableHead>
                              <TableHead className="w-10"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {createItems.map((line, index) => (
                              <TableRow key={line.id} className="border-l-2 border-l-transparent">
                                <TableCell className="align-top pt-3 text-xs text-slate-400 font-medium">{index + 1}</TableCell>
                                <TableCell className="align-top pt-2">
                                  <div className="space-y-2">
                                    <Input
                                      placeholder="Item name"
                                      value={line.item}
                                      onChange={(e) => updateCreateItem(line.id, 'item', e.target.value)}
                                      className="h-10 text-sm"
                                    />
                                    <Textarea
                                      placeholder="Description of item"
                                      value={line.description}
                                      onChange={(e) => updateCreateItem(line.id, 'description', e.target.value)}
                                      className="min-h-[60px] resize-y text-sm"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="align-top pt-2">
                                  <Input
                                    type="number"
                                    value={line.qty}
                                    onChange={(e) => updateCreateItem(line.id, 'qty', parseFloat(e.target.value) || 0)}
                                    className="text-center h-10"
                                    placeholder={createShowQtyAs === 'hours' ? 'Hours' : createShowQtyAs === 'both' ? 'Qty/Hours' : 'Qty'}
                                  />
                                  <span className="text-[10px] text-blue-500 block mt-1">
                                    {createShowQtyAs === 'hours' ? 'Hours' : createShowQtyAs === 'both' ? 'Qty/Hours' : 'Unit'}
                                  </span>
                                </TableCell>
                                <TableCell className="align-top pt-2">
                                  <Input
                                    type="number"
                                    value={line.rate}
                                    onChange={(e) => updateCreateItem(line.id, 'rate', parseFloat(e.target.value) || 0)}
                                    placeholder="Rate"
                                    className="h-10"
                                  />
                                </TableCell>
                                <TableCell className="align-top pt-2">
                                  <Select value={line.tax} onValueChange={(value) => updateCreateItem(line.id, 'tax', value)}>
                                    <SelectTrigger className="text-xs h-10">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="No Tax">No Tax</SelectItem>
                                      <SelectItem value="GST 5%">GST 5%</SelectItem>
                                      <SelectItem value="GST 12%">GST 12%</SelectItem>
                                      <SelectItem value="GST 18%">GST 18%</SelectItem>
                                      <SelectItem value="GST 28%">GST 28%</SelectItem>
                                      <SelectItem value="IGST 18%">IGST 18%</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="align-top pt-3 text-right font-semibold">
                                  ₹{line.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="align-top pt-2">
                                  {index === 0 ? (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                                      onClick={() => removeCreateItem(line.id)}
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
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Sub Total:</span>
                            <span className="font-semibold">₹{calculateCreateTotals().subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">CGST:</span>
                            <span className="font-semibold">₹{calculateCreateTotals().cgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">SGST:</span>
                            <span className="font-semibold">₹{calculateCreateTotals().sgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          {calculateCreateTotals().otherTaxAmount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600">Other Tax:</span>
                              <span className="font-semibold">₹{calculateCreateTotals().otherTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-blue-600 font-medium">Discount</Label>
                              <Input 
                                type="number"
                                value={createDiscountValue}
                                onChange={(e) => setCreateDiscountValue(parseFloat(e.target.value) || 0)}
                                className="w-20 h-8 text-sm"
                              />
                              <Select value={createDiscountMode} onValueChange={(value) => setCreateDiscountMode(value as 'percent' | 'fixed')}>
                                <SelectTrigger className="w-16 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percent">%</SelectItem>
                                  <SelectItem value="fixed">₹</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-sm text-slate-600">₹{calculateCreateTotals().discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-blue-600 font-medium">Adjustment</Label>
                              <Input 
                                type="number"
                                value={createAdjustment}
                                onChange={(e) => setCreateAdjustment(parseFloat(e.target.value) || 0)}
                                className="w-24 h-8 text-sm"
                              />
                            </div>
                            <p className="text-sm text-slate-600">₹{createAdjustment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t">
                            <Label className="text-lg font-bold text-blue-600">Total:</Label>
                            <p className="text-xl font-bold text-green-700">₹{calculateCreateTotals().total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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

                    {/* Custom Fields */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-blue-600">Custom Fields</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addCreateCustomField}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Field
                        </Button>
                      </div>
                      {createCustomFields.length > 0 && (
                        <div className="space-y-2">
                          {createCustomFields.map((field) => (
                            <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                              <Input
                                placeholder="Field label"
                                value={field.label}
                                onChange={(e) => updateCreateCustomField(field.id, 'label', e.target.value)}
                              />
                              <Input
                                placeholder="Field value"
                                value={field.value}
                                onChange={(e) => updateCreateCustomField(field.id, 'value', e.target.value)}
                              />
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeCreateCustomField(field.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Custom Sections */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-blue-600">Custom Sections</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addCreateCustomSection}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Section
                        </Button>
                      </div>
                      {createCustomSections.length > 0 && (
                        <div className="space-y-3">
                          {createCustomSections.map((section) => (
                            <div key={section.id} className="space-y-2 border rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Section title"
                                  value={section.title}
                                  onChange={(e) => updateCreateCustomSection(section.id, 'title', e.target.value)}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeCreateCustomSection(section.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Section content"
                                value={section.content}
                                onChange={(e) => updateCreateCustomSection(section.id, 'content', e.target.value)}
                                className="min-h-[90px] resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}
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
