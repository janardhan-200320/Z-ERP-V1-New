import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Filter,
  MoreVertical,
  FolderKanban,
  Target,
  IndianRupee,
  Users,
  TrendingUp,
  Upload,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Settings,
  BarChart3,
  Kanban,
  List,
  GanttChart,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useRoute, useLocation } from 'wouter';

// Import tab components
import ProjectOverviewTab from './tabs/project-overview-tab';
import ProjectTasksTab from './tabs/project-tasks-tab';
import ProjectTimesheetsTab from './tabs/project-timesheets-tab';
import ProjectTeamTab from './tabs/project-team-tab';
import ProjectMilestonesTab from './tabs/project-milestones-tab';
import ProjectFilesTab from './tabs/project-files-tab';
import ProjectAutomationTab from './tabs/project-automation-tab';
import ProjectReportsTab from './tabs/project-reports-tab';
import { fetchProjectById, deleteProject, type ProjectRecord } from '@/lib/supabase-data';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';

export default function ProjectDetail() {
  const [, params] = useRoute('/projects/:id');
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const [project, setProject] = useState<null | (ProjectRecord & { teamMembers: number; startDate: string; deadline: string })>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProject = useCallback(() => {
    const projectId = Number(params?.id);
    if (!projectId || Number.isNaN(projectId)) {
      setLoadError('Invalid project id');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    fetchProjectById(projectId)
      .then((data) => {
        setProject({
          ...data,
          teamMembers: data.members,
          startDate: data.start_date,
          deadline: data.deadline,
        });
      })
      .catch((error) => setLoadError(error.message || 'Failed to load project'))
      .finally(() => setIsLoading(false));
  }, [params?.id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const mappedProject = project;

  const statusConfig: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    'not-started': { label: 'Not Started', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    'on-hold': { label: 'On Hold', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-700 border-red-200' },
    finished: { label: 'Finished', class: 'bg-green-100 text-green-700 border-green-200' }
  };

  const projectStatus = statusConfig[mappedProject?.status] ?? statusConfig.pending;

  const handleEditProject = () => {
    if (!mappedProject?.id) return;
    localStorage.setItem('z_erp_project_edit_id', String(mappedProject.id));
    setLocation('/projects');
  };

  const handleOpenInNewTab = () => {
    if (!mappedProject?.id) return;
    window.open(`/projects/${mappedProject.id}`, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteProject = async () => {
    if (!mappedProject?.id) return;
    const confirmed = window.confirm(`Delete "${mappedProject.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteProject(mappedProject.id);
      toast({
        title: 'Project deleted',
        description: `"${mappedProject.name}" has been removed.`,
      });
      setLocation('/projects');
    } catch (error: any) {
      toast({
        title: 'Failed to delete project',
        description: error?.message || 'Supabase rejected the delete request.',
        variant: 'destructive',
      });
    }
  };

  const handleShareLink = async () => {
    if (!mappedProject?.id) return;
    const shareUrl = `${window.location.origin}/projects/${mappedProject.id}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      toast({
        title: 'Link copied',
        description: 'Project link copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Unable to copy link',
        description: 'Please copy the URL from the address bar.',
        variant: 'destructive',
      });
    }
  };

  const handleExportCsv = () => {
    if (!mappedProject) return;
    const rows = [
      {
        'Project Name': mappedProject.name,
        Customer: mappedProject.customer,
        Status: mappedProject.status,
        'Start Date': mappedProject.start_date,
        Deadline: mappedProject.deadline,
        Members: mappedProject.members,
        Progress: mappedProject.progress ?? 0,
      },
    ];
    exportToExcel(rows, `project-${mappedProject.id}-summary-${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPdf = () => {
    if (!mappedProject) return;
    const headers = ['Project Name', 'Customer', 'Status', 'Start Date', 'Deadline', 'Members', 'Progress'];
    const data = [[
      mappedProject.name,
      mappedProject.customer,
      mappedProject.status,
      mappedProject.start_date,
      mappedProject.deadline,
      String(mappedProject.members ?? 0),
      `${mappedProject.progress ?? 0}%`,
    ]];

    exportToPDF(
      `Project Summary - ${mappedProject.name}`,
      headers,
      data,
      `project-${mappedProject.id}-summary-${new Date().toISOString().slice(0, 10)}`
    );
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="p-6 text-sm text-slate-600">Loading project…</div>
      ) : loadError ? (
        <div className="p-6 text-sm text-red-600">{loadError}</div>
      ) : mappedProject ? (
      <div className="space-y-6">
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 -mx-6 -mt-6 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/projects')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderKanban className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{mappedProject.name}</h1>
                  <p className="text-sm text-slate-600">{mappedProject.customer}</p>
                </div>
              </div>
              <Badge variant="outline" className={projectStatus.class}>
                {projectStatus.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditProject}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenInNewTab}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in new tab
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareLink}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Share link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={loadProject}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/projects')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to projects
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCsv}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={handleDeleteProject}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-full justify-start">
              <TabsTrigger value="overview">
                <Target className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="timesheets">
                <Clock className="h-4 w-4 mr-2" />
                Timesheets
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="milestones">
                <Target className="h-4 w-4 mr-2" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="files">
                <Upload className="h-4 w-4 mr-2" />
                Files
              </TabsTrigger>
              <TabsTrigger value="automation">
                <Settings className="h-4 w-4 mr-2" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="overview">
            <ProjectOverviewTab project={mappedProject} />
          </TabsContent>

          <TabsContent value="tasks">
            <ProjectTasksTab projectId={String(mappedProject.id)} />
          </TabsContent>

          <TabsContent value="timesheets">
            <ProjectTimesheetsTab projectId={String(mappedProject.id)} />
          </TabsContent>

          <TabsContent value="team">
            <ProjectTeamTab projectId={String(mappedProject.id)} />
          </TabsContent>

          <TabsContent value="milestones">
            <ProjectMilestonesTab projectId={String(mappedProject.id)} />
          </TabsContent>

          <TabsContent value="files">
            <ProjectFilesTab projectId={String(mappedProject.id)} />
          </TabsContent>

          <TabsContent value="automation">
            <ProjectAutomationTab projectId={String(mappedProject.id)} />
          </TabsContent>

          <TabsContent value="reports">
            <ProjectReportsTab projectId={String(mappedProject.id)} />
          </TabsContent>
        </Tabs>
      </div>
      ) : null}
    </DashboardLayout>
  );
}
