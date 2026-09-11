import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, ArrowRight, ArrowLeft, Check, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { language, t } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<'FARMER' | 'BUYER' | 'COORDINATOR'>('FARMER');

  // Step 2: Basic Details
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('Password@123');

  // Step 3: Specific Profile Details
  const [village, setVillage] = useState('Thalaivasal');
  const [district, setDistrict] = useState('Salem');
  const [landSize, setLandSize] = useState('2.5');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('HOTEL');

  // Step 4: OTP Verification
  const [otpInput, setOtpInput] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStep1Next = () => {
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    if (!name.trim() || !mobile.trim()) {
      setError(
        language === 'ta'
          ? 'பெயர் மற்றும் கைபேசி எண்ணை உள்ளிடவும்'
          : 'Please enter your name and mobile number'
      );
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const handleStep3Next = () => {
    if (role === 'BUYER' && !businessName.trim()) {
      setError(
        language === 'ta'
          ? 'வணிகத்தின் பெயரை உள்ளிடவும்'
          : 'Please enter your business/hotel name'
      );
      return;
    }
    setError(null);
    setCurrentStep(4);
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const generatedEmail = `${mobile.replace(/\D/g, '')}@kisandirect.local`;

      await register({
        name,
        email: generatedEmail,
        mobile: mobile.startsWith('+91') ? mobile : `+91${mobile}`,
        password,
        role,
        village: role === 'FARMER' || role === 'COORDINATOR' ? village : undefined,
        district,
        businessName: role === 'BUYER' ? businessName : undefined,
        businessType: role === 'BUYER' ? businessType : undefined,
        landSize: role === 'FARMER' ? parseFloat(landSize) || 1.0 : undefined,
        preferredLanguage: language,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-95">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">
          {language === 'ta' ? 'பதிவு வெற்றிகரமாக முடிந்தது!' : 'Registration Complete!'}
        </h2>
        <p className="text-xs text-slate-600 mb-6 max-w-xs mx-auto">
          {language === 'ta'
            ? 'உங்கள் கணக்கு உருவாக்கப்பட்டது. நீங்கள் இப்போது KisanDirect-ல் வர்த்தகம் செய்யலாம்.'
            : 'Your account is ready. You are now logged in.'}
        </p>
        <button
          onClick={() => onNavigate(role === 'FARMER' ? 'farmer-dashboard' : role === 'BUYER' ? 'buyer-dashboard' : 'coordinator-dashboard')}
          className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          <span>{language === 'ta' ? 'முகப்பிற்கு செல்க' : 'Go to Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full">
      {/* Brand Header */}
      <div className="text-center mb-5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
          <Sprout className="w-6 h-6 text-emerald-100" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {t('register')}
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'ta'
            ? `படி ${currentStep} / 4: ${currentStep === 1 ? 'கணக்கு வகை' : currentStep === 2 ? 'அடிப்படை விவரங்கள்' : currentStep === 3 ? 'இருப்பிடம்' : 'சரிபார்ப்பு'}`
            : `Step ${currentStep} of 4: ${currentStep === 1 ? 'Account Role' : currentStep === 2 ? 'Basic Details' : currentStep === 3 ? 'Location & Profile' : 'Verification'}`}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full mb-5 overflow-hidden">
        <div
          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {/* Clean Form Surface */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {language === 'ta' ? 'கணக்கு வகையை தேர்வு செய்க' : 'Select Account Type'}
            </h2>

            {[
              {
                roleId: 'FARMER',
                icon: '🌾',
                title: t('iAmFarmer'),
                desc: t('farmerRoleDesc'),
              },
              {
                roleId: 'BUYER',
                icon: '🛒',
                title: t('iAmBuyer'),
                desc: t('buyerRoleDesc'),
              },
              {
                roleId: 'COORDINATOR',
                icon: '🤝',
                title: t('iAmCoordinator'),
                desc: t('coordinatorRoleDesc'),
              },
            ].map((item) => {
              const active = role === item.roleId;
              return (
                <button
                  key={item.roleId}
                  type="button"
                  onClick={() => setRole(item.roleId as any)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                    active
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                  {active && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full h-12 mt-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{language === 'ta' ? 'அடுத்து' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Basic Details */}
        {currentStep === 2 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ta' ? 'முழு பெயர்' : 'Full Name'}
              </label>
              <input
                type="text"
                placeholder={role === 'FARMER' ? 'குமார் கோவிந்தசாமி' : 'Ramesh Kumar'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('mobileNumber')}
              </label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50 focus-within:border-emerald-600">
                <span className="bg-slate-100 px-3 py-3 text-xs font-bold text-slate-600 border-r border-slate-200">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={10}
                  className="w-full px-3 py-3 text-xs bg-transparent text-slate-900 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>{language === 'ta' ? 'அடுத்து' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Role-Specific Details */}
        {currentStep === 3 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {role === 'FARMER' || role === 'COORDINATOR' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'தோட்டம் அமைந்துள்ள கிராமம்' : 'Farm Village / Area'}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="தலைவாசல் (Thalaivasal)"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'மாவட்டம்' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                {role === 'FARMER' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'விவசாய நிலத்தின் அளவு (ஏக்கர்)' : 'Farm Land Size (Acres)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={landSize}
                      onChange={(e) => setLandSize(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'வணிகத்தின் பெயர் (ஹோட்டல்/அங்காடி)' : 'Business / Hotel Name'}
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="ABC Grand Heritage Hotel"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'வணிக வகை' : 'Business Category'}
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    <option value="HOTEL">Hotel / Restaurant (விடுதி/உணவகம்)</option>
                    <option value="SUPERMARKET">Supermarket / Grocery (பல்பொருள் அங்காடி)</option>
                    <option value="WHOLESALER">Regional Wholesaler (மொத்த வியாபாரி)</option>
                    <option value="CATERING">Catering Services (சமையல் ஒப்பந்தக்காரர்)</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleStep3Next}
                className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>{language === 'ta' ? 'அடுத்து' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: OTP Verification Simulation */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ta' ? 'கைபேசி சரிபார்ப்பு (OTP)' : 'Mobile Verification (OTP)'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'ta'
                  ? `+91 ${mobile} எண்ணிற்கு 4 இலக்க OTP அனுப்பப்பட்டது (டெமோ OTP: 1234)`
                  : `4-digit OTP sent to +91 ${mobile} (Demo OTP: 1234)`}
              </p>
            </div>

            <div className="flex justify-center my-2">
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-32 text-center tracking-[0.6em] text-lg font-black py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 text-slate-900 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="flex-1 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <span>{language === 'ta' ? 'பதிவாகிறது...' : 'Creating Account...'}</span>
                ) : (
                  <>
                    <span>{language === 'ta' ? 'பதிவை முடிக்க' : 'Complete Registration'}</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="text-center mt-4">
        <button
          onClick={() => onNavigate('login')}
          className="text-xs font-semibold text-slate-600 hover:text-emerald-700"
        >
          {t('alreadyHaveAccount')}
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
