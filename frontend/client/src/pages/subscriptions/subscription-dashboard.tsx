import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Users,
  XCircle,
  Clock,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { calculateDaysUntilExpiry, calculateSubscriptionStats, formatCurrency, getUrgencyLevel } from '@/lib/subscription-management-utils';
import type { Subscription, SubscriptionStats } from '@/lib/subscription-management-types';
import NotificationCenter from './notification-center';

// Mock data - replace with actual API calls
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
    email: 'john@techsolutions.com',
    phoneNumber: '+91 9876543210',
    whatsapp: '+91 9876543210',
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
    email: 'jane@digitalmarketing.com',
    phoneNumber: '+91 9876543211',
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
    email: 'info@abccorp.com',
  },
];

export default function SubscriptionDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [upcomingRenewals, setUpcomingRenewals] = useState<Subscription[]>([]);

  useEffect(() => {
    const calculatedStats = calculateSubscriptionStats(subscriptions);
    setStats(calculatedStats);

    const upcoming = subscriptions
      .filter((sub) => {
        const daysUntil = calculateDaysUntilExpiry(sub.expiryDate);
        return daysUntil >= 0 && daysUntil <= 30 && sub.status === 'Active';
      })
      .sort((a, b) => calculateDaysUntilExpiry(a.expiryDate) - calculateDaysUntilExpiry(b.expiryDate));

    setUpcomingRenewals(upcoming);
  }, [subscriptions]);

  const handleContact = (type: 'phone' | 'email' | 'whatsapp', contact?: string) => {
    if (!contact) return;
    
    switch (type) {
      case 'phone':
        window.location.href = `tel:${contact}`;
        break;
      case 'email':
        window.location.href = `mailto:${contact}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${contact.replace(/[^0-9]/g, '')}`, '_blank');
        break;
    }
  };

  const getUrgencyBadge = (daysUntil: number) => {
    const urgency = getUrgencyLevel(daysUntil);
    const variants: Record<string, string> = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline',
    };
    
    return (
      <Badge variant={variants[urgency] as any} className="ml-2">
        {daysUntil < 0 ? 'Expired' : `${daysUntil} days`}
      </Badge>
    );
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Monitor and manage all client subscriptions</p>
        </div>
        <Link to="/subscriptions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingRenewals}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewal Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalRenewalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Expected this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiredSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.cancelledSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Renewal</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRenewals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals - Next 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingRenewals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming renewals</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingRenewals.map((sub) => {
                  const daysUntil = calculateDaysUntilExpiry(sub.expiryDate);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sub.clientName}</div>
                          <div className="text-sm text-muted-foreground">{sub.companyName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{sub.serviceName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sub.subscriptionType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {new Date(sub.expiryDate).toLocaleDateString()}
                          {getUrgencyBadge(daysUntil)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(sub.amount)}</TableCell>
                      <TableCell>{sub.assignedManager}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.renewalProbability === 'High'
                              ? 'default'
                              : sub.renewalProbability === 'Medium'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {sub.renewalProbability || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {sub.phoneNumber && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleContact('phone', sub.phoneNumber)}
                              title="Call"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          {sub.whatsapp && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleContact('whatsapp', sub.whatsapp)}
                              title="WhatsApp"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          {sub.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleContact('email', sub.email)}
                              title="Email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <Link to={`/subscriptions/${sub.id}/renew`}>
                            <Button variant="default" size="sm">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Renew
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <NotificationCenter />
        </div>
        
        <Link to="/subscriptions/list">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">All Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View and manage all subscriptions</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/subscriptions/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Revenue, renewal & cancellation reports</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/subscriptions/reminders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Reminder Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure automated reminders</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/subscriptions/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add a new client subscription</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
