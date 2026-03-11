import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Filter, Download, Upload, Star, Phone, Mail, MapPin, FileText, AlertCircle, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import StatsCard from '@/components/StatsCard';

interface Vendor {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  serviceType: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  outstanding: number;
  status: 'Active' | 'Inactive';
}

interface VendorBill {
  id: string;
  vendorName: string;
  billNumber: string;
  amount: number;
  billDate: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface VendorDocument {
  id: string;
  name: string;
  type: string;
  vendorName: string;
  uploadedDate: string;
  version: string;
}

export default function VendorsLanding() {
  const [activeTab, setActiveTab] = useState('list');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [showVendorDetailsModal, setShowVendorDetailsModal] = useState(false);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showBillDetailsModal, setShowBillDetailsModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billStatusFilter, setBillStatusFilter] = useState('all');
  const [docTypeFilter, setDocTypeFilter] = useState('all');

  // Mock data
  const vendors: Vendor[] = [
    {
      id: '1',
      name: 'Acme Supplies Co.',
      avatar: '',
      location: 'New York, NY',
      serviceType: 'Product Supplier',
      email: 'contact@acme.com',
      phone: '+1 555-0101',
      category: 'Office Supplies',
      rating: 4.5,
      outstanding: 12500,
      status: 'Active',
    },
    {
      id: '2',
      name: 'Tech Solutions Ltd.',
      avatar: '',
      location: 'San Francisco, CA',
      serviceType: 'Service Provider',
      email: 'info@techsol.com',
      phone: '+1 555-0202',
      category: 'IT Services',
      rating: 5,
      outstanding: 0,
      status: 'Active',
    },
    {
      id: '3',
      name: 'Global Logistics Inc.',
      avatar: '',
      location: 'Chicago, IL',
      serviceType: 'Service Provider',
      email: 'hello@globallog.com',
      phone: '+1 555-0303',
      category: 'Logistics',
      rating: 4,
      outstanding: 8750,
      status: 'Active',
    },
    {
      id: '4',
      name: 'Prime Manufacturing',
      avatar: '',
      location: 'Houston, TX',
      serviceType: 'Product Supplier',
      email: 'sales@primemfg.com',
      phone: '+1 555-0404',
      category: 'Manufacturing',
      rating: 3.5,
      outstanding: 25000,
      status: 'Inactive',
    },
  ];

  const bills: VendorBill[] = [
    {
      id: '1',
      vendorName: 'Acme Supplies Co.',
      billNumber: 'INV-2026-001',
      amount: 12500,
      billDate: '2026-01-05',
      dueDate: '2026-02-05',
      status: 'Pending',
    },
    {
      id: '2',
      vendorName: 'Tech Solutions Ltd.',
      billNumber: 'INV-2026-002',
      amount: 25000,
      billDate: '2025-12-20',
      dueDate: '2026-01-20',
      status: 'Paid',
    },
    {
      id: '3',
      vendorName: 'Global Logistics Inc.',
      billNumber: 'INV-2026-003',
      amount: 8750,
      billDate: '2025-12-01',
      dueDate: '2025-12-31',
      status: 'Overdue',
    },
    {
      id: '4',
      vendorName: 'Prime Manufacturing',
      billNumber: 'INV-2026-004',
      amount: 25000,
      billDate: '2026-01-10',
      dueDate: '2026-01-18',
      status: 'Pending',
    },
  ];

