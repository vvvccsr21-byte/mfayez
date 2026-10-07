import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { Client } from '../../types';
import { generateNextCode } from '../../services/db';

interface ClientModalProps {
  isOpen: boolean;
  editClient: Client | null;
  clients: Client[];
  onClose: () => void;
  onSave: (client: Client) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  editClient,
  clients,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editClient) {
        setCode(editClient.id);
        setName(editClient.name);
        setPhone(editClient.phone);
        setAddress(editClient.address || '');
        setNotes(editClient.notes || '');
      } else {
        setCode(generateNextCode('C-', clients));
        setName('');
        setPhone('');
        setAddress('');
        setNotes('');
      }
    }
  }, [isOpen, editClient, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientData: Client = {
      id: code,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      createdAt: editClient?.createdAt || new Date().toISOString(),
    };
    onSave(clientData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 no-print">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 p-5 space-y-4 text-xs animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              {editClient ? `تعديل العميل: ${editClient.name}` : 'إضافة عميل جديد'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1 text-slate-600">كود العميل (تلقائي):</label>
            <input
              type="text"
              value={code}
              readOnly
              className="w-full bg-slate-100 font-mono font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-600">اسم العميل:</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="الاسم بالكامل..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-600">رقم الهاتف:</label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="010XXXXXXXX"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-mono font-bold dir-ltr text-right focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-600">العنوان:</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="المدينة - المنطقة - الشارع..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-600">ملاحظات العميل:</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أي تفاصيل إضافية..."
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
              <span>حفظ العميل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
