'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Barcode, AlertCircle, Check } from "lucide-react";
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  isProcessing?: boolean;
}

export function BarcodeScanner({ onBarcodeScanned, isProcessing = false }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('');
  const [lastScannedTime, setLastScannedTime] = useState<number>(0);
  const [scannerConnected, setScannerConnected] = useState<boolean>(false);
  const [lastInputTime, setLastInputTime] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);  
  const [inputMode, setInputMode] = useState<'scanner' | 'manual'>('scanner');
  const scanSpeedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bufferRef = useRef<string>('');
  const lastTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);

  useEffect(() => {
    inputRef.current?.focus();
   
   const handleWindowClick = () => {
  const isModalOpen = document.querySelector('[role="dialog"]');
  const activeElement = document.activeElement;

  if (
    isModalOpen ||
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    activeElement instanceof HTMLSelectElement
  ) {
    return;
  }

  inputRef.current?.focus();
};

    
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
       if (!scannerEnabled) return;
  if (document.activeElement !== inputRef.current) return;
      const now = Date.now();

      // Check if a dialog/modal is open
      const isModalOpen = document.querySelector('[role="dialog"]');
      if (isModalOpen) {
        return;
      }

      // Check if user is typing in an input field (other than barcode input)
      const activeElement = document.activeElement;
      if (
        activeElement && 
        activeElement !== inputRef.current &&
        (activeElement instanceof HTMLInputElement ||
         activeElement instanceof HTMLTextAreaElement ||
         activeElement instanceof HTMLSelectElement)
      ) {
        return;
      }

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= 4) {
          onBarcodeScanned(bufferRef.current);
          setScannerConnected(true);
        }
        bufferRef.current = '';
        return;
      }

      if (e.key.length !== 1) return;

      if (now - lastTimeRef.current > 80) {
        bufferRef.current = '';
      }

      bufferRef.current += e.key;
      lastTimeRef.current = now;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, 120);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onBarcodeScanned]);

  useEffect(() => {
  const disable = () => setScannerEnabled(false);
  const enable = () => setScannerEnabled(true);

  window.addEventListener('disable-scanner', disable);
  window.addEventListener('enable-scanner', enable);

  return () => {
    window.removeEventListener('disable-scanner', disable);
    window.removeEventListener('enable-scanner', enable);
  };
}, []);


  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentTime = Date.now();
    const timeSinceLastKey = currentTime - lastScannedTime;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = barcode.trim();
      
      if (!input) {
        toast.error('Empty barcode');
        return;
      }

      const barcodes = input
        .split(/[\s,]+/)
        .map(b => b.trim())
        .filter(b => b.length > 0);

      if (barcodes.length > 1) {
        let addedCount = 0;
        let failedCount = 0;
        const failedBarcodes: string[] = [];

        barcodes.forEach(scannedBarcode => {
          if (scannedBarcode.length >= 3) {
            try {
              onBarcodeScanned(scannedBarcode);
              addedCount++;
            } catch (error) {
              failedCount++;
              failedBarcodes.push(scannedBarcode);
              console.error('Error adding barcode:', scannedBarcode, error);
            }
          }
        });

        if (addedCount > 0) {
          toast.success(`Added ${addedCount} item(s)`);
        }
        if (failedCount > 0) {
          toast.error(`Failed to add ${failedCount} item(s): ${failedBarcodes.join(', ')}`);
        }
      } else {
        const scannedBarcode = barcodes[0];

        if (scannedBarcode.length < 3) {
          toast.error('Invalid barcode format');
          return;
        }

        onBarcodeScanned(scannedBarcode);
      }

      setBarcode('');
      setLastScannedTime(0);
      setLastInputTime(0);
      inputRef.current?.focus();
    } else {
      setLastScannedTime(currentTime);

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      if (timeSinceLastKey > 100 && barcode.length > 0) {
        // Barcode entry in progress
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);
    
    if (value.length === 1) {
      setLastInputTime(Date.now());
    }
  };

  const handleInputFocus = () => {
    if (barcode.length === 0) {
      setInputMode('scanner');
    }
  };

  const handleInputBlur = () => {
    // Don't auto-focus when losing focus
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3 w-1/2">
      <div className="flex items-center gap-2">
        <Barcode className="h-5 w-5 text-blue-600" />
        <Label className="font-semibold text-blue-900">Barcode Scanner</Label>
        <div className="ml-auto flex items-center gap-2">
          {scannerConnected && (
            <Badge className="bg-green-500 text-white animate-pulse">
              ✓ Scanner Connected
            </Badge>
          )}
          <Badge variant="outline" className="text-gray-900 text-xs">
            USB/USB-C Ready
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder={
            inputMode === 'scanner' 
              ? "Scan barcode here..." 
              : "Type/paste barcodes (space or comma separated)..."
          }
          value={barcode}
          onChange={(e) => {
            handleInputChange(e);
            if (e.target.value.length > 0) {
              setInputMode('manual');
            }
          }}
          onKeyDown={(e) => {
            handleBarcodeInput(e);
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={isProcessing}
          className="font-mono text-sm border-2 border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
        
        <div className="flex items-center gap-2 justify-between">
          <Badge variant="outline" className="text-xs text-gray-900">
            {barcode.length} chars
          </Badge>
          <Badge className={inputMode === 'scanner' ? 'bg-green-500' : 'bg-blue-500'}>
            {inputMode === 'scanner' ? '🔴 Scanner Mode' : '⌨️ Manual Mode'}
          </Badge>
        </div>

        <div className="flex items-start gap-2 p-2 bg-blue-100 rounded border border-blue-300 text-xs text-blue-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Scanner Tips:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Keep this input field focused for scanner mode</li>
              <li>Scan barcodes directly - Enter key is automatic</li>
              <li>Multiple scans increase quantity</li>
              {scannerConnected && (
                <li className="text-green-700 font-semibold">✓ Scanner detected and ready!</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}