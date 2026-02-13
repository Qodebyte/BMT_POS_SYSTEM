'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, TrendingDown, Loader, AlertCircle } from "lucide-react";
import { useStockMovement } from './useStockMovement';
import { Button } from '@/components/ui/button';


interface StockMovementChartProps {
  filter: string;
  variantId?: string;
}

export function StockMovementChart({ filter, variantId }: StockMovementChartProps) {
  const { movementData, loading, error } = useStockMovement(filter, variantId);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
 const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);

 const aggregatedStockData = useMemo(() => {
  if (!movementData?.movement_data?.length) return [];


  const timeMap = new Map<string, { stock: number; change: number }>();

  movementData.movement_data.forEach(variant => {
    variant.movement_data.forEach(point => {
      const existing = timeMap.get(point.time);

      if (existing) {
        existing.stock += point.stock;
        existing.change += point.change;
      } else {
        timeMap.set(point.time, {
          stock: point.stock,
          change: point.change,
        });
      }
    });
  });

  return Array.from(timeMap.entries()).map(([time, data]) => ({
    time,
    stock: data.stock,
    change: data.change,
  }));
}, [movementData]);

 const variantInfo = useMemo(() => {
  if (selectedVariantIndex === null) return null;
  return movementData?.movement_data?.[selectedVariantIndex] || null;
}, [movementData, selectedVariantIndex]);


  const stockData = useMemo(() => {
  if (selectedVariantIndex === null) {
    return aggregatedStockData;
  }
  return variantInfo?.movement_data || [];
}, [selectedVariantIndex, aggregatedStockData, variantInfo]);


  const stockValues = useMemo(() => stockData.map(d => d.stock), [stockData]);
  const minStock = useMemo(() => stockValues.length > 0 ? Math.min(...stockValues) : 0, [stockValues]);
  const maxStock = useMemo(() => stockValues.length > 0 ? Math.max(...stockValues) : 100, [stockValues]);
  const range = useMemo(() => maxStock - minStock || 1, [maxStock, minStock]);

  const getYPosition = (value: number) => {
    return ((value - minStock) / range) * 180;
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Error Loading Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Activity className="h-5 w-5" />
            Stock Movement Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading stock movement data...</span>
        </CardContent>
      </Card>
    );
  }

 
  const hasAnyData = movementData?.movement_data && movementData.movement_data.length > 0;
  const hasMovementData = stockData && stockData.length > 0;

  if (!hasAnyData) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Activity className="h-5 w-5" />
            Stock Movement Flow
          </CardTitle>
          <CardDescription className="text-gray-600">
            Real-time tracking of inventory changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No variants found for this period</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = variantInfo?.summary;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Activity className="h-5 w-5" />
          Stock Movement Flow
        </CardTitle>
       <CardDescription className="text-gray-600">
  {selectedVariantIndex === null
    ? "Combined stock movement across all variants"
    : variantInfo?.variant?.sku
    ? `Stock Movement - ${variantInfo.variant.sku}`
    : "Stock Movement"}
