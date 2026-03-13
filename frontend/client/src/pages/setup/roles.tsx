import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, UserPlus, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RBAC_TREE, ROLE_TEMPLATES, flattenPermissionKeys } from './rbac-data';

type RoleLevel = 'Admin' | 'Manager' | 'User';
type RoleStatus = 'Active' | 'Inactive';

interface RoleRecord {
  id: string;
  name: string;
  level: RoleLevel;
  status: RoleStatus;
  users: number;
  permissionCount: number;
  allowedModules: string[];
}

interface CredentialRecord {
  id: string;
  password: string;
  fullName: string;
  email: string;
  roleName: string;
  status: 'Active' | 'Pending Activation';
  allowedModules: string[];
}

const ROLE_STORAGE_KEY = 'z_erp_roles';
const CREDENTIAL_STORAGE_KEY = 'z_erp_credentials';

const seededRoles: RoleRecord[] = ROLE_TEMPLATES.map((tpl, index) => ({
  id: `ROLE-${String(index + 1).padStart(3, '0')}`,
  name: tpl.name,
  level: tpl.level,
  status: 'Active',
  users: [3, 12, 48, 6, 9][index] ?? 0,
  permissionCount: tpl.permissionKeys.length,
  allowedModules: Array.from(new Set(tpl.permissionKeys.map((key) => key.split('|')[0]))),
}));

