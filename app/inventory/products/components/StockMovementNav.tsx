'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StockMovementChart } from './StockMovementChart';
import { StockMovementTable } from '@/app/inventory/components/StockMovement';

interface StockMovementTabProps {
  productId: string;
}

export function StockMovementTab({ productId }: StockMovementTabProps) {
  return (
    <div className="space-y-6">
    
      <Card className="bg-gray-900">
        <CardHeader>
          <CardTitle>Stock Movement Chart</CardTitle>
          <CardDescription>Track stock levels over time by variant</CardDescription>
        </CardHeader>
        <CardContent>
          <StockMovementChart productId={productId} variants={[]} />
        </CardContent>
      </Card>

    
      <Card className="bg-gray-900">
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
          <CardDescription>Detailed log of all stock movements</CardDescription>
        </CardHeader>
        <CardContent>
          <StockMovementTable />
        </CardContent>
      </Card>
    </div>
  );
}