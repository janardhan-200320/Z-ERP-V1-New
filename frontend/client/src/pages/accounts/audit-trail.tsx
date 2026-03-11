import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, Shield } from 'lucide-react';

export default function AuditTrailModule() {
  const [searchQuery, setSearchQuery] = useState('');

  const auditLogs = [
    {
      id: '1',
      timestamp: '2026-01-15 10:30:45',
      user: 'John Doe',
      module: 'Banking',
      action: 'Created',
      resource: 'Transaction TXN-001',
      oldValue: '-',
      newValue: 'Amount: $45,000',
      status: 'success',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2026-01-15 10:25:12',
      user: 'Jane Smith',
      module: 'Receivables',
      action: 'Updated',
      resource: 'Invoice INV-001',
      oldValue: 'Status: Draft',
      newValue: 'Status: Sent',
      status: 'success',
      ip: '192.168.1.101'
    },
    {
      id: '3',
      timestamp: '2026-01-15 10:20:33',
      user: 'Mike Johnson',
      module: 'Payables',
      action: 'Approved',
      resource: 'Bill BILL-001',
      oldValue: 'Approval: Pending',
      newValue: 'Approval: Approved',
      status: 'success',
      ip: '192.168.1.102'
    },
    {
      id: '4',
      timestamp: '2026-01-15 10:15:08',
      user: 'Sarah Wilson',
      module: 'Banking',
      action: 'Deleted',
      resource: 'Transaction TXN-099',
      oldValue: 'Amount: $500',
      newValue: '-',
      status: 'warning',
      ip: '192.168.1.103'
    },
    {
      id: '5',
      timestamp: '2026-01-15 10:10:22',
      user: 'Admin',
      module: 'Settings',
      action: 'Modified',
      resource: 'Exchange Rate USD-EUR',
      oldValue: 'Rate: 0.91',
      newValue: 'Rate: 0.92',
      status: 'success',
      ip: '192.168.1.1'
    }
  ];

  const statusConfig: Record<string, { label: string; class: string }> = {
    success: { label: 'Success', class: 'bg-green-100 text-green-700 border-green-200' },
    warning: { label: 'Warning', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    error: { label: 'Error', class: 'bg-red-100 text-red-700 border-red-200' }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Audit Trail Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="banking">Banking</SelectItem>
                  <SelectItem value="receivables">Receivables</SelectItem>
                  <SelectItem value="payables">Payables</SelectItem>
                  <SelectItem value="cash">Cash Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>User</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="jane">Jane Smith</SelectItem>
                  <SelectItem value="mike">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" defaultValue="2026-01-01" />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" defaultValue="2026-01-15" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Audit Log Entries</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Old Value</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                  <TableCell className="font-medium text-sm">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                      {log.module}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      log.action === 'Created' ? 'bg-green-100 text-green-700 border-green-200' :
                      log.action === 'Updated' || log.action === 'Modified' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      log.action === 'Approved' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{log.resource}</TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-32 truncate">
                    {log.oldValue}
                  </TableCell>
                  <TableCell className="text-xs text-slate-900 max-w-32 truncate font-medium">
                    {log.newValue}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[log.status].class}>
                      {statusConfig[log.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-slate-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-slate-600 mt-1">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Failed Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">8</div>
            <p className="text-xs text-red-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">2</div>
            <p className="text-xs text-orange-600 mt-1">Review required</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
