import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useHRM } from '@/contexts/HRMContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { ArrowLeft, CalendarDays, Trash2 } from 'lucide-react';
import {
  PUBLIC_HOLIDAY_UPDATED_EVENT,
  PublicHoliday,
  createPublicHoliday,
  deletePublicHoliday,
  getPublicHolidays,
  getUpcomingPublicHolidays,
} from '@/lib/public-holidays';

export default function HRMPublicHolidays() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);

  useEffect(() => {
    const refresh = () => {
      setHolidays(getPublicHolidays());
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(PUBLIC_HOLIDAY_UPDATED_EVENT, refresh as EventListener);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(PUBLIC_HOLIDAY_UPDATED_EVENT, refresh as EventListener);
    };
  }, []);

  const upcomingCount = useMemo(() => getUpcomingPublicHolidays().length, [holidays]);

  const handleCreateHoliday = () => {
    if (!holidayName.trim() || !holidayDate) {
      toast({
        title: 'Missing details',
        description: 'Holiday name and date are required.',
        variant: 'destructive',
      });
      return;
    }

    createPublicHoliday({
      name: holidayName,
      date: holidayDate,
      description: holidayDescription,
      createdBy: 'HR Admin',
    });

    setHolidayName('');
    setHolidayDate('');
    setHolidayDescription('');

    toast({
      title: 'Public holiday added',
      description: 'It is now visible on the main dashboard calendar.',
    });
  };

  const handleDeleteHoliday = (id: string) => {
    deletePublicHoliday(id);
    toast({
      title: 'Public holiday removed',
      description: 'The selected holiday has been deleted.',
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
              <h1 className="text-2xl font-bold text-slate-900">Public Holidays</h1>
              <p className="text-sm text-slate-500">Design and publish office holidays from HR.</p>
            </div>
          </div>
          <Badge className="w-fit bg-emerald-100 text-emerald-700 border-emerald-200">
            {upcomingCount} Upcoming on Dashboard
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
                Declare Public Holiday
              </CardTitle>
              <CardDescription>Published holidays are shown in dashboard calendar and upcoming events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="holiday-name">Holiday Name</Label>
                <Input
                  id="holiday-name"
                  placeholder="Example: Republic Day"
                  value={holidayName}
                  onChange={(event) => setHolidayName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holiday-date">Date</Label>
                <Input
                  id="holiday-date"
                  type="date"
                  value={holidayDate}
                  onChange={(event) => setHolidayDate(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holiday-description">Description (optional)</Label>
                <Textarea
                  id="holiday-description"
                  placeholder="Example: National holiday - office remains closed"
                  rows={4}
                  value={holidayDescription}
                  onChange={(event) => setHolidayDescription(event.target.value)}
                />
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateHoliday}>
                Publish Holiday
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Holiday Calendar Entries</CardTitle>
              <CardDescription>All published records. Upcoming ones are visible on dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {holidays.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No holidays declared yet.
                </div>
              ) : (
                holidays.map((holiday) => {
                  const holidayDate = new Date(`${holiday.date}T00:00:00`);
                  const isPast = holidayDate.getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime();

                  return (
                    <div key={holiday.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{holiday.name}</h3>
                          {isPast && <Badge variant="outline">Past</Badge>}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-600"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {holiday.description && <p className="text-sm text-slate-600">{holiday.description}</p>}

                      <div className="mt-3 text-xs text-slate-500">
                        Date: {holidayDate.toLocaleDateString()} | Added: {new Date(holiday.createdAt).toLocaleString()}
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
