import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
}

export function KpiCard({ title, value,icon, description }: KpiCardProps) {
  return (
    <Card className="bg-white  shadow-2xl backdrop-blur-sm border-gray-100 hover:border-green-400/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-950">
          {title}
        </CardTitle>
        <div className="text-black">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-950">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {description && (
            <span className="text-xs text-gray-900">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}