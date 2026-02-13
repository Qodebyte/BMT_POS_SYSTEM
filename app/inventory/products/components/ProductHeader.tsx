'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/app/utils/type";

interface ProductHeaderProps {
  product: Product;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
        <Button size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className=" items-center hidden sm:flex gap-4 mt-1">
            <span className="text-gray-600 ">SKU: {product.sku}</span>
            <span className="text-gray-600">Brand: {product.brand}</span>
            <span className="text-gray-600">Category: {product.category}</span>
          </div>
        </div>
        </div>

         <div className="flex md:items-center  justify-end  gap-3 text-gray-900">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-red-600">Delete Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

    </div>
  );
}