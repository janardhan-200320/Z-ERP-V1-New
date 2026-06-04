import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  fetchCustomerGroups,
  updateCustomer,
  type CustomerRecord,
} from "@/lib/supabase-data";
import { useToast } from "@/hooks/use-toast";
import { saveCustomerForStandaloneView } from "@/lib/customer-view-storage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Search, Filter, Plus, Users, FileText, 
  ChevronLeft, ChevronRight, RefreshCw, Download,
  ArrowUpDown, UserCheck, UserX, UserCircle, Clock,
  Globe, FileBarChart, FolderKanban, FileSpreadsheet, ScrollText, Building,
  Eye, Edit, Trash2
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

type CustomerProject = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: string;
};

type CustomerTransaction = {
  id: string;
  type: string;
  amount: string;
  date: string;
  status: string;
  reference: string;
};

type CustomerCreditNote = {
  id: string;
  date: string;
  amount: string;
  reason: string;
};

type CustomerSubscription = {
  id: string;
  plan: string;
  status: string;
  renewalDate: string;
  amount: string;
};

type CustomerExpense = {
  id: string;
  title: string;
  date: string;
  amount: string;
  category: string;
};

type CustomerTask = {
  id: string;
  title: string;
  project: string;
  status: string;
  dueDate: string;
};

type CustomerStatement = {
  id: string;
  period: string;
  openingBalance: string;
  closingBalance: string;
  status: string;
};

type CustomerNote = {
  id: string;
  title: string;
  note: string;
  updatedAt: string;
};

type CustomerFile = {
  id: string;
  name: string;
  type: string;
  size: string;
};

type CustomerContact = {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  company: string;
};

type CustomerStandaloneRecord = Customer & {
  invoices: Array<{ id: string; date: string; amount: string; status: string; reference: string }>;
  proposals: Array<{ id: string; title: string; amount: string; status: string; date: string }>;
  creditNotes: CustomerCreditNote[];
  subscriptions: CustomerSubscription[];
  expenses: CustomerExpense[];
  projects: CustomerProject[];
  tasks: CustomerTask[];
  statements: CustomerStatement[];
  notes: CustomerNote[];
  payments: CustomerTransaction[];
  files: CustomerFile[];
  contacts: CustomerContact[];
};

type ContactOutreachRow = {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  preferredChannel: string;
  note: string;
};

