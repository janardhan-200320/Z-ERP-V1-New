import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Upload,
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ProjectOverviewTabProps {
  project: any;
}

export default function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  // Mock data
  const stats = [
    {
      title: 'Progress',
      value: `${project.progress}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Budget',
      value: `$${(project.budget / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Spent',
      value: `$${(project.spent / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Team Members',
      value: project.teamMembers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const milestones = [
    { id: 'MS-001', title: 'Project Kickoff', startDate: '2026-01-05', dueDate: '2026-01-10', status: 'completed', progress: 100 },
    { id: 'MS-002', title: 'Design Phase Complete', startDate: '2026-01-11', dueDate: '2026-01-25', status: 'completed', progress: 100 },
    { id: 'MS-003', title: 'Development Sprint 1', startDate: '2026-01-26', dueDate: '2026-02-10', status: 'in-progress', progress: 75 },
    { id: 'MS-004', title: 'QA Testing Phase', startDate: '2026-02-11', dueDate: '2026-02-28', status: 'pending', progress: 0 },
    { id: 'MS-005', title: 'Production Deployment', startDate: '2026-03-01', dueDate: '2026-03-15', status: 'pending', progress: 0 }
  ];

  const files = [
    { name: 'Project_Requirements.pdf', size: '2.4 MB', uploadedBy: 'John Smith', date: '2026-01-10' },
    { name: 'Design_Mockups.fig', size: '15.8 MB', uploadedBy: 'Alex Wilson', date: '2026-01-15' },
    { name: 'Technical_Spec.docx', size: '1.2 MB', uploadedBy: 'Sarah Johnson', date: '2026-01-12' },
    { name: 'Budget_Plan.xlsx', size: '856 KB', uploadedBy: 'John Smith', date: '2026-01-11' }
  ];

  const statusConfig: Record<string, { label: string; class: string }> = {
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700 border-green-200' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    pending: { label: 'Pending', class: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((milestone) => (
                <TableRow key={milestone.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{milestone.id}</TableCell>
                  <TableCell>{milestone.title}</TableCell>
                  <TableCell className="text-slate-600">{milestone.startDate}</TableCell>
                  <TableCell className="text-slate-600">{milestone.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[milestone.status].class}>
                      {statusConfig[milestone.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={milestone.progress} className="w-24" />
                      <span className="text-sm text-slate-600">{milestone.progress}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Project Files */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Files</CardTitle>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file, index) => (
                <TableRow key={index} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="text-slate-600">{file.size}</TableCell>
                  <TableCell className="text-slate-600">{file.uploadedBy}</TableCell>
                  <TableCell className="text-slate-600">{file.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
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
