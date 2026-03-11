/**
 * Sales Invoice PDF Generator
 * Generates professional invoices matching the ERP Invoice Template
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

// Extend jsPDF to support autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface InvoiceItem {
  description: string;
  longDescription?: string;
  hsn?: string;
  qty: number;
  rate: number;
  tax: string;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
  saleAgent?: string;
  
  // Company Info
  company: {
    name: string;
    tagline?: string;
    address: string;
    city: string;
    gstin?: string;
    phone?: string;
    email?: string;
    logo?: string;
  };
  
  // Customer Info
  customer: {
    name: string;
    address: string;
    city: string;
    gstin?: string;
    phone?: string;
    email?: string;
  };
  
  // Items
  items: InvoiceItem[];
  
  // Totals
  subTotal: number;
  cgstPercent?: number;
  cgstAmount?: number;
  sgstPercent?: number;
  sgstAmount?: number;
  igstPercent?: number;
  igstAmount?: number;
  discount: number;
  discountType: '%' | '$';
  adjustment?: number;
  total: number;
  amountDue: number;
  
  // Payment Info
  paymentInfo?: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    ifscCode?: string;
    upiId?: string;
    qrCodeData?: string;
  };
  
  // Terms
  clientNote?: string;
  terms?: string[];
  
  // Branding
  primaryColor?: string;
  currency?: string;
}

/**
 * Generate a PDF invoice matching the ERP template design
 */
