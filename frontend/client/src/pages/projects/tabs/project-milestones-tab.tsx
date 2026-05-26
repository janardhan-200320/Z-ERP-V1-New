import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  createProjectMilestone,
  deleteProjectMilestone,
  fetchProjectMilestones,
  updateProjectMilestone,
  type ProjectMilestoneRecord,
} from '@/lib/supabase-data';
import { Target, Plus, Calendar, Pencil, Trash2 } from 'lucide-react';

interface ProjectMilestonesTabProps {
  projectId: string | undefined;
}

type MilestoneStatus = 'completed' | 'in-progress' | 'pending';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: MilestoneStatus;
  progress: number;
}

function mapRecordToMilestone(record: ProjectMilestoneRecord): Milestone {
  const targetDate = record.targetDate ?? record.target_date ?? '';

  return {
    id: String(record.id),
    title: record.title,
    description: record.description ?? '',
    targetDate,
    status: (record.status as MilestoneStatus) ?? 'pending',
    progress: Number(record.progress ?? 0),
  };
}

export default function ProjectMilestonesTab({ projectId }: ProjectMilestonesTabProps) {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMilestoneDialog, setShowAddMilestoneDialog] = useState(false);
  const [showEditMilestoneDialog, setShowEditMilestoneDialog] = useState(false);
  const [showDeleteMilestoneDialog, setShowDeleteMilestoneDialog] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    status: 'pending' as MilestoneStatus,
    progress: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const statusConfig: Record<string, { label: string; class: string }> = {
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700 border-green-200' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    pending: { label: 'Pending', class: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  const validateMilestoneForm = () => {
    const errors: Record<string, string> = {};
    if (!milestoneForm.title.trim()) errors.title = 'Milestone title is required';
    if (!milestoneForm.targetDate) errors.targetDate = 'Target date is required';
    if (Number.isNaN(milestoneForm.progress) || milestoneForm.progress < 0 || milestoneForm.progress > 100) {
      errors.progress = 'Progress must be between 0 and 100';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetMilestoneForm = () => {
    setMilestoneForm({
      title: '',
      description: '',
      targetDate: '',
      status: 'pending',
      progress: 0,
    });
    setFormErrors({});
    setSelectedMilestoneId(null);
  };

  useEffect(() => {
    if (!projectId) return;

    let active = true;
    setIsLoading(true);

    fetchProjectMilestones(Number(projectId))
      .then((records) => {
        if (!active) return;
        setMilestones(records.map(mapRecordToMilestone));
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast({
          title: 'Failed to load milestones',
          description: error instanceof Error ? error.message : 'Unable to fetch milestones from Supabase.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [projectId, toast]);

  const getMilestoneDotClass = (status: MilestoneStatus) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'in-progress') return 'bg-blue-500';
    return 'bg-slate-400';
  };

  const handleAddMilestone = () => {
    if (!validateMilestoneForm()) return;

    if (!projectId) {
      toast({
        title: 'Project not selected',
        description: 'Cannot add milestone: project id is missing.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      project_id: Number(projectId),
      title: milestoneForm.title.trim(),
      description: milestoneForm.description.trim() || null,
      target_date: milestoneForm.targetDate || null,
      status: milestoneForm.status,
      progress: milestoneForm.progress,
    } as const;

    createProjectMilestone(payload)
      .then((record) => {
        setMilestones((prev) => [...prev, mapRecordToMilestone(record)]);
        toast({
          title: 'Milestone Added',
          description: `Milestone "${milestoneForm.title}" has been saved to Supabase.`,
        });
        setShowAddMilestoneDialog(false);
        resetMilestoneForm();
      })
      .catch((error: unknown) => {
        toast({
          title: 'Failed to add milestone',
          description: error instanceof Error ? error.message : 'Unable to save milestone.',
          variant: 'destructive',
        });
      });
  };

  const openEditDialog = (milestone: Milestone) => {
    setSelectedMilestoneId(milestone.id);
    setMilestoneForm({
      title: milestone.title,
      description: milestone.description,
      targetDate: milestone.targetDate,
      status: milestone.status,
      progress: milestone.progress,
    });
    setFormErrors({});
    setShowEditMilestoneDialog(true);
  };

  const handleEditMilestone = () => {
    if (!validateMilestoneForm() || !selectedMilestoneId) return;

    updateProjectMilestone(selectedMilestoneId, {
      title: milestoneForm.title.trim(),
      description: milestoneForm.description.trim(),
      target_date: milestoneForm.targetDate,
      status: milestoneForm.status,
      progress: milestoneForm.progress,
    })
      .then((record) => {
        setMilestones((prev) => prev.map((milestone) => (milestone.id === selectedMilestoneId ? mapRecordToMilestone(record) : milestone)));
        toast({
          title: 'Milestone Updated',
          description: `Milestone "${milestoneForm.title}" has been updated successfully.`,
        });
        setShowEditMilestoneDialog(false);
        resetMilestoneForm();
      })
      .catch((error: unknown) => {
        toast({
          title: 'Failed to update milestone',
          description: error instanceof Error ? error.message : 'Unable to update milestone.',
          variant: 'destructive',
        });
      });
  };

  const openDeleteDialog = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setShowDeleteMilestoneDialog(true);
  };

  const handleDeleteMilestone = () => {
    if (!selectedMilestoneId) return;

    deleteProjectMilestone(selectedMilestoneId)
      .then(() => {
        setMilestones((prev) => prev.filter((milestone) => milestone.id !== selectedMilestoneId));
        setShowDeleteMilestoneDialog(false);
        const deletedMilestone = milestones.find((milestone) => milestone.id === selectedMilestoneId);
        toast({
          title: 'Milestone Deleted',
          description: `Milestone "${deletedMilestone?.title ?? selectedMilestoneId}" has been removed.`,
        });
        resetMilestoneForm();
      })
      .catch((error: unknown) => {
        toast({
          title: 'Failed to delete milestone',
          description: error instanceof Error ? error.message : 'Unable to delete milestone.',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddMilestoneDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading milestones from Supabase...</p>}

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
              {milestone.description && <p className="text-sm text-slate-600">{milestone.description}</p>}
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
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(milestone)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(milestone.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="relative pl-14">
                  <div className={`absolute left-4 top-1 w-5 h-5 rounded-full border-4 border-white ${getMilestoneDotClass(milestone.status)}`} />
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                      <Badge variant="outline" className={statusConfig[milestone.status].class}>
                        {statusConfig[milestone.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{milestone.targetDate}</p>
                    {milestone.description && <p className="text-sm text-slate-600 mt-2">{milestone.description}</p>}
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
              <Select
                value={milestoneForm.status}
                onValueChange={(value: MilestoneStatus) => setMilestoneForm({ ...milestoneForm, status: value })}
              >
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
            <div className="space-y-2">
              <Label htmlFor="milestone-progress">Progress %</Label>
              <Input
                id="milestone-progress"
                type="number"
                min={0}
                max={100}
                value={milestoneForm.progress}
                onChange={(e) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    progress: Number.parseInt(e.target.value || '0', 10),
                  })
                }
                className={formErrors.progress ? 'border-red-500' : ''}
              />
              {formErrors.progress && <p className="text-xs text-red-500">{formErrors.progress}</p>}
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

      <Dialog open={showEditMilestoneDialog} onOpenChange={setShowEditMilestoneDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>Update milestone details for this project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-milestone-title">Milestone Title *</Label>
              <Input
                id="edit-milestone-title"
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                placeholder="Enter milestone title"
                className={formErrors.title ? 'border-red-500' : ''}
              />
              {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-milestone-description">Description</Label>
              <Textarea
                id="edit-milestone-description"
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                placeholder="Enter milestone description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-milestone-date">Target Date *</Label>
              <Input
                id="edit-milestone-date"
                type="date"
                value={milestoneForm.targetDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                className={formErrors.targetDate ? 'border-red-500' : ''}
              />
              {formErrors.targetDate && <p className="text-xs text-red-500">{formErrors.targetDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-milestone-status">Status</Label>
              <Select
                value={milestoneForm.status}
                onValueChange={(value: MilestoneStatus) => setMilestoneForm({ ...milestoneForm, status: value })}
              >
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
            <div className="space-y-2">
              <Label htmlFor="edit-milestone-progress">Progress %</Label>
              <Input
                id="edit-milestone-progress"
                type="number"
                min={0}
                max={100}
                value={milestoneForm.progress}
                onChange={(e) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    progress: Number.parseInt(e.target.value || '0', 10),
                  })
                }
                className={formErrors.progress ? 'border-red-500' : ''}
              />
              {formErrors.progress && <p className="text-xs text-red-500">{formErrors.progress}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditMilestoneDialog(false);
                resetMilestoneForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditMilestone}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteMilestoneDialog} onOpenChange={setShowDeleteMilestoneDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The milestone will be permanently removed from this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => resetMilestoneForm()}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMilestone} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
