import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User, Client, Product, Invoice } from '../types';

export const DEFAULT_USERS: User[] = [
  {
    username: 'mahmoud',
    password: '112233',
    name: 'محمود (المدير العام)',
    email: 'vvvccsr21@gmail.com',
    role: 'admin',
    rate: 0,
    verified: true,
    permissions: {
      showInvoicesTab: true,
      canCreateInvoice: true,
      showSellerReportTab: true,
      showClientsTab: true,
      canEditClients: true,
      showProductsTab: true,
      canEditProducts: true,
      showClientReportTab: true,
      showCustomReportTab: true,
      showProfitTab: true,
      canEditOthersInvoices: true,
    },
  },
  {
    username: 'madonna',
    password: '123',
    name: 'Madonna',
    email: 'madonna@sales.com',
    role: 'sales',
    rate: 10,
    verified: true,
    permissions: {
      showInvoicesTab: true,
      canCreateInvoice: true,
      showSellerReportTab: true,
      showClientsTab: true,
      canEditClients: true,
      showProductsTab: true,
      canEditProducts: false,
      showClientReportTab: true,
      showCustomReportTab: false,
      showProfitTab: false,
      canEditOthersInvoices: false,
    },
  },
  {
    username: 'joy',
    password: '123',
    name: 'Joy',
    email: 'joy@sales.com',
    role: 'sales',
    rate: 10,
    verified: true,
    permissions: {
      showInvoicesTab: true,
      canCreateInvoice: true,
      showSellerReportTab: true,
      showClientsTab: false,
      canEditClients: false,
      showProductsTab: false,
      canEditProducts: false,
      showClientReportTab: false,
      showCustomReportTab: false,
      showProfitTab: false,
      canEditOthersInvoices: false,
    },
  },
  {
    username: 'malak',
    password: '123',
    name: 'Malak',
    email: 'malak@sales.com',
    role: 'sales',
    rate: 10,
    verified: false,
    permissions: {
      showInvoicesTab: true,
      canCreateInvoice: true,
      showSellerReportTab: true,
      showClientsTab: true,
      canEditClients: false,
      showProductsTab: true,
      canEditProducts: false,
      showClientReportTab: true,
      showCustomReportTab: false,
      showProfitTab: false,
      canEditOthersInvoices: false,
    },
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'P-00001', name: 'ساعة جلد أنيقة (Watch A)', price: 250, cost: 150, stock: 15, notes: 'ساعة جلد كلاسيك فاخرة', createdBy: 'محمود (المدير العام)', createdAt: '2026-04-01 10:00' },
  { id: 'P-00002', name: 'إسورة فضة ناعمة (Bracelet B)', price: 120, cost: 70, stock: 22, notes: 'فضة عيار 925 ممتازة', createdBy: 'محمود (المدير العام)', createdAt: '2026-04-01 10:15' },
  { id: 'P-00003', name: 'خاتم ستايل عصري (Ring C)', price: 80, cost: 45, stock: 30, notes: 'خاتم مطلي عالي الجودة', createdBy: 'Madonna', createdAt: '2026-04-02 11:30' },
  { id: 'P-00004', name: 'سلسلة رفيعة أنيقة (Necklace D)', price: 180, cost: 110, stock: 8, notes: 'سلسلة ذهبي رفيعة دقيقة', createdBy: 'Joy', createdAt: '2026-04-02 14:20' },
  { id: 'P-00005', name: 'طوق أحمر سبيشال', price: 150, cost: 90, stock: 0, notes: 'إكسسوار مميز - رصيد منتهي 0', createdBy: 'محمود (المدير العام)', createdAt: '2026-04-03 09:00' },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: 'C-00001', name: 'مريم أحمد (Mariam)', phone: '01000000000', address: 'القاهرة - المعادي', notes: 'عميلة مميزة ودائمة', createdAt: '2026-04-01 10:00' },
  { id: 'C-00002', name: 'سارة محمود (Sara)', phone: '01100000002', address: 'الجيزة - الدقي', notes: 'سداد نقدي منتظم', createdAt: '2026-04-01 10:10' },
  { id: 'C-00003', name: 'ندى عادل', phone: '01233445566', address: 'مدينة نصر', notes: 'عميلة دورية', createdAt: '2026-04-02 11:00' },
  { id: 'C-00004', name: 'حسين إبراهيم', phone: '01511223344', address: 'الدقي - التحرير', notes: '', createdAt: '2026-04-02 12:00' },
  { id: 'C-00005', name: 'محمود سمير', phone: '01099887766', address: 'مصر الجديدة - الكوربة', notes: 'فاتورة وحساب شهري', createdAt: '2026-04-03 14:00' },
];

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'ORD-00001',
    date: '2026-04-10',
    clientId: 'C-00001',
    seller: 'Madonna',
    status: 'مغلقة',
    paymentMethod: 'نقدي',
    notes: 'فاتورة معتمدة ومسددة بالكامل',
    items: [{ productId: 'P-00001', name: 'ساعة جلد أنيقة (Watch A)', price: 250, cost: 150, qty: 1, total: 250 }],
    totalAmount: 250,
    createdAt: '2026-04-10 11:00',
  },
  {
    id: 'ORD-00002',
    date: '2026-04-10',
    clientId: 'C-00001',
    seller: 'Joy',
    status: 'مغلقة',
    paymentMethod: 'نقدي',
    notes: 'تسليم يدوي',
    items: [{ productId: 'P-00002', name: 'إسورة فضة ناعمة (Bracelet B)', price: 120, cost: 70, qty: 1, total: 120 }],
    totalAmount: 120,
    createdAt: '2026-04-10 12:30',
  },
  {
    id: 'ORD-00003',
    date: '2026-04-10',
    clientId: 'C-00001',
    seller: 'Madonna',
    status: 'مغلقة',
    paymentMethod: 'آجل',
    notes: 'مؤجل للحساب الشهري القادم',
    items: [{ productId: 'P-00003', name: 'خاتم ستايل عصري (Ring C)', price: 80, cost: 45, qty: 2, total: 160 }],
    totalAmount: 160,
    createdAt: '2026-04-10 14:00',
  },
  {
    id: 'ORD-00004',
    date: '2026-04-10',
    clientId: 'C-00002',
    seller: 'Joy',
    status: 'مغلقة',
    paymentMethod: 'نقدي',
    notes: 'استلام فوري',
    items: [{ productId: 'P-00004', name: 'سلسلة رفيعة أنيقة (Necklace D)', price: 180, cost: 110, qty: 1, total: 180 }],
    totalAmount: 180,
    createdAt: '2026-04-10 16:15',
  },
];

