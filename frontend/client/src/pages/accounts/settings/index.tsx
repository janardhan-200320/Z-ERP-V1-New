import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Settings as SettingsIcon, Plus, Trash2, Edit2, 
  Mail, MessageSquare, Bell, Save, X, Info,
  ShieldCheck, ShieldAlert, UserCheck, Users as UsersIcon,
  Check, Lock, Unlock, Eye, FileText, Download, Trash
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type Template = {
  id: string;
  name: string;
  subject?: string;
  body: string;
  type: 'email' | 'sms';
  trigger: string;
};

type RolePermission = {
  id: string;
  role: string;
  description: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
};

export default function AccountSettings({ includeLayout = true }: any) {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([
    'Sales Revenue', 'Consulting Income', 'Office Expenses', 'Utilities'
  ]);

  // Templates State
  const [templates, setTemplates] = useState<Template[]>([
    { id: '1', name: 'Invoice Due Soon', type: 'email', subject: 'Payment Reminder: Invoice {invoice_no}', body: 'Dear {customer_name}, your invoice {invoice_no} for {amount} is due in 3 days.', trigger: '3 days before due' },
    { id: '2', name: 'Overdue Notice', type: 'sms', body: 'URGENT: Your payment for {invoice_no} is now overdue. Please settle immediately to avoid service disruption.', trigger: '1 day after due' },
    { id: '3', name: 'Payment Receipt', type: 'email', subject: 'Thank you for your payment', body: 'We have received your payment of {amount} for invoice {invoice_no}. Thank you!', trigger: 'On payment' },
  ]);

  // Permissions State
  const [roles, setRoles] = useState<RolePermission[]>([
    { 
      id: 'r1', 
      role: 'Administrator', 
      description: 'Full access to all financial modules and settings.',
      permissions: { view: true, create: true, edit: true, delete: true, approve: true } 
    },
    { 
      id: 'r2', 
      role: 'Accountant', 
      description: 'Can manage daily transactions and reports.',
      permissions: { view: true, create: true, edit: true, delete: false, approve: true } 
    },
    { 
      id: 'r3', 
      role: 'Junior Staff', 
      description: 'Can view data and record entries but cannot delete or approve.',
      permissions: { view: true, create: true, edit: false, delete: false, approve: false } 
    },
  ]);

  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedRole, setSelectedRole] = useState<RolePermission | null>(null);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Duplicate Category",
        description: "This category already exists.",
        variant: "destructive"
      });
      return;
    }
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
    toast({
      title: "Category Added",
      description: `"${newCategory}" has been added to the system.`
    });
  };

  const handleDeleteCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
    toast({
      title: "Category Removed",
      description: `"${cat}" has been deleted.`,
      variant: "destructive"
    });
  };

  const handleSaveTemplate = (template: Template) => {
    setTemplates(templates.map(t => t.id === template.id ? template : t));
    setSelectedTemplate(null);
    toast({
      title: "Template Saved",
      description: "Changes have been successfully synchronized.",
    });
  };

  const handleSaveRole = (role: RolePermission) => {
    setRoles(roles.map(r => r.id === role.id ? role : r));
    setSelectedRole(null);
    toast({
      title: "Permissions Updated",
      description: `Access control for ${role.role} has been updated.`,
    });
  };

  const content = (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-slate-600" />
          Settings
        </h2>
        <p className="text-sm text-slate-600 mt-1">Configure accounts module preferences</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        {/* ... (rest of the Tabs content) ... */}
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="bank">Bank Configuration</TabsTrigger>
          <TabsTrigger value="reminders">Reminder Templates</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income & Expense Categories</CardTitle>
              <CardDescription>
                Add, edit, or delete income and expense categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Add New Category</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Category name" 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button onClick={handleAddCategory} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Existing Categories</h4>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <div key={cat} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {cat}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Configuration</CardTitle>
              <CardDescription>
                Configure bank account defaults and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Payment Method</Label>
                  <Input placeholder="Bank Transfer" />
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input placeholder="USD" />
                </div>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notification Protocols
              </CardTitle>
              <CardDescription>
                Configure automated communication templates for financial events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map(tmp => (
                    <div key={tmp.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          tmp.type === 'email' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                        )}>
                          {tmp.type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 group-hover:text-blue-600"
                          onClick={() => setSelectedTemplate(tmp)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{tmp.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{tmp.trigger}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-blue-800 uppercase tracking-tight">Dynamic Placeholders</h5>
                    <p className="text-[11px] text-blue-600/80 mt-1 font-medium italic">
                      Use placeholders like {"{customer_name}"}, {"{invoice_no}"}, and {"{amount}"} to personalize alerts.
                    </p>
                  </div>
                </div>

                <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {selectedTemplate?.type === 'email' ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                        Edit {selectedTemplate?.name}
                      </DialogTitle>
                      <DialogDescription>
                        Modify the {selectedTemplate?.type} message for {selectedTemplate?.trigger.toLowerCase()}.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedTemplate && (
                      <div className="space-y-4 py-4">
                        {selectedTemplate.type === 'email' && (
                          <div className="space-y-2">
                            <Label>Email Subject</Label>
                            <Input 
                              value={selectedTemplate.subject || ''} 
                              onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                              className="font-medium"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Message Body</Label>
                          <Textarea 
                            value={selectedTemplate.body} 
                            onChange={e => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                            className="min-h-[150px] leading-relaxed"
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
                      <Button onClick={() => handleSaveTemplate(selectedTemplate!)} className="gap-2 bg-slate-900 border-none">
                        <Save className="h-4 w-4" />
                        Save Template
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                    Role-Based Access Control
                  </CardTitle>
                  <CardDescription>
                    Define granular permissions for different user levels
                  </CardDescription>
                </div>
                <Button variant="outline" className="gap-2 border-slate-200 hover:bg-slate-50">
                  <Plus className="h-4 w-4" />
                  Add New Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-start justify-between p-4 border border-slate-100 rounded-xl bg-white hover:border-indigo-200 hover:shadow-sm transition-all group">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <UsersIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{role.role}</h4>
                          {role.role === 'Administrator' && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">System Default</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 max-w-md">{role.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(role.permissions).map(([key, value]) => (
                            <span 
                              key={key} 
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-md font-medium uppercase tracking-tighter flex items-center gap-1",
                                value ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100 grayscale"
                              )}
                            >
                              {value ? <Check className="h-2 w-2" /> : <X className="h-2 w-2" />}
                              {key}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedRole(role)}
                      className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Role Permission Editor Dialog */}
              <Dialog open={!!selectedRole} onOpenChange={(open) => !open && setSelectedRole(null)}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                      <ShieldAlert className="h-6 w-6 text-indigo-600" />
                    </div>
                    <DialogTitle className="text-xl">Configure Permissions</DialogTitle>
                    <DialogDescription>
                      Grant or revoke access for the <strong>{selectedRole?.role}</strong> role.
                    </DialogDescription>
                  </DialogHeader>

                  {selectedRole && (
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label>Role Name</Label>
                        <Input 
                          value={selectedRole.role} 
                          disabled={selectedRole.role === 'Administrator'}
                          onChange={e => setSelectedRole({...selectedRole, role: e.target.value})}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base">Functional Access</Label>
                        <div className="grid gap-3">
                          {[
                            { id: 'view', label: 'View Data', icon: Eye, desc: 'Read-only access to records' },
                            { id: 'create', label: 'Create Records', icon: FileText, desc: 'Ability to add new entries' },
                            { id: 'edit', label: 'Edit Content', icon: Edit2, desc: 'Modify existing information' },
                            { id: 'approve', label: 'Approve Actions', icon: UserCheck, desc: 'Validate or approve workflows' },
                            { id: 'delete', label: 'Delete Data', icon: Trash, desc: 'Permanent removal of records', danger: true },
                          ].map((perm) => (
                            <div key={perm.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50/50 transition-colors">
                              <div className="flex gap-3">
                                <div className={cn(
                                  "h-8 w-8 rounded-lg flex items-center justify-center",
                                  perm.danger ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                                )}>
                                  <perm.icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{perm.label}</p>
                                  <p className="text-[11px] text-slate-500">{perm.desc}</p>
                                </div>
                              </div>
                              <Switch 
                                checked={(selectedRole.permissions as any)[perm.id]} 
                                onCheckedChange={(val) => setSelectedRole({
                                  ...selectedRole, 
                                  permissions: { ...selectedRole.permissions, [perm.id]: val }
                                })}
                                disabled={selectedRole.role === 'Administrator'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedRole(null)} className="border-slate-200">Cancel</Button>
                    <Button 
                      onClick={() => handleSaveRole(selectedRole!)} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm shadow-indigo-200"
                    >
                      Apply Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (!includeLayout) return content;

  return (
    <DashboardLayout>
      {content}
    </DashboardLayout>
  );
}
