'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

interface ChartDataPoint {
  period: string;
  date?: string;
  income: number;
  expense: number;
  net: number;
}

interface ApiChartDataItem {
  period: string;
  date?: string;
  income: number;
  expense: number;
  net: number;
}

interface ApiChartResponse {
  success: boolean;
  filter: string;
  period: {
    start: string | Date;
    end: string | Date;
  };
  chart_data: ApiChartDataItem[];
}

interface IncomeExpenseChartProps {
  dateRange?: string;
  onDataLoaded?: (data: ChartDataPoint[]) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
    dataKey: string;
    value: number;
    color: string;
    name: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const income = payload.find(p => p.dataKey === 'income')?.value ?? 0;
    const expense = payload.find(p => p.dataKey === 'expense')?.value ?? 0;

    return (
      <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
        <p className="text-white font-medium">{label}</p>
        <p className="text-green-400">Income: NGN {income.toLocaleString('en-NG')}</p>
        <p className="text-red-400">Expenses: NGN {expense.toLocaleString('en-NG')}</p>
        <p className="text-blue-400">
          Net: NGN {(income - expense).toLocaleString('en-NG')}
        </p>
      </div>
    );
  }
  return null;
};

export function IncomeExpenseChart({ dateRange = 'thisMonth', onDataLoaded }: IncomeExpenseChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';

  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  };

  const isValidApiResponse = (data: unknown): data is ApiChartResponse => {
    if (!data || typeof data !== 'object') return false;
    const response = data as Record<string, unknown>;
    return (
      typeof response.success === 'boolean' &&
      typeof response.filter === 'string' &&
      Array.isArray(response.chart_data) &&
      response.chart_data.every((item: unknown) => {
        if (typeof item !== 'object' || !item) return false;
        const chartItem = item as Record<string, unknown>;
        return (
          typeof chartItem.period === 'string' &&
          typeof chartItem.income === 'number' &&
          typeof chartItem.expense === 'number' &&
          typeof chartItem.net === 'number'
        );
      })
    );
  };

  const fetchChartData = async (filter: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = `${apiUrl}/analytics/income-vs-expense?filter=${filter}`;

      // Add custom date range if needed
      if (filter === 'custom') {
        const startDate = sessionStorage.getItem('chartStartDate') || new Date().toISOString().split('T')[0];
        const endDate = sessionStorage.getItem('chartEndDate') || new Date().toISOString().split('T')[0];
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.statusText}`);
      }

      const result = await response.json() as unknown;

      if (isValidApiResponse(result) && result.chart_data.length > 0) {
        const transformedData: ChartDataPoint[] = result.chart_data.map(
          (item: ApiChartDataItem) => ({
            period: item.period,
            date: item.date,
            income: item.income,
            expense: item.expense,
            net: item.net,
          })
        );

        setData(transformedData);
        onDataLoaded?.(transformedData);
      } else {
        setData([]);
        toast.error('No chart data available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chart data';
      setError(errorMessage);
      console.error('Error fetching chart data:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(dateRange);
  }, [dateRange]);

  if (loading) {
    return (
      <div className="aspect-4/3 min-h-65 sm:aspect-5/3 md:aspect-video lg:aspect-5/3 w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-4/3 min-h-65 sm:aspect-5/3 md:aspect-video lg:aspect-5/3 w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-red-500">Error loading chart</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="aspect-4/3 min-h-65 sm:aspect-5/3 md:aspect-video lg:aspect-5/3 w-full flex items-center justify-center">
        <p className="text-sm text-gray-500">No data available for the selected period</p>
      </div>
    );
  }

  return (
    <div className="aspect-4/3 min-h-65 sm:aspect-5/3 md:aspect-video lg:aspect-5/3 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="period"
            stroke="#9CA3AF"
            fontSize={12}
            angle={data.length > 10 ? -45 : 0}
            height={data.length > 10 ? 80 : 30}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value: number) => `NGN ${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="income"
            fill="#10B981"
            radius={[6, 6, 0, 0]}
            name="Income"
          />
          <Bar
            dataKey="expense"
            fill="#EF4444"
            radius={[6, 6, 0, 0]}
            name="Expenses"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}