import React, { useRef } from 'react';
import {
  Database,
  FileSpreadsheet,
  Download,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Invoice, Client, Product, User } from '../../types';

interface BackupTabProps {
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
  users: User[];
  onRestoreData: (backup: {
    users?: User[];
    clients?: Client[];
    products?: Product[];
    invoices?: Invoice[];
  }) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAlert: (title: string, message: string) => void;
}

export const BackupTab: React.FC<BackupTabProps> = ({
  invoices,
  clients,
  products,
  users,
  onRestoreData,
  onToast,
  onAlert,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportFullExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Invoices
    const invRows = invoices.map(inv => {
      const client = clients.find(c => c.id === inv.clientId) || { name: 'غير معروف', phone: '-' };
      const itemsDetail = (inv.items || [])
        .map(it => `${it.name} (${it.qty} × ${it.price})`)
        .join(' | ');
      return {
        'رقم الفاتورة': inv.id,
        'التاريخ': inv.date,
        'العميل': client.name,
        'الهاتف': client.phone,
        'البائعة': inv.seller,
        'طريقة الدفع': inv.paymentMethod,
        'الحالة': inv.status,
        'الإجمالي (ج.م)': Number(inv.totalAmount).toFixed(2),
        'الأصناف': itemsDetail,
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invRows), 'الفواتير');

    // 2. Clients
    const cliRows = clients.map(c => ({
      'كود العميل': c.id,
      'اسم العميل': c.name,
      'رقم الهاتف': c.phone,
      'العنوان': c.address || '',
      'ملاحظات': c.notes || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cliRows), 'دليل العملاء');

    // 3. Products
    const prodRows = products.map(p => ({
      'كود المنتج': p.id,
      'اسم الصنف': p.name,
      'سعر البيع': p.price,
      'سعر التكلفة': p.cost || 0,
      'الرصيد المتاح': p.stock || 0,
      'أضيف بواسطة': p.createdBy || '',
      'تاريخ الإضافة': p.createdAt || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodRows), 'المنتجات والمخزون');

    // 4. Users
    const userRows = users.map(u => ({
      'اسم المستخدم': u.username,
      'الاسم الظاهر': u.name,
      'البريد الإلكتروني': u.email || '',
      'الرتبة': u.role,
      'نسبة العمولة %': u.rate ?? 0,
      'الحساب موثق؟': u.verified ? 'نعم' : 'لا',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(userRows), 'فريق المبيعات');

    XLSX.writeFile(wb, `SalesSystem_Full_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('تم تصدير شيت إكسل شامل للنظام بنجاح', 'success');
  };

  const handleDownloadJsonBackup = () => {
    const backupData = {
      version: '8.5-cloud',
      exportedAt: new Date().toISOString(),
      users,
      clients,
      products,
      invoices,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Database_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast('تم تنزيل النسخة الاحتياطية بنجاح', 'success');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = ev => {
      try {
        const content = ev.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.clients || !parsed.products || !parsed.invoices) {
          onAlert('ملف غير صالح', 'الملف المحدد لا يحتوي على بنية بيانات النظام الصحيحة.');
          return;
        }

        onRestoreData(parsed);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        onAlert('خطأ في القراءة', 'تعذر قراءة ملف النسخة الاحتياطية.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>مركز النسخ الاحتياطي وتصدير شيتات الإكسل</span>
            </h2>
            <p className="text-xs text-slate-500">
              حفظ وتصدير كافة بيانات النظام في شيتات إكسل منظمة أو تنزيل ملف قاعدة البيانات السحابية
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>حماية تامة من الضياع</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Excel Export Card */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-slate-50 transition space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  تصدير شيت إكسل كامل للسيستم (.xlsx)
                </h3>
                <p className="text-[11px] text-slate-500">
                  الفواتير، العملاء، الأصناف، والبائعات في ملف واحد متعدد الصفحات
                </p>
              </div>
            </div>
            <button
              onClick={handleExportFullExcel}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>تحميل شيت الإكسل الشامل</span>
            </button>
          </div>

          {/* JSON Backup Download Card */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-slate-50 transition space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  تنزيل ملف النسخة الاحتياطية الكاملة (.json)
                </h3>
                <p className="text-[11px] text-slate-500">
                  حفظ نسخة طبق الأصل تحتوي على الحسابات، الصلاحيات، وكافة السجلات
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadJsonBackup}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل ملف النسخة الاحتياطية (.json)</span>
            </button>
          </div>

          {/* JSON Restore Card */}
          <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50/50 space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  استعادة قاعدة البيانات من نسخة سابقة
                </h3>
                <p className="text-[11px] text-slate-500">
                  اختر ملف (.json) تم تنزيله سابقاً لاستعادة البيانات ومزامنتها فورياً مع السحابة
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleRestoreFile}
                className="w-full text-xs text-slate-600 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
