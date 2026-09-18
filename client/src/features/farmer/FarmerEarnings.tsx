import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Award,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  Plus,
  Trash2,
  PieChart,
  Wallet,
  Receipt,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const FarmerEarnings: React.FC = () => {
  const { language, t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New cost form state
  const [showCostForm, setShowCostForm] = useState(false);
  const [costCategory, setCostCategory] = useState('SEED');
  const [costAmount, setCostAmount] = useState('');
  const [costDescription, setCostDescription] = useState('');
  const [savingCost, setSavingCost] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerEarnings();
      setData(res);
    } catch (err) {
      console.error('Failed to load earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costAmount || parseFloat(costAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSavingCost(true);
    try {
      await api.addFarmerCost({
        category: costCategory,
        amount: parseFloat(costAmount),
        description: costDescription.trim() || undefined,
      });
      setCostAmount('');
      setCostDescription('');
      setShowCostForm(false);
      await loadEarnings();
    } catch (err: any) {
      alert(err.message || 'Failed to add cost');
    } finally {
      setSavingCost(false);
    }
  };

  const handleDeleteCost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cost entry?')) return;
    try {
      await api.deleteFarmerCost(id);
      await loadEarnings();
    } catch (err: any) {
      alert(err.message || 'Failed to delete cost');
    }
  };

  const summary = data?.summary;
  const chartData = data?.chart || [];
  const recentCosts = data?.recentCosts || [];
  const costByCategory = data?.costByCategory || {};

  const totalRevenue = summary?.totalEarnings || 0;
  const totalCosts = summary?.totalCosts || 0;
  const netProfit = summary?.netProfit !== undefined ? summary.netProfit : totalRevenue - totalCosts;
  const profitMargin = summary?.profitMargin || (totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('myEarnings')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'உண்மையான வருவாய், உள்ளீட்டு செலவுகள் மற்றும் நிகர லாப பகுப்பாய்வு'
              : 'Real financial accounting: revenue, input costs, and true net margin'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCostForm(!showCostForm)}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'செலவை பதிவு செய்' : 'Add Cost'}</span>
          </button>
          <button
            onClick={loadEarnings}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Revenue */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            {language === 'ta' ? 'மொத்த விற்றுமுதல்' : 'Gross Revenue'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'நேரடி வங்கி பரிமாற்றம்' : 'Direct Bank Payouts'}</span>
          </div>
        </div>

        {/* Total Input Costs */}
        <div className="bg-gradient-to-br from-rose-50 to-white rounded-3xl p-4 sm:p-5 border border-rose-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            {language === 'ta' ? 'உள்ளீட்டு செலவுகள்' : 'Input Costs'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-900">
            ₹{totalCosts.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-rose-700 font-semibold">
            {recentCosts.length} {language === 'ta' ? 'செலவுப் பதிவுகள்' : 'recorded expense entries'}
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-teal-50 to-white rounded-3xl p-4 sm:p-5 border border-teal-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
            {language === 'ta' ? 'நிகர பண்ணை லாபம்' : 'Net Farm Profit'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-teal-900">
            ₹{netProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-teal-700 font-semibold">
            {language === 'ta' ? 'லாப வரம்பு:' : 'Profit Margin:'} {profitMargin}%
          </div>
        </div>

        {/* Intermediary Savings */}
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-4 sm:p-5 border border-indigo-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
            {language === 'ta' ? 'தரகர் கமிஷன் சேமிப்பு' : 'Mandi Markup Saved'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-900">
            ₹{(summary?.platformFeeSavedComparedToMiddlemen || Math.round(totalRevenue * 0.18)).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-indigo-700 font-semibold">
            ~18% vs APMC Middlemen
          </div>
        </div>
      </div>

      {/* Add Cost Form Drawer/Collapsible */}
      {showCostForm && (
        <form
          onSubmit={handleAddCost}
          className="bg-white rounded-3xl p-5 border border-emerald-300 shadow-md space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ta' ? 'புதிய உற்பத்தி செலவை பதிவு செய்க' : 'Record New Crop Input Cost'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowCostForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'ta' ? 'செலவு வகை' : 'Category'}
              </label>
              <select
                value={costCategory}
                onChange={(e) => setCostCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white outline-none"
              >
                <option value="SEED">Seeds / நாற்று</option>
                <option value="FERTILIZER">Fertilizer / உரம்</option>
                <option value="PESTICIDE">Pesticide / பூச்சிக்கொல்லி</option>
                <option value="LABOR">Labor / கூலி</option>
                <option value="TRANSPORT">Transport / போக்குவரத்து</option>
                <option value="IRRIGATION">Irrigation / பாசனம்</option>
                <option value="MACHINERY">Machinery / டிராக்டர் வாடகை</option>
                <option value="OTHER">Other / இதர செலவுகள்</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'ta' ? 'தொகை (₹)' : 'Amount (₹)'}
              </label>
              <input
                type="number"
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
                placeholder="e.g. 2500"
                min="1"
                step="any"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'ta' ? 'விளக்கம்' : 'Description'}
              </label>
              <input
                type="text"
                value={costDescription}
                onChange={(e) => setCostDescription(e.target.value)}
                placeholder="e.g. Organic DAP & Compost"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingCost}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {savingCost ? 'Saving...' : (language === 'ta' ? 'செலவை சேமி' : 'Save Expense')}
            </button>
          </div>
        </form>
      )}

      {/* Revenue vs Costs Chart */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-3">
        <div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 mb-0.5">
            {language === 'ta' ? 'மாதாந்திர வருவாய் மற்றும் செலவு ஒப்பீடு' : 'Monthly Revenue vs Costs Breakdown'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'உண்மையான லாபத்தை கண்காணிக்க உதவும் மாதாந்திர வரைபடம்'
              : 'Real monthly progression showing revenue, expenditures, and net pocket cash'}
          </p>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="revenue" fill="#059669" name={language === 'ta' ? 'வருவாய் (₹)' : 'Revenue (₹)'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="costs" fill="#f43f5e" name={language === 'ta' ? 'செலவு (₹)' : 'Costs (₹)'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#0d9488" name={language === 'ta' ? 'நிகர லாபம் (₹)' : 'Net Profit (₹)'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Breakdown & Recent Entries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            {language === 'ta' ? 'செலவு வகைப்பாடு' : 'Expenditure by Category'}
          </h4>

          <div className="space-y-2">
            {Object.entries(costByCategory).map(([cat, amount]: [string, any]) => {
              const percent = totalCosts > 0 ? Math.round((amount / totalCosts) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span>₹{amount.toLocaleString()} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Costs Ledger */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            {language === 'ta' ? 'சமீபத்திய செலவுப் பதிவுகள்' : 'Recent Expense Ledger'}
          </h4>

          {recentCosts.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              {language === 'ta' ? 'செலவுகள் ஏதும் பதிவு செய்யப்படவில்லை' : 'No input costs recorded yet'}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {recentCosts.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">{c.category}</span>
                    <span className="text-[10px] text-slate-500">{c.description || 'General expense'} • {new Date(c.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-rose-700">₹{c.amount}</span>
                    <button
                      onClick={() => handleDeleteCost(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerEarnings;
