import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { createCustomer, createCustomerGroupMembers, fetchCustomerGroupMembers, fetchCustomerGroups, fetchCustomers, updateCustomer, type CustomerGroupMemberRecord, type CustomerGroupRecord } from "@/lib/supabase-data";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Filter, Plus, Users, FileText, 
  ChevronLeft, ChevronRight, RefreshCw, Download,
  ArrowUpDown, UserCheck, UserX, UserCircle, Clock,
  Globe, FileBarChart, FolderKanban, FileSpreadsheet, ScrollText, Building
} from "lucide-react";

type Customer = {
  id: number;
  companyName: string;
  primaryContact: string;
  primaryEmail: string;
  phone: string;
  active: boolean;
  groups: string[];
  dateCreated: string;
  vatNumber?: string;
  website?: string;
  currency?: string;
  language?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
};

// Country list for dropdowns
const countries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", 
  "Belgium", "Brazil", "Canada", "China", "Colombia", "Denmark", "Egypt", "Finland", 
  "France", "Germany", "Greece", "Hong Kong", "India", "Indonesia", "Ireland", "Israel", 
  "Italy", "Japan", "Kenya", "Malaysia", "Mexico", "Netherlands", "New Zealand", "Nigeria", 
  "Norway", "Pakistan", "Philippines", "Poland", "Portugal", "Qatar", "Russia", "Saudi Arabia", 
  "Singapore", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", 
  "Taiwan", "Thailand", "Turkey", "UAE", "UK", "Ukraine", "USA", "Vietnam"
];

