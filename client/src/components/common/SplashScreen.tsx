import React, { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { language, t } = useLanguage();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 1.5 second total splash duration
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 400); // 400ms fade out
    }, 1400);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white flex flex-col items-center justify-center p-6 transition-opacity duration-400 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center max-w-xs animate-in zoom-in-95 duration-500">
        {/* Animated Sprout Emblem */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center shadow-2xl backdrop-blur-xl animate-pulse">
            <Sprout className="w-10 h-10 text-emerald-400 drop-shadow-md transition-transform duration-700 hover:scale-110" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-1.5">
          KisanDirect
        </h1>

        <p className="text-xs font-semibold text-emerald-300 mb-6">
          {language === 'ta'
            ? 'விவசாயியிடமிருந்து நேரடியாக உங்கள் வாங்குபவரிடம்'
            : 'Direct Harvester to Buyer Marketplace'}
        </p>

        {/* Minimal Progress Line */}
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full animate-[progress_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
