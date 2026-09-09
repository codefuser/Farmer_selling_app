import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import VoiceListingModal from '../../components/common/VoiceListingModal';

export const CoordinatorDashboard: React.FC = () => {
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
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Coordinator Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-indigo-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Village Digital Hub Coordinator · Thalaivasal, Salem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selvam Murugesan (Village Coordinator)
            </h1>
            <p className="text-xs text-indigo-200/90 mt-1 max-w-xl">
              Assisting low digital literacy and non-smartphone farmers with assisted registration, voice listing, and collection center drop-offs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRegModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Farmer on Behalf</span>
            </button>
          </div>
        </div>
      </div>

      {/* Principle Callout */}
      <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-5 text-emerald-950 text-xs flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm">
            Core Mandate: Digital Assistant, NOT a Replacement Middleman!
          </h4>
          <p className="text-emerald-900 mt-1 leading-relaxed">
            The Village Coordinator helps digitally disconnected farmers publish produce and view demands. The farmer retains 100% sovereignty over the minimum selling price and accepts/rejects buyer offers with zero broker commission.
          </p>
        </div>
      </div>

      {regSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-3xl text-xs flex items-center justify-between">
          <div>
            <span className="font-bold">✓ {regSuccess.message}</span>
            <div className="text-[11px] text-emerald-800 font-mono mt-0.5">
              Credentials: {regSuccess.tempCredentials?.email} · Password: {regSuccess.tempCredentials?.password}
            </div>
          </div>
          <button onClick={() => setRegSuccess(null)} className="text-slate-500 font-bold">✕</button>
        </div>
      )}

      {/* Assisted Farmers Directory */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Assisted Village Farmers Directory ({farmers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Farmers connected through Thalaivasal & Attur collection hubs
            </p>
          </div>

          <button
            onClick={loadFarmers}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading farmers...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="glass-card rounded-3xl p-5 border-slate-200 hover:border-indigo-300 transition shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{farmer.user?.name}</h3>
                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                      {farmer.farmerId} · {farmer.village}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {farmer.rating}★
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{farmer.user?.mobile}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Language: <strong>{farmer.user?.preferredLanguage === 'ta' ? 'தமிழ் (Tamil)' : 'English'}</strong> · Land: {farmer.landSize || 2.5} Acres
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    Active Batches: {farmer.batches?.length || 0} batches listed
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setVoiceFarmerId(farmer.id);
                      setShowVoiceModal(true);
                    }}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Create Voice Listing on Behalf</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900">
              Assisted Farmer Registration
            </h3>
            <p className="text-xs text-slate-500">
              Register a village farmer with low digital literacy so they can participate in direct selling.
            </p>

            <form onSubmit={handleRegisterFarmer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Farmer Full Name (பெயர்)</label>
                <input
                  type="text"
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Arumugam Chinnasamy"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number (அலைபேசி)</label>
                <input
                  type="tel"
                  value={newFarmerMobile}
                  onChange={(e) => setNewFarmerMobile(e.target.value)}
                  placeholder="e.g. 9842887766"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Village (கிராமம்)</label>
                  <input
                    type="text"
                    value={newFarmerVillage}
                    onChange={(e) => setNewFarmerVillage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Land Size (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newFarmerLand}
                    onChange={(e) => setNewFarmerLand(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="flex-1 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow hover:bg-emerald-600"
                >
                  Confirm & Register
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
          alert('Batch successfully published on behalf of farmer!');
        }}
      />
    </div>
  );
};

export default CoordinatorDashboard;
