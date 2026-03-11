import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Lock, Search, Shield, Eye, Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
  action: 'Create' | 'Read' | 'Update' | 'Delete';
  roles: string[];
  enabled: boolean;
}

export default function PermissionsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModule, setActiveModule] = useState('all');

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'PERM-001',
      name: 'Create Users',
      module: 'User Management',
      description: 'Ability to create new user accounts',
      action: 'Create',
      roles: ['Super Admin', 'HR Manager'],
      enabled: true,
    },
    {
      id: 'PERM-002',
      name: 'View Reports',
      module: 'Reporting',
      description: 'Access to view system reports',
      action: 'Read',
      roles: ['Manager', 'Analyst'],
      enabled: true,
    },
    {
      id: 'PERM-003',
      name: 'Edit Customers',
      module: 'CRM',
      description: 'Modify customer information',
      action: 'Update',
      roles: ['Sales Manager', 'Sales Rep'],
      enabled: true,
    },
    {
      id: 'PERM-004',
      name: 'Delete Invoices',
      module: 'Finance',
      description: 'Remove invoices from the system',
      action: 'Delete',
      roles: ['Super Admin', 'Finance Manager'],
      enabled: false,
    },
    {
      id: 'PERM-005',
      name: 'Approve Leaves',
      module: 'HR',
      description: 'Approve or reject leave requests',
      action: 'Update',
      roles: ['HR Manager', 'Department Manager'],
      enabled: true,
    },
    {
      id: 'PERM-006',
      name: 'View Payroll',
      module: 'HR',
      description: 'Access payroll information',
      action: 'Read',
      roles: ['HR Manager', 'Accountant'],
      enabled: true,
    },
    {
      id: 'PERM-007',
      name: 'Create Projects',
      module: 'Project Management',
      description: 'Create new projects',
      action: 'Create',
      roles: ['Project Manager', 'Super Admin'],
      enabled: true,
    },
    {
      id: 'PERM-008',
      name: 'Delete Products',
      module: 'Inventory',
      description: 'Remove products from inventory',
      action: 'Delete',
      roles: ['Super Admin', 'Inventory Manager'],
      enabled: true,
    },
  ]);

  const modules = ['all', ...Array.from(new Set(permissions.map(p => p.module)))];

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.module.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModule = activeModule === 'all' || permission.module === activeModule;
    
    return matchesSearch && matchesModule;
  });

  const handleTogglePermission = (permissionId: string) => {
    setPermissions(prev =>
      prev.map(p =>
        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
      )
    );
    toast({
      title: 'Permission Updated',
      description: 'Permission status has been updated successfully.',
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Create':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Read':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Update':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Delete':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const permissionsByModule = modules.filter(m => m !== 'all').map(module => ({
    module,
    permissions: permissions.filter(p => p.module === module),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Permissions Management</h1>
            <p className="text-slate-600 mt-1">Configure system-wide access permissions</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Permission
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Permissions</p>
                  <p className="text-2xl font-bold text-slate-900">{permissions.length}</p>
                </div>
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {permissions.filter(p => p.enabled).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Disabled</p>
                  <p className="text-2xl font-bold text-slate-400">
                    {permissions.filter(p => !p.enabled).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Modules</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {modules.length - 1}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeModule} onValueChange={setActiveModule}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>System Permissions</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <TabsList className="mt-4">
                {modules.map(module => (
                  <TabsTrigger key={module} value={module} className="capitalize">
                    {module === 'all' ? 'All Modules' : module}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="all" className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Assigned Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{permission.name}</p>
                            <p className="text-sm text-slate-500">{permission.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {permission.module}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getActionColor(permission.action)}>
                            {permission.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {permission.roles.map((role, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={permission.enabled}
                            onCheckedChange={() => handleTogglePermission(permission.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {permissionsByModule.map(({ module, permissions: modulePerms }) => (
                <TabsContent key={module} value={module} className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Assigned Roles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modulePerms.filter(p => 
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{permission.name}</p>
                              <p className="text-sm text-slate-500">{permission.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getActionColor(permission.action)}>
                              {permission.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {permission.roles.map((role, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={permission.enabled}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
