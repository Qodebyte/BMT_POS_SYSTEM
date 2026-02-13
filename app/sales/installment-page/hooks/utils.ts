import { InstallmentPayment, InstallmentPlan } from "./useInstallmentPlans";

export interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  completedPayments: number;
  pendingPayments: number;
  overduePayments: number;
  completionPercentage: number;
}

export type PaymentStatusType = 'active' | 'completed' | 'cancelled' | 'suspended' | 'pending' | 'overdue' | 'paid';

export function calculatePaymentSummary(plan: InstallmentPlan): PaymentSummary {
  const payments = plan.InstallmentPayments || [];

  const summary = payments.reduce(
    (acc, payment) => {
      // Treat 'paid' status as 'completed'
      const normalizedStatus = payment.status === 'paid' ? 'completed' : payment.status;
      
      if (normalizedStatus === 'completed') {
        acc.totalPaid += Number(payment.amount);
        acc.completedPayments += 1;
      } else if (normalizedStatus === 'pending') {
        acc.totalPending += Number(payment.amount);
        acc.pendingPayments += 1;
      } else if (normalizedStatus === 'overdue') {
        acc.totalOverdue += Number(payment.amount);
        acc.overduePayments += 1;
      }
      return acc;
    },
    {
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      completedPayments: 0,
      pendingPayments: 0,
      overduePayments: 0,
    }
  );

  const completionPercentage =
    payments.length > 0
      ? (summary.completedPayments / payments.length) * 100
      : 0;

  return {
    ...summary,
    completionPercentage: Math.round(completionPercentage),
  };
}

export function getStatusColor(status: PaymentStatusType): string {
  switch (status) {
    case 'active':
    case 'pending':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
    case 'suspended':
      return 'bg-gray-100 text-gray-800';
    default:
      const exhaustiveCheck: never = status;
      return exhaustiveCheck;
  }
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isPaymentOverdue(payment: InstallmentPayment): boolean {
  if (payment.status === 'completed' || payment.status === 'cancelled' || payment.status === 'paid') {
    return false;
  }
  return new Date(payment.due_date) < new Date();
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `NGN ${numAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}