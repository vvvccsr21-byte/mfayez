import React, { useState, useEffect } from 'react';
import { X, Box, Check } from 'lucide-react';
import { Product, User } from '../../types';
import { generateNextCode } from '../../services/db';

interface ProductModalProps {
  isOpen: boolean;
  editProduct: Product | null;
  products: Product[];
  currentUser: User | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  editProduct,
  products,
  currentUser,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(20);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        setCode(editProduct.id);
        setName(editProduct.name);
        setPrice(editProduct.price);
        setCost(editProduct.cost);
        setStock(editProduct.stock);
        setNotes(editProduct.notes || '');
      } else {
        setCode(generateNextCode('P-', products));
        setName('');
        setPrice('');
        setCost('');
        setStock(20);
        setNotes('');
      }
    }
  }, [isOpen, editProduct, products]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const parsedPrice = Number(price) || 0;
    const parsedCost = Number(cost) || parsedPrice * 0.6;
    const parsedStock = Number(stock) || 0;

    const prodData: Product = {
      id: code,
      name: name.trim(),
      price: parsedPrice,
      cost: parsedCost,
      stock: parsedStock,
      notes: notes.trim(),
      createdBy: editProduct?.createdBy || currentUser?.name || 'محمود (المدير العام)',
      createdAt: editProduct?.createdAt || dateStr,
    };

    onSave(prodData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 no-print">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 p-5 space-y-4 text-xs animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              {editProduct ? `تعديل الصنف: ${editProduct.name}` : 'إضافة منتج جديد للمخزن'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1 text-slate-600">كود المنتج (تلقائي):</label>
            <input
              type="text"
              value={code}
              readOnly
              className="w-full bg-slate-100 font-mono font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-600">اسم المنتج / الصنف:</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: ساعة يد رجالي فاخرة..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold mb-1 text-slate-600">سعر البيع (ج.م):</label>
              <input
                type="number"
                step="0.5"
                required
                value={price}
                onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="250.00"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-600">سعر التكلفة (ج.م):</label>
              <input
                type="number"
                step="0.5"
                value={cost}
                onChange={e => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="150.00"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-amber-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-600">الرصيد المتاح بالمخزن:</label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-600">ملاحظات إضافية:</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="وصف أو تفاصيل الصنف..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ الصنف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
