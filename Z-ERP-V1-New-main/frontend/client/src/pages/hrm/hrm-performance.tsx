import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Star,
  Plus,
  Download,
  Search,
  Filter,
  Target,
  Award,
  BarChart3,
  Calendar,
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  History,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { exportToExcel } from '@/lib/exportUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// HRMPerformance: Performance review, KPIs, and appraisals.
export default function HRMPerformance() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isKPIDialogOpen, setIsKPIDialogOpen] = useState(false);
  const [isLearningDialogOpen, setIsLearningDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const { toast } = useToast();

  const [learningCourses, setLearningCourses] = useState([
    { id: 1, title: 'Advanced React Architecture', provider: 'Internal Academy', employees: 12, deadline: '2025-08-15', status: 'In Progress', color: 'violet' },
    { id: 2, title: 'Strategic Leadership v2', provider: 'Global HR Prep', employees: 5, deadline: '2025-09-01', status: 'Upcoming', color: 'amber' },
    { id: 3, title: 'Security & Compliance 2025', provider: 'SafetyFirst Org', employees: 145, deadline: '2025-07-20', status: 'Mandatory', color: 'rose' }
  ]);

  const [reviews, setReviews] = useState([
    { id: 'REV001', employee: 'John Smith', empId: 'EMP001', department: 'Engineering', reviewPeriod: 'Q2 2025', rating: 4.5, status: 'completed', reviewer: 'Sarah Johnson', completedDate: '2025-06-10', avatar: 'JS', feedback: 'Excellent performance across all projects.' },
    { id: 'REV002', employee: 'Mike Brown', empId: 'EMP003', department: 'Design', reviewPeriod: 'Q2 2025', rating: 4.2, status: 'completed', reviewer: 'Emily Davis', completedDate: '2025-06-12', avatar: 'MB', feedback: 'Great creative output, needs more focus on timelines.' },
    { id: 'REV003', employee: 'Alex Wilson', empId: 'EMP005', department: 'Sales', reviewPeriod: 'Q2 2025', rating: 0, status: 'pending', reviewer: 'Emily Davis', completedDate: '-', avatar: 'AW', feedback: '' }
  ]);

  const [kpis, setKpis] = useState([
    { id: 'KPI001', employee: 'John Smith', empId: 'EMP001', kpiName: 'Project Delivery', target: 10, achieved: 12, progress: 120, status: 'exceeded', avatar: 'JS' },
    { id: 'KPI002', employee: 'Sarah Johnson', empId: 'EMP002', kpiName: 'Product Launches', target: 3, achieved: 3, progress: 100, status: 'achieved', avatar: 'SJ' },
    { id: 'KPI003', employee: 'Alex Wilson', empId: 'EMP005', kpiName: 'Sales Targets', target: 100, achieved: 75, progress: 75, status: 'in-progress', avatar: 'AW' }
  ]);

  const handleUpdateReview = (id: string, updates: any) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, ...updates, status: 'completed', completedDate: new Date().toISOString().split('T')[0] } : r));
    toast({ title: "Review Submitted", description: "The performance evaluation has been archived." });
  };

  const handleAddKPI = (newKpi: any) => {
    setKpis([...kpis, { ...newKpi, id: `KPI${kpis.length + 1}`, progress: (newKpi.achieved / newKpi.target) * 100 }]);
    toast({ title: "KPI Assigned", description: "New growth metric has been set for the employee." });
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    completed: { label: 'Completed', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending: { label: 'Awaiting Review', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    overdue: { label: 'Overdue', class: 'bg-rose-100 text-rose-700 border-rose-200' }
  };

  const kpiStatusConfig: Record<string, { label: string; class: string }> = {
    exceeded: { label: 'Exceeded', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    achieved: { label: 'Reached', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    'in-progress': { label: 'In Progress', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    'not-met': { label: 'Flagged', class: 'bg-rose-100 text-rose-700 border-rose-200' }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => 
      r.employee.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.empId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, reviews]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({ title: "Exporting...", description: `Preparing performance report in ${type.toUpperCase()}.` });

    setTimeout(() => {
      if (type === 'excel') {
        const data = activeTab === 'reviews' ? reviews : kpis;
        exportToExcel(data, `Performance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        const doc = new jsPDF();
        doc.text(`Performance Report - ${new Date().toLocaleDateString()}`, 14, 15);
        if (activeTab === 'reviews') {
          autoTable(doc, {
            startY: 25,
            head: [['Emp ID', 'Employee', 'Period', 'Rating', 'Status', 'Reviewer']],
            body: reviews.map(r => [r.empId, r.employee, r.reviewPeriod, r.rating, r.status, r.reviewer]),
          });
        }
        doc.save(`Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      setIsExporting(false);
      toast({ title: "Export Complete", description: "Download started." });
    }, 1200);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn("h-3.5 w-3.5", star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')}
          />
        ))}
        {rating > 0 && <span className="ml-2 text-xs font-black text-slate-900">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 -mx-6 -mt-6 px-6 py-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation('/hrm')}
                className="hover:bg-slate-100 rounded-full transition-transform active:scale-95"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-600/10 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Performance & Growth</h1>
                  <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                    <Activity className="h-3.5 w-3.5" />
                    Talent assessment & KPI tracking
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold shadow-sm h-10">
                    <Download className="h-4 w-4 mr-2 text-slate-500" />
                    <span>Export Analytics</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>Performance Data</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                    Review Matrix (Excel)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
                    <Printer className="h-4 w-4 mr-2 text-rose-600" />
                    Quarterly Summary (PDF)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-200 rounded-xl font-bold h-10 transition-all active:scale-95">
                    <Plus className="h-4 w-4 mr-2" />
                    New Review Cycle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                  <div className="h-24 bg-gradient-to-r from-amber-500 to-orange-600 p-8">
                    <DialogTitle className="text-2xl font-black text-white">Initiate Review</DialogTitle>
                    <DialogDescription className="text-amber-50 font-medium">Configure a new talent assessment workflow</DialogDescription>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Employee</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 font-medium h-12">
                            <SelectValue placeholder="Choose team member" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="emp1">John Smith (EMP001)</SelectItem>
                            <SelectItem value="emp2">Sarah Johnson (EMP002)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Review Period</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 font-medium h-12">
                            <SelectValue placeholder="Select quarter" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="q2">Q2 2025</SelectItem>
                            <SelectItem value="q3">Q3 2025</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Designated Reviewer</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 font-medium h-12">
                          <SelectValue placeholder="Manager or supervisor" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="mgr1">Sarah Johnson (Product Lead)</SelectItem>
                          <SelectItem value="mgr2">Emily Davis (HR Senior)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Guidelines & Scope</Label>
                      <Textarea placeholder="Define objectives for this review..." rows={3} className="rounded-xl border-slate-200 bg-slate-50" />
                    </div>
                  </div>
                  <div className="px-8 pb-8 flex gap-3">
                    <Button variant="ghost" onClick={() => setIsReviewDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold text-slate-500">Cancel</Button>
                    <Button 
                      onClick={() => {
                        toast({ title: "Cycle Initiated", description: "Review notifications sent to employee and manager." });
                        setIsReviewDialogOpen(false);
                      }}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 rounded-xl h-12 font-bold shadow-lg shadow-amber-100"
                    >
                      Broadcast Cycle
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <StatCard title="Avg Rating" value="4.2" icon={<Star />} color="amber" sub="Group performance index" trend="up" />
          <StatCard title="Assessments" value="182" icon={<Award />} color="emerald" sub="Cycles completed" />
          <StatCard title="Pending" value="48" icon={<Calendar />} color="amber" sub="In-queue for review" />
          <StatCard title="KPI Goals" value="92%" icon={<Target />} color="blue" sub="Overall attainment" trend="up" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger 
                value="reviews" 
                className={cn(
                  "px-6 py-2.5 rounded-xl transition-all font-bold",
                  activeTab === 'reviews' ? "bg-white text-amber-600 shadow-sm border border-amber-100/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Performance Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="kpis" 
                className={cn(
                  "px-6 py-2.5 rounded-xl transition-all font-bold",
                  activeTab === 'kpis' ? "bg-white text-blue-600 shadow-sm border border-blue-100/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Key Indicators (KPIs)
              </TabsTrigger>
              <TabsTrigger 
                value="training" 
                className={cn(
                  "px-6 py-2.5 rounded-xl transition-all font-bold",
                  activeTab === 'training' ? "bg-white text-violet-600 shadow-sm border border-violet-100/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Development Goals
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 px-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                <Input
                  placeholder="Identify staff or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-[240px] bg-white border-slate-200 rounded-xl focus-visible:ring-amber-500/20"
                />
              </div>
            </div>
          </div>

          <TabsContent value="reviews" className="mt-6 space-y-4">
            <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Review Roster</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium tracking-tight italic">Current cycle: Q2 Fiscal Year 2025</p>
                </div>
                <Badge variant="outline" className="rounded-full bg-amber-50 text-amber-600 border-amber-100 font-bold px-3 py-1 text-[10px]">IN PROGRESS</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="w-[300px] font-bold text-slate-700">Team Member</TableHead>
                    <TableHead className="font-bold text-slate-700">Period</TableHead>
                    <TableHead className="font-bold text-slate-700">Assessment</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Reviewer</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id} className="group transition-colors hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedReview(review)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-200 group-hover:scale-110 transition-transform">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.employee}`} />
                            <AvatarFallback className="bg-amber-600 text-white font-bold">{review.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{review.employee}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{review.empId} / {review.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-sm text-slate-600">{review.reviewPeriod}</TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-lg px-2.5 py-1 border font-bold text-[10px] uppercase tracking-wider", statusConfig[review.status].class)}>
                          {statusConfig[review.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 group/rev">
                          <Avatar className="h-6 w-6 border border-slate-100">
                             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewer}`} />
                             <AvatarFallback className="text-[8px] bg-slate-200">{review.reviewer.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold text-slate-600 group-hover/rev:text-amber-600 transition-colors">{review.reviewer}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
              <DialogContent className="max-w-xl rounded-[2rem] p-0 overflow-hidden">
                {selectedReview && (
                  <>
                    <div className="bg-slate-900 p-8 text-white">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-white/20">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedReview.employee}`} />
                            <AvatarFallback>{selectedReview.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-2xl font-black">{selectedReview.employee}</h2>
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{selectedReview.empId} • {selectedReview.department}</p>
                          </div>
                        </div>
                        <Badge className={cn("rounded-xl px-3 py-1 font-black uppercase text-[10px]", statusConfig[selectedReview.status].class)}>
                          {statusConfig[selectedReview.status].label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Period</p>
                          <p className="font-bold">{selectedReview.reviewPeriod}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Reviewer</p>
                          <p className="font-bold">{selectedReview.reviewer}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Rating</p>
                          <div className="mt-1">{renderStars(selectedReview.rating)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                       <div className="space-y-4">
                          <h4 className="font-black text-slate-900 uppercase text-xs tracking-tighter flex items-center gap-2">
                             <Target className="h-4 w-4 text-amber-500" />
                             Summary & Feedback
                          </h4>
                          {selectedReview.status === 'completed' ? (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                              "{selectedReview.feedback || "Excellent progress this quarter."}"
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Assessment Rating</Label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                      key={star} 
                                      className={cn(
                                        "h-8 w-8 cursor-pointer transition-all active:scale-90", 
                                        star <= selectedReview.rating ? "fill-amber-400 text-amber-400 scale-110" : "text-slate-200"
                                      )}
                                      onClick={() => setSelectedReview({ ...selectedReview, rating: star })}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Manager Comments</Label>
                                <Textarea 
                                  placeholder="Describe the employee's performance..." 
                                  className="rounded-xl border-slate-200 bg-slate-50 h-24"
                                  value={selectedReview.feedback}
                                  onChange={(e) => setSelectedReview({ ...selectedReview, feedback: e.target.value })}
                                />
                              </div>
                            </div>
                          )}
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="rounded-xl font-bold h-12 border-slate-200" onClick={() => handleExport('pdf')}>
                             <Download className="h-4 w-4 mr-2" />
                             PDF Report
                          </Button>
                          {selectedReview.status === 'pending' ? (
                            <Button 
                              className="rounded-xl font-bold h-12 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-100"
                              onClick={() => {
                                handleUpdateReview(selectedReview.id, { rating: selectedReview.rating, feedback: selectedReview.feedback });
                                setSelectedReview(null);
                              }}
                            >
                               Submit Evaluation
                            </Button>
                          ) : (
                            <Button className="rounded-xl font-bold h-12 bg-slate-900 hover:bg-slate-800" onClick={() => setSelectedReview(null)}>
                               Acknowledge
                            </Button>
                          )}
                       </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="kpis" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {kpis.map((kpi) => (
                  <Card key={kpi.id} className="rounded-3xl border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-100">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${kpi.employee}`} />
                            <AvatarFallback>{kpi.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{kpi.employee}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{kpi.empId}</p>
                          </div>
                        </div>
                        <Badge className={cn("rounded-xl px-2.5 py-1 text-[9px] font-black uppercase", kpiStatusConfig[kpi.status].class)}>
                          {kpiStatusConfig[kpi.status].label}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Goal</p>
                          <h4 className="font-bold text-slate-800">{kpi.kpiName}</h4>
                        </div>
                        
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-500">Progress</span>
                              <span className="text-blue-600">{kpi.progress}%</span>
                           </div>
                           <Progress value={Math.min(kpi.progress, 100)} className="h-2 bg-slate-100" />
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-4">
                           <div className="text-center flex-1 border-r border-slate-50">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Target</p>
                              <p className="font-black text-slate-900">{kpi.target}</p>
                           </div>
                           <div className="text-center flex-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Achieved</p>
                              <p className="font-black text-emerald-600">{kpi.achieved}</p>
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
               ))}
               <Dialog open={isKPIDialogOpen} onOpenChange={setIsKPIDialogOpen}>
                 <DialogTrigger asChild>
                   <Card className="rounded-3xl border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-8 group hover:border-blue-400 transition-colors cursor-pointer">
                      <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform mb-4">
                        <Target className="h-8 w-8 text-slate-300 group-hover:text-blue-500" />
                      </div>
                      <h4 className="font-bold text-slate-600 group-hover:text-blue-600">Assign New KPI</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Strategic Goals</p>
                   </Card>
                 </DialogTrigger>
                 <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
                    <div className="bg-blue-600 p-6 text-white">
                      <DialogTitle className="text-xl font-bold">Assign New KPI</DialogTitle>
                      <DialogDescription className="text-blue-100 italic">Define a measurable goal for growth</DialogDescription>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Employee</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 h-10 font-bold">
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emp1">John Smith</SelectItem>
                            <SelectItem value="emp2">Sarah Johnson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-400">KPI Name</Label>
                        <Input placeholder="e.g. Sales Conversion" className="rounded-xl bg-slate-50 border-slate-200 h-10 font-bold" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Target Value</Label>
                          <Input type="number" placeholder="100" className="rounded-xl bg-slate-50 border-slate-200 h-10 font-bold" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Unit</Label>
                          <Input placeholder="Projects, %, USD" className="rounded-xl bg-slate-50 border-slate-200 h-10 font-bold" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex gap-3">
                      <Button variant="ghost" onClick={() => setIsKPIDialogOpen(false)} className="flex-1 rounded-xl font-bold text-slate-500">Cancel</Button>
                      <Button 
                        onClick={() => {
                          toast({ title: "KPI Assigned", description: "The new performance metric is now active." });
                          setIsKPIDialogOpen(false);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white shadow-lg shadow-blue-100"
                      >
                        Set Goal
                      </Button>
                    </div>
                 </DialogContent>
               </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {learningCourses.map((course) => (
                  <Card key={course.id} className="rounded-3xl border-slate-200/60 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                    <div className="flex">
                      <div className={cn("w-2", course.color === 'violet' ? 'bg-violet-500' : course.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500')} />
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Badge variant="outline" className="mb-2 rounded-full font-bold text-[10px] uppercase">{course.provider}</Badge>
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{course.title}</h4>
                          </div>
                          <Badge className={cn("rounded-lg font-black text-[9px] uppercase px-2", 
                            course.status === 'Mandatory' ? 'bg-rose-100 text-rose-700' : 
                            course.status === 'Upcoming' ? 'bg-amber-100 text-amber-700' : 
                            'bg-violet-100 text-violet-700'
                          )}>{course.status}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-50">
                           <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                               {[1,2,3].map(i => (
                                 <Avatar key={i} className="h-6 w-6 border-2 border-white">
                                   <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+course.id}`} />
                                   <AvatarFallback>U</AvatarFallback>
                                 </Avatar>
                               ))}
                             </div>
                             <span className="text-xs font-bold text-slate-500">+{course.employees - 3} enrolled</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase">
                             <Calendar className="h-3.5 w-3.5" />
                             {new Date(course.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                           </div>
                        </div>
                      </div>
                    </div>
                  </Card>
               ))}
               
               <Dialog open={isLearningDialogOpen} onOpenChange={setIsLearningDialogOpen}>
                 <DialogTrigger asChild>
                   <Card className="rounded-3xl border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-8 group hover:border-violet-400 transition-colors cursor-pointer min-h-[160px]">
                     <Plus className="h-8 w-8 text-slate-300 group-hover:text-violet-500 mb-2" />
                     <h4 className="font-bold text-slate-600 group-hover:text-violet-600">Add Learning Path</h4>
                   </Card>
                 </DialogTrigger>
                 <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                   <div className="h-32 bg-gradient-to-r from-violet-600 to-purple-700 p-8">
                     <DialogTitle className="text-3xl font-black text-white flex items-center gap-3">
                       <Target className="h-8 w-8" />
                       Create Learning Path
                     </DialogTitle>
                     <DialogDescription className="text-violet-100 font-medium mt-1">Design a new training program for employee development</DialogDescription>
                   </div>
                   <div className="p-8 space-y-6">
                     <div className="space-y-4">
                       <div className="space-y-2">
                         <Label htmlFor="course-title" className="text-xs font-black uppercase text-slate-400">Course Title</Label>
                         <Input 
                           id="course-title" 
                           placeholder="e.g., Advanced Python Development" 
                           className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold" 
                         />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="provider" className="text-xs font-black uppercase text-slate-400">Provider/Platform</Label>
                           <Select>
                             <SelectTrigger id="provider" className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold">
                               <SelectValue placeholder="Select provider" />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl">
                               <SelectItem value="internal">Internal Academy</SelectItem>
                               <SelectItem value="coursera">Coursera</SelectItem>
                               <SelectItem value="udemy">Udemy Business</SelectItem>
                               <SelectItem value="linkedin">LinkedIn Learning</SelectItem>
                               <SelectItem value="pluralsight">Pluralsight</SelectItem>
                               <SelectItem value="other">Other Platform</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         
                         <div className="space-y-2">
                           <Label htmlFor="course-status" className="text-xs font-black uppercase text-slate-400">Course Status</Label>
                           <Select>
                             <SelectTrigger id="course-status" className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold">
                               <SelectValue placeholder="Select status" />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl">
                               <SelectItem value="upcoming">Upcoming</SelectItem>
                               <SelectItem value="in-progress">In Progress</SelectItem>
                               <SelectItem value="mandatory">Mandatory</SelectItem>
                               <SelectItem value="optional">Optional</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="deadline" className="text-xs font-black uppercase text-slate-400">Completion Deadline</Label>
                           <Input 
                             id="deadline" 
                             type="date" 
                             className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold" 
                           />
                         </div>
                         
                         <div className="space-y-2">
                           <Label htmlFor="enrollments" className="text-xs font-black uppercase text-slate-400">Target Enrollments</Label>
                           <Input 
                             id="enrollments" 
                             type="number" 
                             placeholder="Number of employees" 
                             className="rounded-xl bg-slate-50 border-slate-200 h-12 font-bold" 
                           />
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         <Label htmlFor="course-description" className="text-xs font-black uppercase text-slate-400">Description & Objectives</Label>
                         <Textarea 
                           id="course-description" 
                           placeholder="Describe the learning outcomes and key topics covered..." 
                           className="rounded-xl bg-slate-50 border-slate-200 min-h-24 font-medium" 
                         />
                       </div>
                       
                       <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                         <h4 className="text-xs font-black text-blue-700 uppercase tracking-wider mb-3">Course Features</h4>
                         <div className="grid grid-cols-2 gap-3">
                           <div className="flex items-center gap-2">
                             <input type="checkbox" id="cert" className="rounded" defaultChecked />
                             <Label htmlFor="cert" className="text-sm font-medium text-slate-700 cursor-pointer">Certificate upon completion</Label>
                           </div>
                           <div className="flex items-center gap-2">
                             <input type="checkbox" id="track" className="rounded" defaultChecked />
                             <Label htmlFor="track" className="text-sm font-medium text-slate-700 cursor-pointer">Track progress metrics</Label>
                           </div>
                           <div className="flex items-center gap-2">
                             <input type="checkbox" id="notify" className="rounded" />
                             <Label htmlFor="notify" className="text-sm font-medium text-slate-700 cursor-pointer">Send email notifications</Label>
                           </div>
                           <div className="flex items-center gap-2">
                             <input type="checkbox" id="quiz" className="rounded" />
                             <Label htmlFor="quiz" className="text-sm font-medium text-slate-700 cursor-pointer">Include assessments</Label>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   <div className="px-8 pb-8 flex gap-3">
                     <Button 
                       variant="ghost" 
                       onClick={() => setIsLearningDialogOpen(false)} 
                       className="flex-1 rounded-xl h-12 font-bold text-slate-500 hover:bg-slate-100"
                     >
                       Cancel
                     </Button>
                     <Button 
                       onClick={() => {
                         const title = (document.getElementById('course-title') as HTMLInputElement)?.value;
                         const provider = (document.getElementById('provider') as any)?.value || 'Internal Academy';
                         const status = (document.getElementById('course-status') as any)?.value || 'Upcoming';
                         const deadline = (document.getElementById('deadline') as HTMLInputElement)?.value;
                         const enrollments = parseInt((document.getElementById('enrollments') as HTMLInputElement)?.value || '0');
                         
                         if (!title || !deadline) {
                           toast({
                             title: "Validation Error",
                             description: "Please fill in course title and deadline.",
                             variant: "destructive"
                           });
                           return;
                         }
                         
                         const newCourse = {
                           id: learningCourses.length + 1,
                           title,
                           provider,
                           employees: enrollments,
                           deadline,
                           status: status === 'mandatory' ? 'Mandatory' : status === 'in-progress' ? 'In Progress' : 'Upcoming',
                           color: status === 'mandatory' ? 'rose' : status === 'in-progress' ? 'violet' : 'amber'
                         };
                         
                         setLearningCourses([...learningCourses, newCourse]);
                         toast({ 
                           title: "✅ Learning Path Created", 
                           description: `${title} has been added to the training catalog.`,
                           duration: 4000
                         });
                         setIsLearningDialogOpen(false);
                         
                         // Clear form
                         (document.getElementById('course-title') as HTMLInputElement).value = '';
                         (document.getElementById('deadline') as HTMLInputElement).value = '';
                         (document.getElementById('enrollments') as HTMLInputElement).value = '';
                         (document.getElementById('course-description') as HTMLTextAreaElement).value = '';
                       }}
                       className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-xl h-12 font-bold text-white shadow-lg shadow-violet-100"
                     >
                       Create Learning Path
                     </Button>
                   </div>
                 </DialogContent>
               </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color, sub, trend = 'none' }: { title: string, value: string, icon: React.ReactNode, color: string, sub: string, trend?: 'up' | 'down' | 'none' }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100"
  };

  return (
    <Card className="rounded-2xl border-slate-200/60 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", colorMap[color])}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" }) : icon}
          </div>
          {trend !== 'none' && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
              trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
              {trend === 'up' ? '+15%' : '-4%'}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
          </div>
          <p className="text-[10px] text-slate-500 font-bold italic tracking-tight">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

