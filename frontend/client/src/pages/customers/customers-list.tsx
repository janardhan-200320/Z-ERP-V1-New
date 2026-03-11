import { useState } from "react";
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
import { 
  Search, Filter, Plus, Upload, Users, FileText, 
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

// Customer groups
const customerGroups = [
  "VIP", "Regular", "Enterprise", "Startup", "Government", "Education", "Healthcare", "Retail"
];

export default function CustomersListModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [excludeInactive, setExcludeInactive] = useState(true);
  const [pageSize, setPageSize] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
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

  const customers: Customer[] = [
    {
      id: 7,
      companyName: "Arun Pixels Studio",
      primaryContact: "",
      primaryEmail: "",
      phone: "8971766616",
      active: true,
      groups: [],
      dateCreated: "2025-09-15 13:28:11"
    },
    {
      id: 8,
      companyName: "C Janardhan",
      primaryContact: "",
      primaryEmail: "",
      phone: "8088983604",
      active: true,
      groups: [],
      dateCreated: "2025-10-29 12:06:08"
    },
    {
      id: 4,
      companyName: "Greeen Dot",
      primaryContact: "Sajeer Moidu",
      primaryEmail: "info@greendotdesigns.com",
      phone: "+971 58 667 7503",
      active: true,
      groups: [],
      dateCreated: "2025-09-04 18:53:05"
    },
    {
      id: 5,
      companyName: "Hello hello",
      primaryContact: "",
      primaryEmail: "",
      phone: "121221212",
      active: true,
      groups: [],
      dateCreated: "2025-09-08 11:46:09"
    },
    {
      id: 2,
      companyName: "Jack",
      primaryContact: "",
      primaryEmail: "",
      phone: "+917550379111",
      active: true,
      groups: [],
      dateCreated: "2025-08-31 21:34:40"
    },
    {
      id: 6,
      companyName: "jack",
      primaryContact: "",
      primaryEmail: "",
      phone: "7550379111",
      active: true,
      groups: [],
      dateCreated: "2025-09-08 12:57:31"
    },
    {
      id: 1,
      companyName: "Sarmad",
      primaryContact: "Sarmad Staff",
      primaryEmail: "admin@erpdemo.zedunix.com",
      phone: "+923318144482",
      active: true,
      groups: [],
      dateCreated: "2025-08-25 21:06:48"
    },
    {
      id: 10,
      companyName: "Zapier Technologies",
      primaryContact: "",
      primaryEmail: "",
      phone: "8317450103",
      active: true,
      groups: [],
      dateCreated: "2026-02-11 15:52:07"
    },
    {
      id: 9,
      companyName: "Zollid",
      primaryContact: "Ragni ca",
      primaryEmail: "raginichavan1703@gmail.com",
      phone: "12",
      active: true,
      groups: [],
      dateCreated: "2026-01-07 12:06:36"
    }
  ];

  // Summary stats
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.active).length,
    inactiveCustomers: customers.filter(c => !c.active).length,
    activeContacts: customers.filter(c => c.primaryContact).length,
    inactiveContacts: 0,
    loggedInToday: 0
  };

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

  const copyBillingToShipping = () => {
    setNewCustomer({
      ...newCustomer,
      shippingStreet: newCustomer.billingStreet,
      shippingCity: newCustomer.billingCity,
      shippingState: newCustomer.billingState,
      shippingZipCode: newCustomer.billingZipCode,
      shippingCountry: newCustomer.billingCountry
    });
  };

  const copyCustomerInfoToBilling = () => {
    setNewCustomer({
      ...newCustomer,
      billingStreet: newCustomer.address,
      billingCity: newCustomer.city,
      billingState: newCustomer.state,
      billingZipCode: newCustomer.zipCode,
      billingCountry: newCustomer.country
    });
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
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger 
                    value="details" 
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    Customer Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="billing" 
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    Billing & Shipping
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
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="flex-1 border-gray-200">
                          <SelectValue placeholder="Non selected" />
                        </SelectTrigger>
                        <SelectContent>
                          {customerGroups.map(group => (
                            <SelectItem key={group} value={group.toLowerCase()}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" className="border-gray-200 hover:bg-blue-50 hover:border-blue-300">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Currency and Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-gray-400" />
                        Currency
                      </Label>
                      <Select defaultValue="system">
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="System Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System Default</SelectItem>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="inr">INR (₹)</SelectItem>
                          <SelectItem value="aed">AED (د.إ)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Default Language</Label>
                      <Select defaultValue="system">
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="System Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System Default</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
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

                <TabsContent value="billing" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Billing Address */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Billing Address</h3>
                        <Button 
                          variant="link" 
                          className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm"
                          onClick={copyCustomerInfoToBilling}
                        >
                          Same as Customer Info
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Street</Label>
                          <Textarea 
                            value={newCustomer.billingStreet}
                            onChange={(e) => setNewCustomer({...newCustomer, billingStreet: e.target.value})}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-y min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">City</Label>
                          <Input 
                            value={newCustomer.billingCity}
                            onChange={(e) => setNewCustomer({...newCustomer, billingCity: e.target.value})}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">State</Label>
                          <Input 
                            value={newCustomer.billingState}
                            onChange={(e) => setNewCustomer({...newCustomer, billingState: e.target.value})}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">Zip Code</Label>
                          <Input 
                            value={newCustomer.billingZipCode}
                            onChange={(e) => setNewCustomer({...newCustomer, billingZipCode: e.target.value})}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">Country</Label>
                          <Select 
                            value={newCustomer.billingCountry}
                            onValueChange={(val) => setNewCustomer({...newCustomer, billingCountry: val})}
                          >
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="Non selected" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {countries.map(country => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          Shipping Address
                        </h3>
                        <Button 
                          variant="link" 
                          className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm"
                          onClick={copyBillingToShipping}
                        >
                          Copy Billing Address
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Street</Label>
                          <Textarea 
                            value={newCustomer.shippingStreet}
                            onChange={(e) => setNewCustomer({...newCustomer, shippingStreet: e.target.value})}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-y min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">City</Label>
                          <Input 
                            value={newCustomer.shippingCity}
                            onChange={(e) => setNewCustomer({...newCustomer, shippingCity: e.target.value})}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">State</Label>
                          <Input 
                            value={newCustomer.shippingState}
                            onChange={(e) => setNewCustomer({...newCustomer, shippingState: e.target.value})}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">Zip Code</Label>
                          <Input 
                            value={newCustomer.shippingZipCode}
                            onChange={(e) => setNewCustomer({...newCustomer, shippingZipCode: e.target.value})}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">Country</Label>
                          <Select 
                            value={newCustomer.shippingCountry}
                            onValueChange={(val) => setNewCustomer({...newCustomer, shippingCountry: val})}
                          >
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="Non selected" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {countries.map(country => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="border-t pt-4 mt-6">
                <Button 
                  variant="outline" 
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setIsNewCustomerOpen(false)}
                >
                  Save and create contact
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md">
            <Upload className="h-4 w-4 mr-2" />
            Import Customers
          </Button>

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
                  <DropdownMenuItem key={group} className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    {group}
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
              <div className="text-sm text-gray-500">Contacts Logged In Today</div>
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

              {/* Refresh Button */}
              <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
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
