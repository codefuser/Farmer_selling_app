import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles,
  Layers,
  Flame,
  Mic,
  X,
  SlidersHorizontal,
  ChevronRight,
  Check,
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
    showToast(`Switched to: ${name} (${role})`);
  };

  return (
    <>
      {/* Discreet, Professional Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white px-3.5 py-2 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md text-xs font-medium transition-all hover:scale-105 active:scale-95"
          title="Open Demo & Evaluation Toolkit"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Demo Controls</span>
          {user && (
            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/30">
              {user.role}
            </span>
          )}
        </button>
      </div>

      {/* Floating Status Toast */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Minimal Clean Evaluation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Demo & Evaluation Toolkit</h3>
                  <p className="text-[11px] text-slate-500">Quickly test personas and scenarios</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Persona Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Switch Active Role
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { role: 'FARMER', label: 'Farmer (Muthusamy)', icon: '🌾' },
                    { role: 'BUYER', label: 'Buyer (Hotel)', icon: '🏨' },
                    { role: 'COORDINATOR', label: 'Village Lead', icon: '🤝' },
                    { role: 'LOGISTICS', label: 'Transport Fleet', icon: '🚚' },
                    { role: 'ADMIN', label: 'Govt Admin', icon: '👑' },
                  ].map((p) => {
                    const active = user?.role === p.role;
                    return (
                      <button
                        key={p.role}
                        onClick={() => handleSwitch(p.role, p.label)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition ${
                          active
                            ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{p.icon}</span>
                          <span className="truncate">{p.label}</span>
                        </span>
                        {active && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1-Click SIH Evaluation Scenarios */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Simulated Workflows
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onTriggerScenario1();
                      setIsOpen(false);
                      showToast('Triggered Scenario 1: Bulk Tomato Pool (500kg)');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition text-left group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-800">
                          Scenario 1: Collective Supply Pooling
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Hotel requests 500kg Tomatoes; pooled from 4 nearby farmers.
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      onTriggerScenario2();
                      setIsOpen(false);
                      showToast('Triggered Scenario 2: Urgent Freshness Sale');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition text-left group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 group-hover:text-amber-800">
                          Scenario 2: Perishable Freshness & Urgent Sale
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Freshness degrades; auto-discounts to commercial buyers before spoilage.
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      onTriggerScenario3();
                      setIsOpen(false);
                      showToast('Triggered Scenario 3: Assisted Voice Listing');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition text-left group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 group-hover:text-indigo-800">
                          Scenario 3: Tamil Voice Listing
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Voice assistant simulation for low-literacy farmers.
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Interface Language</span>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                  className="font-semibold text-slate-700 hover:text-emerald-700 border border-slate-200 px-2.5 py-1 rounded-lg"
                >
                  {language === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemoScenarioBar;
