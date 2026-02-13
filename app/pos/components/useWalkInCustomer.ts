'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/app/utils/type';

/**
 * Hook to fetch or ensure the walk-in customer exists in the database
 * Walk-in customers are centralized - only one record in the database
 */
export function useWalkInCustomer() {
  const [walkInCustomer, setWalkInCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalkInCustomer = async (isRefetch = false) => {
    if (!isRefetch) setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
      
      // Use a special endpoint or query to get the walk-in customer
      // For now, we'll fetch all customers and find the walk-in one
      // In production, you may want a dedicated endpoint like /api/customers/walk-in
      const response = await fetch(`${apiUrl}/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch walk-in customer');
      }

      const data = await response.json() as { data?: Customer[]; customers?: Customer[] };
      const customers = data.data || data.customers || [];

      // Find the walk-in customer by is_walk_in flag first, then by name
      const walkIn = customers.find((c: Customer) => 
        c.is_walk_in === true || c.name?.toLowerCase() === 'walk-in'
      );

      if (walkIn) {
        // Ensure is_walk_in flag is set
        setWalkInCustomer({ ...walkIn, is_walk_in: true });
      } else {
        // If no walk-in customer exists, set a default one with special ID
        // The backend will create it on first sale
        setWalkInCustomer({
          id: 'walk-in-temp',
          name: 'Walk-in',
          is_walk_in: true,
        });
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching walk-in customer:', err);
      // Fallback to temp walk-in
      setWalkInCustomer({
        id: 'walk-in-temp',
        name: 'Walk-in',
        is_walk_in: true,
      });
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalkInCustomer();
  }, []);

  return { walkInCustomer, isLoading, error, refetchWalkInCustomer: () => fetchWalkInCustomer(true) };
}
