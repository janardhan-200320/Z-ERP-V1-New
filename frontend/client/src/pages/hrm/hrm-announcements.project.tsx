import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { ArrowLeft, Megaphone, Trash2, CalendarClock } from 'lucide-react';
import {
  ANNOUNCEMENT_UPDATED_EVENT,
  Announcement,
  AnnouncementPriority,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  isAnnouncementExpired,
} from '@/lib/announcements';

const priorityStyles: Record<AnnouncementPriority, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function HRMAnnouncements() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('medium');
  const [expiresAt, setExpiresAt] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const refresh = () => {
      setAnnouncements(getAnnouncements());
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(ANNOUNCEMENT_UPDATED_EVENT, refresh as EventListener);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(ANNOUNCEMENT_UPDATED_EVENT, refresh as EventListener);
    };
  }, []);

  const activeCount = useMemo(
    () => announcements.filter((announcement) => !isAnnouncementExpired(announcement)).length,
    [announcements]
  );

  const handleCreateAnnouncement = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Missing details',
        description: 'Title and message are required to publish an announcement.',
        variant: 'destructive',
      });
      return;
    }

    createAnnouncement({
      title,
      message,
      priority,
      expiresAt: expiresAt || undefined,
      createdBy: 'HR Admin',
    });

    setTitle('');
    setMessage('');
    setPriority('medium');
    setExpiresAt('');

    toast({
      title: 'Announcement published',
      description: 'It is now visible on the main dashboard.',
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    deleteAnnouncement(id);
    toast({
      title: 'Announcement removed',
      description: 'The selected item has been deleted.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/hrm')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">HR Announcements</h1>
              <p className="text-sm text-slate-500">Create and manage updates for the whole organization.</p>
            </div>
          </div>
          <Badge className="w-fit bg-blue-100 text-blue-700 border-blue-200">
            {activeCount} Active on Dashboard
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-blue-600" />
                Create Announcement
              </CardTitle>
              <CardDescription>Publish a message that appears above the dashboard KPI cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  placeholder="Example: Office closed for maintenance"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-message">Message</Label>
                <Textarea
                  id="announcement-message"
                  placeholder="Write the announcement details here..."
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(value: AnnouncementPriority) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcement-expiry">Expiry Date (optional)</Label>
                  <Input
                    id="announcement-expiry"
                    type="date"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleCreateAnnouncement}>
                Publish Announcement
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Published Announcements</CardTitle>
              <CardDescription>Latest first. Expired items remain here for audit visibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No announcements yet. Create one to show it on the dashboard.
                </div>
              ) : (
                announcements.map((announcement) => {
                  const expired = isAnnouncementExpired(announcement);
                  return (
                    <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                          <Badge className={priorityStyles[announcement.priority]}>{announcement.priority}</Badge>
                          {expired && <Badge variant="outline">Expired</Badge>}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-600"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-slate-600">{announcement.message}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>Published: {new Date(announcement.createdAt).toLocaleString()}</span>
                        {announcement.expiresAt && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
