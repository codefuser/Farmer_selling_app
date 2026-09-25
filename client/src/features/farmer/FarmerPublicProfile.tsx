import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api, { getMediaUrl } from '../../services/api';
import FreshnessBadge from '../../components/common/FreshnessBadge';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Star,
  Package,
  FileText,
  Info,
  MessageCircle,
  ShoppingCart,
  Phone,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface FarmerPublicProfileProps {
  farmerId?: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenChatWithUser?: (targetUserId: string) => void;
  onOpenChat?: (targetUser?: any) => void;
}

export const FarmerPublicProfile: React.FC<FarmerPublicProfileProps> = ({
  farmerId,
  onNavigate,
  onOpenChatWithUser,
  onOpenChat,
}) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const [farmerData, setFarmerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'posts' | 'about' | 'reviews'>('products');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!farmerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getFarmerPublicProfile(farmerId)
      .then((res) => {
        if (mounted) {
          setFarmerData(res);
        }
      })
      .catch((err) => {
        console.error('Failed to load farmer profile:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [farmerId]);

  const handleAddToCart = async (batchId: string, cropName?: string) => {
    try {
      await addToCart(batchId, 5);
      setToastMessage(`${cropName || 'Produce'} ${language === 'ta' ? 'கூடையில் சேர்க்கப்பட்டது!' : 'added to cart!'}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-6 w-24 bg-slate-200 rounded-lg mb-4" />
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-200" />
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-3.5 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!farmerData || !farmerData.farmer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl">
          🌾
        </div>
        <h2 className="text-sm font-bold text-slate-900">
          {language === 'ta' ? 'விவசாயி விவரம் கிடைக்கவில்லை' : 'Farmer Profile Not Found'}
        </h2>
        <button
          onClick={() => onNavigate('home-feed')}
          className="text-xs text-emerald-700 font-bold hover:underline"
        >
          ← {language === 'ta' ? 'முகப்பிற்கு செல்க' : 'Back to Home'}
        </button>
      </div>
    );
  }

  const { farmer, produceBatches = [], posts = [], reviews = [] } = farmerData;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => onNavigate('home-feed')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === 'ta' ? 'பின்செல்' : 'Back'}</span>
      </button>

      {/* Farmer Header Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-700 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              {farmer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-slate-900 text-base">
                <span>{farmer.name}</span>
                {farmer.verified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase mt-0.5">
                {language === 'ta' ? 'சரிபார்க்கப்பட்ட விவசாயி' : 'Verified Harvester'} · {farmer.farmerId}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{farmer.village}, {farmer.district}, {farmer.state}</span>
              </div>
            </div>
          </div>

          {/* Action Chat Button */}
          <button
            onClick={() => {
              if (onOpenChat) {
                onOpenChat({ id: farmer.userId, name: farmer.name, role: 'FARMER' });
              } else if (onOpenChatWithUser) {
                onOpenChatWithUser(farmer.userId);
              } else {
                onNavigate('chat', { targetUserId: farmer.userId });
              }
            }}
            className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{language === 'ta' ? 'நேரடி செய்தி' : 'Chat'}</span>
          </button>
        </div>

        {/* Real Stats Metric Strip */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 bg-slate-50 rounded-2xl">
            <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'மதிப்பீடு' : 'Rating'}</div>
            <div className="text-xs font-bold text-slate-900 flex items-center justify-center gap-0.5 mt-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{farmer.rating || 4.8}</span>
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded-2xl">
            <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'ஆர்டர்கள்' : 'Orders'}</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {farmer.completedOrders || 0}
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded-2xl">
            <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'நிலம்' : 'Land'}</div>
            <div className="text-xs font-bold text-emerald-700 mt-0.5">
              {farmer.landSize || 2.5} ac
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded-2xl">
            <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'அனுபவம்' : 'Exp.'}</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {farmer.experienceYears || 5} yrs
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'ta' ? `விளைபொருட்கள் (${produceBatches.length})` : `Products (${produceBatches.length})`}
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'posts'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'ta' ? `பதிவுகள் (${posts.length})` : `Posts (${posts.length})`}
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'about'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'ta' ? 'பண்ணை விவரம்' : 'About Farm'}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'ta' ? `மதிப்புரைகள் (${reviews.length})` : `Reviews (${reviews.length})`}
        </button>
      </div>

      {/* Tab 1: Produce Batches */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          {produceBatches.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              {language === 'ta' ? 'தற்போது புதிய அறுவடை இல்லை' : 'No active produce listed right now.'}
            </div>
          ) : (
            produceBatches.map((batch: any) => (
              <div
                key={batch.id}
                className="bg-white rounded-3xl p-4 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={batch.imageUrl || batch.product?.imageUrl}
                      alt={batch.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {language === 'ta' ? batch.product?.nameTamil : batch.product?.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'ta' ? `தரம் ${batch.qualityGrade}` : `Grade ${batch.qualityGrade}`} · {batch.quantity} kg {language === 'ta' ? 'கையிருப்பு' : 'in stock'}
                    </div>
                    <div className="mt-1">
                      <FreshnessBadge status={batch.freshnessStatus} />
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <div>
                    <span className="text-base font-black text-emerald-700">₹{batch.pricePerKg}</span>
                    <span className="text-[10px] text-slate-400">/kg</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(batch.id, batch.product?.name)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'வாங்கு' : 'Buy'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Social Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              {language === 'ta' ? 'பதிவுகள் எதுவும் இல்லை' : 'No social posts shared yet.'}
            </div>
          ) : (
            posts.map((post: any) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-4 border border-slate-200 space-y-2.5 text-xs"
              >
                <div className="text-[11px] text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <p className="text-slate-800 leading-relaxed">{post.caption}</p>
                {post.media && post.media.length > 0 && (
                  <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-56">
                    <img src={getMediaUrl(post.media[0].mediaUrl || post.media[0].url)} alt="Harvest" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-4 text-slate-500 font-bold pt-1">
                  <span>❤️ {post.likeCount || 0}</span>
                  <span>💬 {post.commentCount || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: About Farm */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">
              {language === 'ta' ? 'பண்ணை சுயவிவரம்' : 'Farm Story'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {farmer.bio}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 block">{language === 'ta' ? 'விவசாய முறை' : 'Farming Type'}</span>
              <span className="font-bold text-slate-800">{farmer.farmingType}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{language === 'ta' ? 'முக்கிய பயிர்கள்' : 'Main Crops'}</span>
              <span className="font-bold text-slate-800">{farmer.mainCrops}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{language === 'ta' ? 'அடையாள சரிபார்ப்பு' : 'Identity Verification'}</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {farmer.identityVerificationStatus}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{language === 'ta' ? 'பண்ணை சரிபார்ப்பு' : 'Farm Verification'}</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {farmer.farmVerificationStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              {language === 'ta' ? 'மதிப்புரைகள் எதுவும் இல்லை' : 'No buyer reviews yet.'}
            </div>
          ) : (
            reviews.map((r: any) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-4 border border-slate-200 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.fromUser?.name || 'Buyer'}</span>
                  <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-500" />
                    {r.score} / 5
                  </span>
                </div>
                {r.comment && <p className="text-slate-600">{r.comment}</p>}
                <div className="text-[10px] text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerPublicProfile;
