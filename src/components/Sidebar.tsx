import React from 'react';
import {
  FileText,
  TrendingUp,
  Filter,
  UserCheck,
  Coins,
  Users,
  Boxes,
  Database,
  UsersRound,
  LogOut,
  KeyRound,
  Check,
  X,
  Cloud,
} from 'lucide-react';
import { TabType, User } from '../types';

interface SidebarProps {
  currentTab: TabType;
  currentUser: User | null;
  isOpen: boolean;
  invoicesCount: number;
  clientsCount: number;
  productsCount: number;
  cloudSyncStatus: 'connected' | 'syncing' | 'offline';
  onSelectTab: (tab: TabType) => void;
  onCloseMobile: () => void;
  onOpenUsersManagement: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  currentUser,
  isOpen,
  invoicesCount,
  clientsCount,
  productsCount,
  cloudSyncStatus,
  onSelectTab,
  onCloseMobile,
  onOpenUsersManagement,
  onOpenChangePassword,
  onLogout,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const perms = currentUser?.permissions || {};

  const navItems = [
    {
      id: 'invoices' as TabType,
      label: 'الفواتير والأوردرات',
      icon: FileText,
      badge: invoicesCount,
      visible: isAdmin || (perms.showInvoicesTab ?? true),
      badgeColor: 'bg-indigo-700 text-white',
    },
    {
      id: 'sellerReport' as TabType,
      label: isAdmin ? 'حسابات ومبيعات البائعات' : 'حسابي ومبيعاتي والعمولة',
      icon: TrendingUp,
      visible: isAdmin || (perms.showSellerReportTab ?? true),
      iconColor: 'text-emerald-400',
    },
    {
      id: 'customReport' as TabType,
      label: 'التقارير وفلترة المبيعات',
      icon: Filter,
      visible: isAdmin || (perms.showCustomReportTab ?? false),
      badgeText: 'مخصص',
      iconColor: 'text-teal-400',
    },
    {
      id: 'clientReport' as TabType,
      label: 'كشف حساب العميل',
      icon: UserCheck,
      visible: isAdmin || (perms.showClientReportTab ?? false),
    },
    {
      id: 'profitReport' as TabType,
      label: 'الأرباح والخسائر والعمولات',
      icon: Coins,
      visible: isAdmin || (perms.showProfitTab ?? false),
      iconColor: 'text-amber-400',
    },
    {
      id: 'clients' as TabType,
      label: 'سجل العملاء',
      icon: Users,
      badge: clientsCount,
      visible: isAdmin || (perms.showClientsTab ?? false),
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      id: 'products' as TabType,
      label: 'المنتجات والمخزون',
      icon: Boxes,
      badge: productsCount,
      visible: isAdmin || (perms.showProductsTab ?? false),
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      id: 'backup' as TabType,
      label: 'النسخ الاحتياطي وتصدير إكسل',
      icon: Database,
      visible: isAdmin,
      badgeText: 'Excel/JSON',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-2xl z-50 border-l border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:h-screen no-print ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & Logo */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                  منظومة المبيعات
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-emerald-300 font-bold truncate">قاعدة بيانات سحابية</p>
                </div>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="md:hidden w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current User Card */}
          <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">
                      {currentUser?.name || '-'}
                    </span>
                    {currentUser?.verified && (
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[8px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {isAdmin ? 'المدير العام (Admin)' : `بائعة (${currentUser?.rate || 10}%)`}
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenChangePassword}
                title="تغيير كلمة المرور الخاصة بك"
                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-700/50 rounded-lg transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cloud Status */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Cloud className="w-3 h-3 text-sky-400" />
                <span>المزامنة السحابية:</span>
              </span>
              <span className="text-emerald-400 font-bold">
                {cloudSyncStatus === 'connected' ? 'متصل ومحدث' : cloudSyncStatus === 'syncing' ? 'جاري التحديث...' : 'متصل محلياً'}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map(item => {
              if (!item.visible) return null;
              const isActive = currentTab === item.id;
              const IconComp = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                    isActive
                      ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 shrink-0 ${item.iconColor || ''}`} />
                    <span>{item.label}</span>
                  </div>

                  {typeof item.badge === 'number' && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.badgeText && (
                    <span className="bg-teal-500/20 text-teal-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                      {item.badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Controls */}
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
            {isAdmin && (
              <button
                onClick={onOpenUsersManagement}
                className="w-full py-2 px-3 rounded-xl bg-indigo-900/60 hover:bg-indigo-900 text-xs font-bold text-indigo-200 flex items-center justify-center gap-2 border border-indigo-700/60 transition shadow"
              >
                <UsersRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>إدارة الحسابات والصلاحيات</span>
              </button>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onLogout}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
              <span className="text-[10px] text-slate-500 font-mono">v8.5 Firestore</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
