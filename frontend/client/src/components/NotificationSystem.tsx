import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  X,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const notificationConfig = {
  success: {
    icon: CheckCircle2,
    className: 'bg-green-50 border-green-200 text-green-900',
    iconClassName: 'text-green-600',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 text-red-900',
    iconClassName: 'text-red-600',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-amber-50 border-amber-200 text-amber-900',
    iconClassName: 'text-amber-600',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-900',
    iconClassName: 'text-blue-600',
  },
  loading: {
    icon: Loader2,
    className: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    iconClassName: 'text-indigo-600 animate-spin',
  },
};

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className={cn(
        'relative w-full md:w-96 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        config.className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', config.iconClassName)} />
        </div>

        {/* Content */}
        <div className="flex-1 pt-0.5">
          <p className="font-semibold text-sm mb-0.5">{notification.title}</p>
          {notification.message && (
            <p className="text-sm opacity-90">{notification.message}</p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        {notification.type !== 'loading' && (
          <button
            onClick={() => onClose(notification.id)}
            className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress bar for timed notifications */}
      {notification.duration && notification.type !== 'loading' && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20 origin-left rounded-b-lg"
        />
      )}
    </motion.div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function NotificationContainer({
  notifications,
  onClose,
  position = 'top-right',
}: NotificationContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-2 p-4 pointer-events-none',
        positionClasses[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem notification={notification} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook to manage notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    type: NotificationType,
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void };
    }
  ) => {
    const id = Math.random().toString(36).substring(7);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: options?.duration ?? (type === 'loading' ? undefined : 5000),
      action: options?.action,
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove after duration
    if (notification.duration && type !== 'loading') {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (title: string, message?: string, options?: {
    duration?: number;
    action?: { label: string; onClick: () => void };
  }) =>
    addNotification('success', title, message, options);

  const error = (title: string, message?: string, options?: {
    duration?: number;
    action?: { label: string; onClick: () => void };
  }) =>
    addNotification('error', title, message, options);

  const warning = (title: string, message?: string, options?: {
    duration?: number;
    action?: { label: string; onClick: () => void };
  }) =>
    addNotification('warning', title, message, options);

  const info = (title: string, message?: string, options?: {
    duration?: number;
    action?: { label: string; onClick: () => void };
  }) =>
    addNotification('info', title, message, options);

  const loading = (title: string, message?: string) =>
    addNotification('loading', title, message, { duration: undefined });

  return {
    notifications,
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    loading,
  };
}
