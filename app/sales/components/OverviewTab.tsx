'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesKPIs } from "./SalesKPIs";
import { SalesChart } from "./SalesChart";
import { PurchaseTypeChart } from "./PurchaseTypeChart";
import { TopProducts } from "./TopProducts";
import { Transaction } from '@/app/utils/type';

type DateRange = {
  filter: string;
  startDate: string;
  endDate: string;
};

interface OverviewTabProps {
  transactions: Transaction[];
  dateRange: DateRange;
  kpiData: {
    summary: {
      total_transactions: number;
      total_sales_amount: number;
      subtotal: number;
      total_tax: number;
      total_discount: number;
      average_transaction_value: number | string;
    };
    purchase_types: {
      distribution: Record<string, { count: number; total_amount: number }>;
      total_transactions: number;
    };
    payment_methods: {
      distribution: Record<string, { count: number; total_amount: number; percentage?: number | string }>;
      total_transactions: number;
      credit_breakdown: {
        full_credit: number;
        partial_credit: number;
        total_credit: number;
      };
    };
  };
}

export function OverviewTab({ transactions, dateRange, kpiData }: OverviewTabProps) {
  return (
    <div className="space-y-6">

      <SalesKPIs kpiData={kpiData} />
      
    
      <Card className="bg-gray-100 border border-gray-300 shadow-2xl text-gray-900 ">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>
            Revenue generated over selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesChart 
            dateRange={dateRange}
          />
        </CardContent>
      </Card>
      
  
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-gray-100 border border-gray-300 shadow-2xl text-gray-900 ">
          <CardHeader>
            <CardTitle>Purchase Type Distribution</CardTitle>
            <CardDescription>
              Online vs In-Store sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PurchaseTypeChart dateRange={dateRange} />
          </CardContent>
        </Card>
        
        <Card className="bg-gray-100 border border-gray-300 shadow-2xl text-gray-900 ">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performing products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProducts dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}