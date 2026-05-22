import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { useHRM } from '@/contexts/HRMContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Upload,
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  Heart,
  Users,
  TrendingUp,
  PieChart,
  BarChart3,
  Pencil
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Insurance() {
  const [, setLocation] = useLocation();
  const { employees } = useHRM();
  const [activeTab, setActiveTab] = useState('policies');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [policyStatusFilter, setPolicyStatusFilter] = useState('all');
  const [policyProviderFilter, setPolicyProviderFilter] = useState('all');
  const [policyStartFromFilter, setPolicyStartFromFilter] = useState('');
  const [policyEndToFilter, setPolicyEndToFilter] = useState('');
  const [isPolicyFilterDialogOpen, setIsPolicyFilterDialogOpen] = useState(false);
  const [newPolicyEmployeeId, setNewPolicyEmployeeId] = useState('');
  const [newPolicyType, setNewPolicyType] = useState('');
  const [customPolicyType, setCustomPolicyType] = useState('');
  const [newPolicyNumber, setNewPolicyNumber] = useState('');
  const [newPolicyProvider, setNewPolicyProvider] = useState('');
  const [newPolicyCoverage, setNewPolicyCoverage] = useState('');
  const [newPolicyPremium, setNewPolicyPremium] = useState('');
  const [newPolicyFrequency, setNewPolicyFrequency] = useState('monthly');
  const [newPolicyStartDate, setNewPolicyStartDate] = useState('');
  const [newPolicyEndDate, setNewPolicyEndDate] = useState('');
  const [newClaimEmployeeId, setNewClaimEmployeeId] = useState('');
  const [newClaimPolicyId, setNewClaimPolicyId] = useState('');
  const [newClaimAmount, setNewClaimAmount] = useState('');
  const [newClaimDate, setNewClaimDate] = useState('');
  const [newClaimDescription, setNewClaimDescription] = useState('');
  const [claimDocuments, setClaimDocuments] = useState<File[]>([]);
  const [policyDocuments, setPolicyDocuments] = useState<File[]>([]);
  const [isPolicyDetailsOpen, setIsPolicyDetailsOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [isEditPolicyDialogOpen, setIsEditPolicyDialogOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState('');
  const [editExistingPolicyDocuments, setEditExistingPolicyDocuments] = useState<string[]>([]);
  const [editPolicyDocuments, setEditPolicyDocuments] = useState<File[]>([]);
  const [editPolicyForm, setEditPolicyForm] = useState({
    policyType: '',
    provider: '',
    coverage: '',
    premium: '',
    startDate: '',
    endDate: '',
    status: 'active',
  });
  const { toast } = useToast();
  
  // Insurance policies - will be populated from API
  const [policies, setPolicies] = useState<any[]>([]);

  // Mock data - Claims
  // Insurance claims - will be populated from API
  const [claims, setClaims] = useState<any[]>([]);

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const employeeName = String(p.employee || '');
      const policyNumber = String(p.policyNumber || '');
      const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || p.policyType === typeFilter;
      const matchesStatus = policyStatusFilter === 'all' || p.status === policyStatusFilter;
      const matchesProvider = policyProviderFilter === 'all' || p.provider === policyProviderFilter;
      const matchesStartFrom = !policyStartFromFilter || new Date(p.startDate) >= new Date(policyStartFromFilter);
      const matchesEndTo = !policyEndToFilter || new Date(p.endDate) <= new Date(policyEndToFilter);
      return matchesSearch && matchesType && matchesStatus && matchesProvider && matchesStartFrom && matchesEndTo;
    });
  }, [policies, searchQuery, typeFilter, policyStatusFilter, policyProviderFilter, policyStartFromFilter, policyEndToFilter]);

  const uniqueProviders = useMemo(() => {
    return Array.from(new Set(policies.map((policy) => policy.provider))).sort();
  }, [policies]);

  const resetPolicyFilters = () => {
    setPolicyStatusFilter('all');
    setPolicyProviderFilter('all');
    setPolicyStartFromFilter('');
    setPolicyEndToFilter('');
  };

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchesSearch = c.employee.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || c.policyType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [claims, searchQuery, typeFilter]);

  const handleExport = (format: 'excel' | 'pdf') => {
    toast({ title: `Exporting ${activeTab}...` });
    
    if (format === 'excel') {
      const data = activeTab === 'policies' ? filteredPolicies : filteredClaims;
      exportToExcel(data, `Insurance_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.text(`Insurance ${activeTab} Report`, 14, 15);
      if (activeTab === 'policies') {
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Employee', 'Policy Type', 'Policy #', 'Coverage', 'Status']],
          body: filteredPolicies.map(item => [item.id, item.employee, item.policyType, item.policyNumber, item.coverage, item.status]),
        });
      } else {
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Employee', 'Policy Type', 'Amount', 'Date', 'Status']],
          body: filteredClaims.map(item => [item.id, item.employee, item.policyType, item.claimAmount, item.claimDate, item.status]),
        });
      }
      doc.save(`Insurance_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const handleClaimAction = async (claimId: string, status: 'approved' | 'rejected') => {
    try {
      const targetClaim = claims.find((claim) => claim.id === claimId);
      const approvedAmount = status === 'approved' ? targetClaim?.claimAmountValue : 0;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/hrm/insurance-claims/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approved_amount: approvedAmount })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to update claim');
      }

      await fetchClaims();
      toast({
        title: `Claim ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `Claim ${claimId} has been ${status}.`
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update claim status.',
        variant: 'destructive'
      });
    }
  };

  const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
    active: { label: 'Active', class: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    expired: { label: 'Expired', class: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    approved: { label: 'Approved', class: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle }
  };

  const handlePolicyDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPolicyDocuments(files);
  };

  const handleClaimDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setClaimDocuments(files);
  };

  const resetNewPolicyForm = () => {
    setNewPolicyEmployeeId('');
    setNewPolicyType('');
    setCustomPolicyType('');
    setNewPolicyNumber('');
    setNewPolicyProvider('');
    setNewPolicyCoverage('');
    setNewPolicyPremium('');
    setNewPolicyFrequency('monthly');
    setNewPolicyStartDate('');
    setNewPolicyEndDate('');
    setPolicyDocuments([]);
  };

  const resetNewClaimForm = () => {
    setNewClaimEmployeeId('');
    setNewClaimPolicyId('');
    setNewClaimAmount('');
    setNewClaimDate('');
    setNewClaimDescription('');
    setClaimDocuments([]);
  };

  const fetchPolicies = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/hrm/insurance-policies`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insurance policies');
      }

      const data = await response.json();
      const normalized = (Array.isArray(data) ? data : []).map((policy: any) => {
        const employee = policy.employee || {};
        const name = employee.name || employee.full_name || employee.fullName || 'Unknown Employee';
        const coverageAmount = policy.coverage_amount ?? policy.coverageAmount ?? policy.coverage;
        const premiumAmount = policy.premium_amount ?? policy.premiumAmount ?? policy.premium;
        return {
          ...policy,
          employee: name,
          empId: employee.id || policy.employee_id || 'N/A',
          avatar: name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'EE',
          policyType: policy.policy_type || policy.policyType || policy.policy_name || policy.policyName,
          policyNumber: policy.policy_number || policy.policyNumber || policy.policy_no || policy.policyNo,
          coverage: coverageAmount !== undefined ? `₹${coverageAmount}` : '-',
          premium: premiumAmount !== undefined ? `₹${premiumAmount}` : '-',
          startDate: policy.start_date || policy.startDate,
          endDate: policy.end_date || policy.endDate,
          status: policy.status || 'active',
          documents: policy.documents || []
        };
      });

      setPolicies(normalized);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load insurance policies.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchClaims = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/hrm/insurance-claims`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insurance claims');
      }

      const data = await response.json();
      const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));
      const policyMap = new Map(policies.map((policy) => [policy.id, policy]));
      const normalized = (Array.isArray(data) ? data : []).map((claim: any) => {
        const employee = employeeMap.get(claim.employee_id);
        const policy = policyMap.get(claim.policy_id);
        const employeeName = employee?.name || 'Unknown Employee';
        const policyType = policy?.policyType || policy?.policy_type || 'Insurance Policy';
        return {
          ...claim,
          employee: employeeName,
          empId: employee?.id || claim.employee_id || 'N/A',
          avatar: employeeName.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'EE',
          policyType,
          claimAmountValue: claim.claim_amount ?? 0,
          claimAmount: claim.claim_amount !== undefined ? `₹${claim.claim_amount}` : claim.claimAmount,
          approvedAmount: claim.approved_amount !== undefined ? `₹${claim.approved_amount}` : claim.approvedAmount,
          claimDate: claim.claim_date || claim.claimDate,
          description: claim.description || '',
          status: claim.status || 'pending',
          documents: claim.documents || []
        };
      });

      setClaims(normalized);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load insurance claims.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [employees, policies]);

  const handleAddPolicy = async () => {
    const resolvedType = newPolicyType === 'custom' ? customPolicyType.trim() : newPolicyType.trim();

    if (!newPolicyEmployeeId || !resolvedType || !newPolicyProvider.trim() || !newPolicyCoverage.trim() || !newPolicyPremium.trim() || !newPolicyStartDate || !newPolicyEndDate || !newPolicyNumber.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required policy fields.',
        variant: 'destructive'
      });
      return;
    }

    if (new Date(newPolicyStartDate) > new Date(newPolicyEndDate)) {
      toast({
        title: 'Invalid dates',
        description: 'End date cannot be before start date.',
        variant: 'destructive'
      });
      return;
    }

    const coverageAmount = Number.parseFloat(String(newPolicyCoverage).replace(/[^0-9.]/g, ''));
    const premiumAmount = Number.parseFloat(String(newPolicyPremium).replace(/[^0-9.]/g, ''));

    if (!Number.isFinite(coverageAmount) || !Number.isFinite(premiumAmount)) {
      toast({
        title: 'Invalid amounts',
        description: 'Coverage and premium must be valid numbers.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const payload = {
        employee_id: newPolicyEmployeeId,
        policy_type: resolvedType,
        provider: newPolicyProvider.trim(),
        policy_number: newPolicyNumber.trim(),
        coverage_amount: coverageAmount,
        premium_amount: premiumAmount,
        premium_frequency: newPolicyFrequency,
        start_date: newPolicyStartDate,
        end_date: newPolicyEndDate,
        status: 'active',
        documents: policyDocuments.map((file) => file.name)
      };

      const response = await fetch(`${apiUrl}/hrm/insurance-policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to create policy');
      }

      await fetchPolicies();
      resetNewPolicyForm();

      toast({
        title: 'Policy Added',
        description: 'Insurance policy was created successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create policy.',
        variant: 'destructive'
      });
    }
  };

  const handleAddClaim = async () => {
    if (!newClaimEmployeeId || !newClaimPolicyId || !newClaimAmount.trim() || !newClaimDate) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required claim fields.',
        variant: 'destructive'
      });
      return;
    }

    const claimAmount = Number.parseFloat(String(newClaimAmount).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(claimAmount)) {
      toast({
        title: 'Invalid amount',
        description: 'Claim amount must be a valid number.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const payload = {
        employee_id: newClaimEmployeeId,
        policy_id: newClaimPolicyId,
        claim_amount: claimAmount,
        claim_date: newClaimDate,
        description: newClaimDescription.trim(),
        status: 'pending',
        documents: claimDocuments.map((file) => file.name)
      };

      const response = await fetch(`${apiUrl}/hrm/insurance-claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to create claim');
      }

      await fetchClaims();
      resetNewClaimForm();
      toast({
        title: 'Claim Submitted',
        description: 'Insurance claim was created successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create claim.',
        variant: 'destructive'
      });
    }
  };

  const handleViewPolicyDetails = (policy: any) => {
    setSelectedPolicy(policy);
    setIsPolicyDetailsOpen(true);
  };

  const handleDownloadPolicyPdf = (policy: any) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Insurance Policy Details', 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Field', 'Value']],
      body: [
        ['Employee', `${policy.employee} (${policy.empId})`],
        ['Policy ID', policy.id],
        ['Policy Type', policy.policyType],
        ['Provider', policy.provider],
        ['Policy Number', policy.policyNumber],
        ['Coverage', policy.coverage],
        ['Premium', policy.premium],
        ['Start Date', policy.startDate],
        ['End Date', policy.endDate],
        ['Status', statusConfig[policy.status]?.label || policy.status],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] },
      theme: 'striped',
    });

    const documents = Array.isArray(policy.documents) && policy.documents.length > 0
      ? policy.documents
      : ['No documents attached'];

    autoTable(doc, {
      startY: ((doc as any).lastAutoTable?.finalY || 60) + 8,
      head: [['Documents']],
      body: documents.map((fileName: string) => [fileName]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59] },
      theme: 'grid',
    });

    doc.save(`Insurance_${policy.id}_${policy.employee.replace(/\s+/g, '_')}.pdf`);
  };

  const handleOpenEditPolicy = (policy: any) => {
    setEditingPolicyId(policy.id);
    setEditExistingPolicyDocuments(Array.isArray(policy.documents) ? policy.documents : []);
    setEditPolicyDocuments([]);
    setEditPolicyForm({
      policyType: policy.policyType,
      provider: policy.provider,
      coverage: policy.coverage,
      premium: policy.premium,
      startDate: policy.startDate,
      endDate: policy.endDate,
      status: policy.status,
    });
    setIsEditPolicyDialogOpen(true);
  };

  const handleEditPolicyDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setEditPolicyDocuments(files);
  };

  const handleRemoveExistingPolicyDocument = (docName: string) => {
    setEditExistingPolicyDocuments((prev) => prev.filter((doc) => doc !== docName));
  };

  const handleSavePolicyEdit = () => {
    if (!editingPolicyId) {
      return;
    }

    if (!editPolicyForm.policyType.trim() || !editPolicyForm.provider.trim() || !editPolicyForm.coverage.trim() || !editPolicyForm.premium.trim() || !editPolicyForm.startDate || !editPolicyForm.endDate) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required policy fields.',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(editPolicyForm.startDate) > new Date(editPolicyForm.endDate)) {
      toast({
        title: 'Invalid dates',
        description: 'End date cannot be before start date.',
        variant: 'destructive',
      });
      return;
    }

    setPolicies((prev) => prev.map((policy) => (
      policy.id === editingPolicyId
        ? {
            ...policy,
            policyType: editPolicyForm.policyType.trim(),
            provider: editPolicyForm.provider.trim(),
            coverage: editPolicyForm.coverage.trim(),
            premium: editPolicyForm.premium.trim(),
            startDate: editPolicyForm.startDate,
            endDate: editPolicyForm.endDate,
            status: editPolicyForm.status,
            documents: [
              ...editExistingPolicyDocuments,
              ...editPolicyDocuments.map((file) => file.name),
            ],
          }
        : policy
    )));

    toast({
      title: 'Policy Updated',
      description: `Policy ${editingPolicyId} has been updated successfully.`,
    });

    setIsEditPolicyDialogOpen(false);
    setEditingPolicyId('');
    setEditPolicyDocuments([]);
    setEditExistingPolicyDocuments([]);
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
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Insurance Management</h1>
                <p className="text-sm text-slate-600">Manage employee insurance policies and claims</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-white font-medium">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Insurance Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Insurance Types</SelectItem>
                <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                <SelectItem value="Accident Insurance">Accident Insurance</SelectItem>
                <SelectItem value="Disability Insurance">Disability Insurance</SelectItem>
                <SelectItem value="Dental Insurance">Dental Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                  Excel Format
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <Printer className="h-4 w-4 mr-2 text-rose-600" />
                  PDF Summary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Insurance Policy</DialogTitle>
                  <DialogDescription>Create a new insurance policy for an employee</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Select value={newPolicyEmployeeId} onValueChange={setNewPolicyEmployeeId}>
                      <SelectTrigger id="employee">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No employees found
                          </SelectItem>
                        ) : (
                          employees.map((employee) => (
                            <SelectItem key={employee.id} value={String(employee.id)}>
                              {employee.name || 'Unnamed Employee'} ({employee.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy-type">Policy Type</Label>
                    <Select
                      value={newPolicyType}
                      onValueChange={(value) => {
                        setNewPolicyType(value);
                        if (value !== 'custom') {
                          setCustomPolicyType('');
                        }
                      }}
                    >
                      <SelectTrigger id="policy-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                        <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                        <SelectItem value="Accident Insurance">Accident Insurance</SelectItem>
                        <SelectItem value="custom">Custom (Type your own)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newPolicyType === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-policy-type">Custom Policy Type</Label>
                      <Input
                        id="custom-policy-type"
                        placeholder="Enter your policy type"
                        value={customPolicyType}
                        onChange={(e) => setCustomPolicyType(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="policy-number">Policy Number</Label>
                    <Input
                      id="policy-number"
                      placeholder="POL-2026-001"
                      value={newPolicyNumber}
                      onChange={(e) => setNewPolicyNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      placeholder="Insurance provider name"
                      value={newPolicyProvider}
                      onChange={(e) => setNewPolicyProvider(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverage">Coverage Amount</Label>
                      <Input
                        id="coverage"
                        placeholder="₹50,000"
                        value={newPolicyCoverage}
                        onChange={(e) => setNewPolicyCoverage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="premium">Premium</Label>
                      <Input
                        id="premium"
                        placeholder="₹200"
                        value={newPolicyPremium}
                        onChange={(e) => setNewPolicyPremium(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premium-frequency">Premium Frequency</Label>
                    <Select value={newPolicyFrequency} onValueChange={setNewPolicyFrequency}>
                      <SelectTrigger id="premium-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newPolicyStartDate}
                        onChange={(e) => setNewPolicyStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newPolicyEndDate}
                        onChange={(e) => setNewPolicyEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy-documents">Policy Documents</Label>
                    <Input
                      id="policy-documents"
                      type="file"
                      multiple
                      accept="*/*"
                      onChange={handlePolicyDocumentChange}
                    />
                    <p className="text-xs text-slate-500">Upload any related policy document(s).</p>
                    {policyDocuments.length > 0 && (
                      <div className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Selected files:</p>
                        <ul className="space-y-1">
                          {policyDocuments.map((file) => (
                            <li key={`${file.name}-${file.lastModified}`} className="text-xs text-slate-600 flex items-center gap-1">
                              <Upload className="h-3 w-3" />
                              <span>{file.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetNewPolicyForm}>Cancel</Button>
                  <Button onClick={handleAddPolicy}>Add Policy</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{policies.filter(p => p.status === 'active').length}</p>
                  <p className="text-xs text-slate-600">Active Policies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{claims.filter(c => c.status === 'approved').length}</p>
                  <p className="text-xs text-slate-600">Claims Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{claims.filter(c => c.status === 'pending').length}</p>
                  <p className="text-xs text-slate-600">Pending Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">₹{Math.round(policies.reduce((acc, p) => {
                    const raw = p.coverage ?? '';
                    const amount = Number.parseFloat(String(raw).replace(/[₹$, ]/g, ''));
                    return acc + (Number.isFinite(amount) ? amount : 0);
                  }, 0) / 1000)}K</p>
                  <p className="text-xs text-slate-600">Total Coverage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="policies">Active Policies</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="types">Insurance Types</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
          </TabsList>

          {/* Active Policies */}
          <TabsContent value="policies" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Active Insurance Policies</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search policies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsPolicyFilterDialogOpen(true)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Policy Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Policy Number</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => {
                      const StatusIcon = statusConfig[policy.status].icon;
                      return (
                        <TableRow key={policy.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                  {policy.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{policy.employee}</p>
                                <p className="text-xs text-slate-600">{policy.empId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{policy.policyType}</TableCell>
                          <TableCell className="text-sm">{policy.provider}</TableCell>
                          <TableCell className="text-sm font-mono">{policy.policyNumber}</TableCell>
                          <TableCell className="text-sm font-semibold">{policy.coverage}</TableCell>
                          <TableCell className="text-sm">{policy.premium}</TableCell>
                          <TableCell className="text-sm">{policy.endDate}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig[policy.status].class}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[policy.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleViewPolicyDetails(policy)}>
                                <FileText className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => handleOpenEditPolicy(policy)}>
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
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
          </TabsContent>

          {/* Claims */}
          <TabsContent value="claims" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Insurance Claims</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      File Claim
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>File Insurance Claim</DialogTitle>
                      <DialogDescription>Submit a new insurance claim for review</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="claim-employee">Employee</Label>
                        <Select value={newClaimEmployeeId} onValueChange={setNewClaimEmployeeId}>
                          <SelectTrigger id="claim-employee">
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No employees found
                              </SelectItem>
                            ) : (
                              employees.map((employee) => (
                                <SelectItem key={employee.id} value={String(employee.id)}>
                                  {employee.name || 'Unnamed Employee'} ({employee.id})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claim-policy">Policy</Label>
                        <Select value={newClaimPolicyId} onValueChange={setNewClaimPolicyId}>
                          <SelectTrigger id="claim-policy">
                            <SelectValue placeholder="Select policy" />
                          </SelectTrigger>
                          <SelectContent>
                            {policies.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No policies found
                              </SelectItem>
                            ) : (
                              policies.map((policy) => (
                                <SelectItem key={policy.id} value={String(policy.id)}>
                                  {policy.policyType || 'Policy'} - {policy.policyNumber || policy.id}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claim-amount">Claim Amount</Label>
                        <Input
                          id="claim-amount"
                          placeholder="₹2,500"
                          value={newClaimAmount}
                          onChange={(e) => setNewClaimAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claim-date">Claim Date</Label>
                        <Input
                          id="claim-date"
                          type="date"
                          value={newClaimDate}
                          onChange={(e) => setNewClaimDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claim-description">Description</Label>
                        <Textarea
                          id="claim-description"
                          placeholder="Provide details about the claim..."
                          rows={3}
                          value={newClaimDescription}
                          onChange={(e) => setNewClaimDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claim-documents">Supporting Documents</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="claim-documents"
                            type="file"
                            multiple
                            onChange={handleClaimDocumentChange}
                          />
                          <Button variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={resetNewClaimForm}>Cancel</Button>
                      <Button onClick={handleAddClaim}>Submit Claim</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Policy Type</TableHead>
                      <TableHead>Claim Amount</TableHead>
                      <TableHead>Claim Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Approved Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => {
                      const StatusIcon = statusConfig[claim.status].icon;
                      return (
                        <TableRow key={claim.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                  {claim.avatar}
                                  {claim.employee.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{claim.employee}</p>
                                <p className="text-xs text-slate-600">{claim.empId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{claim.policyType}</TableCell>
                          <TableCell className="text-sm font-semibold">{claim.claimAmount}</TableCell>
                          <TableCell className="text-sm">{claim.claimDate}</TableCell>
                          <TableCell className="text-sm text-slate-600 max-w-xs truncate">{claim.description}</TableCell>
                          <TableCell className="text-sm font-semibold text-green-600">{claim.approvedAmount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig[claim.status].class}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[claim.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {claim.status === 'pending' ? (
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="text-green-600 font-bold" onClick={() => handleClaimAction(claim.id, 'approved')}>
                                  Approve
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 font-bold" onClick={() => handleClaimAction(claim.id, 'rejected')}>
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                <FileText className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insurance Types */}
          <TabsContent value="types" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Health Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Active Policies</span>
                      <span className="font-semibold">185</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Coverage</span>
                      <span className="font-semibold">₹9.25M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Monthly Premium</span>
                      <span className="font-semibold">₹37K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Life Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Active Policies</span>
                      <span className="font-semibold">150</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Coverage</span>
                      <span className="font-semibold">₹15M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Monthly Premium</span>
                      <span className="font-semibold">₹22.5K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Accident Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Active Policies</span>
                      <span className="font-semibold">120</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Coverage</span>
                      <span className="font-semibold">₹6M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Monthly Premium</span>
                      <span className="font-semibold">₹12K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Coverage */}
          <TabsContent value="coverage" className="space-y-6 mt-6">
            {/* Coverage Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-blue-200 bg-blue-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Coverage</p>
                      <h3 className="text-3xl font-black text-blue-700">₹{Math.round(policies.reduce((acc, p) => acc + parseInt(p.coverage.replace(/[₹$, ]/g, '')), 0) / 1000)}K
                      </h3>
                      <p className="text-xs text-blue-600 mt-1">across all policies</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Health Coverage</p>
                      <h3 className="text-3xl font-black text-emerald-700">₹{Math.round(policies.filter(p => p.policyType === 'Health Insurance').reduce((acc, p) => acc + parseInt(p.coverage.replace(/[₹$, ]/g, '')), 0) / 1000)}K
                      </h3>
                      <p className="text-xs text-emerald-600 mt-1">{policies.filter(p => p.policyType === 'Health Insurance').length} policies</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Heart className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-violet-200 bg-violet-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Life Coverage</p>
                      <h3 className="text-3xl font-black text-violet-700">₹{Math.round(policies.filter(p => p.policyType === 'Life Insurance').reduce((acc, p) => acc + parseInt(p.coverage.replace(/[₹$, ]/g, '')), 0) / 1000)}K
                      </h3>
                      <p className="text-xs text-violet-600 mt-1">{policies.filter(p => p.policyType === 'Life Insurance').length} policies</p>
                    </div>
                    <div className="p-3 bg-violet-100 rounded-xl">
                      <Users className="h-6 w-6 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Avg Per Employee</p>
                      <h3 className="text-3xl font-black text-amber-700">₹{Math.round((policies.reduce((acc, p) => acc + parseInt(p.coverage.replace(/[₹$, ]/g, '')), 0) / policies.length) / 1000)}K
                      </h3>
                      <p className="text-xs text-amber-600 mt-1">coverage amount</p>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coverage by Type Breakdown */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Coverage Distribution
                  </CardTitle>
                  <CardDescription>Insurance coverage breakdown by type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['Health Insurance', 'Life Insurance', 'Accident Insurance'].map(type => {
                    const typePolicies = policies.filter(p => p.policyType === type);
                    const totalCoverage = typePolicies.reduce((acc, p) => acc + parseInt(p.coverage.replace(/[₹$, ]/g, '')), 0);
                    const percentage = (totalCoverage / policies.reduce((acc, p) => acc + parseInt(p.coverage.replace(/[₹$, ]/g, '')), 0)) * 100;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{type}</span>
                          <span className="font-bold text-slate-900">₹{(totalCoverage / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={percentage} 
                            className={cn(
                              "h-2 flex-1",
                              type === 'Health Insurance' ? "[&>div]:bg-emerald-500" : 
                              type === 'Life Insurance' ? "[&>div]:bg-violet-500" : "[&>div]:bg-blue-500"
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
                    Provider Analysis
                  </CardTitle>
                  <CardDescription>Coverage amount by insurance provider</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from(new Set(policies.map(p => p.provider))).map(provider => {
                    const providerPolicies = policies.filter(p => p.provider === provider);
                    const totalCoverage = providerPolicies.reduce((acc, p) => acc + parseInt(p.coverage.replace(/[₹$, ]/g, '')), 0);
                    const maxCoverage = Math.max(...Array.from(new Set(policies.map(p => p.provider))).map(prov => 
                      policies.filter(p => p.provider === prov).reduce((acc, p) => acc + parseInt(p.coverage.replace(/[₹$, ]/g, '')), 0)
                    ));
                    const percentage = (totalCoverage / maxCoverage) * 100;
                    
                    return (
                      <div key={provider} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{provider}</span>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">₹{(totalCoverage / 1000).toFixed(0)}K</span>
                            <span className="text-xs text-slate-500 ml-2">({providerPolicies.length} policies)</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2 [&>div]:bg-violet-500" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Coverage Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Employee Coverage Details</CardTitle>
                <CardDescription>Individual coverage amounts and policy information</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Employee</TableHead>
                      <TableHead className="font-bold">Policy Type</TableHead>
                      <TableHead className="font-bold">Provider</TableHead>
                      <TableHead className="text-right font-bold">Coverage Amount</TableHead>
                      <TableHead className="text-right font-bold">Premium</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map(policy => (
                      <TableRow key={policy.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">{policy.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900">{policy.employee}</p>
                              <p className="text-xs text-slate-500">{policy.empId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {policy.policyType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">{policy.provider}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-blue-700 text-lg">{policy.coverage}</span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-slate-700">{policy.premium}</TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              "font-bold text-xs",
                              policy.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                              policy.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {policy.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isPolicyDetailsOpen} onOpenChange={setIsPolicyDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Employee Insurance Details</DialogTitle>
              <DialogDescription>Complete insurance details with attached documents.</DialogDescription>
            </DialogHeader>

            {selectedPolicy && (
              <div className="space-y-4 py-2">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{selectedPolicy.employee}</p>
                      <p className="text-sm text-slate-600">{selectedPolicy.empId}</p>
                    </div>
                    <Badge variant="outline" className={statusConfig[selectedPolicy.status].class}>
                      {statusConfig[selectedPolicy.status].label}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Policy Type</p><p className="font-semibold text-slate-900">{selectedPolicy.policyType}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Provider</p><p className="font-semibold text-slate-900">{selectedPolicy.provider}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Policy Number</p><p className="font-semibold text-slate-900">{selectedPolicy.policyNumber}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Policy ID</p><p className="font-semibold text-slate-900">{selectedPolicy.id}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Coverage</p><p className="font-semibold text-slate-900">{selectedPolicy.coverage}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Premium</p><p className="font-semibold text-slate-900">{selectedPolicy.premium}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">Start Date</p><p className="font-semibold text-slate-900">{selectedPolicy.startDate}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-slate-500">End Date</p><p className="font-semibold text-slate-900">{selectedPolicy.endDate}</p></CardContent></Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Policy Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(selectedPolicy.documents) && selectedPolicy.documents.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPolicy.documents.map((docName: string) => (
                          <li key={docName} className="flex items-center gap-2 text-sm text-slate-700">
                            <FileText className="h-4 w-4 text-indigo-600" />
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
                  <Button variant="outline" onClick={() => setIsPolicyDetailsOpen(false)}>Close</Button>
                  <Button onClick={() => handleDownloadPolicyPdf(selectedPolicy)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isPolicyFilterDialogOpen} onOpenChange={setIsPolicyFilterDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Policies</DialogTitle>
              <DialogDescription>Apply filters for status, provider and date range.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="filter-status">Status</Label>
                <Select value={policyStatusFilter} onValueChange={setPolicyStatusFilter}>
                  <SelectTrigger id="filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-provider">Provider</Label>
                <Select value={policyProviderFilter} onValueChange={setPolicyProviderFilter}>
                  <SelectTrigger id="filter-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {uniqueProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="filter-start-from">Start Date From</Label>
                  <Input id="filter-start-from" type="date" value={policyStartFromFilter} onChange={(e) => setPolicyStartFromFilter(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-end-to">End Date To</Label>
                  <Input id="filter-end-to" type="date" value={policyEndToFilter} onChange={(e) => setPolicyEndToFilter(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={resetPolicyFilters}>Clear</Button>
                <Button onClick={() => setIsPolicyFilterDialogOpen(false)}>Apply</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditPolicyDialogOpen} onOpenChange={setIsEditPolicyDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Insurance Policy</DialogTitle>
              <DialogDescription>Update policy details and save changes.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-policy-type">Policy Type</Label>
                <Input id="edit-policy-type" value={editPolicyForm.policyType} onChange={(e) => setEditPolicyForm((prev) => ({ ...prev, policyType: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-provider">Provider</Label>
                <Input id="edit-provider" value={editPolicyForm.provider} onChange={(e) => setEditPolicyForm((prev) => ({ ...prev, provider: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-coverage">Coverage</Label>
                  <Input id="edit-coverage" value={editPolicyForm.coverage} onChange={(e) => setEditPolicyForm((prev) => ({ ...prev, coverage: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-premium">Premium</Label>
                  <Input id="edit-premium" value={editPolicyForm.premium} onChange={(e) => setEditPolicyForm((prev) => ({ ...prev, premium: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date">Start Date</Label>
                  <Input id="edit-start-date" type="date" value={editPolicyForm.startDate} onChange={(e) => setEditPolicyForm((prev) => ({ ...prev, startDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-date">End Date</Label>
                  <Input id="edit-end-date" type="date" value={editPolicyForm.endDate} onChange={(e) => setEditPolicyForm((prev) => ({ ...prev, endDate: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editPolicyForm.status} onValueChange={(value) => setEditPolicyForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-policy-documents">Policy Documents</Label>
                <Input id="edit-policy-documents" type="file" multiple accept="*/*" onChange={handleEditPolicyDocumentChange} />

                {editExistingPolicyDocuments.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Existing documents:</p>
                    <ul className="space-y-1">
                      {editExistingPolicyDocuments.map((docName) => (
                        <li key={docName} className="text-xs text-slate-600 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {docName}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-red-600"
                            onClick={() => handleRemoveExistingPolicyDocument(docName)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {editPolicyDocuments.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-2 bg-blue-50/40">
                    <p className="text-xs font-semibold text-slate-700 mb-1">New uploads:</p>
                    <ul className="space-y-1">
                      {editPolicyDocuments.map((file) => (
                        <li key={`${file.name}-${file.lastModified}`} className="text-xs text-slate-600 flex items-center gap-1">
                          <Upload className="h-3 w-3" />
                          <span>{file.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditPolicyDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePolicyEdit}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}