type CompanySuggestion = {
  id: number;
  companyName: string;
  primaryContact: string;
  primaryEmail: string;
  phone: string;
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
const defaultCustomerGroups: string[] = [];

const parseMoneyValue = (value: string) => {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const buildAddress = (fields: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
}) => {
  const hasAny = Object.values(fields).some((value) => value && String(value).trim().length > 0);
  if (!hasAny) return undefined;
  return {
    street: fields.street || "",
    city: fields.city || "",
    state: fields.state || "",
    zipCode: fields.zipCode || "",
    country: fields.country || "",
  };
};

const mapCustomerRecord = (record: CustomerRecord): Customer => ({
  id: record.id,
  companyName: record.company_name || "",
  primaryContact: record.primary_contact || "",
  primaryEmail: record.primary_email || "",
  phone: record.phone || "",
  active: record.active ?? true,
  groups: record.groups || [],
  dateCreated: record.date_created
    ? new Date(record.date_created).toISOString().split("T")[0]
    : "",
  vatNumber: record.vat_number || undefined,
  website: record.website || undefined,
  currency: record.currency || undefined,
  language: record.language || undefined,
  address: record.address || undefined,
  city: record.city || undefined,
  state: record.state || undefined,
  zipCode: record.zip_code || undefined,
  country: record.country || undefined,
  billingAddress: buildAddress({
    street: record.billing_street,
    city: record.billing_city,
    state: record.billing_state,
    zipCode: record.billing_zip_code,
    country: record.billing_country,
  }),
  shippingAddress: buildAddress({
    street: record.shipping_street,
    city: record.shipping_city,
    state: record.shipping_state,
    zipCode: record.shipping_zip_code,
    country: record.shipping_country,
  }),
});

export default function CustomersListModule() {
  const { toast } = useToast();
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
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [groupOptions, setGroupOptions] = useState<string[]>(defaultCustomerGroups);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [contactRows, setContactRows] = useState<ContactOutreachRow[]>([
    {
      id: 1,
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      preferredChannel: "email",
      note: "",
    },
  ]);
  const [editForm, setEditForm] = useState({
    companyName: "",
    primaryContact: "",
    primaryEmail: "",
    phone: "",
    vatNumber: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    groups: [] as string[],
  });

  const customerGroups = groupOptions;

  const loadCustomerData = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoadingCustomers(true);
      setCustomersError(null);
      const [customersData, groupsData] = await Promise.all([
        fetchCustomers(),
        fetchCustomerGroups(),
      ]);
      setCustomers(customersData.map(mapCustomerRecord));
      setGroupOptions(groupsData.map((group) => group.name).filter(Boolean));
    } catch (error: any) {
      setCustomersError(error?.message || "Failed to load customers");
    } finally {
      if (isInitial) setIsLoadingCustomers(false);
    }
  };

  useEffect(() => {
    loadCustomerData(true);
  }, []);
  
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

  const companySuggestions = useMemo<CompanySuggestion[]>(() => {
    return customers
      .map((customer) => ({
        id: customer.id,
        companyName: customer.companyName.trim(),
        primaryContact: customer.primaryContact || "",
        primaryEmail: customer.primaryEmail || "",
        phone: customer.phone || "",
      }))
      .filter((entry) => entry.companyName.length > 0)
      .sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [customers]);

  const getCustomerSummary = () => ({
    projectCount: 0,
    activeProjects: 0,
    transactionCount: 0,
    totalProjectValue: 0,
    invoicedValue: 0,
    receivedValue: 0,
  });

  const buildCustomerStandaloneRecord = (customer: Customer): CustomerStandaloneRecord => ({
    ...customer,
    invoices: [],
    proposals: [],
    creditNotes: [],
    subscriptions: [],
    expenses: [],
    projects: [],
    tasks: [],
    statements: [],
    notes: [],
    payments: [],
    files: [],
    contacts: [],
  });

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

  const openCustomerView = (customer: Customer) => {
    const standaloneRecord = buildCustomerStandaloneRecord(customer);
    saveCustomerForStandaloneView(standaloneRecord);

    const targetUrl = `${window.location.origin}/customer-view/${encodeURIComponent(String(customer.id))}`;
    const openedTab = window.open(targetUrl, '_blank', 'noopener,noreferrer');

    if (!openedTab) {
      toast({
        title: "Popup blocked",
        description: "Allow popups for this site to open the standalone customer view.",
        variant: "destructive",
      });
    }
  };

  const openContactsForm = () => {
    setContactRows((prev) => prev.length > 0 ? prev : [{
      id: 1,
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      preferredChannel: "email",
      note: "",
    }]);
    setIsContactsOpen(true);
  };

  const addContactRow = () => {
    setContactRows((prev) => ([
      ...prev,
      {
        id: Date.now(),
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        preferredChannel: "email",
        note: "",
      },
    ]));
  };

  const updateContactRow = (id: number, field: keyof ContactOutreachRow, value: string) => {
    setContactRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeContactRow = (id: number) => {
    setContactRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  const handleSubmitContacts = () => {
    const filledRows = contactRows.filter((row) => row.companyName.trim() || row.contactPerson.trim() || row.email.trim() || row.phone.trim());

    if (filledRows.length === 0) {
      toast({
        title: "Add contacts first",
        description: "Please fill at least one contact row before saving.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Contacts captured",
      description: `${filledRows.length} contact${filledRows.length === 1 ? "" : "s"} ready for outreach.`,
    });

    setIsContactsOpen(false);
    setContactRows([
      {
        id: 1,
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        preferredChannel: "email",
        note: "",
      },
    ]);
  };

  const openCustomerEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      companyName: customer.companyName || "",
      primaryContact: customer.primaryContact || "",
      primaryEmail: customer.primaryEmail || "",
      phone: customer.phone || "",
      vatNumber: customer.vatNumber || "",
      website: customer.website || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zipCode: customer.zipCode || "",
      country: customer.country || "",
      groups: customer.groups || [],
    });
    setIsEditOpen(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`Delete ${customer.companyName}? This cannot be undone.`)) return;
    try {
      await deleteCustomer(customer.id);
      setCustomers((prev) => prev.filter((entry) => entry.id !== customer.id));
      setSelectedCustomers((prev) => prev.filter((id) => id !== customer.id));
      toast({ title: "Customer deleted", description: `${customer.companyName} removed.` });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Unable to delete customer.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;
    try {
      const payload: Partial<CustomerRecord> = {
        company_name: editForm.companyName,
        primary_contact: editForm.primaryContact || null,
        primary_email: editForm.primaryEmail || null,
        phone: editForm.phone || null,
        vat_number: editForm.vatNumber || null,
        website: editForm.website || null,
        address: editForm.address || null,
        city: editForm.city || null,
        state: editForm.state || null,
        zip_code: editForm.zipCode || null,
        country: editForm.country || null,
        groups: editForm.groups,
      };
      const updated = await updateCustomer(selectedCustomer.id, payload);
      setCustomers((prev) =>
        prev.map((entry) => (entry.id === selectedCustomer.id ? mapCustomerRecord(updated) : entry))
      );
      setIsEditOpen(false);
      toast({ title: "Customer updated", description: `${editForm.companyName} saved.` });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.message || "Unable to update customer.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.companyName.trim()) {
      toast({
        title: "Company is required",
        description: "Please enter a company name before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: Partial<CustomerRecord> = {
        company_name: newCustomer.companyName.trim(),
        primary_contact: null,
        primary_email: null,
        phone: newCustomer.phone?.trim() || null,
        active: true,
        groups: newCustomer.groups ?? [],
        date_created: new Date().toISOString(),
        vat_number: newCustomer.vatNumber?.trim() || null,
        website: newCustomer.website?.trim() || null,
        currency: newCustomer.currency || null,
        language: newCustomer.language || null,
        address: newCustomer.address?.trim() || null,
        city: newCustomer.city?.trim() || null,
        state: newCustomer.state?.trim() || null,
        zip_code: newCustomer.zipCode?.trim() || null,
        country: newCustomer.country?.trim() || null,
        billing_street: newCustomer.billingStreet?.trim() || null,
        billing_city: newCustomer.billingCity?.trim() || null,
        billing_state: newCustomer.billingState?.trim() || null,
        billing_zip_code: newCustomer.billingZipCode?.trim() || null,
        billing_country: newCustomer.billingCountry?.trim() || null,
        shipping_street: newCustomer.shippingStreet?.trim() || null,
        shipping_city: newCustomer.shippingCity?.trim() || null,
        shipping_state: newCustomer.shippingState?.trim() || null,
        shipping_zip_code: newCustomer.shippingZipCode?.trim() || null,
        shipping_country: newCustomer.shippingCountry?.trim() || null,
      };

      const created = await createCustomer(payload);
      setCustomers((prev) => [mapCustomerRecord(created), ...prev]);
      setIsNewCustomerOpen(false);
      toast({
        title: "Customer created",
        description: `${newCustomer.companyName} added successfully.`,
      });
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
        shippingCountry: "",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error?.message || "Unable to create customer.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCustomerReport = (customer: Customer) => {
    const projects: CustomerProject[] = [];
    const transactions: CustomerTransaction[] = [];
    const summary = getCustomerSummary();

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 16;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Report", 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(customer.companyName, 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Company", customer.companyName],
        ["Primary Contact", customer.primaryContact || "-"],
        ["Primary Email", customer.primaryEmail || "-"],
        ["Phone", customer.phone || "-"],
        ["VAT Number", customer.vatNumber || "-"],
        ["Website", customer.website || "-"],
        ["Location", [customer.city, customer.state, customer.country].filter(Boolean).join(", ") || "-"],
        ["Status", customer.active ? "Active" : "Inactive"],
        ["Groups", customer.groups.length > 0 ? customer.groups.join(", ") : "-"],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 64, 175] },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY + 8,
      head: [["Projects", "Count", "Active", "Total Value"]],
      body: [[
        "Customer Projects",
        String(summary.projectCount),
        String(summary.activeProjects),
        formatMoney(summary.totalProjectValue),
      ]],
      theme: "grid",
      headStyles: { fillColor: [15, 118, 110] },
    });

    if (projects.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable?.finalY + 8,
        head: [['Project ID', 'Project', 'Status', 'Start', 'End', 'Budget']],
        body: projects.map((project) => [
          project.id,
          project.name,
          project.status,
          project.startDate,
          project.endDate,
          project.budget,
        ]),
        theme: "striped",
        headStyles: { fillColor: [55, 65, 81] },
      });
    }

    if (transactions.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable?.finalY + 8,
        head: [['Transaction', 'Type', 'Amount', 'Date', 'Status', 'Reference']],
        body: transactions.map((transaction) => [
          transaction.id,
          transaction.type,
          transaction.amount,
          transaction.date,
          transaction.status,
          transaction.reference,
        ]),
        theme: "striped",
        headStyles: { fillColor: [124, 58, 237] },
      });
    }

    const afterTransactionsY = (doc as any).lastAutoTable?.finalY || 0;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoiced Value: ${formatMoney(summary.invoicedValue)}`, 14, afterTransactionsY + 10);
    doc.text(`Received Value: ${formatMoney(summary.receivedValue)}`, pageWidth / 2, afterTransactionsY + 10, { align: "center" });
    doc.text(`Outstanding: ${formatMoney(Math.max(summary.invoicedValue - summary.receivedValue, 0))}`, pageWidth - 14, afterTransactionsY + 10, { align: "right" });

    const safeName = customer.companyName.replace(/[^a-z0-9]+/gi, '_');
    doc.save(`Customer_${safeName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Edit Customer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Customer</DialogTitle>
            <DialogDescription>Update customer details and save changes.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={editForm.companyName}
                onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Contact</Label>
              <Input
                value={editForm.primaryContact}
                onChange={(e) => setEditForm({ ...editForm, primaryContact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Email</Label>
              <Input
                value={editForm.primaryEmail}
                onChange={(e) => setEditForm({ ...editForm, primaryEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>VAT Number</Label>
              <Input
                value={editForm.vatNumber}
                onChange={(e) => setEditForm({ ...editForm, vatNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={editForm.state}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Zip Code</Label>
              <Input
                value={editForm.zipCode}
                onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                          <SelectItem value="usd">INR (₹)</SelectItem>
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

              </Tabs>

              <DialogFooter className="border-t pt-4 mt-6">
                <Button 
                  variant="outline" 
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setIsNewCustomerOpen(false)}
                >
                  Save and create contact
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateCustomer}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>

        <Dialog open={isContactsOpen} onOpenChange={setIsContactsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-semibold">Contact Outreach</DialogTitle>
              <DialogDescription>
                Add multiple people from different companies so the team can contact them in one place.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <Card className="border border-slate-200 bg-slate-50/70">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="outreachSubject">Subject</Label>
                    <Input id="outreachSubject" placeholder="e.g. Follow-up for project discussion" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outreachPurpose">Purpose</Label>
                    <Input id="outreachPurpose" placeholder="Sales, support, partnership, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outreachDate">Follow-up Date</Label>
                    <Input id="outreachDate" type="date" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Contacts</h3>
                  <p className="text-xs text-slate-500">Each row can belong to a different company.</p>
                </div>
                <Button variant="outline" size="sm" onClick={addContactRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Person
                </Button>
              </div>

              <div className="space-y-3">
                {contactRows.map((row, index) => (
                  <Card key={row.id} className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-slate-800">Contact {index + 1}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContactRow(row.id)}
                          disabled={contactRows.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500 mr-2" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
                          <Label>Company Name</Label>
                          <Input
                            value={row.companyName}
                            onChange={(e) => updateContactRow(row.id, "companyName", e.target.value)}
                            placeholder="Company name"
                            className="h-12 text-base"
                          />
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-medium text-slate-500 mb-2">
                              Suggested companies
                            </p>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {companySuggestions
                                .filter((company) => {
                                  const query = row.companyName.trim().toLowerCase();
                                  if (!query) return true;
                                  return company.companyName.toLowerCase().includes(query) || company.primaryContact.toLowerCase().includes(query);
                                })
                                .slice(0, 6)
                                .map((company) => (
                                  <button
                                    key={company.id}
                                    type="button"
                                    onClick={() => {
                                      updateContactRow(row.id, "companyName", company.companyName);
                                      if (company.primaryContact) updateContactRow(row.id, "contactPerson", company.primaryContact);
                                      if (company.primaryEmail) updateContactRow(row.id, "email", company.primaryEmail);
                                      if (company.phone) updateContactRow(row.id, "phone", company.phone);
                                    }}
                                    className="w-full rounded-lg border border-transparent px-3 py-2 text-left hover:border-blue-200 hover:bg-white transition-colors"
                                  >
                                    <div className="text-sm font-semibold text-slate-900">{company.companyName}</div>
                                    <div className="text-xs text-slate-500">
                                      {company.primaryContact || "No contact"}{company.primaryEmail ? ` • ${company.primaryEmail}` : ""}{company.phone ? ` • ${company.phone}` : ""}
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <Label>Contact Person</Label>
                          <Input
                            value={row.contactPerson}
                            onChange={(e) => updateContactRow(row.id, "contactPerson", e.target.value)}
                            placeholder="Name of person"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={row.email}
                            onChange={(e) => updateContactRow(row.id, "email", e.target.value)}
                            placeholder="name@company.com"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <Label>Phone</Label>
                          <Input
                            value={row.phone}
                            onChange={(e) => updateContactRow(row.id, "phone", e.target.value)}
                            placeholder="Phone number"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <Label>Preferred Channel</Label>
                          <Select value={row.preferredChannel} onValueChange={(value) => updateContactRow(row.id, "preferredChannel", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <Label>Note</Label>
                          <Input
                            value={row.note}
                            onChange={(e) => updateContactRow(row.id, "note", e.target.value)}
                            placeholder="Reason to contact"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsContactsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitContacts} className="bg-blue-600 hover:bg-blue-700">
                <Users className="h-4 w-4 mr-2" />
                Save Contacts
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  <TableHead className="text-gray-600 font-semibold text-right">Actions</TableHead>
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
                      <button
                        type="button"
                        onClick={() => openCustomerView(customer)}
                        className="text-left text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium transition-colors"
                      >
                        {customer.companyName}
                      </button>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                          onClick={() => openCustomerView(customer)}
                          title="View Customer"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                              <FileText className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => openCustomerView(customer)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => openCustomerEdit(customer)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteCustomer(customer)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
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
