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
  PhoneCall, Phone, User, Building2, Mail, Clock,
  Search, Filter, Download, History,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff,
  CheckCircle, XCircle, AlertCircle, MessageSquare,
  MoreVertical, Edit, Eye, RefreshCw, Loader2,
  TrendingUp, TrendingDown, Calendar, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

// Call status type
type CallStatus = "Not Called" | "Called" | "No Answer" | "Interested" | "Not Interested";

// Status configuration with colors and icons
const STATUS_CONFIG: Record<CallStatus, { color: string; bgColor: string; icon: any }> = {
  "Not Called": { color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200", icon: PhoneOff },
  "Called": { color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200", icon: PhoneCall },
  "No Answer": { color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200", icon: PhoneMissed },
  "Interested": { color: "text-green-600", bgColor: "bg-green-50 border-green-200", icon: CheckCircle },
  "Not Interested": { color: "text-red-600", bgColor: "bg-red-50 border-red-200", icon: XCircle },
};

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  callStatus: CallStatus;
  callAttempts: number;
  lastCallDate: Date | null;
  nextFollowUp: Date | null;
  assignedTo: string;
  priority: "High" | "Medium" | "Low";
  value: number;
  createdAt: Date;
}

interface CallLog {
  id: string;
  leadId: string;
  leadName: string;
  callStatus: CallStatus;
  duration: string;
  notes: string;
  calledBy: string;
  calledAt: Date;
  nextAction: string;
}

export default function LeadCallStatus() {
  const { toast } = useToast();

  // Leads data
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "L001",
      name: "John Smith",
      company: "Tech Corp",
      email: "john@techcorp.com",
      phone: "+1-555-0101",
      callStatus: "Not Called",
      callAttempts: 0,
      lastCallDate: null,
      nextFollowUp: null,
      assignedTo: "Sales Executive 1",
      priority: "High",
      value: 50000,
      createdAt: new Date(2026, 1, 15),
    },
    {
      id: "L002",
      name: "Emily Davis",
      company: "Digital Solutions",
      email: "emily@digitalsol.com",
      phone: "+1-555-0102",
      callStatus: "Called",
      callAttempts: 1,
      lastCallDate: new Date(2026, 1, 14, 10, 30),
      nextFollowUp: new Date(2026, 1, 18),
      assignedTo: "Sales Executive 2",
      priority: "High",
      value: 75000,
      createdAt: new Date(2026, 1, 14),
    },
    {
      id: "L003",
      name: "Michael Brown",
      company: "Innovation Inc",
      email: "michael@innovation.com",
      phone: "+1-555-0103",
      callStatus: "No Answer",
      callAttempts: 2,
      lastCallDate: new Date(2026, 1, 15, 14, 15),
      nextFollowUp: new Date(2026, 1, 17),
      assignedTo: "Sales Executive 1",
      priority: "Medium",
      value: 100000,
      createdAt: new Date(2026, 1, 12),
    },
    {
      id: "L004",
      name: "Sarah Wilson",
      company: "Future Systems",
      email: "sarah@futuresys.com",
      phone: "+1-555-0104",
      callStatus: "Interested",
      callAttempts: 1,
      lastCallDate: new Date(2026, 1, 13, 15, 45),
      nextFollowUp: new Date(2026, 1, 20),
      assignedTo: "Sarah Johnson",
      priority: "High",
      value: 120000,
      createdAt: new Date(2026, 1, 10),
    },
    {
      id: "L005",
      name: "David Lee",
      company: "Smart Enterprises",
      email: "david@smartent.com",
      phone: "+1-555-0105",
      callStatus: "Not Interested",
      callAttempts: 2,
      lastCallDate: new Date(2026, 1, 12, 11, 20),
      nextFollowUp: null,
      assignedTo: "Mike Chen",
      priority: "Low",
      value: 150000,
      createdAt: new Date(2026, 1, 16),
    },
    {
      id: "L006",
      name: "Lisa Anderson",
      company: "Global Tech",
      email: "lisa@globaltech.com",
      phone: "+1-555-0106",
      callStatus: "No Answer",
      callAttempts: 3,
      lastCallDate: new Date(2026, 1, 16, 9, 0),
      nextFollowUp: new Date(2026, 1, 17),
      assignedTo: "Sales Executive 1",
      priority: "Medium",
      value: 80000,
      createdAt: new Date(2026, 1, 15),
    },
    {
      id: "L007",
      name: "Robert Taylor",
      company: "NextGen Solutions",
      email: "robert@nextgen.com",
      phone: "+1-555-0107",
      callStatus: "Interested",
      callAttempts: 2,
      lastCallDate: new Date(2026, 1, 15, 16, 30),
      nextFollowUp: new Date(2026, 1, 19),
      assignedTo: "Sarah Johnson",
      priority: "High",
      value: 60000,
      createdAt: new Date(2026, 1, 13),
    },
    {
      id: "L008",
      name: "Jennifer White",
      company: "Cloud Dynamics",
      email: "jennifer@clouddyn.com",
      phone: "+1-555-0108",
      callStatus: "Not Called",
      callAttempts: 0,
      lastCallDate: null,
      nextFollowUp: null,
      assignedTo: "Mike Chen",
      priority: "Medium",
      value: 90000,
      createdAt: new Date(2026, 1, 16),
    },
  ]);

  const [callLogs, setCallLogs] = useState<CallLog[]>([
    {
      id: "CL001",
      leadId: "L002",
      leadName: "Emily Davis",
      callStatus: "Called",
      duration: "5 min 30 sec",
      notes: "Discussed product features. Customer interested in demo.",
      calledBy: "Sales Executive 2",
      calledAt: new Date(2026, 1, 14, 10, 30),
      nextAction: "Schedule product demo",
    },
    {
      id: "CL002",
      leadId: "L003",
      leadName: "Michael Brown",
      callStatus: "No Answer",
      duration: "0 min",
      notes: "No response. Left voicemail.",
      calledBy: "Sales Executive 1",
      calledAt: new Date(2026, 1, 15, 14, 15),
      nextAction: "Retry tomorrow afternoon",
    },
    {
      id: "CL003",
      leadId: "L004",
      leadName: "Sarah Wilson",
      callStatus: "Interested",
      duration: "12 min 15 sec",
      notes: "Very interested! Discussed pricing and implementation timeline.",
      calledBy: "Sarah Johnson",
      calledAt: new Date(2026, 1, 13, 15, 45),
      nextAction: "Send proposal by Friday",
    },
    {
      id: "CL004",
      leadId: "L005",
      leadName: "David Lee",
      callStatus: "Not Interested",
      duration: "2 min 45 sec",
      notes: "Already using competitor solution. Not looking to switch.",
      calledBy: "Mike Chen",
      calledAt: new Date(2026, 1, 12, 11, 20),
      nextAction: "Mark as lost",
    },
  ]);

  // State management
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newCallStatus, setNewCallStatus] = useState<CallStatus>("Called");
  const [callDuration, setCallDuration] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<CallStatus | "All">("All");
  const [filterPriority, setFilterPriority] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate statistics
  const stats = {
    total: leads.length,
    notCalled: leads.filter(l => l.callStatus === "Not Called").length,
    called: leads.filter(l => l.callStatus === "Called").length,
    noAnswer: leads.filter(l => l.callStatus === "No Answer").length,
    interested: leads.filter(l => l.callStatus === "Interested").length,
    notInterested: leads.filter(l => l.callStatus === "Not Interested").length,
    successRate: leads.length > 0 
      ? ((leads.filter(l => l.callStatus === "Interested").length / leads.filter(l => l.callStatus !== "Not Called").length) * 100).toFixed(1)
      : "0",
    avgAttempts: leads.length > 0
      ? (leads.reduce((sum, l) => sum + l.callAttempts, 0) / leads.length).toFixed(1)
      : "0",
  };

  // Handle call status update
  const handleUpdateCallStatus = async () => {
    if (!selectedLead) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update lead
    const updatedLead = {
      ...selectedLead,
      callStatus: newCallStatus,
      callAttempts: selectedLead.callAttempts + 1,
      lastCallDate: new Date(),
      nextFollowUp: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
    };

    setLeads(leads.map(lead => 
      lead.id === selectedLead.id ? updatedLead : lead
    ));

    // Add to call logs
    const logEntry: CallLog = {
      id: `CL${String(callLogs.length + 1).padStart(3, '0')}`,
      leadId: selectedLead.id,
      leadName: selectedLead.name,
      callStatus: newCallStatus,
      duration: callDuration,
      notes: callNotes,
      calledBy: "Current User",
      calledAt: new Date(),
      nextAction: nextAction,
    };

    setCallLogs([logEntry, ...callLogs]);

    setIsLoading(false);
    setUpdateDialogOpen(false);
    resetForm();

    toast({
      title: "Call Status Updated",
      description: `${selectedLead.name} marked as ${newCallStatus}`,
    });
  };

  // Reset form
  const resetForm = () => {
    setCallDuration("");
    setCallNotes("");
    setNextAction("");
    setNextFollowUpDate("");
  };

  // Open update dialog
  const openUpdateDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setNewCallStatus(lead.callStatus);
    resetForm();
    setUpdateDialogOpen(true);
  };

  // Open detail dialog
  const openDetailDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    
    const matchesStatus = filterStatus === "All" || lead.callStatus === filterStatus;
    const matchesPriority = filterPriority === "All" || lead.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group leads by status
  const leadsByStatus = (status: CallStatus) => 
    filteredLeads.filter(lead => lead.callStatus === status);

  // Format date
  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  // Format date only
  const formatDateOnly = (date: Date) => 
    new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }).format(date);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700 border-red-300";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Low": return "bg-green-100 text-green-700 border-green-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CRM - Call Status</h1>
              <p className="text-sm text-gray-600">Track lead call outcomes and manage follow-ups</p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <PhoneOff className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Not Called</p>
                <p className="text-2xl font-bold text-gray-900">{stats.notCalled}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <PhoneCall className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Called</p>
                <p className="text-2xl font-bold text-blue-600">{stats.called}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                  <PhoneMissed className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">No Answer</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.noAnswer}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Interested</p>
                <p className="text-2xl font-bold text-green-600">{stats.interested}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Not Interested</p>
                <p className="text-2xl font-bold text-red-600">{stats.notInterested}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.successRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="board" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="board" className="gap-2">
              <PhoneCall className="w-4 h-4" />
              Status Board
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <User className="w-4 h-4" />
              All Leads
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Call History
            </TabsTrigger>
          </TabsList>

          {/* Status Board View */}
          <TabsContent value="board" className="space-y-4">
            {/* Search and Filter */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search leads by name, company, or phone..."
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
                      <SelectItem value="Not Called">Not Called</SelectItem>
                      <SelectItem value="Called">Called</SelectItem>
                      <SelectItem value="No Answer">No Answer</SelectItem>
                      <SelectItem value="Interested">Interested</SelectItem>
                      <SelectItem value="Not Interested">Not Interested</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Priorities</SelectItem>
                      <SelectItem value="High">High Priority</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {(["Not Called", "Called", "No Answer", "Interested", "Not Interested"] as CallStatus[]).map((status) => {
                const statusLeads = leadsByStatus(status);
                const StatusIcon = STATUS_CONFIG[status].icon;

                return (
                  <Card key={status} className={`border-2 ${STATUS_CONFIG[status].bgColor}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[status].color}`} />
                          <CardTitle className={`text-sm font-semibold ${STATUS_CONFIG[status].color}`}>
                            {status}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {statusLeads.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {statusLeads.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <StatusIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">No leads</p>
                        </div>
                      ) : (
                        statusLeads.map((lead) => (
                          <Card key={lead.id} className="border hover:shadow-md transition-shadow bg-white">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 truncate">
                                      {lead.name}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                      {lead.company}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openUpdateDialog(lead)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Update Status
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openDetailDialog(lead)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Phone className="w-3 h-3" />
                                  <span>{lead.phone}</span>
                                </div>

                                <div className="pt-2 border-t space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Attempts:</span>
                                    <span className="font-semibold text-gray-900">
                                      {lead.callAttempts}
                                    </span>
                                  </div>
                                  {lead.lastCallDate && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Clock className="w-3 h-3" />
                                      {formatDateOnly(lead.lastCallDate)}
                                    </div>
                                  )}
                                  {lead.nextFollowUp && (
                                    <div className="flex items-center gap-1 text-xs text-orange-600">
                                      <Calendar className="w-3 h-3" />
                                      Follow-up: {formatDateOnly(lead.nextFollowUp)}
                                    </div>
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2 h-7 text-xs"
                                  onClick={() => openUpdateDialog(lead)}
                                >
                                  <PhoneCall className="w-3 h-3 mr-1" />
                                  Update Call
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
                <CardDescription>Complete list of leads with call status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredLeads.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <PhoneCall className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No leads found</p>
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredLeads.map((lead) => {
                      const StatusIcon = STATUS_CONFIG[lead.callStatus].icon;
                      
                      return (
                        <Card key={lead.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                    <Building2 className="w-3 h-3" />
                                    {lead.company}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Phone className="w-3 h-3" />
                                    {lead.phone}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Mail className="w-3 h-3" />
                                    {lead.email}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs text-gray-600">
                                    Attempts: <span className="font-semibold text-gray-900">{lead.callAttempts}</span>
                                  </p>
                                  {lead.lastCallDate && (
                                    <p className="text-xs text-gray-600">
                                      Last: {formatDateOnly(lead.lastCallDate)}
                                    </p>
                                  )}
                                  <Badge className={`${getPriorityColor(lead.priority)} border text-xs`}>
                                    {lead.priority}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Badge 
                                  className={`${STATUS_CONFIG[lead.callStatus].bgColor} ${STATUS_CONFIG[lead.callStatus].color} border flex items-center gap-1 px-3 py-1`}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {lead.callStatus}
                                </Badge>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openUpdateDialog(lead)}
                                  className="gap-2"
                                >
                                  <PhoneCall className="w-4 h-4" />
                                  Update
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDetailDialog(lead)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
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

          {/* Call History */}
          <TabsContent value="history" className="space-y-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Call History ({callLogs.length})</CardTitle>
                <CardDescription>Track all call activities and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                {callLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No call history yet</p>
                    <p className="text-sm mt-2">Call logs will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {callLogs.map((log) => {
                      const StatusIcon = STATUS_CONFIG[log.callStatus].icon;

                      return (
                        <Card key={log.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="w-4 h-4 text-gray-600" />
                                  <span className="font-semibold text-gray-900">{log.leadName}</span>
                                  <span className="text-xs text-gray-500">#{log.leadId}</span>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`${STATUS_CONFIG[log.callStatus].bgColor} ${STATUS_CONFIG[log.callStatus].color} border text-xs`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {log.callStatus}
                                  </Badge>
                                  {log.duration && (
                                    <span className="text-xs text-gray-600">
                                      Duration: {log.duration}
                                    </span>
                                  )}
                                </div>

                                {log.notes && (
                                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                                    "{log.notes}"
                                  </p>
                                )}

                                {log.nextAction && (
                                  <div className="flex items-center gap-1 text-sm text-blue-600">
                                    <MessageSquare className="w-3 h-3" />
                                    Next: {log.nextAction}
                                  </div>
                                )}
                              </div>

                              <div className="text-right space-y-1">
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <User className="w-3 h-3" />
                                  {log.calledBy}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(log.calledAt)}
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

        {/* Update Call Status Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={(open) => {
          setUpdateDialogOpen(open);
          if (open) setDetailDialogOpen(false);
        }}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Call Status</DialogTitle>
              <DialogDescription>
                Record call outcome for {selectedLead?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Lead Info */}
              {selectedLead && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedLead.name}</p>
                  <p className="text-xs text-gray-600">{selectedLead.company}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                    <Phone className="w-3 h-3" />
                    {selectedLead.phone}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Call Attempts: {selectedLead.callAttempts}
                  </p>
                </div>
              )}

              {/* Call Status */}
              <div className="space-y-2">
                <Label htmlFor="call-status">Call Outcome *</Label>
                <Select value={newCallStatus} onValueChange={(value: CallStatus) => setNewCallStatus(value)}>
                  <SelectTrigger id="call-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Not Called", "Called", "No Answer", "Interested", "Not Interested"] as CallStatus[]).map((status) => {
                      const StatusIcon = STATUS_CONFIG[status].icon;
                      return (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[status].color}`} />
                            {status}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Call Duration */}
              <div className="space-y-2">
                <Label htmlFor="call-duration">Call Duration</Label>
                <Input
                  id="call-duration"
                  placeholder="e.g., 5 min 30 sec"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                />
              </div>

              {/* Call Notes */}
              <div className="space-y-2">
                <Label htmlFor="call-notes">Call Notes</Label>
                <Textarea
                  id="call-notes"
                  placeholder="Add notes about this call..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {callNotes.length} / 500 characters
                </p>
              </div>

              {/* Quick Notes Templates */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Quick Notes</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Very interested, send proposal",
                    "No answer, retry tomorrow",
                    "Not interested at this time",
                    "Scheduled demo for next week",
                    "Budget approved, proceed",
                    "Call back in 3 months",
                  ].map((template) => (
                    <Button
                      key={template}
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-auto py-2"
                      onClick={() => setCallNotes(template)}
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Next Action */}
              <div className="space-y-2">
                <Label htmlFor="next-action">Next Action</Label>
                <Input
                  id="next-action"
                  placeholder="e.g., Send proposal, Schedule demo..."
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                />
              </div>

              {/* Next Follow-up Date */}
              <div className="space-y-2">
                <Label htmlFor="next-followup">Next Follow-up Date</Label>
                <Input
                  id="next-followup"
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCallStatus} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Call Log
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lead Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (open) setUpdateDialogOpen(false);
        }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedLead?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (() => {
              const StatusIcon = STATUS_CONFIG[selectedLead.callStatus].icon;
              return (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="font-medium">{selectedLead.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Company</p>
                      <p className="font-medium">{selectedLead.company}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-medium">{selectedLead.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="font-medium">{selectedLead.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Call Status</p>
                      <Badge className={`${STATUS_CONFIG[selectedLead.callStatus].bgColor} ${STATUS_CONFIG[selectedLead.callStatus].color} border w-fit`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {selectedLead.callStatus}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Priority</p>
                      <Badge className={`${getPriorityColor(selectedLead.priority)} border w-fit`}>
                        {selectedLead.priority}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Call Attempts</p>
                      <p className="font-medium">{selectedLead.callAttempts}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Deal Value</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedLead.value)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Assigned To</p>
                      <p className="font-medium">{selectedLead.assignedTo}</p>
                    </div>
                    {selectedLead.lastCallDate && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">Last Call</p>
                        <p className="font-medium text-sm">{formatDate(selectedLead.lastCallDate)}</p>
                      </div>
                    )}
                    {selectedLead.nextFollowUp && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">Next Follow-up</p>
                        <p className="font-medium text-sm text-orange-600">{formatDateOnly(selectedLead.nextFollowUp)}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Created</p>
                      <p className="font-medium text-sm">{formatDate(selectedLead.createdAt)}</p>
                    </div>
                  </div>

                  {/* Call History for this lead */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold mb-3">Call History</p>
                    <div className="space-y-2">
                      {callLogs
                        .filter(log => log.leadId === selectedLead.id)
                        .map(log => {
                          const LogStatusIcon = STATUS_CONFIG[log.callStatus].icon;
                          return (
                            <div key={log.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`${STATUS_CONFIG[log.callStatus].bgColor} ${STATUS_CONFIG[log.callStatus].color} border text-xs`}>
                                  <LogStatusIcon className="w-3 h-3 mr-1" />
                                  {log.callStatus}
                                </Badge>
                                {log.duration && <span className="text-xs text-gray-600">{log.duration}</span>}
                              </div>
                              {log.notes && <p className="text-xs text-gray-600 mb-1">"{log.notes}"</p>}
                              {log.nextAction && <p className="text-xs text-blue-600 mb-1">Next: {log.nextAction}</p>}
                              <p className="text-xs text-gray-500">{formatDate(log.calledAt)} by {log.calledBy}</p>
                            </div>
                          );
                        })}
                      {callLogs.filter(log => log.leadId === selectedLead.id).length === 0 && (
                        <p className="text-xs text-gray-500">No call history</p>
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
              <Button onClick={() => {
                setDetailDialogOpen(false);
                if (selectedLead) openUpdateDialog(selectedLead);
              }} className="gap-2">
                <PhoneCall className="w-4 h-4" />
                Update Call Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
