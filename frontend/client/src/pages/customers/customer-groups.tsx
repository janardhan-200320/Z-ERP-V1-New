import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Plus, Edit, Trash2, UserPlus, Search, Filter, 
  MoreHorizontal, Eye, Copy, Download, RefreshCw, Settings,
  FolderTree, TrendingUp, ChevronRight, Check, X, Palette,
  Building, Mail, Phone, UserCheck, UserMinus, CheckCircle2, XCircle,
  Save, ArrowRight, ExternalLink, FileText, Hash, Globe, MapPin
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  customerCount: number;
  color: string;
  colorName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailableCustomer {
  id: number;
  companyName: string;
  primaryContact: string;
  primaryEmail: string;
  phone: string;
  isInGroup: boolean;
}

const colorOptions = [
  { name: "Purple", value: "bg-purple-500", text: "text-purple-500", light: "bg-purple-50" },
  { name: "Blue", value: "bg-blue-500", text: "text-blue-500", light: "bg-blue-50" },
  { name: "Green", value: "bg-green-500", text: "text-green-500", light: "bg-green-50" },
  { name: "Orange", value: "bg-orange-500", text: "text-orange-500", light: "bg-orange-50" },
  { name: "Red", value: "bg-red-500", text: "text-red-500", light: "bg-red-50" },
  { name: "Pink", value: "bg-pink-500", text: "text-pink-500", light: "bg-pink-50" },
  { name: "Indigo", value: "bg-indigo-500", text: "text-indigo-500", light: "bg-indigo-50" },
  { name: "Teal", value: "bg-teal-500", text: "text-teal-500", light: "bg-teal-50" },
  { name: "Yellow", value: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-50" },
  { name: "Cyan", value: "bg-cyan-500", text: "text-cyan-500", light: "bg-cyan-50" },
];

// Available customers for adding to groups
const availableCustomers: AvailableCustomer[] = [
  { id: 1, companyName: "Sarmad", primaryContact: "Sarmad Staff", primaryEmail: "admin@erpdemo.zedunix.com", phone: "+923318144482", isInGroup: false },
  { id: 2, companyName: "Jack", primaryContact: "", primaryEmail: "", phone: "+917550379111", isInGroup: false },
  { id: 3, companyName: "Tech Innovations Ltd", primaryContact: "John Anderson", primaryEmail: "john.anderson@techinnovations.com", phone: "+1 234 567 8901", isInGroup: true },
  { id: 4, companyName: "Greeen Dot", primaryContact: "Sajeer Moidu", primaryEmail: "info@greendotdesigns.com", phone: "+971 58 667 7503", isInGroup: false },
  { id: 5, companyName: "Hello hello", primaryContact: "", primaryEmail: "", phone: "121221212", isInGroup: false },
  { id: 6, companyName: "jack", primaryContact: "", primaryEmail: "", phone: "7550379111", isInGroup: true },
  { id: 7, companyName: "Arun Pixels Studio", primaryContact: "", primaryEmail: "", phone: "8971766616", isInGroup: false },
  { id: 8, companyName: "C Janardhan", primaryContact: "", primaryEmail: "", phone: "8088983604", isInGroup: false },
  { id: 9, companyName: "Zollid", primaryContact: "Ragni ca", primaryEmail: "raginichavan1703@gmail.com", phone: "12", isInGroup: false },
  { id: 10, companyName: "Zapier Technologies", primaryContact: "", primaryEmail: "", phone: "8317450103", isInGroup: true },
  { id: 11, companyName: "Global Retail Corp", primaryContact: "Sarah Mitchell", primaryEmail: "sarah.mitchell@globalretail.com", phone: "+1 234 567 8902", isInGroup: false },
  { id: 12, companyName: "Healthcare Systems Inc", primaryContact: "Michael Roberts", primaryEmail: "michael.roberts@healthsystems.com", phone: "+1 234 567 8903", isInGroup: false },
];

export default function CustomerGroups() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addCustomersDialogOpen, setAddCustomersDialogOpen] = useState(false);
  const [editCustomerDialogOpen, setEditCustomerDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const { toast } = useToast();

  // Add Customers dialog state
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [selectedCustomersToAdd, setSelectedCustomersToAdd] = useState<number[]>([]);
  const [addCustomersFilter, setAddCustomersFilter] = useState<"all" | "notInGroup" | "inGroup">("all");

  // Edit Customer state
  const [editingCustomer, setEditingCustomer] = useState<AvailableCustomer | null>(null);
  const [editCustomerForm, setEditCustomerForm] = useState({
    companyName: "",
    primaryContact: "",
    primaryEmail: "",
    phone: "",
    address: "",
    website: "",
    notes: ""
  });

  // New group form state
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    colorName: "Blue"
  });

  const groups: CustomerGroup[] = [
    {
      id: "1",
      name: "VIP Customers",
      description: "High-value customers with priority support and exclusive discounts",
      customerCount: 24,
      color: "bg-purple-500",
      colorName: "Purple",
      isActive: true,
      createdAt: "2025-08-15",
      updatedAt: "2025-12-20"
    },
    {
      id: "2",
      name: "Enterprise",
      description: "Enterprise-level customers with dedicated account managers",
      customerCount: 12,
      color: "bg-blue-500",
      colorName: "Blue",
      isActive: true,
      createdAt: "2025-07-10",
      updatedAt: "2025-11-15"
    },
    {
      id: "3",
      name: "SMB",
      description: "Small and medium business customers",
      customerCount: 58,
      color: "bg-green-500",
      colorName: "Green",
      isActive: true,
      createdAt: "2025-06-20",
      updatedAt: "2025-10-01"
    },
    {
      id: "4",
      name: "Trial Users",
      description: "Customers on trial period - follow up required",
      customerCount: 35,
      color: "bg-orange-500",
      colorName: "Orange",
      isActive: true,
      createdAt: "2025-09-01",
      updatedAt: "2026-01-10"
    },
    {
      id: "5",
      name: "Inactive",
      description: "Customers who haven't engaged in 90+ days",
      customerCount: 18,
      color: "bg-red-500",
      colorName: "Red",
      isActive: false,
      createdAt: "2025-05-15",
      updatedAt: "2025-12-01"
    },
    {
      id: "6",
      name: "Partners",
      description: "Strategic business partners and resellers",
      customerCount: 8,
      color: "bg-indigo-500",
      colorName: "Indigo",
      isActive: true,
      createdAt: "2025-04-01",
      updatedAt: "2025-11-20"
    },
  ];

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const handleSelectGroup = (id: string) => {
    if (selectedGroups.includes(id)) {
      setSelectedGroups(selectedGroups.filter(gid => gid !== id));
    } else {
      setSelectedGroups([...selectedGroups, id]);
    }
  };

  const handleCreateGroup = () => {
    toast({
      title: "Group Created",
      description: `${newGroup.name} has been created successfully`,
    });
    setDialogOpen(false);
    setNewGroup({ name: "", description: "", color: "bg-blue-500", colorName: "Blue" });
  };

  const handleEditGroup = (group: CustomerGroup) => {
    setSelectedGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description || "",
      color: group.color,
      colorName: group.colorName
    });
    setEditDialogOpen(true);
  };

  const handleDeleteGroup = (group: CustomerGroup) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Group Deleted",
      description: `${selectedGroup?.name} has been deleted`,
      variant: "destructive"
    });
    setDeleteDialogOpen(false);
    setSelectedGroup(null);
  };

  // Add Customers handlers
  const handleOpenAddCustomers = (group: CustomerGroup) => {
    setSelectedGroup(group);
    setSelectedCustomersToAdd([]);
    setCustomerSearchQuery("");
    setAddCustomersFilter("all");
    setAddCustomersDialogOpen(true);
  };

  const filteredCustomersToAdd = availableCustomers.filter(customer => {
    const matchesSearch = 
      customer.companyName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.primaryContact.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.primaryEmail.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.includes(customerSearchQuery);
    
    if (addCustomersFilter === "notInGroup") return matchesSearch && !customer.isInGroup;
    if (addCustomersFilter === "inGroup") return matchesSearch && customer.isInGroup;
    return matchesSearch;
  });

  const handleToggleCustomerSelection = (customerId: number) => {
    if (selectedCustomersToAdd.includes(customerId)) {
      setSelectedCustomersToAdd(selectedCustomersToAdd.filter(id => id !== customerId));
    } else {
      setSelectedCustomersToAdd([...selectedCustomersToAdd, customerId]);
    }
  };

  const handleSelectAllCustomers = () => {
    const availableIds = filteredCustomersToAdd.filter(c => !c.isInGroup).map(c => c.id);
    if (selectedCustomersToAdd.length === availableIds.length) {
      setSelectedCustomersToAdd([]);
    } else {
      setSelectedCustomersToAdd(availableIds);
    }
  };

  const handleAddCustomersToGroup = () => {
    toast({
      title: "Customers Added",
      description: `${selectedCustomersToAdd.length} customer(s) have been added to "${selectedGroup?.name}"`,
    });
    setAddCustomersDialogOpen(false);
    setSelectedCustomersToAdd([]);
    setSelectedGroup(null);
  };

  const handleRemoveCustomerFromGroup = (customerId: number) => {
    const customer = availableCustomers.find(c => c.id === customerId);
    toast({
      title: "Customer Removed",
      description: `${customer?.companyName} has been removed from "${selectedGroup?.name}"`,
      variant: "destructive"
    });
  };

  // Edit Customer handlers
  const handleOpenEditCustomer = (customer: AvailableCustomer) => {
    setEditingCustomer(customer);
    setEditCustomerForm({
      companyName: customer.companyName,
      primaryContact: customer.primaryContact,
      primaryEmail: customer.primaryEmail,
      phone: customer.phone,
      address: "",
      website: "",
      notes: ""
    });
    setEditCustomerDialogOpen(true);
  };

  const handleSaveCustomer = () => {
    toast({
      title: "Customer Updated",
      description: `${editCustomerForm.companyName} has been updated successfully`,
    });
    setEditCustomerDialogOpen(false);
    setEditingCustomer(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FolderTree className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Groups</h1>
            </div>
            <p className="text-gray-500">Organize customers into groups for targeted management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader className="border-b pb-4">
                  <DialogTitle className="text-lg font-semibold">Create Customer Group</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Create a new group to organize your customers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Group Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="name" 
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                      placeholder="e.g., VIP Customers" 
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                      placeholder="Describe this group's purpose..."
                      rows={3}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Palette className="h-4 w-4 text-gray-400" />
                      Group Color
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setNewGroup({...newGroup, color: color.value, colorName: color.name})}
                          className={`w-full aspect-square rounded-lg ${color.value} transition-all duration-200 hover:scale-110 ${newGroup.color === color.value ? 'ring-2 ring-offset-2 ring-blue-600' : ''}`}
                          title={color.name}
                        >
                          {newGroup.color === color.value && (
                            <Check className="h-4 w-4 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter className="border-t pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-200">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGroup}
                    disabled={!newGroup.name.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Groups</p>
                  <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FolderTree className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.reduce((sum, g) => sum + g.customerCount, 0)}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Groups</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.filter(g => g.isActive).length}
                  </p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Check className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg per Group</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(groups.reduce((sum, g) => sum + g.customerCount, 0) / groups.length)}
                  </p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Toolbar */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                {/* Filter */}
                <Select defaultValue="all">
                  <SelectTrigger className="w-36 border-gray-200">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                {selectedGroups.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {selectedGroups.length} selected
                  </Badge>
                )}
                
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("grid")}
                    className={`rounded-none ${viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "table" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("table")}
                    className={`rounded-none ${viewMode === "table" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid View */}
        {viewMode === "grid" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200 ${selectedGroups.includes(group.id) ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => handleSelectGroup(group.id)}
                          className="border-gray-300"
                        />
                        <div className={`w-4 h-4 rounded-full ${group.color}`} />
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{group.name}</CardTitle>
                          <CardDescription className="text-xs mt-1 text-gray-500 line-clamp-2">
                            {group.description || "No description"}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditGroup(group)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Group
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenAddCustomers(group)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Customers
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Customers
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-600 focus:text-red-600" 
                            onClick={() => handleDeleteGroup(group)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{group.customerCount} customers</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={group.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 group"
                          onClick={() => handleOpenAddCustomers(group)}
                        >
                          <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">Add Customers</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-blue-50"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteGroup(group)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Groups Table View */}
        {viewMode === "table" && (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-gray-300"
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">Group Name</TableHead>
                      <TableHead className="font-semibold text-gray-600">Description</TableHead>
                      <TableHead className="font-semibold text-gray-600 text-center">Customers</TableHead>
                      <TableHead className="font-semibold text-gray-600 text-center">Status</TableHead>
                      <TableHead className="font-semibold text-gray-600">Created</TableHead>
                      <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <TableRow 
                        key={group.id} 
                        className={`hover:bg-blue-50 transition-colors ${selectedGroups.includes(group.id) ? 'bg-blue-50' : ''}`}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedGroups.includes(group.id)}
                            onCheckedChange={() => handleSelectGroup(group.id)}
                            className="border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${group.color}`} />
                            <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                              {group.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 max-w-xs truncate">
                          {group.description || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-gray-100">
                            {group.customerCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={group.isActive}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{group.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-blue-50 text-blue-500 hover:text-blue-600" 
                              onClick={() => handleOpenAddCustomers(group)}
                              title="Add Customers"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50" onClick={() => handleEditGroup(group)}>
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDeleteGroup(group)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-lg font-semibold">Edit Customer Group</DialogTitle>
              <DialogDescription className="text-gray-500">
                Update the group details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Group Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="edit-name" 
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  rows={3}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-400" />
                  Group Color
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setNewGroup({...newGroup, color: color.value, colorName: color.name})}
                      className={`w-full aspect-square rounded-lg ${color.value} transition-all duration-200 hover:scale-110 ${newGroup.color === color.value ? 'ring-2 ring-offset-2 ring-blue-600' : ''}`}
                      title={color.name}
                    >
                      {newGroup.color === color.value && (
                        <Check className="h-4 w-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-gray-200">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  toast({
                    title: "Group Updated",
                    description: `${newGroup.name} has been updated successfully`,
                  });
                  setEditDialogOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Group
              </DialogTitle>
              <DialogDescription className="text-gray-500 pt-2">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{selectedGroup?.name}"</span>? 
                This will remove {selectedGroup?.customerCount} customers from this group. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-gray-200">
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Customers Dialog */}
        <Dialog open={addCustomersDialogOpen} onOpenChange={setAddCustomersDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="border-b px-6 py-4 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${selectedGroup?.color} shadow-sm ring-2 ring-offset-2 ring-gray-100`} />
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Add Customers to {selectedGroup?.name}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 mt-1">
                    Select customers to add to this group. Currently <span className="font-medium text-gray-700">{selectedGroup?.customerCount}</span> customers in this group.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="px-6 py-4 space-y-4 flex-shrink-0 bg-white border-b">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  />
                  {customerSearchQuery && (
                    <button
                      onClick={() => setCustomerSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={addCustomersFilter} onValueChange={(v: "all" | "notInGroup" | "inGroup") => setAddCustomersFilter(v)}>
                  <SelectTrigger className="w-full sm:w-48 h-11 border-gray-200 bg-gray-50">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="notInGroup">Available to Add</SelectItem>
                    <SelectItem value="inGroup">Already in Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Selection Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="selectAllCustomers"
                    checked={selectedCustomersToAdd.length > 0 && selectedCustomersToAdd.length === filteredCustomersToAdd.filter(c => !c.isInGroup).length}
                    onCheckedChange={handleSelectAllCustomers}
                    className="border-blue-300 data-[state=checked]:bg-blue-600 h-5 w-5"
                  />
                  <Label htmlFor="selectAllCustomers" className="text-sm font-medium text-blue-700 cursor-pointer">
                    Select all available
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  {selectedCustomersToAdd.length > 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Badge className="bg-blue-600 hover:bg-blue-700 px-3 py-1">
                        <Check className="h-3 w-3 mr-1" />
                        {selectedCustomersToAdd.length} selected
                      </Badge>
                    </motion.div>
                  )}
                  <span className="text-sm font-medium text-blue-600">
                    {filteredCustomersToAdd.length} customers found
                  </span>
                </div>
              </div>
            </div>

            {/* Customers List with proper scrolling */}
            <div className="flex-1 overflow-hidden bg-gray-50">
              <div className="h-[350px] overflow-y-auto px-6 py-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <AnimatePresence mode="popLayout">
                  {filteredCustomersToAdd.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No customers found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCustomersToAdd.map((customer, index) => (
                        <motion.div
                          key={customer.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.02, duration: 0.2 }}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group
                            ${customer.isInGroup 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
                              : selectedCustomersToAdd.includes(customer.id)
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md ring-2 ring-blue-200 ring-offset-1'
                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm hover:bg-gradient-to-r hover:from-white hover:to-blue-50'
                            }
                          `}
                          onClick={() => !customer.isInGroup && handleToggleCustomerSelection(customer.id)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Enhanced Checkbox or Status Icon */}
                            <div className="pt-0.5">
                              {customer.isInGroup ? (
                                <motion.div 
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                </motion.div>
                              ) : (
                                <Checkbox 
                                  checked={selectedCustomersToAdd.includes(customer.id)}
                                  onCheckedChange={() => handleToggleCustomerSelection(customer.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-6 w-6 border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all"
                                />
                              )}
                            </div>

                            {/* Customer Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Building className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <span className="font-semibold text-gray-900 truncate text-base">
                                    {customer.companyName}
                                  </span>
                                </div>
                                {customer.isInGroup && (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs w-fit px-2.5 py-0.5 font-medium">
                                    <Check className="h-3 w-3 mr-1" />
                                    Already in group
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                                {customer.primaryContact && (
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Users className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="truncate">{customer.primaryContact}</span>
                                  </div>
                                )}
                                {customer.primaryEmail && (
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-blue-400" />
                                    <span className="truncate text-blue-600 hover:text-blue-700 font-medium">{customer.primaryEmail}</span>
                                  </div>
                                )}
                                {customer.phone && (
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                    <span>{customer.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Enhanced Action Icons */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {/* Edit Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditCustomer(customer);
                                }}
                                title="Edit customer details"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {customer.isInGroup ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCustomerFromGroup(customer.id);
                                  }}
                                  title="Remove from group"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-9 w-9 rounded-lg transition-all ${
                                    selectedCustomersToAdd.includes(customer.id)
                                      ? 'text-blue-600 bg-blue-100 hover:bg-blue-200'
                                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-100 opacity-60 group-hover:opacity-100'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCustomerSelection(customer.id);
                                  }}
                                  title={selectedCustomersToAdd.includes(customer.id) ? "Deselect" : "Select to add"}
                                >
                                  {selectedCustomersToAdd.includes(customer.id) ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <UserPlus className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <DialogFooter className="border-t px-6 py-4 flex-shrink-0 bg-white">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAddCustomersDialogOpen(false);
                    setSelectedCustomersToAdd([]);
                  }}
                  className="border-gray-200 hover:bg-gray-100 w-full sm:w-auto h-11"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCustomersToGroup}
                  disabled={selectedCustomersToAdd.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto h-11 px-6 shadow-md hover:shadow-lg transition-all"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add {selectedCustomersToAdd.length > 0 ? `${selectedCustomersToAdd.length} ` : ''}Customer{selectedCustomersToAdd.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={editCustomerDialogOpen} onOpenChange={setEditCustomerDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Edit Customer Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Update information for {editingCustomer?.companyName}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="py-6 space-y-5">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-companyName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-companyName"
                  value={editCustomerForm.companyName}
                  onChange={(e) => setEditCustomerForm({...editCustomerForm, companyName: e.target.value})}
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              {/* Contact and Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contact" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    Primary Contact
                  </Label>
                  <Input
                    id="edit-contact"
                    value={editCustomerForm.primaryContact}
                    onChange={(e) => setEditCustomerForm({...editCustomerForm, primaryContact: e.target.value})}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Contact person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    Email Address
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editCustomerForm.primaryEmail}
                    onChange={(e) => setEditCustomerForm({...editCustomerForm, primaryEmail: e.target.value})}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Phone and Website Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    Phone Number
                  </Label>
                  <Input
                    id="edit-phone"
                    value={editCustomerForm.phone}
                    onChange={(e) => setEditCustomerForm({...editCustomerForm, phone: e.target.value})}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-website" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    Website
                  </Label>
                  <Input
                    id="edit-website"
                    value={editCustomerForm.website}
                    onChange={(e) => setEditCustomerForm({...editCustomerForm, website: e.target.value})}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Address
                </Label>
                <Input
                  id="edit-address"
                  value={editCustomerForm.address}
                  onChange={(e) => setEditCustomerForm({...editCustomerForm, address: e.target.value})}
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Full business address"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  value={editCustomerForm.notes}
                  onChange={(e) => setEditCustomerForm({...editCustomerForm, notes: e.target.value})}
                  className="min-h-[80px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  placeholder="Additional notes about this customer..."
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditCustomerDialogOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="border-gray-200 hover:bg-gray-100 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveCustomer}
                  disabled={!editCustomerForm.companyName.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto px-6"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
