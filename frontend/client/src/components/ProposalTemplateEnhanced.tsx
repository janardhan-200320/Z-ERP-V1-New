import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Mail, Phone, MapPin, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface ProposalItem {
  id: number;
  description: string;
  longDescription?: string;
  qty?: number;
  rate?: number;
  amount?: number;
}

interface TimelinePhase {
  phase: number;
  task: string;
  completionDate: string;
}

interface CompanyInfo {
  name?: string;
  tagline?: string;
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
}

interface CustomerInfo {
  name?: string;
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
}

interface ProposalTemplateEnhancedProps {
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
  validUntil?: string;
  company?: CompanyInfo;
  customerInfo?: CustomerInfo;
  items?: ProposalItem[];
  subTotal?: number;
  discount?: number;
  total?: number;
  terms?: string[];
  currency?: string;
  saleAgent?: string;
}

export default function ProposalTemplateEnhanced({
  proposalId = 'PROP-001',
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  preparedFor = '[Client\'s Name]',
  preparedBy = '[Your Business Name]',
  title = 'PROJECT PROPOSAL',
  overview = 'This proposal outlines our comprehensive solution for your business needs.',
  scopeOfWork = [],
  timeline = [],
  status,
  customer,
  totalAmount,
  validUntil,
  company = {
    name: 'ZOLLID',
    tagline: 'ZOLLID BRANDING SOLUTIONS PVT. LTD.',
    address: 'Office Address',
    city: 'Main Street, Your Location',
    email: 'info@yourcompany.com',
    phone: '+1 234 567 890',
    website: 'www.yourcompany.com'
  },
  customerInfo = {
    name: preparedFor,
    address: 'Client Address',
    city: 'Client Location',
    email: 'client@email.com',
    phone: '+1 234 567 890'
  },
  items = [],
  subTotal = 0,
  discount = 0,
  total = 0,
  terms = [
    'Payment terms: 50% upfront, 50% upon completion',
    'All deliverables are subject to client approval',
    'Revisions beyond the agreed scope will be billed separately'
  ],
  currency = '$',
  saleAgent = 'Sales Representative'
}: ProposalTemplateEnhancedProps) {
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const qrData = `Proposal: ${proposalId} - ${company.name} - Amount: ${currency}${total}`;
    QRCode.toDataURL(qrData, {
      width: 100,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(url => {
      setQrCodeDataUrl(url);
    }).catch(() => {
      setQrCodeDataUrl('');
    });
  }, [proposalId, company.name, currency, total]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative">
      {/* Print Buttons */}
      <div className="print:hidden mb-4 flex justify-end gap-2">
        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button onClick={handlePrint} variant="default" size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Proposal Template */}
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-slate-200 max-w-5xl mx-auto print:shadow-none print:border-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-indigo-600">
          <div>
            <h1 className="text-4xl font-black text-indigo-600 mb-1">{company.name}</h1>
            <p className="text-sm text-slate-600 font-medium">{company.tagline}</p>
            <div className="mt-4 text-sm text-slate-600 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                {company.address}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                {company.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {company.phone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg mb-3">
              <h2 className="text-2xl font-black">PROPOSAL</h2>
            </div>
            <div className="text-sm text-slate-700 space-y-1">
              <p><span className="font-semibold">Proposal No:</span> {proposalId}</p>
              <p><span className="font-semibold">Date:</span> {date}</p>
              <p><span className="font-semibold">Valid Until:</span> {validUntil}</p>
              {status && (
                <Badge className={cn(
                  "mt-2",
                  status === 'draft' && 'bg-slate-100 text-slate-700',
                  status === 'sent' && 'bg-blue-100 text-blue-700',
                  status === 'accepted' && 'bg-green-100 text-green-700',
                  status === 'declined' && 'bg-red-100 text-red-700'
                )}>
                  {status.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Client and Company Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Prepared For:</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-900 mb-2">{customerInfo.name}</p>
              <div className="text-sm text-slate-600 space-y-1">
                <p>{customerInfo.address}</p>
                <p>{customerInfo.city}</p>
                {customerInfo.email && (
                  <p className="flex items-center gap-2 mt-2">
                    <Mail className="h-3 w-3" />
                    {customerInfo.email}
                  </p>
                )}
                {customerInfo.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {customerInfo.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Prepared By:</h3>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="font-bold text-indigo-900 mb-2">{company.name}</p>
              <div className="text-sm text-indigo-700 space-y-1">
                <p>{company.address}</p>
                <p>{company.city}</p>
                <p className="mt-2 font-semibold">Sales Agent: {saleAgent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-wide">{title}</h2>
          <div className="h-1 w-32 bg-indigo-600 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Project Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
            <span className="text-indigo-600">1.</span>
            PROJECT OVERVIEW
          </h3>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <p className="text-slate-700 leading-relaxed">{overview}</p>
          </div>
        </div>

        {/* Scope of Work */}
        {scopeOfWork && scopeOfWork.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              <span className="text-indigo-600">2.</span>
              SCOPE OF WORK
            </h3>
            <div className="space-y-3">
              {scopeOfWork.map((item, index) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{item.description}</h4>
                    {item.longDescription && (
                      <p className="text-sm text-slate-600">{item.longDescription}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items/Services Table */}
        {items && items.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              <span className="text-indigo-600">{scopeOfWork && scopeOfWork.length > 0 ? '3.' : '2.'}</span>
              PRICING BREAKDOWN
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <Table>
                <TableHeader className="bg-indigo-600">
                  <TableRow>
                    <TableHead className="text-white font-bold">#</TableHead>
                    <TableHead className="text-white font-bold">Description</TableHead>
                    <TableHead className="text-white font-bold text-center">Qty</TableHead>
                    <TableHead className="text-white font-bold text-right">Rate</TableHead>
                    <TableHead className="text-white font-bold text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <TableCell className="font-semibold">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900">{item.description}</div>
                        {item.longDescription && (
                          <div className="text-xs text-slate-600 mt-1">{item.longDescription}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{item.qty || 1}</TableCell>
                      <TableCell className="text-right">{currency}{(item.rate || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">{currency}{(item.amount || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Project Timeline */}
        {timeline && timeline.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              <span className="text-indigo-600">
                {items && items.length > 0 ? (scopeOfWork && scopeOfWork.length > 0 ? '4.' : '3.') : (scopeOfWork && scopeOfWork.length > 0 ? '3.' : '2.')}
              </span>
              PROJECT TIMELINE
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <Table>
                <TableHeader className="bg-indigo-600">
                  <TableRow>
                    <TableHead className="text-white font-bold">Phase</TableHead>
                    <TableHead className="text-white font-bold">Task</TableHead>
                    <TableHead className="text-white font-bold text-right">Completion Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeline.map((phase, index) => (
                    <TableRow key={phase.phase} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm">
                            {phase.phase}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{phase.task}</TableCell>
                      <TableCell className="text-right font-medium text-slate-700">{phase.completionDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Totals Section */}
        {(subTotal > 0 || total > 0) && (
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Authorised Signature</h3>
              <div className="h-24 border-b-2 border-slate-300"></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Sub Total</span>
                <span className="text-sm font-bold">{currency}{subTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-700">Discount</span>
                  <span className="text-sm font-bold text-red-600">-{currency}{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 pb-2 border-b-2 border-indigo-600">
                <span className="text-base font-bold text-slate-900">Total Amount</span>
                <span className="text-lg font-black text-indigo-600">{currency}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Terms and QR Code */}
        {terms && terms.length > 0 && (
          <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-200 mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Proposal QR Code</h3>
              <div className="flex gap-4">
                <div className="w-24 h-24 border-2 border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden rounded-lg">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Proposal QR Code" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="text-xs text-center text-slate-400">QR Code</div>
                  )}
                </div>
                <div className="text-xs text-slate-600 flex flex-col justify-center">
                  <p className="font-semibold mb-1">Scan for details</p>
                  <p>Quick access to proposal</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Terms & Conditions:</h3>
              <div className="text-xs text-slate-600 space-y-2">
                {terms.map((term, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t-2 border-slate-200">
          <p className="text-base font-semibold text-slate-900 mb-2">Thank you for considering our proposal!</p>
          <p className="text-sm text-slate-600">
            For any questions regarding this proposal, please contact us at {company.email}
          </p>
          <p className="text-xs text-slate-500 mt-3">
            This proposal is valid until {validUntil || 'the specified date'} and subject to the terms and conditions outlined.
          </p>
        </div>
      </div>
    </div>
  );
}
