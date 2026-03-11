import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { calculateDaysUntilExpiry, formatCurrency, getSubscriptionStatusColor } from '@/lib/subscription-management-utils';
import type { Subscription } from '@/lib/subscription-management-types';

// Mock subscription data - Replace with actual API call
const mockSubscription: Subscription = {
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
  autoRenewal: true,
  paymentGateway: 'Razorpay',
};

interface Activity {
  id: string;
  type: 'created' | 'renewed' | 'reminder_sent' | 'payment' | 'status_change' | 'edited';
  description: string;
  timestamp: string;
  user: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'reminder_sent',
    description: 'Renewal reminder sent via Email and WhatsApp',
    timestamp: '2026-02-15T10:30:00',
    user: 'System',
  },
  {
    id: '2',
    type: 'edited',
    description: 'Subscription details updated',
    timestamp: '2026-02-10T14:20:00',
    user: 'Amit Kumar',
  },
  {
    id: '3',
    type: 'payment',
    description: 'Payment received - ₹50,000',
    timestamp: '2025-02-20T09:15:00',
    user: 'John Doe',
  },
  {
    id: '4',
    type: 'created',
    description: 'Subscription created',
    timestamp: '2025-02-20T09:00:00',
    user: 'Amit Kumar',
  },
];

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  method: string;
  transactionId: string;
}

const mockPayments: PaymentHistory[] = [
  {
    id: '1',
    date: '2025-02-20',
    amount: 50000,
    status: 'success',
    method: 'Razorpay',
    transactionId: 'TXN123456789',
  },
];

export default function SubscriptionDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // TODO: Fetch subscription details from API using params.id
    setSubscription(mockSubscription);
    setActivities(mockActivities);
    setPayments(mockPayments);
  }, [params.id]);

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

  const handleDelete = () => {
    console.log('Deleting subscription:', params.id);
    // TODO: Add API call to delete subscription
    setDeleteDialogOpen(false);
    setLocation('/subscriptions/list');
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'renewed':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'reminder_sent':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'status_change':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'edited':
        return <Edit className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!subscription) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const daysUntilExpiry = calculateDaysUntilExpiry(subscription.expiryDate);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation('/subscriptions/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{subscription.serviceName}</h1>
            <p className="text-muted-foreground">{subscription.companyName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/subscriptions/${subscription.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href={`/subscriptions/${subscription.id}/renew`}>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew
            </Button>
          </Link>
          <Link href={`/subscriptions/${subscription.id}/cancel`}>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Subscription
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {daysUntilExpiry >= 0 && daysUntilExpiry <= 30 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Renewal Due Soon</p>
              <p className="text-sm text-orange-700">
                This subscription expires in {daysUntilExpiry} days on{' '}
                {new Date(subscription.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link href={`/subscriptions/${subscription.id}/renew`}>
            <Button size="sm">Renew Now</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getSubscriptionStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Type</p>
                  <p className="font-medium">{subscription.subscriptionType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing Cycle</p>
                  <p className="font-medium">{subscription.billingCycle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(subscription.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">
                    {new Date(subscription.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auto Renewal</p>
                  <Badge variant={subscription.autoRenewal ? 'default' : 'secondary'}>
                    {subscription.autoRenewal ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renewal Probability</p>
                  <Badge
                    variant={
                      subscription.renewalProbability === 'High'
                        ? 'default'
                        : subscription.renewalProbability === 'Medium'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {subscription.renewalProbability || 'Unknown'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Reminder Timeline</p>
                <div className="flex flex-wrap gap-2">
                  {subscription.renewalReminderDays.map((days) => (
                    <Badge key={days} variant="outline">
                      {days} days before
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full bg-muted p-2">
                            {getActivityIcon(activity.type)}
                          </div>
                          {index < activities.length - 1 && (
                            <div className="w-px bg-border h-full mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()} • {activity.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.transactionId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === 'success'
                                  ? 'default'
                                  : payment.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium">{subscription.clientName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{subscription.companyName}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {subscription.email && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleContact('email', subscription.email)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {subscription.email}
                  </Button>
                )}

                {subscription.phoneNumber && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleContact('phone', subscription.phoneNumber)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {subscription.phoneNumber}
                  </Button>
                )}

                {subscription.whatsapp && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleContact('whatsapp', subscription.whatsapp)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Manager */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{subscription.assignedManager}</p>
                  <p className="text-sm text-muted-foreground">Account Manager</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Until Expiry</span>
                <span className="font-bold">{daysUntilExpiry >= 0 ? daysUntilExpiry : 'Expired'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="font-bold">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Gateway</span>
                <span className="font-medium">{subscription.paymentGateway || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription for {subscription.companyName}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
