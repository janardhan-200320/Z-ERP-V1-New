import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { useHRM } from '@/contexts/HRMContext';
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
  IndianRupee,
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

type AssetRecord = {
  id: string;
  assetName: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseValue: string;
  currentValue: string;
  depreciation: string;
  assignedTo: string;
  empId: string;
  department: string;
  assignedDate: string;
  location: string;
  condition: string;
  status: 'assigned' | 'available' | 'maintenance';
  warrantyExpiry: string;
  lastMaintenance: string;
  nextMaintenance: string;
  insuranceValue: string;
  avatar: string;
  documents: string[];
  maintenanceVendor?: string;
  maintenanceIssue?: string;
  maintenanceIssueDate?: string;
  maintenanceGivenDate?: string;
  maintenanceReturnDate?: string;
  maintenanceCost?: string;
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const addDays = (baseDate: Date, days: number): string => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return formatDate(nextDate);
};

const toValidDate = (rawDate: string): Date | null => {
  if (!rawDate || rawDate === '-' || rawDate === 'Pending Repair') {
    return null;
  }

  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatCurrencyValue = (rawValue: string): string => {
  if (!rawValue) {
    return '₹0';
  }

  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) {
    return rawValue;
  }

  return `₹${numericValue.toLocaleString()}`;
};

