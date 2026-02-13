'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Share2,
  X,
  ChevronLast,
  ChevronFirst
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useInstallmentPlans, InstallmentPlan, InstallmentPayment } from './hooks/useInstallmentPlans';
import { 
  calculatePaymentSummary, 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  isPaymentOverdue,
  type PaymentStatusType 
} from './hooks/utils';
import { InventoryLayout } from '@/app/inventory/components/InventoryLayout';
import { toast } from 'sonner';
import { RecordPaymentDialog } from './components/RecordPaymentDialog';
import { Receipt } from '@/app/pos/components/Receipt';
import ReactDOMServer from 'react-dom/server';

export default function InstallmentsPage() {
  const { plans, loading, error, refetch, getPlanById } = useInstallmentPlans();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [loadingPlanId, setLoadingPlanId] = useState<string | number | null>(null);
  const [detailedPlans, setDetailedPlans] = useState<Map<string | number, InstallmentPlan>>(new Map());

    const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<InstallmentPayment | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | number | null>(null);

  // Receipt viewer state
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [receiptPlan, setReceiptPlan] = useState<InstallmentPlan | null>(null);

  const toggleRow = async (planId: string | number) => {
    const newExpanded = new Set(expandedRows);
    
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      setLoadingPlanId(planId);
      try {
        const detailedPlan = await getPlanById(planId);
        if (detailedPlan) {
          setDetailedPlans(prev => new Map(prev).set(planId, detailedPlan));
          newExpanded.add(planId);
        } else {
          toast.error('Failed to load plan details');
        }
      } catch (err) {
        toast.error('Error loading plan details');
        console.error('Error fetching plan:', err);
      } finally {
        setLoadingPlanId(null);
      }
    }
    
    setExpandedRows(newExpanded);
  };

  const filteredPlans = plans.filter(plan => {
    const planName = plan.plan_name || '';
    const customerName = plan.Customer?.name || '';
    const customerEmail = plan.Customer?.email || '';

    const matchesSearch =
      planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || plan.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

    const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

   const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };



  const getStats = () => {
    const stats = {
      total: plans.length,
      active: plans.filter(p => p.status === 'active').length,
      completed: plans.filter(p => p.status === 'completed').length,
      overdue: plans.filter(p => {
        const summary = calculatePaymentSummary(p);
        return summary.overduePayments > 0;
      }).length,
    };
    return stats;
  };

  const stats = getStats();

  const handleRecordPayment = (planId: string | number, paymentId?: string) => {
    const plan = detailedPlans.get(planId) || plans.find(p => p.id === planId);
    
    if (!plan) {
      toast.error('Plan not found');
      return;
    }

    if (paymentId) {
      const payment = plan.InstallmentPayments?.find(p => p.id === paymentId);
      if (!payment) {
        toast.error('Payment not found');
        return;
      }
      setSelectedPayment(payment);
    }
    
    setSelectedPlanId(planId);
    setShowPaymentDialog(true);
  };

  const handlePaymentRecorded = async () => {
    if (selectedPlanId) {
      try {
        const detailedPlan = await getPlanById(selectedPlanId);
        if (detailedPlan) {
          setDetailedPlans(prev => new Map(prev).set(selectedPlanId, detailedPlan));
        }
      } catch (err) {
        console.error('Error refreshing plan:', err);
      }
    }
    
    await refetch();
  };

  const handleViewReceipt = (plan: InstallmentPlan) => {
    setReceiptPlan(plan);
    setShowReceiptDialog(true);
  };

  const handlePrintReceipt = () => {
    if (!receiptPlan) return;

    const receiptHtml = ReactDOMServer.renderToString(
      <Receipt
        customer={receiptPlan.Customer || { id: '', name: 'Unknown', email: '', phone: '' }}
        cart={[]}
        subtotal={receiptPlan.total_amount}
        tax={0}
        total={receiptPlan.total_amount}
        paymentMethod="installment"
        amountPaid={receiptPlan.InstallmentPayments?.find(p => p.status === 'paid')?.amount || 0}
        change={0}
        purchaseType="in-store"
        installmentPlan={{
          numberOfPayments: receiptPlan.number_of_payments,
          amountPerPayment: receiptPlan.total_amount / receiptPlan.number_of_payments,
          paymentFrequency: receiptPlan.payment_interval as 'daily' | 'weekly' | 'monthly',
          startDate: receiptPlan.start_date,
          notes: receiptPlan.notes || '',
          downPayment: receiptPlan.InstallmentPayments?.find(p => p.type === 'down_payment')?.amount || 0,
          remainingBalance: receiptPlan.remaining_amount,
        }}
        transactionId={String(receiptPlan.id)}
        receiptDate={new Date(receiptPlan.start_date).toLocaleString()}
      />
    );

    const printWindow = window.open('', '_blank', 'width=500,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Installment Plan - ${receiptPlan.id}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media print {
              @page {
                size: auto;
                margin: 0mm;
              }
              body {
                margin: 0;
                padding: 10px;
                background: white !important;
                color: black !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print { display: none !important; }
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Courier New', monospace;
              background: white;
            }
            
            .print-controls {
              position: fixed;
              top: 10px;
              right: 10px;
              z-index: 1000;
              background: white;
              padding: 10px;
              border-radius: 5px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .print-controls button {
              background: #111827;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-family: sans-serif;
              font-size: 14px;
              margin-right: 10px;
            }
            
            .print-controls button:hover {
              background: #1f2937;
            }
            
            .print-controls button:last-child {
              background: #dc2626;
            }
            
            .print-controls button:last-child:hover {
              background: #b91c1c;
            }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button onclick="window.print()">🖨️ Print</button>
            <button onclick="window.close()">❌ Close</button>
          </div>
          ${receiptHtml}
          
          <script>
            window.onafterprint = function() {
              setTimeout(() => {
                window.close();
              }, 1000);
            };
            
            document.addEventListener('keydown', function(e) {
              if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
              }
              if (e.key === 'Escape') {
                window.close();
              }
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  if (loading) {
    return (
      <InventoryLayout>
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
          <Skeleton className="h-8 sm:h-10 md:h-12 w-48 sm:w-56 md:w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24" />
            ))}
          </div>
          <Skeleton className="h-64 sm:h-80 md:h-96" />
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Installment Plans</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer installment payment plans</p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gray-900">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600">Total Plans</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-50 mt-1 sm:mt-2">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All installment plans</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-blue-600 font-semibold">Active Plans</div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1 sm:mt-2">{stats.active}</div>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-green-600 font-semibold">Completed</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-700 mt-1 sm:mt-2">{stats.completed}</div>
              <p className="text-xs text-gray-500 mt-1">Fully paid</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-red-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-red-600 font-semibold">With Overdue</div>
              <div className="text-2xl sm:text-3xl font-bold text-red-700 mt-1 sm:mt-2">{stats.overdue}</div>
              <p className="text-xs text-gray-500 mt-1">Overdue payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 sm:p-4 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-red-900">Error loading plans</p>
                <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
                <Button
                  onClick={() => refetch()}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
         <Card className="bg-gray-900">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">Search</label>
                <Input
                  placeholder="Search by plan name, customer name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Table */}
        <Card className="bg-gray-900 overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Installment Plans</CardTitle>
            <CardDescription className="text-sm">
              {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {filteredPlans.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <p className="text-sm sm:text-base text-gray-500">No installment plans found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-900">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="text-xs sm:text-sm">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                      <TableHead className="text-xs sm:text-sm">Total Amount</TableHead>
                      <TableHead className="text-xs sm:text-sm">Payments</TableHead>
                      <TableHead className="text-xs sm:text-sm">Progress</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPlans.flatMap((plan) => {
                        const summary = calculatePaymentSummary(plan);
                        const statusColor = getStatusColor(plan.status);
                        const isExpanded = expandedRows.has(plan.id);
                        const payments = plan.InstallmentPayments || [];
                      const rows = [
                        (
                          <TableRow 
                            key={`plan-${plan.id}`}
                            className="cursor-pointer hover:bg-gray-900 transition-colors"
                            onClick={() => toggleRow(plan.id)}
                          >
                            <TableCell className="p-2 sm:p-4">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm p-2 sm:p-4">
                              #{String(plan.id).slice(-8)}
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <div>
                                <p className="font-medium text-xs sm:text-sm text-gray-50">
                                  {plan.Customer?.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
                                  {plan.Customer?.phone || 'N/A'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <span className="font-semibold text-xs sm:text-sm">
                                {formatCurrency(plan.total_amount)}
                              </span>
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <div className="text-xs sm:text-sm">
                                <p>
                                  <span className="font-medium">
                                    {summary.completedPayments}
                                  </span>
                                  /{plan.number_of_payments}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Paid: {formatCurrency(summary.totalPaid)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <div className="w-20 sm:w-24 md:w-32">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${summary.completionPercentage}%`,
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {summary.completionPercentage}%
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <Badge className={`${statusColor} text-xs px-2 py-0.5`}>
                                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                                </Badge>
                                {summary.overduePayments > 0 && (
                                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                    {summary.overduePayments} Overdue
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      ];

                      if (isExpanded) {
                        rows.push(
                          <TableRow key={`expandable-${plan.id}`} className="bg-gray-900">
                            <TableCell colSpan={8} className="p-0">
                              <div className="p-3 sm:p-4 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                  <h4 className="text-xs sm:text-sm font-semibold text-gray-50">
                                    Payment Schedule
                                  </h4>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                  {payments.length > 0 ? (
                                    payments
                                      .sort((a, b) => a.payment_number - b.payment_number)
                                      .map((payment) => {
                                        const isOverdue = isPaymentOverdue(payment);
                                        const paymentStatus: PaymentStatusType = 
                                          isOverdue 
                                            ? 'overdue' 
                                            : payment.status === 'paid' 
                                              ? 'completed' 
                                              : (payment.status as PaymentStatusType);

                                        const statusColor = getStatusColor(paymentStatus);
                                        
                                        return (
                                          <div
                                            key={payment.id}
                                            className="bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow flex flex-col"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-medium text-gray-500">
                                                Payment #{payment.payment_number}
                                              </span>
                                              <Badge className={`${statusColor} text-xs px-2 py-0.5`}>
                                                {payment.status === 'paid' ? 'Completed' : payment.status}
                                              </Badge>
                                            </div>
                                            
                                            <div className="space-y-1.5 flex-1">
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Amount:</span>
                                                <span className="text-sm font-semibold text-gray-50">
                                                  {formatCurrency(payment.amount)}
                                                </span>
                                              </div>
                                              
                                              <div className="flex items-center gap-1 text-xs">
                                                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                                <span className="text-gray-600">Due:</span>
                                                <span className="font-medium text-gray-50">
                                                  {formatDate(payment.due_date)}
                                                </span>
                                              </div>
                                              
                                              {payment.paid_at && (
                                                <div className="flex items-center gap-1 text-xs">
                                                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                  <span className="text-gray-600">Paid:</span>
                                                  <span className="font-medium text-gray-50">
                                                    {formatDate(payment.paid_at)}
                                                  </span>
                                                </div>
                                              )}
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 text-xs h-8"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleViewReceipt(plan);
                                                }}
                                              >
                                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                View
                                              </Button>
                                              
                                              {payment.status === 'pending' && (
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="flex-1 text-xs h-8"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRecordPayment(plan.id, payment.id);
                                                  }}
                                                >
                                                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                                                  Record
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })
                                  ) : (
                                    <div className="col-span-full text-center py-6 sm:py-8 bg-gray-900 rounded-lg border border-gray-200">
                                      <div className="flex flex-col items-center gap-2">
                                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                        <p className="text-xs sm:text-sm text-gray-500">
                                          No payment schedule available
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return rows;
                    })}
                  </TableBody>
                </Table>


                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-t border-gray-700">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronFirst className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrentPage = pageNum === currentPage;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={isCurrentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="h-8 w-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-600">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="h-8 w-8 p-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      Next
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLast className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <RecordPaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          payment={selectedPayment}
          planId={selectedPlanId || ''}
          onPaymentRecorded={handlePaymentRecorded}
        />

        {/* Receipt Viewer Dialog */}
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>Installment Plan Receipt</DialogTitle>
              <DialogDescription>
                View and print installment plan details
              </DialogDescription>
            </DialogHeader>

            {receiptPlan && (
              <>
                <Receipt
                  customer={receiptPlan.Customer || { id: '', name: 'Unknown', email: '', phone: '' }}
                  cart={[]}
                  subtotal={receiptPlan.total_amount}
                  discount={0}
                  tax={0}
                  total={receiptPlan.total_amount}
                  paymentMethod="installment"
                  amountPaid={receiptPlan.InstallmentPayments?.find(p => p.status === 'paid')?.amount || 0}
                  change={0}
                  purchaseType="in-store"
                  installmentPlan={{
                    numberOfPayments: receiptPlan.number_of_payments,
                    amountPerPayment: Math.round((receiptPlan.total_amount / receiptPlan.number_of_payments) * 100) / 100,
                    paymentFrequency: receiptPlan.payment_interval as 'daily' | 'weekly' | 'monthly',
                    startDate: receiptPlan.start_date,
                    notes: receiptPlan.notes || '',
                    downPayment: receiptPlan.InstallmentPayments?.find(p => p.type === 'down_payment')?.amount || 0,
                    remainingBalance: receiptPlan.remaining_amount,
                  }}
                  transactionId={String(receiptPlan.id)}
                  receiptDate={new Date(receiptPlan.start_date).toLocaleString()}
                />
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button onClick={handlePrintReceipt} className="flex-1" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReceiptDialog(false)}
                    className="flex-1"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </InventoryLayout>
  );
}