import { useEffect, useMemo, useRef, useState } from 'react';
import { useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { getCustomerForStandaloneView } from '@/lib/customer-view-storage';
import { saveProposalForStandaloneView } from '@/lib/proposal-view-storage';
import { customerDirectory } from '@/lib/customer-directory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, FileText, FolderKanban, CreditCard, Receipt, FileSignature, StickyNote, Paperclip, Users, MapPin, Building2, Phone, Mail, Globe, Tag, Plus, Upload, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Customer = {
  id: number;
  companyName: string;
  primaryContact: string;
  primaryEmail: string;
  phone: string;
  active: boolean;
  groups: string[];
  dateCreated: string;
  vatNumber?: string;
  website?: string;
  currency?: string;
  language?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
};

type CustomerRecord = Customer & {
  invoices: Array<{ id: string; date: string; amount: string; status: string; reference: string; customer?: string; project?: string; dueDate?: string }>;
  proposals: Array<{ id: string; title: string; amount: string; status: string; date: string; customer?: string; project?: string; validUntil?: string }>;
  creditNotes: Array<{ id: string; date: string; amount: string; reason: string; invoice?: string; client?: string; project?: string; reference?: string; remainingAmount?: string }>;
  subscriptions: Array<{ id: string; plan: string; status: string; renewalDate: string; amount: string }>;
  expenses: Array<{ id: string; title: string; date: string; amount: string; category: string }>;
  projects: Array<{ id: string; name: string; status: string; startDate: string; deadline: string; budget: string }>;
  tasks: Array<{ id: string; title: string; project: string; status: string; dueDate: string }>;
  statements: Array<{ id: string; period: string; openingBalance: string; closingBalance: string; status: string }>;
  notes: Array<{ id: string; title: string; note: string; updatedAt: string }>;
  payments: Array<{ id: string; date: string; amount: string; mode: string; status: string; invoice?: string; customer?: string; transactionId?: string }>;
  files: Array<{ id: string; name: string; type: string; size: string }>;
  contacts: Array<{ id: string; name: string; title: string; email: string; phone: string; company: string }>;
};

const emptyCustomerRecordCollections = {
  invoices: [],
  proposals: [],
  creditNotes: [],
  subscriptions: [],
  expenses: [],
  projects: [],
  tasks: [],
  statements: [],
  notes: [],
  payments: [],
  files: [],
  contacts: [],
};

const normalizeCustomerRecord = (record: Partial<CustomerRecord> | null): CustomerRecord | null => {
  if (!record) return null;

  return {
    ...(record as CustomerRecord),
    ...emptyCustomerRecordCollections,
    invoices: record.invoices ?? [],
    proposals: record.proposals ?? [],
    creditNotes: record.creditNotes ?? [],
    subscriptions: record.subscriptions ?? [],
    expenses: record.expenses ?? [],
    projects: record.projects ?? [],
    tasks: record.tasks ?? [],
    statements: record.statements ?? [],
    notes: record.notes ?? [],
    payments: record.payments ?? [],
    files: record.files ?? [],
    contacts: record.contacts ?? [],
  };
};

type CustomerTab =
  | 'overview'
  | 'invoices'
  | 'proposals'
  | 'credit-notes'
  | 'subscriptions'
  | 'expenses'
  | 'projects'
  | 'tasks'
  | 'statements'
  | 'notes'
  | 'payments'
  | 'files'
  | 'contacts'
  | 'billing';

type CustomerRecordView =
  | { type: 'invoice'; data: CustomerRecord['invoices'][number] }
  | { type: 'proposal'; data: CustomerRecord['proposals'][number] }
  | { type: 'credit-note'; data: CustomerRecord['creditNotes'][number] }
  | { type: 'payment'; data: CustomerRecord['payments'][number] };

const parseMoney = (value: string) => Number(value.replace(/[^0-9.-]/g, '')) || 0;

const money = (value: string) => {
  const amount = parseMoney(value);
  return `₹${amount.toLocaleString('en-IN')}`;
};

const makeDownloadName = (customerName: string) => customerName.replace(/[^a-z0-9]+/gi, '_');

const makeSectionFileName = (customerName: string, sectionName: string) =>
  `${makeDownloadName(customerName)}_${sectionName.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`;

const customerSections: Array<{ value: CustomerTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'proposals', label: 'Proposals' },
  { value: 'credit-notes', label: 'Credit Notes' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'projects', label: 'Projects' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'statements', label: 'Statements' },
  { value: 'notes', label: 'Notes' },
  { value: 'payments', label: 'Payments' },
  { value: 'files', label: 'Files' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'billing', label: 'Billing Address' },
];