export default function CustomersListModule() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroupRecord[]>([]);
  const [groupMembers, setGroupMembers] = useState<CustomerGroupMemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [excludeInactive, setExcludeInactive] = useState(true);
  const [pageSize, setPageSize] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isManipulationOpen, setIsManipulationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [sortColumn, setSortColumn] = useState<string>("companyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Manipulation dialog state
  const [massDelete, setMassDelete] = useState(false);
  const [selectedGroupForManipulation, setSelectedGroupForManipulation] = useState("");
  
  // Export dialog state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportFields, setExportFields] = useState<string[]>(["companyName", "primaryContact", "primaryEmail", "phone"]);
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    companyName: "",
    vatNumber: "",
    phone: "",
    website: "",
    groups: [] as string[],
    currency: "System Default",
    language: "System Default",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    billingCountry: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
    shippingCountry: ""
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const [rows, groups, members] = await Promise.all([
        fetchCustomers(),
        fetchCustomerGroups(),
        fetchCustomerGroupMembers(),
      ]);

      const groupNameById = new Map<number, string>();
      groups.forEach((group) => groupNameById.set(group.id, group.name));

      const groupsByCustomer = new Map<number, string[]>();
      members.forEach((member) => {
        const groupName = groupNameById.get(member.group_id);
        if (!groupName) return;
        const existing = groupsByCustomer.get(member.customer_id) ?? [];
        groupsByCustomer.set(member.customer_id, [...existing, groupName]);
      });

      setCustomers(
        rows.map((row) => ({
          id: row.id,
          companyName: row.company_name,
          primaryContact: row.primary_contact ?? "",
          primaryEmail: row.primary_email ?? "",
          phone: row.phone ?? "",
          active: row.active,
          groups: groupsByCustomer.get(row.id) ?? row.groups ?? [],
          dateCreated: row.date_created,
          vatNumber: row.vat_number ?? undefined,
          website: row.website ?? undefined,
          currency: row.currency ?? undefined,
          language: row.language ?? undefined,
          address: row.address ?? undefined,
          city: row.city ?? undefined,
          state: row.state ?? undefined,
          zipCode: row.zip_code ?? undefined,
          country: row.country ?? undefined,
        }))
      );
      setCustomerGroups(groups);
      setGroupMembers(members);
    } catch (error) {
      toast({
        title: "Failed to load customers",
        description: error instanceof Error ? error.message : "Unable to load customer data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (active) loadCustomers();
    return () => {
      active = false;
    };
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.active).length;
    const inactiveCustomers = totalCustomers - activeCustomers;
    const activeContacts = customers.filter((c) => c.primaryContact || c.primaryEmail).length;
    const inactiveContacts = totalCustomers - activeContacts;
    const today = new Date().toISOString().slice(0, 10);
    const loggedInToday = customers.filter((c) => c.dateCreated?.slice(0, 10) === today).length;

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      activeContacts,
      inactiveContacts,
      loggedInToday,
    };
  }, [customers]);

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      if (excludeInactive && !customer.active) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          customer.companyName.toLowerCase().includes(query) ||
          customer.primaryContact.toLowerCase().includes(query) ||
          customer.primaryEmail.toLowerCase().includes(query) ||
          customer.phone.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortColumn as keyof Customer];
      const bVal = b[sortColumn as keyof Customer];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCustomer = (id: number) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(cid => cid !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleBulkStatusChange = async (nextActive: boolean) => {
    if (selectedCustomers.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedCustomers.map((customerId) => updateCustomer(customerId, { active: nextActive }))
      );
      setCustomers((prev) =>
        prev.map((customer) =>
          selectedCustomers.includes(customer.id) ? { ...customer, active: nextActive } : customer
        )
      );
      toast({
        title: nextActive ? "Customers activated" : "Customers deactivated",
        description: `${selectedCustomers.length} customer(s) updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Bulk update failed",
        description: error instanceof Error ? error.message : "Unable to update selected customers.",
        variant: "destructive",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.companyName.trim()) return;
    try {
      const created = await createCustomer({
        company_name: newCustomer.companyName.trim(),
        primary_contact: "",
        primary_email: "",
        phone: newCustomer.phone.trim() || null,
        active: true,
        groups: newCustomer.groups,
        vat_number: newCustomer.vatNumber.trim() || null,
        website: newCustomer.website.trim() || null,
        currency: newCustomer.currency || null,
        language: newCustomer.language || null,
        address: newCustomer.address.trim() || null,
        city: newCustomer.city.trim() || null,
        state: newCustomer.state.trim() || null,
        zip_code: newCustomer.zipCode.trim() || null,
        country: newCustomer.country || null,
        billing_street: newCustomer.billingStreet.trim() || null,
        billing_city: newCustomer.billingCity.trim() || null,
        billing_state: newCustomer.billingState.trim() || null,
        billing_zip_code: newCustomer.billingZipCode.trim() || null,
        billing_country: newCustomer.billingCountry.trim() || null,
        shipping_street: newCustomer.shippingStreet.trim() || null,
        shipping_city: newCustomer.shippingCity.trim() || null,
        shipping_state: newCustomer.shippingState.trim() || null,
        shipping_zip_code: newCustomer.shippingZipCode.trim() || null,
        shipping_country: newCustomer.shippingCountry.trim() || null,
      });

      if (selectedGroupIds.length > 0) {
        await createCustomerGroupMembers(
          selectedGroupIds.map((groupId) => ({
            group_id: groupId,
            customer_id: created.id,
          }))
        );
      }

      setCustomers((prev) => [{
        id: created.id,
        companyName: created.company_name,
        primaryContact: created.primary_contact ?? "",
        primaryEmail: created.primary_email ?? "",
        phone: created.phone ?? "",
        active: created.active,
        groups: newCustomer.groups,
        dateCreated: created.date_created,
        vatNumber: created.vat_number ?? undefined,
        website: created.website ?? undefined,
        currency: created.currency ?? undefined,
        language: created.language ?? undefined,
        address: created.address ?? undefined,
        city: created.city ?? undefined,
        state: created.state ?? undefined,
        zipCode: created.zip_code ?? undefined,
        country: created.country ?? undefined,
      }, ...prev]);

      setIsNewCustomerOpen(false);
      setSelectedGroupIds([]);
      setNewCustomer({
        companyName: "",
        vatNumber: "",
        phone: "",
        website: "",
        groups: [],
        currency: "System Default",
        language: "System Default",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        billingStreet: "",
        billingCity: "",
        billingState: "",
        billingZipCode: "",
        billingCountry: "",
        shippingStreet: "",
        shippingCity: "",
        shippingState: "",
        shippingZipCode: "",
        shippingCountry: ""
      });
    } catch (error) {
      toast({
        title: "Failed to create customer",
        description: error instanceof Error ? error.message : "Unable to create customer.",
        variant: "destructive",
      });
    }
  };

  const toggleCustomerGroup = (group: CustomerGroupRecord) => {
    const nextIds = selectedGroupIds.includes(group.id)
      ? selectedGroupIds.filter((id) => id !== group.id)
      : [...selectedGroupIds, group.id];

    setSelectedGroupIds(nextIds);
    const selectedNames = customerGroups
      .filter((g) => nextIds.includes(g.id))
      .map((g) => g.name);
    setNewCustomer((prev) => ({ ...prev, groups: selectedNames }));
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-lg font-semibold">Add New Customer</DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-1 mb-6">
                  <TabsTrigger 
                    value="details" 
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    Customer Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-0">
                  {/* Company Name - Required */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">
                      <span className="text-red-500">*</span> Company
                    </Label>
                    <Input 
                      id="companyName" 
                      value={newCustomer.companyName}
                      onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  {/* VAT Number */}
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber" className="text-sm font-medium text-gray-700">VAT Number</Label>
                    <Input 
                      id="vatNumber" 
                      value={newCustomer.vatNumber}
                      onChange={(e) => setNewCustomer({...newCustomer, vatNumber: e.target.value})}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                    <Input 
                      id="phone" 
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                    <Input 
                      id="website" 
                      value={newCustomer.website}
                      onChange={(e) => setNewCustomer({...newCustomer, website: e.target.value})}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Groups */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Groups</Label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                      {customerGroups.length === 0 && (
                        <div className="text-xs text-gray-500">No customer groups found.</div>
                      )}
                      {customerGroups.map((group) => (
                        <div key={group.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={selectedGroupIds.includes(group.id)}
                            onCheckedChange={() => toggleCustomerGroup(group)}
                            className="border-gray-300"
                          />
                          <Label htmlFor={`group-${group.id}`} className="text-sm text-gray-600 cursor-pointer">
                            {group.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Currency and Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-gray-400" />
                        Currency
                      </Label>
                      <Select
                        value={newCustomer.currency}
                        onValueChange={(val) => setNewCustomer({ ...newCustomer, currency: val })}
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="System Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="System Default">System Default</SelectItem>
                          <SelectItem value="INR (₹)">INR (₹)</SelectItem>
                          <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                          <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                          <SelectItem value="AED (د.إ)">AED (د.إ)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Default Language</Label>
                      <Select
                        value={newCustomer.language}
                        onValueChange={(val) => setNewCustomer({ ...newCustomer, language: val })}
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="System Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="System Default">System Default</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                      <Textarea 
                        id="address" 
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-y min-h-[80px]"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                      <Input 
                        id="city" 
                        value={newCustomer.city}
                        onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* State */}
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                      <Input 
                        id="state" 
                        value={newCustomer.state}
                        onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Zip Code */}
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">Zip Code</Label>
                      <Input 
                        id="zipCode" 
                        value={newCustomer.zipCode}
                        onChange={(e) => setNewCustomer({...newCustomer, zipCode: e.target.value})}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-2 mt-4">
                      <Label className="text-sm font-medium text-gray-700">Country</Label>
                      <Select 
                        value={newCustomer.country} 
                        onValueChange={(val) => setNewCustomer({...newCustomer, country: val})}
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

              </Tabs>

              <DialogFooter className="border-t pt-4 mt-6">
                <Button 
                  variant="outline" 
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    handleCreateCustomer().catch((error) => console.error(error));
                  }}
                >
                  Save and create contact
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { handleCreateCustomer().catch((error) => console.error(error)); }}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="border-gray-300 hover:bg-gray-50 transition-all duration-200">
            <Users className="h-4 w-4 mr-2" />
            Contacts
          </Button>
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border border-gray-200 rounded-lg">
            <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
              All
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
              Customers assigned to me
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                Groups
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
                {customerGroups.map(group => (
                  <DropdownMenuItem key={group.id} className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    {group.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                Country
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200 max-h-[200px] overflow-y-auto">
                {countries.slice(0, 15).map(country => (
                  <DropdownMenuItem key={country} className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    {country}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                <FileBarChart className="h-4 w-4 mr-2" />
                Invoices
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">Has Invoices</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">No Invoices</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Estimates
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">Has Estimates</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">No Estimates</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                <FolderKanban className="h-4 w-4 mr-2" />
                Projects
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">Has Projects</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">No Projects</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                <FileText className="h-4 w-4 mr-2" />
                Proposals
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">Has Proposals</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">No Proposals</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                <ScrollText className="h-4 w-4 mr-2" />
                Contracts Types
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">Service Agreement</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">NDA</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">Support Contract</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Customers Summary */}
      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Customers Summary</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
              <div className="text-sm text-gray-500">Total Customers</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
              <div className="text-sm text-green-600">Active Customers</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-red-500">{stats.inactiveCustomers}</div>
              <div className="text-sm text-red-500">Inactive Customers</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-blue-600">{stats.activeContacts}</div>
              <div className="text-sm text-blue-600">Active Contacts</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-orange-500">{stats.inactiveContacts}</div>
              <div className="text-sm text-orange-500">Inactive Contacts</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-gray-900">{stats.loggedInToday}</div>
              <div className="text-sm text-gray-500">New Customers Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Controls */}
      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Exclude Inactive Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="excludeInactive" 
                  checked={excludeInactive}
                  onCheckedChange={(checked) => setExcludeInactive(checked as boolean)}
                  className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="excludeInactive" className="text-sm text-gray-600 cursor-pointer">
                  Exclude Inactive Customers
                </Label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Page Size */}
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="w-20 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-lg font-semibold text-gray-900">Export Customers</DialogTitle>
                  </DialogHeader>
                  
                  <div className="py-6 space-y-6">
                    {/* Export Format */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Export Format</Label>
                      <Select value={exportFormat} onValueChange={setExportFormat}>
                        <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV (.csv)</SelectItem>
                          <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                          <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                          <SelectItem value="json">JSON (.json)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fields to Export */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Fields to Export</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="exp-company"
                            checked={exportFields.includes("companyName")}
                            onCheckedChange={(checked) => {
                              if (checked) setExportFields([...exportFields, "companyName"]);
                              else setExportFields(exportFields.filter(f => f !== "companyName"));
                            }}
                            className="border-gray-300"
                          />
                          <Label htmlFor="exp-company" className="text-sm text-gray-600 cursor-pointer">Company</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="exp-contact"
                            checked={exportFields.includes("primaryContact")}
                            onCheckedChange={(checked) => {
                              if (checked) setExportFields([...exportFields, "primaryContact"]);
                              else setExportFields(exportFields.filter(f => f !== "primaryContact"));
                            }}
                            className="border-gray-300"
                          />
                          <Label htmlFor="exp-contact" className="text-sm text-gray-600 cursor-pointer">Contact</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="exp-email"
                            checked={exportFields.includes("primaryEmail")}
                            onCheckedChange={(checked) => {
                              if (checked) setExportFields([...exportFields, "primaryEmail"]);
                              else setExportFields(exportFields.filter(f => f !== "primaryEmail"));
                            }}
                            className="border-gray-300"
                          />
                          <Label htmlFor="exp-email" className="text-sm text-gray-600 cursor-pointer">Email</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="exp-phone"
                            checked={exportFields.includes("phone")}
                            onCheckedChange={(checked) => {
                              if (checked) setExportFields([...exportFields, "phone"]);
                              else setExportFields(exportFields.filter(f => f !== "phone"));
                            }}
                            className="border-gray-300"
                          />
                          <Label htmlFor="exp-phone" className="text-sm text-gray-600 cursor-pointer">Phone</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="exp-groups"
                            checked={exportFields.includes("groups")}
                            onCheckedChange={(checked) => {
                              if (checked) setExportFields([...exportFields, "groups"]);
                              else setExportFields(exportFields.filter(f => f !== "groups"));
                            }}
                            className="border-gray-300"
                          />
                          <Label htmlFor="exp-groups" className="text-sm text-gray-600 cursor-pointer">Groups</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="exp-date"
                            checked={exportFields.includes("dateCreated")}
                            onCheckedChange={(checked) => {
                              if (checked) setExportFields([...exportFields, "dateCreated"]);
                              else setExportFields(exportFields.filter(f => f !== "dateCreated"));
                            }}
                            className="border-gray-300"
                          />
                          <Label htmlFor="exp-date" className="text-sm text-gray-600 cursor-pointer">Date Created</Label>
                        </div>
                      </div>
                    </div>

                    {/* Export Selection */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-700">
                        {selectedCustomers.length > 0 
                          ? `Export ${selectedCustomers.length} selected customers`
                          : `Export all ${filteredCustomers.length} customers`
                        }
                      </p>
                    </div>
                  </div>

                  <DialogFooter className="border-t pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsExportOpen(false)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // Handle export action
                        setIsExportOpen(false);
                      }}
                      disabled={exportFields.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Manipulation Button */}
              <Dialog open={isManipulationOpen} onOpenChange={setIsManipulationOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                    Manipulation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-lg font-semibold text-gray-900">Manipulation</DialogTitle>
                  </DialogHeader>
                  
                  <div className="py-6 space-y-6">
                    {/* Mass Delete Checkbox */}
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="massDelete" 
                        checked={massDelete}
                        onCheckedChange={(checked) => setMassDelete(checked as boolean)}
                        className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor="massDelete" className="text-sm text-gray-700 cursor-pointer">
                        Mass delete
                      </Label>
                    </div>

                    {/* Groups Dropdown */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Groups</Label>
                      <Select 
                        value={selectedGroupForManipulation} 
                        onValueChange={setSelectedGroupForManipulation}
                      >
                        <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Non selected" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Non selected</SelectItem>
                          {customerGroups.map(group => (
                            <SelectItem key={group} value={group.toLowerCase()}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-blue-600 mt-2">
                        If you do not select any group all groups assigned to the selected customers will be removed.
                      </p>
                    </div>
                  </div>

                  <DialogFooter className="border-t pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsManipulationOpen(false)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Close
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // Handle manipulation action
                        setIsManipulationOpen(false);
                        setMassDelete(false);
                        setSelectedGroupForManipulation("");
                      }}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {selectedCustomers.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => handleBulkStatusChange(true)}
                    disabled={isBulkUpdating}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => handleBulkStatusChange(false)}
                    disabled={isBulkUpdating}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                </>
              )}

              {/* Refresh Button */}
              <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50" onClick={() => { loadCustomers().catch((error) => console.error(error)); }}>
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      className="border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="w-16 text-gray-600 font-semibold">#</TableHead>
                  <TableHead 
                    className="text-gray-600 font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleSort("companyName")}
                  >
                    <div className="flex items-center gap-1">
                      Company
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">Primary Contact</TableHead>
                  <TableHead className="text-gray-600 font-semibold">Primary Email</TableHead>
                  <TableHead className="text-gray-600 font-semibold">Phone</TableHead>
                  <TableHead className="text-gray-600 font-semibold text-center">Active</TableHead>
                  <TableHead className="text-gray-600 font-semibold">Groups</TableHead>
                  <TableHead className="text-gray-600 font-semibold">Date Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow 
                    key={customer.id} 
                    className={`hover:bg-blue-50 transition-colors ${selectedCustomers.includes(customer.id) ? 'bg-blue-50' : ''}`}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() => handleSelectCustomer(customer.id)}
                        className="border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="text-gray-500 font-medium">{customer.id}</TableCell>
                    <TableCell>
                      <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium transition-colors">
                        {customer.companyName}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700">{customer.primaryContact || "-"}</TableCell>
                    <TableCell>
                      {customer.primaryEmail ? (
                        <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors">
                          {customer.primaryEmail}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">
                          {customer.phone}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={customer.active}
                        onCheckedChange={(checked) => {
                          updateCustomer(customer.id, { active: checked })
                            .then((updated) => {
                              setCustomers((prev) => prev.map((item) => (item.id === updated.id ? { ...item, active: updated.active } : item)));
                            })
                            .catch((error) => {
                              toast({
                                title: "Failed to update status",
                                description: error instanceof Error ? error.message : "Unable to update customer status.",
                                variant: "destructive",
                              });
                            });
                        }}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {customer.groups.length > 0 ? customer.groups.join(", ") : "-"}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{customer.dateCreated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500 mb-2 sm:mb-0">
              Showing 1 to {filteredCustomers.length} of {filteredCustomers.length} entries
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 min-w-[32px]"
              >
                {currentPage}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={filteredCustomers.length <= parseInt(pageSize)}
                onClick={() => setCurrentPage(p => p + 1)}
                className="border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
