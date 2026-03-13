import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  CheckSquare,
  AlertCircle,
  Clock,
  DollarSign,
  Package,
  FileText,
  Activity,
  Calendar as CalendarIcon,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Zap,
  AlertTriangle,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Plus
} from 'lucide-react';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart, Tooltip } from 'recharts';

export default function DashboardOverview() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  
  // Widget visibility state
  const [widgets, setWidgets] = useState({
    quickStatistics: true,
    invoiceOverview: true,
    estimateOverview: true,
    proposalOverview: true,
    performanceHighlights: true,
    revenueOverview: true,
    projectAnalytics: true,
    paymentReceipts: true,
    contractsExpiring: true,
    outstandingInvoices: true,
    latestActivity: true,
    revenueInsights: true,
    quickActions: true,
    systemHealth: true,
    topPerformers: true,
    financialGoals: true,
    projectTimeline: true,
    taskTable: true,
    calendar: true,
  });

  const toggleWidget = (widgetKey: string) => {
    setWidgets(prev => ({ ...prev, [widgetKey]: !prev[widgetKey] }));
  };

  const toggleAll = (checked: boolean) => {
    const newWidgets = Object.keys(widgets).reduce((acc, key) => {
      acc[key] = checked;
      return acc;
    }, {} as typeof widgets);
    setWidgets(newWidgets);
  };

  const widgetOptions = [
    { key: 'quickStatistics', label: 'Quick Statistics', icon: BarChart3 },
    { key: 'invoiceOverview', label: 'Invoice Overview', icon: FileText },
    { key: 'estimateOverview', label: 'Estimate Overview', icon: FileText },
    { key: 'proposalOverview', label: 'Proposal Overview', icon: FileText },
    { key: 'performanceHighlights', label: 'Performance Highlights', icon: Zap },
    { key: 'revenueOverview', label: 'Revenue Overview', icon: DollarSign },
    { key: 'projectAnalytics', label: 'Project Analytics', icon: PieChart },
    { key: 'paymentReceipts', label: 'Payment Receipts', icon: DollarSign },
    { key: 'contractsExpiring', label: 'Contracts Expiring Soon', icon: AlertTriangle },
    { key: 'outstandingInvoices', label: 'Outstanding Invoices', icon: FileText },
    { key: 'latestActivity', label: 'Latest Activity', icon: Activity },
    { key: 'revenueInsights', label: 'Revenue Insights', icon: TrendingUp },
    { key: 'quickActions', label: 'Quick Actions', icon: Zap },
    { key: 'systemHealth', label: 'System Health', icon: Activity },
    { key: 'topPerformers', label: 'Top Performers', icon: Users },
    { key: 'financialGoals', label: 'Financial Goals', icon: Target },
    { key: 'projectTimeline', label: 'Project Timeline', icon: BarChart3 },
    { key: 'taskTable', label: 'Recent Tasks', icon: CheckSquare },
    { key: 'calendar', label: 'Calendar & Events', icon: CalendarIcon },
  ];

  // Mock data
  const kpiStats = [
    { title: 'Projects', value: '28', icon: Target, change: '+12%', trend: 'up', subtitle: 'last 30 days' },
    { title: 'Tasks', value: '156', icon: CheckSquare, change: '+23%', trend: 'up', subtitle: 'active items' },
    { title: 'Contacts', value: '342', icon: Users, change: '+8%', trend: 'up', subtitle: 'total contacts' },
    { title: 'Total Leads', value: '248', icon: Users, change: '+15%', trend: 'up', subtitle: 'active leads' }
  ];

  // Leads Overview Data
  const leadsOverviewData = [
    { name: 'New Leads', value: 156, color: '#06b6d4', percentage: 63 },
    { name: 'Old Leads', value: 42, color: '#374151', percentage: 17 },
    { name: 'Customer', value: 35, color: '#84cc16', percentage: 14 },
    { name: 'Lost Leads', value: 15, color: '#ef4444', percentage: 6 }
  ];

  // Invoice, Estimate, Proposal Overview Data
  const invoiceOverview = [
    { label: '0 Draft', percentage: 0, color: 'bg-gray-400' },
    { label: '16 Not Sent', percentage: 80, color: 'bg-gray-500' },
    { label: '15 Unpaid', percentage: 75, color: 'bg-red-500' },
    { label: '1 Partially Paid', percentage: 5, color: 'bg-orange-500' },
    { label: '0 Overdue', percentage: 0, color: 'bg-gray-400' },
    { label: '4 Paid', percentage: 20, color: 'bg-green-500' }
  ];

  const estimateOverview = [
    { label: '1 Draft', percentage: 50, color: 'bg-gray-500' },
    { label: '1 Not Sent', percentage: 50, color: 'bg-gray-500' },
    { label: '0 Sent', percentage: 0, color: 'bg-blue-400' },
    { label: '0 Expired', percentage: 0, color: 'bg-orange-400' },
    { label: '0 Declined', percentage: 0, color: 'bg-red-400' },
    { label: '1 Accepted', percentage: 50, color: 'bg-green-500' }
  ];

  const proposalOverview = [
    { label: '0 Draft', percentage: 0, color: 'bg-gray-400' },
    { label: '0 Sent', percentage: 0, color: 'bg-blue-400' },
    { label: '0 Open', percentage: 0, color: 'bg-gray-400' },
    { label: '0 Revised', percentage: 0, color: 'bg-blue-400' },
    { label: '0 Declined', percentage: 0, color: 'bg-red-400' },
    { label: '2 Accepted', percentage: 100, color: 'bg-green-500' }
  ];

  // Payment Receipts Data
  const paymentReceiptsData = [
    { month: 'Jan', received: 38000, pending: 8000, overdue: 3000 },
    { month: 'Feb', received: 45000, pending: 6000, overdue: 2000 },
    { month: 'Mar', received: 42000, pending: 5000, overdue: 1500 },
    { month: 'Apr', received: 52000, pending: 7000, overdue: 2500 },
    { month: 'May', received: 48000, pending: 6500, overdue: 1800 },
    { month: 'Jun', received: 58000, pending: 8500, overdue: 2200 }
  ];

  // Monthly Recurring Revenue (MRR) Data
  const mrrData = [
    { month: 'Jan', amount: 25000, growth: 5 },
    { month: 'Feb', amount: 28000, growth: 12 },
    { month: 'Mar', amount: 29500, growth: 5.4 },
    { month: 'Apr', amount: 32000, growth: 8.5 },
    { month: 'May', amount: 34500, growth: 7.8 },
    { month: 'Jun', amount: 38000, growth: 10.1 }
  ];

  // Team Productivity Metrics
  const teamProductivityData = [
    { metric: 'Tasks Completed', current: 156, target: 150, percentage: 104 },
    { metric: 'On-Time Delivery', current: 92, target: 95, percentage: 97 },
    { metric: 'Code Quality Score', current: 88, target: 85, percentage: 103 },
    { metric: 'Client Satisfaction', current: 4.7, target: 4.5, percentage: 104 }
  ];

  // Outstanding Invoices Summary
  const outstandingInvoices = {
    total: 15,
    amount: 125000,
    overdue: 5,
    overdueAmount: 32000,
    dueThisWeek: 4,
    dueThisWeekAmount: 28000
  };

  // Contracts Expiring Soon
  const expiringContracts = [
    { id: 1, client: 'Acme Corporation', contractType: 'Annual Maintenance', expiryDate: '2026-03-18', daysLeft: 7, value: 45000, status: 'critical' },
    { id: 2, client: 'TechStart Inc', contractType: 'Software License', expiryDate: '2026-03-25', daysLeft: 14, value: 32000, status: 'warning' },
    { id: 3, client: 'Global Systems Ltd', contractType: 'Support Contract', expiryDate: '2026-04-05', daysLeft: 25, value: 28000, status: 'info' },
    { id: 4, client: 'Innovation Hub', contractType: 'Consulting Services', expiryDate: '2026-04-12', daysLeft: 32, value: 55000, status: 'info' }
  ];

  const performanceHighlights = [
    { 
      icon: Zap, 
      title: 'Performance Boost', 
      description: 'System efficiency increased by 34%',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    { 
      icon: AlertTriangle, 
      title: 'Low Stock Alert', 
      description: '12 items below minimum threshold',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    { 
      icon: Clock, 
      title: 'Overdue Invoices', 
      description: '5 invoices pending payment',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
    { month: 'Feb', revenue: 51000, expenses: 32000, profit: 19000 },
    { month: 'Mar', revenue: 48000, expenses: 30000, profit: 18000 },
    { month: 'Apr', revenue: 62000, expenses: 35000, profit: 27000 },
    { month: 'May', revenue: 58000, expenses: 33000, profit: 25000 },
    { month: 'Jun', revenue: 71000, expenses: 38000, profit: 33000 }
  ];

  const salesPipelineData = [
    { stage: 'Lead', value: 45, color: 'hsl(217, 91%, 60%)' },
    { stage: 'Qualified', value: 32, color: 'hsl(142, 71%, 45%)' },
    { stage: 'Proposal', value: 28, color: 'hsl(280, 65%, 60%)' },
    { stage: 'Negotiation', value: 18, color: 'hsl(39, 96%, 60%)' },
    { stage: 'Closed', value: 52, color: 'hsl(142, 76%, 36%)' }
  ];

  const weeklyPerformanceData = [
    { day: 'Mon', team1: 85, team2: 72, team3: 68 },
    { day: 'Tue', team1: 78, team2: 80, team3: 75 },
    { day: 'Wed', team1: 92, team2: 88, team3: 82 },
    { day: 'Thu', team1: 88, team2: 85, team3: 79 },
    { day: 'Fri', team1: 95, team2: 91, team3: 88 }
  ];

  const projectStatusData = [
    { name: 'Completed', value: 45, color: 'hsl(142, 76%, 36%)' },
    { name: 'In Progress', value: 28, color: 'hsl(217, 91%, 60%)' },
    { name: 'Pending', value: 18, color: 'hsl(39, 96%, 60%)' },
    { name: 'Overdue', value: 9, color: 'hsl(0, 84%, 60%)' }
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Created new project', time: '2 minutes ago', icon: Target, color: 'text-blue-600' },
    { id: 2, user: 'Sarah Smith', action: 'Completed task: Design Review', time: '15 minutes ago', icon: CheckSquare, color: 'text-green-600' },
    { id: 3, user: 'Mike Johnson', action: 'Updated invoice #INV-2024', time: '1 hour ago', icon: FileText, color: 'text-purple-600' },
    { id: 4, user: 'Emily Davis', action: 'Added new contact', time: '2 hours ago', icon: Users, color: 'text-orange-600' },
    { id: 5, user: 'Alex Brown', action: 'Scheduled meeting', time: '3 hours ago', icon: CalendarIcon, color: 'text-indigo-600' }
  ];

  const revenueInsights = [
    { label: 'Subscriptions', amount: 42500, percentage: 45, color: 'bg-blue-500' },
    { label: 'Services', amount: 35800, percentage: 38, color: 'bg-green-500' },
    { label: 'Products', amount: 16200, percentage: 17, color: 'bg-purple-500' }
  ];

  // System Health Metrics
  const systemHealth = [
    { label: 'API Response Time', value: '142ms', status: 'excellent', percentage: 95, color: 'bg-green-500' },
    { label: 'Server Uptime', value: '99.8%', status: 'excellent', percentage: 99.8, color: 'bg-green-500' },
    { label: 'Database Load', value: '62%', status: 'good', percentage: 62, color: 'bg-blue-500' },
    { label: 'Active Users', value: '342', status: 'good', percentage: 75, color: 'bg-blue-500' }
  ];

  // Quick Actions Summary
  const quickActionsSummary = {
    pendingApprovals: 8,
    unreadMessages: 23,
    todayMeetings: 5,
    urgentTasks: 12
  };

  // Top Performers Data
  const topPerformers = [
    { id: 1, name: 'Sarah Johnson', role: 'Sales Manager', avatar: 'SJ', performance: 98, revenue: 125000, deals: 24, color: 'bg-blue-500' },
    { id: 2, name: 'Michael Chen', role: 'Project Lead', avatar: 'MC', performance: 95, revenue: 112000, deals: 18, color: 'bg-purple-500' },
    { id: 3, name: 'Emily Rodriguez', role: 'Account Manager', avatar: 'ER', performance: 92, revenue: 98000, deals: 22, color: 'bg-green-500' },
    { id: 4, name: 'David Kim', role: 'Business Developer', avatar: 'DK', performance: 89, revenue: 87000, deals: 15, color: 'bg-orange-500' }
  ];

  // Financial Goals Progress
  const financialGoals = [
    { goal: 'Quarterly Revenue Target', current: 285000, target: 350000, percentage: 81, status: 'on-track' },
    { goal: 'New Client Acquisition', current: 42, target: 50, percentage: 84, status: 'on-track' },
    { goal: 'Customer Retention Rate', current: 94, target: 95, percentage: 99, status: 'excellent' },
    { goal: 'Profit Margin', current: 28, target: 30, percentage: 93, status: 'good' }
  ];

  // Project Timeline Data
  const projectTimeline = [
    { project: 'Website Redesign', progress: 75, status: 'on-track', deadline: '2026-03-25', team: 5 },
    { project: 'Mobile App Development', progress: 45, status: 'at-risk', deadline: '2026-04-15', team: 8 },
    { project: 'CRM Integration', progress: 90, status: 'ahead', deadline: '2026-03-18', team: 3 },
    { project: 'Marketing Campaign', progress: 60, status: 'on-track', deadline: '2026-04-01', team: 4 }
  ];

  const taskData = [
    { id: 1, name: 'Complete Q1 Financial Report', status: 'in-progress', dueDate: '2026-01-20', priority: 'high', assignee: 'John Doe' },
    { id: 2, name: 'Update Client Database', status: 'pending', dueDate: '2026-01-18', priority: 'medium', assignee: 'Sarah Smith' },
    { id: 3, name: 'Review Purchase Orders', status: 'completed', dueDate: '2026-01-15', priority: 'low', assignee: 'Mike Johnson' },
    { id: 4, name: 'Inventory Stock Check', status: 'in-progress', dueDate: '2026-01-22', priority: 'high', assignee: 'Emily Davis' },
    { id: 5, name: 'Monthly Team Meeting', status: 'pending', dueDate: '2026-01-19', priority: 'medium', assignee: 'Alex Brown' }
  ];

  const statusConfig = {
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700 border-green-200' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  };

  const priorityConfig = {
    high: { label: 'High', class: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: 'Medium', class: 'bg-orange-100 text-orange-700 border-orange-200' },
    low: { label: 'Low', class: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  const calendarEvents = [
    { date: new Date(2026, 2, 12), type: 'event', title: 'Team Meeting', time: '10:00 AM', description: 'Q1 Strategy Review' },
    { date: new Date(2026, 2, 15), type: 'holiday', title: 'Company Holiday', time: 'All Day', description: 'Office Closed' },
    { date: new Date(2026, 2, 18), type: 'meeting', title: 'Client Call', time: '2:00 PM', description: 'Project Discussion with ABC Corp' },
    { date: new Date(2026, 2, 20), type: 'event', title: 'Project Review', time: '11:30 AM', description: 'Sprint Demo & Retrospective' },
    { date: new Date(2026, 2, 22), type: 'meeting', title: 'Stakeholder Meeting', time: '3:00 PM', description: 'Quarterly Business Review' },
    { date: new Date(2026, 2, 25), type: 'event', title: 'Training Session', time: '9:00 AM', description: 'New Platform Features' },
    { date: new Date(2026, 2, 28), type: 'meeting', title: 'Monthly Review', time: '4:00 PM', description: 'Team Performance & Goals' }
  ];

  // Get upcoming events (future dates only)
  const upcomingEvents = calendarEvents
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  // Check if a date has events
  const hasEvent = (date: Date) => {
    return calendarEvents.some(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Format date nicely
  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get event type styling
  const getEventStyle = (type: string) => {
    const styles = {
      event: {
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        border: 'border-l-blue-500',
        dot: 'bg-blue-500',
        gradient: 'from-blue-50 to-blue-100/50'
      },
      holiday: {
        badge: 'bg-red-100 text-red-700 border-red-200',
        border: 'border-l-red-500',
        dot: 'bg-red-500',
        gradient: 'from-red-50 to-red-100/50'
      },
      meeting: {
        badge: 'bg-purple-100 text-purple-700 border-purple-200',
        border: 'border-l-purple-500',
        dot: 'bg-purple-500',
        gradient: 'from-purple-50 to-purple-100/50'
      }
    };
    return styles[type as keyof typeof styles] || styles.event;
  };

  return (
    <DashboardLayout>
      {/* Dashboard Options Button - Fixed in Header Area */}
      <div className="fixed top-[72px] sm:top-[76px] right-4 sm:right-6 lg:right-8 z-50 animate-in fade-in slide-in-from-right-5 duration-500">
        <Sheet open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
          <SheetTrigger asChild>
            <Button 
              size="sm"
              variant="outline" 
              className="bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.08] hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50 group h-10 px-3 sm:px-4"
            >
              <Settings className="h-4 w-4 sm:mr-2 group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden sm:inline font-medium">Dashboard Options</span>
            </Button>
          </SheetTrigger>
<SheetContent className="w-[90vw] sm:w-[400px] md:w-[540px] overflow-y-auto border-l-2 border-blue-100">
            <SheetHeader className="space-y-3 pb-4 border-b border-slate-200">
              <SheetTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span>Customize Dashboard</span>
              </SheetTitle>
              <SheetDescription>
                <div className="space-y-3 mt-2">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Select widgets to display on your dashboard. Changes are applied instantly and saved automatically.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 border-t border-slate-100">
                    <Button 
                      variant="link" 
                      size="sm"
                      className="text-blue-600 p-0 h-auto text-sm hover:text-blue-700 transition-colors font-semibold"
                      onClick={() => toggleAll(true)}
                    >
                      <CheckSquare className="h-3.5 w-3.5 mr-1" />
                      Reset All
                    </Button>
                    <span className="text-slate-300">|</span>
                    <Button 
                      variant="link" 
                      size="sm"
                      className="text-slate-600 p-0 h-auto text-sm hover:text-slate-700 transition-colors"
                      onClick={() => setIsOptionsOpen(false)}
                    >
                      <span className="mr-1">←</span> Back
                      </Button>
                    </div>
                  </div>
                </SheetDescription>
              </SheetHeader>
              
            <div className="mt-6 space-y-4">
              {/* Select All Widget */}
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => toggleAll(!Object.values(widgets).every(v => v))}
              >
                <Checkbox 
                  id="select-all"
                  checked={Object.values(widgets).every(v => v)}
                  onCheckedChange={(checked) => toggleAll(checked as boolean)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-5 w-5 border-2 shadow-sm"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-bold text-blue-900 cursor-pointer flex-1 group-hover:text-blue-700 transition-colors"
                >
                  {Object.values(widgets).every(v => v) ? 'Deselect All Widgets' : 'Select All Widgets'}
                </label>
                {Object.values(widgets).every(v => v) && (
                  <CheckSquare className="h-5 w-5 text-green-600 animate-in zoom-in duration-200" />
                )}
              </div>

              {/* Widget Count Info */}
              <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-600">
                <span className="font-medium">
                  {Object.values(widgets).filter(v => v).length} of {Object.keys(widgets).length} widgets active
                </span>
                <span className="text-slate-400">Click to toggle</span>
              </div>

              {/* Widget List */}
              <ScrollArea className="h-[calc(100vh-340px)] sm:h-[580px] pr-2 sm:pr-3">
                <div className="space-y-2">{widgetOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isActive = widgets[option.key as keyof typeof widgets];
                    return (
                      <div
                        key={option.key}
                        className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                          isActive
                            ? 'bg-white border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                        onClick={() => toggleWidget(option.key)}
                      >
                        <Checkbox
                          id={option.key}
                          checked={isActive}
                          onCheckedChange={() => toggleWidget(option.key)}
                          className={`h-4 w-4 sm:h-5 sm:w-5 border-2 transition-all ${
                            isActive 
                              ? 'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600' 
                              : ''
                          }`}
                        />
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm group-hover:shadow'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}>
                            <IconComponent className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                              isActive
                                ? 'text-blue-600 group-hover:text-blue-700'
                                : 'text-slate-500 group-hover:text-slate-600'
                            }`} />
                          </div>
                          <label
                            htmlFor={option.key}
                            className={`text-sm font-medium cursor-pointer transition-colors truncate ${
                              isActive
                                ? 'text-slate-900 group-hover:text-slate-700'
                                : 'text-slate-500 group-hover:text-slate-600'
                            }`}
                          >
                            {option.label}
                          </label>
                          {isActive && (
                            <CheckSquare className="h-4 w-4 text-green-600 ml-auto flex-shrink-0 animate-in zoom-in duration-200" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col h-full bg-slate-50/30">
        <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-0 pb-6 pt-2">
          {/* KPI SUMMARY CARDS - Responsive Grid */}
          {widgets.quickStatistics && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {kpiStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 border-transparent hover:border-l-blue-500 bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-2 pt-4 sm:pt-6 px-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">{stat.title}</CardTitle>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <stat.icon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-4">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-500">{stat.subtitle}</span>
                  </div>
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '70%' }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}



          {/* INVOICE, ESTIMATE, PROPOSAL OVERVIEWS - Responsive Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
            {/* Invoice Overview */}
            {widgets.invoiceOverview && (
            <Card className="hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3 pt-4 sm:pt-6 px-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base sm:text-lg">Invoice overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 space-y-2">
                {invoiceOverview.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className={item.percentage === 0 ? 'text-slate-400' : 'text-slate-700'}>{item.label}</span>
                      <span className={item.percentage === 0 ? 'text-slate-400' : 'text-slate-600'}>{item.percentage.toFixed(2)}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
            )}

            {/* Estimate Overview */}
            {widgets.estimateOverview && (
            <Card className="hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3 pt-4 sm:pt-6 px-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base sm:text-lg">Estimate overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 space-y-2">
                {estimateOverview.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className={item.percentage === 0 ? 'text-slate-400' : 'text-slate-700'}>{item.label}</span>
                      <span className={item.percentage === 0 ? 'text-slate-400' : 'text-slate-600'}>{item.percentage.toFixed(2)}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
            )}

            {/* Proposal Overview */}
            {widgets.proposalOverview && (
            <Card className="hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3 pt-4 sm:pt-6 px-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base sm:text-lg">Proposal overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 space-y-2">
                {proposalOverview.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className={item.percentage === 0 ? 'text-slate-400' : 'text-slate-700'}>{item.label}</span>
                      <span className={item.percentage === 0 ? 'text-slate-400' : 'text-slate-600'}>{item.percentage.toFixed(2)}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
            )}
          </div>

        {/* 3️⃣ PERFORMANCE HIGHLIGHT CARDS - Responsive Grid */}
        {widgets.performanceHighlights && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {performanceHighlights.map((highlight, index) => (
            <Card key={index} className={`border ${highlight.borderColor}`}>
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <div className={`p-2 rounded-lg ${highlight.bgColor} flex-shrink-0`}>
                  <highlight.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${highlight.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 truncate">{highlight.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{highlight.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* 4️⃣ REVENUE OVERVIEW - Responsive */}
        {widgets.revenueOverview && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Revenue Overview</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Monthly revenue, expenses, and profit analysis</CardDescription>
              </div>
              <Select defaultValue="6months">
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="12months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                  <Area type="monotone" dataKey="profit" stroke="hsl(142, 76%, 36%)" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        )}

        {/* 5️⃣ ANALYTICS GRID - Responsive */}
        {widgets.projectAnalytics && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Sales Pipeline */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base sm:text-lg">Sales Pipeline</CardTitle>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
                  Total: 175
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesPipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="stage" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={60} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Team Performance */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Weekly Team Performance</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={weeklyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="team1" stroke="hsl(217, 91%, 60%)" strokeWidth={2} name="Team A" />
                    <Line type="monotone" dataKey="team2" stroke="hsl(142, 71%, 45%)" strokeWidth={2} name="Team B" />
                    <Line type="monotone" dataKey="team3" stroke="hsl(280, 65%, 60%)" strokeWidth={2} name="Team C" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* 6️⃣ ANALYTICS GRID WITH CHARTS - Responsive 3-Column Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Project Status */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-base sm:text-lg">Project Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {projectStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-600 truncate">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs ml-2">
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leads Overview */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base sm:text-lg">Leads Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={leadsOverviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {leadsOverviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {leadsOverviewData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2.5 w-2.5 rounded-sm flex-shrink-0" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="text-xs text-slate-600 truncate">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
                      {item.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Productivity */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-base sm:text-lg">Team Productivity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
              {teamProductivityData.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 truncate">{item.metric}</span>
                    <span className={`text-xs font-semibold ${item.percentage >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full transition-all ${item.percentage >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.current} / {item.target}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 7️⃣ PAYMENT RECEIPTS & MRR - Responsive 2-Column Grid */}
        {widgets.paymentReceipts && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Payment Receipts */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base sm:text-lg">Payment Receipts</CardTitle>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                  $283K Received
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentReceiptsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="received" fill="#10b981" radius={[4, 4, 0, 0]} name="Received" />
                    <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
                    <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} name="Overdue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Recurring Revenue (MRR) */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base sm:text-lg">Monthly Recurring Revenue</CardTitle>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  +10.1% Growth
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={mrrData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} name="MRR" dot={{ fill: '#3b82f6', r: 4 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* 8️⃣ OUTSTANDING INVOICES & ACTIVITY/INSIGHTS/CONTRACTS - Fully Responsive */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Contracts Expiring Soon - Compact Alert Card */}
          {widgets.contractsExpiring && (
          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 rounded-lg shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Expiring Contracts</CardTitle>
                    <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600 mt-1 text-xs">
                      {expiringContracts.filter(c => c.status === 'critical').length} Critical
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <ScrollArea className="h-64 sm:h-80">
                <div className="space-y-2 sm:space-y-3">
                  {expiringContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-md cursor-pointer ${
                        contract.status === 'critical'
                          ? 'bg-red-50 border-red-200 hover:border-red-300'
                          : contract.status === 'warning'
                          ? 'bg-orange-50 border-orange-200 hover:border-orange-300'
                          : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {contract.client}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {contract.contractType}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-2 text-xs font-bold ${
                            contract.status === 'critical'
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : contract.status === 'warning'
                              ? 'bg-orange-100 text-orange-700 border-orange-300'
                              : 'bg-blue-100 text-blue-700 border-blue-300'
                          }`}
                        >
                          {contract.daysLeft}d
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-600">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{new Date(contract.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                          <DollarSign className="h-3 w-3" />
                          <span>${(contract.value / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button className="w-full mt-3 bg-amber-500 hover:bg-amber-600" size="sm">
                <FileText className="h-3.5 w-3.5 mr-2" />
                View All Contracts
              </Button>
            </CardContent>
          </Card>
          )}

          {/* Outstanding Invoices Summary */}
          {widgets.outstandingInvoices && (
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                <CardTitle className="text-base sm:text-lg">Outstanding Invoices</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-xs text-red-600 font-medium">Overdue</p>
                    <p className="text-lg font-bold text-red-700">{outstandingInvoices.overdue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-600">Amount</p>
                    <p className="text-sm font-semibold text-red-700">${(outstandingInvoices.overdueAmount / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div>
                    <p className="text-xs text-orange-600 font-medium">Due This Week</p>
                    <p className="text-lg font-bold text-orange-700">{outstandingInvoices.dueThisWeek}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-orange-600">Amount</p>
                    <p className="text-sm font-semibold text-orange-700">${(outstandingInvoices.dueThisWeekAmount / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Total Outstanding</p>
                    <p className="text-lg font-bold text-slate-700">{outstandingInvoices.total}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Amount</p>
                    <p className="text-sm font-semibold text-slate-700">${(outstandingInvoices.amount / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              <Button className="w-full" size="sm">
                <Eye className="h-3.5 w-3.5 mr-2" />
                View All Invoices
              </Button>
            </CardContent>
          </Card>
          )}

          {/* Latest Activity */}
          {widgets.latestActivity && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Latest Activity</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm h-8">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <ScrollArea className="h-64 sm:h-80">
                <div className="space-y-3 sm:space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg bg-slate-100 flex-shrink-0`}>
                        <activity.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{activity.user}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{activity.action}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          )}

          {/* Revenue Insights - Responsive */}
          {widgets.revenueInsights && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Revenue Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900">$94.5K</span>
                    <span className="text-xs sm:text-sm font-medium text-green-600 flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      +12.5%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Total revenue this month</p>
                </div>
                <div className="space-y-3 mt-4 sm:mt-6">
                  {revenueInsights.map((insight, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">{insight.label}</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 ml-2 flex-shrink-0">
                          ${(insight.amount / 1000).toFixed(1)}K
                        </span>
                      </div>
                      <div className="relative h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`absolute h-full ${insight.color} transition-all`}
                          style={{ width: `${insight.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{insight.percentage}% of total</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* 9️⃣ QUICK ACTIONS & SYSTEM HEALTH - Responsive Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Quick Actions Summary */}
          {widgets.quickActions && (
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  {quickActionsSummary.pendingApprovals + quickActionsSummary.urgentTasks} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-700">Pending Approvals</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{quickActionsSummary.pendingApprovals}</p>
                  <Button variant="link" className="text-xs p-0 h-auto text-orange-600 hover:text-orange-700 mt-1">
                    Review Now →
                  </Button>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">Unread Messages</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{quickActionsSummary.unreadMessages}</p>
                  <Button variant="link" className="text-xs p-0 h-auto text-purple-600 hover:text-purple-700 mt-1">
                    View Inbox →
                  </Button>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Today's Meetings</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{quickActionsSummary.todayMeetings}</p>
                  <Button variant="link" className="text-xs p-0 h-auto text-green-600 hover:text-green-700 mt-1">
                    View Schedule →
                  </Button>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-medium text-red-700">Urgent Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{quickActionsSummary.urgentTasks}</p>
                  <Button variant="link" className="text-xs p-0 h-auto text-red-600 hover:text-red-700 mt-1">
                    Handle Now →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* System Health Metrics */}
          {widgets.systemHealth && (
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500 rounded-lg shadow-sm">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">System Health</CardTitle>
                </div>
                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                  All Systems Operational
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                {systemHealth.map((metric, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${metric.color} animate-pulse`} />
                        <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{metric.value}</span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full ${metric.color} transition-all duration-500`}
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* 🔟 TOP PERFORMERS & FINANCIAL GOALS - Responsive Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Top Performers */}
          {widgets.topPerformers && (
          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Top Performers</CardTitle>
                </div>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                  This Quarter
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`h-10 w-10 ${performer.color} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
                          {performer.avatar}
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{performer.name}</p>
                        <p className="text-xs text-slate-600">{performer.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          {performer.performance}%
                        </div>
                        <p className="text-xs text-slate-500">${(performer.revenue / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-600">Deals Closed: <span className="font-semibold text-slate-900">{performer.deals}</span></span>
                      <div className="flex items-center gap-1 text-purple-600">
                        <Target className="h-3 w-3" />
                        <span className="font-medium">View Details</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Financial Goals Progress */}
          {widgets.financialGoals && (
          <Card className="border-l-4 border-l-cyan-500 hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-cyan-50/50 to-blue-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-500 rounded-lg shadow-sm">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Financial Goals</CardTitle>
                </div>
                <Badge variant="outline" className="bg-cyan-100 text-cyan-700 border-cyan-200 text-xs">
                  Q1 2026
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                {financialGoals.map((goal, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-white to-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">{goal.goal}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-600">
                            {typeof goal.current === 'number' && goal.current > 1000 
                              ? `$${(goal.current / 1000).toFixed(0)}K / $${(goal.target / 1000).toFixed(0)}K`
                              : `${goal.current} / ${goal.target}${goal.goal.includes('Rate') || goal.goal.includes('Margin') ? '%' : ''}`
                            }
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-2 text-xs font-bold ${
                          goal.status === 'excellent'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : goal.status === 'on-track'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-orange-100 text-orange-700 border-orange-300'
                        }`}
                      >
                        {goal.percentage}%
                      </Badge>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full transition-all duration-500 ${
                          goal.status === 'excellent'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                            : goal.status === 'on-track'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                        }`}
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* 1️⃣1️⃣ PROJECT TIMELINE - Responsive */}
        {widgets.projectTimeline && (
        <Card className="border-l-4 border-l-indigo-500 hover:shadow-md transition-all duration-300">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg">Active Projects Timeline</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                <Plus className="h-3 w-3 mr-1" />
                New Project
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3">
              {projectTimeline.map((project, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-white to-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900">{project.project}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            project.status === 'ahead'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                              : project.status === 'on-track'
                              ? 'bg-blue-100 text-blue-700 border-blue-300'
                              : 'bg-red-100 text-red-700 border-red-300'
                          }`}
                        >
                          {project.status === 'ahead' ? 'Ahead of Schedule' : project.status === 'on-track' ? 'On Track' : 'At Risk'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Due: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{project.team} members</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-slate-900">{project.progress}%</p>
                      <p className="text-xs text-slate-500">Complete</p>
                    </div>
                  </div>
                  <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full transition-all duration-500 ${
                        project.status === 'ahead'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                          : project.status === 'on-track'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}

        {/* 1️⃣2️⃣ TASK TABLE - Fully Responsive */}
        {widgets.taskTable && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Tasks</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Track and manage your team's tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile: Card View */}
            <div className="block md:hidden space-y-3 p-4">
              {taskData.map((task) => (
                <Card key={task.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm text-slate-900 flex-1">{task.name}</h4>
                        <div className="flex gap-1 ml-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block mb-1">Status</span>
                          <Badge variant="outline" className={`${statusConfig[task.status as keyof typeof statusConfig]?.class || "bg-slate-100"} text-xs`}>
                            {statusConfig[task.status as keyof typeof statusConfig]?.label || task.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Priority</span>
                          <Badge variant="outline" className={`${priorityConfig[task.priority as keyof typeof priorityConfig]?.class || "bg-slate-100"} text-xs`}>
                            {priorityConfig[task.priority as keyof typeof priorityConfig]?.label || task.priority}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Due Date</span>
                          <span className="text-slate-900 font-medium">{task.dueDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Assignee</span>
                          <span className="text-slate-900 font-medium truncate block">{task.assignee}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs lg:text-sm">Task Name</TableHead>
                    <TableHead className="text-xs lg:text-sm">Status</TableHead>
                    <TableHead className="text-xs lg:text-sm">Due Date</TableHead>
                    <TableHead className="text-xs lg:text-sm">Priority</TableHead>
                    <TableHead className="text-xs lg:text-sm">Assignee</TableHead>
                    <TableHead className="text-right text-xs lg:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskData.map((task) => (
                    <TableRow key={task.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-xs lg:text-sm">{task.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusConfig[task.status as keyof typeof statusConfig]?.class || "bg-slate-100"} text-xs`}>
                          {statusConfig[task.status as keyof typeof statusConfig]?.label || task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs lg:text-sm">{task.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${priorityConfig[task.priority as keyof typeof priorityConfig]?.class || "bg-slate-100"} text-xs`}>
                          {priorityConfig[task.priority as keyof typeof priorityConfig]?.label || task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs lg:text-sm">{task.assignee}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        )}

        {/* 1️⃣3️⃣ ENHANCED CALENDAR SECTION - Fully Responsive */}
        {widgets.calendar && (
        <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-white text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  Calendar & Events
                </CardTitle>
                <CardDescription className="text-indigo-100 mt-1 text-xs sm:text-sm">
                  View and manage your scheduled events and meetings
                </CardDescription>
              </div>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-sm text-sm w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
          
          <CardContent className="p-3 sm:p-6 bg-gradient-to-br from-slate-50 to-white">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[1.2fr,380px] xl:grid-cols-[1.2fr,440px]">
              {/* Calendar Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-5 sm:p-7">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl w-full flex justify-center scale-95 sm:scale-100 lg:scale-105"
                  modifiers={{
                    hasEvent: (date) => hasEvent(date)
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      position: 'relative',
                      fontWeight: '600'
                    }
                  }}
                  components={{
                    Day: ({ date, ...props }) => {
                      const events = getEventsForDate(date);
                      const hasEvents = events.length > 0;
                      
                      return (
                        <div className="relative">
                          <button
                            {...props as any}
                            className={`
                              ${props.className}
                              ${hasEvents ? 'font-semibold' : ''}
                            `}
                          >
                            {date.getDate()}
                          </button>
                          {hasEvents && (
                            <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                              {events.slice(0, 3).map((event, idx) => (
                                <div
                                  key={idx}
                                  className={`h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full ${getEventStyle(event.type).dot}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
                
                {/* Legend */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-slate-400" />
                    Event Types
                  </h4>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200 flex-shrink-0" />
                      <span className="text-xs font-medium text-blue-700 truncate">Events</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-red-50/50 border border-red-100">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500 shadow-sm shadow-red-200 flex-shrink-0" />
                      <span className="text-xs font-medium text-red-700 truncate">Holidays</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-purple-50/50 border border-purple-100">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-purple-500 shadow-sm shadow-purple-200 flex-shrink-0" />
                      <span className="text-xs font-medium text-purple-700 truncate">Meetings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    Upcoming Events
                  </h3>
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
                    {upcomingEvents.length} scheduled
                  </Badge>
                </div>
                
                <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-4">
                  <div className="space-y-2 sm:space-y-3">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event, idx) => {
                        const style = getEventStyle(event.type);
                        return (
                          <div
                            key={idx}
                            className={`
                              group relative overflow-hidden rounded-xl border-l-4 ${style.border}
                              bg-gradient-to-br ${style.gradient} 
                              backdrop-blur-sm transition-all duration-300
                              hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5
                              cursor-pointer
                            `}
                          >
                            <div className="p-3 sm:p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-1 group-hover:text-slate-700 transition-colors truncate">
                                    {event.title}
                                  </h4>
                                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                    {event.description}
                                  </p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`${style.badge} text-xs whitespace-nowrap ml-2 flex-shrink-0`}
                                >
                                  {event.type === 'event' ? '📅' : event.type === 'holiday' ? '🎉' : '💼'}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                  <span className="font-medium truncate">{formatEventDate(event.date)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                  <span className="font-medium">{event.time}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 sm:py-12 px-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 mb-3 sm:mb-4">
                          <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-1">No Upcoming Events</h4>
                        <p className="text-xs sm:text-sm text-slate-600">
                          You're all caught up! No events scheduled.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