const buildFallbackCustomerRecord = (customerId: string): CustomerRecord | null => {
  const directoryCustomer = customerDirectory.find((entry) => String(entry.id) === customerId);
  if (!directoryCustomer) return null;

  return {
    ...directoryCustomer,
    invoices: [
      { id: `INV-${directoryCustomer.id}-1`, date: '2026-02-02', amount: '₹45,000', status: 'Paid', reference: 'INV-2026-102', customer: directoryCustomer.companyName, project: `${directoryCustomer.companyName} Website Revamp`, dueDate: '2026-03-04' },
      { id: `INV-${directoryCustomer.id}-2`, date: '2026-03-04', amount: '₹65,000', status: 'Pending', reference: 'INV-2026-118', customer: directoryCustomer.companyName, project: `${directoryCustomer.companyName} CRM Rollout`, dueDate: '2026-04-03' },
    ],
    proposals: [
      { id: `PRO-${directoryCustomer.id}-1`, title: `${directoryCustomer.companyName} Website Revamp`, amount: '₹120,000', status: 'Active', date: '2026-01-10', customer: directoryCustomer.companyName, project: 'Web Development', validUntil: '2026-02-10' },
      { id: `PRO-${directoryCustomer.id}-2`, title: `${directoryCustomer.companyName} CRM Rollout`, amount: '₹75,000', status: 'Completed', date: '2025-10-01', customer: directoryCustomer.companyName, project: 'CRM', validUntil: '2025-11-01' },
    ],
    creditNotes: [
      { id: `CN-${directoryCustomer.id}-1`, date: '2026-02-18', amount: '₹5,000', reason: 'Service credit adjustment', invoice: `INV-${directoryCustomer.id}-1`, client: directoryCustomer.companyName, project: `${directoryCustomer.companyName} Website Revamp`, reference: `REF-${directoryCustomer.id}-1`, remainingAmount: '₹0.00' },
    ],
    subscriptions: [
      { id: `SUB-${directoryCustomer.id}-1`, plan: 'Business Support', status: 'Active', renewalDate: '2026-04-01', amount: '₹12,000' },
      { id: `SUB-${directoryCustomer.id}-2`, plan: 'Cloud Hosting', status: 'Trial', renewalDate: '2026-03-15', amount: '₹8,500' },
    ],
    expenses: [
      { id: `EXP-${directoryCustomer.id}-1`, title: 'Travel and onboarding', date: '2026-02-10', amount: '₹2,400', category: 'Operations' },
      { id: `EXP-${directoryCustomer.id}-2`, title: 'Client meeting refreshments', date: '2026-02-19', amount: '₹850', category: 'Sales' },
    ],
    projects: [
      { id: `PRJ-${directoryCustomer.id}-1`, name: `${directoryCustomer.companyName} Website Revamp`, status: 'Active', startDate: '2026-01-10', deadline: '2026-03-15', budget: '₹120,000' },
      { id: `PRJ-${directoryCustomer.id}-2`, name: `${directoryCustomer.companyName} Mobile App`, status: 'In Review', startDate: '2026-02-05', deadline: '2026-04-20', budget: '₹210,000' },
      { id: `PRJ-${directoryCustomer.id}-3`, name: `${directoryCustomer.companyName} CRM Rollout`, status: 'Completed', startDate: '2025-10-01', deadline: '2025-12-12', budget: '₹75,000' },
    ],
    tasks: [
      { id: `TASK-${directoryCustomer.id}-1`, title: `${directoryCustomer.companyName} onboarding checklist`, project: `${directoryCustomer.companyName} Website Revamp`, status: 'Open', dueDate: '2026-02-22' },
      { id: `TASK-${directoryCustomer.id}-2`, title: `${directoryCustomer.companyName} billing follow-up`, project: `${directoryCustomer.companyName} CRM Rollout`, status: 'In Review', dueDate: '2026-02-25' },
    ],
    statements: [
      { id: `ST-${directoryCustomer.id}-1`, period: 'Jan 2026', openingBalance: '₹50,000', closingBalance: '₹95,000', status: 'Draft' },
      { id: `ST-${directoryCustomer.id}-2`, period: 'Feb 2026', openingBalance: '₹95,000', closingBalance: '₹1,20,000', status: 'Issued' },
    ],
    notes: [
      { id: `NOTE-${directoryCustomer.id}-1`, title: 'Key Account', note: `Customer requires weekly updates and milestone reporting for ${directoryCustomer.companyName}.`, updatedAt: '2026-02-20' },
    ],
    payments: [
      { id: `PAY-${directoryCustomer.id}-1`, date: '2026-02-15', amount: '₹30,000', mode: 'Bank Transfer', status: 'Received', invoice: `INV-${directoryCustomer.id}-1`, customer: directoryCustomer.companyName, transactionId: `TXN-${directoryCustomer.id}-001` },
      { id: `PAY-${directoryCustomer.id}-2`, date: '2026-03-02', amount: '₹15,000', mode: 'UPI', status: 'Pending', invoice: `INV-${directoryCustomer.id}-2`, customer: directoryCustomer.companyName, transactionId: `TXN-${directoryCustomer.id}-002` },
    ],
    files: [
      { id: `FILE-${directoryCustomer.id}-1`, name: `${directoryCustomer.companyName}_agreement.pdf`, type: 'application/pdf', size: '184 KB' },
      { id: `FILE-${directoryCustomer.id}-2`, name: `${directoryCustomer.companyName}_brief.docx`, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: '96 KB' },
    ],
    contacts: [
      { id: `CONTACT-${directoryCustomer.id}-1`, name: directoryCustomer.primaryContact || 'Primary Contact', title: 'Decision Maker', email: directoryCustomer.primaryEmail || '', phone: directoryCustomer.phone || '', company: directoryCustomer.companyName },
      { id: `CONTACT-${directoryCustomer.id}-2`, name: 'Accounts Team', title: 'Billing Contact', email: directoryCustomer.primaryEmail ? `billing+${directoryCustomer.primaryEmail}` : '', phone: directoryCustomer.phone || '', company: directoryCustomer.companyName },
    ],
  };
};

