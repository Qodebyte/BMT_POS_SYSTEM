'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export function DashboardTabs({ activeTab, onTabChange, children }: DashboardTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "stock", label: "Stock" },
    { id: "sales", label: "Sales" },
    { id: "expenses", label: "Expenses" },
    { id: "logins", label: "Login" },
  ];

  return (
   <Tabs value={activeTab} onValueChange={onTabChange} className="w-full  max-w-full overflow-x-hidden mb-4 border-b border-default">
 
  <div className="relative overflow-x-hidden">
    <TabsList
      className="w-full h-30 md:h-15 grid  md:grid-cols-5 grid-cols-3 gap-3 bg-gray-900 text-white border border-gray-800  rounded-lg"
    >
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
         className="
                  flex-1 md:flex-none
                  px-4 py-2.5 md:py-3
                  text-sm md:text-base
                  whitespace-nowrap
                  data-[state=active]:bg-green-400 
                  data-[state=active]:text-black 
                  data-[state=active]:font-bold
                  data-[state=active]:shadow-lg
                  transition-all duration-200
                 
                "
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </div>

  {children}
</Tabs>

  );
}