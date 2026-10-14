import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  CheckCircle2,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Package,
  Calendar,
  Clock,
  Check,
  MapPin,
  TrendingUp,
  Sprout,
  ShieldCheck,
} from 'lucide-react';

interface AddProduceProps {
  onNavigate: (view: string) => void;
}

export const AddProduce: React.FC<AddProduceProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [produceName, setProduceName] = useState('Fresh Farm Tomatoes');
  const [category, setCategory] = useState('VEGETABLES');
  const [quantity, setQuantity] = useState('250');
  const [unit, setUnit] = useState('kg');
  const [expectedPrice, setExpectedPrice] = useState('22');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [farmLocation, setFarmLocation] = useState('Omalur, Salem District');
  const [district, setDistrict] = useState('Salem');
  const [description, setDescription] = useState('Naturally cultivated country tomatoes. Uniform medium size, firm skin, harvest completed this morning.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetProduce = [
    {
      name: 'Country Tomatoes (நாட்டு தக்காளி)',
      category: 'VEGETABLES',
      unit: 'kg',
      suggestedPrice: 22,
      img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
    },
    {
      name: 'Small Shallot Onions (சின்ன வெங்காயம்)',
      category: 'VEGETABLES',
      unit: 'kg',
      suggestedPrice: 38,
      img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
    },
    {
      name: 'Organic Moringa Drumsticks (முருங்கைக்காய்)',
      category: 'VEGETABLES',
      unit: 'kg',
      suggestedPrice: 55,
      img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600',
    },
    {
      name: 'Yelakki Mountain Bananas (ஏலக்கி வாழை)',
      category: 'FRUITS',
      unit: 'kg',
      suggestedPrice: 38,
      img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
    },
    {
      name: 'Fresh Siru Keerai Spinach (சிறுகீரை)',
      category: 'GREENS',
      unit: 'bunch',
      suggestedPrice: 14,
      img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600',
    },
    {
      name: 'Traditional Ponni Paddy/Rice (பொன்னி அரிசி)',
      category: 'GRAINS',
      unit: 'kg',
      suggestedPrice: 48,
      img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
    },
  ];

  const handleSelectPreset = (preset: typeof presetProduce[0]) => {
    setProduceName(preset.name);
    setCategory(preset.category);
    setUnit(preset.unit);
    setExpectedPrice(String(preset.suggestedPrice));
    setImageUrl(preset.img);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await api.uploadImage(base64, file.name);
          setImageUrl(res.url);
        } catch {
          setImageUrl(base64);
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Image upload error');
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produceName.trim()) {
      setError('Please provide a produce name.');
      return;
    }
    const qty = parseFloat(quantity);
    const price = parseFloat(expectedPrice);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid harvest quantity.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid expected price.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await api.submitProduce({
        produceName: produceName.trim(),
        category,
        quantity: qty,
        unit,
        expectedPrice: price,
        harvestDate,
        farmLocation: farmLocation.trim(),
        district,
        description: description.trim(),
        imageUrl,
      });

      setSubmittedResult(res.submission);
    } catch (err: any) {
      setError(err.message || 'Failed to submit produce');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (submittedResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-5 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            SUBMISSION #{submittedResult.code}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            Produce Submitted Successfully!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your harvest details have been submitted to Ulavar2Ulagam Central Hub for quality review & procurement.
          </p>
        </div>

        {/* Submission Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left text-xs space-y-3 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-500">Status</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              PENDING HUB REVIEW
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Crop / Produce</span>
            <span className="font-bold text-slate-900">{submittedResult.produceName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Quantity & Price</span>
            <span className="font-bold text-slate-900">
              {submittedResult.quantity} {submittedResult.unit} @ ₹{submittedResult.expectedPrice}/{submittedResult.unit}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Total Expected Payout</span>
            <span className="font-extrabold text-emerald-800 text-sm">
              ₹{(submittedResult.quantity * submittedResult.expectedPrice).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500">Hub Location</span>
            <span className="font-semibold text-slate-700">{submittedResult.farmLocation}</span>
          </div>
        </div>

        {/* Process Next Steps */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left text-xs text-emerald-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Next Steps in Procurement:</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            1. Salem Central Hub admin will inspect your lot details.<br />
            2. Once approved, the produce is received and transferred into Central Inventory.<br />
            3. Guaranteed direct payout is issued with zero middlemen commission deductions.
          </p>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={() => setSubmittedResult(null)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            Submit Another Produce
          </button>
          <button
            onClick={() => onNavigate('farmer-produce')}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>View My Submissions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 mb-2">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ulavar2Ulagam Farmer Procurement Portal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {language === 'ta' ? 'விளைபொருள் விற்பனைக்கு சமர்ப்பிக்க' : 'Submit Harvest for Central Procurement'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'ta'
            ? 'உங்கள் விளைபொருள் விவரங்களை சமர்ப்பிக்கவும். மத்திய சரக்ககம் ஆய்வு செய்து நியாயமான விலையில் கொள்முதல் செய்யும்.'
            : 'Submit your harvest details. Ulavar2Ulagam evaluates quality and procures approved batches directly into Central Inventory.'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick 1-Click Common Tamil Nadu Harvest Presets */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
          Quick Harvest Presets (1-Click Fill)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presetProduce.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex items-center gap-2 group"
            >
              <img src={preset.img} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] text-slate-800 truncate group-hover:text-emerald-900">
                  {preset.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  ~₹{preset.suggestedPrice}/{preset.unit}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        {/* Produce Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Produce Name / விளைபொருள்</label>
            <input
              type="text"
              required
              value={produceName}
              onChange={(e) => setProduceName(e.target.value)}
              placeholder="e.g. Country Tomatoes / நாட்டு தக்காளி"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Category / வகை</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="VEGETABLES">Vegetables (காய்கறிகள்)</option>
              <option value="FRUITS">Fruits (பழங்கள்)</option>
              <option value="GREENS">Greens (கீரைகள்)</option>
              <option value="GRAINS">Grains & Rice (தானியங்கள்)</option>
              <option value="PULSES">Pulses (பருப்பு வகைகள்)</option>
              <option value="SEASONAL">Seasonal Special</option>
            </select>
          </div>
        </div>

        {/* Quantity, Unit & Expected Price */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Quantity / அளவு</label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Unit / அலகு</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="kg">kg (கிலோ)</option>
              <option value="bunch">bunch (கட்டு)</option>
              <option value="quintal">quintal (குவிண்டால்)</option>
              <option value="box">box (பெட்டி)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Expected Price (₹/{unit})
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.5"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-extrabold text-emerald-800"
            />
          </div>
        </div>

        {/* Expected Total Payout Badge */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-emerald-900 font-medium">Estimated Direct Procurement Value:</span>
          <span className="font-extrabold text-emerald-900 text-sm">
            ₹{(parseFloat(quantity || '0') * parseFloat(expectedPrice || '0')).toLocaleString()}
          </span>
        </div>

        {/* Harvest Date & Farm Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Harvest Date / அறுவடை நாள்</label>
            <input
              type="date"
              required
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Farm Location & Village</label>
            <input
              type="text"
              required
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              placeholder="e.g. Omalur, Salem District"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Description / Quality Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Description & Quality Declaration</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe produce condition, variety, packaging or harvest time..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none font-medium"
          />
        </div>

        {/* Photo Upload / Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Produce Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1.5 flex-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isUploadingImage ? 'Uploading...' : 'Upload Farm Photo'}</span>
              </button>
              <p className="text-[10px] text-slate-400">
                Or enter image URL below
              </p>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-[11px] p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98"
          >
            {isSubmitting ? (
              <span>Submitting to Central Hub...</span>
            ) : (
              <>
                <span>Submit Produce for Hub Procurement</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduce;
