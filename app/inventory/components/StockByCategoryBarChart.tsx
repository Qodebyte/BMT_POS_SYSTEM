'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Loader } from 'lucide-react';

interface CategoryStock {
  category: string;
  stock: number;
}

interface ApiCategoryStockItem {
  category: string;
  stock: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: CategoryStock;
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
        <div className="font-medium">{payload[0].payload.category}</div>
        <div className="text-green-400">
          Stock: {payload[0].value} items
        </div>
      </div>
    );
  }
  return null;
};

interface StockByCategoryBarChartProps {
  filter: string;
}

export function StockByCategoryBarChart({ filter }: StockByCategoryBarChartProps) {
  const [data, setData] = useState<CategoryStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const [customRange, setCustomRange] = useState<{
  startDate: string;
  endDate: string;
} | null>(null);

  useEffect(() => {
    const fetchStockByCategory = async () => {
        if (filter === 'custom' && !customRange) return;
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
        let url = `${apiUrl}/analytics/stock-by-category?filter=${filter}`;
        if (filter === 'custom' && customRange) {
          url += `&start_date=${customRange.startDate}&end_date=${customRange.endDate}`;
        }
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch stock by category');
        }

        const result = await response.json();

      
        const transformedData: CategoryStock[] = result.category_stock.map(
          (item: ApiCategoryStockItem) => ({
            category: item.category,
            stock: item.stock,
          })
        );

        setData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStockByCategory();
  }, [filter]);

  if (loading) {
    return (
      <div className="w-full h-80 sm:h-90 md:h-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading stock data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-80 sm:h-90 md:h-100 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="font-medium">Error loading stock data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-80 sm:h-90 md:h-100 flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <p>No stock data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-90 md:h-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e5e7eb"
          />

          {/* X = numbers */}
          <XAxis
            type="number"
            stroke="#6b7280"
            fontSize={12}
          />

          {/* Y = categories */}
          <YAxis
            type="category"
            dataKey="category"
            stroke="#6b7280"
            fontSize={12}
            width={110}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="stock"
            radius={[0, 6, 6, 0]}
            fill="#10b981"
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
