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
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const FarmerEarnings: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerEarnings();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.chart || [
    { month: 'Apr', earnings: 14500, volumeKg: 650 },
    { month: 'May', earnings: 19800, volumeKg: 920 },
    { month: 'Jun', earnings: 24200, volumeKg: 1100 },
    { month: 'Jul', earnings: 28500, volumeKg: 1350 },
    { month: 'Aug', earnings: 32400, volumeKg: 1450 },
    { month: 'Sep', earnings: 38600, volumeKg: 1720 },
  ];

  const summary = data?.summary;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('myEarnings')}</h1>
          <p className="text-xs text-slate-500">
            Transparent revenue realization, escrow payouts, and intermediary savings breakdown
          </p>
        </div>

        <button
          onClick={loadEarnings}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            Total Net Earnings (நிகர வருமானம்)
          </span>
          <div className="text-3xl font-black text-slate-900">
            ₹{summary?.totalEarnings?.toLocaleString('en-IN') || '38,600'}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Direct Escrow Bank Transfer</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-teal-200 bg-gradient-to-br from-teal-50/70 to-white">
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
            Mandi Commission Saved (சேமிப்பு)
          </span>
          <div className="text-3xl font-black text-teal-900">
            ₹{summary?.platformFeeSavedComparedToMiddlemen?.toLocaleString('en-IN') || '6,948'}
          </div>
          <div className="text-[11px] text-teal-700 font-semibold mt-1">
            ~18% saved vs local brokers
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white">
          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block mb-1">
            Completed Orders (வெற்றி ஆர்டர்கள்)
          </span>
          <div className="text-3xl font-black text-slate-900">
            {summary?.completedOrdersCount || 42}
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-1">
            Zero default rate
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Platform Service Fee
          </span>
          <div className="text-3xl font-black text-slate-700">2.0%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Lowest in Indian Agri-Tech
          </div>
        </div>
      </div>

      {/* Recharts Graphical Visualization */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-200">
        <h3 className="font-extrabold text-base text-slate-900 mb-1">
          Monthly Payout Growth & Harvest Volume
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Comparing direct farmer cash realization over consecutive crop cycles
        </p>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="earnings" fill="#059669" radius={[8, 8, 0, 0]} name="Net Earnings (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FarmerEarnings;
