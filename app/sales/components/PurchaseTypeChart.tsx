'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getPurchaseTypeDistribution } from '@/app/lib/api';

interface PurchaseTypeApiItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  purchase_type?: string;
  total_amount?: number;
  average_transaction?: number;
}

interface PurchaseTypeApiResponse {
  success: boolean;
  chart_data: PurchaseTypeApiItem[];
}


interface ChartDataItem {
  [key: string]: string | number | undefined; 
  name: string;
  value: number;
  percentage: string;
  color: string;
  purchase_type?: string;
  total_amount?: number;
  average_transaction?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartDataItem }[];
}

type DateRange = {
  filter: string;
  startDate: string;
  endDate: string;
};

interface PurchaseTypeChartProps {
  dateRange: DateRange;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm">{data.value} transactions</p>
        <p className="text-sm">{data.percentage}% of total</p>
        {data.total_amount && (
          <p className="text-sm">NGN {data.total_amount.toFixed(2)}</p>
        )}
      </div>
    );
  }
  return null;
}

interface CustomLegendProps {
  payload?: Array<{ payload: ChartDataItem }>;
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => {
        const data = entry.payload;
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-sm">{data.value}</span>
            <span className="text-sm text-gray-500">({data.percentage}%)</span>
          </div>
        );
      })}
    </div>
  );
}

export function PurchaseTypeChart({ dateRange }: PurchaseTypeChartProps) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

       const response: PurchaseTypeApiResponse = await getPurchaseTypeDistribution(
          dateRange.filter,
          dateRange.filter === 'custom' ? dateRange.startDate : undefined,
          dateRange.filter === 'custom' ? dateRange.endDate : undefined
        );

        if (response.success && response.chart_data && Array.isArray(response.chart_data)) {
          const formattedData: ChartDataItem[] = response.chart_data.map((item) => ({
            name: item.name || 'Unknown',
            value: item.value || 0,
            percentage: (item.percentage || 0).toString(),
            color: item.color || '#6B7280',
            purchase_type: item.purchase_type,
            total_amount: item.total_amount,
            average_transaction: item.average_transaction
          }));
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error('Failed to fetch purchase type distribution:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-600">Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              isAnimationActive={false}
              label={({ name = 'Unknown', percent = 0 }: { name?: string; percent?: number }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No purchase type data available
        </div>
      )}
    </div>
  );
}
