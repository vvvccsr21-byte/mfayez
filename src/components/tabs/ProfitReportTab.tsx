import React from 'react';
import {
  Coins,
  Printer,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Invoice, Product, User } from '../../types';

interface ProfitReportTabProps {
  invoices: Invoice[];
  products: Product[];
  users: User[];
  onPrint: () => void;
}

export const ProfitReportTab: React.FC<ProfitReportTabProps> = ({
  invoices,
  products,
  users,
  onPrint,
}) => {
  let totalRevenue = 0;
  let totalCost = 0;
  let totalCommissions = 0;

  const sellerStats: Record<
    string,
    {
      name: string;
      orderCount: number;
      revenue: number;
      cost: number;
      commission: number;
      rate: number;
    }
  > = {};

  const sellers = users.filter(u => u.role !== 'admin');
  sellers.forEach(s => {
    sellerStats[s.name] = {
      name: s.name,
      orderCount: 0,
      revenue: 0,
      cost: 0,
      commission: 0,
      rate: s.rate ?? 10,
    };
  });

  invoices.forEach(inv => {
    const invTotal = Number(inv.totalAmount) || 0;
    totalRevenue += invTotal;

    const sellerName = inv.seller || 'غير محدد';
    if (!sellerStats[sellerName]) {
      const foundUser = users.find(u => u.name === sellerName);
      sellerStats[sellerName] = {
        name: sellerName,
        orderCount: 0,
        revenue: 0,
        cost: 0,
        commission: 0,
        rate: foundUser?.rate ?? 10,
      };
    }

    sellerStats[sellerName].orderCount += 1;
    sellerStats[sellerName].revenue += invTotal;

    const invComm = (invTotal * (sellerStats[sellerName].rate || 10)) / 100;
    sellerStats[sellerName].commission += invComm;
    totalCommissions += invComm;

    (inv.items || []).forEach(it => {
      const qty = Number(it.qty) || 0;
      const pr = products.find(p => p.id === it.productId);
      const unitCost = Number(it.cost) || (pr ? Number(pr.cost) : Number(it.price) * 0.6);
      const lineCost = unitCost * qty;
      totalCost += lineCost;
      sellerStats[sellerName].cost += lineCost;
    });
  });

  const netProfit = totalRevenue - totalCost - totalCommissions;
  const profitMargin =
    totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const sellerList = Object.values(sellerStats);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <span>تقرير الأرباح والخسائر والعمولات والمكاسب الصافية</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            مجموع المبيعات، تكلفة البضاعة (الجملة)، العمولات المستحقة، وصافي أرباح المحل
          </p>
        </div>
        <button
          onClick={onPrint}
          className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة كشف الأرباح</span>
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block">
            إجمالي المبيعات (الإيرادات)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {totalRevenue.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">قيمة جميع الفواتير</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block">
            تكلفة البضاعة (الجملة)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-700 font-mono">
              {totalCost.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">تكلفة شراء الأصناف</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-amber-800 font-bold block">
            إجمالي العمولات المستحقة
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-900 font-mono">
              {totalCommissions.toFixed(2)}
            </span>
            <span className="text-[10px] text-amber-700 font-bold">ج.م</span>
          </div>
          <span className="text-[10px] text-amber-700 mt-0.5 block">مستحقات البائعات</span>
        </div>

        <div className="bg-gradient-to-tr from-indigo-700 to-indigo-950 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-indigo-200 font-bold block">صافي أرباح المحل</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white font-mono">
              {netProfit.toFixed(2)}
            </span>
            <span className="text-[10px] text-indigo-200 font-bold">ج.م</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-indigo-200 mt-0.5">
            <Percent className="w-3 h-3" />
            <span>هامش الربح الصافي: {profitMargin}%</span>
          </div>
        </div>
      </div>

      {/* Seller Profit Contribution Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>تحليل أرباح وعمولات ومساهمة البائعات</span>
          </div>
          <span className="text-slate-500 font-normal">{sellerList.length} بائعة مسجلة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">اسم البائعة</th>
                <th className="py-2.5 px-3 text-center">عدد الفواتير</th>
                <th className="py-2.5 px-3 font-black">إجمالي مبيعاتها</th>
                <th className="py-2.5 px-3 text-slate-600">تكلفة البضاعة</th>
                <th className="py-2.5 px-3 font-bold text-amber-700">العمولة المستحقة</th>
                <th className="py-2.5 px-3 font-black text-emerald-700">صافي ربح المحل منها</th>
                <th className="py-2.5 px-3 text-center">المساهمة بالأرباح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    لا توجد بيانات مبيعات مسجلة حتى الآن
                  </td>
                </tr>
              ) : (
                sellerList.map(s => {
                  const sellerNetGenerated = s.revenue - s.cost - s.commission;
                  const share =
                    netProfit > 0 && sellerNetGenerated > 0
                      ? ((sellerNetGenerated / netProfit) * 100).toFixed(1)
                      : '0';

                  return (
                    <tr key={s.name} className="hover:bg-slate-50 transition border-b">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-700">
                        {s.orderCount}
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-900 font-mono">
                        {s.revenue.toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {s.cost.toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 font-black text-amber-700 font-mono">
                        {s.commission.toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 font-black text-emerald-700 font-mono">
                        {sellerNetGenerated.toFixed(2)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            sellerNetGenerated > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {share}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
