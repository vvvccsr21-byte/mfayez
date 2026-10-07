import React, { useState } from 'react';
import {
  Filter,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Search,
  ExternalLink,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Invoice, Client, Product, User } from '../../types';

interface CustomReportTabProps {
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
  users: User[];
  onOpenInvoice: (invoiceId: string) => void;
  onPrint: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CustomReportTab: React.FC<CustomReportTabProps> = ({
  invoices,
  clients,
  products,
  users,
  onOpenInvoice,
  onPrint,
  onToast,
}) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  const sellers = users.filter(u => u.role !== 'admin');

  const filtered = invoices.filter(inv => {
    if (dateFrom && !dateTo) {
      if (inv.date < dateFrom) return false;
    } else if (dateFrom && dateTo) {
      if (inv.date < dateFrom || inv.date > dateTo) return false;
    }

    if (selectedClient !== 'all' && inv.clientId !== selectedClient) return false;
    if (selectedSeller !== 'all' && inv.seller !== selectedSeller) return false;

    if (productSearch.trim()) {
      const q = productSearch.trim().toLowerCase();
      const hasMatch = (inv.items || []).some(
        it =>
          (it.name || '').toLowerCase().includes(q) ||
          (it.productId || '').toLowerCase().includes(q)
      );
      if (!hasMatch) return false;
    }

    return true;
  });

  // Calculate summary metrics
  let totalSales = 0;
  let totalCost = 0;
  let totalCommissions = 0;
  let totalPieces = 0;

  filtered.forEach(inv => {
    const invTotal = Number(inv.totalAmount) || 0;
    totalSales += invTotal;

    const sellerObj = users.find(u => u.name === inv.seller);
    const rate = sellerObj?.rate ?? 10;
    totalCommissions += (invTotal * rate) / 100;

    (inv.items || []).forEach(it => {
      const q = Number(it.qty) || 0;
      totalPieces += q;
      const pr = products.find(p => p.id === it.productId);
      const uCost = Number(it.cost) || (pr ? Number(pr.cost) : Number(it.price) * 0.6);
      totalCost += uCost * q;
    });
  });

