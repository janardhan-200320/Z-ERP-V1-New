import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle,
  FileText,
  CalendarClock,
  UserCheck,
  Plus,
  X,
  BarChart3,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// Sub-module components
import JobDescriptionsModule from './job-descriptions';
import InterviewScheduleModule from './interview-schedule';
import CandidatesModule from './candidates';

// ─── Shared Types ──────────────────────────────────
export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  workMode: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  skills: string[];
  duration: string;
  experience: string;
  openings: number;
  deadline: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  education: string;
  applicants: number;
  status: string;
  postedDate: string;
}

const DEPT_MAP: Record<string, string> = {
  eng: 'Engineering', mkt: 'Marketing', prod: 'Product', sales: 'Sales',
  hr: 'Human Resources', finance: 'Finance', ops: 'Operations', design: 'Design',
};

const TYPE_MAP: Record<string, string> = {
  full: 'Full-time', part: 'Part-time', contract: 'Contract', intern: 'Internship',
};

const INITIAL_JOBS: Job[] = [
  {
    id: 1, title: 'Senior Full Stack Developer', department: 'Engineering',
    location: 'Remote', type: 'Full-time', workMode: 'Remote',
    salaryMin: '120,000', salaryMax: '180,000',
    description: 'Build and maintain scalable web applications using modern technologies.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    duration: 'Permanent', experience: 'Senior (5+ yrs)', openings: 2,
    deadline: '2026-03-15',
    responsibilities: 'Lead technical architecture decisions\nMentor junior developers\nConduct code reviews',
    requirements: '5+ years full-stack experience\nProficiency in React & Node.js\nCloud services experience',
    benefits: 'Health & dental insurance\nFlexible PTO\nRemote work\n401k matching',
    education: "Bachelor's Degree", applicants: 45, status: 'Active', postedDate: '2 days ago',
  },
  {
    id: 2, title: 'Product Marketing Manager', department: 'Marketing',
    location: 'New York, NY', type: 'Full-time', workMode: 'Hybrid',
    salaryMin: '90,000', salaryMax: '130,000',
    description: 'Drive product marketing strategy and go-to-market plans for SaaS products.',
    skills: ['Content Strategy', 'SEO', 'Analytics', 'Campaign Management'],
    duration: 'Permanent', experience: 'Mid (3-5 yrs)', openings: 1,
    deadline: '2026-03-01',
    responsibilities: 'Develop go-to-market strategies\nCreate marketing collateral\nAnalyze campaign performance',
    requirements: '3+ years in product marketing\nB2B SaaS experience\nStrong analytical skills',
    benefits: 'Health insurance\nAnnual bonus\nProfessional development budget',
    education: "Bachelor's Degree", applicants: 28, status: 'Active', postedDate: '5 days ago',
  },
  {
    id: 3, title: 'UI/UX Designer', department: 'Product',
    location: 'Remote', type: 'Contract', workMode: 'Remote',
    salaryMin: '60/hr', salaryMax: '85/hr',
    description: 'Design intuitive user interfaces and conduct user research.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    duration: '6 months', experience: 'Mid (3-5 yrs)', openings: 1,
    deadline: '2026-02-28',
    responsibilities: 'Create wireframes and prototypes\nConduct user research\nMaintain design system',
    requirements: '3+ years UX design experience\nProficiency in Figma\nPortfolio required',
    benefits: 'Flexible hours\nRemote work\nEquipment stipend',
    education: "Bachelor's Degree", applicants: 56, status: 'Closing Soon', postedDate: '1 week ago',
  },
  {
    id: 4, title: 'Sales Representative', department: 'Sales',
    location: 'Chicago, IL', type: 'Full-time', workMode: 'On-site',
    salaryMin: '55,000', salaryMax: '75,000',
    description: 'Drive new business development and manage client relationships.',
    skills: ['CRM', 'Negotiation', 'Cold Calling', 'Pipeline Management'],
    duration: 'Permanent', experience: 'Entry (0-2 yrs)', openings: 3,
    deadline: '2026-03-20',
    responsibilities: 'Prospect and qualify leads\nConduct product demos\nMeet quarterly sales targets',
    requirements: '1+ years sales experience preferred\nExcellent communication skills\nSelf-motivated',
    benefits: 'Base + Commission\nHealth insurance\nSales training program',
    education: 'High School Diploma', applicants: 12, status: 'Active', postedDate: '1 day ago',
  },
];

interface JobFormData {
  title: string;
  department: string;
  employmentType: string;
  location: string;
  workMode: string;
  experience: string;
  openings: string;
  deadline: string;
  duration: string;
  education: string;
  salaryMin: string;
  salaryMax: string;
  skills: string[];
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
}

const emptyForm: JobFormData = {
  title: '', department: '', employmentType: '', location: '',
  workMode: '', experience: '', openings: '1', deadline: '',
  duration: '', education: '', salaryMin: '', salaryMax: '',
  skills: [], description: '', responsibilities: '',
  requirements: '', benefits: '',
};

