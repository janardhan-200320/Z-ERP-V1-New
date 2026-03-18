import React, { useState, useEffect, ReactNode, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  UserCheck,
  TrendingUp,
  Wallet,
  UserPlus,
  Users,
  FileSignature,
  ShoppingCart,
  Briefcase,
  Package,
  MessageCircle,
  MessageSquareMore,
  CreditCard,
  Settings,
  ChevronDown,
  Menu,
  Building2,
  Sparkles,
  Search,
  Clock3,
  LogIn,
  LogOut,
  Coffee,
  MapPin,
  House,
  Wifi,
  Check,
  Bell,
  Plus,
  Smile,
  Send,
  X,
  DollarSign,
  FileText,
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import WorkspaceSelector from './WorkspaceSelector';
import PageTransition from './PageTransition';
import TopProgressBar from './TopProgressBar';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { safeGetItem } from '@/lib/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Company {
  name: string;
  industry: string;
  eventTypeLabel?: string;
  teamMemberLabel?: string;
  availableDays?: string[];
  availableTimeStart?: string;
  availableTimeEnd?: string;
  currency?: string;
}

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const formatDurationClock = (durationMs: number) => {
    const normalized = Math.max(0, durationMs);
    const totalSeconds = Math.floor(normalized / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  type WorkLocation = 'office' | 'wfh' | 'remote' | 'field';
  type BreakReason = 'lunch' | 'tea' | 'short' | 'meeting' | 'other';

  const [location, navigate] = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [orgLogo, setOrgLogo] = useState<string>('');
  const [allowedModules, setAllowedModules] = useState<string[] | null>(null);
  const { selectedWorkspace } = useWorkspace();
  const { toast } = useToast();

  // New state for header actions
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [attendanceClock, setAttendanceClock] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [selectedWorkLocation, setSelectedWorkLocation] = useState<WorkLocation>('office');
  const [checkInNote, setCheckInNote] = useState('');
  const [checkOutNote, setCheckOutNote] = useState('');
  const [selectedBreakReason, setSelectedBreakReason] = useState<BreakReason>('lunch');
  const [otherReasonNote, setOtherReasonNote] = useState('');
  const [checkInAt, setCheckInAt] = useState<Date | null>(null);
  const [breakStartedAt, setBreakStartedAt] = useState<Date | null>(null);
  const [accumulatedBreakMs, setAccumulatedBreakMs] = useState(0);
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);
  const lastSidebarScrollTop = useRef(0);

  const captureSidebarScroll = useCallback(() => {
    if (sidebarScrollRef.current) {
      lastSidebarScrollTop.current = sidebarScrollRef.current.scrollTop;
    }
  }, []);

  const workLocationConfig: Record<WorkLocation, { label: string; icon: any; helper: string }> = {
    office: { label: 'Office', icon: Building2, helper: 'Onsite office' },
    wfh: { label: 'Work From Home', icon: House, helper: 'Home setup' },
    remote: { label: 'Remote', icon: Wifi, helper: 'Anywhere' },
    field: { label: 'Field Work', icon: Briefcase, helper: 'Client/location visit' },
  };

  const breakReasonConfig: Record<BreakReason, { label: string; helper: string }> = {
    lunch: { label: 'Lunch Break', helper: '~60min' },
    tea: { label: 'Tea Break', helper: '~15min' },
    short: { label: 'Short Break', helper: '~10min' },
    meeting: { label: 'Meeting Break', helper: '~30min' },
    other: { label: 'Other', helper: 'Specify reason' },
  };

  useEffect(() => {
    // Only keep the clock ticking when attendance UI is relevant.
    if (!attendanceDialogOpen && !isCheckedIn && !isOnBreak) {
      return;
    }

    const interval = setInterval(() => {
      setAttendanceClock(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [attendanceDialogOpen, isCheckedIn, isOnBreak]);

  const ongoingBreakMs = isOnBreak && breakStartedAt
    ? attendanceClock.getTime() - breakStartedAt.getTime()
    : 0;
  const totalBreakMs = accumulatedBreakMs + ongoingBreakMs;
  const totalWorkMs = checkInAt
    ? attendanceClock.getTime() - checkInAt.getTime() - totalBreakMs
    : 0;
  const isOtherReasonMissing = selectedBreakReason === 'other' && !otherReasonNote.trim();

  const handleAttendanceCheckIn = () => {
    const now = new Date();
    setIsCheckedIn(true);
    setIsOnBreak(false);
    setCheckInAt(now);
    setBreakStartedAt(null);
    setAccumulatedBreakMs(0);
    setSelectedBreakReason('lunch');
    setOtherReasonNote('');
    setCheckOutNote('');

    toast({
      title: 'Checked In',
      description: `You are checked in from ${workLocationConfig[selectedWorkLocation].label}.`,
      duration: 2500,
    });
  };

  const handleBreakToggle = () => {
    const now = new Date();

    if (!isOnBreak) {
      if (selectedBreakReason === 'other' && !otherReasonNote.trim()) {
        toast({
          title: 'Reason required',
          description: 'Please add a note when selecting Other break reason.',
          duration: 3000,
        });
        return;
      }

      setIsOnBreak(true);
      setBreakStartedAt(now);
      toast({
        title: 'Break started',
        description: `Reason: ${breakReasonConfig[selectedBreakReason].label}`,
        duration: 2000,
      });
      return;
    }

    if (breakStartedAt) {
      setAccumulatedBreakMs(prev => prev + (now.getTime() - breakStartedAt.getTime()));
    }
    setIsOnBreak(false);
    setBreakStartedAt(null);
    toast({
      title: 'Break ended',
      description: 'Back to work.',
      duration: 2000,
    });
  };

  const handleAttendanceCheckOut = () => {
    if (!checkInAt) {
      return;
    }

    const now = new Date();
    const finalizedBreakMs = accumulatedBreakMs + (isOnBreak && breakStartedAt ? now.getTime() - breakStartedAt.getTime() : 0);
    const finalizedWorkMs = now.getTime() - checkInAt.getTime() - finalizedBreakMs;

    setIsCheckedIn(false);
    setIsOnBreak(false);
    setCheckInAt(null);
    setBreakStartedAt(null);
    setAccumulatedBreakMs(0);
    setSelectedBreakReason('lunch');
    setOtherReasonNote('');
    setCheckInNote('');
    setCheckOutNote('');

    toast({
      title: 'Checked Out',
      description: `Work time ${formatDurationClock(finalizedWorkMs)} • Break ${formatDurationClock(finalizedBreakMs)}`,
      duration: 3500,
    });

    setAttendanceDialogOpen(false);
  };

  const handleCreateTask = () => {
    setTaskDialogOpen(false);
    toast({
      title: "Task Created!",
      description: "Your new task has been added successfully.",
      duration: 3000,
    });
  };

  const handleChatSend = () => {
    if (!chatMessage.trim()) return;
    setChatMessage('');
    toast({
      title: "Message Sent",
      description: "Your message has been delivered to the team.",
      duration: 2000,
    });
  };

  interface SubMenuItem {
    name: string;
    path: string;
    hasSubmenu?: boolean;
    submenuKey?: string;
    submenu?: SubMenuItem[];
  }

  interface NavItem {
    name: string;
    icon: any;
    path: string;
    hasSubmenu?: boolean;
    submenuKey?: string;
    submenu?: SubMenuItem[];
  }

  // Main navigation items (memoized)
  const navigation: NavItem[] = useMemo(() => [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'HRM', icon: UserCheck, path: '/hrm' },
    {
      name: 'CRM',
      icon: Users,
      path: '/crm',
      hasSubmenu: true,
      submenuKey: 'crm',
      submenu: [
        { name: 'Leads', path: '/leads' },
        { name: 'Call Status', path: '/leads/call-status' },
      ]
    },
    { 
      name: 'Sales', 
      icon: TrendingUp, 
      path: '/sales',
      hasSubmenu: true,
      submenuKey: 'sales',
      
    },
    { 
      name: 'Accounts', 
      icon: Wallet, 
      path: '/accounts',
      hasSubmenu: true,
      submenuKey: 'accounts',
      submenu: [
        { name: 'Bank Accounts', path: '/accounts/banking/accounts' },
        { name: 'Bank Reconciliation', path: '/accounts/banking/reconciliation' },
        { name: 'Cheque Management', path: '/accounts/banking/cheques' },
        { name: 'Cash & Bank Entries', path: '/accounts/banking/cash-bank' },
        { name: 'Income', path: '/accounts/income' },
        { name: 'Expenses', path: '/accounts/expenses' },
        { name: 'Receivables', path: '/accounts/receivables' },
        { name: 'Payables', path: '/accounts/payables' },
        { name: 'Reports', path: '/accounts/reports' },
        { name: 'Settings', path: '/accounts/settings' },
      ]
    },
    { name: 'Recruitment', icon: UserPlus, path: '/recruitment' },
    {
      name: 'Customers',
      icon: Users,
      path: '/customers',
      hasSubmenu: true,
      submenuKey: 'customers',
      submenu: [
        { name: 'Dashboard', path: '/customers' },
      ]
    },
{ name: 'Vendors', icon: Briefcase, path: '/vendors' },

    { name: 'Team Space', icon: MessageSquareMore, path: '/team-space' },

    { name: 'Profile', icon: Users, path: '/profile' },
    
    { name: 'Subscription', icon: CreditCard, path: '/subscriptions' },
    { 
      name: 'Setup', 
      icon: Settings, 
      path: '/dashboard/setup/staff',
      hasSubmenu: true,
      submenuKey: 'setup',
      submenu: [
        { name: 'Staff', path: '/dashboard/setup/staff' },
        { name: 'Groups', path: '/dashboard/setup/groups' },
        { name: 'Roles', path: '/dashboard/setup/roles' },
        { name: 'Permissions', path: '/dashboard/setup/permissions' },
        
      ]
    },
    {
      name: 'Admin',
      icon: Settings,
      path: '/admin',
      hasSubmenu: true,
      submenuKey: 'admin',
      submenu: [
        { name: 'Company Details', path: '/admin/company' },
        { name: 'Domain Setup', path: '/admin/domain' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Roles & Permissions', path: '/admin/permissions' },
      ]
    },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ], []);

  const filteredNavigation = useMemo(() => {
    if (!Array.isArray(allowedModules) || allowedModules.length === 0) return navigation;
    return navigation.filter(item => allowedModules.includes(item.name));
  }, [navigation, allowedModules]);

  // State for expandable menus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    crm: false,
    sales: false,
    accounts: false,
    banking: false,
    'income-expense': false,
    receivables: false,
    payables: false,
    vendors: false,
    admin: false,
    setup: false,
    customers: false,
    'team-space': false,
    settings: false,
  });

  const toggleMenu = (menuKey: string) => {
    captureSidebarScroll();
    setExpandedMenus(prev => {
      const isOpening = !prev[menuKey];
      if (!isOpening) return { ...prev, [menuKey]: false };

      // Accordion behavior: close other top-level menus when opening a new one
      const newState = { ...prev };
      const topLevelKeys = navigation
        .filter(item => item.hasSubmenu && item.submenuKey)
        .map(item => item.submenuKey!);

      // Only close top-level siblings if this is a top-level menu
      if (topLevelKeys.includes(menuKey)) {
        topLevelKeys.forEach(key => {
          newState[key] = key === menuKey;
        });
      } else {
        newState[menuKey] = true;
      }

      return newState;
    });
  };

  useLayoutEffect(() => {
    if (!sidebarScrollRef.current) return;
    sidebarScrollRef.current.scrollTop = lastSidebarScrollTop.current;
  }, [expandedMenus, location]);

  const resolveModuleForPath = useCallback((path: string): string | null => {
    for (const item of navigation) {
      if (item.path === path) return item.name;
      if (item.submenu) {
        for (const sub of item.submenu) {
          if (sub.path === path) return item.name;
          if (sub.submenu) {
            for (const leaf of sub.submenu) {
              if (leaf.path === path) return item.name;
            }
          }
        }
      }
    }
    return null;
  }, [navigation]);

  // Auto-expand parent menu based on current location
  useEffect(() => {
    if (!location) return;

    const isPathActive = (item: any): boolean => {
      if (location === item.path) return true;
      if (item.submenu) {
        return item.submenu.some((sub: any) => isPathActive(sub));
      }
      return false;
    };

    const keysToExpand = new Set<string>();

    navigation.forEach(item => {
      if (!item.hasSubmenu || !item.submenu || !item.submenuKey) return;

      if (isPathActive(item)) {
        keysToExpand.add(item.submenuKey);
      }

      item.submenu.forEach(subItem => {
        if (subItem.hasSubmenu && subItem.submenu && subItem.submenuKey && isPathActive(subItem)) {
          keysToExpand.add(subItem.submenuKey);
        }
      });
    });

    if (keysToExpand.size === 0) return;

    setExpandedMenus(prev => {
      let changed = false;
      const next = { ...prev };

      keysToExpand.forEach((key) => {
        if (!next[key]) {
          next[key] = true;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [location, navigation]);

  useEffect(() => {
    const loadSession = () => {
      try {
        const raw = localStorage.getItem('z_erp_active_session');
        if (!raw) {
          setAllowedModules(null);
          return;
        }
        const parsed = JSON.parse(raw);
        const modules = Array.isArray(parsed?.allowedModules) ? parsed.allowedModules : null;
        setAllowedModules(modules);
      } catch {
        setAllowedModules(null);
      }
    };

    loadSession();
    window.addEventListener('focus', loadSession);
    window.addEventListener('storage', loadSession);
    return () => {
      window.removeEventListener('focus', loadSession);
      window.removeEventListener('storage', loadSession);
    };
  }, []);

  useEffect(() => {
    if (!Array.isArray(allowedModules) || allowedModules.length === 0) return;
    if (!location || location === '/login') return;

    const moduleName = resolveModuleForPath(location);
    if (!moduleName) return;

    if (!allowedModules.includes(moduleName)) {
      const fallback = filteredNavigation[0]?.path ?? '/';
      navigate(fallback);
    }
  }, [allowedModules, location, filteredNavigation, navigate, resolveModuleForPath]);

  useEffect(() => {
    const savedCompany = safeGetItem<Company | null>('zervos_company', null);
    if (savedCompany) {
      setCompany(savedCompany);
    }

    // Load organization settings for logo
    const loadOrgSettings = () => {
      const settings = safeGetItem<any>('zervos_organization_settings', null);
      if (settings && typeof settings === 'object' && settings.logo) {
        setOrgLogo(settings.logo);
      }
    };

    loadOrgSettings();

    // Listen for organization settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      if (event.detail?.logo) {
        setOrgLogo(event.detail.logo);
      }
    };

    window.addEventListener('organization-settings-updated', handleSettingsUpdate as EventListener);

    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      
      // Handle arrow keys in search
      if (searchOpen && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSearchIndex(prev => (prev + 1) % searchResults.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSearchIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
        } else if (e.key === 'Enter' && selectedSearchIndex >= 0) {
          const selected = searchResults[selectedSearchIndex];
          if (selected) {
            window.location.href = selected.path;
            setSearchOpen(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('organization-settings-updated', handleSettingsUpdate as EventListener);
    };
  }, [searchOpen, selectedSearchIndex]);

  // Search data - all searchable pages (memoized outside component for better performance)
  const allSearchPages = useMemo(() => [
    { name: 'Dashboard', path: '/', category: 'Dashboard', keywords: 'home overview analytics' },
    { name: 'Projects', path: '/projects', category: 'Projects', keywords: 'project management tasks' },
    { name: 'HRM Dashboard', path: '/hrm', category: 'HR', keywords: 'human resources employees' },
    { name: 'Employees', path: '/hrm/employees', category: 'HR', keywords: 'staff team members' },
    { name: 'Attendance', path: '/hrm/attendance', category: 'HR', keywords: 'check-in timesheet' },
    { name: 'Payroll', path: '/hrm/payroll', category: 'HR', keywords: 'salary wages compensation' },
    { name: 'Announcements', path: '/hrm/announcements', category: 'HR', keywords: 'notice bulletin updates communication' },
    { name: 'Sales Dashboard', path: '/sales', category: 'Sales', keywords: 'revenue deals' },
    { name: 'Proposals', path: '/sales/proposals', category: 'Sales', keywords: 'quotes estimates' },
    { name: 'Invoices', path: '/sales/invoices', category: 'Sales', keywords: 'billing payments' },
    { name: 'Accounts', path: '/accounts', category: 'Accounts', keywords: 'finance accounting ledger' },
    { name: 'Banking', path: '/accounts/banking', category: 'Accounts', keywords: 'bank transactions' },
    { name: 'Customers', path: '/customers', category: 'Sales', keywords: 'clients contacts CRM' },
    { name: 'Vendors', path: '/vendors', category: 'Purchases', keywords: 'suppliers vendors procurement' },
    { name: 'Subscriptions', path: '/subscriptions', category: 'Accounts', keywords: 'recurring billing plans' },
    { name: 'Leads', path: '/leads', category: 'Sales', keywords: 'prospects opportunities pipeline' },
    { name: 'Admin Setup', path: '/admin', category: 'Admin', keywords: 'configuration permissions users' },
    { name: 'Team Space', path: '/team-space', category: 'Communication', keywords: 'team collaboration meetings calls chats files' },
    { name: 'Profile', path: '/profile', category: 'Profile', keywords: 'account settings preferences' },
  ], []);

  // Filter search results (memoized for performance)
  const searchResults = useMemo(() => {
    if (searchQuery.trim() === '') return [];
    const query = searchQuery.toLowerCase();
    return allSearchPages.filter(page => 
      page.name.toLowerCase().includes(query) ||
      page.category.toLowerCase().includes(query) ||
      page.keywords.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchQuery, allSearchPages]);

  // Category colors (memoized)
  const getCategoryColor = useCallback((category: string) => {
    const colors: Record<string, string> = {
      'Dashboard': 'bg-indigo-100 text-indigo-700',
      'Projects': 'bg-purple-100 text-purple-700',
      'HR': 'bg-green-100 text-green-700',
      'Sales': 'bg-blue-100 text-blue-700',
      'Accounts': 'bg-amber-100 text-amber-700',
      'Purchases': 'bg-orange-100 text-orange-700',
      'Inventory': 'bg-teal-100 text-teal-700',
      'Communication': 'bg-pink-100 text-pink-700',
      'System': 'bg-gray-100 text-gray-700',
      'Admin': 'bg-red-100 text-red-700',
      'Profile': 'bg-cyan-100 text-cyan-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  }, []);

  const isActive = useCallback((path: string) => location === path, [location]);

  const activeNavItem = useMemo(() => filteredNavigation.find(item => {
    if (item.hasSubmenu && item.submenu) {
      // Check if any submenu or nested submenu item is active
      return item.submenu.some(subItem => {
        if (subItem.hasSubmenu && subItem.submenu) {
          // Check nested submenu items
          return subItem.submenu.some(subSubItem => location === subSubItem.path) || location === subItem.path;
        }
        return location === subItem.path;
      }) || location === item.path;
    }
    return location === item.path;
  }), [location, filteredNavigation]);

  const renderNavItems = (expanded: boolean) => (
    <LayoutGroup>
      {filteredNavigation.map((item) => {
        if (item.hasSubmenu && item.submenu) {
          // Render menu item with submenu
          const menuExpanded = expandedMenus[item.submenuKey || ''];
          const hasActiveSubmenu = item.submenu.some(subItem => {
            if (subItem.hasSubmenu && subItem.submenu) {
              return subItem.submenu.some(subSubItem => isActive(subSubItem.path)) || isActive(subItem.path);
            }
            return isActive(subItem.path);
          });
          
          return (
            <div key={item.path}>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  if (item.submenuKey) {
                    toggleMenu(item.submenuKey);
                  }
                }}
                whileHover={{ scale: expanded ? 1.01 : 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`relative w-full flex items-center ${
                  expanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3'
                } text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-xl ${
                  hasActiveSubmenu ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                }`}
              >
                <motion.span className="relative z-10 flex items-center justify-center">
                  <item.icon size={20} className={hasActiveSubmenu ? 'text-white' : 'text-slate-300'} />
                </motion.span>

                {expanded && (
                  <>
                    <span className={`relative z-10 font-medium flex-1 text-left ${
                      hasActiveSubmenu ? 'text-white' : 'text-slate-200'
                    }`}>
                      {item.name}
                    </span>
                    <motion.span
                      animate={{ rotate: menuExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10"
                    >
                      <ChevronDown size={16} className="text-slate-400" />
                    </motion.span>
                  </>
                )}
              </motion.button>

              {/* Submenu items */}
              <AnimatePresence>
                {menuExpanded && expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {item.submenu.map((subItem) => {
                      const subActive = isActive(subItem.path);
                      
                      // Check if submenu item has its own submenu
                      if (subItem.hasSubmenu && subItem.submenu) {
                        const subMenuExpanded = expandedMenus[subItem.submenuKey || ''];
                        const hasActiveSubSubmenu = subItem.submenu.some(subSubItem => isActive(subSubItem.path));
                        
                        return (
                          <div key={subItem.path}>
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                subItem.submenuKey && toggleMenu(subItem.submenuKey);
                              }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative w-full flex items-center gap-3 pl-12 pr-4 py-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-xl ${
                                hasActiveSubSubmenu ? 'bg-slate-700/40' : 'hover:bg-slate-700/30'
                              }`}
                            >
                              <span className={`relative z-10 font-medium flex-1 text-left ${
                                hasActiveSubSubmenu ? 'text-white' : 'text-slate-300'
                              }`}>
                                {subItem.name}
                              </span>
                              <motion.span
                                animate={{ rotate: subMenuExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="relative z-10"
                              >
                                <ChevronDown size={14} className="text-slate-400" />
                              </motion.span>
                            </motion.button>

                            {/* Sub-submenu items */}
                            <AnimatePresence>
                              {subMenuExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  {subItem.submenu.map((subSubItem) => {
                                    const subSubActive = isActive(subSubItem.path);
                                    return (
                                      <Link 
                                        key={subSubItem.path} 
                                        href={subSubItem.path}
                                      >
                                        <a className={`relative flex items-center gap-3 pl-20 pr-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-xl cursor-pointer ${
                                          subSubActive ? '' : 'hover:bg-slate-700/30'
                                        }`}>
                                          <span className={`relative z-10 font-medium ${
                                            subSubActive ? 'text-white' : 'text-slate-300'
                                          }`}>
                                            {subSubItem.name}
                                          </span>

                                          {subSubActive && (
                                            <span
                                              className="absolute inset-0 rounded-xl bg-slate-700/60 shadow-lg"
                                            />
                                          )}
                                        </a>
                                      </Link>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }
                      
                      // Regular submenu item without nested submenu
                      return (
                        <Link 
                          key={subItem.path} 
                          href={subItem.path}
                        >
                          <a className={`relative flex items-center gap-3 pl-12 pr-4 py-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-xl cursor-pointer ${
                            subActive ? '' : 'hover:bg-slate-700/40'
                          }`}>
                            <span className={`relative z-10 font-medium ${
                              subActive ? 'text-white' : 'text-slate-300'
                            }`}>
                              {subItem.name}
                            </span>

                            {subActive && (
                              <span
                                className="absolute inset-0 rounded-xl bg-slate-700/60 shadow-lg"
                              />
                            )}
                          </a>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        // Render regular menu item
        const active = isActive(item.path);

        return (
          <Link 
            key={item.path} 
            href={item.path}
            onMouseEnter={() => !expanded && setHoveredNav(item.path)}
            onMouseLeave={() => setHoveredNav(prev => (prev === item.path ? null : prev))}
            className={`relative flex items-center ${
              expanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3'
            } text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-xl overflow-visible cursor-pointer ${
              active ? '' : 'hover:bg-slate-700/50'
            }`}
          >
            <motion.span
              className="relative z-10 flex items-center justify-center"
              initial={false}
              animate={{ scale: active ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <item.icon size={20} className={active ? 'text-white' : 'text-slate-300'} />
            </motion.span>

            {expanded && <span className={`relative z-10 font-medium ${active ? 'text-white' : 'text-slate-200'}`}>{item.name}</span>}

            {active && (
              <span
                className="absolute inset-0 rounded-xl bg-slate-700 shadow-lg"
              />
            )}

            <AnimatePresence>
              {hoveredNav === item.path && !expanded && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-700 px-3 py-1 text-xs font-semibold text-white shadow-lg ring-1 ring-slate-600"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </LayoutGroup>
  );

  const renderSidebarShell = (expanded: boolean) => (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 280 : 96 }}
      transition={{ type: 'spring', stiffness: 200, damping: 28 }}
      className="relative z-30 hidden h-full flex-col overflow-hidden border-r border-slate-700 bg-slate-800 text-white shadow-2xl lg:flex"
    >
      <div className="relative px-4 pb-4 pt-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              layout
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg p-1.5"
            >
              {orgLogo ? (
                <img src={orgLogo} alt="Logo" className="h-full w-full rounded-lg object-cover" />
              ) : (
                <img src="/favicon.png" alt="Z-ERP" className="h-full w-full object-contain" />
              )}
            </motion.div>
            {expanded && (
              <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl px-4 py-3 shadow-[0_8px_16px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)] border border-slate-300/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                <div className="flex items-center justify-center relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Z-ERP
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      <div
        ref={sidebarScrollRef}
        onScroll={captureSidebarScroll}
        className="flex-1 overflow-y-auto px-4 pb-6"
      >
        <div className="space-y-1">
          {renderNavItems(expanded)}
        </div>
      </div>
    </motion.aside>
  );

  const renderMobileSidebar = () => (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 220, damping: 30 }}
            className="relative z-10 flex h-full w-80 flex-col overflow-y-auto border-r border-slate-700 bg-slate-800 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg p-1.5">
                  {orgLogo ? (
                    <img src={orgLogo} alt="Logo" className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <img src="/favicon.png" alt="Z-ERP" className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl px-4 py-3 shadow-[0_8px_16px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)] border border-slate-300/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-center relative z-10">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Z-ERP
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-slate-700 p-2 text-slate-300 ring-1 ring-slate-600"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <Menu size={18} />
              </motion.button>
            </div>

            {/* Scrollable Navigation Area for Mobile */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 mt-2">
              <div className="space-y-1">
                {renderNavItems(true)}
              </div>
            </div>

          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          className="absolute -right-32 top-[-20%] h-[36rem] w-[36rem] rounded-full bg-purple-200/40 blur-[140px]"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 16, ease: 'easeInOut', delay: 1 }}
          className="absolute left-[-20%] top-1/4 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-[120px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),transparent_65%)]" />
      </div>

      {/* <TopProgressBar /> */}

      {renderSidebarShell(sidebarExpanded)}
      {renderMobileSidebar()}

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="relative z-20 border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition-colors"
                aria-label={sidebarExpanded ? 'Collapse navigation' : 'Expand navigation'}
              >
                <Menu size={18} />
              </motion.button>
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  <Sparkles size={12} /> Experience
                </p>
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  {activeNavItem?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 sm:gap-3 flex-1 max-w-2xl">
              {/* Global Search Bar */}
              <div className="relative flex-1 max-w-xl">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search pages, features, settings..."
                  className="pl-11 pr-20 h-11 bg-white/70 backdrop-blur-md border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-sm"
                  onClick={() => setSearchOpen(true)}
                  readOnly
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-slate-500 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-md shadow-sm">
                  âŒ˜K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 rounded-full hover:bg-slate-100 relative"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={18} className="text-slate-600" />
              </Button>

              {/* Team Chat Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-slate-100 relative"
                onClick={() => setChatOpen(true)}
              >
                <MessageCircle size={18} className="text-slate-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full"></span>
              </Button>

              {/* Attendance Tracker Button */}
              <Button
                variant="ghost"
                className="h-10 rounded-full hover:bg-slate-100 gap-2 px-3"
                onClick={() => setAttendanceDialogOpen(true)}
              >
                <Clock3 size={18} className="text-slate-600" />
                <span className="hidden lg:inline text-sm font-medium text-slate-700">
                  {isCheckedIn ? 'Working' : 'Check In'}
                </span>
              </Button>

              {/* Notifications Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-slate-100 relative"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <Bell size={18} className="text-slate-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* Add Task Button */}
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                onClick={() => setTaskDialogOpen(true)}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Task</span>
              </Button>

              <ProfileDropdown />
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8" style={{ overflowX: 'hidden' }}>
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={(open) => {
        setSearchOpen(open);
        if (!open) {
          setSearchQuery('');
          setSelectedSearchIndex(0);
        }
      }}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-white/95 backdrop-blur-xl border-slate-200">
          <DialogHeader className="px-6 py-4 border-b border-slate-200">
            <DialogTitle className="text-lg font-semibold">Search</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Search across modules, employees, projects, and more
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSearchIndex(0);
                }}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} className="text-slate-400" />
                </Button>
              )}
            </div>
          </div>

          <div className="px-4 pb-4">
            {searchQuery.trim() === '' ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 mb-2">Start typing to search</p>
                <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-400">
                  <span>Try: Dashboard</span>
                  <span>â€¢</span>
                  <span>Employees</span>
                  <span>â€¢</span>
                  <span>Invoices</span>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-700 mb-1">No results found</p>
                <p className="text-xs text-slate-500 mb-4">Try different keywords or search by module name</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="text-xs">Dashboard</Badge>
                  <Badge variant="outline" className="text-xs">Projects</Badge>
                  <Badge variant="outline" className="text-xs">Sales</Badge>
                  <Badge variant="outline" className="text-xs">HR</Badge>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3 px-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                  </p>
                  <p className="text-xs text-slate-400">â†‘â†“ Navigate â€¢ â†µ Select â€¢ ESC Close</p>
                </div>
                <ScrollArea className="max-h-96">
                  <div className="space-y-1">
                    {searchResults.map((result, idx) => (
                      <Link key={idx} href={result.path}>
                        <div
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            idx === selectedSearchIndex
                              ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                          onClick={() => setSearchOpen(false)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-900 mb-1">
                                {result.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {result.keywords.split(' ').slice(0, 5).join(' ')}...
                              </p>
                            </div>
                            <Badge className={`${getCategoryColor(result.category)} text-xs px-2 py-1`}>
                              {result.category}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-4xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Team Chat</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Conversations List */}
            <div className="w-1/3 border-r pr-4">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {['Engineering Team', 'Marketing Team', 'Sales Team', 'Support Team'].map((team, idx) => (
                    <div key={idx} className="p-3 hover:bg-slate-100 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{team.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{team}</p>
                          <p className="text-xs text-gray-500 truncate">Last message...</p>
                        </div>
                        <span className="text-xs text-gray-400">2m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">John Doe</p>
                      <div className="mt-1 bg-slate-100 p-3 rounded-lg">
                        <p className="text-sm">Hello team! How's the project going?</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile size={16} className="text-gray-500" />
                    </Button>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleChatSend}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance Tracker Dialog */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[560px] p-0 overflow-hidden rounded-2xl border border-slate-200 max-h-[90vh]">
          <div className="overflow-y-auto max-h-[90vh] p-4 sm:p-6 space-y-5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-slate-800">
                <Clock3 size={22} className="text-blue-600" />
                Attendance Tracker
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-slate-500">
                {isCheckedIn ? "You're currently working" : 'Start your workday'}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
              <p className="text-3xl sm:text-4xl font-bold text-blue-600 tracking-tight">
                {attendanceClock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                {attendanceClock.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex justify-center">
              <Badge className={`${isCheckedIn ? 'bg-green-600' : 'bg-slate-600'} text-white text-sm sm:text-base px-4 py-1.5 rounded-lg`}>
                {isCheckedIn ? '✓ Working' : 'Not Checked In'}
              </Badge>
            </div>

            {!isCheckedIn ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold text-slate-700">Select Work Location</Label>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(workLocationConfig) as WorkLocation[]).map((loc) => {
                      const item = workLocationConfig[loc];
                      const Icon = item.icon;
                      const isActive = selectedWorkLocation === loc;

                      return (
                        <button
                          type="button"
                          key={loc}
                          onClick={() => setSelectedWorkLocation(loc)}
                          className={`rounded-xl border p-4 text-left transition-all ${
                            isActive
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <Icon size={20} className={`${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                          <p className={`mt-2 text-base font-semibold ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500">{item.helper}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="attendance-checkin-note" className="text-sm font-semibold text-slate-700">Note (Optional)</Label>
                  <Textarea
                    id="attendance-checkin-note"
                    value={checkInNote}
                    onChange={(e) => setCheckInNote(e.target.value)}
                    placeholder="Add a note about today's plan..."
                    className="mt-2 min-h-[100px] text-sm"
                  />
                </div>

                <Button
                  type="button"
                  className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                  onClick={handleAttendanceCheckIn}
                >
                  <LogIn size={20} className="mr-2" />
                  Check In Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-emerald-800 text-sm font-semibold">Working Time</p>
                    <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-green-600">{formatDurationClock(totalWorkMs)}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-amber-800 text-sm font-semibold">Break Time</p>
                    <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-orange-600">{formatDurationClock(totalBreakMs)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-slate-700">
                  <div className="flex items-center gap-2 text-base">
                    <MapPin size={18} className="text-slate-500" />
                    <span>Working from:</span>
                    <Badge variant="outline" className="text-sm border-slate-300">
                      {workLocationConfig[selectedWorkLocation].label}
                    </Badge>
                  </div>
                  <span className="text-sm sm:text-base text-slate-500 font-medium">
                    In: {checkInAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold text-slate-700">Start Break</Label>
                  <Select
                    value={selectedBreakReason}
                    onValueChange={(value: BreakReason) => setSelectedBreakReason(value)}
                    disabled={isOnBreak}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(breakReasonConfig) as BreakReason[]).map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          <div className="flex items-center gap-2">
                            {reason === selectedBreakReason ? <Check size={15} className="text-blue-600" /> : <span className="w-[15px]" />}
                            <span>{breakReasonConfig[reason].label}</span>
                            <span className="text-slate-400">{breakReasonConfig[reason].helper}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedBreakReason === 'other' && (
                    <div>
                      <Label htmlFor="break-other-note" className="text-sm text-slate-600">
                        Reason note for Other (required)
                      </Label>
                      <Textarea
                        id="break-other-note"
                        value={otherReasonNote}
                        onChange={(e) => setOtherReasonNote(e.target.value)}
                        placeholder="Mention your break reason..."
                        className={`mt-2 min-h-[80px] text-sm ${isOtherReasonMissing ? 'border-red-300 focus-visible:ring-red-400' : ''}`}
                        disabled={isOnBreak}
                      />
                      {isOtherReasonMissing && !isOnBreak && (
                        <p className="mt-1 text-xs text-red-600">Please enter a reason before starting break.</p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className={`w-full h-12 text-base font-semibold transition-colors ${isOnBreak ? 'border-orange-300 text-orange-700 hover:bg-orange-50' : 'border-amber-300 text-amber-700 hover:bg-amber-50'}`}
                  onClick={handleBreakToggle}
                  disabled={!isOnBreak && isOtherReasonMissing}
                >
                  <Coffee size={18} className="mr-2" />
                  {isOnBreak ? 'End Break' : 'Start Break'}
                </Button>

                <div>
                  <Label htmlFor="attendance-checkout-note" className="text-sm font-semibold text-slate-700">Check Out Note (Optional)</Label>
                  <Textarea
                    id="attendance-checkout-note"
                    value={checkOutNote}
                    onChange={(e) => setCheckOutNote(e.target.value)}
                    placeholder="Summary of today's work..."
                    className="mt-2 min-h-[100px] text-sm"
                  />
                </div>

                <Button
                  type="button"
                  className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700"
                  onClick={handleAttendanceCheckOut}
                >
                  <LogOut size={20} className="mr-2" />
                  Check Out
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task and assign it to team members</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Title *</Label>
              <Input placeholder="Enter task title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Describe the task..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assign To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="mike">Mike Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Project</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project1">Project Alpha</SelectItem>
                    <SelectItem value="project2">Project Beta</SelectItem>
                    <SelectItem value="project3">Project Gamma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateTask}>
                <Plus size={16} className="mr-2" />
                Create Task
              </Button>
              <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dropdown */}
      {notificationOpen && (
        <div className="fixed right-4 top-20 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="icon" onClick={() => setNotificationOpen(false)}>
              <X size={16} />
            </Button>
          </div>
          <ScrollArea className="h-96">
            <div className="p-2">
              {[
                { type: 'task', title: 'New task assigned', desc: 'Complete Q4 report by Friday', time: '5m ago' },
                { type: 'message', title: 'New message from Sarah', desc: 'Can we discuss the project timeline?', time: '15m ago' },
                { type: 'approval', title: 'Leave request approved', desc: 'Your leave from Dec 20-25 has been approved', time: '1h ago' },
                { type: 'reminder', title: 'Meeting in 30 minutes', desc: 'Team standup at 3:00 PM', time: '2h ago' },
              ].map((notif, idx) => (
                <div key={idx} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.desc}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full text-sm">
              View All Notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

