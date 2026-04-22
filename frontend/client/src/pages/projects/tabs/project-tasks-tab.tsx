import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  MessageSquare,
  Paperclip,
  CheckSquare,
  MoreVertical,
  Play,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface ProjectTasksTabProps {
  projectId: string | undefined;
}

type TaskStatus = 'not-started' | 'in-progress' | 'testing' | 'waiting-feedback' | 'complete';
type TaskColumnKey = 'notStarted' | 'inProgress' | 'testing' | 'complete';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low' | 'urgent';
  status: TaskStatus;
  dueDate: string;
  estimatedHours: string;
  subtasks: { completed: number; total: number };
  comments: number;
  attachments: number;
}

interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export default function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const { toast } = useToast();
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeDivision, setActiveDivision] = useState<TaskColumnKey | 'all'>('all');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showTaskDetailsDialog, setShowTaskDetailsDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [taskSubtasks, setTaskSubtasks] = useState<Record<string, SubtaskItem[]>>({});
  const [taskAttachments, setTaskAttachments] = useState<Record<string, File[]>>({});
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskDetailErrors, setTaskDetailErrors] = useState<Record<string, string>>({});
  const [taskDetailForm, setTaskDetailForm] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    status: 'not-started' as TaskStatus,
    estimatedHours: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee: '',
    follower: '',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    status: 'not-started',
    estimatedHours: '',
    attachments: [] as File[]
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<string[]>([
    'John Smith',
    'Sarah Johnson',
    'Mike Brown',
    'Emily Davis',
    'Alex Wilson'
  ]);
  const [showCustomAssigneeInput, setShowCustomAssigneeInput] = useState(false);
  const [showCustomFollowerInput, setShowCustomFollowerInput] = useState(false);
  const [customAssigneeName, setCustomAssigneeName] = useState('');
  const [customFollowerName, setCustomFollowerName] = useState('');

  const statusToColumn: Record<TaskStatus, TaskColumnKey> = {
    'not-started': 'notStarted',
    'in-progress': 'inProgress',
    testing: 'testing',
    'waiting-feedback': 'testing',
    complete: 'complete'
  };

  // Mock tasks data
  const [tasks, setTasks] = useState<{ notStarted: Task[]; inProgress: Task[]; testing: Task[]; complete: Task[] }>({
    notStarted: [
      {
        id: 'T-001',
        title: 'Design homepage wireframes',
        description: 'Create detailed responsive wireframes for home, category, and product pages.',
        assignee: 'Alex Wilson',
        priority: 'high' as const,
        status: 'not-started',
        dueDate: '2026-01-20',
        estimatedHours: '12',
        subtasks: { completed: 2, total: 5 },
        comments: 3,
        attachments: 2
      },
      {
        id: 'T-002',
        title: 'Setup development environment',
        description: 'Configure local setup, dependencies, env vars, and linting tools.',
        assignee: 'Mike Brown',
        priority: 'medium' as const,
        status: 'not-started',
        dueDate: '2026-01-18',
        estimatedHours: '8',
        subtasks: { completed: 1, total: 3 },
        comments: 1,
        attachments: 0
      },
      {
        id: 'T-003',
        title: 'Database schema design',
        description: 'Define normalized schema for products, orders, and customer entities.',
        assignee: 'Emily Davis',
        priority: 'high' as const,
        status: 'not-started',
        dueDate: '2026-01-22',
        estimatedHours: '10',
        subtasks: { completed: 0, total: 4 },
        comments: 5,
        attachments: 1
      }
    ],
    inProgress: [
      {
        id: 'T-004',
        title: 'Implement user authentication',
        description: 'Build signup/login flows with JWT sessions and password reset support.',
        assignee: 'Sarah Johnson',
        priority: 'high' as const,
        status: 'in-progress',
        dueDate: '2026-01-25',
        estimatedHours: '14',
        subtasks: { completed: 3, total: 6 },
        comments: 8,
        attachments: 3
      },
      {
        id: 'T-005',
        title: 'Create product catalog API',
        description: 'Deliver CRUD and search endpoints for product catalog and categories.',
        assignee: 'Emily Davis',
        priority: 'medium' as const,
        status: 'in-progress',
        dueDate: '2026-01-28',
        estimatedHours: '16',
        subtasks: { completed: 2, total: 5 },
        comments: 4,
        attachments: 1
      }
    ],
    testing: [
      {
        id: 'T-008',
        title: 'QA test checkout workflow',
        description: 'Execute checkout test plan for cart, payment gateway, and confirmation pages.',
        assignee: 'Sarah Johnson',
        priority: 'urgent' as const,
        status: 'testing',
        dueDate: '2026-01-26',
        estimatedHours: '6',
        subtasks: { completed: 6, total: 7 },
        comments: 7,
        attachments: 2
      }
    ],
    complete: [
      {
        id: 'T-006',
        title: 'Project requirements gathering',
        description: 'Collect and finalize requirements from stakeholders and client workshops.',
        assignee: 'John Smith',
        priority: 'high' as const,
        status: 'complete',
        dueDate: '2026-01-12',
        estimatedHours: '10',
        subtasks: { completed: 8, total: 8 },
        comments: 12,
        attachments: 5
      },
      {
        id: 'T-007',
        title: 'Setup CI/CD pipeline',
        description: 'Configure build, test, and deployment pipelines with branch protections.',
        assignee: 'Mike Brown',
        priority: 'medium' as const,
        status: 'complete',
        dueDate: '2026-01-15',
        estimatedHours: '9',
        subtasks: { completed: 4, total: 4 },
        comments: 6,
        attachments: 2
      }
    ]
  });

  const priorityConfig: Record<string, { label: string; class: string }> = {
    urgent: { label: 'Urgent', class: 'bg-red-100 text-red-700 border-red-300' },
    high: { label: 'High', class: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: 'Medium', class: 'bg-orange-100 text-orange-700 border-orange-200' },
    low: { label: 'Low', class: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  const statusConfig: Record<TaskStatus, { label: string; class: string }> = {
    'not-started': { label: 'Not Started', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    testing: { label: 'Testing', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    'waiting-feedback': { label: 'Waiting for Feedback', class: 'bg-violet-100 text-violet-700 border-violet-200' },
    complete: { label: 'Complete', class: 'bg-green-100 text-green-700 border-green-200' }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const validateTaskForm = () => {
    const errors: Record<string, string> = {};
    if (!taskForm.title.trim()) errors.title = 'Task title is required';
    if (!taskForm.assignee) errors.assignee = 'Please select an assignee';
    if (!taskForm.startDate) errors.startDate = 'Start date is required';
    if (!taskForm.dueDate) errors.dueDate = 'Due date is required';
    if (taskForm.startDate && taskForm.dueDate && taskForm.dueDate < taskForm.startDate) {
      errors.dueDate = 'Due date cannot be earlier than start date';
    }
    if (taskForm.estimatedHours && (isNaN(Number(taskForm.estimatedHours)) || Number(taskForm.estimatedHours) < 0)) {
      errors.estimatedHours = 'Please enter a valid number of hours';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTaskFormChange = (field: keyof typeof taskForm, value: string | File[]) => {
    setTaskForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'startDate' && typeof value === 'string' && updated.dueDate && updated.dueDate < value) {
        updated.dueDate = value;
      }

      return updated;
    });

    setFormErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;

      const next = { ...prev };

      if (field === 'title' && typeof value === 'string' && value.trim()) delete next.title;
      if (field === 'assignee' && typeof value === 'string' && value) delete next.assignee;
      if (field === 'startDate' && typeof value === 'string' && value) delete next.startDate;
      if (field === 'dueDate' && typeof value === 'string' && value) delete next.dueDate;

      if (field === 'estimatedHours' && typeof value === 'string') {
        if (!value || (!isNaN(Number(value)) && Number(value) >= 0)) {
          delete next.estimatedHours;
        }
      }

      return next;
    });
  };

  const addCustomMember = (rawName: string, target: 'assignee' | 'follower') => {
    const name = rawName.trim();
    if (!name) return;

    const existing = teamMembers.find((member) => member.toLowerCase() === name.toLowerCase());
    const finalName = existing || name;

    if (!existing) {
      setTeamMembers((prev) => [...prev, finalName]);
    }

    handleTaskFormChange(target, finalName);

    if (target === 'assignee') {
      setShowCustomAssigneeInput(false);
      setCustomAssigneeName('');
      return;
    }

    setShowCustomFollowerInput(false);
    setCustomFollowerName('');
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      assignee: '',
      follower: '',
      priority: 'medium',
      startDate: '',
      dueDate: '',
      status: 'not-started',
      estimatedHours: '',
      attachments: []
    });
    setFormErrors({});
    setShowCustomAssigneeInput(false);
    setShowCustomFollowerInput(false);
    setCustomAssigneeName('');
    setCustomFollowerName('');
  };

  const handleCreateTask = () => {
    if (!validateTaskForm()) return;

    const newTask: Task = {
      id: `T-${String(Date.now()).slice(-6)}`,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      assignee: taskForm.assignee,
      priority: taskForm.priority as Task['priority'],
      status: taskForm.status as TaskStatus,
      dueDate: taskForm.dueDate,
      estimatedHours: taskForm.estimatedHours,
      subtasks: { completed: 0, total: 0 },
      comments: 0,
      attachments: taskForm.attachments.length
    };

    const targetColumn = statusToColumn[newTask.status];
    setTasks((prev) => ({
      ...prev,
      [targetColumn]: [newTask, ...prev[targetColumn]]
    }));
    
    toast({
      title: "Task Created",
      description: `Task "${taskForm.title}" has been created successfully.`,
    });
    setShowNewTaskDialog(false);
    resetTaskForm();
  };

  const openTaskDetails = (task: Task) => {
    setTaskSubtasks((prev) => {
      if (prev[task.id]) return prev;

      const generated = Array.from({ length: task.subtasks.total }, (_, index) => ({
        id: `${task.id}-seed-${index + 1}`,
        title: `Subtask ${index + 1}`,
        completed: index < task.subtasks.completed
      }));

      return { ...prev, [task.id]: generated };
    });

    setNewSubtaskTitle('');
  setPendingUploadFiles([]);
    setSelectedTask(task);
    setTaskDetailForm({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
      estimatedHours: task.estimatedHours
    });
    setTaskDetailErrors({});
    setIsEditingTask(false);
    setShowTaskDetailsDialog(true);
  };

  const updateTaskAttachmentCount = (taskId: string, fileCountToAdd: number) => {
    if (fileCountToAdd <= 0) return;

    setTasks((prev) => ({
      notStarted: prev.notStarted.map((task) => task.id === taskId ? { ...task, attachments: task.attachments + fileCountToAdd } : task),
      inProgress: prev.inProgress.map((task) => task.id === taskId ? { ...task, attachments: task.attachments + fileCountToAdd } : task),
      testing: prev.testing.map((task) => task.id === taskId ? { ...task, attachments: task.attachments + fileCountToAdd } : task),
      complete: prev.complete.map((task) => task.id === taskId ? { ...task, attachments: task.attachments + fileCountToAdd } : task)
    }));

    setSelectedTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      return { ...prev, attachments: prev.attachments + fileCountToAdd };
    });
  };

  const handleUploadTaskFiles = () => {
    if (!selectedTask) return;
    if (pendingUploadFiles.length === 0) return;

    setTaskAttachments((prev) => ({
      ...prev,
      [selectedTask.id]: [...(prev[selectedTask.id] || []), ...pendingUploadFiles]
    }));

    updateTaskAttachmentCount(selectedTask.id, pendingUploadFiles.length);

    toast({
      title: 'Files Uploaded',
      description: `${pendingUploadFiles.length} file(s) uploaded to task ${selectedTask.id}.`
    });

    setPendingUploadFiles([]);
  };

  const validateTaskDetailForm = () => {
    const errors: Record<string, string> = {};
    if (!taskDetailForm.title.trim()) errors.title = 'Task title is required';
    if (!taskDetailForm.assignee.trim()) errors.assignee = 'Assignee is required';
    if (!taskDetailForm.dueDate) errors.dueDate = 'Due date is required';
    if (taskDetailForm.estimatedHours && (isNaN(Number(taskDetailForm.estimatedHours)) || Number(taskDetailForm.estimatedHours) < 0)) {
      errors.estimatedHours = 'Please enter a valid number of hours';
    }
    setTaskDetailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const recalculateSubtaskSummary = (items: SubtaskItem[]) => ({
    completed: items.filter((item) => item.completed).length,
    total: items.length
  });

  const updateTaskSubtaskCounts = (taskId: string, items: SubtaskItem[]) => {
    const summary = recalculateSubtaskSummary(items);

    setTasks((prev) => ({
      notStarted: prev.notStarted.map((task) => task.id === taskId ? { ...task, subtasks: summary } : task),
      inProgress: prev.inProgress.map((task) => task.id === taskId ? { ...task, subtasks: summary } : task),
      testing: prev.testing.map((task) => task.id === taskId ? { ...task, subtasks: summary } : task),
      complete: prev.complete.map((task) => task.id === taskId ? { ...task, subtasks: summary } : task)
    }));

    setSelectedTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      return { ...prev, subtasks: summary };
    });
  };

  const handleAddSubtask = () => {
    if (!selectedTask) return;
    const title = newSubtaskTitle.trim();
    if (!title) return;

    const created: SubtaskItem = {
      id: `${selectedTask.id}-sub-${Date.now()}`,
      title,
      completed: false
    };

    setTaskSubtasks((prev) => {
      const current = prev[selectedTask.id] || [];
      const updated = [...current, created];
      updateTaskSubtaskCounts(selectedTask.id, updated);
      return { ...prev, [selectedTask.id]: updated };
    });

    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subtaskId: string, checked: boolean) => {
    if (!selectedTask) return;

    setTaskSubtasks((prev) => {
      const current = prev[selectedTask.id] || [];
      const updated = current.map((item) => item.id === subtaskId ? { ...item, completed: checked } : item);
      updateTaskSubtaskCounts(selectedTask.id, updated);
      return { ...prev, [selectedTask.id]: updated };
    });
  };

  const saveTaskDetails = () => {
    if (!selectedTask) return;
    if (!validateTaskDetailForm()) return;

    const updatedTask: Task = {
      ...selectedTask,
      title: taskDetailForm.title.trim(),
      description: taskDetailForm.description.trim(),
      assignee: taskDetailForm.assignee.trim(),
      priority: taskDetailForm.priority,
      dueDate: taskDetailForm.dueDate,
      status: taskDetailForm.status,
      estimatedHours: taskDetailForm.estimatedHours
    };

    setTasks((prev) => {
      const next = {
        notStarted: prev.notStarted.filter((task) => task.id !== selectedTask.id),
        inProgress: prev.inProgress.filter((task) => task.id !== selectedTask.id),
        testing: prev.testing.filter((task) => task.id !== selectedTask.id),
        complete: prev.complete.filter((task) => task.id !== selectedTask.id)
      };

      const destination = statusToColumn[updatedTask.status];
      next[destination] = [updatedTask, ...next[destination]];
      return next;
    });

    setSelectedTask(updatedTask);
    setIsEditingTask(false);
    toast({
      title: 'Task Updated',
      description: `Task "${updatedTask.title}" has been updated successfully.`
    });
  };

  const handleMoveToInProgress = (task: Task) => {
    const updatedTask = { ...task, status: 'in-progress' as TaskStatus };
    setTasks((prev) => {
      const next = {
        notStarted: prev.notStarted.filter((item) => item.id !== task.id),
        inProgress: prev.inProgress.filter((item) => item.id !== task.id),
        testing: prev.testing.filter((item) => item.id !== task.id),
        complete: prev.complete.filter((item) => item.id !== task.id)
      };
      next.inProgress = [updatedTask, ...next.inProgress];
      return next;
    });
    toast({
      title: "Task Moved",
      description: `"${task.title}" has been moved to In Progress.`,
    });
  };

  const handleMoveToTesting = (task: Task) => {
    const updatedTask = { ...task, status: 'testing' as TaskStatus };
    setTasks((prev) => {
      const next = {
        notStarted: prev.notStarted.filter((item) => item.id !== task.id),
        inProgress: prev.inProgress.filter((item) => item.id !== task.id),
        testing: prev.testing.filter((item) => item.id !== task.id),
        complete: prev.complete.filter((item) => item.id !== task.id)
      };
      next.testing = [updatedTask, ...next.testing];
      return next;
    });
    toast({
      title: "Task Moved",
      description: `"${task.title}" has been moved to Testing.`,
    });
  };

  const handleMoveToComplete = (task: Task) => {
    const updatedTask = { ...task, status: 'complete' as TaskStatus };
    setTasks((prev) => {
      const next = {
        notStarted: prev.notStarted.filter((item) => item.id !== task.id),
        inProgress: prev.inProgress.filter((item) => item.id !== task.id),
        testing: prev.testing.filter((item) => item.id !== task.id),
        complete: prev.complete.filter((item) => item.id !== task.id)
      };
      next.complete = [updatedTask, ...next.complete];
      return next;
    });
    toast({
      title: "Task Completed",
      description: `"${task.title}" has been marked as complete.`,
    });
  };

  const handleDeleteTask = (task: Task) => {
    setTasks((prev) => ({
      notStarted: prev.notStarted.filter((item) => item.id !== task.id),
      inProgress: prev.inProgress.filter((item) => item.id !== task.id),
      testing: prev.testing.filter((item) => item.id !== task.id),
      complete: prev.complete.filter((item) => item.id !== task.id)
    }));

    if (selectedTask?.id === task.id) {
      setShowTaskDetailsDialog(false);
      setSelectedTask(null);
      setIsEditingTask(false);
      setTaskDetailErrors({});
    }

    toast({
      title: "Task Deleted",
      description: `"${task.title}" has been deleted.`,
      variant: "destructive",
    });
  };

  const hasRequiredTaskFields = Boolean(
    taskForm.title.trim() &&
    taskForm.assignee &&
    taskForm.startDate &&
    taskForm.dueDate
  );
  const hasValidDateRange = !taskForm.startDate || !taskForm.dueDate || taskForm.dueDate >= taskForm.startDate;
  const hasValidHours = !taskForm.estimatedHours || (!isNaN(Number(taskForm.estimatedHours)) && Number(taskForm.estimatedHours) >= 0);
  const canCreateTask = hasRequiredTaskFields && hasValidDateRange && hasValidHours;

  const matchesFilters = (task: Task) => {
    const assigneeMatches = assigneeFilter === 'all' || task.assignee === assigneeFilter;
    const priorityMatches = priorityFilter === 'all' || task.priority === priorityFilter;
    return assigneeMatches && priorityMatches;
  };

  const tasksByStatus = {
    notStarted: tasks.notStarted.filter(matchesFilters),
    inProgress: tasks.inProgress.filter(matchesFilters),
    testing: tasks.testing.filter(matchesFilters),
    complete: tasks.complete.filter(matchesFilters)
  };

  const allTaskRows: Array<{ task: Task; column: TaskColumnKey; division: string }> = [
    ...tasksByStatus.notStarted.map((task) => ({ task, column: 'notStarted' as const, division: 'Not Started' })),
    ...tasksByStatus.inProgress.map((task) => ({ task, column: 'inProgress' as const, division: 'In Progress' })),
    ...tasksByStatus.testing.map((task) => ({ task, column: 'testing' as const, division: 'Testing' })),
    ...tasksByStatus.complete.map((task) => ({ task, column: 'complete' as const, division: 'Complete' }))
  ];

  const visibleTaskRows = activeDivision === 'all'
    ? allTaskRows
    : allTaskRows.filter(({ column }) => column === activeDivision);

  return (
    <div className="space-y-6">
      {/* Header with New Task Button */}
      <div className="flex items-center justify-end">
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          onClick={() => {
            resetTaskForm();
            setShowNewTaskDialog(true);
          }}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member} value={member}>{member}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Four Divisions */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Button
          type="button"
          variant="outline"
          className={`h-auto justify-between rounded-xl px-6 py-5 ${activeDivision === 'notStarted' ? 'border-slate-400 bg-slate-100 text-slate-900' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
          onClick={() => setActiveDivision((prev) => prev === 'notStarted' ? 'all' : 'notStarted')}
        >
          <span className="text-3xl font-semibold">Not Started</span>
          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">{tasksByStatus.notStarted.length}</Badge>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-auto justify-between rounded-xl px-6 py-5 ${activeDivision === 'inProgress' ? 'border-blue-400 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
          onClick={() => setActiveDivision((prev) => prev === 'inProgress' ? 'all' : 'inProgress')}
        >
          <span className="text-3xl font-semibold">In Progress</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">{tasksByStatus.inProgress.length}</Badge>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-auto justify-between rounded-xl px-6 py-5 ${activeDivision === 'testing' ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
          onClick={() => setActiveDivision((prev) => prev === 'testing' ? 'all' : 'testing')}
        >
          <span className="text-3xl font-semibold">Testing</span>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">{tasksByStatus.testing.length}</Badge>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-auto justify-between rounded-xl px-6 py-5 ${activeDivision === 'complete' ? 'border-green-400 bg-green-50 text-green-900' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
          onClick={() => setActiveDivision((prev) => prev === 'complete' ? 'all' : 'complete')}
        >
          <span className="text-3xl font-semibold">Complete</span>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">{tasksByStatus.complete.length}</Badge>
        </Button>
      </div>

      {/* Enhanced Task Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-200 bg-slate-50/60">
          <CardTitle className="text-base">Tasks Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Division</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Subtasks</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTaskRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-28 text-center text-slate-500">
                      No tasks found for current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleTaskRows.map(({ task, column, division }) => (
                    <TableRow key={task.id} className="hover:bg-slate-50">
                      <TableCell>
                        <Badge variant="outline" className={statusConfig[task.status].class}>{division}</Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          className="text-left font-medium text-slate-900 hover:text-blue-700"
                          onClick={() => openTaskDetails(task)}
                        >
                          {task.title}
                        </button>
                        <p className="text-xs text-slate-500">{task.id}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityConfig[task.priority].class}>{priorityConfig[task.priority].label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{getInitials(task.assignee)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-slate-700">{task.assignee}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">{task.dueDate}</TableCell>
                      <TableCell className="text-slate-700">{task.subtasks.completed}/{task.subtasks.total}</TableCell>
                      <TableCell className="text-slate-700">{task.comments}</TableCell>
                      <TableCell className="text-slate-700">{task.attachments}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openTaskDetails(task)}>View Details</DropdownMenuItem>
                            {column === 'notStarted' && (
                              <>
                                <DropdownMenuItem onClick={() => handleMoveToInProgress(task)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Convert to In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMoveToTesting(task)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Convert to Testing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMoveToComplete(task)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Convert to Complete
                                </DropdownMenuItem>
                              </>
                            )}
                            {column === 'inProgress' && (
                              <>
                                <DropdownMenuItem onClick={() => handleMoveToTesting(task)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Convert to Testing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMoveToComplete(task)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Convert to Complete
                                </DropdownMenuItem>
                              </>
                            )}
                            {column === 'testing' && (
                              <>
                                <DropdownMenuItem onClick={() => handleMoveToInProgress(task)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Convert to In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMoveToComplete(task)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Convert to Complete
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteTask(task)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetailsDialog} onOpenChange={(open) => {
        setShowTaskDetailsDialog(open);
        if (!open) {
          setIsEditingTask(false);
          setTaskDetailErrors({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>View complete task information and edit when needed.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] pr-2">
            {selectedTask && (
              <div className="grid gap-4 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={priorityConfig[taskDetailForm.priority].class}>
                    {priorityConfig[taskDetailForm.priority].label}
                  </Badge>
                  <Badge variant="outline" className={statusConfig[taskDetailForm.status].class}>
                    {statusConfig[taskDetailForm.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">Task ID: {selectedTask.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="detail-title">Task Title *</Label>
                  <Input
                    id="detail-title"
                    value={taskDetailForm.title}
                    onChange={(e) => setTaskDetailForm({ ...taskDetailForm, title: e.target.value })}
                    disabled={!isEditingTask}
                    className={taskDetailErrors.title ? 'border-red-500' : ''}
                  />
                  {taskDetailErrors.title && <p className="text-xs text-red-500">{taskDetailErrors.title}</p>}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="detail-description">Description</Label>
                  <Textarea
                    id="detail-description"
                    rows={4}
                    value={taskDetailForm.description}
                    onChange={(e) => setTaskDetailForm({ ...taskDetailForm, description: e.target.value })}
                    disabled={!isEditingTask}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail-assignee">Assignee *</Label>
                  <Input
                    id="detail-assignee"
                    value={taskDetailForm.assignee}
                    onChange={(e) => setTaskDetailForm({ ...taskDetailForm, assignee: e.target.value })}
                    disabled={!isEditingTask}
                    className={taskDetailErrors.assignee ? 'border-red-500' : ''}
                  />
                  {taskDetailErrors.assignee && <p className="text-xs text-red-500">{taskDetailErrors.assignee}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail-priority">Priority</Label>
                  <Select
                    value={taskDetailForm.priority}
                    onValueChange={(value: Task['priority']) => setTaskDetailForm({ ...taskDetailForm, priority: value })}
                    disabled={!isEditingTask}
                  >
                    <SelectTrigger id="detail-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail-dueDate">Due Date *</Label>
                  <Input
                    id="detail-dueDate"
                    type="date"
                    value={taskDetailForm.dueDate}
                    onChange={(e) => setTaskDetailForm({ ...taskDetailForm, dueDate: e.target.value })}
                    disabled={!isEditingTask}
                    className={taskDetailErrors.dueDate ? 'border-red-500' : ''}
                  />
                  {taskDetailErrors.dueDate && <p className="text-xs text-red-500">{taskDetailErrors.dueDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail-estimatedHours">Estimated Hours</Label>
                  <Input
                    id="detail-estimatedHours"
                    type="number"
                    value={taskDetailForm.estimatedHours}
                    onChange={(e) => setTaskDetailForm({ ...taskDetailForm, estimatedHours: e.target.value })}
                    disabled={!isEditingTask}
                    className={taskDetailErrors.estimatedHours ? 'border-red-500' : ''}
                  />
                  {taskDetailErrors.estimatedHours && <p className="text-xs text-red-500">{taskDetailErrors.estimatedHours}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail-status">Status</Label>
                  <Select
                    value={taskDetailForm.status}
                    onValueChange={(value: TaskStatus) => setTaskDetailForm({ ...taskDetailForm, status: value })}
                    disabled={!isEditingTask}
                  >
                    <SelectTrigger id="detail-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Mark as Not Started</SelectItem>
                      <SelectItem value="in-progress">Mark as In Progress</SelectItem>
                      <SelectItem value="testing">Mark as Testing</SelectItem>
                      <SelectItem value="complete">Mark as complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 rounded-md border border-slate-200 p-3 bg-white">
                <Label htmlFor="new-subtask">Sub Tasks</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="new-subtask"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a sub task"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSubtask}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-auto pr-1">
                  {(taskSubtasks[selectedTask.id] || []).length === 0 ? (
                    <p className="text-xs text-slate-500">No subtasks yet. Add one above.</p>
                  ) : (
                    taskSubtasks[selectedTask.id].map((item) => (
                      <div key={item.id} className="flex items-center gap-2 rounded border border-slate-200 px-2 py-1.5">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) => toggleSubtask(item.id, checked === true)}
                        />
                        <p className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.title}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2 rounded-md border border-slate-200 p-3 bg-white">
                <Label htmlFor="task-detail-attachments">Task Files</Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    id="task-detail-attachments"
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setPendingUploadFiles(files);
                    }}
                    className="cursor-pointer border-blue-200 bg-blue-50/50 text-blue-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 focus-visible:ring-blue-500"
                  />
                  <Button type="button" onClick={handleUploadTaskFiles} disabled={pendingUploadFiles.length === 0}>
                    Upload
                  </Button>
                </div>
                <p className={`text-xs ${pendingUploadFiles.length > 0 ? 'text-blue-700' : 'text-blue-600'}`}>
                  {pendingUploadFiles.length > 0
                    ? `${pendingUploadFiles.length} file(s) selected for upload`
                    : 'Choose file(s) and click Upload'}
                </p>
                {(taskAttachments[selectedTask.id] || []).length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-auto pr-1">
                    {(taskAttachments[selectedTask.id] || []).map((file, index) => (
                      <p key={`${file.name}-${index}`} className="text-xs text-slate-600 truncate">
                        {file.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTaskDetailsDialog(false);
              setIsEditingTask(false);
              setTaskDetailErrors({});
            }}>
              Close
            </Button>
            {!isEditingTask ? (
              <Button onClick={() => setIsEditingTask(true)}>
                Edit Task
              </Button>
            ) : (
              <Button onClick={saveTaskDetails}>
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog
        open={showNewTaskDialog}
        onOpenChange={(open) => {
          setShowNewTaskDialog(open);
          if (!open) {
            resetTaskForm();
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 bg-slate-50/70">
            <DialogTitle className="text-2xl">Create New Task</DialogTitle>
            <DialogDescription>Add a new task to this project.</DialogDescription>
            <p className="text-xs text-slate-500">Fields marked with * are required.</p>
          </DialogHeader>
          <ScrollArea className="max-h-[68vh] px-6">
          <div className="grid gap-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(e) => handleTaskFormChange('title', e.target.value)}
                placeholder="Enter task title"
                className={formErrors.title ? 'border-red-500' : ''}
              />
              {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskForm.description}
                onChange={(e) => handleTaskFormChange('description', e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee *</Label>
                <Select
                  value={taskForm.assignee}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setShowCustomAssigneeInput(true);
                      return;
                    }

                    setShowCustomAssigneeInput(false);
                    setCustomAssigneeName('');
                    handleTaskFormChange('assignee', value);
                  }}
                >
                  <SelectTrigger className={formErrors.assignee ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {showCustomAssigneeInput && (
                  <div className="flex gap-2">
                    <Input
                      value={customAssigneeName}
                      onChange={(e) => setCustomAssigneeName(e.target.value)}
                      placeholder="Enter custom assignee name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomMember(customAssigneeName, 'assignee');
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => addCustomMember(customAssigneeName, 'assignee')}>
                      Add
                    </Button>
                  </div>
                )}
                {formErrors.assignee && <p className="text-xs text-red-500">{formErrors.assignee}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => handleTaskFormChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-startDate">Start Date *</Label>
                <Input
                  id="task-startDate"
                  type="date"
                  value={taskForm.startDate}
                  onChange={(e) => handleTaskFormChange('startDate', e.target.value)}
                  max={taskForm.dueDate || undefined}
                  className={formErrors.startDate ? 'border-red-500' : ''}
                />
                {formErrors.startDate && <p className="text-xs text-red-500">{formErrors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-dueDate">Due Date *</Label>
                <Input
                  id="task-dueDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => handleTaskFormChange('dueDate', e.target.value)}
                  min={taskForm.startDate || undefined}
                  className={formErrors.dueDate ? 'border-red-500' : ''}
                />
                {formErrors.dueDate && <p className="text-xs text-red-500">{formErrors.dueDate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-hours">Estimated Hours</Label>
                <Input
                  id="task-hours"
                  type="number"
                  value={taskForm.estimatedHours}
                  onChange={(e) => handleTaskFormChange('estimatedHours', e.target.value)}
                  placeholder="e.g., 8"
                  className={formErrors.estimatedHours ? 'border-red-500' : ''}
                />
                {formErrors.estimatedHours && <p className="text-xs text-red-500">{formErrors.estimatedHours}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select value={taskForm.status} onValueChange={(value) => handleTaskFormChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Mark as Not Started</SelectItem>
                    <SelectItem value="in-progress">Mark as In Progress</SelectItem>
                    <SelectItem value="testing">Mark as Testing</SelectItem>
                    <SelectItem value="waiting-feedback">Mark as Waiting for Feedback</SelectItem>
                    <SelectItem value="complete">Mark as complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-follower">Follower</Label>
              <Select
                value={taskForm.follower}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setShowCustomFollowerInput(true);
                    return;
                  }

                  setShowCustomFollowerInput(false);
                  setCustomFollowerName('');
                  handleTaskFormChange('follower', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select follower" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member} value={member}>{member}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {showCustomFollowerInput && (
                <div className="flex gap-2">
                  <Input
                    value={customFollowerName}
                    onChange={(e) => setCustomFollowerName(e.target.value)}
                    placeholder="Enter custom follower name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomMember(customFollowerName, 'follower');
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => addCustomMember(customFollowerName, 'follower')}>
                    Add
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-attachments">Attach File</Label>
              <Input
                id="task-attachments"
                type="file"
                multiple
                className="cursor-pointer border-blue-200 bg-blue-50/50 text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 focus-visible:ring-blue-500"
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  handleTaskFormChange('attachments', files);
                }}
              />
              <p className={`text-xs ${taskForm.attachments.length > 0 ? 'text-blue-700' : 'text-slate-500'}`}>
                {taskForm.attachments.length > 0
                  ? `${taskForm.attachments.length} file(s) selected`
                  : 'No file selected'}
              </p>
            </div>
          </div>
          </ScrollArea>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-slate-200 bg-white">
            <Button variant="outline" onClick={() => { setShowNewTaskDialog(false); resetTaskForm(); }}>
              Cancel
            </Button>
            <Button className="min-w-32" onClick={handleCreateTask} disabled={!canCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
