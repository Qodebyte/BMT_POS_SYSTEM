'use client';

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Printer, Copy, ChevronLeft, ChevronRight, Loader2, Search, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { downloadBarcode, printBarcodes } from "./generateBarcodeImage";
import { useVariantsWithProduct, VariantWithProductData } from '@/app/barcode/useVariantsWithProduct';


export function BarcodeManager() {
  const {
    variants,
    pagination,
    filters,
    summary,
    loading,
    error,
    currentPage,
    setCurrentPage,
    setSearch,
    setSort,
    setLimit,
    refetch,
  } = useVariantsWithProduct();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortValue, setSortValue] = useState('created_at');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Setting search to:', searchInput); // Debug
      setDebouncedSearch(searchInput);
      setSearch(searchInput);
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // Increased debounce time

    return () => clearTimeout(timer);
  }, [searchInput, setSearch, setCurrentPage]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    console.log('Changing sort to:', value); // Debug
    setSortValue(value);
    setSort(value);
    setCurrentPage(1); // Reset to first page when sorting
  }, [setSort, setCurrentPage]);

  // Handle limit change
  const handleLimitChange = useCallback((value: string) => {
    console.log('Changing limit to:', value); // Debug
    setLimit(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing limit
  }, [setLimit, setCurrentPage]);

  const handleDownloadBarcode = (variant: VariantWithProductData) => {
    try {
      downloadBarcode(variant.barcode, variant.product_name);
      toast.success(`Downloaded barcode for ${variant.product_name}`);
    } catch (err) {
      console.error('Error downloading barcode:', err);
      toast.error('Failed to download barcode');
    }
  };

  const handlePrintAllBarcodes = () => {
    const variantsForPrint = variants.map(v => ({
      name: `${v.product_name} - ${v.sku}`,
      barcode: v.barcode,
    }));
    
    if (variantsForPrint.length === 0) {
      toast.error('No variants to print');
      return;
    }

    try {
      printBarcodes(variantsForPrint);
      toast.success('Opened print preview');
    } catch (err) {
      console.error('Error printing barcodes:', err);
      toast.error('Failed to print barcodes');
    }
  };

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    toast.success('Barcode copied to clipboard');
  };

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(pagination.pages, currentPage + 1));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  if (error) {
    return (
      <Card className="bg-white border border-red-200 text-gray-900">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 font-semibold mb-1">Error loading variants</p>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <Button
                  onClick={handleRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 text-gray-900">
      <CardHeader className="border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between">
            <CardTitle>Barcode Management</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                🔄 Refresh
              </Button>
              <Button
                onClick={handlePrintAllBarcodes}
                disabled={loading || variants.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print All
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search barcode, SKU, or product..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 border-gray-300"
                  disabled={loading}
                />
              </div>
              {searchInput && (
                <p className="text-xs text-gray-500">
                  Searching for: {searchInput}
                </p>
              )}
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label htmlFor="sort" className="text-sm font-medium">Sort By</Label>
              <Select value={sortValue} onValueChange={handleSortChange} disabled={loading}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Latest Created</SelectItem>
                  <SelectItem value="barcode">Barcode (A-Z)</SelectItem>
                  <SelectItem value="sku">SKU (A-Z)</SelectItem>
                  <SelectItem value="product_name">Product Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Limit */}
            <div className="space-y-2">
              <Label htmlFor="limit" className="text-sm font-medium">Items Per Page</Label>
              <Select 
                defaultValue="20" 
                onValueChange={handleLimitChange}
                disabled={loading}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
            <span>
              <strong>Total:</strong> {pagination.total}
            </span>
            <span>
              <strong>Displayed:</strong> {summary.displayed_variants}
            </span>
            {debouncedSearch && (
              <span className="ml-auto text-blue-600 font-medium">
                🔍 &quot;{debouncedSearch}&quot;
              </span>
            )}
            {sortValue !== 'created_at' && (
              <span className="ml-auto text-blue-600 font-medium">
                📊 {sortValue}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-gray-600">Loading variants...</p>
          </div>
        ) : variants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {debouncedSearch 
                ? `No variants found matching "${debouncedSearch}"`
                : "No variants available"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Barcode</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.variant_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {variant.product_name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono text-gray-700 bg-gray-100">
                          {variant.sku}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono text-gray-900 bg-blue-50 border-blue-200">
                          {variant.barcode}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        {new Date(variant.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyBarcode(variant.barcode)}
                            title="Copy barcode"
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            onClick={() => handleDownloadBarcode(variant)}
                            title="Download barcode image"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
                  {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} variants
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(pagination.pages, 5) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return pageNum;
                      }
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        disabled={loading}
                        className={
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : ""
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === pagination.pages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}