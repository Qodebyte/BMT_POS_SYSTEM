interface ChartDataItem {
  time?: string;
  amount?: number;
  count?: number;
  [key: string]: string | number | undefined;
}

interface SalesChartTooltipProps {
  active?: boolean;
  payload?: {
    name?: string;
    value?: number;
    payload?: ChartDataItem; 
  }[];
  label?: string;
}

export function SalesChartTooltip({ active, payload, label }: SalesChartTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-green-600">
          Amount: NGN {payload[0].value?.toFixed(2)}
        </p>
        <p className="text-sm text-blue-600">
          Transactions: {payload[1]?.value ?? 0}
        </p>
      </div>
    );
  }
  return null;
}
