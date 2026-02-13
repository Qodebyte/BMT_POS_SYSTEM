'use client';
import { useState, useEffect } from 'react';

interface KPIData {
  total_stock: number;
  in_stock_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  inventory_sell_value: number;
  inventory_cost_value: number;
  inventory_profit_value?: number;
  total_variants: number;
}

interface GrowthData {
  total_stock_change: number;
  in_stock_change: number;
  low_stock_change: number;
  out_of_stock_change: number;
  sell_value_change: number;
  cost_value_change: number;
}

export interface KPIResponse {
  success: boolean;
  filter: string;
  period: { start: string; end: string };
  kpi: KPIData;
  previous?: KPIData;
  growth?: GrowthData;
}

export function useInventoryKPI(filter: string = 'today', compare: boolean = false) {
  const [kpiData, setKpiData] = useState<KPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [customRange, setCustomRange] = useState<{
  startDate: string;
  endDate: string;
} | null>(null);
  useEffect(() => {
    const fetchKPI = async () => {
        if (filter === 'custom' && !customRange) return;
      setLoading(true);
      setError(null);
     
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
        const compareParam = compare ? 'true' : 'false';
        let url = `${apiUrl}/analytics/inventory-kpi?filter=${filter}&compare=${compareParam}`;

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
          throw new Error(errorData.error || 'Failed to fetch KPI data');
        }

        const data: KPIResponse = await response.json();
        setKpiData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Error fetching KPI:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKPI();
  }, [filter, compare, customRange]);

  return { kpiData, loading, error };
}