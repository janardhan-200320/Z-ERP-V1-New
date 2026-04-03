import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, CheckCircle2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ref } from 'react';

interface ProposalItem {
  id: number;
  description: string;
  longDescription?: string;
}

interface TimelinePhase {
  phase: number;
  task: string;
  completionDate: string;
}

interface ProposalTemplateProps {
  proposalId?: string;
  date?: string;
  preparedFor?: string;
  preparedBy?: string;
  title?: string;
  overview?: string;
  scopeOfWork?: ProposalItem[];
  timeline?: TimelinePhase[];
  status?: string;
  customer?: string;
  totalAmount?: string;
  subTotal?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  otherTaxAmount?: number;
  validUntil?: string;
  onAccept?: () => void;
  canAccept?: boolean;
  acceptButtonLabel?: string;
  downloadButtonLabel?: string;
  onDownload?: () => void;
  contentRef?: Ref<HTMLDivElement>;
}

export default function ProposalTemplate({
  proposalId = 'PROP-001',
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  preparedFor = '[Client\'s Name]',
  preparedBy = '[Your Business Name]',
  title = 'BRAND IDENTITY DEVELOPMENT',
  overview = 'This proposal outlines the development of a unique and cohesive brand identity for your business.',
  scopeOfWork = [],
  timeline = [],
  status,
  customer,
  totalAmount,
  subTotal = 0,
  cgstAmount = 0,
  sgstAmount = 0,
  otherTaxAmount = 0,
  validUntil,
  onAccept,
  canAccept = false,
  acceptButtonLabel = 'Accept',
  downloadButtonLabel = 'Print Proposal',
  onDownload,
  contentRef,
}: ProposalTemplateProps) {
  
  const handlePrint = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    window.print();
  };

  return (
    <div className="relative">
      {/* Print Button */}
      <div className="print:hidden mb-4 flex justify-end gap-2">
        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          {downloadButtonLabel}
        </Button>
        {onAccept && (
          <Button
            onClick={onAccept}
            size="sm"
            disabled={!canAccept}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300 disabled:text-slate-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            {acceptButtonLabel}
          </Button>
        )}
      </div>

      <div ref={contentRef} className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-slate-200 max-w-5xl mx-auto print:shadow-none print:border-0">
        {/* Header Section */}
        <div className="pdf-section-header border-b-2 border-slate-900 pb-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">Project</h1>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900">PROPOSAL</h2>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p className="mb-1">Prepared for: <span className="font-semibold">{preparedFor}</span></p>
              <p>Prepared by: <span className="font-semibold">{preparedBy}</span></p>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 mt-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</p>
                <p className="text-sm font-medium text-slate-900">{date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Overview Section */}
        <div className="pdf-section-overview mb-10">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-slate-400">1.</span>
            PROJECT OVERVIEW
          </h3>
          <p className="text-slate-700 leading-relaxed text-justify">{overview}</p>
        </div>

        {/* Scope of Work Section */}
        {scopeOfWork && scopeOfWork.length > 0 && (
          <div className="pdf-section-scope mb-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-slate-400">2.</span>
              SCOPE OF WORK
            </h3>
            <p className="text-slate-700 mb-4">We will provide the following deliverables:</p>
            <ul className="space-y-3">
              {scopeOfWork.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="text-slate-400 mt-1">•</span>
                  <div>
                    <span className="font-semibold text-slate-900">{item.description}</span>
                    {item.longDescription && (
                      <span className="text-slate-700"> – {item.longDescription}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Timeline Section */}
        {timeline && timeline.length > 0 && (
          <div className="pdf-section-timeline mb-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-slate-400">{scopeOfWork && scopeOfWork.length > 0 ? '3.' : '2.'}</span>
              PROJECT TIMELINE
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left py-4 px-6 font-bold">Phase</th>
                    <th className="text-left py-4 px-6 font-bold">Task</th>
                    <th className="text-right py-4 px-6 font-bold">Completion Date</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((phase, index) => (
                    <tr 
                      key={phase.phase} 
                      className={cn(
                        "border-b border-slate-200 last:border-0",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      )}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm">
                            {phase.phase}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{phase.task}</td>
                      <td className="py-4 px-6 text-slate-700 text-right font-medium">{phase.completionDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="pdf-section-billing">
          {/* Additional Information */}
          {(customer || totalAmount || validUntil || subTotal > 0 || cgstAmount > 0 || sgstAmount > 0 || otherTaxAmount > 0) && (
            <div className="mt-12 pt-8 border-t-2 border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {customer && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer</p>
                    <p className="text-lg font-bold text-slate-900">{customer}</p>
                  </div>
                )}
                {totalAmount && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-emerald-600">{totalAmount}</p>
                  </div>
                )}
                {validUntil && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valid Until</p>
                    <p className="text-lg font-bold text-amber-600">{validUntil}</p>
                  </div>
                )}
              </div>

              {(subTotal > 0 || cgstAmount > 0 || sgstAmount > 0 || otherTaxAmount > 0) && (
                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tax Details</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Sub Total</span>
                      <span className="font-semibold">Rs {subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">CGST</span>
                      <span className="font-semibold">Rs {cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">SGST</span>
                      <span className="font-semibold">Rs {sgstAmount.toFixed(2)}</span>
                    </div>
                    {otherTaxAmount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Other Tax</span>
                        <span className="font-semibold">Rs {otherTaxAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Badge */}
          {status && (
            <div className="mt-8 flex justify-end">
              <Badge className={cn(
                "text-sm px-4 py-1",
                status === 'draft' && 'bg-slate-100 text-slate-700 border-slate-200',
                status === 'sent' && 'bg-blue-100 text-blue-700 border-blue-200',
                status === 'accepted' && 'bg-green-100 text-green-700 border-green-200',
                status === 'declined' && 'bg-red-100 text-red-700 border-red-200',
                status === 'expired' && 'bg-amber-100 text-amber-700 border-amber-200'
              )}>
                {status.toUpperCase()}
              </Badge>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              This proposal is valid until {validUntil || 'the specified date'} and subject to the terms and conditions outlined.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
