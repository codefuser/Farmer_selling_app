import React from 'react';
import {
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Mic,
  Users,
  Smartphone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ForFarmersPageProps {
  onNavigate: (view: string) => void;
  onOpenVoiceModal: () => void;
}

export const ForFarmersPage: React.FC<ForFarmersPageProps> = ({ onNavigate, onOpenVoiceModal }) => {
  const { language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 bg-emerald-700/40 px-3 py-1 rounded-full border border-emerald-400/30">
            {language === 'ta' ? 'விவசாயிகளுக்கு மட்டும்' : 'Empowering Farm Producers'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 leading-tight">
            {language === 'ta'
              ? 'உங்கள் உழைப்புக்கான முழு லாபமும் உங்களுக்கே.'
              : 'Keep Your Full Harvest Value. Say No to Mandi Deductions.'}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base mt-4 leading-relaxed">
            {language === 'ta'
              ? 'இடைத்தரகர்கள் இன்றி, உங்கள் கிராமத்தில் உள்ள பிற விவசாயிகளுடன் இணைந்து மொத்த ஆர்டர்களைப் பெறுங்கள். எளிய தமிழ் இடைமுகம் மற்றும் குரல் பதிவு மூலம் பயன்படுத்தலாம்.'
              : 'Eliminate commission cuts, unfair grading deductions, and distress selling. Pool with fellow village farmers to supply bulk buyers, with 100% price control and voice-assisted digital access.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3 rounded-2xl bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg hover:bg-emerald-300 transition"
            >
              {language === 'ta' ? 'விவசாயியாக பதிவு செய்ய' : 'Register as Farmer'}
            </button>
            <button
              onClick={onOpenVoiceModal}
              className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/20 hover:bg-white/20 backdrop-blur-md transition flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-emerald-300" />
              <span>{language === 'ta' ? 'குரல் பதிவு முயற்சி செய்க' : 'Try Voice Listing'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 border-slate-200">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Fair Price Reference Guide</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Never underprice or get cheated. KisanDirect displays real-time market reference bands for your district (e.g. ₹20 - ₹25/kg) so you can price confidently.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 border-slate-200">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Collective Bulk Orders</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Own only 1 acre with 100 kg harvest? Combine with 4 fellow village farmers to fulfill lucrative 500 kg hotel orders that single smallholders could never reach.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 border-slate-200">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Digital Coordinator & Tamil Voice</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            No smartphone skills needed. Your local Village Coordinator Selvam registers your harvest, or you can speak your details directly in தமிழ் using our voice assistant.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForFarmersPage;