const buildStandaloneProposalRecord = (customerName: string, proposal: CustomerRecord['proposals'][number]) => ({
  id: proposal.id,
  proposalId: proposal.id,
  date: proposal.date,
  customer: customerName,
  preparedFor: customerName,
  preparedBy: 'Your Business Name',
  title: proposal.title,
  overview: `${proposal.title} prepared for ${customerName}.`,
  scopeOfWork: [
    { id: 1, description: proposal.title, longDescription: `Proposal scope for ${customerName}.` },
    { id: 2, description: 'Delivery and review', longDescription: 'Review, approval, and handover workflow.' },
  ],
  timeline: [
    { phase: 1, task: 'Proposal review', completionDate: proposal.date },
    { phase: 2, task: 'Approval and kickoff', completionDate: proposal.validUntil || proposal.date },
  ],
  items: [
    { id: 1, description: proposal.title, longDescription: proposal.title, qty: 1, rate: Number(String(proposal.amount).replace(/[^0-9.-]/g, '')) || 0, tax: 'No Tax', amount: Number(String(proposal.amount).replace(/[^0-9.-]/g, '')) || 0 },
  ],
  status: proposal.status === 'Active' ? 'sent' : proposal.status === 'Completed' ? 'accepted' : proposal.status.toLowerCase(),
  totalAmount: proposal.amount,
  validUntil: proposal.validUntil || proposal.date,
});

