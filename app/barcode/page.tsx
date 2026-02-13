'use client';

import { InventoryLayout } from "../inventory/components/InventoryLayout";
import { BarcodeManager } from "../pos/components/BarcodeManager";




export default function BarcodeSettingsPage() {
  return (
    <InventoryLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Barcode Management</h1>
          <p className="text-gray-600 mt-2">
            Download, copy, or print barcodes for your products
          </p>
        </div>

        <BarcodeManager />
      </div>
    </InventoryLayout>
  );
}