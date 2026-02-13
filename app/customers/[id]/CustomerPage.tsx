"use client"
import { useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import {  Transaction } from '@/app/utils/type';
import { Receipt } from '@/app/pos/components/Receipt';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { InventoryLayout } from '@/app/inventory/components/InventoryLayout';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';



interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  is_walk_in: boolean;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

export function CustomerDetailPage() {
   const router = useRouter();
 const { id } = useParams<{ id: string }>();


  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://api.bmtpossystem.com/api';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterOwing, setFilterOwing] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [showDeletedDialog, setShowDeletedDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

  const ITEMS_PER_PAGE = 10;

   useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');

        const res = await fetch(
          `${apiUrl}/customers/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 404) {
       
          setShowDeletedDialog(true);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch customer');
        }

        const data = await res.json();
        if (data.customer) {
          setCustomer(data.customer);
          setEditForm({
  name: data.customer.name || '',
  email: data.customer.email || '',
  phone: data.customer.phone || '',
});

        }
      } catch (error) {
        console.error('❌ Fetch customer error:', error);
        setShowDeletedDialog(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id, apiUrl]);


 

    const handleRedirectBack = () => {
    router.push('/customers');
  };

 
  const handlePrintReceipt = (transaction: Transaction) => {
    const receiptHtml = ReactDOMServer.renderToString(
      <Receipt
        customer={customer || { id: 'unknown', name: 'Unknown Customer' }}
        cart={transaction.items}
        subtotal={transaction.subtotal || transaction.total - transaction.tax}
        tax={transaction.tax}
        total={transaction.total}
        paymentMethod={transaction.paymentMethod}
        amountPaid={transaction.amountPaid || transaction.total}
        change={(transaction.amountPaid || transaction.total) - transaction.total}
        purchaseType={transaction.purchaseType || 'in-store'}
        splitPayments={transaction.splitPayments?.map(sp => ({
          method: sp.method,
          amount: sp.amount.toString(),
        }))}
        transactionId={transaction.id}
        receiptDate={new Date(transaction.timestamp).toLocaleString()}
      />
    );

    const printWindow = window.open('', '_blank', 'width=500,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
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
              border: 1px solid #ddd;
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
            <button onclick="window.print()">🖨️ Print Receipt</button>
            <button onclick="window.close()">❌ Close</button>
          </div>
          ${receiptHtml}
          
          <script>
            // Auto-print option
            setTimeout(() => { window.print(); }, 500);
            
            // Auto-close after printing
            window.onafterprint = function() {
              setTimeout(() => {
                window.close();
              }, 1000);
            };
            
            // Keyboard shortcuts
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

 
 const handleUpdateCustomer = async () => {
  try {
    const token = localStorage.getItem('adminToken');

    await fetch(`${apiUrl}/customers/${customer!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    });

    toast.success('Customer updated successfully');
    setEditDialogOpen(false);
  } catch (error) {
    toast.error('Failed to update customer.');
    console.error('❌ Update customer error:', error);
  }
};


useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      const res = await fetch(
        `${apiUrl}/customers/${id}/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('❌ Fetch transactions error:', err);
    }
  };

  if (id) fetchTransactions();
}, [id, apiUrl]);


  const isTransactionCompleted = (txn: Transaction): boolean => {
    if (txn.paymentMethod === 'credit') {
      return true;
    }
    
    if (txn.paymentMethod === 'installment' && txn.installmentPlan) {
      return txn.installmentPlan.remainingBalance <= 0;
    }
    
    if (txn.paymentMethod === 'split') {
      return true;
    }
    
    return txn.amountPaid >= txn.total;
  };


  const filteredTxns = transactions.filter(txn => {
   
    if (filterOwing && isTransactionCompleted(txn)) {
      return false;
    }
    
    
    if (paymentMethodFilter !== 'all' && txn.paymentMethod !== paymentMethodFilter) {
      return false;
    }
    
    return true;
  });


  const totalPages = Math.ceil(filteredTxns.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTxns = filteredTxns.slice(startIndex, endIndex);

  
  const paymentMethods = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'split', label: 'Split' },
    { value: 'credit', label: 'Credit' },
    { value: 'installment', label: 'Installment' },
  ];

  const handleDeleteCustomer = async () => {
  try {
    setIsDeleting(true);
    const token = localStorage.getItem('adminToken');

    const res = await fetch(`${apiUrl}/customers/${customer!.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to delete customer');
    }

    toast.success('Customer deleted successfully');

  
    setDeleteDialogOpen(false);

  
    setTimeout(() => {
      router.push('/customers');
    }, 800);

  } catch (error) {
    console.error('❌ Delete customer error:', error);
    toast.error('Failed to delete customer');
  } finally {
    setIsDeleting(false);
  }
};


  const stats = {
    totalOrders: transactions.length,
    outstandingCredit: transactions
      .filter(txn => txn.paymentMethod === 'credit')
      .reduce((sum, txn) => sum + txn.total, 0),
    activeInstallments: transactions
      .filter(txn => txn.paymentMethod === 'installment' && txn.installmentPlan)
      .reduce((sum, txn) => sum + (txn.installmentPlan!.remainingBalance || 0), 0),
    creditSales: transactions.filter(txn => txn.paymentMethod === 'credit').length,
    activeInstallmentPlans: transactions.filter(txn => 
      txn.paymentMethod === 'installment' && 
      txn.installmentPlan && 
      txn.installmentPlan.remainingBalance > 0
    ).length,
    totalCompletedSales: transactions
      .filter(txn => isTransactionCompleted(txn))
      .reduce((sum, txn) => sum + txn.total, 0),
    totalSalesValue: transactions.reduce((sum, txn) => sum + txn.total, 0),
    owingTransactions: transactions.filter(txn => !isTransactionCompleted(txn)).length,
    paymentMethodBreakdown: {
      cash: transactions.filter(txn => txn.paymentMethod === 'cash').length,
      card: transactions.filter(txn => txn.paymentMethod === 'card').length,
      transfer: transactions.filter(txn => txn.paymentMethod === 'transfer').length,
      split: transactions.filter(txn => txn.paymentMethod === 'split').length,
      credit: transactions.filter(txn => txn.paymentMethod === 'credit').length,
      installment: transactions.filter(txn => txn.paymentMethod === 'installment').length,
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'card': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'transfer': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'split': return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      case 'credit': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'installment': return 'bg-yellow-100 text-green-800 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

if (loading) {
    return (
     
        <div className="p-6">
          <div className="text-center py-10">Loading customer...</div>
        </div>
      
    );
  }

  if (customer === null) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-2xl mb-2">⚠️</div>
        <h2 className="text-xl font-bold">Customer not found</h2>
        <p className="text-gray-400 mt-1">Customer ID: {id}</p>
        <p className="text-gray-400">Check the URL or return to the customer list</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
       <Button
          variant="outline"
          onClick={() => router.push('/customers')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Button>

      <div className="bg-gray-900 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-2xl">{customer.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-gray-300">{customer.phone || 'No phone'}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-300">{customer.email || 'No email'}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-300">ID: {customer.id}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {customer.id !== 'walk-in' && (
              <>
              
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Customer</DialogTitle>
                      <DialogDescription>
                        Update customer information
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          placeholder="Enter customer name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                      className="bg-gray-100 hover:bg-gray-200"
                        onClick={handleUpdateCustomer}
                      >
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogTrigger asChild>
    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
      Delete
    </button>
  </AlertDialogTrigger>

  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Customer</AlertDialogTitle>
      <AlertDialogDescription>
        This action will permanently remove this customer from active records.
        <br />
        <strong className="text-red-500">This cannot be undone.</strong>
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <Button
        variant="outline"
        onClick={() => setDeleteDialogOpen(false)}
        disabled={isDeleting}
      >
        Cancel
      </Button>

      <Button
        className="bg-red-600 hover:bg-red-700 text-white"
        onClick={handleDeleteCustomer}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting…' : 'Yes, Delete'}
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

              </>
            )}
          </div>
        </div>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-100 border border-gray-200 shadow-2xl text-gray-900 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">Total Orders</div>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 shadow-2xl text-gray-900 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">Total Sales Value</div>
          <div className="text-2xl font-bold">NGN {stats.totalSalesValue.toFixed(2)}</div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 shadow-2xl text-gray-900 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">Credit Allowed</div>
          <div className="text-2xl font-bold">NGN {stats.outstandingCredit.toFixed(2)}</div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 shadow-2xl text-gray-900 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">Completed Sales</div>
          <div className="text-2xl font-bold">NGN {stats.totalCompletedSales.toFixed(2)}</div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 shadow-2xl text-gray-900 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">Credit Sales</div>
          <div className="text-2xl font-bold">{stats.creditSales}</div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 shadow-2xl text-gray-900 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">Active Installments</div>
          <div className="text-2xl font-bold">NGN {stats.activeInstallments.toFixed(2)}</div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 shadow-2xl text-gray-900 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">Installment Plans</div>
          <div className="text-2xl font-bold">{stats.activeInstallmentPlans}</div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 shadow-2xl text-gray-900 p-4 rounded-lg">
          <div className="text-gray-600 text-sm">Owing Transactions</div>
          <div className="text-2xl font-bold">{stats.owingTransactions}</div>
        </div>
      </div>

     
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stats.paymentMethodBreakdown).map(([method, count]) => (
            <div key={method} className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm capitalize">{method}</div>
              <div className="text-xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>

     
      <div className="bg-gray-900 p-4 rounded-lg">
        <div className="flex flex-col xl:flex-row justify-between items-center mb-4 gap-4">
          <h3 className="font-semibold text-lg">
            Transactions ({filteredTxns.length})
            {filterOwing && <span className="text-green-400 ml-2">(Owing Only)</span>}
            {paymentMethodFilter !== 'all' && (
              <span className="text-blue-400 ml-2">({paymentMethodFilter})</span>
            )}
          </h3>
          
          <div className="flex flex-wrap gap-2">
       
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map(method => (
                <button
                  key={method.value}
                  onClick={() => {
                    setPaymentMethodFilter(method.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    paymentMethodFilter === method.value
                      ? getPaymentMethodColor(method.value)
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
            
          
            <button 
              onClick={() => {
                setFilterOwing(!filterOwing);
                setCurrentPage(1);
              }} 
              className={`px-4 py-2 rounded font-medium ${
                filterOwing 
                  ? 'bg-green-400 text-black hover:bg-green-500' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filterOwing ? 'All Transactions' : 'Owing Only'}
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-gray-700 rounded">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-lg">No transactions found for this customer</p>
            <p className="text-sm mt-1">This customer hasn&apos;t made any purchases yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-3 text-left text-gray-400">Invoice ID</th>
                    <th className="p-3 text-left text-gray-400">Date</th>
                    <th className="p-3 text-left text-gray-400">Payment Method</th>
                    <th className="p-3 text-left text-gray-400">Total</th>
                    <th className="p-3 text-left text-gray-400">Paid</th>
                    <th className="p-3 text-left text-gray-400">Balance</th>
                    <th className="p-3 text-left text-gray-400">Status</th>
                    <th className="p-3 text-left text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTxns.map(txn => {
                    let balance = 0;
                    let isCompleted = false;
                    
                    if (txn.paymentMethod === 'credit') {
                      balance = 0;
                      isCompleted = true;
                    } else if (txn.paymentMethod === 'installment' && txn.installmentPlan) {
                      balance = txn.installmentPlan.remainingBalance;
                      isCompleted = balance <= 0;
                    } else if (['cash', 'card', 'transfer', 'split'].includes(txn.paymentMethod)) {
                      balance = 0;
                      isCompleted = true;
                    } else {
                      balance = Math.max(0, txn.total - txn.amountPaid);
                      isCompleted = balance <= 0;
                    }

                    return (
                      <tr key={txn.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3 font-mono text-sm">{txn.id}</td>
                        <td className="p-3">{new Date(txn.timestamp).toLocaleDateString()}</td>
                        <td className="p-3 capitalize">
                          <span className={`px-2 py-1 rounded text-xs ${
                            txn.paymentMethod === 'credit' ? 'bg-blue-900/30 text-blue-300' :
                            txn.paymentMethod === 'installment' ? 'bg-green-900/30 text-green-400' :
                            txn.paymentMethod === 'cash' ? 'bg-green-900/30 text-green-300' :
                            txn.paymentMethod === 'card' ? 'bg-purple-900/30 text-purple-300' :
                            txn.paymentMethod === 'transfer' ? 'bg-indigo-900/30 text-indigo-300' :
                            txn.paymentMethod === 'split' ? 'bg-pink-900/30 text-pink-300' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {txn.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 font-medium">NGN {txn.total.toFixed(2)}</td>
                        <td className="p-3">NGN {txn.amountPaid.toFixed(2)}</td>
                        <td className="p-3 font-bold">
                          {balance > 0 ? `NGN ${balance.toFixed(2)}` : '—'}
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isCompleted ? 'bg-green-900/30 text-green-400' : 'bg-green-900/30 text-green-400'
                          }`}>
                            {isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">

                            {
                                txn.paymentMethod === 'installment' && (
                                    <Link href='/sales/installment-page'>
                                    <Button 
                                    variant='link'
                                    >
                                    View Installment Schedule
                                    </Button>
                                    </Link>
                                )
                            }
                          
                            {txn.paymentMethod !== 'installment' && (
                              <button 
                                onClick={() => handlePrintReceipt(txn)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Print Receipt
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

         
            {totalPages > 1 && (
              <div className="sm:flex sm:justify-between sm:items-center grid grid-cols-1 sm:gap-0 gap-2 mt-6 pt-4 border-t border-gray-700">
                <div className="text-gray-400 text-sm">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTxns.length)} of {filteredTxns.length} transactions
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded ${
                            currentPage === pageNum
                              ? 'bg-green-400 text-black'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <AlertDialog open={showDeletedDialog} onOpenChange={setShowDeletedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Customer Deleted</AlertDialogTitle>
            <AlertDialogDescription>
              This customer has been deleted or no longer exists. You will be redirected back to the customers list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRedirectBack}>
              Return to Customers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}