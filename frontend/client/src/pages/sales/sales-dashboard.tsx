import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Search,
  MoreVertical,
  ChevronDown,
  FileCheck,
  Calculator,
  RotateCcw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/exportUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tab components
import ProposalsTab from './tabs/proposals-tab';
import EstimatesTab from './tabs/estimates-tab';
import InvoicesTab from './tabs/invoices-tab';
import PaymentsTab from './tabs/payments-tab';
import CreditNotesTab from './tabs/credit-notes-tab';
import BatchPaymentsTab from './tabs/batch-payments-tab';

// Mock data for charts
const revenueData = [
  { name: 'Jan', revenue: 45000, target: 40000 },
  { name: 'Feb', revenue: 52000, target: 42000 },
  { name: 'Mar', revenue: 48000, target: 45000 },
  { name: 'Apr', revenue: 61000, target: 48000 },
  { name: 'May', revenue: 55000, target: 50000 },
  { name: 'Jun', revenue: 67000, target: 55000 },
  { name: 'Jul', revenue: 72000, target: 60000 },
];

const salesData = [
  { name: 'Jan', sales: 4000, target: 4500 },
  { name: 'Feb', sales: 3000, target: 4500 },
  { name: 'Mar', sales: 5000, target: 4500 },
  { name: 'Apr', sales: 2780, target: 4500 },
  { name: 'May', sales: 1890, target: 4500 },
  { name: 'Jun', sales: 2390, target: 4500 },
];

