import { useEffect, useMemo, useRef, useState } from 'react';
import { useRoute } from 'wouter';
import ProposalTemplate from '@/components/ProposalTemplate';
import { FINANCE_DEFAULT_TAX_VALUE, getFinanceSettings, parseTaxPercentage } from '@/lib/finance-settings';
import { getProposalForStandaloneView, updateProposalForStandaloneView } from '@/lib/proposal-view-storage';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, PenLine, Send, Upload } from 'lucide-react';

type ProposalItem = {
  id: number;
  description: string;
  longDescription?: string;
  qty?: number;
  rate?: number;
  tax?: string;
  amount?: number;
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
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [signerName, setSignerName] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const isExpired = useMemo(() => {
    if (!proposal?.validUntil) return false;

    const expiryDate = new Date(proposal.validUntil);
    if (Number.isNaN(expiryDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  }, [proposal?.validUntil]);

  const isSigned = proposal?.status === 'signed';
  const isAccepted = proposal?.status === 'accepted' || isSigned;
  const isDeclined = proposal?.status === 'declined';
  const computedStatus = isSigned ? 'signed' : isAccepted ? 'accepted' : isExpired ? 'expired' : (proposal?.status || 'sent');

  const initializeSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(640, Math.floor(rect.width));
    canvas.height = 220;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    if (isSignDialogOpen && signatureMode === 'draw') {
      requestAnimationFrame(() => initializeSignatureCanvas());
    }
  }, [isSignDialogOpen, signatureMode]);

  const getCanvasPoint = (event: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] || event.changedTouches?.[0] || event;
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    };
  };

  const startDrawing = (event: any) => {
    const point = getCanvasPoint(event);
    if (!point) return;
    setIsDrawing(true);
    lastPointRef.current = point;
  };

  const drawStroke = (event: any) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const point = getCanvasPoint(event);

    if (!canvas || !ctx || !point || !lastPointRef.current) return;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    setSignatureDataUrl(canvas.toDataURL('image/png'));
  };

  const endDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearDrawnSignature = () => {
    initializeSignatureCanvas();
    setSignatureDataUrl('');
  };

  const handleSignatureUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setSignatureDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const proposalItems = useMemo<ProposalItem[]>(() => {
    const sourceItems = Array.isArray(proposal?.items) ? proposal.items : [];

    return sourceItems
      .map((item: any, index: number) => {
        const qty = toNumber(item?.qty) || 1;
        const rate = toNumber(item?.rate);
        const description = (item?.description || item?.item || item?.name || '').toString().trim();

        return {
          id: toNumber(item?.id) || index + 1,
          description,
          longDescription: (item?.longDescription || item?.details || '').toString().trim(),
          qty,
          rate,
          tax: (item?.tax || 'No Tax').toString(),
          amount: toNumber(item?.amount) || (qty * rate),
        };
        })
        .filter((item: ProposalItem) => item.description.length > 0);
  }, [proposal]);

  const summary = useMemo(() => {
    const financeDefaultTaxRate = getFinanceSettings().defaultTaxRate;

    const totals = proposalItems.reduce(
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
  }, [proposalItems]);

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

  const discussionThread = Array.isArray(proposal.discussion) ? proposal.discussion : [
    {
      id: 'seed-company',
      sender: 'company',
      senderName: proposal.preparedBy || 'Company',
      message: 'Thank you for reviewing this proposal. Please share your questions here.',
      timestamp: new Date().toISOString(),
    },
  ];

  const handleAccept = () => {
    if (isAccepted) {
      toast({
        title: 'Already accepted',
        description: isSigned
          ? `Proposal ${proposal.id} has already been signed by the client.`
          : `Proposal ${proposal.id} has already been accepted.`,
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

    if (isDeclined) {
      toast({
        title: 'Proposal declined',
        description: `Proposal ${proposal.id} has been declined and cannot be accepted directly.`,
        variant: 'destructive',
      });
      return;
    }

    setSignerName(proposal.preparedFor || proposal.customer || '');
    setSignatureMode('draw');
    setSignatureDataUrl('');
    setIsSignDialogOpen(true);
  };

  const handleApproveAndSign = () => {
    if (!signerName.trim()) {
      toast({
        title: 'Signer name required',
        description: 'Please enter the client name before signing.',
        variant: 'destructive',
      });
      return;
    }

    if (!signatureDataUrl) {
      toast({
        title: 'Signature required',
        description: 'Please draw or upload a signature to continue.',
        variant: 'destructive',
      });
      return;
    }

    const signedAt = new Date().toISOString();
    const updatedDiscussion = [
      ...discussionThread,
      {
        id: `msg-sign-${Date.now()}`,
        sender: 'system',
        senderName: 'System',
        message: `Client ${signerName.trim()} approved and signed this proposal on ${new Date(signedAt).toLocaleString()}.`,
        timestamp: signedAt,
      },
    ];

    const updated = updateProposalForStandaloneView(proposal.id, {
      status: 'signed',
      acceptedAt: proposal.acceptedAt || signedAt,
      signedAt,
      clientSignature: {
        signerName: signerName.trim(),
        method: signatureMode,
        imageDataUrl: signatureDataUrl,
      },
      discussion: updatedDiscussion,
    });

    if (updated) {
      setProposal(updated);
    }

    setIsSignDialogOpen(false);

    toast({
      title: 'Proposal signed and sent',
      description: `Proposal ${proposal.id} was signed by ${signerName.trim()} and sent back to the company.`,
    });
  };

  const handleDecline = () => {
    if (isDeclined) {
      toast({
        title: 'Already declined',
        description: `Proposal ${proposal.id} has already been declined.`,
      });
      return;
    }

    if (isAccepted) {
      toast({
        title: 'Proposal accepted',
        description: `Proposal ${proposal.id} has already been accepted/signed and cannot be declined.`,
        variant: 'destructive',
      });
      return;
    }

    const updated = updateProposalForStandaloneView(proposal.id, {
      status: 'declined',
      declinedAt: new Date().toISOString(),
    });

    if (updated) {
      setProposal(updated);
    }

    toast({
      title: 'Proposal declined',
      description: `Proposal ${proposal.id} has been declined.`,
    });
  };

  const handleSendDiscussionMessage = () => {
    const message = discussionMessage.trim();
    if (!message) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      senderName: proposal.preparedFor || proposal.customer || 'Client',
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedThread = [...discussionThread, newMessage];
    const updated = updateProposalForStandaloneView(proposal.id, {
      discussion: updatedThread,
    });

    if (updated) {
      setProposal(updated);
    }

    setDiscussionMessage('');
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
        target.querySelector('.pdf-section-items') as HTMLElement | null,
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
      <div className="mx-auto max-w-[1500px] grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
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
          items={proposalItems}
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
          onDecline={handleDecline}
          canAccept={!isExpired && !isAccepted && !isDeclined}
          canDecline={!isExpired && !isAccepted && !isDeclined}
          acceptButtonLabel={isSigned ? 'Signed' : isAccepted ? 'Accepted' : isExpired ? 'Expired' : 'Accept'}
          declineButtonLabel={isDeclined ? 'Declined' : 'Decline'}
        />

        <Card className="xl:sticky xl:top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Proposal Side Panel</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4 mt-4">
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">{proposal.preparedBy || 'Company Name'}</p>
                  <p>{proposal.companyAddress || proposal.address || 'Company address not provided'}</p>
                  <p>{proposal.companyCity || proposal.city || ''}</p>
                  <p className="pt-1">GSTIN: {proposal.companyGstin || proposal.gstin || 'Not provided'}</p>
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <h4 className="font-semibold text-slate-900">Proposal Information</h4>
                  <p className="text-slate-700">{proposal.preparedFor || proposal.customer}</p>
                  {(proposal.customerAddress || proposal.address) && (
                    <p className="text-slate-600">{proposal.customerAddress || proposal.address}</p>
                  )}
                  {proposal.customerPhone && <p className="text-slate-600">{proposal.customerPhone}</p>}
                  {proposal.customerEmail && <p className="text-slate-600">{proposal.customerEmail}</p>}
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <p className="font-bold text-lg text-slate-900">Total {proposal.totalAmount || 'N/A'}</p>
                  <div className="grid grid-cols-2 gap-y-1 text-slate-600">
                    <span>Status</span>
                    <span className="font-medium text-slate-800 capitalize">{computedStatus}</span>
                    <span>Date</span>
                    <span className="font-medium text-slate-800">{proposal.date}</span>
                    <span>Open Till</span>
                    <span className="font-medium text-slate-800">{proposal.validUntil || '-'}</span>
                    <span>Project</span>
                    <span className="font-medium text-slate-800">{proposal.title || proposal.subject || '-'}</span>
                  </div>
                </div>

                {proposal.clientSignature && (
                  <div className="border-t pt-3 space-y-2 text-sm">
                    <h4 className="font-semibold text-slate-900">Client Signature</h4>
                    <p className="text-slate-700">Signed by: {proposal.clientSignature.signerName}</p>
                    {proposal.signedAt && (
                      <p className="text-slate-600">Signed at: {new Date(proposal.signedAt).toLocaleString()}</p>
                    )}
                    {proposal.clientSignature.imageDataUrl && (
                      <img
                        src={proposal.clientSignature.imageDataUrl}
                        alt="Client signature"
                        className="h-16 w-full object-contain border rounded bg-white p-1"
                      />
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="discussion" className="mt-4 space-y-3">
                <ScrollArea className="h-72 rounded border p-3">
                  <div className="space-y-3">
                    {discussionThread.map((message: any) => {
                      const isClient = message.sender === 'client';
                      return (
                        <div key={message.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${isClient ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            <p className="text-xs opacity-80 mb-1">{message.senderName}</p>
                            <p>{message.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="space-y-2">
                  <Label htmlFor="discussion-message" className="text-sm">Send a message</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discussion-message"
                      placeholder="Type your message..."
                      value={discussionMessage}
                      onChange={(e) => setDiscussionMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendDiscussionMessage();
                        }
                      }}
                    />
                    <Button size="icon" onClick={handleSendDiscussionMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Discussion is saved with this proposal.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve and Sign Proposal</DialogTitle>
            <DialogDescription>
              Confirm approval by entering client name and adding signature.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-signer-name">Client Name</Label>
              <Input
                id="client-signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={signatureMode === 'draw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSignatureMode('draw');
                  setSignatureDataUrl('');
                }}
              >
                <PenLine className="h-4 w-4 mr-2" />
                Draw Signature
              </Button>
              <Button
                type="button"
                variant={signatureMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSignatureMode('upload');
                  setSignatureDataUrl('');
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Signature
              </Button>
            </div>

            {signatureMode === 'draw' ? (
              <div className="space-y-2">
                <div className="rounded border bg-white p-2">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-[220px] touch-none cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={drawStroke}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawStroke}
                    onTouchEnd={endDrawing}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={clearDrawnSignature}>Clear</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input type="file" accept="image/*" onChange={handleSignatureUpload} />
                {signatureDataUrl && (
                  <img
                    src={signatureDataUrl}
                    alt="Uploaded signature"
                    className="h-28 w-full object-contain rounded border bg-white p-2"
                  />
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleApproveAndSign}>
                Approve and Sign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
