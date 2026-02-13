'use client';

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, History, FileText } from "lucide-react";

interface SalesTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SalesTabs({ activeTab, onTabChange }: SalesTabsProps) {
  return (
    <TabsList className="grid grid-cols-2 md:grid-cols-3  bg-gray-900 h-20 md:h-10 w-full">
      <TabsTrigger value="overview">
        <BarChart3 className="h-4 w-4 mr-2" />
        Overview
      </TabsTrigger>
      
      <TabsTrigger value="transactions">
        <History className="h-4 w-4 mr-2" />
        Transactions
      </TabsTrigger>
      
      <TabsTrigger value="reports">
        <FileText className="h-4 w-4 mr-2" />
        Reports
      </TabsTrigger>
    </TabsList>
  );
}
