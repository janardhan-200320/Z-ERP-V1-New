import { safeGetItem, safeSetItem } from '@/lib/storage';

export const FINANCE_SETTINGS_STORAGE_KEY = 'zervos_finance_settings';
const FINANCE_CURRENCY_MIGRATION_KEY = 'zervos_finance_currency_migrated_v1';
export const FINANCE_DEFAULT_TAX_VALUE = 'Finance Default Tax';

export type FinanceSettingsData = {
  defaultCurrency: string;
  currencyFormat: string;
  defaultTaxRate: number;
  gstRateMode: 'auto' | 'custom';
  gstCustomRate: number;
  cgstTaxOption: string;
  sgstTaxOption: string;
  cgstCustomRate: number;
  sgstCustomRate: number;
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
  defaultCurrency: 'INR',
  currencyFormat: 'symbol',
  defaultTaxRate: 10,
  gstRateMode: 'auto',
  gstCustomRate: 18,
  cgstTaxOption: '9',
  sgstTaxOption: '9',
  cgstCustomRate: 0,
  sgstCustomRate: 0,
  includeTaxInPrices: false,
  taxNumber: 'US123456789',
  invoicePrefix: 'INV-',
  invoiceStartNumber: 1000,
  paymentTermsDays: 30,
  lateFeePercent: 5,
  autoGenerateInvoiceNumbers: true,
  sendPaymentReminders: true,
};

export type CurrencyOption = {
  code: string;
  label: string;
};

const clampRate = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_FINANCE_SETTINGS.defaultTaxRate;
  return Math.min(100, Math.max(0, value));
};

const normalizeFinanceSettings = (settings: Partial<FinanceSettingsData> | null | undefined): FinanceSettingsData => {
  const merged = { ...DEFAULT_FINANCE_SETTINGS, ...(settings || {}) };
  return {
    ...merged,
    defaultCurrency: String(merged.defaultCurrency || DEFAULT_FINANCE_SETTINGS.defaultCurrency).toUpperCase(),
    defaultTaxRate: clampRate(Number(merged.defaultTaxRate)),
    gstRateMode: merged.gstRateMode === 'custom' ? 'custom' : 'auto',
    gstCustomRate: clampRate(Number(merged.gstCustomRate)),
    cgstTaxOption: String(merged.cgstTaxOption || DEFAULT_FINANCE_SETTINGS.cgstTaxOption),
    sgstTaxOption: String(merged.sgstTaxOption || DEFAULT_FINANCE_SETTINGS.sgstTaxOption),
    cgstCustomRate: clampRate(Number(merged.cgstCustomRate)),
    sgstCustomRate: clampRate(Number(merged.sgstCustomRate)),
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
  const normalized = normalizeFinanceSettings(saved);
  const migrated = safeGetItem<boolean>(FINANCE_CURRENCY_MIGRATION_KEY, false);

  if (!migrated && normalized.defaultCurrency === 'USD') {
    const updated = {
      ...normalized,
      defaultCurrency: 'INR',
    };
    safeSetItem(FINANCE_SETTINGS_STORAGE_KEY, updated);
    safeSetItem(FINANCE_CURRENCY_MIGRATION_KEY, true);
    return updated;
  }

  if (!migrated) {
    safeSetItem(FINANCE_CURRENCY_MIGRATION_KEY, true);
  }

  return normalized;
};

export const saveFinanceSettings = (settings: Partial<FinanceSettingsData>): FinanceSettingsData => {
  const normalized = normalizeFinanceSettings(settings);
  safeSetItem(FINANCE_SETTINGS_STORAGE_KEY, normalized);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('financeSettingsUpdated'));
  }

  return normalized;
};

export const getCurrencyOptions = (): CurrencyOption[] => {
  const fallback: CurrencyOption[] = [
    { code: 'INR', label: 'INR - Indian Rupee' },
    { code: 'USD', label: 'USD - US Dollar' },
    { code: 'EUR', label: 'EUR - Euro' },
    { code: 'GBP', label: 'GBP - British Pound' },
    { code: 'JPY', label: 'JPY - Japanese Yen' },
  ];

  try {
    const intlAny = Intl as any;
    const supported: string[] | undefined = intlAny.supportedValuesOf?.('currency');
    if (!supported || supported.length === 0) {
      return fallback;
    }

    const displayNames = intlAny.DisplayNames
      ? new intlAny.DisplayNames(['en'], { type: 'currency' })
      : null;

    return supported
      .map((code) => {
        const upperCode = String(code).toUpperCase();
        const currencyName = displayNames?.of?.(upperCode) || upperCode;
        return {
          code: upperCode,
          label: `${upperCode} - ${currencyName}`,
        };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  } catch {
    return fallback;
  }
};

export const getFinanceTaxLabel = (rate: number): string => `${FINANCE_DEFAULT_TAX_VALUE} (${clampRate(rate)}%)`;

export const parseTaxPercentage = (taxLabel: string, financeDefaultRate: number): number => {
  if (!taxLabel) return 0;
  if (taxLabel === FINANCE_DEFAULT_TAX_VALUE) return clampRate(financeDefaultRate);

  const match = taxLabel.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : 0;
};
