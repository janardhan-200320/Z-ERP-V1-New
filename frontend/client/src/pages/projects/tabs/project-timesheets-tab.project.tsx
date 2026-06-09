import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  fetchProjectTasks,
  fetchProjectTaskTimeEntries,
  type ProjectTaskRecord,
  type ProjectTaskTimeEntryRecord,
} from '@/lib/supabase-data';
import { Clock, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProjectTimesheetsTabProps {
  projectId: string | undefined;
}

export default function ProjectTimesheetsTab({ projectId }: ProjectTimesheetsTabProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<ProjectTaskRecord[]>([]);
  const [timeEntries, setTimeEntries] = useState<ProjectTaskTimeEntryRecord[]>([]);
  const [rangeFilter, setRangeFilter] = useState<'all' | 'week' | 'month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    if (!projectId) return;

    let active = true;
    setIsLoading(true);

    Promise.all([
      fetchProjectTasks(Number(projectId)),
      fetchProjectTaskTimeEntries(Number(projectId)),
    ])
      .then(([records, entries]) => {
        if (!active) return;
        setTasks(records);
        setTimeEntries(entries);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast({
          title: 'Failed to load timesheets',
          description: error instanceof Error ? error.message : 'Unable to fetch project time data from Supabase.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [projectId, toast]);

  const normalizeStatus = (status: string | undefined) =>
    String(status || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .trim();

  const formatHoursToDuration = (hours: number) => {
    const safeHours = Number.isFinite(hours) ? hours : 0;
    const totalSeconds = Math.max(0, Math.round(safeHours * 3600));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const calculateTaskProgress = (task: ProjectTaskRecord) => {
    const totalSubtasks = Number(task.subtasks_total ?? 0);
    const completedSubtasks = Number(task.subtasks_completed ?? 0);

    if (totalSubtasks > 0) {
      return Math.max(0, Math.min(100, Math.round((completedSubtasks / totalSubtasks) * 100)));
    }

    switch (normalizeStatus(task.status)) {
      case 'complete':
        return 100;
      case 'testing':
        return 80;
      case 'waiting-feedback':
        return 90;
      case 'in-progress':
        return 50;
      case 'urgent':
        return 25;
      case 'not-started':
      default:
        return 0;
    }
  };

  const filteredTasks = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (rangeFilter === 'week') {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    if (rangeFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (rangeFilter === 'custom') {
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (rangeFilter !== 'custom') {
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (!start && !end) return tasks;

    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const due = new Date(task.due_date);
      if (start && due < start) return false;
      if (end && due > end) return false;
      return true;
    });
  }, [tasks, rangeFilter, customStart, customEnd]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (rangeFilter === 'week') {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    if (rangeFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (rangeFilter === 'custom') {
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (rangeFilter !== 'custom') {
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (!start && !end) return timeEntries;

    return timeEntries.filter((entry) => {
      if (!entry.start_time) return false;
      const startTime = new Date(entry.start_time);
      if (start && startTime < start) return false;
      if (end && startTime > end) return false;
      return true;
    });
  }, [timeEntries, rangeFilter, customStart, customEnd]);

  const { totalComputedHours, totalTrackedHours, overallHours, weekHours, monthHours } = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    let computedTotal = 0;
    let computedWeek = 0;
    let computedMonth = 0;
    let trackedTotal = 0;
    let trackedWeek = 0;
    let trackedMonth = 0;

    tasks.forEach((task) => {
      const estimated = Number(task.estimated_hours ?? 0);
      const safeEstimated = Number.isFinite(estimated) ? estimated : 0;
      computedTotal += safeEstimated;

      if (task.due_date) {
        const due = new Date(task.due_date);
        if (due >= startOfWeek && due <= endOfWeek) {
          computedWeek += safeEstimated;
        }
        if (due >= startOfMonth && due <= endOfMonth) {
          computedMonth += safeEstimated;
        }
      }
    });

    timeEntries.forEach((entry) => {
      const hours = Number(entry.duration_hours ?? 0);
      const safeHours = Number.isFinite(hours) ? hours : 0;
      trackedTotal += safeHours;

      if (entry.start_time) {
        const startTime = new Date(entry.start_time);
        if (startTime >= startOfWeek && startTime <= endOfWeek) {
          trackedWeek += safeHours;
        }
        if (startTime >= startOfMonth && startTime <= endOfMonth) {
          trackedMonth += safeHours;
        }
      }
    });

    return {
      totalComputedHours: computedTotal,
      totalTrackedHours: trackedTotal,
      overallHours: trackedTotal,
      weekHours: trackedWeek,
      monthHours: trackedMonth,
    };
  }, [tasks, timeEntries]);

  const summaryCards = [
    { title: 'Project Time (Actual)', value: totalTrackedHours.toFixed(2), color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { title: 'Estimated (Total)', value: totalComputedHours.toFixed(2), color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'This Week (Actual)', value: weekHours.toFixed(2), color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { title: 'This Month (Actual)', value: monthHours.toFixed(2), color: 'text-sky-600', bgColor: 'bg-sky-100' },
    { title: 'Overall (Actual)', value: overallHours.toFixed(2), color: 'text-blue-600', bgColor: 'bg-blue-100' }
  ];

  const taskById = useMemo(() => {
    const map = new Map<string, ProjectTaskRecord>();
    tasks.forEach((task) => map.set(String(task.id), task));
    return map;
  }, [tasks]);

  const timerRows = useMemo(() => {
    const buckets = new Map<string, { taskId: string; taskTitle: string; assignee: string; date: string; hours: number }>();

    filteredEntries.forEach((entry) => {
      const task = taskById.get(String(entry.task_id));
      const duration = Number(entry.duration_hours ?? 0);
      const safeHours = Number.isFinite(duration) ? duration : 0;
      const assignee = entry.employee || task?.assignee || 'Unassigned';
      const date = entry.start_time ? entry.start_time.split('T')[0] : '-';
      const taskId = String(entry.task_id);
      const key = `${taskId}__${assignee}__${date}`;
      const current = buckets.get(key);

      if (current) {
        current.hours += safeHours;
      } else {
        buckets.set(key, {
          taskId,
          taskTitle: task?.title || `Task #${entry.task_id}`,
          assignee,
          date,
          hours: safeHours,
        });
      }
    });

    return Array.from(buckets.values()).map((row) => {
      const task = taskById.get(row.taskId);
      return {
        task: row.taskTitle,
        source: 'Timer',
        assignee: row.assignee,
        date: row.date,
        status: task?.status ? String(task.status).replace('-', ' ') : '-',
        progress: task ? `${calculateTaskProgress(task)}%` : '-',
        estimatedHours: task ? `${Number(task.estimated_hours ?? 0)}h` : '-',
        hours: formatHoursToDuration(row.hours),
      };
    });
  }, [filteredEntries, taskById]);

  const displayRows = timerRows;

  const handleExportCsv = () => {
    const headers = ['Task', 'Source', 'Assignee', 'Date', 'Status', 'Progress', 'Estimated Hours', 'Hours'];
    const rows = displayRows.map((row) => [
      row.task,
      row.source,
      row.assignee,
      row.date,
      row.status,
      row.progress,
      row.estimatedHours,
      row.hours,
    ]);

    const csvContent = [headers, ...rows]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-timesheet-${projectId || 'all'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const title = 'Project Timesheet (Timer Entries - Aggregated)';

    doc.setFontSize(14);
    doc.text(title, 14, 14);

    autoTable(doc, {
      startY: 20,
      head: [['Task', 'Source', 'Assignee', 'Date', 'Status', 'Progress', 'Estimated Hours', 'Hours']],
      body: displayRows.map((row) => [
        row.task,
        row.source,
        row.assignee,
        row.date,
        row.status,
        row.progress,
        row.estimatedHours,
        row.hours,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save(`project-timesheet-${projectId || 'all'}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {summaryCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Clock className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{card.value}h</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading timesheets from Supabase...</p>}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600">Date Range</div>
              <Select value={rangeFilter} onValueChange={(value) => setRangeFilter(value as 'all' | 'week' | 'month' | 'custom')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600">Start Date</div>
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600">End Date</div>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timesheet Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time Entries</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPdf}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <span className="text-sm text-slate-500">Timer entries (aggregated).</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Estimated Hours</TableHead>
                <TableHead>Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row, index) => (
                <TableRow key={`${row.source}-${row.task}-${index}`} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{row.task}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{row.source}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{row.assignee}</TableCell>
                  <TableCell className="text-slate-700">{row.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-700">{row.progress}</TableCell>
                  <TableCell className="text-slate-700">{row.estimatedHours}</TableCell>
                  <TableCell className="font-medium">{row.hours}</TableCell>
                </TableRow>
              ))}
              {displayRows.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                    <div className="space-y-2">
                      <p>No timer entries found for the selected range.</p>
                      <p className="text-xs">Start a timer or adjust the date range.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
