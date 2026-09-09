import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Layers,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  RefreshCw,
  Building,
  DollarSign,
} from 'lucide-react';

export const FarmerCollective: React.FC = () => {
  const { t } = useLanguage();
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerCollectivePools();
      setPools(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('collectiveSelling')}</h1>
          <p className="text-xs text-slate-500">
            Multi-farmer supply pools satisfying commercial bulk demands (கூட்டு விற்பனை குழுக்கள்)
          </p>
        </div>

        <button
          onClick={loadPools}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Concept Explanation Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Community Collective Pooling Innovation</span>
          </div>
          <h3 className="text-lg font-bold">சிறு விவசாயிகளை ஒன்றிணைக்கும் கூட்டு விற்பனை</h3>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            When commercial buyers need 500 kg or 1000 kg, smallholder farmers with only 100 kg cannot participate individually. KisanDirect pools your produce with verified nearby farmers in your village cluster, delivering full bulk value with zero middlemen commission.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading collective pools...</div>
      ) : pools.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-500 border-slate-200">
          <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-800 text-sm">No active collective pools</h3>
          <p className="text-xs text-slate-500 mt-1">
            When bulk requirements are posted in your district, your batches will automatically be grouped into collective supply orders.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pools.map((item) => {
            const col = item.collectiveOrder;
            const demand = col?.demand;
            return (
              <div
                key={item.id}
                className="glass-card rounded-3xl p-6 border-slate-200 hover:border-emerald-300 transition shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                      {col?.collectiveCode}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                      Bulk Requirement: {demand?.product?.name} ({col?.totalQuantity} kg Total)
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                    {col?.status || 'CONFIRMED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">Buyer (வாங்குபவர்)</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {demand?.buyer?.businessName || 'ABC Grand Heritage Hotel'}
                    </span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 text-[10px] block font-bold">உங்கள் பங்கு (Your Share)</span>
                    <span className="font-black text-emerald-900 text-sm">
                      {item.allocatedQuantity} kg
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">ஒப்புக்கொண்ட விலை (Agreed Price)</span>
                    <span className="font-bold text-slate-900">₹{col?.agreedPricePerKg} / kg</span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 text-[10px] block font-bold">மதிப்பிடப்பட்ட வருவாய் (Payout)</span>
                    <span className="font-black text-emerald-900 text-sm">
                      ₹{item.payoutAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>சேகரிப்பு மையம் (Collection Point): Thalaivasal Hub (Salem)</span>
                  </span>
                  <span className="text-emerald-700 font-bold">
                    ✓ Escrow Secured
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FarmerCollective;
