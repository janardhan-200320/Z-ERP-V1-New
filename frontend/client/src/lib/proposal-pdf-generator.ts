import jsPDF from 'jspdf';

interface ProposalData {
  proposalId: string;
  date: string;
  preparedFor: string;
  preparedBy: string;
  title: string;
  overview: string;
  scopeOfWork: { id: number; description: string; longDescription?: string }[];
  timeline: { phase: number; task: string; completionDate: string }[];
  customer?: string;
  totalAmount?: string;
  validUntil?: string;
  subTotal?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  otherTaxAmount?: number;
  status?: string;
}

export const exportProposalToPDF = (data: ProposalData) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, maxWidth: number = contentWidth) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.42) > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.42 + 3;
  };

  const ensureRoom = (heightNeeded: number) => {
    if (yPosition + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  const money = (value: number) => `Rs ${value.toFixed(2)}`;

  // Header
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Project', margin, yPosition);
  yPosition += 9;
  
  doc.setFontSize(40);
  doc.text('PROPOSAL', margin, yPosition);
  yPosition += 10;

  // Prepared for/by
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prepared for: ${data.preparedFor}`, pageWidth - margin - 5, margin, { align: 'right' });
  doc.text(`Prepared by: ${data.preparedBy}`, pageWidth - margin - 5, margin + 5, { align: 'right' });

  // Date and Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', margin, yPosition);
  yPosition += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, margin, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(data.title, margin + 55, yPosition);
  yPosition += 8;

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  // 1. PROJECT OVERVIEW
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PROJECT OVERVIEW', margin, yPosition);
  yPosition += 6;
  
  addText(data.overview, 11, false);
  yPosition += 2;

  // 2. SCOPE OF WORK
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. SCOPE OF WORK', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('We will provide the following deliverables:', margin, yPosition);
  yPosition += 5;

  data.scopeOfWork.forEach((item) => {
    if (yPosition > pageHeight - margin - 12) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    const bulletPoint = `• ${item.description}`;
    doc.text(bulletPoint, margin + 5, yPosition);
    yPosition += 4;
    
    if (item.longDescription) {
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(`  ${item.longDescription}`, contentWidth - 10);
      doc.text(descLines, margin + 5, yPosition);
      yPosition += descLines.length * 3.8 + 2;
    }
  });
  yPosition += 2;

  // 3. PROJECT TIMELINE
  if (yPosition > pageHeight - margin - 45) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. PROJECT TIMELINE', margin, yPosition);
  yPosition += 7;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Phase', margin + 2, yPosition + 5);
  doc.text('Task', margin + 20, yPosition + 5);
  doc.text('Completion Date', pageWidth - margin - 40, yPosition + 5);
  yPosition += 9;

  // Table rows
  doc.setFont('helvetica', 'normal');
  data.timeline.forEach((phase, index) => {
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPosition - 4, contentWidth, 8, 'F');
    }
    
    doc.text(phase.phase.toString(), margin + 5, yPosition + 2);
    
    const taskLines = doc.splitTextToSize(phase.task, 100);
    doc.text(taskLines, margin + 20, yPosition + 2);
    
    doc.text(phase.completionDate || '[Date]', pageWidth - margin - 40, yPosition + 2);
    
    yPosition += Math.max(7, taskLines.length * 4.5 + 1);
  });

  yPosition += 6;

  // Additional Information
  if (data.customer || data.totalAmount || data.validUntil || (data.subTotal ?? 0) > 0 || (data.cgstAmount ?? 0) > 0 || (data.sgstAmount ?? 0) > 0 || (data.otherTaxAmount ?? 0) > 0) {
    // Keep billing block in a dedicated final page for predictable output.
    doc.addPage();
    yPosition = margin;

    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);

    const blockTop = yPosition;
    const col2 = margin + 65;
    const col3 = margin + 130;

    if (data.customer) {
      doc.text('CUSTOMER', margin, yPosition);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(data.customer, margin, yPosition + 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
    }

    if (data.totalAmount) {
      doc.text('TOTAL AMOUNT', col2, yPosition);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 150, 100);
      doc.text(data.totalAmount, col2, yPosition + 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
    }

    if (data.validUntil) {
      doc.text('VALID UNTIL', col3, yPosition);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 100, 0);
      doc.text(data.validUntil, col3, yPosition + 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
    }

    yPosition = blockTop + 18;

    const hasTaxDetails = (data.subTotal ?? 0) > 0 || (data.cgstAmount ?? 0) > 0 || (data.sgstAmount ?? 0) > 0 || (data.otherTaxAmount ?? 0) > 0;
    if (hasTaxDetails) {
      ensureRoom(34);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(margin, yPosition, contentWidth, 34, 2, 2);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('TAX DETAILS', margin + 4, yPosition + 6);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Sub Total', margin + 4, yPosition + 13);
      doc.text('CGST', margin + 4, yPosition + 20);
      doc.text('SGST', margin + 4, yPosition + 27);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(money(data.subTotal ?? 0), pageWidth - margin - 3, yPosition + 13, { align: 'right' });
      doc.text(money(data.cgstAmount ?? 0), pageWidth - margin - 3, yPosition + 20, { align: 'right' });
      doc.text(money(data.sgstAmount ?? 0), pageWidth - margin - 3, yPosition + 27, { align: 'right' });

      if ((data.otherTaxAmount ?? 0) > 0) {
        ensureRoom(41);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Other Tax', margin + 4, yPosition + 34);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(money(data.otherTaxAmount ?? 0), pageWidth - margin - 3, yPosition + 34, { align: 'right' });
      }

      yPosition += 44;
    }

    if (data.status) {
      const statusText = data.status.toUpperCase();
      doc.setFillColor(235, 245, 255);
      doc.roundedRect(pageWidth - margin - 22, yPosition, 22, 8, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 90, 180);
      doc.text(statusText, pageWidth - margin - 11, yPosition + 5.5, { align: 'center' });
    }
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const footerText = `This proposal is valid until ${data.validUntil || 'the specified date'} and subject to the terms and conditions outlined.`;
  const footerLines = doc.splitTextToSize(footerText, contentWidth);
  doc.text(footerLines, pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  doc.save(`Proposal_${data.proposalId}_${new Date().toISOString().split('T')[0]}.pdf`);
};
