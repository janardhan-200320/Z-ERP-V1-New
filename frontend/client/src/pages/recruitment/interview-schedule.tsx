import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  User,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock3,
  AlertCircle,
  CalendarDays,
  Plus,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { Job } from './recruitment-dashboard';

interface Props {
  schedulingFor: { candidate: string; position: string } | null;
  onClearScheduling: () => void;
  jobs: Job[];
}

const INTERVIEWS_DATA = [
  {
    id: 1,
    candidate: 'John Doe',
    position: 'Senior Full Stack Developer',
    date: new Date(2024, 2, 25),
    time: '10:00 AM',
    type: 'Video',
    status: 'Scheduled',
    round: 'Technical',
    feedback: ''
  },
  {
    id: 2,
    candidate: 'Jane Smith',
    position: 'UX Designer',
    date: new Date(2024, 2, 25),
    time: '02:00 PM',
    type: 'Phone',
    status: 'Completed',
    round: 'Initial',
    feedback: ''
  },
  {
    id: 3,
    candidate: 'Robert Wilson',
    position: 'Product Manager',
    date: new Date(2024, 2, 26),
    time: '11:00 AM',
    type: 'Onsite',
    status: 'Scheduled',
    round: 'Cultural Fit',
    feedback: ''
  }
];

