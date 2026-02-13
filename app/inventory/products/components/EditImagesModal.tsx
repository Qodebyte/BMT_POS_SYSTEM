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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Loader } from "lucide-react";
import Image from 'next/image';
import { Product, ProductVariant } from '@/app/utils/type';
import { toast } from 'sonner';

interface EditImagesModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedProduct: Product) => void;
}

interface ImageTracker {
  newFiles: File[];
  deletedImages: string[];
  replaceAll: boolean;
}

export function EditImagesModal({ product, open, onOpenChange, onSave }: EditImagesModalProps) {
  const [productImages, setProductImages] = useState<string[]>(product.images);
  const [variantImages, setVariantImages] = useState<Record<string, string[]>>(
    product.variants.reduce<Record<string, string[]>>((acc, variant) => {
      acc[variant.id] = variant.images;
      return acc;
    }, {})
  );

  const [productImageTracker, setProductImageTracker] = useState<ImageTracker>({
    newFiles: [],
    deletedImages: [],
    replaceAll: false,
  });

  const [variantImageTrackers, setVariantImageTrackers] = useState<Record<string, ImageTracker>>(
    product.variants.reduce<Record<string, ImageTracker>>((acc, variant) => {
      acc[variant.id] = {
        newFiles: [],
        deletedImages: [],
        replaceAll: false,
      };
      return acc;
    }, {})
  );

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('product');

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.bmtpossystem.com';

  const getToken = () => localStorage.getItem('adminToken');

  // Product image handlers
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImageFiles = Array.from(files);
      setProductImageTracker(prev => ({
        ...prev,
        newFiles: [...prev.newFiles, ...newImageFiles],
      }));

      const previewUrls = newImageFiles.map(file => URL.createObjectURL(file));
      setProductImages(prev => [...prev, ...previewUrls]);
    }
  };

  const removeProductImage = (index: number) => {
    const imageToRemove = productImages[index];

    // Track deleted images (only existing ones)
    if (!imageToRemove.startsWith('blob:')) {
      const filename = imageToRemove.split('/').pop();
      if (filename) {
        setProductImageTracker(prev => ({
          ...prev,
          deletedImages: [...prev.deletedImages, filename],
        }));
      }
    }

    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  // Variant image handlers
  const handleVariantImageUpload = (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImageFiles = Array.from(files);
      setVariantImageTrackers(prev => ({
        ...prev,
        [variantId]: {
          ...prev[variantId],
          newFiles: [...(prev[variantId]?.newFiles || []), ...newImageFiles],
        },
      }));

      const previewUrls = newImageFiles.map(file => URL.createObjectURL(file));
      setVariantImages(prev => ({
        ...prev,
        [variantId]: [...(prev[variantId] || []), ...previewUrls],
      }));
    }
  };

  const removeVariantImage = (variantId: string, index: number) => {
    const imageToRemove = variantImages[variantId]?.[index];

    if (imageToRemove && !imageToRemove.startsWith('blob:')) {
      const filename = imageToRemove.split('/').pop();
      if (filename) {
        setVariantImageTrackers(prev => ({
          ...prev,
          [variantId]: {
            ...prev[variantId],
            deletedImages: [...(prev[variantId]?.deletedImages || []), filename],
          },
        }));
      }
    }

    setVariantImages(prev => ({
      ...prev,
      [variantId]: prev[variantId]?.filter((_, i) => i !== index) ?? [],
    }));
  };

  // Submit handlers
  const submitProductImages = async () => {
    try {
      const token = getToken();
      const tracker = productImageTracker;

      // No changes
      if (tracker.newFiles.length === 0 && tracker.deletedImages.length === 0) {
        toast.info('No changes made');
        return;
      }

      const formData = new FormData();

      // Add new files
      tracker.newFiles.forEach(file => {
        formData.append('image_url', file);
      });

      // Add deleted images
      tracker.deletedImages.forEach(filename => {
        formData.append('remove_images', filename);
      });

      if (tracker.replaceAll) {
        formData.append('replace_images', 'true');
      }

      // Add required fields
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('brand', product.brand);
      formData.append('taxable', product.taxable.toString());
      formData.append('unit', product.unit);

      const response = await fetch(`${apiUrl}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product images');
      }

      const updatedData = await response.json();

      const updatedImages = Array.isArray(updatedData.image_url)
        ? updatedData.image_url.map((img: string | { url: string }) => {
            const url = typeof img === 'string' ? img : img?.url;
            return url?.startsWith('http') ? url : `${imageBaseUrl}${url}`;
          })
        : [];

      const updatedProduct: Product = {
        ...product,
        images: updatedImages,
      };

      if (onSave) {
        onSave(updatedProduct);
      }

      toast.success('Product images updated successfully');
      setProductImageTracker({ newFiles: [], deletedImages: [], replaceAll: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product images';
      toast.error(message);
      console.error('Error updating product images:', error);
    }
  };

  const submitVariantImages = async (variantId: string) => {
    try {
      const token = getToken();
      const tracker = variantImageTrackers[variantId];
      const variant = product.variants.find(v => v.id === variantId);

      if (!variant) {
        throw new Error('Variant not found');
      }

      // No changes
      if (tracker.newFiles.length === 0 && tracker.deletedImages.length === 0) {
        toast.info('No changes made for this variant');
        return;
      }

      const formData = new FormData();

      // Add new files
      tracker.newFiles.forEach(file => {
        formData.append('image_url', file);
      });

      // Add deleted images
      tracker.deletedImages.forEach(filename => {
        formData.append('deleteImages', filename);
      });

      if (tracker.replaceAll) {
        formData.append('replace_images', 'true');
      }

      // Add required variant data
      formData.append('attributes', JSON.stringify(variant.attributes));
      formData.append('cost_price', variant.costPrice.toString());
      formData.append('selling_price', variant.sellingPrice.toString());
      formData.append('quantity', variant.quantity.toString());
      formData.append('threshold', variant.threshold.toString());
      formData.append('sku', variant.sku);
      formData.append('barcode', variant.barcode || '');

      const response = await fetch(`${apiUrl}/variants/${variantId}`, {
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

      setVariantImages(prev => ({
        ...prev,
        [variantId]: updatedImages,
      }));

      setVariantImageTrackers(prev => ({
        ...prev,
        [variantId]: { newFiles: [], deletedImages: [], replaceAll: false },
      }));

      toast.success(`Images updated for ${variant.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update variant images';
      toast.error(message);
      console.error('Error updating variant images:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (activeTab === 'product') {
        await submitProductImages();
      } else {
        // Submit all variants with changes
        const variantsToUpdate = product.variants.filter(v => {
          const tracker = variantImageTrackers[v.id];
          return tracker.newFiles.length > 0 || tracker.deletedImages.length > 0;
        });

        if (variantsToUpdate.length === 0) {
          toast.info('No changes made');
          setLoading(false);
          return;
        }

        for (const variant of variantsToUpdate) {
          await submitVariantImages(variant.id);
        }
      }

      // Close after successful save
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasProductChanges = productImageTracker.newFiles.length > 0 || productImageTracker.deletedImages.length > 0;
  const hasVariantChanges = product.variants.some(v => {
    const tracker = variantImageTrackers[v.id];
    return tracker.newFiles.length > 0 || tracker.deletedImages.length > 0;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] text-gray-900 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Manage Images</DialogTitle>
          <DialogDescription className="text-gray-600">
            Add or remove images for the product and its variants
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="product" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full bg-gray-900">
            <TabsTrigger value="product" className="text-white">
              Product Images {hasProductChanges && <span className="ml-2 text-red-400">*</span>}
            </TabsTrigger>
            <TabsTrigger value="variants" className="text-white">
              Variant Images {hasVariantChanges && <span className="ml-2 text-red-400">*</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="product" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {productImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={image}
                      alt={`Product ${index + 1}`}
                      width={100}
                      height={100}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeProductImage(index)}
                    disabled={loading}
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
                  onChange={handleProductImageUpload}
                  disabled={loading}
                />
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center transition-colors bg-gray-50">
                  <Plus className="h-6 w-6 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Add Images</span>
                </div>
              </label>
            </div>

            {/* Product options */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productImageTracker.replaceAll}
                  onChange={(e) => setProductImageTracker(prev => ({
                    ...prev,
                    replaceAll: e.target.checked
                  }))}
                  disabled={loading}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  Replace all images (delete existing and use only new ones)
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                {productImageTracker.replaceAll
                  ? 'Only newly uploaded images will be kept'
                  : 'New images will be added to existing ones'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="space-y-6 mt-4">
            {product.variants.map((variant: ProductVariant) => {
              const tracker = variantImageTrackers[variant.id];
              const hasChanges = tracker.newFiles.length > 0 || tracker.deletedImages.length > 0;

              return (
                <div key={variant.id} className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label>{variant.name} (SKU: {variant.sku})</Label>
                    {hasChanges && <span className="text-xs text-red-600 font-semibold">Unsaved Changes</span>}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {(variantImages[variant.id] || []).map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <Image
                            unoptimized
                            src={image}
                            alt={`Variant ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeVariantImage(variant.id, index)}
                          disabled={loading}
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
                        onChange={(e) => handleVariantImageUpload(variant.id, e)}
                        disabled={loading}
                      />
                      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center transition-colors bg-gray-50">
                        <Plus className="h-6 w-6 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">Add</span>
                      </div>
                    </label>
                  </div>

                  {/* Variant options */}
                  <label className="flex items-center gap-2 cursor-pointer ml-0">
                    <input
                      type="checkbox"
                      checked={tracker.replaceAll}
                      onChange={(e) => setVariantImageTrackers(prev => ({
                        ...prev,
                        [variant.id]: {
                          ...prev[variant.id],
                          replaceAll: e.target.checked
                        }
                      }))}
                      disabled={loading}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">
                      Replace all images for this variant
                    </span>
                  </label>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>

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
            className="bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
            disabled={loading || (!hasProductChanges && !hasVariantChanges)}
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