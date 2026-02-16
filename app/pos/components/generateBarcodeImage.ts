

import JsBarcode from 'jsbarcode';

export const generateBarcodeImage = (barcodeValue: string): string => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcodeValue, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating barcode:', error);
    return '';
  }
};

export const downloadBarcode = (barcodeValue: string, productName: string) => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, barcodeValue, {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
  });

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${productName}-${barcodeValue}.png`;
  link.click();
};

export const printBarcodes = (
  variants: Array<{ name: string; barcode: string }>
) => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>Print Barcodes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 16px;
          }

          .barcode-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }

          .barcode-item {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: center;
            page-break-inside: avoid;
          }

          canvas {
            margin: 6px 0;
          }

          .name {
            font-size: 12px;
            font-weight: bold;
          }

          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <h2>Product Barcodes</h2>

        <div class="barcode-grid">
          ${variants
            .map(
              (v, i) => `
                <div class="barcode-item">
                  <div class="name">${v.name}</div>
                  <canvas id="barcode-${i}"></canvas>
                  <div>${v.barcode}</div>
                </div>
              `
            )
            .join('')}
        </div>

        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function () {
            const variants = ${JSON.stringify(variants)};

            variants.forEach((v, i) => {
              JsBarcode(
                document.getElementById('barcode-' + i),
                v.barcode,
                {
                  format: 'CODE128',
                  width: 2,
                  height: 50,
                  displayValue: false
                }
              );
            });

            // 🔥 THIS IS THE IMPORTANT PART
            setTimeout(() => {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
