import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Printer,
  Search,
  Receipt,
} from 'lucide-react';
import { Invoice, Client } from '../../types';

interface ClientReportTabProps {
  invoices: Invoice[];
  clients: Client[];
  initialClientId?: string;
  onPrint: () => void;
}

export const ClientReportTab: React.FC<ClientReportTabProps> = ({
  invoices,
  clients,
  initialClientId,
  onPrint,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || clients[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId);
    } else if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialClientId, clients, selectedClientId]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();
    if (!q) return;
    const match = clients.find(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q)
    );
    if (match) {
      setSelectedClientId(match.id);
    }
  };

  const client = clients.find(c => c.id === selectedClientId);
  const clientInvoices = invoices.filter(i => i.clientId === selectedClientId);

  let totalAmount = 0;
  let cashTotal = 0;
  let creditTotal = 0;

  clientInvoices.forEach(inv => {
    const amt = Number(inv.totalAmount) || 0;
    totalAmount += amt;
    if (inv.paymentMethod === 'نقدي') cashTotal += amt;
    else creditTotal += amt;
  });

  return (
    <div className="space-y-4">
      {/* Header & Client Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm no-print space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>تقرير وكشف حساب مشتريات العميل</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              اختر العميل لعرض ما اشتراه بالتفصيل، إجمالي المسدد نقداً، والمتبقي آجل على حسابه
            </p>
          </div>
          <button
            onClick={onPrint}
            className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف الحساب</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              اختر العميل من القائمة:
            </label>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold"
            >
              <option value="">-- اضغط لاختيار اسم العميل --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {c.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              بحث سريع باسم العميل أو رقم الهاتف:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="ابحث بالاسم أو الهاتف مباشرة..."
                className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {client ? (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-[10px] text-slate-400 font-bold">العميل</p>
              <h3 className="text-sm font-black text-slate-900 mt-0.5 truncate">{client.name}</h3>
              <span className="text-[10px] text-slate-500 block font-mono dir-ltr text-right">
                {client.phone}
              </span>
              <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                {client.address || 'بدون عنوان مسجل'}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold">عدد الفواتير</p>
              <h3 className="text-xl font-black text-indigo-600 mt-0.5 font-mono">
                {clientInvoices.length}
              </h3>
              <span className="text-[10px] text-slate-400">عملية شراء</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold">إجمالي المشتريات</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900 font-mono">
                  {totalAmount.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-500 font-bold">ج.م</span>
              </div>
              <span className="text-[10px] text-slate-400">المجموع الكلي</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl shadow-sm">
              <p className="text-[10px] text-emerald-700 font-bold">المدفوع نقداً</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-emerald-800 font-mono">
                  {cashTotal.toFixed(2)}
                </span>
                <span className="text-[9px] text-emerald-600 font-bold">ج.م</span>
              </div>
              <span className="text-[10px] text-emerald-600">كاش مسدد</span>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
              <p className="text-[10px] text-rose-700 font-bold">المتبقي آجل</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-rose-800 font-mono">
                  {creditTotal.toFixed(2)}
                </span>
                <span className="text-[9px] text-rose-600 font-bold">ج.م</span>
              </div>
              <span className="text-[10px] text-rose-600">مستحق على الحساب</span>
            </div>
          </div>

          {/* Orders Itemized List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
              <span>سجل فواتير العميل وتفاصيل الأصناف المشتراة</span>
              <span className="text-indigo-600">{clientInvoices.length} فواتير</span>
            </div>

            <div className="p-4 space-y-3">
              {clientInvoices.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد فواتير أو مشتريات مسجلة لهذا العميل حتى الآن.
                </div>
              ) : (
                clientInvoices.map(inv => {
                  const isCash = inv.paymentMethod === 'نقدي';
                  return (
                    <div
                      key={inv.id}
                      className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-sm space-y-2.5 hover:border-indigo-200 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {inv.id}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{inv.date}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCash
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.paymentMethod}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inv.status === 'مفتوحة'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            البائعة: <strong>{inv.seller}</strong>
                          </span>
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {Number(inv.totalAmount).toFixed(2)} ج.م
                          </span>
                        </div>
                      </div>

                      {/* Items table for this invoice */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs min-w-[350px]">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-100 font-bold">
                              <th className="py-1">الصنف</th>
                              <th className="py-1">سعر القطعة</th>
                              <th className="py-1 text-center">الكمية</th>
                              <th className="py-1 text-left">الإجمالي</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-700">
                            {(inv.items || []).map((it, idx) => (
                              <tr key={idx}>
                                <td className="py-1.5 font-bold text-slate-800">{it.name}</td>
                                <td className="py-1.5 font-mono text-slate-600">
                                  {Number(it.price).toFixed(2)} ج.م
                                </td>
                                <td className="py-1.5 font-bold text-center">{it.qty}</td>
                                <td className="py-1.5 font-black font-mono text-left text-slate-900">
                                  {Number(it.total).toFixed(2)} ج.م
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-700">لم يتم اختيار عميل بعد</p>
          <p className="text-[10px] text-slate-400 mt-1">اختر عميلاً من القائمة لعرض كشف حسابه</p>
        </div>
      )}
    </div>
  );
};
