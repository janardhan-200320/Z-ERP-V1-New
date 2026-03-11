import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Activity, UserPlus } from 'lucide-react';

interface ProjectTeamTabProps {
  projectId: string | undefined;
}

export default function ProjectTeamTab({ projectId }: ProjectTeamTabProps) {
  const { toast } = useToast();
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    role: '',
    allocation: 100
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Mock data
  const teamMembers = [
    { name: 'John Smith', role: 'Project Manager', joinDate: '2026-01-10', allocation: 100, avatar: 'JS' },
    { name: 'Sarah Johnson', role: 'Lead Developer', joinDate: '2026-01-10', allocation: 100, avatar: 'SJ' },
    { name: 'Mike Brown', role: 'Frontend Developer', joinDate: '2026-01-11', allocation: 80, avatar: 'MB' },
    { name: 'Emily Davis', role: 'Backend Developer', joinDate: '2026-01-11', allocation: 80, avatar: 'ED' },
    { name: 'Alex Wilson', role: 'UI/UX Designer', joinDate: '2026-01-12', allocation: 60, avatar: 'AW' },
    { name: 'Chris Taylor', role: 'QA Engineer', joinDate: '2026-01-13', allocation: 100, avatar: 'CT' },
    { name: 'Lisa Anderson', role: 'DevOps Engineer', joinDate: '2026-01-14', allocation: 50, avatar: 'LA' },
    { name: 'Tom White', role: 'Business Analyst', joinDate: '2026-01-15', allocation: 60, avatar: 'TW' }
  ];

  const activities = [
    { user: 'Sarah Johnson', action: 'Completed task: User Authentication', time: '2 hours ago', avatar: 'SJ' },
    { user: 'Mike Brown', action: 'Uploaded design files', time: '4 hours ago', avatar: 'MB' },
    { user: 'Emily Davis', action: 'Created new API endpoint', time: '5 hours ago', avatar: 'ED' },
    { user: 'Alex Wilson', action: 'Updated wireframes', time: '1 day ago', avatar: 'AW' },
    { user: 'John Smith', action: 'Scheduled team meeting', time: '1 day ago', avatar: 'JS' },
    { user: 'Chris Taylor', action: 'Reported bug in login flow', time: '2 days ago', avatar: 'CT' }
  ];

  const validateMemberForm = () => {
    const errors: Record<string, string> = {};
    if (!memberForm.name.trim()) errors.name = 'Name is required';
    if (!memberForm.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!memberForm.role) errors.role = 'Please select a role';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      email: '',
      role: '',
      allocation: 100
    });
    setFormErrors({});
  };

  const handleAddMember = () => {
    if (!validateMemberForm()) return;
    
    toast({
      title: "Team Member Added",
      description: `${memberForm.name} has been added to the project.`,
    });
    setShowAddMemberDialog(false);
    resetMemberForm();
  };

  return (
    <div className="space-y-6">
      {/* Team Members Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
          <p className="text-sm text-slate-600">{teamMembers.length} members</p>
        </div>
        <Button size="sm" onClick={() => setShowAddMemberDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{member.name}</h4>
                  <p className="text-sm text-slate-600">{member.role}</p>
                  <p className="text-xs text-slate-500 mt-1">Joined: {member.joinDate}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Allocation</span>
                      <span className="font-medium">{member.allocation}%</span>
                    </div>
                    <Progress value={member.allocation} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Team Activity
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-slate-900">{activity.user}</span>
                      <span className="text-slate-600"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a new member to this project team.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Full Name *</Label>
              <Input
                id="member-name"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder="Enter full name"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address *</Label>
              <Input
                id="member-email"
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                placeholder="Enter email address"
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role *</Label>
              <Select value={memberForm.role} onValueChange={(value) => setMemberForm({ ...memberForm, role: value })}>
                <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-manager">Project Manager</SelectItem>
                  <SelectItem value="lead-developer">Lead Developer</SelectItem>
                  <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                  <SelectItem value="backend-developer">Backend Developer</SelectItem>
                  <SelectItem value="ui-ux-designer">UI/UX Designer</SelectItem>
                  <SelectItem value="qa-engineer">QA Engineer</SelectItem>
                  <SelectItem value="devops-engineer">DevOps Engineer</SelectItem>
                  <SelectItem value="business-analyst">Business Analyst</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && <p className="text-xs text-red-500">{formErrors.role}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Allocation</Label>
                <span className="text-sm font-medium text-slate-900">{memberForm.allocation}%</span>
              </div>
              <Slider
                value={[memberForm.allocation]}
                onValueChange={(value) => setMemberForm({ ...memberForm, allocation: value[0] })}
                max={100}
                min={10}
                step={10}
                className="mt-2"
              />
              <p className="text-xs text-slate-500">Percentage of time allocated to this project</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddMemberDialog(false); resetMemberForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
