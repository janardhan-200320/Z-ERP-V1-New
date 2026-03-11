import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Video,
  Phone,
  MessageSquare,
  FolderOpen,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import MeetingsModule from "./meetings";
import CallsModule from "./calls";
import TeamChatsModule from "./team-chats";
import FileSharingModule from "./file-sharing";

export default function TeamSpaceDashboard() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("meetings");

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

  const teamMembers = [
    { name: "Sarah Johnson", department: "Sales", status: "online", avatar: "SJ" },
    { name: "Mike Chen", department: "Development", status: "online", avatar: "MC" },
    { name: "Emily Davis", department: "Design", status: "busy", avatar: "ED" },
    { name: "Alex Kumar", department: "Marketing", status: "offline", avatar: "AK" },
    { name: "Lisa Park", department: "Accounts", status: "online", avatar: "LP" },
    { name: "Ryan Wilson", department: "Operations", status: "away", avatar: "RW" },
  ];

  const statusColors: Record<string, string> = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-amber-500",
    offline: "bg-slate-300",
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-3xl font-bold">Team Space</h1>
          </div>
          <p className="text-slate-600">
            Centralized collaboration workspace for all departments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            My Schedule
          </Button>
          <Button size="sm">
            <Video className="h-4 w-4 mr-2" />
            Quick Meeting
          </Button>
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
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                        {member.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${statusColors[member.status]}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.department}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
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