const PIPELINE_DATA = [
  { name: 'Applied', value: 145, color: '#94a3b8' },
  { name: 'Screening', value: 45, color: '#f59e0b' },
  { name: 'Interview', value: 28, color: '#8b5cf6' },
  { name: 'Technical', value: 12, color: '#3b82f6' },
  { name: 'Offer', value: 5, color: '#10b981' },
];

const RECENT_ACTIVITY = [
  { id: 1, user: 'Sarah Jenkins', action: 'applied for', target: 'Senior Developer', time: '2h ago', icon: <FileText className="h-4 w-4" /> },
  { id: 2, user: 'Interview scheduled', action: 'with', target: 'Michael Chen', time: '4h ago', icon: <CalendarClock className="h-4 w-4" /> },
  { id: 3, user: 'Offer accepted', action: 'by', target: 'Emily Davis', time: 'Yesterday', icon: <CheckCircle className="h-4 w-4" /> },
];

export default function RecruitmentDashboard() {
  // Shared state
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string | null>(null);
  const [schedulingFor, setSchedulingFor] = useState<{ candidate: string; position: string } | null>(null);

  // Form state
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [form, setForm] = useState<JobFormData>(emptyForm);
  const [skillInput, setSkillInput] = useState('');
  const { toast } = useToast();

  const updateForm = (field: keyof JobFormData, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      updateForm('skills', [...form.skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateForm('skills', form.skills.filter(s => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const publishJob = () => {
    if (!form.title.trim()) {
      toast({ title: 'Missing required field', description: 'Please provide a job title.' });
      return;
    }
    if (!form.department) {
      toast({ title: 'Missing required field', description: 'Please select a department.' });
      return;
    }
    if (!form.employmentType) {
      toast({ title: 'Missing required field', description: 'Please select employment type.' });
      return;
    }

    const newJob: Job = {
      id: Date.now(),
      title: form.title,
      department: DEPT_MAP[form.department] || form.department,
      location: form.location || 'Not specified',
      type: TYPE_MAP[form.employmentType] || form.employmentType,
      workMode: form.workMode || 'Not specified',
      salaryMin: form.salaryMin,
      salaryMax: form.salaryMax,
      description: form.description,
      skills: form.skills,
      duration: form.duration || 'Permanent',
      experience: form.experience || 'Not specified',
      openings: parseInt(form.openings) || 1,
      deadline: form.deadline,
      responsibilities: form.responsibilities,
      requirements: form.requirements,
      benefits: form.benefits,
      education: form.education || 'Not specified',
      applicants: 0,
      status: 'Active',
      postedDate: 'Just now',
    };

    setJobs(prev => [newJob, ...prev]);
    setIsPostJobOpen(false);
    setForm(emptyForm);
    setSkillInput('');
    setActiveTab('jobs');
    toast({ title: 'Job posted successfully!', description: `"${form.title}" has been published and is now live.` });
  };

  const handleViewApplicants = (jobTitle: string) => {
    setSelectedJobFilter(jobTitle);
    setActiveTab('candidates');
  };

  const handleScheduleInterview = (candidateName: string, position: string) => {
    setSchedulingFor({ candidate: candidateName, position });
    setActiveTab('interviews');
  };

  const handleClearJobFilter = () => {
    setSelectedJobFilter(null);
  };

  const handleClearScheduling = () => {
    setSchedulingFor(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-purple-600" />
              Recruitment
            </h1>
            <p className="text-slate-600 mt-1">
              Manage job openings, candidates, interviews, and hiring pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Post New Job Opening</DialogTitle>
                  <DialogDescription>
                    Fill in all the details to create a comprehensive job listing.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="grid gap-6 py-4">
                    {/* ── Basic Information ── */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Title <span className="text-red-500">*</span></Label>
                          <Input placeholder="e.g. Senior Full Stack Developer" value={form.title} onChange={(e) => updateForm('title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Department <span className="text-red-500">*</span></Label>
                          <Select value={form.department} onValueChange={(v) => updateForm('department', v)}>
                            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eng">Engineering</SelectItem>
                              <SelectItem value="mkt">Marketing</SelectItem>
                              <SelectItem value="prod">Product</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="hr">Human Resources</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="ops">Operations</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Employment Type <span className="text-red-500">*</span></Label>
                          <Select value={form.employmentType} onValueChange={(v) => updateForm('employmentType', v)}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full-time</SelectItem>
                              <SelectItem value="part">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="intern">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Work Mode</Label>
                          <Select value={form.workMode} onValueChange={(v) => updateForm('workMode', v)}>
                            <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Remote">Remote</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                              <SelectItem value="On-site">On-site</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input placeholder="e.g. Remote, New York, NY" value={form.location} onChange={(e) => updateForm('location', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Experience Level</Label>
                          <Select value={form.experience} onValueChange={(v) => updateForm('experience', v)}>
                            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Entry (0-2 yrs)">Entry Level (0-2 years)</SelectItem>
                              <SelectItem value="Mid (3-5 yrs)">Mid Level (3-5 years)</SelectItem>
                              <SelectItem value="Senior (5+ yrs)">Senior (5+ years)</SelectItem>
                              <SelectItem value="Lead (8+ yrs)">Lead (8+ years)</SelectItem>
                              <SelectItem value="Executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>No. of Openings</Label>
                          <Input type="number" min="1" placeholder="1" value={form.openings} onChange={(e) => updateForm('openings', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Application Deadline</Label>
                          <Input type="date" value={form.deadline} onChange={(e) => updateForm('deadline', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <Input placeholder="e.g. 6 months, Permanent" value={form.duration} onChange={(e) => updateForm('duration', e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* ── Compensation ── */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Compensation</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Salary Min ($)</Label>
                          <Input placeholder="e.g. 80,000" value={form.salaryMin} onChange={(e) => updateForm('salaryMin', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Salary Max ($)</Label>
                          <Input placeholder="e.g. 120,000" value={form.salaryMax} onChange={(e) => updateForm('salaryMax', e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* ── Skills & Qualifications ── */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Skills & Qualifications</h3>
                      <div className="space-y-2">
                        <Label>Required Skills</Label>
                        {form.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {form.skills.map(skill => (
                              <Badge key={skill} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                {skill}
                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeSkill(skill)} />
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a skill and press Enter..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            className="flex-1"
                          />
                          <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                        </div>
                        <p className="text-xs text-slate-400">Press Enter or comma to add skills</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Education Level</Label>
                        <Select value={form.education} onValueChange={(v) => updateForm('education', v)}>
                          <SelectTrigger><SelectValue placeholder="Select education" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High School Diploma">High School Diploma</SelectItem>
                            <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                            <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                            <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                            <SelectItem value="PhD">PhD / Doctorate</SelectItem>
                            <SelectItem value="Not Required">Not Required</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* ── Job Details ── */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Job Details</h3>
                      <div className="space-y-2">
                        <Label>Job Description <span className="text-red-500">*</span></Label>
                        <Textarea
                          placeholder="Provide a comprehensive overview of the role..."
                          className="min-h-[100px]"
                          value={form.description}
                          onChange={(e) => updateForm('description', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Key Responsibilities</Label>
                        <Textarea
                          placeholder="List the main responsibilities (one per line)..."
                          className="min-h-[80px]"
                          value={form.responsibilities}
                          onChange={(e) => updateForm('responsibilities', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Requirements</Label>
                        <Textarea
                          placeholder="List required qualifications and experience..."
                          className="min-h-[80px]"
                          value={form.requirements}
                          onChange={(e) => updateForm('requirements', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Benefits & Perks</Label>
                        <Textarea
                          placeholder="List benefits offered (health insurance, PTO, etc.)..."
                          className="min-h-[80px]"
                          value={form.benefits}
                          onChange={(e) => updateForm('benefits', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="pt-4 border-t">
                  <Button variant="outline" onClick={() => { setIsPostJobOpen(false); setForm(emptyForm); setSkillInput(''); }}>Cancel</Button>
                  <Button onClick={publishJob} className="bg-purple-600 hover:bg-purple-700 text-white">Publish Position</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-100 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium whitespace-nowrap">Active Jobs</p>
                <h3 className="text-2xl font-bold">{jobs.filter(j => j.status === 'Active').length}</h3>
              </div>
              <div className="ml-auto flex items-center text-xs text-green-600 font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-100 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Candidates</p>
                <h3 className="text-2xl font-bold">248</h3>
              </div>
              <div className="ml-auto flex items-center text-xs text-green-600 font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Interviews</p>
                <h3 className="text-2xl font-bold">15</h3>
              </div>
              <div className="ml-auto flex items-center text-xs text-slate-500">
                Today
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Hired</p>
                <h3 className="text-2xl font-bold">34</h3>
              </div>
              <div className="ml-auto flex items-center text-xs text-slate-400">
                This Year
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Hiring Pipeline</CardTitle>
                <CardDescription>Candidate distribution across stages</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PIPELINE_DATA} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {PIPELINE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest updates in hiring</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {RECENT_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        <span className="text-purple-600">{activity.user}</span> {activity.action} {activity.target}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs gap-2"
                  onClick={() => setActiveTab('candidates')}
                >
                  View All Activity
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-100/80 p-1 border border-slate-200">
            <TabsTrigger value="jobs" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm px-6">
              Job Descriptions
            </TabsTrigger>
            <TabsTrigger value="candidates" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm px-6">
              Candidates
            </TabsTrigger>
            <TabsTrigger value="interviews" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm px-6">
              Interviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-0">
            <JobDescriptionsModule jobs={jobs} onViewApplicants={handleViewApplicants} />
          </TabsContent>

          <TabsContent value="candidates" className="mt-0">
            <CandidatesModule
              filterByJob={selectedJobFilter}
              onScheduleInterview={handleScheduleInterview}
              onClearFilter={handleClearJobFilter}
              jobs={jobs}
            />
          </TabsContent>

          <TabsContent value="interviews" className="mt-0">
            <InterviewScheduleModule
              schedulingFor={schedulingFor}
              onClearScheduling={handleClearScheduling}
              jobs={jobs}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
