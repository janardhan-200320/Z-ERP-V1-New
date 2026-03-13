import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ACTION_LABEL, AccessAction, ModuleNode, RBAC_TREE, ROLE_TEMPLATES, keyOf } from './rbac-data';

const buildRoleMap = () => {
  const map: Record<string, string[]> = {};
  ROLE_TEMPLATES.forEach((template) => {
    map[template.name] = template.permissionKeys;
  });
  return map;
};

export default function PermissionsPage() {
  const { toast } = useToast();
  const [tree, setTree] = useState<ModuleNode[]>(RBAC_TREE);
  const [rolePermissionMap, setRolePermissionMap] = useState<Record<string, string[]>>(buildRoleMap());
  const [activeRole, setActiveRole] = useState(ROLE_TEMPLATES[0].name);
  const [search, setSearch] = useState('');

  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [newNode, setNewNode] = useState({
    module: '',
    section: '',
    component: '',
    action: 'view' as AccessAction,
  });

  const rows = useMemo(
    () =>
      tree.flatMap((mod) =>
        mod.sections.flatMap((sec) =>
          sec.components.flatMap((comp) =>
            comp.actions.map((action) => ({
              module: mod.module,
              section: sec.section,
              component: comp.component,
              action,
              key: keyOf(mod.module, sec.section, comp.component, action),
            })),
          ),
        ),
      ),
    [tree],
  );

  const visibleRows = rows.filter((row) => {
    const text = `${row.module} ${row.section} ${row.component} ${row.action}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const activeKeys = rolePermissionMap[activeRole] ?? [];

  const togglePermission = (permissionKey: string, enabled: boolean) => {
    setRolePermissionMap((prev) => {
      const current = prev[activeRole] ?? [];
      const next = enabled ? Array.from(new Set([...current, permissionKey])) : current.filter((k) => k !== permissionKey);
      return { ...prev, [activeRole]: next };
    });
  };

  const addCustomNode = () => {
    const moduleName = newNode.module.trim();
    const sectionName = newNode.section.trim();
    const componentName = newNode.component.trim();

    if (!moduleName || !sectionName || !componentName) {
      toast({ title: 'Missing fields', description: 'Please fill module, section, and component.', variant: 'destructive' });
      return;
    }

    setTree((prev) => {
      const next = structuredClone(prev);
      let moduleNode = next.find((item) => item.module === moduleName);
      if (!moduleNode) {
        moduleNode = { module: moduleName, sections: [] };
        next.push(moduleNode);
      }

      let sectionNode = moduleNode.sections.find((item) => item.section === sectionName);
      if (!sectionNode) {
        sectionNode = { section: sectionName, components: [] };
        moduleNode.sections.push(sectionNode);
      }

      let componentNode = sectionNode.components.find((item) => item.component === componentName);
      if (!componentNode) {
        componentNode = { component: componentName, actions: [] };
        sectionNode.components.push(componentNode);
      }

      if (!componentNode.actions.includes(newNode.action)) {
        componentNode.actions.push(newNode.action);
      }
      return next;
    });

    const key = keyOf(moduleName, sectionName, componentName, newNode.action);
    setRolePermissionMap((prev) => ({
      ...prev,
      [activeRole]: Array.from(new Set([...(prev[activeRole] ?? []), key])),
    }));

    setNewNode({ module: '', section: '', component: '', action: 'view' });
    setIsAddNodeOpen(false);
    toast({ title: 'Permission added', description: 'Custom permission node created.' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Permissions</h1>
            <p className="text-slate-600 mt-1">Minimal view to manage what each role can access.</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsAddNodeOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Permission
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Permission Rows</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{rows.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Active Role</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeRole}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Allowed Keys</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{activeKeys.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <CardTitle>Permission List</CardTitle>
            <div className="grid md:grid-cols-2 gap-2">
              <Select value={activeRole} onValueChange={setActiveRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(rolePermissionMap).map((roleName) => (
                    <SelectItem key={roleName} value={roleName}>{roleName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search module, section, component" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px] rounded-xl border border-slate-200">
              <div className="min-w-[740px]">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
                  <div className="col-span-3">Module</div>
                  <div className="col-span-3">Section</div>
                  <div className="col-span-3">Component / Action</div>
                  <div className="col-span-3 text-right">Allow</div>
                </div>
                {visibleRows.map((row) => {
                  const checked = activeKeys.includes(row.key);
                  return (
                    <div key={row.key} className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-slate-100 text-sm">
                      <div className="col-span-3 text-slate-800">{row.module}</div>
                      <div className="col-span-3 text-slate-700">{row.section}</div>
                      <div className="col-span-3">
                        <p className="text-slate-900">{row.component}</p>
                        <Badge variant="outline" className="mt-1 text-[11px]">{ACTION_LABEL[row.action]}</Badge>
                      </div>
                      <div className="col-span-3 flex justify-end items-center">
                        <Checkbox checked={checked} onCheckedChange={(value) => togglePermission(row.key, value === true)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={isAddNodeOpen} onOpenChange={setIsAddNodeOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom Permission</DialogTitle>
              <DialogDescription>Add your own module/section/component/action key.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Module</Label>
                <Input value={newNode.module} onChange={(e) => setNewNode((prev) => ({ ...prev, module: e.target.value }))} placeholder="e.g. Support" />
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Input value={newNode.section} onChange={(e) => setNewNode((prev) => ({ ...prev, section: e.target.value }))} placeholder="e.g. Tickets" />
              </div>
              <div className="space-y-1.5">
                <Label>Component</Label>
                <Input value={newNode.component} onChange={(e) => setNewNode((prev) => ({ ...prev, component: e.target.value }))} placeholder="e.g. Escalation Panel" />
              </div>
              <div className="space-y-1.5">
                <Label>Action</Label>
                <Select value={newNode.action} onValueChange={(value) => setNewNode((prev) => ({ ...prev, action: value as AccessAction }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTION_LABEL).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddNodeOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={addCustomNode}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
