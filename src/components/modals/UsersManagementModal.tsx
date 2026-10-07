import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Check, Percent, ShieldCheck } from 'lucide-react';
import { User, UserPermissions } from '../../types';

interface UsersManagementModalProps {
  isOpen: boolean;
  users: User[];
  onClose: () => void;
  onSaveUser: (user: User) => void;
  onAlert: (title: string, message: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({
  isOpen,
  users,
  onClose,
  onSaveUser,
  onAlert,
  onToast,
}) => {
  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRate, setNewRate] = useState<number>(10);

  // Selected user for editing permissions
  const [targetUsername, setTargetUsername] = useState('');
  const [targetRate, setTargetRate] = useState<number>(10);
  const [targetVerified, setTargetVerified] = useState<boolean>(false);
  const [perms, setPerms] = useState<UserPermissions>({});

  const nonAdmins = users.filter(u => u.role !== 'admin');

  useEffect(() => {
    if (isOpen && nonAdmins.length > 0) {
      const first = targetUsername && nonAdmins.some(u => u.username === targetUsername)
        ? targetUsername
        : nonAdmins[0].username;
      loadUser(first);
    }
  }, [isOpen, users]);

  const loadUser = (uname: string) => {
    setTargetUsername(uname);
    const u = users.find(user => user.username === uname);
    if (u) {
      setTargetRate(u.rate ?? 10);
      setTargetVerified(u.verified ?? false);
      setPerms({
        showInvoicesTab: u.permissions?.showInvoicesTab !== false,
        canCreateInvoice: u.permissions?.canCreateInvoice !== false,
        showSellerReportTab: u.permissions?.showSellerReportTab !== false,
        showClientsTab: !!u.permissions?.showClientsTab,
        canEditClients: !!u.permissions?.canEditClients,
        showProductsTab: !!u.permissions?.showProductsTab,
        canEditProducts: !!u.permissions?.canEditProducts,
        showClientReportTab: !!u.permissions?.showClientReportTab,
        showCustomReportTab: !!u.permissions?.showCustomReportTab,
        showProfitTab: !!u.permissions?.showProfitTab,
        canEditOthersInvoices: !!u.permissions?.canEditOthersInvoices,
      });
    }
  };

  if (!isOpen) return null;

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = newUsername.trim().toLowerCase();
    if (users.some(u => u.username.toLowerCase() === uname)) {
      onAlert('اسم المستخدم مكرر', 'اسم المستخدم هذا مسجل بالفعل. يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    const newUser: User = {
      username: uname,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      password: newPassword.trim() || '123456',
      role: 'sales',
      rate: Number(newRate) || 10,
      verified: false,
      permissions: {
        showInvoicesTab: true,
        canCreateInvoice: true,
        showSellerReportTab: true,
        showClientsTab: true,
        canEditClients: false,
        showProductsTab: true,
        canEditProducts: false,
        showClientReportTab: true,
        showCustomReportTab: false,
        showProfitTab: false,
        canEditOthersInvoices: false,
      },
      createdAt: new Date().toISOString(),
    };

    onSaveUser(newUser);
    onToast(`تم إنشاء حساب (${newUser.name}) بنجاح`, 'success');
    setNewUsername('');
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRate(10);
    loadUser(uname);
  };

  const handleSavePermissions = () => {
    const u = users.find(user => user.username === targetUsername);
    if (!u) return;

    const updatedUser: User = {
      ...u,
      rate: Number(targetRate) || 0,
      verified: targetVerified,
      permissions: perms,
    };

    onSaveUser(updatedUser);
    onToast(`تم حفظ نسبة العمولة (${targetRate}%) وصلاحيات (${u.name}) بنجاح`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-xs animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                إدارة المستخدمين ونسب العمولات والصلاحيات
              </h3>
              <p className="text-[11px] text-slate-500">
                إنشاء حسابات جديدة، تخصيص عمولة كل بائعة، والتحكم بما يظهر في القائمة بدقة
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Add User Section */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>إنشاء حساب مستخدم / بائعة جديدة:</span>
            </h4>
            <form onSubmit={handleCreateNewUser} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-semibold mb-1 text-slate-600">اسم المستخدم (للدخول):</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="مثال: sara_sales"
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-600">الاسم الظاهر بالسيستم:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="مثال: سارة أحمد"
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-600">البريد الإلكتروني:</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="sara@example.com"
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-600">كلمة المرور الأولية:</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-600">نسبة العمولة (%):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newRate}
                  onChange={e => setNewRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-emerald-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء الحساب</span>
                </button>
              </div>
            </form>
          </div>

          {/* Permissions & Commission Section */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  تخصيص الصلاحيات ونسبة العمولة والتوثيق:
                </h4>
                <p className="text-[11px] text-slate-500">
                  اختر البائعة لتعديل عمولتها وتحديد الأقسام المسموح لها برؤيتها
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-600">المستخدم:</label>
                <select
                  value={targetUsername}
                  onChange={e => loadUser(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded-xl font-bold text-xs bg-slate-50 outline-none"
                >
                  {nonAdmins.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.name} (@{u.username}) - عمولة: {u.rate}%
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick stats for selected user */}
            <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-950">نسبة عمولة المستخدم المحددة:</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    value={targetRate}
                    onChange={e => setTargetRate(parseFloat(e.target.value) || 0)}
                    className="w-20 p-1.5 rounded-lg border border-indigo-300 font-black text-indigo-900 text-xs bg-white text-center outline-none"
                  />
                  <span className="font-bold text-indigo-700">%</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-sky-200">
                  <input
                    type="checkbox"
                    checked={targetVerified}
                    onChange={e => setTargetVerified(e.target.checked)}
                    className="rounded text-sky-600 w-4 h-4"
                  />
                  <span className="font-bold text-sky-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    <span>توثيق الحساب (علامة زرقاء)</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Permissions Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.showInvoicesTab ?? true}
                  onChange={e => setPerms({ ...perms, showInvoicesTab: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إظهار قسم الفواتير والأوردرات</span>
                  <span className="text-[10px] text-slate-500">يظهر التبويب في القائمة</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.canCreateInvoice ?? true}
                  onChange={e => setPerms({ ...perms, canCreateInvoice: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إنشاء فواتير جديدة</span>
                  <span className="text-[10px] text-slate-500">يستطيع فتح وعمل فاتورة</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 cursor-pointer col-span-1 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={perms.showSellerReportTab ?? true}
                  onChange={e => setPerms({ ...perms, showSellerReportTab: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-emerald-950 block">
                    إظهار تقرير البائعات والعمولات (حسابي ومبيعاتي والعمولة)
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    التحكم في إظهار أو إخفاء تبويب كشف حساب البائعة وعمولاتها في القائمة
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.showClientsTab ?? false}
                  onChange={e => setPerms({ ...perms, showClientsTab: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إظهار قسم سجل العملاء</span>
                  <span className="text-[10px] text-slate-500">يظهر التبويب في القائمة</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.canEditClients ?? false}
                  onChange={e => setPerms({ ...perms, canEditClients: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إضافة وتعديل بيانات العملاء</span>
                  <span className="text-[10px] text-slate-500">إن لم تفعل يصبح (عرض فقط)</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.showProductsTab ?? false}
                  onChange={e => setPerms({ ...perms, showProductsTab: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إظهار قسم المنتجات والمخزون</span>
                  <span className="text-[10px] text-slate-500">يظهر التبويب في القائمة</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.canEditProducts ?? false}
                  onChange={e => setPerms({ ...perms, canEditProducts: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إضافة وتعديل الأصناف والأسعار</span>
                  <span className="text-[10px] text-slate-500">إن لم تفعل يصبح (عرض فقط)</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.showClientReportTab ?? false}
                  onChange={e => setPerms({ ...perms, showClientReportTab: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إظهار كشف حساب العميل</span>
                  <span className="text-[10px] text-slate-500">استعراض سجل مشتريات أي عميل</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.showCustomReportTab ?? false}
                  onChange={e => setPerms({ ...perms, showCustomReportTab: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إظهار تقارير الفلترة المتقدمة</span>
                  <span className="text-[10px] text-slate-500">فلترة المبيعات بالأيام والأصناف</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.showProfitTab ?? false}
                  onChange={e => setPerms({ ...perms, showProfitTab: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">إظهار تقرير الأرباح والخسائر</span>
                  <span className="text-[10px] text-slate-500">الاطلاع على أرباح المحل</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perms.canEditOthersInvoices ?? false}
                  onChange={e => setPerms({ ...perms, canEditOthersInvoices: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">تعديل فواتير الزميلات الأخرى</span>
                  <span className="text-[10px] text-slate-500">الافتراضي: تعديل فواتيرها فقط</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ النسبة والصلاحيات</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
