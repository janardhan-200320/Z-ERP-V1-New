import { useMemo, useRef, useState } from 'react';
import { useRoute } from 'wouter';
import ProposalTemplate from '@/components/ProposalTemplate';
import { FINANCE_DEFAULT_TAX_VALUE, getFinanceSettings, parseTaxPercentage } from '@/lib/finance-settings';
import { getProposalForStandaloneView, updateProposalForStandaloneView } from '@/lib/proposal-view-storage';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const { toast } = useToast();

  const [proposal, setProposal] = useState(() => getProposalForStandaloneView(proposalId));
  const proposalContentRef = useRef<HTMLDivElement | null>(null);

  const isExpired = useMemo(() => {
    if (!proposal?.validUntil) return false;

    const expiryDate = new Date(proposal.validUntil);
    if (Number.isNaN(expiryDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  }, [proposal?.validUntil]);

  const isAccepted = proposal?.status === 'accepted';
  const computedStatus = isAccepted ? 'accepted' : isExpired ? 'expired' : (proposal?.status || 'sent');

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

    return totals;
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

  const handleAccept = () => {
    if (isAccepted) {
      toast({
        title: 'Already accepted',
        description: `Proposal ${proposal.id} has already been accepted.`,
      });
      return;
    }

    if (isExpired) {
      toast({
        title: 'Proposal expired',
        description: `Proposal ${proposal.id} can no longer be accepted after ${proposal.validUntil}.`,
        variant: 'destructive',
      });
      return;
    }

    const updated = updateProposalForStandaloneView(proposal.id, {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
    });

    if (updated) {
      setProposal(updated);
    }

    toast({
      title: 'Proposal accepted',
      description: `Thank you. Proposal ${proposal.id} has been accepted successfully.`,
    });
  };

  const handleDownload = async () => {
    const target = proposalContentRef.current;
    if (!target) {
      toast({
        title: 'Download failed',
        description: 'Proposal content is not ready yet. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginTop = 10;
      const marginBottom = 10;
      const marginLeft = 8;
      const marginRight = 8;
      const printableWidth = pageWidth - marginLeft - marginRight;
      const printableHeight = pageHeight - marginTop - marginBottom;
      let cursorY = marginTop;

      const toCanvas = async (element: HTMLElement) => html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const addCanvasWithPaging = (
        sourceCanvas: HTMLCanvasElement,
        options: { forceNewPage?: boolean; keepTogether?: boolean } = {},
      ) => {
        if (options.forceNewPage && cursorY > marginTop) {
          pdf.addPage();
          cursorY = marginTop;
        }

        const pxPerMm = sourceCanvas.width / printableWidth;
        const sectionHeightMm = sourceCanvas.height / pxPerMm;

        if (options.keepTogether && sectionHeightMm <= printableHeight && cursorY + sectionHeightMm > pageHeight - marginBottom) {
          pdf.addPage();
          cursorY = marginTop;
        }

        let sourceY = 0;
        while (sourceY < sourceCanvas.height) {
          let remainingMmOnPage = pageHeight - marginBottom - cursorY;
          if (remainingMmOnPage <= 0.5) {
            pdf.addPage();
            cursorY = marginTop;
            remainingMmOnPage = pageHeight - marginBottom - cursorY;
          }

          const chunkHeightPx = Math.min(
            Math.floor(remainingMmOnPage * pxPerMm),
            sourceCanvas.height - sourceY,
          );

          if (chunkHeightPx <= 0) {
            pdf.addPage();
            cursorY = marginTop;
            continue;
          }

          const chunkCanvas = document.createElement('canvas');
          chunkCanvas.width = sourceCanvas.width;
          chunkCanvas.height = chunkHeightPx;

          const chunkContext = chunkCanvas.getContext('2d');
          if (!chunkContext) {
            throw new Error('Could not prepare PDF page chunk');
          }

          chunkContext.drawImage(
            sourceCanvas,
            0,
            sourceY,
            sourceCanvas.width,
            chunkHeightPx,
            0,
            0,
            sourceCanvas.width,
            chunkHeightPx,
          );

          const chunkHeightMm = chunkHeightPx / pxPerMm;
          pdf.addImage(
            chunkCanvas.toDataURL('image/png'),
            'PNG',
            marginLeft,
            cursorY,
            printableWidth,
            chunkHeightMm,
            undefined,
            'FAST',
          );

          cursorY += chunkHeightMm;
          sourceY += chunkHeightPx;

          if (sourceY < sourceCanvas.height) {
            pdf.addPage();
            cursorY = marginTop;
          }
        }
      };

      const sectionElements = [
        target.querySelector('.pdf-section-header') as HTMLElement | null,
        target.querySelector('.pdf-section-overview') as HTMLElement | null,
        target.querySelector('.pdf-section-scope') as HTMLElement | null,
        target.querySelector('.pdf-section-timeline') as HTMLElement | null,
      ].filter((section): section is HTMLElement => Boolean(section));

      for (const section of sectionElements) {
        const sectionCanvas = await toCanvas(section);
        addCanvasWithPaging(sectionCanvas, { keepTogether: false });
      }

      const billingSection = target.querySelector('.pdf-section-billing') as HTMLElement | null;
      if (billingSection) {
        const billingCanvas = await toCanvas(billingSection);
        addCanvasWithPaging(billingCanvas, { forceNewPage: true, keepTogether: true });
      }

      pdf.save(`Proposal_${proposal.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Unable to generate PDF from the current proposal view.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <ProposalTemplate
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
        status={computedStatus}
        customer={proposal.customer}
        totalAmount={proposal.totalAmount}
        validUntil={proposal.validUntil}
        subTotal={summary.subTotal}
        cgstAmount={summary.cgstAmount}
        sgstAmount={summary.sgstAmount}
        otherTaxAmount={summary.otherTaxAmount}
        downloadButtonLabel="Download"
        onDownload={handleDownload}
        contentRef={proposalContentRef}
        onAccept={handleAccept}
        canAccept={!isExpired && !isAccepted}
        acceptButtonLabel={isAccepted ? 'Accepted' : isExpired ? 'Expired' : 'Accept'}
      />
    </div>
  );
}
