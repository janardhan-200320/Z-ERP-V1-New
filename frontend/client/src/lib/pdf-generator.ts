/**
 * PDF Generation Utilities for Purchase Management Module
 * Generates professional PDFs for PR, PO, GRN, and other purchase documents
 */

interface DocumentHeader {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logo?: string;
}

interface PurchaseRequisitionData {
  prNumber: string;
  date: string;
  department: string;
  requestedBy: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: string;
  approvalHistory?: Array<{
    approver: string;
    action: string;
    date: string;
    comments?: string;
  }>;
}

interface PurchaseOrderData {
  poNumber: string;
  date: string;
  supplier: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  deliveryDate: string;
  paymentTerms: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  taxAmount?: number;
  grandTotal: number;
  notes?: string;
}

interface GoodsReceiptData {
  grnNumber: string;
  date: string;
  poNumber: string;
  supplier: string;
  receivedBy: string;
  items: Array<{
    name: string;
    orderedQty: number;
    receivedQty: number;
    damagedQty: number;
    remarks?: string;
  }>;
  qualityCheckPassed: boolean;
  notes?: string;
}

/**
 * Generate HTML content for Purchase Requisition PDF
 */
export function generatePRHtml(data: PurchaseRequisitionData, header: DocumentHeader): string {
  const itemsHtml = data.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${item.totalPrice.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const approvalHtml = data.approvalHistory
    ? data.approvalHistory
        .map(
          (approval) => `
        <div style="margin-bottom: 8px; padding: 8px; background-color: #f8fafc; border-left: 3px solid #3b82f6;">
          <strong>${approval.approver}</strong> - ${approval.action} on ${new Date(approval.date).toLocaleDateString()}
          ${approval.comments ? `<br><em>${approval.comments}</em>` : ''}
        </div>
      `
        )
        .join('')
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Purchase Requisition - ${data.prNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1e40af; }
          .doc-title { font-size: 20px; font-weight: bold; margin-top: 20px; }
          .info-section { margin-bottom: 20px; }
          .info-label { font-weight: bold; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; }
          .total-row { font-weight: bold; background-color: #f1f5f9; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${header.companyName}</div>
          <div>${header.companyAddress}</div>
          <div>${header.companyPhone} | ${header.companyEmail}</div>
          <div class="doc-title">PURCHASE REQUISITION</div>
        </div>

        <div class="info-section">
          <table style="border: none;">
            <tr>
              <td style="border: none; width: 50%;"><span class="info-label">PR Number:</span> ${data.prNumber}</td>
              <td style="border: none;"><span class="info-label">Date:</span> ${new Date(data.date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="border: none;"><span class="info-label">Department:</span> ${data.department}</td>
              <td style="border: none;"><span class="info-label">Requested By:</span> ${data.requestedBy}</td>
            </tr>
            <tr>
              <td style="border: none;" colspan="2"><span class="info-label">Status:</span> ${data.status}</td>
            </tr>
          </table>
        </div>

        ${data.description ? `<div class="info-section"><strong>Description:</strong><br>${data.description}</div>` : ''}

        <table>
          <thead>
            <tr>
              <th style="border: 1px solid #e2e8f0;">#</th>
              <th style="border: 1px solid #e2e8f0;">Item Description</th>
              <th style="border: 1px solid #e2e8f0;">Quantity</th>
              <th style="border: 1px solid #e2e8f0;">Unit Price</th>
              <th style="border: 1px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="total-row">
              <td colspan="4" style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">TOTAL:</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${data.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        ${approvalHtml ? `<div class="info-section"><strong>Approval History:</strong><br>${approvalHtml}</div>` : ''}

        <div class="footer">
          <p>This is a system-generated document | Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML content for Purchase Order PDF
 */
export function generatePOHtml(data: PurchaseOrderData, header: DocumentHeader): string {
  const itemsHtml = data.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${item.totalPrice.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Purchase Order - ${data.poNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1e40af; }
          .doc-title { font-size: 20px; font-weight: bold; margin-top: 20px; }
          .two-column { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .column { width: 48%; }
          .info-label { font-weight: bold; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; }
          .total-section { margin-top: 20px; float: right; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #e2e8f0; }
          .grand-total { font-weight: bold; font-size: 18px; background-color: #f1f5f9; }
          .footer { clear: both; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${header.companyName}</div>
          <div>${header.companyAddress}</div>
          <div>${header.companyPhone} | ${header.companyEmail}</div>
          <div class="doc-title">PURCHASE ORDER</div>
        </div>

        <div class="two-column" style="display: block;">
          <div style="margin-bottom: 20px;">
            <strong>PO Number:</strong> ${data.poNumber}<br>
            <strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}<br>
            <strong>Delivery Date:</strong> ${new Date(data.deliveryDate).toLocaleDateString()}<br>
            <strong>Payment Terms:</strong> ${data.paymentTerms}
          </div>
          <div style="border: 1px solid #e2e8f0; padding: 15px; background-color: #f8fafc;">
            <strong>Supplier:</strong><br>
            ${data.supplier.name}<br>
            ${data.supplier.address}<br>
            ${data.supplier.phone}<br>
            ${data.supplier.email}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="border: 1px solid #e2e8f0;">#</th>
              <th style="border: 1px solid #e2e8f0;">Item Description</th>
              <th style="border: 1px solid #e2e8f0;">Quantity</th>
              <th style="border: 1px solid #e2e8f0;">Unit Price</th>
              <th style="border: 1px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${data.totalAmount.toFixed(2)}</span>
          </div>
          ${data.taxAmount ? `<div class="total-row"><span>Tax:</span><span>$${data.taxAmount.toFixed(2)}</span></div>` : ''}
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>$${data.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        ${data.notes ? `<div style="clear: both; margin-top: 40px;"><strong>Notes:</strong><br>${data.notes}</div>` : ''}

        <div class="footer">
          <p>This is a system-generated document | Generated on ${new Date().toLocaleString()}</p>
          <p>Please confirm receipt and expected delivery date</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML content for Goods Receipt Note PDF
 */
export function generateGRNHtml(data: GoodsReceiptData, header: DocumentHeader): string {
  const itemsHtml = data.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${item.orderedQty}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${item.receivedQty}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${item.damagedQty}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.remarks || '-'}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Goods Receipt Note - ${data.grnNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1e40af; }
          .doc-title { font-size: 20px; font-weight: bold; margin-top: 20px; }
          .info-label { font-weight: bold; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; }
          .qc-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: bold; }
          .qc-pass { background-color: #dcfce7; color: #166534; }
          .qc-fail { background-color: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${header.companyName}</div>
          <div>${header.companyAddress}</div>
          <div>${header.companyPhone} | ${header.companyEmail}</div>
          <div class="doc-title">GOODS RECEIPT NOTE</div>
        </div>

        <div style="margin-bottom: 20px;">
          <table style="border: none;">
            <tr>
              <td style="border: none; width: 50%;"><span class="info-label">GRN Number:</span> ${data.grnNumber}</td>
              <td style="border: none;"><span class="info-label">Date:</span> ${new Date(data.date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="border: none;"><span class="info-label">PO Number:</span> ${data.poNumber}</td>
              <td style="border: none;"><span class="info-label">Supplier:</span> ${data.supplier}</td>
            </tr>
            <tr>
              <td style="border: none;"><span class="info-label">Received By:</span> ${data.receivedBy}</td>
              <td style="border: none;">
                <span class="info-label">Quality Check:</span> 
                <span class="qc-badge ${data.qualityCheckPassed ? 'qc-pass' : 'qc-fail'}">
                  ${data.qualityCheckPassed ? 'PASSED' : 'FAILED'}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <table>
          <thead>
            <tr>
              <th style="border: 1px solid #e2e8f0;">#</th>
              <th style="border: 1px solid #e2e8f0;">Item Description</th>
              <th style="border: 1px solid #e2e8f0;">Ordered Qty</th>
              <th style="border: 1px solid #e2e8f0;">Received Qty</th>
              <th style="border: 1px solid #e2e8f0;">Damaged Qty</th>
              <th style="border: 1px solid #e2e8f0;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        ${data.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong><br>${data.notes}</div>` : ''}

        <div class="footer">
          <p>This is a system-generated document | Generated on ${new Date().toLocaleString()}</p>
          <div style="margin-top: 40px; text-align: left;">
            <div style="display: inline-block; width: 45%;">
              <p>___________________________</p>
              <p>Received By</p>
            </div>
            <div style="display: inline-block; width: 45%; text-align: right;">
              <p>___________________________</p>
              <p>Verified By</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Convert HTML to PDF (browser-side)
 * In production, you would use a library like jsPDF with html2canvas
 * or send the HTML to a backend service for PDF generation
 */
export async function downloadPDF(html: string, filename: string): Promise<void> {
  // For demonstration: open in new window
  // In production, integrate with jsPDF or similar
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Example: Generate and download PR PDF
 */
export function generateAndDownloadPR(data: PurchaseRequisitionData): void {
  const header: DocumentHeader = {
    companyName: 'Your Company Name',
    companyAddress: '123 Business Street, City, State 12345',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'info@yourcompany.com',
  };

  const html = generatePRHtml(data, header);
  downloadPDF(html, `PR-${data.prNumber}.pdf`);
}
