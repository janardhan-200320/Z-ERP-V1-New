import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Bell, 
  Mail, 
  Phone, 
  MessageSquare, 
  Save, 
  Calendar, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  Clock,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Plus,
  TestTube,
} from 'lucide-react';

interface ReminderSettings {
  enabled: boolean;
  channels: {
    email: boolean;
    whatsapp: boolean;
    phone: boolean;
    pushNotification: boolean;
  };
  timeline: {
    days30: boolean;
    days15: boolean;
    days7: boolean;
    days3: boolean;
    days1: boolean;
    expiryDay: boolean;
  };
  emailTemplate: string;
  whatsappTemplate: string;
  smsTemplate: string;
}

interface ScheduledReminder {
  id: string;
  subscriptionId: string;
  clientName: string;
  companyName: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'phone';
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
  daysBeforeExpiry: number;
  message?: string;
}

interface ReminderLog {
  id: string;
  subscriptionId: string;
  clientName: string;
  channel: string;
  sentAt: string;
  status: 'success' | 'failed';
  message: string;
}

// Mock data for scheduled reminders
const mockScheduledReminders: ScheduledReminder[] = [
  {
    id: '1',
    subscriptionId: 'sub-001',
    clientName: 'John Doe',
    companyName: 'Tech Solutions Inc',
    serviceName: 'CRM Software',
    scheduledDate: '2026-02-27',
    scheduledTime: '09:00',
    channel: 'email',
    status: 'pending',
    daysBeforeExpiry: 7,
  },
  {
    id: '2',
    subscriptionId: 'sub-002',
    clientName: 'Jane Smith',
    companyName: 'Digital Marketing Co',
    serviceName: 'Social Media Management',
    scheduledDate: '2026-02-25',
    scheduledTime: '10:30',
    channel: 'whatsapp',
    status: 'pending',
    daysBeforeExpiry: 3,
  },
  {
    id: '3',
    subscriptionId: 'sub-003',
    clientName: 'ABC Corp',
    companyName: 'ABC Corporation',
    serviceName: 'Website Hosting',
    scheduledDate: '2026-02-20',
    scheduledTime: '14:00',
    channel: 'email',
    status: 'sent',
    sentAt: '2026-02-20T14:00:00',
    daysBeforeExpiry: 15,
  },
];

const mockReminderLogs: ReminderLog[] = [
  {
    id: '1',
    subscriptionId: 'sub-003',
    clientName: 'ABC Corp',
    channel: 'Email',
    sentAt: '2026-02-20T14:00:00',
    status: 'success',
    message: 'Reminder sent successfully',
  },
  {
    id: '2',
    subscriptionId: 'sub-001',
    clientName: 'John Doe',
    channel: 'WhatsApp',
    sentAt: '2026-02-19T10:30:00',
    status: 'success',
    message: 'Reminder delivered',
  },
  {
    id: '3',
    subscriptionId: 'sub-004',
    clientName: 'XYZ Ltd',
    channel: 'Email',
    sentAt: '2026-02-18T09:15:00',
    status: 'failed',
    message: 'Email address not found',
  },
];

