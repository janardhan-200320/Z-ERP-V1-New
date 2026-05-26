import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Video,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  Bell,
  Mail,
  MessageSquare,
  MoreVertical,
  Search,
  Filter,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "video" | "in-person" | "hybrid";
  location: string;
  meetingLink: string;
  organizer: string;
  participants: string[];
  department: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  reminder: {
    enabled: boolean;
    notification: boolean;
    whatsapp: boolean;
    email: boolean;
    minutesBefore: number;
  };
  agenda: string;
  notes: string;
}

const initialMeetings: Meeting[] = [
  {
    id: "MTG-001",
    title: "Sprint Planning - Dev Team",
    description: "Plan the next sprint tasks and allocate resources",
    date: "2026-02-16",
    startTime: "10:00",
    endTime: "11:00",
    type: "video",
    location: "",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    organizer: "Sarah Johnson",
    participants: ["Mike Chen", "Emily Davis", "Alex Kumar", "Lisa Park"],
    department: "Development",
    status: "scheduled",
    reminder: {
      enabled: true,
      notification: true,
      whatsapp: true,
      email: true,
      minutesBefore: 15,
    },
    agenda: "1. Review previous sprint\n2. Backlog grooming\n3. Sprint goal setting\n4. Task breakdown",
    notes: "",
  },
  {
    id: "MTG-002",
    title: "Design Review - Marketing Campaign",
    description: "Review new marketing campaign designs and creatives",
    date: "2026-02-16",
    startTime: "14:00",
    endTime: "15:00",
    type: "hybrid",
    location: "Conference Room A",
    meetingLink: "https://meet.google.com/xyz-abcd-efg",
    organizer: "Emily Davis",
    participants: ["Sarah Johnson", "Ryan Wilson", "Alex Kumar"],
    department: "Marketing",
    status: "scheduled",
    reminder: {
      enabled: true,
      notification: true,
      whatsapp: false,
      email: true,
      minutesBefore: 30,
    },
    agenda: "1. Campaign brief overview\n2. Design walkthrough\n3. Feedback session\n4. Next steps",
    notes: "",
  },
  {
    id: "MTG-003",
    title: "Client Onboarding - TechVentures",
    description: "Onboard new client TechVentures with account setup",
    date: "2026-02-17",
    startTime: "09:00",
    endTime: "10:30",
    type: "video",
    location: "",
    meetingLink: "https://zoom.us/j/123456789",
    organizer: "Mike Chen",
    participants: ["Sarah Johnson", "Lisa Park"],
    department: "Sales",
    status: "scheduled",
    reminder: {
      enabled: true,
      notification: true,
      whatsapp: true,
      email: true,
      minutesBefore: 15,
    },
    agenda: "1. Welcome & introductions\n2. Account setup demo\n3. Integration walkthrough\n4. Q&A",
    notes: "",
  },
  {
    id: "MTG-004",
    title: "Quarterly Business Review",
    description: "Q4 performance review with leadership team",
    date: "2026-02-15",
    startTime: "11:00",
    endTime: "12:30",
    type: "in-person",
    location: "Board Room",
    meetingLink: "",
    organizer: "Ryan Wilson",
    participants: ["Sarah Johnson", "Mike Chen", "Emily Davis", "Alex Kumar", "Lisa Park"],
    department: "Management",
    status: "completed",
    reminder: {
      enabled: true,
      notification: true,
      whatsapp: false,
      email: true,
      minutesBefore: 60,
    },
    agenda: "1. Revenue analysis\n2. KPI review\n3. Growth strategy\n4. Budget allocation",
    notes: "Achieved 115% of Q4 targets. New budget approved for Q1.",
  },
  {
    id: "MTG-005",
    title: "Team Building Activity",
    description: "Monthly team building and fun activities",
    date: "2026-02-18",
    startTime: "16:00",
    endTime: "17:30",
    type: "in-person",
    location: "Recreation Hall",
    meetingLink: "",
    organizer: "Alex Kumar",
    participants: ["Sarah Johnson", "Mike Chen", "Emily Davis", "Lisa Park", "Ryan Wilson"],
    department: "Operations",
    status: "scheduled",
    reminder: {
      enabled: true,
      notification: true,
      whatsapp: true,
      email: false,
      minutesBefore: 60,
    },
    agenda: "1. Ice breaker\n2. Team quiz\n3. Group activity\n4. Wrap up",
    notes: "",
  },
  {
    id: "MTG-006",
    title: "Accounts Reconciliation Sync",
    description: "Monthly accounts reconciliation and audit preparation",
    date: "2026-02-14",
    startTime: "10:00",
    endTime: "11:00",
    type: "video",
    location: "",
    meetingLink: "https://meet.google.com/rec-onci-ltn",
    organizer: "Lisa Park",
    participants: ["Ryan Wilson"],
    department: "Accounts",
    status: "cancelled",
    reminder: {
      enabled: false,
      notification: false,
      whatsapp: false,
      email: false,
      minutesBefore: 15,
    },
    agenda: "1. Review pending entries\n2. Bank statement matching\n3. Discrepancy resolution",
    notes: "Cancelled due to scheduling conflict. Rescheduled to next week.",
  },
];

