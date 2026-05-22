import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Trash2, RefreshCw, Eye } from 'lucide-react';
import { calculateDaysUntilExpiry, formatCurrency, getSubscriptionStatusColor } from '@/lib/subscription-management-utils';
import type { Subscription, SubscriptionStatus } from '@/lib/subscription-management-types';

// Mock data
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    clientName: 'John Doe',
    companyName: 'Tech Solutions Inc',
    serviceName: 'CRM Software',
    subscriptionType: 'SaaS Subscription',
    startDate: '2025-02-20',
    expiryDate: '2026-03-15',
    billingCycle: 'Yearly',
    amount: 50000,
    renewalReminderDays: [30, 15, 7, 1],
    assignedManager: 'Amit Kumar',
    status: 'Active',
    renewalProbability: 'High',
    createdAt: '2025-02-20',
    updatedAt: '2025-02-20',
  },
  {
    id: '2',
    clientName: 'Jane Smith',
    companyName: 'Digital Marketing Co',
    serviceName: 'Social Media Management',
    subscriptionType: 'Social Media Management',
    startDate: '2026-01-01',
    expiryDate: '2026-02-28',
    billingCycle: 'Monthly',
    amount: 15000,
    renewalReminderDays: [7, 3, 1],
    assignedManager: 'Priya Singh',
    status: 'Active',
    renewalProbability: 'High',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: '3',
    clientName: 'ABC Corp',
    companyName: 'ABC Corporation',
    serviceName: 'Website Hosting',
    subscriptionType: 'Website Hosting',
    startDate: '2025-03-01',
    expiryDate: '2026-02-15',
    billingCycle: 'Yearly',
    amount: 25000,
    renewalReminderDays: [30, 15, 7, 1],
    assignedManager: 'Rahul Verma',
    status: 'Expired',
    createdAt: '2025-03-01',
    updatedAt: '2026-02-15',
  },
];

export default function SubscriptionList() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      console.log('Deleting subscription:', id);
      // TODO: Add API call
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Subscriptions</h1>
          <p className="text-muted-foreground">Manage all client subscriptions</p>
        </div>
        <Link to="/subscriptions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client, company, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Pending Renewal">Pending Renewal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Subscriptions ({filteredSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sub.clientName}</div>
                        <div className="text-sm text-muted-foreground">{sub.companyName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{sub.serviceName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {sub.subscriptionType}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sub.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        {new Date(sub.expiryDate).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {calculateDaysUntilExpiry(sub.expiryDate) >= 0
                            ? `${calculateDaysUntilExpiry(sub.expiryDate)} days left`
                            : 'Expired'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(sub.amount)}</TableCell>
                    <TableCell>{sub.assignedManager}</TableCell>
                    <TableCell>
                      <Badge className={getSubscriptionStatusColor(sub.status)}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/subscriptions/${sub.id}`} className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/subscriptions/${sub.id}/edit`} className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/subscriptions/${sub.id}/renew`} className="cursor-pointer">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Renew
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(sub.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
