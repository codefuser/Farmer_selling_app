import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Product } from '../../types';
import FairPriceGauge from '../../components/common/FairPriceGauge';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Package,
  Calendar,
  Clock,
  Check,
  RefreshCw,
} from 'lucide-react';

interface AddProduceProps {
  onNavigate: (view: string) => void;
}

export const AddProduce: React.FC<AddProduceProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Step flow: 1: Crop, 2: Photo, 3: Details & Price, 4: Preview, 5: Success
  const [step, setStep] = useState(1);

  // Listing Data
  const [quantity, setQuantity] = useState('100');
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'C'>('A');
  const [expectedPrice, setExpectedPrice] = useState('22');
  const [harvestTime, setHarvestTime] = useState(new Date().toISOString().slice(0, 16));
  const [sellByHours, setSellByHours] = useState(12);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBatch, setCreatedBatch] = useState<any>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
    setStep(2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setError(null);

      // Local preview
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setImagePreview(base64Data);

        // Upload to server API
        try {
          const res = await api.uploadImage(base64Data, file.name);
          setUploadedImageUrl(res.url);
        } catch (uploadErr) {
          // Fallback to base64 preview if backend upload has transient issues
          setUploadedImageUrl(base64Data);
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
      setIsUploadingImage(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedProduct) return;
    try {
      setIsSubmitting(true);
      setError(null);

      const harvestDate = new Date(harvestTime);
      const sellByDate = new Date(harvestDate.getTime() + sellByHours * 3600 * 1000);

      const res = await api.createFarmerBatch({
        productId: selectedProduct.id,
        quantity: parseFloat(quantity),
        pricePerKg: parseFloat(expectedPrice),
        qualityGrade,
        harvestedAt: harvestDate.toISOString(),
        sellBy: sellByDate.toISOString(),
        imageUrl: uploadedImageUrl || selectedProduct.imageUrl,
        notes: `Fresh ${selectedProduct.name} listed directly by farmer.`,
      });

      setCreatedBatch(res.batch);
      setStep(5); // Success step
    } catch (err: any) {
      setError(err.message || 'Failed to publish produce');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5: Success Screen
  if (step === 5 && createdBatch) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-95">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-1">
          {t('batchPublishedSuccess')}
        </h2>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 my-4 text-xs max-w-xs mx-auto">
          <span className="text-slate-500 block mb-0.5">
            {language === 'ta' ? 'பொருள் குறியீடு' : 'Batch Code'}
          </span>
          <span className="font-mono font-bold text-sm text-emerald-800">
            {createdBatch.batchCode}
          </span>
          <div className="mt-2 text-slate-700 font-semibold">
            {quantity} kg {language === 'ta' ? selectedProduct?.nameTamil : selectedProduct?.name} @ ₹{expectedPrice}/kg
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => onNavigate('farmer-produce')}
            className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>{language === 'ta' ? 'என் பொருட்களில் பார்க்க' : 'View in My Produce'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setStep(1);
              setImagePreview(null);
              setUploadedImageUrl(null);
              setCreatedBatch(null);
            }}
            className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            {language === 'ta' ? '+ இன்னொரு பொருள் சேர்க்க' : '+ Add Another Produce'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-md sm:max-w-xl mx-auto px-4 py-5 space-y-4">
      {/* Header & Steps Indicator */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900">
            {t('addProduce')}
          </h1>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {language === 'ta' ? `படி ${step} / 4` : `Step ${step} of 4`}
          </span>
        </div>

        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Hidden File Inputs for Camera & Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Step 1: Visual Crop Selection */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3 animate-in fade-in duration-150">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {t('whatSelling')}
          </h2>

          <div className="grid grid-cols-3 gap-2.5">
            {products.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProductSelect(p)}
                  className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-xs border border-slate-100">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                  </div>
                  <span className="text-xs leading-tight font-bold">
                    {language === 'ta' ? p.nameTamil : p.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    ₹{p.referenceMinPrice}–₹{p.referenceMaxPrice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Photo Upload */}
      {step === 2 && selectedProduct && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-0.5">
              {language === 'ta' ? selectedProduct.nameTamil : selectedProduct.name}
            </span>
            <h2 className="text-base font-black text-slate-900">
              {t('addPhotos')}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'புகைப்படம் சேர்த்தால் வாங்குபவர்கள் விரைவாக வாங்குவர்'
                : 'Produce with clear harvest photos receives 3x faster buyer orders'}
            </p>
          </div>

          {/* Photo Preview or Default */}
          <div className="w-full h-48 rounded-2xl bg-slate-100 overflow-hidden border-2 border-dashed border-slate-300 relative flex items-center justify-center">
            {imagePreview || uploadedImageUrl ? (
              <img
                src={imagePreview || uploadedImageUrl!}
                alt="Uploaded produce"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 opacity-60"
                />
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'ta' ? 'இயல்புநிலை படம் காட்டப்படும்' : 'Default catalog image active'}
                </span>
              </div>
            )}

            {isUploadingImage && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white text-xs font-bold gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'ta' ? 'பதிவேற்றப்படுகிறது...' : 'Uploading image...'}</span>
              </div>
            )}
          </div>

          {/* Touch Buttons: Camera & Gallery */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="h-12 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>{t('takePhoto')}</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <ImageIcon className="w-4 h-4 text-slate-600" />
              <span>{t('chooseGallery')}</span>
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-12 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>{language === 'ta' ? 'அடுத்து (விவரங்கள்)' : 'Continue to Details'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Quantity, Price, Grade & Shelf Life */}
      {step === 3 && selectedProduct && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-0.5">
              {language === 'ta' ? selectedProduct.nameTamil : selectedProduct.name}
            </span>
            <h2 className="text-base font-black text-slate-900">
              {language === 'ta' ? 'அளவு மற்றும் விலை விவரங்கள்' : 'Quantity & Price Details'}
            </h2>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('cropQuantity')}
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-3 text-sm font-bold bg-transparent text-slate-900 focus:outline-none"
              />
              <span className="bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600 border-l border-slate-200">
                kg
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-1.5 mt-2">
              {['50', '100', '200', '500'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    quantity === preset
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {preset} kg
                </button>
              ))}
            </div>
          </div>

          {/* Price per kg with FairPriceGauge */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('expectedPriceKg')}
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
              <span className="bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600 border-r border-slate-200">
                ₹
              </span>
              <input
                type="number"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="w-full px-3.5 py-3 text-sm font-bold bg-transparent text-slate-900 focus:outline-none"
              />
              <span className="bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600 border-l border-slate-200">
                / kg
              </span>
            </div>

            {/* Fair Price Transparency Gauge */}
            <FairPriceGauge
              enteredPrice={parseFloat(expectedPrice) || 0}
              minPrice={selectedProduct.referenceMinPrice}
              maxPrice={selectedProduct.referenceMaxPrice}
              modalPrice={Math.round((selectedProduct.referenceMinPrice + selectedProduct.referenceMaxPrice) / 2)}
              productName={language === 'ta' ? selectedProduct.nameTamil : selectedProduct.name}
            />
          </div>

          {/* Quality Grade Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('qualityGrade')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['A', 'B', 'C'] as const).map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setQualityGrade(grade)}
                  className={`py-2.5 rounded-xl border text-center transition ${
                    qualityGrade === grade
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-xs'
                      : 'border-slate-200 text-slate-700 font-semibold hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs block">
                    {language === 'ta' ? `தரம் ${grade}` : `Grade ${grade}`}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-normal mt-0.5">
                    {grade === 'A' ? (language === 'ta' ? 'உயர்தரம்' : 'Premium') : grade === 'B' ? (language === 'ta' ? 'நடுத்தரம்' : 'Standard') : (language === 'ta' ? 'சாதாரண' : 'Economy')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Shelf Life Hours */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'ta' ? 'எத்தனை மணி நேரத்திற்குள் விற்க வேண்டும்?' : 'Sell-By Timeframe'}
            </label>
            <select
              value={sellByHours}
              onChange={(e) => setSellByHours(parseInt(e.target.value))}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:border-emerald-600"
            >
              <option value={8}>8 {language === 'ta' ? 'மணி நேரம் (அதிகாலை அறுவடை)' : 'Hours (Fresh Morning)'}</option>
              <option value={12}>12 {language === 'ta' ? 'மணி நேரம் (இன்றே விற்க)' : 'Hours (Same Day)'}</option>
              <option value={24}>24 {language === 'ta' ? 'மணி நேரம் (நாளைக்குள்)' : 'Hours (Next Day)'}</option>
              <option value={48}>48 {language === 'ta' ? 'மணி நேரம்' : 'Hours'}</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-12 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>{language === 'ta' ? 'முன்னோட்டம் பார்க்க' : 'Preview Listing'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preview Before Publish */}
      {step === 4 && selectedProduct && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {t('previewListing')}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'விவரங்களை உறுதி செய்து சந்தையில் வெளியிடவும்'
                : 'Review details before publishing to the live marketplace'}
            </p>
          </div>

          {/* Visual Preview Card */}
          <div className="rounded-2xl border-2 border-emerald-500/80 overflow-hidden bg-emerald-50/40 p-3">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-emerald-200">
                <img
                  src={imagePreview || uploadedImageUrl || selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="inline-block bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                  {language === 'ta' ? 'புதிய அறுவடை' : 'Fresh Harvest'}
                </span>
                <h3 className="font-black text-sm text-slate-900 truncate">
                  {language === 'ta' ? selectedProduct.nameTamil : selectedProduct.name}
                </h3>
                <div className="text-xs font-bold text-emerald-800 mt-0.5">
                  ₹{expectedPrice} / kg
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {quantity} kg · {language === 'ta' ? `தரம் ${qualityGrade}` : `Grade ${qualityGrade}`}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">{language === 'ta' ? 'மொத்த மதிப்பு' : 'Total Value'}</span>
                <span className="font-bold text-slate-900">₹{(parseFloat(quantity) * parseFloat(expectedPrice)).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{language === 'ta' ? 'விற்பனை அவகாசம்' : 'Sell By'}</span>
                <span className="font-bold text-slate-900">{sellByHours} {language === 'ta' ? 'மணி நேரம்' : 'hours'}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="h-12 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublish}
              className="flex-1 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <span>{language === 'ta' ? 'வெளியிடப்படுகிறது...' : 'Publishing...'}</span>
              ) : (
                <>
                  <span>{t('publishBatch')}</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduce;