const emptyMeeting: Omit<Meeting, "id"> = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  type: "video",
  location: "",
  meetingLink: "",
  organizer: "",
  participants: [],
  department: "",
  status: "scheduled",
  reminder: {
    enabled: true,
    notification: true,
    whatsapp: false,
    email: true,
    minutesBefore: 15,
  },
  agenda: "",
  notes: "",
};

const departments = [
  "Management",
  "Sales",
  "Design",
  "Development",
  "Marketing",
  "Accounts",
  "Operations",
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

export default function MeetingsModule() {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState<Omit<Meeting, "id">>(emptyMeeting);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [meetingToCancel, setMeetingToCancel] = useState<Meeting | null>(null);
  const [participantInput, setParticipantInput] = useState("");

  const handleSchedule = () => {
    setEditingMeeting(null);
    setFormData(emptyMeeting);
    setDialogOpen(true);
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      type: meeting.type,
      location: meeting.location,
      meetingLink: meeting.meetingLink,
      organizer: meeting.organizer,
      participants: [...meeting.participants],
      department: meeting.department,
      status: meeting.status,
      reminder: { ...meeting.reminder },
      agenda: meeting.agenda,
      notes: meeting.notes,
    });
    setDialogOpen(true);
  };

  const handleCancel = (meeting: Meeting) => {
    setMeetingToCancel(meeting);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (meetingToCancel) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingToCancel.id ? { ...m, status: "cancelled" as const } : m
        )
      );
      toast({
        title: "Meeting Cancelled",
        description: `"${meetingToCancel.title}" has been cancelled. Notifications sent to participants.`,
      });
      setCancelDialogOpen(false);
      setMeetingToCancel(null);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingMeeting) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === editingMeeting.id ? { ...m, ...formData } : m
        )
      );
      toast({
        title: "Meeting Updated",
        description: `"${formData.title}" has been updated successfully.`,
      });
    } else {
      const newMeeting: Meeting = {
        ...formData,
        id: `MTG-${String(meetings.length + 1).padStart(3, "0")}`,
      };
      setMeetings((prev) => [...prev, newMeeting]);
      toast({
        title: "Meeting Scheduled",
        description: `"${formData.title}" has been scheduled. Reminders will be sent.`,
      });
    }

    setDialogOpen(false);
    setEditingMeeting(null);
    setFormData(emptyMeeting);
  };

  const addParticipant = () => {
    if (participantInput && !formData.participants.includes(participantInput)) {
      setFormData((prev) => ({
        ...prev,
        participants: [...prev.participants, participantInput],
      }));
      setParticipantInput("");
    }
  };

  const removeParticipant = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p !== name),
    }));
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || meeting.status === filterStatus;
    const matchesDept = filterDepartment === "all" || meeting.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    scheduled: {
      label: "Scheduled",
      color: "bg-blue-100 text-blue-700",
      icon: <Clock className="h-3 w-3" />,
    },
    "in-progress": {
      label: "In Progress",
      color: "bg-green-100 text-green-700",
      icon: <Video className="h-3 w-3" />,
    },
    completed: {
      label: "Completed",
      color: "bg-slate-100 text-slate-700",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-700",
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const typeConfig: Record<string, { label: string; color: string }> = {
    video: { label: "Video Call", color: "bg-indigo-100 text-indigo-700" },
    "in-person": { label: "In-Person", color: "bg-emerald-100 text-emerald-700" },
    hybrid: { label: "Hybrid", color: "bg-purple-100 text-purple-700" },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSchedule} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Meetings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meeting</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No meetings found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredMeetings.map((meeting) => (
                  <TableRow key={meeting.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{meeting.title}</p>
                        <p className="text-xs text-slate-500">by {meeting.organizer}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(meeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{meeting.startTime} - {meeting.endTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${typeConfig[meeting.type]?.color}`}>
                        {typeConfig[meeting.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{meeting.department}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm">{meeting.participants.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {meeting.reminder.enabled ? (
                          <>
                            {meeting.reminder.notification && (
                              <span title="System Notification"><Bell className="h-3.5 w-3.5 text-amber-500" /></span>
                            )}
                            {meeting.reminder.whatsapp && (
                              <span title="WhatsApp"><MessageSquare className="h-3.5 w-3.5 text-green-500" /></span>
                            )}
                            {meeting.reminder.email && (
                              <span title="Email"><Mail className="h-3.5 w-3.5 text-blue-500" /></span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">Off</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs flex items-center gap-1 w-fit ${statusConfig[meeting.status]?.color}`}
                      >
                        {statusConfig[meeting.status]?.icon}
                        {statusConfig[meeting.status]?.label}
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
                          <DropdownMenuItem onClick={() => handleEdit(meeting)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {meeting.status === "scheduled" && (
                            <DropdownMenuItem
                              onClick={() => handleCancel(meeting)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
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

      {/* Schedule / Edit Meeting Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
            </DialogTitle>
            <DialogDescription>
              {editingMeeting
                ? "Update the meeting details below."
                : "Fill in the details to schedule a new meeting."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Title & Description */}
            <div className="grid gap-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                placeholder="Enter meeting title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief meeting description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            {/* Type, Department & Organizer */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Meeting Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "video" | "in-person" | "hybrid") =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
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
              <div className="grid gap-2">
                <Label>Organizer</Label>
                <Select
                  value={formData.organizer}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, organizer: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
            </div>

            {/* Location & Meeting Link */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="location">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Room / Place"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="meetingLink">
                  <LinkIcon className="h-3.5 w-3.5 inline mr-1" />
                  Meeting Link
                </Label>
                <Input
                  id="meetingLink"
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))}
                />
              </div>
            </div>

            {/* Participants */}
            <div className="grid gap-2">
              <Label>Participants</Label>
              <div className="flex gap-2">
                <Select value={participantInput} onValueChange={setParticipantInput}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembersOptions
                      .filter((m) => !formData.participants.includes(m))
                      .map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={addParticipant} size="sm">
                  Add
                </Button>
              </div>
              {formData.participants.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.participants.map((p) => (
                    <Badge key={p} variant="secondary" className="flex items-center gap-1">
                      {p}
                      <button
                        onClick={() => removeParticipant(p)}
                        className="ml-1 hover:text-red-500"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Agenda */}
            <div className="grid gap-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea
                id="agenda"
                placeholder="Meeting agenda items..."
                value={formData.agenda}
                onChange={(e) => setFormData((prev) => ({ ...prev, agenda: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Reminder Settings */}
            <Card className="bg-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  Reminder Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable Reminders</Label>
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
                  <>
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
                    <div className="grid gap-2">
                      <Label className="text-sm">Remind Before</Label>
                      <Select
                        value={String(formData.reminder.minutesBefore)}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            reminder: { ...prev.reminder, minutesBefore: Number(value) },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes before</SelectItem>
                          <SelectItem value="10">10 minutes before</SelectItem>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                          <SelectItem value="1440">1 day before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingMeeting ? "Update Meeting" : "Schedule Meeting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Cancel Meeting
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel "{meetingToCancel?.title}"? All participants
              will be notified via the configured reminder channels.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Meeting
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
