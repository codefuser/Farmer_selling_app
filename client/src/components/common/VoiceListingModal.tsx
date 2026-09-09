import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, RefreshCw, X, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Product } from '../../types';

interface VoiceListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: (batch: any) => void;
  farmerProfileId?: string;
  isCoordinatorMode?: boolean;
}

interface DialogueTurn {
  sender: 'system' | 'farmer';
  textTamil: string;
  textEn: string;
}

export const VoiceListingModal: React.FC<VoiceListingModalProps> = ({
  isOpen,
  onClose,
  onBatchCreated,
  farmerProfileId,
  isCoordinatorMode = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted Voice Form Data
  const [listingData, setListingData] = useState({
    crop: 'Tomato',
    cropTamil: 'தக்காளி',
    quantity: 100,
    pricePerKg: 22,
    village: 'Thalaivasal',
    qualityGrade: 'A',
    sellByHours: 12,
  });

  const dialogueSteps: DialogueTurn[] = [
    {
      sender: 'system',
      textTamil: 'வணக்கம்! இன்று நீங்கள் என்ன விளைபொருளை விற்க விரும்புகிறீர்கள்?',
      textEn: 'Hello! What fresh crop do you have for sale today?',
    },
    {
      sender: 'farmer',
      textTamil: 'என்னிடம் 100 கிலோ நாட்டு தக்காளி உள்ளது.',
      textEn: 'I have 100 kg fresh local Tomatoes.',
    },
    {
      sender: 'system',
      textTamil: 'ஒரு கிலோ தக்காளிக்கு நீங்கள் எதிர்பார்க்கும் நியாய விலை என்ன?',
      textEn: 'What is your expected fair price per kilogram?',
    },
    {
      sender: 'farmer',
      textTamil: '22 ரூபாய்.',
      textEn: '22 Rupees per kg.',
    },
    {
      sender: 'system',
      textTamil: 'உங்கள் தோட்டம் அமைந்த கிராமம் எது?',
      textEn: 'Which village is your farm located in?',
    },
    {
      sender: 'farmer',
      textTamil: 'தலைவாசல், சேலம் மாவட்டம்.',
      textEn: 'Thalaivasal, Salem District.',
    },
    {
      sender: 'system',
      textTamil: 'அருமை! உங்கள் பட்டியல் தயார்: 100 கிலோ தக்காளி, கிலோ ₹22. சந்தையில் பதிவிடலாமா?',
      textEn: 'Listing ready! 100 kg Grade A Tomatoes at ₹22/kg. Ready to publish?',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsListening(false);
      api.getFarmerProducts().then(setProducts).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNextTurn = () => {
    if (currentStep < dialogueSteps.length - 1) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setCurrentStep((prev) => prev + 1);
      }, 1400);
    }
  };

  const handleAutoPlay = () => {
    setIsListening(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= dialogueSteps.length - 1) {
        clearInterval(interval);
        setIsListening(false);
      }
    }, 1500);
  };

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Match product
      const product = products.find((p) => p.name.toLowerCase() === listingData.crop.toLowerCase()) || products[0];

      if (!product) {
        throw new Error('Product catalog unavailable');
      }

      let res;
      if (isCoordinatorMode && farmerProfileId) {
        res = await api.coordinatorCreateBatch({
          farmerProfileId,
          productId: product.id,
          quantity: listingData.quantity,
          pricePerKg: listingData.pricePerKg,
          qualityGrade: listingData.qualityGrade,
          sellByHours: listingData.sellByHours,
          notes: 'Voice assisted listing generated automatically.',
        });
      } else {
        const sellBy = new Date(Date.now() + listingData.sellByHours * 3600 * 1000).toISOString();
        res = await api.createFarmerBatch({
          productId: product.id,
          quantity: listingData.quantity,
          pricePerKg: listingData.pricePerKg,
          qualityGrade: listingData.qualityGrade,
          harvestedAt: new Date().toISOString(),
          sellBy,
          notes: 'Voice listing published via KisanDirect Voice AI Assistant.',
        });
      }

      onBatchCreated(res.batch);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to publish batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <Mic className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Voice Listing Assistant · குரல் பதிவு
                <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full border border-emerald-400/40">
                  AI Simulated
                </span>
              </h3>
              <p className="text-xs text-emerald-100/90">
                {isCoordinatorMode
                  ? 'Coordinator Assisted Voice Listing for Farmer'
                  : 'Speak naturally in Tamil or English to list your harvest'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Chat Transcript */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          <div className="text-center">
            <button
              onClick={handleAutoPlay}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulate Complete Voice Dialogue (ஒரே கிளிக்கில் கேளுங்கள்)</span>
            </button>
          </div>

          {dialogueSteps.slice(0, currentStep + 1).map((turn, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${turn.sender === 'farmer' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                  turn.sender === 'farmer'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <p className="font-medium">{turn.textTamil}</p>
                <p className={`text-[11px] mt-0.5 ${turn.sender === 'farmer' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {turn.textEn}
                </p>
              </div>
            </div>
          ))}

          {/* Interactive Mic Listening Wave Animation */}
          {isListening && (
            <div className="flex items-center justify-center gap-1 py-3 text-emerald-600">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-7 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1.5 h-8 bg-emerald-700 rounded-full animate-bounce [animation-delay:0.45s]" />
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="text-xs font-medium text-emerald-800 ml-2">கேட்கிறது (Listening to farmer voice...)</span>
            </div>
          )}

          {/* Final Extracted Form Card */}
          {currentStep >= dialogueSteps.length - 1 && (
            <div className="bg-emerald-50 border-2 border-emerald-400/80 rounded-2xl p-4 mt-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>உறுதிப்படுத்தப்பட்ட விவரங்கள் (Auto-Extracted Listing)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 text-[10px] block">பயிர் (Crop)</span>
                  <span className="font-bold text-slate-800">Tomato · தக்காளி</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 text-[10px] block">அளவு (Quantity)</span>
                  <span className="font-bold text-slate-800">100 kg</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 text-[10px] block">எதிர்பார்க்கும் விலை (Price)</span>
                  <span className="font-bold text-emerald-700">₹22 / kg</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 text-[10px] block">கிராமம் (Village)</span>
                  <span className="font-bold text-slate-800">Thalaivasal, Salem</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleNextTurn}
              disabled={isListening || currentStep >= dialogueSteps.length - 1}
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center justify-center shadow-lg transition active:scale-95"
              title="Speak next line"
            >
              <Mic className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-slate-500 font-medium">
              {currentStep < dialogueSteps.length - 1 ? 'Tap Mic to Speak' : 'Voice Dialogue Complete'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting || currentStep < dialogueSteps.length - 1}
              className="px-5 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>பதிவிடு (Publish Batch)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceListingModal;