export default function SalesDashboard() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('proposals');
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    if (location.includes('/sales/proposals')) setActiveTab('proposals');
    else if (location.includes('/sales/estimates')) setActiveTab('estimates');
    else if (location.includes('/sales/invoices')) setActiveTab('invoices');
    else if (location.includes('/sales/payment-slips') || location.includes('/sales/payments')) setActiveTab('payments');
    else if (location.includes('/sales/credit-notes')) setActiveTab('credit-notes');
    else if (location.includes('/sales/batch-payments')) setActiveTab('batch-payments');
  }, [location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL when tab changes
    if (value === 'proposals') navigate('/sales/proposals');
    else if (value === 'estimates') navigate('/sales/estimates');
    else if (value === 'invoices') navigate('/sales/invoices');
    else if (value === 'payments') navigate('/sales/payments');
    else if (value === 'credit-notes') navigate('/sales/credit-notes');
    else if (value === 'batch-payments') navigate('/sales/batch-payments');
  };

  const handleExportData = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({
      title: "Preparing Export",
      description: `Generating ${type.toUpperCase()} file for current sales data...`,
    });

    setTimeout(() => {
      if (type === 'excel') {
        exportToExcel(revenueData, `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        const doc = new jsPDF();
        doc.text("Sales Dashboard Revenue Report", 14, 15);
        autoTable(doc, {
          startY: 25,
          head: [['Month', 'Revenue ($)', 'Target ($)']],
          body: revenueData.map(d => [d.name, d.revenue, d.target]),
        });
        doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      
      setIsExporting(false);
      toast({
        title: "Export Success",
        description: `Your ${type.toUpperCase()} file is ready for download.`,
      });
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <TrendingUp className="h-7 w-7 text-indigo-600" />
              </div>
              Sales Management
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Real-time insights into your revenue pipeline and conversions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 border-slate-200 shadow-sm px-5" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Data'}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExportData('excel')}>
                  Export as Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('pdf')}>
                  Export as PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 px-5 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Transaction
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setActiveTab('proposals'); navigate('/sales/proposals'); }}>
                  <FileText className="mr-2 h-4 w-4" /> Create Proposal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setActiveTab('estimates'); navigate('/sales/estimates'); }}>
                  <Calculator className="mr-2 h-4 w-4" /> New Estimate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setActiveTab('invoices'); navigate('/sales/invoices'); }}>
                  <Receipt className="mr-2 h-4 w-4" /> Generate Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setActiveTab('payments'); navigate('/sales/payments'); }}>
                  <DollarSign className="mr-2 h-4 w-4 text-emerald-600" /> Record Payment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setActiveTab('credit-notes'); navigate('/sales/credit-notes'); }}>
                  <RotateCcw className="mr-2 h-4 w-4 text-amber-600" /> Issue Credit Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Revenue', value: '$842,000', change: '+12.5%', trend: 'up', icon: Wallet, color: 'indigo' },
            { title: 'Open Proposals', value: '42', change: '+3', trend: 'up', icon: FileText, color: 'blue' },
            { title: 'Conversion Rate', value: '24.2%', change: '-2.1%', trend: 'down', icon: TrendingUp, color: 'emerald' },
            { title: 'Average Deal Size', value: '$12.4k', change: '+0.8%', trend: 'up', icon: Receipt, color: 'amber' },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all border-slate-200/60 overflow-hidden relative group cursor-default">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-${stat.color === 'indigo' ? 'indigo' : stat.color}-50/50 group-hover:scale-110 transition-transform`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 text-${stat.color === 'indigo' ? 'indigo' : stat.color}-600`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className={`text-xs mt-1 flex items-center gap-1 font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                    <span className="text-slate-400 font-normal ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm border-slate-200/60 transition-all hover:shadow-md overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Revenue Performance</CardTitle>
                <CardDescription>Target vs Actual Monthly Income</CardDescription>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs bg-white shadow-sm rounded-lg font-semibold">Monthly</Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-slate-500 rounded-lg">Quarterly</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#94a3b8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="transparent" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200/60 transition-all hover:shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Category Distribution</CardTitle>
              <CardDescription>Revenue by item types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    {name: 'Services', val: 45},
                    {name: 'Products', val: 32},
                    {name: 'Subs', val: 18},
                    {name: 'Other', val: 5},
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="val" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 space-y-3">
                {[
                  { label: 'Cloud Services', value: '45%', color: 'bg-indigo-500' },
                  { label: 'Hardware Sales', value: '32%', color: 'bg-indigo-300' },
                  { label: 'Consulting', value: '18%', color: 'bg-indigo-100' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-slate-600 font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Performance Context */}
        <div className="bg-slate-50/50 rounded-[2rem] p-5 border border-slate-100 shadow-inner">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-2">
              <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 p-1.5 h-14 shadow-sm rounded-2xl overflow-x-auto w-full justify-start">
                <TabsTrigger value="proposals" className="px-8 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-semibold">Proposals</TabsTrigger>
                <TabsTrigger value="estimates" className="px-8 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-semibold">Estimates</TabsTrigger>
                <TabsTrigger value="invoices" className="px-8 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-semibold">Invoices</TabsTrigger>
                <TabsTrigger value="payments" className="px-8 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-semibold">Payments</TabsTrigger>
                <TabsTrigger value="credit-notes" className="px-8 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-semibold">Credit Notes</TabsTrigger>
                <TabsTrigger value="batch-payments" className="px-8 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-semibold">Batch Payments</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    placeholder="Search documents, clients..." 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium shadow-sm"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl shrink-0 bg-white border-slate-200 hover:border-indigo-500 transition-colors">
                  <Filter className="h-5 w-5 text-slate-600" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="focus-visible:ring-0"
              >
                <TabsContent value="proposals" className="m-0 focus-visible:ring-0">
                  <ProposalsTab />
                </TabsContent>

                <TabsContent value="estimates" className="m-0 focus-visible:ring-0">
                  <EstimatesTab />
                </TabsContent>

                <TabsContent value="invoices" className="m-0 focus-visible:ring-0">
                  <InvoicesTab />
                </TabsContent>

                <TabsContent value="payments" className="m-0 focus-visible:ring-0">
                  <PaymentsTab />
                </TabsContent>

                <TabsContent value="credit-notes" className="m-0 focus-visible:ring-0">
                  <CreditNotesTab />
                </TabsContent>

                <TabsContent value="batch-payments" className="m-0 focus-visible:ring-0">
                  <BatchPaymentsTab />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

