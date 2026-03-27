import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Users,
  Timer,
  ClipboardList,
  Receipt,
  NotebookPen,
  Download,
  PieChart,
  Send
} from 'lucide-react';
import ProposalsTab from '@/pages/sales/tabs/proposals-tab';

interface ProjectClientPortalTabProps {
  projectId: string | undefined;
}

export default function ProjectClientPortalTab({ projectId }: ProjectClientPortalTabProps) {
  const [tasksVisible, setTasksVisible] = useState(true);
  const [milestonesVisible, setMilestonesVisible] = useState(true);
  const [reportsVisible, setReportsVisible] = useState(true);
  const [invoicesVisible, setInvoicesVisible] = useState(true);
  const [timesheetsVisible, setTimesheetsVisible] = useState(true);
  const [notesVisible, setNotesVisible] = useState(true);

  const [newTask, setNewTask] = useState({
    title: '',
    assignee: 'Alex Wilson',
    dueDate: '',
    priority: 'medium',
    status: 'not-started'
  });

  const [portalTasks, setPortalTasks] = useState([
    { id: 'PT-101', title: 'Finalize payment gateway integration', assignee: 'Sarah Johnson', dueDate: '2026-04-02', priority: 'high', status: 'in-progress' },
    { id: 'PT-102', title: 'Prepare deployment checklist', assignee: 'Mike Brown', dueDate: '2026-04-05', priority: 'medium', status: 'not-started' },
    { id: 'PT-103', title: 'Client UAT bug fixes batch 1', assignee: 'Emily Davis', dueDate: '2026-03-30', priority: 'urgent', status: 'testing' }
  ]);

  const [newNote, setNewNote] = useState({
    content: '',
    visibility: 'team'
  });

  const [teamNotes, setTeamNotes] = useState([
    {
      id: 'N-1',
      author: 'Project Manager',
      visibility: 'all-employees',
      content: 'Client requested weekly consolidated progress updates every Friday.',
      createdAt: '2026-03-20 09:10'
    },
    {
      id: 'N-2',
      author: 'Delivery Lead',
      visibility: 'team',
      content: 'Please keep timesheets updated daily for billing and audit accuracy.',
      createdAt: '2026-03-22 18:40'
    }
  ]);

  const messages = [
    { from: 'Client', name: 'David Chen', message: 'The latest designs look great! When can we expect the next milestone?', time: '2 hours ago', avatar: 'DC' },
    { from: 'You', name: 'John Smith', message: 'Thank you! We\'re on track for the Feb 10 delivery. I\'ll share a detailed update tomorrow.', time: '1 hour ago', avatar: 'JS' },
    { from: 'Client', name: 'David Chen', message: 'Sounds good. Can you also share the test environment credentials?', time: '45 minutes ago', avatar: 'DC' }
  ];

  const documents = [
    { name: 'Project_Proposal_v2.pdf', status: 'approved', uploadedBy: 'John Smith', date: '2026-01-10' },
    { name: 'Technical_Spec.docx', status: 'pending', uploadedBy: 'Sarah Johnson', date: '2026-01-14' },
    { name: 'Design_System.pdf', status: 'approved', uploadedBy: 'Alex Wilson', date: '2026-01-12' },
    { name: 'Budget_Breakdown.xlsx', status: 'rejected', uploadedBy: 'John Smith', date: '2026-01-13' }
  ];

  const invoices = [
    { id: 'INV-3401', title: 'Initial Milestone Invoice', amount: 35000, dueDate: '2026-03-28', status: 'paid' },
    { id: 'INV-3402', title: 'Development Sprint 2', amount: 28000, dueDate: '2026-04-07', status: 'sent' },
    { id: 'INV-3403', title: 'Change Request Batch A', amount: 9000, dueDate: '2026-04-15', status: 'draft' }
  ];

  const timesheetEntries = [
    { id: 'TS-11', member: 'Emily Davis', activity: 'API integration and validation', date: '2026-03-24', hours: 7.5 },
    { id: 'TS-12', member: 'Sarah Johnson', activity: 'UAT testing and defect validation', date: '2026-03-24', hours: 6.0 },
    { id: 'TS-13', member: 'Mike Brown', activity: 'Deployment scripts and CI updates', date: '2026-03-25', hours: 5.5 },
    { id: 'TS-14', member: 'Alex Wilson', activity: 'Client portal UI refinements', date: '2026-03-25', hours: 8.0 }
  ];

  const reportCards = [
    { title: 'Progress Report', description: 'Milestone and sprint completion snapshot', period: 'This Week' },
    { title: 'Financial Report', description: 'Budget vs actual and payment status', period: 'This Month' },
    { title: 'Risk & Issue Report', description: 'Open risks, blockers, and mitigations', period: 'Live' },
    { title: 'Client Communication Report', description: 'Approvals, feedback, and decision log', period: 'This Sprint' }
  ];

  const financeSummary = {
    totalBudget: 150000,
    spent: 97500,
    committed: 18000,
    invoiced: 72000,
    collected: 35000
  };

  const remainingBudget = financeSummary.totalBudget - financeSummary.spent - financeSummary.committed;
  const timesheetHours = useMemo(() => timesheetEntries.reduce((sum, row) => sum + row.hours, 0), [timesheetEntries]);
  const completionPct = useMemo(() => Math.round((financeSummary.spent / financeSummary.totalBudget) * 100), [financeSummary.spent, financeSummary.totalBudget]);

  const statusConfig: Record<string, { label: string; class: string; icon: React.ComponentType<{ className?: string }> }> = {
    approved: { label: 'Approved', class: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
  };

  const invoiceStatusConfig: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const taskStatusClass: Record<string, string> = {
    'not-started': 'bg-slate-100 text-slate-700 border-slate-200',
    'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
    testing: 'bg-amber-100 text-amber-700 border-amber-200',
    complete: 'bg-green-100 text-green-700 border-green-200'
  };

  const priorityClass: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    high: 'bg-red-100 text-red-700 border-red-200',
    urgent: 'bg-rose-100 text-rose-700 border-rose-200'
  };

  const visibilityClass: Record<string, string> = {
    'all-employees': 'bg-violet-100 text-violet-700 border-violet-200',
    team: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    client: 'bg-lime-100 text-lime-700 border-lime-200'
  };

  const handleAddPortalTask = () => {
    if (!newTask.title.trim() || !newTask.assignee || !newTask.dueDate) {
      return;
    }

    const taskId = `PT-${String(portalTasks.length + 104).padStart(3, '0')}`;
    setPortalTasks([
      {
        id: taskId,
        title: newTask.title.trim(),
        assignee: newTask.assignee,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        status: newTask.status
      },
      ...portalTasks
    ]);

    setNewTask({
      title: '',
      assignee: 'Alex Wilson',
      dueDate: '',
      priority: 'medium',
      status: 'not-started'
    });
  };

  const handleAddNote = () => {
    if (!newNote.content.trim()) {
      return;
    }

    setTeamNotes([
      {
        id: `N-${teamNotes.length + 1}`,
        author: 'Project Manager',
        visibility: newNote.visibility,
        content: newNote.content.trim(),
        createdAt: new Date().toLocaleString()
      },
      ...teamNotes
    ]);

    setNewNote({ content: '', visibility: 'team' });
  };

  return (
    <div className="space-y-6">
      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Portal Visibility Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tasks">Show Tasks</Label>
              <p className="text-sm text-slate-600">Allow client to view project tasks</p>
            </div>
            <Switch id="tasks" checked={tasksVisible} onCheckedChange={setTasksVisible} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="milestones">Show Milestones</Label>
              <p className="text-sm text-slate-600">Allow client to view project milestones</p>
            </div>
            <Switch id="milestones" checked={milestonesVisible} onCheckedChange={setMilestonesVisible} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reports">Show Reports</Label>
              <p className="text-sm text-slate-600">Allow client to view project reports</p>
            </div>
            <Switch id="reports" checked={reportsVisible} onCheckedChange={setReportsVisible} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="invoices">Show Invoices</Label>
              <p className="text-sm text-slate-600">Allow client to view invoice and payment updates</p>
            </div>
            <Switch id="invoices" checked={invoicesVisible} onCheckedChange={setInvoicesVisible} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="timesheets">Show Timesheets</Label>
              <p className="text-sm text-slate-600">Allow client to monitor logged work hours</p>
            </div>
            <Switch id="timesheets" checked={timesheetsVisible} onCheckedChange={setTimesheetsVisible} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notes">Show Team Notes</Label>
              <p className="text-sm text-slate-600">Share project notes with employees and stakeholders</p>
            </div>
            <Switch id="notes" checked={notesVisible} onCheckedChange={setNotesVisible} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Budget Utilized</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{completionPct}%</p>
              </div>
              <DollarSign className="h-7 w-7 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total Invoiced</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">${financeSummary.invoiced.toLocaleString()}</p>
              </div>
              <Receipt className="h-7 w-7 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Hours Logged</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{timesheetHours.toFixed(1)}h</p>
              </div>
              <Timer className="h-7 w-7 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Open Tasks</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{portalTasks.length}</p>
              </div>
              <ClipboardList className="h-7 w-7 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-indigo-600" />
                Project Reports
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {reportCards.map((report) => (
                <div key={report.title} className="rounded-xl border border-slate-200 p-4 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{report.title}</h3>
                    <Badge variant="outline">{report.period}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{report.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm">Download</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Project Finance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total Budget</p>
                <p className="text-2xl font-bold text-slate-900">${financeSummary.totalBudget.toLocaleString()}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Spent</span><span>${financeSummary.spent.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Committed</span><span>${financeSummary.committed.toLocaleString()}</span></div>
                  <div className="flex justify-between font-semibold"><span>Remaining</span><span>${remainingBudget.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Collections</p>
                <p className="text-2xl font-bold text-slate-900">${financeSummary.collected.toLocaleString()}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Total Invoiced</span><span>${financeSummary.invoiced.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Outstanding</span><span>${(financeSummary.invoiced - financeSummary.collected).toLocaleString()}</span></div>
                  <div className="flex justify-between font-semibold"><span>Collection Rate</span><span>{Math.round((financeSummary.collected / financeSummary.invoiced) * 100)}%</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Assign Task To Team Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className="md:col-span-2"
                />
                <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                  <SelectTrigger><SelectValue placeholder="Assignee" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alex Wilson">Alex Wilson</SelectItem>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Brown">Mike Brown</SelectItem>
                    <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
                <Button onClick={handleAddPortalTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>

              <ScrollArea className="h-64 pr-2">
                <div className="space-y-2">
                  {portalTasks.map((task) => (
                    <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 bg-white">
                      <div>
                        <p className="font-medium text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.id} • {task.assignee} • Due {task.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={priorityClass[task.priority]}>{task.priority}</Badge>
                        <Badge variant="outline" className={taskStatusClass[task.status]}>{task.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NotebookPen className="h-5 w-5 text-violet-600" />
                Team Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Textarea
                  className="md:col-span-3"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write note for employees or project team"
                />
                <div className="space-y-2">
                  <Select value={newNote.visibility} onValueChange={(value) => setNewNote({ ...newNote, visibility: value })}>
                    <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-employees">All Employees</SelectItem>
                      <SelectItem value="team">Assigned Team</SelectItem>
                      <SelectItem value="client">Client Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={handleAddNote}>
                    <Send className="h-4 w-4 mr-2" />
                    Publish Note
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {teamNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-slate-200 p-3 bg-white">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{note.author}</p>
                      <Badge variant="outline" className={visibilityClass[note.visibility]}>{note.visibility}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{note.content}</p>
                    <p className="mt-1 text-xs text-slate-500">{note.createdAt}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-purple-600" />
                Timesheets
              </CardTitle>
              <Badge variant="outline">{timesheetHours.toFixed(1)}h Total</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {timesheetEntries.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-slate-200 p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{entry.member}</p>
                    <p className="text-sm font-semibold text-slate-700">{entry.hours.toFixed(1)}h</p>
                  </div>
                  <p className="text-sm text-slate-600">{entry.activity}</p>
                  <p className="text-xs text-slate-500">{entry.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals">
          <ProposalsTab />
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-white">
                  <div>
                    <p className="font-medium text-slate-900">{invoice.title}</p>
                    <p className="text-xs text-slate-500">{invoice.id} • Due {invoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${invoice.amount.toLocaleString()}</p>
                    <Badge variant="outline" className={invoiceStatusConfig[invoice.status] || 'bg-slate-100 text-slate-700 border-slate-200'}>{invoice.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Documents</CardTitle>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-slate-600">
                      {doc.uploadedBy} • {doc.date}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={statusConfig[doc.status].class}>
                  {statusConfig[doc.status].label}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
