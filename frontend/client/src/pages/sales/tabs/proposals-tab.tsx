import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Download, 
  Filter, 
  Search,
  Send,
  Eye,
  Edit,
  FileText,
  MoreVertical,
  Paperclip,
  CheckSquare,
  ChevronDown,
  Mail,
  X,
  Calendar as CalendarIcon,
  Trash2,
  Link as LinkIcon,
  Check,
  Building2,
  Save
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV } from '@/lib/csv-export';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';
import ProposalTemplate from '@/components/ProposalTemplate';
import ProposalTemplateEnhanced from '@/components/ProposalTemplateEnhanced';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportProposalToPDF } from '@/lib/proposal-pdf-generator';

export default function ProposalsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const { toast } = useToast();

  // Mock data
  const [proposals, setProposals] = useState([
    {
      id: 'PROP-001',
      subject: 'Website Redesign Project',
      customer: 'Acme Corporation',
      totalAmount: '$45,000',
      date: '2026-01-05',
      validUntil: '2026-02-05',
      project: 'Web Development',
      status: 'sent',
      preparedFor: 'Acme Corporation',
      preparedBy: 'Your Business Name',
      title: 'WEBSITE REDESIGN & DEVELOPMENT',
      overview: 'This proposal outlines the comprehensive redesign and development of a modern, responsive website for Acme Corporation. Our goal is to create a user-friendly platform that enhances your online presence, improves customer engagement, and drives business growth.',
      scopeOfWork: [
        { id: 1, description: 'Website Design', longDescription: 'Three initial design concepts, two rounds of revisions.' },
        { id: 2, description: 'Frontend Development', longDescription: 'Responsive HTML/CSS/JavaScript implementation.' },
        { id: 3, description: 'Backend Integration', longDescription: 'CMS setup and database configuration.' },
        { id: 4, description: 'SEO Optimization', longDescription: 'On-page SEO and performance optimization.' },
        { id: 5, description: 'Quality Assurance', longDescription: 'Cross-browser testing and bug fixes.' },
      ],
      timeline: [
        { phase: 1, task: 'Discovery & Planning', completionDate: '2026-01-12' },
        { phase: 2, task: 'Design & Approval', completionDate: '2026-01-26' },
        { phase: 3, task: 'Development & Testing', completionDate: '2026-02-23' },
        { phase: 4, task: 'Launch & Training', completionDate: '2026-03-05' },
      ],
      items: [
        { id: 1, description: 'Website Design & Mockups', longDescription: 'Complete UI/UX design with 3 revisions', qty: 1, rate: 15000, amount: 15000 },
        { id: 2, description: 'Frontend Development', longDescription: 'Responsive implementation for all devices', qty: 1, rate: 18000, amount: 18000 },
        { id: 3, description: 'Backend & CMS Integration', longDescription: 'WordPress/Custom CMS setup', qty: 1, rate: 10000, amount: 10000 },
        { id: 4, description: 'Training & Documentation', longDescription: 'User training and complete documentation', qty: 1, rate: 2000, amount: 2000 },
      ]
    },
    {
      id: 'PROP-002',
      subject: 'Mobile App Development',
      customer: 'TechStart Inc.',
      totalAmount: '$85,000',
      date: '2026-01-08',
      validUntil: '2026-02-08',
      project: 'Mobile App',
      status: 'accepted',
      preparedFor: 'TechStart Inc.',
      preparedBy: 'Your Business Name',
      title: 'MOBILE APPLICATION DEVELOPMENT',
      overview: 'This proposal outlines the development of a cutting-edge mobile application for TechStart Inc. We will create native iOS and Android applications that deliver exceptional user experience and robust functionality.',
      scopeOfWork: [
        { id: 1, description: 'UI/UX Design', longDescription: 'Mobile-first design for iOS and Android platforms.' },
        { id: 2, description: 'Native Development', longDescription: 'Swift for iOS and Kotlin for Android.' },
        { id: 3, description: 'API Integration', longDescription: 'RESTful API development and integration.' },
        { id: 4, description: 'Push Notifications', longDescription: 'Firebase Cloud Messaging setup.' },
        { id: 5, description: 'App Store Deployment', longDescription: 'Submission to App Store and Play Store.' },
      ],
      timeline: [
        { phase: 1, task: 'Requirements & Wireframing', completionDate: '2026-01-22' },
        { phase: 2, task: 'Design & Prototyping', completionDate: '2026-02-05' },
        { phase: 3, task: 'Development & Integration', completionDate: '2026-03-19' },
        { phase: 4, task: 'Testing & Deployment', completionDate: '2026-04-02' },
      ],
      items: [
        { id: 1, description: 'Mobile UI/UX Design', longDescription: 'Complete app design for iOS and Android', qty: 1, rate: 20000, amount: 20000 },
        { id: 2, description: 'iOS App Development', longDescription: 'Native Swift development', qty: 1, rate: 30000, amount: 30000 },
        { id: 3, description: 'Android App Development', longDescription: 'Native Kotlin development', qty: 1, rate: 25000, amount: 25000 },
        { id: 4, description: 'Backend API & Testing', longDescription: 'API development and comprehensive testing', qty: 1, rate: 10000, amount: 10000 },
      ]
    },
    {
      id: 'PROP-003',
      subject: 'Digital Marketing Campaign',
      customer: 'Global Brands Ltd.',
      totalAmount: '$25,000',
      date: '2026-01-10',
      validUntil: '2026-02-10',
      project: 'Marketing',
      status: 'draft',
      preparedFor: 'Global Brands Ltd.',
      preparedBy: 'Your Business Name',
      title: 'DIGITAL MARKETING STRATEGY',
      overview: 'This proposal outlines a comprehensive digital marketing campaign for Global Brands Ltd. Our strategy focuses on increasing brand awareness, driving website traffic, and generating qualified leads through multi-channel marketing efforts.',
      scopeOfWork: [
        { id: 1, description: 'Social Media Strategy', longDescription: 'Content calendar for Facebook, Instagram, LinkedIn.' },
        { id: 2, description: 'SEO Campaign', longDescription: 'Keyword research and on-page optimization.' },
        { id: 3, description: 'PPC Advertising', longDescription: 'Google Ads and social media ad management.' },
        { id: 4, description: 'Content Creation', longDescription: 'Blog posts, infographics, and video content.' },
        { id: 5, description: 'Analytics & Reporting', longDescription: 'Monthly performance reports and insights.' },
      ],
      timeline: [
        { phase: 1, task: 'Strategy Development', completionDate: '2026-01-24' },
        { phase: 2, task: 'Campaign Launch', completionDate: '2026-02-07' },
        { phase: 3, task: 'Optimization & Scaling', completionDate: '2026-02-28' },
        { phase: 4, task: 'Final Report & Handover', completionDate: '2026-03-14' },
      ],
      items: [
        { id: 1, description: 'Social Media Campaign', longDescription: '3-month multi-platform campaign', qty: 3, rate: 5000, amount: 15000 },
        { id: 2, description: 'SEO Services', longDescription: 'Complete on-page and off-page optimization', qty: 1, rate: 6000, amount: 6000 },
        { id: 3, description: 'Content Creation', longDescription: '20 blog posts, 10 infographics, 5 videos', qty: 1, rate: 4000, amount: 4000 },
      ]
    },
    {
      id: 'PROP-004',
      subject: 'ERP System Implementation',
      customer: 'Enterprise Solutions',
      totalAmount: '$125,000',
      date: '2026-01-12',
      validUntil: '2026-02-12',
      project: 'ERP',
      status: 'declined',
      preparedFor: 'Enterprise Solutions',
      preparedBy: 'Your Business Name',
      title: 'ENTERPRISE RESOURCE PLANNING IMPLEMENTATION',
      overview: 'This proposal outlines the implementation of a comprehensive ERP system for Enterprise Solutions. Our solution will streamline business processes, improve data accuracy, and provide real-time insights across all departments.',
      scopeOfWork: [
        { id: 1, description: 'Needs Assessment', longDescription: 'Comprehensive analysis of business requirements.' },
        { id: 2, description: 'System Configuration', longDescription: 'ERP modules setup and customization.' },
        { id: 3, description: 'Data Migration', longDescription: 'Transfer of existing data to new system.' },
        { id: 4, description: 'User Training', longDescription: 'Comprehensive training for all user levels.' },
        { id: 5, description: 'Go-Live Support', longDescription: 'Post-implementation support and monitoring.' },
      ],
      timeline: [
        { phase: 1, task: 'Assessment & Planning', completionDate: '2026-02-09' },
        { phase: 2, task: 'Configuration & Testing', completionDate: '2026-03-23' },
        { phase: 3, task: 'Data Migration & Training', completionDate: '2026-04-20' },
        { phase: 4, task: 'Go-Live & Support', completionDate: '2026-05-04' },
      ],
      items: [
        { id: 1, description: 'ERP Software License', longDescription: 'Enterprise license for 100 users', qty: 1, rate: 50000, amount: 50000 },
        { id: 2, description: 'System Configuration', longDescription: 'Complete module setup and customization', qty: 1, rate: 35000, amount: 35000 },
        { id: 3, description: 'Data Migration Services', longDescription: 'Legacy system data migration', qty: 1, rate: 25000, amount: 25000 },
        { id: 4, description: 'Training & Support', longDescription: 'User training and 6-month support', qty: 1, rate: 15000, amount: 15000 },
      ]
    }
  ]);

  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit Form State
  const [editCustomer, setEditCustomer] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editBillTo, setEditBillTo] = useState({ address: '', city: '' });
  const [editShipTo, setEditShipTo] = useState({ address: '', city: '' });
  const [editTags, setEditTags] = useState('');
  const [editCurrency, setEditCurrency] = useState('usd');
  const [editStatus, setEditStatus] = useState('accepted');
  const [editReference, setEditReference] = useState('');
  const [editSaleAgent, setEditSaleAgent] = useState('zeruns-erp-admin');
  const [editDiscountType, setEditDiscountType] = useState('no-discount');
  const [editAdminNote, setEditAdminNote] = useState('');
  const [editEstimateNumber, setEditEstimateNumber] = useState('000001');
  const [editEstimatePrefix, setEditEstimatePrefix] = useState('EST-');
  const [editEstimateDate, setEditEstimateDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editClientNote, setEditClientNote] = useState('');
  const [editTerms, setEditTerms] = useState('');
  const [editItems, setEditItems] = useState([
    { id: 1, description: '', longDescription: '', qty: 1, rate: 0, tax: 'No Tax', amount: 0 }
  ]);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editAdjustment, setEditAdjustment] = useState(0);
  const [showQtyAs, setShowQtyAs] = useState<'qty' | 'hours' | 'both'>('qty');

  // Edit Template Fields
  const [editProposalTitle, setEditProposalTitle] = useState('');
  const [editProposalOverview, setEditProposalOverview] = useState('');
  const [editProposalScopeItems, setEditProposalScopeItems] = useState<Array<{ id: number; description: string; longDescription: string }>>([]);
  const [editProposalTimeline, setEditProposalTimeline] = useState<Array<{ id: number; phase: number; task: string; completionDate: string }>>([]);
  const [editCustomSections, setEditCustomSections] = useState<Array<{
    id: number;
    title: string;
    content: string;
    type: 'text' | 'list' | 'table';
    listItems?: Array<{ id: number; text: string }>;
    tableData?: Array<{ id: number; cells: string[] }>;
  }>>([]);
  const [editCustomFields, setEditCustomFields] = useState<Array<{
    id: number;
    label: string;
    value: string;
    type: 'text' | 'number' | 'date' | 'textarea';
    section: 'customer' | 'general';
  }>>([]);

  // Load proposal data into edit form
  const loadProposalForEdit = (proposal: any) => {
    setSelectedProposal(proposal);
    setEditCustomer(proposal.customer || '');
    setEditProject(proposal.project || '');
    setEditBillTo({ address: 'Industrial Ave, Abhu Dhabi', city: 'AE' });
    setEditShipTo({ address: '', city: '' });
    setEditTags('tag');
    setEditCurrency('usd');
    setEditStatus(proposal.status || 'draft');
    setEditReference('');
    setEditSaleAgent('zeruns-erp-admin');
    setEditDiscountType('no-discount');
    setEditAdminNote('');
    setEditEstimateNumber(proposal.id?.split('-')[1] || '000001');
    setEditEstimatePrefix('EST-');
    setEditEstimateDate(proposal.date || new Date().toISOString().split('T')[0]);
    setEditExpiryDate(proposal.validUntil || '');
    setEditClientNote('');
    setEditTerms('');
    
    // Load items from proposal
    if (proposal.items && proposal.items.length > 0) {
      setEditItems(proposal.items);
    } else {
      setEditItems([{ id: 1, description: '', longDescription: '', qty: 1, rate: 0, tax: 'No Tax', amount: 0 }]);
    }
    
    setEditDiscount(0);
    setEditAdjustment(0);
    
    // Load template fields
    setEditProposalTitle(proposal.title || '');
    setEditProposalOverview(proposal.overview || '');
    
    // Load scope of work
    if (proposal.scopeOfWork && proposal.scopeOfWork.length > 0) {
      setEditProposalScopeItems(proposal.scopeOfWork);
    } else {
      setEditProposalScopeItems([{ id: 1, description: '', longDescription: '' }]);
    }
    
    // Load timeline
    if (proposal.timeline && proposal.timeline.length > 0) {
      setEditProposalTimeline(proposal.timeline.map((t: any, index: number) => ({
        id: t.id || index + 1,
        phase: t.phase || index + 1,
        task: t.task || '',
        completionDate: t.completionDate || ''
      })));
    } else {
      setEditProposalTimeline([{ id: 1, phase: 1, task: '', completionDate: '' }]);
    }
    
    // Load custom sections
    setEditCustomSections(proposal.customSections || []);
    
    // Load custom fields
    setEditCustomFields(proposal.customFields || []);
    
    setIsEditOpen(true);
  };

  // Calculate edit form totals
  const calculateEditTotals = () => {
    const subTotal = editItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const discountAmount = editDiscountType === 'percent' ? (subTotal * editDiscount / 100) : editDiscount;
    const total = subTotal - discountAmount + editAdjustment;
    return { subTotal, discountAmount, total };
  };

  const addEditItem = () => {
    setEditItems([...editItems, { 
      id: editItems.length + 1, 
      description: '', 
      longDescription: '', 
      qty: 1, 
      rate: 0, 
      tax: 'No Tax', 
      amount: 0 
    }]);
  };

  const removeEditItem = (id: number) => {
    if (editItems.length > 1) {
      setEditItems(editItems.filter(item => item.id !== id));
    }
  };

  const updateEditItem = (id: number, field: string, value: any) => {
    setEditItems(editItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updated.amount = updated.qty * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  // New Proposal Form State
  const [allowComments, setAllowComments] = useState(false);
  const [proposalItems, setProposalItems] = useState([
    { id: 1, description: '', longDescription: '', qty: 1, rate: 0, tax: 'No Tax', amount: 0 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('%');
  const [adjustment, setAdjustment] = useState(0);

  // New Proposal Template Fields
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalOverview, setProposalOverview] = useState('');
  const [proposalScopeItems, setProposalScopeItems] = useState([
    { id: 1, description: '', longDescription: '' }
  ]);
  const [proposalTimeline, setProposalTimeline] = useState([
    { id: 1, phase: 1, task: '', completionDate: '' }
  ]);

  // Custom Sections - Users can add any custom sections they want
  const [customSections, setCustomSections] = useState<Array<{
    id: number;
    title: string;
    content: string;
    type: 'text' | 'list' | 'table';
    listItems?: Array<{ id: number; text: string }>;
    tableData?: Array<{ id: number; cells: string[] }>;
  }>>([]);

  // Custom Fields - Users can add custom fields to existing sections
  const [customFields, setCustomFields] = useState<Array<{
    id: number;
    label: string;
    value: string;
    type: 'text' | 'number' | 'date' | 'textarea';
    section: 'customer' | 'general';
  }>>([]);

  // Add custom field
  const addCustomField = (section: 'customer' | 'general', type: 'text' | 'number' | 'date' | 'textarea' = 'text') => {
    setCustomFields([...customFields, {
      id: Date.now(),
      label: '',
      value: '',
      type: type,
      section: section,
    }]);
  };

  // Remove custom field
  const removeCustomField = (id: number) => {
    setCustomFields(customFields.filter(field => field.id !== id));
  };

  // Update custom field
  const updateCustomField = (id: number, key: string, value: any) => {
    setCustomFields(customFields.map(field => {
      if (field.id === id) {
        return { ...field, [key]: value };
      }
      return field;
    }));
  };

  // Add custom section
  const addCustomSection = (type: 'text' | 'list' | 'table' = 'text') => {
    setCustomSections([...customSections, {
      id: Date.now(),
      title: '',
      content: '',
      type: type,
      listItems: type === 'list' ? [{ id: 1, text: '' }] : undefined,
      tableData: type === 'table' ? [{ id: 1, cells: ['', ''] }] : undefined,
    }]);
  };

  // Remove custom section
  const removeCustomSection = (id: number) => {
    setCustomSections(customSections.filter(section => section.id !== id));
  };

  // Update custom section
  const updateCustomSection = (id: number, field: string, value: any) => {
    setCustomSections(customSections.map(section => {
      if (section.id === id) {
        return { ...section, [field]: value };
      }
      return section;
    }));
  };

  // Add item to list in custom section
  const addCustomListItem = (sectionId: number) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId && section.listItems) {
        return {
          ...section,
          listItems: [...section.listItems, { id: Date.now(), text: '' }]
        };
      }
      return section;
    }));
  };

  // Remove item from list in custom section
  const removeCustomListItem = (sectionId: number, itemId: number) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId && section.listItems) {
        return {
          ...section,
          listItems: section.listItems.filter(item => item.id !== itemId)
        };
      }
      return section;
    }));
  };

  // Update list item in custom section
  const updateCustomListItem = (sectionId: number, itemId: number, text: string) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId && section.listItems) {
        return {
          ...section,
          listItems: section.listItems.map(item =>
            item.id === itemId ? { ...item, text } : item
          )
        };
      }
      return section;
    }));
  };

  // Add row to table in custom section
  const addCustomTableRow = (sectionId: number) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId && section.tableData) {
        const cellCount = section.tableData[0]?.cells.length || 2;
        return {
          ...section,
          tableData: [...section.tableData, { id: Date.now(), cells: Array(cellCount).fill('') }]
        };
      }
      return section;
    }));
  };

  // Remove row from table in custom section
  const removeCustomTableRow = (sectionId: number, rowId: number) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId && section.tableData && section.tableData.length > 1) {
        return {
          ...section,
          tableData: section.tableData.filter(row => row.id !== rowId)
        };
      }
      return section;
    }));
  };

  // Update table cell in custom section
  const updateCustomTableCell = (sectionId: number, rowId: number, cellIndex: number, value: string) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId && section.tableData) {
        return {
          ...section,
          tableData: section.tableData.map(row => {
            if (row.id === rowId) {
              const newCells = [...row.cells];
              newCells[cellIndex] = value;
              return { ...row, cells: newCells };
            }
            return row;
          })
        };
      }
      return section;
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subTotal = proposalItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const discountAmount = discountType === '%' ? (subTotal * discount / 100) : discount;
    const total = subTotal - discountAmount + adjustment;
    return { subTotal, discountAmount, total };
  };

  const addProposalItem = () => {
    setProposalItems([...proposalItems, { 
      id: proposalItems.length + 1, 
      description: '', 
      longDescription: '', 
      qty: 1, 
      rate: 0, 
      tax: 'No Tax', 
      amount: 0 
    }]);
  };

  const removeProposalItem = (id: number) => {
    setProposalItems(proposalItems.filter(item => item.id !== id));
  };

  const updateProposalItem = (id: number, field: string, value: any) => {
    setProposalItems(proposalItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updated.amount = updated.qty * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  // Scope of Work Management
  const addScopeItem = () => {
    setProposalScopeItems([...proposalScopeItems, { 
      id: proposalScopeItems.length + 1, 
      description: '', 
      longDescription: '' 
    }]);
  };

  const removeScopeItem = (id: number) => {
    if (proposalScopeItems.length > 1) {
      setProposalScopeItems(proposalScopeItems.filter(item => item.id !== id));
    }
  };

  const updateScopeItem = (id: number, field: string, value: any) => {
    setProposalScopeItems(proposalScopeItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Timeline Management
  const addTimelinePhase = () => {
    setProposalTimeline([...proposalTimeline, { 
      id: proposalTimeline.length + 1,
      phase: proposalTimeline.length + 1, 
      task: '', 
      completionDate: '' 
    }]);
  };

  const removeTimelinePhase = (id: number) => {
    if (proposalTimeline.length > 1) {
      setProposalTimeline(proposalTimeline.filter(item => item.id !== id));
    }
  };

  const updateTimelinePhase = (id: number, field: string, value: any) => {
    setProposalTimeline(proposalTimeline.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter(prop => {
      const matchesSearch = 
        prop.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, proposals]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({ title: "Exporting...", description: `Preparing your ${type.toUpperCase()} file.` });

    setTimeout(() => {
      if (type === 'excel') {
        exportToCSV(filteredProposals, `Proposals_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const doc = new jsPDF();
        doc.text("Sales Proposals Report", 14, 15);
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Subject', 'Customer', 'Amount', 'Date', 'Status']],
          body: filteredProposals.map(p => [p.id, p.subject, p.customer, p.totalAmount, p.date, p.status]),
        });
        doc.save(`Proposals_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      setIsExporting(false);
      toast({ title: "Export Complete", description: "File downloaded successfully." });
    }, 1000);
  };

  const handleAction = (action: string, prop: any) => {
    setSelectedProposal(prop);
    if (action === 'view') setIsViewOpen(true);
    else if (action === 'edit') setIsEditOpen(true);
    else if (action === 'send') {
      toast({
        title: "Proposal Sent",
        description: `Proposal ${prop.id} has been dispatched to ${prop.customer}.`,
      });
      setProposals(prev => prev.map(p => p.id === prop.id ? { ...p, status: 'sent' } : p));
    }
  };

  const handleExportProposalPDF = (proposal: any) => {
    try {
      exportProposalToPDF({
        proposalId: proposal.id,
        date: new Date(proposal.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        preparedFor: proposal.preparedFor || proposal.customer,
        preparedBy: proposal.preparedBy || 'Your Business Name',
        title: proposal.title || proposal.subject,
        overview: proposal.overview || '',
        scopeOfWork: proposal.scopeOfWork || [],
        timeline: proposal.timeline || [],
        customer: proposal.customer,
        totalAmount: proposal.totalAmount,
        validUntil: proposal.validUntil,
      });
      toast({
        title: "PDF Exported",
        description: `Proposal ${proposal.id} has been exported to PDF.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the proposal.",
        variant: "destructive",
      });
    }
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    draft: { label: 'Draft', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    sent: { label: 'Sent', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    accepted: { label: 'Accepted', class: 'bg-green-100 text-green-700 border-green-200' },
    declined: { label: 'Declined', class: 'bg-red-100 text-red-700 border-red-200' }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Proposals</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn(statusFilter !== 'all' && "border-indigo-500 bg-indigo-50")}>
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === 'all' ? 'Filters' : `Status: ${statusFilter}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('sent')}>Sent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>Accepted</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('declined')}>Declined</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? '...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('excel')}>CSV (.csv)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF (.pdf)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[95vh] p-0 flex flex-col">
              {/* Sticky Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <DialogTitle className="text-xl font-semibold">Create New Proposal</DialogTitle>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    Draft
                  </Badge>
                </div>
                <p className="text-blue-100 text-sm mt-1">Customize your proposal with template sections, pricing, and custom fields</p>
              </div>

              <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg border border-slate-200 p-5">
                  <h3 className="font-semibold text-base text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                          <span className="text-red-500">*</span> Subject
                        </Label>
                        <Input id="subject" placeholder="Enter proposal subject" className="h-10 bg-white border-slate-300 focus:border-blue-500" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="related" className="text-sm font-medium text-slate-700">
                          <span className="text-red-500">*</span> Related
                        </Label>
                        <Select defaultValue="not-selected">
                          <SelectTrigger id="related" className="h-10 bg-white border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-selected">Not selected</SelectItem>
                            <SelectItem value="project-1">Project Alpha</SelectItem>
                            <SelectItem value="project-2">Project Beta</SelectItem>
                            <SelectItem value="lead-1">Lead - Acme Corp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                            <span className="text-red-500">*</span> Date
                          </Label>
                          <Input id="date" type="date" defaultValue="2026-02-09" className="h-10 bg-white border-slate-300" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="open-till" className="text-sm font-medium text-slate-700">Open Till</Label>
                          <Input id="open-till" type="date" defaultValue="2026-02-16" className="h-10 bg-white border-slate-300" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="currency" className="text-sm font-medium text-slate-700">
                            <span className="text-red-500">*</span> Currency
                          </Label>
                          <Select defaultValue="usd">
                            <SelectTrigger id="currency" className="h-10 bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usd">USD $</SelectItem>
                              <SelectItem value="eur">EUR €</SelectItem>
                              <SelectItem value="gbp">GBP £</SelectItem>
                              <SelectItem value="inr">INR ₹</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discount-type" className="text-sm font-medium text-slate-700">Discount Type</Label>
                          <Select defaultValue="no-discount" onValueChange={(val) => setDiscountType(val === 'percent' ? '%' : '$')}>
                            <SelectTrigger id="discount-type" className="h-10 bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no-discount">No discount</SelectItem>
                              <SelectItem value="percent">Percent (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          Tags
                        </Label>
                        <Input id="tags" placeholder="Add tags..." className="h-10 bg-white border-slate-300" />
                      </div>

                      <div className="flex items-center justify-between py-3 px-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <Label htmlFor="allow-comments" className="text-sm font-medium text-slate-800">Allow Comments</Label>
                        </div>
                        <Switch
                          id="allow-comments"
                          checked={allowComments}
                          onCheckedChange={setAllowComments}
                        />
                      </div>

                    {/* Custom General Fields */}
                    {customFields.filter(f => f.section === 'general').length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-dashed">
                        {customFields.filter(f => f.section === 'general').map((field) => (
                          <div key={field.id} className="flex items-start gap-2">
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Field Label"
                                value={field.label}
                                onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                                className="h-9 font-medium text-sm"
                              />
                              {field.type === 'textarea' ? (
                                <Textarea
                                  placeholder="Value"
                                  value={field.value}
                                  onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                  rows={2}
                                  className="resize-none text-sm"
                                />
                              ) : (
                                <Input
                                  type={field.type}
                                  placeholder="Value"
                                  value={field.value}
                                  onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                  className="h-9"
                                />
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomField(field.id)}
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Custom Field
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                          <DropdownMenuItem onClick={() => addCustomField('general', 'text')}>
                            Text Field
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addCustomField('general', 'number')}>
                            Number Field
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addCustomField('general', 'date')}>
                            Date Field
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addCustomField('general', 'textarea')}>
                            Text Area
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-slate-700">Status</Label>
                        <Select defaultValue="draft">
                          <SelectTrigger id="status" className="h-10 bg-white border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assigned" className="text-sm font-medium text-slate-700">Assigned</Label>
                        <Select defaultValue="zeruns-erp-admin">
                          <SelectTrigger id="assigned" className="h-10 bg-white border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zeruns-erp-admin">Zeruns ERP Admin</SelectItem>
                            <SelectItem value="john-doe">John Doe</SelectItem>
                            <SelectItem value="jane-smith">Jane Smith</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="to" className="text-sm font-medium text-slate-700">
                          <span className="text-red-500">*</span> To
                        </Label>
                        <Input id="to" placeholder="Recipient name" className="h-10 bg-white border-slate-300" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium text-slate-700">Address</Label>
                        <Textarea 
                          id="address" 
                          placeholder="Enter address..." 
                          rows={3}
                          className="resize-none bg-white border-slate-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium text-slate-700">City</Label>
                          <Input id="city" placeholder="City" className="h-10 bg-white border-slate-300" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-medium text-slate-700">State</Label>
                          <Input id="state" placeholder="State" className="h-10 bg-white border-slate-300" />
                        </div>
                      </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm">Country</Label>
                        <Select defaultValue="not-selected">
                          <SelectTrigger id="country" className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-selected">Not selected</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="in">India</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip" className="text-sm">Zip Code</Label>
                        <Input id="zip" placeholder="Zip Code" className="h-10" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">* Email</Label>
                        <Input id="email" type="email" placeholder="email@example.com" className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm">Phone</Label>
                        <Input id="phone" type="tel" placeholder="Phone number" className="h-10" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Customer Fields */}
                {customFields.filter(f => f.section === 'customer').length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-dashed">
                      {customFields.filter(f => f.section === 'customer').map((field) => (
                        <div key={field.id} className="flex items-start gap-2">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Field Label (e.g., Tax ID, VAT Number)"
                              value={field.label}
                              onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                              className="h-10 font-medium"
                            />
                            {field.type === 'textarea' ? (
                              <Textarea
                                placeholder="Value"
                                value={field.value}
                                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                rows={2}
                                className="resize-none"
                              />
                            ) : (
                              <Input
                                type={field.type}
                                placeholder="Value"
                                value={field.value}
                                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                className="h-10"
                              />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomField(field.id)}
                            className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Field
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48">
                        <DropdownMenuItem onClick={() => addCustomField('customer', 'text')}>
                          Text Field
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCustomField('customer', 'number')}>
                          Number Field
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCustomField('customer', 'date')}>
                          Date Field
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCustomField('customer', 'textarea')}>
                          Text Area
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Project Title Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50/30 rounded-lg border-2 border-indigo-200 p-5">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-indigo-900 mb-4">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Project Title
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="project-title" className="text-sm font-medium text-slate-700">Title (e.g., BRAND IDENTITY DEVELOPMENT)</Label>
                    <Input
                      id="project-title"
                      placeholder="Enter project title in uppercase"
                      value={proposalTitle}
                      onChange={(e) => setProposalTitle(e.target.value)}
                      className="h-11 font-semibold bg-white border-slate-300 text-lg"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This will appear as the main heading in your proposal template.
                    </p>
                  </div>
                </div>

                {/* Project Overview Section */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50/30 rounded-lg border-2 border-blue-200 p-5">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-blue-900 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Project Overview
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="project-overview" className="text-sm font-medium text-slate-700">Overview Description</Label>
                    <Textarea
                      id="project-overview"
                      placeholder="Enter a comprehensive project overview that outlines the goals and objectives..."
                      value={proposalOverview}
                      onChange={(e) => setProposalOverview(e.target.value)}
                      rows={5}
                      className="resize-none bg-white border-slate-300"
                    />
                    <p className="text-xs text-slate-500">
                      This will appear as the first section in your proposal template.
                    </p>
                  </div>
                </div>

                {/* Scope of Work Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-lg border-2 border-green-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-green-900">
                      <CheckSquare className="h-5 w-5 text-green-600" />
                      Scope of Work
                    </h3>
                    <Button size="sm" variant="outline" onClick={addScopeItem} className="bg-white hover:bg-green-50 border-green-300">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deliverable
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {proposalScopeItems.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-slate-50/50">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <div className="space-y-2">
                              <Label className="text-sm">Deliverable {index + 1}</Label>
                              <Input
                                placeholder="e.g., Logo Design"
                                value={item.description}
                                onChange={(e) => updateScopeItem(item.id, 'description', e.target.value)}
                                className="h-10 bg-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Description</Label>
                              <Textarea
                                placeholder="e.g., Three initial concepts, two rounds of revisions."
                                value={item.longDescription}
                                onChange={(e) => updateScopeItem(item.id, 'longDescription', e.target.value)}
                                rows={2}
                                className="resize-none bg-white"
                              />
                            </div>
                          </div>
                          {proposalScopeItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeScopeItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Timeline Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-indigo-600" />
                      Project Timeline
                    </h3>
                    <Button size="sm" variant="outline" onClick={addTimelinePhase}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Phase
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-20">Phase</TableHead>
                          <TableHead>Task</TableHead>
                          <TableHead className="w-48">Completion Date</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proposalTimeline.map((phase, index) => (
                          <TableRow key={phase.id}>
                            <TableCell>
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                                {phase.phase}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="e.g., Research & Concept Development"
                                value={phase.task}
                                onChange={(e) => updateTimelinePhase(phase.id, 'task', e.target.value)}
                                className="h-10"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={phase.completionDate}
                                onChange={(e) => updateTimelinePhase(phase.id, 'completionDate', e.target.value)}
                                className="h-10"
                              />
                            </TableCell>
                            <TableCell>
                              {proposalTimeline.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimelinePhase(phase.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Items Section */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/30 rounded-lg border-2 border-orange-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-orange-900">
                      <Building2 className="h-5 w-5 text-orange-600" />
                      Pricing & Items
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-medium">Show quantity as:</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs bg-white border-orange-300">
                        Qty
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Hours
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Qty/Hours
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-48 h-10 bg-white border-slate-300">
                        <SelectValue placeholder="Add items" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Item</SelectItem>
                        <SelectItem value="service-1">Consulting Service</SelectItem>
                        <SelectItem value="service-2">Development Service</SelectItem>
                        <SelectItem value="product-1">Software License</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={addProposalItem} className="bg-white hover:bg-orange-50 border-orange-300">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Items Table */}
                  <div className="border-2 rounded-lg overflow-hidden shadow-sm bg-white">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50">
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead className="w-32 font-semibold">Item</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="w-24 font-semibold">Qty</TableHead>
                          <TableHead className="w-32 font-semibold">Rate</TableHead>
                          <TableHead className="w-32 font-semibold">Tax</TableHead>
                          <TableHead className="w-32 text-right font-semibold">Amount</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proposalItems.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell></TableCell>
                            <TableCell>
                              <Input 
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => updateProposalItem(item.id, 'description', e.target.value)}
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea
                                placeholder="Long description"
                                value={item.longDescription}
                                onChange={(e) => updateProposalItem(item.id, 'longDescription', e.target.value)}
                                className="min-h-[60px] resize-none text-sm"
                                rows={2}
                              />
                              <Button variant="link" size="sm" className="h-6 px-0 text-xs text-blue-600">
                                Link
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateProposalItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                className="h-9"
                                min="0"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="Rate"
                                value={item.rate}
                                onChange={(e) => updateProposalItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                className="h-9"
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={item.tax} onValueChange={(val) => updateProposalItem(item.id, 'tax', val)}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="No Tax">No Tax</SelectItem>
                                  <SelectItem value="GST 18%">GST 18%</SelectItem>
                                  <SelectItem value="VAT 10%">VAT 10%</SelectItem>
                                  <SelectItem value="Sales Tax 8%">Sales Tax 8%</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${item.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {proposalItems.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeProposalItem(item.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals Section */}
                  <div className="flex justify-end pt-4 mt-4 border-t-2 border-orange-200">
                    <div className="w-96 space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Sub Total:</span>
                        <span className="font-semibold text-slate-800">${calculateTotals().subTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-3 py-2 border-y border-dashed">
                        <span className="text-slate-600 text-sm font-medium">Discount</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="w-24 h-9 border-slate-300"
                            min="0"
                          />
                          <Select value={discountType} onValueChange={setDiscountType}>
                            <SelectTrigger className="w-20 h-9 border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="%">%</SelectItem>
                              <SelectItem value="$">$</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="font-semibold w-24 text-right text-red-600">-${calculateTotals().discountAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-slate-600 text-sm font-medium">Adjustment</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={adjustment}
                            onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                            className="w-24 h-9 border-slate-300"
                          />
                          <span className="font-semibold w-24 text-right text-blue-600">${adjustment.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold pt-3 border-t-2 border-slate-300">
                        <span className="text-slate-800">Total:</span>
                        <span className="text-blue-600">${calculateTotals().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Sections - Users can add any custom sections */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <Plus className="h-4 w-4 text-indigo-600" />
                      Custom Sections
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Section
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => addCustomSection('text')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Text Section
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCustomSection('list')}>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          List Section
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCustomSection('table')}>
                          <Building2 className="h-4 w-4 mr-2" />
                          Table Section
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {customSections.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm text-slate-500 mb-2">No custom sections added</p>
                      <p className="text-xs text-slate-400 mb-4">Add text, list, or table sections to customize your proposal</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customSections.map((section, index) => (
                        <div key={section.id} className="border-2 border-indigo-100 rounded-lg p-4 bg-gradient-to-br from-indigo-50/30 to-purple-50/30">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                                {index + 1}
                              </div>
                              <Input
                                placeholder="Section Title (e.g., Payment Terms, Guarantees, Methodology)"
                                value={section.title}
                                onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                                className="h-10 font-semibold bg-white"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomSection(section.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Text Section */}
                          {section.type === 'text' && (
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-600">Content</Label>
                              <Textarea
                                placeholder="Enter your custom content here..."
                                value={section.content}
                                onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}
                                rows={4}
                                className="resize-none bg-white"
                              />
                            </div>
                          )}

                          {/* List Section */}
                          {section.type === 'list' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm text-slate-600">List Items</Label>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addCustomListItem(section.id)}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Item
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {section.listItems?.map((item, itemIndex) => (
                                  <div key={item.id} className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                                      {itemIndex + 1}
                                    </div>
                                    <Input
                                      placeholder="List item..."
                                      value={item.text}
                                      onChange={(e) => updateCustomListItem(section.id, item.id, e.target.value)}
                                      className="h-9 bg-white"
                                    />
                                    {section.listItems && section.listItems.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCustomListItem(section.id, item.id)}
                                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Table Section */}
                          {section.type === 'table' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm text-slate-600">Table Data</Label>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addCustomTableRow(section.id)}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Row
                                </Button>
                              </div>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <Table>
                                  <TableBody>
                                    {section.tableData?.map((row, rowIndex) => (
                                      <TableRow key={row.id}>
                                        {row.cells.map((cell, cellIndex) => (
                                          <TableCell key={cellIndex} className="p-2">
                                            <Input
                                              placeholder={`${rowIndex === 0 ? 'Header' : 'Cell'} ${cellIndex + 1}`}
                                              value={cell}
                                              onChange={(e) => updateCustomTableCell(section.id, row.id, cellIndex, e.target.value)}
                                              className="h-9 border-slate-200"
                                            />
                                          </TableCell>
                                        ))}
                                        <TableCell className="p-2 w-12">
                                          {section.tableData && section.tableData.length > 1 && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeCustomTableRow(section.id, row.id)}
                                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 flex items-start gap-2">
                      <span className="font-semibold">💡 Tip:</span>
                      <span>
                        Add custom sections like "Payment Terms", "Guarantees", "Methodology", "Team", "References", 
                        or any other content you want to include in your proposal.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Bottom Note */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 pt-4 border-t space-y-2">
                  <h4 className="font-semibold text-sm text-indigo-900 flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    Fully Customizable Proposal Template
                  </h4>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>• Use <span className="font-mono bg-white px-1.5 py-0.5 rounded border">{'{'}proposal_items{'}'}</span> to include pricing table anywhere in your content</p>
                    <p>• Add custom fields to capture any additional information you need</p>
                    <p>• Create custom sections for payment terms, guarantees, methodology, or any content</p>
                    <p>• Choose from text, list, or table formats for maximum flexibility</p>
                  </div>
                </div>
              </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="flex-shrink-0 bg-white border-t px-6 py-4 flex justify-end gap-3 shadow-lg">
                <Button variant="outline" size="lg" className="px-6">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button variant="outline" size="lg" className="px-6 border-slate-300">
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <div className="relative inline-flex">
                  <Button size="lg" className="rounded-r-none bg-blue-600 hover:bg-blue-700 px-6">
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="lg" className="rounded-l-none border-l border-white/20 px-3 bg-blue-600 hover:bg-blue-700">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>
                        <Send className="h-4 w-4 mr-2" />
                        Save & Send
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Save and Send Later
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Save & Record Payment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[140px]">
                <div className="flex items-center gap-1">
                  Proposal #
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="w-[120px]">Total Amount</TableHead>
              <TableHead className="w-[110px]">Date</TableHead>
              <TableHead className="w-[110px]">Valid Until</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProposals.map((proposal, index) => (
              <TableRow 
                key={`${proposal.id}-${index}`}
                className="hover:bg-slate-50/50 group"
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-blue-600 hover:underline cursor-pointer font-medium font-mono text-sm">
                      {proposal.id}
                    </span>
                    {hoveredRow === index && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 animate-in fade-in duration-200">
                        <button 
                          className="hover:underline"
                          onClick={() => handleAction('view', proposal)}
                        >
                          View
                        </button>
                        <span className="text-slate-300">|</span>
                        <button 
                          className="hover:underline"
                          onClick={() => loadProposalForEdit(proposal)}
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button 
                          className="hover:underline text-green-600"
                          onClick={() => handleAction('send', proposal)}
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{proposal.subject}</TableCell>
                <TableCell>
                  {proposal.customer && (
                    <span className="text-blue-600 hover:underline cursor-pointer">{proposal.customer}</span>
                  )}
                </TableCell>
                <TableCell className="font-semibold text-green-700">{proposal.totalAmount}</TableCell>
                <TableCell className="text-sm text-slate-600">{proposal.date}</TableCell>
                <TableCell className="text-sm text-slate-600">{proposal.validUntil}</TableCell>
                <TableCell className="text-sm text-slate-600">{proposal.project}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize", statusConfig[proposal.status].class)}>
                    {statusConfig[proposal.status].label}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
            <ScrollArea className="max-h-[95vh]">
              <div className="p-6">
                <DialogHeader className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <DialogTitle className="text-2xl font-bold">Proposal {selectedProposal?.id}</DialogTitle>
                      <Badge className={selectedProposal ? statusConfig[selectedProposal.status].class : ""}>
                        {selectedProposal?.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                        Close
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleExportProposalPDF(selectedProposal)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        className="bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        onClick={() => {
                          handleAction('send', selectedProposal);
                          setIsViewOpen(false);
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Proposal
                      </Button>
                    </div>
                  </div>
                </DialogHeader>

                {/* Tabs for different views */}
                <Tabs defaultValue="professional" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="professional">Professional View</TabsTrigger>
                    <TabsTrigger value="template">Simple Template</TabsTrigger>
                    <TabsTrigger value="details">Details View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="professional">
                    {selectedProposal && (
                      <ProposalTemplateEnhanced
                        proposalId={selectedProposal.id}
                        date={new Date(selectedProposal.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        preparedFor={selectedProposal.preparedFor || selectedProposal.customer}
                        preparedBy={selectedProposal.preparedBy || 'Your Business Name'}
                        title={selectedProposal.title || selectedProposal.subject}
                        overview={selectedProposal.overview}
                        scopeOfWork={selectedProposal.scopeOfWork}
                        timeline={selectedProposal.timeline}
                        status={selectedProposal.status}
                        customer={selectedProposal.customer}
                        totalAmount={selectedProposal.totalAmount}
                        validUntil={selectedProposal.validUntil}
                        company={{
                          name: 'ZOLLID',
                          tagline: 'ZOLLID BRANDING SOLUTIONS PVT. LTD.',
                          address: 'Office Address',
                          city: 'Main Street, Your Location',
                          email: 'info@yourcompany.com',
                          phone: '+1 234 567 890',
                          website: 'www.yourcompany.com'
                        }}
                        customerInfo={{
                          name: selectedProposal.customer,
                          address: 'Client Address',
                          city: 'Client Location',
                          email: 'client@email.com',
                          phone: '+1 234 567 890'
                        }}
                        items={selectedProposal.items || []}
                        subTotal={parseFloat(selectedProposal.totalAmount?.replace(/[$,]/g, '') || '0')}
                        discount={0}
                        total={parseFloat(selectedProposal.totalAmount?.replace(/[$,]/g, '') || '0')}
                        terms={[
                          'Payment terms: 50% upfront, 50% upon completion',
                          'All deliverables are subject to client approval',
                          'Revisions beyond the agreed scope will be billed separately',
                          'Project timeline is subject to timely feedback and approvals'
                        ]}
                        currency="$"
                        saleAgent="Zeruns ERP Admin"
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="template">
                    {selectedProposal && (
                      <ProposalTemplate
                        proposalId={selectedProposal.id}
                        date={new Date(selectedProposal.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        preparedFor={selectedProposal.preparedFor || selectedProposal.customer}
                        preparedBy={selectedProposal.preparedBy || 'Your Business Name'}
                        title={selectedProposal.title || selectedProposal.subject}
                        overview={selectedProposal.overview}
                        scopeOfWork={selectedProposal.scopeOfWork}
                        timeline={selectedProposal.timeline}
                        status={selectedProposal.status}
                        customer={selectedProposal.customer}
                        totalAmount={selectedProposal.totalAmount}
                        validUntil={selectedProposal.validUntil}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="space-y-6 bg-white p-8 rounded-lg border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <Label className="text-slate-500 text-xs uppercase tracking-wider">Customer</Label>
                          <p className="font-semibold text-lg">{selectedProposal?.customer}</p>
                        </div>
                        <div>
                          <Label className="text-slate-500 text-xs uppercase tracking-wider">Total Amount</Label>
                          <p className="font-semibold text-lg text-emerald-600">{selectedProposal?.totalAmount}</p>
                        </div>
                        <div>
                          <Label className="text-slate-500 text-xs uppercase tracking-wider">Project</Label>
                          <p className="font-medium">{selectedProposal?.project}</p>
                        </div>
                        <div>
                          <Label className="text-slate-500 text-xs uppercase tracking-wider">Valid Until</Label>
                          <p className="font-medium text-amber-600">{selectedProposal?.validUntil}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50">
                        <h4 className="font-bold flex items-center gap-2 mb-4">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          Executive Summary
                        </h4>
                        <p className="text-slate-600 leading-relaxed">
                          {selectedProposal?.overview || `This proposal covers the ${selectedProposal?.subject} for ${selectedProposal?.customer}. The project aims to deliver high-quality results within the specified timeframe and budget.`}
                        </p>
                      </div>

                      {selectedProposal?.scopeOfWork && selectedProposal.scopeOfWork.length > 0 && (
                        <div className="rounded-xl border border-slate-200 p-6 bg-white">
                          <h4 className="font-bold flex items-center gap-2 mb-4">
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                            Scope of Work
                          </h4>
                          <ul className="space-y-3">
                            {selectedProposal.scopeOfWork.map((item: any) => (
                              <li key={item.id} className="flex gap-3">
                                <span className="text-indigo-600 mt-1">•</span>
                                <div>
                                  <span className="font-semibold text-slate-900">{item.description}</span>
                                  {item.longDescription && (
                                    <span className="text-slate-600"> – {item.longDescription}</span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedProposal?.timeline && selectedProposal.timeline.length > 0 && (
                        <div className="rounded-xl border border-slate-200 p-6 bg-white">
                          <h4 className="font-bold flex items-center gap-2 mb-4">
                            <CalendarIcon className="h-4 w-4 text-indigo-600" />
                            Project Timeline
                          </h4>
                          <div className="space-y-3">
                            {selectedProposal.timeline.map((phase: any) => (
                              <div key={phase.phase} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                                  {phase.phase}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{phase.task}</p>
                                </div>
                                <div className="text-sm text-slate-500">
                                  {phase.completionDate}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - Enhanced matching EST form layout */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
            <ScrollArea className="max-h-[95vh]">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-lg font-semibold text-blue-600">{editEstimatePrefix}{editEstimateNumber}</DialogTitle>
                  <Badge className={cn("capitalize", statusConfig[editStatus]?.class || 'bg-green-100 text-green-700')}>
                    {editStatus.charAt(0).toUpperCase() + editStatus.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Two Column Layout - Top Section */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-red-500">* Customer</Label>
                      <Select value={editCustomer} onValueChange={setEditCustomer}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Greeen Dot">Greeen Dot</SelectItem>
                          <SelectItem value="Acme Corporation">Acme Corporation</SelectItem>
                          <SelectItem value="TechStart Inc.">TechStart Inc.</SelectItem>
                          <SelectItem value="Global Brands Ltd.">Global Brands Ltd.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Project</Label>
                      <Select value={editProject} onValueChange={setEditProject}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select and begin typing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Mobile App">Mobile App</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="ERP">ERP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-slate-500">Bill To</Label>
                        <div className="text-sm">
                          <p className="font-medium">Dubai</p>
                          <p className="text-slate-600">{editBillTo.address}</p>
                          <p className="text-slate-600">{editBillTo.city}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-slate-500">Ship To</Label>
                        <div className="text-sm text-slate-400">-,--<br />-,--</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-red-500">* Estimate Number</Label>
                        <div className="flex gap-2">
                          <Select value={editEstimatePrefix} onValueChange={setEditEstimatePrefix}>
                            <SelectTrigger className="w-20 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EST-">EST-</SelectItem>
                              <SelectItem value="PROP-">PROP-</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input 
                            value={editEstimateNumber}
                            onChange={(e) => setEditEstimateNumber(e.target.value)}
                            className="h-9 flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-red-500">* Estimate Date</Label>
                        <div className="relative">
                          <Input 
                            type="date"
                            value={editEstimateDate}
                            onChange={(e) => setEditEstimateDate(e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Expiry Date</Label>
                        <div className="relative">
                          <Input 
                            type="date"
                            value={editExpiryDate}
                            onChange={(e) => setEditExpiryDate(e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center gap-1">
                          <span className="text-slate-500">●</span> Tags
                        </Label>
                        <Input 
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          placeholder="tag"
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-red-500">* Currency</Label>
                        <Select value={editCurrency} onValueChange={setEditCurrency}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD $</SelectItem>
                            <SelectItem value="eur">EUR €</SelectItem>
                            <SelectItem value="inr">INR ₹</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Status</Label>
                        <Select value={editStatus} onValueChange={setEditStatus}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Reference #</Label>
                      <Input 
                        value={editReference}
                        onChange={(e) => setEditReference(e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Sale Agent</Label>
                        <Select value={editSaleAgent} onValueChange={setEditSaleAgent}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zeruns-erp-admin">Zeruns ERP Admin</SelectItem>
                            <SelectItem value="john-doe">John Doe</SelectItem>
                            <SelectItem value="jane-smith">Jane Smith</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Discount type</Label>
                        <Select value={editDiscountType} onValueChange={setEditDiscountType}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-discount">No discount</SelectItem>
                            <SelectItem value="percent">Percent (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Admin Note</Label>
                      <Textarea 
                        value={editAdminNote}
                        onChange={(e) => setEditAdminNote(e.target.value)}
                        placeholder="Admin note..."
                        rows={3}
                        className="resize-none text-sm"
                      />
                    </div>

                    {/* Custom Fields in Customer Section */}
                    {editCustomFields.filter(f => f.section === 'customer').length > 0 && (
                      <div className="space-y-3 pt-2 border-t">
                        {editCustomFields.filter(f => f.section === 'customer').map(field => (
                          <div key={field.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">{field.label}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditCustomFields(editCustomFields.filter(f => f.id !== field.id))}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {field.type === 'text' && (
                              <Input 
                                value={field.value}
                                onChange={(e) => {
                                  const updated = editCustomFields.map(f => 
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  setEditCustomFields(updated);
                                }}
                                className="h-9"
                              />
                            )}
                            {field.type === 'number' && (
                              <Input 
                                type="number"
                                value={field.value}
                                onChange={(e) => {
                                  const updated = editCustomFields.map(f => 
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  setEditCustomFields(updated);
                                }}
                                className="h-9"
                              />
                            )}
                            {field.type === 'date' && (
                              <Input 
                                type="date"
                                value={field.value}
                                onChange={(e) => {
                                  const updated = editCustomFields.map(f => 
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  setEditCustomFields(updated);
                                }}
                                className="h-9"
                              />
                            )}
                            {field.type === 'textarea' && (
                              <Textarea 
                                value={field.value}
                                onChange={(e) => {
                                  const updated = editCustomFields.map(f => 
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  setEditCustomFields(updated);
                                }}
                                rows={3}
                                className="resize-none text-sm"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Status</Label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="revised">Revised</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Fields in General Section */}
                    {editCustomFields.filter(f => f.section === 'general').length > 0 && (
                      <div className="space-y-3 pt-2 border-t">
                        {editCustomFields.filter(f => f.section === 'general').map(field => (
                          <div key={field.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">{field.label}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditCustomFields(editCustomFields.filter(f => f.id !== field.id))}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {field.type === 'text' && (
                              <Input 
                                value={field.value}
                                onChange={(e) => {
                                  const updated = editCustomFields.map(f => 
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  setEditCustomFields(updated);
                                }}
                                className="h-9"
                              />
                            )}
                            {field.type === 'number' && (
                              <Input 
                                type="number"
                                value={field.value}
                                onChange={(e) => {
                                  const updated = editCustomFields.map(f => 
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  setEditCustomFields(updated);
                                }}
                                className="h-9"
                              />
                            )}
                            {field.type === 'date' && (
                              <Input 
                                type="date"
                                value={field.value}
                                onChange={(e) => {
                                  const updated = editCustomFields.map(f => 
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  setEditCustomFields(updated);
                                }}
                                className="h-9"
                              />
                            )}
                            {field.type === 'textarea' && (
                              <Textarea 
                                value={field.value}
                                onChange={(e) => {
                                  const updated = editCustomFields.map(f => 
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  setEditCustomFields(updated);
                                }}
                                rows={3}
                                className="resize-none text-sm"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Select>
                        <SelectTrigger className="w-32 h-9">
                          <SelectValue placeholder="Add Item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Item</SelectItem>
                          <SelectItem value="brochure">Brochure</SelectItem>
                          <SelectItem value="flyer">Flyer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={addEditItem} className="h-9 w-9 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>Show quantity as:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name="qty-type" 
                          checked={showQtyAs === 'qty'}
                          onChange={() => setShowQtyAs('qty')}
                          className="w-3 h-3"
                        />
                        <span className="text-xs">Qty</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name="qty-type" 
                          checked={showQtyAs === 'hours'}
                          onChange={() => setShowQtyAs('hours')}
                          className="w-3 h-3"
                        />
                        <span className="text-xs">Hours</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name="qty-type" 
                          checked={showQtyAs === 'both'}
                          onChange={() => setShowQtyAs('both')}
                          className="w-3 h-3"
                        />
                        <span className="text-xs">Qty/Hours</span>
                      </label>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-8 text-center">●</TableHead>
                          <TableHead className="w-40">Item</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-24 text-center">Qty</TableHead>
                          <TableHead className="w-28">Rate</TableHead>
                          <TableHead className="w-28">Tax</TableHead>
                          <TableHead className="w-28 text-right">Amount</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editItems.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-slate-50/50">
                            <TableCell className="text-center">
                              <div className="w-3 h-3 rounded-full border-2 border-slate-300"></div>
                            </TableCell>
                            <TableCell>
                              <Textarea
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => updateEditItem(item.id, 'description', e.target.value)}
                                className="min-h-[60px] resize-none text-sm border-dashed"
                                rows={2}
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea
                                placeholder="Long description"
                                value={item.longDescription}
                                onChange={(e) => updateEditItem(item.id, 'longDescription', e.target.value)}
                                className="min-h-[60px] resize-none text-sm border-dashed"
                                rows={2}
                              />
                              <button className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1">
                                <LinkIcon className="h-3 w-3" />
                                Link
                              </button>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateEditItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                className="h-9 text-center text-sm"
                                min="0"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="Rate"
                                value={item.rate || ''}
                                onChange={(e) => updateEditItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                className="h-9 text-sm"
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={item.tax} onValueChange={(val) => updateEditItem(item.id, 'tax', val)}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="No Tax">No Tax</SelectItem>
                                  <SelectItem value="GST 18%">GST 18%</SelectItem>
                                  <SelectItem value="VAT 10%">VAT 10%</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right font-medium text-sm">
                              ${item.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                {editItems.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeEditItem(item.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end pt-2">
                  <div className="w-96 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Sub Total:</span>
                      <span className="font-semibold">${calculateEditTotals().subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-slate-600 text-sm">Discount</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editDiscount}
                          onChange={(e) => setEditDiscount(parseFloat(e.target.value) || 0)}
                          className="w-24 h-9 text-sm text-blue-600"
                          min="0"
                          placeholder="0.00"
                        />
                        <Select value={editDiscountType === 'percent' ? '%' : '$'}>
                          <SelectTrigger className="w-16 h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="%">%</SelectItem>
                            <SelectItem value="$">$</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="font-semibold w-24 text-right text-sm">${calculateEditTotals().discountAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-slate-600 text-sm">Adjustment</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editAdjustment}
                          onChange={(e) => setEditAdjustment(parseFloat(e.target.value) || 0)}
                          className="w-24 h-9 text-sm text-blue-600"
                          placeholder="0.00"
                        />
                        <span className="font-semibold w-24 text-right text-sm">${editAdjustment.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-base font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>${calculateEditTotals().total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* TEMPLATE SECTIONS */}
                
                {/* Project Title Section */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Project Title
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="edit-project-title" className="text-sm">Title</Label>
                    <Input
                      id="edit-project-title"
                      placeholder="Enter project title"
                      value={editProposalTitle}
                      onChange={(e) => setEditProposalTitle(e.target.value)}
                      className="h-10 font-semibold"
                    />
                  </div>
                </div>

                {/* Project Overview Section */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Project Overview
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="edit-project-overview" className="text-sm">Overview Description</Label>
                    <Textarea
                      id="edit-project-overview"
                      placeholder="Enter project overview..."
                      value={editProposalOverview}
onChange={(e) => setEditProposalOverview(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Scope of Work Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                      Scope of Work
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditProposalScopeItems([...editProposalScopeItems, { 
                        id: Date.now(), 
                        description: '', 
                        longDescription: '' 
                      }]);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deliverable
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editProposalScopeItems.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-slate-50/50">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <div className="space-y-2">
                              <Label className="text-sm">Deliverable {index + 1}</Label>
                              <Input
                                placeholder="e.g., Logo Design"
                                value={item.description}
                                onChange={(e) => {
                                  const updated = editProposalScopeItems.map(it => 
                                    it.id === item.id ? { ...it, description: e.target.value } : it
                                  );
                                  setEditProposalScopeItems(updated);
                                }}
                                className="h-10 bg-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Description</Label>
                              <Textarea
                                placeholder="Description..."
                                value={item.longDescription}
                                onChange={(e) => {
                                  const updated = editProposalScopeItems.map(it => 
                                    it.id === item.id ? { ...it, longDescription: e.target.value } : it
                                  );
                                  setEditProposalScopeItems(updated);
                                }}
                                rows={2}
                                className="resize-none bg-white"
                              />
                            </div>
                          </div>
                          {editProposalScopeItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditProposalScopeItems(editProposalScopeItems.filter(it => it.id !== item.id))}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Timeline Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-indigo-600" />
                      Project Timeline
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditProposalTimeline([...editProposalTimeline, { 
                        id: Date.now(),
                        phase: editProposalTimeline.length + 1, 
                        task: '', 
                        completionDate: '' 
                      }]);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Phase
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-20">Phase</TableHead>
                          <TableHead>Task</TableHead>
                          <TableHead className="w-48">Completion Date</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editProposalTimeline.map((phase) => (
                          <TableRow key={phase.id}>
                            <TableCell>
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                                {phase.phase}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Task name"
                                value={phase.task}
                                onChange={(e) => {
                                  const updated = editProposalTimeline.map(p => 
                                    p.id === phase.id ? { ...p, task: e.target.value } : p
                                  );
                                  setEditProposalTimeline(updated);
                                }}
                                className="h-10"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={phase.completionDate}
                                onChange={(e) => {
                                  const updated = editProposalTimeline.map(p => 
                                    p.id === phase.id ? { ...p, completionDate: e.target.value } : p
                                  );
                                  setEditProposalTimeline(updated);
                                }}
                                className="h-10"
                              />
                            </TableCell>
                            <TableCell>
                              {editProposalTimeline.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditProposalTimeline(editProposalTimeline.filter(p => p.id !== phase.id))}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Custom Sections */}
                {editCustomSections.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <Plus className="h-4 w-4 text-indigo-600" />
                      Custom Sections
                    </h3>
                    <div className="space-y-4">
                      {editCustomSections.map((section, index) => (
                        <div key={section.id} className="border-2 border-indigo-100 rounded-lg p-4 bg-gradient-to-br from-indigo-50/30 to-purple-50/30">
                          <div className="flex items-center justify-between mb-3">
                            <Input
                              placeholder="Section Title"
                              value={section.title}
                              onChange={(e) => {
                                const updated = editCustomSections.map(s => 
                                  s.id === section.id ? { ...s, title: e.target.value } : s
                                );
                                setEditCustomSections(updated);
                              }}
                              className="h-10 font-semibold bg-white"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditCustomSections(editCustomSections.filter(s => s.id !== section.id))}
                              className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Text Type */}
                          {section.type === 'text' && (
                            <Textarea
                              placeholder="Content..."
                              value={section.content}
                              onChange={(e) => {
                                const updated = editCustomSections.map(s => 
                                  s.id === section.id ? { ...s, content: e.target.value } : s
                                );
                                setEditCustomSections(updated);
                              }}
                              rows={4}
                              className="resize-none bg-white"
                            />
                          )}

                          {/* List Type */}
                          {section.type === 'list' && (
                            <div className="space-y-2">
                              {section.listItems?.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                  <Input 
                                    value={item}
                                    onChange={(e) => {
                                      const updated = editCustomSections.map(s => {
                                        if (s.id === section.id) {
                                          const newListItems = [...(s.listItems || [])];
                                          newListItems[idx] = e.target.value;
                                          return { ...s, listItems: newListItems };
                                        }
                                        return s;
                                      });
                                      setEditCustomSections(updated);
                                    }}
                                    className="bg-white"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updated = editCustomSections.map(s => {
                                        if (s.id === section.id) {
                                          const newListItems = (s.listItems || []).filter((_: any, i: number) => i !== idx);
                                          return { ...s, listItems: newListItems };
                                        }
                                        return s;
                                      });
                                      setEditCustomSections(updated);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updated = editCustomSections.map(s => {
                                    if (s.id === section.id) {
                                      return { ...s, listItems: [...(s.listItems || []), ''] };
                                    }
                                    return s;
                                  });
                                  setEditCustomSections(updated);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                              </Button>
                            </div>
                          )}

                          {/* Table Type */}
                          {section.type === 'table' && (
                            <div className="space-y-2">
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      {section.tableData?.headers?.map((header: string, idx: number) => (
                                        <TableHead key={idx}>
                                          <Input 
                                            value={header}
                                            onChange={(e) => {
                                              const updated = editCustomSections.map(s => {
                                                if (s.id === section.id) {
                                                  const newHeaders = [...(s.tableData?.headers || [])];
                                                  newHeaders[idx] = e.target.value;
                                                  return { 
                                                    ...s, 
                                                    tableData: { ...s.tableData, headers: newHeaders }
                                                  };
                                                }
                                                return s;
                                              });
                                              setEditCustomSections(updated);
                                            }}
                                            className="h-8 bg-white"
                                          />
                                        </TableHead>
                                      ))}
                                      <TableHead className="w-16"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {section.tableData?.rows?.map((row: string[], rowIdx: number) => (
                                      <TableRow key={rowIdx}>
                                        {row.map((cell: string, cellIdx: number) => (
                                          <TableCell key={cellIdx}>
                                            <Input 
                                              value={cell}
                                              onChange={(e) => {
                                                const updated = editCustomSections.map(s => {
                                                  if (s.id === section.id) {
                                                    const newRows = [...(s.tableData?.rows || [])];
                                                    newRows[rowIdx][cellIdx] = e.target.value;
                                                    return { 
                                                      ...s, 
                                                      tableData: { ...s.tableData, rows: newRows }
                                                    };
                                                  }
                                                  return s;
                                                });
                                                setEditCustomSections(updated);
                                              }}
                                              className="h-8 bg-white"
                                            />
                                          </TableCell>
                                        ))}
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const updated = editCustomSections.map(s => {
                                                if (s.id === section.id) {
                                                  const newRows = (s.tableData?.rows || []).filter((_: any, i: number) => i !== rowIdx);
                                                  return { 
                                                    ...s, 
                                                    tableData: { ...s.tableData, rows: newRows }
                                                  };
                                                }
                                                return s;
                                              });
                                              setEditCustomSections(updated);
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updated = editCustomSections.map(s => {
                                    if (s.id === section.id) {
                                      const colCount = s.tableData?.headers?.length || 1;
                                      const newRow = Array(colCount).fill('');
                                      return { 
                                        ...s, 
                                        tableData: { 
                                          ...s.tableData, 
                                          rows: [...(s.tableData?.rows || []), newRow]
                                        }
                                      };
                                    }
                                    return s;
                                  });
                                  setEditCustomSections(updated);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Row
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Client Note */}
                <div className="space-y-2 pt-4">
                  <Label className="text-sm font-semibold">Client Note</Label>
                  <Textarea 
                    value={editClientNote}
                    onChange={(e) => setEditClientNote(e.target.value)}
                    placeholder="Notes visible to the customer..." 
                    rows={3} 
                    className="resize-none text-sm"
                  />
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Terms & Conditions</Label>
                  <Textarea 
                    value={editTerms}
                    onChange={(e) => setEditTerms(e.target.value)}
                    placeholder="Payment terms, conditions, etc..." 
                    rows={3} 
                    className="resize-none text-sm"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Update the proposal with all edited data
                    if (selectedProposal) {
                      const updatedProposal = {
                        ...selectedProposal,
                        customer: editCustomer,
                        project: editProject,
                        status: editStatus,
                        date: editEstimateDate,
                        validUntil: editExpiryDate,
                        // Save template data
                        title: editProposalTitle,
                        overview: editProposalOverview,
                        scopeOfWork: editProposalScopeItems,
                        timeline: editProposalTimeline,
                        items: editItems,
                        customSections: editCustomSections,
                        customFields: editCustomFields,
                        // Calculate total
                        totalAmount: `$${calculateEditTotals().total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                      };

                      // Update in proposals list
                      setProposals(proposals.map(p => 
                        p.id === selectedProposal.id ? updatedProposal : p
                      ));
                    }
                    
                    setIsEditOpen(false);
                    toast({ 
                      title: "✅ Saved", 
                      description: "Proposal has been updated successfully with all customizations." 
                    });
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
