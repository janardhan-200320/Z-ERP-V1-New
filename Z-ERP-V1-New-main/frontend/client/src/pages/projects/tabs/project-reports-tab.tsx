import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Download, FileText, TrendingUp, TrendingDown, IndianRupee, Clock } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { fetchProjectMilestones, fetchProjectTasks, type ProjectMilestoneRecord, type ProjectTaskRecord } from '@/lib/supabase-data';

interface ProjectReportsTabProps {
  projectId: string | undefined;
}

export default function ProjectReportsTab({ projectId }: ProjectReportsTabProps) {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [milestones, setMilestones] = useState<ProjectMilestoneRecord[]>([]);
  const [tasks, setTasks] = useState<ProjectTaskRecord[]>([]);

  useEffect(() => {
    if (!projectId) return;

    let active = true;

    Promise.all([
      fetchProjectMilestones(Number(projectId)),
      fetchProjectTasks(Number(projectId)),
    ])
      .then(([milestoneRecords, taskRecords]) => {
        if (!active) return;
        setMilestones(milestoneRecords);
        setTasks(taskRecords);
      })
      .catch(() => {
        if (!active) return;
        setMilestones([]);
        setTasks([]);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  const normalizeStatus = (status: string | undefined) =>
    String(status || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .trim();

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
    if (!dateRange || dateRange === 'all') return tasks;

    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (dateRange === 'week') {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    if (dateRange === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (dateRange === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (dateRange === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
    }

    if (dateRange === 'custom') {
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    }

    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const due = new Date(task.due_date);
      if (start && due < start) return false;
      if (end && due > end) return false;
      return true;
    });
  }, [tasks, dateRange, customStart, customEnd]);

  const totalComputedHours = useMemo(() => {
    return filteredTasks.reduce((sum, task) => {
      const estimated = Number(task.estimated_hours ?? 0);
      const progress = calculateTaskProgress(task);
      return sum + Math.round(estimated * (progress / 100) * 100) / 100;
    }, 0);
  }, [filteredTasks]);

  const kpiSummary = useMemo(() => {
    const completedMilestones = milestones.filter((milestone) => milestone.status === 'completed').length;
    const completedTasks = filteredTasks.filter((task) => normalizeStatus(task.status) === 'complete').length;
    const averageMilestoneProgress = milestones.length
      ? Math.round(milestones.reduce((sum, milestone) => sum + Number(milestone.progress || 0), 0) / milestones.length)
      : 0;

    return [
      {
        title: 'Budget Utilization',
        value: `${projectId ? 'Live' : '—'}`,
        trend: 'up',
        change: `${completedMilestones}/${milestones.length || 1} milestones`,
        icon: IndianRupee,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        title: 'Time Logged',
        value: `${totalComputedHours.toFixed(1)}h`,
        trend: 'up',
        change: `${filteredTasks.length} tasks`,
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Task Completion',
        value: `${completedTasks}/${filteredTasks.length || 1}`,
        trend: 'up',
        change: `${Math.round((completedTasks / Math.max(filteredTasks.length, 1)) * 100)}% complete`,
        icon: BarChart3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        title: 'Milestone Health',
        value: `${averageMilestoneProgress}%`,
        trend: averageMilestoneProgress >= 50 ? 'up' : 'down',
        change: `${milestones.length} milestones`,
        icon: TrendingUp,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
    ];
  }, [milestones, filteredTasks, totalComputedHours, projectId]);

  const exportRows = filteredTasks.map((task) => {
    const progress = calculateTaskProgress(task);
    const estimated = Number(task.estimated_hours ?? 0);
    const computedHours = Math.round(estimated * (progress / 100) * 100) / 100;

    return [
      task.title,
      task.assignee || 'Unassigned',
      task.due_date || '-',
      String(task.status || '').replace('-', ' '),
      `${progress}%`,
      `${estimated}h`,
      `${computedHours}h`,
    ];
  });

  const handleExportPdf = () => {
    exportToPDF(
      'Project Report',
      ['Task', 'Assignee', 'Due Date', 'Status', 'Progress', 'Estimated Hours', 'Computed Hours'],
      exportRows,
      `project-report-${projectId || 'all'}`
    );
  };

  const handleExportCsv = () => {
    const data = exportRows.map((row) => ({
      task: row[0],
      assignee: row[1],
      due_date: row[2],
      status: row[3],
      progress: row[4],
      estimated_hours: row[5],
      computed_hours: row[6],
    }));
    exportToExcel(data, `project-report-${projectId || 'all'}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Project Summary</SelectItem>
                  <SelectItem value="budget">Budget Analysis</SelectItem>
                  <SelectItem value="time">Time Tracking</SelectItem>
                  <SelectItem value="performance">Team Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} disabled={dateRange !== 'custom'} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} disabled={dateRange !== 'custom'} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <FileText className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiSummary.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{kpi.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Project Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-lg border p-4">
              <p className="text-slate-500">Milestones</p>
              <p className="text-2xl font-semibold">{milestones.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-slate-500">Tasks</p>
              <p className="text-2xl font-semibold">{tasks.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-slate-500">Timesheets</p>
              <p className="text-2xl font-semibold">{filteredTasks.length}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            This tab now reflects live Supabase-backed project data instead of fixed demo metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
