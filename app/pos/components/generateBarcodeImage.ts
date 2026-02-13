

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

export const printBarcodes = (variants: Array<{name: string; barcode: string}>) => {
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) return;

  let html = `
    <html>
      <head>
        <title>Print Barcodes</title>
        <style>
          body { font-family: Arial; margin: 10px; }
          .barcode-item { 
            display: inline-block; 
            margin: 10px; 
            text-align: center;
            border: 1px solid #ccc;
            padding: 10px;
          }
          .barcode-item canvas { 
            margin: 5px 0; 
          }
          .barcode-item p { 
            margin: 5px 0; 
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h2>Product Barcodes</h2>
  `;

  variants.forEach(variant => {
    html += `
      <div class="barcode-item">
        <p><strong>${variant.name}</strong></p>
        <canvas id="barcode-${variant.barcode}"></canvas>
        <p>${variant.barcode}</p>
      </div>
    `;
  });

  html += `
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
  `;

  variants.forEach(variant => {
    html += `JsBarcode("#barcode-${variant.barcode}", "${variant.barcode}", {format: "CODE128", displayValue: true});`;
  });

  html += `
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};