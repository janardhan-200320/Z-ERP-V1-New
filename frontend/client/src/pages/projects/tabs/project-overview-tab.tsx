import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import {
  fetchProjectMilestones,
  fetchProjectTasks,
  fetchProjectTaskTimeEntries,
  type ProjectMilestoneRecord,
  type ProjectTaskRecord,
  type ProjectTaskTimeEntryRecord,
} from '@/lib/supabase-data';

interface ProjectOverviewTabProps {
  project: any;
}

export default function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const [milestones, setMilestones] = useState<ProjectMilestoneRecord[]>([]);
  const [tasks, setTasks] = useState<ProjectTaskRecord[]>([]);
  const [timeEntries, setTimeEntries] = useState<ProjectTaskTimeEntryRecord[]>([]);

  useEffect(() => {
    if (!project?.id) return;

    let active = true;

    Promise.all([
      fetchProjectMilestones(Number(project.id)),
      fetchProjectTasks(Number(project.id)),
      fetchProjectTaskTimeEntries(Number(project.id)),
    ])
      .then(([milestoneRecords, taskRecords, entryRecords]) => {
        if (!active) return;
        setMilestones(milestoneRecords);
        setTasks(taskRecords);
        setTimeEntries(entryRecords);
      })
      .catch(() => {
        if (!active) return;
        setMilestones([]);
        setTasks([]);
        setTimeEntries([]);
      });

    return () => {
      active = false;
    };
  }, [project?.id]);

  const calculateTaskProgress = (task: ProjectTaskRecord) => {
    const totalSubtasks = Number(task.subtasks_total ?? 0);
    const completedSubtasks = Number(task.subtasks_completed ?? 0);

    if (totalSubtasks > 0) {
      return Math.max(0, Math.min(100, Math.round((completedSubtasks / totalSubtasks) * 100)));
    }

    switch (task.status) {
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

  const calculateMilestoneProgress = (milestone: ProjectMilestoneRecord) => {
    if (typeof milestone.progress === 'number') {
      return Math.max(0, Math.min(100, milestone.progress));
    }

    switch (milestone.status) {
      case 'completed':
        return 100;
      case 'in-progress':
        return 50;
      case 'pending':
      default:
        return 0;
    }
  };

  const calculatedTaskProgress = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + calculateTaskProgress(task), 0) / tasks.length)
    : 0;

  const calculatedMilestoneProgress = milestones.length
    ? Math.round(milestones.reduce((sum, milestone) => sum + calculateMilestoneProgress(milestone), 0) / milestones.length)
    : 0;

  const calculatedProgress = (() => {
    const hasTasks = tasks.length > 0;
    const hasMilestones = milestones.length > 0;

    if (!hasTasks && !hasMilestones) {
      return Number(project.progress ?? 0);
    }

    if (hasTasks && hasMilestones) {
      return Math.round((calculatedTaskProgress + calculatedMilestoneProgress) / 2);
    }

    return hasTasks ? calculatedTaskProgress : calculatedMilestoneProgress;
  })();

  const displayedProgress = project?.calculate_progress === false
    ? Number(project.progress ?? 0)
    : calculatedProgress;

  const formatHoursToDuration = (hours: number) => {
    const safeHours = Number.isFinite(hours) ? hours : 0;
    const totalSeconds = Math.max(0, Math.round(safeHours * 3600));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalTrackedHours = timeEntries.reduce((sum, entry) => {
    const hours = Number(entry.duration_hours ?? 0);
    return sum + (Number.isFinite(hours) ? hours : 0);
  }, 0);

  const totalComputedHours = tasks.reduce((sum, task) => {
    const estimated = Number(task.estimated_hours ?? 0);
    const progress = calculateTaskProgress(task);
    const computedHours = Math.round(estimated * (progress / 100) * 100) / 100;
    return sum + computedHours;
  }, 0);

  const overallProjectHours = totalTrackedHours;

  const stats = [
    {
      title: 'Progress',
      value: `${displayedProgress}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Project Time',
      value: `${overallProjectHours.toFixed(2)}h (${formatHoursToDuration(overallProjectHours)})`,
      icon: Clock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Team Members',
      value: project.teamMembers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const statusConfig: Record<string, { label: string; class: string }> = {
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700 border-green-200' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    pending: { label: 'Pending', class: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              {stat.title === 'Progress' && (
                <div className="mt-3 space-y-2">
                  <Progress value={displayedProgress} className="h-2" />
                  <p className="text-xs text-slate-500">
                    {project?.calculate_progress === false
                      ? 'Manual progress stored in Supabase'
                      : `Auto-calculated from ${tasks.length} tasks and ${milestones.length} milestones`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Milestones Section */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((milestone) => (
                <TableRow key={String(milestone.id)} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{milestone.id}</TableCell>
                  <TableCell>{milestone.title}</TableCell>
                  <TableCell className="text-slate-600">{milestone.start_date ?? '—'}</TableCell>
                  <TableCell className="text-slate-600">{milestone.targetDate ?? milestone.target_date ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[milestone.status].class}>
                      {statusConfig[milestone.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
