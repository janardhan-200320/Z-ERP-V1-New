import { exportToCSV } from './csv-export';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Common export utility for CSV and PDF
 */

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  exportToCSV(data, `${fileName}.csv`);
};

export const exportToPDF = (
  title: string,
  headers: string[],
  data: any[][],
  fileName: string
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: data,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 35 },
  });
  
  doc.save(`${fileName}.pdf`);
};
