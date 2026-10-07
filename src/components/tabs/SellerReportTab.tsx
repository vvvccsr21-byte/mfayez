import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Printer,
  Check,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Invoice, Client, User } from '../../types';

interface SellerReportTabProps {
  invoices: Invoice[];
  clients: Client[];
  users: User[];
  currentUser: User | null;
  onOpenInvoice: (invoiceId: string) => void;
  onOpenCommissionModal: (seller: User) => void;
  onToggleVerified: (seller: User) => void;
  onPrint: () => void;
}

export const SellerReportTab: React.FC<SellerReportTabProps> = ({
  invoices,
  clients,
  users,
  currentUser,
  onOpenInvoice,
  onOpenCommissionModal,
  onToggleVerified,
  onPrint,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const sellers = users.filter(u => u.role !== 'admin');

  const [selectedSellerName, setSelectedSellerName] = useState<string>(
    isAdmin ? sellers[0]?.name || '' : currentUser?.name || ''
  );

  useEffect(() => {
    if (!isAdmin && currentUser) {
      setSelectedSellerName(currentUser.name);
    } else if (isAdmin && (!selectedSellerName || !sellers.some(s => s.name === selectedSellerName))) {
      if (sellers.length > 0) setSelectedSellerName(sellers[0].name);
    }
  }, [isAdmin, currentUser, sellers, selectedSellerName]);

  const targetSeller = users.find(u => u.name === selectedSellerName);
  const sellerRate = targetSeller?.rate ?? 10;
  const sellerInvoices = invoices.filter(i => i.seller === selectedSellerName);

  const totalSales = sellerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalCommission = (totalSales * sellerRate) / 100;

  return (
    <div className="space-y-4">
      {/* Header & Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm no-print space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>
                {isAdmin
                  ? 'تقارير أداء ومبيعات البائعات (Sales Account)'
                  : `حسابي ومبيعاتي الشخصية (${currentUser?.name})`}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              كشف حساب تفصيلي: لمن باعت، وتاريخ العملية، والمنتجات، وقيمة العمولة المستحقة
            </p>
          </div>
          <button
            onClick={onPrint}
            className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الحساب</span>
          </button>
        </div>

        {/* Admin Selector */}
        {isAdmin ? (
          <div className="max-w-md">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              اختر البائعة لعرض تقريرها ومبيعاتها:
            </label>
            <select
              value={selectedSellerName}
              onChange={e => setSelectedSellerName(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold"
            >
              {sellers.map(s => (
                <option key={s.username} value={s.name}>
                  {s.name} (@{s.username}) - عمولة: {s.rate}% {s.verified ? '✓ موثقة' : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>أنتِ الآن تستعرضين مبيعاتك الخاصة والعمولة المستحقة لكِ فقط.</span>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Rep Card */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block">اسم البائعة</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 truncate">
              {selectedSellerName || '-'}
            </span>
            {targetSeller?.verified && (
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500 text-white shadow-sm shrink-0"
                title="حساب موثق رسمياً"
              >
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-indigo-600 font-bold">
              العمولة: {sellerRate}%
            </span>
            {isAdmin && targetSeller && (
              <button
                type="button"
                onClick={() => onOpenCommissionModal(targetSeller)}
                className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1"
                title="تعديل نسبة العمولة للبائعة"
              >
                <Edit2 className="w-2.5 h-2.5" />
                <span>تعديل</span>
              </button>
            )}
          </div>

          {isAdmin && targetSeller && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onToggleVerified(targetSeller)}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>{targetSeller.verified ? 'إلغاء التوثيق' : 'توثيق الحساب (علامة زرقاء)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Invoices Count */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block">الفواتير المنفذة</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">
            {sellerInvoices.length}
          </span>
          <span className="text-[10px] text-slate-400">عملية بيع مسجلة</span>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block">إجمالي المبيعات</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {totalSales.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400">قيمة الفواتير المنفذة</span>
        </div>

        {/* Net Commission */}
        <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl shadow-md shadow-emerald-600/10 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-emerald-100 font-bold block">إجمالي العمولة المستحقة</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-white font-mono">
              {totalCommission.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-200 font-bold">ج.م</span>
          </div>
          <span className="text-[10px] text-emerald-100 mt-1 block">
            صافي مستحقات البائعة ({sellerRate}%)
          </span>
        </div>
      </div>

      {/* Seller Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
          <span>تفاصيل العمليات المنجزة: لمن باعت وبكم؟ (اضغط على الفاتورة لفتحها)</span>
          <span className="text-indigo-600">{sellerInvoices.length} فواتير</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">رقم الفاتورة</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">اسم العميل</th>
                <th className="py-2.5 px-3">هاتف العميل</th>
                <th className="py-2.5 px-3 text-center">طريقة الدفع</th>
                <th className="py-2.5 px-3">المنتجات المباعة</th>
                <th className="py-2.5 px-3 font-black">إجمالي الفاتورة</th>
                <th className="py-2.5 px-3 font-bold text-emerald-700">قيمة العمولة</th>
                <th className="py-2.5 px-3 text-center no-print">عرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellerInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    لا توجد فواتير أو مبيعات مسجلة للبائعة ({selectedSellerName}) حالياً.
                  </td>
                </tr>
              ) : (
                sellerInvoices.map(inv => {
                  const client = clients.find(c => c.id === inv.clientId) || {
                    name: 'غير معروف',
                    phone: '-',
                  };
                  const comm = ((Number(inv.totalAmount) || 0) * sellerRate) / 100;
                  const itemsSummary = (inv.items || [])
                    .map(it => `${it.name} (${it.qty})`)
                    .join(', ');

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition border-b">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        <button
                          onClick={() => onOpenInvoice(inv.id)}
                          className="flex items-center gap-1 hover:underline text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{inv.id}</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{inv.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{client.name}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono dir-ltr text-right">
                        {client.phone}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inv.paymentMethod === 'نقدي'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td
                        className="py-2.5 px-3 text-slate-600 max-w-xs truncate"
                        title={itemsSummary}
                      >
                        {itemsSummary || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-900 font-mono">
                        {Number(inv.totalAmount).toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 font-black text-emerald-700 font-mono">
                        {comm.toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <button
                          onClick={() => onOpenInvoice(inv.id)}
                          className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>عرض</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
