"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TopProduct = {
  id: string;
  name: string;
  sold: number;
  revenue: string;
  growth: string;
  image: string | null;
  category: string;
};

type Variant = {
  variant_id: string;
  sku: string;
  total_sold: string;
  revenue_formatted: string;
  growth: string;
  image_url: string | null;
  product: {
    category: {
      name: string;
    };
  };
};


export function TopProductsWidget({
  dateRange = "this_month",
}: {
  dateRange?: string;
}) {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

    const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5002/api";

    const imageUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "http://localhost:5002";

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  };

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) return;

        const res = await fetch(
          `${apiUrl}/analytics/fast-selling-variants?limit=5&period=${dateRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch fast-selling variants");

        const data = await res.json();

        const mapped: TopProduct[] =
          data.top_selling_variants?.map((v: Variant) => ({
            id: v.variant_id,
            name: v.sku || "Unnamed Product",
            sold: v.total_sold,
            revenue: v.revenue_formatted,
            growth: v.growth,
            image: v.image_url,
            category: v.product?.category?.name ?? "Uncategorized",
          })) || [];

        setProducts(mapped);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load top products");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [dateRange]);
  return (
    <Card className="bg-white backdrop-blur-sm border border-gray-100 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-black">Fast Moving Products</CardTitle>
            <CardDescription className="text-gray-950">
              Top 5 products that are fast moving
            </CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-gray-900" />
        </div>
      </CardHeader>
      <CardContent>
     {loading && (
          <p className="text-sm text-gray-500">Loading fast moving products...</p>
        )}

        {/* EMPTY */}
        {!loading && products.length === 0 && (
          <p className="text-sm text-gray-500">
            No sales data for selected period
          </p>
        )}

        {/* DATA */}
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group flex flex-col md:flex-row gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 items-center"
            >
              
              <div
                className={cn(
                  "shrink-0 h-8 w-8 flex items-center justify-center rounded-md font-bold text-sm",
                  index === 0 ? "bg-yellow-100 text-green-800 border border-green-200" :
                  index === 1 ? "bg-gray-100 text-gray-800 border border-gray-200" :
                  index === 2 ? "bg-amber-100 text-amber-800 border border-amber-200" :
                  "bg-gray-50 text-gray-600 border border-gray-100"
                )}
              >
                {index + 1}
              </div>

             
              <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 group-hover:shadow-sm">
                {product.image ? (
                  <Image
                    src={`${imageUrl}${product.image}`}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>

           
              <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                <div className="flex-1 min-w-0">
                 <Tooltip>
                      <TooltipTrigger asChild>
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-gray-700 cursor-help">
                          {product.name}
                        </h4>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white border border-gray-700">
                        <p>{product.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-2 text-sm text-gray-600 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{product.category}</span>
                    <span>{product.sold} sold</span>
                  </div>
                </div>

                <div className="text-right mt-2 md:mt-0">
                  <div className="font-bold text-gray-900 text-lg">{product.revenue}</div>
                  <div className="text-sm text-green-600 flex items-center justify-end gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {product.growth}
                  </div>
                </div>
              </div>

            
              <div className="w-full md:w-32 mt-2 md:mt-0 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(index + 1) / products.length * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Top {Math.round(((products.length - index) / products.length) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-sm text-gray-600">
            <span className="text-green-500 font-medium">Note:</span> 
            <span className="ml-1">Data based on selected date range</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500">Growth trend</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
