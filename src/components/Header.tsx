import React from 'react';
import { Menu, Printer, Plus, Cloud } from 'lucide-react';
import { TabType, User } from '../types';

interface HeaderProps {
  currentTab: TabType;
  currentUser: User | null;
  cloudSyncStatus: 'connected' | 'syncing' | 'offline';
  onToggleSidebar: () => void;
  onOpenNewInvoice: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  cloudSyncStatus,
  onToggleSidebar,
  onOpenNewInvoice,
  onPrint,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const perms = currentUser?.permissions || {};
  const canCreate = isAdmin || (perms.canCreateInvoice ?? true);

  const titles: Record<TabType, { title: string; subtitle: string }> = {
    invoices: {
      title: 'الفواتير والأوردرات',
      subtitle: 'لوحة المتابعة المباشرة والمبيعات الشاملة',
    },
    sellerReport: {
      title: isAdmin ? 'تقارير أداء ومبيعات البائعات' : `حسابي ومبيعاتي والعمولة (${currentUser?.name})`,
      subtitle: 'كشف حساب تفصيلي بالمبيعات ونسب العمولات المحققة',
    },
    customReport: {
      title: 'التقارير وفلترة المبيعات',
      subtitle: 'فلترة دقيقة للتاريخ والعملاء والأصناف',
    },
    clientReport: {
      title: 'كشف حساب مشتريات العميل',
      subtitle: 'سجل فواتير العميل وتفاصيل المسدد نقداً والآجل',
    },
    profitReport: {
      title: 'الأرباح والخسائر والعمولات',
      subtitle: 'إجمالي المبيعات، تكلفة الجملة، ومكاسب المحل الصافية',
    },
    clients: {
      title: 'سجل العملاء',
      subtitle: 'دليل بيانات العملاء والتواصل وكشوفات الحساب',
    },
    products: {
      title: 'المنتجات والمخزون',
      subtitle: 'أرصدة الأصناف بالمخزن وأسعار البيع والتكلفة',
    },
    backup: {
      title: 'النسخ الاحتياطي وتصدير إكسل',
      subtitle: 'تصدير شيتات الإكسل وحفظ النسخ الاحتياطية السحابية',
    },
  };

  const currentInfo = titles[currentTab] || {
    title: 'منظومة المبيعات',
    subtitle: 'نظام إدارة الفواتير والمخزون',
  };

  return (
    <header className="bg-white border-b border-slate-200 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30 no-print">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="تبديل القائمة"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 flex items-center justify-center transition shadow-sm md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-black text-slate-900 leading-tight">
            {currentInfo.title}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">
            {currentInfo.subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Cloud database status badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          <span>قاعدة بيانات Firestore: {cloudSyncStatus === 'connected' ? 'متصلة ومحدثة' : 'جاري المزامنة...'}</span>
        </div>

        <button
          onClick={onPrint}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">طباعة نظيفة</span>
        </button>

        {canCreate && (
          <button
            onClick={onOpenNewInvoice}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>فاتورة جديدة</span>
          </button>
        )}
      </div>
    </header>
  );
};
