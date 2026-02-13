'use client';

import { Product } from '@/app/utils/type';
import { useState, useEffect } from 'react';

export interface Category {
  id: string | number;
  name: string;
}

export interface FilterOptions {
  categories: Category[];
  brands: string[];
  loading: boolean;
  error: string | null;
}

export function useProductFilters() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';

       
        const categoriesResponse = await fetch(`${apiUrl}/configure/categories`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }

        const categoriesData: Category[] = await categoriesResponse.json();
        setCategories(categoriesData);

     
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
            : productsData;

        
          const uniqueBrands = Array.from(
            new Set(
              productsList
                .map((p: Product) => p.brand)
                .filter((brand: string | null | undefined) => brand && brand.trim() !== '')
            )
          ) as string[];

          setBrands(uniqueBrands.sort());
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  return { categories, brands, loading, error };
}
