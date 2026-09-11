import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import DeliveryMap from '../../components/common/DeliveryMap';
import {
  Truck,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  PlusCircle,
  FileCheck,
  AlertTriangle,
  X,
} from 'lucide-react';

export const LogisticsDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [pickups, setPickups] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quality Check Modal State
  const [showQcModal, setShowQcModal] = useState(false);
  const [qcOrderId, setQcOrderId] = useState('');
  const [qcBatchId, setQcBatchId] = useState('');
  const [qcExpectedQty, setQcExpectedQty] = useState('100');
  const [qcActualQty, setQcActualQty] = useState('98');
  const [qcDamagedQty, setQcDamagedQty] = useState('2');
  const [qcGrade, setQcGrade] = useState('A');
  const [qcRemarks, setQcRemarks] = useState(
    language === 'ta' ? 'தலைவாசல் மையத்தில் எடை சரிபார்க்கப்பட்டது. 98 கிலோ ஏற்கப்பட்டது.' : 'Verified at Thalaivasal hub. 98kg accepted.'
  );
  const [qcSuccessMsg, setQcSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, d, v, c] = await Promise.all([
        api.getPickups(),
        api.getDeliveries(),
        api.getVehicles(),
        api.getCollectionCenters(),
      ]);
      setPickups(p);
      setDeliveries(d);
      setVehicles(v);
      setCenters(c);
      if (p.length > 0) {
        setQcOrderId(p[0].orderId);
        setQcBatchId(p[0].order?.items?.[0]?.batchId || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQualityCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.submitQualityCheck({
        orderId: qcOrderId,
        batchId: qcBatchId || 'cmttx8v3k001',
        expectedQty: qcExpectedQty,
        actualQty: qcActualQty,
        damagedQty: qcDamagedQty,
        gradeAssigned: qcGrade,
        remarks: qcRemarks,
      });

      setQcSuccessMsg(
        language === 'ta'
          ? `தரச் சோதனை பதிவு செய்யப்பட்டது! நிலை: ${res.qualityCheck.status} (${res.qualityCheck.acceptedQty} கிலோ ஏற்கப்பட்டது)`
          : `Quality check recorded! Status: ${res.qualityCheck.status} (${res.qualityCheck.acceptedQty} kg accepted)`
      );
      setShowQcModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quality check');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Logistics Header */}
      <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-2">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {language === 'ta'
                  ? 'ஸ்பீட்அக்ரி வாகனப் படை மற்றும் சேகரிப்பு மையம் · சேலம் மாவட்டம்'
                  : 'SpeedAgri Fleet & Collection Hub Operations · Salem District'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'ta' ? 'போக்குவரத்து மற்றும் தரப் பரிசோதனை மையம்' : 'Logistics & Quality Verification Hub'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {language === 'ta'
                ? 'கிராம சேகரிப்பு வழித்தடங்கள், எடை சரிபார்ப்பு, சேதமதிப்பீடு மற்றும் குளிர்சாதன வாகன விநியோக கண்காணிப்பு.'
                : 'Coordinating village cluster pickups, collection center weigh-ins, damage verification, and cold-chain route delivery.'}
            </p>
          </div>

          <button
            onClick={() => setShowQcModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <FileCheck className="w-4 h-4" />
            <span>{language === 'ta' ? 'தரப் பரிசோதனை & எடை பதிவு' : 'Perform Quality Check & Weigh-In'}</span>
          </button>
        </div>
      </div>

      {qcSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>✓ {qcSuccessMsg}</span>
          <button onClick={() => setQcSuccessMsg(null)} className="p-1">✕</button>
        </div>
      )}

      {/* Fleet & Depot Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold block mb-1">
            {language === 'ta' ? 'செயலில் உள்ள வாகனங்கள்' : 'Active Vehicles'}
          </span>
          <div className="text-2xl font-black text-slate-900">{vehicles.length || 2}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {language === 'ta' ? '1.5 டன் & 2.0 டன் வாகனங்கள்' : '1.5 Ton & 2.0 Ton Trucks'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold block mb-1">
            {language === 'ta' ? 'சேகரிப்பு மையங்கள்' : 'Collection Centers'}
          </span>
          <div className="text-2xl font-black text-slate-900">{centers.length || 2}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {language === 'ta' ? 'தலைவாசல் & ஆத்தூர் முனையங்கள்' : 'Thalaivasal & Attur Depots'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold block mb-1">
            {language === 'ta' ? 'திட்டமிடப்பட்ட சேகரிப்புகள்' : 'Scheduled Pickups'}
          </span>
          <div className="text-2xl font-black text-slate-900">{pickups.length || 1}</div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
            {language === 'ta' ? 'கூட்டு விநியோக வழித்தடங்கள்' : 'Collective Supply Routes'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold block mb-1">
            {language === 'ta' ? 'வழியில் உள்ள விநியோகங்கள்' : 'Active Deliveries'}
          </span>
          <div className="text-2xl font-black text-slate-900">{deliveries.length || 1}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {language === 'ta' ? 'நேரடி GPS வழிகாட்டல்' : 'Under Live Telemetry'}
          </div>
        </div>
      </div>

      {/* Live Route Telemetry Map */}
      <div className="space-y-2.5">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
          {language === 'ta' ? 'நேரடி போக்குவரத்து வழித்தடம் மற்றும் வாகன கண்காணிப்பு' : 'Live Logistics Route Telemetry'}
        </h3>
        <DeliveryMap orderCode="ORD-1024" status="DISPATCHED" />
      </div>

      {/* Quality Check Modal */}
      {showQcModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {language === 'ta' ? 'சேகரிப்பு மையம்: தரப் பரிசோதனை & எடை' : 'Hub Quality Check & Weigh-In'}
              </h3>
              <button
                onClick={() => setShowQcModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'பண்ணையிலிருந்து சேகரிக்கப்பட்ட விளைபொருளின் உண்மையான எடை, சேதக் கழிவு மற்றும் தர நிலை பதிவு.'
                : 'Record physical weigh-in, sorting loss, and grade certification at village hub.'}
            </p>

            <form onSubmit={handleQualityCheckSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'எதிர்பார்த்த அளவு' : 'Expected Qty'}
                  </label>
                  <input
                    type="number"
                    value={qcExpectedQty}
                    onChange={(e) => setQcExpectedQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'உண்மை எடை' : 'Actual Qty'}
                  </label>
                  <input
                    type="number"
                    value={qcActualQty}
                    onChange={(e) => setQcActualQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'சேதம் (கிலோ)' : 'Damaged Qty'}
                  </label>
                  <input
                    type="number"
                    value={qcDamagedQty}
                    onChange={(e) => setQcDamagedQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ta' ? 'வழங்கப்படும் தரம்' : 'Grade Assigned'}
                </label>
                <select
                  value={qcGrade}
                  onChange={(e) => setQcGrade(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold"
                >
                  <option value="A">{language === 'ta' ? 'தரம் A (முதல் தரம்)' : 'Grade A (Premium Ripe)'}</option>
                  <option value="B">{language === 'ta' ? 'தரம் B (சாதாரண சந்தை)' : 'Grade B (Standard)'}</option>
                  <option value="C">{language === 'ta' ? 'தரம் C (பதப்படுத்துதல்)' : 'Grade C (Processing)'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ta' ? 'குறிப்புகள்' : 'Remarks'}
                </label>
                <textarea
                  rows={2}
                  value={qcRemarks}
                  onChange={(e) => setQcRemarks(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQcModal(false)}
                  className="flex-1 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                >
                  {language === 'ta' ? 'சரிபார்ப்பை சேமி' : 'Save Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard;
