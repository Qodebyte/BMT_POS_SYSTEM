'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit } from "lucide-react";
import { Product, ProductVariant } from '@/app/utils/type';
import { ProductImageGallery } from './ProductImageGallery';
import { StockMovementChart } from './StockMovementChart';
import { EditProductModal } from './EditProductModal';
import { EditImagesModal } from './EditImagesModal';
import { AdjustStockModal } from './AdjustStockModal';


interface ProductDescriptionTabProps {
  product: Product;
    onProductUpdate?: (updatedProduct: Product) => void;
}

export function ProductDescriptionTab({ product, onProductUpdate }: ProductDescriptionTabProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
//   const [selectedVariant, setSelectedVariant] = useState<string>("");

  const handleVariantImageClick = (image: string) => {
    setSelectedImage(image);
  };


    const handleProductSaved = (updatedProduct: Product) => {
    if (onProductUpdate) {
      onProductUpdate(updatedProduct);
    }
  };

  return (
    <div className="space-y-6">
    
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    
        <div className="lg:col-span-2 space-y-6 border border-gray-200">
          <Card className='bg-white shadow-lg text-gray-900 '>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Images</CardTitle>
                <CardDescription className='text-gray-900'>Main product and variant images</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowImagesModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Images
              </Button>
            </CardHeader>
            <CardContent>
              <ProductImageGallery
                mainImage={selectedImage}
                productImages={product.images}
                variantImages={product.variants.flatMap((v: ProductVariant) => v.images)}
                onVariantImageClick={handleVariantImageClick}
              />
            </CardContent>
          </Card>

         
        
        </div>

        
        <div className="space-y-6">
          <Card className='bg-gray-900'>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Basic product information</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4" />
                Edit Product
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{product.name}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium">{product.category}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Brand</div>
                  <div className="font-medium">{product.brand}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Description</div>
                  <div className="text-gray-700 mt-1">{product.description}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox checked={product.taxable} disabled />
                  <div>
                    <div className="font-medium">Taxable</div>
                    <div className="text-sm text-gray-500">Product is subject to tax</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox checked={product.hasVariation} disabled />
                  <div>
                    <div className="font-medium">Has Variations</div>
                    <div className="text-sm text-gray-500">
                      {product.hasVariation ? 'Multiple variants' : 'Single product'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Unit</div>
                  <div className="font-medium">{product.unit}</div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-green-400 hover:bg-green-500 text-black mt-4"
                onClick={() => setShowAdjustStockModal(true)}
              >
                Adjust Stock
              </Button>
            </CardContent>
          </Card>

        
          <Card className='bg-white shadow-lg text-gray-900'>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.variants?.map((variant: ProductVariant) => (
                <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{variant.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{variant.quantity} units</div>
                    <Badge variant={
                      variant.quantity === 0 ? "destructive" :
                      variant.quantity <= variant.threshold ? "secondary" : "secondary"
                    }>
                      {variant.quantity === 0 ? "Out of Stock" :
                       variant.quantity <= variant.threshold ? "Low Stock" : "In Stock"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className='bg-white shadow-lg text-gray-900'>
            <CardHeader>
              <CardTitle>Stock Movement</CardTitle>
              <CardDescription>Track stock changes over time for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <StockMovementChart productId={product.id} variants={product.variants} />
            </CardContent>
        </Card>
    
      <EditProductModal 
        product={product}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={handleProductSaved}
      />
      
      <EditImagesModal
        product={product}
        open={showImagesModal}
        onOpenChange={setShowImagesModal}
      />
      
      <AdjustStockModal
        product={product}
        open={showAdjustStockModal}
        onOpenChange={setShowAdjustStockModal}
      />
    </div>
  );
}