import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Plus, Search, Edit, Trash2, UserCheck, Award, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users: number;
  level: 'Admin' | 'Manager' | 'User';
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export default function RolesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [roles] = useState<Role[]>([
    {
      id: 'ROLE-001',
      name: 'Super Administrator',
      description: 'Complete system access and control',
      permissions: ['All Permissions'],
      users: 2,
      level: 'Admin',
      createdDate: '2024-01-01',
      status: 'Active',
    },
    {
      id: 'ROLE-002',
      name: 'Department Manager',
      description: 'Manage department operations and staff',
      permissions: ['View Reports', 'Manage Team', 'Approve Requests', 'View Analytics'],
      users: 8,
      level: 'Manager',
      createdDate: '2024-01-05',
      status: 'Active',
    },
    {
      id: 'ROLE-003',
      name: 'Sales Representative',
      description: 'Handle sales and customer interactions',
      permissions: ['Create Leads', 'Manage Customers', 'Create Invoices', 'View Reports'],
      users: 15,
      level: 'User',
      createdDate: '2024-01-10',
      status: 'Active',
    },
    {
      id: 'ROLE-004',
      name: 'HR Specialist',
      description: 'Human resources operations',
      permissions: ['Manage Employees', 'Process Payroll', 'View Attendance', 'Manage Leaves'],
      users: 4,
      level: 'User',
      createdDate: '2024-01-15',
      status: 'Active',
    },
    {
      id: 'ROLE-005',
      name: 'Accountant',
      description: 'Financial operations and reporting',
      permissions: ['Manage Accounts', 'Create Reports', 'Process Payments', 'View Analytics'],
      users: 3,
      level: 'User',
      createdDate: '2024-01-20',
      status: 'Active',
    },
  ]);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRole = () => {
    toast({
      title: 'Role Created',
      description: 'New role has been created successfully.',
    });
    setIsAddModalOpen(false);
  };

  const handleEditRole = () => {
    toast({
      title: 'Role Updated',
      description: 'Role details have been updated successfully.',
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteRole = (role: Role) => {
    toast({
      title: 'Role Deleted',
      description: `${role.name} has been removed from the system.`,
      variant: 'destructive',
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'User':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Roles Management</h1>
            <p className="text-slate-600 mt-1">Define and manage user roles and permissions</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Roles</p>
                  <p className="text-2xl font-bold text-slate-900">{roles.length}</p>
                </div>
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Admin Roles</p>
                  <p className="text-2xl font-bold text-red-600">
                    {roles.filter(r => r.level === 'Admin').length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Manager Roles</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {roles.filter(r => r.level === 'Manager').length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {roles.reduce((sum, r) => sum + r.users, 0)}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>System Roles</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{role.name}</p>
                          <p className="text-sm text-slate-500">{role.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600 max-w-xs">{role.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getLevelColor(role.level)}>
                        {role.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{role.users}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{role.permissions.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={role.status === 'Active' ? 'default' : 'secondary'}
                        className={role.status === 'Active' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Role Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role with specific permissions and access levels</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input id="name" placeholder="e.g., Senior Manager" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Access Level *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role's responsibilities and purpose"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRole} className="bg-indigo-600 hover:bg-indigo-700">
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Update role details and settings</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name *</Label>
                <Input id="edit-name" defaultValue={selectedRole?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">Access Level *</Label>
                <Select defaultValue={selectedRole?.level.toLowerCase()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  defaultValue={selectedRole?.description}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRole} className="bg-indigo-600 hover:bg-indigo-700">
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
