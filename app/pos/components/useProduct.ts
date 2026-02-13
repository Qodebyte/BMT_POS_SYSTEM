'use client';

import { useState, useEffect } from 'react';

export interface Variant {
  id: number;
  sku: string;
  quantity: number;
  selling_price: string | number;
  cost_price: string | number;
  threshold: number;
  image_url?: File[];
  barcode?: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  brand: string;
  description: string;
  base_sku: string;
  image_url: File[];
  taxable: boolean;
  threshold: number | null;
  unit: string;
  hasVariation: boolean;
  created_at: string;
  updated_at: string;
  category: {
    id: number;
    name: string;
  };
  variants: Variant[];
  stock?: {
    total_quantity: number;
    status: string;
    base_price: number;
    inventory_value: number;
    threshold: number;
  };
}

interface UseProductsResponse {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsResponse {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
      const response = await fetch(`${apiUrl}/products?limit=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }

      const result = await response.json();
      const productsList = Array.isArray(result.products) ? result.products : result;
      
    
      const transformedProducts: Product[] = productsList.map((product: Product) => ({
        id: product.id,
        category_id: product.category_id,
        name: product.name,
        brand: product.brand || 'Unknown',
        description: product.description,
        base_sku: product.base_sku,
        image_url: product.image_url || [],
        taxable: product.taxable,
        threshold: product.threshold,
        unit: product.unit,
        hasVariation: product.hasVariation,
        created_at: product.created_at,
        updated_at: product.updated_at,
        category: product.category || { id: product.category_id, name: 'Uncategorized' },
        variants: product.variants?.map((v: Variant) => ({
          id: v.id,
          sku: v.sku,
          quantity: v.quantity,
          selling_price: parseFloat(String(v.selling_price)),
          cost_price: parseFloat(String(v.cost_price)),
          threshold: v.threshold || 0,
          image_url: v.image_url,
          barcode: v.barcode,
        })) || [],
        stock: product.stock,
      }));

      setProducts(transformedProducts);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: fetchProducts };
}
