import { useState, useEffect } from 'react';
import {
  testConnection,
} from './firebase';
import {
  DEFAULT_USERS,
  DEFAULT_CLIENTS,
  DEFAULT_PRODUCTS,
  DEFAULT_INVOICES,
  seedInitialFirestoreData,
  subscribeToUsers,
  subscribeToClients,
  subscribeToProducts,
  subscribeToInvoices,
  dbSaveUser,
  dbSaveClient,
  dbDeleteClient,
  dbSaveProduct,
  dbDeleteProduct,
  dbSaveInvoice,
  dbDeleteInvoice,
} from './services/db';
import { User, Client, Product, Invoice, TabType } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { InvoicesTab } from './components/tabs/InvoicesTab';
import { SellerReportTab } from './components/tabs/SellerReportTab';
import { CustomReportTab } from './components/tabs/CustomReportTab';
import { ClientReportTab } from './components/tabs/ClientReportTab';
import { ProfitReportTab } from './components/tabs/ProfitReportTab';
import { ClientsTab } from './components/tabs/ClientsTab';
import { ProductsTab } from './components/tabs/ProductsTab';
import { BackupTab } from './components/tabs/BackupTab';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { ProductModal } from './components/modals/ProductModal';
import { ClientModal } from './components/modals/ClientModal';
import { UsersManagementModal } from './components/modals/UsersManagementModal';
import { DirectCommissionModal } from './components/modals/DirectCommissionModal';
import { ChangePasswordModal } from './components/modals/ChangePasswordModal';
import { ProductAuditModal } from './components/modals/ProductAuditModal';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Info } from 'lucide-react';

