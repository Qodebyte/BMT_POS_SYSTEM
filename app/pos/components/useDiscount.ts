'use client';

import { useState, useEffect } from 'react';
import { Discount } from '@/app/utils/type';

export interface BackendDiscount {
  id: number;
  name: string;
  discount_type: 'fixed_amount' | 'percentage';
  percentage?: number;
  fixed_amount?: number;
  start_date: string;
  end_date: string;
  description?: string;
  created_at: string;
}

export interface ProductDiscount {
  id: number;
  product_id: number;
  discount_id: number;
  product?: {
    id: number;
    name: string;
    brand: string;
  };
  discount?: BackendDiscount;
}

interface UseDiscountsResponse {
  discounts: Discount[];
  productDiscounts: ProductDiscount[];
  loading: boolean;
  error: string | null;
  getDiscountForProduct: (productId: number) => BackendDiscount | null;
  isDiscountActive: (discount: BackendDiscount) => boolean;
  refetch: () => Promise<void>;
}

export function useDiscounts(): UseDiscountsResponse {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDiscountActive = (discount: BackendDiscount): boolean => {
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = new Date(discount.end_date);
    return now >= startDate && now <= endDate;
  };

  const getDiscountForProduct = (productId: number): BackendDiscount | null => {
    const productDiscount = productDiscounts.find(
      pd => pd.product_id === productId && pd.discount
    );
    
    if (!productDiscount?.discount) return null;
    
    if (isDiscountActive(productDiscount.discount)) {
      return productDiscount.discount;
    }
    
    return null;
  };

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';

      const discountsResponse = await fetch(`${apiUrl}/sales/discounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!discountsResponse.ok) {
        throw new Error('Failed to fetch discounts');
      }

      const discountsData = await discountsResponse.json();
      const backendDiscounts: BackendDiscount[] = discountsData.discounts || [];
      
    
      const transformedDiscounts: Discount[] = backendDiscounts.map(d => ({
        id: d.id,
        name: d.name,
        type: d.discount_type,
        percentage: d.percentage,
        fixed_amount: d.fixed_amount,
        value: d.discount_type === 'percentage' ? d.percentage! : d.fixed_amount!,
        status: isDiscountActive(d) ? 'active' : 'expired',
      }));
      
      setDiscounts(transformedDiscounts);

      const linksResponse = await fetch(`${apiUrl}/sales/discounts/links/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!linksResponse.ok) {
        throw new Error('Failed to fetch product discount links');
      }

      const linksData = await linksResponse.json();
      setProductDiscounts(linksData.links || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  return {
    discounts,
    productDiscounts,
    loading,
    error,
    getDiscountForProduct,
    isDiscountActive,
    refetch: fetchDiscounts,
  };
}