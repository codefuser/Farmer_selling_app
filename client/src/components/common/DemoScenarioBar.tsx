import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles,
  Users,
  Clock,
  Mic,
  CheckCircle2,
  ChevronDown,
  Layers,
  Flame,
  UserCheck,
} from 'lucide-react';

interface DemoScenarioBarProps {
  onTriggerScenario1: () => void;
  onTriggerScenario2: () => void;
  onTriggerScenario3: () => void;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  onTriggerScenario1,
  onTriggerScenario2,
  onTriggerScenario3,
}) => {
  const { user, demoSwitch } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleSwitch = async (role: string, name: string) => {
    await demoSwitch(role);
    showToast(`Switched to Demo Persona: ${name} (${role})`);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-emerald-500/30 sticky top-0 z-50 text-xs shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Hackathon Project Identity */}
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            SIH 2026 · SIH26033
          </span>
          <span className="text-slate-300 font-medium hidden md:inline">
            Harvester to Buyer · <strong className="text-emerald-400">KisanDirect</strong>
          </span>
        </div>

        {/* Center: 1-Click Demo Scenarios */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              onTriggerScenario1();
              showToast('Scenario 1 Active: Bulk Tomato Demand (500kg) & Collective Supply Matching');
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
            title="Demonstrate 500kg Bulk Demand aggregation from 4 nearby farmers"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Scenario 1: 500kg Bulk Pool</span>
          </button>

          <button
            onClick={() => {
              onTriggerScenario2();
              showToast('Scenario 2 Active: Perishable Freshness Degradation & Urgent Sale Mode');
            }}
            className="bg-orange-600 hover:bg-orange-500 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
            title="Demonstrate Freshness countdown, Urgent Sale alert to hotels, and auto-expiry"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Scenario 2: Urgent Sale</span>
          </button>

          <button
            onClick={() => {
              onTriggerScenario3();
              showToast('Scenario 3 Active: Village Coordinator Assisted Voice Listing');
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
            title="Demonstrate Voice Listing & Assisted registration for low-literacy farmers"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Scenario 3: Voice Listing</span>
          </button>
        </div>

        {/* Right: Instant Persona Switcher */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-1 rounded-lg font-semibold transition"
          >
            {language === 'en' ? '🇮🇳 தமிழ் (Tamil)' : '🇬🇧 English'}
          </button>

          {/* Persona Switch Buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => handleSwitch('FARMER', 'Kumar')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                user?.role === 'FARMER' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              🌾 Farmer
            </button>
            <button
              onClick={() => handleSwitch('BUYER', 'ABC Hotel')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                user?.role === 'BUYER' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏨 Buyer
            </button>
            <button
              onClick={() => handleSwitch('COORDINATOR', 'Selvam')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                user?.role === 'COORDINATOR' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              🤝 Coordinator
            </button>
            <button
              onClick={() => handleSwitch('LOGISTICS', 'Ravi')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                user?.role === 'LOGISTICS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              🚚 Logistics
            </button>
            <button
              onClick={() => handleSwitch('ADMIN', 'Lakshmi')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                user?.role === 'ADMIN' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              👑 Admin
            </button>
          </div>
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {statusMsg && (
        <div className="bg-emerald-500 text-white text-center py-1 font-semibold text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          {statusMsg}
        </div>
      )}
    </header>
  );
};

export default DemoScenarioBar;