export async function generateSalesInvoicePDF(data: InvoiceData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  const primaryColor = data.primaryColor || '#22c55e'; // Green color from template
  const currency = data.currency || '₹';
  
  let yPos = margin;

  // Helper functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 34, g: 197, b: 94 };
  };

  const rgb = hexToRgb(primaryColor);

  // ============ HEADER SECTION ============
  // Company Logo/Name (Left)
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.text(data.company.name.toUpperCase(), margin, yPos + 10);
  
  // Registered symbol
  doc.setFontSize(8);
  doc.text('®', margin + doc.getTextWidth(data.company.name.toUpperCase()) + 1, yPos + 5);
  
  // Company tagline
  if (data.company.tagline) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(data.company.tagline.toUpperCase(), margin, yPos + 16);
  }

  // Invoice Title (Right)
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('INVOICE', pageWidth - margin, yPos + 10, { align: 'right' });
  
  // Payment Status Badge
  yPos += 18;
  const statusColors: Record<string, { bg: number[]; text: number[] }> = {
    paid: { bg: [34, 197, 94], text: [255, 255, 255] },
    unpaid: { bg: [239, 68, 68], text: [255, 255, 255] },
    partial: { bg: [245, 158, 11], text: [255, 255, 255] },
    overdue: { bg: [220, 38, 38], text: [255, 255, 255] }
  };
  
  const statusColor = statusColors[data.status] || statusColors.unpaid;
  const statusText = data.status.toUpperCase();
  const statusWidth = doc.getTextWidth(statusText) + 12;
  
  // Draw status badge
  doc.setFillColor(statusColor.bg[0], statusColor.bg[1], statusColor.bg[2]);
  doc.roundedRect(pageWidth - margin - statusWidth - 55, yPos - 5, statusWidth + 6, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusColor.text[0], statusColor.text[1], statusColor.text[2]);
  doc.text(statusText, pageWidth - margin - 55, yPos);
  
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Payment Status:', pageWidth - margin - statusWidth - 85, yPos);
  
  // Invoice Number
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text(data.invoiceNumber, pageWidth - margin, yPos, { align: 'right' });
  
  // Invoice Details (right side)
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Invoice Date: ${data.invoiceDate}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Due Date: ${data.dueDate}`, pageWidth - margin, yPos, { align: 'right' });
  if (data.saleAgent) {
    yPos += 5;
    doc.text(`Sale Agent: ${data.saleAgent}`, pageWidth - margin, yPos, { align: 'right' });
  }

  // ============ ADDRESS SECTION ============
  yPos += 15;
  const addressYStart = yPos;
  const halfWidth = contentWidth / 2 - 5;
  
  // Office Address (Left)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('Office Address:', margin, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text(data.company.address, margin, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.company.city, margin, yPos);
  
  if (data.company.gstin) {
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('GSTIN:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.company.gstin, margin + 15, yPos);
  }
  
  // To Address (Right)
  let rightYPos = addressYStart;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('To:', margin + halfWidth + 10, rightYPos);
  
  rightYPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text(data.customer.name, margin + halfWidth + 10, rightYPos);
  
  rightYPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.customer.address, margin + halfWidth + 10, rightYPos);
  
  rightYPos += 5;
  doc.text(data.customer.city, margin + halfWidth + 10, rightYPos);
  
  if (data.customer.gstin) {
    rightYPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('GSTIN:', margin + halfWidth + 10, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customer.gstin, margin + halfWidth + 25, rightYPos);
  }

  // ============ ITEMS TABLE ============
  yPos = Math.max(yPos, rightYPos) + 15;
  
  const tableData = data.items.map((item, idx) => [
    String(idx + 1).padStart(2, '0'),
    item.description + (item.longDescription ? `\n${item.longDescription}` : ''),
    item.hsn || '-',
    String(item.qty),
    `${currency} ${item.rate.toFixed(2)}`,
    item.tax || '-',
    `${currency} ${item.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Product & Descriptions', 'HSN', 'Qty.', 'Rate', 'Tax', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [rgb.r, rgb.g, rgb.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
    },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: margin, right: margin },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
  });

  // ============ SIGNATURE AND TOTALS SECTION ============
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Signature (Left side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Authorised Signature', margin, yPos);
  
  // Signature line
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 30, margin + 60, yPos + 30);
  
  // Totals (Right side)
  const totalsX = pageWidth - margin - 80;
  let totalsY = yPos;
  
  const drawTotalLine = (label: string, value: string, isBold = false, isLarge = false) => {
    doc.setFontSize(isLarge ? 11 : 9);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(label, totalsX, totalsY);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageWidth - margin, totalsY, { align: 'right' });
    
    // Draw separator line
    if (!isLarge) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(totalsX, totalsY + 3, pageWidth - margin, totalsY + 3);
    }
    
    totalsY += isLarge ? 10 : 8;
  };
  
  drawTotalLine('Sub Total', `${currency} ${data.subTotal.toFixed(2)}`);
  
  if (data.cgstAmount && data.cgstPercent) {
    drawTotalLine(`CGST (${data.cgstPercent.toFixed(2)}%)`, `${currency} ${data.cgstAmount.toFixed(2)}`);
  }
  if (data.sgstAmount && data.sgstPercent) {
    drawTotalLine(`SGST (${data.sgstPercent.toFixed(2)}%)`, `${currency} ${data.sgstAmount.toFixed(2)}`);
  }
  if (data.igstAmount && data.igstPercent) {
    drawTotalLine(`IGST (${data.igstPercent.toFixed(2)}%)`, `${currency} ${data.igstAmount.toFixed(2)}`);
  }
  
  if (data.discount > 0) {
    const discountLabel = data.discountType === '%' ? `Discount (${data.discount}%)` : 'Discount';
    drawTotalLine(discountLabel, `${currency} ${data.discount.toFixed(2)}`);
  }
  
  // Draw thicker line before total
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.8);
  doc.line(totalsX, totalsY, pageWidth - margin, totalsY);
  totalsY += 5;
  
  drawTotalLine('Total', `${currency} ${data.total.toFixed(2)}`, true, true);
  drawTotalLine('Amount Due', `${currency} ${data.amountDue.toFixed(2)}`, true, true);

  // ============ PAYMENT INFO AND TERMS ============
  yPos = Math.max(yPos + 40, totalsY) + 10;
  
  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  
  // Payment Info (Left)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Payment Info', margin, yPos);
  
  yPos += 8;
  
  // Generate QR Code with payment info
  const qrCodeData = data.paymentInfo?.qrCodeData || 
    data.paymentInfo?.upiId || 
    `upi://pay?pa=${data.company.email || ''}&pn=${encodeURIComponent(data.company.name)}&am=${data.amountDue}&cu=INR&tn=${encodeURIComponent('Invoice: ' + data.invoiceNumber)}`;
  
  try {
    const qrCodeBase64 = await QRCode.toDataURL(qrCodeData, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    doc.addImage(qrCodeBase64, 'PNG', margin, yPos, 25, 25);
  } catch (err) {
    // Fallback to placeholder if QR generation fails
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.8);
    doc.rect(margin, yPos, 25, 25);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('QR Code', margin + 6, yPos + 14);
  }
  
  // Bank details
  const bankDetailsX = margin + 32;
  let bankY = yPos;
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  
  if (data.paymentInfo?.accountNumber) {
    doc.setFont('helvetica', 'bold');
    doc.text('Account Number:', bankDetailsX, bankY);
    doc.setFont('helvetica', 'normal');  
    doc.text(data.paymentInfo.accountNumber, bankDetailsX + 30, bankY);
    bankY += 5;
  }
  if (data.paymentInfo?.accountName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Account Name:', bankDetailsX, bankY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.paymentInfo.accountName, bankDetailsX + 28, bankY);
    bankY += 5;
  }
  if (data.paymentInfo?.bankName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', bankDetailsX, bankY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.paymentInfo.bankName, bankDetailsX + 25, bankY);
  }
  
  // Payment Terms (Right)
  const termsX = pageWidth / 2 + 10;
  let termsY = yPos - 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Payment Terms:', termsX, termsY);
  
  termsY += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  const defaultTerms = data.terms || [
    'Payment is due within the specified due date',
    'Late payments may incur additional charges'
  ];
  
  defaultTerms.forEach(term => {
    // Checkmark
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('✓', termsX, termsY);
    doc.setTextColor(80, 80, 80);
    
    // Wrap text if too long
    const maxWidth = pageWidth - termsX - margin - 10;
    const lines = doc.splitTextToSize(term, maxWidth);
    doc.text(lines, termsX + 6, termsY);
    termsY += lines.length * 4 + 2;
  });

  // ============ FOOTER ============
  yPos = pageHeight - 25;
  
  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  
  // Thank you message
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
  
  // Contact info
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const contactText = data.company.email 
    ? `For any questions regarding this invoice, please contact us at ${data.company.email}`
    : 'For any questions regarding this invoice, please contact us.';
  doc.text(contactText, pageWidth / 2, yPos + 5, { align: 'center' });

  return doc;
}