</CardDescription>

      </CardHeader>
      <CardContent>
       
      {movementData.movement_data.length > 1 && (
  <div className="mb-6 pb-4 border-b">
    <label className="text-sm font-medium text-gray-700 block mb-2">
      View:
    </label>
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        size="sm"
        variant={selectedVariantIndex === null ? "default" : "secondary"}
        onClick={() => setSelectedVariantIndex(null)}
      >
        All Variants
      </Button>

      {movementData.movement_data.map((item, idx) => (
        <Button
          key={idx}
          size="sm"
          variant={selectedVariantIndex === idx ? "default" : "secondary"}
          onClick={() => setSelectedVariantIndex(idx)}
        >
          {item.variant?.sku || `Variant ${idx + 1}`}
        </Button>
      ))}
    </div>
  </div>
)}


        {!hasMovementData ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              No stock movement data available for {variantInfo?.variant?.sku}
            </p>
            <p className="text-gray-400 text-sm">This variant had no stock changes during this period</p>
          </div>
        ) : (
          <div className="h-100 rounded-lg flex flex-col gap-2 p-4">
            <div className="relative h-full">
             
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-900">
                <div>{Math.round(maxStock)}</div>
                <div>{Math.round((maxStock + minStock) / 2)}</div>
                <div>{Math.round(minStock)}</div>
              </div>

            
              <div className="absolute left-12 right-0 top-0 bottom-0">
              
                <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="border-t border-gray-200"></div>
                  <div className="border-t border-gray-200"></div>
                  <div className="border-t border-gray-200"></div>
                </div>

              
                <svg className="w-full h-full">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                
                  {stockData.map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = stockData[index - 1];
                    const x1 = ((index - 1) / (stockData.length - 1)) * 100;
                    const y1 = 100 - (getYPosition(prevPoint.stock) / 180) * 100;
                    const x2 = (index / (stockData.length - 1)) * 100;
                    const y2 = 100 - (getYPosition(point.stock) / 180) * 100;

                    return (
                      <line
                        key={`line-${index}`}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={point.change >= 0 ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    );
                  })}

                 
                  <path
                    d={`M 0% 100% ${stockData.map((point, index) => {
                      const x = (index / (stockData.length - 1)) * 100;
                      const y = 100 - (getYPosition(point.stock) / 180) * 100;
                      return `L ${x}% ${y}%`;
                    }).join(' ')} L 100% 100% Z`}
                    fill="url(#areaGradient)"
                  />
                </svg>

              
                <div className="absolute inset-0">
                  {stockData.map((point, index) => {
                    const left = `${(index / (stockData.length - 1)) * 100}%`;
                    const top = `${100 - (getYPosition(point.stock) / 180) * 100}%`;

                    return (
                      <div
                        key={index}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ left, top }}
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        
                        <div
                          className={`h-3 w-3 rounded-full transition-all duration-200 ${
                            point.change > 0 ? 'bg-green-500' :
                            point.change < 0 ? 'bg-red-500' : 'bg-gray-400'
                          } ${hoveredPoint === index ? 'scale-150' : ''}`}
                        />

                       
                        <div
                          className={`absolute -top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg transition-all duration-200 whitespace-nowrap z-10 ${
                            hoveredPoint === index ? 'opacity-100 visible' : 'opacity-0 invisible'
                          }`}
                        >
                          <div className="font-medium">{point.time}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div>Stock: <span className="font-bold">{point.stock}</span></div>
                            <div
                              className={`flex items-center ${
                                point.change > 0 ? 'text-green-400' :
                                point.change < 0 ? 'text-red-400' : 'text-gray-400'
                              }`}
                            >
                              {point.change > 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : point.change < 0 ? (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              ) : null}
                              {point.change > 0 ? '+' : ''}{point.change}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 h-2 w-2 bg-gray-900"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs text-gray-500">
                  {stockData.filter((_, i) => i % Math.ceil(stockData.length / 5) === 0).map((point, i) => (
                    <div key={i}>{point.time}</div>
                  ))}
                </div>
              </div>

           
              <div className="absolute -top-8 right-0 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Stock Increase</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Stock Decrease</span>
                </div>
              </div>
            </div>

         
            {summary && selectedVariantIndex !== null && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Starting Stock</div>
                  <div className="text-xl font-bold text-gray-900">{summary.starting_stock}</div> 
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Current Stock</div>
                  <div className="text-xl font-bold text-gray-900">{summary.ending_stock}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Net Change</div>
                  <div
                    className={`text-xl font-bold ${
                      summary.net_change > 0 ? 'text-green-600' :
                      summary.net_change < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    {summary.net_change > 0 ? '+' : ''}{summary.net_change}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Avg Stock</div>
                  <div className="text-xl font-bold text-gray-900">{summary.average_stock}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Transactions</div>
                  <div className="text-xl font-bold text-gray-900">{summary.total_transactions}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className={`text-sm font-bold capitalize ${
                    summary.current_status === 'in_stock' ? 'text-green-600' :
                    summary.current_status === 'low_stock' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {summary.current_status?.replace('_', ' ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}