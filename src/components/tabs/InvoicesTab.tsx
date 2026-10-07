import React, { useState } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Receipt,
  Edit,
  Trash2,
  Lock,
  User as UserIcon,
  CheckCircle,
  Clock,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Invoice, Client, User } from '../../types';

interface InvoicesTabProps {
  invoices: Invoice[];
  clients: Client[];
  currentUser: User | null;
  onOpenInvoiceModal: (invoiceId?: string) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  invoices,
  clients,
  currentUser,
  onOpenInvoiceModal,
  onDeleteInvoice,
  onToast,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const isAdmin = currentUser?.role === 'admin';
  const perms = currentUser?.permissions || {};

  const filteredInvoices = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId) || { name: '', phone: '' };
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      inv.id.toLowerCase().includes(q) ||
      client.name.toLowerCase().includes(q) ||
      client.phone.includes(q) ||
      (inv.seller || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || inv.paymentMethod === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  const exportToExcel = () => {
    if (filteredInvoices.length === 0) {
      onToast('لا توجد فواتير لتصديرها', 'info');
      return;
    }

    const rows = filteredInvoices.map(inv => {
      const client = clients.find(c => c.id === inv.clientId) || { name: 'غير معروف', phone: '-' };
      const totalPieces = (inv.items || []).reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
      const itemsDetail = (inv.items || []).map(it => `${it.name} (${it.qty} × ${it.price})`).join(' | ');

      return {
        'رقم الفاتورة': inv.id,
        'التاريخ': inv.date,
        'اسم العميل': client.name,
        'هاتف العميل': client.phone,
        'البائعة المسؤولة': inv.seller,
        'طريقة الدفع': inv.paymentMethod,
        'حالة الفاتورة': inv.status,
        'إجمالي الأصناف': totalPieces,
        'إجمالي الفاتورة (ج.م)': Number(inv.totalAmount).toFixed(2),
        'تفاصيل المنتجات': itemsDetail,
        'ملاحظات': inv.notes || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الفواتير والأوردرات');
    XLSX.writeFile(wb, `Invoices_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('تم تصدير ملف الإكسل بنجاح', 'success');
  };

  // Quick stats
  const totalAmountSum = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const openCount = filteredInvoices.filter(i => i.status === 'مفتوحة').length;
  const closedCount = filteredInvoices.filter(i => i.status === 'مغلقة').length;

  return (
    <div className="space-y-4">
      {/* Quick Stat Pill Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">إجمالي الفواتير</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{filteredInvoices.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">قيمة المبيعات</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 font-mono">{totalAmountSum.toFixed(2)}</span>
              <span className="text-[10px] text-slate-500 font-bold">ج.م</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ج.م
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-600 font-bold block">فواتير مفتوحة (مسودة)</span>
            <span className="text-xl font-black text-amber-700 mt-0.5 block">{openCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-600 font-bold block">فواتير معتمدة (مغلقة)</span>
            <span className="text-xl font-black text-emerald-700 mt-0.5 block">{closedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث برقم الفاتورة، العميل، الهاتف، أو البائعة..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 focus:bg-white transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold"
          >
            <option value="all">كل الحالات</option>
            <option value="مفتوحة">فواتير مفتوحة</option>
            <option value="مغلقة">فواتير مغلقة</option>
          </select>

          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold"
          >
            <option value="all">كل طرق الدفع</option>
            <option value="نقدي">نقدي (كاش)</option>
            <option value="آجل">آجل (مؤجل)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير فواتير إكسل</span>
          </button>

          {(isAdmin || perms.canCreateInvoice) && (
            <button
              onClick={() => onOpenInvoiceModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>فاتورة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-3">رقم الفاتورة</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">العميل</th>
                <th className="py-3 px-3">الهاتف</th>
                <th className="py-3 px-3">البائعة</th>
                <th className="py-3 px-3 text-center">طريقة الدفع</th>
                <th className="py-3 px-3 text-center">عدد الأصناف</th>
                <th className="py-3 px-3 font-black">إجمالي الفاتورة</th>
                <th className="py-3 px-3 text-center">حالة الفاتورة</th>
                <th className="py-3 px-3 text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-xs text-slate-600">لا توجد فواتير تطابق شروط البحث والفلترة</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const client = clients.find(c => c.id === inv.clientId) || {
                    name: 'غير معروف',
                    phone: '-',
                  };
                  const totalItemsCount = (inv.items || []).reduce(
                    (sum, item) => sum + (Number(item.qty) || 0),
                    0
                  );
                  const isOpen = inv.status === 'مفتوحة';
                  const isCash = inv.paymentMethod === 'نقدي';
                  const canEdit =
                    isAdmin ||
                    inv.seller === currentUser?.name ||
                    perms.canEditOthersInvoices;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition border-b">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {inv.id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {inv.date}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{client.name}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-right dir-ltr">
                        {client.phone}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                          <UserIcon className="w-3 h-3 text-indigo-500" />
                          <span>{inv.seller}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCash
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                        <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md text-[11px]">
                          {totalItemsCount} قطعة
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-900 font-mono text-xs">
                        {Number(inv.totalAmount).toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isOpen
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit ? (
                            <button
                              onClick={() => onOpenInvoiceModal(inv.id)}
                              title="تعديل الفاتورة"
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>تعديل</span>
                            </button>
                          ) : (
                            <span
                              title="فاتورة بائعة أخرى"
                              className="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-semibold cursor-not-allowed flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3" />
                              <span>خاص</span>
                            </span>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => onDeleteInvoice(inv)}
                              title="حذف الفاتورة"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
