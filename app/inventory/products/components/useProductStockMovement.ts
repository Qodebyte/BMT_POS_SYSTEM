'use client';

import { useState, useEffect } from 'react';

export interface StockMovementPoint {
  date: string;
  stock: number;
  change: number;
  transaction_count: number;
}

export interface VariantMovement {
  variant_id: string;
  sku: string;
  movements: StockMovementPoint[];
  summary: {
    starting_stock: number;
    ending_stock: number;
    net_change: number;
  };
}

export interface CombinedSummary {
  total_variants: number;
  total_stock: number;
  total_transactions: number;
  net_change: number;
}

export interface ProductStockMovementResponse {
  success: boolean;
  product: {
    id: string;
    name: string;
    brand: string;
    category: {
      id: string;
      name: string;
    };
  };
  filter: string;
  granularity: 'hourly' | 'daily' | 'weekly';
  period: {
    start: string;
    end: string;
  };
  variants_movement: VariantMovement[];
  combined_summary: CombinedSummary;
}

interface UseProductStockMovementOptions {
  filter?: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  granularity?: 'hourly' | 'daily' | 'weekly';
}

export function useProductStockMovement(
  productId: string,
  options: UseProductStockMovementOptions = { filter: 'today' }
) {
  const [data, setData] = useState<ProductStockMovementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductStockMovement = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
        
        let url = `${apiUrl}/analytics/product-stock-movement/${productId}?filter=${options.filter || 'today'}`;
        
        if (options.granularity) {
          url += `&granularity=${options.granularity}`;
        }

        if (options.filter === 'custom' && options.startDate && options.endDate) {
          url += `&start_date=${options.startDate}&end_date=${options.endDate}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch product stock movement');
        }

        const result: ProductStockMovementResponse = await response.json();
        setData(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Error fetching product stock movement:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductStockMovement();
    }
  }, [productId, options.filter, options.startDate, options.endDate, options.granularity]);

  return { data, loading, error };
}