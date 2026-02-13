'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Activity, Layers } from "lucide-react";

interface ProductTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProductTabs({ activeTab, onTabChange }: ProductTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full ">
      <TabsList className="grid sm:grid-cols-3 grid-cols-2 h-17  bg-gray-900 w-full">
        <TabsTrigger value="description" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
          <FileText className="h-4 w-4 mr-2" />
          Description
        </TabsTrigger>
        <TabsTrigger value="movement" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
          <Activity className="h-4 w-4 mr-2" />
          Stock Movement
        </TabsTrigger>
        <TabsTrigger value="variants" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
          <Layers className="h-4 w-4 mr-2" />
          Variants
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}