export default function RolesPage() {
  const { toast } = useToast();
  const allPermissionKeys = flattenPermissionKeys();

  const [roles, setRoles] = useState<RoleRecord[]>(() => {
    try {
      const raw = localStorage.getItem(ROLE_STORAGE_KEY);
      if (!raw) return seededRoles;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : seededRoles;
    } catch {
      return seededRoles;
    }
  });
  const [credentials, setCredentials] = useState<CredentialRecord[]>(() => {
    try {
      const raw = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(seededRoles[0]?.id ?? '');

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);

  const [roleTemplateKey, setRoleTemplateKey] = useState(ROLE_TEMPLATES[1]?.key ?? ROLE_TEMPLATES[0].key);
  const [roleName, setRoleName] = useState('');
  const [selectedSubdomains, setSelectedSubdomains] = useState<string[]>(
    RBAC_TREE.flatMap((node) =>
      node.sections.flatMap((section) => section.components.map((component) => `${node.module}|${section.section}|${component.component}`)),
    ),
  );

  const [credentialForm, setCredentialForm] = useState({
    password: '',
    fullName: '',
    email: '',
    roleId: '',
    status: 'Pending Activation' as CredentialRecord['status'],
  });

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roles));
    } catch {}
  }, [roles]);

  useEffect(() => {
    try {
      localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credentials));
    } catch {}
  }, [credentials]);

  const filteredRoles = useMemo(
    () => roles.filter((role) => role.name.toLowerCase().includes(search.toLowerCase())),
    [roles, search],
  );

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? filteredRoles[0] ?? roles[0];

  const levelBadge = (level: RoleLevel) => {
    if (level === 'Admin') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (level === 'Manager') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const subdomainIdFromKey = (permissionKey: string) => permissionKey.split('|').slice(0, 3).join('|');

  const getSubdomainsFromPermissionKeys = (permissionKeys: string[]) =>
    Array.from(new Set(permissionKeys.map((permissionKey) => subdomainIdFromKey(permissionKey))));

  const getModuleSubdomainIds = (moduleName: string) => {
    const moduleNode = RBAC_TREE.find((node) => node.module === moduleName);
    if (!moduleNode) return [] as string[];
    return moduleNode.sections.flatMap((section) =>
      section.components.map((component) => `${moduleName}|${section.section}|${component.component}`),
    );
  };

  const toggleModule = (moduleName: string, checked: boolean) => {
    const moduleSubdomains = getModuleSubdomainIds(moduleName);
    setSelectedSubdomains((prev) => {
      if (checked) return Array.from(new Set([...prev, ...moduleSubdomains]));
      return prev.filter((id) => !moduleSubdomains.includes(id));
    });
  };

  const toggleSubdomain = (subdomainId: string, checked: boolean) => {
    setSelectedSubdomains((prev) => {
      if (checked) return Array.from(new Set([...prev, subdomainId]));
      return prev.filter((id) => id !== subdomainId);
    });
  };

  const openRoleDialog = () => {
    const template = ROLE_TEMPLATES.find((t) => t.key === roleTemplateKey) ?? ROLE_TEMPLATES[0];
    setSelectedSubdomains(getSubdomainsFromPermissionKeys(template.permissionKeys));
    setIsRoleDialogOpen(true);
  };

  const createRole = () => {
    if (!roleName.trim()) {
      toast({ title: 'Role name required', description: 'Enter a role name.', variant: 'destructive' });
      return;
    }

    const template = ROLE_TEMPLATES.find((t) => t.key === roleTemplateKey) ?? ROLE_TEMPLATES[0];

    if (selectedSubdomains.length === 0) {
      toast({ title: 'Select modules/subdomains', description: 'Select at least one subdomain under a module.', variant: 'destructive' });
      return;
    }

    const scopedPermissionCount = template.permissionKeys.filter((key) =>
      selectedSubdomains.includes(subdomainIdFromKey(key)),
    ).length;

    const allowedModules = Array.from(new Set(selectedSubdomains.map((id) => id.split('|')[0])));

    const newRole: RoleRecord = {
      id: `ROLE-${String(roles.length + 1).padStart(3, '0')}`,
      name: roleName.trim(),
      level: template.level,
      status: 'Active',
      users: 0,
      permissionCount: scopedPermissionCount,
      allowedModules,
    };

    setRoles((prev) => [newRole, ...prev]);
    setSelectedRoleId(newRole.id);
    setRoleName('');
    setRoleTemplateKey(template.key);
    setSelectedSubdomains(getSubdomainsFromPermissionKeys(template.permissionKeys));
    setIsRoleDialogOpen(false);
    toast({ title: 'Role created', description: `${newRole.name} is ready.` });
  };

  const createCredentials = () => {
    if (!credentialForm.password || !credentialForm.fullName || !credentialForm.email || !credentialForm.roleId) {
      toast({ title: 'Missing details', description: 'Fill email, password, person details, and role.', variant: 'destructive' });
      return;
    }

    const existing = credentials.find((item) => item.email.toLowerCase() === credentialForm.email.toLowerCase());
    if (existing) {
      toast({ title: 'Email already exists', description: 'Choose a different email.', variant: 'destructive' });
      return;
    }

    const role = roles.find((r) => r.id === credentialForm.roleId);
    if (!role) return;

    const entry: CredentialRecord = {
      id: `USR-${1000 + credentials.length + 1}`,
      password: credentialForm.password,
      fullName: credentialForm.fullName,
      email: credentialForm.email,
      roleName: role.name,
      status: credentialForm.status,
      allowedModules: role.allowedModules,
    };

    setCredentials((prev) => [entry, ...prev]);
    setRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, users: r.users + 1 } : r)));
    setCredentialForm({ password: '', fullName: '', email: '', roleId: '', status: 'Pending Activation' });
    setIsCredentialDialogOpen(false);
    toast({ title: 'Credentials created', description: `${entry.fullName} can login using email and password.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Roles</h1>
            <p className="text-slate-600 mt-1">Simple role setup and user credential assignment.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCredentialDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Credentials
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openRoleDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="py-3">
            <p className="text-sm text-amber-800">
              Note: First create and save the role with required module/subdomain access, then create credentials and assign that role.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Total Roles</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{roles.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Users Assigned</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{roles.reduce((sum, role) => sum + role.users, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Permission Keys</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{allPermissionKeys.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7">
            <CardHeader className="space-y-3">
              <CardTitle>Role List</CardTitle>
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search role" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id} onClick={() => setSelectedRoleId(role.id)} className="cursor-pointer">
                      <TableCell className="font-medium text-slate-900">{role.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={levelBadge(role.level)}>{role.level}</Badge>
                      </TableCell>
                      <TableCell>{role.users}</TableCell>
                      <TableCell>{role.permissionCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={role.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
                          {role.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Selected Role</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRole ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <p className="font-semibold text-slate-900">{selectedRole.name}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className={levelBadge(selectedRole.level)}>{selectedRole.level}</Badge>
                    <Badge variant="outline">{selectedRole.permissionCount} permissions</Badge>
                    <Badge variant="outline">{selectedRole.users} users</Badge>
                    <Badge variant="outline">{selectedRole.allowedModules.length} modules</Badge>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setRoles((prev) =>
                        prev.map((role) =>
                          role.id === selectedRole.id
                            ? { ...role, status: role.status === 'Active' ? 'Inactive' : 'Active' }
                            : role,
                        ),
                      )
                    }
                  >
                    {selectedRole.status === 'Active' ? 'Deactivate Role' : 'Activate Role'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No role selected.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-slate-500">No credentials created yet.</TableCell>
                  </TableRow>
                ) : (
                  credentials.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.roleName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Role</DialogTitle>
              <DialogDescription>Create a role from a template in 2 quick steps.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Role Name</Label>
                <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g. Branch Staff" />
              </div>
              <div className="space-y-1.5">
                <Label>Template</Label>
                <Select
                  value={roleTemplateKey}
                  onValueChange={(value) => {
                    setRoleTemplateKey(value);
                    const template = ROLE_TEMPLATES.find((t) => t.key === value);
                    if (template) setSelectedSubdomains(getSubdomainsFromPermissionKeys(template.permissionKeys));
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLE_TEMPLATES.map((template) => (
                      <SelectItem key={template.key} value={template.key}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Main Modules and Sub Modules</Label>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 p-2.5 space-y-2">
                  {RBAC_TREE.map((moduleNode) => {
                    const moduleSubdomains = getModuleSubdomainIds(moduleNode.module);
                    const checked = moduleSubdomains.length > 0 && moduleSubdomains.every((id) => selectedSubdomains.includes(id));
                    return (
                      <div key={moduleNode.module} className="rounded-md border border-slate-200 p-2">
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                          <Checkbox checked={checked} onCheckedChange={(value) => toggleModule(moduleNode.module, value === true)} />
                          {moduleNode.module}
                        </label>
                        <div className="mt-1.5 pl-6 space-y-1">
                          {moduleNode.sections.map((section) => (
                            <div key={`${moduleNode.module}-${section.section}`}>
                              <p className="text-[11px] font-medium text-slate-500 mb-1">{section.section}</p>
                              <div className="space-y-1">
                                {section.components.map((component) => {
                                  const subdomainId = `${moduleNode.module}|${section.section}|${component.component}`;
                                  return (
                                    <label key={subdomainId} className="inline-flex items-center gap-2 text-xs text-slate-700 mr-3">
                                      <Checkbox
                                        checked={selectedSubdomains.includes(subdomainId)}
                                        onCheckedChange={(value) => toggleSubdomain(subdomainId, value === true)}
                                      />
                                      {component.component}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  Selected main modules: {new Set(selectedSubdomains.map((id) => id.split('|')[0])).size} | Selected subdomains: {selectedSubdomains.length}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={createRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Credentials</DialogTitle>
              <DialogDescription>Assign a person to an existing role.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={credentialForm.password}
                  onChange={(e) => setCredentialForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Set password"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={credentialForm.fullName} onChange={(e) => setCredentialForm((prev) => ({ ...prev, fullName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={credentialForm.email} onChange={(e) => setCredentialForm((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={credentialForm.roleId} onValueChange={(value) => setCredentialForm((prev) => ({ ...prev, roleId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCredentialDialogOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={createCredentials}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

