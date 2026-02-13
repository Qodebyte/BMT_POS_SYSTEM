'use client';

import { useState, useEffect, useCallback } from 'react';

export interface VariantWithProductData {
  variant_id: number;
  sku: string;
  barcode: string;
  product_id: number;
  product_name: string;
  created_at: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface FiltersData {
  search: string | null;
  sort: string;
}

interface SummaryData {
  displayed_variants: number;
}

interface UseVariantsWithProductResponse {
  variants: VariantWithProductData[];
  pagination: PaginationData;
  filters: FiltersData;
  summary: SummaryData;
  loading: boolean;
  error: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSort: (sort: string) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

export function useVariantsWithProduct(): UseVariantsWithProductResponse {
  const [variants, setVariants] = useState<VariantWithProductData[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [filters, setFilters] = useState<FiltersData>({
    search: null,
    sort: 'created_at',
  });
  const [summary, setSummary] = useState<SummaryData>({
    displayed_variants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [limitNum, setLimitNum] = useState(20);

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
      
    
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', limitNum.toString());
      queryParams.append('sort', sortBy);
      
      if (searchQuery && searchQuery.trim()) {
        queryParams.append('search', searchQuery.trim());
      }

      const url = `${apiUrl}/products/list-simple?${queryParams.toString()}`;
    

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.error || 
          `Failed to fetch variants (${response.status})`
        );
      }

      const data = await response.json();
   
      
      setVariants(data.variants || []);
      setPagination(data.pagination || {});
      setFilters({
        search: data.filters?.search || null,
        sort: data.filters?.sort || sortBy,
      });
      setSummary(data.summary || { displayed_variants: 0 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching variants:', err);
      setVariants([]);
      setPagination({ total: 0, page: 1, limit: 20, pages: 0 });
      setSummary({ displayed_variants: 0 });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, sortBy, limitNum]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  return {
    variants,
    pagination,
    filters,
    summary,
    loading,
    error,
    currentPage,
    setCurrentPage,
    setSearch: setSearchQuery,
    setSort: setSortBy,
    setLimit: setLimitNum,
    refetch: fetchVariants,
  };
}