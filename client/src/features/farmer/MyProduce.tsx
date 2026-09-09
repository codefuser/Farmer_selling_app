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
} from 'lucide-react';

interface MyProduceProps {
  onNavigate: (view: string) => void;
  onOpenVoiceModal: () => void;
}

export const MyProduce: React.FC<MyProduceProps> = ({ onNavigate, onOpenVoiceModal }) => {
  const { t } = useLanguage();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('myProduce')}</h1>
          <p className="text-xs text-slate-500">
            Real-time freshness monitoring and marketplace listing inventory
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadBatches}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('farmer-add-produce')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addProduce')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 text-xs font-bold text-slate-600">
        {[
          { id: 'ALL', label: 'All Batches (அனைத்தும்)' },
          { id: 'FRESH', label: 'Fresh (புதியது)' },
          { id: 'AGING', label: 'Aging (முதிர்வு)' },
          { id: 'URGENT', label: 'Urgent Sale 🔥 (உடனடி)' },
          { id: 'EXPIRED', label: 'Expired (காலாவதியானது)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl border transition whitespace-nowrap ${
              filter === tab.id
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading batches...</div>
      ) : filteredBatches.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-500 border-slate-200">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-800 text-sm">No produce batches found</h3>
          <p className="text-xs text-slate-500 mt-1">Add your harvested crops to start matching with buyers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="glass-card rounded-3xl p-5 border-slate-200 hover:border-emerald-300 transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border">
                    {batch.batchCode}
                  </span>
                  <FreshnessBadge
                    status={batch.freshnessStatus}
                    remainingText={batch.freshness?.formattedRemaining}
                  />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={batch.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200'}
                    alt={batch.product?.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {batch.product?.name} · {batch.product?.nameTamil}
                    </h3>
                    <div className="text-xs text-slate-600 mt-0.5">
                      கையிருப்பு: <strong className="text-slate-900">{batch.quantity} kg</strong>
                    </div>
                    <div className="text-xs font-black text-emerald-700 mt-0.5">
                      ₹{batch.pricePerKg} / kg <span className="text-[10px] text-slate-400 font-normal">(Grade {batch.qualityGrade})</span>
                    </div>
                  </div>
                </div>

                {/* Freshness Countdown Meter */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Freshness Life</span>
                    <span className="text-emerald-700">{batch.freshness?.percentRemaining || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        batch.freshnessStatus === 'FRESH'
                          ? 'bg-emerald-500'
                          : batch.freshnessStatus === 'AGING'
                          ? 'bg-amber-500'
                          : batch.freshnessStatus === 'URGENT'
                          ? 'bg-orange-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${batch.freshness?.percentRemaining || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>அறுவடை: {new Date(batch.harvestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Sell by: {new Date(batch.sellBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-semibold text-slate-500">
                  Status: <strong className="text-slate-800">{batch.status}</strong>
                </span>
                <button
                  onClick={() => onNavigate('farmer-offers')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Offers பார் &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProduce;
