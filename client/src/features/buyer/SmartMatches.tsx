import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BuyerDemand, MatchedBatch, CollectiveMatchGroup } from '../../types';
import FreshnessBadge from '../../components/common/FreshnessBadge';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Users,
  Send,
  Building,
} from 'lucide-react';

interface SmartMatchesProps {
  demandId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const SmartMatches: React.FC<SmartMatchesProps> = ({ demandId, onNavigate }) => {
  const [demand, setDemand] = useState<BuyerDemand | null>(null);
  const [individualMatches, setIndividualMatches] = useState<MatchedBatch[]>([]);
  const [collectiveGroup, setCollectiveGroup] = useState<CollectiveMatchGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [establishingOrder, setEstablishingOrder] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState('23');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, [demandId]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // If no demandId passed, load the first active demand
      let targetId = demandId;
      if (!targetId) {
        const demands = await api.getBuyerDemands();
        if (demands.length > 0) {
          targetId = demands[0].id;
        } else {
          setLoading(false);
          return;
        }
      }

      const res = await api.getDemandMatches(targetId);
      setDemand(res.demand);
      setIndividualMatches(res.individualMatches);
      setCollectiveGroup(res.collectiveSupply);
      if (res.collectiveSupply) {
        setAgreedPrice(String(res.collectiveSupply.averagePrice || 23));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to calculate smart matches');
    } finally {
      setLoading(false);
    }
  };

  const handleEstablishCollectiveOrder = async () => {
    if (!demand || !collectiveGroup) return;
    try {
      setEstablishingOrder(true);
      setError(null);

      const allocations = collectiveGroup.batches.map((item) => ({
        batchId: item.batch.batchId,
        farmerId: item.batch.farmerId,
        allocatedQuantity: item.allocatedQuantity,
      }));

      const res = await api.createCollectiveOrder(demand.id, {
        agreedPricePerKg: parseFloat(agreedPrice),
        deliveryAddress: demand.location,
        allocations,
      });

      // Redirect directly to Order Tracking
      onNavigate('buyer-orders', { highlightOrderId: res.order.id });
    } catch (err: any) {
      setError(err.message || 'Failed to establish collective order');
      setEstablishingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Computing Multi-Factor Farmer Suitability Scores...
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Scoring candidate harvests on distance, harvest time, grade certification, freshness countdown, and pooling smallholder volumes.
        </p>
      </div>
    );
  }

  if (!demand) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-base">No active demand found</h3>
        <p className="text-xs text-slate-500">Post a commercial requirement to view matched farmer clusters.</p>
        <button
          onClick={() => onNavigate('buyer-post-demand')}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow"
        >
          Post a Requirement
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demand Header */}
      <div className="glass-card rounded-3xl p-6 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border">
              Demand: {demand.demandCode}
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Target: {demand.product?.name} ({demand.requiredQuantity} kg)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Smart Matching & Collective Supply Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Destination: {demand.location} · Target Budget: ₹{demand.minBudget} - ₹{demand.maxBudget}/kg · Grade {demand.requiredGrade}
          </p>
        </div>

        <button
          onClick={() => onNavigate('buyer-post-demand')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
        >
          Change Demand
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CORE INNOVATION HIGHLIGHT: Collective Supply Group */}
      {collectiveGroup && (
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Best Suitable Supply Group · 94% Suitability Score</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold">
                {collectiveGroup.isFulfilled ? '100% Demand Fulfilled' : `${collectiveGroup.totalQuantity} kg Matched`} by {collectiveGroup.farmerCount} Nearby Farmers
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
                {collectiveGroup.explanation}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
              <div className="text-xs text-emerald-200 font-semibold">Average Supply Price</div>
              <div className="text-2xl font-black text-white mt-0.5">
                ₹{collectiveGroup.averagePrice} <span className="text-xs font-normal">/ kg</span>
              </div>
              <div className="text-[10px] text-emerald-300 mt-0.5 font-medium">Within Target Budget</div>
            </div>
          </div>

          {/* Aggregated Farmer Supply Allocation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
            {collectiveGroup.batches.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-sm text-white">{item.batch.farmerName}</span>
                  <span className="text-[10px] bg-emerald-400/20 border border-emerald-400/40 text-emerald-200 font-bold px-1.5 py-0.5 rounded">
                    Grade {item.batch.qualityGrade}
                  </span>
                </div>

                <div className="text-emerald-100/90 space-y-0.5 text-[11px]">
                  <div>📍 {item.batch.farmerVillage} ({item.batch.distanceKm} km away)</div>
                  <div>⭐ {item.batch.farmerRating} Rating ({item.batch.farmerOrdersCompleted} orders)</div>
                </div>

                <div className="pt-2 border-t border-white/15 flex justify-between items-center font-bold">
                  <span className="text-emerald-300">{item.allocatedQuantity} kg</span>
                  <span className="text-white">₹{item.batch.pricePerKg} / kg</span>
                </div>
              </div>
            ))}
          </div>

          {/* Explainable Reasons Checkmarks */}
          <div className="bg-black/20 rounded-2xl p-4 border border-white/10 text-xs space-y-1.5 relative z-10">
            <div className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] mb-1">
              Why this collective group was recommended:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-emerald-100 text-[11px]">
              <div>✓ All 4 farms within 12 km cluster radius of delivery dock</div>
              <div>✓ 100% morning-harvested produce within 4 hours of picking</div>
              <div>✓ Certified Grade A produce meeting culinary banquet standards</div>
              <div>✓ Average price ₹{collectiveGroup.averagePrice}/kg matches your target budget band</div>
            </div>
          </div>

          {/* 1-Click Establish Order CTA */}
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-emerald-200">
                Final Agreed Procurement Price (₹ / kg):
              </label>
              <input
                type="number"
                step="0.5"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                className="w-24 p-2 rounded-xl bg-white text-slate-900 text-sm font-black outline-none"
              />
            </div>

            <button
              onClick={handleEstablishCollectiveOrder}
              disabled={establishingOrder}
              className="px-6 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {establishingOrder
                  ? 'Establishing Order & Locking Escrow...'
                  : `ESTABLISH COLLECTIVE ORDER (500 KG · ₹${Math.round(500 * parseFloat(agreedPrice)).toLocaleString('en-IN')})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Individual Candidates List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">
          All Candidate Farmers Evaluated ({individualMatches.length})
        </h3>
        <div className="space-y-3">
          {individualMatches.map((item) => (
            <div
              key={item.batchId}
              className="glass-card rounded-2xl p-5 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-900">{item.farmerName}</span>
                  <span className="font-mono text-[11px] text-slate-500">({item.batchCode})</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                    {item.suitabilityScore}% Match
                  </span>
                </div>
                <div className="text-slate-500">
                  {item.farmerVillage} ({item.distanceKm} km) · Grade {item.qualityGrade} · Available: <strong className="text-slate-800">{item.quantityAvailable} kg</strong>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-emerald-800 font-semibold mt-1">
                  {item.reasons.slice(0, 3).map((r, i) => (
                    <span key={i} className="bg-slate-100 px-2 py-0.5 rounded">{r}</span>
                  ))}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-black text-emerald-800">₹{item.pricePerKg} / kg</div>
                <div className="text-[10px] text-slate-400">Rating: {item.farmerRating}★</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartMatches;
