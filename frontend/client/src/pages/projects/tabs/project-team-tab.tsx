import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { Activity, UserPlus } from 'lucide-react';
import { createTeamSpaceMember, fetchTeamSpaceMembers } from '@/lib/supabase-data';

interface ProjectTeamTabProps {
  projectId: string | undefined;
}

export default function ProjectTeamTab({ projectId }: ProjectTeamTabProps) {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; role: string; joinDate: string; avatar: string }>>([]);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: '',
    sendNotification: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    fetchTeamSpaceMembers()
      .then((rows) => {
        if (!active) return;
        setTeamMembers(rows.map((row) => ({
          name: row.name,
          role: row.role,
          joinDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          avatar: row.avatar || row.name.slice(0, 2).toUpperCase(),
        })));
      })
      .catch(() => {
        if (active) setTeamMembers([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const activities = [
    { user: 'Sarah Johnson', action: 'Completed task: User Authentication', time: '2 hours ago', avatar: 'SJ' },
    { user: 'Mike Brown', action: 'Uploaded design files', time: '4 hours ago', avatar: 'MB' },
    { user: 'Emily Davis', action: 'Created new API endpoint', time: '5 hours ago', avatar: 'ED' },
    { user: 'Alex Wilson', action: 'Updated wireframes', time: '1 day ago', avatar: 'AW' },
    { user: 'John Smith', action: 'Scheduled team meeting', time: '1 day ago', avatar: 'JS' },
    { user: 'Chris Taylor', action: 'Reported bug in login flow', time: '2 days ago', avatar: 'CT' }
  ];

  const staffSuggestions = [
    'John Smith',
    'Sarah Johnson',
    'Mike Brown',
    'Emily Davis',
    'Alex Wilson',
    'Chris Taylor',
    'Lisa Anderson',
    'Tom White',
    'Riya Patel',
    'Daniel Lee'
  ];

  const validateMemberForm = () => {
    const errors: Record<string, string> = {};
    if (!memberForm.name.trim()) errors.name = 'Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      sendNotification: true
    });
    setFormErrors({});
  };

  const handleAddMember = () => {
    if (!validateMemberForm()) return;

    const slug = memberForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') || 'team-member';

    createTeamSpaceMember({
      name: memberForm.name.trim(),
      role: 'Team Member',
      department: 'General',
      email: `${slug}.${Date.now()}@local.invalid`,
      phone: 'N/A',
      status: 'offline',
      avatar: memberForm.name.slice(0, 2).toUpperCase(),
      notes: projectId ? `Added from project ${projectId}` : 'Added from project team tab',
    })
      .then((created) => {
        setTeamMembers((prev) => [{
          name: created.name,
          role: created.role,
          joinDate: created.created_at ? created.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          avatar: created.avatar || created.name.slice(0, 2).toUpperCase(),
        }, ...prev]);

        if (memberForm.sendNotification) {
          addNotification({
            title: 'Added to Project Team',
            message: `You have been added to project ${projectId ?? 'team'}.`,
            type: 'info',
            metadata: {
              projectId,
              memberName: memberForm.name,
              category: 'project-team'
            }
          });
        }

        toast({
          title: 'Team Member Added',
          description: `${memberForm.name} has been saved to Supabase.`,
        });
        setShowAddMemberDialog(false);
        resetMemberForm();
      })
      .catch((error) => {
        toast({
          title: 'Failed to add team member',
          description: error.message || 'Supabase rejected the team member insert',
          variant: 'destructive',
        });
      });
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
              <Label htmlFor="member-name">Staff Name *</Label>
              <Input
                id="member-name"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder="Start typing staff name"
                list="staff-name-suggestions"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              <datalist id="staff-name-suggestions">
                {staffSuggestions.map((staffName) => (
                  <option key={staffName} value={staffName} />
                ))}
              </datalist>
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="notify-member"
                checked={memberForm.sendNotification}
                onCheckedChange={(checked) => setMemberForm({ ...memberForm, sendNotification: checked === true })}
              />
              <Label htmlFor="notify-member" className="font-normal text-sm text-slate-700">
                Send notification to staff member after adding
              </Label>
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
