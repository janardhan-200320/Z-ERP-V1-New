import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FolderKanban,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  Tag,
  XCircle,
  PauseCircle,
  Circle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronDown,
  Type,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const RichTextEditor = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white focus-within:ring-2 focus-within:ring-blue-100/50 transition-all">
      <div className="bg-slate-50 border-b border-slate-200 p-1.5 flex flex-wrap gap-1 items-center">
        <div className="flex bg-white rounded border border-slate-200 p-0.5 shadow-sm">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-blue-600"><Bold className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-blue-600"><Italic className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-blue-600"><List className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="flex bg-white rounded border border-slate-200 p-0.5 shadow-sm">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-blue-600"><AlignLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-blue-600"><AlignCenter className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded shadow-sm"><ImageIcon className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded shadow-sm"><LinkIcon className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <textarea
        className="w-full min-h-[100px] p-3 text-sm text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
        placeholder="Enter project description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="bg-slate-50 border-t border-slate-100 px-3 py-1 flex justify-between items-center">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Mock Editor</span>
        <span className="text-[9px] text-slate-500 font-bold">{value.length} CHARS</span>
      </div>
    </div>
  );
};

export default function ProjectsList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState('25');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // Form state for new/edit project
  const [projectForm, setProjectForm] = useState({
    name: '',
    customer: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    budget: '',
    status: 'in-progress',
    tags: '',
    calculateProgress: true,
    billingType: 'fixed-rate',
    totalRate: '',
    estimatedHours: '',
    members: 'Zedunix ERP Admin',
    sendEmail: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mock data
  const statusStats = [
    { label: 'Not Started', value: 12, icon: Circle, color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
    { label: 'In Progress', value: 28, icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
    { label: 'On Hold', value: 5, icon: PauseCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' },
    { label: 'Cancelled', value: 3, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
    { label: 'Finished', value: 45, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-200' }
  ];

  const projects = [
    {
      id: 1,
      name: 'E-Commerce Platform Redesign',
      customer: 'TechCorp Solutions',
      tags: ['Web', 'UI/UX'],
      startDate: '2026-01-10',
      deadline: '2026-03-15',
      members: 8,
      status: 'in-progress',
      progress: 65
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      customer: 'FirstBank Ltd',
      tags: ['Mobile', 'Fintech'],
      startDate: '2025-12-01',
      deadline: '2026-02-28',
      members: 12,
      status: 'in-progress',
      progress: 78
    },
    {
      id: 3,
      name: 'CRM System Integration',
      customer: 'SalesForce Pro',
      tags: ['Backend', 'API'],
      startDate: '2026-01-05',
      deadline: '2026-04-20',
      members: 6,
      status: 'not-started',
      progress: 0
    },
    {
      id: 4,
      name: 'Data Analytics Dashboard',
      customer: 'Analytics Inc',
      tags: ['Data', 'Visualization'],
      startDate: '2025-11-15',
      deadline: '2026-01-30',
      members: 5,
      status: 'finished',
      progress: 100
    },
    {
      id: 5,
      name: 'Supply Chain Management',
      customer: 'LogiTech Corp',
      tags: ['ERP', 'Logistics'],
      startDate: '2025-10-20',
      deadline: '2026-02-10',
      members: 10,
      status: 'on-hold',
      progress: 45
    },
    {
      id: 6,
      name: 'Cloud Migration Project',
      customer: 'CloudFirst Systems',
      tags: ['Cloud', 'DevOps'],
      startDate: '2025-09-01',
      deadline: '2025-12-31',
      members: 7,
      status: 'finished',
      progress: 100
    },
    {
      id: 7,
      name: 'AI Chatbot Development',
      customer: 'AI Innovations',
      tags: ['AI', 'ML'],
      startDate: '2026-01-15',
      deadline: '2026-05-30',
      members: 9,
      status: 'in-progress',
      progress: 25
    },
    {
      id: 8,
      name: 'Security Audit Platform',
      customer: 'SecureNet Ltd',
      tags: ['Security', 'Compliance'],
      startDate: '2025-12-10',
      deadline: '2026-03-01',
      members: 4,
      status: 'cancelled',
      progress: 30
    }
  ];

  const statusConfig: Record<string, { label: string; class: string }> = {
    'not-started': { label: 'Not Started', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    'on-hold': { label: 'On Hold', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-700 border-red-200' },
    finished: { label: 'Finished', class: 'bg-green-100 text-green-700 border-green-200' }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewProject = (projectId: number) => {
    setLocation(`/projects/${projectId}`);
  };

  const validateProjectForm = () => {
    const errors: Record<string, string> = {};
    if (!projectForm.name.trim()) errors.name = 'Project name is required';
    if (!projectForm.customer.trim()) errors.customer = 'Customer is required';
    if (!projectForm.startDate) errors.startDate = 'Start date is required';
    if (!projectForm.deadline) errors.deadline = 'Deadline is required';
    if (projectForm.startDate && projectForm.deadline && projectForm.startDate > projectForm.deadline) {
      errors.deadline = 'Deadline must be after start date';
    }
    if (projectForm.budget && isNaN(Number(projectForm.budget))) {
      errors.budget = 'Budget must be a valid number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      customer: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      budget: '',
      status: 'in-progress',
      tags: '',
      calculateProgress: true,
      billingType: 'fixed-rate',
      totalRate: '',
      estimatedHours: '',
      members: 'Zedunix ERP Admin',
      sendEmail: false
    });
    setFormErrors({});
  };

  const handleCreateProject = () => {
    if (!validateProjectForm()) return;
    
    toast({
      title: "Project Created",
      description: `Project "${projectForm.name}" has been created successfully.`,
    });
    setShowNewProjectDialog(false);
    resetProjectForm();
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setProjectForm({
      name: project.name,
      customer: project.customer,
      description: project.description || '',
      startDate: project.startDate,
      deadline: project.deadline,
      budget: project.budget || '',
      status: project.status,
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
      calculateProgress: project.calculateProgress ?? true,
      billingType: project.billingType || 'fixed-rate',
      totalRate: project.totalRate || '',
      estimatedHours: project.estimatedHours || '',
      members: project.members_name || 'Zedunix ERP Admin',
      sendEmail: project.sendEmail || false
    });
    setShowEditDialog(true);
  };

  const handleUpdateProject = () => {
    if (!validateProjectForm()) return;
    
    toast({
      title: "Project Updated",
      description: `Project "${projectForm.name}" has been updated successfully.`,
    });
    setShowEditDialog(false);
    resetProjectForm();
    setSelectedProject(null);
  };

  const handleDeleteProject = (project: any) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProject = () => {
    toast({
      title: "Project Deleted",
      description: `Project "${selectedProject?.name}" has been deleted.`,
      variant: "destructive"
    });
    setShowDeleteDialog(false);
    setSelectedProject(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="h-8 w-8 text-blue-600" />
              Projects Summary
            </h1>
            <p className="text-sm text-slate-600 mt-1">View and manage all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" onClick={() => setShowNewProjectDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {statusStats.map((stat, index) => (
            <Card key={index} className={`hover:shadow-md transition-shadow border ${stat.borderColor}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-slate-600 mt-1">projects</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-slate-50">
                    <TableCell>
                      <button
                        onClick={() => handleViewProject(project.id)}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline text-left"
                      >
                        {project.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-slate-600">{project.customer}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {project.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{project.startDate}</TableCell>
                    <TableCell className="text-slate-600">{project.deadline}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">{project.members}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[project.status].class}>
                        {statusConfig[project.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[800px] flex flex-col p-0 overflow-hidden shadow-2xl border-none sm:rounded-2xl bg-white">
          <DialogHeader className="px-6 py-4 bg-white border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800">Create New Project</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs">Enter the project details below to get started.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 min-h-0 px-6 py-4">
            <div className="grid gap-6">
              {/* Basic Information Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-600 uppercase tracking-tight">Project Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="e.g. Website Redesign"
                    className={`h-10 ${formErrors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:ring-2 focus:ring-blue-100'}`}
                  />
                  {formErrors.name && <p className="text-[10px] font-medium text-red-500 leading-none mt-1">{formErrors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customer" className="text-xs font-bold text-slate-600 uppercase tracking-tight">Customer <span className="text-red-500">*</span></Label>
                  <Input
                    id="customer"
                    value={projectForm.customer}
                    onChange={(e) => setProjectForm({ ...projectForm, customer: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className={`h-10 ${formErrors.customer ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:ring-2 focus:ring-blue-100'}`}
                  />
                  {formErrors.customer && <p className="text-[10px] font-medium text-red-500 leading-none mt-1">{formErrors.customer}</p>}
                </div>
              </div>

              {/* Progress & Billing Section */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-lg ${projectForm.calculateProgress ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <Label htmlFor="calculateProgress" className="text-sm font-semibold text-slate-700 cursor-pointer">
                      Calculate progress through tasks
                    </Label>
                  </div>
                  <Checkbox 
                    id="calculateProgress" 
                    checked={projectForm.calculateProgress}
                    onCheckedChange={(checked) => setProjectForm({ ...projectForm, calculateProgress: !!checked })}
                    className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Project Progress</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-2 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingType" className="text-xs font-bold text-slate-600 uppercase">Billing Type <span className="text-red-500">*</span></Label>
                    <Select 
                      value={projectForm.billingType} 
                      onValueChange={(value) => setProjectForm({ ...projectForm, billingType: value })}
                    >
                      <SelectTrigger id="billingType" className="h-10 border-slate-200 bg-white shadow-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed-rate">Fixed Rate</SelectItem>
                        <SelectItem value="project-hours">Project Hours</SelectItem>
                        <SelectItem value="task-hours">Task Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-xs font-bold text-slate-600 uppercase">Status</Label>
                    <Select 
                      value={projectForm.status} 
                      onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}
                    >
                      <SelectTrigger id="status" className="h-10 border-slate-200 bg-white shadow-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial & Team Section */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="totalRate" className="text-xs font-bold text-slate-600 uppercase">Total Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                    <Input
                      id="totalRate"
                      value={projectForm.totalRate}
                      onChange={(e) => setProjectForm({ ...projectForm, totalRate: e.target.value })}
                      placeholder="0.00"
                      className="pl-7 h-10 border-slate-200 shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="estimatedHours" className="text-xs font-bold text-slate-600 uppercase">Est. Hours</Label>
                  <Input
                    id="estimatedHours"
                    value={projectForm.estimatedHours}
                    onChange={(e) => setProjectForm({ ...projectForm, estimatedHours: e.target.value })}
                    placeholder="0"
                    className="h-10 border-slate-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="members" className="text-xs font-bold text-slate-600 uppercase">Assignee</Label>
                  <Select 
                    value={projectForm.members} 
                    onValueChange={(value) => setProjectForm({ ...projectForm, members: value })}
                  >
                    <SelectTrigger id="members" className="h-10 border-slate-200 bg-white shadow-sm font-medium">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zedunix ERP Admin">Zedunix ERP Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-xs font-bold text-slate-600 uppercase">Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className={`h-10 border-slate-200 ${formErrors.startDate ? 'border-red-500' : ''}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deadline" className="text-xs font-bold text-slate-600 uppercase">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    className={`h-10 border-slate-200 ${formErrors.deadline ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-1.5">
                <Label htmlFor="tags" className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-blue-500" /> Tags
                </Label>
                <Input
                  id="tags"
                  value={projectForm.tags}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Comma separated tags..."
                  className="border-dashed border border-slate-300 h-10 bg-slate-50 font-medium"
                />
              </div>

              {/* Description Section */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase">Description</Label>
                <RichTextEditor 
                  value={projectForm.description} 
                  onChange={(val) => setProjectForm({ ...projectForm, description: val })} 
                />
              </div>

              {/* Email Notification */}
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-blue-50/40 border border-blue-100 shadow-sm">
                <Checkbox 
                  id="sendEmail" 
                  checked={projectForm.sendEmail}
                  onCheckedChange={(checked) => setProjectForm({ ...projectForm, sendEmail: !!checked })}
                  className="h-4 w-4 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                />
                <label
                  htmlFor="sendEmail"
                  className="text-xs font-semibold text-blue-800 cursor-pointer flex flex-col"
                >
                  Send Email Notification
                  <span className="text-[10px] font-normal text-blue-600">Notify team members about the new project.</span>
                </label>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <Button variant="outline" onClick={() => { setShowNewProjectDialog(false); resetProjectForm(); }} className="h-10 px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-100">
              Cancel
            </Button>
            <Button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 h-10 px-8 font-bold transition-all transform active:scale-95">
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[800px] flex flex-col p-0 overflow-hidden shadow-2xl border-none sm:rounded-2xl bg-white">
          <DialogHeader className="px-6 py-4 bg-white border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800">Edit Project</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs">Modify the existing project details.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 px-6 py-4">
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="text-xs font-bold text-slate-600 uppercase tracking-tight">Project Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className={`h-10 ${formErrors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:ring-2 focus:ring-indigo-100'}`}
                  />
                  {formErrors.name && <p className="text-[10px] font-medium text-red-500 leading-none mt-1">{formErrors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-customer" className="text-xs font-bold text-slate-600 uppercase tracking-tight">Customer <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-customer"
                    value={projectForm.customer}
                    onChange={(e) => setProjectForm({ ...projectForm, customer: e.target.value })}
                    className={`h-10 ${formErrors.customer ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:ring-2 focus:ring-indigo-100'}`}
                  />
                  {formErrors.customer && <p className="text-[10px] font-medium text-red-500 leading-none mt-1">{formErrors.customer}</p>}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-lg ${projectForm.calculateProgress ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <Label htmlFor="edit-calculateProgress" className="text-sm font-semibold text-slate-700 cursor-pointer">
                      Calculate progress through tasks
                    </Label>
                  </div>
                  <Checkbox 
                    id="edit-calculateProgress" 
                    checked={projectForm.calculateProgress}
                    onCheckedChange={(checked) => setProjectForm({ ...projectForm, calculateProgress: !!checked })}
                    className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">CURRENT STATUS</span>
                    <span>{selectedProject?.progress || 0}%</span>
                  </div>
                  <Progress value={selectedProject?.progress || 0} className="h-2 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-billingType" className="text-xs font-bold text-slate-600 uppercase">Billing Type <span className="text-red-500">*</span></Label>
                    <Select 
                      value={projectForm.billingType} 
                      onValueChange={(value) => setProjectForm({ ...projectForm, billingType: value })}
                    >
                      <SelectTrigger id="edit-billingType" className="h-10 border-slate-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed-rate">Fixed Rate</SelectItem>
                        <SelectItem value="project-hours">Project Hours</SelectItem>
                        <SelectItem value="task-hours">Task Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-status" className="text-xs font-bold text-slate-600 uppercase">Project Status</Label>
                    <Select 
                      value={projectForm.status} 
                      onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}
                    >
                      <SelectTrigger id="edit-status" className="h-10 border-slate-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-totalRate" className="text-xs font-bold text-slate-600 uppercase">Total Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                    <Input
                      id="edit-totalRate"
                      value={projectForm.totalRate}
                      onChange={(e) => setProjectForm({ ...projectForm, totalRate: e.target.value })}
                      className="pl-7 h-10 border-slate-200 shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-estimatedHours" className="text-xs font-bold text-slate-600 uppercase">Est. Hours</Label>
                  <Input
                    id="edit-estimatedHours"
                    value={projectForm.estimatedHours}
                    onChange={(e) => setProjectForm({ ...projectForm, estimatedHours: e.target.value })}
                    className="h-10 border-slate-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-members" className="text-xs font-bold text-slate-600 uppercase">Assignee</Label>
                  <Select 
                    value={projectForm.members} 
                    onValueChange={(value) => setProjectForm({ ...projectForm, members: value })}
                  >
                    <SelectTrigger id="edit-members" className="h-10 border-slate-200 bg-white shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zedunix ERP Admin">Zedunix ERP Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-startDate" className="text-xs font-bold text-slate-600 uppercase">Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="h-10 border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-deadline" className="text-xs font-bold text-slate-600 uppercase">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    className="h-10 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-tags" className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-indigo-400" /> Tags
                </Label>
                <Input
                  id="edit-tags"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  placeholder="e.g. Design, Frontend"
                  className="border-dashed border border-slate-300 h-10 bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase">Description</Label>
                <RichTextEditor 
                  value={projectForm.description} 
                  onChange={(val) => setProjectForm({ ...projectForm, description: val })} 
                />
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetProjectForm(); setSelectedProject(null); }} className="h-10 px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-100">
              Cancel Updates
            </Button>
            <Button onClick={handleUpdateProject} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-10 px-8 font-bold transition-all transform active:scale-95">
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedProject(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
