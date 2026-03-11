import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  ArrowLeft,
  FileSpreadsheet,
  Users,
  TrendingUp,
  PieChart,
  BarChart3,
  Laptop,
  Smartphone,
  Car,
  Monitor,
  Package,
  Armchair,
  Wrench,
  Calendar as CalendarIcon,
  DollarSign,
  MapPin,
  CheckCircle2,
  XCircle,
  Activity,
  Eye,
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function HRMAssets() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Asset management state
  const [addAssetDialogOpen, setAddAssetDialogOpen] = useState(false);
  const [assignAssetDialogOpen, setAssignAssetDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('all');
  const [assetStatusFilter, setAssetStatusFilter] = useState('all');

  // Mock data - Company Assets
  const [assets, setAssets] = useState([
    {
      id: 'AST001',
      assetName: 'MacBook Pro 16"',
      category: 'IT Equipment',
      subcategory: 'Laptop',
      brand: 'Apple',
      model: 'MacBook Pro M3 Max',
      serialNumber: 'C02YK3QGJG5H',
      purchaseDate: '2025-01-15',
      purchaseValue: '$3,499',
      currentValue: '$3,150',
      depreciation: '10%',
      assignedTo: 'John Smith',
      empId: 'EMP001',
      department: 'Engineering',
      assignedDate: '2025-01-20',
      location: 'Office - Floor 3, Desk 24',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2028-01-15',
      lastMaintenance: '2025-05-10',
      nextMaintenance: '2025-11-10',
      insuranceValue: '$3,500',
      avatar: 'JS'
    },
    {
      id: 'AST002',
      assetName: 'iPhone 15 Pro',
      category: 'IT Equipment',
      subcategory: 'Mobile Phone',
      brand: 'Apple',
      model: 'iPhone 15 Pro 256GB',
      serialNumber: 'F17YH9X1Q2M3',
      purchaseDate: '2024-10-20',
      purchaseValue: '$1,199',
      currentValue: '$950',
      depreciation: '21%',
      assignedTo: 'Sarah Johnson',
      empId: 'EMP002',
      department: 'Product',
      assignedDate: '2024-10-25',
      location: 'Remote - Los Angeles, CA',
      condition: 'Good',
      status: 'assigned',
      warrantyExpiry: '2025-10-20',
      lastMaintenance: '2025-04-15',
      nextMaintenance: '2025-10-15',
      insuranceValue: '$1,200',
      avatar: 'SJ'
    },
    {
      id: 'AST003',
      assetName: 'Dell UltraSharp Monitor 32"',
      category: 'IT Equipment',
      subcategory: 'Monitor',
      brand: 'Dell',
      model: 'U3223QE',
      serialNumber: 'CN0H7YK213T7',
      purchaseDate: '2024-08-10',
      purchaseValue: '$899',
      currentValue: '$720',
      depreciation: '20%',
      assignedTo: 'Mike Brown',
      empId: 'EMP003',
      department: 'Design',
      assignedDate: '2024-08-15',
      location: 'Office - Floor 2, Desk 12',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2027-08-10',
      lastMaintenance: '2025-02-20',
      nextMaintenance: '2025-08-20',
      insuranceValue: '$900',
      avatar: 'MB'
    },
    {
      id: 'AST004',
      assetName: 'Toyota Camry',
      category: 'Vehicle',
      subcategory: 'Sedan',
      brand: 'Toyota',
      model: 'Camry LE 2024',
      serialNumber: '4T1B11HK5RU123456',
      purchaseDate: '2024-03-01',
      purchaseValue: '$28,500',
      currentValue: '$25,650',
      depreciation: '10%',
      assignedTo: 'Emily Davis',
      empId: 'EMP004',
      department: 'Human Resources',
      assignedDate: '2024-03-05',
      location: 'Office Parking Lot A',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2027-03-01',
      lastMaintenance: '2025-12-15',
      nextMaintenance: '2026-06-15',
      insuranceValue: '$30,000',
      avatar: 'ED'
    },
    {
      id: 'AST005',
      assetName: 'HP LaserJet Printer',
      category: 'Office Equipment',
      subcategory: 'Printer',
      brand: 'HP',
      model: 'LaserJet Pro M404dn',
      serialNumber: 'VNBCH12345',
      purchaseDate: '2023-11-20',
      purchaseValue: '$349',
      currentValue: '$210',
      depreciation: '40%',
      assignedTo: 'Unassigned',
      empId: '-',
      department: 'General Office',
      assignedDate: '-',
      location: 'Office - Floor 1, Print Room',
      condition: 'Good',
      status: 'available',
      warrantyExpiry: '2025-11-20',
      lastMaintenance: '2025-05-01',
      nextMaintenance: '2025-11-01',
      insuranceValue: '$350',
      avatar: 'UN'
    },
    {
      id: 'AST006',
      assetName: 'Herman Miller Aeron Chair',
      category: 'Furniture',
      subcategory: 'Office Chair',
      brand: 'Herman Miller',
      model: 'Aeron Remastered Size B',
      serialNumber: 'HM-AE-2024-8821',
      purchaseDate: '2024-05-10',
      purchaseValue: '$1,395',
      currentValue: '$1,255',
      depreciation: '10%',
      assignedTo: 'Alex Wilson',
      empId: 'EMP005',
      department: 'Sales',
      assignedDate: '2024-05-12',
      location: 'Office - Floor 4, Desk 8',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2036-05-10',
      lastMaintenance: '2025-11-01',
      nextMaintenance: '2026-05-01',
      insuranceValue: '$1,400',
      avatar: 'AW'
    },
    {
      id: 'AST007',
      assetName: 'Lenovo ThinkPad X1 Carbon',
      category: 'IT Equipment',
      subcategory: 'Laptop',
      brand: 'Lenovo',
      model: 'ThinkPad X1 Carbon Gen 11',
      serialNumber: 'PF3HQMR5',
      purchaseDate: '2024-09-01',
      purchaseValue: '$2,199',
      currentValue: '$1,760',
      depreciation: '20%',
      assignedTo: 'David Martinez',
      empId: 'EMP006',
      department: 'Engineering',
      assignedDate: '2024-09-05',
      location: 'Remote - Austin, TX',
      condition: 'Good',
      status: 'assigned',
      warrantyExpiry: '2027-09-01',
      lastMaintenance: '2025-03-15',
      nextMaintenance: '2025-09-15',
      insuranceValue: '$2,200',
      avatar: 'DM'
    },
    {
      id: 'AST008',
      assetName: 'Surface Pro 9',
      category: 'IT Equipment',
      subcategory: 'Tablet',
      brand: 'Microsoft',
      model: 'Surface Pro 9 i7 16GB',
      serialNumber: 'MSF-SP9-2024-4521',
      purchaseDate: '2024-07-15',
      purchaseValue: '$1,599',
      currentValue: '$1,279',
      depreciation: '20%',
      assignedTo: 'Lisa Anderson',
      empId: 'EMP007',
      department: 'Marketing',
      assignedDate: '2024-07-20',
      location: 'Office - Floor 3, Hot Desk',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2026-07-15',
      lastMaintenance: '2025-01-10',
      nextMaintenance: '2025-07-10',
      insuranceValue: '$1,600',
      avatar: 'LA'
    },
    {
      id: 'AST009',
      assetName: 'Conference Room Camera',
      category: 'Office Equipment',
      subcategory: 'Video Conference',
      brand: 'Logitech',
      model: 'Rally Camera',
      serialNumber: 'LOG-RC-8899-2024',
      purchaseDate: '2024-02-10',
      purchaseValue: '$1,299',
      currentValue: '$1,040',
      depreciation: '20%',
      assignedTo: 'Unassigned',
      empId: '-',
      department: 'General Office',
      assignedDate: '-',
      location: 'Conference Room A',
      condition: 'Excellent',
      status: 'available',
      warrantyExpiry: '2026-02-10',
      lastMaintenance: '2025-08-01',
      nextMaintenance: '2026-02-01',
      insuranceValue: '$1,300',
      avatar: 'UN'
    },
    {
      id: 'AST010',
      assetName: 'Standing Desk',
      category: 'Furniture',
      subcategory: 'Desk',
      brand: 'Steelcase',
      model: 'Series 7 Electric',
      serialNumber: 'SC-S7-2024-6632',
      purchaseDate: '2024-04-20',
      purchaseValue: '$1,850',
      currentValue: '$1,665',
      depreciation: '10%',
      assignedTo: 'Robert Chen',
      empId: 'EMP008',
      department: 'Analytics',
      assignedDate: '2024-04-25',
      location: 'Office - Floor 2, Desk 18',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2034-04-20',
      lastMaintenance: '2025-10-15',
      nextMaintenance: '2026-04-15',
      insuranceValue: '$1,850',
      avatar: 'RC'
    },
    {
      id: 'AST011',
      assetName: 'Samsung Galaxy S24',
      category: 'IT Equipment',
      subcategory: 'Mobile Phone',
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra 512GB',
      serialNumber: 'R58NA1BQZRP',
      purchaseDate: '2024-12-01',
      purchaseValue: '$1,299',
      currentValue: '$1,169',
      depreciation: '10%',
      assignedTo: 'Unassigned',
      empId: '-',
      department: 'IT Pool',
      assignedDate: '-',
      location: 'IT Storage Room',
      condition: 'New',
      status: 'available',
      warrantyExpiry: '2025-12-01',
      lastMaintenance: '-',
      nextMaintenance: '2025-06-01',
      insuranceValue: '$1,300',
      avatar: 'UN'
    },
    {
      id: 'AST012',
      assetName: 'Damaged MacBook Air',
      category: 'IT Equipment',
      subcategory: 'Laptop',
      brand: 'Apple',
      model: 'MacBook Air M2',
      serialNumber: 'C02XR2KWJGH6',
      purchaseDate: '2023-06-10',
      purchaseValue: '$1,499',
      currentValue: '$450',
      depreciation: '70%',
      assignedTo: 'Unassigned',
      empId: '-',
      department: 'IT Repair',
      assignedDate: '-',
      location: 'IT Repair Center',
      condition: 'Damaged',
      status: 'maintenance',
      warrantyExpiry: '2024-06-10',
      lastMaintenance: '2025-12-20',
      nextMaintenance: 'Pending Repair',
      insuranceValue: '$1,500',
      avatar: 'UN'
    },
    {
      id: 'AST013',
      assetName: 'Employee ID Card - John Smith',
      category: 'ID & Access',
      subcategory: 'ID Card',
      brand: 'Company Issue',
      model: 'Standard Employee ID',
      serialNumber: 'ID-2025-001',
      purchaseDate: '2025-01-20',
      purchaseValue: '$25',
      currentValue: '$25',
      depreciation: '0%',
      assignedTo: 'John Smith',
      empId: 'EMP001',
      department: 'Engineering',
      assignedDate: '2025-01-20',
      location: 'Carried by Employee',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2027-01-20',
      lastMaintenance: '-',
      nextMaintenance: '2026-01-20',
      insuranceValue: '$25',
      avatar: 'JS'
    },
    {
      id: 'AST014',
      assetName: 'Employee ID Card - Sarah Johnson',
      category: 'ID & Access',
      subcategory: 'ID Card',
      brand: 'Company Issue',
      model: 'Standard Employee ID',
      serialNumber: 'ID-2025-002',
      purchaseDate: '2025-01-20',
      purchaseValue: '$25',
      currentValue: '$25',
      depreciation: '0%',
      assignedTo: 'Sarah Johnson',
      empId: 'EMP002',
      department: 'Product',
      assignedDate: '2025-01-20',
      location: 'Carried by Employee',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2027-01-20',
      lastMaintenance: '-',
      nextMaintenance: '2026-01-20',
      insuranceValue: '$25',
      avatar: 'SJ'
    },
    {
      id: 'AST015',
      assetName: 'Access Card - Mike Brown',
      category: 'ID & Access',
      subcategory: 'Access Card',
      brand: 'HID Global',
      model: 'Proximity Card',
      serialNumber: 'ACC-2025-003',
      purchaseDate: '2024-08-15',
      purchaseValue: '$15',
      currentValue: '$15',
      depreciation: '0%',
      assignedTo: 'Mike Brown',
      empId: 'EMP003',
      department: 'Design',
      assignedDate: '2024-08-15',
      location: 'Carried by Employee',
      condition: 'Good',
      status: 'assigned',
      warrantyExpiry: '2026-08-15',
      lastMaintenance: '-',
      nextMaintenance: '2026-02-15',
      insuranceValue: '$15',
      avatar: 'MB'
    },
    {
      id: 'AST016',
      assetName: 'Parking Access Card',
      category: 'ID & Access',
      subcategory: 'Parking Card',
      brand: 'Company Issue',
      model: 'Parking Permit Card',
      serialNumber: 'PARK-2025-004',
      purchaseDate: '2024-03-05',
      purchaseValue: '$10',
      currentValue: '$10',
      depreciation: '0%',
      assignedTo: 'Emily Davis',
      empId: 'EMP004',
      department: 'Human Resources',
      assignedDate: '2024-03-05',
      location: 'Carried by Employee',
      condition: 'Excellent',
      status: 'assigned',
      warrantyExpiry: '2026-03-05',
      lastMaintenance: '-',
      nextMaintenance: '2026-03-05',
      insuranceValue: '$10',
      avatar: 'ED'
    }
  ]);

  // Filtered assets with search and category filters
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = assetSearchQuery === '' || 
                           asset.assetName.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                           asset.assignedTo.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                           asset.serialNumber.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                           asset.empId.toLowerCase().includes(assetSearchQuery.toLowerCase());
      
      const matchesCategory = assetCategoryFilter === 'all' || asset.category === assetCategoryFilter;
      const matchesStatus = assetStatusFilter === 'all' || asset.status === assetStatusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, assetSearchQuery, assetCategoryFilter, assetStatusFilter]);

  const handleExport = (format: 'excel' | 'pdf') => {
    if (format === 'excel') {
      exportToExcel(filteredAssets, `Company_Assets_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.text('Company Assets Report', 14, 15);
      autoTable(doc, {
        startY: 25,
        head: [['ID', 'Asset Name', 'Category', 'Assigned To', 'Value', 'Status']],
        body: filteredAssets.map(item => [item.id, item.assetName, item.category, item.assignedTo, item.currentValue, item.status]),
      });
      doc.save(`Company_Assets_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    toast({ title: `Assets exported as ${format.toUpperCase()}` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 -mx-6 -mt-6 px-6 py-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/hrm')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Asset Management</h1>
                <p className="text-sm text-slate-600">Manage company assets, assignments, and inventory tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Company Assets</h2>
            <p className="text-sm text-slate-600 mt-1">Track and manage all company-owned assets</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={addAssetDialogOpen} onOpenChange={setAddAssetDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Add New Company Asset
                  </DialogTitle>
                  <DialogDescription>
                    Register a new asset to the company inventory system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="asset-name">Asset Name</Label>
                      <Input id="asset-name" placeholder="e.g., MacBook Pro 16 inch" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asset-category">Category</Label>
                      <Select>
                        <SelectTrigger id="asset-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it-equipment">IT Equipment</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="office-equipment">Office Equipment</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="id-card">ID Card & Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="asset-brand">Brand</Label>
                      <Input id="asset-brand" placeholder="e.g., Apple" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asset-model">Model</Label>
                      <Input id="asset-model" placeholder="e.g., MacBook Pro M3 Max" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serial-number">Serial Number</Label>
                      <Input id="serial-number" placeholder="e.g., C02YK3QGJG5H" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase-date">Purchase Date</Label>
                      <Input id="purchase-date" type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchase-value">Purchase Value ($)</Label>
                      <Input id="purchase-value" type="number" placeholder="3499" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-value">Current Value ($)</Label>
                      <Input id="current-value" type="number" placeholder="3150" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g., Office - Floor 3, Desk 24" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warranty-expiry">Warranty Expiry</Label>
                      <Input id="warranty-expiry" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select>
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea id="notes" placeholder="Any additional information about this asset..." rows={3} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddAssetDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      toast({
                        title: "Asset Added!",
                        description: "New asset has been registered to the inventory.",
                      });
                      setAddAssetDialogOpen(false);
                    }}
                  >
                    Add Asset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => handleExport('excel')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Assets
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by asset name, employee, serial number, or ID..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={assetCategoryFilter} onValueChange={setAssetCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                  <SelectItem value="Vehicle">Vehicles</SelectItem>
                  <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="ID & Access">ID Cards & Access</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assetStatusFilter} onValueChange={setAssetStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">In Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {(assetSearchQuery || assetCategoryFilter !== 'all' || assetStatusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    setAssetSearchQuery('');
                    setAssetCategoryFilter('all');
                    setAssetStatusFilter('all');
                    toast({
                      title: "Filters Cleared",
                      description: "All search and filter criteria have been reset.",
                    });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {filteredAssets.length < assets.length && (
              <div className="mt-3 text-sm text-blue-600">
                Showing {filteredAssets.length} of {assets.length} assets
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Assets</p>
                  <h3 className="text-3xl font-black text-blue-700">{filteredAssets.length}</h3>
                  <p className="text-xs text-blue-600 mt-1">{filteredAssets.length === assets.length ? 'across all categories' : `filtered from ${assets.length} total`}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Value</p>
                  <h3 className="text-3xl font-black text-emerald-700">
                    ${Math.round(filteredAssets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[$,]/g, '')), 0) / 1000)}K
                  </h3>
                  <p className="text-xs text-emerald-600 mt-1">current valuation</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-violet-200 bg-violet-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Assigned</p>
                  <h3 className="text-3xl font-black text-violet-700">
                    {filteredAssets.filter(a => a.status === 'assigned').length}
                  </h3>
                  <p className="text-xs text-violet-600 mt-1">{((filteredAssets.filter(a => a.status === 'assigned').length / (filteredAssets.length || 1)) * 100).toFixed(0)}% utilization</p>
                </div>
                <div className="p-3 bg-violet-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Needs Maintenance</p>
                  <h3 className="text-3xl font-black text-amber-700">
                    {filteredAssets.filter(a => a.status === 'maintenance' || new Date(a.nextMaintenance) < new Date()).length}
                  </h3>
                  <p className="text-xs text-amber-600 mt-1">requires attention</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Wrench className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Assignment by Category */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Asset Assignments by Category
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Laptops Section */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-blue-600" />
                  Laptops
                </CardTitle>
                <CardDescription className="text-xs">
                  {assets.filter(a => a.subcategory === 'Laptop').length} total • {assets.filter(a => a.subcategory === 'Laptop' && a.status === 'assigned').length} assigned
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {assets.filter(a => a.subcategory === 'Laptop').map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {asset.assignedTo !== 'Unassigned' ? asset.avatar : 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{asset.assetName}</p>
                        <p className="text-xs text-slate-600 truncate">
                          {asset.assignedTo !== 'Unassigned' ? `${asset.assignedTo}` : 'Available'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs flex-shrink-0",
                        asset.status === 'assigned' ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-600"
                      )}
                    >
                      {asset.status === 'assigned' ? 'In Use' : 'Free'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mobile Phones Section */}
            <Card className="border-violet-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-violet-600" />
                  Mobile Phones
                </CardTitle>
                <CardDescription className="text-xs">
                  {assets.filter(a => a.subcategory === 'Mobile Phone').length} total • {assets.filter(a => a.subcategory === 'Mobile Phone' && a.status === 'assigned').length} assigned
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {assets.filter(a => a.subcategory === 'Mobile Phone').map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                          {asset.assignedTo !== 'Unassigned' ? asset.avatar : 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{asset.assetName}</p>
                        <p className="text-xs text-slate-600 truncate">
                          {asset.assignedTo !== 'Unassigned' ? `${asset.assignedTo}` : 'Available'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs flex-shrink-0",
                        asset.status === 'assigned' ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-600"
                      )}
                    >
                      {asset.status === 'assigned' ? 'In Use' : 'Free'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Other Equipment Section */}
            <Card className="border-emerald-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-emerald-600" />
                  Other Equipment
                </CardTitle>
                <CardDescription className="text-xs">
                  Monitors, Tablets, Vehicles & More
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {assets.filter(a => !['Laptop', 'Mobile Phone'].includes(a.subcategory)).slice(0, 5).map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {asset.assignedTo !== 'Unassigned' ? asset.avatar : 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{asset.assetName}</p>
                        <p className="text-xs text-slate-600 truncate">
                          {asset.assignedTo !== 'Unassigned' ? `${asset.assignedTo}` : asset.location}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs flex-shrink-0",
                        asset.status === 'assigned' ? "bg-green-50 text-green-700" : 
                        asset.status === 'available' ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {asset.status === 'assigned' ? 'In Use' : asset.status === 'available' ? 'Free' : 'Repair'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ID Cards & Access Section */}
            <Card className="border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  ID Cards & Access
                </CardTitle>
                <CardDescription className="text-xs">
                  {assets.filter(a => a.category === 'ID & Access').length} total • {assets.filter(a => a.category === 'ID & Access' && a.status === 'assigned').length} assigned
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {assets.filter(a => a.category === 'ID & Access').map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                          {asset.assignedTo !== 'Unassigned' ? asset.avatar : 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{asset.subcategory}</p>
                        <p className="text-xs text-slate-600 truncate">
                          {asset.assignedTo !== 'Unassigned' ? `${asset.assignedTo}` : 'Available'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs flex-shrink-0",
                        asset.status === 'assigned' ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-600"
                      )}
                    >
                      {asset.status === 'assigned' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {assets.filter(a => a.category === 'ID & Access').length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No ID cards issued yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Asset Categories Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Assets by Category
              </CardTitle>
              <CardDescription>Distribution of company assets across categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['IT Equipment', 'Vehicle', 'Office Equipment', 'Furniture', 'ID & Access'].map(category => {
                const categoryAssets = assets.filter(a => a.category === category);
                const totalValue = categoryAssets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[$,]/g, '')), 0);
                const percentage = (categoryAssets.length / assets.length) * 100;
                const icon = category === 'IT Equipment' ? Laptop : 
                            category === 'Vehicle' ? Car : 
                            category === 'Office Equipment' ? Monitor : 
                            category === 'ID & Access' ? Shield : Armchair;
                const Icon = icon;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700">{category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">${(totalValue / 1000).toFixed(1)}K</span>
                        <span className="text-xs text-slate-500 ml-2">({categoryAssets.length} items)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={percentage} 
                        className={cn(
                          "h-2 flex-1",
                          category === 'IT Equipment' ? "[&>div]:bg-blue-500" : 
                          category === 'Vehicle' ? "[&>div]:bg-violet-500" : 
                          category === 'Office Equipment' ? "[&>div]:bg-emerald-500" : 
                          category === 'ID & Access' ? "[&>div]:bg-amber-500" : "[&>div]:bg-slate-500"
                        )} 
                      />
                      <span className="text-xs font-bold text-slate-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-600" />
                Depreciation Analysis
              </CardTitle>
              <CardDescription>Asset value depreciation overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-bold uppercase mb-1">Purchase Value</p>
                  <p className="text-2xl font-black text-blue-700">
                    ${Math.round(assets.reduce((acc, a) => acc + parseInt(a.purchaseValue.replace(/[$,]/g, '')), 0) / 1000)}K
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Current Value</p>
                  <p className="text-2xl font-black text-emerald-700">
                    ${Math.round(assets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[$,]/g, '')), 0) / 1000)}K
                  </p>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 font-bold uppercase mb-1">Total Depreciation</p>
                    <p className="text-2xl font-black text-red-700">
                      ${Math.round((assets.reduce((acc, a) => acc + parseInt(a.purchaseValue.replace(/[$,]/g, '')), 0) - 
                        assets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[$,]/g, '')), 0)) / 1000)}K
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-600 font-bold uppercase mb-1">Average</p>
                    <p className="text-xl font-black text-red-700">
                      {(((assets.reduce((acc, a) => acc + parseInt(a.purchaseValue.replace(/[$,]/g, '')), 0) - 
                        assets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[$,]/g, '')), 0)) / 
                        assets.reduce((acc, a) => acc + parseInt(a.purchaseValue.replace(/[$,]/g, '')), 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Top Depreciated Assets</p>
                {assets
                  .sort((a, b) => parseInt(b.depreciation) - parseInt(a.depreciation))
                  .slice(0, 3)
                  .map(asset => (
                    <div key={asset.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-xs text-slate-700">{asset.assetName}</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        -{asset.depreciation}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Asset Status Distribution
            </CardTitle>
            <CardDescription>Current status of all company assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-700">Assigned Assets</p>
                    <p className="text-2xl font-black text-emerald-700">{assets.filter(a => a.status === 'assigned').length}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {assets.filter(a => a.status === 'assigned').slice(0, 3).map(asset => (
                    <p key={asset.id} className="text-xs text-emerald-700 truncate">
                      • {asset.assetName} → {asset.assignedTo}
                    </p>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-700">Available Assets</p>
                    <p className="text-2xl font-black text-blue-700">{assets.filter(a => a.status === 'available').length}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {assets.filter(a => a.status === 'available').slice(0, 3).map(asset => (
                    <p key={asset.id} className="text-xs text-blue-700 truncate">
                      • {asset.assetName} - {asset.location}
                    </p>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-700">In Maintenance</p>
                    <p className="text-2xl font-black text-amber-700">{assets.filter(a => a.status === 'maintenance').length}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {assets.filter(a => a.status === 'maintenance').slice(0, 3).map(asset => (
                    <p key={asset.id} className="text-xs text-amber-700 truncate">
                      • {asset.assetName} - {asset.condition}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Asset Inventory Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Complete Asset Inventory</CardTitle>
                <CardDescription>Detailed list of all company assets with assignments and valuations</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setAssignAssetDialogOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Assign Asset
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Asset</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Assigned To</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="text-right font-bold">Purchase Value</TableHead>
                  <TableHead className="text-right font-bold">Current Value</TableHead>
                  <TableHead className="text-center font-bold">Depreciation</TableHead>
                  <TableHead className="font-bold">Condition</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-slate-300" />
                        <p className="text-slate-500 font-medium">No assets found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search or filter criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map(asset => {
                    const categoryIcon = asset.category === 'IT Equipment' ? Laptop : 
                                        asset.category === 'Vehicle' ? Car : 
                                        asset.category === 'Office Equipment' ? Monitor : Armchair;
                    const CategoryIcon = categoryIcon;
                    
                    return (
                      <TableRow key={asset.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">{asset.assetName}</p>
                            <p className="text-xs text-slate-500">{asset.brand} {asset.model}</p>
                            <p className="text-xs text-slate-400 font-mono">{asset.serialNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-slate-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{asset.category}</p>
                              <p className="text-xs text-slate-500">{asset.subcategory}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {asset.assignedTo !== 'Unassigned' ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                                  {asset.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{asset.assignedTo}</p>
                                <p className="text-xs text-slate-500">{asset.empId} • {asset.department}</p>
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-500">Unassigned</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[150px] truncate">{asset.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-medium text-slate-700">{asset.purchaseValue}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-bold text-emerald-700">{asset.currentValue}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline"
                            className={cn(
                              "font-bold",
                              parseInt(asset.depreciation) > 30 ? "bg-red-50 text-red-700 border-red-200" :
                              parseInt(asset.depreciation) > 15 ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-emerald-50 text-emerald-700 border-emerald-200"
                            )}
                          >
                            -{asset.depreciation}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs",
                              asset.condition === 'Excellent' || asset.condition === 'New' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              asset.condition === 'Good' ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-red-50 text-red-700 border-red-200"
                            )}
                          >
                            {asset.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              "font-bold text-xs",
                              asset.status === 'assigned' ? "bg-violet-100 text-violet-700" :
                              asset.status === 'available' ? "bg-blue-100 text-blue-700" :
                              "bg-amber-100 text-amber-700"
                            )}
                          >
                            {asset.status === 'assigned' ? 'Assigned' : 
                             asset.status === 'available' ? 'Available' : 'Maintenance'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="text-lg">•••</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                Schedule Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setAssignAssetDialogOpen(true);
                                }}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                {asset.status === 'assigned' ? 'Reassign' : 'Assign Asset'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Retire Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Most Assigned Category</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {(() => {
                  const categoryCounts = assets.reduce((acc, asset) => {
                    acc[asset.category] = (acc[asset.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const maxCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
                  return maxCategory ? maxCategory[0] : 'N/A';
                })()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(() => {
                  const categoryCounts = assets.reduce((acc, asset) => {
                    acc[asset.category] = (acc[asset.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const maxCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
                  return maxCategory ? `${maxCategory[1]} assets` : '0 assets';
                })()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Available for Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-700">
                {assets.filter(a => a.status === 'available').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Ready to be assigned
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Warranty Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-700">
                {assets.filter(a => {
                  const expiryDate = new Date(a.warrantyExpiry);
                  const threeMonthsFromNow = new Date();
                  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
                  return expiryDate < threeMonthsFromNow && expiryDate > new Date();
                }).length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Within next 3 months
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Upcoming Maintenance Schedule
            </CardTitle>
            <CardDescription>Assets requiring maintenance in the next 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assets
                .filter(a => a.nextMaintenance !== '-' && a.nextMaintenance !== 'Pending Repair')
                .sort((a, b) => new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime())
                .slice(0, 8)
                .map(asset => {
                  const daysUntil = Math.ceil((new Date(asset.nextMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntil < 30;
                  
                  return (
                    <div key={asset.id} className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-2",
                      isUrgent ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isUrgent ? "bg-red-100" : "bg-blue-100"
                        )}>
                          <Wrench className={cn(
                            "h-4 w-4",
                            isUrgent ? "text-red-600" : "text-blue-600"
                          )} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{asset.assetName}</p>
                          <p className="text-xs text-slate-600">{asset.assignedTo !== 'Unassigned' ? `${asset.assignedTo} (${asset.empId})` : asset.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-bold",
                          isUrgent ? "text-red-700" : "text-blue-700"
                        )}>
                          {asset.nextMaintenance}
                        </p>
                        <p className={cn(
                          "text-xs",
                          isUrgent ? "text-red-600" : "text-slate-600"
                        )}>
                          {daysUntil > 0 ? `in ${daysUntil} days` : 'Overdue'}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={cn(
                          isUrgent ? "border-red-300 text-red-700 hover:bg-red-100" : "border-blue-300 text-blue-700 hover:bg-blue-100"
                        )}
                      >
                        Schedule
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Asset Assignment Dialog */}
        <Dialog open={assignAssetDialogOpen} onOpenChange={setAssignAssetDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Assign Asset to Employee
              </DialogTitle>
              <DialogDescription>
                {selectedAsset ? `Assigning: ${selectedAsset.assetName}` : 'Select an asset and assign it to an employee'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {!selectedAsset && (
                <div className="space-y-2">
                  <Label htmlFor="asset-select">Select Asset</Label>
                  <Select onValueChange={(value) => setSelectedAsset(assets.find(a => a.id === value))}>
                    <SelectTrigger id="asset-select">
                      <SelectValue placeholder="Choose an asset to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.filter(a => a.status === 'available').map(asset => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.assetName} - {asset.brand} {asset.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {selectedAsset && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedAsset.assetName}</p>
                      <p className="text-sm text-slate-600">{selectedAsset.brand} {selectedAsset.model}</p>
                      <p className="text-xs text-slate-500">Serial: {selectedAsset.serialNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="employee-select">Assign to Employee</Label>
                <Select>
                  <SelectTrigger id="employee-select">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emp001">John Smith - EMP001 (Engineering)</SelectItem>
                    <SelectItem value="emp002">Sarah Johnson - EMP002 (Product)</SelectItem>
                    <SelectItem value="emp003">Mike Brown - EMP003 (Design)</SelectItem>
                    <SelectItem value="emp004">Emily Davis - EMP004 (HR)</SelectItem>
                    <SelectItem value="emp005">Alex Wilson - EMP005 (Sales)</SelectItem>
                    <SelectItem value="emp006">David Martinez - EMP006 (Engineering)</SelectItem>
                    <SelectItem value="emp007">Lisa Anderson - EMP007 (Marketing)</SelectItem>
                    <SelectItem value="emp008">Robert Chen - EMP008 (Analytics)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-date">Assignment Date</Label>
                <Input id="assignment-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-location">Work Location</Label>
                <Select>
                  <SelectTrigger id="assignment-location">
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office-floor1">Office - Floor 1</SelectItem>
                    <SelectItem value="office-floor2">Office - Floor 2</SelectItem>
                    <SelectItem value="office-floor3">Office - Floor 3</SelectItem>
                    <SelectItem value="office-floor4">Office - Floor 4</SelectItem>
                    <SelectItem value="remote">Remote Work</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-return">Expected Return Date (Optional)</Label>
                <Input id="expected-return" type="date" />
                <p className="text-xs text-slate-500">Leave empty for permanent assignment</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-notes">Assignment Notes</Label>
                <Textarea 
                  id="assignment-notes" 
                  placeholder="Any special instructions or notes about this assignment..."
                  rows={3}
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Assignment Agreement</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Employee will be responsible for the asset and must return it in good condition. 
                      Any damage or loss may result in compensation charges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAssignAssetDialogOpen(false);
                  setSelectedAsset(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  toast({
                    title: "Asset Assigned!",
                    description: selectedAsset ? `${selectedAsset.assetName} has been assigned successfully.` : "Asset assigned to employee.",
                  });
                  setAssignAssetDialogOpen(false);
                  setSelectedAsset(null);
                }}
              >
                Confirm Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

