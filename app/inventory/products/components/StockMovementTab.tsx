'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductStockMovements } from "./useProductStockMovements";

interface StockMovementTabProps {
  productId: string;
}

export function StockMovementTab({ productId }: StockMovementTabProps) {
  const [page, setPage] = useState(1);
  const { data: movements, loading, error, pagination } = useProductStockMovements(productId, { 
    page, 
    limit: 8 
  });

  if (error) {
    return (
      <Card className="bg-white text-gray-900 border border-gray-100 shadow-xl">
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
          <CardDescription>All stock transactions for this product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 font-medium">Error loading stock movements: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

const getStatusBadge = (status: string) => {
  const isDecreased = status.toLowerCase() === "decreased";
  const isIncreased = status.toLowerCase() === "increased";

  return (
    <Badge
      variant="default"
      className={cn(
        "font-medium",
        isDecreased ? "bg-red-100 text-red-800 hover:bg-red-100" : "",
        isIncreased ? "bg-green-100 text-green-800 hover:bg-green-100" : ""
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};


  type MovementType =
  | "Sale"
  | "Restock"
  | "Adjustment"
  | "Return"
  | "Damage";


  const typeVariantMap: Record<
  MovementType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Sale: "destructive",
  Restock: "default",
  Adjustment: "secondary",
  Return: "default",
  Damage: "outline",
};


 const getTypeBadge = (type: MovementType) => {
  return <Badge variant={typeVariantMap[type]}>{type}</Badge>;
};


  return (
    <Card className="bg-white text-gray-900 border border-gray-100 shadow-xl">
      <CardHeader>
        <CardTitle>Stock Movement History</CardTitle>
        <CardDescription>
          All stock transactions for this product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-900">Date & Time</TableHead>
                <TableHead className="bg-gray-900">Variant</TableHead>
                <TableHead className="bg-gray-900">Type</TableHead>
                <TableHead className="bg-gray-900">Quantity</TableHead>
                <TableHead className="bg-gray-900">Performed By</TableHead>
                <TableHead className="bg-gray-900">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading movements...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No stock movements found
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">{movement.date}</TableCell>
                    <TableCell>{movement.variant}</TableCell>
                    <TableCell>{getTypeBadge(movement.type as MovementType)}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity > 0 ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {movement.performedBy}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(movement.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-900  ">
          <div>
            Showing {movements.length === 0 ? '0' : (pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} movements
          </div>
          <div className="flex gap-2">
            <Button 
              disabled={pagination.page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              variant="secondary"
              size="sm"
              className="bg-gray-900 text-white hover:bg-gray-800 border-none"
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-gray-600 text-sm">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <Button 
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              variant="secondary"
              size="sm"
              className="bg-gray-900 text-white hover:bg-gray-800 border-none"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}