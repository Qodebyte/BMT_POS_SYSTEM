'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface InstallmentPayment {
  id: string;
  installment_plan_id: number;
  payment_number: number;
  amount: string | number;
  due_date: string;
  paid_at: string | null;      
  status: 'pending' | 'completed' | 'overdue' | 'cancelled' | 'paid'; 
  method: string;
  type: 'down_payment' | 'installment';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
}

export interface InstallmentPlan {
  id: string;
  plan_name: string;
  total_amount: number;
  down_payment: number;
  remaining_amount: number;
  number_of_payments: number;
  payment_interval: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled' | 'suspended';
  customer_id: string;
  order_id: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  Customer?: Customer;
  Order?: Order;
  InstallmentPayments?: InstallmentPayment[];
}

interface UseInstallmentPlansReturn {
  plans: InstallmentPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getPlanById: (id: string | number) => Promise<InstallmentPlan | null>;
}

export function useInstallmentPlans(): UseInstallmentPlansReturn {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bmtpossystem.com/api';
  const getToken = () => localStorage.getItem('adminToken');

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();

      const response = await fetch(`${apiUrl}/sales/installments/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch installment plans');
      }

      const data = await response.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(message);
      toast.error(message);
      console.error('Error fetching installment plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanById = async (id: string | number): Promise<InstallmentPlan | null> => {
    try {
      const token = getToken();
      const planId = String(id);

      const response = await fetch(`${apiUrl}/sales/installments/${planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch installment plan');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plan';
      toast.error(message);
      console.error('Error fetching installment plan:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    getPlanById,
  };
}