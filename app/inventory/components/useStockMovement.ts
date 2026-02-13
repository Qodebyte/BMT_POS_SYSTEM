'use client';
import { useState, useEffect } from 'react';

export interface StockMovementPoint {
  time: string;
  stock: number;
  change: number;
  timestamp?: string;
  details?: Array<Record<string, unknown>>;
  transaction_count?: number;
}

export interface VariantMovement {
  variant: {
    id: string;
    sku: string;
    threshold: number;
    product: {
      id: string;
      name: string;
      brand: string;
      category: {
        id: string;
        name: string;
      };
    };
  };
  movement_data: StockMovementPoint[];
  summary: {
    starting_stock: number;
    ending_stock: number;
    net_change: number;
    max_stock: number;
    min_stock: number;
    average_stock: number;
    total_transactions: number;
    current_status: string;
  };
  statistics: {
    stock_increases: number;
    stock_decreases: number;
    no_change_periods: number;
    total_increase_quantity: number;
    total_decrease_quantity: number;
  };
}

export interface StockMovementResponse {
  success: boolean;
  filter: string;
  granularity: string;
  period: { start: string; end: string };
  movement_data: VariantMovement[];
}

export function useStockMovement(
  filter: string = 'today',
  variantId?: string
) {
  const [movementData, setMovementData] = useState<StockMovementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [customRange, setCustomRange] = useState<{
  startDate: string;
  endDate: string;
} | null>(null);

  useEffect(() => {
    const fetchMovementData = async () => { 
      
      if (filter === 'custom' && !customRange) return;
      setLoading(true);
      setError(null);
     
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
        
       
        let url = `${apiUrl}/analytics/stock-movement-flow?filter=${filter}`;
        if (variantId) {
          url += `&variant_id=${variantId}`;
        }
          if (filter === 'custom' && customRange) {
        url += `&start_date=${customRange.startDate}&end_date=${customRange.endDate}`;
      }
      
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch stock movement data');
        }

        const data: StockMovementResponse = await response.json();
        setMovementData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Error fetching stock movement:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovementData();
  }, [filter, variantId, customRange]);

  return { movementData, loading, error };
}