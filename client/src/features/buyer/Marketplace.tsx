import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ProduceBatch, Product } from '../../types';
import FreshnessBadge from '../../components/common/FreshnessBadge';
import {
  Store,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  RefreshCw,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface MarketplaceProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onNavigate }) => {
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sort State
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedFreshness, setSelectedFreshness] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('BEST_MATCH');

  // Offer Modal State
  const [selectedBatchForOffer, setSelectedBatchForOffer] = useState<ProduceBatch | null>(null);
  const [offerPrice, setOfferPrice] = useState('22');
  const [offerQuantity, setOfferQuantity] = useState('100');
  const [offerNotes, setOfferNotes] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    loadProduce();
  }, [selectedProduct, selectedGrade, selectedFreshness, maxPrice, sortBy]);

  const loadCatalog = async () => {
    try {
      const prods = await api.getFarmerProducts();
      setProducts(prods);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProduce = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedProduct) filters.productId = selectedProduct;
      if (selectedGrade !== 'ALL') filters.grade = selectedGrade;
      if (selectedFreshness !== 'ALL') filters.freshness = selectedFreshness;
      if (maxPrice) filters.maxPrice = maxPrice;
      filters.sortBy = sortBy;

      const res = await api.getMarketplaceProduce(filters);
      setBatches(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async () => {
    if (!selectedBatchForOffer) return;
    try {
      setSubmittingOffer(true);
      // Retrieve or use existing active demand ID
      const demands = await api.getBuyerDemands();
      const targetDemand = demands[0];

      if (!targetDemand) {
        alert('Please create a requirement/demand first before making offers.');
        onNavigate('buyer-post-demand');
        return;
      }

      await api.sendBuyerOffer(targetDemand.id, {
        batchId: selectedBatchForOffer.id,
        farmerId: selectedBatchForOffer.farmerId,
        offeredPricePerKg: parseFloat(offerPrice),
        quantity: parseFloat(offerQuantity),
        notes: offerNotes || 'Procurement offer from buyer dashboard',
      });

      setOfferSuccessMsg(`Offer of ₹${offerPrice}/kg for ${offerQuantity}kg sent to farmer!`);
      setSelectedBatchForOffer(null);
      setTimeout(() => setOfferSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Direct Farmer Produce Marketplace</h1>
          <p className="text-xs text-slate-500">
            Certified morning-harvest batches direct from local Salem agricultural clusters
          </p>
        </div>

        <button
          onClick={() => onNavigate('buyer-post-demand')}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition"
        >
          + Post Specific Bulk Demand
        </button>
      </div>

      {offerSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs font-bold animate-in fade-in">
          ✓ {offerSuccessMsg}
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {/* Product Filter */}
        <div>
          <label className="block font-bold text-slate-600 mb-1">Crop / Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.nameTamil})
              </option>
            ))}
          </select>
        </div>

        {/* Grade Filter */}
        <div>
          <label className="block font-bold text-slate-600 mb-1">Quality Grade</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
          >
            <option value="ALL">All Grades (A, B, C)</option>
            <option value="A">Grade A (Premium Ripe & Firm)</option>
            <option value="B">Grade B (Standard Market)</option>
            <option value="C">Grade C (Processing)</option>
          </select>
        </div>

        {/* Freshness Filter */}
        <div>
          <label className="block font-bold text-slate-600 mb-1">Freshness Status</label>
          <select
            value={selectedFreshness}
            onChange={(e) => setSelectedFreshness(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
          >
            <option value="ALL">All Freshness Levels</option>
            <option value="FRESH">Fresh Harvest (Morning)</option>
            <option value="AGING">Aging Lots (Culinary Ready)</option>
            <option value="URGENT">Urgent Sale (Discounted)</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block font-bold text-slate-600 mb-1">Sort Results</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
          >
            <option value="BEST_MATCH">Best Match (Multi-Factor)</option>
            <option value="NEAREST">Nearest Distance (km)</option>
            <option value="FRESHEST">Freshest Remaining</option>
            <option value="PRICE_ASC">Lowest Price</option>
            <option value="RATING">Highest Farmer Rating</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedProduct('');
              setSelectedGrade('ALL');
              setSelectedFreshness('ALL');
              setMaxPrice('');
              setSortBy('BEST_MATCH');
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Produce Batches Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading marketplace produce...</div>
      ) : batches.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-500 border-slate-200">
          <Store className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-800 text-sm">No active batches match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try relaxing filters or post a customized bulk demand.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="glass-card rounded-3xl p-5 border-slate-200 hover:border-emerald-300 transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border">
                    {batch.batchCode}
                  </span>
                  <FreshnessBadge
                    status={batch.freshnessStatus}
                    remainingText={batch.freshness?.formattedRemaining}
                  />
                </div>

                <div className="flex gap-3 my-3">
                  <img
                    src={batch.imageUrl || batch.product?.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200'}
                    alt={batch.product?.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                      {batch.product?.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Available: <strong className="text-slate-900">{batch.quantity} kg</strong> (Grade {batch.qualityGrade})
                    </div>
                    <div className="text-sm font-black text-emerald-700 mt-1">
                      ₹{batch.pricePerKg} <span className="text-xs font-normal text-slate-500">/ kg</span>
                    </div>
                  </div>
                </div>

                {/* Farmer Info Box */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {batch.farmer?.user?.name || 'Verified Farmer'}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {batch.farmer?.rating || 4.8}★
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {batch.village} ({batch.distanceKm || 5.2} km away)
                    </span>
                    <span>
                      Harvested: {new Date(batch.harvestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedBatchForOffer(batch);
                    setOfferPrice(String(batch.pricePerKg));
                    setOfferQuantity(String(Math.min(batch.quantity, 100)));
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Offer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Offer Modal */}
      {selectedBatchForOffer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900">
              Send Procurement Offer to Farmer
            </h3>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div>
                <strong>{selectedBatchForOffer.product?.name}</strong> · Batch {selectedBatchForOffer.batchCode}
              </div>
              <div className="text-slate-500 mt-0.5">
                Farmer: {selectedBatchForOffer.farmer?.user?.name} ({selectedBatchForOffer.village})
              </div>
              <div className="text-emerald-700 font-bold mt-1">
                Listed Price: ₹{selectedBatchForOffer.pricePerKg}/kg · Available: {selectedBatchForOffer.quantity} kg
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  max={selectedBatchForOffer.quantity}
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offered Price / kg (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBatchForOffer(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendOffer}
                disabled={submittingOffer}
                className="flex-1 py-2 text-xs font-bold bg-emerald-700 text-white rounded-xl shadow hover:bg-emerald-600 transition"
              >
                {submittingOffer ? 'Sending...' : 'Transmit Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
