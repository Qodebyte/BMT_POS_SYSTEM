'use client';
import { BadgeCent, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminDetail } from "@/app/utils/type";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}



export function Header({ onMenuClick }: HeaderProps) {

   const [adminDetail, setAdminDetail] = useState<AdminDetail | null>(null);
    const [initials, setInitials] = useState('AD');

      const getInitials = (fullName?: string) => {
    if (!fullName) return 'AD';
    
    const names = fullName.trim().split(/\s+/);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

 
  const getNames = (fullName?: string) => {
    if (!fullName) return { firstName: 'Admin', lastName: 'User' };
    
    const names = fullName.trim().split(/\s+/);
    return {
      firstName: names[0],
      lastName: names.length > 1 ? names[names.length - 1] : '',
    };
  };

    useEffect(() => {
      const adminDetailStr = localStorage.getItem('adminDetail');
      if (adminDetailStr) {
        try {
          const detail: AdminDetail = JSON.parse(adminDetailStr);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setAdminDetail(detail);
          setInitials(getInitials(detail.full_name));
        } catch (error) {
          console.error('Failed to parse admin detail:', error);
        }
      }
    }, []);

    const names = getNames(adminDetail?.full_name);

  return (
    <header className="sticky top-0 z-40 bg-gray-900 backdrop-blur-sm border-b border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="hidden md:block">
            <div className="relative">
             <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-green-400 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">BMT</span>
          </div>
          <div>
            <div className="font-bold text-white text-lg">Big Men</div>
            <div className="text-xs text-gray-400 -mt-1">Transaction Apparel</div>
          </div>
        </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button> */}
          <Link href='/sales/installment-page'>
            <Button variant="outline" className="mr-4">
              <BadgeCent className="h-4 w-4 mr-2" />
              Installments
            </Button>
          </Link>
          <Link href='/pos'>
            <Button variant="outline">
              <BadgeCent className="h-4 w-4 mr-2" />
              POS
            </Button>
          </Link>
          
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800">
            <div className="h-8 w-8 rounded-full bg-green-400/10 flex items-center justify-center">
             <span className="text-green-400 font-bold text-sm">{initials}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">{names.firstName} {names.lastName}</div>
              <div className="text-xs text-gray-400"> {adminDetail?.role || 'Administrator'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}