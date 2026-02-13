'use client';
import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useAuthCheck } from '@/app/components/authHook';


interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useAuthCheck();


  return (
   <div className="flex min-h-screen bg-white">
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-white lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

     
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0", 
          
        )}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />

        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}