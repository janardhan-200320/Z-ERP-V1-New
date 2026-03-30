import { safeGetItem, safeSetItem } from '@/lib/storage';

export type BankAccount = {
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

export const BANK_ACCOUNTS_STORAGE_KEY = 'accounts.banking.bankAccounts';
export const BANK_ACCOUNTS_UPDATED_EVENT = 'bankAccountsUpdated';

const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ACC-001',
    bankName: 'Chase Bank',
    accountHolderName: 'Zedunix ERP Corp',
    accountType: 'Current Account',
    accountNumber: '****5678',
    routingNumber: '021000021',
    swiftBic: 'CHASUS33',
    iban: 'US33CHAS12345678',
    balance: 458000.5,
    currency: 'INR',
    status: 'active',
    isPrimary: true,
    openingDate: '2024-01-15',
    branch: 'New York Main Branch',
    contactPerson: 'John Smith',
    contactPhone: '+1 (555) 123-4567',
    minBalance: 5000,
    lastReconciledDate: '2024-12-01',
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
    currency: 'INR',
    status: 'active',
    isPrimary: false,
    openingDate: '2024-03-22',
    branch: 'Manhattan Branch',
    contactPerson: 'Emily Davis',
    contactPhone: '+1 (555) 987-6543',
    minBalance: 25000,
    lastReconciledDate: '2024-11-28',
  },
  {
    id: 'ACC-003',
    bankName: 'Wells Fargo',
    accountHolderName: 'Zedunix ERP Corp',
    accountType: 'Current Account',
    accountNumber: '****9012',
    routingNumber: '121000248',
    balance: 750000,
    currency: 'INR',
    status: 'active',
    isPrimary: false,
    openingDate: '2024-06-10',
    branch: 'Brooklyn Branch',
    lastReconciledDate: '2024-12-05',
  },
  {
    id: 'ACC-004',
    bankName: 'Citibank',
    accountHolderName: 'Zedunix ERP Corp',
    accountType: 'Credit Card',
    accountNumber: '****3456',
    routingNumber: '021000089',
    balance: -12500.25,
    currency: 'INR',
    status: 'inactive',
    isPrimary: false,
    openingDate: '2023-11-05',
    branch: 'Downtown Branch',
    minBalance: 0,
  },
];

const isValidBankAccount = (account: any): account is BankAccount => {
  return account && typeof account.id === 'string' && typeof account.bankName === 'string';
};

export const getBankAccounts = (): BankAccount[] => {
  const stored = safeGetItem<BankAccount[]>(BANK_ACCOUNTS_STORAGE_KEY, DEFAULT_BANK_ACCOUNTS);
  if (!Array.isArray(stored)) return DEFAULT_BANK_ACCOUNTS;
  const valid = stored.filter(isValidBankAccount);
  return valid.length > 0 ? valid : DEFAULT_BANK_ACCOUNTS;
};

export const saveBankAccounts = (accounts: BankAccount[]): void => {
  safeSetItem(BANK_ACCOUNTS_STORAGE_KEY, accounts);
  window.dispatchEvent(new Event(BANK_ACCOUNTS_UPDATED_EVENT));
};

export const getActiveBankAccountOptions = () => {
  return getBankAccounts()
    .filter((account) => account.status === 'active')
    .map((account) => ({
      id: account.id,
      name: `${account.bankName} - ${account.accountNumber}`,
    }));
};