  const documents: VendorDocument[] = [
    {
      id: '1',
      name: 'Service Agreement 2026',
      type: 'Contract',
      vendorName: 'Acme Supplies Co.',
      uploadedDate: '2026-01-01',
      version: 'v2.0',
    },
    {
      id: '2',
      name: 'W-9 Form',
      type: 'Tax Document',
      vendorName: 'Tech Solutions Ltd.',
      uploadedDate: '2025-12-15',
      version: 'v1.0',
    },
    {
      id: '3',
      name: 'Insurance Certificate',
      type: 'Insurance',
      vendorName: 'Global Logistics Inc.',
      uploadedDate: '2025-11-20',
      version: 'v1.2',
    },
    {
      id: '4',
      name: 'Purchase Order Template',
      type: 'PO',
      vendorName: 'Acme Supplies Co.',
      uploadedDate: '2026-01-03',
      version: 'v1.0',
    },
    {
      id: '5',
      name: 'License Agreement',
      type: 'License',
      vendorName: 'Tech Solutions Ltd.',
      uploadedDate: '2025-12-20',
      version: 'v3.1',
    },
  ];

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === 'Active').length;
  const totalOutstanding = vendors.reduce((sum, v) => sum + v.outstanding, 0);
  const totalPaid = bills
    .filter((b) => b.status === 'Paid')
    .reduce((sum, b) => sum + b.amount, 0);

  // Filtered data
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phone.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredBills = bills.filter((bill) => {
    return billStatusFilter === 'all' || bill.status === billStatusFilter;
  });

  const filteredDocuments = documents.filter((doc) => {
    return docTypeFilter === 'all' || doc.type === docTypeFilter;
  });

  const getOutstandingAmountColor = (amount: number) => {
    if (amount === 0) return 'text-green-600';
    if (amount > 20000) return 'text-red-600';
    if (amount > 10000) return 'text-orange-600';
    return 'text-amber-600';
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Paid':
        return 'default';
      case 'Inactive':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Overdue':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const VendorFormModal = ({
    open,
    onClose,
    vendor,
  }: {
    open: boolean;
    onClose: () => void;
    vendor?: Vendor | null;
  }) => (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {vendor
              ? 'Update vendor information below'
              : 'Enter vendor details to add a new supplier'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Vendor Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Vendor Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name *</Label>
                <Input
                  id="vendorName"
                  placeholder="Enter vendor name"
                  defaultValue={vendor?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select defaultValue={vendor?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select defaultValue={vendor?.serviceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Supplier">Product Supplier</SelectItem>
                  <SelectItem value="Service Provider">Service Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contact Details</h3>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                placeholder="Full name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vendor@email.com"
                  defaultValue={vendor?.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="+1 555-0000"
                  defaultValue={vendor?.phone}
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Additional Details</h3>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Textarea
                id="location"
                placeholder="Enter full address"
                defaultValue={vendor?.location}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select defaultValue={vendor?.rating.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars - Excellent</SelectItem>
                    <SelectItem value="4">4 Stars - Good</SelectItem>
                    <SelectItem value="3">3 Stars - Average</SelectItem>
                    <SelectItem value="2">2 Stars - Below Average</SelectItem>
                    <SelectItem value="1">1 Star - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select defaultValue={vendor?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the vendor"
                rows={3}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            {vendor ? 'Update Vendor' : 'Save Vendor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const VendorDetailsModal = ({ vendor }: { vendor: Vendor | null }) => {
    if (!vendor) return null;

    const vendorBills = bills.filter((b) => b.vendorName === vendor.name);
    const vendorDocs = documents.filter((d) => d.vendorName === vendor.name);
    const totalPaidToVendor = vendorBills
      .filter((b) => b.status === 'Paid')
      .reduce((sum, b) => sum + b.amount, 0);

    return (
      <Dialog open={showVendorDetailsModal} onOpenChange={setShowVendorDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>Complete information about {vendor.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Vendor Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vendor Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={vendor.avatar} />
                    <AvatarFallback className="text-lg">
                      {vendor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{vendor.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge>{vendor.category}</Badge>
                      <Badge variant="outline">{vendor.serviceType}</Badge>
                      <Badge variant={getStatusBadgeVariant(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(vendor.rating)}
                    <p className="text-sm text-muted-foreground mt-1">
                      {vendor.rating.toFixed(1)} / 5.0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    <p className="font-medium">{vendor.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </p>
                    <p className="font-medium">{vendor.phone}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </p>
                  <p className="font-medium">{vendor.location}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${totalPaidToVendor.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Outstanding Amount</p>
                    <p className={`text-2xl font-bold ${getOutstandingAmountColor(vendor.outstanding)}`}>
                      ${vendor.outstanding.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linked Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Linked Documents ({vendorDocs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {vendorDocs.length > 0 ? (
                  <div className="space-y-2">
                    {vendorDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.type}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents linked to this vendor
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowVendorDetailsModal(false);
                setShowEditVendorModal(true);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Edit Vendor
            </Button>
            <Button onClick={() => setShowVendorDetailsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const AddBillModal = () => (
    <Dialog open={showAddBillModal} onOpenChange={setShowAddBillModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Bill</DialogTitle>
          <DialogDescription>Enter bill details for payment tracking</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="billVendor">Vendor *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billNumber">Bill Number *</Label>
            <Input id="billNumber" placeholder="INV-2026-XXX" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input id="amount" type="number" placeholder="0.00" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billDate">Bill Date *</Label>
              <Input id="billDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billNotes">Notes</Label>
            <Textarea id="billNotes" placeholder="Additional notes" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billAttachment">Attachment (PDF/Image)</Label>
            <Input id="billAttachment" type="file" accept=".pdf,.jpg,.jpeg,.png" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddBillModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowAddBillModal(false)}>Save Bill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const BillDetailsModal = ({ bill }: { bill: VendorBill | null }) => {
    if (!bill) return null;

    return (
      <Dialog open={showBillDetailsModal} onOpenChange={setShowBillDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>Complete information for {bill.billNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Vendor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vendor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-lg">{bill.vendorName}</p>
              </CardContent>
            </Card>

            {/* Bill Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bill Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bill Number</p>
                    <p className="font-semibold font-mono">{bill.billNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadgeVariant(bill.status)}>{bill.status}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Bill Date
                    </p>
                    <p className="font-medium">{bill.billDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </p>
                    <p className="font-medium">{bill.dueDate}</p>
                    {isDueSoon(bill.dueDate) && bill.status !== 'Paid' && (
                      <Badge variant="outline" className="mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Due Soon
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amount Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Amount Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-3xl font-bold">${bill.amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Attached Document */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attached Bill Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{bill.billNumber}.pdf</p>
                      <p className="text-sm text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            {bill.status !== 'Paid' && (
              <Button variant="default">
                Mark as Paid
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowBillDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const UploadDocumentModal = () => (
    <Dialog open={showUploadDocModal} onOpenChange={setShowUploadDocModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Upload vendor-related documents</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="docVendor">Vendor *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="docType">Document Type *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="PO">Purchase Order</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="License">License</SelectItem>
                <SelectItem value="Tax Document">Tax Document</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="docFile">File *</Label>
            <Input id="docFile" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="docNotes">Notes</Label>
            <Textarea id="docNotes" placeholder="Additional notes about this document" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowUploadDocModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowUploadDocModal(false)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">
            Manage suppliers, payments, and documents
          </p>
        </div>
        <Button onClick={() => setShowAddVendorModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Vendors"
          value={totalVendors.toString()}
          icon={Users}
        />
        <StatsCard
          title="Active Vendors"
          value={activeVendors.toString()}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Outstanding"
          value={`$${totalOutstanding.toLocaleString()}`}
          icon={AlertCircle}
        />
        <StatsCard
          title="Total Paid"
          value={`$${totalPaid.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Vendor List</TabsTrigger>
          <TabsTrigger value="payments">Vendor Payments</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        {/* TAB 1: VENDOR LIST */}
        <TabsContent value="list" className="space-y-6">
          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Contact Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id} className="hover:bg-accent cursor-pointer">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={vendor.avatar} />
                              <AvatarFallback>
                                {vendor.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{vendor.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {vendor.location}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vendor.serviceType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {vendor.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {vendor.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{vendor.category}</Badge>
                        </TableCell>
                        <TableCell>{renderStars(vendor.rating)}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getOutstandingAmountColor(vendor.outstanding)}`}>
                            ${vendor.outstanding.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(vendor.status)}>
                            {vendor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setShowVendorDetailsModal(true);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setShowEditVendorModal(true);
                                }}
                              >
                                Edit Vendor
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No vendors found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: VENDOR PAYMENTS */}
        <TabsContent value="payments" className="space-y-6">
          {/* Payment Summary Cards with Alert Style */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Outstanding Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">
                    ${totalOutstanding.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {bills.filter((b) => b.status !== 'Paid').length} pending bills
                </p>
              </CardContent>
            </Card>
            <StatsCard
              title="Total Paid"
              value={`$${totalPaid.toLocaleString()}`}
              icon={DollarSign}
            />
            <StatsCard
              title="Total Bills"
              value={bills.length.toString()}
              icon={FileText}
            />
          </div>

          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <Select value={billStatusFilter} onValueChange={setBillStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input type="date" className="w-[150px]" placeholder="From" />
                  <Input type="date" className="w-[150px]" placeholder="To" />
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className="ml-auto">
                  <Button onClick={() => setShowAddBillModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bill
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bills Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Bills ({filteredBills.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bill Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow
                      key={bill.id}
                      className={`hover:bg-accent ${
                        bill.status === 'Overdue' ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <TableCell className="font-medium">{bill.vendorName}</TableCell>
                      <TableCell className="font-mono text-sm">{bill.billNumber}</TableCell>
                      <TableCell className="font-semibold">
                        ${bill.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{bill.billDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {bill.dueDate}
                          {isDueSoon(bill.dueDate) && bill.status !== 'Paid' && (
                            <Badge variant="outline" className="text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Due Soon
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(bill.status)}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowBillDetailsModal(true);
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            {bill.status !== 'Paid' && (
                              <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: DOCUMENTATION */}
        <TabsContent value="documentation" className="space-y-6">
          {/* Document Categories Overview */}
          <div className="grid gap-4 md:grid-cols-5">
            {['Contract', 'PO', 'Invoice', 'License', 'Tax Document'].map((type) => {
              const count = documents.filter((d) => d.type === type).length;
              return (
                <Card key={type} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
                    <h3 className="font-semibold">{type}</h3>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">Documents</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search documents..." className="pl-9" />
                </div>
                <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="PO">Purchase Order</SelectItem>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="License">License</SelectItem>
                    <SelectItem value="Tax Document">Tax Document</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto">
                  <Button onClick={() => setShowUploadDocModal(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Documents ({filteredDocuments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Uploaded Date</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-accent">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>
                      <TableCell>{doc.vendorName}</TableCell>
                      <TableCell>{doc.uploadedDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.version}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <VendorFormModal
        open={showAddVendorModal}
        onClose={() => setShowAddVendorModal(false)}
      />
      <VendorFormModal
        open={showEditVendorModal}
        onClose={() => {
          setShowEditVendorModal(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
      />
      <VendorDetailsModal vendor={selectedVendor} />
      <AddBillModal />
      <BillDetailsModal bill={selectedBill} />
      <UploadDocumentModal />
      </div>
    </DashboardLayout>
  );
}
