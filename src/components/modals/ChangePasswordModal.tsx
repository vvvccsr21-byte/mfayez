import React, { useState } from 'react';
import { X, KeyRound, Check } from 'lucide-react';
import { User } from '../../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onSavePassword: (newPass: string) => void;
  onAlert: (title: string, message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSavePassword,
  onAlert,
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.password && currentPass !== currentUser.password) {
      onAlert('خطأ في كلمة المرور', 'كلمة المرور الحالية غير صحيحة.');
      return;
    }
    if (newPass !== confirmPass) {
      onAlert('عدم تطابق', 'كلمة المرور الجديدة غير متطابقة في خانة التأكيد.');
      return;
    }
    if (newPass.length < 3) {
      onAlert('كلمة مرور قصيرة', 'يرجى كتابة كلمة مرور مكونة من 3 خانات على الأقل.');
      return;
    }

    onSavePassword(newPass);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 no-print">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 p-5 space-y-4 text-xs animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">تغيير كلمة المرور الخاصة بك</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1 text-slate-600">كلمة المرور الحالية:</label>
            <input
              type="password"
              required
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-600">كلمة المرور الجديدة:</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-600">تأكيد كلمة المرور الجديدة:</label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              <span>تحديث كلمة المرور</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
