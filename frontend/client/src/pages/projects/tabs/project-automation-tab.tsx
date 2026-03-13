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
  
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'AR-001',
      name: 'Notify on Task Done',
      trigger: 'task-done',
      action: 'notify-pm',
      status: true
    },
    {
      id: 'AR-002',
      name: 'Invoice on Milestone',
      trigger: 'milestone-complete',
      action: 'create-invoice',
      status: true
    },
    {
      id: 'AR-003',
      name: 'Deadline Reminders',
      trigger: 'deadline-approaching',
      action: 'send-reminder',
      status: true
    }
  ]);

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
    
    // Auto-generate next ID based on length
    const nextIdNumber = automationRules.length > 0
      ? Math.max(...automationRules.map(r => parseInt((r.id.split('-')[1] || '0'), 10) || 0)) + 1
      : 1;
    const newId = `AR-${String(nextIdNumber).padStart(3, '0')}`;

    const newRule = {
      id: newId,
      name: ruleForm.name,
      trigger: ruleForm.trigger,
      action: ruleForm.action,
      status: true
    };
    
    setAutomationRules([...automationRules, newRule]);

    toast({
      title: "Automation Rule Created",
      description: `Rule "${newRule.name}" has been created and activated.`,
    });
    setShowNewRuleDialog(false);
    resetRuleForm();
  };

  const handleEditRule = (rule: any) => {
    setSelectedRule(rule);
    setRuleForm({
      name: rule.name || rule.id,
      trigger: rule.trigger,
      action: rule.action
    });
    setShowEditRuleDialog(true);
  };

  const handleUpdateRule = () => {
    if (!validateRuleForm() || !selectedRule) return;

    setAutomationRules(automationRules.map(r => 
      r.id === selectedRule.id ? { ...r, name: ruleForm.name, trigger: ruleForm.trigger, action: ruleForm.action } : r
    ));

    toast({
      title: "Rule Updated",
      description: `Automation rule has been updated successfully.`,
    });
    setShowEditRuleDialog(false);
    resetRuleForm();
    setSelectedRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    setAutomationRules(automationRules.filter(r => r.id !== ruleId));
    toast({
      title: "Rule Deleted",
      description: `Automation rule ${ruleId} has been removed.`,
    });
  };

  const handleTestRule = (rule: any) => {
    const triggerLabel = triggerOptions.find(t => t.value === rule.trigger)?.label || rule.trigger;
    const actionLabel = actionOptions.find(a => a.value === rule.action)?.label || rule.action;
    
    toast({
      title: "Rule Test Executed",
      description: `Running test: ${triggerLabel} -> ${actionLabel}`,
    });
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    setAutomationRules(automationRules.map(r => r.id === ruleId ? { ...r, status: enabled } : r));
    toast({
      title: enabled ? "Rule Enabled" : "Rule Disabled",
      description: `Automation rule ${ruleId} has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const getTriggerLabel = (value: string) => triggerOptions.find(t => t.value === value)?.label || value;
  const getActionLabel = (value: string) => actionOptions.find(a => a.value === value)?.label || value;

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
        {automationRules.length === 0 ? (
           <Card className="border-dashed border-2 bg-slate-50">
             <CardContent className="p-12 text-center text-slate-500">
               No automation rules configured. Build a new rule to gain logic control.
             </CardContent>
           </Card>
        ) : automationRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                       <h4 className="font-semibold text-slate-900">{rule.name || rule.id}</h4>
                       <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                         {rule.id}
                       </Badge>
                    </div>
                    <Switch
                      checked={rule.status}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                    />
                  </div>
                  <div className="space-y-2 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded mt-0.5 uppercase tracking-wider">When</span>
                      <p className="text-sm text-slate-700">{getTriggerLabel(rule.trigger)}</p>
                    </div>
                    <div className="pl-3 border-l-2 border-slate-200 ml-3.5 h-3"></div>
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded mt-0.5 uppercase tracking-wider">Then</span>
                      <p className="text-sm text-slate-700">{getActionLabel(rule.action)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="ghost" size="sm" onClick={() => handleTestRule(rule)}>
                      <Play className="h-4 w-4 mr-1 text-slate-500" /> Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                      <Settings className="h-4 w-4 mr-1 text-slate-500" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
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
        <CardContent className="p-10 text-center">
          <Zap className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">Create Custom Automation</h3>
          <p className="text-sm text-slate-600 mb-4">
            Build simple logic rules to streamline your project transitions.
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
            <DialogDescription>Define what triggers the automation and what action occurs.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name <span className="text-red-500">*</span></Label>
              <Input
                id="rule-name"
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                placeholder="e.g., Notify PM on Completion"
                className={formErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>
            
            <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50/50 mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <Label className="text-sm font-semibold text-blue-900">TRIGGER (WHEN...)</Label>
                  </div>
                  <Select value={ruleForm.trigger} onValueChange={(value) => setRuleForm({ ...ruleForm, trigger: value })}>
                    <SelectTrigger className={formErrors.trigger ? 'border-red-500' : 'bg-white'}>
                      <SelectValue placeholder="Select a trigger event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.trigger && <p className="text-xs text-red-500">{formErrors.trigger}</p>}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-green-600" />
                    <Label className="text-sm font-semibold text-green-900">ACTION (THEN...)</Label>
                  </div>
                  <Select value={ruleForm.action} onValueChange={(value) => setRuleForm({ ...ruleForm, action: value })}>
                    <SelectTrigger className={formErrors.action ? 'border-red-500' : 'bg-white'}>
                      <SelectValue placeholder="Select the action to perform..." />
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

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewRuleDialog(false); resetRuleForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule}>Create & Enable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={showEditRuleDialog} onOpenChange={setShowEditRuleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Automation Rule</DialogTitle>
            <DialogDescription>Modify the logic and settings of this automation rule.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rule-name">Rule Name <span className="text-red-500">*</span></Label>
              <Input
                id="edit-rule-name"
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                placeholder="Enter rule name"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>
            
            <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50/50 mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <Label className="text-sm font-semibold text-blue-900">TRIGGER (WHEN...)</Label>
                  </div>
                  <Select value={ruleForm.trigger} onValueChange={(value) => setRuleForm({ ...ruleForm, trigger: value })}>
                    <SelectTrigger className={formErrors.trigger ? 'border-red-500' : 'bg-white'}>
                      <SelectValue placeholder="Select a trigger event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.trigger && <p className="text-xs text-red-500">{formErrors.trigger}</p>}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-green-600" />
                    <Label className="text-sm font-semibold text-green-900">ACTION (THEN...)</Label>
                  </div>
                  <Select value={ruleForm.action} onValueChange={(value) => setRuleForm({ ...ruleForm, action: value })}>
                    <SelectTrigger className={formErrors.action ? 'border-red-500' : 'bg-white'}>
                      <SelectValue placeholder="Select the action to perform..." />
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
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditRuleDialog(false); resetRuleForm(); setSelectedRule(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
