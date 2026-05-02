import React, { useEffect, useMemo, useState } from 'react';
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
  Image,
  Palette,
  Upload,
  Settings,
  ShieldCheck,
  Send,
  Check,
  X,
  Pencil
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import recruitmentApi from '@/lib/recruitment-api';
import {
  ESIGN_SIGNATURES_UPDATED_EVENT,
  ESignatureProfile,
  getESignatureProfiles,
} from '@/lib/esign-signatures';

type LetterCandidate = {
  id: string;
  name: string;
  empId: string;
  email: string;
  designation: string;
  department: string;
  joiningDate: string;
  interviewStatus: string;
};

type LetterTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  defaultSubject: string;
  defaultBody: string;
  requiresAttachment: boolean;
  requiresApproval: boolean;
  isActive: boolean;
};

export default function HRLetters() {
  const [, setLocation] = useLocation();
  const { selectedWorkspace: currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isLetterEditorOpen, setIsLetterEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedTemplateForEditor, setSelectedTemplateForEditor] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [letterEditor, setLetterEditor] = useState({
    templateId: '',
    candidateId: '',
    recipientEmail: '',
    subject: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    format: 'pdf',
    signatureId: ''
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
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
  const [letterTemplates, setLetterTemplates] = useState<LetterTemplate[]>([
    {
      id: 'TEMP001',
      name: 'Offer Letter',
      description: 'Employment offer letter for new hires',
      category: 'Hiring',
      icon: '📝',
      color: 'bg-blue-100 text-blue-700',
      defaultSubject: 'Offer Letter - {candidate_name}',
      defaultBody: 'Dear {candidate_name},\n\nWe are pleased to offer you the position of {candidate_designation} at Z-ERP Solutions.\n\nRegards,\nHR Team',
      requiresAttachment: true,
      requiresApproval: true,
      isActive: true
    },
    {
      id: 'TEMP002',
      name: 'Appointment Letter',
      description: 'Official appointment confirmation',
      category: 'Hiring',
      icon: '✅',
      color: 'bg-green-100 text-green-700',
      defaultSubject: 'Appointment Letter - {candidate_name}',
      defaultBody: 'Dear {candidate_name},\n\nYour appointment as {candidate_designation} is confirmed effective {issue_date}.\n\nRegards,\nHR Team',
      requiresAttachment: false,
      requiresApproval: true,
      isActive: true
    },
    {
      id: 'TEMP003',
      name: 'Experience Letter',
      description: 'Work experience certificate',
      category: 'Exit',
      icon: '🎓',
      color: 'bg-purple-100 text-purple-700',
      defaultSubject: 'Experience Letter - {candidate_name}',
      defaultBody: 'This is to certify that {candidate_name} has worked with us as {candidate_designation}.\n\nRegards,\nHR Team',
      requiresAttachment: false,
      requiresApproval: false,
      isActive: true
    },
    {
      id: 'TEMP004',
      name: 'Relieving Letter',
      description: 'Employee relieving certificate',
      category: 'Exit',
      icon: '🚪',
      color: 'bg-orange-100 text-orange-700',
      defaultSubject: 'Relieving Letter - {candidate_name}',
      defaultBody: 'This is to confirm that {candidate_name} is relieved from duties effective {issue_date}.\n\nRegards,\nHR Team',
      requiresAttachment: false,
      requiresApproval: true,
      isActive: true
    },
    {
      id: 'TEMP005',
      name: 'Salary Certificate',
      description: 'Salary proof for employees',
      category: 'General',
      icon: '💰',
      color: 'bg-yellow-100 text-yellow-700',
      defaultSubject: 'Salary Certificate - {candidate_name}',
      defaultBody: 'This certifies that {candidate_name} is employed as {candidate_designation}.\n\nRegards,\nHR Team',
      requiresAttachment: false,
      requiresApproval: false,
      isActive: true
    },
    {
      id: 'TEMP006',
      name: 'NOC Letter',
      description: 'No objection certificate',
      category: 'General',
      icon: '📋',
      color: 'bg-cyan-100 text-cyan-700',
      defaultSubject: 'NOC Letter - {candidate_name}',
      defaultBody: 'This is to state that we have no objection regarding {candidate_name} for the stated purpose.\n\nRegards,\nHR Team',
      requiresAttachment: true,
      requiresApproval: false,
      isActive: true
    },
    {
      id: 'TEMP007',
      name: 'Leave Request Letter',
      description: 'Formal leave application for planned absence',
      category: 'Attendance',
      icon: '🗓️',
      color: 'bg-emerald-100 text-emerald-700',
      defaultSubject: 'Leave Request - {candidate_name}',
      defaultBody: 'This letter records a leave request submitted by {candidate_name}.\n\nRegards,\nHR Team',
      requiresAttachment: false,
      requiresApproval: true,
      isActive: true
    }
  ]);
  const [selectedSettingsTemplateId, setSelectedSettingsTemplateId] = useState('TEMP001');
  const [templateEditorDraft, setTemplateEditorDraft] = useState({
    name: '',
    description: '',
    category: '',
    defaultSubject: '',
    defaultBody: '',
    requiresAttachment: 'no',
    requiresApproval: 'yes',
    isActive: 'yes'
  });
  const [letterPolicySettings, setLetterPolicySettings] = useState({
    approvalFlow: 'HR Manager',
    autoSendAfterApproval: 'yes',
    allowDocxFormat: 'yes',
    requireDigitalSignature: 'no',
    reminderDaysBeforeDue: '3',
    retentionPeriodMonths: '24'
  });
  const [brandingSettings, setBrandingSettings] = useState({
    headerMode: 'upload',
    footerMode: 'upload',
    headerLogoPlacement: 'left',
    footerLogoPlacement: 'right',
    headerBackground: '#ffffff',
    headerTextColor: '#0f172a',
    footerBackground: '#ffffff',
    footerTextColor: '#0f172a',
    companyName: '',
    companyTagline: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    footerNote: '',
    footerLegal: ''
  });
  const [headerUploadFile, setHeaderUploadFile] = useState<File | null>(null);
  const [headerLogoFile, setHeaderLogoFile] = useState<File | null>(null);
  const [footerUploadFile, setFooterUploadFile] = useState<File | null>(null);
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
  const [signatureProfiles, setSignatureProfiles] = useState<ESignatureProfile[]>(() => getESignatureProfiles());
  const [isHistoryPreviewOpen, setIsHistoryPreviewOpen] = useState(false);
  const [selectedHistoryLetter, setSelectedHistoryLetter] = useState<any>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);

  // Letter history
  const [history, setHistory] = useState([
    {
      id: 'LET001',
      employee: 'John Smith',
      empId: 'EMP001',
      candidateId: 'emp1',
      letterType: 'Offer Letter',
      generatedDate: '2025-06-10',
      generatedBy: 'Emily Davis',
      status: 'sent',
      format: 'PDF',
      recipientEmail: 'john.smith@zervos.app',
      subject: 'Offer Letter - John Smith',
      content: 'Dear John Smith,\n\nWe are pleased to offer you the position of Senior Engineer at Z-ERP Solutions.\n\nRegards,\nHR Team',
      signatureId: ''
    },
    {
      id: 'LET002',
      employee: 'Mike Brown',
      empId: 'EMP003',
      candidateId: 'emp3',
      letterType: 'Appointment Letter',
      generatedDate: '2025-06-12',
      generatedBy: 'Emily Davis',
      status: 'sent',
      format: 'PDF',
      recipientEmail: 'mike.brown@zervos.app',
      subject: 'Appointment Letter - Mike Brown',
      content: 'Dear Mike Brown,\n\nYour appointment as UI/UX Designer is confirmed effective 2025-06-12.\n\nRegards,\nHR Team',
      signatureId: ''
    },
    {
      id: 'LET003',
      employee: 'Alex Wilson',
      empId: 'EMP005',
      candidateId: '',
      letterType: 'Salary Certificate',
      generatedDate: '2025-06-14',
      generatedBy: 'Emily Davis',
      status: 'draft',
      format: 'PDF',
      recipientEmail: 'alex.wilson@zervos.app',
      subject: 'Salary Certificate - Alex Wilson',
      content: 'This certifies that Alex Wilson is employed as Sales Executive with Z-ERP Solutions.\n\nRegards,\nHR Team',
      signatureId: ''
    }
  ]);

  const [employees] = useState([
    { id: 'emp1', name: 'John Smith', empId: 'EMP001', email: 'john.smith@zervos.app', designation: 'Senior Engineer', department: 'Engineering', salary: '85000', joiningDate: '2022-03-15', interviewStatus: 'Completed' },
    { id: 'emp2', name: 'Sarah Johnson', empId: 'EMP002', email: 'sarah.johnson@zervos.app', designation: 'Product Manager', department: 'Product', salary: '95000', joiningDate: '2021-06-01', interviewStatus: 'In Progress' },
    { id: 'emp3', name: 'Mike Brown', empId: 'EMP003', email: 'mike.brown@zervos.app', designation: 'UI/UX Designer', department: 'Design', salary: '75000', joiningDate: '2023-01-10', interviewStatus: 'Completed' }
  ]);

  const [recruitmentCompletedCandidates, setRecruitmentCompletedCandidates] = useState<LetterCandidate[]>([]);

  useEffect(() => {
    const loadCompletedCandidates = async () => {
      if (!currentWorkspace?.id) {
        return;
      }

      try {
        const interviews = await recruitmentApi.getInterviews(currentWorkspace.id, { status: 'Completed' });
        const uniqueCandidates = new Map<string, LetterCandidate>();

        interviews.forEach((interview) => {
          const application = interview.application;
          if (!application?.id || !application.applicant_name || !application.applicant_email) {
            return;
          }

          uniqueCandidates.set(application.id, {
            id: application.id,
            name: application.applicant_name,
            empId: `APP-${application.id.slice(0, 6).toUpperCase()}`,
            email: application.applicant_email,
            designation: interview.job_title || 'Candidate',
            department: 'Recruitment',
            joiningDate: new Date().toISOString().split('T')[0],
            interviewStatus: interview.status
          });
        });

        setRecruitmentCompletedCandidates(Array.from(uniqueCandidates.values()));
      } catch (error) {
        console.error('Unable to load completed interview candidates for HR letters:', error);
      }
    };

    loadCompletedCandidates();
  }, [currentWorkspace?.id]);

  const fallbackCompletedCandidates = useMemo<LetterCandidate[]>(
    () => employees
      .filter((candidate) => candidate.interviewStatus === 'Completed')
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        empId: candidate.empId,
        email: candidate.email,
        designation: candidate.designation,
        department: candidate.department,
        joiningDate: candidate.joiningDate,
        interviewStatus: candidate.interviewStatus
      })),
    [employees]
  );

  const completedCandidates = useMemo(
    () => recruitmentCompletedCandidates.length > 0 ? recruitmentCompletedCandidates : fallbackCompletedCandidates,
    [fallbackCompletedCandidates, recruitmentCompletedCandidates]
  );

  const defaultSignature = useMemo(
    () => signatureProfiles.find((signature) => signature.isDefault) ?? signatureProfiles[0] ?? null,
    [signatureProfiles]
  );
  const selectedSignature = useMemo(
    () => signatureProfiles.find((signature) => signature.id === letterEditor.signatureId) ?? defaultSignature,
    [defaultSignature, letterEditor.signatureId, signatureProfiles]
  );
  const editingHistory = useMemo(
    () => history.find((item) => item.id === editingHistoryId) ?? null,
    [editingHistoryId, history]
  );
  const editorCandidates = useMemo(() => {
    const base = [...completedCandidates];
    if (editingHistory) {
      const exists = base.some((candidate) => candidate.empId === editingHistory.empId || candidate.id === editingHistory.candidateId);
      if (!exists) {
        base.unshift({
          id: editingHistory.candidateId || `history-${editingHistory.id}`,
          name: editingHistory.employee,
          empId: editingHistory.empId,
          email: editingHistory.recipientEmail,
          designation: 'Employee',
          department: 'HR',
          joiningDate: editingHistory.generatedDate,
          interviewStatus: 'Completed'
        });
      }
    }
    return base;
  }, [completedCandidates, editingHistory]);

  useEffect(() => {
    const handleSignatureRefresh = () => {
      setSignatureProfiles(getESignatureProfiles());
    };

    window.addEventListener(ESIGN_SIGNATURES_UPDATED_EVENT, handleSignatureRefresh);
    return () => {
      window.removeEventListener(ESIGN_SIGNATURES_UPDATED_EVENT, handleSignatureRefresh);
    };
  }, []);

  const selectedSettingsTemplate = useMemo(
    () => letterTemplates.find((template) => template.id === selectedSettingsTemplateId),
    [letterTemplates, selectedSettingsTemplateId]
  );

  useEffect(() => {
    if (!selectedSettingsTemplate) {
      return;
    }

    setTemplateEditorDraft({
      name: selectedSettingsTemplate.name,
      description: selectedSettingsTemplate.description,
      category: selectedSettingsTemplate.category,
      defaultSubject: selectedSettingsTemplate.defaultSubject,
      defaultBody: selectedSettingsTemplate.defaultBody,
      requiresAttachment: selectedSettingsTemplate.requiresAttachment ? 'yes' : 'no',
      requiresApproval: selectedSettingsTemplate.requiresApproval ? 'yes' : 'no',
      isActive: selectedSettingsTemplate.isActive ? 'yes' : 'no'
    });
  }, [selectedSettingsTemplate]);

  const applyTemplateVariables = (text: string, candidate: LetterCandidate, issueDate: string, templateName: string) => {
    return text
      .replaceAll('{candidate_name}', candidate.name)
      .replaceAll('{candidate_designation}', candidate.designation)
      .replaceAll('{candidate_id}', candidate.empId)
      .replaceAll('{issue_date}', issueDate)
      .replaceAll('{template_name}', templateName);
  };

  const buildLetterContent = (templateName: string, candidate: LetterCandidate, issueDate: string) => {
    const template = letterTemplates.find((item) => item.name === templateName);
    if (!template) {
      return `Date: ${issueDate}\n\nTo,\n${candidate.name}\n${candidate.designation}\nEmployee ID: ${candidate.empId}\n\nSubject: ${templateName}\n\nDear ${candidate.name},\n\nThis letter confirms your ${templateName.toLowerCase()} with Z-ERP Solutions.\n\nDetails:\n- Designation: ${candidate.designation}\n- Department: ${candidate.department}\n- Joining Date: ${candidate.joiningDate}\n\nPlease review the details and contact HR for any clarifications.\n\nRegards,\nHR Team\nZ-ERP Solutions`;
    }

    return applyTemplateVariables(template.defaultBody, candidate, issueDate, template.name);
  };

  const openLetterEditor = (templateId: string) => {
    const template = letterTemplates.find((item) => item.id === templateId);
    const candidate = completedCandidates[0];

    if (!template) {
      return;
    }

    if (!candidate) {
      toast({
        title: 'No interview-completed candidates',
        description: 'Mark a candidate interview as Completed in Recruitment to enable direct HR letter send.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedTemplateForEditor(template);
    setLetterEditor({
      templateId: template.id,
      candidateId: candidate.id,
      recipientEmail: candidate.email,
      subject: applyTemplateVariables(template.defaultSubject, candidate, new Date().toISOString().split('T')[0], template.name),
      content: buildLetterContent(template.name, candidate, new Date().toISOString().split('T')[0]),
      date: new Date().toISOString().split('T')[0],
      format: 'pdf',
      signatureId: defaultSignature?.id || ''
    });
    setUploadedDocuments([]);
    setEditingHistoryId(null);
    setIsLetterEditorOpen(true);
  };

  const handleEditorCandidateChange = (candidateId: string) => {
    const candidate = editorCandidates.find((item) => item.id === candidateId);
    const template = letterTemplates.find((item) => item.id === letterEditor.templateId);

    if (!candidate || !template) {
      return;
    }

    setLetterEditor((prev) => ({
      ...prev,
      candidateId,
      recipientEmail: candidate.email,
      subject: applyTemplateVariables(template.defaultSubject, candidate, prev.date, template.name),
      content: buildLetterContent(template.name, candidate, prev.date)
    }));
  };

  const handleSaveTemplateSettings = () => {
    setLetterTemplates((prev) => prev.map((template) => {
      if (template.id !== selectedSettingsTemplateId) {
        return template;
      }

      return {
        ...template,
        name: templateEditorDraft.name,
        description: templateEditorDraft.description,
        category: templateEditorDraft.category,
        defaultSubject: templateEditorDraft.defaultSubject,
        defaultBody: templateEditorDraft.defaultBody,
        requiresAttachment: templateEditorDraft.requiresAttachment === 'yes',
        requiresApproval: templateEditorDraft.requiresApproval === 'yes',
        isActive: templateEditorDraft.isActive === 'yes'
      };
    }));

    toast({
      title: 'Template updated',
      description: 'HR letter template settings were saved successfully.'
    });
  };

  const handleSaveLetterPolicies = () => {
    toast({
      title: 'Letter policies saved',
      description: 'Approval, delivery, and retention settings were updated.'
    });
  };

  const handleSaveBranding = () => {
    toast({
      title: 'Branding saved',
      description: 'Header and footer branding settings were updated.'
    });
  };

  const handleSendEditedLetter = () => {
    const template = letterTemplates.find((item) => item.id === letterEditor.templateId);
    const candidate = completedCandidates.find((item) => item.id === letterEditor.candidateId);

    if (!template || !candidate || !letterEditor.recipientEmail || !letterEditor.content.trim()) {
      toast({
        title: 'Missing required details',
        description: 'Template, completed candidate, recipient email, and content are required before sending.',
        variant: 'destructive'
      });
      return;
    }

    const updatedLetter = {
      id: editingHistoryId ?? `LET${String(history.length + 1).padStart(3, '0')}`,
      employee: candidate.name,
      empId: candidate.empId,
      candidateId: candidate.id,
      letterType: template.name,
      generatedDate: letterEditor.date,
      generatedBy: 'Emily Davis',
      status: 'sent',
      format: letterEditor.format.toUpperCase(),
      recipientEmail: letterEditor.recipientEmail,
      subject: letterEditor.subject,
      content: letterEditor.content,
      signatureId: letterEditor.signatureId
    };

    setHistory((prev) =>
      editingHistoryId
        ? prev.map((item) => (item.id === editingHistoryId ? updatedLetter : item))
        : [updatedLetter, ...prev]
    );
    const attachmentText = uploadedDocuments.length > 0 ? ` with ${uploadedDocuments.length} attachment(s)` : '';
    setUploadedDocuments([]);
    setIsLetterEditorOpen(false);
    setEditingHistoryId(null);
    toast({
      title: editingHistoryId ? 'Letter updated' : 'Letter sent',
      description: `${template.name} ${editingHistoryId ? 'updated' : 'sent'} to ${candidate.name} at ${letterEditor.recipientEmail}${attachmentText}.`
    });
  };

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
      const signatureId = defaultSignature?.id || '';
      const newLetter = {
        id: `LET00${history.length + 1}`,
        employee: selectedEmp?.name || '',
        empId: selectedEmp?.empId || '',
        candidateId: selectedEmp?.id || '',
        letterType: selectedTemp?.name || '',
        generatedDate: generationForm.date,
        generatedBy: 'Emily Davis',
        status: 'sent',
        format: generationForm.format.toUpperCase(),
        recipientEmail: selectedEmp?.email || '',
        subject: selectedTemp
          ? applyTemplateVariables(selectedTemp.defaultSubject, selectedEmp as any, generationForm.date, selectedTemp.name)
          : '',
        content: selectedTemp && selectedEmp
          ? buildLetterContent(selectedTemp.name, selectedEmp as any, generationForm.date)
          : '',
        signatureId
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

  const openHistoryPreview = (letter: any) => {
    setSelectedHistoryLetter(letter);
    setIsHistoryPreviewOpen(true);
  };

  const openHistoryEdit = (letter: any) => {
    const template = letterTemplates.find((item) => item.name === letter.letterType) ?? letterTemplates[0];
    setEditingHistoryId(letter.id ?? null);
    const candidateMatch = completedCandidates.find((item) => item.empId === letter.empId || item.id === letter.candidateId);
    const candidateId = candidateMatch?.id || letter.candidateId || `history-${letter.id}`;
    setSelectedTemplateForEditor(template ?? null);
    setLetterEditor({
      templateId: template?.id ?? '',
      candidateId,
      recipientEmail: letter.recipientEmail ?? '',
      subject: letter.subject ?? template?.defaultSubject ?? '',
      content: letter.content ?? '',
      date: letter.generatedDate ?? new Date().toISOString().split('T')[0],
      format: (letter.format ?? 'PDF').toLowerCase(),
      signatureId: letter.signatureId ?? defaultSignature?.id ?? ''
    });
    setUploadedDocuments([]);
    setIsLetterEditorOpen(true);
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
                                {employees.map((employee) => (
                                  <SelectItem key={employee.id} value={employee.id}>
                                    {employee.name} ({employee.empId})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {generationForm.employee && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Recipient Email</Label>
                        <Input
                          readOnly
                          value={employees.find((emp) => emp.id === generationForm.employee)?.email || ''}
                          className="rounded-xl border-slate-200 bg-slate-100 h-12 font-bold"
                        />
                      </div>
                    )}
                    
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
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    
                    <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-slate-50">
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
                        variant="outline"
                        size="lg"
                        onClick={() => openLetterEditor(template.id)}
                        className="rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-slate-600 h-11"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        size="lg" 
                        onClick={() => openLetterEditor(template.id)}
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
                    <div className="max-h-[60vh] overflow-y-auto bg-slate-50 p-8">
                       <div className="bg-white p-12 shadow-inner border border-slate-200 min-h-[400px] rounded-xl relative overflow-hidden">
                          {/* Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] select-none">
                             <h1 className="text-9xl font-black">Z-ERP HR</h1>
                          </div>
                          
                          <div className="relative z-10 space-y-8 font-serif leading-relaxed text-slate-700">
                             <div
                               className="rounded-lg border border-slate-200 px-5 py-4"
                               style={{
                                 background: brandingSettings.headerBackground,
                                 color: brandingSettings.headerTextColor
                               }}
                             >
                               {brandingSettings.headerMode === 'upload' ? (
                                 <div className="flex items-center justify-between gap-4">
                                   <div>
                                     <p className="text-xs font-bold uppercase">Uploaded Header</p>
                                     <p className="text-[11px] font-semibold">
                                       {headerUploadFile?.name || 'header-file.pdf'}
                                     </p>
                                   </div>
                                   <Badge className="bg-white/80 text-slate-700 border-white/60 text-[10px] font-bold uppercase">
                                     {selectedTemplate.id}
                                   </Badge>
                                 </div>
                               ) : (
                                 <div className="flex flex-col gap-3">
                                   <div className="flex items-start justify-between gap-4">
                                     <div className="space-y-1">
                                       <p className="text-lg font-black tracking-tight">
                                         {brandingSettings.companyName || 'Z-ERP Solutions'}
                                       </p>
                                       <p className="text-xs font-semibold uppercase tracking-wide">
                                         {brandingSettings.companyTagline || 'Business Intelligence System'}
                                       </p>
                                     </div>
                                     <div className="text-[10px] font-bold uppercase tracking-widest text-right">
                                       <p>{brandingSettings.companyPhone || '+91 90000 00000'}</p>
                                       <p>{brandingSettings.companyEmail || 'hello@z-erp.app'}</p>
                                       <p>{brandingSettings.companyWebsite || 'www.z-erp.app'}</p>
                                     </div>
                                   </div>
                                   <div className="flex items-center justify-between text-[10px] font-semibold">
                                     <p>{brandingSettings.companyAddress || 'Corporate HQ, Innovation Drive, City Center'}</p>
                                     <p>Reg No: HR-TMP-{selectedTemplate.id}</p>
                                   </div>
                                 </div>
                               )}
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

                             <div
                               className="mt-10 rounded-lg border border-slate-200 px-5 py-4 text-xs"
                               style={{
                                 background: brandingSettings.footerBackground,
                                 color: brandingSettings.footerTextColor
                               }}
                             >
                               {brandingSettings.footerMode === 'upload' ? (
                                 <div className="flex items-center justify-between gap-4">
                                   <p className="font-semibold uppercase">Uploaded Footer</p>
                                   <p className="text-[11px] font-semibold">
                                     {footerUploadFile?.name || 'footer-file.pdf'}
                                   </p>
                                 </div>
                               ) : (
                                 <div className="space-y-2">
                                   <p className="font-semibold">{brandingSettings.footerNote || 'Thank you for being part of our organization.'}</p>
                                   <p className="text-[10px] uppercase tracking-wide">
                                     {brandingSettings.footerLegal || 'This letter is system generated and confidential.'}
                                   </p>
                                 </div>
                               )}
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
                                onClick={() => openHistoryPreview(letter)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-bold rounded-lg"
                                onClick={() => openHistoryEdit(letter)}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold rounded-lg"
                                onClick={() => toast({ title: "Email Queued", description: `Sending letter to ${letter.recipientEmail}` })}
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

            <Dialog open={isHistoryPreviewOpen} onOpenChange={setIsHistoryPreviewOpen}>
              <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                {selectedHistoryLetter && (
                  <>
                    <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                      <div>
                        <DialogTitle className="text-2xl font-black">{selectedHistoryLetter.letterType}</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                          {selectedHistoryLetter.employee} • {selectedHistoryLetter.generatedDate}
                        </DialogDescription>
                      </div>
                      <Badge className="bg-white/10 text-white border-white/20 px-3 py-1 rounded-full font-bold uppercase text-[10px]">
                        {selectedHistoryLetter.id}
                      </Badge>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto bg-slate-50 p-8">
                      <div className="bg-white p-12 shadow-inner border border-slate-200 min-h-[400px] rounded-xl relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] select-none">
                          <h1 className="text-9xl font-black">Z-ERP HR</h1>
                        </div>

                        <div className="relative z-10 space-y-8 font-serif leading-relaxed text-slate-700">
                          <div
                            className="rounded-lg border border-slate-200 px-5 py-4"
                            style={{
                              background: brandingSettings.headerBackground,
                              color: brandingSettings.headerTextColor
                            }}
                          >
                            {brandingSettings.headerMode === 'upload' ? (
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-xs font-bold uppercase">Uploaded Header</p>
                                  <p className="text-[11px] font-semibold">
                                    {headerUploadFile?.name || 'header-file.pdf'}
                                  </p>
                                </div>
                                <Badge className="bg-white/80 text-slate-700 border-white/60 text-[10px] font-bold uppercase">
                                  {selectedHistoryLetter.id}
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <p className="text-lg font-black tracking-tight">
                                      {brandingSettings.companyName || 'Z-ERP Solutions'}
                                    </p>
                                    <p className="text-xs font-semibold uppercase tracking-wide">
                                      {brandingSettings.companyTagline || 'Business Intelligence System'}
                                    </p>
                                  </div>
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-right">
                                    <p>{brandingSettings.companyPhone || '+91 90000 00000'}</p>
                                    <p>{brandingSettings.companyEmail || 'hello@z-erp.app'}</p>
                                    <p>{brandingSettings.companyWebsite || 'www.z-erp.app'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-semibold">
                                  <p>{brandingSettings.companyAddress || 'Corporate HQ, Innovation Drive, City Center'}</p>
                                  <p>Ref: {selectedHistoryLetter.id}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="text-right font-bold text-sm">Date: {selectedHistoryLetter.generatedDate}</div>

                          <div className="space-y-4">
                            <p className="font-bold underline uppercase">Subject: {selectedHistoryLetter.subject || selectedHistoryLetter.letterType}</p>
                            <div className="rounded-lg bg-white p-4 text-sm text-slate-700 shadow-inner">
                              {selectedHistoryLetter.content || 'Letter content not available for this record.'}
                            </div>
                          </div>

                          <div className="pt-8">
                            <p>Sincerely,</p>
                            <div className="mt-4">
                              {(() => {
                                const signature = signatureProfiles.find((item) => item.id === selectedHistoryLetter.signatureId) ?? defaultSignature;
                                if (!signature) {
                                  return <p className="text-xs text-slate-500">No signature selected</p>;
                                }
                                return (
                                  <div className="space-y-1">
                                    {signature.fileDataUrl ? (
                                      <img src={signature.fileDataUrl} alt="Signature" className="h-12 object-contain" />
                                    ) : (
                                      <p className="text-sm font-semibold">{signature.signatureLabel}</p>
                                    )}
                                    <p className="text-xs text-slate-500">{signature.signerName} • {signature.designation}</p>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <div
                            className="mt-10 rounded-lg border border-slate-200 px-5 py-4 text-xs"
                            style={{
                              background: brandingSettings.footerBackground,
                              color: brandingSettings.footerTextColor
                            }}
                          >
                            {brandingSettings.footerMode === 'upload' ? (
                              <div className="flex items-center justify-between gap-4">
                                <p className="font-semibold uppercase">Uploaded Footer</p>
                                <p className="text-[11px] font-semibold">
                                  {footerUploadFile?.name || 'footer-file.pdf'}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="font-semibold">{brandingSettings.footerNote || 'Thank you for being part of our organization.'}</p>
                                <p className="text-[10px] uppercase tracking-wide">
                                  {brandingSettings.footerLegal || 'This letter is system generated and confidential.'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setIsHistoryPreviewOpen(false)} className="rounded-xl font-bold text-slate-500">Close</Button>
                      <Button
                        onClick={() => {
                          setIsHistoryPreviewOpen(false);
                          openHistoryEdit(selectedHistoryLetter);
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold text-white shadow-lg shadow-cyan-100 px-8"
                      >
                        Edit Letter
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-cyan-600" />
                  Company Header & Footer
                </CardTitle>
                <CardDescription>Upload a ready header/footer or design one with logo placement and colors.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Header</p>
                        <p className="text-xs text-slate-500">Company header appears on every letter.</p>
                      </div>
                      <Select
                        value={brandingSettings.headerMode}
                        onValueChange={(value) => setBrandingSettings((prev) => ({ ...prev, headerMode: value }))}
                      >
                        <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upload">Upload</SelectItem>
                          <SelectItem value="create">Create</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {brandingSettings.headerMode === 'upload' ? (
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Upload Header</Label>
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp,.pdf"
                          onChange={(e) => setHeaderUploadFile(e.target.files?.[0] ?? null)}
                          className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-cyan-700"
                        />
                        {headerUploadFile && (
                          <p className="text-xs text-slate-600">Selected: {headerUploadFile.name}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Company Name</Label>
                            <Input
                              value={brandingSettings.companyName}
                              onChange={(e) => setBrandingSettings((prev) => ({ ...prev, companyName: e.target.value }))}
                              className="rounded-xl border-slate-200 bg-slate-50 h-10 font-semibold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tagline</Label>
                            <Input
                              value={brandingSettings.companyTagline}
                              onChange={(e) => setBrandingSettings((prev) => ({ ...prev, companyTagline: e.target.value }))}
                              className="rounded-xl border-slate-200 bg-slate-50 h-10 font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Address</Label>
                          <Textarea
                            value={brandingSettings.companyAddress}
                            onChange={(e) => setBrandingSettings((prev) => ({ ...prev, companyAddress: e.target.value }))}
                            className="rounded-xl border-slate-200 bg-slate-50 min-h-[70px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone</Label>
                            <Input
                              value={brandingSettings.companyPhone}
                              onChange={(e) => setBrandingSettings((prev) => ({ ...prev, companyPhone: e.target.value }))}
                              className="rounded-xl border-slate-200 bg-slate-50 h-10 font-semibold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</Label>
                            <Input
                              value={brandingSettings.companyEmail}
                              onChange={(e) => setBrandingSettings((prev) => ({ ...prev, companyEmail: e.target.value }))}
                              className="rounded-xl border-slate-200 bg-slate-50 h-10 font-semibold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Website</Label>
                            <Input
                              value={brandingSettings.companyWebsite}
                              onChange={(e) => setBrandingSettings((prev) => ({ ...prev, companyWebsite: e.target.value }))}
                              className="rounded-xl border-slate-200 bg-slate-50 h-10 font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Logo Upload</Label>
                            <Input
                              type="file"
                              accept=".png,.jpg,.jpeg,.svg,.webp"
                              onChange={(e) => setHeaderLogoFile(e.target.files?.[0] ?? null)}
                              className="cursor-pointer file:mr-2 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-white hover:file:bg-slate-800"
                            />
                            {headerLogoFile && (
                              <p className="text-[10px] text-slate-500">{headerLogoFile.name}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Logo Placement</Label>
                            <Select
                              value={brandingSettings.headerLogoPlacement}
                              onValueChange={(value) => setBrandingSettings((prev) => ({ ...prev, headerLogoPlacement: value }))}
                            >
                              <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-10 text-xs font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                                <Palette className="h-3 w-3" /> BG
                              </Label>
                              <Input
                                type="color"
                                value={brandingSettings.headerBackground}
                                onChange={(e) => setBrandingSettings((prev) => ({ ...prev, headerBackground: e.target.value }))}
                                className="h-10 rounded-xl border-slate-200 bg-white p-1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                                <Palette className="h-3 w-3" /> Text
                              </Label>
                              <Input
                                type="color"
                                value={brandingSettings.headerTextColor}
                                onChange={(e) => setBrandingSettings((prev) => ({ ...prev, headerTextColor: e.target.value }))}
                                className="h-10 rounded-xl border-slate-200 bg-white p-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Footer</p>
                        <p className="text-xs text-slate-500">Footer shows legal and contact notes.</p>
                      </div>
                      <Select
                        value={brandingSettings.footerMode}
                        onValueChange={(value) => setBrandingSettings((prev) => ({ ...prev, footerMode: value }))}
                      >
                        <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upload">Upload</SelectItem>
                          <SelectItem value="create">Create</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {brandingSettings.footerMode === 'upload' ? (
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Upload Footer</Label>
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp,.pdf"
                          onChange={(e) => setFooterUploadFile(e.target.files?.[0] ?? null)}
                          className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-cyan-700"
                        />
                        {footerUploadFile && (
                          <p className="text-xs text-slate-600">Selected: {footerUploadFile.name}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Footer Note</Label>
                          <Textarea
                            value={brandingSettings.footerNote}
                            onChange={(e) => setBrandingSettings((prev) => ({ ...prev, footerNote: e.target.value }))}
                            className="rounded-xl border-slate-200 bg-slate-50 min-h-[70px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Legal / Disclaimer</Label>
                          <Textarea
                            value={brandingSettings.footerLegal}
                            onChange={(e) => setBrandingSettings((prev) => ({ ...prev, footerLegal: e.target.value }))}
                            className="rounded-xl border-slate-200 bg-slate-50 min-h-[70px]"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Logo Upload</Label>
                            <Input
                              type="file"
                              accept=".png,.jpg,.jpeg,.svg,.webp"
                              onChange={(e) => setFooterLogoFile(e.target.files?.[0] ?? null)}
                              className="cursor-pointer file:mr-2 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-white hover:file:bg-slate-800"
                            />
                            {footerLogoFile && (
                              <p className="text-[10px] text-slate-500">{footerLogoFile.name}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Logo Placement</Label>
                            <Select
                              value={brandingSettings.footerLogoPlacement}
                              onValueChange={(value) => setBrandingSettings((prev) => ({ ...prev, footerLogoPlacement: value }))}
                            >
                              <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-10 text-xs font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                                <Palette className="h-3 w-3" /> BG
                              </Label>
                              <Input
                                type="color"
                                value={brandingSettings.footerBackground}
                                onChange={(e) => setBrandingSettings((prev) => ({ ...prev, footerBackground: e.target.value }))}
                                className="h-10 rounded-xl border-slate-200 bg-white p-1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                                <Palette className="h-3 w-3" /> Text
                              </Label>
                              <Input
                                type="color"
                                value={brandingSettings.footerTextColor}
                                onChange={(e) => setBrandingSettings((prev) => ({ ...prev, footerTextColor: e.target.value }))}
                                className="h-10 rounded-xl border-slate-200 bg-white p-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveBranding} className="bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold px-6">
                    <Upload className="h-4 w-4 mr-2" />
                    Save Branding
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-cyan-600" />
                  Template Configuration
                </CardTitle>
                <CardDescription>Edit HR letter template content, subject tokens, and activation controls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Template</Label>
                    <Select value={selectedSettingsTemplateId} onValueChange={setSelectedSettingsTemplateId}>
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {letterTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</Label>
                    <Input
                      value={templateEditorDraft.category}
                      onChange={(e) => setTemplateEditorDraft((prev) => ({ ...prev, category: e.target.value }))}
                      className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Template Name</Label>
                    <Input
                      value={templateEditorDraft.name}
                      onChange={(e) => setTemplateEditorDraft((prev) => ({ ...prev, name: e.target.value }))}
                      className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Active</Label>
                    <Select
                      value={templateEditorDraft.isActive}
                      onValueChange={(value) => setTemplateEditorDraft((prev) => ({ ...prev, isActive: value }))}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Template Description</Label>
                  <Textarea
                    value={templateEditorDraft.description}
                    onChange={(e) => setTemplateEditorDraft((prev) => ({ ...prev, description: e.target.value }))}
                    className="rounded-xl border-slate-200 bg-slate-50 min-h-[90px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Default Subject</Label>
                  <Input
                    value={templateEditorDraft.defaultSubject}
                    onChange={(e) => setTemplateEditorDraft((prev) => ({ ...prev, defaultSubject: e.target.value }))}
                    className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Default Body</Label>
                  <Textarea
                    value={templateEditorDraft.defaultBody}
                    onChange={(e) => setTemplateEditorDraft((prev) => ({ ...prev, defaultBody: e.target.value }))}
                    className="rounded-xl border-slate-200 bg-slate-50 min-h-[180px]"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">Supported tokens: {'{candidate_name}'}, {'{candidate_designation}'}, {'{candidate_id}'}, {'{issue_date}'}, {'{template_name}'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Require Attachment</Label>
                    <Select
                      value={templateEditorDraft.requiresAttachment}
                      onValueChange={(value) => setTemplateEditorDraft((prev) => ({ ...prev, requiresAttachment: value }))}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Require Approval</Label>
                    <Select
                      value={templateEditorDraft.requiresApproval}
                      onValueChange={(value) => setTemplateEditorDraft((prev) => ({ ...prev, requiresApproval: value }))}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveTemplateSettings} className="bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold px-6">
                    <Check className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Delivery & Compliance
                </CardTitle>
                <CardDescription>Manage approval flow, signature policy, format permissions, and retention period.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Approval Flow</Label>
                    <Select
                      value={letterPolicySettings.approvalFlow}
                      onValueChange={(value) => setLetterPolicySettings((prev) => ({ ...prev, approvalFlow: value }))}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HR Manager">HR Manager</SelectItem>
                        <SelectItem value="Department Head">Department Head</SelectItem>
                        <SelectItem value="Dual Approval (HR + Legal)">Dual Approval (HR + Legal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Auto Send After Approval</Label>
                    <Select
                      value={letterPolicySettings.autoSendAfterApproval}
                      onValueChange={(value) => setLetterPolicySettings((prev) => ({ ...prev, autoSendAfterApproval: value }))}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Allow DOCX Format</Label>
                    <Select
                      value={letterPolicySettings.allowDocxFormat}
                      onValueChange={(value) => setLetterPolicySettings((prev) => ({ ...prev, allowDocxFormat: value }))}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Require Digital Signature</Label>
                    <Select
                      value={letterPolicySettings.requireDigitalSignature}
                      onValueChange={(value) => setLetterPolicySettings((prev) => ({ ...prev, requireDigitalSignature: value }))}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Reminder (Days Before)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={letterPolicySettings.reminderDaysBeforeDue}
                      onChange={(e) => setLetterPolicySettings((prev) => ({ ...prev, reminderDaysBeforeDue: e.target.value }))}
                      className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Retention Period (Months)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={letterPolicySettings.retentionPeriodMonths}
                      onChange={(e) => setLetterPolicySettings((prev) => ({ ...prev, retentionPeriodMonths: e.target.value }))}
                      className="rounded-xl border-slate-200 bg-slate-50 h-11 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Policy Status</Label>
                    <Input readOnly value="Active and applied for all HR letters" className="rounded-xl border-slate-200 bg-slate-100 h-11 font-bold text-emerald-700" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50">
                  <p className="text-xs font-bold text-cyan-900">Important</p>
                  <p className="text-[11px] text-cyan-700 font-medium">Template edits in this section are applied across Template cards, New Letter generation, and Edit & Send workflow.</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveLetterPolicies} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold px-6">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Save Policies
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isLetterEditorOpen} onOpenChange={setIsLetterEditorOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] rounded-[2rem] p-0 overflow-y-auto border-none shadow-2xl">
            <div className="bg-slate-900 p-8 text-white">
              <DialogTitle className="text-2xl font-black">Edit & Send Letter</DialogTitle>
              <DialogDescription className="text-slate-300 font-medium">
                Candidate details are prefilled from interview-completed records. Update content and send directly.
              </DialogDescription>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Template</Label>
                  <Input value={selectedTemplateForEditor?.name || ''} readOnly className="rounded-xl border-slate-200 bg-slate-100 h-12 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Interview Status Scope</Label>
                  <Input value="Completed Candidates" readOnly className="rounded-xl border-slate-200 bg-slate-100 h-12 font-bold text-green-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Candidate</Label>
                  <Select value={letterEditor.candidateId} onValueChange={handleEditorCandidateChange}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold">
                      <SelectValue placeholder="Select interview-completed candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {editorCandidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.name} ({candidate.empId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Send To Email</Label>
                  <Input
                    value={letterEditor.recipientEmail}
                    onChange={(e) => setLetterEditor((prev) => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="candidate email"
                    className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Issue Date</Label>
                  <Input
                    type="date"
                    value={letterEditor.date}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      const candidate = editorCandidates.find((item) => item.id === letterEditor.candidateId);
                      const template = selectedTemplateForEditor;
                      setLetterEditor((prev) => ({
                        ...prev,
                        date: nextDate,
                        content: candidate && template
                          ? buildLetterContent(template.name, candidate, nextDate)
                          : prev.content
                      }));
                    }}
                    className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Format</Label>
                  <Select
                    value={letterEditor.format}
                    onValueChange={(value) => setLetterEditor((prev) => ({ ...prev, format: value }))}
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

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject</Label>
                <Input
                  value={letterEditor.subject}
                  onChange={(e) => setLetterEditor((prev) => ({ ...prev, subject: e.target.value }))}
                  className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Signature</Label>
                <Select
                  value={letterEditor.signatureId}
                  onValueChange={(value) => setLetterEditor((prev) => ({ ...prev, signatureId: value }))}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-12 font-bold">
                    <SelectValue placeholder="Select signature" />
                  </SelectTrigger>
                  <SelectContent>
                    {signatureProfiles.map((signature) => (
                      <SelectItem key={signature.id} value={signature.id}>
                        {signature.signerName} ({signature.designation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500 font-medium">Signatures are pulled from E-Sign settings.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Upload Supporting Documents</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setUploadedDocuments(Array.from(e.target.files || []))}
                  className="rounded-xl border-slate-200 bg-slate-50 font-medium"
                />
                {uploadedDocuments.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Selected Files</p>
                    <div className="space-y-1">
                      {uploadedDocuments.map((file) => (
                        <p key={`${file.name}-${file.size}`} className="text-xs text-slate-600 font-medium truncate">
                          {file.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Letter Content</Label>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="max-h-[260px] overflow-y-auto rounded-xl bg-slate-50 p-4">
                    <div
                      className="rounded-lg border border-slate-200 px-4 py-3 text-xs"
                      style={{
                        background: brandingSettings.headerBackground,
                        color: brandingSettings.headerTextColor
                      }}
                    >
                      {brandingSettings.headerMode === 'upload' ? (
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold uppercase">Uploaded Header</p>
                          <p className="text-[11px] font-semibold">
                            {headerUploadFile?.name || 'header-file.pdf'}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black">
                              {brandingSettings.companyName || 'Z-ERP Solutions'}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide">
                              {brandingSettings.companyTagline || 'Business Intelligence System'}
                            </p>
                          </div>
                          <div className="text-right text-[10px] font-semibold">
                            <p>{brandingSettings.companyPhone || '+91 90000 00000'}</p>
                            <p>{brandingSettings.companyEmail || 'hello@z-erp.app'}</p>
                            <p>{brandingSettings.companyWebsite || 'www.z-erp.app'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-700 shadow-inner">
                      {letterEditor.content || 'Letter content will appear here...'}
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-700">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Signature</p>
                      {selectedSignature ? (
                        <div className="space-y-1">
                          {selectedSignature.fileDataUrl ? (
                            <img
                              src={selectedSignature.fileDataUrl}
                              alt="Signature"
                              className="h-12 object-contain"
                            />
                          ) : (
                            <p className="text-sm font-semibold">{selectedSignature.signatureLabel}</p>
                          )}
                          <p className="text-[11px] font-semibold">
                            {selectedSignature.signerName} • {selectedSignature.designation}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">No signature selected</p>
                      )}
                    </div>

                    <div
                      className="mt-4 rounded-lg border border-slate-200 px-4 py-3 text-xs"
                      style={{
                        background: brandingSettings.footerBackground,
                        color: brandingSettings.footerTextColor
                      }}
                    >
                      {brandingSettings.footerMode === 'upload' ? (
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold uppercase">Uploaded Footer</p>
                          <p className="text-[11px] font-semibold">
                            {footerUploadFile?.name || 'footer-file.pdf'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {brandingSettings.footerNote || 'Thank you for being part of our organization.'}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide">
                            {brandingSettings.footerLegal || 'This letter is system generated and confidential.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Textarea
                  value={letterEditor.content}
                  onChange={(e) => setLetterEditor((prev) => ({ ...prev, content: e.target.value }))}
                  className="rounded-xl border-slate-200 bg-slate-50 min-h-[280px] font-medium"
                />
              </div>

              <div className="p-5 bg-green-50 rounded-2xl border border-green-100 flex gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-900 mb-0.5">Direct Candidate Send</p>
                  <p className="text-[10px] text-green-700 font-medium">This letter will be sent to the candidate's registered email after final review.</p>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setUploadedDocuments([]);
                  setIsLetterEditorOpen(false);
                  setEditingHistoryId(null);
                }}
                className="flex-1 rounded-xl h-12 font-bold text-slate-500"
              >
                Cancel
              </Button>
              <Button onClick={handleSendEditedLetter} className="flex-1 bg-cyan-600 hover:bg-cyan-700 rounded-xl h-12 font-bold shadow-lg shadow-cyan-100">
                <Send className="h-4 w-4 mr-2" />
                Send Letter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

