import { safeGetItem, safeSetItem } from '@/lib/storage';

const CUSTOMER_VIEW_STORAGE_KEY = 'customers.customerViewData';
export const CUSTOMER_VIEW_UPDATED_EVENT = 'customerViewUpdated';

type CustomerViewStore = Record<string, any>;

export const saveCustomerForStandaloneView = (customer: any) => {
  if (!customer?.id) return;

  const existing = safeGetItem<CustomerViewStore>(CUSTOMER_VIEW_STORAGE_KEY, {});
  const updated: CustomerViewStore = {
    ...existing,
    [customer.id]: customer,
  };

  safeSetItem(CUSTOMER_VIEW_STORAGE_KEY, updated);
  window.dispatchEvent(new Event(CUSTOMER_VIEW_UPDATED_EVENT));
};

export const getAllCustomersForStandaloneView = (): CustomerViewStore => {
  return safeGetItem<CustomerViewStore>(CUSTOMER_VIEW_STORAGE_KEY, {});
};

export const getCustomerForStandaloneView = (customerId: string) => {
  if (!customerId) return null;

  const stored = safeGetItem<CustomerViewStore>(CUSTOMER_VIEW_STORAGE_KEY, {});
  return stored[customerId] ?? null;
};

export const updateCustomerForStandaloneView = (
  customerId: string,
  updates: Record<string, any>,
) => {
  if (!customerId) return null;

  const stored = safeGetItem<CustomerViewStore>(CUSTOMER_VIEW_STORAGE_KEY, {});
  const existing = stored[customerId];
  if (!existing) return null;

  const updatedRecord = {
    ...existing,
    ...updates,
  };

  safeSetItem(CUSTOMER_VIEW_STORAGE_KEY, {
    ...stored,
    [customerId]: updatedRecord,
  });
  window.dispatchEvent(new Event(CUSTOMER_VIEW_UPDATED_EVENT));

  return updatedRecord;
};
