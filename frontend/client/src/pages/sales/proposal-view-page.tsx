import { useMemo } from 'react';
import { useRoute } from 'wouter';
import ProposalTemplateEnhanced from '@/components/ProposalTemplateEnhanced';
import { FINANCE_DEFAULT_TAX_VALUE, getFinanceSettings, parseTaxPercentage } from '@/lib/finance-settings';
import { getProposalForStandaloneView } from '@/lib/proposal-view-storage';

type ProposalItem = {
  id: number;
  description: string;
  longDescription?: string;
  qty?: number;
  rate?: number;
  tax?: string;
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getTaxSplit = (taxLabel: string, financeDefaultTaxRate: number) => {
  const rate = parseTaxPercentage(taxLabel, financeDefaultTaxRate);

  if (taxLabel === FINANCE_DEFAULT_TAX_VALUE || (taxLabel.includes('GST') && !taxLabel.includes('IGST'))) {
    return {
      cgstPercent: rate / 2,
      sgstPercent: rate / 2,
      otherPercent: 0,
    };
  }

  return {
    cgstPercent: 0,
    sgstPercent: 0,
    otherPercent: rate,
  };
};

export default function ProposalViewPage() {
  const [, params] = useRoute('/proposal-view/:id');
  const proposalId = params?.id || '';

  const proposal = useMemo(() => getProposalForStandaloneView(proposalId), [proposalId]);

  const summary = useMemo(() => {
    const items: ProposalItem[] = Array.isArray(proposal?.items) ? proposal.items : [];
    const financeDefaultTaxRate = getFinanceSettings().defaultTaxRate;

    const totals = items.reduce(
      (acc, item) => {
        const qty = toNumber(item.qty) || 1;
        const rate = toNumber(item.rate);
        const taxable = qty * rate;
        const taxRates = getTaxSplit(item.tax || 'No Tax', financeDefaultTaxRate);

        acc.subTotal += taxable;
        acc.cgstAmount += taxable * taxRates.cgstPercent / 100;
        acc.sgstAmount += taxable * taxRates.sgstPercent / 100;
        acc.otherTaxAmount += taxable * taxRates.otherPercent / 100;
        return acc;
      },
      { subTotal: 0, cgstAmount: 0, sgstAmount: 0, otherTaxAmount: 0 },
    );

    const parsedTotal = toNumber(proposal?.totalAmount);
    const calculatedTotal = totals.subTotal + totals.cgstAmount + totals.sgstAmount + totals.otherTaxAmount;

    return {
      ...totals,
      total: parsedTotal > 0 ? parsedTotal : calculatedTotal,
    };
  }, [proposal]);

  if (!proposal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-xl text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Proposal not available</h1>
          <p className="text-slate-600">
            This proposal view is not available in local storage. Open it again from the Proposals list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <ProposalTemplateEnhanced
        proposalId={proposal.id}
        date={new Date(proposal.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        preparedFor={proposal.preparedFor || proposal.customer}
        preparedBy={proposal.preparedBy || 'Your Business Name'}
        title={proposal.title || proposal.subject}
        overview={proposal.overview}
        scopeOfWork={proposal.scopeOfWork || []}
        timeline={proposal.timeline || []}
        status={proposal.status}
        customer={proposal.customer}
        totalAmount={proposal.totalAmount}
        validUntil={proposal.validUntil}
        company={{
          name: 'ZOLLID',
          tagline: 'ZOLLID BRANDING SOLUTIONS PVT. LTD.',
          address: 'Office Address',
          city: 'Main Street, Your Location',
          email: 'info@yourcompany.com',
          phone: '+1 234 567 890',
          website: 'www.yourcompany.com',
        }}
        customerInfo={{
          name: proposal.customer,
          address: 'Client Address',
          city: 'Client Location',
          email: 'client@email.com',
          phone: '+1 234 567 890',
        }}
        items={proposal.items || []}
        subTotal={summary.subTotal}
        cgstAmount={summary.cgstAmount}
        sgstAmount={summary.sgstAmount}
        otherTaxAmount={summary.otherTaxAmount}
        discount={0}
        total={summary.total}
        terms={[
          'Payment terms: 50% upfront, 50% upon completion',
          'All deliverables are subject to client approval',
          'Revisions beyond the agreed scope will be billed separately',
          'Project timeline is subject to timely feedback and approvals',
        ]}
        currency="$"
        saleAgent="Zeruns ERP Admin"
      />
    </div>
  );
}
