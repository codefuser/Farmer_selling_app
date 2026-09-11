import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, TrendingUp, ShieldCheck, Layers, ArrowRight, Check } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (selectedRole?: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { t, language, setLanguage } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const slides = [
    {
      icon: <Sprout className="w-10 h-10 text-emerald-500" />,
      title: t('slide1Title'),
      desc: t('slide1Desc'),
      badge: language === 'ta' ? 'அதிகாலை அறுவடை' : 'Morning Harvest',
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-emerald-500" />,
      title: t('slide2Title'),
      desc: t('slide2Desc'),
      badge: language === 'ta' ? '+15% கூடுதல் வருவாய்' : '+15% Farmer Premium',
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-emerald-500" />,
      title: t('slide3Title'),
      desc: t('slide3Desc'),
      badge: language === 'ta' ? 'பாதுகாப்பான எஸ்க்ரோ' : 'Direct Bank Payouts',
    },
    {
      icon: <Layers className="w-10 h-10 text-emerald-500" />,
      title: t('slide4Title'),
      desc: t('slide4Desc'),
      badge: language === 'ta' ? 'கூட்டு விற்பனை புதுமை' : 'Collective Pooling',
    },
  ];

  const handleFinish = (role?: string) => {
    localStorage.setItem('kisandirect_onboarded', 'true');
    onComplete(role || selectedRole || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8faf9] flex flex-col justify-between text-slate-800 p-5 max-w-md mx-auto w-full">
      {/* Top Header: Language Switcher & Skip */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
        >
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>

        <button
          onClick={() => handleFinish()}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
        >
          {t('skip')}
        </button>
      </div>

      {/* Main Slide Body */}
      {currentSlide < slides.length ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-24 h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6 shadow-sm">
            {slides[currentSlide].icon}
          </div>

          <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full mb-3">
            {slides[currentSlide].badge}
          </span>

          <h2 className="text-xl font-black text-slate-900 mb-2 leading-tight">
            {slides[currentSlide].title}
          </h2>

          <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
            {slides[currentSlide].desc}
          </p>
        </div>
      ) : (
        /* Final Step: Choose Role */
        <div className="flex-1 flex flex-col justify-center px-2 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-slate-900 mb-1">
              {t('howWillYouUse')}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'உங்கள் அனுபவத்திற்கு ஏற்றவாறு பயன்பாட்டை அமைப்போம்'
                : 'Choose your account type to personalize your experience'}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                role: 'FARMER',
                icon: '🌾',
                title: t('iAmFarmer'),
                desc: t('farmerRoleDesc'),
              },
              {
                role: 'BUYER',
                icon: '🛒',
                title: t('iAmBuyer'),
                desc: t('buyerRoleDesc'),
              },
              {
                role: 'COORDINATOR',
                icon: '🤝',
                title: t('iAmCoordinator'),
                desc: t('coordinatorRoleDesc'),
              },
            ].map((item) => {
              const active = selectedRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => setSelectedRole(item.role)}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                    active
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                  {active && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="pb-4 space-y-4">
        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2, 3, 4].map((idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        {currentSlide < slides.length ? (
          <button
            onClick={() => setCurrentSlide((prev) => prev + 1)}
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>{t('getStarted')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => handleFinish(selectedRole || undefined)}
            className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>{t('getStarted')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <div className="text-center">
          <button
            onClick={() => handleFinish()}
            className="text-[11px] font-semibold text-slate-600 hover:text-emerald-700"
          >
            {t('alreadyHaveAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
