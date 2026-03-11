import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  MoreVertical,
  Mail,
  Phone,
  FileText,
  Building,
  MapPin,
  ExternalLink,
  ChevronRight,
  CalendarClock,
  X,
  Eye,
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Job } from './recruitment-dashboard';

interface Props {
  filterByJob: string | null;
  onScheduleInterview: (candidateName: string, position: string) => void;
  onClearFilter: () => void;
  jobs: Job[];
}

const CANDIDATES_DATA = [
  {
    id: 1,
    name: 'Sarah Johnson',
    position: 'Senior Full Stack Developer',
    status: 'Interviewing',
    source: 'LinkedIn',
    experience: '8 years',
    email: 'sarah.j@example.com',
    skills: ['React', 'Node.js', 'AWS']
  },
  {
    id: 2,
    name: 'Michael Chen',
    position: 'Product Manager',
    status: 'Screening',
    source: 'Referral',
    experience: '5 years',
    email: 'm.chen@example.com',
    skills: ['Agile', 'Jira', 'Roadmap']
  },
  {
    id: 3,
    name: 'Emily Davis',
    position: 'UX Designer',
    status: 'Offer Sent',
    source: 'Indeed',
    experience: '4 years',
    email: 'emily.d@example.com',
    skills: ['Figma', 'User Research', 'Testing']
  },
  {
    id: 4,
    name: 'James Wilson',
    position: 'DevOps Engineer',
    status: 'Rejected',
    source: 'Career Site',
    experience: '7 years',
    email: 'james.w@example.com',
    skills: ['Docker', 'K8s', 'Terraform']
  }
];