export default function HRMAssets() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { employees } = useHRM();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Asset management state
  const [addAssetDialogOpen, setAddAssetDialogOpen] = useState(false);
  const [assignAssetDialogOpen, setAssignAssetDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetDetailsOpen, setAssetDetailsOpen] = useState(false);
  const [assetDetails, setAssetDetails] = useState<AssetRecord | null>(null);
  const [editAssetDialogOpen, setEditAssetDialogOpen] = useState(false);
  const [editAssetDocuments, setEditAssetDocuments] = useState<string[]>([]);
  const [editAssetForm, setEditAssetForm] = useState({
    id: '',
    assetName: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchaseValue: '',
    currentValue: '',
    location: '',
    condition: '',
    status: 'available' as AssetRecord['status'],
    warrantyExpiry: ''
  });
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('all');
  const [assetStatusFilter, setAssetStatusFilter] = useState('all');
  const [addAssetCategory, setAddAssetCategory] = useState('');
  const [addCustomCategory, setAddCustomCategory] = useState('');
  const [assignmentLocation, setAssignmentLocation] = useState('');
  const [customAssignmentLocation, setCustomAssignmentLocation] = useState('');
  const [assignmentEmployeeId, setAssignmentEmployeeId] = useState('');
  const [assignmentDate, setAssignmentDate] = useState(formatDate(new Date()));
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [addAssetDocuments, setAddAssetDocuments] = useState<File[]>([]);
  const [addAssetForm, setAddAssetForm] = useState({
    assetName: '',
    subcategory: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchaseValue: '',
    currentValue: '',
    location: '',
    warrantyExpiry: '',
    condition: '',
    notes: ''
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    assetId: '',
    vendor: '',
    customVendor: '',
    issueDetails: '',
    issueDate: '',
    givenDate: '',
    returnDate: '',
    serviceCost: ''
  });

  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);

  const employeeMap = useMemo(() => {
    return new Map(
      employees.map((emp) => [emp.id, emp])
    );
  }, [employees]);

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    const initials = parts.map((part) => part[0]?.toUpperCase()).slice(0, 2).join('');
    return initials || 'UN';
  };

  const parseCurrencyNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return 0;
    const normalized = String(value).replace(/[₹,]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const mapApiAssetToRecord = (asset: any): AssetRecord => {
    const assignedEmployee = asset.assigned_to_employee_id
      ? employeeMap.get(asset.assigned_to_employee_id)
      : null;
    const assignedName = assignedEmployee?.name || assignedEmployee?.full_name || 'Unassigned';
    const assignedId = assignedEmployee?.id || '-';

    return {
      id: asset.id,
      assetName: asset.asset_name || 'Asset',
      category: asset.category || 'General',
      subcategory: asset.subcategory || 'General',
      brand: asset.brand || 'Unknown',
      model: asset.model || '-',
      serialNumber: asset.serial_number || '-',
      purchaseDate: asset.purchase_date || '-',
      purchaseValue: formatCurrencyValue(asset.purchase_value ?? 0),
      currentValue: formatCurrencyValue(asset.current_value ?? asset.purchase_value ?? 0),
      depreciation: asset.depreciation != null ? `${asset.depreciation}%` : '0%',
      assignedTo: assignedName,
      empId: assignedEmployee ? assignedId : '-',
      department: asset.department || assignedEmployee?.department || 'General',
      assignedDate: asset.assigned_date || '-',
      location: asset.location || 'Main Office',
      condition: asset.condition || 'Good',
      status: asset.status || 'available',
      warrantyExpiry: asset.warranty_expiry || '-',
      lastMaintenance: asset.last_maintenance || '-',
      nextMaintenance: asset.next_maintenance || '-',
      insuranceValue: formatCurrencyValue(asset.insurance_value ?? 0),
      avatar: assignedEmployee ? getInitials(assignedName) : 'UN',
      documents: Array.isArray(asset.documents) ? asset.documents : []
    };
  };

  const fetchAssets = async () => {
    setIsLoadingAssets(true);
    setAssetsError(null);

    try {
      const response = await fetch(`${apiUrl}/hrm/assets`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const data = await response.json();
      const normalized = Array.isArray(data) ? data : [];
      setAssets(normalized.map(mapApiAssetToRecord));
    } catch (err: any) {
      setAssetsError(err.message || 'Failed to load assets');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [employees]);

  const vendorOptions = [
    'Apex IT Services',
    'Prime Hardware Labs',
    'GreenTech Repairs',
    'AutoFleet Care',
    'Z-ERP Authorized Service',
    'Custom'
  ];

  const selectedMaintenanceAsset = useMemo(
    () => assets.find((asset) => asset.id === maintenanceForm.assetId) ?? null,
    [assets, maintenanceForm.assetId]
  );

  const updateAssetRecord = async (assetId: string, payload: Record<string, any>) => {
    const response = await fetch(`${apiUrl}/hrm/assets/${assetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to update asset');
    }

    const data = await response.json();
    const mapped = mapApiAssetToRecord(data);
    setAssets((currentAssets) =>
      currentAssets.map((item) => (item.id === assetId ? mapped : item))
    );
  };

  const createAssetRecord = async (payload: Record<string, any>) => {
    const response = await fetch(`${apiUrl}/hrm/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to create asset');
    }

    const data = await response.json();
    const mapped = mapApiAssetToRecord(data);
    setAssets((currentAssets) => [mapped, ...currentAssets]);
  };

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

  const isMaintenanceDue = (asset: AssetRecord): boolean => {
    const nextMaintenanceDate = toValidDate(asset.nextMaintenance);
    if (!nextMaintenanceDate) {
      return false;
    }
    return nextMaintenanceDate.getTime() <= Date.now();
  };

  const startMaintenance = (asset: AssetRecord) => {
    const now = new Date();
    const today = formatDate(now);

    updateAssetRecord(asset.id, {
      status: 'maintenance',
      last_maintenance: asset.lastMaintenance === '-' ? today : asset.lastMaintenance,
      next_maintenance: addDays(now, 7)
    }).catch((err: any) => {
      toast({
        title: 'Maintenance Update Failed',
        description: err.message || 'Unable to update asset maintenance status.',
        variant: 'destructive'
      });
    });

    toast({
      title: 'Maintenance Scheduled',
      description: `${asset.assetName} is now marked for maintenance.`,
    });
  };

  const completeMaintenance = (asset: AssetRecord) => {
    const now = new Date();
    const today = formatDate(now);

    updateAssetRecord(asset.id, {
      status: asset.assignedTo !== 'Unassigned' ? 'assigned' : 'available',
      last_maintenance: today,
      next_maintenance: addDays(now, 180),
      condition: asset.condition === 'Damaged' ? 'Good' : asset.condition
    }).catch((err: any) => {
      toast({
        title: 'Maintenance Update Failed',
        description: err.message || 'Unable to update asset maintenance status.',
        variant: 'destructive'
      });
    });

    toast({
      title: 'Maintenance Completed',
      description: `${asset.assetName} has been returned to active inventory.`,
    });
  };

  const resetAddAssetForm = () => {
    setAddAssetForm({
      assetName: '',
      subcategory: '',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      purchaseValue: '',
      currentValue: '',
      location: '',
      warrantyExpiry: '',
      condition: '',
      notes: ''
    });
    setAddAssetCategory('');
    setAddCustomCategory('');
    setAddAssetDocuments([]);
  };

  const handleAddAsset = () => {
    const categoryMap: Record<string, string> = {
      'it-equipment': 'IT Equipment',
      vehicle: 'Vehicle',
      'office-equipment': 'Office Equipment',
      furniture: 'Furniture',
      'id-card': 'ID & Access'
    };

    const resolvedCategory = addAssetCategory === 'custom'
      ? (addCustomCategory.trim() || 'Custom')
      : (categoryMap[addAssetCategory] || addAssetCategory || 'Custom');
    const purchaseValueNumeric = Number(addAssetForm.purchaseValue || 0);
    const currentValueNumeric = Number(addAssetForm.currentValue || purchaseValueNumeric || 0);
    const depreciationValue = purchaseValueNumeric > 0
      ? Math.max(0, Math.round(((purchaseValueNumeric - currentValueNumeric) / purchaseValueNumeric) * 100))
      : 0;

    const payload = {
      asset_name: addAssetForm.assetName || 'New Asset',
      category: resolvedCategory,
      subcategory: addAssetForm.subcategory || 'General',
      brand: addAssetForm.brand || 'Unknown',
      model: addAssetForm.model || '-',
      serial_number: addAssetForm.serialNumber || '-',
      purchase_date: addAssetForm.purchaseDate || formatDate(new Date()),
      purchase_value: parseCurrencyNumber(addAssetForm.purchaseValue),
      current_value: parseCurrencyNumber(addAssetForm.currentValue || addAssetForm.purchaseValue),
      depreciation: depreciationValue,
      location: addAssetForm.location || 'Main Office',
      condition: addAssetForm.condition || 'Good',
      status: 'available',
      warranty_expiry: addAssetForm.warrantyExpiry || null,
      insurance_value: parseCurrencyNumber(addAssetForm.purchaseValue),
      documents: addAssetDocuments.map((file) => file.name),
      notes: addAssetForm.notes || null
    };

    createAssetRecord(payload)
      .then(() => {
        toast({
          title: 'Asset Added!',
          description: 'New asset has been registered to the inventory.',
        });
        setAddAssetDialogOpen(false);
        resetAddAssetForm();
      })
      .catch((err: any) => {
        toast({
          title: 'Asset Creation Failed',
          description: err.message || 'Unable to register new asset.',
          variant: 'destructive'
        });
      });
  };

  const handleScheduleMaintenance = () => {
    const asset = assets.find((item) => item.id === maintenanceForm.assetId);
    if (!asset) {
      toast({
        title: 'Select an asset',
        description: 'Choose an asset before scheduling maintenance.',
        variant: 'destructive'
      });
      return;
    }

    const vendorName = maintenanceForm.vendor === 'Custom'
      ? maintenanceForm.customVendor.trim()
      : maintenanceForm.vendor;
    const issueDate = maintenanceForm.issueDate || formatDate(new Date());
    const givenDate = maintenanceForm.givenDate || issueDate;
    const returnDate = maintenanceForm.returnDate || addDays(new Date(), 7);

    updateAssetRecord(asset.id, {
      status: 'maintenance',
      last_maintenance: issueDate,
      next_maintenance: returnDate,
      notes: maintenanceForm.issueDetails || asset.maintenanceIssue || null
    }).catch((err: any) => {
      toast({
        title: 'Maintenance Update Failed',
        description: err.message || 'Unable to schedule maintenance.',
        variant: 'destructive'
      });
    });

    toast({
      title: 'Maintenance Scheduled',
      description: `${asset.assetName} is now scheduled for maintenance.`
    });

    setMaintenanceForm({
      assetId: '',
      vendor: '',
      customVendor: '',
      issueDetails: '',
      issueDate: '',
      givenDate: '',
      returnDate: '',
      serviceCost: ''
    });
  };

  const openAssetDetails = (asset: AssetRecord) => {
    setAssetDetails(asset);
    setAssetDetailsOpen(true);
  };

  const openEditAsset = (asset: AssetRecord) => {
    setEditAssetForm({
      id: asset.id,
      assetName: asset.assetName,
      category: asset.category,
      subcategory: asset.subcategory,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate,
      purchaseValue: asset.purchaseValue.replace(/[₹,]/g, ''),
      currentValue: asset.currentValue.replace(/[₹,]/g, ''),
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      warrantyExpiry: asset.warrantyExpiry
    });
    setEditAssetDocuments(asset.documents ?? []);
    setEditAssetDialogOpen(true);
  };

  const handleSaveAssetEdits = () => {
    const payload = {
      asset_name: editAssetForm.assetName,
      category: editAssetForm.category,
      subcategory: editAssetForm.subcategory,
      brand: editAssetForm.brand,
      model: editAssetForm.model,
      serial_number: editAssetForm.serialNumber,
      purchase_date: editAssetForm.purchaseDate,
      purchase_value: parseCurrencyNumber(editAssetForm.purchaseValue),
      current_value: parseCurrencyNumber(editAssetForm.currentValue),
      location: editAssetForm.location,
      condition: editAssetForm.condition,
      status: editAssetForm.status,
      warranty_expiry: editAssetForm.warrantyExpiry || null,
      documents: editAssetDocuments
    };

    updateAssetRecord(editAssetForm.id, payload)
      .then(() => {
        toast({
          title: 'Asset Updated',
          description: 'Asset details have been updated successfully.'
        });
        setEditAssetDialogOpen(false);
      })
      .catch((err: any) => {
        toast({
          title: 'Asset Update Failed',
          description: err.message || 'Unable to update asset.',
          variant: 'destructive'
        });
      });
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

        {(isLoadingAssets || assetsError) && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            {isLoadingAssets && <span className="text-slate-600">Loading assets...</span>}
            {assetsError && <span className="text-rose-600">{assetsError}</span>}
          </div>
        )}

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
                      <Input
                        id="asset-name"
                        placeholder="e.g., MacBook Pro 16 inch"
                        value={addAssetForm.assetName}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, assetName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asset-category">Category</Label>
                      <Select value={addAssetCategory} onValueChange={setAddAssetCategory}>
                        <SelectTrigger id="asset-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it-equipment">IT Equipment</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="office-equipment">Office Equipment</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="id-card">ID Card & Access</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {addAssetCategory === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-asset-category">Custom Category</Label>
                      <Input
                        id="custom-asset-category"
                        placeholder="Type any category name"
                        value={addCustomCategory}
                        onChange={(e) => setAddCustomCategory(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="asset-subcategory">Subcategory</Label>
                      <Input
                        id="asset-subcategory"
                        placeholder="e.g., Laptop, Printer"
                        value={addAssetForm.subcategory}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, subcategory: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asset-brand">Brand</Label>
                      <Input
                        id="asset-brand"
                        placeholder="e.g., Apple"
                        value={addAssetForm.brand}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, brand: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asset-model">Model</Label>
                      <Input
                        id="asset-model"
                        placeholder="e.g., MacBook Pro M3 Max"
                        value={addAssetForm.model}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, model: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serial-number">Serial Number</Label>
                      <Input
                        id="serial-number"
                        placeholder="e.g., C02YK3QGJG5H"
                        value={addAssetForm.serialNumber}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase-date">Purchase Date</Label>
                      <Input
                        id="purchase-date"
                        type="date"
                        value={addAssetForm.purchaseDate}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, purchaseDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchase-value">Purchase Value (₹)</Label>
                      <Input
                        id="purchase-value"
                        type="number"
                        placeholder="3499"
                        value={addAssetForm.purchaseValue}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, purchaseValue: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-value">Current Value (₹)</Label>
                      <Input
                        id="current-value"
                        type="number"
                        placeholder="3150"
                        value={addAssetForm.currentValue}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, currentValue: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Office - Floor 3, Desk 24"
                      value={addAssetForm.location}
                      onChange={(e) => setAddAssetForm((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warranty-expiry">Warranty Expiry</Label>
                      <Input
                        id="warranty-expiry"
                        type="date"
                        value={addAssetForm.warrantyExpiry}
                        onChange={(e) => setAddAssetForm((prev) => ({ ...prev, warrantyExpiry: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={addAssetForm.condition}
                        onValueChange={(value) => setAddAssetForm((prev) => ({ ...prev, condition: value }))}
                      >
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
                    <Label htmlFor="asset-documents">Asset Documents</Label>
                    <Input
                      id="asset-documents"
                      type="file"
                      multiple
                      className="h-10 cursor-pointer file:mr-3 file:h-9 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-0 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                      onChange={(e) => setAddAssetDocuments(Array.from(e.target.files || []))}
                    />
                    {addAssetDocuments.length > 0 && (
                      <div className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Selected documents:</p>
                        <ul className="space-y-1">
                          {addAssetDocuments.map((file) => (
                            <li key={`${file.name}-${file.lastModified}`} className="text-xs text-slate-600 flex items-center gap-2">
                              <FileText className="h-3 w-3 text-blue-600" />
                              <span className="truncate">{file.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about this asset..."
                      rows={3}
                      value={addAssetForm.notes}
                      onChange={(e) => setAddAssetForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddAssetDialogOpen(false);
                      resetAddAssetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddAsset}
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
                  <SelectItem value="Custom">Custom</SelectItem>
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
                  <h3 className="text-3xl font-black text-emerald-700">₹{Math.round(filteredAssets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[₹$,]/g, '')), 0) / 1000)}K
                  </h3>
                  <p className="text-xs text-emerald-600 mt-1">current valuation</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <IndianRupee className="h-6 w-6 text-emerald-600" />
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
                    {filteredAssets.filter(a => a.status === 'maintenance' || isMaintenanceDue(a)).length}
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
                const totalValue = categoryAssets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[₹$,]/g, '')), 0);
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
                        <span className="font-bold text-slate-900">₹{(totalValue / 1000).toFixed(1)}K</span>
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
                  <p className="text-2xl font-black text-blue-700">₹{Math.round(assets.reduce((acc, a) => acc + parseInt(a.purchaseValue.replace(/[₹$,]/g, '')), 0) / 1000)}K
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Current Value</p>
                  <p className="text-2xl font-black text-emerald-700">₹{Math.round(assets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[₹$,]/g, '')), 0) / 1000)}K
                  </p>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 font-bold uppercase mb-1">Total Depreciation</p>
                    <p className="text-2xl font-black text-red-700">₹{Math.round((assets.reduce((acc, a) => acc + parseInt(a.purchaseValue.replace(/[₹$,]/g, '')), 0) - 
                        assets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[₹$,]/g, '')), 0)) / 1000)}K
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-600 font-bold uppercase mb-1">Average</p>
                    <p className="text-xl font-black text-red-700">
                      {(((assets.reduce((acc, a) => acc + parseInt(a.purchaseValue.replace(/[₹$,]/g, '')), 0) - 
                        assets.reduce((acc, a) => acc + parseInt(a.currentValue.replace(/[₹$,]/g, '')), 0)) / 
                        assets.reduce((acc, a) => acc + parseInt(a.purchaseValue.replace(/[₹$,]/g, '')), 0)) * 100).toFixed(1)}%
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
          <CardContent className="max-h-[70vh] overflow-y-auto">
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
            <div className="max-h-[70vh] overflow-y-auto">
              <Table className="w-full table-fixed">
                <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow>
                  <TableHead className="font-bold">Asset</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Assigned To</TableHead>
                  <TableHead className="font-bold hidden xl:table-cell">Location</TableHead>
                  <TableHead className="text-right font-bold hidden lg:table-cell">Purchase Value</TableHead>
                  <TableHead className="text-right font-bold hidden lg:table-cell">Current Value</TableHead>
                  <TableHead className="text-center font-bold hidden xl:table-cell">Depreciation</TableHead>
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
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[150px] truncate">{asset.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell">
                          <span className="text-sm font-medium text-slate-700">{asset.purchaseValue}</span>
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell">
                          <span className="text-sm font-bold text-emerald-700">{asset.currentValue}</span>
                        </TableCell>
                        <TableCell className="text-center hidden xl:table-cell">
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
                              <DropdownMenuItem onClick={() => openAssetDetails(asset)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAssetDetails(asset)}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditAsset(asset)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Edit Asset
                              </DropdownMenuItem>
                              {asset.status === 'maintenance' ? (
                                <DropdownMenuItem onClick={() => completeMaintenance(asset)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete Maintenance
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => startMaintenance(asset)}>
                                  <CalendarIcon className="h-4 w-4 mr-2" />
                                  Schedule Maintenance
                                </DropdownMenuItem>
                              )}
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
            </div>
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

        {/* Maintenance Intake */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Add Equipment to Maintenance
            </CardTitle>
            <CardDescription>Log maintenance details, vendor, and service timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maintenance-asset">Asset</Label>
                <Select
                  value={maintenanceForm.assetId}
                  onValueChange={(value) => setMaintenanceForm((prev) => ({ ...prev, assetId: value }))}
                >
                  <SelectTrigger id="maintenance-asset">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.assetName} ({asset.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-vendor">Vendor</Label>
                <Select
                  value={maintenanceForm.vendor}
                  onValueChange={(value) => setMaintenanceForm((prev) => ({ ...prev, vendor: value }))}
                >
                  <SelectTrigger id="maintenance-vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorOptions.map((vendor) => (
                      <SelectItem key={vendor} value={vendor}>
                        {vendor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {maintenanceForm.vendor === 'Custom' && (
                  <Input
                    placeholder="Enter vendor name"
                    value={maintenanceForm.customVendor}
                    onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, customVendor: e.target.value }))}
                  />
                )}
              </div>
            </div>

            {selectedMaintenanceAsset && (
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedMaintenanceAsset.assetName}</p>
                    <p className="text-xs text-slate-600">{selectedMaintenanceAsset.brand} {selectedMaintenanceAsset.model}</p>
                    <p className="text-xs text-slate-500">Serial: {selectedMaintenanceAsset.serialNumber}</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                    {selectedMaintenanceAsset.condition}
                  </Badge>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  <p>Assigned: {selectedMaintenanceAsset.assignedTo !== 'Unassigned' ? selectedMaintenanceAsset.assignedTo : 'Unassigned'}</p>
                  <p>Location: {selectedMaintenanceAsset.location}</p>
                  <p>Category: {selectedMaintenanceAsset.category}</p>
                  <p>Warranty: {selectedMaintenanceAsset.warrantyExpiry}</p>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maintenance-issue">Maintenance Issue Details</Label>
                <Textarea
                  id="maintenance-issue"
                  placeholder="Describe the issue or service required"
                  rows={3}
                  value={maintenanceForm.issueDetails}
                  onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, issueDetails: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-cost">Service Cost (₹)</Label>
                <Input
                  id="maintenance-cost"
                  type="number"
                  placeholder="2500"
                  value={maintenanceForm.serviceCost}
                  onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, serviceCost: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="maintenance-issue-date">Issue Date</Label>
                <Input
                  id="maintenance-issue-date"
                  type="date"
                  value={maintenanceForm.issueDate}
                  onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-given-date">Device Given Date</Label>
                <Input
                  id="maintenance-given-date"
                  type="date"
                  value={maintenanceForm.givenDate}
                  onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, givenDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-return-date">Expected Return Date</Label>
                <Input
                  id="maintenance-return-date"
                  type="date"
                  value={maintenanceForm.returnDate}
                  onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, returnDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleScheduleMaintenance}>
                Add to Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>

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
                          <p className="text-xs text-slate-600">
                            {asset.brand} {asset.model} • {asset.serialNumber}
                          </p>
                          <p className="text-xs text-slate-500">
                            {asset.assignedTo !== 'Unassigned' ? `${asset.assignedTo} (${asset.empId})` : asset.location}
                            {asset.maintenanceVendor ? ` • Vendor: ${asset.maintenanceVendor}` : ''}
                          </p>
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
                        onClick={() => {
                          if (asset.status === 'maintenance') {
                            completeMaintenance(asset);
                            return;
                          }
                          startMaintenance(asset);
                        }}
                      >
                        {asset.status === 'maintenance' ? 'Complete' : 'Schedule'}
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={assetDetailsOpen} onOpenChange={setAssetDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Asset Details</DialogTitle>
              <DialogDescription>Complete asset information and attached documents.</DialogDescription>
            </DialogHeader>

            {assetDetails && (
              <div className="space-y-4 py-2">
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{assetDetails.assetName}</p>
                      <p className="text-sm text-slate-600">{assetDetails.brand} {assetDetails.model}</p>
                    </div>
                    <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                      {assetDetails.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Asset ID</p><p className="font-semibold text-slate-900">{assetDetails.id}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Category</p><p className="font-semibold text-slate-900">{assetDetails.category}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Subcategory</p><p className="font-semibold text-slate-900">{assetDetails.subcategory}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Serial Number</p><p className="font-semibold text-slate-900">{assetDetails.serialNumber}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Assigned To</p><p className="font-semibold text-slate-900">{assetDetails.assignedTo}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Location</p><p className="font-semibold text-slate-900">{assetDetails.location}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Condition</p><p className="font-semibold text-slate-900">{assetDetails.condition}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Warranty Expiry</p><p className="font-semibold text-slate-900">{assetDetails.warrantyExpiry}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Purchase Value</p><p className="font-semibold text-slate-900">{assetDetails.purchaseValue}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Current Value</p><p className="font-semibold text-slate-900">{assetDetails.currentValue}</p></CardContent></Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Attached Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {assetDetails.documents.length > 0 ? (
                      <ul className="space-y-2">
                        {assetDetails.documents.map((docName) => (
                          <li key={docName} className="flex items-center gap-2 text-sm text-slate-700">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span>{docName}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No documents attached.</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAssetDetailsOpen(false)}>Close</Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setAssetDetailsOpen(false);
                      openEditAsset(assetDetails);
                    }}
                  >
                    Edit Asset
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={editAssetDialogOpen} onOpenChange={setEditAssetDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Asset</DialogTitle>
              <DialogDescription>Update asset details and documents.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-name">Asset Name</Label>
                  <Input
                    id="edit-asset-name"
                    value={editAssetForm.assetName}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, assetName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-category">Category</Label>
                  <Input
                    id="edit-asset-category"
                    value={editAssetForm.category}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-subcategory">Subcategory</Label>
                  <Input
                    id="edit-asset-subcategory"
                    value={editAssetForm.subcategory}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, subcategory: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-serial">Serial Number</Label>
                  <Input
                    id="edit-asset-serial"
                    value={editAssetForm.serialNumber}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-brand">Brand</Label>
                  <Input
                    id="edit-asset-brand"
                    value={editAssetForm.brand}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-model">Model</Label>
                  <Input
                    id="edit-asset-model"
                    value={editAssetForm.model}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, model: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-location">Location</Label>
                  <Input
                    id="edit-asset-location"
                    value={editAssetForm.location}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-condition">Condition</Label>
                  <Input
                    id="edit-asset-condition"
                    value={editAssetForm.condition}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, condition: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-status">Status</Label>
                  <Select
                    value={editAssetForm.status}
                    onValueChange={(value) => setEditAssetForm((prev) => ({ ...prev, status: value as AssetRecord['status'] }))}
                  >
                    <SelectTrigger id="edit-asset-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-warranty">Warranty Expiry</Label>
                  <Input
                    id="edit-asset-warranty"
                    type="date"
                    value={editAssetForm.warrantyExpiry}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, warrantyExpiry: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-purchase">Purchase Value (₹)</Label>
                  <Input
                    id="edit-asset-purchase"
                    type="number"
                    value={editAssetForm.purchaseValue}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, purchaseValue: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-asset-current">Current Value (₹)</Label>
                  <Input
                    id="edit-asset-current"
                    type="number"
                    value={editAssetForm.currentValue}
                    onChange={(e) => setEditAssetForm((prev) => ({ ...prev, currentValue: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-asset-documents">Asset Documents</Label>
                <Input
                  id="edit-asset-documents"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).map((file) => file.name);
                    if (files.length > 0) {
                      setEditAssetDocuments((prev) => [...prev, ...files]);
                    }
                  }}
                />
                {editAssetDocuments.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Documents:</p>
                    <ul className="space-y-1">
                      {editAssetDocuments.map((docName) => (
                        <li key={docName} className="text-xs text-slate-600 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            {docName}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-red-600"
                            onClick={() => setEditAssetDocuments((prev) => prev.filter((doc) => doc !== docName))}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditAssetDialogOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveAssetEdits}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Asset Assignment Dialog */}
        <Dialog open={assignAssetDialogOpen} onOpenChange={setAssignAssetDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Select value={assignmentEmployeeId} onValueChange={setAssignmentEmployeeId}>
                  <SelectTrigger id="employee-select">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()} - {emp.id} ({emp.department || 'General'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-date">Assignment Date</Label>
                <Input
                  id="assignment-date"
                  type="date"
                  value={assignmentDate}
                  onChange={(e) => setAssignmentDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-location">Work Location</Label>
                <Select value={assignmentLocation} onValueChange={setAssignmentLocation}>
                  <SelectTrigger id="assignment-location">
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    <SelectItem value="office-floor1">Office - Floor 1</SelectItem>
                    <SelectItem value="office-floor2">Office - Floor 2</SelectItem>
                    <SelectItem value="office-floor3">Office - Floor 3</SelectItem>
                    <SelectItem value="office-floor4">Office - Floor 4</SelectItem>
                    <SelectItem value="remote">Remote Work</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="custom">Custom (Type Your Own)</SelectItem>
                  </SelectContent>
                </Select>
                {assignmentLocation === 'custom' && (
                  <Input
                    id="custom-assignment-location"
                    placeholder="Enter custom work location"
                    value={customAssignmentLocation}
                    onChange={(e) => setCustomAssignmentLocation(e.target.value)}
                  />
                )}
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
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
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
                  if (!selectedAsset) {
                    toast({
                      title: 'Select an asset',
                      description: 'Please choose an asset before assigning.',
                      variant: 'destructive'
                    });
                    return;
                  }

                  if (!assignmentEmployeeId) {
                    toast({
                      title: 'Select an employee',
                      description: 'Please choose an employee for this assignment.',
                      variant: 'destructive'
                    });
                    return;
                  }

                  const assignee = employeeMap.get(assignmentEmployeeId);
                  const resolvedLocation = assignmentLocation === 'custom'
                    ? customAssignmentLocation.trim()
                    : assignmentLocation;

                  updateAssetRecord(selectedAsset.id, {
                    assigned_to_employee_id: assignmentEmployeeId,
                    assigned_date: assignmentDate || formatDate(new Date()),
                    department: assignee?.department || selectedAsset.department,
                    location: resolvedLocation || selectedAsset.location,
                    status: 'assigned',
                    notes: assignmentNotes || null
                  })
                    .then(() => {
                      toast({
                        title: 'Asset Assigned!',
                        description: `${selectedAsset.assetName} has been assigned successfully${resolvedLocation ? ` at ${resolvedLocation}` : ''}.`
                      });
                      setAssignAssetDialogOpen(false);
                      setSelectedAsset(null);
                      setAssignmentLocation('');
                      setCustomAssignmentLocation('');
                      setAssignmentEmployeeId('');
                      setAssignmentNotes('');
                    })
                    .catch((err: any) => {
                      toast({
                        title: 'Assignment Failed',
                        description: err.message || 'Unable to assign asset.',
                        variant: 'destructive'
                      });
                    });
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

