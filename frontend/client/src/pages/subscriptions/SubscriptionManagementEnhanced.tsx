import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, DollarSign, TrendingUp, Users, AlertCircle, Plus,
  Search, Filter, Calendar, CheckCircle, XCircle, Clock, Send, 
  FileText, Bell, Download, Eye, Edit, Phone, Mail, MessageSquare,
  Ban, TrendingDown, Activity, BarChart3, Zap
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Subscription,
  SubscriptionFormData,
  SubscriptionMetrics,
  RenewalClient,
  SUBSCRIPTION_TYPE_LABELS,
  BILLING_CYCLE_LABELS,
  STATUS_LABELS,
  DEFAULT_REMINDER_DAYS,
} from "@/lib/subscription-types";
import {
  fetchSubscriptions,
  fetchSubscriptionMetrics,
  fetchUpcomingRenewals,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  calculateDaysUntilExpiry,
  getSubscriptionStatusColor,
  getRenewalProbabilityColor,
  sendRenewalReminder,
  generateSubscriptionReport,
} from "@/lib/subscription-utils";

export default function SubscriptionManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [upcomingRenewals, setUpcomingRenewals] = useState<RenewalClient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  
  // Form data
  const [formData, setFormData] = useState<SubscriptionFormData>({
    client_name: "",
    company_name: "",
    service_name: "",
    subscription_type: "saas_subscription",
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: "",
    billing_cycle: "monthly",
    subscription_amount: 0,
    renewal_reminder_days: DEFAULT_REMINDER_DAYS,
    assigned_manager_id: "",
    status: "active",
    auto_renew: false,
    auto_suspend: true,
    client_email: "",
    client_phone: "",
    client_whatsapp: "",
    notes: "",
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subs, metricsData, renewals] = await Promise.all([
        fetchSubscriptions(),
        fetchSubscriptionMetrics(),
        fetchUpcomingRenewals(),
      ]);
      
      setSubscriptions(subs);
      setMetrics(metricsData);
      setUpcomingRenewals(renewals);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      await createSubscription(formData);
      toast({
        title: "Success",
        description: "Subscription created successfully",
      });
      setCreateModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedSubscription) return;
    
    try {
      await updateSubscription(selectedSubscription.id, formData);
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
      setEditModalOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;
    
    try {
      await cancelSubscription(selectedSubscription.id, cancelReason);
      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
      });
      setCancelModalOpen(false);
      setCancelReason("");
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const handleRenewSubscription = async () => {
    if (!selectedSubscription || !renewalDate) return;
    
    try {
      await renewSubscription(
        selectedSubscription.id,
        renewalDate,
        selectedSubscription.subscription_amount
      );
      toast({
        title: "Success",
        description: "Subscription renewed successfully",
      });
      setRenewModalOpen(false);
      setRenewalDate("");
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to renew subscription",
        variant: "destructive",
      });
    }
  };

  const handleContactClient = async (
    subscription: Subscription,
    method: 'phone' | 'email' | 'whatsapp'
  ) => {
    toast({
      title: "Contact Initiated",
      description: `Opening ${method} to contact ${subscription.client_name}`,
    });
    
    // Implement actual contact logic here
    switch (method) {
      case 'phone':
        if (subscription.client_phone) {
          window.location.href = `tel:${subscription.client_phone}`;
        }
        break;
      case 'email':
        if (subscription.client_email) {
          window.location.href = `mailto:${subscription.client_email}`;
        }
        break;
      case 'whatsapp':
        if (subscription.client_whatsapp) {
          window.open(`https://wa.me/${subscription.client_whatsapp}`, '_blank');
        }
        break;
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: "",
      company_name: "",
      service_name: "",
      subscription_type: "saas_subscription",
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: "",
      billing_cycle: "monthly",
      subscription_amount: 0,
      renewal_reminder_days: DEFAULT_REMINDER_DAYS,
      assigned_manager_id: "",
      status: "active",
      auto_renew: false,
      auto_suspend: true,
      client_email: "",
      client_phone: "",
      client_whatsapp: "",
      notes: "",
    });
  };

  const openEditModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      client_name: subscription.client_name,
      company_name: subscription.company_name,
      service_name: subscription.service_name,
      subscription_type: subscription.subscription_type,
      start_date: subscription.start_date,
      expiry_date: subscription.expiry_date,
      billing_cycle: subscription.billing_cycle,
      subscription_amount: subscription.subscription_amount,
      renewal_reminder_days: subscription.renewal_reminder_days,
      assigned_manager_id: subscription.assigned_manager_id,
      status: subscription.status,
      auto_renew: subscription.auto_renew,
      auto_suspend: subscription.auto_suspend,
      client_email: subscription.client_email,
      client_phone: subscription.client_phone,
      client_whatsapp: subscription.client_whatsapp,
      notes: subscription.notes,
    });
    setEditModalOpen(true);
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage client subscriptions, renewals, and automated reminders
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setReportModalOpen(true)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Subscription
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {metrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.total_subscriptions}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.active_subscriptions}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Renewals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.upcoming_renewals}
                    </p>
                  </div>
                  <Bell className="w-10 h-10 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expired Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.expired_subscriptions}
                    </p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.cancelled_subscriptions}
                    </p>
                  </div>
                  <XCircle className="w-10 h-10 text-gray-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Renewal Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${metrics.total_renewal_revenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="all">All Subscriptions</TabsTrigger>
            <TabsTrigger value="renewals">Upcoming Renewals</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* All Subscriptions Tab */}
          <TabsContent value="all" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Subscriptions</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search subscriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredSubscriptions.map((subscription) => {
                    const daysUntilExpiry = calculateDaysUntilExpiry(subscription.expiry_date);
                    const isUrgent = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                    
                    return (
                      <Card
                        key={subscription.id}
                        className={`cursor-pointer hover:shadow-lg transition-all ${
                          isUrgent ? 'border-amber-500 border-2' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {subscription.client_name}
                                </h3>
                                <Badge className={getSubscriptionStatusColor(subscription.status)}>
                                  {STATUS_LABELS[subscription.status]}
                                </Badge>
                                {subscription.auto_renew && (
                                  <Badge variant="outline" className="text-xs">
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Auto-renew
                                  </Badge>
                                )}
                                {isUrgent && (
                                  <Badge className="bg-amber-500">
                                    <Bell className="w-3 h-3 mr-1" />
                                    Expiring Soon
                                  </Badge>
                                )}
                                {subscription.renewal_probability && (
                                  <Badge className={getRenewalProbabilityColor(subscription.renewal_probability)}>
                                    {subscription.renewal_probability.toUpperCase()} Renewal Chance
                                  </Badge>
                                )}
                              </div>
                              <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Company:</span> {subscription.company_name}
                                </div>
                                <div>
                                  <span className="font-medium">Service:</span> {subscription.service_name}
                                </div>
                                <div>
                                  <span className="font-medium">Type:</span>{' '}
                                  {SUBSCRIPTION_TYPE_LABELS[subscription.subscription_type]}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-indigo-600">
                                ${subscription.subscription_amount}
                              </p>
                              <p className="text-sm text-gray-500">
                                {BILLING_CYCLE_LABELS[subscription.billing_cycle]}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Start: {new Date(subscription.start_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>Expiry: {new Date(subscription.expiry_date).toLocaleDateString()}</span>
                                </div>
                                {subscription.status === 'active' && (
                                  <div className={`flex items-center gap-1 font-semibold ${
                                    daysUntilExpiry <= 7 ? 'text-red-600' : 'text-gray-700'
                                  }`}>
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{daysUntilExpiry} days left</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContactClient(subscription, 'phone')}
                                  disabled={!subscription.client_phone}
                                >
                                  <Phone className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContactClient(subscription, 'email')}
                                  disabled={!subscription.client_email}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContactClient(subscription, 'whatsapp')}
                                  disabled={!subscription.client_whatsapp}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(subscription)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                {subscription.status === 'active' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSubscription(subscription);
                                      setRenewModalOpen(true);
                                    }}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-1" />
                                    Renew
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Renewals Tab */}
          <TabsContent value="renewals" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  Upcoming Renewals (Next 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingRenewals.map((renewal) => {
                    const isUrgent = renewal.days_until_expiry <= 7;
                    
                    return (
                      <Card
                        key={renewal.subscription_id}
                        className={isUrgent ? 'border-red-500 border-2' : 'border-amber-200 border'}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${
                                isUrgent ? 'bg-red-100' : 'bg-amber-100'
                              }`}>
                                <span className={`text-2xl font-bold ${
                                  isUrgent ? 'text-red-600' : 'text-amber-600'
                                }`}>
                                  {renewal.days_until_expiry}
                                </span>
                                <span className={`text-xs ${
                                  isUrgent ? 'text-red-600' : 'text-amber-600'
                                }`}>
                                  days
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 text-lg">
                                    {renewal.client_name}
                                  </h3>
                                  {isUrgent && (
                                    <Badge className="bg-red-500">
                                      <Zap className="w-3 h-3 mr-1" />
                                      URGENT
                                    </Badge>
                                  )}
                                  {renewal.renewal_probability && (
                                    <Badge className={getRenewalProbabilityColor(renewal.renewal_probability)}>
                                      {renewal.renewal_probability.toUpperCase()} Chance
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{renewal.company_name}</p>
                                <p className="text-sm text-gray-500">{renewal.service_name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Assigned to: {renewal.assigned_staff}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-indigo-600">
                                ${renewal.amount}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Expires: {new Date(renewal.expiry_date).toLocaleDateString()}
                              </p>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline" className="text-green-600">
                                  <Phone className="w-4 h-4 mr-1" />
                                  Call
                                </Button>
                                <Button size="sm" variant="outline" className="text-blue-600">
                                  <Mail className="w-4 h-4 mr-1" />
                                  Email
                                </Button>
                                <Button size="sm" variant="outline" className="text-green-600">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  WhatsApp
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isUrgent ? 'bg-red-500' : 'bg-amber-500'
                                }`}
                                style={{ 
                                  width: `${Math.max(5, 100 - (renewal.days_until_expiry * 3.33))}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {upcomingRenewals.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900">No Upcoming Renewals</h3>
                      <p className="text-gray-500 mt-2">All subscriptions are good for the next 30 days</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active">
            <SubscriptionListView
              subscriptions={filteredSubscriptions.filter(s => s.status === 'active')}
              title="Active Subscriptions"
              onView={(sub) => {
                setSelectedSubscription(sub);
                setViewModalOpen(true);
              }}
              onEdit={openEditModal}
              onContact={handleContactClient}
            />
          </TabsContent>

          {/* Expired Tab */}
          <TabsContent value="expired">
            <SubscriptionListView
              subscriptions={filteredSubscriptions.filter(s => s.status === 'expired')}
              title="Expired Subscriptions"
              onView={(sub) => {
                setSelectedSubscription(sub);
                setViewModalOpen(true);
              }}
              onEdit={openEditModal}
              onContact={handleContactClient}
            />
          </TabsContent>

          {/* Cancelled Tab */}
          <TabsContent value="cancelled">
            <SubscriptionListView
              subscriptions={filteredSubscriptions.filter(s => s.status === 'cancelled')}
              title="Cancelled Subscriptions"
              onView={(sub) => {
                setSelectedSubscription(sub);
                setViewModalOpen(true);
              }}
              onEdit={openEditModal}
              onContact={handleContactClient}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {metrics && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Revenue Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Monthly Recurring Revenue</span>
                          <span className="text-2xl font-bold text-gray-900">
                            ${metrics.monthly_recurring_revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Annual Recurring Revenue</span>
                          <span className="text-2xl font-bold text-gray-900">
                            ${metrics.yearly_recurring_revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Growth Rate</span>
                          <span className="text-2xl font-bold text-green-600">
                            +{metrics.growth_rate}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Churn Rate</span>
                          <span className="text-2xl font-bold text-red-600">
                            {metrics.churn_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Renewal Rate</span>
                          <span className="text-2xl font-bold text-green-600">
                            {(100 - metrics.churn_rate).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Active Rate</span>
                          <span className="text-2xl font-bold text-indigo-600">
                            {((metrics.active_subscriptions / metrics.total_subscriptions) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
                  <CardHeader>
                    <CardTitle>Subscription Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(
                        subscriptions.reduce((acc, sub) => {
                          const type = SUBSCRIPTION_TYPE_LABELS[sub.subscription_type];
                          acc[type] = (acc[type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => {
                        const percentage = (count / subscriptions.length) * 100;
                        return (
                          <div key={type}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">{type}</span>
                              <span className="font-semibold">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Subscription Modal */}
        <SubscriptionFormModal
          open={createModalOpen || editModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setEditModalOpen(false);
            resetForm();
          }}
          title={editModalOpen ? "Edit Subscription" : "Create New Subscription"}
          formData={formData}
          onChange={setFormData}
          onSubmit={editModalOpen ? handleUpdateSubscription : handleCreateSubscription}
        />

        {/* View Subscription Modal */}
        {selectedSubscription && (
          <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Subscription Details</DialogTitle>
              </DialogHeader>
              <SubscriptionDetailsView subscription={selectedSubscription} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewModalOpen(false);
                    openEditModal(selectedSubscription);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {selectedSubscription.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600"
                      onClick={() => {
                        setViewModalOpen(false);
                        setCancelModalOpen(true);
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setViewModalOpen(false);
                        setRenewModalOpen(true);
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renew Now
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Cancel Subscription Modal */}
        {selectedSubscription && (
          <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Subscription</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel the subscription for {selectedSubscription.client_name}?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cancellation Reason</Label>
                  <Textarea
                    placeholder="Please provide a reason for cancellation..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
                  No, Keep It
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={!cancelReason.trim()}
                >
                  Yes, Cancel Subscription
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Renew Subscription Modal */}
        {selectedSubscription && (
          <Dialog open={renewModalOpen} onOpenChange={setRenewModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Renew Subscription</DialogTitle>
                <DialogDescription>
                  Renew subscription for {selectedSubscription.client_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>New Expiry Date</Label>
                  <Input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600">Amount to Charge:</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    ${selectedSubscription.subscription_amount}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRenewModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleRenewSubscription}
                  disabled={!renewalDate}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Confirm Renewal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

// Supporting Components

interface SubscriptionListViewProps {
  subscriptions: Subscription[];
  title: string;
  onView: (sub: Subscription) => void;
  onEdit: (sub: Subscription) => void;
  onContact: (sub: Subscription, method: 'phone' | 'email' | 'whatsapp') => void;
}

function SubscriptionListView({ 
  subscriptions, 
  title, 
  onView, 
  onEdit, 
  onContact 
}: SubscriptionListViewProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Subscriptions Found</h3>
            <p className="text-gray-500 mt-2">There are no subscriptions in this category</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Expiry</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-gray-900">{sub.client_name}</p>
                        <p className="text-sm text-gray-500">{sub.company_name}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{sub.service_name}</td>
                    <td className="p-3 text-sm text-gray-700">
                      {SUBSCRIPTION_TYPE_LABELS[sub.subscription_type]}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-gray-900">${sub.subscription_amount}</p>
                      <p className="text-xs text-gray-500">
                        {BILLING_CYCLE_LABELS[sub.billing_cycle]}
                      </p>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {new Date(sub.expiry_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Badge className={getSubscriptionStatusColor(sub.status)}>
                        {STATUS_LABELS[sub.status]}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onContact(sub, 'phone')}
                          disabled={!sub.client_phone}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onContact(sub, 'email')}
                          disabled={!sub.client_email}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onView(sub)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(sub)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SubscriptionFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  formData: SubscriptionFormData;
  onChange: (data: SubscriptionFormData) => void;
  onSubmit: () => void;
}

function SubscriptionFormModal({
  open,
  onClose,
  title,
  formData,
  onChange,
  onSubmit,
}: SubscriptionFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Client Name *</Label>
              <Input
                value={formData.client_name}
                onChange={(e) => onChange({ ...formData, client_name: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label>Company Name *</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => onChange({ ...formData, company_name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Service Name *</Label>
              <Input
                value={formData.service_name}
                onChange={(e) => onChange({ ...formData, service_name: e.target.value })}
                placeholder="e.g., CRM Software, Website Hosting"
              />
            </div>
            <div>
              <Label>Subscription Type *</Label>
              <Select
                value={formData.subscription_type}
                onValueChange={(value: any) => 
                  onChange({ ...formData, subscription_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUBSCRIPTION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => onChange({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Expiry Date *</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => onChange({ ...formData, expiry_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Billing Cycle *</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value: any) => 
                  onChange({ ...formData, billing_cycle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BILLING_CYCLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Subscription Amount *</Label>
              <Input
                type="number"
                value={formData.subscription_amount}
                onChange={(e) => 
                  onChange({ ...formData, subscription_amount: parseFloat(e.target.value) })
                }
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Assigned Manager</Label>
              <Input
                value={formData.assigned_manager_id}
                onChange={(e) => 
                  onChange({ ...formData, assigned_manager_id: e.target.value })
                }
                placeholder="Manager ID or email"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Client Email</Label>
              <Input
                type="email"
                value={formData.client_email}
                onChange={(e) => onChange({ ...formData, client_email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label>Client Phone</Label>
              <Input
                type="tel"
                value={formData.client_phone}
                onChange={(e) => onChange({ ...formData, client_phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input
                type="tel"
                value={formData.client_whatsapp}
                onChange={(e) => onChange({ ...formData, client_whatsapp: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => onChange({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-renew"
                checked={formData.auto_renew}
                onCheckedChange={(checked) => 
                  onChange({ ...formData, auto_renew: checked as boolean })
                }
              />
              <Label htmlFor="auto-renew" className="cursor-pointer">
                Enable Auto-Renewal
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-suspend"
                checked={formData.auto_suspend}
                onCheckedChange={(checked) => 
                  onChange({ ...formData, auto_suspend: checked as boolean })
                }
              />
              <Label htmlFor="auto-suspend" className="cursor-pointer">
                Auto-Suspend on Expiry
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="bg-indigo-600 hover:bg-indigo-700">
            {title.includes('Edit') ? 'Update' : 'Create'} Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionDetailsView({ subscription }: { subscription: Subscription }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-500">Client Name</Label>
          <p className="font-semibold text-lg">{subscription.client_name}</p>
        </div>
        <div>
          <Label className="text-gray-500">Company Name</Label>
          <p className="font-semibold text-lg">{subscription.company_name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-500">Service Name</Label>
          <p className="font-semibold">{subscription.service_name}</p>
        </div>
        <div>
          <Label className="text-gray-500">Subscription Type</Label>
          <p className="font-semibold">
            {SUBSCRIPTION_TYPE_LABELS[subscription.subscription_type]}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-gray-500">Amount</Label>
          <p className="font-semibold text-2xl text-indigo-600">
            ${subscription.subscription_amount}
          </p>
          <p className="text-sm text-gray-500">
            {BILLING_CYCLE_LABELS[subscription.billing_cycle]}
          </p>
        </div>
        <div>
          <Label className="text-gray-500">Status</Label>
          <div className="mt-1">
            <Badge className={getSubscriptionStatusColor(subscription.status)}>
              {STATUS_LABELS[subscription.status]}
            </Badge>
          </div>
        </div>
        <div>
          <Label className="text-gray-500">Auto-Renew</Label>
          <p className="font-semibold mt-1">
            {subscription.auto_renew ? (
              <span className="text-green-600">Enabled</span>
            ) : (
              <span className="text-gray-600">Disabled</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-500">Start Date</Label>
          <p className="font-semibold">
            {new Date(subscription.start_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <Label className="text-gray-500">Expiry Date</Label>
          <p className="font-semibold">
            {new Date(subscription.expiry_date).toLocaleDateString()}
          </p>
          {subscription.status === 'active' && (
            <p className="text-sm text-gray-500 mt-1">
              {calculateDaysUntilExpiry(subscription.expiry_date)} days remaining
            </p>
          )}
        </div>
      </div>

      {(subscription.client_email || subscription.client_phone || subscription.client_whatsapp) && (
        <div>
          <Label className="text-gray-500">Contact Information</Label>
          <div className="mt-2 space-y-2">
            {subscription.client_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{subscription.client_email}</span>
              </div>
            )}
            {subscription.client_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{subscription.client_phone}</span>
              </div>
            )}
            {subscription.client_whatsapp && (
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span>{subscription.client_whatsapp}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {subscription.notes && (
        <div>
          <Label className="text-gray-500">Notes</Label>
          <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{subscription.notes}</p>
        </div>
      )}

      {subscription.cancellation_reason && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <Label className="text-red-700">Cancellation Reason</Label>
          <p className="mt-1 text-sm text-red-900">{subscription.cancellation_reason}</p>
          {subscription.cancellation_date && (
            <p className="text-xs text-red-600 mt-2">
              Cancelled on {new Date(subscription.cancellation_date).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