export default function InterviewScheduleModule({ schedulingFor, onClearScheduling, jobs }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [interviews, setInterviews] = useState(INTERVIEWS_DATA);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [scheduleNewOpen, setScheduleNewOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<typeof INTERVIEWS_DATA[0] | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  // New interview form
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState('');
  const [newRound, setNewRound] = useState('');
  const { toast } = useToast();

  // Auto-open schedule dialog when navigating from candidates
  useEffect(() => {
    if (schedulingFor) {
      setNewCandidateName(schedulingFor.candidate);
      setNewPosition(schedulingFor.position);
      setNewDate(undefined);
      setNewTime('');
      setNewType('');
      setNewRound('Initial');
      setScheduleNewOpen(true);
      onClearScheduling();
    }
  }, [schedulingFor]);

  const scheduleNewInterview = () => {
    if (!newCandidateName.trim()) {
      toast({ title: 'Missing candidate', description: 'Please enter the candidate name.' });
      return;
    }
    if (!newDate) {
      toast({ title: 'Missing date', description: 'Please select a date.' });
      return;
    }
    if (!newTime.trim()) {
      toast({ title: 'Missing time', description: 'Please enter the time.' });
      return;
    }
    const newInterview = {
      id: Date.now(),
      candidate: newCandidateName,
      position: newPosition || 'Not specified',
      date: newDate,
      time: newTime,
      type: newType || 'Video',
      status: 'Scheduled',
      round: newRound || 'Initial',
      feedback: '',
    };
    setInterviews(prev => [newInterview, ...prev]);
    setScheduleNewOpen(false);
    setNewCandidateName('');
    setNewPosition('');
    setNewDate(undefined);
    setNewTime('');
    setNewType('');
    setNewRound('');
    toast({ title: 'Interview scheduled!', description: `Interview with ${newInterview.candidate} has been scheduled.` });
  };

  const filteredInterviews = interviews.filter(i => {
    const matchesSearch = i.candidate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         i.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !date || format(i.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    return matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200"><Clock3 className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case 'Completed':
        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video className="h-4 w-4 text-purple-500" />;
      case 'Phone': return <Phone className="h-4 w-4 text-blue-500" />;
      default: return <MapPin className="h-4 w-4 text-orange-500" />;
    }
  };

  const openReschedule = (interview: typeof INTERVIEWS_DATA[0]) => {
    setSelectedInterview(interview);
    setRescheduleDate(interview.date);
    setRescheduleTime(interview.time);
    setRescheduleOpen(true);
  };

  const saveReschedule = () => {
    if (!selectedInterview) return;
    setInterviews(prev => prev.map(i => i.id === selectedInterview.id ? { ...i, date: rescheduleDate || i.date, time: rescheduleTime, status: 'Scheduled' } : i));
    setRescheduleOpen(false);
    toast({ title: 'Interview rescheduled', description: 'The interview has been rescheduled.' });
  };

  const openView = (interview: typeof INTERVIEWS_DATA[0]) => {
    setSelectedInterview(interview);
    setViewOpen(true);
  };

  const openFeedback = (interview: typeof INTERVIEWS_DATA[0]) => {
    setSelectedInterview(interview);
    setFeedbackText('');
    setFeedbackOpen(true);
  };

  const saveFeedback = () => {
    if (!selectedInterview) return;
    setInterviews(prev => prev.map(i => i.id === selectedInterview.id ? { ...i, feedback: feedbackText } : i));
    setFeedbackOpen(false);
    toast({ title: 'Feedback added', description: 'Your feedback was saved.' });
  };

  const cancelInterview = (id: number) => {
    setInterviews(prev => prev.map(i => i.id === id ? { ...i, status: 'Cancelled' } : i));
    toast({ title: 'Interview cancelled', description: 'The interview status is now Cancelled.' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search candidates or positions..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog open={scheduleNewOpen} onOpenChange={setScheduleNewOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule New Interview</DialogTitle>
                    <DialogDescription>Book an interview slot for a candidate.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Candidate Name</Label>
                      <Input placeholder="Enter candidate name" value={newCandidateName} onChange={(e) => setNewCandidateName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={newPosition} onValueChange={setNewPosition}>
                        <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                        <SelectContent>
                          {jobs.map(j => (
                            <SelectItem key={j.id} value={j.title}>{j.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={`w-full justify-start text-left font-normal ${!newDate ? 'text-muted-foreground' : ''}`}>
                              <CalendarDays className="h-4 w-4 mr-2" />
                              {newDate ? format(newDate, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={newDate} onSelect={setNewDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Interview Type</Label>
                        <Select value={newType} onValueChange={setNewType}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Video">Video Call</SelectItem>
                            <SelectItem value="Phone">Phone Call</SelectItem>
                            <SelectItem value="Onsite">In Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Round</Label>
                        <Select value={newRound} onValueChange={setNewRound}>
                          <SelectTrigger><SelectValue placeholder="Select round" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Initial">Initial Screening</SelectItem>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="Cultural Fit">Cultural Fit</SelectItem>
                            <SelectItem value="Final">Final Round</SelectItem>
                            <SelectItem value="HR">HR Round</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setScheduleNewOpen(false)}>Cancel</Button>
                    <Button onClick={scheduleNewInterview} className="bg-purple-600 text-white hover:bg-purple-700">Schedule</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={!date ? "text-muted-foreground" : ""}>
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {date ? format(date, "PPP") : "Filter by Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                  {date && (
                    <div className="p-2 border-t text-center">
                      <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>Clear Date</Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredInterviews.map((interview) => (
          <Card key={interview.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{interview.candidate}</h3>
                    <p className="text-sm text-slate-500">{interview.position}  {interview.round} Round</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:flex md:items-center gap-x-8 gap-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                    {format(interview.date, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    {interview.time}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="mr-2">{getTypeIcon(interview.type)}</span>
                    {interview.type}
                  </div>
                  <div>
                    {getStatusBadge(interview.status)}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openReschedule(interview)}>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openView(interview)}>View Candidate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openFeedback(interview)}>Add Feedback</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => cancelInterview(interview.id)}>Cancel Interview</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Interview</DialogTitle>
              <DialogDescription>Select a new date and time.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Calendar mode="single" selected={rescheduleDate} onSelect={setRescheduleDate} />
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} placeholder="e.g. 10:30 AM" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
              <Button onClick={saveReschedule} className="bg-purple-600 text-white">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Candidate Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
              <DialogDescription>Quick view of the candidate and interview.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedInterview ? (
                <div className="space-y-2">
                  <div><span className="font-semibold">Name:</span> {selectedInterview.candidate}</div>
                  <div><span className="font-semibold">Position:</span> {selectedInterview.position}</div>
                  <div><span className="font-semibold">Round:</span> {selectedInterview.round}</div>
                  <div><span className="font-semibold">Date:</span> {format(selectedInterview.date, 'PPP')}</div>
                  <div><span className="font-semibold">Time:</span> {selectedInterview.time}</div>
                  {selectedInterview.feedback && <div><span className="font-semibold">Feedback:</span> {selectedInterview.feedback}</div>}
                </div>
              ) : null}
            </div>
            <DialogFooter>
              <Button onClick={() => setViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Feedback</DialogTitle>
              <DialogDescription>Provide feedback for the interview.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={6} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
              <Button onClick={saveFeedback} className="bg-green-600 text-white">Save Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {filteredInterviews.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed rounded-lg">
            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg text-slate-900 font-semibold mb-1">No interviews found</h3>
            <p className="text-slate-500">No interviews match your search or date filter.</p>
            {date && (
                <Button variant="link" onClick={() => setDate(undefined)} className="mt-2 text-purple-600">
                    View all interviews
                </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
