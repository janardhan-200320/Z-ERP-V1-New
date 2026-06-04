import { useEffect, useMemo, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  createCustomerCommunication,
  deleteCustomerCommunication,
  fetchCustomerCommunications,
  fetchCustomers,
  updateCustomerCommunication,
  uploadCustomerCommunicationAttachments,
  type CustomerCommunicationRecord,
  type CustomerRecord,
} from "@/lib/supabase-data";

type CommunicationView = {
  id: number;
  customerId: number;
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
  attachments?: number; //
};

export default function CommunicationLogModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [communications, setCommunications] = useState<CustomerCommunicationRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    contactPerson: "",
    type: "email",
    priority: "medium",
    subject: "",
    date: "",
    time: "",
    notes: "",
    outcome: "",
    followUpDate: "",
    status: "completed",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    let active = true;

    Promise.all([fetchCustomerCommunications(), fetchCustomers()])
      .then(([communicationRows, customerRows]) => {
        if (!active) return;
        setCommunications(communicationRows);
        setCustomers(customerRows);
      })
      .catch(() => {
        if (!active) return;
        setCommunications([]);
        setCustomers([]);
      })
      .finally(() => {
        if (!active) return;
      });

    return () => {
      active = false;
    };
  }, []);

  const customersById = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer]));
  }, [customers]);

  const communicationViews: CommunicationView[] = useMemo(() => {
    return communications.map((comm) => {
      const customer = customersById.get(comm.customer_id);
      return {
        id: comm.id,
        customerId: comm.customer_id,
        customer: customer?.company_name ?? "Unknown Customer",
        contactPerson: comm.contact_person ?? customer?.primary_contact ?? "",
        type: (comm.type || "email") as CommunicationView["type"],
        subject: comm.subject,
        date: comm.date,
        time: comm.time ?? "",
        priority: (comm.priority || "medium") as CommunicationView["priority"],
        followUpDate: comm.follow_up_date ?? undefined,
        status: (comm.status || "completed") as CommunicationView["status"],
        notes: comm.notes ?? undefined,
        outcome: comm.outcome ?? undefined,
        attachments: comm.attachments ?? undefined,
      };
    });
  }, [communications, customersById]);

  const filteredCommunications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return communicationViews
      .filter((comm) => {
        if (typeFilter !== "all" && comm.type !== typeFilter) return false;
        if (!query) return true;
        return (
          comm.customer.toLowerCase().includes(query) ||
          comm.contactPerson.toLowerCase().includes(query) ||
          comm.subject.toLowerCase().includes(query) ||
          (comm.notes ?? "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          const order = { high: 3, medium: 2, low: 1 };
          return order[b.priority] - order[a.priority];
        }
        const aDate = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const bDate = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
        if (sortBy === "date-asc") return aDate - bDate;
        return bDate - aDate;
      });
  }, [communicationViews, searchQuery, sortBy, typeFilter]);

  const handleSaveCommunication = async () => {
    if (!formData.customerId || !formData.subject.trim() || !formData.date) return;
    try {
      const created = await createCustomerCommunication({
        customer_id: Number(formData.customerId),
        contact_person: formData.contactPerson.trim() || null,
        type: formData.type,
        subject: formData.subject.trim(),
        date: formData.date,
        time: formData.time || null,
        priority: formData.priority,
        follow_up_date: formData.followUpDate || null,
        status: formData.status,
        notes: formData.notes.trim() || null,
        outcome: formData.outcome.trim() || null,
      });
      let updatedRecord = created;

      if (selectedFiles.length > 0) {
        const attachments = await uploadCustomerCommunicationAttachments(created.id, selectedFiles);
        updatedRecord = await updateCustomerCommunication(created.id, {
          attachments: attachments.length,
          attachment_files: attachments,
        });
      }

      setCommunications((prev) => [updatedRecord, ...prev]);
      toast({
        title: "Communication logged",
        description: "Your communication has been saved.",
      });
      setLogDialogOpen(false);
      setSelectedFiles([]);
      setFormData({
        customerId: "",
        contactPerson: "",
        type: "email",
        priority: "medium",
        subject: "",
        date: "",
        time: "",
        notes: "",
        outcome: "",
        followUpDate: "",
        status: "completed",
      });
    } catch (error) {
      toast({
        title: "Failed to save communication",
        description: error instanceof Error ? error.message : "Unable to save communication.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCommunication = async (id: number) => {
    try {
      await deleteCustomerCommunication(id);
      setCommunications((prev) => prev.filter((comm) => comm.id !== id));
      toast({
        title: "Communication deleted",
        description: "The entry has been removed.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete communication",
        description: error instanceof Error ? error.message : "Unable to delete communication.",
        variant: "destructive",
      });
    }
  };

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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
              <Select value={sortBy} onValueChange={setSortBy}>
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
            <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
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
                      <Select value={formData.customerId} onValueChange={(value) => setFormData((prev) => ({ ...prev, customerId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={String(customer.id)}>
                              {customer.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                        placeholder="Enter contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
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
                      <Select value={formData.priority} onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}>
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
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter communication subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes *</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add communication notes..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outcome">Outcome</Label>
                    <Textarea
                      id="outcome"
                      value={formData.outcome}
                      onChange={(e) => setFormData((prev) => ({ ...prev, outcome: e.target.value }))}
                      placeholder="What was the result of this communication?"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors cursor-pointer">
                      <Paperclip className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">
                        Drag and drop files here or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        className="mt-4 text-sm"
                        onChange={(event) => {
                          const files = Array.from(event.target.files || []);
                          setSelectedFiles(files);
                        }}
                      />
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 text-xs text-slate-500">
                          {selectedFiles.length} file(s) selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLogDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveCommunication}>Save Communication</Button>
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
              {filteredCommunications.map((comm) => {
                const TypeIcon = typeConfig[comm.type].icon;
                const timeDisplay = comm.time
                  ? new Date(`1970-01-01T${comm.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "—";
                return (
                  <TableRow key={comm.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-teal-600" />
                        <div>
                          <div className="font-medium">{comm.customer}</div>
                          <div className="text-xs text-slate-500">COM-{comm.id}</div>
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
                        <div className="text-xs text-slate-500">{timeDisplay}</div>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCommunication(comm.id)}
                        >
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
