import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Landmark, 
  Receipt, 
  FileText, 
  RefreshCw,
  Wallet,
  TrendingUp,
  Repeat,
  CreditCard,
  Globe,
  BarChart3,
  Shield,
  FileBarChart,
  Settings,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus
} from 'lucide-react';

// Sub-module components
import BankingModule from './banking-redirect';
import ReceivablesModule from './receivables';
import PayablesModule from './payables';
import ReconciliationModule from './reconciliation';
import CashManagementModule from './cash-management';
import IncomeExpenseModule from './income-expense';
import RecurringTransactionsModule from './recurring-transactions';
import ChequeManagementModule from './cheque-management';
import MultiCurrencyModule from './multi-currency';
import AnalyticsModule from './analytics';
import AuditTrailModule from './audit-trail';
import ReportsModule from './reports';
import SettingsModule from './settings';

export default function AccountsDashboard() {
  const [activeTab, setActiveTab] = useState('banking');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Landmark className="h-8 w-8 text-blue-600" />
              Accounts
            </h1>
            <p className="text-slate-600 mt-1">
              Manage banking, receivables, payables, reconciliation & reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Receive Payment
            </Button>
            <Button size="sm">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bank Balance</CardTitle>
              <Landmark className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">$2,458,000</div>
              <p className="text-xs text-slate-600 mt-1">Across 8 accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receivables</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">$485,000</div>
              <p className="text-xs text-red-600 mt-1">$128K overdue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payables</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">$325,000</div>
              <p className="text-xs text-orange-600 mt-1">$85K due this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">+$160,000</div>
              <p className="text-xs text-slate-600 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-auto p-1 gap-1">
              <TabsTrigger value="banking" className="gap-2">
                <Landmark className="h-4 w-4" />
                Banking
              </TabsTrigger>
              <TabsTrigger value="receivables" className="gap-2">
                <Receipt className="h-4 w-4" />
                Receivables
              </TabsTrigger>
              <TabsTrigger value="payables" className="gap-2">
                <FileText className="h-4 w-4" />
                Payables
              </TabsTrigger>
              <TabsTrigger value="reconciliation" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reconciliation
              </TabsTrigger>
              <TabsTrigger value="cash" className="gap-2">
                <Wallet className="h-4 w-4" />
                Cash Management
              </TabsTrigger>
              <TabsTrigger value="income-expense" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Income & Expense
              </TabsTrigger>
              <TabsTrigger value="recurring" className="gap-2">
                <Repeat className="h-4 w-4" />
                Recurring
              </TabsTrigger>
              <TabsTrigger value="cheques" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Cheques
              </TabsTrigger>
              <TabsTrigger value="currency" className="gap-2">
                <Globe className="h-4 w-4" />
                Multi-Currency
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <Shield className="h-4 w-4" />
                Audit Trail
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileBarChart className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="banking" className="space-y-4">
            <BankingModule includeLayout={false} />
          </TabsContent>

          <TabsContent value="receivables" className="mt-0">
            <ReceivablesModule includeLayout={false} />
          </TabsContent>

          <TabsContent value="payables" className="mt-0">
            <PayablesModule includeLayout={false} />
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-4">
            <ReconciliationModule />
          </TabsContent>

          <TabsContent value="cash" className="space-y-4">
            <CashManagementModule />
          </TabsContent>

          <TabsContent value="income-expense" className="space-y-4">
            <IncomeExpenseModule includeLayout={false} />
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4">
            <RecurringTransactionsModule />
          </TabsContent>

          <TabsContent value="cheques" className="space-y-4">
            <ChequeManagementModule />
          </TabsContent>

          <TabsContent value="currency" className="space-y-4">
            <MultiCurrencyModule />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsModule />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <AuditTrailModule />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsModule />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsModule />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
