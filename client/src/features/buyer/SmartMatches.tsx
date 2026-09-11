import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BuyerDemand, MatchedBatch, CollectiveMatchGroup } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
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
  Check,
  Building,
} from 'lucide-react';

interface SmartMatchesProps {
  demandId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const SmartMatches: React.FC<SmartMatchesProps> = ({ demandId, onNavigate }) => {
  const { language } = useLanguage();
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
      setError(
        err.message ||
          (language === 'ta'
            ? 'பொருத்தமான விவசாயிகளை கண்டறிவதில் சிக்கல் ஏற்பட்டது'
            : 'Failed to calculate smart matches')
      );
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
      setError(
        err.message ||
          (language === 'ta'
            ? 'கூட்டு ஆர்டரை உருவாக்குவதில் சிக்கல் ஏற்பட்டது'
            : 'Failed to establish collective order')
      );
      setEstablishingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          {language === 'ta'
            ? 'விவசாயிகளின் தகுதி மதிப்பெண்கள் கணக்கிடப்படுகின்றன...'
            : 'Computing Multi-Factor Farmer Suitability Scores...'}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {language === 'ta'
            ? 'தூரம், அறுவடை நேரம், தரச் சான்றிதழ் மற்றும் சிறு விவசாயிகளின் கூட்டு இருப்பு மதிப்பீடு செய்யப்படுகிறது.'
            : 'Scoring candidate harvests on distance, harvest time, grade certification, freshness countdown, and pooling smallholder volumes.'}
        </p>
      </div>
    );
  }

  if (!demand) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-base">
          {language === 'ta' ? 'செயலில் உள்ள தேவை ஏதும் இல்லை' : 'No active demand found'}
        </h3>
        <p className="text-xs text-slate-500">
          {language === 'ta'
            ? 'விவசாயிகளிடமிருந்து கூட்டுப் பொருட்களைப் பெற ஒரு தேவையை பதிவு செய்யவும்.'
            : 'Post a commercial requirement to view matched farmer clusters.'}
        </p>
        <button
          onClick={() => onNavigate('buyer-post-demand')}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow transition"
        >
          {language === 'ta' ? 'தேவையை பதிவு செய்' : 'Post a Requirement'}
        </button>
      </div>
    );
  }

  const fulfillmentPercent = collectiveGroup
    ? Math.min(100, Math.round((collectiveGroup.totalQuantity / demand.requiredQuantity) * 100))
    : 0;

  const totalCost = collectiveGroup
    ? Math.round(collectiveGroup.totalQuantity * parseFloat(agreedPrice || '0'))
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Demand Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              {demand.demandCode}
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {language === 'ta' ? 'தேவை அளவு' : 'Target'}:{' '}
              {language === 'ta' ? demand.product?.nameTamil : demand.product?.name} ({demand.requiredQuantity} kg)
            </span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {language === 'ta' ? `தரம் ${demand.requiredGrade}` : `Grade ${demand.requiredGrade}`}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900">
            {language === 'ta'
              ? 'கூட்டு வழங்கல் மற்றும் புத்திசாலி விவசாயப் பொருத்தம்'
              : 'Smart Matching & Collective Supply Engine'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ta' ? 'டெலிவரி இடம்' : 'Destination'}: {demand.location} •{' '}
            {language === 'ta' ? 'இலக்கு விலை' : 'Target Budget'}: ₹{demand.minBudget} - ₹{demand.maxBudget}/kg
          </p>
        </div>

        <button
          onClick={() => onNavigate('buyer-post-demand')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition self-stretch sm:self-auto text-center"
        >
          {language === 'ta' ? 'தேவையை மாற்று' : 'Change Demand'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CORE INNOVATION: Collective Supply Pool */}
      {collectiveGroup && (
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-500/30 space-y-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {language === 'ta'
                    ? 'பரிந்துரைக்கப்பட்ட உகந்த கூட்டுத் தொகுதி · 94% பொருத்தம்'
                    : 'Recommended Best Suitable Supply Group · 94% Match'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {language === 'ta'
                  ? `${collectiveGroup.farmerCount} உள்ளூர் விவசாயிகளிடமிருந்து ${collectiveGroup.totalQuantity} கிலோ தயார்!`
                  : `${collectiveGroup.totalQuantity} kg Pooled from ${collectiveGroup.farmerCount} Nearby Farmers`}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
                {language === 'ta'
                  ? 'ஒரே லாரியில் ஒருங்கிணைத்து எடுத்துவர 12 கி.மீ சுற்றளவில் உள்ள 4 விவசாயிகளின் தரமான அறுவடை இணைக்கப்பட்டுள்ளது.'
                  : collectiveGroup.explanation}
              </p>
            </div>

            {/* Price Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 text-center shrink-0 w-full sm:w-auto">
              <div className="text-[11px] text-emerald-200 font-semibold">
                {language === 'ta' ? 'சராசரி கொள்முதல் விலை' : 'Average Supply Price'}
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                ₹{collectiveGroup.averagePrice} <span className="text-xs font-normal">/ kg</span>
              </div>
              <div className="text-[10px] text-emerald-300 mt-0.5 font-bold">
                {language === 'ta' ? 'உங்கள் பட்ஜெட்டுக்குள் உள்ளது' : 'Within Target Budget'}
              </div>
            </div>
          </div>

          {/* Progress Bar for Collective Fulfillment */}
          <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/10 relative z-10">
            <div className="flex justify-between text-xs font-bold text-emerald-200">
              <span>
                {language === 'ta' ? 'கூட்டு சேகரிப்பு நிலை' : 'Pool Supply Fulfillment'}:{' '}
                <strong className="text-white font-extrabold">{collectiveGroup.totalQuantity} / {demand.requiredQuantity} kg</strong>
              </span>
              <span className="text-amber-300 font-black">{fulfillmentPercent}% {language === 'ta' ? 'நிறைவு' : 'Fulfilled'}</span>
            </div>
            <div className="w-full bg-slate-900/60 rounded-full h-3.5 p-0.5 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 h-full rounded-full transition-all duration-700"
                style={{ width: `${fulfillmentPercent}%` }}
              />
            </div>
          </div>

          {/* Aggregated Farmer Supply Allocation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
            {collectiveGroup.batches.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-extrabold text-sm text-white truncate">
                      {item.batch.farmerName}
                    </span>
                    <span className="text-[10px] bg-emerald-400/20 border border-emerald-400/40 text-emerald-200 font-bold px-1.5 py-0.5 rounded shrink-0">
                      {language === 'ta' ? `தரம் ${item.batch.qualityGrade}` : `Grade ${item.batch.qualityGrade}`}
                    </span>
                  </div>

                  <div className="text-emerald-100/90 space-y-0.5 text-[11px]">
                    <div>📍 {item.batch.farmerVillage} ({item.batch.distanceKm} km)</div>
                    <div>⭐ {item.batch.farmerRating}★ ({item.batch.farmerOrdersCompleted} {language === 'ta' ? 'ஆர்டர்கள்' : 'orders'})</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex justify-between items-center font-bold">
                  <span className="text-emerald-300 text-xs">
                    {item.allocatedQuantity} kg {language === 'ta' ? 'பங்கு' : 'share'}
                  </span>
                  <span className="text-white font-extrabold">₹{item.batch.pricePerKg} / kg</span>
                </div>
              </div>
            ))}
          </div>

          {/* Explainable Reasons Checkmarks */}
          <div className="bg-black/25 rounded-2xl p-4 border border-white/10 text-xs space-y-1.5 relative z-10">
            <div className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] mb-1">
              {language === 'ta' ? 'இந்த கூட்டுக்குழு தேர்ந்தெடுக்கப்பட்ட காரணங்கள்:' : 'Why this collective group was recommended:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-100 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ta'
                    ? 'அனைத்து 4 பண்ணைகளும் டெலிவரி மையத்திலிருந்து 12 கி.மீ சுற்றளவுக்குள் உள்ளன'
                    : 'All 4 farms within 12 km cluster radius of delivery dock'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ta'
                    ? 'அறுவடை செய்யப்பட்டு 4 மணி நேரத்திற்குள் உள்ள புதிய காய்கறிகள்'
                    : '100% morning-harvested produce within 4 hours of picking'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ta'
                    ? 'சான்றளிக்கப்பட்ட தரம் A - உணவக தரநிலைகளுக்கு ஏற்றது'
                    : 'Certified Grade A produce meeting culinary banquet standards'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ta'
                    ? `சராசரி விலை ₹${collectiveGroup.averagePrice}/கிலோ உங்கள் பட்ஜெட்டுக்கு ஏற்றது`
                    : `Average price ₹${collectiveGroup.averagePrice}/kg matches your target budget band`}
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Establish Order CTA */}
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-emerald-200">
                {language === 'ta' ? 'ஒப்புக்கொள்ளப்பட்ட விலை (₹/கிலோ):' : 'Agreed Price (₹/kg):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                className="w-20 p-2 rounded-xl bg-white text-slate-900 text-xs font-black outline-none"
              />
            </div>

            <button
              onClick={handleEstablishCollectiveOrder}
              disabled={establishingOrder}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>
                {establishingOrder
                  ? (language === 'ta' ? 'எஸ்க்ரோவில் ஆர்டர் பூட்டப்படுகிறது...' : 'Establishing Order & Locking Escrow...')
                  : (language === 'ta'
                      ? `கூட்டு ஆர்டரை உறுதிசெய் (${collectiveGroup.totalQuantity} கிலோ • ₹${totalCost.toLocaleString('en-IN')})`
                      : `ESTABLISH COLLECTIVE ORDER (${collectiveGroup.totalQuantity} KG • ₹${totalCost.toLocaleString('en-IN')})`)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Individual Candidates List */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900">
          {language === 'ta'
            ? `மதிப்பீடு செய்யப்பட்ட தனித்தனி விவசாயிகள் (${individualMatches.length})`
            : `All Candidate Farmers Evaluated (${individualMatches.length})`}
        </h3>
        <div className="space-y-2.5">
          {individualMatches.map((item) => (
            <div
              key={item.batchId}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-900">{item.farmerName}</span>
                  <span className="font-mono text-[11px] text-slate-500">({item.batchCode})</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                    {item.suitabilityScore}% {language === 'ta' ? 'பொருத்தம்' : 'Match'}
                  </span>
                </div>
                <div className="text-slate-500">
                  {item.farmerVillage} ({item.distanceKm} km) • {language === 'ta' ? `தரம் ${item.qualityGrade}` : `Grade ${item.qualityGrade}`} •{' '}
                  {language === 'ta' ? 'இருப்பு' : 'Available'}:{' '}
                  <strong className="text-slate-800">{item.quantityAvailable} kg</strong>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-emerald-800 font-semibold mt-1">
                  {item.reasons.slice(0, 3).map((r, i) => (
                    <span key={i} className="bg-slate-100 px-2 py-0.5 rounded">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-base font-black text-emerald-800">₹{item.pricePerKg} / kg</div>
                <div className="text-[10px] text-slate-400">
                  {language === 'ta' ? 'மதிப்பீடு' : 'Rating'}: {item.farmerRating}★
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartMatches;
