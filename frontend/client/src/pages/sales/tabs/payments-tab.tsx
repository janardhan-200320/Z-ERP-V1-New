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
import { 
  Plus, 
  Download, 
  Filter, 
  Search,
  Eye,
  Edit,
  Printer,
  CheckCircle,
  CreditCard,
  MoreVertical,
  Trash2,
  FileCheck,
  Building2,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  FileText
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
import { exportToExcel } from '@/lib/exportUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from "@/lib/utils";

export default function PaymentsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showReceiptView, setShowReceiptView] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const { toast } = useToast();

  // Mock data
  const [payments, setPayments] = useState([
    {
      id: 'PAY-001',
      invoice: 'INV-001',
      customer: 'Acme Corporation',
      amount: '$45,000',
      mode: 'Bank Transfer',
      transactionId: 'TXN-2026-001',
      date: '2026-01-10',
      status: 'completed'
    },
    {
      id: 'PAY-002',
      invoice: 'INV-005',
      customer: 'TechStart Inc.',
      amount: '$25,000',
      mode: 'Credit Card',
      transactionId: 'TXN-2026-002',
      date: '2026-01-12',
      status: 'completed'
    },
    {
      id: 'PAY-003',
      invoice: 'INV-007',
      customer: 'Global Brands Ltd.',
      amount: '$15,000',
      mode: 'PayPal',
      transactionId: 'TXN-2026-003',
      date: '2026-01-15',
      status: 'pending'
    },
    {
      id: 'PAY-004',
      invoice: 'INV-009',
      customer: 'Enterprise Solutions',
      amount: '$125,000',
      mode: 'Bank Transfer',
      transactionId: 'TXN-2026-004',
      date: '2026-01-18',
      status: 'completed'
    }
  ]);

  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      const matchesSearch = 
        pay.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pay.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pay.invoice.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || pay.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, payments]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({ title: "Exporting...", description: `Preparing payment records in ${type.toUpperCase()}.` });

    setTimeout(() => {
      if (type === 'excel') {
        exportToExcel(filteredPayments, `Payments_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        const doc = new jsPDF();
        doc.text("Payments Report", 14, 15);
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Invoice', 'Customer', 'Amount', 'Date', 'Status']],
          body: filteredPayments.map(p => [p.id, p.invoice, p.customer, p.amount, p.date, p.status]),
        });
        doc.save(`Payments_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      setIsExporting(false);
      toast({ title: "Export Ready", description: "Download started." });
    }, 1200);
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    completed: { label: 'Completed', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    failed: { label: 'Failed', class: 'bg-rose-100 text-rose-700 border-rose-200' }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl font-bold text-slate-900">Payments</CardTitle>
            <p className="text-sm text-slate-500">Record and track customer payments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white border-slate-200 focus:border-blue-400 transition-all"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 gap-2", statusFilter !== 'all' && "border-blue-500 bg-blue-50 text-blue-700")}>
                  <Filter className="h-4 w-4" />
                  {statusFilter === 'all' ? 'Status' : `Status: ${statusFilter}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Payments</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('failed')}>Failed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2" disabled={isExporting}>
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Export Formats</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="mr-2 h-4 w-4 text-rose-600" /> PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>Enter payment details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Payment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pay-number">Payment Number</Label>
                      <Input id="pay-number" placeholder="PAY-001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pay-date">Payment Date</Label>
                      <Input id="pay-date" type="date" />
                    </div>
                  </div>

                  {/* Invoice & Customer */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pay-invoice">Invoice</Label>
                      <Select>
                        <SelectTrigger id="pay-invoice">
                          <SelectValue placeholder="Select invoice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inv-001">INV-001 - $45,000</SelectItem>
                          <SelectItem value="inv-002">INV-002 - $85,000</SelectItem>
                          <SelectItem value="inv-003">INV-003 - $25,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pay-customer">Customer</Label>
                      <Input id="pay-customer" placeholder="Auto-filled from invoice" disabled />
                    </div>
                  </div>

                  {/* Amount & Mode */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pay-amount">Amount Paid</Label>
                      <Input id="pay-amount" type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pay-mode">Payment Mode</Label>
                      <Select>
                        <SelectTrigger id="pay-mode">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="card">Credit Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pay-txn">Transaction ID</Label>
                      <Input id="pay-txn" placeholder="TXN-2026-001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pay-ref">Reference Number</Label>
                      <Input id="pay-ref" placeholder="Optional" />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="pay-notes">Notes</Label>
                    <Textarea id="pay-notes" placeholder="Additional payment notes..." rows={3} />
                  </div>

                  {/* Invoice Amount Summary */}
                  <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Invoice Amount:</span>
                      <span className="font-semibold">$45,000.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Amount Paid:</span>
                      <span className="font-semibold text-green-700">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-2 border-t">
                      <span>Amount Due:</span>
                      <span className="text-red-700">$45,000.00</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-6">Payment #</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    No entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-900">{payment.id}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                          <button 
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowReceiptView(true);
                            }}
                          >
                            View
                          </button>
                          <span className="text-slate-300 mx-1">|</span>
                          <button 
                            className="text-red-600 hover:text-red-800 hover:underline"
                            onClick={() => {
                              setPayments(payments.filter(p => p.id !== payment.id));
                              toast({ title: "Deleted", description: "Payment record removed.", variant: "destructive" });
                            }}
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline">
                      {payment.invoice}
                    </TableCell>
                    <TableCell className="text-sm">{payment.mode}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{payment.transactionId}</TableCell>
                    <TableCell className="font-medium">{payment.customer}</TableCell>
                    <TableCell className="font-semibold text-green-700">{payment.amount}</TableCell>
                    <TableCell className="text-sm text-slate-600">{payment.date}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Footer */}
          {filteredPayments.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/30">
              <span className="text-sm text-slate-600">
                Showing 1 to {filteredPayments.length} of {filteredPayments.length} entries
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Receipt View Modal */}
      <Dialog open={showReceiptView} onOpenChange={setShowReceiptView}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment for Invoice {selectedPayment?.invoice || 'INV-000001'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left Column - Payment Details Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600">Amount Received</Label>
                <Input 
                  value={selectedPayment?.amount || '$45,000.00'} 
                  disabled 
                  className="bg-slate-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600">Payment Date</Label>
                <Input 
                  value={selectedPayment?.date || '2026-01-10'} 
                  disabled 
                  className="bg-slate-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600">Payment Mode</Label>
                <Input 
                  value={selectedPayment?.mode || 'Bank Transfer'} 
                  disabled 
                  className="bg-slate-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600">Payment Method</Label>
                <Input 
                  value="Primary Account" 
                  disabled 
                  className="bg-slate-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600">Transaction ID</Label>
                <Input 
                  value={selectedPayment?.transactionId || 'TXN-2026-001'} 
                  disabled 
                  className="bg-slate-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600">Note</Label>
                <Textarea 
                  value="Payment received in full." 
                  disabled 
                  rows={3}
                  className="bg-slate-50"
                />
              </div>
            </div>
            
            {/* Right Column - Payment Receipt Preview */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Payment Receipt</h3>
                <p className="text-sm text-slate-500">{selectedPayment?.id || 'PAY-001'}</p>
              </div>
              
              {/* Receipt Content */}
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-green-700">Payment Received</h4>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Receipt Number</p>
                    <p className="font-semibold">{selectedPayment?.id || 'PAY-001'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-semibold">{selectedPayment?.date || '2026-01-10'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Invoice</p>
                    <p className="font-semibold text-blue-600">{selectedPayment?.invoice || 'INV-001'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Transaction ID</p>
                    <p className="font-mono text-xs">{selectedPayment?.transactionId || 'TXN-2026-001'}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-slate-500 text-sm">Received From</p>
                  <p className="font-semibold">{selectedPayment?.customer || 'Acme Corporation'}</p>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-slate-500 text-sm">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">{selectedPayment?.mode || 'Bank Transfer'}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Amount Paid</span>
                    <span className="text-2xl font-bold text-green-700">{selectedPayment?.amount || '$45,000.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReceiptView(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

