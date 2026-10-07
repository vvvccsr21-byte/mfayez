import React from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isAlertOnly?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  isAlertOnly,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 no-print">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 p-5 space-y-4 text-center animate-in fade-in zoom-in duration-200">
        <div
          className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-xl shadow-md ${
            isAlertOnly
              ? 'bg-rose-100 text-rose-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          {isAlertOnly ? <AlertCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>

        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">{title}</h3>
          <p
            className="text-xs text-slate-600 mt-1.5 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
          {!isAlertOnly && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              إلغاء
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              else onCancel();
            }}
            className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow transition ${
              isAlertOnly
                ? 'bg-slate-900 hover:bg-black shadow-slate-900/20'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
            }`}
          >
            {isAlertOnly ? 'حسناً، فهمت' : 'تأكيد ومتابعة'}
          </button>
        </div>
      </div>
    </div>
  );
};
