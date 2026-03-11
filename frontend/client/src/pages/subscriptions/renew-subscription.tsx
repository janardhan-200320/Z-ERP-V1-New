import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Calendar, DollarSign, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/subscription-management-utils';
import type { Subscription, BillingCycle } from '@/lib/subscription-management-types';

// Mock data
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
};

export default function RenewSubscription() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [renewalData, setRenewalData] = useState({
    billingCycle: 'Yearly' as BillingCycle,
    amount: 50000,
    startDate: '',
    applyDiscount: false,
    discountPercentage: 0,
    discountAmount: 0,
    autoRenewal: true,
    paymentMethod: 'Razorpay',
    sendInvoice: true,
    generateRenewalLink: true,
  });

  useEffect(() => {
    // TODO: Fetch subscription from API
    setSubscription(mockSubscription);
    
    // Calculate new start date (current expiry date)
    const expiryDate = new Date(mockSubscription.expiryDate);
    const newStartDate = new Date(expiryDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    
    setRenewalData({
      ...renewalData,
      startDate: newStartDate.toISOString().split('T')[0],
      billingCycle: mockSubscription.billingCycle,
      amount: mockSubscription.amount,
    });
  }, [params.id]);

  const calculateNewExpiryDate = () => {
    if (!renewalData.startDate) return '';
    
    const startDate = new Date(renewalData.startDate);
    const expiryDate = new Date(startDate);
    
    switch (renewalData.billingCycle) {
      case 'Monthly':
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case 'Quarterly':
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case 'Yearly':
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
    }
    
    expiryDate.setDate(expiryDate.getDate() - 1);
    return expiryDate.toISOString().split('T')[0];
  };

  const calculateFinalAmount = () => {
    let finalAmount = renewalData.amount;
    
    if (renewalData.applyDiscount) {
      if (renewalData.discountPercentage > 0) {
        finalAmount = renewalData.amount - (renewalData.amount * renewalData.discountPercentage / 100);
      } else if (renewalData.discountAmount > 0) {
        finalAmount = renewalData.amount - renewalData.discountAmount;
      }
    }
    
    return Math.max(0, finalAmount);
  };

  const handleRenew = () => {
    const renewalInfo = {
      subscriptionId: params.id,
      ...renewalData,
      expiryDate: calculateNewExpiryDate(),
      finalAmount: calculateFinalAmount(),
      renewedAt: new Date().toISOString(),
      renewedBy: 'Current User', // TODO: Get from auth context
    };

    console.log('Renewing subscription:', renewalInfo);
    // TODO: Add API call to renew subscription
    
    // Show success message and redirect
    alert('Subscription renewed successfully!');
    setLocation(`/subscriptions/${params.id}`);
  };

  if (!subscription) {
    return <div className="p-6">Loading...</div>;
  }

  const newExpiryDate = calculateNewExpiryDate();
  const finalAmount = calculateFinalAmount();
  const savings = renewalData.amount - finalAmount;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation(`/subscriptions/${params.id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscription
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Renew Subscription</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {subscription.serviceName} - {subscription.companyName}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Subscription Info */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Current Subscription</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Expires On</p>
                    <p className="font-medium">{new Date(subscription.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Amount</p>
                    <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Renewal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Renewal Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Billing Cycle *</Label>
                    <Select
                      value={renewalData.billingCycle}
                      onValueChange={(value) =>
                        setRenewalData({ ...renewalData, billingCycle: value as BillingCycle })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (₹) *</Label>
                    <Input
                      type="number"
                      value={renewalData.amount}
                      onChange={(e) =>
                        setRenewalData({ ...renewalData, amount: parseFloat(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={renewalData.startDate}
                      onChange={(e) =>
                        setRenewalData({ ...renewalData, startDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>New Expiry Date</Label>
                    <Input type="date" value={newExpiryDate} disabled />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Discount Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="applyDiscount"
                    checked={renewalData.applyDiscount}
                    onCheckedChange={(checked) =>
                      setRenewalData({ ...renewalData, applyDiscount: checked as boolean })
                    }
                  />
                  <Label htmlFor="applyDiscount" className="font-semibold">
                    Apply Discount
                  </Label>
                </div>

                {renewalData.applyDiscount && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label>Discount Percentage (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={renewalData.discountPercentage}
                        onChange={(e) =>
                          setRenewalData({
                            ...renewalData,
                            discountPercentage: parseFloat(e.target.value) || 0,
                            discountAmount: 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OR Fixed Amount (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={renewalData.discountAmount}
                        onChange={(e) =>
                          setRenewalData({
                            ...renewalData,
                            discountAmount: parseFloat(e.target.value) || 0,
                            discountPercentage: 0,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Payment Settings</h3>
                
                <div className="space-y-2">
                  <Label>Payment Gateway</Label>
                  <Select
                    value={renewalData.paymentMethod}
                    onValueChange={(value) =>
                      setRenewalData({ ...renewalData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Razorpay">Razorpay</SelectItem>
                      <SelectItem value="Stripe">Stripe</SelectItem>
                      <SelectItem value="Manual">Manual Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoRenewal"
                      checked={renewalData.autoRenewal}
                      onCheckedChange={(checked) =>
                        setRenewalData({ ...renewalData, autoRenewal: checked as boolean })
                      }
                    />
                    <Label htmlFor="autoRenewal">Enable auto-renewal for next cycle</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendInvoice"
                      checked={renewalData.sendInvoice}
                      onCheckedChange={(checked) =>
                        setRenewalData({ ...renewalData, sendInvoice: checked as boolean })
                      }
                    />
                    <Label htmlFor="sendInvoice">Send invoice to client</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateLink"
                      checked={renewalData.generateRenewalLink}
                      onCheckedChange={(checked) =>
                        setRenewalData({
                          ...renewalData,
                          generateRenewalLink: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="generateLink">Generate online payment link</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Renewal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Amount</span>
                  <span className="font-medium">{formatCurrency(renewalData.amount)}</span>
                </div>

                {renewalData.applyDiscount && savings > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(savings)}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg">{formatCurrency(finalAmount)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Start Date:</span>
                </div>
                <p className="font-medium ml-6">
                  {renewalData.startDate
                    ? new Date(renewalData.startDate).toLocaleDateString()
                    : 'Not set'}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expiry Date:</span>
                </div>
                <p className="font-medium ml-6">
                  {newExpiryDate
                    ? new Date(newExpiryDate).toLocaleDateString()
                    : 'Not calculated'}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Payment Method:</span>
                </div>
                <p className="font-medium ml-6">{renewalData.paymentMethod}</p>
              </div>

              {savings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900">
                        Saving {formatCurrency(savings)}
                      </p>
                      <p className="text-green-700">
                        {renewalData.discountPercentage > 0
                          ? `${renewalData.discountPercentage}% discount applied`
                          : 'Discount applied'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={handleRenew}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Confirm Renewal
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p>Subscription will be extended with new dates</p>
              </div>
              {renewalData.sendInvoice && (
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Invoice will be sent to client</p>
                </div>
              )}
              {renewalData.generateRenewalLink && (
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Payment link will be generated</p>
                </div>
              )}
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p>Client will receive renewal confirmation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
