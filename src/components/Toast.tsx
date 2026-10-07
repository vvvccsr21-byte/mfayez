import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none no-print max-w-sm w-full">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl text-xs font-bold transition-all transform animate-slide-up ${
              isSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : isError
                ? 'bg-rose-600 text-white shadow-rose-600/20'
                : 'bg-slate-900 text-white shadow-slate-900/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />}
              {isError && <AlertTriangle className="w-5 h-5 shrink-0 text-rose-200" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 shrink-0 text-indigo-300" />}
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