// Helper to seed initial documents into Firestore if collection is empty
export async function seedInitialFirestoreData() {
  try {
    const userSnapshot = await getDocs(collection(db, 'users'));
    if (userSnapshot.empty) {
      console.log('Seeding initial Firestore users...');
      for (const u of DEFAULT_USERS) {
        await setDoc(doc(db, 'users', u.username), u);
      }
    }

    const clientSnapshot = await getDocs(collection(db, 'clients'));
    if (clientSnapshot.empty) {
      console.log('Seeding initial Firestore clients...');
      for (const c of DEFAULT_CLIENTS) {
        await setDoc(doc(db, 'clients', c.id), c);
      }
    }

    const prodSnapshot = await getDocs(collection(db, 'products'));
    if (prodSnapshot.empty) {
      console.log('Seeding initial Firestore products...');
      for (const p of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    }

    const invSnapshot = await getDocs(collection(db, 'invoices'));
    if (invSnapshot.empty) {
      console.log('Seeding initial Firestore invoices...');
      for (const inv of DEFAULT_INVOICES) {
        await setDoc(doc(db, 'invoices', inv.id), inv);
      }
    }
  } catch (err) {
    console.warn('Seeding note (will use local fallback if offline):', err);
  }
}

// Subscriptions
export function subscribeToUsers(
  onUpdate: (users: User[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    snapshot => {
      if (snapshot.empty) {
        onUpdate(DEFAULT_USERS);
      } else {
        const users: User[] = [];
        snapshot.forEach(docSnap => {
          users.push(docSnap.data() as User);
        });
        onUpdate(users);
      }
    },
    error => {
      console.warn('Users subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  );
}

export function subscribeToClients(
  onUpdate: (clients: Client[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, 'clients');
  return onSnapshot(
    colRef,
    snapshot => {
      if (snapshot.empty) {
        onUpdate(DEFAULT_CLIENTS);
      } else {
        const clients: Client[] = [];
        snapshot.forEach(docSnap => {
          clients.push(docSnap.data() as Client);
        });
        // Sort by id or createdAt descending
        clients.sort((a, b) => b.id.localeCompare(a.id));
        onUpdate(clients);
      }
    },
    error => {
      console.warn('Clients subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'clients');
    }
  );
}

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, 'products');
  return onSnapshot(
    colRef,
    snapshot => {
      if (snapshot.empty) {
        onUpdate(DEFAULT_PRODUCTS);
      } else {
        const products: Product[] = [];
        snapshot.forEach(docSnap => {
          products.push(docSnap.data() as Product);
        });
        products.sort((a, b) => a.id.localeCompare(b.id));
        onUpdate(products);
      }
    },
    error => {
      console.warn('Products subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'products');
    }
  );
}

export function subscribeToInvoices(
  onUpdate: (invoices: Invoice[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, 'invoices');
  return onSnapshot(
    colRef,
    snapshot => {
      if (snapshot.empty) {
        onUpdate(DEFAULT_INVOICES);
      } else {
        const invoices: Invoice[] = [];
        snapshot.forEach(docSnap => {
          invoices.push(docSnap.data() as Invoice);
        });
        // Sort by invoice date and ID descending
        invoices.sort((a, b) => b.id.localeCompare(a.id));
        onUpdate(invoices);
      }
    },
    error => {
      console.warn('Invoices subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'invoices');
    }
  );
}

// Database Mutators
export async function dbSaveUser(user: User): Promise<void> {
  const path = `users/${user.username}`;
  try {
    await setDoc(doc(db, 'users', user.username), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbSaveClient(client: Client): Promise<void> {
  const path = `clients/${client.id}`;
  try {
    await setDoc(doc(db, 'clients', client.id), client);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbDeleteClient(clientId: string): Promise<void> {
  const path = `clients/${clientId}`;
  try {
    await deleteDoc(doc(db, 'clients', clientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function dbSaveProduct(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbDeleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function dbSaveInvoice(
  invoice: Invoice,
  oldInvoice?: Invoice,
  currentProducts: Product[] = []
): Promise<void> {
  const path = `invoices/${invoice.id}`;
  try {
    // 1. Save the invoice
    await setDoc(doc(db, 'invoices', invoice.id), invoice);

    // 2. Adjust product stocks in Firestore
    if (oldInvoice && oldInvoice.items) {
      for (const oldIt of oldInvoice.items) {
        const p = currentProducts.find(pr => pr.id === oldIt.productId);
        if (p) {
          const restoredStock = (Number(p.stock) || 0) + Number(oldIt.qty);
          p.stock = restoredStock;
          await setDoc(doc(db, 'products', p.id), { ...p, stock: restoredStock });
        }
      }
    }

    if (invoice.items) {
      for (const newIt of invoice.items) {
        const p = currentProducts.find(pr => pr.id === newIt.productId);
        if (p) {
          const newStock = Math.max(0, (Number(p.stock) || 0) - Number(newIt.qty));
          p.stock = newStock;
          await setDoc(doc(db, 'products', p.id), { ...p, stock: newStock });
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function dbDeleteInvoice(
  invoice: Invoice,
  currentProducts: Product[] = []
): Promise<void> {
  const path = `invoices/${invoice.id}`;
  try {
    // Restore product stock
    if (invoice.items) {
      for (const it of invoice.items) {
        const p = currentProducts.find(pr => pr.id === it.productId);
        if (p) {
          const restoredStock = (Number(p.stock) || 0) + Number(it.qty);
          await setDoc(doc(db, 'products', p.id), { ...p, stock: restoredStock });
        }
      }
    }
    await deleteDoc(doc(db, 'invoices', invoice.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Code generation utility for new documents
export function generateNextCode(prefix: string, list: { id: string }[]): string {
  let maxNum = 0;
  for (const item of list) {
    if (item.id && item.id.startsWith(prefix)) {
      const num = parseInt(item.id.replace(prefix, ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(5, '0')}`;
}
