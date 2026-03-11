import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface SubscriptionNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  subscriptionId?: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications?: SubscriptionNotification[];
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const mockNotifications: SubscriptionNotification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Subscription Expiring Soon',
    message: 'Tech Solutions Inc - CRM Software expires in 7 days',
    subscriptionId: '1',
    timestamp: new Date().toISOString(),
    read: false,
    actionLabel: 'Renew Now',
    actionUrl: '/subscriptions/1/renew',
  },
  {
    id: '2',
    type: 'error',
    title: 'Payment Failed',
    message: 'Auto-renewal payment failed for Digital Marketing Co',
    subscriptionId: '2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    actionLabel: 'Retry Payment',
    actionUrl: '/subscriptions/2',
  },
  {
    id: '3',
    type: 'success',
    title: 'Subscription Renewed',
    message: 'ABC Corporation successfully renewed their hosting subscription',
    subscriptionId: '3',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
  {
    id: '4',
    type: 'info',
    title: 'Reminder Sent',
    message: 'Renewal reminder sent to 5 clients via email and WhatsApp',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    read: true,
  },
];

export default function NotificationCenter({
  notifications = mockNotifications,
  onMarkAsRead,
  onDismiss,
}: NotificationCenterProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    onMarkAsRead?.(id);
  };

  const handleDismiss = (id: string) => {
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
    onDismiss?.(id);
  };

  const filteredNotifications = localNotifications.filter((n) =>
    filter === 'all' ? true : !n.read
  );

  const unreadCount = localNotifications.filter((n) => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`relative rounded-lg border p-4 ${getBgColor(notification.type)} ${
                    !notification.read ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <button
                    onClick={() => handleDismiss(notification.id)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex gap-3 pr-6">
                    <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>

                      <div className="flex gap-2 mt-2">
                        {notification.actionUrl && notification.actionLabel && (
                          <Link href={notification.actionUrl}>
                            <Button size="sm" variant="outline">
                              {notification.actionLabel}
                            </Button>
                          </Link>
                        )}
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < filteredNotifications.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
