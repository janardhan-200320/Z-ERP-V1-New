import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Video,
  Phone,
  MessageSquare,
  FolderOpen,
  Calendar,
  Clock,
  UserPlus,
  Mail,
  Briefcase,
  Building2,
  Smartphone,
  User,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import MeetingsModule from "./meetings";
import CallsModule from "./calls";
import TeamChatsModule from "./team-chats";
import FileSharingModule from "./file-sharing";
import { useToast } from "@/hooks/use-toast";

type TeamMemberStatus = "online" | "busy" | "away" | "offline";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: TeamMemberStatus;
  avatar: string;
  notes?: string;
}

interface TeamMemberForm {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: TeamMemberStatus;
  notes: string;
}

const defaultMembers: TeamMember[] = [
  {
    id: "team-1",
    name: "Sarah Johnson",
    role: "Sales Lead",
    department: "Sales",
    email: "sarah.johnson@zerp.com",
    phone: "+91 98765 12001",
    status: "online",
    avatar: "SJ",
    notes: "Owns enterprise accounts.",
  },
  {
    id: "team-2",
    name: "Mike Chen",
    role: "Senior Developer",
    department: "Development",
    email: "mike.chen@zerp.com",
    phone: "+91 98765 12002",
    status: "online",
    avatar: "MC",
    notes: "Focuses on backend performance.",
  },
  {
    id: "team-3",
    name: "Emily Davis",
    role: "Product Designer",
    department: "Design",
    email: "emily.davis@zerp.com",
    phone: "+91 98765 12003",
    status: "busy",
    avatar: "ED",
    notes: "Drives UX improvements for mobile.",
  },
  {
    id: "team-4",
    name: "Alex Kumar",
    role: "Marketing Strategist",
    department: "Marketing",
    email: "alex.kumar@zerp.com",
    phone: "+91 98765 12004",
    status: "offline",
    avatar: "AK",
    notes: "Owns campaign planning.",
  },
  {
    id: "team-5",
    name: "Lisa Park",
    role: "Accounts Manager",
    department: "Accounts",
    email: "lisa.park@zerp.com",
    phone: "+91 98765 12005",
    status: "online",
    avatar: "LP",
    notes: "Handles monthly close reports.",
  },
  {
    id: "team-6",
    name: "Ryan Wilson",
    role: "Operations Analyst",
    department: "Operations",
    email: "ryan.wilson@zerp.com",
    phone: "+91 98765 12006",
    status: "away",
    avatar: "RW",
    notes: "Monitors logistics dashboards.",
  },
];

const initialFormState: TeamMemberForm = {
  name: "",
  role: "",
  department: "",
  email: "",
  phone: "",
  status: "online",
  notes: "",
};

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "TM";
}

