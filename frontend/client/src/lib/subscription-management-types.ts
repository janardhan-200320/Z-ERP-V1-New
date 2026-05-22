export type SubscriptionType = 
  | 'SaaS Subscription'
  | 'Website AMC'
  | 'Website Hosting'
  | 'Social Media Management'
  | 'Domain Subscription'
  | 'Server Subscription'
  | 'CRM Subscription'
  | 'Email Services';

export type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly';

export type SubscriptionStatus = 'Active' | 'Expired' | 'Cancelled' | 'Pending Renewal';

export type RenewalProbability = 'High' | 'Medium' | 'Low';

export interface Subscription {
  id: string;
  clientName: string;
  companyName: string;
  serviceName: string;
  subscriptionType: SubscriptionType;
  startDate: string;
  expiryDate: string;
  billingCycle: BillingCycle;
  amount: number;
  renewalReminderDays: number[];
  assignedManager: string;
  status: SubscriptionStatus;
  renewalProbability?: RenewalProbability;
  autoRenewal?: boolean;
  paymentGateway?: 'Razorpay' | 'Stripe';
  lastReminderSent?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  phoneNumber?: string;
  email?: string;
  whatsapp?: string;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  upcomingRenewals: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  totalRenewalRevenue: number;
  pendingRenewals: number;
}

export interface ReminderConfig {
  enabled: boolean;
  channels: {
    email: boolean;
    whatsapp: boolean;
    phone: boolean;
    pushNotification: boolean;
  };
  timeline: number[]; // days before expiry
}
