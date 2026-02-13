'use client';

import { StockAlertWidget } from "@/app/dashboard/components/StockAlertWidget";
import { TopProductsWidget } from "@/app/dashboard/components/TopProductsWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Package, AlertTriangle, DollarSign, TrendingUp, TrendingDown, Loader } from "lucide-react";
import { useEffect, useState,  } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { StockByCategoryBarChart } from "./StockByCategoryBarChart";
import { useInventoryKPI } from "./useInventoryKPI";
import { KPIFilter } from "./KPIFilter";
import { StockMovementChart } from "./StockMovementChart";




interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
  stroke: string;
  dot: string;
  description: string;
}


const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


export function InventoryOverview({ searchQuery }: { searchQuery: string }) {
  const [filter, setFilter] = useState('today');
  const [customRange, setCustomRange] = useState<{
  startDate: string;
  endDate: string;
} | null>(null);
  const [compare, setCompare] = useState(false);
    const [stockDistribution, setStockDistribution] = useState<DistributionItem[]>([]);
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [distributionError, setDistributionError] = useState<string | null>(null);


  const { kpiData, loading, error } = useInventoryKPI(filter, compare);

 useEffect(() => {
  const fetchStockDistribution = async () => {
   
    if (filter === 'custom' && !customRange) return;

    setDistributionLoading(true);
    setDistributionError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found');

      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';

      let url = `${apiUrl}/analytics/stock-distribution?filter=${filter}`;

      if (filter === 'custom' && customRange) {
        url += `&start_date=${customRange.startDate}&end_date=${customRange.endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock distribution');
      }

      const data = await response.json();

      const transformedData: DistributionItem[] =
        data.distribution.map((item: DistributionItem) => ({
          label: item.label,
          count: item.count,
          percentage: item.percentage,
          stroke: item.stroke,
          dot: item.dot,
          description: item.description,
        }));

      setStockDistribution(transformedData);
    } catch (err) {
      setDistributionError(
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      setDistributionLoading(false);
    }
  };

  fetchStockDistribution();
}, [filter, customRange]);

   const kpis = kpiData?.kpi ? [
    { 
      title: "Total Stock", 
      value: kpiData.kpi.total_stock.toString(), 
      icon: Package, 
      color: "bg-blue-500",
      change: kpiData.growth?.total_stock_change
    },
    { 
      title: "In Stock", 
      value: kpiData.kpi.in_stock_count.toString(), 
      icon: Package, 
      color: "bg-blue-500",
      change: kpiData.growth?.in_stock_change
    },
    { 
      title: "Low Stock", 
      value: kpiData.kpi.low_stock_count.toString(), 
      icon: AlertTriangle, 
      color: "bg-green-400",
      change: kpiData.growth?.low_stock_change
    },
    { 
      title: "Out of Stock", 
      value: kpiData.kpi.out_of_stock_count.toString(), 
      icon: AlertTriangle, 
      color: "bg-red-500",
      change: kpiData.growth?.out_of_stock_change
    },
    { 
      title: "Inventory Sell Value", 
      value: formatCurrency(kpiData.kpi.inventory_sell_value), 
      icon: DollarSign, 
      color: "bg-green-500",
      change: kpiData.growth?.sell_value_change
    },
    { 
      title: "Inventory Cost", 
      value: formatCurrency(kpiData.kpi.inventory_cost_value), 
      icon: TrendingUp, 
      color: "bg-indigo-500",
      change: kpiData.growth?.cost_value_change
    },
  ] : [];

  const chartData = stockDistribution.map(item => ({
    name: item.label,
    value: item.count,
    color: item.stroke,
  }));


  const totalItems = stockDistribution.reduce((sum, item) => sum + item.count, 0);


  return (
    <div className="space-y-6">
      <KPIFilter
  selectedFilter={filter}
  onFilterChange={setFilter}
  onCompareChange={setCompare}
  onCustomRangeChange={setCustomRange}
/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
       {loading ? (
          <Card className="col-span-full border-gray-200">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading KPI data...</span>
            </CardContent>
          </Card>
        ) : (
          kpis.map((kpi, index) => (
            <Card key={index} className="border-gray-200 hover:shadow-md transition-shadow bg-white shadow-2xl backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                    {kpi.change !== undefined && kpi.change !== null && (
                      <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${
                        kpi.change > 0 ? 'text-green-600' : 
                        kpi.change < 0 ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {kpi.change > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : kpi.change < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {kpi.change > 0 ? '+' : ''}{typeof kpi.change === 'number' && kpi.change % 1 === 0 ? kpi.change : kpi.change?.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className={`${kpi.color} p-3 rounded-lg`}>
                    <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    
      <div className="grid grid-cols-1 gap-15">
      
        <StockMovementChart filter={filter} />

      
        <div className="grid grid-cols-1 xl:grid-cols-2">
         <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Stock Status Distribution</CardTitle>
            <CardDescription className="text-gray-900">
              Overview of in-stock, low stock, and out-of-stock items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {distributionLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading distribution...</span>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="relative w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
                    <div className="text-sm text-gray-500">Total Items</div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {stockDistribution.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${item.dot} h-3 w-3 rounded-full`} />
                        <div>
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {item.count} items
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

       <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Stock by Category
          </CardTitle>
          <CardDescription className="text-gray-500">
            Number of items available per category
          </CardDescription>
        </CardHeader>

        <CardContent>
          <StockByCategoryBarChart filter={filter} />
        </CardContent>
      </Card>

        </div>
      </div>

    
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StockAlertWidget />
        <TopProductsWidget dateRange={filter} />
      </div>
    </div>
  );
}