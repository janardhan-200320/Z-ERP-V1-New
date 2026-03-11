import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Download, FileText, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ProjectReportsTabProps {
  projectId: string | undefined;
}

export default function ProjectReportsTab({ projectId }: ProjectReportsTabProps) {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');

  // Mock data
  const kpiSummary = [
    { title: 'Budget Utilization', value: '65%', trend: 'up', change: '+5%', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Time Progress', value: '58%', trend: 'up', change: '+12%', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Task Completion', value: '72%', trend: 'up', change: '+8%', icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Team Efficiency', value: '88%', trend: 'down', change: '-3%', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100' }
  ];

  const taskCompletionData = [
    { week: 'Week 1', planned: 15, completed: 12 },
    { week: 'Week 2', planned: 18, completed: 16 },
    { week: 'Week 3', planned: 20, completed: 18 },
    { week: 'Week 4', planned: 16, completed: 15 }
  ];

  const budgetData = [
    { category: 'Development', spent: 45000, budget: 60000 },
    { category: 'Design', spent: 18000, budget: 20000 },
    { category: 'Testing', spent: 12000, budget: 15000 },
    { category: 'Management', spent: 22500, budget: 25000 }
  ];

  const timeDistributionData = [
    { name: 'Development', value: 45, color: 'hsl(217, 91%, 60%)' },
    { name: 'Design', value: 20, color: 'hsl(142, 71%, 45%)' },
    { name: 'Testing', value: 15, color: 'hsl(39, 96%, 60%)' },
    { name: 'Meetings', value: 12, color: 'hsl(280, 65%, 60%)' },
    { name: 'Documentation', value: 8, color: 'hsl(0, 84%, 60%)' }
  ];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Project Summary</SelectItem>
                  <SelectItem value="budget">Budget Analysis</SelectItem>
                  <SelectItem value="time">Time Tracking</SelectItem>
                  <SelectItem value="performance">Team Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiSummary.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {kpi.change}
                </span>
                <span className="text-slate-500">from last period</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Task Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="planned" stroke="hsl(217, 91%, 60%)" strokeWidth={2} name="Planned" />
                  <Line type="monotone" dataKey="completed" stroke="hsl(142, 76%, 36%)" strokeWidth={2} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget Analysis Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="spent" fill="hsl(0, 84%, 60%)" name="Spent" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="budget" fill="hsl(217, 91%, 60%)" name="Budget" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {timeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              {timeDistributionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
