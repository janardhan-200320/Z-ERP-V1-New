import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileBarChart, Download, Calendar, Filter, 
  TrendingUp, TrendingDown, DollarSign, PieChart,
  Target, Zap, ShieldCheck, ArrowRight, FileText,
  Activity, Briefcase, Globe, Layers, BarChart3,
  Search, ChevronRight, Settings2, Share2, Printer, Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Reports({ includeLayout = true }: any) {
  const { toast } = useToast();
  const [period, setPeriod] = useState("q4-2025");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const reportData: Record<string, {
    kpis: { label: string, value: string, trend: string, positive: boolean, prevValue: string }[],
    revenue: { month: string, actual: number, budget: number }[],
    allocations: { name: string, value: string, color: string }[]
  }> = {
    "q4-2025": {
      kpis: [
        { label: "Gross Revenue", value: "$2.4M", trend: "+12.5%", positive: true, prevValue: "$2.1M" },
        { label: "Net Margin", value: "32.4%", trend: "+2.1%", positive: true, prevValue: "30.3%" },
        { label: "Operating Exp", value: "$840K", trend: "-4.2%", positive: true, prevValue: "$876K" },
        { label: "Tax Liability", value: "$412K", trend: "+0.8%", positive: false, prevValue: "$408K" },
      ],
      revenue: [
        { month: 'Jul', actual: 65, budget: 55 },
        { month: 'Aug', actual: 45, budget: 50 },
        { month: 'Sep', actual: 80, budget: 70 },
        { month: 'Oct', actual: 55, budget: 60 },
        { month: 'Nov', actual: 90, budget: 80 },
        { month: 'Dec', actual: 75, budget: 70 }
      ],
      allocations: [
        { name: 'Operations', value: '$1.2M', color: 'text-emerald-500' },
        { name: 'Investments', value: '$450K', color: 'text-blue-500' }
      ]
    },
    "q3-2025": {
      kpis: [
        { label: "Gross Revenue", value: "$1.9M", trend: "+8.2%", positive: true, prevValue: "$1.75M" },
        { label: "Net Margin", value: "28.5%", trend: "-1.5%", positive: false, prevValue: "30.0%" },
        { label: "Operating Exp", value: "$720K", trend: "+5.1%", positive: false, prevValue: "$685K" },
        { label: "Tax Liability", value: "$310K", trend: "+2.2%", positive: false, prevValue: "$303K" },
      ],
      revenue: [
        { month: 'Jan', actual: 45, budget: 50 },
        { month: 'Feb', actual: 55, budget: 55 },
        { month: 'Mar', actual: 65, budget: 60 },
        { month: 'Apr', actual: 75, budget: 70 },
        { month: 'May', actual: 85, budget: 80 },
        { month: 'Jun', actual: 95, budget: 90 }
      ],
      allocations: [
        { name: 'Operations', value: '$950K', color: 'text-emerald-500' },
        { name: 'Investments', value: '$320K', color: 'text-blue-500' }
      ]
    },
    "fy-2024": {
      kpis: [
        { label: "Gross Revenue", value: "$10.2M", trend: "+22.1%", positive: true, prevValue: "$8.3M" },
        { label: "Net Margin", value: "35.8%", trend: "+5.4%", positive: true, prevValue: "30.4%" },
        { label: "Operating Exp", value: "$3.1M", trend: "-2.8%", positive: true, prevValue: "$3.2M" },
        { label: "Tax Liability", value: "$1.8M", trend: "+12.1%", positive: false, prevValue: "$1.6M" },
      ],
      revenue: [
        { month: 'Q1', actual: 80, budget: 75 },
        { month: 'Q2', actual: 75, budget: 75 },
        { month: 'Q3', actual: 90, budget: 85 },
        { month: 'Q4', actual: 110, budget: 100 },
        { month: 'Jan', actual: 95, budget: 90 },
        { month: 'Feb', actual: 105, budget: 100 }
      ],
      allocations: [
        { name: 'Operations', value: '$6.8M', color: 'text-emerald-500' },
        { name: 'Investments', value: '$2.1M', color: 'text-blue-500' }
      ]
    }
  };

  const currentData = reportData[period] || reportData["q4-2025"];

  const handleGenerate = (name: string) => {
    setIsGenerating(name);
    setTimeout(() => {
      setIsGenerating(null);
      toast({
        title: "Report Generated",
        description: `${name} has been compiled and is ready for download.`,
      });
    }, 1500);
  };

  const reportModules = [
    { title: "Profit & Loss", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Consolidated revenue vs. expenditure analytics." },
    { title: "Balance Sheet", icon: Layers, color: "text-blue-500", bg: "bg-blue-50", desc: "Equity, assets, and liability status." },
    { title: "Cash Flow", icon: Activity, color: "text-amber-500", bg: "bg-amber-50", desc: "Liquidity and cash movement tracking." },
    { title: "Tax Summary", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-50", desc: "VAT and corporate tax liability estimates." },
    { title: "Vendor Spend", icon: Briefcase, color: "text-red-500", bg: "bg-red-50", desc: "Procurement trends and vendor efficiency." },
    { title: "Aging Receivables", icon: Zap, color: "text-orange-500", bg: "bg-orange-50", desc: "Invoice collection performance metrics." },
  ];

  const content = (
    <div className="p-6 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
               <FileBarChart className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Financial Intelligence</h2>
          </div>
          <p className="text-slate-500 font-medium ml-12">Actionable insights and comprehensive statements</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border shadow-sm self-start">
          <div className="flex p-0.5 bg-slate-50 rounded-xl">
            {['q4-2025', 'q3-2025', 'fy-2024'].map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
                onClick={() => setPeriod(p)}
              >
                {p.replace('-', ' ')}
              </Button>
            ))}
          </div>
          <div className="w-[1px] h-6 bg-slate-100" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[40px] px-0 border-none shadow-none focus:ring-0 text-slate-400 hover:text-slate-950">
              <Calendar className="h-4 w-4 mx-auto" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
               <SelectItem value="q4-2025">Q4 2025 (Active)</SelectItem>
               <SelectItem value="q3-2025">Q3 2025</SelectItem>
               <SelectItem value="fy-2024">Fiscal Year 2024</SelectItem>
               <SelectItem value="custom" disabled>Custom Range...</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="h-9 px-5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 ml-1"
            onClick={() => {
              toast({
                title: "Data Refreshed",
                description: `Financial records for ${period.toUpperCase()} have been synchronized.`,
              });
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentData.kpis.map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group cursor-default overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-3xl font-black text-slate-800">{kpi.value}</span>
                  <p className="text-[10px] font-bold text-slate-400">vs {kpi.prevValue} (Prev)</p>
                </div>
                <Badge className={cn(
                  "font-black text-[10px] border-none mb-1",
                  kpi.positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  {kpi.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
               <div>
                  <CardTitle className="text-xl font-black text-slate-800">Revenue Performance</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Rolling 6-Month Comparison</CardDescription>
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                     <div className="h-2 w-2 rounded-full bg-slate-900" />
                     <span className="text-[10px] font-black text-slate-600">Actual</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                     <div className="h-2 w-2 rounded-full bg-slate-300" />
                     <span className="text-[10px] font-black text-slate-600">Budget</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-8">
               <div className="h-[300px] w-full flex items-end justify-between gap-4 px-4 pb-4 border-b border-slate-100">
                  {currentData.revenue.map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="w-full flex justify-center gap-1 items-end h-full">
                        <div 
                          className="w-4 rounded-t-lg bg-slate-200 group-hover:bg-slate-300 transition-all"
                          style={{ height: `${data.budget}%` }}
                        />
                        <div 
                          className="w-4 rounded-t-lg bg-slate-900 group-hover:bg-slate-800 transition-all shadow-lg group-hover:shadow-slate-200"
                          style={{ height: `${data.actual}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{data.month}</span>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden flex flex-col">
            <CardHeader className="px-8 py-8">
               <CardTitle className="text-xl font-black">Asset Allocations</CardTitle>
               <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Current Resource Distribution</CardDescription>
            </CardHeader>
            <CardContent className="px-8 flex-1 flex flex-col justify-center">
               <div className="relative h-48 w-48 mx-auto mb-8 flex items-center justify-center">
                  <svg className="h-full w-full rotate-[-90deg]">
                     <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" className="text-slate-800" />
                     <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="502.4" strokeDashoffset="120" className="text-emerald-500" />
                     <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="502.4" strokeDashoffset="350" className="text-blue-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-black">{period === 'fy-2024' ? '82%' : '74%'}</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Liquid</span>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {currentData.allocations.map((alloc, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", alloc.color.replace('text', 'bg'))} />
                          <span className="text-xs font-black uppercase text-slate-300">{alloc.name}</span>
                      </div>
                      <p className="text-lg font-black ml-4">{alloc.value}</p>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportModules.map((report, i) => (
          <Card key={i} className="border-none shadow-sm bg-white hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">
            <CardHeader className="p-6">
              <div className="flex items-start justify-between">
                <div className={cn("p-3 rounded-2xl shadow-sm", report.bg)}>
                  <report.icon className={cn("h-6 w-6", report.color)} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-50 border border-slate-100">
                    <Printer className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-50 border border-slate-100">
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-lg font-black text-slate-800">{report.title}</CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 mt-1">{report.desc}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 border-t border-slate-50 mt-4 pt-4">
              <Button 
                variant="ghost" 
                className="w-full justify-between h-10 px-0 group-hover:px-4 rounded-xl group-hover:bg-slate-50 transition-all font-bold text-slate-700"
                onClick={() => handleGenerate(report.title)}
                disabled={isGenerating === report.title}
              >
                <span className="flex items-center gap-2">
                   {isGenerating === report.title ? (
                     <div className="h-4 w-4 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                   ) : (
                     <Download className="h-4 w-4 text-slate-400" />
                   )}
                   {isGenerating === report.title ? "Generating..." : "Download Report"}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white overflow-hidden relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
         <div className="absolute top-0 right-0 p-12 opacity-5">
            <Settings2 className="h-48 w-48 rotate-12" />
         </div>
         <CardContent className="p-10 relative z-10">
            <div className="max-w-2xl space-y-4">
               <Badge className="bg-indigo-500/20 text-indigo-200 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Enterprise Labs</Badge>
               <h3 className="text-3xl font-black tracking-tight">Custom Analytics Builder</h3>
               <p className="text-slate-400 font-medium leading-relaxed">
                  Generate hyper-specific datasets by combining multiple fiscal variables. Export into PowerBI, Excel, or high-fidelity PDF formats with customized branding.
               </p>
               <div className="flex flex-wrap gap-4 pt-4">
                  <Button className="h-12 px-8 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black shadow-lg shadow-black/20 gap-2">
                     <Plus className="h-5 w-5" /> Launch Builder
                  </Button>
                  <Button variant="outline" className="h-12 px-8 rounded-2xl border-white/20 hover:bg-white/10 text-white font-black gap-2">
                     <FileText className="h-5 w-5" /> Explore Templates
                  </Button>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );

  if (!includeLayout) return content;

  return (
    <DashboardLayout>
      {content}
    </DashboardLayout>
  );
}

