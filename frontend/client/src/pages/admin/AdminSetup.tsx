import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Globe, Users, Shield, Upload, CheckCircle, XCircle,
  Edit, Trash2, Plus, Save, Settings, Lock, Mail, Bell, Calendar
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSetup() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const users = [
    { id: "1", name: "John Admin", email: "john@company.com", role: "Administrator", status: "active", lastLogin: "2 hours ago" },
    { id: "2", name: "Sarah Manager", email: "sarah@company.com", role: "Manager", status: "active", lastLogin: "1 day ago" },
    { id: "3", name: "Mike User", email: "mike@company.com", role: "User", status: "active", lastLogin: "3 days ago" },
    { id: "4", name: "Emily Sales", email: "emily@company.com", role: "Sales", status: "inactive", lastLogin: "1 week ago" }
  ];

  const roles = ["Administrator", "Manager", "Sales", "Accountant", "User"];
  const permissions = ["View", "Create", "Edit", "Delete", "Export", "Approve"];
  const modules = ["Sales", "CRM", "Accounting", "HR", "Projects", "Inventory"];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your organization settings</p>
        </div>

        <Tabs defaultValue="company" className="space-y-4">
          <TabsList>
            <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="domain">Domain Setup</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
          </TabsList>

          {/* Company Details Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Company Logo</label>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG or JPG. Max 2MB. Recommended: 512x512px
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <Input defaultValue="Acme Corporation" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Legal Name</label>
                    <Input defaultValue="Acme Corporation Inc." className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tax ID / EIN</label>
                    <Input defaultValue="12-3456789" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Industry</label>
                    <Input defaultValue="Technology" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input defaultValue="+1 (555) 123-4567" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" defaultValue="info@acmecorp.com" className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <Textarea defaultValue="123 Business St, San Francisco, CA 94105" className="mt-1" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domain Setup Tab */}
          <TabsContent value="domain" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  Domain Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">acmecorp.z-erp.com</p>
                          <p className="text-sm text-gray-500">Primary domain</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            SSL Active
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">app.acmecorp.com</p>
                          <p className="text-sm text-gray-500">Custom domain</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-amber-500">
                            <Settings className="w-3 h-3 mr-1" />
                            Pending DNS
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Domain
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">DNS Configuration Instructions</h3>
                  <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                    <p>CNAME: app → z-erp-proxy.com</p>
                    <p className="mt-2">TXT: _verification → abc123def456</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    User Management
                  </CardTitle>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg divide-y">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                          {user.role}
                        </Badge>
                        <Badge className={user.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                          {user.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Last login</p>
                          <p className="text-xs text-gray-500">{user.lastLogin}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Roles & Permissions Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold text-gray-700">Module</th>
                        {roles.map((role) => (
                          <th key={role} className="text-center p-3 font-semibold text-gray-700">
                            {role}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((module) => (
                        <tr key={module} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">{module}</td>
                          {roles.map((role) => (
                            <td key={`${module}-${role}`} className="p-3 text-center">
                              <input
                                type="checkbox"
                                defaultChecked={role === "Administrator" || (role === "Manager" && Math.random() > 0.3)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline">Reset to Default</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Enable Two-Factor Authentication", description: "Require 2FA for all users", enabled: true },
                  { label: "Password Expiration", description: "Force password change every 90 days", enabled: false },
                  { label: "Session Timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true },
                  { label: "IP Whitelist", description: "Restrict access to specific IP addresses", enabled: false },
                  { label: "Audit Logging", description: "Track all user actions", enabled: true }
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <Switch defaultChecked={setting.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
