import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ClipboardCheck,
  Edit,
  Trash2,
  Search,
  User as UserIcon,
} from 'lucide-react';
import { Product, Invoice, User } from '../../types';

interface ProductsTabProps {
  products: Product[];
  invoices: Invoice[];
  currentUser: User | null;
  onOpenProductModal: (productId?: string) => void;
  onOpenAuditModal: () => void;
  onDeleteProduct: (product: Product) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  invoices,
  currentUser,
  onOpenProductModal,
  onOpenAuditModal,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const perms = currentUser?.permissions || {};
  const canEdit = isAdmin || perms.canEditProducts;

  const filteredProducts = products.filter(p => {
    const q = search.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث باسم الصنف أو الكود..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onOpenAuditModal}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>سجل التدقيق</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onOpenProductModal()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
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
                <th className="py-3 px-3">كود المنتج</th>
                <th className="py-3 px-3">اسم المنتج</th>
                <th className="py-3 px-3 font-black text-slate-900">سعر البيع</th>
                {isAdmin && <th className="py-3 px-3 font-bold text-slate-500">سعر التكلفة</th>}
                <th className="py-3 px-3 text-center">الرصيد بالمخزن</th>
                <th className="py-3 px-3 text-center">المباع</th>
                <th className="py-3 px-3">أضيف بواسطة</th>
                <th className="py-3 px-3">ملاحظات</th>
                <th className="py-3 px-3 text-center no-print">تعديل</th>
                {isAdmin && <th className="py-3 px-3 text-center no-print">حذف</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-xs text-slate-600">لا توجد منتجات تطابق البحث</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  let soldCount = 0;
                  invoices.forEach(inv => {
                    (inv.items || []).forEach(it => {
                      if (it.productId === p.id) soldCount += Number(it.qty) || 0;
                    });
                  });

                  const stock = Number(p.stock) || 0;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= 5;
                  const dateStr = p.createdAt ? p.createdAt.split(' ')[0] : '-';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition border-b">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{p.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{p.name}</td>
                      <td className="py-2.5 px-3 font-black text-slate-900 font-mono">
                        {Number(p.price).toFixed(2)} ج.م
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 font-bold text-amber-700 font-mono">
                          {Number(p.cost || 0).toFixed(2)} ج.م
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {stock} قطعة {isOutOfStock ? '(منتهي)' : isLowStock ? '(منخفض)' : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                        {soldCount} قطعة
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md">
                          <UserIcon className="w-3 h-3 text-indigo-500" />
                          <span>{p.createdBy || 'محمود (المدير العام)'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {dateStr}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{p.notes || '-'}</td>
                      <td className="py-2.5 px-3 text-center no-print">
                        {canEdit ? (
                          <button
                            onClick={() => onOpenProductModal(p.id)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
                          >
                            <Edit className="w-3 h-3" />
                            <span>تعديل</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">عرض فقط</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-center no-print">
                          <button
                            onClick={() => onDeleteProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
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
