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

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  subtasks: { completed: number; total: number };
  comments: number;
  attachments: number;
}

export default function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const { toast } = useToast();
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo',
    estimatedHours: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mock tasks data
  const tasks: { todo: Task[]; inProgress: Task[]; done: Task[] } = {
    todo: [
      {
        id: 'T-001',
        title: 'Design homepage wireframes',
        assignee: 'Alex Wilson',
        priority: 'high' as const,
        dueDate: '2026-01-20',
        subtasks: { completed: 2, total: 5 },
        comments: 3,
        attachments: 2
      },
      {
        id: 'T-002',
        title: 'Setup development environment',
        assignee: 'Mike Brown',
        priority: 'medium' as const,
        dueDate: '2026-01-18',
        subtasks: { completed: 1, total: 3 },
        comments: 1,
        attachments: 0
      },
      {
        id: 'T-003',
        title: 'Database schema design',
        assignee: 'Emily Davis',
        priority: 'high' as const,
        dueDate: '2026-01-22',
        subtasks: { completed: 0, total: 4 },
        comments: 5,
        attachments: 1
      }
    ],
    inProgress: [
      {
        id: 'T-004',
        title: 'Implement user authentication',
        assignee: 'Sarah Johnson',
        priority: 'high' as const,
        dueDate: '2026-01-25',
        subtasks: { completed: 3, total: 6 },
        comments: 8,
        attachments: 3
      },
      {
        id: 'T-005',
        title: 'Create product catalog API',
        assignee: 'Emily Davis',
        priority: 'medium' as const,
        dueDate: '2026-01-28',
        subtasks: { completed: 2, total: 5 },
        comments: 4,
        attachments: 1
      }
    ],
    done: [
      {
        id: 'T-006',
        title: 'Project requirements gathering',
        assignee: 'John Smith',
        priority: 'high' as const,
        dueDate: '2026-01-12',
        subtasks: { completed: 8, total: 8 },
        comments: 12,
        attachments: 5
      },
      {
        id: 'T-007',
        title: 'Setup CI/CD pipeline',
        assignee: 'Mike Brown',
        priority: 'medium' as const,
        dueDate: '2026-01-15',
        subtasks: { completed: 4, total: 4 },
        comments: 6,
        attachments: 2
      }
    ]
  };

  const priorityConfig: Record<string, { label: string; class: string }> = {
    high: { label: 'High', class: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: 'Medium', class: 'bg-orange-100 text-orange-700 border-orange-200' },
    low: { label: 'Low', class: 'bg-slate-100 text-slate-700 border-slate-200' }
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
      status: 'todo',
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

  const handleMoveToInProgress = (task: Task) => {
    toast({
      title: "Task Moved",
      description: `"${task.title}" has been moved to In Progress.`,
    });
  };

  const handleMoveToDone = (task: Task) => {
    toast({
      title: "Task Completed",
      description: `"${task.title}" has been marked as done.`,
    });
  };

  const handleDeleteTask = (task: Task) => {
    toast({
      title: "Task Deleted",
      description: `"${task.title}" has been deleted.`,
      variant: "destructive",
    });
  };

  const TaskCard = ({ task, column }: { task: Task; column: 'todo' | 'inProgress' | 'done' }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-900">{task.title}</p>
            {column !== 'done' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {column === 'todo' && (
                    <>
                      <DropdownMenuItem onClick={() => handleMoveToInProgress(task)}>
                        <Play className="h-4 w-4 mr-2" />
                        Convert to In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMoveToDone(task)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Convert to Done
                      </DropdownMenuItem>
                    </>
                  )}
                  {column === 'inProgress' && (
                    <DropdownMenuItem onClick={() => handleMoveToDone(task)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Convert to Done
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => handleDeleteTask(task)}
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
      <div className="grid gap-4 md:grid-cols-3">
        {/* To Do Column */}
        <div>
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">To Do</CardTitle>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                  {tasks.todo.length}
                </Badge>
              </div>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {tasks.todo.map(task => (
              <TaskCard key={task.id} task={task} column="todo" />
            ))}
            <Button variant="outline" className="w-full" size="sm" onClick={() => setShowNewTaskDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
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
            <Button variant="outline" className="w-full" size="sm" onClick={() => setShowNewTaskDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Done Column */}
        <div>
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Done</CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  {tasks.done.length}
                </Badge>
              </div>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {tasks.done.map(task => (
              <TaskCard key={task.id} task={task} column="done" />
            ))}
            <Button variant="outline" className="w-full" size="sm" onClick={() => setShowNewTaskDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to this project.</DialogDescription>
          </DialogHeader>
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
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
