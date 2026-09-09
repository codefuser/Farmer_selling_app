import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Product } from '../../types';
import {
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PostDemandProps {
  onNavigate: (view: string, params?: any) => void;
}

export const PostDemand: React.FC<PostDemandProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [requiredQuantity, setRequiredQuantity] = useState('500');
  const [minBudget, setMinBudget] = useState('20');
  const [maxBudget, setMaxBudget] = useState('25');
  const [requiredGrade, setRequiredGrade] = useState('A');
  const [maxDistanceKm, setMaxDistanceKm] = useState('20');
  const [deliveryDeadline, setDeliveryDeadline] = useState(
    new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [location, setLocation] = useState('Omalur Main Road, Fairlands, Salem');
  const [notes, setNotes] = useState('Fresh morning harvest preferred. Direct delivery before 10 AM.');

  const [loading, setLoading] = useState(false);
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getFarmerProducts().then((res) => {
      setProducts(res);
      if (res.length > 0) {
        setSelectedProductId(res[0].id);
        setMinBudget(String(res[0].referenceMinPrice));
        setMaxBudget(String(res[0].referenceMaxPrice));
      }
    });
  }, []);

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const found = products.find((p) => p.id === prodId);
    if (found) {
      setMinBudget(String(found.referenceMinPrice));
      setMaxBudget(String(found.referenceMaxPrice));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !requiredQuantity || !minBudget || !maxBudget) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.postBuyerDemand({
        productId: selectedProductId,
        requiredQuantity: parseFloat(requiredQuantity),
        minBudget: parseFloat(minBudget),
        maxBudget: parseFloat(maxBudget),
        requiredGrade,
        deliveryDeadline: new Date(deliveryDeadline).toISOString(),
        location,
        maxDistanceKm: parseFloat(maxDistanceKm),
        notes,
      });

      // Simulation of "Finding suitable nearby farmers..."
      setSearchingMatches(true);
      setTimeout(() => {
        setSearchingMatches(false);
        onNavigate('buyer-smart-matches', { demandId: res.demand.id });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to post demand');
      setLoading(false);
    }
  };

  if (searchingMatches) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Finding suitable nearby farmers...
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          The Matching Engine is scanning nearby harvests for distance, freshness, price compatibility, and pooling smallholder quantities.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Post a Commercial Requirement</h1>
        <p className="text-xs text-slate-500">
          Reverse-demand sourcing: specify what your business needs and receive matched farmer supply options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-5 border-slate-200">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Crop / Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-bold bg-white"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.nameTamil})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Required Quantity (kg)</label>
            <input
              type="number"
              min="10"
              value={requiredQuantity}
              onChange={(e) => setRequiredQuantity(e.target.value)}
              placeholder="e.g. 500"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Budget Band */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Min Target Budget (₹ / kg)</label>
            <input
              type="number"
              step="0.5"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Max Ceiling Budget (₹ / kg)</label>
            <input
              type="number"
              step="0.5"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Required Grade</label>
            <select
              value={requiredGrade}
              onChange={(e) => setRequiredGrade(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-bold"
            >
              <option value="A">Grade A (Premium)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="C">Grade C (Processing)</option>
              <option value="ANY">Any Grade</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Max Farm Distance</label>
            <select
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-medium"
            >
              <option value="15">Within 15 km</option>
              <option value="20">Within 20 km</option>
              <option value="35">Within 35 km</option>
              <option value="50">Within 50 km</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Delivery Deadline</label>
            <input
              type="datetime-local"
              value={deliveryDeadline}
              onChange={(e) => setDeliveryDeadline(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-medium"
              required
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-bold text-slate-700 mb-1">Delivery Destination Address</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-medium"
            required
          />
        </div>

        <div className="text-xs">
          <label className="block font-bold text-slate-700 mb-1">Additional Procurement Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{loading ? 'Posting Demand...' : 'POST DEMAND & MATCH FARMERS'}</span>
        </button>
      </form>
    </div>
  );
};

export default PostDemand;
