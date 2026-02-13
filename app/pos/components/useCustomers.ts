'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/app/utils/type';

interface UseCustomersResponse {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer | null>;
  refetch: () => Promise<void>;
}

export function useCustomers(): UseCustomersResponse {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
      const response = await fetch(`${apiUrl}/customers?limit=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      console.log('Fetched customers:', data);

       const mappedCustomers: Customer[] = (data.customers || []).map((c: Customer) => {
        // Ensure is_walk_in flag is properly set
        const isWalkIn = c.is_walk_in === true || c.name?.toLowerCase() === 'walk-in';
        return {
          id: c.id,
          name: c.name || '',
          email: c.email || null,
          phone: c.phone || null,
          created_at: c.created_at,
          updated_at: c.updated_at,
          is_walk_in: isWalkIn,
        };
      });
      console.log('Mapped customers:', mappedCustomers);
      setCustomers(mappedCustomers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer | null> => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
      const response = await fetch(`${apiUrl}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email || null,
          phone: customerData.phone || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }

      const data = await response.json();
      const newCustomer = data.customer;

    
      setCustomers([newCustomer, ...customers]);
      return newCustomer;
    } catch (err) {
      console.error('Error adding customer:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    addCustomer,
    refetch: fetchCustomers,
  };
}