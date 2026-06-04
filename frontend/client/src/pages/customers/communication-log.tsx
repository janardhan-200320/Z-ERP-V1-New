import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Plus, Mail, Phone, Video, Calendar, MessageSquare, Eye, Edit, Trash2, Building, User, Paperclip, AlertCircle } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

type Communication = {
  id: number;
  customerId: number | null;
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
  attachmentFiles?: CustomerCommunicationRecord["attachment_files"];
};

export default function CommunicationLogModule() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [newCommunication, setNewCommunication] = useState({
    customerId: "",
    contactPerson: "",
    type: "",
    subject: "",
    date: "",
    time: "",
    priority: "",
    followUpDate: "",
    status: "completed",
    notes: "",
    outcome: "",
  });

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

  const customersById = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer.company_name]));
  }, [customers]);

  const filteredCommunications = useMemo(() => {
    return communications
      .filter((comm) => {
        if (typeFilter !== "all" && comm.type !== typeFilter) return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          comm.customer.toLowerCase().includes(query) ||
          comm.contactPerson.toLowerCase().includes(query) ||
          comm.subject.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          const order = { high: 0, medium: 1, low: 2 } as Record<string, number>;
          return order[a.priority] - order[b.priority];
        }

        const aDate = `${a.date} ${a.time}`;
        const bDate = `${b.date} ${b.time}`;
        if (sortBy === "date-asc") return aDate.localeCompare(bDate);
        return bDate.localeCompare(aDate);
      });
  }, [communications, searchQuery, sortBy, typeFilter]);

  const loadCommunicationData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [customersData, communicationsData] = await Promise.all([
        fetchCustomers(),
        fetchCustomerCommunications(),
      ]);
      setCustomers(customersData);
      const mapped = communicationsData.map((record) => ({
        id: record.id,
        customerId: record.customer_id ?? null,
        customer: customersById.get(record.customer_id ?? -1) ||
          (record.customer_id ? `Customer #${record.customer_id}` : "Unknown"),
        contactPerson: record.contact_person || "",
        type: (record.type || "email") as Communication["type"],
        subject: record.subject || "",
        date: record.date || "",
        time: record.time || "",
        priority: (record.priority || "medium") as Communication["priority"],
        followUpDate: record.follow_up_date || undefined,
        status: (record.status || "completed") as Communication["status"],
        notes: record.notes || undefined,
        outcome: record.outcome || undefined,
        attachments: record.attachments ?? 0,
        attachmentFiles: record.attachment_files ?? undefined,
      }));
      setCommunications(mapped);
    } catch (error: any) {
      setLoadError(error?.message || "Failed to load communications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunicationData();
  }, []);

  useEffect(() => {
    if (customers.length === 0 || communications.length === 0) return;
    setCommunications((prev) =>
      prev.map((comm) => ({
        ...comm,
        customer: comm.customerId
          ? customersById.get(comm.customerId) || comm.customer
          : comm.customer,
      }))
    );
  }, [customersById]);

  const handleCreateCommunication = async () => {
    if (!newCommunication.customerId || !newCommunication.contactPerson.trim() || !newCommunication.type ||
        !newCommunication.subject.trim() || !newCommunication.date || !newCommunication.time ||
        !newCommunication.priority || !newCommunication.notes.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: Partial<CustomerCommunicationRecord> = {
        customer_id: Number(newCommunication.customerId),
        contact_person: newCommunication.contactPerson.trim(),
        type: newCommunication.type,
        subject: newCommunication.subject.trim(),
        date: newCommunication.date,
        time: newCommunication.time,
        priority: newCommunication.priority,
        follow_up_date: newCommunication.followUpDate || null,
        status: newCommunication.status,
        notes: newCommunication.notes.trim(),
        outcome: newCommunication.outcome?.trim() || null,
        attachments: 0,
        attachment_files: [],
      };

      const created = await createCustomerCommunication(payload);
      let updatedRecord = created;

      if (attachments.length > 0) {
        const uploaded = await uploadCustomerCommunicationAttachments(created.id, attachments);
        updatedRecord = await updateCustomerCommunication(created.id, {
          attachments: uploaded.length,
          attachment_files: uploaded,
        });
      }

      const mapped: Communication = {
        id: updatedRecord.id,
        customerId: updatedRecord.customer_id ?? null,
        customer: customersById.get(updatedRecord.customer_id ?? -1) ||
          (updatedRecord.customer_id ? `Customer #${updatedRecord.customer_id}` : "Unknown"),
        contactPerson: updatedRecord.contact_person || "",
        type: (updatedRecord.type || "email") as Communication["type"],
        subject: updatedRecord.subject || "",
        date: updatedRecord.date || "",
        time: updatedRecord.time || "",
        priority: (updatedRecord.priority || "medium") as Communication["priority"],
        followUpDate: updatedRecord.follow_up_date || undefined,
        status: (updatedRecord.status || "completed") as Communication["status"],
        notes: updatedRecord.notes || undefined,
        outcome: updatedRecord.outcome || undefined,
        attachments: updatedRecord.attachments ?? 0,
        attachmentFiles: updatedRecord.attachment_files ?? undefined,
      };

      setCommunications((prev) => [mapped, ...prev]);
      setIsCreateOpen(false);
      setAttachments([]);
      setNewCommunication({
        customerId: "",
        contactPerson: "",
        type: "",
        subject: "",
        date: "",
        time: "",
        priority: "",
        followUpDate: "",
        status: "completed",
        notes: "",
        outcome: "",
      });

      toast({
        title: "Communication saved",
        description: "Your communication log has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error?.message || "Unable to save communication.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCommunication = async (comm: Communication) => {
    if (!window.confirm("Delete this communication log?")) return;
    try {
      await deleteCustomerCommunication(comm.id);
      setCommunications((prev) => prev.filter((entry) => entry.id !== comm.id));
      toast({ title: "Deleted", description: "Communication removed." });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Unable to delete communication.",
        variant: "destructive",
      });
    }
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
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Communication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Log Communication</DialogTitle>
                  <DialogDescription>
                    Capture customer conversations and follow-ups in one place.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer *</Label>
                      <Select
                        value={newCommunication.customerId}
                        onValueChange={(value) =>
                          setNewCommunication((prev) => ({ ...prev, customerId: value }))
                        }
                      >
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
                        placeholder="Enter contact name"
                        value={newCommunication.contactPerson}
                        onChange={(e) =>
                          setNewCommunication((prev) => ({ ...prev, contactPerson: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={newCommunication.type}
                        onValueChange={(value) =>
                          setNewCommunication((prev) => ({ ...prev, type: value }))
                        }
                      >
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
                      <Select
                        value={newCommunication.priority}
                        onValueChange={(value) =>
                          setNewCommunication((prev) => ({ ...prev, priority: value }))
                        }
                      >
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
                        placeholder="Enter communication subject"
                        value={newCommunication.subject}
                        onChange={(e) =>
                          setNewCommunication((prev) => ({ ...prev, subject: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newCommunication.date}
                        onChange={(e) =>
                          setNewCommunication((prev) => ({ ...prev, date: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newCommunication.time}
                        onChange={(e) =>
                          setNewCommunication((prev) => ({ ...prev, time: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes *</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add communication notes..."
                      rows={3}
                      value={newCommunication.notes}
                      onChange={(e) =>
                        setNewCommunication((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outcome">Outcome</Label>
                    <Textarea
                      id="outcome"
                      placeholder="What was the result of this communication?"
                      rows={2}
                      value={newCommunication.outcome}
                      onChange={(e) =>
                        setNewCommunication((prev) => ({ ...prev, outcome: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={newCommunication.followUpDate}
                      onChange={(e) =>
                        setNewCommunication((prev) => ({ ...prev, followUpDate: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
                      <Paperclip className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">Upload communication files</p>
                      <Input
                        id="communicationFiles"
                        type="file"
                        multiple
                        className="mt-3"
                        onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                      />
                      {attachments.length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">{attachments.length} file(s) selected</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateCommunication}>Save Communication</Button>
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
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-slate-500">
                    Loading communications...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && loadError && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-red-600">
                    {loadError}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !loadError && filteredCommunications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-slate-500">
                    No communications found.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !loadError && filteredCommunications.map((comm) => {
                const TypeIcon = typeConfig[comm.type].icon;
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
                        <Button variant="ghost" size="sm" disabled>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCommunication(comm)}
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
