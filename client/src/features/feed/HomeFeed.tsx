import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { Post, PostComment } from '../../types';
import api from '../../services/api';
import CreatePostModal from './CreatePostModal';
import FreshnessBadge from '../../components/common/FreshnessBadge';
import {
  Heart,
  MessageCircle,
  Share2,
  ShoppingCart,
  Send,
  Plus,
  Search,
  MapPin,
  ShieldCheck,
  Star,
  Sparkles,
  RefreshCw,
  Clock,
  CornerDownRight,
  User,
} from 'lucide-react';

interface HomeFeedProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenChatWithUser?: (targetUserId: string) => void;
  onOpenChat?: (convId?: string | null, targetUser?: any) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  onNavigate,
  onOpenChatWithUser,
  onOpenChat,
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [freshBatches, setFreshBatches] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Active expanded comments map { [postId]: boolean }
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsData, setCommentsData] = useState<Record<string, PostComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: language === 'ta' ? 'அனைத்தும்' : 'All', icon: '🌱' },
    { id: 'VEGETABLE', label: language === 'ta' ? 'காய்கறிகள்' : 'Vegetables', icon: '🍅' },
    { id: 'LEAFY', label: language === 'ta' ? 'கீரைகள்' : 'Greens', icon: '🥬' },
    { id: 'FRUIT', label: language === 'ta' ? 'பழங்கள்' : 'Fruits', icon: '🥭' },
    { id: 'GRAIN', label: language === 'ta' ? 'தானியங்கள்' : 'Grains', icon: '🌾' },
    { id: 'OTHER', label: language === 'ta' ? 'பிற பொருட்கள்' : 'Other', icon: '🥥' },
  ];

  const fetchFeed = async () => {
    try {
      setRefreshing(true);
      const res = await api.getFeed({
        cropName: searchQuery.trim() || undefined,
      });
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFreshBatches = async () => {
    try {
      const batches = await api.getMarketplaceProduce({ maxPrice: '100' });
      setFreshBatches(batches.slice(0, 6));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchFreshBatches();
  }, [searchQuery]);

  const handleLike = async (postId: string) => {
    // Optimistic UI toggle
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLikedByMe;
          return {
            ...p,
            isLikedByMe: nextLiked,
            likeCount: nextLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1),
          };
        }
        return p;
      })
    );

    try {
      const currentPost = posts.find((p) => p.id === postId);
      if (currentPost?.isLikedByMe) {
        await api.unlikePost(postId);
      } else {
        await api.likePost(postId);
      }
    } catch (err) {
      console.error('Like error:', err);
      fetchFeed(); // Revert on failure
    }
  };

  const toggleComments = async (postId: string) => {
    const isExpanded = expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !commentsData[postId]) {
      try {
        const res = await api.getPostComments(postId);
        setCommentsData((prev) => ({ ...prev, [postId]: res.comments || [] }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const res = await api.addPostComment(postId, content);
      setCommentsData((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.comment],
      }));
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleReplyComment = async (commentId: string, postId: string) => {
    const content = replyInputs[commentId]?.trim();
    if (!content) return;

    try {
      const res = await api.replyPostComment(commentId, content);
      setCommentsData((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c) =>
          c.id === commentId ? { ...c, replies: [...(c.replies || []), res.reply] } : c
        ),
      }));
      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      setReplyingToCommentId(null);
    } catch (err) {
      console.error('Failed to reply comment:', err);
    }
  };

  const handleAddToCart = async (batchId: string, cropName?: string) => {
    try {
      await addToCart(batchId, 5);
      setCartToast(`${cropName || 'Produce'} ${language === 'ta' ? 'கூடையில் சேர்க்கப்பட்டது!' : 'added to cart!'}`);
      setTimeout(() => setCartToast(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `KisanDirect: ${post.cropName || 'Fresh Harvest'} from ${post.farmer.name}`,
          text: post.caption,
          url: window.location.href,
        });
      } catch (e) {
        // ignore share cancel
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin} · ${post.farmer.name}: ${post.caption}`);
      setCartToast(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!');
      setTimeout(() => setCartToast(null), 2500);
    }
  };

  const isFarmer = user?.activeRole === 'FARMER' || user?.role === 'FARMER';

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-20">
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{cartToast}</span>
        </div>
      )}

      {/* Greeting Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{language === 'ta' ? `வணக்கம், ${user?.name?.split(' ')[0] || 'நண்பரே'} 👋` : `Hello, ${user?.name?.split(' ')[0] || 'Friend'} 👋`}</span>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'ta'
                ? 'சேலம் விவசாயிகளின் புதிய அறுவடைகள் மற்றும் நேரடி விலைகள்'
                : 'Direct harvests and fair farm prices across Salem district'}
            </p>
          </div>

          <button
            onClick={fetchFeed}
            disabled={refreshing}
            className="w-9 h-9 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition border border-slate-200"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'ta' ? 'என்ன விளைபொருள் தேடுகிறீர்கள்? (தக்காளி, வெங்காயம்...)' : 'What harvest are you looking for? (Tomato, Onion...)'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
          />
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Farmer Create Post Quick Action */}
      {isFarmer && (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/20">
              🌾
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">
                {language === 'ta' ? 'இன்றைய அறுவடையை பகிருங்கள்' : 'Share Today’s Harvest Update'}
              </div>
              <div className="text-[11px] text-emerald-200 mt-0.5">
                {language === 'ta' ? 'புகைப்படம் மற்றும் விலையுடன் நுகர்வோருக்கு தெரிவியுங்கள்' : 'Post photos, prices, and quantities directly to buyers'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-white hover:bg-emerald-50 text-emerald-900 px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === 'ta' ? 'பதிவிடுக' : 'Post'}</span>
          </button>
        </div>
      )}

      {/* Fresh Harvests Carousel from Database */}
      {freshBatches.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {language === 'ta' ? 'அருகிலுள்ள புதிய விளைபொருட்கள்' : 'Nearby Fresh Harvests'}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('buyer-marketplace')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
            >
              {language === 'ta' ? 'அனைத்தும் பார்க்க →' : 'View All →'}
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {freshBatches.map((batch) => (
              <div
                key={batch.id}
                className="w-40 sm:w-44 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-2.5 shrink-0 hover:border-emerald-300 transition flex flex-col justify-between text-xs"
              >
                <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <img
                    src={batch.imageUrl || batch.product?.imageUrl}
                    alt={batch.product?.name}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <FreshnessBadge status={batch.freshnessStatus} />
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-900 truncate">
                    {language === 'ta' ? batch.product?.nameTamil : batch.product?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{batch.village}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                  <span className="font-black text-emerald-700 text-sm">
                    ₹{batch.pricePerKg}
                    <span className="text-[10px] font-normal text-slate-500">/kg</span>
                  </span>
                  <button
                    onClick={() => handleAddToCart(batch.id, batch.product?.name)}
                    className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-xs transition"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-48 bg-slate-100 rounded-2xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
            🌾
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {t('noPostsYet')}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {t('noPostsDesc')}
          </p>
          {isFarmer && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createPost')}</span>
            </button>
          )}
        </div>
      )}

      {/* Real Social Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => {
          const isCommentsOpen = expandedComments[post.id];
          const comments = commentsData[post.id] || [];

          return (
            <article
              key={post.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition hover:border-slate-300"
            >
              {/* Post Header: Farmer Info */}
              <div className="p-4 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('farmer-public-profile', { farmerId: post.farmer.id || post.farmerId })}
                  className="flex items-center gap-3 text-left hover:opacity-80 transition"
                >
                  <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {post.farmer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <span>{post.farmer.name}</span>
                      {post.farmer.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{post.location || post.farmer.village}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {post.farmer.rating || 4.8}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Direct Chat Button */}
                <button
                  onClick={() => {
                    if (onOpenChat) {
                      onOpenChat(null, {
                        id: post.farmer.userId,
                        name: post.farmer.name,
                        role: 'FARMER',
                      });
                    } else if (onOpenChatWithUser) {
                      onOpenChatWithUser(post.farmer.userId);
                    } else {
                      onNavigate('chat', { targetUserId: post.farmer.userId });
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'ta' ? 'செய்தி' : 'Chat'}</span>
                </button>
              </div>

              {/* Post Caption */}
              <div className="px-4 pb-3">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                  {post.caption}
                </p>
              </div>

              {/* Attached Harvest Commerce Tag */}
              {(post.price || post.cropName || post.batch) && (
                <div className="px-4 pb-3">
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {post.cropName || post.batch?.product?.nameTamil || 'விளைபொருள்'}
                        </span>
                        {post.qualityGrade && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            {language === 'ta' ? `தரம் ${post.qualityGrade}` : `Grade ${post.qualityGrade}`}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {post.quantity ? `${post.quantity} ${post.unit || 'kg'} ${language === 'ta' ? 'கையிருப்பு உள்ளது' : 'available'}` : 'Direct harvest'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {post.price && (
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-700">
                            ₹{post.price}
                          </span>
                          <span className="text-[10px] text-slate-500 block">/ {post.unit || 'kg'}</span>
                        </div>
                      )}

                      {post.batchId && (
                        <button
                          onClick={() => handleAddToCart(post.batchId!, post.cropName)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'வாங்கு' : 'Buy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Post Media Gallery */}
              {post.media && post.media.length > 0 && (
                <div className="bg-slate-100 relative">
                  {post.media.length === 1 ? (
                    <img
                      src={post.media[0].url}
                      alt="Harvest"
                      className="w-full max-h-96 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-1 max-h-96 overflow-hidden">
                      {post.media.slice(0, 4).map((m, idx) => (
                        <img
                          key={idx}
                          src={m.url}
                          alt="Harvest"
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Interaction Bar */}
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition ${
                      post.isLikedByMe ? 'text-rose-600 font-extrabold' : 'hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLikedByMe ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{post.likeCount}</span>
                  </button>

                  {/* Comment Toggle */}
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 hover:text-emerald-700 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentCount}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1 hover:text-slate-900 transition"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(post.createdAt).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Comments Section (Collapsible) */}
              {isCommentsOpen && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
                  {/* Comments List */}
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <div className="text-slate-400 text-center py-2 text-[11px]">
                        {language === 'ta' ? 'முதல் கருத்தை எழுதுங்கள்!' : 'No comments yet. Be the first to comment!'}
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="space-y-1.5">
                          <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                              {comment.user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 truncate">
                                  {comment.user.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-700 mt-0.5 font-normal leading-relaxed">
                                {comment.content}
                              </p>
                              <button
                                onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 mt-1 inline-flex items-center gap-1"
                              >
                                <CornerDownRight className="w-2.5 h-2.5" />
                                <span>{t('reply')}</span>
                              </button>
                            </div>
                          </div>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="pl-6 space-y-1.5">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-2 bg-emerald-50/40 p-2 rounded-xl border border-emerald-100 text-[11px]">
                                  <div className="w-6 h-6 rounded-md bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                                    {reply.user.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-900 truncate">
                                      {reply.user.name}
                                    </div>
                                    <p className="text-slate-700 font-normal mt-0.5">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input Box */}
                          {replyingToCommentId === comment.id && (
                            <div className="pl-6 flex items-center gap-1.5 pt-1">
                              <input
                                type="text"
                                placeholder={language === 'ta' ? 'பதில் எழுதுங்கள்...' : 'Write reply...'}
                                value={replyInputs[comment.id] || ''}
                                onChange={(e) =>
                                  setReplyInputs((prev) => ({ ...prev, [comment.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleReplyComment(comment.id, post.id);
                                }}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                              />
                              <button
                                onClick={() => handleReplyComment(comment.id, post.id)}
                                className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                    <input
                      type="text"
                      placeholder={t('writeComment')}
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="h-9 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>{language === 'ta' ? 'அனுப்பு' : 'Send'}</span>
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Modal for Creating Farmer Social Post */}
      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onPostCreated={() => {
          fetchFeed();
        }}
      />
    </div>
  );
};

export default HomeFeed;
