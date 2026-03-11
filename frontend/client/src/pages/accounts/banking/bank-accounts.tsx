import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search,
  Download,
  Eye,
  Edit,
  Power,
  PowerOff,
  Star,
  Building2,
  CreditCard,
  Landmark,
  FileSpreadsheet,
  FileText as FilePdf,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Calendar,
  Phone,
  User,
  ExternalLink,
  ChevronDown,
  Trash2,
  FileText,
  History,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

type BankAccount = {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  swiftBic?: string;
  iban?: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  isPrimary: boolean;
  openingDate: string;
  branch: string;
  contactPerson?: string;
  contactPhone?: string;
  minBalance?: number;
  lastReconciledDate?: string;
  description?: string;
};

export default function BankAccounts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [accountForm, setAccountForm] = useState<Partial<BankAccount>>({
    currency: 'USD',
    status: 'active',
    accountType: 'current',
    isPrimary: false,
    openingDate: new Date().toISOString().split('T')[0]
  });

  // Mock data
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: 'ACC-001',
      bankName: 'Chase Bank',
      accountHolderName: 'Zedunix ERP Corp',
      accountType: 'Current Account',
      accountNumber: '****5678',
      routingNumber: '021000021',
      swiftBic: 'CHASUS33',
      iban: 'US33CHAS12345678',
      balance: 458000.50,
      currency: 'USD',
      status: 'active',
      isPrimary: true,
      openingDate: '2024-01-15',
      branch: 'New York Main Branch',
      contactPerson: 'John Smith',
      contactPhone: '+1 (555) 123-4567',
      minBalance: 5000,
      lastReconciledDate: '2024-12-01'
    },
    {
      id: 'ACC-002',
      bankName: 'Bank of America',
      accountHolderName: 'Zedunix ERP Corp',
      accountType: 'Savings Account',
      accountNumber: '****1234',
      routingNumber: '026009593',
      swiftBic: 'BOFAUS66',
      balance: 1250000.75,
      currency: 'USD',
      status: 'active',
      isPrimary: false,
      openingDate: '2024-03-22',
      branch: 'Manhattan Branch',
      contactPerson: 'Emily Davis',
      contactPhone: '+1 (555) 987-6543',
      minBalance: 25000,
      lastReconciledDate: '2024-11-28'
    },
    {
      id: 'ACC-003',
      bankName: 'Wells Fargo',
      accountHolderName: 'Zedunix ERP Corp',
      accountType: 'Current Account',
      accountNumber: '****9012',
      routingNumber: '121000248',
      balance: 750000.00,
      currency: 'USD',
      status: 'active',
      isPrimary: false,
      openingDate: '2024-06-10',
      branch: 'Brooklyn Branch',
      lastReconciledDate: '2024-12-05'
    },
    {
      id: 'ACC-004',
      bankName: 'Citibank',
      accountHolderName: 'Zedunix ERP Corp',
      accountType: 'Credit Card',
      accountNumber: '****3456',
      routingNumber: '021000089',
      balance: -12500.25,
      currency: 'USD',
      status: 'inactive',
      isPrimary: false,
      openingDate: '2023-11-05',
      branch: 'Downtown Branch',
      minBalance: 0
    }
  ]);

  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
  const pendingReconciliation = accounts.filter(acc => !acc.lastReconciledDate || new Date(acc.lastReconciledDate) < new Date(new Date().setDate(new Date().getDate() - 7))).length;

  const filteredAccounts = accounts.filter(acc =>
    acc.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.accountType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.accountNumber.includes(searchQuery)
  );

  const viewAccountDetails = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsViewDialogOpen(true);
  };

  const toggleAccountStatus = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    const newStatus = account?.status === 'active' ? 'inactive' : 'active';
    
    setAccounts(accounts.map(acc =>
      acc.id === accountId
        ? { ...acc, status: newStatus as any }
        : acc
    ));

    toast({
      title: "Status Updated",
      description: `${account?.bankName} is now ${newStatus}.`,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Briefly clear search to show refresh effect
    const prevSearch = searchQuery;
    setSearchQuery('');
    
    setTimeout(() => {
      setIsRefreshing(false);
      setSearchQuery(prevSearch);
      toast({
        title: "Accounts Refreshed",
        description: "Your financial data is up to date.",
      });
    }, 1000);
  };

  const handleSearchClick = () => {
    if (!searchQuery) {
      // If empty, "initiate" with one letter 'A' as requested/demonstrated
      setSearchQuery('A');
    }
    toast({
      title: "Search Initiated",
      description: searchQuery ? `Filtering records for "${searchQuery}"` : "Initializing search filter",
    });
  };

  const handleReconcile = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    setAccounts(accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, lastReconciledDate: new Date().toISOString().split('T')[0] } 
        : acc
    ));
    toast({
      title: "Reconciliation Complete",
      description: `Account ${account?.accountNumber} has been successfully reconciled.`,
    });
  };

  const handleSaveAccount = () => {
    if (!accountForm.bankName || !accountForm.accountNumber) {
      toast({
        title: "Validation Error",
        description: "Bank Name and Account Number are required.",
        variant: "destructive"
      });
      return;
    }

    if (accountForm.id) {
      // Edit existing
      setAccounts(accounts.map(acc => acc.id === accountForm.id ? { ...acc, ...accountForm } as BankAccount : acc));
      toast({ title: "Account Updated", description: "Changes have been saved successfully." });
    } else {
      // Add new
      const newAccount: BankAccount = {
        ...accountForm as BankAccount,
        id: `ACC-00${accounts.length + 1}`,
        status: 'active',
        balance: accountForm.balance || 0,
      };
      setAccounts([...accounts, newAccount]);
      toast({ title: "Account Created", description: "New bank account has been added to the system." });
    }
    setIsAddDialogOpen(false);
    resetAccountForm();
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId));
    setIsViewDialogOpen(false);
    toast({
      title: "Account Removed",
      description: "The bank account has been deleted from the records.",
      variant: "destructive"
    });
  };

  const startEditAccount = (account: BankAccount) => {
    setAccountForm(account);
    setIsAddDialogOpen(true);
  };
  
  const resetAccountForm = () => {
    setAccountForm({
      currency: 'USD',
      status: 'active',
      accountType: 'current',
      isPrimary: false,
      openingDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleExportExcel = () => {
    const data = filteredAccounts.map(acc => ({
      'Account ID': acc.id,
      'Bank Name': acc.bankName,
      'Account Holder': acc.accountHolderName,
      'Account Type': acc.accountType,
      'Account Number': acc.accountNumber,
      'Routing Number': acc.routingNumber,
      'Balance': acc.balance,
      'Currency': acc.currency,
      'Status': acc.status,
      'Branch': acc.branch,
      'Last Reconciled': acc.lastReconciledDate
    }));
    exportToExcel(data, 'bank_accounts');
  };

  const handleExportPDF = () => {
    const headers = ['Account ID', 'Bank Name', 'Account Holder', 'Account Type', 'Account Number', 'Routing Number', 'Balance', 'Currency', 'Status', 'Branch', 'Last Reconciled'];
    const data = filteredAccounts.map(acc => [
      acc.id,
      acc.bankName,
      acc.accountHolderName,
      acc.accountType,
      acc.accountNumber,
      acc.routingNumber,
      acc.balance.toString(),
      acc.currency,
      acc.status,
      acc.branch,
      acc.lastReconciledDate || ''
    ]);
    exportToPDF('Bank Accounts Report', headers, data, 'bank_accounts');
  };

  // ... rest of logic stays similar

  const chartData = accounts.map(acc => ({
    name: acc.bankName,
    value: Math.max(0, acc.balance)
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
              <Landmark className="h-6 w-6" />
            </div>
            Bank Accounts
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage your financial institutions, liquidity, and reconciliation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="h-10 gap-2 border-slate-200"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetAccountForm(); }}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 gap-2 font-bold px-6 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[800px] flex flex-col p-0 overflow-hidden shadow-2xl border-none sm:rounded-2xl bg-white">
              <DialogHeader className="px-6 py-4 bg-white border-b shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    {accountForm.id ? <Edit className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-800">
                      {accountForm.id ? "Edit Account" : "Add Bank Account"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs font-medium">
                      {accountForm.id ? `Modifying details for ${accountForm.bankName}` : "Register a new financial institution account"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 min-h-0 px-6 py-4 bg-slate-50/20">
                <div className="grid gap-6">
                  {/* Basic Bank Info */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                       General Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="bankName" className="text-xs font-bold text-slate-600 uppercase tracking-tight">Bank Name *</Label>
                        <Input 
                          id="bankName" 
                          placeholder="e.g., Chase Bank" 
                          className="h-10 border-slate-200 focus:ring-2 focus:ring-blue-100"
                          value={accountForm.bankName || ''}
                          onChange={(e) => setAccountForm({...accountForm, bankName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="accountHolderName" className="text-xs font-bold text-slate-600 uppercase tracking-tight">Account Holder Name *</Label>
                        <Input 
                          id="accountHolderName" 
                          placeholder="Legal Business Name" 
                          className="h-10 border-slate-200 focus:ring-2 focus:ring-blue-100"
                          value={accountForm.accountHolderName || ''}
                          onChange={(e) => setAccountForm({...accountForm, accountHolderName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="accountType" className="text-xs font-bold text-slate-600 uppercase">Account Type *</Label>
                        <Select 
                          value={accountForm.accountType} 
                          onValueChange={(val) => setAccountForm({...accountForm, accountType: val})}
                        >
                          <SelectTrigger className="h-10 border-slate-200">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Current Account</SelectItem>
                            <SelectItem value="savings">Savings Account</SelectItem>
                            <SelectItem value="credit">Credit Card</SelectItem>
                            <SelectItem value="loan">Loan Account</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="branch" className="text-xs font-bold text-slate-600 uppercase">Branch Name</Label>
                        <Input 
                          id="branch" 
                          placeholder="e.g., New York Main" 
                          className="h-10 border-slate-200"
                          value={accountForm.branch || ''}
                          onChange={(e) => setAccountForm({...accountForm, branch: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Numbers Section */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       Account Identifiers
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="accountNumber" className="text-xs font-bold text-slate-600 uppercase">Account Number *</Label>
                        <Input 
                          id="accountNumber" 
                          placeholder="Enter primary account number" 
                          className="h-10 border-slate-200 font-mono text-sm"
                          value={accountForm.accountNumber || ''}
                          onChange={(e) => setAccountForm({...accountForm, accountNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="routingNumber" className="text-xs font-bold text-slate-600 uppercase">Routing / ABA Number</Label>
                        <Input 
                          id="routingNumber" 
                          placeholder="Enter routing number" 
                          className="h-10 border-slate-200 font-mono text-sm"
                          value={accountForm.routingNumber || ''}
                          onChange={(e) => setAccountForm({...accountForm, routingNumber: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="swiftBic" className="text-xs font-bold text-slate-600 uppercase">SWIFT / BIC Code</Label>
                        <Input 
                          id="swiftBic" 
                          placeholder="Enter international code" 
                          className="h-10 border-slate-200 font-mono text-sm uppercase"
                          value={accountForm.swiftBic || ''}
                          onChange={(e) => setAccountForm({...accountForm, swiftBic: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="iban" className="text-xs font-bold text-slate-600 uppercase">IBAN Number</Label>
                        <Input 
                          id="iban" 
                          placeholder="Enter IBAN number" 
                          className="h-10 border-slate-200 font-mono text-sm uppercase"
                          value={accountForm.iban || ''}
                          onChange={(e) => setAccountForm({...accountForm, iban: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Defaults */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-blue-900 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <Label htmlFor="balance" className="text-xs font-bold text-blue-700 uppercase">Opening Balance *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">$</span>
                        <Input 
                          id="balance" 
                          type="number" 
                          placeholder="0.00" 
                          className="pl-7 h-10 border-blue-200 bg-white focus:ring-blue-100 font-bold text-blue-700"
                          value={accountForm.balance || ''}
                          onChange={(e) => setAccountForm({...accountForm, balance: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 p-4 rounded-xl border border-slate-100 bg-white">
                      <Label htmlFor="minBalance" className="text-xs font-bold text-slate-600 uppercase">Min Balance Warning</Label>
                      <Input 
                        id="minBalance" 
                        type="number" 
                        placeholder="e.g. 500.00" 
                        className="h-10 border-slate-200"
                        value={accountForm.minBalance || ''}
                        onChange={(e) => setAccountForm({...accountForm, minBalance: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  {/* Settings & Contact */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         System Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white shadow-sm">
                          <div className="flex flex-col">
                            <Label htmlFor="isPrimary" className="text-sm font-semibold text-slate-700 cursor-pointer">Set as Primary</Label>
                            <span className="text-[10px] text-slate-400 font-medium">Use for default transactions</span>
                          </div>
                          <input 
                            type="checkbox" 
                            id="isPrimary" 
                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                            checked={accountForm.isPrimary}
                            onChange={(e) => setAccountForm({...accountForm, isPrimary: e.target.checked})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="openingDate" className="text-xs font-bold text-blue-600 uppercase tracking-tight">Opening Date *</Label>
                          <Input 
                            id="openingDate" 
                            type="date" 
                            className="h-10 border-slate-200"
                            value={accountForm.openingDate}
                            onChange={(e) => setAccountForm({...accountForm, openingDate: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         Contact Person
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1.5 px-3">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3 text-slate-400" />
                            <Label htmlFor="contactPerson" className="text-[10px] font-bold text-slate-500 uppercase">Manager Name</Label>
                          </div>
                          <Input 
                            id="contactPerson" 
                            placeholder="Bank POC Name" 
                            className="h-9 text-xs border-slate-200"
                            value={accountForm.contactPerson || ''}
                            onChange={(e) => setAccountForm({...accountForm, contactPerson: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5 px-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <Label htmlFor="contactPhone" className="text-[10px] font-bold text-slate-500 uppercase">Direct Phone</Label>
                          </div>
                          <Input 
                            id="contactPhone" 
                            placeholder="+1 (xxx) xxx-xxxx" 
                            className="h-9 text-xs border-slate-200"
                            value={accountForm.contactPhone || ''}
                            onChange={(e) => setAccountForm({...accountForm, contactPhone: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] shrink-0">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsAddDialogOpen(false); resetAccountForm(); }} 
                  className="h-10 px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAccount} 
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 h-10 px-8 font-bold transition-all transform active:scale-95"
                >
                  {accountForm.id ? "Update Account" : "Save Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Landmark className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-100 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Total Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{formatCurrency(totalBalance)}</div>
            <div className="flex items-center gap-1.5 text-xs text-blue-100 font-bold mt-2 bg-white/10 w-fit px-2 py-1 rounded-full backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+4.2% Growth</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Active Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{activeAccounts}</div>
            <p className="text-xs text-slate-400 font-medium mt-2">
              Out of {accounts.length} total accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Pending Reconcile
            </CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] uppercase font-black">Urgent</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{pendingReconciliation}</div>
            <p className="text-xs text-slate-400 font-medium mt-2">
              Requires attention this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex h-full items-center p-4">
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Mix</h4>
              <div className="space-y-1.5 mt-2">
                {chartData.slice(0, 2).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="truncate max-w-[60px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-blue-600">{Math.round((item.value / totalBalance) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-20 h-20 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={30}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Operational Accounts</CardTitle>
              <p className="text-xs text-slate-500 font-medium">List of all active and inactive bank accounts</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search by bank or number..."
                    className="pl-9 h-9 text-xs border-slate-200 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  />
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-9 px-3 hover:bg-blue-50 text-blue-600 font-bold"
                  onClick={handleSearchClick}
                >
                  Search
                </Button>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200 bg-white font-bold text-slate-600">
                    <Download className="h-3.5 w-3.5" />
                    Export
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportExcel} className="gap-2 py-2 cursor-pointer font-medium">
                    <div className="p-1.5 bg-green-50 rounded text-green-600">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                    </div>
                    Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="gap-2 py-2 cursor-pointer font-medium">
                    <div className="p-1.5 bg-red-50 rounded text-red-600">
                      <FilePdf className="h-3.5 w-3.5" />
                    </div>
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-[100px] text-[10px] font-black text-slate-400 uppercase tracking-widest pl-6">ID</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Details</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reconciliation</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="pl-6 font-bold text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                       {account.id}
                       {account.isPrimary && (
                         <div className="p-0.5 bg-amber-100 rounded text-amber-600 shadow-sm" title="Primary Account">
                           <Star className="h-3 w-3 fill-amber-600" />
                         </div>
                       )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 text-sm">{account.bankName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{account.branch}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] h-4 font-black uppercase tracking-widest px-1.5 py-0 border-slate-200 bg-slate-50">{account.accountType.replace(' Account', '')}</Badge>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{account.accountNumber}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 truncate max-w-[150px]">{account.accountHolderName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        'font-black text-sm',
                        account.balance >= 0 ? 'text-blue-700' : 'text-red-700'
                      )}>
                        {formatCurrency(account.balance)}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{account.currency}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {account.lastReconciledDate ? (
                       <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {new Date(account.lastReconciledDate).toLocaleDateString()}
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium">Reconciled</div>
                       </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500">
                        <AlertCircle className="h-3 w-3" />
                        Pending
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={account.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-none",
                        account.status === 'active'
                          ? 'bg-green-100 text-green-700 shadow-sm shadow-green-100/50'
                          : account.status === 'closed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => viewAccountDetails(account)} className="gap-2 py-2 cursor-pointer font-medium">
                          <Eye className="h-3.5 w-3.5 text-blue-500" />
                          View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startEditAccount(account)} className="gap-2 py-2 cursor-pointer font-medium">
                          <Edit className="h-3.5 w-3.5 text-indigo-500" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 py-2 cursor-pointer font-medium border-t mt-1">
                          <History className="h-3.5 w-3.5 text-slate-500" />
                          Txn History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 py-2 cursor-pointer font-medium">
                          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                          Bank Portal
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleAccountStatus(account.id)}
                          className={cn(
                            "gap-2 py-2 cursor-pointer font-medium border-t mt-1",
                            account.status === 'active' ? "text-red-600" : "text-green-600"
                          )}
                        >
                          {account.status === 'active' ? (
                            <><PowerOff className="h-3.5 w-3.5" /> Deactivate Account</>
                          ) : (
                            <><Power className="h-3.5 w-3.5" /> Activate Account</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAccount(account.id)}
                          className="gap-2 py-2 cursor-pointer font-medium text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Account Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl w-[95vw] h-[90vh] max-h-[850px] flex flex-col p-0 overflow-hidden shadow-3xl border-none sm:rounded-3xl bg-slate-50">
          <DialogHeader className="p-8 bg-blue-600 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
              <Landmark className="h-32 w-32" />
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
              <div className="flex items-start gap-5">
                <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl shadow-blue-900/20">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-black tracking-tight">{selectedAccount?.bankName}</h2>
                    {selectedAccount?.isPrimary && (
                      <Badge className="bg-white text-blue-600 font-black uppercase text-[10px] py-0.5 px-2">Primary</Badge>
                    )}
                  </div>
                  <p className="opacity-80 text-sm font-bold flex items-center gap-1.5 uppercase tracking-widest">
                    <CreditCard className="h-3.5 w-3.5" />
                    {selectedAccount?.accountType} • {selectedAccount?.accountNumber}
                  </p>
                  <p className="opacity-80 text-sm font-medium flex items-center gap-1.5">
                    <Landmark className="h-3.5 w-3.5" />
                    {selectedAccount?.branch}, {selectedAccount?.currency}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Available Liquid Balance</span>
                <span className="text-4xl font-black tabular-nums">{selectedAccount ? formatCurrency(selectedAccount.balance) : '$0.00'}</span>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 bg-slate-50">
            <div className="p-8 grid md:grid-cols-3 gap-8">
              {/* Left Column: Stats & Details */}
              <div className="md:col-span-1 space-y-6">
                 {/* Quick Stats Grid */}
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center text-center gap-1 border border-slate-100">
                       <TrendingUp className="h-5 w-5 text-green-500" />
                       <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Inflow (Mo)</span>
                       <span className="text-sm font-bold text-slate-700">+$24,500</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center text-center gap-1 border border-slate-100">
                       <ArrowDownRight className="h-5 w-5 text-red-500" />
                       <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Outflow (Mo)</span>
                       <span className="text-sm font-bold text-slate-700">-$8,200</span>
                    </div>
                 </div>

                 <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 space-y-6">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Institutional Info</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account ID</Label>
                        <p className="text-sm font-bold text-slate-700 font-mono">{selectedAccount?.id}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SWIFT/BIC Code</Label>
                        <p className="text-sm font-bold text-slate-700 uppercase">{selectedAccount?.swiftBic || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">IBAN Number</Label>
                        <p className="text-sm font-bold text-slate-700 uppercase">{selectedAccount?.iban || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Routing/ABA</Label>
                        <p className="text-sm font-bold text-slate-700 font-mono">{selectedAccount?.routingNumber || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 space-y-4 text-blue-900 bg-blue-50/20 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Bank Relations</h4>
                       <div className="space-y-3">
                          <div className="flex items-start gap-3">
                             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                                <User className="h-4 w-4" />
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-700">{selectedAccount?.contactPerson || 'Unassigned'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Relationship Manager</p>
                             </div>
                          </div>
                          <div className="flex items-start gap-3">
                             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                                <Phone className="h-4 w-4" />
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-700">{selectedAccount?.contactPhone || 'No Contact Info'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Direct Phone</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Column: Transactions & History */}
              <div className="md:col-span-2 space-y-6">
                 {/* Alerts Section */}
                 {selectedAccount?.status === 'inactive' && (
                   <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-4 text-amber-800 shadow-sm animate-pulse">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase tracking-tight">Account Inactive</p>
                        <p className="text-xs font-bold opacity-70">This account is currently suspended and won't appear in default settlement options.</p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-white border-amber-200 h-8 font-black text-[10px] uppercase px-4 shadow-sm">Review Status</Button>
                   </div>
                 )}

                 {/* Recent Transactions Mockup */}
                 <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <History className="h-4 w-4 text-blue-500" />
                          Recent Settlements
                       </h4>
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toast({ title: "Ledger Export", description: "The full transaction ledger is being generated..."})}
                        className="h-7 text-[10px] font-black uppercase text-blue-600 tracking-widest items-center gap-1 hover:bg-blue-50"
                       >
                          View Ledger <ExternalLink className="h-3 w-3" />
                       </Button>
                    </div>

                    <div className="space-y-3">
                       {[
                         { date: '2024-12-04', type: 'Credit', desc: 'Q4 Consulting Services Paym...', amount: '+ $12,400.00', status: 'Cleared', color: 'text-green-600' },
                         { date: '2024-12-02', type: 'Debit', desc: 'Corporate Rent - Dec 2024', amount: '- $5,500.00', status: 'Cleared', color: 'text-slate-700' },
                         { date: '2024-12-01', type: 'Transfer', desc: 'Internal Transfer to Petty Cash', amount: '- $1,500.00', status: 'Pending', color: 'text-slate-700' },
                         { date: '2024-11-28', type: 'Credit', desc: 'Direct Deposit: Vendor Rebate', amount: '+ $850.20', status: 'Cleared', color: 'text-green-600' }
                       ].map((txn, i) => (
                         <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-dotted border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 transition-all cursor-default relative group">
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                 "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                                 txn.type === 'Credit' ? "bg-green-50 text-green-600" : txn.type === 'Debit' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                               )}>
                                 {txn.type === 'Credit' ? <ArrowUpRight className="h-5 w-5" /> : txn.type === 'Debit' ? <ArrowDownRight className="h-5 w-5" /> : <RefreshCcw className="h-5 w-5" />}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-700">{txn.desc}</p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{txn.date}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{txn.type}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className={cn("text-sm font-black tabular-nums", txn.color)}>{txn.amount}</p>
                               <Badge variant="outline" className={cn(
                                 "text-[8px] font-black uppercase tracking-[0.1em] h-4 leading-none border-none py-0",
                                 txn.status === 'Cleared' ? "text-green-500 bg-green-50" : "text-amber-500 bg-amber-50"
                               )}>{txn.status}</Badge>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="h-16 w-16" />
                       </div>
                       <div className="flex items-center justify-between relative z-10">
                          <div>
                             <h5 className="font-black text-sm uppercase tracking-widest mb-1">Reconciliation Status</h5>
                             <p className="text-white/60 text-[10px] font-medium max-w-[200px]">Last synchronized with core ledger on {selectedAccount?.lastReconciledDate || 'N/A'}</p>
                          </div>
                          <Button 
                            onClick={() => selectedAccount && handleReconcile(selectedAccount.id)}
                            className="bg-white text-slate-900 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest h-8 px-5 transition-all active:scale-95"
                          >
                            Reconcile Now
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="px-8 py-5 bg-white border-t flex justify-between items-center shrink-0 shadow-2xl">
            <div className="flex items-center gap-2">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => {
                   if (selectedAccount) {
                     setIsViewDialogOpen(false);
                     handleDeleteAccount(selectedAccount.id);
                   }
                 }}
                 className="h-10 w-10 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
               >
                  <Trash2 className="h-5 w-5" />
               </Button>
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => toast({ title: "Statement Download", description: "Fetching the latest account statement..."})}
                className="h-10 w-10 rounded-full text-slate-400 hover:bg-slate-50"
               >
                  <FileText className="h-5 w-5" />
               </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="h-11 px-8 rounded-xl border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
                Close View
              </Button>
              <Button 
                onClick={() => {
                  if (selectedAccount) {
                    setIsViewDialogOpen(false);
                    startEditAccount(selectedAccount);
                  }
                }}
                className="h-11 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-white font-black uppercase tracking-widest text-[10px] transition-all transform active:scale-95 flex gap-2"
              >
                <Edit className="h-4 w-4" /> Edit Account
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
