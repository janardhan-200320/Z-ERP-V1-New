import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, DollarSign,
  Users, Calendar, Filter, MoreVertical
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: 'active' | 'suspended' | 'inactive';
  createdDate: string;
  subscriptionEnd: string;
  address: string;
  city: string;
}

export default function OrganizationsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 'ORG001',
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      phone: '+1 234 567 8900',
      plan: 'Enterprise',
      status: 'active',
      createdDate: '2024-01-15',
      subscriptionEnd: '2026-01-15',
      address: '123 Tech Street',
      city: 'San Francisco'
    },
    {
      id: 'ORG002',
      name: 'InnovateTech Inc',
      email: 'info@innovatetech.com',
      phone: '+1 234 567 8901',
      plan: 'Professional',
      status: 'active',
      createdDate: '2024-03-20',
      subscriptionEnd: '2026-03-20',
      address: '456 Innovation Ave',
      city: 'New York'
    },
    {
      id: 'ORG003',
      name: 'StartupHub',
      email: 'hello@startuphub.com',
      phone: '+1 234 567 8902',
      plan: 'Basic',
      status: 'suspended',
      createdDate: '2024-06-10',
      subscriptionEnd: '2025-06-10',
      address: '789 Startup Blvd',
      city: 'Austin'
    },
  ]);

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'suspended':
        return 'bg-amber-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-700';
      case 'Professional':
        return 'bg-blue-100 text-blue-700';
      case 'Basic':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddOrg = () => {
    setEditingOrg(null);
    setDialogOpen(true);
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setDialogOpen(true);
  };

  const handleDeleteOrg = (id: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      setOrganizations(organizations.filter(org => org.id !== id));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizations Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all organizations and their subscriptions</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleAddOrg}>
            <Plus size={18} />
            Add Organization
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Organizations Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Subscription End
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.map((org, idx) => (
                    <tr 
                      key={org.id}
                      className={`border-b hover:bg-slate-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Building2 size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{org.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={12} />
                              {org.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getPlanColor(org.plan)}>
                          {org.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${getStatusColor(org.status)} text-white`}>
                          {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(org.createdDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(org.subscriptionEnd).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditOrg(org)}>
                              <Edit size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteOrg(org.id)}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrgs.length === 0 && (
                <div className="text-center py-12">
                  <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No organizations found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Organization Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingOrg ? 'Edit Organization' : 'Add New Organization'}
              </DialogTitle>
              <DialogDescription>
                {editingOrg ? 'Update organization details' : 'Create a new organization with subscription details'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Organization Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 size={16} />
                  Organization Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Name *</Label>
                    <Input 
                      placeholder="Enter name" 
                      defaultValue={editingOrg?.name}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <Mail size={14} />
                      Email *
                    </Label>
                    <Input 
                      type="email" 
                      placeholder="contact@example.com" 
                      defaultValue={editingOrg?.email}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone size={16} />
                  Contact Information
                </h3>
                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="+1 234 567 8900" 
                    defaultValue={editingOrg?.phone}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Subscription */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign size={16} />
                  Subscription
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subscription Plan</Label>
                    <Select defaultValue={editingOrg?.plan || 'basic'}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select defaultValue={editingOrg?.status || 'active'}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin size={16} />
                  Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Street Address</Label>
                    <Textarea 
                      placeholder="Enter street address" 
                      defaultValue={editingOrg?.address}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input 
                      placeholder="Enter city" 
                      defaultValue={editingOrg?.city}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setDialogOpen(false)}>
                {editingOrg ? 'Save Changes' : 'Create Organization'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Future: Team Chart Placeholder */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Users size={64} className="mx-auto text-indigo-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Chart Coming Soon</h3>
              <p className="text-sm text-gray-600">
                Interactive hierarchical organization chart with zoom and pan capabilities will be available in the next update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
