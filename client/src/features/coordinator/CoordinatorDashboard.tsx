import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Users,
  PlusCircle,
  Mic,
  ShieldCheck,
  CheckCircle2,
  Package,
  Phone,
  MapPin,
  RefreshCw,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import VoiceListingModal from '../../components/common/VoiceListingModal';

export const CoordinatorDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assisted Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerMobile, setNewFarmerMobile] = useState('');
  const [newFarmerVillage, setNewFarmerVillage] = useState('Thalaivasal');
  const [newFarmerLand, setNewFarmerLand] = useState('2.0');
  const [regSuccess, setRegSuccess] = useState<any>(null);

  // Assisted Voice Listing Modal State
  const [voiceFarmerId, setVoiceFarmerId] = useState<string | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    try {
      setLoading(true);
      const res = await api.getCoordinatorFarmers();
      setFarmers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.coordinatorRegisterFarmer({
        name: newFarmerName,
        mobile: newFarmerMobile,
        village: newFarmerVillage,
        landSize: parseFloat(newFarmerLand),
        preferredLanguage: 'ta',
      });
      setRegSuccess(res);
      setShowRegModal(false);
      setNewFarmerName('');
      setNewFarmerMobile('');
      await loadFarmers();
    } catch (err: any) {
      alert(err.message || (language === 'ta' ? 'பதிவு செய்வதில் சிக்கல்' : 'Registration failed'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Coordinator Header */}
      <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {language === 'ta'
                  ? 'கிராம டிஜிட்டல் மையம் ஒருங்கிணைப்பாளர் · தலைவாசல், சேலம்'
                  : 'Village Digital Hub Coordinator · Thalaivasal, Salem'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'ta' ? 'செல்வம் முருகேசன் (கிராம ஒருங்கிணைப்பாளர்)' : 'Selvam Murugesan (Village Coordinator)'}
            </h1>
            <p className="text-xs text-indigo-200/90 mt-1 max-w-xl">
              {language === 'ta'
                ? 'ஸ்மார்ட்போன் வசதி இல்லாத விவசாயிகளுக்கு குரல்வழி பதிவேற்றம், நேரடி பதிவு மற்றும் சேகரிப்பு மைய வழிகாட்டுதல்.'
                : 'Assisting low digital literacy and non-smartphone farmers with assisted registration, voice listing, and collection center drop-offs.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowRegModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'ta' ? 'விவசாயியை பதிவு செய்' : 'Register Farmer on Behalf'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Principle Callout */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-4 sm:p-5 text-emerald-950 text-xs flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-xs sm:text-sm">
            {language === 'ta'
              ? 'முதன்மை நோக்கம்: டிஜிட்டல் உதவியாளர் மட்டுமே, புதிய இடைத்தரகர் அல்ல!'
              : 'Core Mandate: Digital Assistant, NOT a Replacement Middleman!'}
          </h4>
          <p className="text-emerald-900 mt-1 leading-relaxed text-[11px] sm:text-xs">
            {language === 'ta'
              ? 'கிராம ஒருங்கிணைப்பாளர் தொழில்நுட்ப உதவி மட்டுமே செய்கிறார். குறைந்தபட்ச விற்பனை விலையை நிர்ணயிப்பதும், வணிகரின் சலுகையை ஏற்பதும்/மறுப்பதும் விவசாயியின் முழு இறையாண்மைக்கு உட்பட்டது (0% கமிஷன்).'
              : 'The Village Coordinator helps digitally disconnected farmers publish produce and view demands. The farmer retains 100% sovereignty over minimum selling price and accepts/rejects offers with zero broker commission.'}
          </p>
        </div>
      </div>

      {regSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs flex items-center justify-between">
          <div>
            <span className="font-bold">✓ {regSuccess.message}</span>
            <div className="text-[11px] text-emerald-800 font-mono mt-0.5">
              {language === 'ta' ? 'பயனர் பெயர்' : 'Credentials'}: {regSuccess.tempCredentials?.email} •{' '}
              {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}: {regSuccess.tempCredentials?.password}
            </div>
          </div>
          <button onClick={() => setRegSuccess(null)} className="text-slate-500 font-bold p-1">
            ✕
          </button>
        </div>
      )}

      {/* Assisted Farmers Directory */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {language === 'ta'
                ? `இணைக்கப்பட்ட கிராம விவசாயிகள் (${farmers.length})`
                : `Assisted Village Farmers Directory (${farmers.length})`}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'தலைவாசல் மற்றும் ஆத்தூர் சேகரிப்பு மையங்கள் மூலமாக இணைக்கப்பட்டவர்கள்'
                : 'Farmers connected through Thalaivasal & Attur collection hubs'}
            </p>
          </div>

          <button
            onClick={loadFarmers}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">
              {language === 'ta' ? 'விவசாயிகள் விவரங்கள் பெறப்படுகின்றன...' : 'Loading farmers...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-indigo-300 transition shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{farmer.user?.name}</h3>
                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                      {farmer.farmerId} • {farmer.village}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {farmer.rating}★
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{farmer.user?.mobile}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === 'ta' ? 'மொழி' : 'Language'}:{' '}
                    <strong>{farmer.user?.preferredLanguage === 'ta' ? 'தமிழ்' : 'English'}</strong> •{' '}
                    {language === 'ta' ? 'நிலம்' : 'Land'}: {farmer.landSize || 2.5} {language === 'ta' ? 'ஏக்கர்' : 'Acres'}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    {language === 'ta' ? 'செயலில் உள்ள விளைபொருட்கள்:' : 'Active Batches:'}{' '}
                    {farmer.batches?.length || 0}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setVoiceFarmerId(farmer.id);
                      setShowVoiceModal(true);
                    }}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Mic className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{language === 'ta' ? 'விவசாயிக்காக குரல்வழி பதிவேற்றம்' : 'Create Voice Listing on Behalf'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {language === 'ta' ? 'விவசாயி நேரடி பதிவு' : 'Assisted Farmer Registration'}
              </h3>
              <button
                onClick={() => setShowRegModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'தொழில்நுட்ப பயன்பாடு அறியாத விவசாயிகளை இணைத்து நேரடி சந்தையில் விற்க உதவுங்கள்.'
                : 'Register a village farmer with low digital literacy so they can participate in direct selling.'}
            </p>

            <form onSubmit={handleRegisterFarmer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ta' ? 'விவசாயி பெயர்' : 'Farmer Full Name'}
                </label>
                <input
                  type="text"
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா. ஆறுமுகம் சின்னசாமி' : 'e.g. Arumugam Chinnasamy'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ta' ? 'கைபேசி எண்' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  value={newFarmerMobile}
                  onChange={(e) => setNewFarmerMobile(e.target.value)}
                  placeholder="9842887766"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'கிராமம்' : 'Village'}
                  </label>
                  <input
                    type="text"
                    value={newFarmerVillage}
                    onChange={(e) => setNewFarmerVillage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'நில அளவு (ஏக்கர்)' : 'Land Size (Acres)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newFarmerLand}
                    onChange={(e) => setNewFarmerLand(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="flex-1 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                >
                  {language === 'ta' ? 'பதிவு செய்' : 'Confirm & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice Listing Modal in Coordinator Mode */}
      <VoiceListingModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        farmerProfileId={voiceFarmerId || undefined}
        isCoordinatorMode={true}
        onBatchCreated={() => {
          loadFarmers();
          alert(language === 'ta' ? 'விவசாயிக்கான விளைபொருள் வெற்றிகரமாக வெளியிடப்பட்டது!' : 'Batch successfully published on behalf of farmer!');
        }}
      />
    </div>
  );
};

export default CoordinatorDashboard;
