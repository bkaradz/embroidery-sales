import '$lib/assets/fonts/Roboto-Black-normal'; // Roboto-Black
import '$lib/assets/fonts/Roboto-Regular-normal'; // Roboto-Regular
import logo from '$lib/assets/logo.png';
import type { GetOrderDetails } from '$lib/server/routes/orders';
import { formatCurrency } from '$lib/utility/convertCurrencies';
import { generateOrderNumber } from '$lib/utility/generateOrderNumber';
import type { OrderStatusPrint } from '$lib/utility/lists';
import type { Converter } from '$lib/utility/schemas';
import Big from 'big.js';
import { formatDate } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable, { type PageHook, type RowInput } from 'jspdf-autotable';


type Columns = {
  title: string;
  dataKey: string;
}[]

export function downloadInvoice(format: { converter: Converter, opt: { from?: string, to: string } }, orderDetails: GetOrderDetails, columnsData: Columns, orderStatusPrint: OrderStatusPrint, shouldDownload = false) {
  const doc = new jsPDF();
  doc.setProperties({ title: `Create ${orderStatusPrint}` });

  const pageContent = function (data) {
    // HEADER
    type Image = { originalWidth: number; originalHeight: number };

    const image = { originalWidth: 763, originalHeight: 383 };

    function scaledImage(image: Image, maxHeight: number) {
      if (image.originalHeight <= maxHeight) {
        return { width: image.originalWidth, height: image.originalHeight }; // No scaling needed
      }

      const newHeight = maxHeight;
      const newWidth = (image.originalWidth * maxHeight) / image.originalHeight;

      return { width: newWidth, height: newHeight };
    }

    const HEIGHT = 21;

    const X = 15 + 38 + 5;
    const Y = 10;

    doc.addImage(
      logo,
      'png',
      15,
      10,
      scaledImage(image, HEIGHT).width,
      scaledImage(image, HEIGHT).height
    );
    doc.setTextColor(51, 102, 255);
    doc.setFont('Roboto-Regular');
    doc.setFontSize(12);
    doc.text('LILIAN ENTERPRISES (PVT) LTD T/A', X + 20, Y + 5);
    doc.setFont('Roboto-Black');
    doc.setFontSize(27);
    doc.text('THE EMBROIDERY SHOP', X + 3, Y + 14);
    // doc.setFont('Roboto-Italic');
    doc.setFont('Times', 'bolditalic');
    doc.setFontSize(12);
    doc.text('Your Suppliers of Custom Made Promotional Wear', X + 10, Y + 19);

    if (data.pageCount === 1) {
      doc.setFontSize(18);
      doc.text(`${orderStatusPrint}`, X + 40, Y + 30);

      // const for autoTable
      const joinedInvoiceData = [];
      const formattedDate = formatDate(new Date(), 'dd-MM-yyyy');
      joinedInvoiceData.push(`Date: ${formattedDate}`);
      const invoiceNumber = generateOrderNumber(orderDetails.orderData.id) || ''; // Ensure default empty string
      if (invoiceNumber) joinedInvoiceData.push(`${orderStatusPrint} No: ${invoiceNumber}`);
      const purchaseOrderNumber = orderDetails.orderData.purchaseOrderNumber || '';
      if (purchaseOrderNumber)
        joinedInvoiceData.push(`Purchase Order No: ${purchaseOrderNumber}`);
      const tinNumber = orderDetails.customerData.tin || '';
      if (tinNumber) joinedInvoiceData.push(`TIN No: ${tinNumber}`);

      const finalInvoiceData = joinedInvoiceData.join('\n');

      autoTable(doc, {
        body: [
          [
            {
              content:
                'Cell:\t  +263 29 2264356' +
                '\n\t\t +263 772 357 054' +
                '\n\t\t +263 774 677 950' +
                '\nEmail:\ttheembroideryshopzw@gmail.com',
              styles: {
                halign: 'left'
              }
            },
            {
              content: finalInvoiceData,
              styles: {
                halign: 'right'
              }
            }
          ]
        ],
        theme: 'plain',
        startY: 32
      });

      autoTable(doc, {
        body: [
          [
            {
              content:
                'Billed to:' +
                `\n${orderDetails.customerData.fullName}` +
                `\n${orderDetails.customerData.address || ''}`,
              styles: {
                halign: 'left'
              }
            },
            {
              content:
                'Shipping address:' +
                `\n${orderDetails.customerData.fullName}` +
                `\n${orderDetails.customerData.address || ''}`,
              styles: {
                halign: 'left'
              }
            },
            {
              content:
                'From:' +
                '\nLilian Enterprises P/L t/a' +
                '\nThe Embroidery Shop' +
                '\nStanfield Ratcliffe Building' +
                '\n126 J Moyo St & 13th Ave' +
                '\nBulawayo' +
                '\nZimbabwe',
              styles: {
                halign: 'right'
              }
            }
          ]
        ],
        theme: 'plain',
        startY: (doc as any).autoTable.previous.finalY + 2
      });

      autoTable(doc, {
        body: [
          [
            {
              content: 'Amount Due:',
              styles: {
                halign: 'right',
                fontSize: 14
              }
            }
          ]
        ],
        theme: 'plain',
        startY: (doc as any).autoTable.previous.finalY
      });
      autoTable(doc, {
        body: [
          [
            {
              content: 'Products & Services',
              styles: {
                halign: 'left',
                fontSize: 18
              }
            },
            {
              content: `${formatCurrency(format.converter, Big(orderDetails.orderData.totalAmount).minus(orderDetails.orderData.totalPaid), format.opt)}`,
              styles: {
                halign: 'right',
                fontSize: 18,
                textColor: '#3366ff'
              }
            }
          ]
        ],
        theme: 'plain',
        startY: (doc as any).autoTable.previous.finalY
      });
    }
  } as PageHook;

  const tableValues: RowInput[] = orderDetails.bodyDataObject.map((item) => {
    return [
      {
        content: item.productName,
        styles: {
          halign: 'left',
        },
        colSpan: 1
      },
      {
        content: item.productCategory,
        styles: {
          halign: 'left',
        },
        colSpan: 1
      },
      {
        content: item.quantity,
        styles: {
          halign: 'right',
        },
        colSpan: 1
      },
      {
        content: formatCurrency(format.converter, Number(item.unitPrice), format.opt),
        styles: {
          halign: 'right',
        },
        colSpan: 1
      },
      {
        content: formatCurrency(format.converter, Number(item.total), format.opt),
        styles: {
          halign: 'right',
        },
        colSpan: 1
      },
    ]
  })

  tableValues.push(
    [
      {
        content: 'Subtotal:',
        styles: {
          halign: 'right',
        },
        colSpan: 4
      },
      {
        content: `${formatCurrency(format.converter, Number(orderDetails.orderTotals.subtotal), format.opt)}`,
        styles: {
          halign: 'right'
        },
        colSpan: 1
      }
    ]
  )

  tableValues.push(
    [
      {
        content: 'Vat:',
        styles: {
          halign: 'right'
        },
        colSpan: 4
      },
      {
        content: `${formatCurrency(format.converter, Number(orderDetails.orderTotals.tax), format.opt)}`,
        styles: {
          halign: 'right'
        },
        colSpan: 1
      }
    ]
  )
  tableValues.push(
    [
      {
        content: 'Grand Total:',
        styles: {
          halign: 'right'
        },
        colSpan: 4
      },
      {
        content: `${formatCurrency(format.converter, Number(orderDetails.orderTotals.grandTotal), format.opt)}`,
        styles: {
          halign: 'right'
        },
        colSpan: 1
      }
    ]
  )

  autoTable(doc, {
    theme: 'grid',
    columns: columnsData,
    headStyles: {
      fillColor: [51, 102, 255],
    },
    columnStyles: {
      quantity: { halign: 'right' },
      unitPrice: { halign: 'right' },
      total: { halign: 'right' }
    },
    body: tableValues,
    margin: { top: 35 },
    didDrawPage: pageContent,
    startY: 106,
  });

  autoTable(doc, {
    body: [
      [
        {
          content: 'Payment Details',
          styles: {
            halign: 'left',
            fontSize: 14
          }
        }
      ],
      [
        {
          content:
            'Account Name: Lilian Enterprises P/L' +
            '\nAccount No: 21301 12883255602015' +
            '\nBank: Banc ABC' +
            '\nBranch: Jason Moyo' +
            '\nCity: Bulawayo',
          styles: {
            halign: 'left'
          }
        }
      ]
    ],
    theme: 'plain'
  });

  const numberOfPages = (doc as any).internal.getNumberOfPages();

  for (let index = 1; index <= numberOfPages; index++) {
    // FOOTER
    doc.setPage(index);
    const invoiceNumber = generateOrderNumber(orderDetails.orderData.id) || '';
    const str = 'Page ' + index + ' of ' + numberOfPages + ' for ' + `${orderStatusPrint} No: ${invoiceNumber}`;
    doc.setFontSize(10);
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.text(str, 15, pageHeight - 10);
  }

  const invoiceNumber = generateOrderNumber(orderDetails.orderData.id) || '';
  const name = `${orderStatusPrint}-No-${invoiceNumber}.pdf`;

  if (shouldDownload) {
    doc.save(name);
  }
  return doc.output('datauristring');
}