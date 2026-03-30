import { safeGetItem, safeSetItem } from '@/lib/storage';

export const FINANCE_SETTINGS_STORAGE_KEY = 'zervos_finance_settings';
export const FINANCE_DEFAULT_TAX_VALUE = 'Finance Default Tax';

export type FinanceSettingsData = {
  defaultCurrency: string;
  currencyFormat: string;
  defaultTaxRate: number;
  includeTaxInPrices: boolean;
  taxNumber: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  paymentTermsDays: number;
  lateFeePercent: number;
  autoGenerateInvoiceNumbers: boolean;
  sendPaymentReminders: boolean;
};

export const DEFAULT_FINANCE_SETTINGS: FinanceSettingsData = {
  defaultCurrency: 'usd',
  currencyFormat: 'symbol',
  defaultTaxRate: 10,
  includeTaxInPrices: false,
  taxNumber: 'US123456789',
  invoicePrefix: 'INV-',
  invoiceStartNumber: 1000,
  paymentTermsDays: 30,
  lateFeePercent: 5,
  autoGenerateInvoiceNumbers: true,
  sendPaymentReminders: true,
};

const clampRate = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_FINANCE_SETTINGS.defaultTaxRate;
  return Math.min(100, Math.max(0, value));
};

const normalizeFinanceSettings = (settings: Partial<FinanceSettingsData> | null | undefined): FinanceSettingsData => {
  const merged = { ...DEFAULT_FINANCE_SETTINGS, ...(settings || {}) };
  return {
    ...merged,
    defaultTaxRate: clampRate(Number(merged.defaultTaxRate)),
    invoiceStartNumber: Math.max(0, Number(merged.invoiceStartNumber) || DEFAULT_FINANCE_SETTINGS.invoiceStartNumber),
    paymentTermsDays: Math.max(0, Number(merged.paymentTermsDays) || DEFAULT_FINANCE_SETTINGS.paymentTermsDays),
    lateFeePercent: Math.max(0, Number(merged.lateFeePercent) || DEFAULT_FINANCE_SETTINGS.lateFeePercent),
    includeTaxInPrices: Boolean(merged.includeTaxInPrices),
    autoGenerateInvoiceNumbers: Boolean(merged.autoGenerateInvoiceNumbers),
    sendPaymentReminders: Boolean(merged.sendPaymentReminders),
  };
};

export const getFinanceSettings = (): FinanceSettingsData => {
  const saved = safeGetItem<Partial<FinanceSettingsData>>(FINANCE_SETTINGS_STORAGE_KEY, DEFAULT_FINANCE_SETTINGS);
  return normalizeFinanceSettings(saved);
};

export const saveFinanceSettings = (settings: Partial<FinanceSettingsData>): FinanceSettingsData => {
  const normalized = normalizeFinanceSettings(settings);
  safeSetItem(FINANCE_SETTINGS_STORAGE_KEY, normalized);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('financeSettingsUpdated'));
  }

  return normalized;
};

export const getFinanceTaxLabel = (rate: number): string => `${FINANCE_DEFAULT_TAX_VALUE} (${clampRate(rate)}%)`;

export const parseTaxPercentage = (taxLabel: string, financeDefaultRate: number): number => {
  if (!taxLabel) return 0;
  if (taxLabel === FINANCE_DEFAULT_TAX_VALUE) return clampRate(financeDefaultRate);

  const match = taxLabel.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : 0;
};
