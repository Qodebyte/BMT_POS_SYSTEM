import { toast } from "sonner";
import { ReceiptTransaction, Sale, TopVariant } from "../utils/type";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5002/api";

export async function registerAdmin(data: {
  full_name: string;
  email: string;
  password: string;
  admin_role?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    toast.error("Registration failed", {
      description: (err as Error).message,
    });
    throw err;
  }
}

export async function getSalesKPI(
  filter: string = "today",
  startDate?: string,
  endDate?: string
) {
  if (typeof window === "undefined") {
    throw new Error("getSalesKPI must be called on the client");
  }

  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("filter", filter);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const res = await fetch(
    `${API_BASE}/analytics/sales-kpi?${params}`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function getSalesOvertime(
  filter: string = "today",
  startDate?: string,
  endDate?: string,
  granularity?: string
) {
  if (typeof window === "undefined") {
    throw new Error("getSalesOvertime must be called on the client");
  }

  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("filter", filter);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (granularity) params.append("granularity", granularity);

  const res = await fetch(
    `${API_BASE}/analytics/sales-overtime?${params}`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function getPurchaseTypeDistribution(
  filter: string = "today",
  startDate?: string,
  endDate?: string
) {
  if (typeof window === "undefined") {
    throw new Error("getPurchaseTypeDistribution must be called on the client");
  }

  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("filter", filter);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const res = await fetch(
    `${API_BASE}/analytics/purchase-type-distribution?${params}`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
export interface TopSellingVariantsResponse {
  success: boolean;
  top_variants: TopVariant[];
}

export async function getTopSellingVariants(
  filter: string = "today",
  startDate?: string,
  endDate?: string,
  limit: number = 5
): Promise<TopSellingVariantsResponse> {
  if (typeof window === "undefined") {
    throw new Error("getTopSellingVariants must be called on the client");
  }

  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("filter", filter);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  params.append("limit", Math.min(limit, 20).toString());

  const res = await fetch(
    `${API_BASE}/analytics/top-selling-variants?${params}`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export interface GetSalesResponse {
  total: number;
  page: number;
  totalPages: number;
  sales:  Sale[];
}

export async function getSales(
  filter: string = "today",
  page: number = 1,
  limit: number = 10
): Promise<GetSalesResponse> {
  if (typeof window === "undefined") {
    throw new Error("getSales must be called on the client");
  }

  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("No authentication token found");
  }


  const params = new URLSearchParams({ filter, page: page.toString(), limit: limit.toString() });


  const res = await fetch(
    `${API_BASE}/sales?${params}`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}



export async function getSaleById(id: string): Promise<ReceiptTransaction> {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) throw new Error("No token");

  const res = await fetch(`${API_BASE}/sales/${id}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());

  return res.json();
}


export interface SalesReportApiResponse {
  meta: {
    period: string;
    start_date?: string;
    end_date?: string;
    generated_at: string;
    cashier: string;
  };

  summary?: {
    total_orders: number;
    subtotal: number;
    total_tax: number;
    total_discount: number;
    total_sales: number;
    total_cogs: number;
    gross_profit: number;
  };

  transactions?: Array<{
    id: number;
    timestamp: string;
    customer: {
      id: string;
      name: string;
      email: string;
    };
    paymentMethod: string;
    total: number;
    tax: number;
    discount: number;
    items: {
      id: number;
      variantId: number;
      quantity: number;
      unitPrice: number;
    }[];
     purchaseType?: "in-store" | "online";
    installmentPlan?: { downPayment: number; remainingBalance: number };
    credit?: { creditBalance: number };
  }>;

   purchase_type_distribution?: {
    distribution: Record<string, number>;
    total_transactions: number;
  };
  installment_stats?: {
    count: number;
    total_value: number;
    active: number;
  };
  credit_stats?: {
    count: number;
    total_value: number;
    outstanding_balance: number;
  };

  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  payment_methods?: Array<{
    method: string;
    count: number;
    total: number;
  }>;

  product_breakdown?: Array<{
    variant_id: number;
    total_qty: number;
    total_sales: number;
  }>;
}


export async function generateSalesReport(
  period: string = "day",
  startDate?: string,
  endDate?: string,
  options: {
    summary?: boolean;
    details?: boolean;
    payment_methods?: boolean;
    product_breakdown?: boolean;
    category_type?: string;
    cashier?: string;
    page?: number;
    pageSize?: number;
    format?: "json" | "pdf";
  } = {}
): Promise<SalesReportApiResponse | Blob> {
  if (typeof window === "undefined") {
    throw new Error("generateSalesReport must be called on the client");
  }

  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) throw new Error("No authentication token found");

  const params = new URLSearchParams({
    period,
    summary: String(options.summary ?? true),
    details: String(options.details ?? false),
    payment_methods: String(options.payment_methods ?? false),
    product_breakdown: String(options.product_breakdown ?? false),
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 20),
    format: options.format ?? "json"
  });

  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (options.category_type) params.append("category_type", options.category_type);
  if (options.cashier) params.append("cashier", options.cashier);

  const res = await fetch(`${API_BASE}/sales/reports/generate?${params}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`
    }
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  if (options.format === "pdf") {
    return res.blob();
  }

  return res.json();
}


export async function getMiniAdminList(): Promise<{ admins: { admin_id: string; full_name: string; email: string }[] }> {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) throw new Error("No authentication token found");

  const res = await fetch(`${API_BASE}/auth/mini-admin-list`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}