import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { ProduceBatch } from '../../types';
import FreshnessBadge from '../../components/common/FreshnessBadge';
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Mic,
} from 'lucide-react';

interface MyProduceProps {
  onNavigate: (view: string) => void;
  onOpenVoiceModal: () => void;
}

export const MyProduce: React.FC<MyProduceProps> = ({ onNavigate, onOpenVoiceModal }) => {
  const { t, language } = useLanguage();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerBatches();
      setBatches(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'FRESH') return b.freshnessStatus === 'FRESH';
    if (filter === 'AGING') return b.freshnessStatus === 'AGING';
    if (filter === 'URGENT') return b.freshnessStatus === 'URGENT';
    if (filter === 'EXPIRED') return b.freshnessStatus === 'EXPIRED' || b.status === 'EXPIRED';
    return true;
  });

  return (
    <div className="max-w-md sm:max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Top Header & Quick Add */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('myProduce')}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'உங்கள் விளைபொருட்களின் தற்போதைய நிலை'
              : 'Real-time inventory and perishable countdown'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('farmer-add-produce')}
          className="h-10 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'ta' ? 'சேர்' : 'Add'}</span>
        </button>
      </div>

      {/* Filter Tabs (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {[
          { id: 'ALL', label: language === 'ta' ? 'அனைத்தும்' : 'All' },
          { id: 'FRESH', label: t('fresh') },
          { id: 'AGING', label: t('aging') },
          { id: 'URGENT', label: t('urgentSale') },
          { id: 'EXPIRED', label: t('expired') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              filter === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Produce List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">
            {language === 'ta' ? 'விவரங்கள் பதிவேற்றப்படுகின்றன...' : 'Loading your produce...'}
          </p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h2 className="text-sm font-bold text-slate-800 mb-1">
            {language === 'ta' ? 'விளைபொருட்கள் எதுவும் இல்லை' : 'No produce found in this tab'}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            {language === 'ta'
              ? 'புதிய அறுவடையை சந்தையில் எளிதாக பதிவிடுங்கள்'
              : 'List your fresh harvest to start receiving commercial buyer offers'}
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => onNavigate('farmer-add-produce')}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + {t('addProduce')}
            </button>
            <button
              onClick={onOpenVoiceModal}
              className="px-4 py-2.5 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl"
            >
              🎤 {t('voiceListing')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img
                      src={batch.imageUrl || batch.product?.imageUrl}
                      alt={batch.product?.name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                      {batch.batchCode}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 truncate">
                      {language === 'ta' ? batch.product?.nameTamil : batch.product?.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs mt-0.5">
                      <span className="font-black text-emerald-700">₹{batch.pricePerKg}/kg</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-slate-700">{batch.quantity} kg</span>
                      <span className="text-slate-400">·</span>
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-bold text-slate-600">
                        {language === 'ta' ? `தரம் ${batch.qualityGrade}` : `Grade ${batch.qualityGrade}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <FreshnessBadge
                    status={batch.freshnessStatus}
                    hoursRemaining={batch.freshness?.hoursRemaining}
                    minutesRemaining={batch.freshness?.minutesRemaining}
                  />
                </div>
              </div>

              {/* Status and Payout Summary */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">
                    {language === 'ta' ? 'எதிர்பார்க்கும் வருமானம்' : 'Estimated Value'}
                  </span>
                  <span className="font-black text-slate-900">
                    ₹{(batch.quantity * batch.pricePerKg).toLocaleString()}
                  </span>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {batch.status === 'ACTIVE'
                    ? (language === 'ta' ? 'சந்தையில் நேரலையில்' : 'Active on Market')
                    : batch.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProduce;
