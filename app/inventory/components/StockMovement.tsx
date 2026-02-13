'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StockMovement {
  id: string;
  variant_id: string;
  quantity: number;
 type: string;
  reason: string;
  recorded_by_type: string;
  recorded_by_name: string;
  created_at: string;
  variant?: {
    sku: string;
    product_id: string;
  };
}

interface StockMovementResponse {
  logs: StockMovement[];
  totalPages: number;
  totalCount: number;
  page: number;
  limit: number;
}

export function StockMovementTable() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8;

  useEffect(() => {
    const fetchStockMovements = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
        const response = await fetch(
          `${apiUrl}/products/movements?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch stock movements');
        }

        const data: StockMovementResponse = await response.json();
        setMovements(data.logs);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setMovements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStockMovements();
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

 

 const getMovementTypeBadge = (type: string | undefined) => {
  const types: Record<string, { bg: string; text: string }> = {
    'stock_in': { bg: 'bg-green-100', text: 'text-green-700' },
    'restock': { bg: 'bg-green-100', text: 'text-green-700' },
    'stock_out': { bg: 'bg-red-100', text: 'text-red-700' },
    'sale': { bg: 'bg-red-100', text: 'text-red-700' },
    'adjustment': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'return': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  };

  
  if (!type) {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
        UNKNOWN
      </span>
    );
  }

  const style = types[type] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  
 
  const displayType = type === 'restock' ? 'stock_in' : type;


  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {displayType.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

  const getQuantityChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <p className="text-red-700">Error loading stock movements: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const getQuantityDisplay = (quantity: number) => {
    if (quantity > 0) {
      return (
        <div className="text-green-600 font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          +{quantity}
        </div>
      );
    } else if (quantity < 0) {
      return (
        <div className="text-red-600 font-semibold flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          {quantity}
        </div>
      );
    } else {
      return (
        <div className="text-gray-600 font-semibold">
          0
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading stock movements...</span>
        </div>
      ) : movements.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No stock movements found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-900">
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-100 font-semibold">SKU</TableHead>
                  <TableHead className="text-gray-100 font-semibold">Movement Type</TableHead>
                  <TableHead className="text-gray-100 font-semibold">Quantity</TableHead>
                  <TableHead className="text-gray-100 font-semibold">Reason</TableHead>
                  <TableHead className="text-gray-100 font-semibold">Recorded By</TableHead>
                  <TableHead className="text-gray-100 font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id} className="border-gray-200 hover:bg-gray-800">
                    <TableCell className="text-gray-100 font-medium">
                      {movement.variant?.sku || 'N/A'}
                    </TableCell>
                    <TableCell>{getMovementTypeBadge(movement.type)}</TableCell>
                    <TableCell className={`font-semibold ${getQuantityChangeColor(movement.quantity)}`}>
                      {movement.quantity > 0 ? '+' : ''}{getQuantityDisplay(movement.quantity)}
                    </TableCell>
                    <TableCell className="text-gray-200 text-sm">{movement.reason || '-'}</TableCell>
                    <TableCell className="text-gray-200 text-sm">
                      {movement.recorded_by_name} <br />
                      <span className="text-xs text-gray-500">({movement.recorded_by_type})</span>
                    </TableCell>
                    <TableCell className="text-gray-200 text-sm">
                      {formatDate(movement.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

      
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-900 rounded-lg">
            <div className="text-sm text-gray-300">
              Showing <span className="font-semibold">{(currentPage - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(currentPage * limit, totalCount)}
              </span>{' '}
              of <span className="font-semibold">{totalCount}</span> movements
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-gray-300">
                Page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}