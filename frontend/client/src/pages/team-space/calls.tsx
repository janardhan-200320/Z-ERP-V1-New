import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  PhoneForwarded,
  Plus,
  Edit,
  Clock,
  User,
  Bell,
  MessageSquare,
  Mail,
  MoreVertical,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Call {
  id: string;
  contactName: string;
  contactNumber: string;
  department: string;
  direction: "outbound" | "inbound";
  type: "internal" | "client" | "vendor";
  date: string;
  time: string;
  duration: string;
  status: "scheduled" | "completed" | "missed" | "follow-up";
  notes: string;
  assignedTo: string;
  reminder: {
    enabled: boolean;
    notification: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  followUpDate: string;
  followUpNotes: string;
}

const initialCalls: Call[] = [
  {
    id: "CALL-001",
    contactName: "John Smith - Acme Corp",
    contactNumber: "+1 (555) 123-4567",
    department: "Sales",
    direction: "outbound",
    type: "client",
    date: "2026-02-16",
    time: "09:30",
    duration: "",
    status: "scheduled",
    notes: "Discuss Q1 renewal proposal",
    assignedTo: "Sarah Johnson",
    reminder: { enabled: true, notification: true, whatsapp: false, email: true },
    followUpDate: "",
    followUpNotes: "",
  },
  {
    id: "CALL-002",
    contactName: "David Lee - CloudTech",
    contactNumber: "+1 (555) 987-6543",
    department: "Sales",
    direction: "outbound",
    type: "client",
    date: "2026-02-16",
    time: "11:00",
    duration: "25 min",
    status: "completed",
    notes: "Demo follow-up and pricing discussion",
    assignedTo: "Mike Chen",
    reminder: { enabled: false, notification: false, whatsapp: false, email: false },
    followUpDate: "2026-02-19",
    followUpNotes: "Send revised proposal with enterprise pricing",
  },
  {
    id: "CALL-003",
    contactName: "Maria Garcia",
    contactNumber: "+1 (555) 456-7890",
    department: "Development",
    direction: "inbound",
    type: "internal",
    date: "2026-02-16",
    time: "10:15",
    duration: "",
    status: "missed",
    notes: "Wanted to discuss API integration issue",
    assignedTo: "Alex Kumar",
    reminder: { enabled: false, notification: false, whatsapp: false, email: false },
    followUpDate: "",
    followUpNotes: "",
  },
  {
    id: "CALL-004",
    contactName: "Robert Taylor - SupplyChain Pro",
    contactNumber: "+1 (555) 321-6549",
    department: "Operations",
    direction: "outbound",
    type: "vendor",
    date: "2026-02-15",
    time: "14:00",
    duration: "40 min",
    status: "follow-up",
    notes: "Negotiated bulk pricing for Q2 supplies",
    assignedTo: "Ryan Wilson",
    reminder: { enabled: true, notification: true, whatsapp: true, email: false },
    followUpDate: "2026-02-18",
    followUpNotes: "Confirm final quantities and delivery schedule by EOD Friday",
  },
  {
    id: "CALL-005",
    contactName: "Lisa Park - Internal",
    contactNumber: "Ext 2045",
    department: "Accounts",
    direction: "inbound",
    type: "internal",
    date: "2026-02-16",
    time: "13:00",
    duration: "10 min",
    status: "completed",
    notes: "Invoice clarification for vendor payment",
    assignedTo: "Lisa Park",
    reminder: { enabled: false, notification: false, whatsapp: false, email: false },
    followUpDate: "",
    followUpNotes: "",
  },
  {
    id: "CALL-006",
    contactName: "Jennifer Wu - GlobalFinance",
    contactNumber: "+1 (555) 654-3210",
    department: "Sales",
    direction: "outbound",
    type: "client",
    date: "2026-02-15",
    time: "15:30",
    duration: "",
    status: "missed",
    notes: "Account renewal discussion",
    assignedTo: "Sarah Johnson",
    reminder: { enabled: true, notification: true, whatsapp: false, email: true },
    followUpDate: "2026-02-17",
    followUpNotes: "Reschedule call - priority follow-up needed",
  },
  {
    id: "CALL-007",
    contactName: "Tom Brown - Warehousing Inc",
    contactNumber: "+1 (555) 789-0123",
    department: "Operations",
    direction: "outbound",
    type: "vendor",
    date: "2026-02-16",
    time: "16:00",
    duration: "",
    status: "scheduled",
    notes: "Discuss new warehouse space availability",
    assignedTo: "Ryan Wilson",
    reminder: { enabled: true, notification: true, whatsapp: true, email: true },
    followUpDate: "",
    followUpNotes: "",
  },
  {
    id: "CALL-008",
    contactName: "Emily Davis - Internal",
    contactNumber: "Ext 1023",
    department: "Design",
    direction: "inbound",
    type: "internal",
    date: "2026-02-16",
    time: "12:00",
    duration: "15 min",
    status: "completed",
    notes: "Discussed banner design changes for landing page",
    assignedTo: "Emily Davis",
    reminder: { enabled: false, notification: false, whatsapp: false, email: false },
    followUpDate: "",
    followUpNotes: "",
  },
];

const teamMembersOptions = [
  "Sarah Johnson",
  "Mike Chen",
  "Emily Davis",
  "Alex Kumar",
  "Lisa Park",
  "Ryan Wilson",
  "James Taylor",
  "Nina Patel",
];

const departments = [
  "Management",
  "Sales",
  "Design",
  "Development",
  "Marketing",
  "Accounts",
  "Operations",
];

const emptyCall: Omit<Call, "id"> = {
  contactName: "",
  contactNumber: "",
  department: "",
  direction: "outbound",
  type: "client",
  date: "",
  time: "",
  duration: "",
  status: "scheduled",
  notes: "",
  assignedTo: "",
  reminder: { enabled: true, notification: true, whatsapp: false, email: true },
  followUpDate: "",
  followUpNotes: "",
};

export default function CallsModule() {
  const { toast } = useToast();
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [formData, setFormData] = useState<Omit<Call, "id">>(emptyCall);
  const [searchQuery, setSearchQuery] = useState("");

  const handleScheduleCall = () => {
    setEditingCall(null);
    setFormData(emptyCall);
    setDialogOpen(true);
  };

  const handleEdit = (call: Call) => {
    setEditingCall(call);
    setFormData({
      contactName: call.contactName,
      contactNumber: call.contactNumber,
      department: call.department,
      direction: call.direction,
      type: call.type,
      date: call.date,
      time: call.time,
      duration: call.duration,
      status: call.status,
      notes: call.notes,
      assignedTo: call.assignedTo,
      reminder: { ...call.reminder },
      followUpDate: call.followUpDate,
      followUpNotes: call.followUpNotes,
    });
    setDialogOpen(true);
  };

  const handleMarkComplete = (call: Call) => {
    setCalls((prev) =>
      prev.map((c) =>
        c.id === call.id ? { ...c, status: "completed" as const, duration: c.duration || "N/A" } : c
      )
    );
    toast({
      title: "Call Completed",
      description: `Call with "${call.contactName}" marked as completed.`,
    });
  };

  const handleMarkFollowUp = (call: Call) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === call.id ? { ...c, status: "follow-up" as const } : c))
    );
    toast({
      title: "Follow-up Required",
      description: `Call with "${call.contactName}" marked for follow-up.`,
    });
  };

  const handleSave = () => {
    if (!formData.contactName || !formData.date || !formData.time) {
      toast({
        title: "Validation Error",
        description: "Please fill in contact name, date, and time.",
        variant: "destructive",
      });
      return;
    }

    if (editingCall) {
      setCalls((prev) =>
        prev.map((c) => (c.id === editingCall.id ? { ...c, ...formData } : c))
      );
      toast({
        title: "Call Updated",
        description: `Call with "${formData.contactName}" updated successfully.`,
      });
    } else {
      const newCall: Call = {
        ...formData,
        id: `CALL-${String(calls.length + 1).padStart(3, "0")}`,
      };
      setCalls((prev) => [...prev, newCall]);
      toast({
        title: "Call Scheduled",
        description: `Call with "${formData.contactName}" has been scheduled.`,
      });
    }

    setDialogOpen(false);
    setEditingCall(null);
    setFormData(emptyCall);
  };

  const getFilteredCalls = (status?: string) => {
    return calls.filter((call) => {
      const matchesSearch =
        call.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !status || status === "all" || call.status === status;
      return matchesSearch && matchesStatus;
    });
  };

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    scheduled: {
      label: "Scheduled",
      color: "bg-blue-100 text-blue-700",
      icon: <Clock className="h-3 w-3" />,
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    missed: {
      label: "Missed",
      color: "bg-red-100 text-red-700",
      icon: <PhoneMissed className="h-3 w-3" />,
    },
    "follow-up": {
      label: "Follow-up",
      color: "bg-amber-100 text-amber-700",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
  };

  const callCounts = {
    all: calls.length,
    scheduled: calls.filter((c) => c.status === "scheduled").length,
    completed: calls.filter((c) => c.status === "completed").length,
    missed: calls.filter((c) => c.status === "missed").length,
    "follow-up": calls.filter((c) => c.status === "follow-up").length,
  };

  const renderCallsTable = (filteredCalls: Call[]) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reminder</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  No calls found
                </TableCell>
              </TableRow>
            ) : (
              filteredCalls.map((call) => (
                <TableRow key={call.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{call.contactName}</p>
                      <p className="text-xs text-slate-500">{call.contactNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {new Date(call.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{call.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {call.direction === "outbound" ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />
                      )}
                      <span className="text-xs capitalize">{call.direction}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        call.type === "client"
                          ? "bg-blue-50 text-blue-700"
                          : call.type === "vendor"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {call.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{call.assignedTo}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{call.duration || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {call.reminder.enabled ? (
                        <>
                          {call.reminder.notification && (
                            <span title="Notification"><Bell className="h-3.5 w-3.5 text-amber-500" /></span>
                          )}
                          {call.reminder.whatsapp && (
                            <span title="WhatsApp"><MessageSquare className="h-3.5 w-3.5 text-green-500" /></span>
                          )}
                          {call.reminder.email && (
                            <span title="Email"><Mail className="h-3.5 w-3.5 text-blue-500" /></span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-xs flex items-center gap-1 w-fit ${statusConfig[call.status]?.color}`}
                    >
                      {statusConfig[call.status]?.icon}
                      {statusConfig[call.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(call)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {call.status === "scheduled" && (
                          <DropdownMenuItem onClick={() => handleMarkComplete(call)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Completed
                          </DropdownMenuItem>
                        )}
                        {(call.status === "missed" || call.status === "completed") && (
                          <DropdownMenuItem onClick={() => handleMarkFollowUp(call)}>
                            <PhoneForwarded className="h-4 w-4 mr-2" />
                            Mark Follow-up
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleScheduleCall} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Call
        </Button>
      </div>

      {/* Tabs by Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            All
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {callCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Scheduled
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {callCounts.scheduled}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            Completed
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {callCounts.completed}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="missed" className="flex items-center gap-1.5">
            <PhoneMissed className="h-3.5 w-3.5" />
            Missed
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {callCounts.missed}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="follow-up" className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Follow-up
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {callCounts["follow-up"]}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderCallsTable(getFilteredCalls("all"))}</TabsContent>
        <TabsContent value="scheduled">
          {renderCallsTable(getFilteredCalls("scheduled"))}
        </TabsContent>
        <TabsContent value="completed">
          {renderCallsTable(getFilteredCalls("completed"))}
        </TabsContent>
        <TabsContent value="missed">{renderCallsTable(getFilteredCalls("missed"))}</TabsContent>
        <TabsContent value="follow-up">
          {renderCallsTable(getFilteredCalls("follow-up"))}
        </TabsContent>
      </Tabs>

      {/* Schedule / Edit Call Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCall ? "Edit Call" : "Schedule Call"}</DialogTitle>
            <DialogDescription>
              {editingCall
                ? "Update the call details below."
                : "Fill in the details to schedule a new call."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  placeholder="Name or Company"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contactName: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactNumber">Phone Number</Label>
                <Input
                  id="contactNumber"
                  placeholder="+1 (555) 000-0000"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contactNumber: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="callDate">Date *</Label>
                <Input
                  id="callDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="callTime">Time *</Label>
                <Input
                  id="callTime"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 30 min"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Direction, Type & Department */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Direction</Label>
                <Select
                  value={formData.direction}
                  onValueChange={(value: "outbound" | "inbound") =>
                    setFormData((prev) => ({ ...prev, direction: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Call Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "internal" | "client" | "vendor") =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assigned To */}
            <div className="grid gap-2">
              <Label>Assigned To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, assignedTo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembersOptions.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Call notes or agenda..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Follow-up */}
            {(formData.status === "follow-up" ||
              formData.status === "completed" ||
              formData.status === "missed") && (
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PhoneForwarded className="h-4 w-4 text-amber-600" />
                    Follow-up Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                    <Textarea
                      id="followUpNotes"
                      placeholder="What needs to be followed up on..."
                      value={formData.followUpNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, followUpNotes: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reminder Settings */}
            <Card className="bg-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  Reminder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm">Enable Reminder</Label>
                  <Switch
                    checked={formData.reminder.enabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        reminder: { ...prev.reminder, enabled: checked },
                      }))
                    }
                  />
                </div>
                {formData.reminder.enabled && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-2 rounded-lg border bg-white">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        <span className="text-xs">Notification</span>
                      </div>
                      <Switch
                        checked={formData.reminder.notification}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            reminder: { ...prev.reminder, notification: checked },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg border bg-white">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span className="text-xs">WhatsApp</span>
                      </div>
                      <Switch
                        checked={formData.reminder.whatsapp}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            reminder: { ...prev.reminder, whatsapp: checked },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg border bg-white">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-xs">Email</span>
                      </div>
                      <Switch
                        checked={formData.reminder.email}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            reminder: { ...prev.reminder, email: checked },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingCall ? "Update Call" : "Schedule Call"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
