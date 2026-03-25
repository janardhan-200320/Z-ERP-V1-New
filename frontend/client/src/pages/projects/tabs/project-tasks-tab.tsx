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
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Filter,
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

type TaskStatus = 'not-started' | 'in-progress' | 'testing' | 'complete';
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
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showTaskDetailsDialog, setShowTaskDetailsDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [taskSubtasks, setTaskSubtasks] = useState<Record<string, SubtaskItem[]>>({});
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
    priority: 'medium',
    dueDate: '',
    status: 'not-started',
    estimatedHours: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const statusToColumn: Record<TaskStatus, TaskColumnKey> = {
    'not-started': 'notStarted',
    'in-progress': 'inProgress',
    testing: 'testing',
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
    complete: { label: 'Complete', class: 'bg-green-100 text-green-700 border-green-200' }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const validateTaskForm = () => {
    const errors: Record<string, string> = {};
    if (!taskForm.title.trim()) errors.title = 'Task title is required';
    if (!taskForm.assignee) errors.assignee = 'Please select an assignee';
    if (!taskForm.dueDate) errors.dueDate = 'Due date is required';
    if (taskForm.estimatedHours && (isNaN(Number(taskForm.estimatedHours)) || Number(taskForm.estimatedHours) < 0)) {
      errors.estimatedHours = 'Please enter a valid number of hours';
    }
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
      estimatedHours: ''
    });
    setFormErrors({});
  };

  const handleCreateTask = () => {
    if (!validateTaskForm()) return;
    
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

  const TaskCard = ({ task, column }: { task: Task; column: 'notStarted' | 'inProgress' | 'testing' | 'complete' }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3" onClick={() => openTaskDetails(task)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-900">{task.title}</p>
            {column !== 'complete' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {column === 'notStarted' && (
                    <>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToInProgress(task); }}>
                        <Play className="h-4 w-4 mr-2" />
                        Convert to In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToTesting(task); }}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Convert to Testing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToComplete(task); }}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Convert to Complete
                      </DropdownMenuItem>
                    </>
                  )}
                  {column === 'inProgress' && (
                    <>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToTesting(task); }}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Convert to Testing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToComplete(task); }}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Convert to Complete
                      </DropdownMenuItem>
                    </>
                  )}
                  {column === 'testing' && (
                    <>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToInProgress(task); }}>
                        <Play className="h-4 w-4 mr-2" />
                        Convert to In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToComplete(task); }}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Convert to Complete
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={priorityConfig[task.priority].class}>
              {priorityConfig[task.priority].label}
            </Badge>
            <span className="text-xs text-slate-600">{task.id}</span>
          </div>

          <div className="flex items-center justify-between">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {getInitials(task.assignee)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-600">Due: {task.dueDate}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <div className="flex items-center gap-1 text-xs">
              <CheckSquare className="h-3 w-3" />
              <span>{task.subtasks.completed}/{task.subtasks.total}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachments}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with New Task Button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowNewTaskDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
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
                <SelectItem value="john">John Smith</SelectItem>
                <SelectItem value="sarah">Sarah Johnson</SelectItem>
                <SelectItem value="mike">Mike Brown</SelectItem>
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
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Not Started Column */}
        <div>
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Not Started</CardTitle>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                  {tasks.notStarted.length}
                </Badge>
              </div>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {tasks.notStarted.map(task => (
              <TaskCard key={task.id} task={task} column="notStarted" />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div>
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">In Progress</CardTitle>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                  {tasks.inProgress.length}
                </Badge>
              </div>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {tasks.inProgress.map(task => (
              <TaskCard key={task.id} task={task} column="inProgress" />
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div>
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Testing</CardTitle>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  {tasks.testing.length}
                </Badge>
              </div>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {tasks.testing.map(task => (
              <TaskCard key={task.id} task={task} column="testing" />
            ))}
          </div>
        </div>

        {/* Complete Column */}
        <div>
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Complete</CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  {tasks.complete.length}
                </Badge>
              </div>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {tasks.complete.map(task => (
              <TaskCard key={task.id} task={task} column="complete" />
            ))}
          </div>
        </div>
      </div>

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

              <div className="grid grid-cols-3 gap-3 rounded-md border border-slate-200 p-3 bg-slate-50">
                <div>
                  <p className="text-[11px] text-slate-500">Subtasks</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedTask.subtasks.completed}/{selectedTask.subtasks.total}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Comments</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedTask.comments}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Attachments</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedTask.attachments}</p>
                </div>
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
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to this project.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-2">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
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
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee *</Label>
                <Select value={taskForm.assignee} onValueChange={(value) => setTaskForm({ ...taskForm, assignee: value })}>
                  <SelectTrigger className={formErrors.assignee ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john-smith">John Smith</SelectItem>
                    <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="mike-brown">Mike Brown</SelectItem>
                    <SelectItem value="emily-davis">Emily Davis</SelectItem>
                    <SelectItem value="alex-wilson">Alex Wilson</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.assignee && <p className="text-xs text-red-500">{formErrors.assignee}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-dueDate">Due Date *</Label>
                <Input
                  id="task-dueDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className={formErrors.dueDate ? 'border-red-500' : ''}
                />
                {formErrors.dueDate && <p className="text-xs text-red-500">{formErrors.dueDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-hours">Estimated Hours</Label>
                <Input
                  id="task-hours"
                  type="number"
                  value={taskForm.estimatedHours}
                  onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                  placeholder="e.g., 8"
                  className={formErrors.estimatedHours ? 'border-red-500' : ''}
                />
                {formErrors.estimatedHours && <p className="text-xs text-red-500">{formErrors.estimatedHours}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select value={taskForm.status} onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}>
                <SelectTrigger>
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
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewTaskDialog(false); resetTaskForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
