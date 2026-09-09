import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

export const LogisticsDashboard: React.FC = () => {
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
  const [qcRemarks, setQcRemarks] = useState('Verified at Thalaivasal hub. 96kg accepted.');
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

      setQcSuccessMsg(`Quality check recorded! Status: ${res.qualityCheck.status} (${res.qualityCheck.acceptedQty} kg accepted)`);
      setShowQcModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quality check');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Logistics Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-200 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>SpeedAgri Fleet & Collection Hub Operations · Salem District</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Logistics & Quality Verification Hub
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Coordinating village cluster pickups, collection center weigh-ins, damage verification, and cold-chain route delivery.
            </p>
          </div>

          <button
            onClick={() => setShowQcModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" />
            <span>Perform Quality Check & Weigh-In</span>
          </button>
        </div>
      </div>

      {qcSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>✓ {qcSuccessMsg}</span>
          <button onClick={() => setQcSuccessMsg(null)}>✕</button>
        </div>
      )}

      {/* Fleet & Depot Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="glass-card rounded-2xl p-4 border-slate-200">
          <span className="text-slate-400 font-semibold block mb-1">Active Vehicles</span>
          <div className="text-2xl font-black text-slate-900">{vehicles.length || 2}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">1.5 Ton & 2.0 Ton Trucks</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border-slate-200">
          <span className="text-slate-400 font-semibold block mb-1">Collection Centers</span>
          <div className="text-2xl font-black text-slate-900">{centers.length || 2}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Thalaivasal & Attur Depots</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border-slate-200">
          <span className="text-slate-400 font-semibold block mb-1">Scheduled Pickups</span>
          <div className="text-2xl font-black text-slate-900">{pickups.length || 1}</div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">Collective Supply Routes</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border-slate-200">
          <span className="text-slate-400 font-semibold block mb-1">Active Deliveries</span>
          <div className="text-2xl font-black text-slate-900">{deliveries.length || 1}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Under Live Telemetry</div>
        </div>
      </div>

      {/* Live Route Telemetry Map */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-base text-slate-900">Live Logistics Route Telemetry</h3>
        <DeliveryMap orderCode="ORD-1024" status="DISPATCHED" />
      </div>

      {/* Quality Check Modal */}
      {showQcModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900">
              Collection Center Quality Check & Weigh-In
            </h3>
            <p className="text-xs text-slate-500">
              Record physical weigh-in, sorting loss, and grade certification at village hub.
            </p>

            <form onSubmit={handleQualityCheckSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Qty (kg)</label>
                  <input
                    type="number"
                    value={qcExpectedQty}
                    onChange={(e) => setQcExpectedQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actual Weighed (kg)</label>
                  <input
                    type="number"
                    value={qcActualQty}
                    onChange={(e) => setQcActualQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Damaged / Bruised (kg)</label>
                  <input
                    type="number"
                    value={qcDamagedQty}
                    onChange={(e) => setQcDamagedQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 outline-none text-rose-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verified Grade</label>
                  <select
                    value={qcGrade}
                    onChange={(e) => setQcGrade(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 outline-none bg-white font-bold"
                  >
                    <option value="A">Grade A (Passed Premium)</option>
                    <option value="B">Grade B (Standard Market)</option>
                    <option value="C">Grade C (Processing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Remarks</label>
                <textarea
                  value={qcRemarks}
                  onChange={(e) => setQcRemarks(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-xl border border-slate-200 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQcModal(false)}
                  className="flex-1 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow hover:bg-emerald-600"
                >
                  Confirm & Certify Lot
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
