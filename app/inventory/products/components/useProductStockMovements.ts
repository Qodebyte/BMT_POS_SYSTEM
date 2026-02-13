'use client';

import { useState, useEffect } from 'react';

export interface StockMovement {
  id: string;
  date: string;
  variant: string;
  type: 'Sale' | 'Restock' | 'Adjustment' | 'Return' | 'Damage';
  quantity: number;
  performedBy: string;
  status: 'increased' | 'decreased';
  reason?: string;
}

interface BackendVariant {
  id: string;
  sku: string;
  product_id: string;
}

interface BackendInventoryLog {
  id: string;
  created_at: string;
  quantity: number;
  type: string;
  reason?: string;
  recorded_by_name: string;
  recorded_by_type: string;
  variant?: BackendVariant;
}

interface BackendStockMovementsResponse {
  logs: BackendInventoryLog[];
  totalPages: number;
  totalCount: number;
  page: number;
  limit: number;
}

export interface UseProductStockMovementsResponse {
  logs: StockMovement[];
  totalPages: number;
  totalCount: number;
  page: number;
  limit: number;
}

interface UseProductStockMovementsOptions {
  page?: number;
  limit?: number;
}

export function useProductStockMovements(
  productId: string,
  options: UseProductStockMovementsOptions = { page: 1, limit: 8 }
) {
  const [data, setData] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 8,
    totalPages: 0,
    totalCount: 0,
  });

  useEffect(() => {
    const fetchStockMovements = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
        const url = `${apiUrl}/products/movements/${productId}?page=${pagination.page}&limit=${pagination.limit}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Failed to fetch stock movements');
        }

        const result: BackendStockMovementsResponse = await response.json();
        
     
        const transformedLogs: StockMovement[] = result.logs.map((log: BackendInventoryLog) => ({
          id: log.id,
          date: new Date(log.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          variant: log.variant?.sku || 'Unknown',
          type: mapLogType(log.type),
          quantity: log.quantity,
          performedBy: log.recorded_by_name || 'Unknown',
          status: (log.quantity > 0 ? 'increased' : 'decreased') as 'increased' | 'decreased',
          reason: log.reason,
        }));

        setData(transformedLogs);
        setPagination({
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Error fetching stock movements:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchStockMovements();
    }
  }, [productId, pagination.page, pagination.limit]);

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return { data, loading, error, pagination, goToPage };
}


function mapLogType(type: string): 'Sale' | 'Restock' | 'Adjustment' | 'Return' | 'Damage' {
  const typeMap: Record<string, 'Sale' | 'Restock' | 'Adjustment' | 'Return' | 'Damage'> = {
    sale: 'Sale',
    restock: 'Restock',
    adjustment: 'Adjustment',
    return: 'Return',
    damage: 'Damage',
  };
  return typeMap[type.toLowerCase()] || 'Adjustment';
}
