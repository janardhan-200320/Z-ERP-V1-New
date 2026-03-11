import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CompanyInfo {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

interface CustomerInfo {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
}

interface DocumentItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  tax?: string;
}

interface DocumentConfig {
  type: 'invoice' | 'estimate' | 'proposal' | 'quote' | 'receipt';
  documentNumber: string;
  documentDate: string;
  dueDate?: string;
  validUntil?: string;
  status?: string;
  company: CompanyInfo;
  customer: CustomerInfo;
  items: DocumentItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  notes?: string;
  terms?: string;
  paymentInfo?: string;
  qrCode?: string;
}

/**
 * Enhanced PDF export utility for all document types
 * Supports invoices, estimates, proposals, quotes, and receipts
 */
export function exportEnhancedPDF(config: DocumentConfig): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // Color scheme
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
  const secondaryColor: [number, number, number] = [99, 102, 241];
  const textColor: [number, number, number] = [31, 41, 55];
  const lightGray: [number, number, number] = [243, 244, 246];

  // Header with company logo and info
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(config.company.name, 15, 20);

  // Document Type
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(config.type.toUpperCase(), 15, 30);

  // Document Number (right aligned)
  doc.setFontSize(12);
  doc.text(config.documentNumber, pageWidth - 15, 20, { align: 'right' });
  doc.text(config.documentDate, pageWidth - 15, 27, { align: 'right' });

  yPos = 50;

  // Company and Customer Info Section
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  // Company Info (Left Column)
  doc.text('FROM:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text(config.company.name, 15, yPos);
  if (config.company.address) {
    yPos += 5;
    doc.text(config.company.address, 15, yPos);
  }
  if (config.company.city) {
    yPos += 5;
    doc.text(config.company.city, 15, yPos);
  }
  if (config.company.phone) {
    yPos += 5;
    doc.text(`Phone: ${config.company.phone}`, 15, yPos);
  }
  if (config.company.email) {
    yPos += 5;
    doc.text(`Email: ${config.company.email}`, 15, yPos);
  }

  // Customer Info (Right Column)
  let customerYPos = 50;
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', pageWidth - 80, customerYPos);
  doc.setFont('helvetica', 'normal');
  customerYPos += 5;
  doc.text(config.customer.name, pageWidth - 80, customerYPos);
  if (config.customer.address) {
    customerYPos += 5;
    doc.text(config.customer.address, pageWidth - 80, customerYPos);
  }
  if (config.customer.city) {
    customerYPos += 5;
    doc.text(config.customer.city, pageWidth - 80, customerYPos);
  }
  if (config.customer.phone) {
    customerYPos += 5;
    doc.text(`Phone: ${config.customer.phone}`, pageWidth - 80, customerYPos);
  }
  if (config.customer.email) {
    customerYPos += 5;
    doc.text(`Email: ${config.customer.email}`, pageWidth - 80, customerYPos);
  }

  yPos = Math.max(yPos, customerYPos) + 10;

  // Document Details
  if (config.dueDate || config.validUntil || config.status) {
    yPos += 5;
    doc.setFillColor(...lightGray);
    doc.rect(15, yPos, pageWidth - 30, 20, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    let detailsX = 20;
    
    if (config.status) {
      doc.text('STATUS:', detailsX, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(config.status.toUpperCase(), detailsX, yPos + 13);
      detailsX += 40;
    }
    
    if (config.dueDate) {
      doc.setFont('helvetica', 'bold');
      doc.text('DUE DATE:', detailsX, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(config.dueDate, detailsX, yPos + 13);
      detailsX += 50;
    }
    
    if (config.validUntil) {
      doc.setFont('helvetica', 'bold');
      doc.text('VALID UNTIL:', detailsX, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(config.validUntil, detailsX, yPos + 13);
    }
    
    yPos += 25;
  }

  // Items Table
  const tableData = config.items.map((item) => [
    item.description,
    item.quantity.toString(),
    `$${item.rate.toFixed(2)}`,
    item.tax || 'N/A',
    `$${item.amount.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Qty', 'Rate', 'Tax', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: 15, right: 15 },
  });

  // @ts-ignore - autoTable adds finalY
  yPos = doc.lastAutoTable.finalY + 10;

  // Totals Section
  const totalsX = pageWidth - 80;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  doc.text('Subtotal:', totalsX, yPos, { align: 'right' });
  doc.text(`$${config.subtotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 7;

  if (config.tax) {
    doc.text('Tax:', totalsX, yPos, { align: 'right' });
    doc.text(`$${config.tax.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
    yPos += 7;
  }

  if (config.discount) {
    doc.text('Discount:', totalsX, yPos, { align: 'right' });
    doc.text(`-$${config.discount.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
    yPos += 7;
  }

  // Total with background
  doc.setFillColor(...secondaryColor);
  doc.rect(totalsX - 5, yPos - 5, pageWidth - totalsX - 10, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPos + 3, { align: 'right' });
  doc.text(`$${config.total.toFixed(2)}`, pageWidth - 15, yPos + 3, { align: 'right' });

  yPos += 20;

  // Notes and Terms
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (config.notes && yPos < pageHeight - 60) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    const notesLines = doc.splitTextToSize(config.notes, pageWidth - 30);
    doc.text(notesLines, 15, yPos);
    yPos += notesLines.length * 5 + 5;
  }

  if (config.terms && yPos < pageHeight - 40) {
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    const termsLines = doc.splitTextToSize(config.terms, pageWidth - 30);
    doc.text(termsLines, 15, yPos);
    yPos += termsLines.length * 5 + 5;
  }

  // Footer
  doc.setFillColor(...lightGray);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  doc.setTextColor(...textColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Thank you for your business!',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save the PDF
  const fileName = `${config.type}_${config.documentNumber}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}

/**
 * Export data to Excel-compatible CSV with enhanced formatting
 */
export function exportToEnhancedCSV(
  data: any[],
  filename: string,
  headers?: { key: string; label: string }[]
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine headers
  const csvHeaders = headers || Object.keys(data[0]).map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }));

  // Create CSV content
  const csvContent = [
    // Header row
    csvHeaders.map(h => `"${h.label}"`).join(','),
    // Data rows
    ...data.map(row =>
      csvHeaders
        .map(h => {
          const value = row[h.key];
          // Handle different data types
          if (value === null || value === undefined) return '""';
          if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print document with custom styling
 */
export function printDocument(elementId: string, title: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const styles = `
    <style>
      @media print {
        body { 
          margin: 0; 
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        @page { 
          margin: 1cm; 
          size: A4;
        }
        .no-print { display: none !important; }
        .print-break { page-break-after: always; }
      }
    </style>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${styles}
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
