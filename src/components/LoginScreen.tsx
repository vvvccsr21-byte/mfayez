import React, { useState } from 'react';
import { Lock, User as UserIcon, KeyRound, ArrowRight, AlertCircle, Sparkles, Database } from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    const p = password.trim();

    const matched = users.find(
      user =>
        (user.username.toLowerCase() === u ||
          (user.email && user.email.toLowerCase() === u)) &&
        user.password === p
    );

    if (!matched) {
      setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة!');
      return;
    }

    setErrorMsg('');
    onLogin(matched);
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setUsername(uname);
    setPassword(pass);
    const matched = users.find(u => u.username.toLowerCase() === uname.toLowerCase() && u.password === pass);
    if (matched) {
      setErrorMsg('');
      onLogin(matched);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 sm:p-8 space-y-6 text-right animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-indigo-600/30">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            منظومة المبيعات والفواتير
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            سجل الدخول للمتابعة بحسابك المعتمد مع قاعدة بيانات سحابية متزامنة
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold border border-emerald-200 mt-1">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>قاعدة بيانات سحابية متصلة ومحدثة</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              اسم المستخدم أو البريد الإلكتروني:
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="mahmoud أو البريد..."
                className="w-full pl-3 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold bg-slate-50 focus:bg-white text-slate-900 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">كلمة المرور:</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold bg-slate-50 focus:bg-white text-slate-900 text-sm transition"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            <span>تسجيل الدخول</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>دخول تجريبي سريع بضغطة زر:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('mahmoud', '112233')}
              className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 font-bold transition text-center"
            >
              المدير (mahmoud)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('madonna', '123')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold transition text-center"
            >
              بائعة (Madonna)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('joy', '123')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold transition text-center"
            >
              بائعة (Joy)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('malak', '123')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold transition text-center"
            >
              بائعة (Malak)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
