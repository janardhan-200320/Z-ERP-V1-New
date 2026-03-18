import React, { useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  Mail,
  Printer,
  FileDown,
  ArrowLeft,
  Calendar,
  Settings,
  ShieldCheck,
  Send,
  Check,
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';

export default function HRLetters() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [generationForm, setGenerationForm] = useState({
    template: '',
    employee: '',
    date: new Date().toISOString().split('T')[0],
    format: 'pdf',
    salaryAmount: '',
    designation: '',
    joiningDate: '',
    exitDate: '',
    leaveStartDate: '',
    leaveEndDate: '',
    reason: '',
    customNotes: ''
  });
  const { toast } = useToast();

  // Letter templates
  const letterTemplates = [
    {
      id: 'TEMP001',
      name: 'Offer Letter',
      description: 'Employment offer letter for new hires',
      category: 'Hiring',
      icon: '📝',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'TEMP002',
      name: 'Appointment Letter',
      description: 'Official appointment confirmation',
      category: 'Hiring',
      icon: '✅',
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'TEMP003',
      name: 'Experience Letter',
      description: 'Work experience certificate',
      category: 'Exit',
      icon: '🎓',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'TEMP004',
      name: 'Relieving Letter',
      description: 'Employee relieving certificate',
      category: 'Exit',
      icon: '🚪',
      color: 'bg-orange-100 text-orange-700'
    },
    {
      id: 'TEMP005',
      name: 'Salary Certificate',
      description: 'Salary proof for employees',
      category: 'General',
      icon: '💰',
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 'TEMP006',
      name: 'NOC Letter',
      description: 'No objection certificate',
      category: 'General',
      icon: '📋',
      color: 'bg-cyan-100 text-cyan-700'
    },
    {
      id: 'TEMP007',
      name: 'Leave Request Letter',
      description: 'Formal leave application for planned absence',
      category: 'Attendance',
      icon: '🗓️',
      color: 'bg-emerald-100 text-emerald-700'
    }
  ];

  // Letter history
  const [history, setHistory] = useState([
    {
      id: 'LET001',
      employee: 'John Smith',
      empId: 'EMP001',
      letterType: 'Offer Letter',
      generatedDate: '2025-06-10',
      generatedBy: 'Emily Davis',
      status: 'sent',
      format: 'PDF'
    },
    {
      id: 'LET002',
      employee: 'Mike Brown',
      empId: 'EMP003',
      letterType: 'Appointment Letter',
      generatedDate: '2025-06-12',
      generatedBy: 'Emily Davis',
      status: 'sent',
      format: 'PDF'
    },
    {
      id: 'LET003',
      employee: 'Alex Wilson',
      empId: 'EMP005',
      letterType: 'Salary Certificate',
      generatedDate: '2025-06-14',
      generatedBy: 'Emily Davis',
      status: 'draft',
      format: 'PDF'
    }
  ]);

  const [employees] = useState([
    { id: 'emp1', name: 'John Smith', empId: 'EMP001', designation: 'Senior Engineer', department: 'Engineering', salary: '85000', joiningDate: '2022-03-15' },
    { id: 'emp2', name: 'Sarah Johnson', empId: 'EMP002', designation: 'Product Manager', department: 'Product', salary: '95000', joiningDate: '2021-06-01' },
    { id: 'emp3', name: 'Mike Brown', empId: 'EMP003', designation: 'UI/UX Designer', department: 'Design', salary: '75000', joiningDate: '2023-01-10' }
  ]);

  const handleGenerate = () => {
    if (!generationForm.template || !generationForm.employee) {
      toast({ title: "Validation Error", description: "Please select both a template and an employee.", variant: "destructive" });
      return;
    }

    const selectedTemp = letterTemplates.find(t => t.id === generationForm.template);
    const selectedEmp = employees.find(e => e.id === generationForm.employee);

    // Additional validation for specific letter types
    if (selectedTemp?.id === 'TEMP005' && !generationForm.salaryAmount) {
      toast({ title: "Validation Error", description: "Salary amount is required for salary certificates.", variant: "destructive" });
      return;
    }
    if ((selectedTemp?.id === 'TEMP003' || selectedTemp?.id === 'TEMP004') && !generationForm.exitDate) {
      toast({ title: "Validation Error", description: "Exit date is required for exit-related letters.", variant: "destructive" });
      return;
    }
    if (selectedTemp?.id === 'TEMP007' && (!generationForm.leaveStartDate || !generationForm.leaveEndDate || !generationForm.reason)) {
      toast({ title: "Validation Error", description: "Leave dates and reason are required for leave request letters.", variant: "destructive" });
      return;
    }
    
    toast({ title: "Generating Letter", description: `Creating ${selectedTemp?.name} for ${selectedEmp?.name}...` });
    
    setTimeout(() => {
      const newLetter = {
        id: `LET00${history.length + 1}`,
        employee: selectedEmp?.name || '',
        empId: selectedEmp?.empId || '',
        letterType: selectedTemp?.name || '',
        generatedDate: generationForm.date,
        generatedBy: 'Emily Davis',
        status: 'sent',
        format: generationForm.format.toUpperCase()
      };
      setHistory([newLetter, ...history]);
      setIsGenerateDialogOpen(false);
      
      // Reset form
      setGenerationForm({
        template: '',
        employee: '',
        date: new Date().toISOString().split('T')[0],
        format: 'pdf',
        salaryAmount: '',
        designation: '',
        joiningDate: '',
        exitDate: '',
        leaveStartDate: '',
        leaveEndDate: '',
        reason: '',
        customNotes: ''
      });
      
      toast({ 
        title: "Success", 
        description: `${selectedTemp?.name} generated successfully and sent to ${selectedEmp?.name}.`,
        duration: 3000
      });
    }, 1200);
  };

  const applyFilters = () => {
    setIsFilterDialogOpen(false);
    toast({ 
      title: "Filters Applied", 
      description: `Showing letters: ${filterType === 'all' ? 'All Types' : filterType} | ${filterStatus === 'all' ? 'All Statuses' : filterStatus}` 
    });
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    toast({ title: "Filters Cleared", description: "Showing all letters in history." });
  };

  const getFilteredHistory = () => {
    let filtered = history;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(l => l.letterType === filterType);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(l => 
        l.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.letterType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    sent: { label: 'Sent', class: 'bg-green-100 text-green-700 border-green-200' },
    draft: { label: 'Draft', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    pending: { label: 'Pending', class: 'bg-blue-100 text-blue-700 border-blue-200' }
  };

  const handleExportHistory = () => {
    toast({ title: "Exporting...", description: "Letters history is being compiled." });
    exportToExcel(history, `HR_Letters_History_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const openGenerateWithTemplate = (templateId: string) => {
    setGenerationForm(prev => ({ ...prev, template: templateId }));
    setIsGenerateDialogOpen(true);
  };

  const openPreview = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 -mx-6 -mt-6 px-6 py-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation('/hrm')} className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-600/10 rounded-xl">
                  <FileText className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">HR Letters & Certificates</h1>
                  <p className="text-sm text-slate-500 font-medium">Generate official correspondence tracking</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExportHistory} className="border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold h-10 shadow-sm">
                <Download className="h-4 w-4 mr-2 text-slate-500" />
                Export Logs
              </Button>
              <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-100 rounded-xl font-bold h-10">
                    <Plus className="h-4 w-4 mr-2" />
                    New Letter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] rounded-[2rem] p-0 overflow-y-auto border-none shadow-2xl">
                  <div className="bg-cyan-600 p-8 text-white">
                    <DialogTitle className="text-2xl font-black">Generate HR Letter</DialogTitle>
                    <DialogDescription className="text-cyan-50 font-medium">Select template and employee to generate correspondence</DialogDescription>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Letter Template</Label>
                        <Select 
                          value={generationForm.template} 
                          onValueChange={(v) => setGenerationForm(curr => ({...curr, template: v}))}
                        >
                          <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold">
                            <SelectValue placeholder="Choose a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {letterTemplates.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Employee</Label>
                        <Select
                           value={generationForm.employee} 
                           onValueChange={(v) => {
                             const emp = employees.find(e => e.id === v);
                             setGenerationForm(curr => ({
                               ...curr, 
                               employee: v,
                               designation: emp?.designation || '',
                               joiningDate: emp?.joiningDate || '',
                               salaryAmount: emp?.salary || ''
                             }));
                           }}
                        >
                          <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold">
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emp1">John Smith (EMP001)</SelectItem>
                            <SelectItem value="emp2">Sarah Johnson (EMP002)</SelectItem>
                            <SelectItem value="emp3">Mike Brown (EMP003)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Date</Label>
                         <Input 
                            type="date" 
                            className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                            value={generationForm.date}
                            onChange={(e) => setGenerationForm(curr => ({...curr, date: e.target.value}))}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Delivery Format</Label>
                         <Select 
                           value={generationForm.format}
                           onValueChange={(v) => setGenerationForm(curr => ({...curr, format: v}))}
                         >
                           <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="pdf">Professional PDF</SelectItem>
                             <SelectItem value="docx">Editable DOCX</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                    </div>

                    {/* Conditional fields based on template type */}
                    {generationForm.template === 'TEMP005' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Annual Salary Amount</Label>
                        <Input 
                          type="number"
                          placeholder="Enter annual salary"
                          className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                          value={generationForm.salaryAmount}
                          onChange={(e) => setGenerationForm(curr => ({...curr, salaryAmount: e.target.value}))}
                        />
                      </div>
                    )}

                    {(generationForm.template === 'TEMP003' || generationForm.template === 'TEMP004') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Joining Date</Label>
                          <Input 
                            type="date"
                            className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                            value={generationForm.joiningDate}
                            onChange={(e) => setGenerationForm(curr => ({...curr, joiningDate: e.target.value}))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Exit Date</Label>
                          <Input 
                            type="date"
                            className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                            value={generationForm.exitDate}
                            onChange={(e) => setGenerationForm(curr => ({...curr, exitDate: e.target.value}))}
                          />
                        </div>
                      </div>
                    )}

                    {generationForm.template === 'TEMP006' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Purpose/Reason for NOC</Label>
                        <Textarea 
                          placeholder="Describe the purpose for this NOC..."
                          className="rounded-xl border-slate-200 bg-slate-50 font-medium min-h-[80px]"
                          value={generationForm.reason}
                          onChange={(e) => setGenerationForm(curr => ({...curr, reason: e.target.value}))}
                        />
                      </div>
                    )}

                    {generationForm.template === 'TEMP007' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Leave Start Date</Label>
                            <Input
                              type="date"
                              className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                              value={generationForm.leaveStartDate}
                              onChange={(e) => setGenerationForm(curr => ({ ...curr, leaveStartDate: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Leave End Date</Label>
                            <Input
                              type="date"
                              className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                              value={generationForm.leaveEndDate}
                              onChange={(e) => setGenerationForm(curr => ({ ...curr, leaveEndDate: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Leave Reason</Label>
                          <Textarea
                            placeholder="State the reason for leave request..."
                            className="rounded-xl border-slate-200 bg-slate-50 font-medium min-h-[80px]"
                            value={generationForm.reason}
                            onChange={(e) => setGenerationForm(curr => ({ ...curr, reason: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Additional Notes (Optional)</Label>
                      <Textarea 
                        placeholder="Add any custom instructions or special mentions..."
                        className="rounded-xl border-slate-200 bg-slate-50 font-medium min-h-[80px]"
                        value={generationForm.customNotes}
                        onChange={(e) => setGenerationForm(curr => ({...curr, customNotes: e.target.value}))}
                      />
                    </div>

                    <div className="p-5 bg-cyan-50/50 rounded-2xl border border-cyan-100 flex gap-4">
                       <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
                          <Eye className="h-4 w-4 text-cyan-600" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-cyan-900 mb-0.5">Live Preview Ready</p>
                          <p className="text-[10px] text-cyan-700 font-medium">Fields like employee name, salary, and designation will be automatically mapped to the selected template.</p>
                       </div>
                    </div>
                  </div>
                  <div className="px-8 pb-8 flex gap-3">
                    <Button variant="ghost" onClick={() => setIsGenerateDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold text-slate-500">Cancel</Button>
                    <Button onClick={handleGenerate} className="flex-1 bg-cyan-600 hover:bg-cyan-700 rounded-xl h-12 font-bold shadow-lg shadow-cyan-100">
                      <Send className="h-4 w-4 mr-2" />
                      Generate & Send
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <FileText className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{letterTemplates.length}</p>
                  <p className="text-xs text-slate-600">Letter Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{history.filter(l => l.status === 'sent').length}</p>
                  <p className="text-xs text-slate-600">Letters Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileDown className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{history.length}</p>
                  <p className="text-xs text-slate-600">Total Issued</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Printer className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{history.filter(l => l.status === 'draft').length}</p>
                  <p className="text-xs text-slate-600">Pending Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">Letter History</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4 mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              {letterTemplates.map((template) => (
                <Card key={template.id} className="rounded-[2rem] border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white">
                  <div className={cn("h-1.5", template.color.split(' ')[0])} />
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className={cn("p-4 rounded-2xl text-4xl shadow-sm transition-transform group-hover:scale-110", template.color)}>
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="mb-2 rounded-full font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-400">
                          {template.category}
                        </Badge>
                        <h3 className="font-black text-slate-900 text-lg leading-tight mb-1 group-hover:text-cyan-600 transition-colors">{template.name}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{template.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-slate-50">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => openPreview(template)}
                        className="rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-slate-600 h-11"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="lg" 
                        onClick={() => openGenerateWithTemplate(template.id)}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 transition-all active:scale-95"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
              <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                {selectedTemplate && (
                  <>
                    <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                       <div>
                          <DialogTitle className="text-2xl font-black">{selectedTemplate.name}</DialogTitle>
                          <DialogDescription className="text-slate-400 font-medium">Standard HR Template Preview</DialogDescription>
                       </div>
                       <Badge className="bg-white/10 text-white border-white/20 px-3 py-1 rounded-full font-bold uppercase text-[10px]">VERIFIED TEMPLATE</Badge>
                    </div>
                    <div className="p-8 bg-slate-50">
                       <div className="bg-white p-12 shadow-inner border border-slate-200 min-h-[400px] rounded-xl relative overflow-hidden">
                          {/* Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] select-none">
                             <h1 className="text-9xl font-black">Z-ERP HR</h1>
                          </div>
                          
                          <div className="relative z-10 space-y-8 font-serif leading-relaxed text-slate-700">
                             <div className="flex justify-between items-start border-b pb-6 border-slate-100">
                                <div>
                                   <div className="h-10 w-32 bg-slate-100 rounded mb-2" />
                                   <p className="text-[10px] uppercase font-bold text-slate-400">Reg No: HR-TMP-{selectedTemplate.id}</p>
                                </div>
                                <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                   <p>Corporate Headquarters</p>
                                   <p>123 Innovation Drive</p>
                                   <p>City Center, 10001</p>
                                </div>
                             </div>

                             <div className="text-right font-bold text-sm">
                                Date: {'{current_date}'}
                             </div>

                             <div className="space-y-4">
                                <p className="font-bold underline uppercase">Subject: {selectedTemplate.name}</p>
                                <p>To:</p>
                                <div className="pl-4 font-bold">
                                   <p>{'{employee_name}'}</p>
                                   <p>{'{employee_designation}'}</p>
                                   <p>{'{employee_id}'}</p>
                                </div>
                                <p>Dear {'{employee_name}'},</p>
                                <p>
                                   This is to officially inform you regarding the <strong>{selectedTemplate.name}</strong> as discussed. 
                                   Our records indicate that you have met all the necessary requirements for this specific 
                                   documentation as per the company's internal HR policy.
                                </p>
                                <p>
                                   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
                                   ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
                                   ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                             </div>

                             <div className="pt-12">
                                <p>Sincerely,</p>
                                <div className="mt-6">
                                   <div className="h-12 w-32 border-b border-slate-400 mb-2 italic text-slate-300">Signature</div>
                                   <p className="font-bold text-sm">Human Resources Manager</p>
                                   <p className="text-xs text-slate-500">Z-ERP Solutions Inc.</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-3">
                       <Button variant="ghost" onClick={() => setIsPreviewDialogOpen(false)} className="rounded-xl font-bold text-slate-500">Close Preview</Button>
                       <Button 
                          onClick={() => {
                             setIsPreviewDialogOpen(false);
                             openGenerateWithTemplate(selectedTemplate.id);
                          }}
                          className="bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold text-white shadow-lg shadow-cyan-100 px-8"
                        >
                          Use Template
                       </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Letter History */}
          <TabsContent value="history" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Letter Generation History</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search letters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                  <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                        {(filterType !== 'all' || filterStatus !== 'all') && (
                          <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-cyan-600 text-white text-[10px]">
                            {(filterType !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0)}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                      <div className="bg-cyan-600 p-6 text-white">
                        <DialogTitle className="text-xl font-black">Filter Letters</DialogTitle>
                        <DialogDescription className="text-cyan-50 font-medium">Refine your letter history view</DialogDescription>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Letter Type</Label>
                          <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="Offer Letter">Offer Letter</SelectItem>
                              <SelectItem value="Appointment Letter">Appointment Letter</SelectItem>
                              <SelectItem value="Experience Letter">Experience Letter</SelectItem>
                              <SelectItem value="Relieving Letter">Relieving Letter</SelectItem>
                              <SelectItem value="Salary Certificate">Salary Certificate</SelectItem>
                              <SelectItem value="NOC Letter">NOC Letter</SelectItem>
                              <SelectItem value="Leave Request Letter">Leave Request Letter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Status</Label>
                          <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(filterType !== 'all' || filterStatus !== 'all') && (
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Filter className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-amber-900">Active Filters</p>
                              <p className="text-[10px] text-amber-700 font-medium">
                                {filterType !== 'all' && `Type: ${filterType}`}
                                {filterType !== 'all' && filterStatus !== 'all' && ' • '}
                                {filterStatus !== 'all' && `Status: ${filterStatus}`}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={clearFilters}
                              className="h-8 px-3 rounded-lg text-amber-700 hover:bg-amber-100 font-bold text-xs"
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="px-6 pb-6 flex gap-3">
                        <Button 
                          variant="ghost" 
                          onClick={() => setIsFilterDialogOpen(false)} 
                          className="flex-1 rounded-xl h-11 font-bold text-slate-500"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          onClick={applyFilters} 
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700 rounded-xl h-11 font-bold shadow-lg shadow-cyan-100"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Apply Filters
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Letter ID</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Team Member</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Document Type</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Issued Date</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Authorized By</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase text-[10px] tracking-widest">File</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Lifecycle</TableHead>
                      <TableHead className="text-right font-black text-slate-700 uppercase text-[10px] tracking-widest">Operations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredHistory().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-100 rounded-full">
                              <FileText className="h-8 w-8 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-700">No Letters Found</p>
                              <p className="text-sm text-slate-500">
                                {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                                  ? 'Try adjusting your filters or search query' 
                                  : 'Start by generating your first HR letter'}
                              </p>
                            </div>
                            {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSearchQuery('');
                                  clearFilters();
                                }}
                                className="mt-2"
                              >
                                Clear All Filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredHistory().map((letter) => (
                        <TableRow key={letter.id}>
                          <TableCell className="font-mono text-sm">{letter.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{letter.employee}</p>
                              <p className="text-xs text-slate-600">{letter.empId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{letter.letterType}</TableCell>
                          <TableCell className="text-sm">{letter.generatedDate}</TableCell>
                          <TableCell className="text-sm">{letter.generatedBy}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{letter.format}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig[letter.status].class}>
                              {statusConfig[letter.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 font-bold rounded-lg"
                                onClick={() => toast({ title: "Letter Preview", description: `Loading official ${letter.letterType} for ${letter.employee}...` })}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold rounded-lg"
                                onClick={() => toast({ title: "Started Download", description: `${letter.id}_${letter.employee}.pdf is being prepared.` })}
                              >
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Get
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold rounded-lg"
                                onClick={() => toast({ title: "Email Queued", description: `Sending letter to ${letter.employee.split(' ')[0].toLowerCase()}@example.com` })}
                              >
                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                Mail
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

