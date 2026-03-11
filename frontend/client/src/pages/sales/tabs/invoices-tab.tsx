import { useState, useMemo, useEffect } from 'react';
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
  Printer,
  DollarSign,
  FileText,
  Paperclip,
  MoreVertical,
  Trash2,
  FileCheck,
  Send,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  ChevronDown,
  Mail,
  CheckSquare,
  RefreshCw,
  Repeat,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from '@/lib/csv-export';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from "@/lib/utils";
import { downloadSalesInvoicePDF, printSalesInvoicePDF, InvoiceData } from "@/lib/sales-invoice-pdf";
import QRCode from 'qrcode';

export default function InvoicesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [entriesPerPage, setEntriesPerPage] = useState('25');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const { toast } = useToast();

  // Generate QR code when invoice is selected
  useEffect(() => {
    if (selectedInvoice) {
      const qrData = `upi://pay?pa=payment@upi&pn=ZOLLID&am=3540&cu=INR&tn=${encodeURIComponent('Invoice: ' + selectedInvoice.id)}`;
      QRCode.toDataURL(qrData, {
        width: 100,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      }).then(url => {
        setQrCodeDataUrl(url);
      }).catch(() => {
        setQrCodeDataUrl('');
      });
    }
  }, [selectedInvoice]);

  // Invoice items state
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: '', longDescription: '', qty: 1, rate: 0, tax: 'No Tax', amount: 0 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('%');
  const [adjustment, setAdjustment] = useState(0);

  // Mock data - Updated to match screenshot
  const [invoices, setInvoices] = useState([
    { id: 'INV-000010', amount: '$1,200.00', totalTax: '$0.00', date: '2026-01-13', customer: '', project: '', tags: '', dueDate: '2026-02-12', status: 'unpaid' },
    { id: 'INV-000014', amount: '$1,000.00', totalTax: '$0.00', date: '2025-10-22', customer: 'Jack', project: '', tags: '', dueDate: '2025-11-21', status: 'unpaid' },
    { id: 'INV-000013', amount: '826.00', totalTax: '126.00', date: '2025-09-12', customer: 'Sarmad', project: '', tags: '', dueDate: '2025-09-19', status: 'unpaid' },
    { id: 'INV-000012', amount: '8.26', totalTax: '1.26', date: '2025-09-12', customer: 'Sarmad', project: '', tags: '', dueDate: '2025-09-19', status: 'unpaid' },
    { id: 'INV-000011', amount: '826.00', totalTax: '126.00', date: '2025-09-12', customer: 'Sarmad', project: '', tags: '', dueDate: '2025-09-19', status: 'unpaid' },
    { id: 'INV-000010', amount: '826.00', totalTax: '126.00', date: '2025-09-12', customer: 'Sarmad', project: '', tags: '', dueDate: '2025-09-19', status: 'unpaid' },
    { id: 'INV-000009', amount: '$1,000.00', totalTax: '$0.00', date: '2025-09-08', customer: 'jack', project: '', tags: '', dueDate: '2025-10-08', status: 'unpaid' },
    { id: 'INV-000009', amount: '$100,000.00', totalTax: '$0.00', date: '2025-11-07', customer: 'Greeen Dot', project: '', tags: '', dueDate: '2025-12-07', status: 'unpaid' },
    { id: 'INV-000008', amount: '$1,000.00', totalTax: '$0.00', date: '2025-09-15', customer: 'Greeen Dot', project: '', tags: '', dueDate: '2025-10-15', status: 'unpaid' },
  ]);

  // Calculate totals
  const calculateTotals = () => {
    const subTotal = invoiceItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const discountAmount = discountType === '%' ? (subTotal * discount / 100) : discount;
    const total = subTotal - discountAmount + adjustment;
    return { subTotal, discountAmount, total };
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { 
      id: invoiceItems.length + 1, 
      description: '', 
      longDescription: '', 
      qty: 1, 
      rate: 0, 
      tax: 'No Tax', 
      amount: 0 
    }]);
  };

  const removeInvoiceItem = (id: number) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const updateInvoiceItem = (id: number, field: string, value: any) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updated.amount = updated.qty * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, invoices]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({ title: "Exporting...", description: `Preparing invoice list in ${type.toUpperCase()}.` });

    setTimeout(() => {
      if (type === 'excel') {
        exportToCSV(filteredInvoices, `Invoices_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const doc = new jsPDF();
        doc.text("Invoices Report", 14, 15);
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Amount', 'Total Tax', 'Date', 'Customer', 'Due Date', 'Status']],
          body: filteredInvoices.map(i => [i.id, i.amount, i.totalTax, i.date, i.customer, i.dueDate, i.status]),
        });
        doc.save(`Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      setIsExporting(false);
      toast({ title: "Export Ready", description: "Download started." });
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2">
              <Plus className="h-4 w-4" />
              Create New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
            <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-xl">INV-000009</DialogTitle>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Unpaid</Badge>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-2 text-sm text-slate-600">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Invoices Available for Merging</span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">INV-000009</span>
                    <span className="text-slate-400">$100,00.00</span>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Select merged invoices as converted instead of deleting</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-sm">* Customer</Label>
                    <Select>
                      <SelectTrigger id="customer" className="h-10">
                        <SelectValue placeholder="Greeen Dot" defaultValue="greeen-dot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greeen-dot">Greeen Dot</SelectItem>
                        <SelectItem value="jack">Jack</SelectItem>
                        <SelectItem value="sarmad">Sarmad</SelectItem>
                        <SelectItem value="acme">Acme Corp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project" className="text-sm">Project</Label>
                    <Select>
                      <SelectTrigger id="project" className="h-10">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proj-1">Project Alpha</SelectItem>
                        <SelectItem value="proj-2">Project Beta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Bill To</Label>
                    <div className="p-3 bg-slate-50 rounded border text-sm text-slate-600">
                      <div>123 Main St, Suite 456</div>
                      <div>New York, NY 10001</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="invoice-number" className="text-sm flex items-center gap-1">
                        * Invoice Number 
                        <span className="text-xs text-blue-600 cursor-pointer ml-auto">ⓘ</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input id="invoice-number" defaultValue="00007" className="h-10" />
                        <Select defaultValue="inv-prefix">
                          <SelectTrigger className="w-32 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inv-prefix">INV-</SelectItem>
                            <SelectItem value="bill">BILL-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-date" className="text-sm">* Invoice Date</Label>
                      <Input id="invoice-date" type="date" defaultValue="2025-11-07" className="h-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Prevent sending reminder for this invoice</span>
                    </label>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Ship To</Label>
                    <div className="p-3 bg-slate-50 rounded border text-sm text-slate-600">
                      <div>Same as billing address</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm">Tags</Label>
                    <Input id="tags" placeholder="Add tags..." className="h-10" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm">* Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger id="currency" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD $</SelectItem>
                        <SelectItem value="eur">EUR €</SelectItem>
                        <SelectItem value="gbp">GBP £</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="sale-agent" className="text-sm">Sale Agent</Label>
                      <Select defaultValue="zeruns">
                        <SelectTrigger id="sale-agent" className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zeruns">Zeruns ERP Admin</SelectItem>
                          <SelectItem value="john">John Doe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurring" className="text-sm">Recurring Invoice?</Label>
                      <Select defaultValue="no">
                        <SelectTrigger id="recurring" className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="due-date" className="text-sm">Due Date</Label>
                      <Input id="due-date" type="date" defaultValue="2025-12-07" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount-type" className="text-sm">Discount Type</Label>
                      <Select defaultValue="no-discount" onValueChange={(val) => setDiscountType(val === 'percent' ? '%' : '$')}>
                        <SelectTrigger id="discount-type" className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-discount">No discount</SelectItem>
                          <SelectItem value="percent">Percent (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-note" className="text-sm">Admin Note</Label>
                    <Textarea id="admin-note" placeholder="Not visible to customer" rows={2} className="resize-none text-sm" />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">Items</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Show quantity as:</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                      <input type="radio" name="qty-type" className="mr-1" /> Qty
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                      <input type="radio" name="qty-type" className="mr-1" /> Hours
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                      <input type="radio" name="qty-type" className="mr-1" defaultChecked /> Qty/Hours
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="w-56 h-10">
                      <SelectValue placeholder="Add items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Item</SelectItem>
                      <SelectItem value="consulting">Consulting Service</SelectItem>
                      <SelectItem value="development">Development Service</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={addInvoiceItem} className="h-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-10 ml-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Get Totals
                  </Button>
                </div>

                {/* Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead className="w-32">Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24">Qty</TableHead>
                        <TableHead className="w-28">Rate</TableHead>
                        <TableHead className="w-32">Tax</TableHead>
                        <TableHead className="w-28 text-right">Amount</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                          <TableCell></TableCell>
                          <TableCell>
                            <Input
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Textarea
                              placeholder="Long description"
                              value={item.longDescription}
                              onChange={(e) => updateInvoiceItem(item.id, 'longDescription', e.target.value)}
                              className="min-h-[60px] resize-none text-sm"
                              rows={2}
                            />
                            <Button variant="link" size="sm" className="h-6 px-0 text-xs text-blue-600 mt-1">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              Link
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateInvoiceItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                              className="h-9 text-sm"
                              min="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="Rate"
                              value={item.rate}
                              onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="h-9 text-sm"
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Select value={item.tax} onValueChange={(val) => updateInvoiceItem(item.id, 'tax', val)}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="No Tax">No Tax</SelectItem>
                                <SelectItem value="GST 18%">GST 18%</SelectItem>
                                <SelectItem value="VAT 10%">VAT 10%</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">
                            ${item.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              {invoiceItems.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeInvoiceItem(item.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end pt-2">
                <div className="w-96 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Sub Total :</span>
                    <span className="font-semibold">${calculateTotals().subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-600 text-sm">Discount</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-24 h-9 text-sm"
                        min="0"
                        placeholder="0.00"
                      />
                      <Select value={discountType} onValueChange={setDiscountType}>
                        <SelectTrigger className="w-16 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="%">%</SelectItem>
                          <SelectItem value="$">$</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="font-semibold w-24 text-right text-sm">${calculateTotals().discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-600 text-sm">Adjustment</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={adjustment}
                        onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                        className="w-24 h-9 text-sm"
                        placeholder="0.00"
                      />
                      <span className="font-semibold w-24 text-right text-sm">${adjustment.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold pt-2 border-t">
                    <span>Total :</span>
                    <span>${calculateTotals().total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Client Note */}
              <div className="space-y-2 pt-4">
                <Label htmlFor="client-note" className="text-sm font-semibold">Client Note</Label>
                <Textarea 
                  id="client-note" 
                  placeholder="Notes visible to the customer..." 
                  rows={3} 
                  className="resize-none text-sm"
                />
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-sm font-semibold">Terms & Conditions</Label>
                <Textarea 
                  id="terms" 
                  placeholder="Payment terms, cancellation policy, etc..." 
                  rows={3} 
                  className="resize-none text-sm"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
              <Button variant="outline">Save as Draft</Button>
              <div className="relative inline-flex">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-r-none">
                  Save
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 rounded-l-none border-l border-white/20 px-2">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <Send className="h-4 w-4 mr-2" />
                      Save & Send
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      Save and Send Later
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Save & Record Payment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Batch Payments
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Batch Payments</DialogTitle>
              <DialogDescription>Process multiple payments at once</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-600">Batch payment processing functionality will be available here.</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Repeat className="h-4 w-4" />
              Recurring Invoices
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recurring Invoices</DialogTitle>
              <DialogDescription>Manage recurring invoice schedules</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-600">Recurring invoice management will be available here.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
            <SelectTrigger className="w-20 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => handleExport('excel')}>
            Export
          </Button>

          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64 h-9"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[130px]">
                  <div className="flex items-center gap-1">
                    Invoice #
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">Amount</TableHead>
                <TableHead className="w-[120px]">Total Tax</TableHead>
                <TableHead className="w-[130px]">Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-[130px]">Due Date</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice, index) => (
                <TableRow 
                  key={`${invoice.id}-${index}`} 
                  className="hover:bg-slate-50/50 group"
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-blue-600 hover:underline cursor-pointer font-medium">
                        {invoice.id}
                      </span>
                      {hoveredRow === index && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 animate-in fade-in duration-200">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="hover:underline" onClick={() => setSelectedInvoice(invoice)}>View</button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
                              <ScrollArea className="max-h-[95vh] pr-4">
                                <div className="p-10 bg-white">
                                  {/* Header with Logo and Invoice Title */}
                                  <div className="flex justify-between items-start mb-8">
                                    <div>
                                      <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-5xl font-black text-green-500">ZOLLID</span>
                                        <span className="text-xs align-super">®</span>
                                      </div>
                                      <p className="text-xs text-slate-700 font-semibold">ZOLLID BRANDING SOLUTIONS PVT. LTD.</p>
                                    </div>
                                    <div className="text-right">
                                      <h1 className="text-4xl font-black text-slate-900 mb-2">INVOICE</h1>
                                      <div className="flex items-center justify-end gap-2 mb-2">
                                        <span className="text-xs text-slate-600">Payment Status:</span>
                                        <Badge variant="destructive" className="bg-red-500 text-white hover:bg-red-500 font-bold">
                                          {invoice.status.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <p className="text-sm font-bold text-slate-700">{invoice.id}</p>
                                      <div className="mt-3 text-xs text-slate-600 space-y-1">
                                        <div><span className="font-semibold">Invoice Date:</span> {invoice.date}</div>
                                        <div><span className="font-semibold">Due Date:</span> {invoice.dueDate}</div>
                                        <div><span className="font-semibold">Sale Agent:</span> Finas Zollid</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Address Section */}
                                  <div className="grid grid-cols-2 gap-12 mb-8">
                                    <div>
                                      <h3 className="text-xs font-bold text-slate-500 mb-3">Office Address:</h3>
                                      <div className="text-sm text-slate-700 space-y-1">
                                        <div className="font-semibold">Office Address</div>
                                        <div>Main Street, Your Location</div>
                                        <div>Number 06/B</div>
                                      </div>
                                      <div className="mt-3 text-sm text-slate-700">
                                        <div className="font-semibold">GSTIN:</div>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-xs font-bold text-slate-500 mb-3">To:</h3>
                                      <div className="text-sm text-slate-700 space-y-1">
                                        <div className="font-semibold">{invoice.customer || 'Client Address'}</div>
                                        <div>Main Street, Your Location</div>
                                        <div>Number 06/B</div>
                                      </div>
                                      <div className="mt-3 text-sm text-slate-700">
                                        <div className="font-semibold">GSTIN:</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Items Table */}
                                  <div className="mb-8 border border-slate-200 rounded-lg overflow-hidden">
                                    <Table>
                                      <TableHeader className="bg-green-500">
                                        <TableRow className="hover:bg-green-500 border-none">
                                          <TableHead className="text-white font-bold w-8 text-center">#</TableHead>
                                          <TableHead className="text-white font-bold">Product & Descriptions</TableHead>
                                          <TableHead className="text-white font-bold text-center w-24">HSN</TableHead>
                                          <TableHead className="text-white font-bold text-center w-20">Qty.</TableHead>
                                          <TableHead className="text-white font-bold text-right w-28">Rate</TableHead>
                                          <TableHead className="text-white font-bold text-center w-24">Tax</TableHead>
                                          <TableHead className="text-white font-bold text-right w-32">Amount</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        <TableRow className="border-b border-slate-200">
                                          <TableCell className="text-center font-semibold">01</TableCell>
                                          <TableCell>
                                            <div className="font-semibold text-slate-900">Item Name</div>
                                            <div className="text-xs text-slate-600 mt-1">Lorem ipsum content</div>
                                          </TableCell>
                                          <TableCell className="text-center">9983</TableCell>
                                          <TableCell className="text-center">1</TableCell>
                                          <TableCell className="text-right">₹ 1000.00</TableCell>
                                          <TableCell className="text-center">18%</TableCell>
                                          <TableCell className="text-right font-semibold">₹ 1000.00</TableCell>
                                        </TableRow>
                                        <TableRow className="border-b border-slate-200">
                                          <TableCell className="text-center font-semibold">02</TableCell>
                                          <TableCell>
                                            <div className="font-semibold text-slate-900">Item Name</div>
                                            <div className="text-xs text-slate-600 mt-1">Lorem ipsum content</div>
                                          </TableCell>
                                          <TableCell className="text-center">9983</TableCell>
                                          <TableCell className="text-center">1</TableCell>
                                          <TableCell className="text-right">₹ 1000.00</TableCell>
                                          <TableCell className="text-center">18%</TableCell>
                                          <TableCell className="text-right font-semibold">₹ 1000.00</TableCell>
                                        </TableRow>
                                        <TableRow className="border-b border-slate-200">
                                          <TableCell className="text-center font-semibold">03</TableCell>
                                          <TableCell>
                                            <div className="font-semibold text-slate-900">Item Name</div>
                                            <div className="text-xs text-slate-600 mt-1">Lorem ipsum content</div>
                                          </TableCell>
                                          <TableCell className="text-center">9983</TableCell>
                                          <TableCell className="text-center">1</TableCell>
                                          <TableCell className="text-right">₹ 1000.00</TableCell>
                                          <TableCell className="text-center">18%</TableCell>
                                          <TableCell className="text-right font-semibold">₹ 1000.00</TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>

                                  {/* Signature and Totals Section */}
                                  <div className="grid grid-cols-2 gap-12 mb-8">
                                    <div>
                                      <h3 className="text-sm font-bold text-slate-900 mb-4">Authorised Signature</h3>
                                      <div className="h-24 border-b border-slate-300"></div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                        <span className="text-sm font-semibold text-slate-700">Sub Total</span>
                                        <span className="text-sm font-bold">₹ 3000.00</span>
                                      </div>
                                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                        <span className="text-sm font-semibold text-slate-700">CGST (9.00%)</span>
                                        <span className="text-sm font-bold">₹ 270.00</span>
                                      </div>
                                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                        <span className="text-sm font-semibold text-slate-700">SGST (9.00%)</span>
                                        <span className="text-sm font-bold">₹ 270.00</span>
                                      </div>
                                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                        <span className="text-sm font-semibold text-slate-700">Discount</span>
                                        <span className="text-sm font-bold">₹ 00.00</span>
                                      </div>
                                      <div className="flex justify-between items-center pt-2 pb-2 border-b-2 border-slate-400">
                                        <span className="text-base font-bold text-slate-900">Total</span>
                                        <span className="text-base font-black">₹ 3540.00</span>
                                      </div>
                                      <div className="flex justify-between items-center pt-2">
                                        <span className="text-base font-bold text-slate-900">Amount Due</span>
                                        <span className="text-base font-black">₹ 3540.00</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment Info and Terms */}
                                  <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-200">
                                    <div>
                                      <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Info</h3>
                                      <div className="flex gap-4">
                                        <div className="w-24 h-24 border-2 border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                                          {qrCodeDataUrl ? (
                                            <img src={qrCodeDataUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
                                          ) : (
                                            <div className="text-xs text-center text-slate-400">QR Code</div>
                                          )}
                                        </div>
                                        <div className="text-xs text-slate-600 space-y-1">
                                          <div><span className="font-semibold">Account Number:</span></div>
                                          <div><span className="font-semibold">Account Name:</span></div>
                                          <div><span className="font-semibold">Bank Details</span></div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Terms:</h3>
                                      <div className="text-xs text-slate-600 space-y-2">
                                        <div className="flex items-start gap-2">
                                          <span className="text-green-500 mt-0.5">✓</span>
                                          <span>Lorem ipsum dolor sit amet, adipiscing elit, sed do eiusmod</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                          <span className="text-green-500 mt-0.5">✓</span>
                                          <span>tempor incididunt ut labore et dolore!</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Footer Notes */}
                                  <div className="text-center pt-6 border-t border-slate-200">
                                    <p className="text-sm text-slate-600">Thank you for your business!</p>
                                    <p className="text-xs text-slate-500 mt-2">For any questions regarding this invoice, please contact us at info@yourcompany.com</p>
                                  </div>

                                  {/* PDF Actions */}
                                  <div className="flex justify-center gap-3 pt-6 border-t border-slate-200 mt-6">
                                    <Button 
                                      className="bg-green-600 hover:bg-green-700 gap-2"
                                      onClick={async () => {
                                        const pdfData: InvoiceData = {
                                          invoiceNumber: invoice.id,
                                          invoiceDate: invoice.date,
                                          dueDate: invoice.dueDate,
                                          status: invoice.status as 'paid' | 'unpaid' | 'partial' | 'overdue',
                                          saleAgent: 'Finas Zollid',
                                          company: {
                                            name: 'ZOLLID',
                                            tagline: 'ZOLLID BRANDING SOLUTIONS PVT. LTD.',
                                            address: 'Office Address',
                                            city: 'Main Street, Your Location\nNumber 06/B',
                                            email: 'info@yourcompany.com'
                                          },
                                          customer: {
                                            name: invoice.customer || 'Client Name',
                                            address: 'Client Address',
                                            city: 'Main Street, Your Location\nNumber 06/B'
                                          },
                                          items: [
                                            { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 },
                                            { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 },
                                            { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 }
                                          ],
                                          subTotal: 3000,
                                          cgstPercent: 9,
                                          cgstAmount: 270,
                                          sgstPercent: 9,
                                          sgstAmount: 270,
                                          discount: 0,
                                          discountType: '%',
                                          total: 3540,
                                          amountDue: 3540,
                                          paymentInfo: {
                                            accountNumber: '',
                                            accountName: '',
                                            bankName: 'Bank Details',
                                            upiId: 'payment@upi'
                                          },
                                          terms: [
                                            'Lorem ipsum dolor sit amet, adipiscing elit, sed do eiusmod',
                                            'tempor incididunt ut labore et dolore!'
                                          ],
                                          primaryColor: '#22c55e',
                                          currency: '₹'
                                        };
                                        await downloadSalesInvoicePDF(pdfData);
                                        toast({ title: "PDF Downloaded", description: `Invoice ${invoice.id} has been downloaded.` });
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                      Download PDF
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      className="gap-2"
                                      onClick={async () => {
                                        const pdfData: InvoiceData = {
                                          invoiceNumber: invoice.id,
                                          invoiceDate: invoice.date,
                                          dueDate: invoice.dueDate,
                                          status: invoice.status as 'paid' | 'unpaid' | 'partial' | 'overdue',
                                          saleAgent: 'Finas Zollid',
                                          company: {
                                            name: 'ZOLLID',
                                            tagline: 'ZOLLID BRANDING SOLUTIONS PVT. LTD.',
                                            address: 'Office Address',
                                            city: 'Main Street, Your Location\nNumber 06/B',
                                            email: 'info@yourcompany.com'
                                          },
                                          customer: {
                                            name: invoice.customer || 'Client Name',
                                            address: 'Client Address',
                                            city: 'Main Street, Your Location\nNumber 06/B'
                                          },
                                          items: [
                                            { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 },
                                            { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 },
                                            { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 }
                                          ],
                                          subTotal: 3000,
                                          cgstPercent: 9,
                                          cgstAmount: 270,
                                          sgstPercent: 9,
                                          sgstAmount: 270,
                                          discount: 0,
                                          discountType: '%',
                                          total: 3540,
                                          amountDue: 3540,
                                          paymentInfo: {
                                            accountNumber: '',
                                            accountName: '',
                                            bankName: 'Bank Details',
                                            upiId: 'payment@upi'
                                          },
                                          terms: [
                                            'Lorem ipsum dolor sit amet, adipiscing elit, sed do eiusmod',
                                            'tempor incididunt ut labore et dolore!'
                                          ],
                                          primaryColor: '#22c55e',
                                          currency: '₹'
                                        };
                                        await printSalesInvoicePDF(pdfData);
                                      }}
                                    >
                                      <Printer className="h-4 w-4" />
                                      Print Invoice
                                    </Button>
                                  </div>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                          <span className="text-slate-300">|</span>
                          <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
                            <DialogTrigger asChild>
                              <button className="hover:underline" onClick={() => { setSelectedInvoice(invoice); setIsEditMode(true); }}>Edit</button>
                            </DialogTrigger>
                            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-50 to-white">
                              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 shadow-lg">
                                <DialogHeader>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                                        <FileText className="h-6 w-6 text-white" />
                                      </div>
                                      <div>
                                        <DialogTitle className="text-2xl font-bold text-white">Edit Invoice</DialogTitle>
                                        <p className="text-blue-100 text-sm mt-1">{invoice.id}</p>
                                      </div>
                                    </div>
                                    <Badge className="bg-red-500 text-white hover:bg-red-500 px-4 py-1.5 text-sm font-semibold">
                                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                    </Badge>
                                  </div>
                                </DialogHeader>
                              </div>
                              
                              <div className="px-8 py-6 space-y-8">
                                {/* Customer & Invoice Information Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Customer & Invoice Information
                                  </h3>
                                  <div className="grid grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-5">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-customer" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                          <span className="text-red-500">*</span> Customer
                                        </Label>
                                        <Select defaultValue={invoice.customer}>
                                          <SelectTrigger id="edit-customer" className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="greeen-dot">Greeen Dot</SelectItem>
                                            <SelectItem value="jack">Jack</SelectItem>
                                            <SelectItem value="sarmad">Sarmad</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="edit-project" className="text-sm font-semibold text-slate-700">Project</Label>
                                        <Select>
                                          <SelectTrigger id="edit-project" className="h-11 border-slate-300 focus:border-blue-500">
                                            <SelectValue placeholder="Select project (optional)" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="proj-1">Project Alpha</SelectItem>
                                            <SelectItem value="proj-2">Project Beta</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-slate-700">Bill To Address</Label>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-blue-200 text-sm text-slate-700">
                                          <div className="font-semibold text-slate-900">123 Main St, Suite 456</div>
                                          <div className="mt-1">New York, NY 10001</div>
                                          <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-blue-600 hover:text-blue-700">
                                            <Edit className="h-3 w-3 mr-1" />
                                            Change Address
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-invoice-number" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                            <span className="text-red-500">*</span> Invoice #
                                          </Label>
                                          <div className="flex gap-2">
                                            <Input id="edit-invoice-number" defaultValue={invoice.id.split('-')[1]} className="h-11 border-slate-300 font-mono" />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-prefix" className="text-sm font-semibold text-slate-700">Prefix</Label>
                                          <Select defaultValue="inv">
                                            <SelectTrigger id="edit-prefix" className="h-11 border-slate-300">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="inv">INV-</SelectItem>
                                              <SelectItem value="bill">BILL-</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-5">
                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-slate-700">Ship To Address</Label>
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-slate-50 rounded-lg border border-green-200 text-sm text-slate-700">
                                          <div className="font-semibold text-slate-900">Same as billing address</div>
                                          <div className="mt-3 flex items-center gap-2">
                                            <input type="checkbox" id="different-shipping" className="rounded border-slate-300" />
                                            <label htmlFor="different-shipping" className="text-xs text-slate-600 cursor-pointer">
                                              Use different shipping address
                                            </label>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="edit-tags" className="text-sm font-semibold text-slate-700">Tags</Label>
                                        <Input id="edit-tags" placeholder="Add tags (comma separated)" className="h-11 border-slate-300" />
                                        <p className="text-xs text-slate-500 mt-1">Example: urgent, recurring, vip</p>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-invoice-date" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                            <span className="text-red-500">*</span> Invoice Date
                                          </Label>
                                          <Input id="edit-invoice-date" type="date" defaultValue={invoice.date} className="h-11 border-slate-300" />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-due-date" className="text-sm font-semibold text-slate-700">Due Date</Label>
                                          <Input id="edit-due-date" type="date" defaultValue={invoice.dueDate} className="h-11 border-slate-300" />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-currency" className="text-sm font-semibold text-slate-700">Currency</Label>
                                          <Select defaultValue="usd">
                                            <SelectTrigger id="edit-currency" className="h-11 border-slate-300">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="usd">USD ($)</SelectItem>
                                              <SelectItem value="eur">EUR (€)</SelectItem>
                                              <SelectItem value="inr">INR (₹)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-sale-agent" className="text-sm font-semibold text-slate-700">Sale Agent</Label>
                                          <Select defaultValue="agent1">
                                            <SelectTrigger id="edit-sale-agent" className="h-11 border-slate-300">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="agent1">Finas Zollid</SelectItem>
                                              <SelectItem value="agent2">John Doe</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Items Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                  <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                      <FileCheck className="h-5 w-5 text-blue-600" />
                                      Invoice Items
                                    </h3>
                                    <Button onClick={addInvoiceItem} size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Item
                                    </Button>
                                  </div>
                                  <div className="border rounded-xl overflow-hidden shadow-sm">
                                    <Table>
                                      <TableHeader className="bg-gradient-to-r from-blue-600 to-blue-700">
                                        <TableRow className="hover:from-blue-600 hover:to-blue-700">
                                          <TableHead className="w-8 text-white font-bold">#</TableHead>
                                          <TableHead className="w-48 text-white font-bold">Item</TableHead>
                                          <TableHead className="text-white font-bold">Description</TableHead>
                                          <TableHead className="w-24 text-white font-bold text-center">Qty</TableHead>
                                          <TableHead className="w-32 text-white font-bold text-right">Rate</TableHead>
                                          <TableHead className="w-32 text-white font-bold">Tax</TableHead>
                                          <TableHead className="w-32 text-white font-bold text-right">Amount</TableHead>
                                          <TableHead className="w-20 text-white font-bold"></TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {invoiceItems.map((item, idx) => (
                                          <TableRow key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                            <TableCell className="font-semibold text-slate-600">{idx + 1}</TableCell>
                                            <TableCell>
                                              <Input 
                                                value={item.description} 
                                                onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                                                className="h-10 text-sm border-slate-300" 
                                                placeholder="Item name"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <Textarea 
                                                value={item.longDescription}
                                                onChange={(e) => updateInvoiceItem(item.id, 'longDescription', e.target.value)}
                                                className="min-h-[70px] text-sm border-slate-300 resize-none" 
                                                rows={2}
                                                placeholder="Detailed description"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <Input 
                                                type="number" 
                                                value={item.qty}
                                                onChange={(e) => updateInvoiceItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                                className="h-10 text-sm text-center border-slate-300" 
                                                min="0"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <Input 
                                                type="number" 
                                                value={item.rate}
                                                onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                className="h-10 text-sm text-right border-slate-300 font-mono" 
                                                step="0.01"
                                                placeholder="0.00"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <Select value={item.tax} onValueChange={(val) => updateInvoiceItem(item.id, 'tax', val)}>
                                                <SelectTrigger className="h-10 text-sm border-slate-300">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="No Tax">No Tax (0%)</SelectItem>
                                                  <SelectItem value="GST 18%">GST 18%</SelectItem>
                                                  <SelectItem value="GST 9%">GST 9%</SelectItem>
                                                  <SelectItem value="VAT 10%">VAT 10%</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-slate-900 font-mono">
                                              ${item.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                              {invoiceItems.length > 1 && (
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => removeInvoiceItem(item.id)}
                                                  className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>

                                {/* Totals Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-slate-900 mb-4">Additional Information</h3>
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label className="text-sm font-semibold text-slate-700">Discount Type</Label>
                                          <div className="flex gap-3">
                                            <Select value={discountType} onValueChange={setDiscountType}>
                                              <SelectTrigger className="w-40 h-11 border-slate-300">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="%">Percentage (%)</SelectItem>
                                                <SelectItem value="$">Fixed Amount ($)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <Input 
                                              type="number" 
                                              value={discount}
                                              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                              className="w-32 h-11 border-slate-300 font-mono"
                                              placeholder="0.00"
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-semibold text-slate-700">Adjustment</Label>
                                          <Input 
                                            type="number" 
                                            value={adjustment}
                                            onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                                            className="w-48 h-11 border-slate-300 font-mono"
                                            placeholder="0.00"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-96 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-3 border-b border-slate-300">
                                          <span className="text-sm font-semibold text-slate-700">Sub Total:</span>
                                          <span className="font-bold text-slate-900 font-mono">${calculateTotals().subTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-slate-300">
                                          <span className="text-sm font-semibold text-slate-700">Discount:</span>
                                          <span className="font-bold text-red-600 font-mono">-${calculateTotals().discountAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-slate-300">
                                          <span className="text-sm font-semibold text-slate-700">Adjustment:</span>
                                          <span className="font-bold text-slate-900 font-mono">${adjustment.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-blue-600">
                                          <span className="text-lg font-bold text-slate-900">Total Amount:</span>
                                          <span className="text-2xl font-black text-blue-600 font-mono">${calculateTotals().total.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                  <h3 className="text-lg font-bold text-slate-900 mb-4">Notes & Terms</h3>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold text-slate-700">Client Note</Label>
                                      <Textarea 
                                        placeholder="Notes visible to the customer..." 
                                        className="min-h-[100px] border-slate-300 resize-none"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold text-slate-700">Terms & Conditions</Label>
                                      <Textarea 
                                        placeholder="Payment terms and conditions..." 
                                        className="min-h-[100px] border-slate-300 resize-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Footer Actions */}
                              <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200 px-8 py-5 flex justify-between items-center shadow-lg">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Clock className="h-4 w-4" />
                                  <span>Last modified: {new Date().toLocaleString()}</span>
                                </div>
                                <div className="flex gap-3">
                                  <Button variant="outline" onClick={() => setIsEditMode(false)} className="h-11 px-6 border-slate-300">
                                    <span>Cancel</span>
                                  </Button>
                                  <Button variant="outline" className="h-11 px-6 border-slate-300">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </Button>
                                  <div className="relative inline-flex shadow-lg">
                                    <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-r-none" onClick={() => setIsEditMode(false)}>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Save Changes
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 h-11 rounded-l-none border-l border-blue-500 px-3">
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-64">
                                        <DropdownMenuItem className="py-3 cursor-pointer">
                                          <Send className="h-4 w-4 mr-3 text-blue-600" />
                                          <div>
                                            <div className="font-semibold">Save & Send</div>
                                            <div className="text-xs text-slate-500">Send invoice via email</div>
                                          </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="py-3 cursor-pointer">
                                          <Mail className="h-4 w-4 mr-3 text-amber-600" />
                                          <div>
                                            <div className="font-semibold">Save and Send Later</div>
                                            <div className="text-xs text-slate-500">Schedule for later</div>
                                          </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="py-3 cursor-pointer">
                                          <CheckSquare className="h-4 w-4 mr-3 text-green-600" />
                                          <div>
                                            <div className="font-semibold">Save & Record Payment</div>
                                            <div className="text-xs text-slate-500">Mark as paid</div>
                                          </div>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{invoice.amount}</TableCell>
                  <TableCell className="text-slate-600">{invoice.totalTax}</TableCell>
                  <TableCell className="text-slate-600">{invoice.date}</TableCell>
                  <TableCell>
                    {invoice.customer && (
                      <span className="text-blue-600 hover:underline cursor-pointer">{invoice.customer}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">{invoice.project}</TableCell>
                  <TableCell className="text-slate-600">{invoice.tags}</TableCell>
                  <TableCell className="text-slate-600">{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 font-normal">
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
