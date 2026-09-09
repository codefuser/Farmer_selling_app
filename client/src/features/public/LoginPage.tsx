import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, demoSwitch } = useAuth();
  const { t } = useLanguage();

  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrMobile || !password) {
      setError('Please enter your email or mobile and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(emailOrMobile, password);
      // Navigation is handled automatically based on user role
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: string) => {
    try {
      setLoading(true);
      setError(null);
      await demoSwitch(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      {/* Brand Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-700/20">
          <Sprout className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Sign In to KisanDirect</h2>
        <p className="text-xs text-slate-500 mt-1">Community-Powered Direct Agricultural Marketplace</p>
      </div>

      {/* Demo Fast-Login Box for SIH Evaluators */}
      <div className="bg-emerald-50/80 border border-emerald-300 rounded-3xl p-5 text-xs shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>SIH Evaluator 1-Click Demo Logins</span>
        </div>
        <p className="text-slate-600 mb-3 text-[11px]">
          Click any role below to instantly load full pre-seeded data and authenticated state:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDemoClick('FARMER')}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 text-slate-800 font-bold text-left transition shadow-xs flex items-center gap-2 hover:bg-emerald-50"
          >
            <span className="text-base">🌾</span>
            <div>
              <div className="leading-tight">Farmer Kumar</div>
              <div className="text-[10px] text-emerald-700 font-normal">Grade A Tomatoes</div>
            </div>
          </button>

          <button
            onClick={() => handleDemoClick('BUYER')}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 text-slate-800 font-bold text-left transition shadow-xs flex items-center gap-2 hover:bg-emerald-50"
          >
            <span className="text-base">🏨</span>
            <div>
              <div className="leading-tight">Buyer ABC Hotel</div>
              <div className="text-[10px] text-emerald-700 font-normal">500kg Bulk Demand</div>
            </div>
          </button>

          <button
            onClick={() => handleDemoClick('COORDINATOR')}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 text-slate-800 font-bold text-left transition shadow-xs flex items-center gap-2 hover:bg-emerald-50"
          >
            <span className="text-base">🤝</span>
            <div>
              <div className="leading-tight">Coordinator Selvam</div>
              <div className="text-[10px] text-emerald-700 font-normal">Village Hub Assistant</div>
            </div>
          </button>

          <button
            onClick={() => handleDemoClick('LOGISTICS')}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 text-slate-800 font-bold text-left transition shadow-xs flex items-center gap-2 hover:bg-emerald-50"
          >
            <span className="text-base">🚚</span>
            <div>
              <div className="leading-tight">Logistics Ravi</div>
              <div className="text-[10px] text-emerald-700 font-normal">Fleet & Quality Hub</div>
            </div>
          </button>
        </div>
        <button
          onClick={() => handleDemoClick('ADMIN')}
          disabled={loading}
          className="w-full mt-2 py-1.5 rounded-xl bg-slate-900 text-emerald-300 font-bold text-[11px] text-center hover:bg-slate-800 transition"
        >
          👑 Login as Platform Admin (Lakshmi)
        </button>
      </div>

      {/* Standard Credentials Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border-slate-200">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Mobile Number or Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              placeholder="e.g. farmer@kisandirect.demo or 9842112345"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Demo password: Demo@123</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-emerald-700 font-bold hover:underline"
          >
            Register here
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
