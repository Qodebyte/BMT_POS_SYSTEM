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
import { Label } from "@/components/ui/label";
import { Plus, X, Loader } from "lucide-react";
import { ProductVariant } from '@/app/utils/type';
import Image from 'next/image';
import { toast } from 'sonner';

interface EditVariantImagesModalProps {
  variant: ProductVariant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedVariant: ProductVariant) => void;
}

export function EditVariantImagesModal({ 
  variant, 
  open, 
  onOpenChange,
  onSave 
}: EditVariantImagesModalProps) {
  const [images, setImages] = useState<string[]>(variant.images);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [replaceAll, setReplaceAll] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.bmtpossystem.com';

  const getToken = () => localStorage.getItem('adminToken');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImageFiles = Array.from(files);
      setNewFiles(prev => [...prev, ...newImageFiles]);
      
    
      const previewUrls = newImageFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...previewUrls]);
    }
  };

  const removeImage = (index: number, isNew: boolean = false) => {
    const imageToRemove = images[index];
    
   
    if (!isNew && !imageToRemove.startsWith('blob:')) {
     
      const filename = imageToRemove.split('/').pop();
      if (filename) {
        setDeletedImages(prev => [...prev, filename]);
      }
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      const formData = new FormData();

    
      newFiles.forEach(file => {
        formData.append('image_url', file);
      });

   
      if (deletedImages.length > 0) {
        deletedImages.forEach(filename => {
          formData.append('deleteImages', filename);
        });
      }

      if (replaceAll) {
        formData.append('replace_images', 'true');
      }

    
      formData.append('attributes', JSON.stringify(variant.attributes));
      formData.append('cost_price', variant.costPrice.toString());
      formData.append('selling_price', variant.sellingPrice.toString());
      formData.append('quantity', variant.quantity.toString());
      formData.append('threshold', variant.threshold.toString());
      formData.append('sku', variant.sku);
      formData.append('barcode', variant.barcode || '');

      const response = await fetch(`${apiUrl}/variants/${variant.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update variant images');
      }

      const updatedVariantData = await response.json();
      
    
      const updatedImages = Array.isArray(updatedVariantData.variant?.image_url || updatedVariantData.image_url)
        ? (updatedVariantData.variant?.image_url || updatedVariantData.image_url).map((img: string | { url: string }) => {
            const url = typeof img === 'string' ? img : img?.url;
            return url?.startsWith('http') ? url : `${imageBaseUrl}${url}`;
          })
        : [];

      const updatedVariant: ProductVariant = {
        ...variant,
        images: updatedImages,
      };

      if (onSave) {
        onSave(updatedVariant);
      }

      toast.success('Variant images updated successfully');
      onOpenChange(false);
      
     
      setNewFiles([]);
      setDeletedImages([]);
      setReplaceAll(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update images';
      toast.error(message);
      console.error('Error updating variant images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Edit Variant Images</DialogTitle>
          <DialogDescription>
            Manage images for {variant.name} (SKU: {variant.sku})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Label>Current Images</Label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                  <Image 
                    width={100} 
                    height={100} 
                    unoptimized 
                    src={image} 
                    alt={`Variant ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index, image.startsWith('blob:'))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={loading}
              />
              <div className="aspect-square rounded-lg border-2 border-dashed px-6 py-2 border-gray-600 hover:border-gray-400 flex flex-col items-center justify-center transition-colors bg-gray-800">
                <Plus className="h-6 w-6 text-gray-400" />
                <span className="mt-2 text-sm text-gray-400">Add Images</span>
              </div>
            </label>
          </div>

      
          <div className="space-y-2 pt-4 border-t border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceAll}
                onChange={(e) => setReplaceAll(e.target.checked)}
                disabled={loading}
                className="rounded"
              />
              <span className="text-sm text-gray-300">
                Replace all images (delete existing and use only new ones)
              </span>
            </label>
            <p className="text-xs text-gray-500">
              {replaceAll 
                ? 'Only newly uploaded images will be kept' 
                : 'New images will be added to existing ones'}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-gray-900 hover:bg-gray-700 text-white"
            disabled={loading || (newFiles.length === 0 && deletedImages.length === 0)}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}