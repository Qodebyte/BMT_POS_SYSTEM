'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader, AlertCircle } from 'lucide-react';
import { InstallmentPayment } from '../hooks/useInstallmentPlans';
import { formatCurrency } from '../hooks/utils';
import { toast } from 'sonner';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: InstallmentPayment | null;
  planId: string | number;
  onPaymentRecorded: () => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  payment,
  planId,
  onPaymentRecorded,
}: RecordPaymentDialogProps) {
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
  const getToken = () => localStorage.getItem('adminToken');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment) {
      setError('Payment data is missing');
      return;
    }

    if (!method) {
      setError('Please select a payment method');
      return;
    }

    if (!reference.trim()) {
      setError('Please enter a payment reference/transaction ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();

      const response = await fetch(`${apiUrl}/sales/installment/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          installment_payment_id: payment.id,
          amount: payment.amount,
          method,
          reference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record payment');
      }

      const data = await response.json();

      toast.success('Payment recorded successfully');
      
      // Reset form
      setMethod('');
      setReference('');
      onOpenChange(false);
      
    
      onPaymentRecorded();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record payment';
      setError(message);
      toast.error(message);
      console.error('Error recording payment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record payment for installment #{payment.payment_number}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
         
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Amount</Label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold text-gray-900">
              {formatCurrency(payment.amount)}
            </div>
          </div>

        
          <div className="space-y-2">
            <Label className="text-sm font-medium">Due Date</Label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
              {new Date(payment.due_date).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="method" className="text-sm font-medium">
              Payment Method <span className="text-red-600">*</span>
            </Label>
            <Select value={method} onValueChange={setMethod} disabled={loading}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

        
          <div className="space-y-2 hidden">
            <Label htmlFor="reference" className="text-sm font-medium">
              Reference / Transaction ID <span className="text-red-600">*</span>
            </Label>
            <Input
              id="reference"
              placeholder="e.g., TXN123456789 or Cheque #5643"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={loading}
              className="text-sm"
            />
            <p className="text-xs text-gray-600">
              Enter the transaction ID, cheque number, or reference for this payment
            </p>
          </div>

         
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-1">
            <p className="text-xs font-medium text-blue-900">Payment Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Amount to be paid:</span>
              <span className="font-semibold text-blue-900">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Payment Method:</span>
              <span className="font-semibold text-blue-900">
                {method || '—'}
              </span>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !method || !reference.trim()}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}