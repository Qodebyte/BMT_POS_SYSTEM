'use client';

import Link from "next/link";


export function POSHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-600">Process sales quickly and efficiently</p>
        </div>
        
        <div className="flex items-center gap-3">
          
          <div className="relative">
          <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-green-400 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">BMT</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">Big Men</div>
            <div className="text-xs text-gray-800 -mt-1">Transaction Apparel</div>
          </div>
        </Link>
          </div>
        </div>
      </div>
      
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Today&apos;s Sales</div>
          <div className="text-xl font-bold">NGN 24,850</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Transactions</div>
          <div className="text-xl font-bold">42</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Items Sold</div>
          <div className="text-xl font-bold">156</div>
        </div>
      </div>
    </div>
  );
}