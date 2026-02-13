'use client';

import { Button } from "@/components/ui/button";
import { Download, Filter, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function SalesHeader() {
  const handleExport = () => {
    // Implement export logic
    toast.success('Exporting sales data...');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-600">Monitor and analyze sales performance</p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <Button variant="secondary" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
      </div>
    </div>
  );
}