import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, FileText, Check, AlertCircle } from 'lucide-react';
import { Invoice, InvoiceItem, Client, Product, User } from '../../types';
import { generateNextCode } from '../../services/db';

interface InvoiceModalProps {
  isOpen: boolean;
  editInvoice: Invoice | null;
  clients: Client[];
  products: Product[];
  users: User[];
  currentUser: User | null;
  invoices: Invoice[];
  onClose: () => void;
  onSave: (invoice: Invoice, oldInvoice?: Invoice) => void;
  onAlert: (title: string, message: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  editInvoice,
  clients,
  products,
  users,
  currentUser,
  invoices,
  onClose,
  onSave,
  onAlert,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const [code, setCode] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'آجل'>('نقدي');
  const [status, setStatus] = useState<'مفتوحة' | 'مغلقة'>('مفتوحة');
  const [clientId, setClientId] = useState('');
  const [seller, setSeller] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editInvoice) {
        setCode(editInvoice.id);
        setDate(editInvoice.date);
        setPaymentMethod(editInvoice.paymentMethod);
        setStatus(editInvoice.status);
        setClientId(editInvoice.clientId);
        setSeller(editInvoice.seller);
        setNotes(editInvoice.notes || '');
        setItems(JSON.parse(JSON.stringify(editInvoice.items || [])));
      } else {
        const nextCode = generateNextCode('ORD-', invoices);
        setCode(nextCode);
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('نقدي');
        setStatus('مفتوحة');
        setClientId(clients[0]?.id || '');
        setSeller(isAdmin ? users.find(u => u.role !== 'admin')?.name || currentUser?.name || 'Madonna' : currentUser?.name || '');
        setNotes('');
        setItems([]);
      }
      setQuickSearch('');
      setShowSearchResults(false);
    }
  }, [isOpen, editInvoice, clients, invoices, currentUser, isAdmin, users]);

  if (!isOpen) return null;

  const selectedClient = clients.find(c => c.id === clientId);

  const filteredQuickProducts = quickSearch.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
          p.id.toLowerCase().includes(quickSearch.toLowerCase())
      )
    : [];

  const handleQuickAddProduct = (prod: Product) => {
    const stock = Number(prod.stock) || 0;
    if (stock <= 0) {
      onAlert('الصنف غير متوفر', `الصنف "<strong>${prod.name}</strong>" رصيده 0 حالياً ولا يمكن إضافته.`);
      return;
    }

    const existingIndex = items.findIndex(it => it.productId === prod.id);
    if (existingIndex !== -1) {
      const currentQty = items[existingIndex].qty;
      if (currentQty + 1 > stock) {
        onAlert('تجاوز الرصيد المتاح', `الرصيد المتاح بالمخزن لهذا الصنف هو (${stock} قطعة) فقط.`);
        return;
      }
      const updated = [...items];
      updated[existingIndex].qty += 1;
      updated[existingIndex].total = updated[existingIndex].qty * updated[existingIndex].price;
      setItems(updated);
    } else {
      setItems(prev => [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          cost: prod.cost || prod.price * 0.6,
          qty: 1,
          total: prod.price,
        },
      ]);
    }
    setQuickSearch('');
    setShowSearchResults(false);
  };

  const handleAddEmptyRow = () => {
    const available = products.find(p => (Number(p.stock) || 0) > 0);
    if (!available) {
      onAlert('لا توجد أصناف متاحة', 'جميع الأصناف بالمخزن منتهية الرصيد حالياً.');
      return;
    }
    setItems(prev => [
      ...prev,
      {
        productId: available.id,
        name: available.name,
        price: available.price,
        cost: available.cost || available.price * 0.6,
        qty: 1,
        total: available.price,
      },
    ]);
  };

  const handleItemProductChange = (index: number, newProductId: string) => {
    const prod = products.find(p => p.id === newProductId);
    if (!prod) return;
    const stock = Number(prod.stock) || 0;
    if (stock <= 0) {
      onAlert('الصنف غير متوفر', `الصنف "<strong>${prod.name}</strong>" رصيده 0 حالياً.`);
      return;
    }

    const updated = [...items];
    updated[index] = {
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      cost: prod.cost || prod.price * 0.6,
      qty: 1,
      total: prod.price,
    };
    setItems(updated);
  };

  const handleItemPriceChange = (index: number, val: number) => {
    const updated = [...items];
    updated[index].price = val;
    updated[index].total = val * updated[index].qty;
    setItems(updated);
  };

  const handleItemQtyChange = (index: number, qtyVal: number) => {
    const updated = [...items];
    const targetItem = updated[index];
    const prod = products.find(p => p.id === targetItem.productId);
    const stock = prod ? Number(prod.stock) : 999;

    const validatedQty = Math.max(1, qtyVal);
    if (validatedQty > stock) {
      onAlert('تجاوز رصيد المخزن', `الرصيد المتاح لهذا الصنف بالمخزن هو (${stock} قطعة) فقط.`);
      targetItem.qty = stock > 0 ? stock : 1;
    } else {
      targetItem.qty = validatedQty;
    }
    targetItem.total = targetItem.qty * targetItem.price;
    setItems(updated);
  };

  const handleRemoveRow = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const grandTotal = items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      onAlert('فاتورة فارغة', 'يرجى إضافة صنف واحد على الأقل داخل الفاتورة للمتابعة.');
      return;
    }

    const invoiceData: Invoice = {
      id: code,
      date,
      clientId,
      seller: isAdmin ? seller : currentUser?.name || seller,
      status,
      paymentMethod,
      notes,
      items,
      totalAmount: grandTotal,
      createdAt: editInvoice?.createdAt || new Date().toISOString(),
    };

    onSave(invoiceData, editInvoice || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {editInvoice ? `تعديل الفاتورة: ${editInvoice.id}` : 'إنشاء فاتورة جديدة'}
              </h3>
              <p className="text-[11px] text-slate-500">
                إدخال الأصناف وتحديد طريقة الدفع وحساب الإجمالي فورياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Top row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block font-semibold mb-1 text-slate-600">رقم الفاتورة:</label>
              <input
                type="text"
                value={code}
                readOnly
                className="w-full bg-slate-100 font-mono font-bold text-indigo-700 px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-600">تاريخ الفاتورة:</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-600">طريقة الدفع:</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as 'نقدي' | 'آجل')}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 font-bold text-emerald-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="نقدي">نقدي (كاش مسدد)</option>
                <option value="آجل">آجل (مؤجل على الحساب)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-600">حالة الفاتورة:</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'مفتوحة' | 'مغلقة')}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 font-bold text-indigo-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="مفتوحة">مفتوحة (مسودة قابلة للتعديل)</option>
                <option value="مغلقة">مغلقة (معتمدة ومقفلة)</option>
              </select>
            </div>
          </div>

          {/* Client & Seller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold mb-1 text-slate-600">العميل:</label>
              <select
                required
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none font-bold focus:ring-2 focus:ring-indigo-500/20"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-600">البائعة المسؤولة:</label>
              {isAdmin ? (
                <select
                  value={seller}
                  onChange={e => setSeller(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none font-bold focus:ring-2 focus:ring-indigo-500/20"
                >
                  {users
                    .filter(u => u.role !== 'admin')
                    .map(u => (
                      <option key={u.username} value={u.name}>
                        {u.name} (@{u.username})
                      </option>
                    ))}
                  <option value={currentUser?.name || 'محمود (المدير العام)'}>
                    {currentUser?.name || 'محمود (المدير العام)'}
                  </option>
                </select>
              ) : (
                <input
                  type="text"
                  value={currentUser?.name || seller}
                  readOnly
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold cursor-not-allowed"
                />
              )}
            </div>
          </div>

          {/* Client Info Bar */}
          {selectedClient && (
            <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex flex-wrap items-center justify-between text-indigo-900 font-semibold gap-2">
              <span>
                الهاتف: <strong className="font-mono dir-ltr">{selectedClient.phone}</strong>
              </span>
              <span>العنوان: {selectedClient.address || 'بدون عنوان مسجل'}</span>
            </div>
          )}

          {/* Quick Product Search & Add */}
          <div className="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>بحث سريع عن صنف وإضافته للفاتورة:</span>
              </span>
              <span className="text-[10px] text-indigo-600 font-bold">اضغط على الصنف لإدراجه</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={quickSearch}
                onChange={e => {
                  setQuickSearch(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="اكتب اسم الصنف أو كوده..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white font-medium"
              />

              {showSearchResults && filteredQuickProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100">
                  {filteredQuickProducts.map(p => {
                    const isOut = p.stock <= 0;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleQuickAddProduct(p)}
                        className={`p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition ${
                          isOut ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                        </div>
                        <div className="text-left">
                          <span className="font-black text-xs text-slate-900 block font-mono">
                            {Number(p.price).toFixed(2)} ج.م
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              isOut ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {isOut ? 'منتهي (0)' : `متاح: ${p.stock}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2.5">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-xs">أصناف ومنتجات الفاتورة:</h4>
              <button
                type="button"
                onClick={handleAddEmptyRow}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة صنف
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[500px]">
                <thead className="text-slate-500 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2 px-2">المنتج</th>
                    <th className="py-2 px-2 w-28">السعر (ج.م)</th>
                    <th className="py-2 px-2 w-20 text-center">الكمية</th>
                    <th className="py-2 px-2 w-28">الإجمالي</th>
                    <th className="py-2 px-2 w-10 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        الفاتورة فارغة حالياً. استخدم شريط البحث السريع أعلاه أو اضغط "إضافة صنف".
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="py-2 px-2">
                          <select
                            value={item.productId}
                            onChange={e => handleItemProductChange(idx, e.target.value)}
                            className="w-full p-1.5 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white outline-none"
                          >
                            {products.map(p => (
                              <option
                                key={p.id}
                                value={p.id}
                                disabled={p.stock <= 0 && p.id !== item.productId}
                              >
                                {p.name} ({p.stock <= 0 ? 'منتهي' : `رصيد: ${p.stock}`})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.5"
                            value={item.price}
                            onChange={e => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 rounded-xl border border-slate-200 font-mono font-bold outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => handleItemQtyChange(idx, parseInt(e.target.value, 10) || 1)}
                            className="w-full p-1.5 rounded-xl border border-slate-200 font-mono font-bold text-center outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 font-mono font-black text-indigo-700 text-left dir-ltr">
                          {Number(item.total).toFixed(2)} ج.م
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculated Grand Total */}
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
              <span className="font-bold text-slate-700">إجمالي الفاتورة النهائي:</span>
              <div className="flex items-baseline gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow">
                <span className="text-base font-black text-amber-400 font-mono">
                  {grandTotal.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-300">ج.م</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold mb-1 text-slate-600">ملاحظات الفاتورة:</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أية ملاحظات خاصة بالشحن، السداد، أو الاستلام..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editInvoice ? 'حفظ التعديلات' : 'اعتماد وحفظ الفاتورة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
