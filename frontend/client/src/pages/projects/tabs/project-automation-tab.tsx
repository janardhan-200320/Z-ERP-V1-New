import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Zap, Plus, Play, Settings, Trash2 } from 'lucide-react';

interface ProjectAutomationTabProps {
  projectId: string | undefined;
}

export default function ProjectAutomationTab({ projectId }: ProjectAutomationTabProps) {
  const { toast } = useToast();
  const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);
  const [showEditRuleDialog, setShowEditRuleDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({
    trigger: '',
    action: '',
    name: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const automationRules = [
    {
      id: 'AR-001',
      trigger: 'When task status changes to "Done"',
      action: 'Send notification to project manager',
      status: true
    },
    {
      id: 'AR-002',
      trigger: 'When milestone is completed',
      action: 'Create invoice and notify client',
      status: true
    },
    {
      id: 'AR-003',
      trigger: 'When deadline is approaching (2 days)',
      action: 'Send reminder email to assignee',
      status: true
    },
    {
      id: 'AR-004',
      trigger: 'When budget reaches 80%',
      action: 'Alert project manager and stakeholders',
      status: false
    },
    {
      id: 'AR-005',
      trigger: 'When new team member is added',
      action: 'Send welcome email with project details',
      status: true
    }
  ];

  const triggerOptions = [
    { value: 'task-done', label: 'When task status changes to "Done"' },
    { value: 'milestone-complete', label: 'When milestone is completed' },
    { value: 'deadline-approaching', label: 'When deadline is approaching (2 days)' },
    { value: 'budget-80', label: 'When budget reaches 80%' },
    { value: 'new-member', label: 'When new team member is added' },
    { value: 'file-uploaded', label: 'When file is uploaded' },
    { value: 'task-overdue', label: 'When task becomes overdue' },
    { value: 'comment-added', label: 'When comment is added to task' }
  ];

  const actionOptions = [
    { value: 'notify-pm', label: 'Send notification to project manager' },
    { value: 'create-invoice', label: 'Create invoice and notify client' },
    { value: 'send-reminder', label: 'Send reminder email to assignee' },
    { value: 'alert-stakeholders', label: 'Alert project manager and stakeholders' },
    { value: 'welcome-email', label: 'Send welcome email with project details' },
    { value: 'create-task', label: 'Create follow-up task' },
    { value: 'update-status', label: 'Update project status' },
    { value: 'send-slack', label: 'Send Slack notification' }
  ];

  const validateRuleForm = () => {
    const errors: Record<string, string> = {};
    if (!ruleForm.name.trim()) errors.name = 'Rule name is required';
    if (!ruleForm.trigger) errors.trigger = 'Please select a trigger';
    if (!ruleForm.action) errors.action = 'Please select an action';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetRuleForm = () => {
    setRuleForm({
      trigger: '',
      action: '',
      name: ''
    });
    setFormErrors({});
  };

  const handleCreateRule = () => {
    if (!validateRuleForm()) return;
    
    toast({
      title: "Automation Rule Created",
      description: `Rule "${ruleForm.name}" has been created and activated.`,
    });
    setShowNewRuleDialog(false);
    resetRuleForm();
  };

  const handleEditRule = (rule: any) => {
    setSelectedRule(rule);
    setRuleForm({
      name: rule.id,
      trigger: rule.trigger,
      action: rule.action
    });
    setShowEditRuleDialog(true);
  };

  const handleUpdateRule = () => {
    if (!validateRuleForm()) return;
    
    toast({
      title: "Rule Updated",
      description: `Automation rule has been updated successfully.`,
    });
    setShowEditRuleDialog(false);
    resetRuleForm();
    setSelectedRule(null);
  };

  const handleTestRule = (rule: any) => {
    toast({
      title: "Rule Test Executed",
      description: `Testing rule "${rule.id}": ${rule.trigger} → ${rule.action}`,
    });
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    toast({
      title: enabled ? "Rule Enabled" : "Rule Disabled",
      description: `Automation rule ${ruleId} has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Automation Rules</h3>
          <p className="text-sm text-slate-600">Automate repetitive tasks and workflows</p>
        </div>
        <Button size="sm" onClick={() => setShowNewRuleDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Automation Rules List */}
      <div className="grid gap-4">
        {automationRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                      {rule.id}
                    </Badge>
                    <Switch 
                      checked={rule.status} 
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">IF</span>
                      <p className="text-sm text-slate-900">{rule.trigger}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">THEN</span>
                      <p className="text-sm text-slate-900">{rule.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => handleTestRule(rule)}>
                      <Play className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                      <Settings className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rule Builder UI */}
      <Card className="border-dashed border-2">
        <CardContent className="p-12 text-center">
          <Zap className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">Create Custom Automation</h3>
          <p className="text-sm text-slate-600 mb-4">
            Build IF → THEN automation rules to streamline your workflow
          </p>
          <Button onClick={() => setShowNewRuleDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Build New Rule
          </Button>
        </CardContent>
      </Card>

      {/* New Rule Dialog */}
      <Dialog open={showNewRuleDialog} onOpenChange={setShowNewRuleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
            <DialogDescription>Set up an IF → THEN automation rule for your project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name *</Label>
              <Input
                id="rule-name"
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                placeholder="Enter rule name"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>IF (Trigger) *</Label>
              <Select value={ruleForm.trigger} onValueChange={(value) => setRuleForm({ ...ruleForm, trigger: value })}>
                <SelectTrigger className={formErrors.trigger ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a trigger condition" />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.trigger && <p className="text-xs text-red-500">{formErrors.trigger}</p>}
            </div>
            <div className="space-y-2">
              <Label>THEN (Action) *</Label>
              <Select value={ruleForm.action} onValueChange={(value) => setRuleForm({ ...ruleForm, action: value })}>
                <SelectTrigger className={formErrors.action ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select an action to perform" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.action && <p className="text-xs text-red-500">{formErrors.action}</p>}
            </div>
            {ruleForm.trigger && ruleForm.action && (
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-sm font-medium text-slate-900 mb-2">Rule Preview:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">IF</span>
                    <p className="text-sm text-slate-700">
                      {triggerOptions.find(t => t.value === ruleForm.trigger)?.label}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">THEN</span>
                    <p className="text-sm text-slate-700">
                      {actionOptions.find(a => a.value === ruleForm.action)?.label}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewRuleDialog(false); resetRuleForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={showEditRuleDialog} onOpenChange={setShowEditRuleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Automation Rule</DialogTitle>
            <DialogDescription>Modify the automation rule settings.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rule-name">Rule Name *</Label>
              <Input
                id="edit-rule-name"
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                placeholder="Enter rule name"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>IF (Trigger) *</Label>
              <Select value={ruleForm.trigger} onValueChange={(value) => setRuleForm({ ...ruleForm, trigger: value })}>
                <SelectTrigger className={formErrors.trigger ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a trigger condition" />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.trigger && <p className="text-xs text-red-500">{formErrors.trigger}</p>}
            </div>
            <div className="space-y-2">
              <Label>THEN (Action) *</Label>
              <Select value={ruleForm.action} onValueChange={(value) => setRuleForm({ ...ruleForm, action: value })}>
                <SelectTrigger className={formErrors.action ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select an action to perform" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.action && <p className="text-xs text-red-500">{formErrors.action}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditRuleDialog(false); resetRuleForm(); setSelectedRule(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRule}>Update Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
