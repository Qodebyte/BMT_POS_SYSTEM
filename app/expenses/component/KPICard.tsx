import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  isLoading?: boolean;
}

export function KPICard({ title, value, icon, trend, isLoading = false }: KPICardProps) {
   if (isLoading) {
    return (
      <Card className="border border-gray-200 bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const trendIcon = trend === 'up' ? '↑' : '↓';


  return (
    <Card className="border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="text-gray-400">{icon}</div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trendColor}`}>
              {trendIcon} {trend === 'up' ? 'Increase' : 'Decrease'}
            </p>
          )}
        </div>
      </CardContent>
    </Card> 
  );
}
