import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Phone,
  Package,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LogisticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // OTP Verification Modal
  const [otpModalAssignment, setOtpModalAssignment] = useState<any | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.getMyDeliveryAssignments();
      setAssignments(res || []);
    } catch (err) {
      console.error('Failed to load delivery assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleUpdateStatus = async (assignmentId: string, nextStatus: string) => {
    try {
      await api.updateAssignmentStatus(assignmentId, nextStatus);
      showToast(`Status updated to: ${nextStatus.replace('_', ' ')}`);
      await loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalAssignment) return;
    if (!enteredOtp.trim()) {
      setOtpError('Please enter the 4-digit customer delivery OTP');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setOtpError(null);
      await api.updateAssignmentStatus(
        otpModalAssignment.id,
        'DELIVERED',
        enteredOtp.trim()
      );

      showToast(`Order #${otpModalAssignment.order?.orderCode} delivered successfully!`);
      setOtpModalAssignment(null);
      setEnteredOtp('');
      await loadAssignments();
    } catch (err: any) {
      setOtpError(err.message || 'Invalid delivery OTP. Please verify with the customer.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const activeCount = assignments.filter((a) => a.status !== 'DELIVERED').length;
  const completedCount = assignments.filter((a) => a.status === 'DELIVERED').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Driver Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-teal-950 to-emerald-950 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-2">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ulavar2Ulagam Dedicated Fleet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Delivery Partner Portal
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong>{user?.name || 'Karthik Murugan'}</strong> · Salem Central Hub Fleet
          </p>
        </div>

        <button
          onClick={loadAssignments}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-slate-200 transition border border-white/10 shrink-0"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Driver Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Deliveries
          </div>
          <div className="text-2xl font-black text-amber-600">{activeCount}</div>
          <div className="text-[10px] text-slate-400">Assigned for dispatch</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Delivered Today
          </div>
          <div className="text-2xl font-black text-emerald-800">{completedCount}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">100% OTP Verified</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Vehicle Assigned
          </div>
          <div className="text-base font-black text-slate-800">TN 54 AB 9012</div>
          <div className="text-[10px] text-slate-400">Tata Ace EV (Hub Fleet)</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Dispatch Hub
          </div>
          <div className="text-base font-black text-slate-800">Salem VOC Hub</div>
          <div className="text-[10px] text-slate-400">Central Tamil Nadu</div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">Assigned Delivery Orders</h2>
            <p className="text-xs text-slate-400">Follow the 3-step delivery workflow: Pick Up → Out for Delivery → Verify OTP</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Truck className="w-10 h-10 mx-auto text-slate-300" />
            <p>No active delivery assignments. Check back when admin assigns new dispatches.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((asgn) => {
              const ord = asgn.order;
              const isDelivered = asgn.status === 'DELIVERED';

              return (
                <div
                  key={asgn.id}
                  className={`p-5 rounded-2xl border transition space-y-4 ${
                    isDelivered ? 'bg-slate-50/60 border-slate-200' : 'bg-white border-emerald-300 shadow-sm'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        #{ord?.orderCode}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Customer: {ord?.customerName || ord?.buyer?.user?.name || 'Customer'}
                      </span>
                      <a
                        href={`tel:${ord?.customerPhone || '9876543210'}`}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold hover:bg-emerald-100"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{ord?.customerPhone || '9876543210'}</span>
                      </a>
                    </div>

                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : asgn.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-indigo-100 text-indigo-800'
                            : asgn.status === 'PICKED_UP'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {asgn.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Delivery Destination:</span>
                      </div>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {ord?.deliveryAddress || 'Address on file'}
                      </p>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Produce Packages:</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        {ord?.items?.map((it: any) => (
                          <div key={it.id} className="text-slate-700 font-medium">
                            • {it.productName || it.product?.name} ({it.quantity} {it.unit || 'kg'})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Workflow Buttons */}
                  {!isDelivered && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-500 font-medium">
                        Advance delivery stage as you progress:
                      </div>

                      <div className="flex items-center gap-2">
                        {asgn.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleUpdateStatus(asgn.id, 'PICKED_UP')}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
                          >
                            1. Pick Up from Salem Hub
                          </button>
                        )}

                        {asgn.status === 'PICKED_UP' && (
                          <button
                            onClick={() => handleUpdateStatus(asgn.id, 'OUT_FOR_DELIVERY')}
                            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
                          >
                            2. Start Out for Delivery
                          </button>
                        )}

                        {asgn.status === 'OUT_FOR_DELIVERY' && (
                          <button
                            onClick={() => {
                              setOtpModalAssignment(asgn);
                              setEnteredOtp('');
                              setOtpError(null);
                            }}
                            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>3. Verify OTP & Handover</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {isDelivered && (
                    <div className="pt-2 border-t border-slate-100 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Successfully Handed Over & OTP Verified ✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OTP Handover Verification Modal */}
      {otpModalAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleVerifyOtpSubmit}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-900">
                Verify Customer Delivery OTP
              </h3>
              <p className="text-slate-500">
                Order #{otpModalAssignment.order?.orderCode} for{' '}
                {otpModalAssignment.order?.customerName || 'Customer'}
              </p>
            </div>

            {otpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-center block">
                Enter 4-Digit Customer OTP
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • •"
                className="w-full text-center text-2xl font-mono font-black tracking-widest p-3 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 text-center">
                Demo Hint: Customer OTP is displayed on customer's "My Orders" screen.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOtpModalAssignment(null)}
                className="w-1/2 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition"
              >
                {isVerifyingOtp ? 'Verifying...' : 'Confirm Delivery'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard;
