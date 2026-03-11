import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plane, 
  Plus,
  Download,
  Search,
  Filter,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Receipt,
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  MoreVertical,
  Eye,
  Trash2,
  AlertCircle,
  Briefcase,
  Globe,
  Wallet
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Shared StatCard component
const StatCard = ({ title, value, icon: Icon, description, trend, color }: any) => (
  <Card className="overflow-hidden border-none shadow-sm bg-white/50 backdrop-blur-md">
    <CardContent className="p-6">
      <div className="flex justify-between items-start text-slate-600">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-slate-900">{value}</h3>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function TravelExpense() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('travel');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const { toast } = useToast();

  // Mock data - Travel requests
  const [requests, setRequests] = useState([
    {
      id: 'TRV-2025-001',
      employee: 'John Smith',
      empId: 'EMP-001',
      destination: 'New York, USA',
      purpose: 'Client Quarterly Review',
      fromDate: '2025-06-20',
      toDate: '2025-06-23',
      days: 3,
      estimatedCost: 2500,
      status: 'approved',
      avatar: 'https://i.pravatar.cc/150?u=1'
    },
    {
      id: 'TRV-2025-002',
      employee: 'Sarah Johnson',
      empId: 'EMP-002',
      destination: 'London, UK',
      purpose: 'Tech Summit 2025',
      fromDate: '2025-07-01',
      toDate: '2025-07-05',
      days: 4,
      estimatedCost: 3200,
      status: 'pending',
      avatar: 'https://i.pravatar.cc/150?u=2'
    },
    {
      id: 'TRV-2025-003',
      employee: 'Mike Brown',
      empId: 'EMP-003',
      destination: 'San Francisco, USA',
      purpose: 'Security Training',
      fromDate: '2025-06-25',
      toDate: '2025-06-27',
      days: 2,
      estimatedCost: 1800,
      status: 'rejected',
      avatar: 'https://i.pravatar.cc/150?u=3'
    },
    {
      id: 'TRV-2025-004',
      employee: 'Emily Davis',
      empId: 'EMP-004',
      destination: 'Tokyo, Japan',
      purpose: 'Partner Workshop',
      fromDate: '2025-08-10',
      toDate: '2025-08-15',
      days: 5,
      estimatedCost: 4500,
      status: 'pending',
      avatar: 'https://i.pravatar.cc/150?u=4'
    }
  ]);

  // Mock data - Expense claims
  const [claims, setClaims] = useState([
    {
      id: 'EXP-2145',
      employee: 'Emily Davis',
      empId: 'EMP-004',
      category: 'Transportation',
      amount: 150.50,
      claimDate: '2025-06-12',
      description: 'Taxi fare for client visit',
      billAttached: true,
      status: 'approved',
      avatar: 'https://i.pravatar.cc/150?u=4'
    },
    {
      id: 'EXP-2146',
      employee: 'Alex Wilson',
      empId: 'EMP-005',
      category: 'Meals',
      amount: 85.25,
      claimDate: '2025-06-14',
      description: 'Team dinner with clients',
      billAttached: true,
      status: 'pending',
      avatar: 'https://i.pravatar.cc/150?u=5'
    },
    {
      id: 'EXP-2147',
      employee: 'Lisa Anderson',
      empId: 'EMP-006',
      category: 'Accommodation',
      amount: 450.00,
      claimDate: '2025-06-10',
      description: 'Hotel stay - Business trip',
      billAttached: true,
      status: 'approved',
      avatar: 'https://i.pravatar.cc/150?u=6'
    },
    {
      id: 'EXP-2148',
      employee: 'David Miller',
      empId: 'EMP-007',
      category: 'Other',
      amount: 25.00,
      claimDate: '2025-06-15',
      description: 'Office supplies',
      billAttached: false,
      status: 'rejected',
      avatar: 'https://i.pravatar.cc/150?u=7'
    }
  ]);

  const filteredTravel = requests.filter(req => 
    req.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClaims = claims.filter(claim => 
    claim.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
    approved: { label: 'Approved', class: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
  };

  const handleRequestAction = (id: string, action: 'approved' | 'rejected') => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
    toast({
      title: `Request ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Travel ID ${id} has been marked as ${action}.`,
      variant: action === 'approved' ? 'default' : 'destructive'
    });
  };

  const handleClaimAction = (id: string, action: 'approved' | 'rejected') => {
    setClaims(claims.map(c => c.id === id ? { ...c, status: action } : c));
    toast({
      title: `Claim ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Expense Claim ${id} has been ${action}.`,
      variant: action === 'approved' ? 'default' : 'destructive'
    });
  };

  const handleExport = (type: 'excel' | 'pdf') => {
    const data = activeTab === 'travel' ? filteredTravel : filteredClaims;
    
    if (type === 'excel') {
      exportToExcel(data, `HRM_Travel_Expense_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(activeTab === 'travel' ? 'Travel Requests Report' : 'Expense Claims Report', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);

      const tableData = data.map((item: any) => 
        activeTab === 'travel' 
          ? [item.id, item.employee, item.destination, item.fromDate, item.status, `$${item.estimatedCost}`]
          : [item.id, item.employee, item.category, item.claimDate, item.status, `$${item.amount.toFixed(2)}`]
      );

      autoTable(doc, {
        startY: 40,
        head: [activeTab === 'travel' 
          ? ['ID', 'Employee', 'Destination', 'Date', 'Status', 'Est. Cost']
          : ['ID', 'Employee', 'Category', 'Date', 'Status', 'Amount']],
        body: tableData,
      });

      doc.save(`HRM_Travel_Expense_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-slate-50/50">
        {/* Modern Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-slate-100"
                onClick={() => setLocation('/hrm')}
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-600 rounded-lg">
                    <Plane className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Travel & Expense</h1>
                </div>
                <p className="text-sm text-slate-500 font-medium">Global mobility and reimbursement management</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white border-slate-200 rounded-xl font-bold h-10 shadow-sm">
                    <Download className="h-4 w-4 mr-2" />
                    <span>Export Analytics</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-48 font-medium">
                  <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2 text-emerald-600" /> Excel Sheet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-rose-600" /> PDF Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-200 rounded-xl font-bold h-10 transition-all active:scale-95">
                    <Plus className="h-4 w-4 mr-2" /> New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                  <div className="bg-pink-600 p-8 text-white">
                    <DialogTitle className="text-2xl font-black">Apply for Professional Travel</DialogTitle>
                    <DialogDescription className="text-pink-50 font-medium">Submit your travel itinerary and purpose for administrative approval.</DialogDescription>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Professional Destination</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            id="travel-destination" 
                            placeholder="City, Country (e.g., Zurich, Switzerland)" 
                            className="pl-10 rounded-xl bg-slate-50 border-slate-200 h-12 font-bold focus:ring-pink-500/20" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Starting Date</Label>
                        <Input id="travel-from-date" type="date" className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Return Date</Label>
                        <Input id="travel-to-date" type="date" className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Primary Purpose</Label>
                        <Select onValueChange={(val) => (document.getElementById('travel-purpose') as any).value = val}>
                          <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold">
                            <SelectValue placeholder="Reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Client Engagement">Client Engagement</SelectItem>
                            <SelectItem value="Global Summit">Global Summit</SelectItem>
                            <SelectItem value="Internal Upskilling">Internal Upskilling</SelectItem>
                            <SelectItem value="Partner Meeting">Partner Meeting</SelectItem>
                          </SelectContent>
                        </Select>
                        <input type="hidden" id="travel-purpose" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Estimated Budget (USD)</Label>
                        <Input id="travel-budget" type="number" placeholder="0.00" className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold" />
                      </div>
                    </div>
                  </div>
                  <div className="px-8 pb-8 flex gap-3">
                    <Button variant="ghost" onClick={() => setIsRequestDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold text-slate-500">Cancel</Button>
                    <Button 
                      className="flex-1 bg-pink-600 hover:bg-pink-700 rounded-xl h-12 font-bold shadow-lg shadow-pink-100" 
                      onClick={() => {
                        const destination = (document.getElementById('travel-destination') as HTMLInputElement)?.value;
                        const fromDate = (document.getElementById('travel-from-date') as HTMLInputElement)?.value;
                        const toDate = (document.getElementById('travel-to-date') as HTMLInputElement)?.value;
                        const purpose = (document.getElementById('travel-purpose') as HTMLInputElement)?.value || 'Client Engagement';
                        const budget = parseFloat((document.getElementById('travel-budget') as HTMLInputElement)?.value || '0');
                        
                        if (!destination || !fromDate || !toDate) {
                          toast({ 
                            title: "Validation Error", 
                            description: "Please fill in all required fields.", 
                            variant: "destructive" 
                          });
                          return;
                        }
                        
                        if (new Date(toDate) < new Date(fromDate)) {
                          toast({ 
                            title: "Invalid Dates", 
                            description: "Return date must be after starting date.", 
                            variant: "destructive" 
                          });
                          return;
                        }
                        
                        const daysDiff = Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24));
                        
                        const newRequest = {
                          id: `TRV-2025-${String(requests.length + 1).padStart(3, '0')}`,
                          employee: 'Current User',
                          empId: 'EMP-999',
                          destination,
                          purpose,
                          fromDate,
                          toDate,
                          days: daysDiff,
                          estimatedCost: budget,
                          status: 'pending',
                          avatar: 'https://i.pravatar.cc/150?u=999'
                        };
                        
                        setRequests([newRequest, ...requests]);
                        toast({ 
                          title: "✅ Request Submitted Successfully", 
                          description: `Travel request ${newRequest.id} created and sent for approval.` 
                        });
                        setIsRequestDialogOpen(false);
                        
                        // Clear form
                        (document.getElementById('travel-destination') as HTMLInputElement).value = '';
                        (document.getElementById('travel-from-date') as HTMLInputElement).value = '';
                        (document.getElementById('travel-to-date') as HTMLInputElement).value = '';
                        (document.getElementById('travel-budget') as HTMLInputElement).value = '';
                      }}
                    >
                      Submit Application
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
                <DialogTrigger asChild>
                   <Button variant="outline" className="border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold h-10 shadow-sm text-pink-600">
                      <Receipt className="h-4 w-4 mr-2" /> File Claim
                   </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                   <div className="bg-slate-900 p-8 text-white">
                      <DialogTitle className="text-2xl font-black">Submit Expense Claim</DialogTitle>
                      <DialogDescription className="text-slate-400 font-medium">Reimbursable business expenditure report</DialogDescription>
                   </div>
                   <div className="p-8 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</Label>
                            <Select onValueChange={(val) => (document.getElementById('claim-category') as any).value = val}>
                               <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold">
                                  <SelectValue placeholder="Type" />
                               </SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="Transportation">Transportation</SelectItem>
                                  <SelectItem value="Meals">Meals & Lodging</SelectItem>
                                  <SelectItem value="Accommodation">Accommodation</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                               </SelectContent>
                            </Select>
                            <input type="hidden" id="claim-category" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Amount (USD)</Label>
                            <Input id="claim-amount" type="number" step="0.01" placeholder="0.00" className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</Label>
                         <Textarea id="claim-description" placeholder="Brief description of expense..." className="rounded-xl bg-slate-50 border-slate-200 font-bold min-h-[80px]" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Receipt / Invoice</Label>
                         <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group" onClick={() => toast({ title: "Upload Feature", description: "File upload functionality will be available in the next release." })}>
                            <Upload className="h-10 w-10 text-slate-300 group-hover:text-pink-500 mb-2 transition-colors" />
                            <p className="text-xs font-bold text-slate-400">Click to upload bill</p>
                         </div>
                      </div>
                   </div>
                   <div className="px-8 pb-8 flex gap-3">
                      <Button variant="ghost" onClick={() => setIsClaimDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold text-slate-500">Discard</Button>
                      <Button 
                         onClick={() => {
                            const category = (document.getElementById('claim-category') as HTMLInputElement)?.value || 'Other';
                            const amount = parseFloat((document.getElementById('claim-amount') as HTMLInputElement)?.value || '0');
                            const description = (document.getElementById('claim-description') as HTMLTextAreaElement)?.value;
                            
                            if (!category || amount <= 0 || !description) {
                              toast({ 
                                title: "Validation Error", 
                                description: "Please fill in all required fields with valid data.", 
                                variant: "destructive" 
                              });
                              return;
                            }
                            
                            const newClaim = {
                              id: `EXP-${2145 + claims.length + 1}`,
                              employee: 'Current User',
                              empId: 'EMP-999',
                              category,
                              amount,
                              claimDate: new Date().toISOString().split('T')[0],
                              description,
                              billAttached: false,
                              status: 'pending',
                              avatar: 'https://i.pravatar.cc/150?u=999'
                            };
                            
                            setClaims([newClaim, ...claims]);
                            toast({ 
                              title: "✅ Claim Submitted Successfully", 
                              description: `Expense claim ${newClaim.id} created for $${amount.toFixed(2)}` 
                            });
                            setIsClaimDialogOpen(false);
                            
                            // Clear form
                            (document.getElementById('claim-amount') as HTMLInputElement).value = '';
                            (document.getElementById('claim-description') as HTMLTextAreaElement).value = '';
                         }}
                         className="flex-1 bg-slate-900 hover:bg-slate-800 rounded-xl h-12 font-bold text-white shadow-lg"
                      >
                         Submit Claim
                      </Button>
                   </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
              <StatCard 
                title="Total Expenses"
                value={`$${claims.reduce((acc, c) => acc + c.amount, 0).toFixed(2)}`}
                description="All submitted claims"
                icon={DollarSign}
                color="bg-pink-100 text-pink-600"
              />
              <StatCard 
                title="Approved Claims"
                value={claims.filter(c => c.status === 'approved').length}
                description="Processed this quarter"
                icon={CheckCircle}
                color="bg-emerald-100 text-emerald-600"
              />
              <StatCard 
                title="Pending T&E"
                value={requests.filter(r => r.status === 'pending').length + claims.filter(c => c.status === 'pending').length}
                description="Awaiting review"
                icon={Clock}
                color="bg-amber-100 text-amber-600"
              />
              <StatCard 
                title="Monthly Spend"
                value={`$${Math.round(claims.filter(c => c.status === 'approved').reduce((acc, c) => acc + c.amount, 0)).toLocaleString()}`}
                trend={{ value: '+12% vs last month', positive: false }}
                icon={Wallet}
                color="bg-slate-100 text-slate-600"
              />
            </div>

            {/* Main Content Area */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <TabsList className="bg-slate-200/50 p-1">
                  <TabsTrigger value="travel" className="data-[state=active]:bg-white">Travel Requests</TabsTrigger>
                  <TabsTrigger value="expenses" className="data-[state=active]:bg-white">Expense Claims</TabsTrigger>
                  <TabsTrigger value="advance" className="data-[state=active]:bg-white">Travel Advance</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search ID, staff, or location..." 
                      className="pl-10 w-full md:w-[300px] bg-white border-slate-300 focus:ring-pink-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="bg-white border-slate-300">
                    <Filter className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Travel Requests Table */}
              <TabsContent value="travel" className="m-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[120px]">Request ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Estimated Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTravel.map((req) => {
                      const status = statusConfig[req.status];
                      return (
                        <TableRow key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-bold text-slate-700">{req.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                <AvatarImage src={req.avatar} />
                                <AvatarFallback className="bg-pink-100 text-pink-700">{req.employee.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-900 leading-none">{req.employee}</p>
                                <p className="text-xs text-slate-500 mt-1">{req.empId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-pink-500" />
                              <span className="text-sm font-medium">{req.destination}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{req.fromDate} to {req.toDate}</p>
                              <p className="text-xs text-slate-500">{req.days} Business Days</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-bold text-slate-900">${req.estimatedCost.toLocaleString()}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.class} border shadow-none flex items-center w-fit gap-1.5 px-2.5 py-0.5`}>
                              <status.icon className="h-3.5 w-3.5" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end items-center gap-1">
                                {req.status === 'pending' ? (
                                   <>
                                      <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         className="h-8 text-emerald-600 hover:bg-emerald-50 rounded-lg font-black"
                                         onClick={() => handleRequestAction(req.id, 'approved')}
                                      >
                                         Approve
                                      </Button>
                                      <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         className="h-8 text-rose-600 hover:bg-rose-50 rounded-lg font-black"
                                         onClick={() => handleRequestAction(req.id, 'rejected')}
                                      >
                                         Reject
                                      </Button>
                                   </>
                                ) : (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-none">
                                      <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer" onClick={() => setSelectedRequest(req)}>
                                        <Eye className="h-4 w-4 mr-2 text-slate-400" /> View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer" onClick={() => toast({ title: "Report Ready", description: "The travel itinerary PDF is ready." })}>
                                        <FileText className="h-4 w-4 mr-2 text-slate-400" /> Download PDF
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-50">
                                        <Trash2 className="h-4 w-4 mr-2" /> Cancel Request
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                             </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Expense Claims Table */}
              <TabsContent value="expenses" className="m-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[120px]">Claim ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => {
                      const status = statusConfig[claim.status];
                      return (
                        <TableRow key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-bold text-slate-700">{claim.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                <AvatarImage src={claim.avatar} />
                                <AvatarFallback className="bg-blue-100 text-blue-700">{claim.employee.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-900 leading-none">{claim.employee}</p>
                                <p className="text-xs text-slate-500 mt-1">{claim.empId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-white px-2 py-0 border-slate-200 text-slate-600 font-medium">
                              {claim.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{claim.claimDate}</span>
                          </TableCell>
                          <TableCell>
                            <p className="font-bold text-slate-900">${claim.amount.toFixed(2)}</p>
                          </TableCell>
                          <TableCell>
                            {claim.billAttached ? (
                              <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 cursor-pointer flex w-fit gap-1 items-center px-2 py-0.5">
                                <Receipt className="h-3 w-3" /> Attached
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No receipt</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.class} border shadow-none flex items-center w-fit gap-1.5 px-2.5 py-0.5`}>
                              <status.icon className="h-3.5 w-3.5" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end items-center gap-1">
                                {claim.status === 'pending' ? (
                                   <>
                                      <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         className="h-8 text-emerald-600 hover:bg-emerald-50 rounded-lg font-black"
                                         onClick={() => handleClaimAction(claim.id, 'approved')}
                                      >
                                         Approve
                                      </Button>
                                      <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         className="h-8 text-rose-600 hover:bg-rose-50 rounded-lg font-black"
                                         onClick={() => handleClaimAction(claim.id, 'rejected')}
                                      >
                                         Reject
                                      </Button>
                                   </>
                                ) : (
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setSelectedClaim(claim)}>
                                      <Eye className="h-4 w-4" />
                                   </Button>
                                )}
                             </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>

               <TabsContent value="advance" className="m-0">
                 <Table>
                   <TableHeader className="bg-slate-50">
                     <TableRow>
                       <TableHead>Advance ID</TableHead>
                       <TableHead>Employee</TableHead>
                       <TableHead>Trip ID</TableHead>
                       <TableHead>Amount</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {[
                       { id: 'ADV-901', employee: 'Arjun Mehta', tripId: 'TRV-451', amount: 1200, status: 'disbursed', date: 'Oct 12, 2023' },
                       { id: 'ADV-902', employee: 'Priya Sharma', tripId: 'TRV-452', amount: 800, status: 'pending', date: 'Oct 20, 2023' },
                     ].map((adv) => (
                       <TableRow key={adv.id}>
                         <TableCell className="font-bold">{adv.id}</TableCell>
                         <TableCell className="font-medium">{adv.employee}</TableCell>
                         <TableCell className="text-slate-500 font-bold">{adv.tripId}</TableCell>
                         <TableCell className="font-black text-indigo-600">${adv.amount}</TableCell>
                         <TableCell>
                           <Badge className={adv.status === 'disbursed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                             {adv.status}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-right">
                            {adv.status === 'pending' && <Button variant="ghost" size="sm" className="font-bold text-emerald-600" onClick={() => toast({ title: "Disbursed", description: "Advance has been sent." })}>Disburse</Button>}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* View Detail Dialogs */}
        <Dialog open={!!selectedRequest} onOpenChange={(o) => !o && setSelectedRequest(null)}>
           <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              {selectedRequest && (
                 <>
                    <div className="bg-pink-600 p-8 text-white flex justify-between items-start">
                       <div className="flex gap-4 items-center">
                          <Avatar className="h-16 w-16 border-2 border-white/20">
                             <AvatarImage src={selectedRequest.avatar} />
                             <AvatarFallback>{selectedRequest.employee.substring(0,2)}</AvatarFallback>
                          </Avatar>
                          <div>
                             <h2 className="text-2xl font-black">{selectedRequest.employee}</h2>
                             <p className="text-pink-100 font-bold uppercase text-xs tracking-widest">{selectedRequest.id}</p>
                          </div>
                       </div>
                       <Badge className={cn("rounded-xl px-3 py-1 font-black uppercase text-[10px]", statusConfig[selectedRequest.status].class)}>
                          {statusConfig[selectedRequest.status].label}
                       </Badge>
                    </div>
                    <div className="p-8 space-y-6">
                       <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div>
                             <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Destination</p>
                             <p className="font-bold flex items-center gap-1.5"><MapPin className="h-4 w-4 text-pink-500" /> {selectedRequest.destination}</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Est. Budget</p>
                             <p className="font-black text-lg text-slate-900">${selectedRequest.estimatedCost.toLocaleString()}</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Departure</p>
                             <p className="font-bold">{selectedRequest.fromDate}</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Return</p>
                             <p className="font-bold">{selectedRequest.toDate}</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h4 className="font-black text-slate-900 uppercase text-xs tracking-tighter flex items-center gap-2">
                             <FileText className="h-4 w-4 text-pink-500" />
                             Trip Objective
                          </h4>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                            "{selectedRequest.purpose}. Strategic alignment with quarterly client retention goals and technology partnership roadmap for the 2025 fiscal year."
                          </div>
                       </div>
                       
                       <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setSelectedRequest(null)}>Close</Button>
                          {selectedRequest.status === 'pending' && (
                             <Button className="flex-1 bg-pink-600 hover:bg-pink-700 rounded-xl h-12 font-bold text-white shadow-lg" onClick={() => { handleRequestAction(selectedRequest.id, 'approved'); setSelectedRequest(null); }}>
                                Approve Mission
                             </Button>
                          )}
                       </div>
                    </div>
                 </>
              )}
           </DialogContent>
        </Dialog>

        <Dialog open={!!selectedClaim} onOpenChange={(o) => !o && setSelectedClaim(null)}>
           <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              {selectedClaim && (
                 <>
                    <div className="bg-slate-900 p-8 text-white">
                       <h2 className="text-xl font-black">Expense Verification</h2>
                       <p className="text-slate-400 font-medium">Reviewing claim {selectedClaim.id}</p>
                    </div>
                    <div className="p-8 space-y-6">
                       <div className="flex justify-between items-center py-4 border-b border-slate-100">
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Claim Amount</p>
                            <p className="text-3xl font-black text-emerald-600">${selectedClaim.amount.toFixed(2)}</p>
                          </div>
                          <Badge className={cn("rounded-xl px-3 py-1 font-black uppercase text-[10px]", statusConfig[selectedClaim.status].class)}>
                            {statusConfig[selectedClaim.status].label}
                          </Badge>
                       </div>

                       <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-black uppercase">Tax Category & Description</p>
                          <p className="font-bold text-slate-900">{selectedClaim.category}</p>
                          <p className="text-sm text-slate-500">{selectedClaim.description}</p>
                       </div>

                       {selectedClaim.billAttached ? (
                          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-blue-600" />
                                <div>
                                   <p className="text-xs font-bold text-blue-900">receipt_scanned.pdf</p>
                                   <p className="text-[10px] text-blue-600">Verification Hash: SHA-256 Valid</p>
                                </div>
                             </div>
                             <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-100 h-8">View</Button>
                          </div>
                       ) : (
                          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3">
                             <AlertCircle className="h-6 w-6 text-rose-600" />
                             <p className="text-xs font-bold text-rose-900">No receipt attached for this claim.</p>
                          </div>
                       )}

                       <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold" onClick={() => setSelectedClaim(null)}>Dismiss</Button>
                          {selectedClaim.status === 'pending' && (
                             <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-bold text-white shadow-lg" onClick={() => { handleClaimAction(selectedClaim.id, 'approved'); setSelectedClaim(null); }}>
                                Approve
                             </Button>
                          )}
                       </div>
                    </div>
                 </>
              )}
           </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

