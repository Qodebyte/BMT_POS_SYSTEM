'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopSellingVariants } from "@/app/lib/api";
import { TopVariant } from "@/app/utils/type";

type DateRange = {
  filter: string;
  startDate?: string;
  endDate?: string;
};

interface TopProductsProps {
  dateRange: DateRange;
}

type ImageItem = {
  url: string;
};


export function TopProducts({ dateRange }: TopProductsProps) {
  const [topVariants, setTopVariants] = useState<TopVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopVariants = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTopSellingVariants(
          dateRange.filter,
          dateRange.filter === "custom" ? dateRange.startDate : undefined,
          dateRange.filter === "custom" ? dateRange.endDate : undefined,
          5
        );

        if (response.success) {
          setTopVariants(response.top_variants);
        } else {
          setTopVariants([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setTopVariants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopVariants();
  }, [dateRange]);


  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

 
  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-red-600">
        <AlertCircle className="h-8 w-8" />
        <p className="text-lg">{error}</p>
      </div>
    );
  }


  if (topVariants.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p className="text-lg mb-1">No sales data available</p>
        <p className="text-sm">Sales will appear here once transactions are made</p>
      </div>
    );
  }

  const resolveImageUrl = (
  image: ImageItem[] | null | undefined,
  baseUrl: string
): string | null => {
  if (!image || image.length === 0) return null;

  const first = image[0];

  if (!first?.url) return null;

  return first.url.startsWith("http")
    ? first.url
    : `${baseUrl}${first.url}`;
};



 const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://api.bmtpossystem.com";



  return (
    <div className="space-y-4">
      {topVariants.map((variant) => {
         const imageUrl = resolveImageUrl(variant.image, IMAGE_BASE_URL);
        return (
        <div
          key={variant.variant_id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
        
            <div
              className={`h-8 w-8 flex items-center justify-center rounded-md font-bold text-sm
                ${variant.rank === 1
                  ? "bg-yellow-100 text-green-800 border border-green-200"
                  : variant.rank === 2
                  ? "bg-gray-100 text-gray-800 border border-gray-200"
                  : variant.rank === 3
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-gray-50 text-gray-600 border border-gray-100"
                }`}
            >
              {variant.rank}
            </div>

          
                <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border">
  {imageUrl ? (
    <Image
      src={imageUrl}
      alt={variant.product.name}
      width={48}
      height={48}
      className="object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
      No Image
    </div>
  )}
</div>


           
            <div className="min-w-0">
              <h4 className="font-semibold truncate">{variant.product.name}</h4>
              <p className="text-sm text-gray-600 truncate">
                {variant.product.category.name}
              </p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {variant.sales_metrics.total_quantity} sold
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {variant.sales_metrics.total_orders} orders
                </Badge>
              </div>
            </div>
          </div>

         
          <div className="text-right">
            <div className="font-bold">
              NGN {variant.sales_metrics.total_revenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 flex items-center justify-end gap-1">
              <TrendingUp className="h-3 w-3" />
              NGN {variant.sales_metrics.average_price.toFixed(2)} avg
            </div>
          </div>
        </div>
      )})}

  
      <div className="pt-4 mt-4 border-t grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500">Total Units Sold</div>
          <div className="font-bold">
            {topVariants.reduce((sum, v) => sum + v.sales_metrics.total_quantity, 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Total Revenue</div>
          <div className="font-bold text-green-600">
            NGN{" "}
            {topVariants
              .reduce((sum, v) => sum + v.sales_metrics.total_revenue, 0)
              .toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
