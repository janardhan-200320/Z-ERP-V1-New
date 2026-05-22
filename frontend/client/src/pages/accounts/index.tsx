import { useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Landmark, 
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  FileBarChart,
  Settings,
  ChevronDown,
  ChevronRight,
  Receipt,
  FileText,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import sub-modules
import Banking from './banking/index';
import IncomeExpense from './income-expense/index';
import Receivables from './receivables/index';
import Payables from './payables/index';
import Reports from './reports/index';
import AccountSettings from './settings/index';

type AccountsSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  children?: { id: string; label: string; path: string }[];
};

const accountsSections: AccountsSection[] = [
  {
    id: 'banking',
    label: 'Banking',
    icon: Landmark,
    path: '/accounts/banking/accounts',
    children: [
      { id: 'bank-accounts', label: 'Bank Accounts', path: '/accounts/banking/accounts' },
      { id: 'reconciliation', label: 'Bank Reconciliation', path: '/accounts/banking/reconciliation' },
      { id: 'cheques', label: 'Cheque Management', path: '/accounts/banking/cheques' },
      { id: 'cash-bank', label: 'Cash & Bank Entries', path: '/accounts/banking/cash-bank' },
    ],
  },
  {
    id: 'income-expense',
    label: 'Income & Expense',
    icon: TrendingUp,
    path: '/accounts/income',
    children: [
      { id: 'income', label: 'Income', path: '/accounts/income' },
      { id: 'expenses', label: 'Expenses', path: '/accounts/expenses' },
      { id: 'recurring', label: 'Recurring Expenses', path: '/accounts/income-expense/recurring' },
      { id: 'allocation', label: 'Expense Allocation', path: '/accounts/income-expense/allocation' },
    ],
  },
  {
    id: 'receivables',
    label: 'Receivables',
    icon: ArrowDownCircle,
    path: '/accounts/receivables',
  },
  {
    id: 'payables',
    label: 'Payables',
    icon: ArrowUpCircle,
    path: '/accounts/payables',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileBarChart,
    path: '/accounts/reports',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/accounts/settings',
  },
];

export default function AccountsModule() {
  const [location, setLocation] = useLocation();

  // Determine active section from URL
  const activeSection = (() => {
    if (location.startsWith('/accounts/banking')) return 'banking';
    if (location.startsWith('/accounts/income') || location.startsWith('/accounts/expenses') || location.startsWith('/accounts/income-expense')) return 'income-expense';
    if (location.startsWith('/accounts/receivables')) return 'receivables';
    if (location.startsWith('/accounts/payables')) return 'payables';
    if (location.startsWith('/accounts/reports')) return 'reports';
    if (location.startsWith('/accounts/settings')) return 'settings';
    return 'banking';
  })();

  const renderContent = () => {
    const loc = location.toLowerCase();
    if (loc.includes('/accounts/banking') || loc === '/accounts' || loc === '/accounts/') {
      return <Banking includeLayout={false} />;
    } else if (
      loc.includes('/accounts/income') || 
      loc.includes('/accounts/expenses') ||
      loc.includes('/accounts/income-expense')
    ) {
      return <IncomeExpense includeLayout={false} />;
    } else if (loc.includes('/accounts/receivables')) {
      return <Receivables includeLayout={false} />;
    } else if (loc.includes('/accounts/payables')) {
      return <Payables includeLayout={false} />;
    } else if (loc.includes('/accounts/reports')) {
      return <Reports includeLayout={false} />;
    } else if (loc.includes('/accounts/settings')) {
      return <AccountSettings includeLayout={false} />;
    }
    return <Banking includeLayout={false} />; // Fallback
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Top Navigation Bar (instead of sidebar) */}
        <div className="border-b border-slate-200 bg-white p-2 flex items-center gap-2 overflow-x-auto">
          {accountsSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <Button
                key={section.id}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'gap-2 whitespace-nowrap',
                  isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                )}
                onClick={() => setLocation(section.path)}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </Button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50/30">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}
