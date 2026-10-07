import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  FileText,
  Edit,
  Trash2,
} from 'lucide-react';
import { Client, Invoice, User } from '../../types';

interface ClientsTabProps {
  clients: Client[];
  invoices: Invoice[];
  currentUser: User | null;
  onOpenClientModal: (clientId?: string) => void;
  onInspectStatement: (clientId: string) => void;
  onDeleteClient: (client: Client) => void;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({
  clients,
  currentUser,
  onOpenClientModal,
  onInspectStatement,
  onDeleteClient,
}) => {
  const [search, setSearch] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const perms = currentUser?.permissions || {};
  const canEdit = isAdmin || perms.canEditClients;

  const filteredClients = clients.filter(c => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم العميل أو الهاتف..."
            className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {canEdit && (
          <button
            onClick={() => onOpenClientModal()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>
        )}
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-3">كود العميل</th>
                <th className="py-3 px-3">اسم العميل</th>
                <th className="py-3 px-3">رقم الهاتف</th>
                <th className="py-3 px-3">العنوان</th>
                <th className="py-3 px-3">ملاحظات</th>
                <th className="py-3 px-3 text-center">كشف الحساب</th>
                <th className="py-3 px-3 text-center no-print">تعديل</th>
                {isAdmin && <th className="py-3 px-3 text-center no-print">حذف</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-xs text-slate-600">لا يوجد عملاء يطابقون البحث</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition border-b">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{c.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono dir-ltr text-right">
                      {c.phone}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{c.address || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{c.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onInspectStatement(c.id)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>كشف الحساب</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center no-print">
                      {canEdit ? (
                        <button
                          onClick={() => onOpenClientModal(c.id)}
                          className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-bold text-xs flex items-center gap-1 mx-auto"
                        >
                          <Edit className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">عرض فقط</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-2.5 px-3 text-center no-print">
                        <button
                          onClick={() => onDeleteClient(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
