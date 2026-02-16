export function printBarcodes(
  variants: { name: string; barcode: string }[]
) {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Unable to open print window');
  }

  const html = `
    <html>
      <head>
        <title>Print Barcodes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .barcode-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .barcode-item {
            text-align: center;
            page-break-inside: avoid;
          }
          img {
            max-width: 100%;
          }
          .name {
            margin-top: 6px;
            font-size: 12px;
          }

          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="barcode-grid">
          ${variants
            .map(
              v => `
                <div class="barcode-item">
                  <img 
                    src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${v.barcode}&scale=3&height=10"
                  />
                  <div class="name">${v.name}</div>
                </div>
              `
            )
            .join('')}
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