  const netShopProfit = totalSales - totalCost - totalCommissions;

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedClient('all');
    setSelectedSeller('all');
    setProductSearch('');
  };

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      onToast('لا توجد بيانات مطابقة لتصديرها', 'info');
      return;
    }

    const rows = filtered.map(inv => {
      const client = clients.find(c => c.id === inv.clientId) || { name: 'غير معروف', phone: '-' };
      const sellerObj = users.find(u => u.name === inv.seller);
      const rate = sellerObj?.rate ?? 10;
      const comm = ((Number(inv.totalAmount) || 0) * rate) / 100;

      let invCost = 0;
      (inv.items || []).forEach(it => {
        const pr = products.find(p => p.id === it.productId);
        const uCost = Number(it.cost) || (pr ? Number(pr.cost) : Number(it.price) * 0.6);
        invCost += uCost * (Number(it.qty) || 0);
      });
      const invNet = (Number(inv.totalAmount) || 0) - invCost - comm;
      const itemsStr = (inv.items || []).map(it => `${it.name} (${it.qty})`).join(', ');

      return {
        'رقم الفاتورة': inv.id,
        'التاريخ': inv.date,
        'العميل': client.name,
        'الهاتف': client.phone,
        'البائعة': inv.seller,
        'طريقة الدفع': inv.paymentMethod,
        'المنتجات المباعة': itemsStr,
        'إجمالي الفاتورة': Number(inv.totalAmount).toFixed(2),
        'العمولة المستحقة': comm.toFixed(2),
        'صافي ربح المحل': invNet.toFixed(2),
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقرير المبيعات المفلتر');
    XLSX.writeFile(wb, `Sales_Filtered_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('تم تصدير التقرير إلى إكسل بنجاح', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Control Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-teal-600" />
              <span>محرك التقارير المتقدم والفلترة الشاملة</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              فلترة المبيعات بالتاريخ، العميل، البائعة، أو بالبحث عن كود أو اسم الصنف
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير إكسل</span>
            </button>
            <button
              onClick={onPrint}
              className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">من تاريخ:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">إلى تاريخ:</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">تصفية بعميل:</label>
            <select
              value={selectedClient}
              onChange={e => setSelectedClient(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold"
            >
              <option value="all">جميع العملاء ({clients.length})</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">تصفية ببائعة:</label>
            <select
              value={selectedSeller}
              onChange={e => setSelectedSeller(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold"
            >
              <option value="all">جميع البائعات ({sellers.length})</option>
              {sellers.map(s => (
                <option key={s.username} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">بحث بكود أو اسم الصنف:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="مثال: P-00001 أو ساعة..."
                className="w-full pl-2 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
            تم العثور على: <strong>{filtered.length}</strong> فاتورة
          </span>
          <button
            onClick={handleReset}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تفريغ الفلاتر</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold">عدد الفواتير</p>
          <h3 className="text-xl font-black text-indigo-600 mt-0.5 font-mono">{filtered.length}</h3>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold">القطع المباعة</p>
          <h3 className="text-xl font-black text-slate-800 mt-0.5 font-mono">{totalPieces} قطعة</h3>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold">إجمالي المبيعات</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-slate-900 font-mono">{totalSales.toFixed(2)}</span>
            <span className="text-[9px] text-slate-500 font-bold">ج.م</span>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl shadow-sm">
          <p className="text-[10px] text-amber-800 font-bold">العمولات المستحقة</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-amber-900 font-mono">{totalCommissions.toFixed(2)}</span>
            <span className="text-[9px] text-amber-700 font-bold">ج.م</span>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[10px] text-emerald-800 font-bold">صافي أرباح المحل</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-emerald-900 font-mono">{netShopProfit.toFixed(2)}</span>
            <span className="text-[9px] text-emerald-700 font-bold">ج.م</span>
          </div>
        </div>
      </div>

      {/* Filtered Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[750px]">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">رقم الفاتورة</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">العميل</th>
                <th className="py-2.5 px-3">البائعة</th>
                <th className="py-2.5 px-3">الأصناف المباعة</th>
                <th className="py-2.5 px-3 text-center">طريقة الدفع</th>
                <th className="py-2.5 px-3 font-black">إجمالي الفاتورة</th>
                <th className="py-2.5 px-3 font-bold text-amber-700">العمولة</th>
                <th className="py-2.5 px-3 font-black text-emerald-700">صافي الربح</th>
                <th className="py-2.5 px-3 text-center no-print">عرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400 font-bold">
                    لا توجد فواتير تطابق شروط الفلترة المحددة.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => {
                  const client = clients.find(c => c.id === inv.clientId) || { name: 'غير معروف' };
                  const sellerObj = users.find(u => u.name === inv.seller);
                  const rate = sellerObj?.rate ?? 10;
                  const comm = ((Number(inv.totalAmount) || 0) * rate) / 100;

                  let invCost = 0;
                  (inv.items || []).forEach(it => {
                    const pr = products.find(p => p.id === it.productId);
                    const uCost = Number(it.cost) || (pr ? Number(pr.cost) : Number(it.price) * 0.6);
                    invCost += uCost * (Number(it.qty) || 0);
                  });
                  const invNet = (Number(inv.totalAmount) || 0) - invCost - comm;
                  const itemsStr = (inv.items || []).map(it => `${it.name} (${it.qty})`).join(', ');

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition border-b">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{inv.id}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{inv.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{client.name}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{inv.seller}</td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={itemsStr}>
                        {itemsStr}
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
                      <td className="py-2.5 px-3 font-black text-slate-900 font-mono">
                        {Number(inv.totalAmount).toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-700 font-mono">
                        {comm.toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 font-black text-emerald-700 font-mono">
                        {invNet.toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <button
                          onClick={() => onOpenInvoice(inv.id)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
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
