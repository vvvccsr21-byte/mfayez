export interface UserPermissions {
  showInvoicesTab?: boolean;
  canCreateInvoice?: boolean;
  showSellerReportTab?: boolean;
  showClientsTab?: boolean;
  canEditClients?: boolean;
  showProductsTab?: boolean;
  canEditProducts?: boolean;
  showClientReportTab?: boolean;
  showCustomReportTab?: boolean;
  showProfitTab?: boolean;
  canEditOthersInvoices?: boolean;
}

export interface User {
  id?: string;
  username: string;
  password?: string;
  name: string;
  email?: string;
  role: 'admin' | 'sales';
  rate: number; // Commission percentage (e.g., 10%)
  verified: boolean;
  permissions?: UserPermissions;
  createdAt?: string;
}

export interface Client {
  id: string; // e.g., C-00001
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export interface Product {
  id: string; // e.g., P-00001
  name: string;
  price: number;
  cost: number;
  stock: number;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  price: number;
  cost: number;
  qty: number;
  total: number;
}

export interface Invoice {
  id: string; // e.g., ORD-00001
  date: string;
  clientId: string;
  seller: string;
  status: 'مفتوحة' | 'مغلقة';
  paymentMethod: 'نقدي' | 'آجل';
  notes?: string;
  items: InvoiceItem[];
  totalAmount: number;
  createdAt?: string;
}

export type TabType =
  | 'invoices'
  | 'sellerReport'
  | 'customReport'
  | 'clientReport'
  | 'profitReport'
  | 'clients'
  | 'products'
  | 'backup';
