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
} from 'recharts';

export const FarmerEarnings: React.FC = () => {
  const { language, t } = useLanguage();
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
    { month: language === 'ta' ? 'சித்திரை' : 'Apr', earnings: 14500, volumeKg: 650 },
    { month: language === 'ta' ? 'வைகாசி' : 'May', earnings: 19800, volumeKg: 920 },
    { month: language === 'ta' ? 'ஆனி' : 'Jun', earnings: 24200, volumeKg: 1100 },
    { month: language === 'ta' ? 'ஆடி' : 'Jul', earnings: 28500, volumeKg: 1350 },
    { month: language === 'ta' ? 'ஆவணி' : 'Aug', earnings: 32400, volumeKg: 1450 },
    { month: language === 'ta' ? 'புரட்டாசி' : 'Sep', earnings: 38600, volumeKg: 1720 },
  ];

  const summary = data?.summary;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('myEarnings')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'வெளிப்படையான வங்கி வரவு, எஸ்க்ரோ கட்டணப் பதிவுகள் மற்றும் இடைத்தரகர் சேமிப்பு'
              : 'Transparent revenue realization, escrow payouts, and intermediary savings breakdown'}
          </p>
        </div>

        <button
          onClick={loadEarnings}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            {language === 'ta' ? 'நிகர வருமானம்' : 'Total Net Earnings'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{summary?.totalEarnings?.toLocaleString('en-IN') || '38,600'}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'நேரடி எஸ்க்ரோ பரிமாற்றம்' : 'Direct Escrow Bank Transfer'}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-white rounded-3xl p-4 sm:p-5 border border-teal-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
            {language === 'ta' ? 'தரகர் கமிஷன் சேமிப்பு' : 'Mandi Markup Saved'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-teal-900">
            ₹{summary?.platformFeeSavedComparedToMiddlemen?.toLocaleString('en-IN') || '6,948'}
          </div>
          <div className="text-[10px] text-teal-700 font-semibold">
            {language === 'ta' ? '~18% கூடுதல் வருவாய்' : '~18% saved vs brokers'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-4 sm:p-5 border border-indigo-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
            {language === 'ta' ? 'நிறைவடைந்த ஆர்டர்கள்' : 'Completed Orders'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {summary?.completedOrdersCount || 42}
          </div>
          <div className="text-[10px] text-indigo-700 font-semibold">
            {language === 'ta' ? '100% சரியான விநியோகம்' : 'Zero default rate'}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === 'ta' ? 'தள சேவைக் கட்டணம்' : 'Platform Service Fee'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-700">2.0%</div>
          <div className="text-[10px] text-slate-400">
            {language === 'ta' ? 'இந்தியாவிலேயே மிகக் குறைவு' : 'Lowest in Indian Agri-Tech'}
          </div>
        </div>
      </div>

      {/* Recharts Graphical Visualization */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <h3 className="font-black text-sm sm:text-base text-slate-900 mb-0.5">
          {language === 'ta' ? 'மாதாந்திர வருவாய் மற்றும் அறுவடை வளர்ச்சி' : 'Monthly Payout Growth & Harvest Volume'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {language === 'ta'
            ? 'இடைத்தரகர்கள் இல்லாத நேரடி விவசாய விற்பனை வளர்ச்சி வரைபடம்'
            : 'Comparing direct farmer cash realization over consecutive crop cycles'}
        </p>

        <div className="h-60 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Bar
                dataKey="earnings"
                fill="#059669"
                radius={[6, 6, 0, 0]}
                name={language === 'ta' ? 'நிகர வருமானம் (₹)' : 'Net Earnings (₹)'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FarmerEarnings;
