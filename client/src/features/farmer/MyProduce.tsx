import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Receipt,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface MyProduceProps {
  onNavigate: (view: string) => void;
  onOpenVoiceModal?: () => void;
}

export const MyProduce: React.FC<MyProduceProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [procurements, setProcurements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PURCHASED' | 'RECEIPTS'>('ALL');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, procRes] = await Promise.all([
        api.getFarmerSubmissions(),
        api.getFarmerProcurements(),
      ]);
      setSubmissions(subsRes || []);
      setProcurements(procRes || []);
    } catch (err) {
      console.error('Error loading farmer submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            SUBMITTED · AWAITING REVIEW
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            UNDER QC REVIEW
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            APPROVED FOR PROCUREMENT
          </span>
        );
      case 'PURCHASED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            PROCURED BY CENTRAL HUB ✓
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW';
    if (activeTab === 'APPROVED') return s.status === 'APPROVED';
    if (activeTab === 'PURCHASED') return s.status === 'PURCHASED';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'ta' ? 'என் சமர்ப்பிப்புகள் & கொள்முதல் நிலை' : 'My Produce Submissions & Procurements'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'உழவர் to உலகம் மத்திய சரக்ககம் ஆய்வு மற்றும் கொள்முதல் ஆவணங்கள்'
              : 'Track produce review status, agreed procurement prices, and direct payouts'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('farmer-add-produce')}
            className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Harvest</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        {[
          { id: 'ALL', label: 'All Submissions' },
          { id: 'PENDING', label: 'Pending Review' },
          { id: 'APPROVED', label: 'Approved' },
          { id: 'PURCHASED', label: 'Procured by Hub' },
          { id: 'RECEIPTS', label: `Procurement Vouchers (${procurements.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your produce data...</p>
        </div>
      ) : activeTab === 'RECEIPTS' ? (
        /* Procurement Vouchers List */
        procurements.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-3">
            <Receipt className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-900 text-sm">No Procurements Yet</h3>
            <p className="text-xs text-slate-400">
              When Ulavar2Ulagam administrators approve and purchase your submissions, direct payment vouchers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {procurements.map((proc: any) => (
              <div
                key={proc.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      #{proc.procurementCode}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(proc.procurementDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    PAID DIRECTLY TO FARMER
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 text-[11px]">Product Intaken</div>
                    <div className="font-bold text-slate-900">{proc.product?.name || 'Produce'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Purchased Quantity</div>
                    <div className="font-bold text-slate-900">
                      {proc.purchasedQuantity} {proc.product?.unit || 'kg'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Agreed Price Per Unit</div>
                    <div className="font-bold text-slate-900">
                      ₹{proc.purchasePricePerUnit} / {proc.product?.unit || 'kg'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Total Net Payout</div>
                    <div className="font-extrabold text-emerald-800 text-sm">
                      ₹{proc.totalCost?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {proc.notes && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong>Admin Verification:</strong> {proc.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )) : filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-4">
            <Package className="w-10 h-10 mx-auto text-slate-300" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">No Submissions Found</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit harvest details to have Ulavar2Ulagam procure your produce at fair agreed rates.
              </p>
            </div>
            <button
              onClick={() => onNavigate('farmer-add-produce')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Submit Produce Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub: any) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      #{sub.code}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>{getStatusBadge(sub.status)}</div>
                </div>

                {/* Main Content Body */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={sub.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase font-bold text-emerald-800">
                      {sub.category}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                      {sub.produceName}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>
                        Quantity: <strong>{sub.quantity} {sub.unit}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Expected Price: <strong>₹{sub.expectedPrice} / {sub.unit}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Total Value: <strong className="text-emerald-800">₹{(sub.quantity * sub.expectedPrice).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Harvest Metadata */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Farm: {sub.farmLocation || 'Salem District'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Harvest Date: {sub.harvestDate || 'Fresh batch'}</span>
                  </div>
                </div>

                {/* Admin Feedback / Procurement Status if present */}
                {sub.adminNotes && (
                  <div className="text-xs text-indigo-900 bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
                    <strong>Hub Inspection Feedback:</strong> {sub.adminNotes}
                  </div>
                )}
                {sub.rejectionReason && (
                  <div className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-2xl">
                    <strong>Rejection Reason:</strong> {sub.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default MyProduce;
