import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, Calendar } from 'lucide-react';

interface ProjectMilestonesTabProps {
  projectId: string | undefined;
}

export default function ProjectMilestonesTab({ projectId }: ProjectMilestonesTabProps) {
  const { toast } = useToast();
  const [showAddMilestoneDialog, setShowAddMilestoneDialog] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    status: 'pending'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const milestones = [
    { id: 'MS-001', title: 'Project Kickoff', targetDate: '2026-01-10', status: 'completed' as const, progress: 100, color: 'bg-green-500' },
    { id: 'MS-002', title: 'Design Phase Complete', targetDate: '2026-01-25', status: 'completed' as const, progress: 100, color: 'bg-green-500' },
    { id: 'MS-003', title: 'Development Sprint 1', targetDate: '2026-02-10', status: 'in-progress' as const, progress: 75, color: 'bg-blue-500' },
    { id: 'MS-004', title: 'QA Testing Phase', targetDate: '2026-02-28', status: 'pending' as const, progress: 0, color: 'bg-slate-400' },
    { id: 'MS-005', title: 'Production Deployment', targetDate: '2026-03-15', status: 'pending' as const, progress: 0, color: 'bg-slate-400' }
  ];

  const statusConfig: Record<string, { label: string; class: string }> = {
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700 border-green-200' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    pending: { label: 'Pending', class: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  const validateMilestoneForm = () => {
    const errors: Record<string, string> = {};
    if (!milestoneForm.title.trim()) errors.title = 'Milestone title is required';
    if (!milestoneForm.targetDate) errors.targetDate = 'Target date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetMilestoneForm = () => {
    setMilestoneForm({
      title: '',
      description: '',
      targetDate: '',
      status: 'pending'
    });
    setFormErrors({});
  };

  const handleAddMilestone = () => {
    if (!validateMilestoneForm()) return;
    
    toast({
      title: "Milestone Added",
      description: `Milestone "${milestoneForm.title}" has been added successfully.`,
    });
    setShowAddMilestoneDialog(false);
    resetMilestoneForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddMilestoneDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Milestone Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-base">{milestone.title}</CardTitle>
                    <p className="text-xs text-slate-600 mt-1">{milestone.id}</p>
                  </div>
                </div>
                <Badge variant="outline" className={statusConfig[milestone.status].class}>
                  {statusConfig[milestone.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>Target: {milestone.targetDate}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>Progress</span>
                  <span className="font-medium">{milestone.progress}%</span>
                </div>
                <Progress value={milestone.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            {/* Timeline Items */}
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative pl-14">
                  {/* Timeline Dot */}
                  <div className={`absolute left-4 top-1 w-5 h-5 rounded-full border-4 border-white ${milestone.color}`} />
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                      <Badge variant="outline" className={statusConfig[milestone.status].class}>
                        {statusConfig[milestone.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{milestone.targetDate}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={milestone.progress} className="flex-1 h-2" />
                      <span className="text-xs text-slate-600">{milestone.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Milestone Dialog */}
      <Dialog open={showAddMilestoneDialog} onOpenChange={setShowAddMilestoneDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>Create a new milestone for this project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">Milestone Title *</Label>
              <Input
                id="milestone-title"
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                placeholder="Enter milestone title"
                className={formErrors.title ? 'border-red-500' : ''}
              />
              {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea
                id="milestone-description"
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                placeholder="Enter milestone description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-date">Target Date *</Label>
              <Input
                id="milestone-date"
                type="date"
                value={milestoneForm.targetDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                className={formErrors.targetDate ? 'border-red-500' : ''}
              />
              {formErrors.targetDate && <p className="text-xs text-red-500">{formErrors.targetDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-status">Status</Label>
              <Select value={milestoneForm.status} onValueChange={(value) => setMilestoneForm({ ...milestoneForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddMilestoneDialog(false); resetMilestoneForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddMilestone}>Add Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
