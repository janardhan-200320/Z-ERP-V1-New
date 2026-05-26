import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  createProjectTask,
  deleteProjectTask,
  fetchProjectTasks,
  updateProjectTask,
  fetchTaskSubtasks,
  createTaskSubtask,
  updateTaskSubtask,
  deleteTaskSubtask,
  fetchProjectTaskTimeEntries,
  createProjectTaskTimeEntry,
  updateProjectTaskTimeEntry,
  type ProjectTaskRecord,
  type ProjectTaskTimeEntryRecord,
} from '@/lib/supabase-data';
import { CheckSquare, Eye, Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react';

interface ProjectTasksTabProps {
  projectId: string | undefined;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-300' },
  high: { label: 'High', className: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medium', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const statusLabels: Record<string, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  testing: 'Testing',
  'waiting-feedback': 'Waiting Feedback',
  complete: 'Complete',
};

const normalizeStatus = (status: string | undefined) =>
  String(status || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .trim();

export default function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ProjectTaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | number | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | number | null>(null);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [timeEntries, setTimeEntries] = useState<ProjectTaskTimeEntryRecord[]>([]);
  const [timeTotalsByTask, setTimeTotalsByTask] = useState<Record<string, number>>({});
  const [runningTimers, setRunningTimers] = useState<Record<string, { entryId: string | number; startTime: string }>>({});
  const [activeSeconds, setActiveSeconds] = useState<Record<string, number>>({});
  const [viewTask, setViewTask] = useState<ProjectTaskRecord | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
    status: 'not-started',
    estimatedHours: '',
    subtasksCompleted: '',
    subtasksTotal: '',
  });
  const [subtasks, setSubtasks] = useState<Array<{ id: number | string; title: string; completed: boolean }>>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!projectId) return;

    let active = true;
    setIsLoading(true);

    fetchProjectTasks(Number(projectId))
      .then((records) => {
        if (!active) return;
        setTasks(records);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast({
          title: 'Failed to load tasks',
          description: error instanceof Error ? error.message : 'Unable to fetch tasks from Supabase.',
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

  useEffect(() => {
    if (!projectId) return;

    let active = true;

    fetchProjectTaskTimeEntries(Number(projectId))
      .then((entries) => {
        if (!active) return;
        setTimeEntries(entries);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Failed to load time entries', error);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    const totals: Record<string, number> = {};
    timeEntries.forEach((entry) => {
      const taskKey = String(entry.task_id);
      const hours = Number(entry.duration_hours ?? 0);
      totals[taskKey] = (totals[taskKey] || 0) + (Number.isFinite(hours) ? hours : 0);
    });
    setTimeTotalsByTask(totals);
  }, [timeEntries]);

  useEffect(() => {
    const running: Record<string, { entryId: string | number; startTime: string }> = {};
    timeEntries.forEach((entry) => {
      if (!entry.end_time && entry.start_time) {
        running[String(entry.task_id)] = { entryId: entry.id, startTime: entry.start_time };
      }
    });
    setRunningTimers((prev) => (Object.keys(prev).length > 0 ? prev : running));
  }, [timeEntries]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Object.keys(runningTimers).length === 0) return;
      const now = Date.now();
      setActiveSeconds((prev) => {
        const next = { ...prev };
        Object.entries(runningTimers).forEach(([taskId, info]) => {
          const startMs = new Date(info.startTime).getTime();
          if (!Number.isNaN(startMs)) {
            next[taskId] = Math.max(0, Math.floor((now - startMs) / 1000));
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [runningTimers]);

  const validateTaskForm = () => {
    const errors: Record<string, string> = {};
    if (!taskForm.title.trim()) errors.title = 'Task title is required';
    if (!taskForm.assignee.trim()) errors.assignee = 'Assignee is required';
    if (!taskForm.dueDate) errors.dueDate = 'Due date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: '',
      status: 'not-started',
      estimatedHours: '',
      subtasksCompleted: '',
      subtasksTotal: '',
    });
    setEditingTaskId(null);
    setFormErrors({});
    setSubtasks([]);
    setNewSubtaskTitle('');
  };

  const handleSubmitTask = async () => {
    if (isSavingTask) return;
    if (!validateTaskForm()) return;

    setIsSavingTask(true);

    const basePayload = {
      project_id: Number(projectId),
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || null,
      assignee: taskForm.assignee.trim(),
      priority: taskForm.priority,
      status: taskForm.status,
      due_date: taskForm.dueDate,
      estimated_hours: taskForm.estimatedHours || null,
      subtasks_completed: taskForm.subtasksCompleted ? Number(taskForm.subtasksCompleted) : 0,
      subtasks_total: taskForm.subtasksTotal ? Number(taskForm.subtasksTotal) : 0,
    };

    try {
      if (editingTaskId !== null) {
        const record = await updateProjectTask(editingTaskId, basePayload);
        setTasks((prev) => prev.map((task) => (task.id === record.id ? record : task)));
        toast({
          title: 'Task Updated',
          description: 'Task changes saved to Supabase.',
        });
      } else {
        const record = await createProjectTask({
          ...basePayload,
          comments: 0,
          attachments: 0,
        });
        setTasks((prev) => [record, ...prev]);
        toast({
          title: 'Task Created',
          description: 'Task saved to Supabase.',
        });
      }

      setShowTaskDialog(false);
      resetTaskForm();
    } catch (error: unknown) {
      toast({
        title: editingTaskId !== null ? 'Failed to update task' : 'Failed to create task',
        description: error instanceof Error ? error.message : 'Unable to save task.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleQuickUpdateTask = (taskId: string | number, payload: Partial<ProjectTaskRecord>) => {
    setUpdatingTaskId(taskId);

    updateProjectTask(taskId, payload)
      .then((record) => {
        setTasks((prev) => prev.map((task) => (task.id === record.id ? record : task)));
      })
      .catch((error: unknown) => {
        toast({
          title: 'Failed to update task',
          description: error instanceof Error ? error.message : 'Unable to save quick changes.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setUpdatingTaskId(null);
      });
  };

  const handleEditTask = (task: ProjectTaskRecord) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title ?? '',
      description: task.description ?? '',
      assignee: task.assignee ?? '',
      priority: task.priority ?? 'medium',
      dueDate: task.due_date ?? '',
      status: task.status ?? 'not-started',
      estimatedHours: task.estimated_hours == null ? '' : String(task.estimated_hours),
      subtasksCompleted: task.subtasks_completed == null ? '' : String(task.subtasks_completed),
      subtasksTotal: task.subtasks_total == null ? '' : String(task.subtasks_total),
    });
    setFormErrors({});
    setShowTaskDialog(true);
  };

  useEffect(() => {
    async function loadSubtasks() {
      if (!editingTaskId) return;
      try {
        const items = await fetchTaskSubtasks(Number(editingTaskId));
        setSubtasks((items || []).map((s) => ({ id: s.id, title: s.title, completed: Boolean(s.completed) })));
      } catch (err) {
        console.error('Failed to load subtasks', err);
      }
    }

    if (showTaskDialog && editingTaskId !== null) {
      loadSubtasks();
    }
  }, [editingTaskId, showTaskDialog]);

  const handleAddSubtask = async () => {
    if (!editingTaskId || !newSubtaskTitle.trim()) return;
    try {
      await createTaskSubtask({ task_id: Number(editingTaskId), title: newSubtaskTitle.trim(), completed: false });
      setNewSubtaskTitle('');
      const items = await fetchTaskSubtasks(Number(editingTaskId));
      setSubtasks((items || []).map((s) => ({ id: s.id, title: s.title, completed: Boolean(s.completed) })));
      const total = (items || []).length;
      const completed = (items || []).filter((s) => s.completed).length;
      setTaskForm((tf) => ({ ...tf, subtasksCompleted: String(completed), subtasksTotal: String(total) }));
      if (projectId) {
        const fresh = await fetchProjectTasks(Number(projectId));
        setTasks(fresh);
      }
    } catch (err) {
      console.error('Failed to add subtask', err);
      toast({ title: 'Add subtask failed', description: String(err) });
    }
  };

  const handleToggleSubtask = async (subtaskId: number | string, current: boolean) => {
    if (!editingTaskId) return;
    try {
      await updateTaskSubtask(subtaskId, { completed: !current });
      const items = await fetchTaskSubtasks(Number(editingTaskId));
      setSubtasks((items || []).map((s) => ({ id: s.id, title: s.title, completed: Boolean(s.completed) })));
      const total = (items || []).length;
      const completed = (items || []).filter((s) => s.completed).length;
      setTaskForm((tf) => ({ ...tf, subtasksCompleted: String(completed), subtasksTotal: String(total) }));
      if (projectId) {
        const fresh = await fetchProjectTasks(Number(projectId));
        setTasks(fresh);
      }
    } catch (err) {
      console.error('Failed to toggle subtask', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number | string) => {
    if (!editingTaskId) return;
    try {
      await deleteTaskSubtask(subtaskId);
      const items = await fetchTaskSubtasks(Number(editingTaskId));
      setSubtasks((items || []).map((s) => ({ id: s.id, title: s.title, completed: Boolean(s.completed) })));
      const total = (items || []).length;
      const completed = (items || []).filter((s) => s.completed).length;
      setTaskForm((tf) => ({ ...tf, subtasksCompleted: String(completed), subtasksTotal: String(total) }));
      if (projectId) {
        const fresh = await fetchProjectTasks(Number(projectId));
        setTasks(fresh);
      }
    } catch (err) {
      console.error('Failed to delete subtask', err);
    }
  };

  const handleDeleteTask = (task: ProjectTaskRecord) => {
    deleteProjectTask(task.id)
      .then(() => {
        setTasks((prev) => prev.filter((item) => item.id !== task.id));
        toast({
          title: 'Task Deleted',
          description: `${task.title} removed from Supabase.`,
        });
      })
      .catch((error: unknown) => {
        toast({
          title: 'Failed to delete task',
          description: error instanceof Error ? error.message : 'Unable to delete task.',
          variant: 'destructive',
        });
      });
  };

  const formatDuration = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const hrs = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getLiveTrackedSeconds = (taskId: string | number) => {
    const totalHours = timeTotalsByTask[String(taskId)] || 0;
    const extraSeconds = activeSeconds[String(taskId)] || 0;
    return Math.max(0, Math.round(totalHours * 3600) + extraSeconds);
  };

  const getLiveTrackedHours = (taskId: string | number) => getLiveTrackedSeconds(taskId) / 3600;

  const handleStartTimer = async (task: ProjectTaskRecord) => {
    if (!projectId) return;
    const runningTaskIds = Object.keys(runningTimers);
    if (runningTaskIds.length > 0 && !runningTimers[String(task.id)]) {
      toast({
        title: 'Timer already running',
        description: 'Stop the current timer before starting another task.',
        variant: 'destructive',
      });
      return;
    }

    if (runningTimers[String(task.id)]) return;

    const startTime = new Date().toISOString();

    try {
      const entry = await createProjectTaskTimeEntry({
        project_id: Number(projectId),
        task_id: Number(task.id),
        employee: task.assignee || null,
        start_time: startTime,
      });

      setTimeEntries((prev) => [...prev, entry]);
      setRunningTimers((prev) => ({
        ...prev,
        [String(task.id)]: { entryId: entry.id, startTime },
      }));
      setActiveSeconds((prev) => ({ ...prev, [String(task.id)]: 0 }));
    } catch (error: unknown) {
      toast({
        title: 'Failed to start timer',
        description: error instanceof Error ? error.message : 'Unable to start time tracking.',
        variant: 'destructive',
      });
    }
  };

  const handleStopTimer = async (task: ProjectTaskRecord) => {
    const runningInfo = runningTimers[String(task.id)];
    if (!runningInfo) return;

    const endTime = new Date();
    const startMs = new Date(runningInfo.startTime).getTime();
    const durationHours = Number.isNaN(startMs) ? 0 : Math.max(0, (endTime.getTime() - startMs) / 3600000);

    try {
      const updated = await updateProjectTaskTimeEntry(runningInfo.entryId, {
        end_time: endTime.toISOString(),
        duration_hours: Number(durationHours.toFixed(4)),
      });

      setTimeEntries((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
      setRunningTimers((prev) => {
        const next = { ...prev };
        delete next[String(task.id)];
        return next;
      });
      setActiveSeconds((prev) => {
        const next = { ...prev };
        delete next[String(task.id)];
        return next;
      });
    } catch (error: unknown) {
      toast({
        title: 'Failed to stop timer',
        description: error instanceof Error ? error.message : 'Unable to stop time tracking.',
        variant: 'destructive',
      });
    }
  };

  const grouped = useMemo(() => {
    const buckets: Record<string, ProjectTaskRecord[]> = {
      'not-started': [],
      'in-progress': [],
      testing: [],
      'waiting-feedback': [],
      complete: [],
    };

    tasks.forEach((task) => {
      const key = buckets[task.status] ? task.status : 'not-started';
      buckets[key].push(task);
    });

    return buckets;
  }, [tasks]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Project Tasks</h3>
          <p className="text-sm text-slate-600">Live task records from Supabase.</p>
        </div>
        <Button onClick={() => setShowTaskDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading tasks from Supabase...</p>}

      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(grouped).map(([status, entries]) => (
          <Card key={status}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{statusLabels[status] ?? status}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{entries.length}</div>
              <p className="text-xs text-slate-500">tasks</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="w-[240px] text-xs font-semibold uppercase tracking-wide text-slate-600">Task</TableHead>
                <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wide text-slate-600">Assignee</TableHead>
                <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wide text-slate-600">Priority</TableHead>
                <TableHead className="w-[160px] text-xs font-semibold uppercase tracking-wide text-slate-600">Due Date</TableHead>
                <TableHead className="w-[170px] text-xs font-semibold uppercase tracking-wide text-slate-600">Status</TableHead>
                <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wide text-slate-600">Progress</TableHead>
                <TableHead className="w-[160px] text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500">
                    No project tasks yet.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => {
                  const progress = calculateTaskProgress(task);
                  return (
                    <TableRow key={String(task.id)} className="group">
                      <TableCell className="bg-white/90 transition group-hover:bg-slate-50/70 rounded-l-lg border-y border-l border-slate-200/70 py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">{task.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{task.description ?? ''}</div>
                        </div>
                      </TableCell>
                      <TableCell className="bg-white/90 transition group-hover:bg-slate-50/70 border-y border-slate-200/70">
                        <Input
                          defaultValue={task.assignee}
                          onBlur={(e) => {
                            const nextValue = e.target.value.trim();
                            if (nextValue !== (task.assignee ?? '')) {
                              handleQuickUpdateTask(task.id, { assignee: nextValue });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          disabled={updatingTaskId === task.id}
                          className="h-8 rounded-full bg-slate-50/80"
                          placeholder="Enter assignee"
                        />
                      </TableCell>
                      <TableCell className="bg-white/90 transition group-hover:bg-slate-50/70 border-y border-slate-200/70">
                        <Select
                          value={task.priority}
                          onValueChange={(value) => handleQuickUpdateTask(task.id, { priority: value })}
                          disabled={updatingTaskId === task.id}
                        >
                          <SelectTrigger className={`h-8 w-[120px] rounded-full border-2 font-semibold ${priorityConfig[task.priority]?.className ?? 'bg-slate-100'}`}>
                            <SelectValue placeholder={priorityConfig[task.priority]?.label ?? task.priority} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="bg-white/90 transition group-hover:bg-slate-50/70 border-y border-slate-200/70">
                        <Input
                          type="date"
                          defaultValue={task.due_date}
                          onBlur={(e) => {
                            const nextValue = e.target.value;
                            if (nextValue !== (task.due_date ?? '')) {
                              handleQuickUpdateTask(task.id, { due_date: nextValue });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          disabled={updatingTaskId === task.id}
                          className="h-8 rounded-full bg-slate-50/80"
                        />
                      </TableCell>
                      <TableCell className="bg-white/90 transition group-hover:bg-slate-50/70 border-y border-slate-200/70">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleQuickUpdateTask(task.id, { status: value })}
                          disabled={updatingTaskId === task.id}
                        >
                          <SelectTrigger className="h-8 w-[160px] rounded-full bg-slate-50/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="testing">Testing</SelectItem>
                            <SelectItem value="waiting-feedback">Waiting Feedback</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="bg-white/90 transition group-hover:bg-slate-50/70 border-y border-slate-200/70">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                            <span>{progress}%</span>
                            <span className="text-xs text-slate-400">
                              {Number(task.subtasks_completed ?? 0)}/{Number(task.subtasks_total ?? 0)}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-emerald-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-slate-500">
                            Tracked: {formatDuration(getLiveTrackedSeconds(task.id))}
                          </div>
                          {runningTimers[String(task.id)] && (
                            <div className="text-xs text-emerald-600">
                              Running {formatDuration(getLiveTrackedSeconds(task.id))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="bg-white/90 transition group-hover:bg-slate-50/70 rounded-r-lg border-y border-r border-slate-200/70 text-right">
                        <div className="inline-flex items-center justify-end gap-1 rounded-full bg-slate-100/80 p-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setViewTask(task)}>
                            <Eye className="h-4 w-4 text-slate-600" />
                          </Button>
                          {runningTimers[String(task.id)] ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleStopTimer(task)}>
                              <Pause className="h-4 w-4 text-emerald-600" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleStartTimer(task)}>
                              <Play className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEditTask(task)}>
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDeleteTask(task)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showTaskDialog} onOpenChange={(open) => { setShowTaskDialog(open); if (!open) resetTaskForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTaskId !== null ? 'Edit Task' : 'Create Task'}</DialogTitle>
            <DialogDescription>
              {editingTaskId !== null ? 'Update this task record in Supabase.' : 'Save a new task record to Supabase.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className={formErrors.title ? 'border-red-500' : ''} />
              {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Assignee *</Label>
              <Input value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })} className={formErrors.assignee ? 'border-red-500' : ''} />
              {formErrors.assignee && <p className="text-xs text-red-500">{formErrors.assignee}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={taskForm.status} onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="waiting-feedback">Waiting Feedback</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className={formErrors.dueDate ? 'border-red-500' : ''} />
                {formErrors.dueDate && <p className="text-xs text-red-500">{formErrors.dueDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>Estimated Hours</Label>
                <Input type="number" min="0" step="0.5" value={taskForm.estimatedHours} onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Subtasks Completed</Label>
                <Input type="number" min="0" value={taskForm.subtasksCompleted} onChange={(e) => setTaskForm({ ...taskForm, subtasksCompleted: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Subtasks Total</Label>
                <Input type="number" min="0" value={taskForm.subtasksTotal} onChange={(e) => setTaskForm({ ...taskForm, subtasksTotal: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="pt-4">
              <Label>Subtasks</Label>
              <div className="mt-2 space-y-2">
                {subtasks.length === 0 && <div className="text-sm text-slate-500">No subtasks yet. Add one below.</div>}
                {subtasks.map((s) => (
                  <div key={String(s.id)} className="flex items-center space-x-2">
                    <input type="checkbox" checked={s.completed} onChange={() => handleToggleSubtask(s.id, s.completed)} />
                    <div className={`flex-1 text-sm ${s.completed ? 'line-through text-slate-400' : ''}`}>{s.title}</div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSubtask(s.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex space-x-2">
                <Input placeholder="New subtask title" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} />
                <Button onClick={handleAddSubtask}>Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTaskDialog(false); resetTaskForm(); }}>Cancel</Button>
            <Button onClick={handleSubmitTask} disabled={isSavingTask}>
              <CheckSquare className="h-4 w-4 mr-2" />
              {isSavingTask
                ? 'Saving...'
                : editingTaskId !== null
                  ? 'Update Task'
                  : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewTask)} onOpenChange={(open) => { if (!open) setViewTask(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>View task information and tracked time.</DialogDescription>
          </DialogHeader>
          {viewTask && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Title</div>
                <div className="text-base font-semibold text-slate-900">{viewTask.title}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Description</div>
                <div className="text-sm text-slate-700">{viewTask.description || '—'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Assignee</div>
                  <div className="text-slate-900 font-medium">{viewTask.assignee || '—'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Priority</div>
                  <div className="text-slate-900 font-medium capitalize">{viewTask.priority}</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="text-slate-900 font-medium capitalize">{viewTask.status}</div>
                </div>
                <div>
                  <div className="text-slate-500">Due Date</div>
                  <div className="text-slate-900 font-medium">{viewTask.due_date || '—'}</div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-700">Tracked Time</div>
                <div className="text-2xl font-bold text-slate-900">
                  {getLiveTrackedHours(viewTask.id).toFixed(2)}h
                  <span className="ml-2 text-sm font-medium text-slate-500">
                    ({formatDuration(getLiveTrackedSeconds(viewTask.id))})
                  </span>
                </div>
                {runningTimers[String(viewTask.id)] && (
                  <div className="text-xs text-emerald-600">
                    Running {formatDuration(getLiveTrackedSeconds(viewTask.id))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700">Time Entries</div>
                <div className="max-h-48 overflow-auto space-y-2">
                  {timeEntries
                    .filter((entry) => String(entry.task_id) === String(viewTask.id))
                    .map((entry) => (
                      <div key={String(entry.id)} className="rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>{entry.employee || 'Unassigned'}</span>
                          <span>{entry.duration_hours ? `${Number(entry.duration_hours).toFixed(2)}h` : 'Running'}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {entry.start_time} → {entry.end_time || 'In progress'}
                        </div>
                      </div>
                    ))}
                  {timeEntries.filter((entry) => String(entry.task_id) === String(viewTask.id)).length === 0 && (
                    <div className="text-xs text-slate-500">No time entries yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTask(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
