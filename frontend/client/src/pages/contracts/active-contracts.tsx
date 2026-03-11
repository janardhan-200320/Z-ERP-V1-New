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
import { Search, Filter, Plus, Building, DollarSign, Calendar, User, Eye, Edit, Trash2, Download, FileText, Paperclip } from "lucide-react";

type Contract = {
  id: string;
  client: string;
  contractTitle: string;
  startDate: string;
  endDate: string;
  value: string;
  paymentTerms: string;
  projectManager: string;
  status: "active" | "pending" | "expired";
  description?: string;
  termsAndConditions?: string;
  attachments?: number;
};

export default function ActiveContractsModule() {
  const [searchQuery, setSearchQuery] = useState("");

  const contracts: Contract[] = [
    {
      id: "CNT001",
      client: "Tech Innovations Ltd",
      contractTitle: "Enterprise Software Development",
      startDate: "2025-06-01",
      endDate: "2026-05-31",
      value: "$450,000",
      paymentTerms: "Net 30",
      projectManager: "Sarah Johnson",
      status: "active",
      attachments: 5
    },
    {
      id: "CNT002",
      client: "Global Retail Corp",
      contractTitle: "E-Commerce Platform Upgrade",
      startDate: "2025-09-15",
      endDate: "2026-09-14",
      value: "$320,000",
      paymentTerms: "Net 45",
      projectManager: "Michael Chen",
      status: "active",
      attachments: 3
    },
    {
      id: "CNT003",
      client: "Healthcare Systems Inc",
      contractTitle: "Medical Records Management System",
      startDate: "2025-03-01",
      endDate: "2027-02-28",
      value: "$680,000",
      paymentTerms: "Net 30",
      projectManager: "David Kim",
      status: "active",
      attachments: 8
    },
    {
      id: "CNT004",
      client: "Financial Services Group",
      contractTitle: "Banking Application Modernization",
      startDate: "2025-11-01",
      endDate: "2026-10-31",
      value: "$520,000",
      paymentTerms: "Net 60",
      projectManager: "Emily Watson",
      status: "active",
      attachments: 6
    },
    {
      id: "CNT005",
      client: "Manufacturing Solutions",
      contractTitle: "Inventory Management Portal",
      startDate: "2025-01-15",
      endDate: "2026-01-14",
      value: "$185,000",
      paymentTerms: "Net 30",
      projectManager: "Robert Taylor",
      status: "pending",
      attachments: 2
    },
    {
      id: "CNT006",
      client: "Education Platform Co",
      contractTitle: "Learning Management System",
      startDate: "2024-08-01",
      endDate: "2025-07-31",
      value: "$410,000",
      paymentTerms: "Net 30",
      projectManager: "Jessica Martinez",
      status: "expired",
      attachments: 4
    }
  ];

  const statusConfig = {
    active: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    expired: "bg-red-100 text-red-700 border-red-200"
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
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All PMs</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="michael">Michael Chen</SelectItem>
                  <SelectItem value="david">David Kim</SelectItem>
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
                  New Contract
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Contract</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Contract Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Contract Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="contractTitle">Contract Title *</Label>
                        <Input id="contractTitle" placeholder="Enter contract title" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client">Client *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tech">Tech Innovations Ltd</SelectItem>
                            <SelectItem value="retail">Global Retail Corp</SelectItem>
                            <SelectItem value="health">Healthcare Systems Inc</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractId">Contract ID *</Label>
                        <Input id="contractId" placeholder="CNT-" />
                      </div>
                    </div>
                  </div>

                  {/* Dates & Value */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Dates & Value</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input id="startDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input id="endDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractValue">Contract Value *</Label>
                        <Input id="contractValue" placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Payment Terms *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="net15">Net 15</SelectItem>
                            <SelectItem value="net30">Net 30</SelectItem>
                            <SelectItem value="net45">Net 45</SelectItem>
                            <SelectItem value="net60">Net 60</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Project Manager */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Project Manager</h3>
                    <div className="space-y-2">
                      <Label htmlFor="pm">Assign Project Manager *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarah">Sarah Johnson</SelectItem>
                          <SelectItem value="michael">Michael Chen</SelectItem>
                          <SelectItem value="david">David Kim</SelectItem>
                          <SelectItem value="emily">Emily Watson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description & T&C */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Description & Terms</h3>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Enter contract description..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea id="terms" placeholder="Enter terms and conditions..." rows={4} />
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Attachments</h3>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                      <Paperclip className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">
                        Drag and drop contract documents here or click to browse
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supported: PDF, DOC, DOCX (Max 20MB)
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Contract</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contract Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Project Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium">{contract.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      {contract.client}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{contract.contractTitle}</div>
                      {contract.attachments && contract.attachments > 0 && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Paperclip className="h-3 w-3" />
                          {contract.attachments} files
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {new Date(contract.startDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {new Date(contract.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium text-green-700">
                      <DollarSign className="h-4 w-4" />
                      {contract.value}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {contract.paymentTerms}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      {contract.projectManager}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[contract.status]}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
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
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
