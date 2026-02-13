
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Check } from "lucide-react";
import { ProductVariant } from '@/app/utils/type';
import { toast } from 'sonner';

interface EditVariantModalProps {
  variant: ProductVariant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedVariant: ProductVariant) => void;
}

export function EditVariantModal({
  variant,
  open,
  onOpenChange,
  onSave,
}: EditVariantModalProps) {
  const [formData, setFormData] = useState({
    threshold: variant.threshold,
    costPrice: variant.costPrice,
    sellingPrice: variant.sellingPrice,
    expiry_date: '',
  });

  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
  const getToken = () => localStorage.getItem('adminToken');

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const hasChanges =
    formData.threshold !== variant.threshold ||
    formData.costPrice !== variant.costPrice ||
    formData.sellingPrice !== variant.sellingPrice ||
    formData.expiry_date !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getToken();

     
     

      if (formData.costPrice < 0 || formData.sellingPrice < 0 ) {
        toast.error('Prices and quantity cannot be negative');
        setLoading(false);
        return;
      }

      if (formData.sellingPrice < formData.costPrice) {
        toast.warning('Selling price is less than cost price');
      }

     
      const updateData: Record<string, string | number> = {};

     

      if (formData.costPrice !== variant.costPrice) {
        updateData.cost_price = parseFloat(formData.costPrice.toString());
      }

      if (formData.sellingPrice !== variant.sellingPrice) {
        updateData.selling_price = parseFloat(formData.sellingPrice.toString());
      }

     

      if (formData.threshold !== variant.threshold) {
        updateData.threshold = parseInt(formData.threshold.toString(), 10);
      }

  

      if (formData.expiry_date) {
        const expiryDate = new Date(formData.expiry_date);
        if (!isNaN(expiryDate.getTime())) {
          updateData.expiry_date = formData.expiry_date;
        } else {
          toast.error('Invalid expiry date');
          setLoading(false);
          return;
        }
      }

      
      if (variant.attributes) {
        updateData.attributes = JSON.stringify(variant.attributes);
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes made');
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/products/variants/${variant.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update variant');
      }

      const responseData = await response.json();
      const updatedVariantData = responseData.variant || responseData;

      const updatedVariant: ProductVariant = {
        ...variant,
        sku: updatedVariantData.sku,
        costPrice: parseFloat(updatedVariantData.cost_price),
        sellingPrice: parseFloat(updatedVariantData.selling_price),
        quantity: updatedVariantData.quantity,
        threshold: updatedVariantData.threshold,
        barcode: updatedVariantData.barcode || '',
      };

      if (onSave) {
        onSave(updatedVariant);
      }

      toast.success('Variant updated successfully');
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update variant';
      toast.error(message);
      console.error('Error updating variant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle>Edit Variant</DialogTitle>
          <DialogDescription>
            Update variant details for {variant.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
        
           <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
           <div>
          {variant.sku || 'N/A'}
           <p className="text-xs text-gray-500">
              SKU cannot be edited. To change it, please create a new variant.
            </p>
           </div>
          </div>

        
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
           <div>
           {variant.barcode || 'N/A'}
             <p className="text-xs text-gray-500">
              Barcode cannot be edited. To change it, please create a new variant.
            </p>
           </div>
          </div>

        
      
         
          <div className="space-y-2">
            <Label htmlFor="threshold">Low Stock Threshold</Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              value={formData.threshold}
              onChange={(e) => handleChange('threshold', parseInt(e.target.value) || 0)}
              placeholder="Enter threshold"
              disabled={loading}
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500">
              System will alert when stock falls below this number
            </p>
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price (NGN)</Label>
            <Input
              id="costPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => handleChange('costPrice', parseFloat(e.target.value) || 0)}
              placeholder="Enter cost price"
              disabled={loading}
              className="border-gray-300"
            />
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Selling Price (NGN)</Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
              placeholder="Enter selling price"
              disabled={loading}
              className="border-gray-300"
            />
            {formData.sellingPrice > 0 && formData.costPrice > 0 && (
              <p className="text-xs text-gray-500">
                Margin: {(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100).toFixed(2)}%
              </p>
            )}
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => handleChange('expiry_date', e.target.value)}
              disabled={loading}
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500">
              Leave empty if product doesn&apos;t expire
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-gray-900 hover:bg-gray-700 text-white disabled:opacity-50"
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Update Variant
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}