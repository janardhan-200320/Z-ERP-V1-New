import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Download, 
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

export default function BatchPaymentsTab() {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  // Mock data for pending invoices
  const pendingInvoices = [
    {
      id: 'INV-002',
      customer: 'TechStart Inc.',
      amount: '$85,000',
      dueDate: '2026-02-08',
      status: 'open'
    },
    {
      id: 'INV-003',
      customer: 'Global Brands Ltd.',
      amount: '$25,000',
      dueDate: '2026-01-25',
      status: 'overdue'
    },
    {
      id: 'INV-004',
      customer: 'Enterprise Solutions',
      amount: '$125,000',
      dueDate: '2026-02-12',
      status: 'unpaid'
    }
  ];

  // Mock import preview data
  const importPreview = [
    {
      row: 1,
      invoice: 'INV-002',
      customer: 'TechStart Inc.',
      amount: '$85,000',
      date: '2026-01-20',
      reference: 'TXN-123',
      status: 'valid',
      issues: []
    },
    {
      row: 2,
      invoice: 'INV-999',
      customer: 'Unknown Corp',
      amount: '$45,000',
      date: '2026-01-21',
      reference: 'TXN-124',
      status: 'error',
      issues: ['Invoice not found', 'Customer mismatch']
    },
    {
      row: 3,
      invoice: 'INV-004',
      customer: 'Enterprise Solutions',
      amount: '$125,000',
      date: '2026-01-22',
      reference: 'TXN-125',
      status: 'warning',
      issues: ['Amount exceeds invoice total']
    }
  ];

  const toggleInvoiceSelection = (id: string) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    valid: { label: 'Valid', class: 'bg-green-100 text-green-700 border-green-200' },
    warning: { label: 'Warning', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    error: { label: 'Error', class: 'bg-red-100 text-red-700 border-red-200' }
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Import Payments
            </CardTitle>
            <CardDescription>Upload a CSV or Excel file with payment data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900 mb-1">Upload payment file</p>
              <p className="text-xs text-slate-600 mb-3">CSV, Excel (.xlsx, .xls) up to 10MB</p>
              <Input type="file" className="hidden" id="batch-file" accept=".csv,.xlsx,.xls" />
              <label htmlFor="batch-file">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Process Import
            </Button>
            <Button variant="ghost" className="w-full text-sm">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              Bank Reconciliation
            </CardTitle>
            <CardDescription>Match bank statements with invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chase">Chase Bank - ****5678</SelectItem>
                  <SelectItem value="bofa">Bank of America - ****1234</SelectItem>
                  <SelectItem value="wells">Wells Fargo - ****9012</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="border rounded-lg p-4 space-y-2 bg-slate-50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Bank Statement Balance:</span>
                <span className="font-semibold">$255,000.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Recorded Payments:</span>
                <span className="font-semibold">$210,000.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Difference:</span>
                <span className="text-orange-700">$45,000.00</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Reconciliation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Payment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Bulk Payment Processing
          </CardTitle>
          <CardDescription>Select invoices to process payments in bulk</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{invoice.id}</TableCell>
                  <TableCell className="font-medium">{invoice.customer}</TableCell>
                  <TableCell className="font-semibold text-green-700">{invoice.amount}</TableCell>
                  <TableCell className="text-sm">{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      invoice.status === 'open' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {selectedInvoices.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedInvoices.length} invoices selected
                  </p>
                  <p className="text-xs text-slate-600">
                    Total: $235,000.00
                  </p>
                </div>
              </div>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Process {selectedInvoices.length} Payments
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            Import Preview
          </CardTitle>
          <CardDescription>Review imported payment data before processing</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importPreview.map((row) => (
                <TableRow key={row.row} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm">{row.row}</TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{row.invoice}</TableCell>
                  <TableCell className="text-sm">{row.customer}</TableCell>
                  <TableCell className="font-semibold text-green-700">{row.amount}</TableCell>
                  <TableCell className="text-sm">{row.date}</TableCell>
                  <TableCell className="font-mono text-xs">{row.reference}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[row.status].class}>
                      {statusConfig[row.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.issues.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {row.issues.map((issue, idx) => (
                          <span key={idx} className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {issue}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        No issues
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Valid: 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Warnings: 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Errors: 1</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Rules
              </Button>
              <Button disabled>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm & Process
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" />
            Matching Rules
          </CardTitle>
          <CardDescription>Configure automatic payment-to-invoice matching rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Match by Invoice Number</h3>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Active</Badge>
              </div>
              <p className="text-xs text-slate-600">Automatically match payments using invoice number in transaction reference</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Match by Amount</h3>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Active</Badge>
              </div>
              <p className="text-xs text-slate-600">Match payments to invoices with the exact same amount</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Match by Customer</h3>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Inactive</Badge>
              </div>
              <p className="text-xs text-slate-600">Match payments to customer's oldest outstanding invoice</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Fuzzy Match</h3>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Inactive</Badge>
              </div>
              <p className="text-xs text-slate-600">Use AI to match payments with similar customer names or references</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Configure Advanced Rules
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
