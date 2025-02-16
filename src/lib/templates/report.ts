import { jsPDF } from 'jspdf';
import autoTable, { type PageHook, type RowInput } from 'jspdf-autotable';

type Columns = {
  title: string;
  dataKey: string;
}[]

type Orientation = 'portrait' | 'landscape' | 'p' | 'l'

export function downloadReport(columns: Columns, body: RowInput[], reportName = 'report', orientation: Orientation = 'portrait', shouldDownload = false,) {
  const doc = new jsPDF(orientation, "mm", "a4");

  const pageContent = function (data) {
    // HEADER
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.setProperties({ title: `${reportName}` });
    doc.text(`${reportName}`, data.settings.margin.left, 22);

  } as PageHook;

  autoTable(doc, {
    headStyles: {
      fillColor: [51, 102, 255],
    },
    columns,
    columnStyles: {
      id: { halign: 'right' },
      totalAmount: { halign: 'right' },
      totalPaid: { halign: 'right' },
      balanceRemaining: { halign: 'right' },
      stitches: { halign: 'right' },
      unitPrice: { halign: 'right' },
      total: { halign: 'right' },
      orderTotal: { halign: 'right' },
      quantity: { halign: 'right' },
    },
    body,
    margin: { top: 30 },
    didDrawPage: pageContent
  });

  const numberOfPages = (doc as any).internal.getNumberOfPages();

  for (let index = 1; index <= numberOfPages; index++) {
    // FOOTER
    doc.setPage(index);
    // doc.setFont('Roboto-Regular');
    const str = 'Page ' + index + ' of ' + numberOfPages + ' for ' + `${reportName}`;
    doc.setFontSize(10);
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.text(str, 15, pageHeight - 10);
  }

  if (shouldDownload) {
    doc.save(`${reportName}.pdf`);
  }
  return doc.output('datauristring');

}