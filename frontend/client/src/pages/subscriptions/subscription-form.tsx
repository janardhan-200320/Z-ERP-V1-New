import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import type { Subscription, SubscriptionType, BillingCycle, SubscriptionStatus } from '@/lib/subscription-management-types';

const subscriptionTypes: SubscriptionType[] = [
  'SaaS Subscription',
  'Website AMC',
  'Website Hosting',
  'Social Media Management',
  'Domain Subscription',
  'Server Subscription',
  'CRM Subscription',
  'Email Services',
];

const billingCycles: BillingCycle[] = ['Monthly', 'Quarterly', 'Yearly'];

export default function SubscriptionForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const id = params.id;
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    serviceName: '',
    subscriptionType: '' as SubscriptionType,
    startDate: '',
    expiryDate: '',
    billingCycle: '' as BillingCycle,
    amount: '',
    assignedManager: '',
    status: 'Active' as SubscriptionStatus,
    phoneNumber: '',
    email: '',
    whatsapp: '',
    autoRenewal: false,
    renewalReminder30: true,
    renewalReminder15: true,
    renewalReminder7: true,
    renewalReminder1: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reminderDays: number[] = [];
    if (formData.renewalReminder30) reminderDays.push(30);
    if (formData.renewalReminder15) reminderDays.push(15);
    if (formData.renewalReminder7) reminderDays.push(7);
    if (formData.renewalReminder1) reminderDays.push(1);

    const subscription: Partial<Subscription> = {
      clientName: formData.clientName,
      companyName: formData.companyName,
      serviceName: formData.serviceName,
      subscriptionType: formData.subscriptionType,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      billingCycle: formData.billingCycle,
      amount: parseFloat(formData.amount),
      assignedManager: formData.assignedManager,
      status: formData.status,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      whatsapp: formData.whatsapp,
      autoRenewal: formData.autoRenewal,
      renewalReminderDays: reminderDays,
    };

    console.log('Saving subscription:', subscription);
    // TODO: Add API call to save subscription
    
    setLocation('/subscriptions/list');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/subscriptions/list')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Subscription' : 'New Subscription'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Subscription Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptionType">Subscription Type *</Label>
                  <Select
                    value={formData.subscriptionType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subscriptionType: value as SubscriptionType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Billing Cycle *</Label>
                  <Select
                    value={formData.billingCycle}
                    onValueChange={(value) =>
                      setFormData({ ...formData, billingCycle: value as BillingCycle })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingCycles.map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {cycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedManager">Assigned Manager *</Label>
                  <Input
                    id="assignedManager"
                    value={formData.assignedManager}
                    onChange={(e) => setFormData({ ...formData, assignedManager: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as SubscriptionStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Pending Renewal">Pending Renewal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Renewal Reminders */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Renewal Reminders</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder30"
                    checked={formData.renewalReminder30}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, renewalReminder30: checked as boolean })
                    }
                  />
                  <Label htmlFor="reminder30">30 days before expiry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder15"
                    checked={formData.renewalReminder15}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, renewalReminder15: checked as boolean })
                    }
                  />
                  <Label htmlFor="reminder15">15 days before expiry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder7"
                    checked={formData.renewalReminder7}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, renewalReminder7: checked as boolean })
                    }
                  />
                  <Label htmlFor="reminder7">7 days before expiry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder1"
                    checked={formData.renewalReminder1}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, renewalReminder1: checked as boolean })
                    }
                  />
                  <Label htmlFor="reminder1">1 day before expiry</Label>
                </div>
              </div>
            </div>

            {/* Auto Renewal */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoRenewal"
                  checked={formData.autoRenewal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoRenewal: checked as boolean })
                  }
                />
                <Label htmlFor="autoRenewal">Enable Auto Renewal</Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Update' : 'Create'} Subscription
              </Button>
              <Button type="button" variant="outline" onClick={() => setLocation('/subscriptions/list')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
