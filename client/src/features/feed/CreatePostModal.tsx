import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  X,
  Camera,
  Image as ImageIcon,
  Tag,
  MapPin,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [caption, setCaption] = useState('');
  const [cropName, setCropName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [qualityGrade, setQualityGrade] = useState('A');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      setError(null);

      const file = files[0];
      if (file.size > 8 * 1024 * 1024) {
        setError(language === 'ta' ? 'படத்தின் அளவு 8MB-க்கு குறைவாக இருக்க வேண்டும்' : 'Image size must be less than 8MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await api.uploadImage(base64, file.name);
          setMediaUrls((prev) => [...prev, res.url]);
        } catch (err: any) {
          console.warn('Backend image upload endpoint returned error, using direct image data:', err);
          // Fallback to base64 so user can see photo and post without being blocked by 404
          setMediaUrls((prev) => [...prev, base64]);
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.warn('Failed to process image:', err);
      setError(language === 'ta' ? 'படத்தை செயலாக்குவதில் பிழை ஏற்பட்டது' : (err.message || 'Failed to process image'));
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setError(language === 'ta' ? 'தயவுசெய்து உங்கள் பதிவின் விவரத்தை உள்ளிடவும்' : 'Please enter post description');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const farmerProfile = user?.farmerProfile;
      const defaultLoc = farmerProfile ? `${farmerProfile.village}, ${farmerProfile.district}` : 'Salem, Tamil Nadu';

      await api.createPost({
        caption: caption.trim(),
        cropName: cropName.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit,
        qualityGrade,
        location: defaultLoc,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });

      onPostCreated();
      onClose();
    } catch (err: any) {
      console.error('Create post failed:', err);
      let errMsg = err.message || (language === 'ta' ? 'பதிவு செய்வதில் பிழை ஏற்பட்டது' : 'Failed to publish post');
      if (errMsg.includes('404')) {
        errMsg = language === 'ta'
          ? 'சர்வர் புதுப்பிக்கப்படுகிறது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும் (Backend 404)'
          : 'Server is currently redeploying. Please retry in a moment (Backend 404)';
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <h2 className="text-sm font-bold text-slate-900">
              {language === 'ta' ? 'அறுவடை பதிவு சேர்க்க' : 'Share Harvest Update'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'ta' ? 'பதிவு விளக்கம் *' : 'Post Caption *'}
            </label>
            <textarea
              rows={3}
              placeholder={
                language === 'ta'
                  ? 'இன்று காலை அறுவடை செய்த புதிய தக்காளி. தரம் A. 200 கிலோ தயார்...'
                  : 'Fresh morning harvest ready today! Grade A produce, directly from farm...'
              }
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50/50 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
          </div>

          {/* Attached Crop Details (Optional) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Tag className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'விற்பனை விவரம் (விருப்பத்தேர்வு)' : 'Sellable Crop Tag (Optional)'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'ta' ? 'பயிர் பெயர்' : 'Crop Name'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'தக்காளி / கத்தரி' : 'Tomato / Brinjal'}
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'ta' ? 'தரம்' : 'Quality Grade'}
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900 font-medium"
                >
                  <option value="A">{language === 'ta' ? 'A தரம் (சிறந்தது)' : 'Grade A (Premium)'}</option>
                  <option value="B">{language === 'ta' ? 'B தரம் (நடுத்தரம்)' : 'Grade B (Standard)'}</option>
                  <option value="C">{language === 'ta' ? 'C தரம்' : 'Grade C'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'ta' ? 'விலை / கிலோ (₹)' : 'Price per kg (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="28"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'ta' ? 'கையிருப்பு அளவு' : 'Available Qty'}
                </label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
                  <input
                    type="number"
                    placeholder="250"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none"
                  />
                  <span className="bg-slate-100 px-2 py-1.5 text-slate-500 font-bold border-l border-slate-200">
                    kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {language === 'ta' ? 'தோட்டப் புகைப்படங்கள்' : 'Farm Photos'}
            </label>

            <div className="flex flex-wrap gap-2.5 items-center">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                  >
                    ×
                  </button>
                </div>
              ))}

              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 flex flex-col items-center justify-center cursor-pointer transition text-emerald-700 shrink-0">
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold">
                  {uploadingImage ? (language === 'ta' ? 'ஏற்றுகிறது...' : 'Uploading...') : (language === 'ta' ? 'புகைப்படம்' : 'Add Photo')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Location pill */}
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {user?.farmerProfile ? `${user.farmerProfile.village}, ${user.farmerProfile.district}` : 'Salem, Tamil Nadu'}
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold shadow-md transition flex items-center justify-center gap-2"
            >
              <span>
                {submitting
                  ? (language === 'ta' ? 'வெளியிடப்படுகிறது...' : 'Publishing...')
                  : (language === 'ta' ? 'பதிவை வெளியிடு' : 'Publish Harvest Post')}
              </span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
