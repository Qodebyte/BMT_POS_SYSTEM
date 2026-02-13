'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProductVariant } from '@/app/utils/type';
import { useProductStockMovement } from './useProductStockMovement';

interface StockMovementChartProps {
  productId: string;
  variants?: ProductVariant[];
}

type ChartDataPoint = {
  date: string;
  stock: number;
};

type FilterType = 'today' | 'week' | 'month' | 'year';

export function StockMovementChart({
  productId,
  variants = [],
}: StockMovementChartProps) {
  const [selectedVariant, setSelectedVariant] = useState('all');
  const [filter, setFilter] = useState<FilterType>('today');
  
  const { data, loading, error } = useProductStockMovement(productId, { filter });

  const chartData = useMemo(() => {
    if (!data?.variants_movement || data.variants_movement.length === 0) {
      return [];
    }

    if (selectedVariant === 'all') {
    
      const dateMap = new Map<string, number>();
      
      data.variants_movement.forEach(variant => {
        variant.movements.forEach(movement => {
          const current = dateMap.get(movement.date) || 0;
          dateMap.set(movement.date, current + movement.stock);
        });
      });

   
      return Array.from(dateMap.entries())
        .map(([date, stock]) => ({
          date,
          stock,
        }))
        .sort((a, b) => {
         
          try {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          } catch {
            return a.date.localeCompare(b.date);
          }
        });
    } else {
     
      const variantMovement = data.variants_movement.find(
        vm => vm.variant_id === selectedVariant
      );

      if (!variantMovement) {
        return [];
      }

      return variantMovement.movements.map(movement => ({
        date: movement.date,
        stock: movement.stock,
      }));
    }
  }, [data, selectedVariant]);

  const startStock = chartData[0]?.stock ?? 0;
  const currentStock = chartData.at(-1)?.stock ?? 0;
  const netChange = currentStock - startStock;

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <p className="text-red-700">Error loading stock movement: {error}</p>
        </CardContent>
      </Card>
    );
  }


  const formatTooltipLabel = (label: string): string => {
   
    if (label.includes(':')) {
  
      return label;
    } else if (label.includes(' - ')) {
    
      return label;
    } else if (!isNaN(Number(label))) {
     
      return `Day ${label}`;
    } else {
     
      try {
        return new Date(label).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return label;
      }
    }
  };


  const tooltipFormatter = (value: number | undefined): [string, string] => {
    return [String(value ?? 0), 'Stock'];
  };

  return (
    <div className="space-y-4">
    
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-52 border border-gray-700 bg-gray-800">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedVariant} onValueChange={setSelectedVariant}>
          <SelectTrigger className="w-full sm:w-52 border border-gray-700 bg-gray-800">
            <SelectValue placeholder="Select variant" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Variants</SelectItem>
            {data?.variants_movement && data.variants_movement.map((variant) => (
              <SelectItem key={variant.variant_id} value={variant.variant_id}>
                {variant.sku}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

     
      {loading ? (
        <div className="h-72 w-full rounded-lg border border-gray-700 bg-gray-800 p-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-gray-400">Loading chart data...</span>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-72 w-full rounded-lg border border-gray-700 bg-gray-800 p-4 flex items-center justify-center">
          <p className="text-gray-400">No stock movement data available for this period</p>
        </div>
      ) : (
        <div className="h-72 w-full rounded-lg border border-gray-700 bg-gray-800 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value: string) => {
              
                  if (value.length > 12) {
                    return value.substring(0, 12) + '...';
                  }
                  return value;
                }}
              />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#E5E7EB' }}
                formatter={tooltipFormatter}
                labelFormatter={formatTooltipLabel}
              />
              <Line
                type="monotone"
                dataKey="stock"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3B82F6' }}
                activeDot={{ r: 5, fill: '#1D4ED8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

 
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
          <div className="text-sm text-gray-400">Starting Stock</div>
          <div className="text-2xl font-bold text-white mt-1">{startStock}</div>
        </div>

        <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
          <div className="text-sm text-gray-400">Current Stock</div>
          <div className="text-2xl font-bold text-white mt-1">{currentStock}</div>
        </div>

        <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
          <div className="text-sm text-gray-400">Net Change</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              netChange > 0
                ? 'text-green-400'
                : netChange < 0
                ? 'text-red-400'
                : 'text-gray-400'
            }`}
          >
            {netChange > 0 ? '+' : ''}
            {netChange}
          </div>
        </div>
      </div>

    
      {data?.combined_summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-gray-900 border border-blue-800 p-4">
            <div className="text-xs text-blue-400">Total Variants</div>
            <div className="text-lg font-bold text-blue-300 mt-1">
              {data.combined_summary.total_variants}
            </div>
          </div>

          <div className="rounded-lg bg-gray-900 border border-green-800 p-4">
            <div className="text-xs text-green-400">Total Stock</div>
            <div className="text-lg font-bold text-green-300 mt-1">
              {data.combined_summary.total_stock}
            </div>
          </div>

          <div className="rounded-lg bg-gray-900 border border-purple-800 p-4">
            <div className="text-xs text-purple-400">Transactions</div>
            <div className="text-lg font-bold text-purple-300 mt-1">
              {data.combined_summary.total_transactions}
            </div>
          </div>

          <div className={`rounded-lg border p-4 ${data.combined_summary.net_change >= 0 ? 'bg-gray-900 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
            <div className={`text-xs ${data.combined_summary.net_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Net Change
            </div>
            <div className={`text-lg font-bold mt-1 ${data.combined_summary.net_change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {data.combined_summary.net_change > 0 ? '+' : ''}
              {data.combined_summary.net_change}
            </div>
          </div>
        </div>
      )}

   
      {data?.granularity && (
        <div className="text-xs text-gray-400 text-center">
          Data shown by <span className="font-semibold text-gray-300">{data.granularity}</span> granularity
        </div>
      )}
    </div>
  );
}