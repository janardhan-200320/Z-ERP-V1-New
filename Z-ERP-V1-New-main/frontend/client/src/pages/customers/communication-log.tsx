import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Plus, Mail, Phone, Video, Calendar, MessageSquare, Eye, Edit, Trash2, Building, User, Paperclip, AlertCircle } from "lucide-react";

type Communication = {
  id: string;
  customer: string;
  contactPerson: string;
  type: "email" | "phone" | "meeting" | "whatsapp" | "video";
  subject: string;
  date: string;
  time: string;
  priority: "high" | "medium" | "low";
  followUpDate?: string;
  status: "completed" | "pending" | "scheduled";
  notes?: string;
  outcome?: string;
  attachments?: number;
};

export default function CommunicationLogModule() {
  const [searchQuery, setSearchQuery] = useState("");

  const communications: Communication[] = [
    {
      id: "COM001",
      customer: "Tech Innovations Ltd",
      contactPerson: "John Anderson",
      type: "email",
      subject: "Q1 Project Requirements Discussion",
      date: "2026-01-15",
      time: "10:00 AM",
      priority: "high",
      followUpDate: "2026-01-20",
      status: "completed",
      attachments: 3
    },
    {
      id: "COM002",
      customer: "Global Retail Corp",
      contactPerson: "Sarah Mitchell",
      type: "phone",
      subject: "Budget Approval Call",
      date: "2026-01-15",
      time: "02:30 PM",
      priority: "high",
      followUpDate: "2026-01-18",
      status: "completed",
      attachments: 0
    },
    {
      id: "COM003",
      customer: "Healthcare Systems Inc",
      contactPerson: "Michael Roberts",
      type: "meeting",
      subject: "Contract Renewal Discussion",
      date: "2026-01-16",
      time: "11:00 AM",
      priority: "medium",
      status: "scheduled",
      attachments: 2
    },
    {
      id: "COM004",
      customer: "Financial Services Group",
      contactPerson: "Emily Thompson",
      type: "video",
      subject: "Product Demo Session",
      date: "2026-01-14",
      time: "03:00 PM",
      priority: "medium",
      followUpDate: "2026-01-22",
      status: "completed",
      attachments: 1
    },
    {
      id: "COM005",
      customer: "Education Platform Co",
      contactPerson: "Jessica Lee",
      type: "whatsapp",
      subject: "Quick Update on Feature Request",
      date: "2026-01-15",
      time: "09:15 AM",
      priority: "low",
      status: "pending",
      attachments: 0
    },
    {
      id: "COM006",
      customer: "Manufacturing Solutions",
      contactPerson: "David Martinez",
      type: "email",
      subject: "Invoice Payment Reminder",
      date: "2026-01-13",
      time: "04:00 PM",
      priority: "high",
      followUpDate: "2026-01-17",
      status: "pending",
      attachments: 1
    }
  ];

  const typeConfig = {
    email: { icon: Mail, label: "Email", color: "bg-blue-100 text-blue-700" },
    phone: { icon: Phone, label: "Phone Call", color: "bg-green-100 text-green-700" },
    meeting: { icon: Calendar, label: "Meeting", color: "bg-purple-100 text-purple-700" },
    whatsapp: { icon: MessageSquare, label: "WhatsApp", color: "bg-teal-100 text-teal-700" },
    video: { icon: Video, label: "Video Call", color: "bg-orange-100 text-orange-700" }
  };

  const priorityConfig = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-orange-100 text-orange-700 border-orange-200",
    low: "bg-slate-100 text-slate-700 border-slate-200"
  };

  const statusConfig = {
    completed: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    scheduled: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search communications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Communication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Log Communication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Tech Innovations Ltd</SelectItem>
                          <SelectItem value="retail">Global Retail Corp</SelectItem>
                          <SelectItem value="health">Healthcare Systems Inc</SelectItem>
                          <SelectItem value="finance">Financial Services Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input id="contactPerson" placeholder="Enter contact name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="video">Video Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" placeholder="Enter communication subject" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input id="time" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes *</Label>
                    <Textarea id="notes" placeholder="Add communication notes..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outcome">Outcome</Label>
                    <Textarea id="outcome" placeholder="What was the result of this communication?" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input id="followUpDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors cursor-pointer">
                      <Paperclip className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">
                        Drag and drop files here or click to browse
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Communication</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Communication Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Follow-up Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communications.map((comm) => {
                const TypeIcon = typeConfig[comm.type].icon;
                return (
                  <TableRow key={comm.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-teal-600" />
                        <div>
                          <div className="font-medium">{comm.customer}</div>
                          <div className="text-xs text-slate-500">{comm.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        {comm.contactPerson}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={typeConfig[comm.type].color}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeConfig[comm.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{comm.subject}</div>
                        {comm.attachments && comm.attachments > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Paperclip className="h-3 w-3" />
                            {comm.attachments} files
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(comm.date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{comm.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityConfig[comm.priority]}>
                        {comm.priority === "high" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {comm.priority.charAt(0).toUpperCase() + comm.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {comm.followUpDate ? (
                        <div className="text-sm">
                          {new Date(comm.followUpDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[comm.status]}>
                        {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