export default function App() {
  // Database state
  const [users, setUsers] = useState<User[]>(() => {
    const cached = localStorage.getItem('app_users_cache');
    return cached ? JSON.parse(cached) : DEFAULT_USERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const cached = localStorage.getItem('app_clients_cache');
    return cached ? JSON.parse(cached) : DEFAULT_CLIENTS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('app_products_cache');
    return cached ? JSON.parse(cached) : DEFAULT_PRODUCTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const cached = localStorage.getItem('app_invoices_cache');
    return cached ? JSON.parse(cached) : DEFAULT_INVOICES;
  });

  // Auth & UI state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem('app_session_user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });

  const [currentTab, setCurrentTab] = useState<TabType>('invoices');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedClientForStatement, setSelectedClientForStatement] = useState<string>('');

  // Modals state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [usersManagementModalOpen, setUsersManagementModalOpen] = useState(false);
  const [directCommModalOpen, setDirectCommModalOpen] = useState(false);
  const [directCommTarget, setDirectCommTarget] = useState<User | null>(null);

  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [productAuditModalOpen, setProductAuditModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isAlertOnly?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Toast helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showAlert = (title: string, message: string) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      isAlertOnly: true,
      onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      isAlertOnly: false,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      },
    });
  };

  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem('app_users_cache', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('app_clients_cache', JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    localStorage.setItem('app_products_cache', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('app_invoices_cache', JSON.stringify(invoices));
  }, [invoices]);

  // Real-time Firestore subscriptions
  useEffect(() => {
    setCloudSyncStatus('syncing');

    testConnection().then(connected => {
      if (connected) {
        setCloudSyncStatus('connected');
        seedInitialFirestoreData();
      } else {
        setCloudSyncStatus('offline');
      }
    });

    const unsubUsers = subscribeToUsers(updatedUsers => {
      setUsers(updatedUsers);
      setCloudSyncStatus('connected');
      // If current user is logged in, refresh their record
      if (currentUser) {
        const refreshed = updatedUsers.find(u => u.username === currentUser.username);
        if (refreshed) {
          setCurrentUser(refreshed);
          localStorage.setItem('app_session_user', JSON.stringify(refreshed));
        }
      }
    });

    const unsubClients = subscribeToClients(updatedClients => {
      setClients(updatedClients);
      setCloudSyncStatus('connected');
    });

    const unsubProducts = subscribeToProducts(updatedProducts => {
      setProducts(updatedProducts);
      setCloudSyncStatus('connected');
    });

    const unsubInvoices = subscribeToInvoices(updatedInvoices => {
      setInvoices(updatedInvoices);
      setCloudSyncStatus('connected');
    });

    return () => {
      unsubUsers();
      unsubClients();
      unsubProducts();
      unsubInvoices();
    };
  }, []);

  // Update session
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('app_session_user', JSON.stringify(user));
    showToast(`مرحباً بك يا ${user.name}`, 'success');

    // Default to a visible tab
    const isAdmin = user.role === 'admin';
    const perms = user.permissions || {};
    if (isAdmin || perms.showInvoicesTab) {
      setCurrentTab('invoices');
    } else if (perms.showSellerReportTab !== false) {
      setCurrentTab('sellerReport');
    } else if (perms.showClientsTab) {
      setCurrentTab('clients');
    } else {
      setCurrentTab('products');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('app_session_user');
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  // Check tab permission
  const isTabAllowed = (tab: TabType): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const perms = currentUser.permissions || {};
    switch (tab) {
      case 'invoices':
        return perms.showInvoicesTab ?? true;
      case 'sellerReport':
        return perms.showSellerReportTab ?? true;
      case 'customReport':
        return perms.showCustomReportTab ?? false;
      case 'clientReport':
        return perms.showClientReportTab ?? false;
      case 'profitReport':
        return perms.showProfitTab ?? false;
      case 'clients':
        return perms.showClientsTab ?? false;
      case 'products':
        return perms.showProductsTab ?? false;
      case 'backup':
        return false;
      default:
        return true;
    }
  };

  const handleSelectTab = (tab: TabType) => {
    if (!isTabAllowed(tab)) {
      showAlert('صلاحية محظورة', 'عذراً، هذا القسم غير متاح بحسب صلاحيات حسابك.');
      return;
    }
    setCurrentTab(tab);
  };

  // CRUD Actions with Cloud Firestore
  const handleSaveInvoice = async (invoiceData: Invoice, oldInvoice?: Invoice) => {
    try {
      await dbSaveInvoice(invoiceData, oldInvoice, products);
      showToast(`تم حفظ الفاتورة ${invoiceData.id} ومزامنتها سحابياً`, 'success');
    } catch (err) {
      console.error(err);
      showToast('خطأ أثناء حفظ الفاتورة في السحابة', 'error');
    }
  };

  const handleDeleteInvoice = (inv: Invoice) => {
    if (currentUser?.role !== 'admin') {
      showAlert('صلاحيات محظورة', 'حذف الفواتير متاح للمدير العام فقط.');
      return;
    }
    showConfirm(
      'تأكيد حذف الفاتورة',
      `هل أنت متأكد من حذف الفاتورة "<strong>${inv.id}</strong>"؟ سيتم استرجاع الكميات للمخزن تلقائياً.`,
      async () => {
        try {
          await dbDeleteInvoice(inv, products);
          showToast(`تم حذف الفاتورة ${inv.id}`, 'info');
        } catch (err) {
          console.error(err);
          showToast('حدث خطأ أثناء حذف الفاتورة', 'error');
        }
      }
    );
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      await dbSaveProduct(productData);
      showToast(`تم حفظ الصنف (${productData.name}) سحابياً`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء حفظ المنتج', 'error');
    }
  };

  const handleDeleteProduct = (prod: Product) => {
    if (currentUser?.role !== 'admin') return;
    const stock = Number(prod.stock) || 0;
    if (stock > 0) {
      showAlert(
        'لا يمكن حذف الصنف',
        `الصنف "<strong>${prod.name}</strong>" لا يزال به رصيد في المخزن (${stock} قطعة). يجب تصفير الرصيد أولاً.`
      );
      return;
    }

    showConfirm(
      'تأكيد حذف الصنف',
      `هل أنت متأكد من حذف الصنف "<strong>${prod.name}</strong>" نهائياً؟`,
      async () => {
        try {
          await dbDeleteProduct(prod.id);
          showToast(`تم حذف الصنف ${prod.name}`, 'info');
        } catch (err) {
          console.error(err);
          showToast('حدث خطأ أثناء حذف الصنف', 'error');
        }
      }
    );
  };

  const handleSaveClient = async (clientData: Client) => {
    try {
      await dbSaveClient(clientData);
      showToast(`تم حفظ بيانات العميل (${clientData.name}) سحابياً`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء حفظ العميل', 'error');
    }
  };

  const handleDeleteClient = (client: Client) => {
    if (currentUser?.role !== 'admin') return;
    const clientInvoicesCount = invoices.filter(i => i.clientId === client.id).length;
    if (clientInvoicesCount > 0) {
      showAlert(
        'لا يمكن حذف العميل',
        `العميل "<strong>${client.name}</strong>" لديه (${clientInvoicesCount} فواتير) مسجلة بالنظام.`
      );
      return;
    }

    showConfirm(
      'تأكيد حذف العميل',
      `هل أنت متأكد من حذف العميل "<strong>${client.name}</strong>" نهائياً؟`,
      async () => {
        try {
          await dbDeleteClient(client.id);
          showToast(`تم حذف العميل ${client.name}`, 'info');
        } catch (err) {
          console.error(err);
          showToast('حدث خطأ أثناء حذف العميل', 'error');
        }
      }
    );
  };

  const handleSaveUser = async (userData: User) => {
    try {
      await dbSaveUser(userData);
      showToast(`تم تحديث بيانات (${userData.name}) في قاعدة البيانات`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء حفظ المستخدم', 'error');
    }
  };

  const handleSavePassword = async (newPass: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, password: newPass };
    try {
      await dbSaveUser(updatedUser);
      setCurrentUser(updatedUser);
      localStorage.setItem('app_session_user', JSON.stringify(updatedUser));
      showToast('تم تغيير كلمة المرور بنجاح ومزامنتها سحابياً', 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تحديث كلمة المرور', 'error');
    }
  };

  const handleDirectSaveRate = async (username: string, newRate: number) => {
    const target = users.find(u => u.username === username);
    if (!target) return;
    const updated = { ...target, rate: newRate };
    try {
      await dbSaveUser(updated);
      showToast(`تم تعديل نسبة عمولة (${target.name}) إلى ${newRate}% سحابياً`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تعديل العمولة', 'error');
    }
  };

  const handleToggleVerified = async (target: User) => {
    const updated = { ...target, verified: !target.verified };
    try {
      await dbSaveUser(updated);
      showToast(
        updated.verified
          ? `تم توثيق حساب (${target.name}) بالعلامة الزرقاء`
          : `تم إلغاء توثيق حساب (${target.name})`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تعديل التوثيق', 'error');
    }
  };

  const handleInspectClientStatement = (clientId: string) => {
    setSelectedClientForStatement(clientId);
    handleSelectTab('clientReport');
  };

  const handleRestoreFullBackup = async (backup: {
    users?: User[];
    clients?: Client[];
    products?: Product[];
    invoices?: Invoice[];
  }) => {
    showConfirm(
      'تأكيد استعادة النسخة الاحتياطية',
      `سيتم استيراد (${backup.invoices?.length || 0} فواتير) و (${backup.clients?.length || 0} عملاء) و (${backup.products?.length || 0} أصناف) ومزامنتها في قاعدة البيانات السحابية. هل تريد المتابعة؟`,
      async () => {
        try {
          if (backup.users) {
            for (const u of backup.users) await dbSaveUser(u);
          }
          if (backup.clients) {
            for (const c of backup.clients) await dbSaveClient(c);
          }
          if (backup.products) {
            for (const p of backup.products) await dbSaveProduct(p);
          }
          if (backup.invoices) {
            for (const inv of backup.invoices) await dbSaveInvoice(inv);
          }
          showToast('تمت استعادة كافة البيانات ومزامنتها سحابياً بنجاح!', 'success');
        } catch (err) {
          console.error(err);
          showAlert('خطأ في الاستعادة', 'حدث خطأ أثناء كتابة البيانات المستعادة إلى السحابة.');
        }
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // If user not authenticated, show LoginScreen
  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 antialiased overflow-x-hidden relative">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Confirmation & Alert Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isAlertOnly={confirmModal.isAlertOnly}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        editInvoice={editingInvoice}
        clients={clients}
        products={products}
        users={users}
        currentUser={currentUser}
        invoices={invoices}
        onClose={() => {
          setInvoiceModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={handleSaveInvoice}
        onAlert={showAlert}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={productModalOpen}
        editProduct={editingProduct}
        products={products}
        currentUser={currentUser}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Client Modal */}
      <ClientModal
        isOpen={clientModalOpen}
        editClient={editingClient}
        clients={clients}
        onClose={() => {
          setClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
      />

      {/* Users & Permissions Management Modal (Admin) */}
      <UsersManagementModal
        isOpen={usersManagementModalOpen}
        users={users}
        onClose={() => setUsersManagementModalOpen(false)}
        onSaveUser={handleSaveUser}
        onAlert={showAlert}
        onToast={showToast}
      />

      {/* Direct Commission Edit Modal */}
      <DirectCommissionModal
        isOpen={directCommModalOpen}
        seller={directCommTarget}
        onClose={() => {
          setDirectCommModalOpen(false);
          setDirectCommTarget(null);
        }}
        onSaveRate={handleDirectSaveRate}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        currentUser={currentUser}
        onClose={() => setChangePasswordModalOpen(false)}
        onSavePassword={handleSavePassword}
        onAlert={showAlert}
      />

      {/* Product Audit Modal */}
      <ProductAuditModal
        isOpen={productAuditModalOpen}
        products={products}
        onClose={() => setProductAuditModalOpen(false)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        invoicesCount={invoices.length}
        clientsCount={clients.length}
        productsCount={products.length}
        cloudSyncStatus={cloudSyncStatus}
        onSelectTab={handleSelectTab}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenUsersManagement={() => setUsersManagementModalOpen(true)}
        onOpenChangePassword={() => setChangePasswordModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto w-full">
        {/* Printable Paper Header (only visible when printing) */}
        <div className="print-page-header">
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-4">
            <div>
              <h1 className="text-xl font-black">منظومة إدارة المبيعات والفواتير الحديثة</h1>
              <p className="text-xs text-slate-500">كشف حساب وتقرير رسمي سحابي معتمد</p>
            </div>
            <div className="text-left text-xs font-mono text-slate-600">
              <div>تاريخ الطباعة: {new Date().toLocaleString('ar-EG')}</div>
              <div>طبع بواسطة: {currentUser.name} ({isAdmin ? 'المدير العام' : 'بائعة'})</div>
            </div>
          </div>
        </div>

        {/* Top Header */}
        <Header
          currentTab={currentTab}
          currentUser={currentUser}
          cloudSyncStatus={cloudSyncStatus}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenNewInvoice={() => {
            setEditingInvoice(null);
            setInvoiceModalOpen(true);
          }}
          onPrint={handlePrint}
        />

        {/* Page Content Container */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
          {/* Role & Connection Alert Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm no-print">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                أنت الآن تتصفح بحساب: <strong>{currentUser.name}</strong> -{' '}
                {isAdmin
                  ? 'لديك كامل الصلاحيات لتعديل العمولات وتخصيص القائمة ومراقبة أرباح المحل وقاعدة البيانات.'
                  : `تم تطبيق صلاحياتك المخصصة بنسبة عمولة (${currentUser.rate || 10}%).`}
              </span>
            </div>
            <span className="text-[10px] bg-indigo-200/80 text-indigo-950 px-2.5 py-0.5 rounded-lg font-bold shrink-0">
              {isAdmin ? 'صلاحيات كاملة' : 'بائعة مسؤولة'}
            </span>
          </div>

          {/* Tab 1: Invoices */}
          {currentTab === 'invoices' && (
            <InvoicesTab
              invoices={invoices}
              clients={clients}
              currentUser={currentUser}
              onOpenInvoiceModal={invoiceId => {
                if (invoiceId) {
                  const target = invoices.find(i => i.id === invoiceId);
                  setEditingInvoice(target || null);
                } else {
                  setEditingInvoice(null);
                }
                setInvoiceModalOpen(true);
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onToast={showToast}
            />
          )}

          {/* Tab 2: Seller Sales & Commission Report */}
          {currentTab === 'sellerReport' && (
            <SellerReportTab
              invoices={invoices}
              clients={clients}
              users={users}
              currentUser={currentUser}
              onOpenInvoice={invoiceId => {
                const target = invoices.find(i => i.id === invoiceId);
                setEditingInvoice(target || null);
                setInvoiceModalOpen(true);
              }}
              onOpenCommissionModal={seller => {
                setDirectCommTarget(seller);
                setDirectCommModalOpen(true);
              }}
              onToggleVerified={handleToggleVerified}
              onPrint={handlePrint}
            />
          )}

          {/* Tab 3: Custom Filtered Reports Engine */}
          {currentTab === 'customReport' && (
            <CustomReportTab
              invoices={invoices}
              clients={clients}
              products={products}
              users={users}
              onOpenInvoice={invoiceId => {
                const target = invoices.find(i => i.id === invoiceId);
                setEditingInvoice(target || null);
                setInvoiceModalOpen(true);
              }}
              onPrint={handlePrint}
              onToast={showToast}
            />
          )}

          {/* Tab 4: Client Statement Report */}
          {currentTab === 'clientReport' && (
            <ClientReportTab
              invoices={invoices}
              clients={clients}
              initialClientId={selectedClientForStatement}
              onPrint={handlePrint}
            />
          )}

          {/* Tab 5: Profit & Loss (P&L) Report */}
          {currentTab === 'profitReport' && (
            <ProfitReportTab
              invoices={invoices}
              products={products}
              users={users}
              onPrint={handlePrint}
            />
          )}

          {/* Tab 6: Clients Directory */}
          {currentTab === 'clients' && (
            <ClientsTab
              clients={clients}
              invoices={invoices}
              currentUser={currentUser}
              onOpenClientModal={clientId => {
                if (clientId) {
                  const target = clients.find(c => c.id === clientId);
                  setEditingClient(target || null);
                } else {
                  setEditingClient(null);
                }
                setClientModalOpen(true);
              }}
              onInspectStatement={handleInspectClientStatement}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {/* Tab 7: Products & Inventory */}
          {currentTab === 'products' && (
            <ProductsTab
              products={products}
              invoices={invoices}
              currentUser={currentUser}
              onOpenProductModal={productId => {
                if (productId) {
                  const target = products.find(p => p.id === productId);
                  setEditingProduct(target || null);
                } else {
                  setEditingProduct(null);
                }
                setProductModalOpen(true);
              }}
              onOpenAuditModal={() => setProductAuditModalOpen(true)}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {/* Tab 8: Backup & Excel Export */}
          {currentTab === 'backup' && isAdmin && (
            <BackupTab
              invoices={invoices}
              clients={clients}
              products={products}
              users={users}
              onRestoreData={handleRestoreFullBackup}
              onToast={showToast}
              onAlert={showAlert}
            />
          )}
        </div>
      </main>
    </div>
  );
}
