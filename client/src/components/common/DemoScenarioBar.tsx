import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles,
  Layers,
  X,
  SlidersHorizontal,
  ChevronRight,
  Check,
  PackageCheck,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Sprout,
  ArrowRight,
} from 'lucide-react';

interface DemoScenarioBarProps {
  onNavigate?: (view: string, params?: any) => void;
  onTriggerScenario1?: () => void;
  onTriggerScenario2?: () => void;
  onTriggerScenario3?: () => void;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  onNavigate,
}) => {
  const { user, demoSwitch } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleSwitch = async (role: string, name: string, targetView: string) => {
    try {
      await demoSwitch(role);
      showToast(`Switched to: ${name} (${role})`);
      if (onNavigate) {
        onNavigate(targetView);
      }
      setIsOpen(false);
    } catch (err: any) {
      showToast(`Error switching role: ${err.message || 'Network error'}`);
    }
  };

  const handleWorkflowStep = async (stepNumber: number, role: string, view: string, label: string) => {
    try {
      await demoSwitch(role);
      showToast(`Step ${stepNumber}: Switched to ${role} → ${label}`);
      if (onNavigate) {
        onNavigate(view);
      }
      setIsOpen(false);
    } catch (err: any) {
      showToast(`Step failed: ${err.message || 'Error'}`);
    }
  };

  return (
    <>
      {/* Discreet, Professional Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-emerald-950/90 hover:bg-emerald-900 text-white px-3.5 py-2.5 rounded-full shadow-2xl border border-emerald-500/40 backdrop-blur-md text-xs font-medium transition-all hover:scale-105 active:scale-95"
          title="Open Ulavar2Ulagam Live Demo Controller"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold tracking-wide">Demo Switcher</span>
          {user && (
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/40">
              {user.role}
            </span>
          )}
        </button>
      </div>

      {/* Floating Status Toast */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Live Symposium Demo Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Ulavar2Ulagam · Symposium Demo Controller
                  </h3>
                  <p className="text-[11px] text-emerald-200/80">
                    Live 4-Persona Switching & 6-Stage Demonstration Flow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* 4 Core Personas */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  1-Click Role Switching
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      role: 'FARMER',
                      name: 'Kumar Govindasamy',
                      label: 'Farmer',
                      desc: 'Producer in Salem',
                      icon: '🌾',
                      view: 'farmer-dashboard',
                    },
                    {
                      role: 'ADMIN',
                      name: 'Lakshmi Narayanan',
                      label: 'Admin Hub',
                      desc: 'Procurement & Stock',
                      icon: '👑',
                      view: 'admin-dashboard',
                    },
                    {
                      role: 'CUSTOMER',
                      name: 'Priya Sundaram',
                      label: 'Customer',
                      desc: 'Fresh Produce Buyer',
                      icon: '🛒',
                      view: 'buyer-marketplace',
                    },
                    {
                      role: 'DELIVERY_PARTNER',
                      name: 'Karthik Murugan',
                      label: 'Delivery Partner',
                      desc: 'Hub Logistics & OTP',
                      icon: '🚚',
                      view: 'logistics-dashboard',
                    },
                  ].map((p) => {
                    const active = user?.role === p.role || (p.role === 'CUSTOMER' && user?.role === 'BUYER') || (p.role === 'DELIVERY_PARTNER' && user?.role === 'LOGISTICS');
                    return (
                      <button
                        key={p.role}
                        onClick={() => handleSwitch(p.role, p.name, p.view)}
                        className={`flex flex-col text-left p-2.5 rounded-xl border transition ${
                          active
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-xs flex items-center gap-1.5">
                            <span>{p.icon}</span>
                            <span>{p.label}</span>
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <span className="text-[11px] text-slate-600 mt-1 font-medium truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6-Stage End-to-End Walkthrough */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Symposium 6-Stage Demonstration Flow
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    {
                      step: 1,
                      role: 'FARMER',
                      view: 'farmer-add-produce',
                      title: 'Step 1: Farmer Submits Produce',
                      desc: 'Submit crop details, quantity, price expectation & harvest date.',
                      icon: Sprout,
                      color: 'text-emerald-700 bg-emerald-100',
                    },
                    {
                      step: 2,
                      role: 'ADMIN',
                      view: 'admin-dashboard',
                      title: 'Step 2: Admin Approves & Procures',
                      desc: 'Review submission, agree on procurement cost, intake to Central Inventory.',
                      icon: PackageCheck,
                      color: 'text-indigo-700 bg-indigo-100',
                    },
                    {
                      step: 3,
                      role: 'ADMIN',
                      view: 'admin-dashboard',
                      title: 'Step 3: Central Inventory & Retail Pricing',
                      desc: 'Set retail selling prices, safety thresholds, and monitor live stock.',
                      icon: ShieldCheck,
                      color: 'text-amber-700 bg-amber-100',
                    },
                    {
                      step: 4,
                      role: 'CUSTOMER',
                      view: 'buyer-marketplace',
                      title: 'Step 4: Customer Browse & Order',
                      desc: 'Customer shops verified produce, adds to cart, and checks out.',
                      icon: ShoppingBag,
                      color: 'text-teal-700 bg-teal-100',
                    },
                    {
                      step: 5,
                      role: 'ADMIN',
                      view: 'admin-dashboard',
                      title: 'Step 5: Admin Packs & Assigns Partner',
                      desc: 'Transition order to PACKED and assign Delivery Partner Karthik.',
                      icon: Truck,
                      color: 'text-blue-700 bg-blue-100',
                    },
                    {
                      step: 6,
                      role: 'DELIVERY_PARTNER',
                      view: 'logistics-dashboard',
                      title: 'Step 6: Delivery Partner Delivers with OTP',
                      desc: 'Pickup from Hub → Out for Delivery → Verify OTP & mark Delivered.',
                      icon: ArrowRight,
                      color: 'text-emerald-800 bg-emerald-100',
                    },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.step}
                        onClick={() => handleWorkflowStep(s.step, s.role, s.view, s.title)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left group"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-800">
                              {s.title}
                            </div>
                            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                              {s.desc}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Switch */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Platform Language</span>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                  className="font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition"
                >
                  {language === 'en' ? 'Switch to தமிழ் (Tamil)' : 'Switch to English'}
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