export default function TeamSpaceDashboard() {
  const [activeTab, setActiveTab] = useState("meetings");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultMembers);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState<TeamMemberForm>(initialFormState);
  const { toast } = useToast();

  const kpiData = [
    {
      title: "Today's Meetings",
      value: "5",
      description: "2 upcoming, 3 completed",
      icon: Video,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Pending Calls",
      value: "8",
      description: "3 follow-ups required",
      icon: Phone,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Unread Messages",
      value: "24",
      description: "across 6 conversations",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Shared Files",
      value: "142",
      description: "12 added this week",
      icon: FolderOpen,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const upcomingActivities = [
    {
      type: "meeting",
      title: "Sprint Planning - Dev Team",
      time: "10:00 AM",
      participants: 8,
      status: "upcoming",
    },
    {
      type: "call",
      title: "Client Follow-up - Acme Corp",
      time: "11:30 AM",
      participants: 2,
      status: "scheduled",
    },
    {
      type: "meeting",
      title: "Design Review - Marketing",
      time: "2:00 PM",
      participants: 5,
      status: "upcoming",
    },
    {
      type: "call",
      title: "Vendor Discussion - Logistics",
      time: "3:30 PM",
      participants: 3,
      status: "follow-up",
    },
    {
      type: "meeting",
      title: "Weekly Sync - Operations",
      time: "4:30 PM",
      participants: 12,
      status: "upcoming",
    },
  ];

  const statusColors: Record<string, string> = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-amber-500",
    offline: "bg-slate-300",
  };

  const handleAddTeamMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields: Array<keyof TeamMemberForm> = ["name", "role", "department", "email", "phone"];
    const hasEmptyRequiredField = requiredFields.some((field) => !newMemberForm[field].trim());

    if (hasEmptyRequiredField) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, role, department, email, and phone.",
        variant: "destructive",
      });
      return;
    }

    if (!newMemberForm.email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const duplicateEmail = teamMembers.some(
      (member) => member.email.toLowerCase() === newMemberForm.email.trim().toLowerCase(),
    );

    if (duplicateEmail) {
      toast({
        title: "Team member already exists",
        description: "A team member with this email is already in Team Space.",
        variant: "destructive",
      });
      return;
    }

    const nextMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: newMemberForm.name.trim(),
      role: newMemberForm.role.trim(),
      department: newMemberForm.department.trim(),
      email: newMemberForm.email.trim().toLowerCase(),
      phone: newMemberForm.phone.trim(),
      status: newMemberForm.status,
      avatar: getInitials(newMemberForm.name),
      notes: newMemberForm.notes.trim(),
    };

    setTeamMembers((prevMembers) => [nextMember, ...prevMembers]);
    setNewMemberForm(initialFormState);
    setIsAddMemberOpen(false);

    toast({
      title: "Team member added",
      description: `${nextMember.name} has been added to Team Space successfully.`,
    });
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-3xl font-bold">Team Space</h1>
          </div>
          <p className="text-slate-600">
            Centralized collaboration workspace for all departments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("meetings")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            My Schedule
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveTab("meetings")}
          >
            <Video className="h-4 w-4 mr-2" />
            Quick Meeting
          </Button>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  Add Team Member
                </DialogTitle>
                <DialogDescription>
                  Enter member details to add them to Team Space collaboration.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddTeamMember} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="team-member-name">Full Name</Label>
                    <Input
                      id="team-member-name"
                      value={newMemberForm.name}
                      onChange={(event) =>
                        setNewMemberForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-member-role">Role</Label>
                    <Input
                      id="team-member-role"
                      value={newMemberForm.role}
                      onChange={(event) =>
                        setNewMemberForm((prev) => ({ ...prev, role: event.target.value }))
                      }
                      placeholder="e.g. Product Manager"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-member-department">Department</Label>
                    <Input
                      id="team-member-department"
                      value={newMemberForm.department}
                      onChange={(event) =>
                        setNewMemberForm((prev) => ({ ...prev, department: event.target.value }))
                      }
                      placeholder="e.g. Engineering"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-member-email">Email</Label>
                    <Input
                      id="team-member-email"
                      type="email"
                      value={newMemberForm.email}
                      onChange={(event) =>
                        setNewMemberForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="name@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-member-phone">Phone</Label>
                    <Input
                      id="team-member-phone"
                      value={newMemberForm.phone}
                      onChange={(event) =>
                        setNewMemberForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Availability Status</Label>
                    <Select
                      value={newMemberForm.status}
                      onValueChange={(value: TeamMemberStatus) =>
                        setNewMemberForm((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="away">Away</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="team-member-notes">Notes (Optional)</Label>
                    <Textarea
                      id="team-member-notes"
                      value={newMemberForm.notes}
                      onChange={(event) =>
                        setNewMemberForm((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      placeholder="Add any collaboration details or responsibilities"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddMemberOpen(false);
                      setNewMemberForm(initialFormState);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Save Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-slate-600">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview Row: Upcoming Activities + Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Today's Schedule
              </CardTitle>
              <Badge variant="secondary">{upcomingActivities.length} activities</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === "meeting"
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {activity.type === "meeting" ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Phone className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-slate-500">
                        {activity.time} · {activity.participants} participants
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      activity.status === "follow-up" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Members Online */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Team Members
              </CardTitle>
              <Badge variant="secondary">
                {teamMembers.filter((m) => m.status === "online").length} online
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {member.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${statusColors[member.status]}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                        <p className="text-xs text-slate-500">{member.department}</p>
                      </div>
                    </div>

                    <Badge variant="outline" className="capitalize text-[10px]">
                      {member.status}
                    </Badge>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-500 sm:grid-cols-2">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{member.role}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{member.department}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{member.phone}</span>
                    </div>
                    {member.notes ? (
                      <div className="flex items-start gap-1 sm:col-span-2">
                        <User className="mt-0.5 h-3.5 w-3.5 text-slate-400" />
                        <span className="line-clamp-2">{member.notes}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Calls
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Team Chats
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            File Sharing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meetings">
          <MeetingsModule />
        </TabsContent>

        <TabsContent value="calls">
          <CallsModule />
        </TabsContent>

        <TabsContent value="chats">
          <TeamChatsModule />
        </TabsContent>

        <TabsContent value="files">
          <FileSharingModule />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
