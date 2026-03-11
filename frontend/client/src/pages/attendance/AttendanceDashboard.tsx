import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, XCircle, Clock, TrendingUp, MapPin, Calendar,
  Download, FileDown, Filter, Home, Building2, Laptop, Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AttendanceDashboard() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [totalBreakDuration, setTotalBreakDuration] = useState(0); // in milliseconds
  const [workDuration, setWorkDuration] = useState('0h 0m');
  const [breakDuration, setBreakDuration] = useState('0h 0m');
  const [workMode, setWorkMode] = useState<'office' | 'remote' | 'hybrid' | 'onsite'>('office');
  const [checkInTimeDisplay, setCheckInTimeDisplay] = useState<string>('');

  // Work mode configuration
  const workModeConfig = {
    office: { label: 'Office', icon: Building2, color: 'bg-blue-500', location: 'Office - New York' },
    remote: { label: 'Remote', icon: Home, color: 'bg-green-500', location: 'Work from Home' },
    hybrid: { label: 'Hybrid', icon: Laptop, color: 'bg-purple-500', location: 'Hybrid Mode' },
    onsite: { label: 'On-site', icon: Users, color: 'bg-orange-500', location: 'Client Location' },
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update work duration if checked in (excluding break time)
      if (checkInTime) {
        let totalDuration = Date.now() - checkInTime.getTime();
        let currentBreak = 0;
        if (isOnBreak && breakStartTime) {
          currentBreak = Date.now() - breakStartTime.getTime();
        }
        const effectiveWorkDuration = totalDuration - totalBreakDuration - currentBreak;
        const hours = Math.floor(effectiveWorkDuration / (1000 * 60 * 60));
        const minutes = Math.floor((effectiveWorkDuration % (1000 * 60 * 60)) / (1000 * 60));
        setWorkDuration(`${hours}h ${minutes}m`);
      }

      // Update break duration if on break
      if (isOnBreak && breakStartTime) {
        const currentBreakDuration = Date.now() - breakStartTime.getTime() + totalBreakDuration;
        const bHours = Math.floor(currentBreakDuration / (1000 * 60 * 60));
        const bMinutes = Math.floor((currentBreakDuration % (1000 * 60 * 60)) / (1000 * 60));
        setBreakDuration(`${bHours}h ${bMinutes}m`);
      } else if (totalBreakDuration > 0) {
        const bHours = Math.floor(totalBreakDuration / (1000 * 60 * 60));
        const bMinutes = Math.floor((totalBreakDuration % (1000 * 60 * 60)) / (1000 * 60));
        setBreakDuration(`${bHours}h ${bMinutes}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [checkInTime, isOnBreak, breakStartTime, totalBreakDuration]);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    const now = new Date();
    setCheckInTime(now);
    setCheckInTimeDisplay(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setTotalBreakDuration(0);
    setBreakDuration('0h 0m');
  };

  const handleCheckOut = () => {
    // End any ongoing break before checking out
    if (isOnBreak && breakStartTime) {
      setTotalBreakDuration(prev => prev + (Date.now() - breakStartTime.getTime()));
    }
    setIsCheckedIn(false);
    setIsOnBreak(false);
    setCheckInTime(null);
    setBreakStartTime(null);
    setWorkDuration('0h 0m');
    setBreakDuration('0h 0m');
    setTotalBreakDuration(0);
    setCheckInTimeDisplay('');
  };

  const handleBreakStart = () => {
    setIsOnBreak(true);
    setBreakStartTime(new Date());
  };

  const handleBreakEnd = () => {
    if (breakStartTime) {
      setTotalBreakDuration(prev => prev + (Date.now() - breakStartTime.getTime()));
    }
    setIsOnBreak(false);
    setBreakStartTime(null);
  };

  // Mock data
  const stats = [
    { label: 'Present Days', value: '22', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Total Hours', value: '176h', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Avg Hours/Day', value: '8.2h', icon: TrendingUp, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Absent Days', value: '2', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  const attendanceHistory = [
    { date: '2026-01-15', checkIn: '09:02 AM', checkOut: 'Active', breakStart: '12:30 PM', breakEnd: 'Active', breakDuration: '0h 30m', hours: '4.5h', status: 'present', location: 'Office - New York', workMode: 'office' as const },
    { date: '2026-01-14', checkIn: '08:58 AM', checkOut: '06:15 PM', breakStart: '12:00 PM', breakEnd: '01:00 PM', breakDuration: '1h 0m', hours: '8.5h', status: 'present', location: 'Work from Home', workMode: 'remote' as const },
    { date: '2026-01-13', checkIn: '09:45 AM', checkOut: '05:30 PM', breakStart: '12:30 PM', breakEnd: '01:15 PM', breakDuration: '0h 45m', hours: '7h', status: 'late', location: 'Client Location', workMode: 'onsite' as const },
    { date: '2026-01-12', checkIn: '09:00 AM', checkOut: '06:00 PM', breakStart: '12:00 PM', breakEnd: '12:45 PM', breakDuration: '0h 45m', hours: '8.25h', status: 'present', location: 'Hybrid Mode', workMode: 'hybrid' as const },
    { date: '2026-01-11', checkIn: '08:55 AM', checkOut: '05:45 PM', breakStart: '12:15 PM', breakEnd: '01:00 PM', breakDuration: '0h 45m', hours: '8h', status: 'present', location: 'Office - New York', workMode: 'office' as const },
    { date: '2026-01-10', checkIn: '-', checkOut: '-', breakStart: '-', breakEnd: '-', breakDuration: '-', hours: '-', status: 'absent', location: '-', workMode: 'office' as const },
  ];

  const getWorkModeIcon = (mode: 'office' | 'remote' | 'hybrid' | 'onsite') => {
    const config = workModeConfig[mode];
    const Icon = config.icon;
    return <Icon size={14} className="mr-1" />;
  };

  const getWorkModeBadgeColor = (mode: 'office' | 'remote' | 'hybrid' | 'onsite') => {
    switch (mode) {
      case 'office': return 'bg-blue-100 text-blue-700';
      case 'remote': return 'bg-green-100 text-green-700';
      case 'hybrid': return 'bg-purple-100 text-purple-700';
      case 'onsite': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'late':
        return 'bg-amber-500';
      case 'absent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance & Check-In</h1>
          <p className="text-sm text-gray-500 mt-1">Track your attendance and manage check-in/out</p>
        </div>

        {/* Check-In Card */}
        <Card className={`relative overflow-hidden border-0 shadow-xl ${
          isCheckedIn 
            ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600' 
            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600'
        }`}>
          {/* Animated pulse effect */}
          {isCheckedIn && (
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          )}
          
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left text-white flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${isCheckedIn ? 'bg-white animate-pulse' : 'bg-white/50'}`}></div>
                  <p className="text-white/90 font-medium">
                    {isCheckedIn ? 'You are checked in' : 'Ready to check in'}
                  </p>
                </div>
                
                <div className="text-6xl font-bold mb-2">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                <p className="text-lg text-white/90 mb-4">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>

                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                  <Badge className={`${workModeConfig[workMode].color} hover:opacity-90 text-white border-white/30 backdrop-blur-sm text-sm px-3 py-1`}>
                    {(() => { const Icon = workModeConfig[workMode].icon; return <Icon size={14} className="mr-2" />; })()}
                    {workModeConfig[workMode].location}
                  </Badge>
                  
                  {isCheckedIn && checkInTimeDisplay && (
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-sm px-3 py-1">
                      <CheckCircle size={14} className="mr-2" />
                      In: {checkInTimeDisplay}
                    </Badge>
                  )}
                  
                  {isCheckedIn && (
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-sm px-3 py-1">
                      <Clock size={14} className="mr-2" />
                      Work: {workDuration}
                    </Badge>
                  )}
                  {isCheckedIn && (totalBreakDuration > 0 || isOnBreak) && (
                    <Badge className="bg-amber-500/30 hover:bg-amber-500/40 text-white border-amber-400/50 backdrop-blur-sm text-sm px-3 py-1">
                      <Clock size={14} className="mr-2" />
                      Break: {breakDuration}
                    </Badge>
                  )}
                  {isOnBreak && (
                    <Badge className="bg-red-500/30 hover:bg-red-500/40 text-white border-red-400/50 backdrop-blur-sm text-sm px-3 py-1 animate-pulse">
                      On Break
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {!isCheckedIn ? (
                  <>
                    {/* Work Mode Selector */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <p className="text-white/80 text-xs mb-2 text-center font-medium">Select Work Mode</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(workModeConfig) as Array<keyof typeof workModeConfig>).map((mode) => {
                          const config = workModeConfig[mode];
                          const Icon = config.icon;
                          return (
                            <button
                              key={mode}
                              onClick={() => setWorkMode(mode)}
                              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                workMode === mode
                                  ? 'bg-white text-gray-800 shadow-lg scale-105'
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }`}
                            >
                              <Icon size={14} />
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleCheckIn}
                      className="bg-white/95 hover:bg-white text-indigo-600 shadow-2xl border-2 border-white/50 backdrop-blur-sm h-14 px-8 text-lg font-semibold"
                    >
                      <CheckCircle size={20} className="mr-2" />
                      Check In
                    </Button>
                  </>
                ) : (
                  <>
                    {!isOnBreak ? (
                      <Button
                        size="lg"
                        onClick={handleBreakStart}
                        className="bg-amber-500/90 hover:bg-amber-500 text-white shadow-xl border-2 border-amber-400/50 backdrop-blur-sm h-12 px-6 text-base font-semibold"
                      >
                        <Clock size={18} className="mr-2" />
                        Start Break
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={handleBreakEnd}
                        className="bg-orange-500/90 hover:bg-orange-500 text-white shadow-xl border-2 border-orange-400/50 backdrop-blur-sm h-12 px-6 text-base font-semibold animate-pulse"
                      >
                        <Clock size={18} className="mr-2" />
                        End Break
                      </Button>
                    )}
                    <Button
                      size="lg"
                      onClick={handleCheckOut}
                      className="bg-white/95 hover:bg-white text-green-600 shadow-2xl border-2 border-white/50 backdrop-blur-sm h-14 px-8 text-lg font-semibold"
                    >
                      <XCircle size={20} className="mr-2" />
                      Check Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-white/70 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Attendance History */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance History</CardTitle>
              <div className="flex gap-2">
                <Select defaultValue="thisMonth">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="last3Months">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download size={16} />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        Date
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        Check In
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        Check Out
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        Break Start
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        Break End
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Break Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <div className="flex items-center gap-2">
                        <Laptop size={14} />
                        Work Mode
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        Location
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Work Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record, idx) => (
                    <tr 
                      key={idx} 
                      className={`border-b hover:bg-slate-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {record.checkIn === 'Active' ? (
                          <Badge className="bg-green-100 text-green-700">{record.checkIn}</Badge>
                        ) : (
                          record.checkIn
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {record.checkOut === 'Active' ? (
                          <Badge className="bg-blue-100 text-blue-700 animate-pulse">{record.checkOut}</Badge>
                        ) : (
                          record.checkOut
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {record.breakStart === 'Active' ? (
                          <Badge className="bg-amber-100 text-amber-700">{record.breakStart}</Badge>
                        ) : (
                          record.breakStart
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {record.breakEnd === 'Active' ? (
                          <Badge className="bg-orange-100 text-orange-700 animate-pulse">{record.breakEnd}</Badge>
                        ) : (
                          record.breakEnd
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {record.breakDuration !== '-' ? (
                          <Badge className="bg-amber-50 text-amber-700 border border-amber-200">{record.breakDuration}</Badge>
                        ) : (
                          record.breakDuration
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {record.status !== 'absent' ? (
                          <Badge className={getWorkModeBadgeColor(record.workMode)}>
                            {getWorkModeIcon(record.workMode)}
                            {workModeConfig[record.workMode].label}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          {record.location}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{record.hours}</td>
                      <td className="px-4 py-4">
                        <Badge className={`${getStatusColor(record.status)} text-white`}>
                          {getStatusLabel(record.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
