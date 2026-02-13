'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical, ImageIcon, Loader } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditVariantModal } from './EditVariantModal';
import { EditVariantImagesModal } from './EditVariantImages';
import { ProductVariant } from '@/app/utils/type';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';


interface VariantsTabProps {
  variants: ProductVariant[];
  productId: string;
}

export function VariantsTab({ variants: initialVariants, productId }: VariantsTabProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null);
  const [openRowId, setOpenRowId] = useState<string | number | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);


const getStockStatus = (quantity: number, threshold: number) => {
  if (quantity === 0) {
    return { status: "Out of Stock", color: "destructive" } as const;
  }

  if (quantity <= threshold) {
    return { status: "Low Stock", color: "secondary" } as const;
  }

  return { status: "In Stock", color: "default" } as const;
};



  const handleEdit = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setShowEditModal(true);
  };

  const handleEditImages = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setShowImagesModal(true);
  };

   const handleDeleteClick = (variant: ProductVariant, e: React.MouseEvent) => {
    e.stopPropagation();
    setVariantToDelete(variant);
    setShowDeleteDialog(true);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
  const getToken = () => localStorage.getItem('adminToken');

  const handleConfirmDelete = async () => {
    if (!variantToDelete) return;

    setDeletingId(variantToDelete.id);
    try {
      const token = getToken();

      const response = await fetch(
        `${apiUrl}/products/variants/${variantToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete variant');
      }

     
      setVariants(prev => prev.filter(v => v.id !== variantToDelete.id));
      setShowDeleteDialog(false);
      setVariantToDelete(null);

      toast.success(`Variant ${variantToDelete.sku} deleted successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete variant';
      toast.error(message);
      console.error('Error deleting variant:', error);
    } finally {
      setDeletingId(null);
    }
  };

    const handleVariantUpdate = (updatedVariant: ProductVariant) => {
    setVariants(prev =>
      prev.map(v => v.id === updatedVariant.id ? updatedVariant : v)
    );
    setSelectedVariant(null);
  };

  const handleVariantsSaved = (updatedVariant: ProductVariant) => {
    setVariants(prev =>
      prev.map(v => v.id === updatedVariant.id ? updatedVariant : v)
    );
  };



  return (
    <>
      <Card className="bg-white text-gray-900 border border-gray-100 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Manage all variations of this product
              </CardDescription>
            </div>

          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='bg-gray-900'>SKU</TableHead>
                  <TableHead className='bg-gray-900'>Attributes</TableHead>
                  <TableHead className='bg-gray-900'>Quantity</TableHead>
                  <TableHead className='bg-gray-900'>Threshold</TableHead>
                  <TableHead className='bg-gray-900'>Cost Price</TableHead>
                  <TableHead className='bg-gray-900'>Selling Price</TableHead>
                  <TableHead className='bg-gray-900'>Status</TableHead>
                  <TableHead className="text-right bg-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
  {variants.map((variant) => {
    const status = getStockStatus(variant.quantity, variant.threshold);
    const isOpen = openRowId === variant.id;
         const isDeleting = deletingId === variant.id;

    return (
      <TableRow
        key={variant.id}
        className={`cursor-pointer ${isDeleting ? 'bg-red-100' : ''}`}
        onClick={() => setOpenRowId(variant.id === openRowId ? null : variant.id)}
      >
        <TableCell className="font-medium">{variant.sku}</TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {Object.entries(variant.attributes).map(([key, value]) => (
              <Badge key={key} className="text-xs">
                {key}: {value as string}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell className="font-bold">{variant.quantity}</TableCell>
        <TableCell>{variant.threshold}</TableCell>
        <TableCell>NGN {variant.costPrice}</TableCell>
        <TableCell>NGN {variant.sellingPrice}</TableCell>
        <TableCell>
          <Badge variant={status.color}>{status.status}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu open={isOpen} onOpenChange={(open) => setOpenRowId(open ? variant.id : null)}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(variant)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Variant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditImages(variant)}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Edit Images
              </DropdownMenuItem>
              <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={(e) => handleDeleteClick(variant, e)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Variant
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>

            </Table>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Variants</div>
              <div className="text-2xl font-bold">{variants.length}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Stock Value</div>
              <div className="text-2xl font-bold">
                NGN {variants.reduce((sum, v) => sum + (v.quantity * v.costPrice), 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Potential Revenue</div>
              <div className="text-2xl font-bold">
                NGN {variants.reduce((sum, v) => sum + (v.quantity * v.sellingPrice), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

         <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              {variantToDelete && (
                <div>
                  <p className="mb-3">
                    Are you sure you want to delete this variant?
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm mb-4">
                    <div>
                      <span className="font-semibold text-gray-900">SKU:</span>
                      <span className="ml-2 text-gray-600">{variantToDelete.sku}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Quantity:</span>
                      <span className="ml-2 text-gray-600">{variantToDelete.quantity} units</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Cost Price:</span>
                      <span className="ml-2 text-gray-600">NGN {variantToDelete.costPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-red-600 text-sm font-semibold">
                    ⚠️ This action cannot be undone. All inventory logs associated with this variant will also be deleted.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null} >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              disabled={deletingId !== null}
            >
              {deletingId !== null ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Variant'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

     
      {selectedVariant && (
        <EditVariantModal
          variant={selectedVariant}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSave={handleVariantUpdate}
        />
      )}

      
      {selectedVariant && (
       <EditVariantImagesModal
          variant={selectedVariant}
          open={showImagesModal}
          onOpenChange={setShowImagesModal}
          onSave={handleVariantsSaved}
        />
      )}
    </>
  );
}