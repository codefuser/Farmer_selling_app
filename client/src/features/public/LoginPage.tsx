import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Lock, Phone, Mail, ArrowRight, AlertCircle, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, demoSwitch } = useAuth();
  const { t, language } = useLanguage();

  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoAccordion, setShowDemoAccordion] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = authMode === 'phone' ? (phone.startsWith('+91') ? phone : `+91${phone}`) : email;

    if (!identifier || !password) {
      setError(
        language === 'ta'
          ? 'தயவுசெய்து உங்கள் விவரங்களை சரியாக உள்ளிடவும்'
          : 'Please enter your mobile/email and password'
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(identifier, password);
      onNavigate('home-feed');
    } catch (err: any) {
      setError(
        language === 'ta'
          ? 'உள்நுழைவு தோல்வியடைந்தது. விவரங்களை சரிபார்க்கவும்.'
          : err.message || 'Login failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPersona = async (role: string) => {
    try {
      setLoading(true);
      setError(null);
      await demoSwitch(role);
      onNavigate('home-feed');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <Sprout className="w-8 h-8 text-emerald-100" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {t('login')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'ta'
            ? 'உங்கள் கணக்கில் உள்நுழைந்து வர்த்தகம் தொடங்குங்கள்'
            : 'Sign in to access your direct agricultural portal'}
        </p>
      </div>

      {/* Clean Single-Surface Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        {/* Toggle between Phone & Email */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMode('phone')}
            className={`flex-1 py-2 rounded-lg transition ${
              authMode === 'phone'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'ta' ? 'கைபேசி எண்' : 'Mobile Phone'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('email')}
            className={`flex-1 py-2 rounded-lg transition ${
              authMode === 'email'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'ta' ? 'மின்னஞ்சல்' : 'Email Address'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'phone' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('mobileNumber')}
              </label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-slate-50/50">
                <span className="bg-slate-100 px-3 py-3 text-xs font-bold text-slate-600 border-r border-slate-200 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className="w-full px-3 py-3 text-xs bg-transparent text-slate-900 focus:outline-none font-medium"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  placeholder="farmer@kisandirect.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-900 focus:outline-none font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('password')}
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-transparent text-slate-900 focus:outline-none font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 mt-2 active:scale-98"
          >
            {loading ? (
              <span>{language === 'ta' ? 'சரிபார்க்கிறது...' : 'Signing in...'}</span>
            ) : (
              <>
                <span>{t('login')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Persona Quick Switcher (Accordion) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDemoAccordion(!showDemoAccordion)}
            className="w-full flex items-center justify-between text-xs font-bold text-emerald-800 bg-emerald-50/60 hover:bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200/80 transition"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('tryDemo')}</span>
            </span>
            {showDemoAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDemoAccordion && (
            <div className="mt-2 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 animate-in fade-in duration-150 text-xs">
              {[
                { role: 'FARMER', label: language === 'ta' ? 'விவசாயி (குமார்)' : 'Farmer (Kumar)', icon: '🌾' },
                { role: 'BUYER', label: language === 'ta' ? 'வாங்குபவர் (ஹோட்டல்)' : 'Buyer (ABC Hotel)', icon: '🏨' },
                { role: 'COORDINATOR', label: language === 'ta' ? 'ஒருங்கிணைப்பாளர் (செல்வம்)' : 'Coordinator (Selvam)', icon: '🤝' },
                { role: 'LOGISTICS', label: language === 'ta' ? 'விநியோகம் (ரவி குமார்)' : 'Logistics (Ravi)', icon: '🚚' },
                { role: 'ADMIN', label: language === 'ta' ? 'நிர்வாகி (லட்சுமி)' : 'Admin (Lakshmi)', icon: '👑' },
              ].map((persona) => (
                <button
                  key={persona.role}
                  type="button"
                  onClick={() => handleDemoPersona(persona.role)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 transition"
                >
                  <span className="flex items-center gap-2">
                    <span>{persona.icon}</span>
                    <span className="font-semibold">{persona.label}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">
                    {language === 'ta' ? 'உள்நுழை' : 'Login'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="text-center mt-5">
        <button
          onClick={() => onNavigate('register')}
          className="text-xs font-semibold text-slate-600 hover:text-emerald-700"
        >
          {t('dontHaveAccount')}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
