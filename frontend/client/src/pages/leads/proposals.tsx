import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileCheck, FileText, Send, Mail, MessageCircle, 
  Plus, Minus, Edit, Eye, Download, Copy, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, Sparkles,
  DollarSign, Calendar, User, Building2, Trash2,
  MoreVertical, Search, Filter, Target, TrendingUp,
  History, Loader2, Save, ExternalLink, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

// Proposal status type
type ProposalStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Rejected" | "Expired";

// Status configuration
const STATUS_CONFIG: Record<ProposalStatus, { color: string; bgColor: string; icon: any }> = {
  "Draft": { color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200", icon: FileText },
  "Sent": { color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200", icon: Send },
  "Viewed": { color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200", icon: Eye },
  "Accepted": { color: "text-green-600", bgColor: "bg-green-50 border-green-200", icon: CheckCircle },
  "Rejected": { color: "text-red-600", bgColor: "bg-red-50 border-red-200", icon: XCircle },
  "Expired": { color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200", icon: Clock },
};

interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

interface Proposal {
  id: string;
  proposalNumber: string;
  title: string;
  leadId: string;
  leadName: string;
  leadCompany: string;
  leadEmail: string;
  status: ProposalStatus;
  version: number;
  items: ProposalItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  validUntil: Date;
  createdAt: Date;
  sentDate: Date | null;
  viewedDate: Date | null;
  acceptedDate: Date | null;
  notes: string;
  termsAndConditions: string;
  createdBy: string;
}

interface ProposalHistory {
  id: string;
  proposalId: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: Date;
}

export default function LeadProposals() {
  const { toast } = useToast();

  // Sample proposals data
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: "PR001",
      proposalNumber: "PROP-2026-001",
      title: "ERP Implementation Package",
      leadId: "L001",
      leadName: "John Smith",
      leadCompany: "Tech Corp",
      leadEmail: "john@techcorp.com",
      status: "Sent",
      version: 1,
      items: [
        { id: "1", description: "ERP Software License (Annual)", quantity: 1, unitPrice: 25000, tax: 10, total: 27500 },
        { id: "2", description: "Implementation & Setup", quantity: 1, unitPrice: 15000, tax: 10, total: 16500 },
        { id: "3", description: "Training (5 days)", quantity: 5, unitPrice: 500, tax: 10, total: 2750 },
      ],
      subtotal: 42500,
      taxAmount: 4250,
      discount: 2000,
      total: 44750,
      validUntil: new Date(2026, 2, 1),
      createdAt: new Date(2026, 1, 10),
      sentDate: new Date(2026, 1, 11),
      viewedDate: new Date(2026, 1, 12),
      acceptedDate: null,
      notes: "Enterprise package with annual support",
      termsAndConditions: "Payment terms: 50% upfront, 50% on completion. Valid for 30 days.",
      createdBy: "Sales Executive 1",
    },
    {
      id: "PR002",
      proposalNumber: "PROP-2026-002",
      title: "Digital Marketing Services",
      leadId: "L002",
      leadName: "Emily Davis",
      leadCompany: "Digital Solutions",
      leadEmail: "emily@digitalsol.com",
      status: "Draft",
      version: 1,
      items: [
        { id: "1", description: "SEO Optimization", quantity: 1, unitPrice: 3000, tax: 10, total: 3300 },
        { id: "2", description: "Social Media Management (3 months)", quantity: 3, unitPrice: 1500, tax: 10, total: 4950 },
      ],
      subtotal: 7500,
      taxAmount: 750,
      discount: 500,
      total: 7750,
      validUntil: new Date(2026, 2, 15),
      createdAt: new Date(2026, 1, 14),
      sentDate: null,
      viewedDate: null,
      acceptedDate: null,
      notes: "Quarterly package",
      termsAndConditions: "Monthly billing. 3-month minimum commitment.",
      createdBy: "Sales Executive 2",
    },
    {
      id: "PR003",
      proposalNumber: "PROP-2026-003",
      title: "Custom Software Development",
      leadId: "L003",
      leadName: "Michael Brown",
      leadCompany: "Innovation Inc",
      leadEmail: "michael@innovation.com",
      status: "Accepted",
      version: 2,
      items: [
        { id: "1", description: "Custom CRM Development", quantity: 1, unitPrice: 50000, tax: 10, total: 55000 },
        { id: "2", description: "API Integration", quantity: 1, unitPrice: 10000, tax: 10, total: 11000 },
        { id: "3", description: "6 Months Support", quantity: 6, unitPrice: 2000, tax: 10, total: 13200 },
      ],
      subtotal: 72000,
      taxAmount: 7200,
      discount: 5000,
      total: 74200,
      validUntil: new Date(2026, 2, 20),
      createdAt: new Date(2026, 1, 5),
      sentDate: new Date(2026, 1, 6),
      viewedDate: new Date(2026, 1, 7),
      acceptedDate: new Date(2026, 1, 13),
      notes: "Revised proposal with extended support",
      termsAndConditions: "Milestone-based payment. 30% upfront.",
      createdBy: "Sarah Johnson",
    },
  ]);

  const [proposalHistory, setProposalHistory] = useState<ProposalHistory[]>([
    {
      id: "PH001",
      proposalId: "PR001",
      action: "Sent",
      description: "Proposal sent via email to john@techcorp.com",
      performedBy: "Sales Executive 1",
      performedAt: new Date(2026, 1, 11, 10, 30),
    },
    {
      id: "PH002",
      proposalId: "PR001",
      action: "Viewed",
      description: "Proposal viewed by client",
      performedBy: "System",
      performedAt: new Date(2026, 1, 12, 14, 15),
    },
    {
      id: "PH003",
      proposalId: "PR003",
      action: "Accepted",
      description: "Proposal accepted by client",
      performedBy: "Michael Brown",
      performedAt: new Date(2026, 1, 13, 16, 45),
    },
  ]);

  // State management
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | "All">("All");
  const [historyFilterAction, setHistoryFilterAction] = useState<string>("All");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form state for new proposal
  const [newProposal, setNewProposal] = useState({
    title: "",
    leadName: "",
    leadCompany: "",
    leadEmail: "",
    validUntil: "",
    notes: "",
    termsAndConditions: "Payment terms: 50% upfront, 50% on completion. Valid for 30 days.",
  });

  const [proposalItems, setProposalItems] = useState<ProposalItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, tax: 10, total: 0 },
  ]);

  const [discount, setDiscount] = useState(0);

  // Calculate statistics
  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === "Draft").length,
    sent: proposals.filter(p => p.status === "Sent").length,
    accepted: proposals.filter(p => p.status === "Accepted").length,
    rejected: proposals.filter(p => p.status === "Rejected").length,
    totalValue: proposals.reduce((sum, p) => sum + p.total, 0),
    acceptedValue: proposals.filter(p => p.status === "Accepted").reduce((sum, p) => sum + p.total, 0),
    conversionRate: proposals.filter(p => p.status !== "Draft").length > 0
      ? ((proposals.filter(p => p.status === "Accepted").length / proposals.filter(p => p.status !== "Draft").length) * 100).toFixed(1)
      : "0",
  };

  // Add new item row
  const addItem = () => {
    setProposalItems([
      ...proposalItems,
      { id: String(proposalItems.length + 1), description: "", quantity: 1, unitPrice: 0, tax: 10, total: 0 },
    ]);
  };

  // Remove item row
  const removeItem = (id: string) => {
    if (proposalItems.length > 1) {
      setProposalItems(proposalItems.filter(item => item.id !== id));
    }
  };

  // Update item
  const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
    setProposalItems(proposalItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate total
        const subtotal = updated.quantity * updated.unitPrice;
        const taxAmount = (subtotal * updated.tax) / 100;
        updated.total = subtotal + taxAmount;
        return updated;
      }
      return item;
    }));
  };

  // Calculate proposal totals
  const calculateTotals = () => {
    const subtotal = proposalItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = proposalItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * item.tax / 100);
    }, 0);
    const total = subtotal + taxAmount - discount;
    return { subtotal, taxAmount, total };
  };

  // Filter activity history
  const filteredHistory = proposalHistory.filter(entry => {
    const matchesAction = historyFilterAction === "All" || entry.action === historyFilterAction;
    const matchesSearch = historySearchQuery === "" || 
      entry.description.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      entry.performedBy.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      proposals.find(p => p.id === entry.proposalId)?.proposalNumber.toLowerCase().includes(historySearchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  // Get unique action types for filter
  const uniqueActions = Array.from(new Set(proposalHistory.map(h => h.action)));

  // Create new proposal
  const handleCreateProposal = async () => {
    if (!newProposal.title || !newProposal.leadName || proposalItems.some(i => !i.description)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const totals = calculateTotals();
    const proposal: Proposal = {
      id: `PR${String(proposals.length + 1).padStart(3, '0')}`,
      proposalNumber: `PROP-2026-${String(proposals.length + 1).padStart(3, '0')}`,
      title: newProposal.title,
      leadId: `L${String(proposals.length + 1).padStart(3, '0')}`,
      leadName: newProposal.leadName,
      leadCompany: newProposal.leadCompany,
      leadEmail: newProposal.leadEmail,
      status: "Draft",
      version: 1,
      items: proposalItems,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      discount: discount,
      total: totals.total,
      validUntil: newProposal.validUntil ? new Date(newProposal.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      sentDate: null,
      viewedDate: null,
      acceptedDate: null,
      notes: newProposal.notes,
      termsAndConditions: newProposal.termsAndConditions,
      createdBy: "Current User",
    };

    setProposals([proposal, ...proposals]);

    // Add to history
    const historyEntry: ProposalHistory = {
      id: `PH${String(proposalHistory.length + 1).padStart(3, '0')}`,
      proposalId: proposal.id,
      action: "Created",
      description: `Proposal created for ${proposal.leadName}${proposal.leadCompany ? ` - ${proposal.leadCompany}` : ''}`,
      performedBy: "Current User",
      performedAt: new Date(),
    };
    setProposalHistory([historyEntry, ...proposalHistory]);

    setIsLoading(false);
    setCreateDialogOpen(false);
    resetForm();

    toast({
      title: "Proposal Created",
      description: `Proposal ${proposal.proposalNumber} created successfully`,
    });
  };

  // Send proposal
  const handleSendProposal = async (method: "email" | "whatsapp") => {
    if (!selectedProposal) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update proposal status
    setProposals(proposals.map(p => 
      p.id === selectedProposal.id 
        ? { ...p, status: "Sent", sentDate: new Date() }
        : p
    ));

    // Add to history
    const historyEntry: ProposalHistory = {
      id: `PH${String(proposalHistory.length + 1).padStart(3, '0')}`,
      proposalId: selectedProposal.id,
      action: "Sent",
      description: `Proposal sent via ${method} to ${selectedProposal.leadEmail}`,
      performedBy: "Current User",
      performedAt: new Date(),
    };
    setProposalHistory([historyEntry, ...proposalHistory]);

    setIsLoading(false);
    setSendDialogOpen(false);

    // Simulate sending
    if (method === "email") {
      window.open(`mailto:${selectedProposal.leadEmail}?subject=Proposal: ${selectedProposal.title}&body=Please find attached the proposal for your review.`);
    } else {
      const message = `Hi ${selectedProposal.leadName}, Please review our proposal: ${selectedProposal.title}. Total: ${formatCurrency(selectedProposal.total)}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    }

    toast({
      title: "Proposal Sent",
      description: `Proposal sent via ${method}`,
    });
  };

  // Update proposal status
  const handleUpdateStatus = async (proposalId: string, newStatus: ProposalStatus) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setProposals(proposals.map(p => {
      if (p.id === proposalId) {
        const updates: any = { status: newStatus };
        if (newStatus === "Accepted") updates.acceptedDate = new Date();
        return { ...p, ...updates };
      }
      return p;
    }));

    // Add to history
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      const historyEntry: ProposalHistory = {
        id: `PH${String(proposalHistory.length + 1).padStart(3, '0')}`,
        proposalId: proposalId,
        action: newStatus,
        description: `Proposal status changed to ${newStatus}`,
        performedBy: "Current User",
        performedAt: new Date(),
      };
      setProposalHistory([historyEntry, ...proposalHistory]);
    }

    setIsLoading(false);

    toast({
      title: "Status Updated",
      description: `Proposal marked as ${newStatus}`,
    });
  };

  // Create revision
  const handleCreateRevision = async (proposalId: string) => {
    const original = proposals.find(p => p.id === proposalId);
    if (!original) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const revision: Proposal = {
      ...original,
      id: `PR${String(proposals.length + 1).padStart(3, '0')}`,
      proposalNumber: `${original.proposalNumber}-v${original.version + 1}`,
      version: original.version + 1,
      status: "Draft",
      createdAt: new Date(),
      sentDate: null,
      viewedDate: null,
      acceptedDate: null,
    };

    setProposals([revision, ...proposals]);

    // Add to history
    const historyEntry: ProposalHistory = {
      id: `PH${String(proposalHistory.length + 1).padStart(3, '0')}`,
      proposalId: revision.id,
      action: "Revision Created",
      description: `New revision (v${revision.version}) created from ${original.proposalNumber}`,
      performedBy: "Current User",
      performedAt: new Date(),
    };
    setProposalHistory([historyEntry, ...proposalHistory]);

    setIsLoading(false);

    toast({
      title: "Revision Created",
      description: `Created version ${revision.version} of proposal`,
    });
  };

  // Convert to project
  const handleConvertToProject = async () => {
    if (!selectedProposal) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add to history
    const historyEntry: ProposalHistory = {
      id: `PH${String(proposalHistory.length + 1).padStart(3, '0')}`,
      proposalId: selectedProposal.id,
      action: "Converted",
      description: "Proposal converted to project",
      performedBy: "Current User",
      performedAt: new Date(),
    };
    setProposalHistory([historyEntry, ...proposalHistory]);

    setIsLoading(false);
    setConvertDialogOpen(false);

    toast({
      title: "Converted to Project",
      description: `Proposal ${selectedProposal.proposalNumber} converted to project successfully`,
    });
  };

  // Reset form
  const resetForm = () => {
    setNewProposal({
      title: "",
      leadName: "",
      leadCompany: "",
      leadEmail: "",
      validUntil: "",
      notes: "",
      termsAndConditions: "Payment terms: 50% upfront, 50% on completion. Valid for 30 days.",
    });
    setProposalItems([
      { id: "1", description: "", quantity: 1, unitPrice: 0, tax: 10, total: 0 },
    ]);
    setDiscount(0);
  };

  // Open dialogs
  const openSendDialog = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setSendDialogOpen(true);
  };

  const openDetailDialog = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setDetailDialogOpen(true);
  };

  const openConvertDialog = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setConvertDialogOpen(true);
  };

  // Filter proposals
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.leadCompany.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || proposal.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }).format(date);

  const formatDateTime = (date: Date) => 
    new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  const totals = calculateTotals();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CRM - Proposals</h1>
                <p className="text-sm text-gray-600">Create, send, and track proposals & quotations</p>
              </div>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Proposal
            </Button>
          </div>
        </div>

        {/* Enhancement Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900 mb-1">Complete Proposal Management System</h3>
              <p className="text-sm text-indigo-700">
                📝 Create quotations • 📧 Send via Email/WhatsApp • 📊 Track status • 🔄 Manage revisions • 🎯 Convert to projects
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Sent</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Total Value</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalValue)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.conversionRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all" className="gap-2">
              <FileText className="w-4 h-4" />
              All Proposals
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Activity History
            </TabsTrigger>
          </TabsList>

          {/* All Proposals Tab */}
          <TabsContent value="all" className="space-y-4">
            {/* Search and Filter */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search proposals by number, title, or client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Viewed">Viewed</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Proposals List */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Proposals ({filteredProposals.length})</CardTitle>
                <CardDescription>Manage and track all your proposals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredProposals.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No proposals found</p>
                      <p className="text-sm mt-2">Create your first proposal to get started</p>
                    </div>
                  ) : (
                    filteredProposals.map((proposal) => {
                      const StatusIcon = STATUS_CONFIG[proposal.status].icon;
                      const isExpiringSoon = new Date(proposal.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                      return (
                        <Card key={proposal.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-gray-900">{proposal.title}</h3>
                                      {proposal.version > 1 && (
                                        <Badge variant="outline" className="text-xs">
                                          v{proposal.version}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{proposal.proposalNumber}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                  <div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <User className="w-3 h-3" />
                                      {proposal.leadName}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Building2 className="w-3 h-3" />
                                      {proposal.leadCompany}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-green-600">
                                      {formatCurrency(proposal.total)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {proposal.items.length} item(s)
                                    </p>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Calendar className="w-3 h-3" />
                                      Valid until: {formatDate(proposal.validUntil)}
                                    </div>
                                    {isExpiringSoon && proposal.status !== "Accepted" && (
                                      <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Expiring soon
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge 
                                    className={`${STATUS_CONFIG[proposal.status].bgColor} ${STATUS_CONFIG[proposal.status].color} border flex items-center gap-1`}
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    {proposal.status}
                                  </Badge>
                                  {proposal.sentDate && (
                                    <span className="text-xs text-gray-500">
                                      Sent {formatDate(proposal.sentDate)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {proposal.status === "Draft" && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => openSendDialog(proposal)}
                                    className="gap-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    Send
                                  </Button>
                                )}

                                {proposal.status === "Accepted" && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => openConvertDialog(proposal)}
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                  >
                                    <Target className="w-4 h-4" />
                                    Convert
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDetailDialog(proposal)}
                                  className="gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleCreateRevision(proposal.id)}>
                                      <RefreshCw className="w-4 h-4 mr-2" />
                                      Create Revision
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(proposal.id, "Accepted")}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark Accepted
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(proposal.id, "Rejected")}>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Mark Rejected
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="w-4 h-4 mr-2" />
                                      Download PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity History Tab */}
          <TabsContent value="history" className="space-y-4">
            {/* Search and Filter for History */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search activities by action, description, or user..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={historyFilterAction} onValueChange={setHistoryFilterAction}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Actions</SelectItem>
                      {uniqueActions.map(action => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Activity History ({filteredHistory.length} of {proposalHistory.length})</CardTitle>
                    <CardDescription>Track all proposal activities and changes</CardDescription>
                  </div>
                  {proposalHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const csvHeaders = "ID,Proposal,Action,Description,Performed By,Date\n";
                        const csvData = filteredHistory.map(h => {
                          const prop = proposals.find(p => p.id === h.proposalId);
                          return `"${h.id}","${prop?.proposalNumber || h.proposalId}","${h.action}","${h.description}","${h.performedBy}","${formatDateTime(h.performedAt)}"`;
                        }).join('\n');
                        const csv = csvHeaders + csvData;
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `proposal-history-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        toast({
                          title: "Export Complete",
                          description: `Exported ${filteredHistory.length} activity records`,
                        });
                      }}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      {proposalHistory.length === 0 ? "No activity yet" : "No matching activities"}
                    </p>
                    <p className="text-sm mt-2">
                      {proposalHistory.length === 0 
                        ? "Proposal activities will appear here" 
                        : "Try adjusting your search or filter criteria"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((entry) => {
                      const proposal = proposals.find(p => p.id === entry.proposalId);
                      return (
                        <Card key={entry.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      entry.action === "Created" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                      entry.action === "Sent" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                      entry.action === "Viewed" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                                      entry.action === "Accepted" ? "bg-green-50 text-green-700 border-green-200" :
                                      entry.action === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                                      entry.action === "Revision Created" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                      entry.action === "Status Updated" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                      entry.action === "Converted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                      "bg-gray-50 text-gray-700 border-gray-200"
                                    }`}
                                  >
                                    {entry.action}
                                  </Badge>
                                  {proposal && (
                                    <span className="text-sm font-medium text-gray-900">
                                      {proposal.proposalNumber}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{entry.description}</p>
                              </div>
                              <div className="text-right text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {entry.performedBy}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDateTime(entry.performedAt)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Proposal Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
              <DialogDescription>
                Create a quotation or proposal for your lead
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Proposal Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Website Development Package"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadName">Lead Name *</Label>
                    <Input
                      id="leadName"
                      placeholder="Client name"
                      value={newProposal.leadName}
                      onChange={(e) => setNewProposal({...newProposal, leadName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadCompany">Company</Label>
                    <Input
                      id="leadCompany"
                      placeholder="Company name"
                      value={newProposal.leadCompany}
                      onChange={(e) => setNewProposal({...newProposal, leadCompany: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadEmail">Email *</Label>
                    <Input
                      id="leadEmail"
                      type="email"
                      placeholder="client@company.com"
                      value={newProposal.leadEmail}
                      onChange={(e) => setNewProposal({...newProposal, leadEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={newProposal.validUntil}
                      onChange={(e) => setNewProposal({...newProposal, validUntil: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Proposal Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Proposal Items</h3>
                  <Button size="sm" variant="outline" onClick={addItem} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24">Qty</TableHead>
                        <TableHead className="w-32">Unit Price</TableHead>
                        <TableHead className="w-24">Tax %</TableHead>
                        <TableHead className="w-32">Total</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposalItems.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input
                              placeholder="Item description"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.tax}
                              onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.id)}
                              disabled={proposalItems.length === 1}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-semibold">{formatCurrency(totals.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 h-8"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={newProposal.notes}
                    onChange={(e) => setNewProposal({...newProposal, notes: e.target.value})}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    placeholder="Payment terms, delivery conditions..."
                    value={newProposal.termsAndConditions}
                    onChange={(e) => setNewProposal({...newProposal, termsAndConditions: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleCreateProposal} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Proposal
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Proposal Dialog */}
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Proposal</DialogTitle>
              <DialogDescription>
                Choose how to send {selectedProposal?.proposalNumber}
              </DialogDescription>
            </DialogHeader>

            {selectedProposal && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-1">{selectedProposal.title}</p>
                  <p className="text-sm text-gray-600">To: {selectedProposal.leadName}</p>
                  <p className="text-sm text-gray-600">{selectedProposal.leadEmail}</p>
                  <p className="text-sm font-semibold text-green-600 mt-2">
                    Total: {formatCurrency(selectedProposal.total)}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full gap-2 h-auto py-4"
                    onClick={() => handleSendProposal("email")}
                    disabled={isLoading}
                  >
                    <Mail className="w-5 h-5" />
                    <div className="text-left flex-1">
                      <div className="font-semibold">Send via Email</div>
                      <div className="text-xs opacity-90">Opens email client with proposal details</div>
                    </div>
                  </Button>

                  <Button
                    className="w-full gap-2 h-auto py-4 bg-green-600 hover:bg-green-700"
                    onClick={() => handleSendProposal("whatsapp")}
                    disabled={isLoading}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <div className="text-left flex-1">
                      <div className="font-semibold">Send via WhatsApp</div>
                      <div className="text-xs opacity-90">Opens WhatsApp with proposal summary</div>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Proposal Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Proposal Details</DialogTitle>
              <DialogDescription>
                {selectedProposal?.proposalNumber}
              </DialogDescription>
            </DialogHeader>

            {selectedProposal && (() => {
              const StatusIcon = STATUS_CONFIG[selectedProposal.status].icon;
              return (
                <div className="space-y-6 py-4">
                  {/* Header Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Proposal</p>
                      <p className="font-semibold">{selectedProposal.title}</p>
                      <p className="text-sm text-gray-600">{selectedProposal.proposalNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client</p>
                      <p className="font-semibold">{selectedProposal.leadName}</p>
                      <p className="text-sm text-gray-600">{selectedProposal.leadCompany}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={`${STATUS_CONFIG[selectedProposal.status].bgColor} ${STATUS_CONFIG[selectedProposal.status].color} border w-fit mt-1`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {selectedProposal.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valid Until</p>
                      <p className="font-semibold">{formatDate(selectedProposal.validUntil)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Proposal Items</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Tax</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProposal.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell>{item.tax}%</TableCell>
                              <TableCell className="text-right font-semibold">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end mt-4">
                      <div className="w-80 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold">{formatCurrency(selectedProposal.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-semibold">{formatCurrency(selectedProposal.taxAmount)}</span>
                        </div>
                        {selectedProposal.discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-semibold text-red-600">-{formatCurrency(selectedProposal.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total:</span>
                          <span className="text-green-600">{formatCurrency(selectedProposal.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes and Terms */}
                  {(selectedProposal.notes || selectedProposal.termsAndConditions) && (
                    <div className="space-y-3">
                      {selectedProposal.notes && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Notes</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedProposal.notes}</p>
                        </div>
                      )}
                      {selectedProposal.termsAndConditions && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Terms & Conditions</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedProposal.termsAndConditions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold mb-3">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span>{formatDateTime(selectedProposal.createdAt)}</span>
                      </div>
                      {selectedProposal.sentDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sent:</span>
                          <span>{formatDateTime(selectedProposal.sentDate)}</span>
                        </div>
                      )}
                      {selectedProposal.viewedDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Viewed:</span>
                          <span>{formatDateTime(selectedProposal.viewedDate)}</span>
                        </div>
                      )}
                      {selectedProposal.acceptedDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accepted:</span>
                          <span className="text-green-600 font-semibold">{formatDateTime(selectedProposal.acceptedDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              {selectedProposal?.status === "Draft" && (
                <Button onClick={() => {
                  setDetailDialogOpen(false);
                  openSendDialog(selectedProposal);
                }} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send Proposal
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Convert to Project Dialog */}
        <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Convert to Project</DialogTitle>
              <DialogDescription>
                Convert this accepted proposal into a project
              </DialogDescription>
            </DialogHeader>

            {selectedProposal && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Accepted Proposal</span>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedProposal.title}</p>
                  <p className="text-sm text-gray-600">Client: {selectedProposal.leadName}</p>
                  <p className="text-sm font-semibold text-green-600 mt-2">
                    Value: {formatCurrency(selectedProposal.total)}
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm">Project will include:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      All proposal items as project tasks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Budget: {formatCurrency(selectedProposal.total)}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Client information pre-filled
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Terms & conditions attached
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  You'll be redirected to create a new project with pre-filled details
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleConvertToProject} disabled={isLoading} className="gap-2 bg-green-600 hover:bg-green-700">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Convert to Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
