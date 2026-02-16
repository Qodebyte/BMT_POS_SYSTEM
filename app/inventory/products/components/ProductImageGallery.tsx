'use client';

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductImageGalleryProps {
  mainImage: string;
  productImages: string[];
  variantImages: string[];
  onVariantImageClick: (image: string) => void;
}

export function ProductImageGallery({ 
  mainImage, 
  productImages, 
  variantImages, 
  onVariantImageClick 
}: ProductImageGalleryProps) {
  const [activeTab, setActiveTab] = useState<'product' | 'variants'>('product');
  
  const allImages = [...productImages, ...variantImages];

  return (
    <div className="space-y-6">
      
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
        {mainImage ? (
          <Image
            src={mainImage}
            alt="Product"
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      
      <div className="border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-1 text-sm font-medium ${
              activeTab === 'product'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('product')}
          >
            Product Images ({productImages.length})
          </button>
          {variantImages.length > 0 && (
            <button
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === 'variants'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('variants')}
            >
              Variant Images ({variantImages.length})
            </button>
          )}
        </div>
      </div>

     
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {(activeTab === 'product' ? productImages : variantImages).map((image, index) => (
          <button
            key={index}
            className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
              mainImage === image
                ? 'border-green-400 ring-2 ring-green-400/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onVariantImageClick(image)}
          >
            <Image
              src={image}
              width={80}
              height={80}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}