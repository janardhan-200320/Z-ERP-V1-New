/**
 * API Client for Sales Module
 * Provides functions for proposals, estimates, invoices, payments, and credit notes
 */

import { supabase } from './superbase';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const buildHeaders = async () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
};

const requestJson = async <T>(path: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> => {
  const headers = await buildHeaders();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }

  if (!response.ok) {
    return { error: body?.error || response.statusText || 'Request failed' };
  }

  return { data: body as T };
};

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface SalesProposal {
  id?: string;
  subject: string;
  customer: string;
  project?: string;
  prepared_for?: string;
  prepared_by?: string;
  date: string;
  valid_until?: string;
  currency: string;
  overview?: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  amount?: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  notes?: string;
  allow_comments?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SalesEstimate {
  id?: string;
  estimate_number?: string;
  customer: string;
  bill_to?: string;
  ship_to?: string;
  estimate_date: string;
  expiry_date?: string;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  payment_mode?: string;
  bank_account_id?: string;
  signature_id?: string;
  signature_designation?: string;
  sale_agent?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  notes?: string;
  line_items?: any[];
  total_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SalesInvoice {
  id?: string;
  invoice_number?: string;
  customer: string;
  bill_to?: string;
  ship_to?: string;
  invoice_date: string;
  due_date?: string;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_mode?: string;
  bank_account_id?: string;
  signature_id?: string;
  signature_designation?: string;
  sale_agent?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  notes?: string;
  line_items?: any[];
  total_amount?: number;
  amount_paid?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SalesPayment {
  id?: string;
  record_invoice_id: string;
  amount: number;
  payment_mode?: string;
  payment_date: string;
  transaction_id?: string;
  notes?: string;
  signature_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SalesCreditNote {
  id?: string;
  credit_note_number?: string;
  customer: string;
  related_invoice_id?: string;
  credit_note_date: string;
  currency: string;
  reason?: string;
  notes?: string;
  line_items?: any[];
  total_amount?: number;
  status: 'draft' | 'issued' | 'used' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// PROPOSALS API
// =====================================================

export const getProposals = async () => {
  return requestJson<SalesProposal[]>('/sales/proposals');
};

export const getProposal = async (id: string) => {
  return requestJson<SalesProposal>(`/sales/proposals/${id}`);
};

export const createProposal = async (proposal: SalesProposal) => {
  return requestJson<SalesProposal>('/sales/proposals', {
    method: 'POST',
    body: JSON.stringify(proposal),
  });
};

export const updateProposal = async (id: string, proposal: Partial<SalesProposal>) => {
  return requestJson<SalesProposal>(`/sales/proposals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(proposal),
  });
};

export const deleteProposal = async (id: string) => {
  return requestJson(`/sales/proposals/${id}`, {
    method: 'DELETE',
  });
};

// =====================================================
// ESTIMATES API
// =====================================================

export const getEstimates = async () => {
  return requestJson<SalesEstimate[]>('/sales/estimates');
};

export const getEstimate = async (id: string) => {
  return requestJson<SalesEstimate>(`/sales/estimates/${id}`);
};

export const createEstimate = async (estimate: SalesEstimate) => {
  return requestJson<SalesEstimate>('/sales/estimates', {
    method: 'POST',
    body: JSON.stringify(estimate),
  });
};

export const updateEstimate = async (id: string, estimate: Partial<SalesEstimate>) => {
  return requestJson<SalesEstimate>(`/sales/estimates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(estimate),
  });
};

export const deleteEstimate = async (id: string) => {
  return requestJson(`/sales/estimates/${id}`, {
    method: 'DELETE',
  });
};

// =====================================================
// INVOICES API
// =====================================================

export const getInvoices = async () => {
  return requestJson<SalesInvoice[]>('/sales/invoices');
};

export const getInvoice = async (id: string) => {
  return requestJson<SalesInvoice>(`/sales/invoices/${id}`);
};

export const createInvoice = async (invoice: SalesInvoice) => {
  return requestJson<SalesInvoice>('/sales/invoices', {
    method: 'POST',
    body: JSON.stringify(invoice),
  });
};

export const updateInvoice = async (id: string, invoice: Partial<SalesInvoice>) => {
  return requestJson<SalesInvoice>(`/sales/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoice),
  });
};

export const deleteInvoice = async (id: string) => {
  return requestJson(`/sales/invoices/${id}`, {
    method: 'DELETE',
  });
};

// =====================================================
// PAYMENTS API
// =====================================================

export const getPayments = async () => {
  return requestJson<SalesPayment[]>('/sales/payments');
};

export const getPayment = async (id: string) => {
  return requestJson<SalesPayment>(`/sales/payments/${id}`);
};

export const createPayment = async (payment: SalesPayment) => {
  return requestJson<SalesPayment>('/sales/payments', {
    method: 'POST',
    body: JSON.stringify(payment),
  });
};

export const updatePayment = async (id: string, payment: Partial<SalesPayment>) => {
  return requestJson<SalesPayment>(`/sales/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payment),
  });
};

export const deletePayment = async (id: string) => {
  return requestJson(`/sales/payments/${id}`, {
    method: 'DELETE',
  });
};

// =====================================================
// CREDIT NOTES API
// =====================================================

export const getCreditNotes = async () => {
  return requestJson<SalesCreditNote[]>('/sales/credit-notes');
};

export const getCreditNote = async (id: string) => {
  return requestJson<SalesCreditNote>(`/sales/credit-notes/${id}`);
};

export const createCreditNote = async (creditNote: SalesCreditNote) => {
  return requestJson<SalesCreditNote>('/sales/credit-notes', {
    method: 'POST',
    body: JSON.stringify(creditNote),
  });
};

export const updateCreditNote = async (id: string, creditNote: Partial<SalesCreditNote>) => {
  return requestJson<SalesCreditNote>(`/sales/credit-notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(creditNote),
  });
};

export const deleteCreditNote = async (id: string) => {
  return requestJson(`/sales/credit-notes/${id}`, {
    method: 'DELETE',
  });
};
