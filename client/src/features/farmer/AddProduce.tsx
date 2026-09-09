import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Product } from '../../types';
import FairPriceGauge from '../../components/common/FairPriceGauge';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  Package,
} from 'lucide-react';

interface AddProduceProps {
  onNavigate: (view: string) => void;
}

export const AddProduce: React.FC<AddProduceProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState('100');
  const [qualityGrade, setQualityGrade] = useState('A');
  const [expectedPrice, setExpectedPrice] = useState('22');
  const [harvestTime, setHarvestTime] = useState(new Date().toISOString().slice(0, 16));
  const [sellByHours, setSellByHours] = useState(12);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBatch, setCreatedBatch] = useState<any>(null);

  useEffect(() => {
    api.getFarmerProducts().then((res) => {
      setProducts(res);
      if (res.length > 0) {
        setSelectedProduct(res[0]);
        setExpectedPrice(String(res[0].referenceMinPrice + 2));
      }
    });
  }, []);

  const handleProductSelect = (p: Product) => {
    setSelectedProduct(p);
    setExpectedPrice(String(p.referenceMinPrice + 2));
    setSellByHours(p.defaultShelfHours || 12);
  };

  const handleSubmit = async () => {
    if (!selectedProduct) return;
    try {
      setIsSubmitting(true);
      setError(null);

      const harvestDate = new Date(harvestTime);
      const sellByDate = new Date(harvestDate.getTime() + sellByHours * 3600 * 1000).toISOString();

      const res = await api.createFarmerBatch({
        productId: selectedProduct.id,
        quantity: parseFloat(quantity),
        pricePerKg: parseFloat(expectedPrice),
        qualityGrade,
        harvestedAt: harvestDate.toISOString(),
        sellBy: sellByDate,
        imageUrl: selectedProduct.imageUrl,
        notes,
      });

      setCreatedBatch(res.batch);
      setStep(4); // Success step
    } catch (err: any) {
      setError(err.message || 'Failed to publish produce batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Stepper Indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
        <span className={step >= 1 ? 'text-emerald-700 font-extrabold' : ''}>1. பயிர் தேர்வு (Crop)</span>
        <span>&rarr;</span>
        <span className={step >= 2 ? 'text-emerald-700 font-extrabold' : ''}>2. அளவு & விலை (Price)</span>
        <span>&rarr;</span>
        <span className={step >= 3 ? 'text-emerald-700 font-extrabold' : ''}>3. மதிப்பாய்வு (Review)</span>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-200">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Select Crop */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">விளைபொருளை தேர்வு செய்க (Select Crop)</h2>
              <p className="text-xs text-slate-500">Choose the vegetable or fruit you have harvested</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProductSelect(p)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col items-center text-center gap-2 ${
                    selectedProduct?.id === p.id
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">{p.nameTamil}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Ref: ₹{p.referenceMinPrice}-₹{p.referenceMaxPrice}/{p.unit}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2"
              >
                <span>அடுத்து (Next)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Quantity, Grade, Price & Freshness */}
        {step === 2 && selectedProduct && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {selectedProduct.name} · {selectedProduct.nameTamil}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Standard Fresh Shelf Life: {selectedProduct.defaultShelfHours} Hours
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  அளவு (Available Quantity in {selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">தரம் (Quality Grade)</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
                >
                  <option value="A">Grade A (Premium / Export Quality / Ripe & Firm)</option>
                  <option value="B">Grade B (Standard Market / Daily Culinary)</option>
                  <option value="C">Grade C (Processing / Curry Pulp)</option>
                </select>
              </div>
            </div>

            {/* Fair Price Reference Gauge */}
            <FairPriceGauge
              enteredPrice={parseFloat(expectedPrice)}
              minPrice={selectedProduct.referenceMinPrice}
              maxPrice={selectedProduct.referenceMaxPrice}
              modalPrice={(selectedProduct.referenceMinPrice + selectedProduct.referenceMaxPrice) / 2}
              unit={selectedProduct.unit}
              productName={selectedProduct.name}
            />

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                நீங்கள் எதிர்பார்க்கும் விலை (Expected Price per {selectedProduct.unit} in ₹)
              </label>
              <input
                type="number"
                step="0.5"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-black text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">அறுவடை நேரம் (Harvest Time)</label>
                <input
                  type="datetime-local"
                  value={harvestTime}
                  onChange={(e) => setHarvestTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  விற்பனை கால வரம்பு (Sell-By Hours)
                </label>
                <select
                  value={sellByHours}
                  onChange={(e) => setSellByHours(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none bg-white font-medium"
                >
                  <option value={8}>8 Hours (Fast perishables / Leafy greens)</option>
                  <option value={12}>12 Hours (Standard morning tomatoes)</option>
                  <option value={24}>24 Hours (Next-day delivery)</option>
                  <option value={48}>48 Hours (Hardy vegetables)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
              >
                பின்செல் (Back)
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow flex items-center gap-2"
              >
                <span>மதிப்பாய்வு செய்க (Review)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Publish */}
        {step === 3 && selectedProduct && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">விவரங்களை சரிபார்க்கவும் (Review Listing)</h2>
              <p className="text-slate-500">Ensure harvest details are accurate before publishing to active demand marketplace</p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">விளைபொருள் (Product)</span>
                <span className="font-bold text-slate-900">
                  {selectedProduct.name} ({selectedProduct.nameTamil})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">அளவு (Quantity)</span>
                <span className="font-bold text-slate-900">{quantity} kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">தரம் (Grade)</span>
                <span className="font-bold text-slate-900">Grade {qualityGrade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">எதிர்பார்க்கும் விலை (Price)</span>
                <span className="font-bold text-emerald-800 text-sm">₹{expectedPrice} / kg</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">விற்பனை காலக்கெடு (Sell-By)</span>
                <span className="font-bold text-slate-900">{sellByHours} மணிநேரம் (Hours)</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
              >
                பின்செல் (Back)
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'பதிவேற்றப்படுகிறது...' : 'PUBLISH BATCH'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && createdBatch && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border">
                Batch ID: {createdBatch.batchCode}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                விளைபொருள் வெற்றிகரமாக சந்தையில் பதிவிடப்பட்டது!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Your produce batch is now live. Nearby bulk buyers and hotels searching for {selectedProduct?.name} are being matched in real-time.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => onNavigate('farmer-produce')}
                className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-600 transition"
              >
                என் பொருட்கள் பார் (View My Batches)
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setCreatedBatch(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                மற்றொரு பொருள் சேர்க்க (Add Another)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduce;
