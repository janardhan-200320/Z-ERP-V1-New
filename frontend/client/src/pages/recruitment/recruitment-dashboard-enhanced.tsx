import { useState, useEffect } from 'react';
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
import { useWorkspace } from '@/contexts/WorkspaceContext';
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
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

// API and Types
import recruitmentApi from '@/lib/recruitment-api';
import { 
  RecruitmentStats,
  EMPLOYMENT_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  JobWithApplicationCount
} from '@/lib/recruitment-types';

// Sub-module components
import JobDescriptionsModule from './job-descriptions';
import InterviewScheduleModule from './interview-schedule';
import CandidatesModule from './candidates';

// Departments list
const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Marketing',
  'Sales',
  'Design',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Success',
  'Legal'
];

interface JobFormData {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  work_mode: string;
  salary_min: string;
  salary_max: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  openings: string;
  duration: string;
  deadline: string;
}

const emptyForm: JobFormData = {
  title: '',
  department: '',
  location: '',
  employment_type: '',
  work_mode: '',
  salary_min: '',
  salary_max: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  skills: [],
  experience: '',
  education: '',
  openings: '1',
  duration: 'Permanent',
  deadline: ''
};

export default function RecruitmentDashboard() {
  const { selectedWorkspace: currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [jobs, setJobs] = useState<JobWithApplicationCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Job posting form state
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<JobFormData>(emptyForm);
  const [skillInput, setSkillInput] = useState('');

  // Communication between tabs
  const [selectedJobFilter, setSelectedJobFilter] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    if (currentWorkspace?.id) {
      loadDashboardData();
    }
  }, [currentWorkspace?.id]);

  const loadDashboardData = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);
      const [statsData, jobsData] = await Promise.all([
        recruitmentApi.getStats(currentWorkspace.id),
        recruitmentApi.getJobs(currentWorkspace.id)
      ]);

      setStats(statsData);
      setJobs(jobsData);
    } catch (error: any) {
      console.error('Error loading recruitment data:', error);
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load recruitment dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: 'Data refreshed',
      description: 'Dashboard data has been updated'
    });
  };

  // Form handlers
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

  const publishJob = async () => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'No workspace selected',
        variant: 'destructive'
      });
      return;
    }

    // Validation
    if (!form.title.trim()) {
      toast({
        title: 'Missing required field',
        description: 'Please provide a job title',
        variant: 'destructive'
      });
      return;
    }
    if (!form.department) {
      toast({
        title: 'Missing required field',
        description: 'Please select a department',
        variant: 'destructive'
      });
      return;
    }
    if (!form.employment_type) {
      toast({
        title: 'Missing required field',
        description: 'Please select employment type',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const newJob = {
        workspace_id: currentWorkspace.id,
        title: form.title.trim(),
        department: form.department,
        location: form.location || 'Not specified',
        employment_type: form.employment_type,
        work_mode: form.work_mode || 'Not specified',
        salary_min: form.salary_min ? parseFloat(form.salary_min) : null,
        salary_max: form.salary_max ? parseFloat(form.salary_max) : null,
        description: form.description,
        responsibilities: form.responsibilities,
        requirements: form.requirements,
        benefits: form.benefits,
        skills: form.skills.length > 0 ? form.skills : null,
        experience: form.experience,
        education: form.education,
        openings: parseInt(form.openings) || 1,
        duration: form.duration,
        deadline: form.deadline || null,
        status: 'Active'
      };

      await recruitmentApi.createJob(newJob);

      toast({
        title: 'Job posted successfully!',
        description: `"${form.title}" has been published and is now live`
      });

      setIsPostJobOpen(false);
      setForm(emptyForm);
      setSkillInput('');
      await loadDashboardData();
      setActiveTab('jobs');
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error posting job',
        description: error.message || 'Failed to create job posting',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pipeline data for chart
  const pipelineData = stats ? [
    { name: 'Screening', value: stats.screening_count, color: '#f59e0b' },
    { name: 'Interviewing', value: stats.interviewing_count, color: '#8b5cf6' },
    { name: 'Offer Sent', value: stats.offer_sent_count, color: '#3b82f6' },
    { name: 'Hired', value: stats.hired_count, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected_count, color: '#ef4444' }
  ] : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recruitment</h1>
            <p className="text-muted-foreground mt-1">
              Manage job postings, candidates, and hiring pipeline
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Post New Job Opening</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create and publish a new job listing
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-150px)] pr-4">
                  <div className="space-y-4 py-2">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground">Basic Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="title">Job Title *</Label>
                          <Input
                            id="title"
                            placeholder="e.g. Senior Full Stack Developer"
                            value={form.title}
                            onChange={(e) => updateForm('title', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="department">Department *</Label>
                          <Select value={form.department} onValueChange={(val) => updateForm('department', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            placeholder="e.g. New York, NY or Remote"
                            value={form.location}
                            onChange={(e) => updateForm('location', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="employment_type">Employment Type *</Label>
                          <Select value={form.employment_type} onValueChange={(val) => updateForm('employment_type', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {EMPLOYMENT_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="work_mode">Work Mode</Label>
                          <Select value={form.work_mode} onValueChange={(val) => updateForm('work_mode', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                              {WORK_MODES.map(mode => (
                                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Compensation */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground">Compensation</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="salary_min">Minimum Salary</Label>
                          <Input
                            id="salary_min"
                            type="number"
                            placeholder="e.g. 100000"
                            value={form.salary_min}
                            onChange={(e) => updateForm('salary_min', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="salary_max">Maximum Salary</Label>
                          <Input
                            id="salary_max"
                            type="number"
                            placeholder="e.g. 150000"
                            value={form.salary_max}
                            onChange={(e) => updateForm('salary_max', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground">Requirements</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="experience">Experience Level</Label>
                          <Select value={form.experience} onValueChange={(val) => updateForm('experience', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {EXPERIENCE_LEVELS.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="education">Education</Label>
                          <Select value={form.education} onValueChange={(val) => updateForm('education', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select education" />
                            </SelectTrigger>
                            <SelectContent>
                              {EDUCATION_LEVELS.map(edu => (
                                <SelectItem key={edu} value={edu}>{edu}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="openings">Number of Openings</Label>
                          <Input
                            id="openings"
                            type="number"
                            min="1"
                            value={form.openings}
                            onChange={(e) => updateForm('openings', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="duration">Duration</Label>
                          <Input
                            id="duration"
                            placeholder="e.g. Permanent, 6 months"
                            value={form.duration}
                            onChange={(e) => updateForm('duration', e.target.value)}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor="deadline">Application Deadline</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={form.deadline}
                            onChange={(e) => updateForm('deadline', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <Label htmlFor="skills">Required Skills</Label>
                      <div className="flex gap-2">
                        <Input
                          id="skills"
                          placeholder="Type a skill and press Enter"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillKeyDown}
                        />
                        <Button type="button" variant="outline" onClick={addSkill}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {form.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.skills.map(skill => (
                            <Badge key={skill} variant="secondary" className="gap-1">
                              {skill}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the role and its impact..."
                          rows={3}
                          value={form.description}
                          onChange={(e) => updateForm('description', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="responsibilities">Key Responsibilities</Label>
                        <Textarea
                          id="responsibilities"
                          placeholder="List main responsibilities (one per line)..."
                          rows={4}
                          value={form.responsibilities}
                          onChange={(e) => updateForm('responsibilities', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea
                          id="requirements"
                          placeholder="List requirements (one per line)..."
                          rows={4}
                          value={form.requirements}
                          onChange={(e) => updateForm('requirements', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="benefits">Benefits & Perks</Label>
                        <Textarea
                          id="benefits"
                          placeholder="List benefits (one per line)..."
                          rows={3}
                          value={form.benefits}
                          onChange={(e) => updateForm('benefits', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPostJobOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={publishJob} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Publish Job
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="h-4 w-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="candidates">
              <Users className="h-4 w-4 mr-2" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="interviews">
              <Calendar className="h-4 w-4 mr-2" />
              Interviews
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.active_jobs || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently hiring
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_applications || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time candidates
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.screening_count || 0) + (stats?.interviewing_count || 0) + (stats?.offer_sent_count || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active candidates
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled Interviews</CardTitle>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.scheduled_interviews || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upcoming meetings
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pipeline Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Pipeline</CardTitle>
                  <CardDescription>Candidate distribution by stage</CardDescription>
                </CardHeader>
                <CardContent>
                  {pipelineData.some(d => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={pipelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {pipelineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mb-2" />
                      <p>No candidates in pipeline yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Job Postings</CardTitle>
                  <CardDescription>Latest open positions</CardDescription>
                </CardHeader>
                <CardContent>
                  {jobs.length > 0 ? (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {jobs.slice(0, 5).map(job => (
                          <div key={job.id} className="flex items-start justify-between pb-3 border-b last:border-0">
                            <div className="space-y-1 flex-1">
                              <p className="font-medium leading-none">{job.title}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{job.department}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {job.application_count || 0} applicants
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <Briefcase className="h-12 w-12 mb-2" />
                      <p>No job postings yet</p>
                      <Button 
                        variant="link" 
                        onClick={() => setIsPostJobOpen(true)}
                        className="mt-2"
                      >
                        Post your first job
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Breakdown</CardTitle>
                <CardDescription>Detailed view of candidate statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{stats?.screening_count || 0}</div>
                    <div className="text-sm text-muted-foreground mt-1">Screening</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats?.interviewing_count || 0}</div>
                    <div className="text-sm text-muted-foreground mt-1">Interviewing</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats?.offer_sent_count || 0}</div>
                    <div className="text-sm text-muted-foreground mt-1">Offer Sent</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats?.hired_count || 0}</div>
                    <div className="text-sm text-muted-foreground mt-1">Hired</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats?.rejected_count || 0}</div>
                    <div className="text-sm text-muted-foreground mt-1">Rejected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <JobDescriptionsModule 
              jobs={jobs as any}
              onViewApplicants={(jobTitle) => {
                setSelectedJobFilter(jobTitle);
                setActiveTab('candidates');
              }}
            />
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates">
            <CandidatesModule 
              filterByJob={selectedJobFilter}
              onScheduleInterview={(candidate, position) => {
                setActiveTab('interviews');
              }}
              onClearFilter={() => setSelectedJobFilter(null)}
              jobs={jobs as any}
            />
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <InterviewScheduleModule 
              schedulingFor={null}
              onClearScheduling={() => {}}
              jobs={jobs as any}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
