import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sprout,
  MapPin,
  CheckCircle2,
  Truck,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (action: 'login' | 'register') => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { language, setLanguage } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      step: 1,
      icon: <Sprout className="w-12 h-12 text-emerald-500 animate-bounce" />,
      badge: language === 'ta' ? 'நேரடி வர்த்தகம்' : 'Direct Trade',
      title: 'விவசாயியிடம் இருந்து நேரடியாக வாங்குங்கள்',
      titleEn: 'Buy directly from local farmers',
      desc: language === 'ta'
        ? 'இடைத்தரகர்கள் இன்றி, உழைக்கும் விவசாயிகளுக்கு நியாயமான விலையும், நுகர்வோருக்கு புதிய விளைபொருளும் கிடைக்கும்.'
        : 'Zero intermediaries. Fair prices for hardworking farmers and fresh harvests directly to buyers.',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    },
    {
      step: 2,
      icon: <MapPin className="w-12 h-12 text-teal-500 animate-pulse" />,
      badge: language === 'ta' ? 'அருகாமை தோட்டம்' : 'Local Farms',
      title: 'உங்கள் அருகிலுள்ள விவசாயிகளின் புதிய பொருட்களை கண்டுபிடியுங்கள்',
      titleEn: 'Discover fresh produce from nearby farmers',
      desc: language === 'ta'
        ? 'சேலம் மற்றும் சுற்றுவட்டார கிராமத்து விவசாயிகளின் அன்றாட அதிகாலை அறுவடைகளை நொடிகளில் அறியலாம்.'
        : 'Explore daily early morning harvests from verified village farms across the Salem agricultural corridor.',
      gradient: 'from-teal-500/20 to-cyan-500/10',
      iconBg: 'bg-teal-50 border-teal-200 text-teal-600',
    },
    {
      step: 3,
      icon: <CheckCircle2 className="w-12 h-12 text-amber-500" />,
      badge: language === 'ta' ? 'வெளிப்படைத்தன்மை' : '100% Transparency',
      title: 'விலை, தரம், அளவு அனைத்தையும் தெளிவாக பாருங்கள்',
      titleEn: 'Clearly see price, quality, and quantity',
      desc: language === 'ta'
        ? 'மண்டி சந்தை வழிகாட்டி விலை, தரம் (A/B/C) மற்றும் கையிருப்பு அளவு அனைத்தும் வெளிப்படையாக இருக்கும்.'
        : 'Transparent Mandi benchmark pricing, verified harvest grades (A/B/C), and accurate available weights.',
      gradient: 'from-amber-500/20 to-emerald-500/10',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
    },
    {
      step: 4,
      icon: <Truck className="w-12 h-12 text-blue-500" />,
      badge: language === 'ta' ? 'நேரடி விநியோகம்' : 'Live Tracking',
      title: 'ஆர்டர் செய்து டெலிவரியை கண்காணியுங்கள்',
      titleEn: 'Order and track delivery live',
      desc: language === 'ta'
        ? 'பண்ணையில் சேகரிப்பது முதல் உங்கள் கதவு வரை வாகனத்தின் நேரடி நகர்வை உடனுக்குடன் பார்க்கலாம்.'
        : 'Monitor dispatch vehicle GPS live from farm collection center directly to your kitchen door.',
      gradient: 'from-blue-500/20 to-indigo-500/10',
      iconBg: 'bg-blue-50 border-blue-200 text-blue-600',
    },
    {
      step: 5,
      icon: <MessageCircle className="w-12 h-12 text-emerald-600 animate-pulse" />,
      badge: language === 'ta' ? 'நேரடி தொடர்பு' : 'Direct Connect',
      title: 'விவசாயிகளுடன் நேரடியாக தொடர்பு கொள்ளுங்கள்',
      titleEn: 'Connect directly with farmers',
      desc: language === 'ta'
        ? 'விளைபொருட்கள் குறித்த கேள்விகள் கேட்கவும், கூடுதல் தேவை பற்றி பேசவும் விவசாயிகளுடன் நேரடி அரட்டை.'
        : 'Chat 1-on-1 with farmers, ask about harvest schedules, custom packaging, and bulk availability.',
      gradient: 'from-emerald-500/20 to-green-500/10',
      iconBg: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    },
  ];

  const handleFinish = (action: 'login' | 'register') => {
    localStorage.setItem('kisandirect_onboarded', 'true');
    onComplete(action);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish('register');
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const active = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-[#f8faf9] flex flex-col justify-between text-slate-800 p-4 sm:p-6 max-w-lg mx-auto w-full select-none">
      {/* Top Header: Language Switcher, Step Badge & Skip */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="text-xs font-bold text-emerald-800 bg-white border border-emerald-200 px-3 py-1.5 rounded-full shadow-xs hover:bg-emerald-50 transition"
        >
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <span>{currentSlide + 1}</span>
          <span>/</span>
          <span>{slides.length}</span>
        </div>

        <button
          onClick={() => handleFinish('login')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
        >
          {language === 'ta' ? 'தவிர்' : 'Skip'}
        </button>
      </div>

      {/* Main Slide Card */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-3 sm:px-6 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Badge & Icon */}
        <div
          className={`w-28 h-28 rounded-3xl border-2 flex items-center justify-center mb-6 shadow-sm relative transition-all duration-300 ${active.iconBg}`}
        >
          {active.icon}
          <div className="absolute -bottom-2.5 bg-white border border-slate-200 text-slate-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            <span>{active.badge}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 leading-snug max-w-md">
          {language === 'ta' ? active.title : active.titleEn}
        </h2>

        {/* Secondary subtitle if Tamil is selected */}
        {language === 'ta' && (
          <p className="text-[11px] font-semibold text-emerald-700 mb-3">
            {active.titleEn}
          </p>
        )}

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
          {active.desc}
        </p>
      </div>

      {/* Bottom Controls Area */}
      <div className="pb-3 space-y-4">
        {/* Slide Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? 'w-8 bg-emerald-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3">
          {currentSlide > 0 && (
            <button
              onClick={handleBack}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition shadow-xs shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{language === 'ta' ? 'அடுத்தது' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleFinish('register')}
              className="flex-1 h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{language === 'ta' ? 'தொடங்குங்கள்' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Direct Login Link */}
        <div className="text-center pt-1">
          <button
            onClick={() => handleFinish('login')}
            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
          >
            {language === 'ta'
              ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்'
              : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
