import React, { useState, useEffect } from 'react';
import { X, Percent, Check } from 'lucide-react';
import { User } from '../../types';

interface DirectCommissionModalProps {
  isOpen: boolean;
  seller: User | null;
  onClose: () => void;
  onSaveRate: (username: string, newRate: number) => void;
}

export const DirectCommissionModal: React.FC<DirectCommissionModalProps> = ({
  isOpen,
  seller,
  onClose,
  onSaveRate,
}) => {
  const [rate, setRate] = useState<number>(10);

  useEffect(() => {
    if (isOpen && seller) {
      setRate(seller.rate ?? 10);
    }
  }, [isOpen, seller]);

  if (!isOpen || !seller) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRate(seller.username, Number(rate) || 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 no-print">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 p-5 space-y-4 text-xs animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">تعديل نسبة عمولة البائعة</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <span className="text-slate-500 block mb-0.5">اسم البائعة:</span>
            <span className="font-black text-slate-900 text-sm block">{seller.name}</span>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-600">نسبة العمولة الجديدة (%):</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              required
              value={rate}
              onChange={e => setRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-emerald-700 text-base outline-none text-center focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              <span>حفظ النسبة فوراً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