export default function CustomerViewPage() {
  const [, params] = useRoute('/customer-view/:id');
  const customerId = params?.id || '';
  const { toast } = useToast();
  const [customer, setCustomer] = useState<CustomerRecord | null>(() => normalizeCustomerRecord(getCustomerForStandaloneView(customerId) || buildFallbackCustomerRecord(customerId)));
  const [activeTab, setActiveTab] = useState<CustomerTab>('overview');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [selectedRecordView, setSelectedRecordView] = useState<CustomerRecordView | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCustomer(normalizeCustomerRecord(getCustomerForStandaloneView(customerId) || buildFallbackCustomerRecord(customerId)));
  }, [customerId]);

  const summary = useMemo(() => {
    if (!customer) return null;
    const invoiceTotal = (customer.invoices || []).reduce((sum, item) => sum + parseMoney(item.amount), 0);
    const paidTotal = (customer.payments || []).reduce((sum, item) => sum + parseMoney(item.amount), 0);
    const proposalTotal = (customer.proposals || []).reduce((sum, item) => sum + parseMoney(item.amount), 0);
    const expenseTotal = (customer.expenses || []).reduce((sum, item) => sum + parseMoney(item.amount), 0);
    return { invoiceTotal, paidTotal, proposalTotal, expenseTotal };
  }, [customer]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAddNote = () => {
    if (!customer || !notesDraft.trim()) return;

    setCustomer({
      ...customer,
      notes: [
        { id: `note-${Date.now()}`, title: 'General', note: notesDraft.trim(), updatedAt: new Date().toISOString().split('T')[0] },
        ...(customer.notes || []),
      ],
    });
    setNotesDraft('');
    toast({ title: 'Note added', description: 'The customer note was saved in this tab.' });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!customer) return;
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setCustomer({
      ...customer,
      files: [
        ...files.map((file) => ({ id: `${Date.now()}-${file.name}`, name: file.name, type: file.type || 'file', size: `${Math.max(1, Math.round(file.size / 1024))} KB` })),
        ...(customer.files || []),
      ],
    });

    toast({ title: 'Files added', description: `${files.length} file(s) staged for this customer.` });
    event.target.value = '';
  };

  const downloadCustomerPdf = () => {
    if (!customer) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 16;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Complete View', 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.companyName, 14, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Primary Contact', customer.primaryContact || '-'],
        ['Email', customer.primaryEmail || '-'],
        ['Phone', customer.phone || '-'],
        ['Billing Address', customer.billingAddress ? `${customer.billingAddress.street}, ${customer.billingAddress.city}, ${customer.billingAddress.state}, ${customer.billingAddress.zipCode}, ${customer.billingAddress.country}` : '-'],
        ['Company Address', [customer.address, customer.city, customer.state, customer.country].filter(Boolean).join(', ') || '-'],
      ],
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY + 8,
      head: [['Invoices', 'Amount', 'Status']],
      body: customer.invoices.map((invoice) => [invoice.id, invoice.amount, invoice.status]),
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY + 8,
      head: [['Proposals', 'Amount', 'Status']],
      body: customer.proposals.map((proposal) => [proposal.id, proposal.amount, proposal.status]),
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY + 8,
      head: [['Projects', 'Status', 'Budget']],
      body: customer.projects.map((project) => [project.name, project.status, project.budget]),
    });

    doc.save(`Customer_${makeDownloadName(customer.companyName)}_Complete_View_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadSectionPdf = (title: string, columns: string[], rows: string[][], fileName: string) => {
    if (!customer) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.companyName, 14, 24);

    autoTable(doc, {
      startY: 30,
      head: [columns],
      body: rows.length > 0 ? rows : [[...columns.map(() => '-')]],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`${fileName}.pdf`);
  };

  const downloadOverviewPdf = () => {
    if (!customer) return;

    downloadSectionPdf(
      'Customer Overview',
      ['Field', 'Value'],
      [
        ['Company', customer.companyName],
        ['Primary Contact', customer.primaryContact || '-'],
        ['Email', customer.primaryEmail || '-'],
        ['Phone', customer.phone || '-'],
        ['VAT', customer.vatNumber || '-'],
        ['Website', customer.website || '-'],
        ['Currency', customer.currency || 'System Default'],
        ['Language', customer.language || 'System Default'],
        ['Groups', customer.groups.length > 0 ? customer.groups.join(', ') : '-'],
        ['Company Address', [customer.address, customer.city, customer.state, customer.country].filter(Boolean).join(', ') || '-'],
        ['Billing Address', customer.billingAddress ? `${customer.billingAddress.street}, ${customer.billingAddress.city}, ${customer.billingAddress.state}, ${customer.billingAddress.zipCode}, ${customer.billingAddress.country}` : '-'],
        ['Shipping Address', customer.shippingAddress ? `${customer.shippingAddress.street}, ${customer.shippingAddress.city}, ${customer.shippingAddress.state}, ${customer.shippingAddress.zipCode}, ${customer.shippingAddress.country}` : '-'],
      ],
      makeSectionFileName(customer.companyName, 'overview'),
    );
  };

  const downloadInvoicesPdf = () => downloadSectionPdf(
    'Invoices',
    ['Invoice', 'Customer', 'Project', 'Amount', 'Due Date', 'Status', 'Reference'],
    (customer?.invoices || []).map((invoice) => [invoice.id, invoice.customer || customer?.companyName || '-', invoice.project || '-', invoice.amount, invoice.dueDate || invoice.date, invoice.status, invoice.reference]),
    makeSectionFileName(customer?.companyName || 'customer', 'invoices'),
  );

  const downloadProposalsPdf = () => downloadSectionPdf(
    'Proposals / Estimates',
    ['Proposal', 'Customer', 'Project', 'Date', 'Valid Until', 'Amount', 'Status'],
    (customer?.proposals || []).map((proposal) => [proposal.id, proposal.customer || customer?.companyName || '-', proposal.project || '-', proposal.date, proposal.validUntil || '-', proposal.amount, proposal.status]),
    makeSectionFileName(customer?.companyName || 'customer', 'proposals_estimates'),
  );

  const downloadCreditNotesPdf = () => downloadSectionPdf(
    'Credit Notes',
    ['Credit Note', 'Invoice', 'Client', 'Project', 'Reference', 'Amount', 'Remaining', 'Reason'],
    (customer?.creditNotes || []).map((note) => [note.id, note.invoice || '-', note.client || customer?.companyName || '-', note.project || '-', note.reference || '-', note.amount, note.remainingAmount || '-', note.reason]),
    makeSectionFileName(customer?.companyName || 'customer', 'credit_notes'),
  );

  const downloadSubscriptionsPdf = () => downloadSectionPdf(
    'Subscriptions',
    ['Subscription', 'Plan', 'Status', 'Renewal', 'Amount'],
    (customer?.subscriptions || []).map((subscription) => [subscription.id, subscription.plan, subscription.status, subscription.renewalDate, subscription.amount]),
    makeSectionFileName(customer?.companyName || 'customer', 'subscriptions'),
  );

  const downloadExpensesPdf = () => downloadSectionPdf(
    'Expenses',
    ['Expense', 'Date', 'Amount', 'Category'],
    (customer?.expenses || []).map((expense) => [expense.id, expense.date, expense.amount, expense.category]),
    makeSectionFileName(customer?.companyName || 'customer', 'expenses'),
  );

  const downloadProjectsPdf = () => downloadSectionPdf(
    'Projects',
    ['Project', 'Status', 'Start', 'Deadline', 'Budget'],
    (customer?.projects || []).map((project) => [project.name, project.status, project.startDate, project.deadline, project.budget]),
    makeSectionFileName(customer?.companyName || 'customer', 'projects'),
  );

  const downloadTasksPdf = () => downloadSectionPdf(
    'Tasks',
    ['Task', 'Project', 'Status', 'Due Date'],
    (customer?.tasks || []).map((task) => [task.title, task.project, task.status, task.dueDate]),
    makeSectionFileName(customer?.companyName || 'customer', 'tasks'),
  );

  const downloadStatementsPdf = () => downloadSectionPdf(
    'Statements',
    ['Statement', 'Period', 'Opening', 'Closing', 'Status'],
    (customer?.statements || []).map((statement) => [statement.id, statement.period, statement.openingBalance, statement.closingBalance, statement.status]),
    makeSectionFileName(customer?.companyName || 'customer', 'statements'),
  );

  const downloadNotesPdf = () => downloadSectionPdf(
    'Customer Notes',
    ['Title', 'Note', 'Updated'],
    (customer?.notes || []).map((note) => [note.title, note.note, note.updatedAt]),
    makeSectionFileName(customer?.companyName || 'customer', 'notes'),
  );

  const downloadPaymentsPdf = () => downloadSectionPdf(
    'Payments',
    ['Payment', 'Invoice', 'Customer', 'Amount', 'Mode', 'Transaction ID', 'Date', 'Status'],
    (customer?.payments || []).map((payment) => [payment.id, payment.invoice || '-', payment.customer || customer?.companyName || '-', payment.amount, payment.mode, payment.transactionId || '-', payment.date, payment.status]),
    makeSectionFileName(customer?.companyName || 'customer', 'payments'),
  );

  const downloadFilesPdf = () => downloadSectionPdf(
    'Files',
    ['File', 'Type', 'Size'],
    (customer?.files || []).map((file) => [file.name, file.type, file.size]),
    makeSectionFileName(customer?.companyName || 'customer', 'files'),
  );

  const downloadContactsPdf = () => downloadSectionPdf(
    'Contacts',
    ['Name', 'Title', 'Email', 'Phone', 'Company'],
    (customer?.contacts || []).map((contact) => [contact.name, contact.title, contact.email, contact.phone, contact.company]),
    makeSectionFileName(customer?.companyName || 'customer', 'contacts'),
  );

  const downloadBillingPdf = () => downloadSectionPdf(
    'Billing Address',
    ['Field', 'Value'],
    [
      ['Street', customer?.billingAddress?.street || '-'],
      ['City', customer?.billingAddress?.city || '-'],
      ['State', customer?.billingAddress?.state || '-'],
      ['Zip Code', customer?.billingAddress?.zipCode || '-'],
      ['Country', customer?.billingAddress?.country || '-'],
    ],
    makeSectionFileName(customer?.companyName || 'customer', 'billing_address'),
  );

  const openRecordView = (type: CustomerRecordView['type'], data: any) => {
    setSelectedRecordView({ type, data } as CustomerRecordView);
  };

  const openProposalView = (proposal: CustomerRecord['proposals'][number]) => {
    const proposalRecord = buildStandaloneProposalRecord(customer.companyName, proposal);
    saveProposalForStandaloneView(proposalRecord as any);

    const targetUrl = `${window.location.origin}/proposal-view/${encodeURIComponent(proposal.id)}`;
    const openedTab = window.open(targetUrl, '_blank', 'noopener,noreferrer');

    if (!openedTab) {
      openRecordView('proposal', proposal);
      toast({
        title: 'Popup blocked',
        description: 'Allow popups to open the standalone proposal view in a new tab.',
        variant: 'destructive',
      });
    }
  };

  const closeRecordView = () => setSelectedRecordView(null);

  const renderRecordDialogContent = () => {
    if (!selectedRecordView) return null;

    if (selectedRecordView.type === 'invoice') {
      const invoice = selectedRecordView.data;
      return (
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div><span className="text-slate-500">Invoice</span><div className="font-semibold">{invoice.id}</div></div>
          <div><span className="text-slate-500">Customer</span><div className="font-semibold">{invoice.customer || customer?.companyName || '-'}</div></div>
          <div><span className="text-slate-500">Project</span><div className="font-semibold">{invoice.project || '-'}</div></div>
          <div><span className="text-slate-500">Due Date</span><div className="font-semibold">{invoice.dueDate || invoice.date}</div></div>
          <div><span className="text-slate-500">Date</span><div className="font-semibold">{invoice.date}</div></div>
          <div><span className="text-slate-500">Status</span><div className="font-semibold">{invoice.status}</div></div>
          <div><span className="text-slate-500">Reference</span><div className="font-semibold">{invoice.reference}</div></div>
          <div><span className="text-slate-500">Amount</span><div className="font-semibold">{invoice.amount}</div></div>
        </div>
      );
    }

    if (selectedRecordView.type === 'proposal') {
      const proposal = selectedRecordView.data;
      return (
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div><span className="text-slate-500">Proposal</span><div className="font-semibold">{proposal.id}</div></div>
          <div><span className="text-slate-500">Customer</span><div className="font-semibold">{proposal.customer || customer?.companyName || '-'}</div></div>
          <div><span className="text-slate-500">Project</span><div className="font-semibold">{proposal.project || '-'}</div></div>
          <div><span className="text-slate-500">Valid Until</span><div className="font-semibold">{proposal.validUntil || '-'}</div></div>
          <div><span className="text-slate-500">Date</span><div className="font-semibold">{proposal.date}</div></div>
          <div><span className="text-slate-500">Status</span><div className="font-semibold">{proposal.status}</div></div>
          <div className="md:col-span-2"><span className="text-slate-500">Title</span><div className="font-semibold">{proposal.title}</div></div>
          <div><span className="text-slate-500">Amount</span><div className="font-semibold">{proposal.amount}</div></div>
        </div>
      );
    }

    if (selectedRecordView.type === 'credit-note') {
      const note = selectedRecordView.data;
      return (
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div><span className="text-slate-500">Credit Note</span><div className="font-semibold">{note.id}</div></div>
          <div><span className="text-slate-500">Invoice</span><div className="font-semibold">{note.invoice || '-'}</div></div>
          <div><span className="text-slate-500">Client</span><div className="font-semibold">{note.client || customer?.companyName || '-'}</div></div>
          <div><span className="text-slate-500">Project</span><div className="font-semibold">{note.project || '-'}</div></div>
          <div><span className="text-slate-500">Reference</span><div className="font-semibold">{note.reference || '-'}</div></div>
          <div><span className="text-slate-500">Date</span><div className="font-semibold">{note.date}</div></div>
          <div><span className="text-slate-500">Reason</span><div className="font-semibold">{note.reason}</div></div>
          <div><span className="text-slate-500">Amount</span><div className="font-semibold">{note.amount}</div></div>
          <div><span className="text-slate-500">Remaining Amount</span><div className="font-semibold">{note.remainingAmount || '-'}</div></div>
        </div>
      );
    }

    const payment = selectedRecordView.data;
    return (
      <div className="grid gap-4 md:grid-cols-2 text-sm">
        <div><span className="text-slate-500">Payment</span><div className="font-semibold">{payment.id}</div></div>
        <div><span className="text-slate-500">Invoice</span><div className="font-semibold">{payment.invoice || '-'}</div></div>
        <div><span className="text-slate-500">Customer</span><div className="font-semibold">{payment.customer || customer?.companyName || '-'}</div></div>
        <div><span className="text-slate-500">Transaction ID</span><div className="font-semibold">{payment.transactionId || '-'}</div></div>
        <div><span className="text-slate-500">Date</span><div className="font-semibold">{payment.date}</div></div>
        <div><span className="text-slate-500">Mode</span><div className="font-semibold">{payment.mode}</div></div>
        <div><span className="text-slate-500">Status</span><div className="font-semibold">{payment.status}</div></div>
        <div><span className="text-slate-500">Amount</span><div className="font-semibold">{payment.amount}</div></div>
      </div>
    );
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">Customer view not available</h1>
          <p className="text-slate-600">Open the customer again from the Customers page so the full standalone view can load.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Customer Complete View</p>
            <h1 className="text-3xl font-bold text-slate-900">{customer.companyName}</h1>
            <p className="text-slate-600 mt-1">Invoices, proposals, credit notes, subscriptions, expenses, projects, tasks, statements, notes, payments, files, contacts, and billing address in one tab.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openFilePicker}><Upload className="h-4 w-4 mr-2" />Upload Files</Button>
            <Button variant="outline" onClick={downloadCustomerPdf}><Download className="h-4 w-4 mr-2" />Download Complete View</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Invoices</p><p className="text-2xl font-bold">{(customer.invoices || []).length}</p><p className="text-xs text-slate-500">{money(String(summary?.invoiceTotal ?? 0))}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Proposals</p><p className="text-2xl font-bold">{(customer.proposals || []).length}</p><p className="text-xs text-slate-500">{money(String(summary?.proposalTotal ?? 0))}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Payments</p><p className="text-2xl font-bold">{(customer.payments || []).length}</p><p className="text-xs text-slate-500">{money(String(summary?.paidTotal ?? 0))}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Expenses</p><p className="text-2xl font-bold">{(customer.expenses || []).length}</p><p className="text-xs text-slate-500">{money(String(summary?.expenseTotal ?? 0))}</p></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)] lg:h-[calc(100vh-18rem)]">
                <div className="flex flex-col gap-1 p-3">
                  {customerSections.map((section) => {
                    const isActive = activeTab === section.value;

                    return (
                      <Button
                        key={section.value}
                        variant={isActive ? 'default' : 'ghost'}
                        className={`justify-start rounded-xl px-4 py-3 h-auto ${isActive ? 'shadow-sm' : 'text-slate-600'}`}
                        onClick={() => setActiveTab(section.value)}
                      >
                        {section.label}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle>Customer Profile</CardTitle>
                    <Button variant="outline" size="sm" onClick={downloadOverviewPdf}><Download className="h-4 w-4 mr-2" />Download</Button>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" />{customer.companyName}</div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-500" />{customer.primaryContact || '-'}</div>
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" />{customer.primaryEmail || '-'}</div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" />{customer.phone || '-'}</div>
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-500" />{customer.website || '-'}</div>
                    <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-slate-500" />{customer.groups.length > 0 ? customer.groups.join(', ') : '-'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle>Billing & Location</CardTitle>
                    <Button variant="outline" size="sm" onClick={downloadBillingPdf}><Download className="h-4 w-4 mr-2" />Download</Button>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-slate-500 mt-1" /><span>{customer.billingAddress ? `${customer.billingAddress.street}, ${customer.billingAddress.city}, ${customer.billingAddress.state}, ${customer.billingAddress.zipCode}, ${customer.billingAddress.country}` : 'No billing address stored'}</span></div>
                    <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-slate-500 mt-1" /><span>{[customer.address, customer.city, customer.state, customer.country].filter(Boolean).join(', ') || 'No company address stored'}</span></div>
                    <div className="text-slate-600">Currency: {customer.currency || 'System Default'}</div>
                    <div className="text-slate-600">Language: {customer.language || 'System Default'}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'invoices' && <SectionTable title="Invoices" columns={["Invoice", "Customer", "Project", "Amount", "Due Date", "Status", "Reference"]} rows={(customer.invoices || []).map((invoice) => [invoice.id, invoice.customer || customer.companyName, invoice.project || '-', invoice.amount, invoice.dueDate || invoice.date, invoice.status, invoice.reference])} rowData={customer.invoices || []} action={<Button variant="outline" size="sm" onClick={downloadInvoicesPdf}><Download className="h-4 w-4 mr-2" />Download Invoice Section</Button>} rowActionLabel="View" onRowAction={(record) => openRecordView('invoice', record)} />}
            {activeTab === 'proposals' && <SectionTable title="Proposals / Estimates" columns={["Proposal", "Customer", "Project", "Date", "Valid Until", "Amount", "Status"]} rows={(customer.proposals || []).map((proposal) => [proposal.id, proposal.customer || customer.companyName, proposal.project || '-', proposal.date, proposal.validUntil || '-', proposal.amount, proposal.status])} rowData={customer.proposals || []} action={<Button variant="outline" size="sm" onClick={downloadProposalsPdf}><Download className="h-4 w-4 mr-2" />Download Estimate Section</Button>} rowActionLabel="View" onRowAction={(record) => openProposalView(record)} />}
            {activeTab === 'credit-notes' && <SectionTable title="Credit Notes" columns={["Credit Note", "Invoice", "Client", "Project", "Reference", "Amount", "Remaining", "Reason"]} rows={(customer.creditNotes || []).map((note) => [note.id, note.invoice || '-', note.client || customer.companyName, note.project || '-', note.reference || '-', note.amount, note.remainingAmount || '-', note.reason])} rowData={customer.creditNotes || []} action={<Button variant="outline" size="sm" onClick={downloadCreditNotesPdf}><Download className="h-4 w-4 mr-2" />Download Credit Notes</Button>} rowActionLabel="View" onRowAction={(record) => openRecordView('credit-note', record)} />}
            {activeTab === 'subscriptions' && <SectionTable title="Subscriptions" columns={["Subscription", "Plan", "Status", "Renewal", "Amount"]} rows={(customer.subscriptions || []).map((subscription) => [subscription.id, subscription.plan, subscription.status, subscription.renewalDate, subscription.amount])} action={<Button variant="outline" size="sm" onClick={downloadSubscriptionsPdf}><Download className="h-4 w-4 mr-2" />Download Subscriptions</Button>} />}
            {activeTab === 'expenses' && <SectionTable title="Expenses" columns={["Expense", "Date", "Amount", "Category"]} rows={(customer.expenses || []).map((expense) => [expense.id, expense.date, expense.amount, expense.category])} action={<Button variant="outline" size="sm" onClick={downloadExpensesPdf}><Download className="h-4 w-4 mr-2" />Download Expenses</Button>} />}
            {activeTab === 'projects' && <SectionTable title="Projects" columns={["Project", "Status", "Start", "Deadline", "Budget"]} rows={(customer.projects || []).map((project) => [project.name, project.status, project.startDate, project.deadline, project.budget])} action={<Button variant="outline" size="sm" onClick={downloadProjectsPdf}><Download className="h-4 w-4 mr-2" />Download Projects</Button>} />}
            {activeTab === 'tasks' && <SectionTable title="Tasks" columns={["Task", "Project", "Status", "Due Date"]} rows={(customer.tasks || []).map((task) => [task.title, task.project, task.status, task.dueDate])} action={<Button variant="outline" size="sm" onClick={downloadTasksPdf}><Download className="h-4 w-4 mr-2" />Download Tasks</Button>} />}
            {activeTab === 'statements' && <SectionTable title="Statements" columns={["Statement", "Period", "Opening", "Closing", "Status"]} rows={(customer.statements || []).map((statement) => [statement.id, statement.period, statement.openingBalance, statement.closingBalance, statement.status])} action={<Button variant="outline" size="sm" onClick={downloadStatementsPdf}><Download className="h-4 w-4 mr-2" />Download Statements</Button>} />}
            {activeTab === 'notes' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle>Customer Notes</CardTitle>
                  <Button variant="outline" size="sm" onClick={downloadNotesPdf}><Download className="h-4 w-4 mr-2" />Download Notes</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Write a note about this customer..." className="min-h-[120px]" />
                  <div className="flex justify-end">
                    <Button onClick={handleAddNote}><StickyNote className="h-4 w-4 mr-2" />Save Note</Button>
                  </div>
                  <div className="space-y-3">
                    {(customer.notes || []).map((note) => (
                      <div key={note.id} className="rounded-lg border p-3 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{note.title}</span>
                          <span className="text-xs text-slate-500">{note.updatedAt}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {activeTab === 'payments' && <SectionTable title="Payments" columns={["Payment", "Invoice", "Customer", "Amount", "Mode", "Transaction ID", "Date", "Status"]} rows={(customer.payments || []).map((payment) => [payment.id, payment.invoice || '-', payment.customer || customer.companyName, payment.amount, payment.mode, payment.transactionId || '-', payment.date, payment.status])} rowData={customer.payments || []} action={<Button variant="outline" size="sm" onClick={downloadPaymentsPdf}><Download className="h-4 w-4 mr-2" />Download Payments</Button>} rowActionLabel="View" onRowAction={(record) => openRecordView('payment', record)} />}
            {activeTab === 'files' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle>Files</CardTitle>
                  <Button variant="outline" size="sm" onClick={downloadFilesPdf}><Download className="h-4 w-4 mr-2" />Download Files</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" onClick={openFilePicker}><Paperclip className="h-4 w-4 mr-2" />Upload More Files</Button>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                  <div className="space-y-2">
                    {(customer.files || []).map((file) => (
                      <div key={file.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-xs text-slate-500">{file.type} • {file.size}</div>
                        </div>
                        <Button variant="ghost" size="sm">Open</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {activeTab === 'contacts' && <SectionTable title="Contacts" columns={["Name", "Title", "Email", "Phone", "Company"]} rows={(customer.contacts || []).map((contact) => [contact.name, contact.title, contact.email, contact.phone, contact.company])} action={<Button variant="outline" size="sm" onClick={downloadContactsPdf}><Download className="h-4 w-4 mr-2" />Download Contacts</Button>} />}
            {activeTab === 'billing' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle>Billing Address</CardTitle>
                  <Button variant="outline" size="sm" onClick={downloadBillingPdf}><Download className="h-4 w-4 mr-2" />Download Billing</Button>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>{customer.billingAddress?.street || '-'}</div>
                  <div>{customer.billingAddress?.city || '-'}</div>
                  <div>{customer.billingAddress?.state || '-'}</div>
                  <div>{customer.billingAddress?.zipCode || '-'}</div>
                  <div>{customer.billingAddress?.country || '-'}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>Add files to the customer record.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input type="file" multiple onChange={handleFileUpload} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(selectedRecordView)} onOpenChange={(open) => { if (!open) closeRecordView(); }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedRecordView?.type === 'invoice' && 'Invoice Details'}
                {selectedRecordView?.type === 'proposal' && 'Proposal / Estimate Details'}
                {selectedRecordView?.type === 'credit-note' && 'Credit Note Details'}
                {selectedRecordView?.type === 'payment' && 'Payment Details'}
              </DialogTitle>
              <DialogDescription>View the selected record in this customer dossier.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              {renderRecordDialogContent()}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeRecordView}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function SectionTable({ title, columns, rows, rowData, action, rowActionLabel, onRowAction }: { title: string; columns: string[]; rows: string[][]; rowData?: any[]; action?: React.ReactNode; rowActionLabel?: string; onRowAction?: (row: any) => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
              {onRowAction && <TableHead className="w-24 text-right"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${title}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={`${title}-${index}-${cellIndex}`}>{cell || '-'}</TableCell>
                ))}
                {onRowAction && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onRowAction(rowData?.[index] ?? row)}>{rowActionLabel || 'View'}</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
