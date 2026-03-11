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
  FileText,
  AlertCircle,
  MoreVertical,
  Trash2,
  FileCheck,
  Building2,
  Calendar,
  FileSpreadsheet,
  Undo2,
  ChevronDown,
  Send,
  Mail,
  CheckSquare
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

export default function CreditNotesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showNoteView, setShowNoteView] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const { toast } = useToast();

  // Mock data
  const [creditNotes, setCreditNotes] = useState([
    {
      id: 'CN-001',
      invoice: 'INV-001',
      client: 'Acme Corporation',
      amount: '-$5,000.00',
      remainingAmount: '$0.00',
      reference: 'REF-001',
      reason: 'Product Return',
      date: '2026-01-12',
      project: 'Web Development',
      status: 'issued'
    },
    {
      id: 'CN-002',
      invoice: 'INV-005',
      client: 'TechStart Inc.',
      amount: '-$2,500.00',
      remainingAmount: '$2,500.00',
      reference: 'REF-002',
      reason: 'Service Adjustment',
      date: '2026-01-14',
      project: 'Mobile App',
      status: 'applied'
    },
    {
      id: 'CN-003',
      invoice: 'INV-007',
      client: 'Global Brands Ltd.',
      amount: '-$1,200.00',
      remainingAmount: '$1,200.00',
      reference: 'REF-003',
      reason: 'Billing Error',
      date: '2026-01-16',
      project: 'Marketing',
      status: 'pending'
    },
    {
      id: 'CN-004',
      invoice: 'INV-009',
      client: 'Enterprise Solutions',
      amount: '-$15,000.00',
      remainingAmount: '$0.00',
      reference: 'REF-004',
      reason: 'Scope Change',
      date: '2026-01-18',
      project: 'ERP',
      status: 'applied'
    }
  ]);

  const filteredNotes = useMemo(() => {
    return creditNotes.filter(note => {
      const matchesSearch = 
        note.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.invoice.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, creditNotes]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({ title: "Exporting...", description: `Preparing credit note list in ${type.toUpperCase()}.` });

    setTimeout(() => {
      if (type === 'excel') {
        exportToCSV(filteredNotes, `CreditNotes_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const doc = new jsPDF();
        doc.text("Credit Notes Report", 14, 15);
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Invoice', 'Client', 'Amount', 'Reason', 'Status']],
          body: filteredNotes.map(n => [n.id, n.invoice, n.client, n.amount, n.reason, n.status]),
        });
        doc.save(`CreditNotes_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      setIsExporting(false);
      toast({ title: "Export Ready", description: "Download started." });
    }, 1200);
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    issued: { label: 'Issued', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    applied: { label: 'Applied', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    cancelled: { label: 'Cancelled', class: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  const reasonOptions = [
    'Product Return',
    'Service Adjustment',
    'Billing Error',
    'Discount Applied',
    'Scope Change',
    'Customer Refund',
    'Quality Issue',
    'Other'
  ];

  return (
    <>
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 px-6 py-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-bold text-slate-900 leading-none">Credit Notes</CardTitle>
          <p className="text-sm text-slate-500">Manage returns and adjustments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search credit notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white border-slate-200 focus:border-blue-400 transition-all shadow-sm"
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
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Notes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('issued')}>Issued</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('applied')}>Applied</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200" disabled={isExporting}>
                <Download className="h-4 w-4" />
                {isExporting ? '...' : 'Export'}
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
                New Credit Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Create New Credit Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label htmlFor="cn-customer">Customer</Label>
                  <Select>
                    <SelectTrigger id="cn-customer">
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acme">Acme Corporation</SelectItem>
                      <SelectItem value="techstart">TechStart Inc.</SelectItem>
                      <SelectItem value="global">Global Brands Ltd.</SelectItem>
                      <SelectItem value="enterprise">Enterprise Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bill To / Ship To */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">Bill To</Label>
                    <Textarea 
                      placeholder="Enter billing address..." 
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Ship To</Label>
                    <Textarea 
                      placeholder="Enter shipping address..." 
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Currency & Discount Type */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cn-currency">Currency</Label>
                    <Select>
                      <SelectTrigger id="cn-currency">
                        <SelectValue placeholder="USD - US Dollar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD - US Dollar</SelectItem>
                        <SelectItem value="eur">EUR - Euro</SelectItem>
                        <SelectItem value="gbp">GBP - British Pound</SelectItem>
                        <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cn-discount-type">Discount type</Label>
                    <Select>
                      <SelectTrigger id="cn-discount-type">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Credit Note Date, Number & Reference */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cn-date">Credit Note Date</Label>
                    <Input id="cn-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cn-number">Credit Note #</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                        CN-
                      </span>
                      <Input 
                        id="cn-number" 
                        placeholder="000001" 
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cn-reference">Reference #</Label>
                    <Input id="cn-reference" placeholder="Enter reference number" />
                  </div>
                </div>

                {/* Admin Note */}
                <div className="space-y-2">
                  <Label htmlFor="cn-admin-note">Admin Note</Label>
                  <Textarea 
                    id="cn-admin-note" 
                    placeholder="Internal admin notes (not visible to client)..." 
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* Items Table */}
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-[40%]">Item Description/Name</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-center">Rate</TableHead>
                          <TableHead className="text-center">Taxes</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Input placeholder="Enter item description" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" placeholder="1" className="text-center w-20" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" placeholder="0.00" className="text-center w-24" />
                          </TableCell>
                          <TableCell>
                            <Select>
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Tax" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Tax</SelectItem>
                                <SelectItem value="gst-5">GST 5%</SelectItem>
                                <SelectItem value="gst-12">GST 12%</SelectItem>
                                <SelectItem value="gst-18">GST 18%</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right font-semibold">$0.00</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Discount</span>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-32 h-8 text-right"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Adjustment</span>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-32 h-8 text-right"
                      />
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-slate-600">Sub Total</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-rose-700">$0.00</span>
                    </div>
                  </div>
                </div>

                {/* Client Note */}
                <div className="space-y-2">
                  <Label htmlFor="cn-client-note">Client Note</Label>
                  <Textarea 
                    id="cn-client-note" 
                    placeholder="Notes visible to the client..." 
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="cn-terms">Terms & Conditions</Label>
                  <Textarea 
                    id="cn-terms" 
                    placeholder="Enter terms and conditions..." 
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Send className="h-4 w-4 mr-2" />
                  Save & Send
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save
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
              <TableHead className="px-6">Credit Note #</TableHead>
              <TableHead>Credit Note Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Reference #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Remaining Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredNotes.map((note) => (
                <TableRow key={note.id} className="hover:bg-slate-50 transition-colors group">
                  <TableCell className="px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{note.id}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        <button 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => {
                            setSelectedNote(note);
                            setShowNoteView(true);
                          }}
                        >
                          View
                        </button>
                        <span className="text-slate-300 mx-1">|</span>
                        <button 
                          className="text-red-600 hover:text-red-800 hover:underline"
                          onClick={() => {
                            setCreditNotes(creditNotes.filter(n => n.id !== note.id));
                            toast({ title: "Deleted", description: "Credit note removed.", variant: "destructive" });
                          }}
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{note.date}</TableCell>
                  <TableCell className="font-medium text-slate-900">{note.client}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize font-medium shadow-sm", statusConfig[note.status].class)}>
                      {statusConfig[note.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{note.project}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-600">{note.reference}</TableCell>
                  <TableCell className="font-bold text-rose-600">{note.amount}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{note.remainingAmount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Footer */}
        {filteredNotes.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/30">
            <span className="text-sm text-slate-600">
              Showing 1 to {filteredNotes.length} of {filteredNotes.length} entries
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

    {/* Credit Note View Dialog */}
    <Dialog open={showNoteView} onOpenChange={setShowNoteView}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Credit Note Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left Column - Credit Note Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Credit Note #</Label>
                <p className="font-mono font-semibold">{selectedNote?.id || 'CN-001'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Date</Label>
                <p className="font-semibold">{selectedNote?.date || '2026-01-12'}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Customer</Label>
              <p className="font-semibold">{selectedNote?.client || 'Acme Corporation'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Project</Label>
                <p className="font-medium text-slate-700">{selectedNote?.project || 'Web Development'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Reference #</Label>
                <p className="font-mono text-sm">{selectedNote?.reference || 'REF-001'}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Reason</Label>
              <p className="text-sm text-slate-600">{selectedNote?.reason || 'Product Return'}</p>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Status</Label>
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize font-medium", 
                  selectedNote?.status ? statusConfig[selectedNote.status]?.class : statusConfig['issued'].class
                )}
              >
                {selectedNote?.status ? statusConfig[selectedNote.status]?.label : 'Issued'}
              </Badge>
            </div>
          </div>
          
          {/* Right Column - Amount Summary */}
          <div className="border rounded-lg p-6 bg-slate-50">
            <h3 className="text-lg font-bold text-center mb-4">Credit Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Credit Amount</span>
                <span className="font-bold text-rose-600 text-lg">{selectedNote?.amount || '-$5,000.00'}</span>
              </div>
              
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="text-slate-600">Applied Amount</span>
                <span className="font-semibold text-green-600">
                  {selectedNote?.remainingAmount === '$0.00' ? selectedNote?.amount : '$0.00'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Remaining Balance</span>
                <span className="font-semibold">{selectedNote?.remainingAmount || '$5,000.00'}</span>
              </div>
            </div>
            
            {selectedNote?.status === 'issued' && (
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 text-center">
                  This credit note is available to be applied to future invoices
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowNoteView(false)}>
            Close
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {selectedNote?.status === 'issued' && (
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Undo2 className="h-4 w-4 mr-2" />
              Apply Credit
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

