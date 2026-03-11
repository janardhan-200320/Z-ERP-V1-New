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
  const [dateRange, setDateRange] = useState('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock data
  const kpiStats = [
    { title: 'Projects', value: '28', icon: Target, change: '+12%', trend: 'up', subtitle: 'last 30 days' },
    { title: 'Tasks', value: '156', icon: CheckSquare, change: '+23%', trend: 'up', subtitle: 'active items' },
    { title: 'Contacts', value: '342', icon: Users, change: '+8%', trend: 'up', subtitle: 'total contacts' },
    { title: 'Overdue Tasks', value: '7', icon: AlertCircle, change: '-3%', trend: 'down', subtitle: 'needs attention' }
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
      <div className="flex flex-col h-full bg-slate-50/30">
        {/* Modern Sticky Header - Fully Responsive */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-3 sm:px-6 py-3 sm:py-4 mx-[-16px] sm:mx-[-24px] mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 max-w-7xl mx-auto px-3 sm:px-6">
             <div className="flex items-center gap-2 sm:gap-4">
               <div className="p-2 sm:p-2.5 bg-blue-600 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-100">
                 <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
               </div>
               <div>
                 <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Enterprise Overview</h1>
                 <p className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">Real-time business intelligence and performance metrics</p>
               </div>
             </div>
             <div className="flex items-center gap-2 flex-wrap">
               <Select value={dateRange} onValueChange={setDateRange}>
                 <SelectTrigger className="w-28 sm:w-32 bg-white/50 border-slate-200 text-sm">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="week">Week</SelectItem>
                   <SelectItem value="month">Month</SelectItem>
                   <SelectItem value="year">Year</SelectItem>
                 </SelectContent>
               </Select>
               <Button variant="outline" size="sm" className="bg-white/50 border-slate-200 hidden sm:flex">
                 <Activity className="h-4 w-4 mr-2 text-blue-600" />
                 Analytics
               </Button>
               <Button variant="outline" size="icon" className="bg-white/50 border-slate-200 h-9 w-9">
                 <Settings className="h-4 w-4" />
               </Button>
             </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full px-2 sm:px-0">
          {/* KPI SUMMARY CARDS - Responsive Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {kpiStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2 pt-4 sm:pt-6 px-3 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-4">
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-slate-500 mt-1">{stat.change} {stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

        {/* 3️⃣ PERFORMANCE HIGHLIGHT CARDS - Responsive Grid */}
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

        {/* 4️⃣ REVENUE OVERVIEW - Responsive */}
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

        {/* 5️⃣ ANALYTICS GRID - Responsive */}
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

        {/* 6️⃣ PROJECT STATUS & 7️⃣ ACTIVITY/INSIGHTS - Fully Responsive */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Project Status */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Project Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3 sm:mt-4">
                {projectStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs sm:text-sm text-slate-600 truncate">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs ml-2">
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Latest Activity */}
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

          {/* Revenue Insights - Responsive */}
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
        </div>

        {/* 8️⃣ TASK TABLE - Fully Responsive */}
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

        {/* 9️⃣ ENHANCED CALENDAR SECTION - Fully Responsive */}
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
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[1fr,340px] xl:grid-cols-[1fr,400px]">
              {/* Calendar Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-3 sm:p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl w-full"
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
        </div>
      </div>
    </DashboardLayout>
  );
}
