import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { useHRM } from '@/contexts/HRMContext';
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
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coffee,
  Download,
  Search,
  Filter,
  MoreVertical,
  ArrowLeft,
  CalendarDays,
  UserCheck,
  Plane,
  History,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Activity,
  Printer,
  FileSpreadsheet,
  Plus,
  Mail,
  FileText
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
import {
  formatHoursFromMs,
  readAttendanceFeed,
  type AttendanceFeedRecord,
} from '@/lib/attendance-reporting';

// Rebuild trigger: Attendance Leave module logic updated.
// Consolidated React imports and fixed missing Lucide icons (Plus).
export default function HRMAttendance() {
  type TodayAttendanceRow = {
    id: string;
    name: string;
    department: string;
    checkIn: string;
    checkOut: string;
    status: 'present' | 'late' | 'leave' | 'absent' | 'halfday';
    hours: string;
    avatar: string;
    workMode: string;
    workLocation: string;
    workStyle: string;
    workDate: string;
    checkInNote?: string;
    checkOutNote?: string;
  };

  type LeaveRequestRow = {
    id: string;
    employee: string;
    type: string;
    from: string;
    to: string;
    days: number;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    avatar: string;
  };

  type DailyAttendanceRecord = {
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'present' | 'late' | 'leave' | 'absent' | 'halfday';
    hours: string;
    notes: string;
    location: string;
  };

  type LeaveHistoryRecord = {
    type: string;
    from: string;
    to: string;
    days: number;
    leaveType: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    location: string;
  };

  type MonthlySummaryRow = {
    id: string;
    name: string;
    department: string;
    present: number;
    absent: number;
    late: number;
    leave: number;
    overtime: string;
    avatar: string;
    email: string;
    joinDate: string;
    dailyAttendance: DailyAttendanceRecord[];
    leaveHistory: LeaveHistoryRecord[];
    performance: {
      punctuality: number;
      productivity: number;
      teamwork: number;
      overall: number;
    };
  };

  type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

  type ShiftDefinition = {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    color: string;
    isCustom?: boolean;
  };

  type RosterRow = {
    employee: string;
    email: string;
  } & Record<DayKey, number>;

  const [, setLocation] = useLocation();
  const { employees } = useHRM();
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isLeaveDetailsModalOpen, setIsLeaveDetailsModalOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequestRow | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [trackerFeed, setTrackerFeed] = useState<AttendanceFeedRecord[]>([]);
  const { toast } = useToast();

  const attendance: TodayAttendanceRow[] = [];

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestRow[]>([]);

  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryRow[]>([]);

  const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const DAY_LABELS: Record<DayKey, string> = {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
  };

  const SHIFT_COLOR_OPTIONS = [
    { label: 'Blue', value: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
    { label: 'Amber', value: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
    { label: 'Indigo', value: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
    { label: 'Slate', value: 'bg-slate-700 text-white', dot: 'bg-slate-600' },
    { label: 'Emerald', value: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    { label: 'Rose', value: 'bg-rose-100 text-rose-700', dot: 'bg-rose-400' },
  ];

  const [shifts, setShifts] = useState<ShiftDefinition[]>([
    { id: 1, name: 'Morning Shift', startTime: '09:00', endTime: '13:00', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Noon Shift', startTime: '13:00', endTime: '17:00', color: 'bg-amber-100 text-amber-700' },
    { id: 3, name: 'Evening Shift', startTime: '17:00', endTime: '22:00', color: 'bg-indigo-100 text-indigo-700' },
    { id: 4, name: 'Night Shift', startTime: '22:00', endTime: '06:00', color: 'bg-slate-700 text-white' },
  ]);

  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStartTime, setNewShiftStartTime] = useState('09:00');
  const [newShiftEndTime, setNewShiftEndTime] = useState('17:00');
  const [newShiftColor, setNewShiftColor] = useState('bg-emerald-100 text-emerald-700');
  const [memberShiftViewDay, setMemberShiftViewDay] = useState<DayKey>('mon');

  const [roster, setRoster] = useState<RosterRow[]>([]);

  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);

  useEffect(() => {
    if (employees.length === 0) {
      setMonthlySummary([]);
      setRoster([]);
      return;
    }

    setMonthlySummary((prev) => {
      if (prev.length > 0) {
        return prev;
      }
      return employees.map((employee) => {
        const name = employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Employee';
        const avatar = name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase() || 'EE';
        const joinDate = employee.date_of_joining || employee.join_date || new Date().toISOString().split('T')[0];

        return {
          id: employee.id,
          name,
          department: employee.department || 'General',
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          overtime: '0h',
          avatar,
          email: employee.email || '',
          joinDate,
          dailyAttendance: [],
          leaveHistory: [],
          performance: {
            punctuality: 0,
            productivity: 0,
            teamwork: 0,
            overall: 0,
          },
        };
      });
    });

    setRoster((prev) => {
      if (prev.length > 0) {
        return prev;
      }
      return employees.map((employee) => {
        const name = employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Employee';
        return {
          employee: name,
          email: employee.email || '',
          mon: 0,
          tue: 0,
          wed: 0,
          thu: 0,
          fri: 0,
          sat: 0,
          sun: 0,
        };
      });
    });
  }, [employees]);

  const formatTimeTo12Hour = (timeValue: string) => {
    const [hourRaw = '0', minuteRaw = '00'] = timeValue.split(':');
    const hourNum = Number(hourRaw);
    const safeHour = Number.isNaN(hourNum) ? 0 : hourNum;
    const period = safeHour >= 12 ? 'PM' : 'AM';
    const hour12 = safeHour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${minuteRaw} ${period}`;
  };

  const formatShiftTime = (startTime: string, endTime: string) => {
    return `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)}`;
  };

  const getShiftById = (shiftId: number) => {
    return shifts.find((shift) => shift.id === shiftId);
  };

  const getShiftShortCode = (shiftName: string) => {
    return shiftName
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const updateShiftDefinition = (shiftId: number, updates: Partial<ShiftDefinition>) => {
    setShifts((prev) => prev.map((shift) => (
      shift.id === shiftId ? { ...shift, ...updates } : shift
    )));
  };

  const addCustomShift = () => {
    if (!newShiftName.trim()) {
      toast({
        title: 'Shift Name Required',
        description: 'Please enter a custom shift name before adding.',
        variant: 'destructive',
      });
      return;
    }

    if (newShiftStartTime === newShiftEndTime) {
      toast({
        title: 'Invalid Shift Time',
        description: 'Start time and end time cannot be the same.',
        variant: 'destructive',
      });
      return;
    }

    const nextShiftId = shifts.length ? Math.max(...shifts.map((shift) => shift.id)) + 1 : 1;
    setShifts((prev) => [
      ...prev,
      {
        id: nextShiftId,
        name: newShiftName.trim(),
        startTime: newShiftStartTime,
        endTime: newShiftEndTime,
        color: newShiftColor,
        isCustom: true,
      },
    ]);

    setNewShiftName('');
    setNewShiftStartTime('09:00');
    setNewShiftEndTime('17:00');
    setNewShiftColor('bg-emerald-100 text-emerald-700');

    toast({
      title: 'Custom Shift Added',
      description: 'New custom shift has been added and is ready for assignment.',
    });
  };

  const removeCustomShift = (shiftId: number) => {
    const shiftToRemove = getShiftById(shiftId);
    if (!shiftToRemove || !shiftToRemove.isCustom) {
      return;
    }

    setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));
    setRoster((prev) => prev.map((member) => {
      const updated: RosterRow = { ...member };
      DAY_KEYS.forEach((day) => {
        if (updated[day] === shiftId) {
          updated[day] = 0;
        }
      });
      return updated;
    }));

    toast({
      title: 'Custom Shift Removed',
      description: `${shiftToRemove.name} was removed and related assignments moved to Day Off.`,
    });
  };

  const handleMonthChange = (month: string) => {
    toast({ title: 'Attendance Summary', description: `No monthly data loaded for ${month.toUpperCase()} yet.` });
  };

  // Handle viewing employee details
  const handleViewDetails = async (employee: any) => {
    const loadingKey = `details_${employee.id}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setSelectedEmployee(employee);
      setIsDetailsModalOpen(true);
      
      toast({
        title: "Details Loaded",
        description: `Attendance details for ${employee.name} have been loaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load employee details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Handle viewing employee timesheet
  const handleViewTimesheet = async (employee: any) => {
    const loadingKey = `timesheet_${employee.id}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setSelectedEmployee(employee);
      setIsTimesheetModalOpen(true);
      
      toast({
        title: "Timesheet Loaded",
        description: `Timesheet for ${employee.name} has been loaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load timesheet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleAssignShift = async (empName: string, day: DayKey, shiftId: number) => {
    const loadingKey = `shift-${empName}-${day}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setRoster((prev) => prev.map((member) => (
        member.employee === empName ? { ...member, [day]: shiftId } : member
      )));
      
      const shiftName = shiftId === 0 ? 'Day Off' : getShiftById(shiftId)?.name || 'Unknown';
      toast({ 
        title: "Shift Assignment Updated!", 
        description: `${empName}'s ${DAY_LABELS[day]} shift changed to ${shiftName}.` 
      });
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to update shift assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleBulkAssignShift = async (assignments: { employee: string; shifts: Partial<Record<DayKey, number>> }[]) => {
    setLoadingStates(prev => ({ ...prev, 'bulk-assign': true }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRoster(prev => prev.map(r => {
        const assignment = assignments.find(a => a.employee === r.employee);
        if (assignment) {
          return { ...r, ...assignment.shifts };
        }
        return r;
      }));
      
      toast({
        title: "Bulk Assignment Complete!",
        description: `Successfully updated shift assignments for ${assignments.length} employee(s).`
      });
      
      setIsShiftDialogOpen(false);
    } catch (error) {
      toast({
        title: "Bulk Assignment Failed",
        description: "Failed to update shift assignments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, 'bulk-assign': false }));
    }
  };

  const [bulkShiftAssignments, setBulkShiftAssignments] = useState<Record<string, Partial<Record<DayKey, number>>>>({});

  const membersByShiftForSelectedDay = useMemo(() => {
    const grouped = shifts.map((shift) => ({
      key: `shift-${shift.id}`,
      name: shift.name,
      time: formatShiftTime(shift.startTime, shift.endTime),
      color: shift.color,
      members: roster.filter((member) => member[memberShiftViewDay] === shift.id),
    }));

    grouped.push({
      key: 'day-off',
      name: 'Day Off',
      time: 'No shift assigned',
      color: 'bg-slate-100 text-slate-700',
      members: roster.filter((member) => member[memberShiftViewDay] === 0),
    });

    return grouped;
  }, [memberShiftViewDay, roster, shifts]);

  const handleSendShiftNotification = (employee: string) => {
    const member = roster.find((record) => record.employee === employee);
    if (!member) {
      return;
    }

    const subject = encodeURIComponent(`Weekly Shift Schedule - ${member.employee}`);
    const body = encodeURIComponent(
      `Hello ${member.employee},\n\nYour weekly shift schedule has been updated.\n\n${DAY_KEYS.map((day) => {
        const shiftId = member[day];
        const shift = getShiftById(shiftId);
        const shiftLabel = shift
          ? `${shift.name} (${formatShiftTime(shift.startTime, shift.endTime)})`
          : 'Day Off';
        return `${DAY_LABELS[day]}: ${shiftLabel}`;
      }).join('\n')}\n\nRegards,\nHR Team`
    );

    window.open(`mailto:${member.email}?subject=${subject}&body=${body}`, '_blank');
    toast({
      title: 'Mail Draft Opened',
      description: `Email draft opened for ${member.employee}.`,
    });
  };

  const handleNotifyAllScheduledMembers = () => {
    const recipients = roster.filter((member) => DAY_KEYS.some((day) => member[day] !== 0));
    if (recipients.length === 0) {
      toast({
        title: 'No Scheduled Members',
        description: 'Assign at least one shift before sending notifications.',
        variant: 'destructive',
      });
      return;
    }

    const recipientEmails = recipients.map((member) => member.email).join(',');
    const subject = encodeURIComponent('Weekly Shift Schedule Notification');
    const body = encodeURIComponent('Hello Team,\n\nYour weekly shift schedule has been updated. Please review your assigned shifts in the HRM portal.\n\nRegards,\nHR Team');

    window.open(`mailto:?bcc=${recipientEmails}&subject=${subject}&body=${body}`, '_blank');
    toast({
      title: 'Bulk Mail Draft Opened',
      description: `Email draft prepared for ${recipients.length} member(s).`,
    });
  };

  const handleApproveLeave = async (requestId: string) => {
    const loadingKey = `approve-${requestId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLeaveRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'approved' }
          : request
      ));
      
      toast({
        title: "Leave Request Approved!",
        description: "The leave request has been successfully approved and the employee will be notified.",
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve leave request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleRejectLeave = async (requestId: string) => {
    const loadingKey = `reject-${requestId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLeaveRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' }
          : request
      ));
      
      toast({
        title: "Leave Request Rejected",
        description: "The leave request has been rejected and the employee will be notified with feedback.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject leave request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
    present: { label: 'Present', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    absent: { label: 'Absent', class: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
    late: { label: 'Late', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    leave: { label: 'On Leave', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: Plane },
    halfday: { label: 'Half Day', class: 'bg-violet-100 text-violet-700 border-violet-200', icon: Coffee }
  };

  const leaveStatusConfig: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pending Approval', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    approved: { label: 'Approved', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', class: 'bg-rose-100 text-rose-700 border-rose-200' }
  };

  useEffect(() => {
    const syncFeed = () => {
      setTrackerFeed(readAttendanceFeed());
    };

    syncFeed();
    window.addEventListener('storage', syncFeed);
    window.addEventListener('focus', syncFeed);

    return () => {
      window.removeEventListener('storage', syncFeed);
      window.removeEventListener('focus', syncFeed);
    };
  }, []);

  const trackerAttendanceRows = useMemo<TodayAttendanceRow[]>(() => {
    const todayKey = new Date().toLocaleDateString('en-CA');

    return trackerFeed
      .filter((record) => record.date === todayKey)
      .map((record) => {
        const checkInAt = new Date(record.checkInAt);
        const checkOutAt = record.checkOutAt ? new Date(record.checkOutAt) : null;
        const checkInLabel = checkInAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const checkOutLabel = checkOutAt
          ? checkOutAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '-';
        const avatarParts = record.employeeName.split(' ').filter(Boolean);
        const avatar = avatarParts.length > 1
          ? `${avatarParts[0][0]}${avatarParts[1][0]}`
          : (avatarParts[0]?.slice(0, 2) || 'CU').toUpperCase();

        return {
          id: record.employeeId,
          name: record.employeeName,
          department: record.department || 'General',
          checkIn: checkInLabel,
          checkOut: checkOutLabel,
          status: 'present',
          hours: formatHoursFromMs(record.workDurationMs),
          avatar,
          workMode: record.workModeLabel,
          workLocation: record.workLocationLabel,
          workStyle: record.workStyleLabel,
          workDate: record.date,
          checkInNote: record.checkInNote,
          checkOutNote: record.checkOutNote,
        };
      });
  }, [trackerFeed]);

  const combinedAttendance = useMemo<TodayAttendanceRow[]>(() => {
    const merged = [...trackerAttendanceRows];
    const takenIds = new Set(trackerAttendanceRows.map((row) => row.id));

    attendance.forEach((row) => {
      if (!takenIds.has(row.id)) {
        merged.push(row);
      }
    });

    return merged;
  }, [attendance, trackerAttendanceRows]);

  const filteredAttendance = useMemo(() => {
    return combinedAttendance.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.workMode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.workLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, combinedAttendance]);

  const pendingLeaveRequests = useMemo(() => {
    return leaveRequests.filter((request) => request.status === 'pending');
  }, [leaveRequests]);

  const selectedEmployeePendingLeaves = useMemo(() => {
    if (!selectedLeaveRequest) {
      return [];
    }
    return leaveRequests.filter((request) => (
      request.status === 'pending' && request.employee === selectedLeaveRequest.employee
    ));
  }, [leaveRequests, selectedLeaveRequest]);

  const todayStats = useMemo(() => {
    const present = combinedAttendance.filter((row) => row.status === 'present').length;
    const late = combinedAttendance.filter((row) => row.status === 'late').length;
    const leave = combinedAttendance.filter((row) => row.status === 'leave').length;
    const absent = combinedAttendance.filter((row) => row.status === 'absent').length;

    return { present, late, leave, absent, total: combinedAttendance.length };
  }, [combinedAttendance]);

  const workModeBreakdown = useMemo(() => {
    const source = filteredAttendance;
    return {
      office: source.filter((row) => row.workMode === 'Office').length,
      wfh: source.filter((row) => row.workMode === 'Work From Home').length,
      remote: source.filter((row) => row.workMode === 'Remote').length,
      field: source.filter((row) => row.workMode === 'Field Work').length,
    };
  }, [filteredAttendance]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({ title: "Exporting...", description: `Preparing attendance report in ${type.toUpperCase()}.` });

    setTimeout(() => {
      if (type === 'excel') {
        const data = activeTab === 'today'
          ? combinedAttendance.map((row) => ({
              employee_id: row.id,
              employee_name: row.name,
              department: row.department,
              work_date: row.workDate,
              check_in: row.checkIn,
              check_out: row.checkOut,
              hours: row.hours,
              work_mode: row.workMode,
              work_location: row.workLocation,
              work_style: row.workStyle,
              status: row.status,
              check_in_note: row.checkInNote || '-',
              check_out_note: row.checkOutNote || '-',
            }))
          : leaveRequests;
        exportToExcel(data, `HRM_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        const doc = new jsPDF();
        doc.text(`HRM Report - ${new Date().toLocaleDateString()}`, 14, 15);
        if (activeTab === 'today') {
          autoTable(doc, {
            startY: 25,
            head: [['ID', 'Employee', 'Department', 'Date', 'Check In', 'Check Out', 'Hours', 'Work Mode', 'Where', 'How', 'Status']],
            body: combinedAttendance.map((a) => [
              a.id,
              a.name,
              a.department,
              a.workDate,
              a.checkIn,
              a.checkOut,
              a.hours,
              a.workMode,
              a.workLocation,
              a.workStyle,
              a.status,
            ]),
          });
        } else {
          autoTable(doc, {
            startY: 25,
            head: [['ID', 'Employee', 'Type', 'From', 'To', 'Days', 'Status']],
            body: leaveRequests.map(l => [l.id, l.employee, l.type, l.from, l.to, l.days, l.status]),
          });
        }
        doc.save(`HRM_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      setIsExporting(false);
      toast({ title: "Export Ready", description: "Your report has been downloaded." });
    }, 1200);
  };

  const handleOpenLeaveDetails = (request: LeaveRequestRow) => {
    setSelectedLeaveRequest(request);
    setIsLeaveDetailsModalOpen(true);
  };

  const handleExportLeaveRequestPdf = (request: LeaveRequestRow) => {
    try {
      const doc = new jsPDF();
      const fromDate = new Date(request.from).toLocaleDateString();
      const toDate = new Date(request.to).toLocaleDateString();

      doc.setFontSize(16);
      doc.text('Leave Request Details', 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [['Field', 'Value']],
        body: [
          ['Request ID', request.id],
          ['Employee', request.employee],
          ['Leave Type', request.type],
          ['From Date', fromDate],
          ['To Date', toDate],
          ['Total Days', String(request.days)],
          ['Status', leaveStatusConfig[request.status].label],
          ['Reason', request.reason || 'Not provided'],
        ],
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: [37, 99, 235] },
        theme: 'striped',
      });

      const allPendingRows = pendingLeaveRequests.map((leave) => [
        leave.id,
        leave.employee,
        leave.type,
        `${new Date(leave.from).toLocaleDateString()} - ${new Date(leave.to).toLocaleDateString()}`,
        String(leave.days),
      ]);

      if (allPendingRows.length > 0) {
        const nextY = ((doc as any).lastAutoTable?.finalY || 40) + 8;
        doc.setFontSize(12);
        doc.setTextColor(30);
        doc.text('Pending Leave Requests Snapshot', 14, nextY);

        autoTable(doc, {
          startY: nextY + 3,
          head: [['ID', 'Employee', 'Type', 'Duration', 'Days']],
          body: allPendingRows,
          styles: { fontSize: 8.5, cellPadding: 2 },
          headStyles: { fillColor: [245, 158, 11] },
          theme: 'grid',
        });
      }

      doc.save(`Leave_Request_${request.id}.pdf`);
      toast({
        title: 'PDF Downloaded',
        description: `Leave request PDF for ${request.employee} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: 'PDF Export Failed',
        description: 'Unable to generate leave request PDF. Please try again.',
        variant: 'destructive',
      });
    }
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
                <div className="p-2.5 bg-emerald-600/10 rounded-xl">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance & Leave</h1>
                  <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                    <Activity className="h-3.5 w-3.5" />
                    Real-time workforce monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold shadow-sm">
                    <Download className="h-4 w-4 mr-2 text-slate-500" />
                    <span>Generate Report</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                    Attendance Matrix (Excel)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
                    <Printer className="h-4 w-4 mr-2 text-rose-600" />
                    Summary PDF Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <StatCard
            title="Present Today"
            value={todayStats.present.toString()}
            icon={<UserCheck />}
            color="emerald"
            sub={`${todayStats.total ? Math.round((todayStats.present / todayStats.total) * 100) : 0}% attendance rate`}
          />
          <StatCard
            title="Absent"
            value={todayStats.absent.toString()}
            icon={<XCircle />}
            color="rose"
            sub="Missing check-ins"
            trend={todayStats.absent > 0 ? 'up' : 'none'}
          />
          <StatCard
            title="On Leave"
            value={todayStats.leave.toString()}
            icon={<Coffee />}
            color="blue"
            sub="Approved leave status"
          />
          <StatCard
            title="Late Arrivals"
            value={todayStats.late.toString()}
            icon={<Clock />}
            color="amber"
            sub="Post shift-start logins"
            trend={todayStats.late > 0 ? 'up' : 'none'}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger 
                value="today" 
                className={cn(
                  "px-6 py-2.5 rounded-xl transition-all font-bold",
                  activeTab === 'today' ? "bg-white text-emerald-600 shadow-sm border border-emerald-100/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Today's Feed
              </TabsTrigger>
              <TabsTrigger 
                value="monthly" 
                className={cn(
                  "px-6 py-2.5 rounded-xl transition-all font-bold",
                  activeTab === 'monthly' ? "bg-white text-blue-600 shadow-sm border border-blue-100/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Monthly Summary
              </TabsTrigger>
              <TabsTrigger 
                value="leave" 
                className={cn(
                  "px-6 py-2.5 rounded-xl transition-all font-bold",
                  activeTab === 'leave' ? "bg-white text-blue-600 shadow-sm border border-blue-100/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Leave Requests
              </TabsTrigger>
              <TabsTrigger 
                value="shift" 
                className={cn(
                  "px-6 py-2.5 rounded-xl transition-all font-bold",
                  activeTab === 'shift' ? "bg-white text-violet-600 shadow-sm border border-violet-100/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Shift Roster
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 px-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-[240px] bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <TabsContent value="today" className="mt-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Office</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{workModeBreakdown.office}</p>
                  <p className="text-[11px] text-slate-500">Onsite workforce</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">WFH</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{workModeBreakdown.wfh}</p>
                  <p className="text-[11px] text-slate-500">Home setup users</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Remote</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{workModeBreakdown.remote}</p>
                  <p className="text-[11px] text-slate-500">Flexible locations</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Field Work</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{workModeBreakdown.field}</p>
                  <p className="text-[11px] text-slate-500">Client/site visits</p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Attendance Log</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-3">Live Feed</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                    <TableHead className="w-[280px] font-bold text-slate-700">Team Member</TableHead>
                    <TableHead className="font-bold text-slate-700">Department</TableHead>
                    <TableHead className="font-bold text-slate-700">Date</TableHead>
                    <TableHead className="font-bold text-slate-700">Check In</TableHead>
                    <TableHead className="font-bold text-slate-700">Check Out</TableHead>
                    <TableHead className="font-bold text-slate-700">Duration</TableHead>
                    <TableHead className="font-bold text-slate-700">Work Mode</TableHead>
                    <TableHead className="font-bold text-slate-700">Where</TableHead>
                    <TableHead className="font-bold text-slate-700">How</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((row) => (
                    <TableRow key={row.id} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-200 group-hover:scale-110 transition-transform">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold">{row.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900">{row.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{row.department}</TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-slate-600">
                          {new Date(row.workDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          {row.checkIn}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-400">{row.checkOut}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-100 text-slate-600 border-none font-bold">
                          {row.hours}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                          {row.workMode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-slate-600 max-w-[170px]">{row.workLocation}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-none font-bold">
                          {row.workStyle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-lg px-2.5 py-1 border font-bold text-[10px] uppercase tracking-wider", statusConfig[row.status].class)}>
                          <div className="flex items-center gap-1.5">
                            {React.createElement(statusConfig[row.status].icon, { className: "h-3 w-3" })}
                            {statusConfig[row.status].label}
                          </div>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="mt-6 space-y-4">
            <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="font-bold text-slate-700">Requester</TableHead>
                    <TableHead className="font-bold text-slate-700">Type</TableHead>
                    <TableHead className="font-bold text-slate-700">Duration</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                    <TableHead className="font-bold text-slate-700">Documents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id} className="group hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.employee}`} />
                            <AvatarFallback>{request.avatar}</AvatarFallback>
                          </Avatar>
                          <p className="font-bold text-slate-900">{request.employee}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                          <Plane className="h-4 w-4 text-indigo-500" />
                          {request.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700">{new Date(request.from).toLocaleDateString()} - {new Date(request.to).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{request.days} Days Total</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-full px-3 py-1 border font-bold text-[10px] uppercase", leaveStatusConfig[request.status].class)}>
                          {leaveStatusConfig[request.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col sm:flex-row justify-end gap-1.5 sm:gap-2">
                          {request.status === 'pending' ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-full sm:w-auto rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleApproveLeave(request.id)}
                                disabled={loadingStates[`approve-${request.id}`] || loadingStates[`reject-${request.id}`]}
                              >
                                {loadingStates[`approve-${request.id}`] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-600 mr-1" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-full sm:w-auto rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleRejectLeave(request.id)}
                                disabled={loadingStates[`approve-${request.id}`] || loadingStates[`reject-${request.id}`]}
                              >
                                {loadingStates[`reject-${request.id}`] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-rose-600 mr-1" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Badge className={cn("rounded-full px-3 py-1 border font-bold text-[10px] uppercase", leaveStatusConfig[request.status].class)}>
                                {request.status === 'approved' ? '✓ Processed' : '✗ Declined'}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-all">
                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-slate-200">
                                  <DropdownMenuLabel className="font-bold text-xs text-slate-500 uppercase tracking-wider px-3">Quick Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                  <DropdownMenuItem 
                                    className="rounded-lg font-medium py-2.5 cursor-pointer hover:bg-blue-50 text-blue-600"
                                    onClick={() => {
                                      toast({ 
                                        title: "Email Sent Successfully", 
                                        description: `Leave ${request.status} notification email sent to ${request.employee}.`,
                                      });
                                    }}
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send via Mail
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                  <DropdownMenuItem 
                                    className="rounded-lg font-medium py-2.5 cursor-pointer hover:bg-amber-50 text-amber-600"
                                    onClick={() => {
                                      setLeaveRequests(prev => prev.map(req => 
                                        req.id === request.id ? { ...req, status: 'pending' } : req
                                      ));
                                      toast({ 
                                        title: "Status Reset", 
                                        description: `Leave request for ${request.employee} moved back to pending status.` 
                                      });
                                    }}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Reset to Pending
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-all hover:scale-105 active:scale-95"
                          onClick={() => handleOpenLeaveDetails(request)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Attendance Summary</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Current Month: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <Select defaultValue="june" onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-[140px] rounded-xl h-9">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="june">June 2025</SelectItem>
                    <SelectItem value="may">May 2025</SelectItem>
                    <SelectItem value="april">April 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="font-bold text-slate-700">Employee</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Present</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Absent</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Late</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">On Leave</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Overtime</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySummary.map((row, i) => (
                    <TableRow key={i} className="group hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`} />
                            <AvatarFallback>{row.avatar}</AvatarFallback>
                          </Avatar>
                          <p className="font-bold text-slate-900">{row.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-600">{row.present}</TableCell>
                      <TableCell className="text-center font-bold text-rose-600">{row.absent}</TableCell>
                      <TableCell className="text-center font-bold text-amber-600">{row.late}</TableCell>
                      <TableCell className="text-center font-bold text-blue-600">{row.leave}</TableCell>
                      <TableCell className="text-center font-bold text-slate-600">{row.overtime}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(row)}
                            disabled={loadingStates[`details_${row.id}`]}
                            className="h-8 rounded-lg font-bold text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                          >
                            {loadingStates[`details_${row.id}`] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2" />
                            ) : (
                              <Activity className="h-3 w-3 mr-2" />
                            )}
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewTimesheet(row)}
                            disabled={loadingStates[`timesheet_${row.id}`]}
                            className="h-8 rounded-lg font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                          >
                            {loadingStates[`timesheet_${row.id}`] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-600 mr-2" />
                            ) : (
                              <FileSpreadsheet className="h-3 w-3 mr-2" />
                            )}
                            <span className="hidden sm:inline">Timesheet</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="shift" className="mt-6">
            <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900">Weekly Shift Roster</h3>
                  <div className="flex flex-wrap gap-2">
                    {shifts.map((shift) => (
                      <Badge key={shift.id} className={cn('rounded-md text-[10px] px-2 py-0.5 border-none', shift.color)}>
                        {shift.name}: {formatShiftTime(shift.startTime, shift.endTime)}
                      </Badge>
                    ))}
                    <Badge className="rounded-md text-[10px] px-2 py-0.5 border-none bg-slate-100 text-slate-700">Day Off</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 font-bold hover:bg-slate-50 transition-all active:scale-95"
                    onClick={handleNotifyAllScheduledMembers}
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Notify Members
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 font-bold hover:bg-slate-50 transition-all active:scale-95"
                    onClick={() => setIsShiftDialogOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Bulk & Setup
                  </Button>
                </div>
              </div>

              <div className="p-5 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-bold text-slate-800">Members By Shift</h4>
                  <Select value={memberShiftViewDay} onValueChange={(value) => setMemberShiftViewDay(value as DayKey)}>
                    <SelectTrigger className="w-[140px] rounded-xl h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {DAY_KEYS.map((day) => (
                        <SelectItem key={day} value={day}>{DAY_LABELS[day]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {membersByShiftForSelectedDay.map((group) => (
                    <div key={group.key} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <Badge className={cn('rounded-md border-none text-[10px] font-bold', group.color)}>{group.name}</Badge>
                        <span className="text-xs font-bold text-slate-500">{group.members.length} member(s)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{group.time}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.members.length === 0 ? (
                          <span className="text-[11px] text-slate-400">No members</span>
                        ) : (
                          group.members.map((member) => (
                            <Badge key={`${group.key}-${member.employee}`} variant="outline" className="text-[10px]">
                              {member.employee}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="font-bold text-slate-700">Employee</TableHead>
                    <TableHead className="font-bold text-slate-700">Email</TableHead>
                    {DAY_KEYS.map((day) => (
                      <TableHead key={day} className="font-bold text-slate-700 text-center">{DAY_LABELS[day]}</TableHead>
                    ))}
                    <TableHead className="font-bold text-slate-700 text-center">Notify</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((row, i) => (
                    <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-700">{row.employee}</TableCell>
                      <TableCell className="text-xs text-slate-600">{row.email}</TableCell>
                      {DAY_KEYS.map((dayKey) => {
                        const shiftId = row[dayKey];
                        const loadingKey = `shift-${row.employee}-${dayKey}`;
                        const assignedShift = getShiftById(shiftId);

                        return (
                          <TableCell key={dayKey} className="text-center p-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="cursor-pointer relative">
                                  {loadingStates[loadingKey] ? (
                                    <div className="flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                                    </div>
                                  ) : shiftId === 0 ? (
                                    <span className="text-[10px] text-slate-400 font-bold hover:text-slate-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100">OFF</span>
                                  ) : (
                                    <Badge className={cn('rounded-lg text-[10px] font-black hover:scale-110 transition-all cursor-pointer px-2 py-1', assignedShift?.color || 'bg-slate-100 text-slate-700')}>
                                      {assignedShift ? getShiftShortCode(assignedShift.name) : 'NA'}
                                    </Badge>
                                  )}
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="rounded-xl p-2 shadow-xl border-slate-200">
                                <DropdownMenuLabel className="font-bold text-xs text-slate-500 uppercase tracking-wider px-3">
                                  Assign Shift - {DAY_LABELS[dayKey]}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                <DropdownMenuItem
                                  className="rounded-lg font-medium py-2.5 cursor-pointer hover:bg-slate-50"
                                  onClick={() => handleAssignShift(row.employee, dayKey, 0)}
                                  disabled={loadingStates[loadingKey]}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                    <span className="text-xs font-bold text-slate-500">Day Off</span>
                                  </div>
                                </DropdownMenuItem>
                                {shifts.map((shift) => (
                                  <DropdownMenuItem
                                    key={shift.id}
                                    className="rounded-lg font-medium py-2.5 cursor-pointer hover:bg-slate-50"
                                    onClick={() => handleAssignShift(row.employee, dayKey, shift.id)}
                                    disabled={loadingStates[loadingKey]}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge className={cn('rounded-md text-[10px] border-none', shift.color)}>
                                        {getShiftShortCode(shift.name)}
                                      </Badge>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold">{shift.name}</span>
                                        <span className="text-[10px] text-slate-400">{formatShiftTime(shift.startTime, shift.endTime)}</span>
                                      </div>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleSendShiftNotification(row.employee)}
                        >
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          Mail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Employee Attendance Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Attendance Details - {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Comprehensive attendance summary for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6 py-4">
              {/* Employee Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <Avatar className="h-16 w-16 border-3 border-white shadow-lg">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmployee.name}`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg font-bold">
                    {selectedEmployee.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h3>
                  <p className="text-slate-600 font-medium">{selectedEmployee.department}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined: {new Date(selectedEmployee.joinDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3" />
                      {selectedEmployee.email}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1.5 font-bold text-center">
                    ID: {selectedEmployee.id}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase">Present</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">{selectedEmployee.present}</div>
                  <div className="text-xs text-emerald-600">Days this month</div>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="flex items-center justify-between mb-2">
                    <XCircle className="h-5 w-5 text-rose-600" />
                    <span className="text-xs font-bold text-rose-600 uppercase">Absent</span>
                  </div>
                  <div className="text-2xl font-black text-rose-700">{selectedEmployee.absent}</div>
                  <div className="text-xs text-rose-600">Days this month</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-xs font-bold text-amber-600 uppercase">Late</span>
                  </div>
                  <div className="text-2xl font-black text-amber-700">{selectedEmployee.late}</div>
                  <div className="text-xs text-amber-600">Times this month</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Coffee className="h-5 w-5 text-purple-600" />
                    <span className="text-xs font-bold text-purple-600 uppercase">Overtime</span>
                  </div>
                  <div className="text-2xl font-black text-purple-700">{selectedEmployee.overtime}</div>
                  <div className="text-xs text-purple-600">This month</div>
                </div>
              </div>

              {/* Tabbed Detailed Information */}
              <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 rounded-2xl p-1">
                  <TabsTrigger value="daily" className="rounded-xl text-sm font-bold">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Daily Records
                  </TabsTrigger>
                  <TabsTrigger value="leaves" className="rounded-xl text-sm font-bold">
                    <Plane className="h-4 w-4 mr-2" />
                    Leave History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="mt-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-slate-800">Recent Daily Attendance</h4>
                    <div className="space-y-2">
                      {selectedEmployee.dailyAttendance.map((record: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                            record.status === 'present' ? 'bg-emerald-50 border-emerald-200' :
                            record.status === 'late' ? 'bg-amber-50 border-amber-200' :
                            record.status === 'absent' ? 'bg-rose-50 border-rose-200' :
                            'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="mb-3 sm:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-1.5 rounded-lg ${
                                record.status === 'present' ? 'bg-emerald-100' :
                                record.status === 'late' ? 'bg-amber-100' :
                                record.status === 'absent' ? 'bg-rose-100' :
                                'bg-blue-100'
                              }`}>
                                {record.status === 'present' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                                {record.status === 'late' && <Clock className="h-4 w-4 text-amber-600" />}
                                {record.status === 'absent' && <XCircle className="h-4 w-4 text-rose-600" />}
                                {record.status === 'leave' && <Plane className="h-4 w-4 text-blue-600" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">
                                  {new Date(record.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                <p className="text-xs text-slate-600">{record.notes}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                              <span className="font-medium text-slate-700">
                                {record.checkIn} - {record.checkOut}
                              </span>
                              <Badge className={`text-xs font-bold ${
                                record.status === 'present' ? 'bg-emerald-200 text-emerald-700' :
                                record.status === 'late' ? 'bg-amber-200 text-amber-700' :
                                record.status === 'absent' ? 'bg-rose-200 text-rose-700' :
                                'bg-blue-200 text-blue-700'
                              }`}>
                                {record.hours}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="leaves" className="mt-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-slate-800">Leave History</h4>
                    {selectedEmployee.leaveHistory.length > 0 ? (
                      <div className="space-y-3">
                        {selectedEmployee.leaveHistory.map((leave: any, idx: number) => (
                          <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-blue-200 text-blue-700 text-xs font-bold">
                                    {leave.type}
                                  </Badge>
                                  <Badge className={`text-xs font-bold ${
                                    leave.status === 'approved' ? 'bg-emerald-200 text-emerald-700' :
                                    leave.status === 'pending' ? 'bg-amber-200 text-amber-700' :
                                    'bg-rose-200 text-rose-700'
                                  }`}>
                                    {leave.status.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm font-bold text-slate-800">
                                  {new Date(leave.from).toLocaleDateString()} - {new Date(leave.to).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">{leave.reason}</p>
                              </div>
                              <div className="text-right mt-3 sm:mt-0">
                                <div className="text-lg font-bold text-blue-700">{leave.days}</div>
                                <div className="text-xs text-blue-600">Days</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Plane className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-sm font-medium">No leave records found</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} className="rounded-lg">
              Close
            </Button>
            <Button 
              onClick={() => {
                // Generate PDF report functionality can be added here
                toast({
                  title: "Report Generated",
                  description: `Attendance report for ${selectedEmployee?.name} has been downloaded.`,
                });
              }}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Request Details Modal */}
      <Dialog open={isLeaveDetailsModalOpen} onOpenChange={setIsLeaveDetailsModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Leave Request Details
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Complete leave request information with pending request context.
            </DialogDescription>
          </DialogHeader>

          {selectedLeaveRequest && (
            <div className="space-y-6 py-4">
              <div className="p-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-white shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLeaveRequest.employee}`} />
                      <AvatarFallback className="bg-blue-600 text-white font-bold">{selectedLeaveRequest.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{selectedLeaveRequest.employee}</p>
                      <p className="text-sm text-slate-600">Request ID: {selectedLeaveRequest.id}</p>
                    </div>
                  </div>
                  <Badge className={cn('rounded-full px-3 py-1 border font-bold text-[11px] uppercase', leaveStatusConfig[selectedLeaveRequest.status].class)}>
                    {leaveStatusConfig[selectedLeaveRequest.status].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Leave Type</p>
                    <p className="mt-1 font-bold text-slate-900">{selectedLeaveRequest.type}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">From Date</p>
                    <p className="mt-1 font-bold text-slate-900">{new Date(selectedLeaveRequest.from).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">To Date</p>
                    <p className="mt-1 font-bold text-slate-900">{new Date(selectedLeaveRequest.to).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Total Days</p>
                    <p className="mt-1 font-bold text-slate-900">{selectedLeaveRequest.days} day(s)</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedLeaveRequest.reason || 'No reason provided.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-amber-800">Pending Leaves (All)</CardTitle>
                  <CardDescription>
                    {pendingLeaveRequests.length} pending leave request(s) currently awaiting approval.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingLeaveRequests.length === 0 ? (
                    <p className="text-sm text-slate-600">No pending leave requests.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Days</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingLeaveRequests.map((leave) => (
                            <TableRow key={leave.id}>
                              <TableCell className="font-medium">{leave.id}</TableCell>
                              <TableCell>{leave.employee}</TableCell>
                              <TableCell>{leave.type}</TableCell>
                              <TableCell>
                                {new Date(leave.from).toLocaleDateString()} - {new Date(leave.to).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{leave.days}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pending Leaves for {selectedLeaveRequest.employee}</CardTitle>
                  <CardDescription>
                    {selectedEmployeePendingLeaves.length} pending request(s) for this employee.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedEmployeePendingLeaves.length === 0 ? (
                    <p className="text-sm text-slate-600">No pending requests found for this employee.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEmployeePendingLeaves.map((leave) => (
                        <div key={leave.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                          <p className="font-semibold text-slate-800">{leave.type} ({leave.id})</p>
                          <p className="text-sm text-slate-600">
                            {new Date(leave.from).toLocaleDateString()} - {new Date(leave.to).toLocaleDateString()} • {leave.days} day(s)
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsLeaveDetailsModalOpen(false)} className="rounded-lg">
              Close
            </Button>
            <Button
              className="rounded-lg bg-blue-600 hover:bg-blue-700"
              onClick={() => selectedLeaveRequest && handleExportLeaveRequestPdf(selectedLeaveRequest)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Assignment Dialog */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Bulk Shift Assignment
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Assign shifts for multiple employees across the week. Select employees and their preferred shifts for each day.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Shift Setup */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Badge className="bg-slate-200 text-slate-700 text-xs">SETUP</Badge>
                Shift Timings And Custom Shifts
              </h4>

              <div className="space-y-3">
                {shifts.map((shift) => (
                  <div key={shift.id} className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-3 bg-white rounded-lg border border-slate-200 items-center">
                    <div className="lg:col-span-3">
                      <Label className="text-[10px] uppercase text-slate-500">Shift Name</Label>
                      <Input
                        value={shift.name}
                        onChange={(event) => updateShiftDefinition(shift.id, { name: event.target.value })}
                        className="h-9 rounded-lg mt-1"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <Label className="text-[10px] uppercase text-slate-500">Start</Label>
                      <Input
                        type="time"
                        value={shift.startTime}
                        onChange={(event) => updateShiftDefinition(shift.id, { startTime: event.target.value })}
                        className="h-9 rounded-lg mt-1"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <Label className="text-[10px] uppercase text-slate-500">End</Label>
                      <Input
                        type="time"
                        value={shift.endTime}
                        onChange={(event) => updateShiftDefinition(shift.id, { endTime: event.target.value })}
                        className="h-9 rounded-lg mt-1"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <Label className="text-[10px] uppercase text-slate-500">Color</Label>
                      <Select value={shift.color} onValueChange={(value) => updateShiftDefinition(shift.id, { color: value })}>
                        <SelectTrigger className="h-9 rounded-lg mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {SHIFT_COLOR_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <span className={cn('w-2.5 h-2.5 rounded-full', option.dot)} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="lg:col-span-2 flex lg:justify-end gap-2 mt-1 lg:mt-5">
                      <Badge className={cn('rounded-md border-none text-[10px]', shift.color)}>
                        {formatShiftTime(shift.startTime, shift.endTime)}
                      </Badge>
                      {shift.isCustom && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50"
                          onClick={() => removeCustomShift(shift.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 border border-dashed border-slate-300 rounded-lg bg-white">
                <p className="text-xs font-bold text-slate-700 mb-2">Add Custom Shift</p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <Input
                    placeholder="Shift name"
                    value={newShiftName}
                    onChange={(event) => setNewShiftName(event.target.value)}
                    className="h-9 rounded-lg"
                  />
                  <Input
                    type="time"
                    value={newShiftStartTime}
                    onChange={(event) => setNewShiftStartTime(event.target.value)}
                    className="h-9 rounded-lg"
                  />
                  <Input
                    type="time"
                    value={newShiftEndTime}
                    onChange={(event) => setNewShiftEndTime(event.target.value)}
                    className="h-9 rounded-lg"
                  />
                  <Select value={newShiftColor} onValueChange={setNewShiftColor}>
                    <SelectTrigger className="h-9 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {SHIFT_COLOR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span className={cn('w-2.5 h-2.5 rounded-full', option.dot)} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="h-9 rounded-lg" onClick={addCustomShift}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Shift
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Assignment Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  Employee Shift Assignment (Bulk)
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="text-left font-bold text-slate-700 p-3 min-w-[180px]">Employee</th>
                      <th className="text-left font-bold text-slate-700 p-3 min-w-[220px]">Email</th>
                      {DAY_KEYS.map((day) => (
                        <th key={day} className="text-center font-bold text-slate-700 p-3 min-w-[100px]">{DAY_LABELS[day]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.employee}`} />
                              <AvatarFallback className="text-xs font-bold">
                                {row.employee.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-slate-800">{row.employee}</span>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-slate-600">{row.email}</td>
                        {DAY_KEYS.map((day) => (
                          <td key={day} className="p-3 text-center">
                            <Select
                              value={bulkShiftAssignments[row.employee]?.[day]?.toString() || row[day].toString()}
                              onValueChange={(value) => {
                                const shiftId = Number.parseInt(value, 10);
                                setBulkShiftAssignments((prev) => ({
                                  ...prev,
                                  [row.employee]: {
                                    ...prev[row.employee],
                                    [day]: shiftId,
                                  },
                                }));
                              }}
                            >
                              <SelectTrigger className="w-full h-8 text-xs rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="0" className="text-xs">Day Off</SelectItem>
                                {shifts.map((shift) => (
                                  <SelectItem key={shift.id} value={shift.id.toString()} className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <Badge className={cn('rounded-md border-none text-[10px]', shift.color)}>
                                        {getShiftShortCode(shift.name)}
                                      </Badge>
                                      <span>{shift.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  const assignments: Record<string, Partial<Record<DayKey, number>>> = {};
                  roster.forEach((emp) => {
                    assignments[emp.employee] = {
                      mon: 1, tue: 1, wed: 1, thu: 1, fri: 1, sat: 0, sun: 0,
                    };
                  });
                  setBulkShiftAssignments(assignments);
                }}
              >
                <UserCheck className="h-4 w-4 mr-2 text-blue-500" />
                Standard Week (M-F Morning)
              </Button>
              
              <Button
                variant="outline"
                className="rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  const assignments: Record<string, Partial<Record<DayKey, number>>> = {};
                  roster.forEach((emp) => {
                    assignments[emp.employee] = {
                      mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
                    };
                  });
                  setBulkShiftAssignments(assignments);
                }}
              >
                <Coffee className="h-4 w-4 mr-2 text-slate-500" />
                Clear All Shifts
              </Button>
              
              <Button
                variant="outline"
                className="rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setBulkShiftAssignments({});
                  toast({ title: "Reset Complete", description: "All assignments reset to current values." });
                }}
              >
                <History className="h-4 w-4 mr-2 text-amber-500" />
                Reset Changes
              </Button>

              <Button
                variant="outline"
                className="rounded-xl font-bold border-slate-200 text-blue-600 hover:bg-blue-50"
                onClick={handleNotifyAllScheduledMembers}
              >
                <Mail className="h-4 w-4 mr-2" />
                Mail Scheduled Members
              </Button>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="ghost"
              className="w-full sm:w-auto rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              onClick={() => {
                setIsShiftDialogOpen(false);
                setBulkShiftAssignments({});
              }}
            >
              Cancel Changes
            </Button>
            <Button
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold text-white disabled:opacity-50"
              onClick={() => {
                const assignments = Object.entries(bulkShiftAssignments)
                  .filter(([_, shifts]) => Object.keys(shifts).length > 0)
                  .map(([employee, shifts]) => ({ employee, shifts }));
                
                if (assignments.length === 0) {
                  toast({
                    title: "No Changes Detected",
                    description: "Please make at least one shift assignment change.",
                    variant: "destructive"
                  });
                  return;
                }
                
                handleBulkAssignShift(assignments);
              }}
              disabled={loadingStates['bulk-assign']}
            >
              {loadingStates['bulk-assign'] ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating Assignments...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Shift Assignments
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timesheet Dialog */}
      <Dialog open={isTimesheetModalOpen} onOpenChange={setIsTimesheetModalOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                  </div>
                  Employee Timesheet
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Comprehensive attendance timesheet for {selectedEmployee.name} - {selectedEmployee.department}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Employee Summary Card */}
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200/60">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmployee.name}`} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-blue-600 text-white text-2xl font-bold">
                        {selectedEmployee.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">{selectedEmployee.name}</h3>
                          <p className="text-sm text-slate-600 font-medium">{selectedEmployee.email}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {selectedEmployee.department} • Employee ID: {selectedEmployee.id}
                          </p>
                        </div>
                        <Badge className="bg-emerald-600 text-white border-none px-4 py-2 rounded-xl font-bold text-sm w-fit">
                          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="text-center p-3 bg-white rounded-xl border border-emerald-100">
                          <div className="text-2xl font-black text-emerald-600">{selectedEmployee.present}</div>
                          <div className="text-xs text-slate-600 font-medium">Present Days</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-xl border border-rose-100">
                          <div className="text-2xl font-black text-rose-600">{selectedEmployee.absent}</div>
                          <div className="text-xs text-slate-600 font-medium">Absent Days</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                          <div className="text-2xl font-black text-amber-600">{selectedEmployee.late}</div>
                          <div className="text-xs text-slate-600 font-medium">Late Arrivals</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-xl border border-blue-100">
                          <div className="text-2xl font-black text-blue-600">{selectedEmployee.leave}</div>
                          <div className="text-xs text-slate-600 font-medium">Leave Days</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-xl border border-purple-100">
                          <div className="text-2xl font-black text-purple-600">{selectedEmployee.overtime}</div>
                          <div className="text-xs text-slate-600 font-medium">Overtime</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabbed Timesheet View */}
                <Tabs defaultValue="attendance" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 rounded-2xl p-1">
                    <TabsTrigger value="attendance" className="rounded-xl text-sm font-bold">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Daily Attendance
                    </TabsTrigger>
                    <TabsTrigger value="leave-details" className="rounded-xl text-sm font-bold">
                      <Plane className="h-4 w-4 mr-2" />
                      Leave Details
                    </TabsTrigger>
                  </TabsList>

                  {/* Daily Attendance Tab */}
                  <TabsContent value="attendance" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-emerald-600" />
                          Complete Attendance Record
                        </h4>
                        <Badge variant="outline" className="rounded-full">
                          {selectedEmployee.dailyAttendance.length} Records
                        </Badge>
                      </div>

                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead className="font-bold text-slate-700">Date</TableHead>
                              <TableHead className="font-bold text-slate-700">Status</TableHead>
                              <TableHead className="font-bold text-slate-700">Check In</TableHead>
                              <TableHead className="font-bold text-slate-700">Check Out</TableHead>
                              <TableHead className="font-bold text-slate-700">Hours</TableHead>
                              <TableHead className="font-bold text-slate-700">Location</TableHead>
                              <TableHead className="font-bold text-slate-700">Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedEmployee.dailyAttendance.map((record: any, idx: number) => (
                              <TableRow 
                                key={idx}
                                className={cn(
                                  "transition-colors",
                                  record.status === 'present' && 'hover:bg-emerald-50/50',
                                  record.status === 'late' && 'hover:bg-amber-50/50',
                                  record.status === 'absent' && 'hover:bg-rose-50/50',
                                  record.status === 'leave' && 'hover:bg-blue-50/50',
                                  record.status === 'halfday' && 'hover:bg-violet-50/50'
                                )}
                              >
                                <TableCell>
                                  <div className="font-medium text-slate-900">
                                    {new Date(record.date).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn(
                                    "rounded-lg px-2.5 py-1 border font-bold text-[10px] uppercase tracking-wider",
                                    statusConfig[record.status]?.class || 'bg-slate-100 text-slate-700'
                                  )}>
                                    <div className="flex items-center gap-1.5">
                                      {React.createElement(statusConfig[record.status]?.icon || Clock, { className: "h-3 w-3" })}
                                      {statusConfig[record.status]?.label || record.status}
                                    </div>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="font-medium text-slate-700">{record.checkIn}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                                    <span className="font-medium text-slate-700">{record.checkOut}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="secondary" 
                                    className={cn(
                                      "bg-slate-100 hover:bg-slate-100 border-none font-bold",
                                      record.hours === '0h' && 'bg-rose-100 text-rose-700',
                                      parseFloat(record.hours) > 9 && 'bg-emerald-100 text-emerald-700'
                                    )}
                                  >
                                    {record.hours}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      record.location?.includes('Office') && 'bg-blue-500',
                                      record.location?.includes('Remote') && 'bg-purple-500',
                                      record.location === 'N/A' && 'bg-slate-300',
                                      record.location?.includes('Client') && 'bg-orange-500'
                                    )} />
                                    <span className="text-sm font-medium text-slate-600">{record.location}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <p className="text-xs text-slate-600 max-w-[200px]">{record.notes}</p>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Working Hours Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-emerald-600 uppercase">Total Working Days</p>
                              <p className="text-2xl font-black text-emerald-700">
                                {selectedEmployee.dailyAttendance.filter((r: any) => 
                                  r.status === 'present' || r.status === 'late'
                                ).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-violet-100 rounded-lg">
                              <Coffee className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-violet-600 uppercase">Half Days Taken</p>
                              <p className="text-2xl font-black text-violet-700">
                                {selectedEmployee.dailyAttendance.filter((r: any) => 
                                  r.status === 'halfday'
                                ).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Plane className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-blue-600 uppercase">Total Leave Days</p>
                              <p className="text-2xl font-black text-blue-700">
                                {selectedEmployee.dailyAttendance.filter((r: any) => 
                                  r.status === 'leave' || r.status === 'absent'
                                ).length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Leave Details Tab */}
                  <TabsContent value="leave-details" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Plane className="h-5 w-5 text-blue-600" />
                          Complete Leave History
                        </h4>
                        <Badge variant="outline" className="rounded-full">
                          {selectedEmployee.leaveHistory.length} Leave Records
                        </Badge>
                      </div>

                      {selectedEmployee.leaveHistory.length > 0 ? (
                        <div className="space-y-3">
                          {selectedEmployee.leaveHistory.map((leave: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl hover:shadow-md transition-all"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                      {leave.type}
                                    </Badge>
                                    <Badge className={cn(
                                      "text-xs font-bold px-3 py-1 rounded-full",
                                      leave.leaveType === 'Full Day' 
                                        ? 'bg-rose-100 text-rose-700 border-rose-200' 
                                        : 'bg-amber-100 text-amber-700 border-amber-200'
                                    )}>
                                      {leave.leaveType}
                                    </Badge>
                                    <Badge className={cn(
                                      "text-xs font-bold px-3 py-1 rounded-full",
                                      leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                      leave.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                      'bg-rose-100 text-rose-700 border-rose-200'
                                    )}>
                                      {leave.status.toUpperCase()}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">Date Range</p>
                                      <p className="text-sm font-bold text-slate-800">
                                        {new Date(leave.from).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric',
                                          year: 'numeric'
                                        })} 
                                        {' → '}
                                        {new Date(leave.to).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">Location</p>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <p className="text-sm font-medium text-slate-700">{leave.location || 'Not specified'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mb-2">
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Reason</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{leave.reason}</p>
                                  </div>
                                </div>

                                <div className="text-center md:text-right bg-white p-4 rounded-xl border border-blue-200">
                                  <div className="text-3xl font-black text-blue-700 mb-1">{leave.days}</div>
                                  <div className="text-xs text-blue-600 font-bold uppercase">
                                    {leave.days === 1 || leave.days === 0.5 ? 'Day' : 'Days'}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1">
                                    {leave.leaveType}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Leave Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="p-5 bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-rose-100 rounded-xl">
                                  <Calendar className="h-6 w-6 text-rose-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-rose-600 uppercase">Total Full Day Leaves</p>
                                  <p className="text-3xl font-black text-rose-700">
                                    {selectedEmployee.leaveHistory
                                      .filter((l: any) => l.leaveType === 'Full Day')
                                      .reduce((sum: number, l: any) => sum + l.days, 0)}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    {selectedEmployee.leaveHistory.filter((l: any) => l.leaveType === 'Full Day').length} requests
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-100 rounded-xl">
                                  <Coffee className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-amber-600 uppercase">Total Half Day Leaves</p>
                                  <p className="text-3xl font-black text-amber-700">
                                    {selectedEmployee.leaveHistory
                                      .filter((l: any) => l.leaveType === 'Half Day')
                                      .reduce((sum: number, l: any) => sum + l.days, 0)}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    {selectedEmployee.leaveHistory.filter((l: any) => l.leaveType === 'Half Day').length} requests
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-500">
                          <Plane className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                          <p className="text-sm font-medium">No leave records found for this period</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="gap-2 flex-col sm:flex-row">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTimesheetModalOpen(false)} 
                  className="rounded-xl w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleExport('excel');
                    toast({
                      title: "Timesheet Exported",
                      description: `Timesheet for ${selectedEmployee.name} has been downloaded as Excel file.`,
                    });
                  }}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 w-full sm:w-auto"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
                <Button 
                  onClick={() => {
                    handleExport('pdf');
                    toast({
                      title: "Timesheet Exported",
                      description: `Timesheet for ${selectedEmployee.name} has been downloaded as PDF.`,
                    });
                  }}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
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
              {trend === 'up' ? '+12%' : '-4%'}
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

