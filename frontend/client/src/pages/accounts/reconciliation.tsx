import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function ReconciliationModule() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock data
  const bookTransactions = [
    { id: 'BK-001', date: '2026-01-14', description: 'Payment to TechSupply', amount: '-$12,500', reference: 'PO-458', matched: true },
    { id: 'BK-002', date: '2026-01-13', description: 'Receipt from Acme Corp', amount: '+$45,000', reference: 'INV-001', matched: true },
    { id: 'BK-003', date: '2026-01-12', description: 'Salary Payment', amount: '-$150,000', reference: 'PAY-JAN', matched: false },
    { id: 'BK-004', date: '2026-01-11', description: 'Receipt from GlobalTech', amount: '+$25,000', reference: 'INV-005', matched: false }
  ];

  const bankStatements = [
    { id: 'ST-001', date: '2026-01-14', description: 'ACH PAYMENT TECHSUPPLY', amount: '-$12,500', reference: 'ACH-789', matched: true },
    { id: 'ST-002', date: '2026-01-13', description: 'WIRE ACME CORPORATION', amount: '+$45,000', reference: 'WIRE-456', matched: true },
    { id: 'ST-003', date: '2026-01-10', description: 'BANK CHARGES', amount: '-$50', reference: 'FEE-123', matched: false },
    { id: 'ST-004', date: '2026-01-11', description: 'CHK DEP GLOBALTECH', amount: '+$25,000', reference: 'CHK-321', matched: false }
  ];

  const reconciliationProgress = 75;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Account</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chase">Chase Bank - ****5678</SelectItem>
                  <SelectItem value="bofa">Bank of America - ****1234</SelectItem>
                  <SelectItem value="wells">Wells Fargo - ****9012</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statement Period</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jan">January 2026</SelectItem>
                  <SelectItem value="dec">December 2025</SelectItem>
                  <SelectItem value="nov">November 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input type="date" defaultValue="2026-01-01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input type="date" defaultValue="2026-01-15" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Transactions
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Statement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Opening Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">$340,500</div>
            <p className="text-xs text-slate-600 mt-1">As of Jan 1, 2026</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Closing Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">$458,000</div>
            <p className="text-xs text-slate-600 mt-1">As of Jan 15, 2026</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Reconciliation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{reconciliationProgress}%</div>
            <Progress value={reconciliationProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Split View Workspace */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Book Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Book Transactions</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                {bookTransactions.length} entries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookTransactions.map((txn) => (
                  <TableRow key={txn.id} className={txn.matched ? 'bg-green-50' : 'hover:bg-slate-50'}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="text-sm">{txn.date}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-medium">{txn.description}</p>
                        <p className="text-xs text-slate-600">{txn.reference}</p>
                      </div>
                    </TableCell>
                    <TableCell className={`font-semibold ${txn.amount.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>
                      {txn.amount}
                    </TableCell>
                    <TableCell>
                      {txn.matched ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bank Statement Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Bank Statement</span>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                {bankStatements.length} entries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankStatements.map((stmt) => (
                  <TableRow key={stmt.id} className={stmt.matched ? 'bg-green-50' : 'hover:bg-slate-50'}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="text-sm">{stmt.date}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-medium">{stmt.description}</p>
                        <p className="text-xs text-slate-600">{stmt.reference}</p>
                      </div>
                    </TableCell>
                    <TableCell className={`font-semibold ${stmt.amount.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>
                      {stmt.amount}
                    </TableCell>
                    <TableCell>
                      {stmt.matched ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Matching Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                6 Matched
              </Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                2 Unmatched
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                0 Disputed
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Auto Match</Button>
              <Button variant="outline">Mark as Disputed</Button>
              <Button>Confirm Reconciliation</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