/**
 * Generate and download the invoice PDF
 */
export async function downloadSalesInvoicePDF(data: InvoiceData, filename?: string): Promise<void> {
  const doc = await generateSalesInvoicePDF(data);
  const name = filename || `${data.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(name);
}

/**
 * Generate PDF and open in new window for printing
 */
export async function printSalesInvoicePDF(data: InvoiceData): Promise<void> {
  const doc = await generateSalesInvoicePDF(data);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Create sample invoice data for testing
 */
export function createSampleInvoiceData(): InvoiceData {
  return {
    invoiceNumber: 'INV-000001',
    invoiceDate: new Date().toLocaleDateString('en-IN'),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
    status: 'unpaid',
    saleAgent: 'Finas Zollid',
    
    company: {
      name: 'ZOLLID',
      tagline: 'ZOLLID BRANDING SOLUTIONS PVT. LTD.',
      address: 'Office Address',
      city: 'Main Street, Your Location\nNumber 06/B',
      gstin: '',
      email: 'info@yourcompany.com'
    },
    
    customer: {
      name: 'Client Name',
      address: 'Client Address',
      city: 'Main Street, Your Location\nNumber 06/B',
      gstin: ''
    },
    
    items: [
      { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 },
      { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 },
      { description: 'Item Name', longDescription: 'Lorem ipsum content', hsn: '9983', qty: 1, rate: 1000, tax: '18%', amount: 1000 }
    ],
    
    subTotal: 3000,
    cgstPercent: 9,
    cgstAmount: 270,
    sgstPercent: 9,
    sgstAmount: 270,
    discount: 0,
    discountType: '%',
    total: 3540,
    amountDue: 3540,
    
    paymentInfo: {
      accountNumber: '',
      accountName: '',
      bankName: 'Bank Details'
    },
    
    terms: [
      'Lorem ipsum dolor sit amet, adipiscing elit, sed do eiusmod',
      'tempor incididunt ut labore et dolore!'
    ],
    
    primaryColor: '#22c55e',
    currency: '₹'
  };
}
