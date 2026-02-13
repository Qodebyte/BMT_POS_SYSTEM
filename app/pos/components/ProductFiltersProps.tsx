'use client';

import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useVariants, VariantWithProduct } from './useVariants';


interface Category {
  id: string | number;
  name: string;
}

interface Product {
  id: string | number;
  name: string;
  brand: string;
  category?: string | { id: string | number; name: string };
}

interface ProductFiltersProps {
  products: Product[];
  selectedBrand: string;
  selectedCategory: string;
  selectedProduct: string;
  searchQuery: string;
  onBrandChange: (brand: string) => void;
  onCategoryChange: (category: string) => void;
  onProductChange: (product: string) => void;
  onSearchChange: (query: string) => void;
  onVariantsChange?: (variants: VariantWithProduct[]) => void;
}

export function ProductFilters({
  products,
  selectedBrand,
  selectedCategory,
  selectedProduct,
  searchQuery,
  onBrandChange,
  onCategoryChange,
  onProductChange,
  onSearchChange,
  onVariantsChange,
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);


  const { variants, loading: variantsLoading } = useVariants();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilters(true);
      setFilterError(null);

      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';

      
        const categoriesResponse = await fetch(`${apiUrl}/configure/categories`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (categoriesResponse.ok) {
          const categoriesData: Category[] = await categoriesResponse.json();
          setCategories(categoriesData);
        } else {
          console.warn('Failed to fetch categories from backend');
        }

     
        const productsResponse = await fetch(`${apiUrl}/products?limit=1000`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const productsList = Array.isArray(productsData.products)
            ? productsData.products
            : Array.isArray(productsData)
            ? productsData
            : [];

          setFetchedProducts(productsList);

          const uniqueBrands = Array.from(
            new Set(productsList.map((p: Product) => p.brand).filter(Boolean))
          ) as string[];
          setBrands(uniqueBrands.sort());
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setFilterError(message);
        console.error('Error fetching filter options:', err);

        setFetchedProducts(products);
        const localBrands = Array.from(
          new Set(products.map(p => p.brand).filter(Boolean))
        ) as string[];
        setBrands(localBrands.sort());
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, [products]);

  // Filter variants based on selected filters
  useEffect(() => {
    if (!variants.length) return;

    let filteredVariants = [...variants];

    // Filter by product
    if (selectedProduct && selectedProduct !== 'all') {
      filteredVariants = filteredVariants.filter(
        v => String(v.product_id) === selectedProduct
      );
    }

    // Filter by brand
    if (selectedBrand && selectedBrand !== 'all') {
      filteredVariants = filteredVariants.filter(
        v => v.brand === selectedBrand
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filteredVariants = filteredVariants.filter(
        v => v.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredVariants = filteredVariants.filter(
        v =>
          v.sku.toLowerCase().includes(query) ||
          v.barcode.toLowerCase().includes(query) ||
          v.product_name.toLowerCase().includes(query)
      );
    }

    // Call parent callback with filtered variants
    onVariantsChange?.(filteredVariants);
  }, [variants, selectedProduct, selectedBrand, selectedCategory, searchQuery, onVariantsChange]);

  const productsToDisplay = fetchedProducts.length > 0 ? fetchedProducts : products;
  const displayBrands = brands.length > 0 ? brands : Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
  const displayCategories = categories.length > 0
    ? categories
    : Array.from(new Set(products.map(p => typeof p.category === 'string' ? p.category : p.category?.name))).map((cat, idx) => ({
      id: idx,
      name: cat as string,
    }));

  const isLoading = loadingFilters || variantsLoading;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    
        <div className="md:col-span-2">
          <Label className="text-sm">Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, SKU, barcode..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='border border-gray-900 pl-9'
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm">Brand</Label>
          <Select value={selectedBrand} onValueChange={onBrandChange} disabled={isLoading}>
            <SelectTrigger className='border border-gray-900'>
              <SelectValue placeholder={isLoading ? "Loading..." : "All Brands"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {displayBrands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

         <div>
          <Label className="text-sm">Category</Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange} disabled={isLoading}>
            <SelectTrigger className='border border-gray-900'>
              <SelectValue placeholder={isLoading ? "Loading..." : "All Categories"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {displayCategories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">Product</Label>
          <Select value={selectedProduct} onValueChange={onProductChange} disabled={isLoading}>
            <SelectTrigger className='border border-gray-900'>
              <SelectValue placeholder={isLoading ? "Loading..." : "All Products"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {productsToDisplay.map((product) => (
                <SelectItem key={product.id} value={String(product.id)}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filterError && (
        <div className="text-sm text-amber-600 mt-2">
          ⚠️ Using local data - {filterError}
        </div>
      )}
    </div>
  );
}