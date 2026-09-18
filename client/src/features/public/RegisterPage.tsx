import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sprout,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  User as UserIcon,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { language } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<'FARMER' | 'BUYER'>('FARMER');

  // Step 2: Basic Details
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');

  // Step 3: Farmer Specifics
  const [village, setVillage] = useState('Thalaivasal');
  const [district, setDistrict] = useState('Salem');
  const [landSize, setLandSize] = useState('2.5');
  const [farmingType, setFarmingType] = useState('Organic');
  const [mainCrops, setMainCrops] = useState('Tomato, Brinjal, Onion');
  const [experienceYears, setExperienceYears] = useState('5');

  // Step 3: Consumer Specifics
  const [businessName, setBusinessName] = useState('');
  const [consumerType, setConsumerType] = useState('INDIVIDUAL');
  const [address, setAddress] = useState('Salem Central Market');

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
          ? 'தயவுசெய்து உங்கள் பெயர் மற்றும் கைபேசி எண்ணை உள்ளிடவும்'
          : 'Please enter your full name and mobile number'
      );
      return;
    }
    if (mobile.replace(/\D/g, '').length < 10) {
      setError(
        language === 'ta'
          ? '10 இலக்க கைபேசி எண்ணை சரியாக உள்ளிடவும்'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const handleStep3Next = () => {
    if (role === 'BUYER' && consumerType !== 'INDIVIDUAL' && !businessName.trim()) {
      setError(
        language === 'ta'
          ? 'வணிகத்தின் பெயரை உள்ளிடவும்'
          : 'Please enter your business or shop name'
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

      const cleanMobile = mobile.replace(/\D/g, '');
      const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${cleanMobile}`;
      const fallbackEmail = email.trim() || `${cleanMobile}@kisandirect.local`;

      await register({
        name: name.trim(),
        email: fallbackEmail,
        mobile: formattedMobile,
        password,
        role,
        village: role === 'FARMER' ? village : undefined,
        district,
        state: 'Tamil Nadu',
        landSize: role === 'FARMER' ? parseFloat(landSize) || 2.0 : undefined,
        farmingType: role === 'FARMER' ? farmingType : undefined,
        mainCrops: role === 'FARMER' ? mainCrops : undefined,
        experienceYears: role === 'FARMER' ? parseInt(experienceYears) || 5 : undefined,
        businessName: role === 'BUYER' ? (businessName.trim() || name.trim()) : undefined,
        businessType: role === 'BUYER' ? (consumerType === 'INDIVIDUAL' ? 'LOCAL_SHOP' : consumerType) : undefined,
        consumerType: role === 'BUYER' ? consumerType : undefined,
        address: role === 'BUYER' ? address : undefined,
        preferredLanguage: language,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || (language === 'ta' ? 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full text-center select-none">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-95">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">
          {language === 'ta' ? 'பதிவு வெற்றிகரமாக முடிந்தது!' : 'Account Created Successfully!'}
        </h2>
        <p className="text-xs text-slate-600 mb-6 max-w-xs mx-auto">
          {language === 'ta'
            ? 'உங்கள் கணக்கு உருவாக்கப்பட்டது. நேரடியாக சந்தை பதிவுகள் மற்றும் விளைபொருட்களை பார்வையிடுங்கள்.'
            : 'Your account is active. Welcome to KisanDirect social marketplace.'}
        </p>
        <button
          onClick={() => onNavigate('home-feed')}
          className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          <span>{language === 'ta' ? 'முகப்பு ஊட்டத்திற்கு செல்க' : 'Go to Home Feed'}</span>
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
          {language === 'ta' ? 'புதிய கணக்கு பதிவு' : 'Create KisanDirect Account'}
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'ta'
            ? `படி ${currentStep} / 4: ${
                currentStep === 1
                  ? 'கணக்கு வகை'
                  : currentStep === 2
                  ? 'அடிப்படை விவரங்கள்'
                  : currentStep === 3
                  ? role === 'FARMER'
                    ? 'விவசாய விவரங்கள்'
                    : 'நுகர்வோர் விவரங்கள்'
                  : 'சரிபார்ப்பு'
              }`
            : `Step ${currentStep} of 4: ${
                currentStep === 1
                  ? 'Choose Role'
                  : currentStep === 2
                  ? 'Basic Info'
                  : currentStep === 3
                  ? 'Profile Setup'
                  : 'Verification'
              }`}
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full mb-5 overflow-hidden">
        <div
          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {language === 'ta' ? 'உங்கள் கணக்கு வகையை தேர்வு செய்க' : 'Select Account Type'}
            </h2>

            {/* Farmer Card */}
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              className={`w-full p-4 rounded-2xl border text-left transition flex items-start justify-between ${
                role === 'FARMER'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0 mt-0.5">🌾</span>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {language === 'ta' ? 'விவசாயி' : 'Farmer'}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {language === 'ta'
                      ? 'அறுவடை செய்த விளைபொருட்களை நேரடியாக விற்க, சரியான நியாய விலை பெற'
                      : 'Post harvests, connect directly with buyers, get guaranteed fair APMC prices'}
                  </div>
                </div>
              </div>
              {role === 'FARMER' && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Consumer / Buyer Card */}
            <button
              type="button"
              onClick={() => setRole('BUYER')}
              className={`w-full p-4 rounded-2xl border text-left transition flex items-start justify-between ${
                role === 'BUYER'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0 mt-0.5">🛒</span>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {language === 'ta' ? 'நுகர்வோர் / வாங்குபவர்' : 'Consumer / Buyer'}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {language === 'ta'
                      ? 'வீடு, உணவகம், விடுதி அல்லது கடைக்கு புதிய காய்கறிகளை நேரடியாக வாங்க'
                      : 'Buy fresh harvests directly for household, restaurants, hotels, or stores'}
                  </div>
                </div>
              </div>
              {role === 'BUYER' && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            <div className="pt-2 text-[11px] text-slate-400 text-center">
              💡 {language === 'ta' ? 'பின்னரும் ஒரே கணக்கில் இரண்டு பயன்முறைகளையும் பயன்படுத்தலாம்' : 'You can switch between Farmer and Consumer modes at any time'}
            </div>

            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full h-11 mt-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>{language === 'ta' ? 'தொடர்க' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Basic Details */}
        {currentStep === 2 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ta' ? 'முழுப் பெயர் *' : 'Full Name *'}
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <UserIcon className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'எ.கா. முருகன் குமார்' : 'e.g. Murugan Kumar'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-900 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ta' ? 'கைபேசி எண் *' : 'Mobile Number *'}
              </label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-slate-50/50">
                <span className="bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-600 border-r border-slate-200 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={10}
                  className="w-full px-3 py-2.5 text-xs bg-transparent text-slate-900 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ta' ? 'மின்னஞ்சல் (விருப்பத்தேர்வு)' : 'Email Address (Optional)'}
              </label>
              <input
                type="email"
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ta' ? 'கடவுச்சொல் *' : 'Password *'}
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-900 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-11 h-11 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>{language === 'ta' ? 'அடுத்த படி' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Role-Specific Details */}
        {currentStep === 3 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {role === 'FARMER' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'கிராமம் *' : 'Village *'}
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'மாவட்டம் *' : 'District *'}
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'நில அளவு (ஏக்கர்)' : 'Farm Size (Acres)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={landSize}
                      onChange={(e) => setLandSize(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'விவசாய முறை' : 'Farming Type'}
                    </label>
                    <select
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
                    >
                      <option value="Organic">{language === 'ta' ? 'இயற்கை விவசாயம்' : 'Organic'}</option>
                      <option value="Conventional">{language === 'ta' ? 'பாரம்பரியம்' : 'Conventional'}</option>
                      <option value="Natural">{language === 'ta' ? 'இயற்கை முறை' : 'Natural'}</option>
                      <option value="Mixed">{language === 'ta' ? 'ஒருங்கிணைந்த முறை' : 'Mixed Farming'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'முக்கிய பயிர்கள்' : 'Main Crops'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ta' ? 'எ.கா. தக்காளி, கத்தரி, முருங்கை' : 'e.g. Tomato, Brinjal, Onion'}
                    value={mainCrops}
                    onChange={(e) => setMainCrops(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    {language === 'ta'
                      ? 'பாதுகாப்பான சரிபார்ப்பு: அரசு ஆதார் எண் நேரடியாக சேமிக்கப்படாது.'
                      : 'Identity Protected: Government identity numbers are never stored in plaintext.'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'வாங்குபவர் வகை *' : 'Consumer Type *'}
                  </label>
                  <select
                    value={consumerType}
                    onChange={(e) => setConsumerType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
                  >
                    <option value="INDIVIDUAL">{language === 'ta' ? 'தனிநபர் / குடும்ப நுகர்வோர்' : 'Individual / Household'}</option>
                    <option value="HOTEL">{language === 'ta' ? 'விடுதி (Hotel)' : 'Hotel'}</option>
                    <option value="RESTAURANT">{language === 'ta' ? 'உணவகம் (Restaurant)' : 'Restaurant'}</option>
                    <option value="SUPERMARKET">{language === 'ta' ? 'பல்பொருள் அங்காடி' : 'Supermarket'}</option>
                    <option value="WHOLESALER">{language === 'ta' ? 'மொத்த வியாபாரி' : 'Wholesaler'}</option>
                    <option value="CATERING">{language === 'ta' ? 'கேட்டரிங் சேவை' : 'Catering Service'}</option>
                    <option value="LOCAL_SHOP">{language === 'ta' ? 'உள்ளூர் கடை' : 'Local Vegetable Shop'}</option>
                    <option value="OTHER">{language === 'ta' ? 'இதர வணிகம்' : 'Other'}</option>
                  </select>
                </div>

                {consumerType !== 'INDIVIDUAL' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'வணிகப் பெயர் *' : 'Business / Organization Name *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ta' ? 'எ.கா. சேலம் கிராண்ட் உணவகம்' : 'e.g. Salem Grand Kitchen'}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'டெலிவரி முகவரி *' : 'Delivery Address *'}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
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
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-slate-50/50 text-slate-900 font-medium"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-11 h-11 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleStep3Next}
                className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>{language === 'ta' ? 'சரிபார்ப்புக்கு செல்க' : 'Proceed to Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Verification & Finish */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ta' ? 'கைபேசி எண் சரிபார்ப்பு' : 'Mobile Verification'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {language === 'ta'
                ? `+91 ${mobile} எண்ணிற்கு சரிபார்ப்பு குறியீடு அனுப்பப்பட்டது.`
                : `Enter the 4-digit code sent to +91 ${mobile}.`}
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-40 mx-auto text-center text-xl tracking-widest font-black py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 text-emerald-900 focus:outline-none"
              />
              <div className="text-[11px] text-slate-400 mt-1">
                {language === 'ta' ? 'டெமோ குறியீடு: 1234' : 'Demo OTP: 1234'}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-11 h-11 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>
                  {loading
                    ? (language === 'ta' ? 'பதிவாகிறது...' : 'Creating Account...')
                    : (language === 'ta' ? 'கணக்கை உருவாக்கு' : 'Complete Registration')}
                </span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Already Have Account Link */}
      <div className="text-center mt-5">
        <button
          onClick={() => onNavigate('login')}
          className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          {language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்' : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
