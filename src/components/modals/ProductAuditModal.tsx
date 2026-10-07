import React from 'react';
import { X, ClipboardCheck, User, Calendar } from 'lucide-react';
import { Product } from '../../types';

interface ProductAuditModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
}

export const ProductAuditModal: React.FC<ProductAuditModalProps> = ({
  isOpen,
  products,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[88vh] flex flex-col text-xs animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">سجل تدقيق ومراجعة مدخلات الأصناف</h3>
              <p className="text-[11px] text-slate-500">
                من أضاف كل صنف بالمخزن وتاريخ الإدخال وسعر البيع والتكلفة الأصلية
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-right text-xs min-w-[650px]">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">كود الصنف</th>
                  <th className="py-2.5 px-3">اسم المنتج</th>
                  <th className="py-2.5 px-3">سعر البيع</th>
                  <th className="py-2.5 px-3">سعر التكلفة</th>
                  <th className="py-2.5 px-3 text-center">الرصيد</th>
                  <th className="py-2.5 px-3">المدخل</th>
                  <th className="py-2.5 px-3">تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{p.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3 font-black text-slate-800 font-mono">
                      {Number(p.price).toFixed(2)} ج.م
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">
                      {Number(p.cost || 0).toFixed(2)} ج.م
                    </td>
                    <td className="py-2.5 px-3 font-bold text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {p.stock} قطعة
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md">
                        <User className="w-3 h-3 text-indigo-500" />
                        <span>{p.createdBy || 'محمود (المدير العام)'}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-left dir-ltr">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{p.createdAt || '-'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
