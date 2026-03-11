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
}

export const exportProposalToPDF = (data: ProposalData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, maxWidth: number = contentWidth) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.4 + 5;
  };

  // Header
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Project', margin, yPosition);
  yPosition += 12;
  
  doc.setFontSize(40);
  doc.text('PROPOSAL', margin, yPosition);
  yPosition += 15;

  // Prepared for/by
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prepared for: ${data.preparedFor}`, pageWidth - margin - 60, margin, { align: 'right' });
  doc.text(`Prepared by: ${data.preparedBy}`, pageWidth - margin - 60, margin + 5, { align: 'right' });

  // Date and Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text(data.title, margin, yPosition);
  yPosition += 15;

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // 1. PROJECT OVERVIEW
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PROJECT OVERVIEW', margin, yPosition);
  yPosition += 8;
  
  addText(data.overview, 10, false);
  yPosition += 5;

  // 2. SCOPE OF WORK
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. SCOPE OF WORK', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('We will provide the following deliverables:', margin, yPosition);
  yPosition += 6;

  data.scopeOfWork.forEach((item) => {
    if (yPosition > pageHeight - margin - 15) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    const bulletPoint = `• ${item.description}`;
    doc.text(bulletPoint, margin + 5, yPosition);
    yPosition += 5;
    
    if (item.longDescription) {
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(`  ${item.longDescription}`, contentWidth - 10);
      doc.text(descLines, margin + 5, yPosition);
      yPosition += descLines.length * 4 + 3;
    }
  });
  yPosition += 5;

  // 3. PROJECT TIMELINE
  if (yPosition > pageHeight - margin - 60) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. PROJECT TIMELINE', margin, yPosition);
  yPosition += 10;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Phase', margin + 2, yPosition + 5);
  doc.text('Task', margin + 20, yPosition + 5);
  doc.text('Completion Date', pageWidth - margin - 40, yPosition + 5);
  yPosition += 10;

  // Table rows
  doc.setFont('helvetica', 'normal');
  data.timeline.forEach((phase, index) => {
    if (yPosition > pageHeight - margin - 15) {
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
    
    yPosition += Math.max(8, taskLines.length * 5 + 2);
  });

  yPosition += 10;

  // Additional Information
  if (data.customer || data.totalAmount || data.validUntil) {
    if (yPosition > pageHeight - margin - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);

    if (data.customer) {
      doc.text('CUSTOMER', margin, yPosition);
      yPosition += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(data.customer, margin, yPosition);
      yPosition += 8;
    }

    if (data.totalAmount) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('TOTAL AMOUNT', margin, yPosition);
      yPosition += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 150, 100);
      doc.text(data.totalAmount, margin, yPosition);
      yPosition += 8;
    }

    if (data.validUntil) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('VALID UNTIL', margin, yPosition);
      yPosition += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 100, 0);
      doc.text(data.validUntil, margin, yPosition);
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