export default function CandidatesModule({ filterByJob, onScheduleInterview, onClearFilter, jobs }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [isViewCVOpen, setIsViewCVOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<typeof CANDIDATES_DATA[0] | null>(null);
  const [candidates, setCandidates] = useState(CANDIDATES_DATA);
  const { toast } = useToast();

  // New candidate form state
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    source: 'LinkedIn',
    skills: '',
    resume: ''
  });

  const handleAddCandidate = () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.position) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const candidate = {
      id: candidates.length + 1,
      name: newCandidate.name,
      position: newCandidate.position,
      status: 'Screening',
      source: newCandidate.source,
      experience: newCandidate.experience || '0 years',
      email: newCandidate.email,
      skills: newCandidate.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    setCandidates(prev => [...prev, candidate]);
    setIsAddCandidateOpen(false);
    setNewCandidate({
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      source: 'LinkedIn',
      skills: '',
      resume: ''
    });
    
    toast({
      title: "Candidate Added",
      description: `${candidate.name} has been added to the pipeline.`
    });
  };

  const handleViewCV = (candidate: typeof CANDIDATES_DATA[0]) => {
    setSelectedCandidate(candidate);
    setIsViewCVOpen(true);
  };

  const updateStatus = (id: number, status: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSource = sourceFilter === 'all' || c.source.toLowerCase() === sourceFilter.toLowerCase();
    const matchesJob = !filterByJob || c.position.toLowerCase() === filterByJob.toLowerCase();
    return matchesSearch && matchesStatus && matchesSource && matchesJob;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Interviewing': return 'bg-blue-100 text-blue-700';
      case 'Screening': return 'bg-yellow-100 text-yellow-700';
      case 'Offer Sent': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Filter Banner */}
      {filterByJob && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Showing candidates for: <strong>{filterByJob}</strong>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearFilter} className="text-purple-600 hover:text-purple-800 hover:bg-purple-100">
              <X className="h-4 w-4 mr-1" /> Clear Filter
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search candidates by name, skills, position..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer sent">Offer Sent</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="indeed">Indeed</SelectItem>
                  <SelectItem value="career site">Career Site</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => setIsAddCandidateOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Candidate Dialog */}
      <Dialog open={isAddCandidateOpen} onOpenChange={setIsAddCandidateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Candidate</DialogTitle>
            <DialogDescription>Enter candidate details to add them to the pipeline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cand-name">Full Name *</Label>
                <Input 
                  id="cand-name" 
                  placeholder="John Doe"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cand-email">Email *</Label>
                <Input 
                  id="cand-email" 
                  type="email" 
                  placeholder="john@example.com"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cand-phone">Phone</Label>
                <Input 
                  id="cand-phone" 
                  placeholder="+1 555-0100"
                  value={newCandidate.phone}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cand-position">Position Applied *</Label>
                <Select 
                  value={newCandidate.position}
                  onValueChange={(value) => setNewCandidate(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger id="cand-position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.title}>{job.title}</SelectItem>
                    ))}
                    <SelectItem value="Senior Full Stack Developer">Senior Full Stack Developer</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="UX Designer">UX Designer</SelectItem>
                    <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cand-exp">Experience</Label>
                <Select 
                  value={newCandidate.experience}
                  onValueChange={(value) => setNewCandidate(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger id="cand-exp">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1 years">0-1 years</SelectItem>
                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5-7 years">5-7 years</SelectItem>
                    <SelectItem value="7+ years">7+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cand-source">Source</Label>
                <Select 
                  value={newCandidate.source}
                  onValueChange={(value) => setNewCandidate(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger id="cand-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Indeed">Indeed</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Career Site">Career Site</SelectItem>
                    <SelectItem value="Job Fair">Job Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cand-skills">Skills (comma separated)</Label>
              <Input 
                id="cand-skills" 
                placeholder="React, Node.js, TypeScript..."
                value={newCandidate.skills}
                onChange={(e) => setNewCandidate(prev => ({ ...prev, skills: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Resume/CV</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Drag & drop or click to upload</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCandidateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCandidate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View CV Dialog */}
      <Dialog open={isViewCVOpen} onOpenChange={setIsViewCVOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Candidate Profile</DialogTitle>
            <DialogDescription>
              Resume and application details for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-6 py-4">
              {/* Candidate Header */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{selectedCandidate.name}</h3>
                  <p className="text-sm text-slate-600">{selectedCandidate.position}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedCandidate.email}
                    </span>
                    <span>{selectedCandidate.experience}</span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(selectedCandidate.status)} font-semibold border-0`}>
                  {selectedCandidate.status}
                </Badge>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-semibold mb-2">Skills & Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Resume Preview */}
              <div className="border rounded-lg p-6 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Resume/CV</h4>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="bg-white border rounded-lg p-8 text-center">
                  <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">{selectedCandidate.name.replace(' ', '_')}_Resume.pdf</p>
                  <p className="text-sm text-slate-400 mt-1">PDF • 245 KB</p>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Source</p>
                  <p className="font-medium">{selectedCandidate.source}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Applied Date</p>
                  <p className="font-medium">February 5, 2026</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewCVOpen(false)}>
              Close
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                if (selectedCandidate) {
                  onScheduleInterview(selectedCandidate.name, selectedCandidate.position);
                  setIsViewCVOpen(false);
                }
              }}
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-sm transition-shadow group">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {candidate.name}
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Building className="h-3 w-3" /> {candidate.position}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Mail className="h-3.5 w-3.5" />
                    {candidate.email}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Badge variant="outline" className="font-normal">{candidate.experience}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="text-xs text-slate-400 capitalize">Source:</span>
                    <span className="font-medium text-slate-700">{candidate.source}</span>
                  </div>
                  <Badge className={`${getStatusColor(candidate.status)} font-semibold border-0`}>
                    {candidate.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    onClick={() => onScheduleInterview(candidate.name, candidate.position)}
                  >
                    <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                    Schedule Interview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewCV(candidate)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View CV
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateStatus(candidate.id, 'Screening')}>Move to Screening</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(candidate.id, 'Interviewing')}>Move to Interviewing</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(candidate.id, 'Offer Sent')}>Send Offer</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => updateStatus(candidate.id, 'Rejected')}>Reject</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Top Skills:</span>
                <div className="flex gap-2">
                  {candidate.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-slate-50 text-slate-600 text-[10px] px-2 py-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCandidates.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed rounded-lg">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No candidates found</h3>
            <p className="text-slate-500">No candidates match your current filter settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
