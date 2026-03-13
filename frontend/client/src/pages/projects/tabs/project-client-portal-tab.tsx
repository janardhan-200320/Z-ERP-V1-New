import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Upload, Send, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ProjectClientPortalTabProps {
  projectId: string | undefined;
}

export default function ProjectClientPortalTab({ projectId }: ProjectClientPortalTabProps) {
  const [tasksVisible, setTasksVisible] = useState(true);
  const [milestonesVisible, setMilestonesVisible] = useState(true);
  const [reportsVisible, setReportsVisible] = useState(false);

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

  const statusConfig: Record<string, { label: string; class: string; icon: React.ComponentType<{ className?: string }> }> = {
    approved: { label: 'Approved', class: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
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
        </CardContent>
      </Card>

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
