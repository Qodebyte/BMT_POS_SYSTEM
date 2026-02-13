'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getSalesOvertime } from '@/app/lib/api';
import { SalesChartTooltip } from './Omo';

type DateRange = {
  filter: string;
  startDate: string;
  endDate: string;
};

interface ChartDataItem {
  time: string;
  amount: number;
  count: number;
}

interface SalesOvertimeResponse {
  success: boolean;
  chart_data?: ChartDataItem[];
  summary?: {
    total_transactions: number;
    total_sales_amount: number;
    total_tax: number;
    total_discount: number;
    average_transaction_value: number;
    average_hourly_transactions: number;
    average_hourly_revenue: number;
    peak_time: {
      time: string;
      amount: number;
      count: number;
    } | null;
  };
}

export function SalesChart({ dateRange }: { dateRange: DateRange }) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getSalesOvertime(
          dateRange.filter,
          dateRange.filter === 'custom' ? dateRange.startDate : undefined,
          dateRange.filter === 'custom' ? dateRange.endDate : undefined
        ) as SalesOvertimeResponse;

        if (response.success && response.chart_data && Array.isArray(response.chart_data)) {
          const formattedData: ChartDataItem[] = response.chart_data.map((item) => ({
            time: item.time || '',
            amount: item.amount || 0,
            count: item.count || 0
          }));
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error('Failed to fetch sales overtime data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-600">Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-red-600">Error loading chart data: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666' }} />
          <YAxis stroke="#666" tick={{ fill: '#666' }} tickFormatter={v => `NGN ${v}`} />
          <Tooltip content={<SalesChartTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue (NGN)"
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Transactions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
