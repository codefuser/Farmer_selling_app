import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { language } = useLanguage();

  const [role, setRole] = useState<'FARMER' | 'BUYER' | 'COORDINATOR'>('FARMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [village, setVillage] = useState('Thalaivasal');
  const [district, setDistrict] = useState('Salem');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('HOTEL');
  const [landSize, setLandSize] = useState('2.5');
  const [preferredLang, setPreferredLang] = useState('ta');

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('1234');
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !email) {
      setError('Please fill in required fields');
      return;
    }
    setError(null);
    setShowOtpModal(true);
  };

  const handleVerifyOtpAndRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify OTP simulation
      await api.verifyOtp(mobile, otpInput);
      setOtpVerified(true);
      setShowOtpModal(false);

      // Submit registration
      await register({
        name,
        email,
        mobile,
        password,
        role,
        preferredLanguage: preferredLang,
        village,
        district,
        state: 'Tamil Nadu',
        landSize,
        businessName,
        businessType,
        address: `${village}, ${district}`,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-700/20">
          <Sprout className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Create Your KisanDirect Account</h2>
        <p className="text-xs text-slate-500 mt-1">Direct Farmer to Buyer Agricultural Marketplace</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-200/70 p-1.5 rounded-2xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setRole('FARMER')}
          className={`py-2 rounded-xl transition ${
            role === 'FARMER' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🌾 Farmer (விவசாயி)
        </button>
        <button
          type="button"
          onClick={() => setRole('BUYER')}
          className={`py-2 rounded-xl transition ${
            role === 'BUYER' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏨 Buyer (வணிகர்)
        </button>
        <button
          type="button"
          onClick={() => setRole('COORDINATOR')}
          className={`py-2 rounded-xl transition ${
            role === 'COORDINATOR' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🤝 Coordinator (ஒருங்கிணைப்பாளர்)
        </button>
      </div>

      <form onSubmit={handleInitialSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border-slate-200">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {role === 'FARMER' ? 'Farmer Name (பெயர்)' : 'Contact Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kumar Govindasamy"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Number (அலைபேசி)</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9842112345"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. kumar@example.com"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Role Specific Fields */}
        {role === 'FARMER' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Village (கிராமம்)</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Thalaivasal"
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">District (மாவட்டம்)</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Salem"
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Land Size (Acres)</label>
              <input
                type="number"
                step="0.5"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                placeholder="2.5"
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        )}

        {role === 'BUYER' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. ABC Grand Heritage Hotel"
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="HOTEL">Hotel & Banquet</option>
                <option value="RESTAURANT">Restaurant / Kitchen</option>
                <option value="SUPERMARKET">Supermarket Retail</option>
                <option value="WHOLESALER">Wholesaler / Bulk Buyer</option>
                <option value="CATERING">Catering Company</option>
                <option value="LOCAL_SHOP">Local Retail Store</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-700 text-xs mb-1">Preferred Interface Language</label>
          <div className="flex gap-4 text-xs font-semibold">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="lang"
                value="ta"
                checked={preferredLang === 'ta'}
                onChange={() => setPreferredLang('ta')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>🇮🇳 தமிழ் (Tamil)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="lang"
                value="en"
                checked={preferredLang === 'en'}
                onChange={() => setPreferredLang('en')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>🇬🇧 English</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md transition"
        >
          Verify Mobile & Create Account
        </button>

        <div className="text-center pt-2 text-xs text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-emerald-700 font-bold hover:underline"
          >
            Sign In here
          </button>
        </div>
      </form>

      {/* Mock OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Verify Mobile OTP</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter simulated OTP sent to <strong>{mobile}</strong>
              </p>
              <div className="mt-2 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-1 font-mono">
                Demo OTP: 1234
              </div>
            </div>

            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-32 mx-auto text-center tracking-widest text-lg font-mono font-bold p-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpAndRegister}
                disabled={loading}
                className="flex-1 py-2 text-xs font-bold bg-emerald-700 text-white rounded-xl shadow hover:bg-emerald-600 transition"
              >
                {loading ? 'Verifying...' : 'Verify & Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
