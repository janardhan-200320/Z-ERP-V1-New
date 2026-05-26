import { Subscription, SubscriptionStats } from './subscription-management-types';
export { formatCurrency } from './utils';

export const calculateDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isExpiringSoon = (expiryDate: string, days: number = 30): boolean => {
  const daysUntil = calculateDaysUntilExpiry(expiryDate);
  return daysUntil >= 0 && daysUntil <= days;
};

export const isExpired = (expiryDate: string): boolean => {
  return calculateDaysUntilExpiry(expiryDate) < 0;
};

export const shouldSendReminder = (
  expiryDate: string,
  reminderDays: number[],
  lastReminderSent?: string
): boolean => {
  const daysUntil = calculateDaysUntilExpiry(expiryDate);
  
  if (reminderDays.includes(daysUntil)) {
    if (!lastReminderSent) return true;
    
    const lastSent = new Date(lastReminderSent);
    const today = new Date();
    return lastSent.toDateString() !== today.toDateString();
  }
  
  return false;
};

export const calculateSubscriptionStats = (subscriptions: Subscription[]): SubscriptionStats => {
  const stats: SubscriptionStats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: 0,
    upcomingRenewals: 0,
    expiredSubscriptions: 0,
    cancelledSubscriptions: 0,
    totalRenewalRevenue: 0,
    pendingRenewals: 0,
  };

  subscriptions.forEach((sub) => {
    if (sub.status === 'Active') stats.activeSubscriptions++;
    if (sub.status === 'Expired') stats.expiredSubscriptions++;
    if (sub.status === 'Cancelled') stats.cancelledSubscriptions++;
    if (sub.status === 'Pending Renewal') stats.pendingRenewals++;
    
    if (isExpiringSoon(sub.expiryDate, 30) && sub.status === 'Active') {
      stats.upcomingRenewals++;
      stats.totalRenewalRevenue += sub.amount;
    }
  });

  return stats;
};

export const getSubscriptionStatusColor = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Expired':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Cancelled':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'Pending Renewal':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

export const getUrgencyLevel = (daysUntilExpiry: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (daysUntilExpiry < 0) return 'critical';
  if (daysUntilExpiry <= 7) return 'critical';
  if (daysUntilExpiry <= 15) return 'high';
  if (daysUntilExpiry <= 30) return 'medium';
  return 'low';
};
