// Notification Helper Functions
// Import this in any component to trigger notifications

import { useNotifications } from '@/contexts/NotificationContext';
import { useLocation } from 'wouter';

export function useNotificationTriggers() {
  const { addNotification } = useNotifications();
  const [, setLocation] = useLocation();

  return {
    // Booking Notifications
    notifyNewBooking: (customerName: string, service: string, date: string, bookingId: string) => {
      addNotification({
        type: 'success',
        title: 'New Booking Created',
        message: `${customerName} booked ${service} for ${date}`,
        action: { onClick: () => setLocation('/dashboard/appointments'), label: 'View Booking' },
        metadata: { bookingId },
      });
    },

    notifyBookingCancelled: (customerName: string, service: string) => {
      addNotification({
        type: 'warning',
        title: 'Booking Cancelled',
        message: `${customerName} cancelled ${service}`,
        action: { onClick: () => setLocation('/dashboard/appointments'), label: 'View Details' },
      });
    },

    notifyBookingRescheduled: (customerName: string, oldDate: string, newDate: string) => {
      addNotification({
        type: 'info',
        title: 'Booking Rescheduled',
        message: `${customerName} moved appointment from ${oldDate} to ${newDate}`,
        action: { onClick: () => setLocation('/dashboard/appointments'), label: 'View Calendar' },
      });
    },

    // Payment Notifications
    notifyPaymentReceived: (customerName: string, amount: number) => {
      addNotification({
        type: 'success',
        title: 'Payment Received',
        message: `₹${amount} received from ${customerName}`,
        action: { onClick: () => setLocation('/dashboard/invoices'), label: 'View Invoice' },
        metadata: { amount },
      });
    },

    notifyPaymentPending: (customerName: string, amount: number) => {
      addNotification({
        type: 'warning',
        title: 'Payment Pending',
        message: `₹${amount} pending from ${customerName}`,
        action: { onClick: () => setLocation('/dashboard/invoices'), label: 'Send Reminder' },
        metadata: { amount },
      });
    },

    notifyPaymentFailed: (customerName: string, amount: number) => {
      addNotification({
        type: 'error',
        title: 'Payment Failed',
        message: `₹${amount} payment failed for ${customerName}`,
        action: { onClick: () => setLocation('/dashboard/invoices'), label: 'Retry Payment' },
        metadata: { amount },
      });
    },

    // Customer Notifications
    notifyNewCustomer: (customerName: string, customerId: string) => {
      addNotification({
        type: 'success',
        title: 'New Customer Registered',
        message: `${customerName} just joined!`,
        action: { onClick: () => setLocation('/dashboard/customers'), label: 'View Profile' },
        metadata: { customerId },
      });
    },

    notifyCustomerBirthday: (customerName: string) => {
      addNotification({
        type: 'info',
        title: '🎂 Customer Birthday Today',
        message: `It's ${customerName}'s birthday! Send wishes.`,
        action: { onClick: () => setLocation('/dashboard/customers'), label: 'Send Wishes' },
      });
    },

    notifyReturningCustomer: (customerName: string, lastVisit: string) => {
      addNotification({
        type: 'info',
        title: 'Returning Customer',
        message: `${customerName} is back! Last visit: ${lastVisit}`,
        action: { onClick: () => setLocation('/dashboard/customers'), label: 'View History' },
      });
    },

    // Inventory Notifications
    notifyLowStock: (productName: string, quantity: number, productId: string) => {
      addNotification({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${productName} is running low (${quantity} units left)`,
        action: { onClick: () => setLocation('/dashboard/products'), label: 'Reorder Now' },
        metadata: { productId },
      });
    },

    notifyOutOfStock: (productName: string) => {
      addNotification({
        type: 'error',
        title: 'Out of Stock',
        message: `${productName} is out of stock!`,
        action: { onClick: () => setLocation('/dashboard/products'), label: 'Restock' },
      });
    },

    notifyStockRestocked: (productName: string, quantity: number) => {
      addNotification({
        type: 'success',
        title: 'Stock Restocked',
        message: `${productName} restocked with ${quantity} units`,
        action: { onClick: () => setLocation('/dashboard/products'), label: 'View Inventory' },
      });
    },

    // Staff Notifications
    notifyStaffSchedule: (staffName: string, shift: string, date: string) => {
      addNotification({
        type: 'info',
        title: 'Staff Schedule Update',
        message: `${staffName} scheduled for ${shift} on ${date}`,
        action: { onClick: () => setLocation('/dashboard/team-members'), label: 'View Schedule' },
      });
    },

    notifyStaffLeave: (staffName: string, dates: string) => {
      addNotification({
        type: 'info',
        title: 'Staff Leave Request',
        message: `${staffName} requested leave for ${dates}`,
        action: { onClick: () => setLocation('/dashboard/team-members'), label: 'Approve/Reject' },
      });
    },

    notifyStaffAbsent: (staffName: string, date: string) => {
      addNotification({
        type: 'warning',
        title: 'Staff Absent',
        message: `${staffName} is marked absent for ${date}`,
        action: { onClick: () => setLocation('/dashboard/team-attendance'), label: 'View Attendance' },
      });
    },

    // Workflow Notifications
    notifyWorkflowSuccess: (workflowName: string, workflowId: string) => {
      addNotification({
        type: 'success',
        title: 'Workflow Completed',
        message: `${workflowName} executed successfully`,
        action: { onClick: () => setLocation('/dashboard/workflows'), label: 'View Logs' },
        metadata: { workflowId },
      });
    },

    notifyWorkflowFailed: (workflowName: string, error: string) => {
      addNotification({
        type: 'error',
        title: 'Workflow Failed',
        message: `${workflowName} failed: ${error}`,
        action: { onClick: () => setLocation('/dashboard/workflows'), label: 'Fix Issue' },
      });
    },

    // System Notifications
    notifySystemUpdate: (message: string) => {
      addNotification({
        type: 'info',
        title: 'System Update',
        message,
        action: { onClick: () => setLocation('/dashboard'), label: 'Learn More' },
      });
    },

    notifySystemMaintenance: (scheduledTime: string) => {
      addNotification({
        type: 'warning',
        title: 'Scheduled Maintenance',
        message: `System maintenance scheduled for ${scheduledTime}`,
        action: { onClick: () => setLocation('/dashboard'), label: 'View Details' },
      });
    },

    // Generic notification
    notify: (title: string, message: string, type: any = 'info') => {
      addNotification({
        type,
        title,
        message,
      });
    },
  };
}

// Standalone notification helper functions (for use outside React components)
export function notifyPaymentReceived(notifications: any, data: { customerName: string; amount: number; invoiceId: string }) {
  notifications.addNotification({
    type: 'success',
    title: 'Payment Received',
    message: `₹${data.amount.toFixed(2)} received from ${data.customerName}`,
    action: { onClick: () => window.location.href = '/dashboard/invoices', label: 'View Invoice' },
    metadata: { invoiceId: data.invoiceId },
  });
}

export function notifyPaymentPending(notifications: any, data: { customerName: string; amount: number; invoiceId: string }) {
  notifications.addNotification({
    type: 'warning',
    title: 'Payment Pending',
    message: `₹${data.amount.toFixed(2)} pending from ${data.customerName}`,
    action: { onClick: () => window.location.href = '/dashboard/invoices', label: 'Send Reminder' },
    metadata: { invoiceId: data.invoiceId },
  });
}

export function notifyPaymentOverdue(notifications: any, data: { customerName: string; amount: number; invoiceId: string; daysOverdue: number }) {
  notifications.addNotification({
    type: 'error',
    title: 'Payment Overdue',
    message: `₹${data.amount.toFixed(2)} overdue by ${data.daysOverdue} days from ${data.customerName}`,
    action: { onClick: () => window.location.href = '/dashboard/invoices', label: 'Follow Up' },
    metadata: { invoiceId: data.invoiceId },
  });
}

// Demo function to trigger sample notifications (for testing)
export function triggerDemoNotifications(notificationTriggers: ReturnType<typeof useNotificationTriggers>) {
  const { 
    notifyNewBooking, 
    notifyPaymentReceived, 
    notifyLowStock,
    notifyCustomerBirthday,
    notifyStaffLeave,
    notifyWorkflowSuccess,
  } = notificationTriggers;

  // Trigger demo notifications with delay
  setTimeout(() => notifyNewBooking('John Doe', 'Premium Spa Package', 'Dec 5, 2024', 'book123'), 1000);
  setTimeout(() => notifyPaymentReceived('Sarah Smith', 2500), 3000);
  setTimeout(() => notifyLowStock('Aromatherapy Oil', 3, 'prod456'), 5000);
  setTimeout(() => notifyCustomerBirthday('Mike Johnson'), 7000);
  setTimeout(() => notifyStaffLeave('Emma Wilson', 'Dec 10-12'), 9000);
  setTimeout(() => notifyWorkflowSuccess('Welcome Email Campaign', 'wf789'), 11000);
}