export default function ReminderConfig() {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    channels: {
      email: true,
      whatsapp: true,
      phone: false,
      pushNotification: true,
    },
    timeline: {
      days30: true,
      days15: true,
      days7: true,
      days3: false,
      days1: true,
      expiryDay: true,
    },
    emailTemplate: `Dear {client_name},\n\nThis is a reminder that your {service_name} subscription will expire on {expiry_date}.\n\nPlease renew your subscription to avoid service interruption.\n\nBest regards,\nYour Team`,
    whatsappTemplate: `Hi {client_name}, your {service_name} subscription expires on {expiry_date}. Please renew to continue service. Reply to renew now!`,
    smsTemplate: `{client_name}, your {service_name} expires on {expiry_date}. Renew now to continue service.`,
  });

  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>(mockScheduledReminders);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>(mockReminderLogs);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [testReminderDialogOpen, setTestReminderDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ScheduledReminder | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
  });
  const [testRecipient, setTestRecipient] = useState('');

  const handleSave = () => {
    console.log('Saving reminder settings:', settings);
    // TODO: Add API call
    alert('Reminder settings saved successfully!');
  };

  const handleEditReminder = (reminder: ScheduledReminder) => {
    setSelectedReminder(reminder);
    setEditDialogOpen(true);
  };

  const handleReschedule = (reminder: ScheduledReminder) => {
    setSelectedReminder(reminder);
    setRescheduleData({
      date: reminder.scheduledDate,
      time: reminder.scheduledTime,
    });
    setRescheduleDialogOpen(true);
  };

  const confirmReschedule = () => {
    if (!selectedReminder) return;
    
    setScheduledReminders(prev =>
      prev.map(r =>
        r.id === selectedReminder.id
          ? { ...r, scheduledDate: rescheduleData.date, scheduledTime: rescheduleData.time }
          : r
      )
    );
    
    setRescheduleDialogOpen(false);
    alert('Reminder rescheduled successfully!');
  };

  const handleCancelReminder = (id: string) => {
    if (confirm('Are you sure you want to cancel this reminder?')) {
      setScheduledReminders(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'cancelled' as const } : r))
      );
      alert('Reminder cancelled');
    }
  };

  const handleSendNow = (id: string) => {
    if (confirm('Send this reminder immediately?')) {
      setScheduledReminders(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, status: 'sent' as const, sentAt: new Date().toISOString() }
            : r
        )
      );
      alert('Reminder sent successfully!');
    }
  };

  const handleTestReminder = () => {
    setTestReminderDialogOpen(true);
  };

  const sendTestReminder = () => {
    console.log('Sending test reminder');
    alert('Test reminder sent to your email!');
    setTestReminderDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      sent: 'default',
      failed: 'destructive',
      cancelled: 'outline',
    };
    
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'sms':
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const previewTemplate = (template: string) => {
    return template
      .replace('{client_name}', 'John Doe')
      .replace('{service_name}', 'CRM Software')
      .replace('{expiry_date}', '2026-03-15')
      .replace('{amount}', '₹50,000');
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reminder Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Configure automated renewal reminders and manage schedules</p>
        </div>
        <Button onClick={handleTestReminder} variant="outline" className="w-full sm:w-auto">
          <TestTube className="h-4 w-4 mr-2" />
          Test Reminder
        </Button>
      </div>

      {/* Step-by-Step Guide */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-xs sm:text-sm font-medium">Configure Settings</span>
              </div>
              <div className="hidden sm:block w-8 h-0.5 bg-blue-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-xs sm:text-sm font-medium">Review Schedule</span>
              </div>
              <div className="hidden sm:block w-8 h-0.5 bg-blue-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-xs sm:text-sm font-medium">Monitor History</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="settings" className="text-xs sm:text-sm py-2">Settings</TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs sm:text-sm py-2">
            <span className="hidden sm:inline">Scheduled</span>
            <span className="sm:hidden">Queue</span>
            {scheduledReminders.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                {scheduledReminders.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs sm:text-sm py-2">History</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 sm:space-y-6">
      {/* Enable/Disable Reminders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Reminder System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label className="text-sm sm:text-base">Enable Automatic Reminders</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Send automated reminders before subscription expiry
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminder Channels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm sm:text-base">Email Notifications</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Send reminders via email</p>
              </div>
            </div>
            <Switch
              checked={settings.channels.email}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  channels: { ...settings.channels, email: checked },
                })
              }
              disabled={!settings.enabled}
            />
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm sm:text-base">WhatsApp Messages</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Send reminders via WhatsApp</p>
              </div>
            </div>
            <Switch
              checked={settings.channels.whatsapp}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  channels: { ...settings.channels, whatsapp: checked },
                })
              }
              disabled={!settings.enabled}
            />
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm sm:text-base">Phone Call Reminders</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Schedule phone calls</p>
              </div>
            </div>
            <Switch
              checked={settings.channels.phone}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  channels: { ...settings.channels, phone: checked },
                })
              }
              disabled={!settings.enabled}
            />
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm sm:text-base">Push Notifications</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">In-app notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.channels.pushNotification}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  channels: { ...settings.channels, pushNotification: checked },
                })
              }
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminder Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Reminder Timeline</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Choose when to send reminders before subscription expiry</p>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="days30"
              checked={settings.timeline.days30}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  timeline: { ...settings.timeline, days30: checked as boolean },
                })
              }
              disabled={!settings.enabled}
            />
            <Label htmlFor="days30" className="text-sm sm:text-base">30 days before expiry</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="days15"
              checked={settings.timeline.days15}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  timeline: { ...settings.timeline, days15: checked as boolean },
                })
              }
              disabled={!settings.enabled}
            />
            <Label htmlFor="days15" className="text-sm sm:text-base">15 days before expiry</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="days7"
              checked={settings.timeline.days7}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  timeline: { ...settings.timeline, days7: checked as boolean },
                })
              }
              disabled={!settings.enabled}
            />
            <Label htmlFor="days7" className="text-sm sm:text-base">7 days before expiry</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="days3"
              checked={settings.timeline.days3}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  timeline: { ...settings.timeline, days3: checked as boolean },
                })
              }
              disabled={!settings.enabled}
            />
            <Label htmlFor="days3" className="text-sm sm:text-base">3 days before expiry</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="days1"
              checked={settings.timeline.days1}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  timeline: { ...settings.timeline, days1: checked as boolean },
                })
              }
              disabled={!settings.enabled}
            />
            <Label htmlFor="days1" className="text-sm sm:text-base">1 day before expiry</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="expiryDay"
              checked={settings.timeline.expiryDay}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  timeline: { ...settings.timeline, expiryDay: checked as boolean },
                })
              }
              disabled={!settings.enabled}
            />
            <Label htmlFor="expiryDay" className="text-sm sm:text-base">On expiry day</Label>
          </div>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Message Templates</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Customize your reminder messages</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Email Template</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Available variables: {'{client_name}'}, {'{service_name}'}, {'{expiry_date}'}, {'{amount}'}
            </p>
            <textarea
              className="w-full min-h-32 p-3 border rounded-md text-sm"
              value={settings.emailTemplate}
              onChange={(e) =>
                setSettings({ ...settings, emailTemplate: e.target.value })
              }
              disabled={!settings.enabled}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base">WhatsApp Template</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Keep it short and concise for WhatsApp
            </p>
            <textarea
              className="w-full min-h-24 p-3 border rounded-md text-sm"
              value={settings.whatsappTemplate}
              onChange={(e) =>
                setSettings({ ...settings, whatsappTemplate: e.target.value })
              }
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!settings.enabled} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
        </TabsContent>

        {/* Scheduled Reminders Tab */}
        <TabsContent value="scheduled" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <CardTitle className="text-lg sm:text-xl">Upcoming Reminders</CardTitle>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {scheduledReminders.filter(r => r.status === 'pending').length} pending
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <thead>
                  <tr>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Client</th>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Service</th>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Scheduled</th>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Channel</th>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Status</th>
                    <th className="text-right text-xs sm:text-sm px-2 sm:px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledReminders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                        No scheduled reminders
                      </td>
                    </tr>
                  ) : (
                    scheduledReminders.map((reminder) => (
                      <tr key={reminder.id} className="border-t">
                        <td className="py-3 px-2 sm:px-4">
                          <div className="font-medium text-xs sm:text-sm">{reminder.clientName}</div>
                          <div className="text-xs text-muted-foreground">{reminder.subscriptionId}</div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">{reminder.serviceName}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs sm:text-sm">{reminder.scheduledDate}</div>
                              <div className="text-xs text-muted-foreground">{reminder.scheduledTime}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {getChannelIcon(reminder.channel)}
                            <span className="capitalize text-xs sm:text-sm">{reminder.channel}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">{getStatusBadge(reminder.status)}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex justify-end space-x-1 flex-wrap gap-1">
                            {reminder.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditReminder(reminder)}
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReschedule(reminder)}
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                >
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendNow(reminder.id)}
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                >
                                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelReminder(reminder.id)}
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </>
                            )}
                            {reminder.status === 'sent' && reminder.sentAt && (
                              <span className="text-xs text-muted-foreground">
                                Sent {new Date(reminder.sentAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="logs" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Reminder History</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track all sent reminders and their status</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <thead>
                  <tr>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Timestamp</th>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Client</th>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Channel</th>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Status</th>
                    <th className="text-left text-xs sm:text-sm px-2 sm:px-4">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {reminderLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                        No reminder history
                      </td>
                    </tr>
                  ) : (
                    reminderLogs.map((log) => (
                      <tr key={log.id} className="border-t">
                        <td className="py-3 px-2 sm:px-4">
                          <div className="text-xs sm:text-sm">
                            {new Date(log.sentAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.sentAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">{log.clientName}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {getChannelIcon(log.channel)}
                            <span className="capitalize text-xs sm:text-sm">{log.channel}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">{getStatusBadge(log.status)}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="max-w-md truncate text-xs sm:text-sm text-muted-foreground">
                            {log.message}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Reschedule Reminder</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Choose a new date and time for this reminder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Date</Label>
              <Input
                type="date"
                value={rescheduleData.date}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, date: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Time</Label>
              <Input
                type="time"
                value={rescheduleData.time}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, time: e.target.value })
                }
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={confirmReschedule} className="w-full sm:w-auto">
              <Clock className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reminder Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Reminder</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Customize the reminder message and channel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReminder && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Client</Label>
                  <Input value={selectedReminder.clientName} disabled className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Service</Label>
                  <Input value={selectedReminder.serviceName} disabled className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Channel</Label>
                  <select
                    className="w-full p-2 border rounded-md text-sm"
                    value={selectedReminder.channel}
                    onChange={(e) =>
                      setSelectedReminder({ ...selectedReminder, channel: e.target.value as 'email' | 'whatsapp' | 'sms' | 'phone' })
                    }
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Message</Label>
                  <textarea
                    className="w-full min-h-32 p-3 border rounded-md text-sm"
                    value={selectedReminder.message || ''}
                    onChange={(e) =>
                      setSelectedReminder({ ...selectedReminder, message: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Preview</Label>
                  <div className="p-3 bg-muted rounded-md text-xs sm:text-sm">
                    {previewTemplate(selectedReminder.message || settings.emailTemplate)}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={() => {
              alert('Reminder updated successfully!');
              setEditDialogOpen(false);
            }} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Reminder Dialog */}
      <Dialog open={testReminderDialogOpen} onOpenChange={setTestReminderDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Send Test Reminder</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Send a test reminder to verify your settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Test Email/Phone</Label>
              <Input
                type="text"
                placeholder="Enter email or phone number"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Channel</Label>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Preview</p>
              <p className="text-xs sm:text-sm">{previewTemplate(settings.emailTemplate)}</p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setTestReminderDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={sendTestReminder} className="w-full sm:w-auto">
              <Send className="h-4 w-4 mr-2" />
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
