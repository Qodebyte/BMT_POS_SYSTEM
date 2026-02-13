'use client';

import { Product } from "@/app/utils/type";
import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign,  Layers, BarChart } from "lucide-react";

interface ProductKPIsProps {
  product: Product;
}

export function ProductKPIs({ product }: ProductKPIsProps) {
  const kpis = [
    {
      title: "Inventory Value",
      value: `NGN ${product.inventoryValue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
      
    },
    {
      title: "Inventory Cost",
      value: `NGN ${product.inventoryCost.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-blue-500",
     
    },
    {
      title: "Total Stock",
      value: product.totalStock,
      icon: Package,
      color: "bg-green-400",
      
    },
    {
      title: "Variants",
      value: product.variants?.length || 1,
      icon: Layers,
      color: "bg-purple-500",
     
    },
    {
      title: "Total Revenue",
      value: `NGN ${product.totalRevenue.toLocaleString()}`,
      icon: BarChart,
      color: "bg-indigo-500",
     
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="border-gray-200 bg-white  shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex  items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="sm:text-xl text-normal font-bold text-gray-900 mt-1">{kpi.value}</p>
              </div>
              <div className={`${kpi.color} p-2 rounded-lg `}>
                <kpi.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}