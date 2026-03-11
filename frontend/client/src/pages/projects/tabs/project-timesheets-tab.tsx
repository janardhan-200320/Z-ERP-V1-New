import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Download, FileText } from 'lucide-react';

interface ProjectTimesheetsTabProps {
  projectId: string | undefined;
}

export default function ProjectTimesheetsTab({ projectId }: ProjectTimesheetsTabProps) {
  const { toast } = useToast();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [timeForm, setTimeForm] = useState({
    employee: '',
    date: '',
    task: '',
    hours: '',
    billable: true,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mock data
  const summaryCards = [
    { title: 'Total Hours', value: '348', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Billable Hours', value: '285', color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Non-Billable', value: '63', color: 'text-slate-600', bgColor: 'bg-slate-100' }
  ];

  const timesheets = [
    { employee: 'Sarah Johnson', date: '2026-01-15', task: 'User Authentication', hours: 8, billable: true, notes: 'Implemented OAuth integration' },
    { employee: 'Mike Brown', date: '2026-01-15', task: 'Frontend Development', hours: 7.5, billable: true, notes: 'Product catalog UI' },
    { employee: 'Emily Davis', date: '2026-01-14', task: 'API Development', hours: 8, billable: true, notes: 'REST endpoints for products' },
    { employee: 'Alex Wilson', date: '2026-01-14', task: 'UI Design', hours: 6, billable: true, notes: 'Homepage wireframes' },
    { employee: 'John Smith', date: '2026-01-13', task: 'Project Planning', hours: 4, billable: false, notes: 'Sprint planning meeting' }
  ];

  const validateTimeForm = () => {
    const errors: Record<string, string> = {};
    if (!timeForm.employee) errors.employee = 'Please select an employee';
    if (!timeForm.date) errors.date = 'Date is required';
    if (!timeForm.task) errors.task = 'Please select a task';
    if (!timeForm.hours) errors.hours = 'Hours are required';
    else if (isNaN(Number(timeForm.hours)) || Number(timeForm.hours) <= 0 || Number(timeForm.hours) > 24) {
      errors.hours = 'Please enter a valid number between 0.5 and 24';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetTimeForm = () => {
    setTimeForm({
      employee: '',
      date: '',
      task: '',
      hours: '',
      billable: true,
      notes: ''
    });
    setFormErrors({});
  };

  const handleLogTime = () => {
    if (!validateTimeForm()) return;
    
    toast({
      title: "Time Logged",
      description: `${timeForm.hours} hours logged successfully.`,
    });
    setShowLogDialog(false);
    resetTimeForm();
  };

  return (
    <div className="space-y-6">
      {/* Log Time Button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowLogDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Time
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Clock className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{card.value}h</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timesheet Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time Entries</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((entry, index) => (
                <TableRow key={index} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{entry.employee}</TableCell>
                  <TableCell className="text-slate-600">{entry.date}</TableCell>
                  <TableCell>{entry.task}</TableCell>
                  <TableCell className="font-medium">{entry.hours}h</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={entry.billable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}>
                      {entry.billable ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{entry.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Time Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Time Entry</DialogTitle>
            <DialogDescription>Record time spent on project tasks</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={timeForm.employee} onValueChange={(value) => setTimeForm({ ...timeForm, employee: value })}>
                <SelectTrigger className={formErrors.employee ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="mike-brown">Mike Brown</SelectItem>
                  <SelectItem value="emily-davis">Emily Davis</SelectItem>
                  <SelectItem value="alex-wilson">Alex Wilson</SelectItem>
                  <SelectItem value="john-smith">John Smith</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.employee && <p className="text-xs text-red-500">{formErrors.employee}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input 
                type="date" 
                value={timeForm.date}
                onChange={(e) => setTimeForm({ ...timeForm, date: e.target.value })}
                className={formErrors.date ? 'border-red-500' : ''}
              />
              {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label>Task *</Label>
              <Select value={timeForm.task} onValueChange={(value) => setTimeForm({ ...timeForm, task: value })}>
                <SelectTrigger className={formErrors.task ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user-authentication">User Authentication</SelectItem>
                  <SelectItem value="frontend-development">Frontend Development</SelectItem>
                  <SelectItem value="api-development">API Development</SelectItem>
                  <SelectItem value="ui-design">UI Design</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="project-planning">Project Planning</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.task && <p className="text-xs text-red-500">{formErrors.task}</p>}
            </div>
            <div className="space-y-2">
              <Label>Hours *</Label>
              <Input 
                type="number" 
                step="0.5" 
                min="0.5"
                max="24"
                value={timeForm.hours}
                onChange={(e) => setTimeForm({ ...timeForm, hours: e.target.value })}
                placeholder="8"
                className={formErrors.hours ? 'border-red-500' : ''}
              />
              {formErrors.hours && <p className="text-xs text-red-500">{formErrors.hours}</p>}
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Billable</Label>
                <p className="text-xs text-slate-500">Is this time billable to the client?</p>
              </div>
              <Switch 
                checked={timeForm.billable}
                onCheckedChange={(checked) => setTimeForm({ ...timeForm, billable: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                placeholder="Brief description of work done..."
                value={timeForm.notes}
                onChange={(e) => setTimeForm({ ...timeForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowLogDialog(false); resetTimeForm(); }}>Cancel</Button>
            <Button onClick={handleLogTime}>Log Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
