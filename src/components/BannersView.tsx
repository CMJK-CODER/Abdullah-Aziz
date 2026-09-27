import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  MousePointerClick,
  Sparkles,
  X,
  BookOpen
} from 'lucide-react';
import { BannerPopup, Book } from '../types';

interface BannersViewProps {
  banners: BannerPopup[];
  books: Book[];
  onAddBanner: (banner: Omit<BannerPopup, 'id' | 'clicks' | 'impressions' | 'created_at'>) => void;
  onToggleStatus: (id: string) => void;
  onDeleteBanner: (id: string) => void;
}

export const BannersView: React.FC<BannersViewProps> = ({
  banners,
  books,
  onAddBanner,
  onToggleStatus,
  onDeleteBanner
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
  );
  const [linkedBookId, setLinkedBookId] = useState('');
  const [position, setPosition] = useState<'home_popup' | 'header_banner' | 'interstitial_slide'>(
    'home_popup'
  );
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const linkedBook = books.find((b) => b.id === linkedBookId);

    onAddBanner({
      title,
      image_url: imageUrl,
      linked_book_id: linkedBookId || undefined,
      linked_book_title: linkedBook ? `${linkedBook.title_en} (${linkedBook.title_urdu})` : undefined,
      position,
      is_active: isActive
    });

    setIsAddModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#2D1A1A]">Promo Banners & Home Popups</h1>
          <p className="text-xs text-[#786161]">
            Display new novel announcements, writer contests, and rewarded promotional interstitials
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-md shadow-[#8B1E3F]/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FF8C00]" />
          <span>Add Promo Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <div className="rounded-3xl bg-white border border-[#ead4ba] p-12 text-center">
          <ImageIcon className="w-12 h-12 text-[#ebd7c2] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#2D1A1A]">No Promo Banners Active</h3>
          <p className="text-xs text-[#786161] max-w-sm mx-auto mt-1">
            You currently have no promo banners or popups configured. Add novel launch announcements, writer competitions, or promotional slides.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#FF8C00]" />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((ban) => (
          <div
            key={ban.id}
            className="rounded-3xl bg-white border border-[#ead4ba] overflow-hidden shadow-xs hover:border-[#8B1E3F] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Banner Image Preview */}
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <img
                  src={ban.image_url}
                  alt={ban.title}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                    ban.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {ban.is_active ? 'Active Live' : 'Paused'}
                </span>

                <span className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {ban.position === 'home_popup'
                    ? 'Home Launch Popup'
                    : ban.position === 'header_banner'
                    ? 'Catalog Header Banner'
                    : 'Interstitial Novel Slide'}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-bold text-[#2D1A1A] line-clamp-1">{ban.title}</h3>
                {ban.linked_book_title && (
                  <p className="text-xs text-[#8B1E3F] font-semibold mt-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Links to: {ban.linked_book_title}</span>
                  </p>
                )}

                {/* Performance telemetry */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#f0e2d3] text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>{ban.impressions.toLocaleString()} Impr.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ban.clicks.toLocaleString()} Clicks</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#8B1E3F] ml-auto">
                    {ban.impressions > 0
                      ? ((ban.clicks / ban.impressions) * 100).toFixed(1) + '% CTR'
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-5 py-3 bg-[#FFFDF9] border-t border-[#ebd7c2] flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-[#2D1A1A]">
                <input
                  type="checkbox"
                  checked={ban.is_active}
                  onChange={() => onToggleStatus(ban.id)}
                  className="w-4 h-4 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <span>Toggle Active</span>
              </label>

              <button
                onClick={() => onDeleteBanner(ban.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                title="Delete Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add Banner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ead4ba] overflow-hidden z-10">
            <div className="bg-[#4A1025] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="font-bold text-base">New Promotion Banner</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Novel Alert: Siyah Shaam Live!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Image URL (Horizontal Banner) *
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Link to Novel (Optional)
                </label>
                <select
                  value={linkedBookId}
                  onChange={(e) => setLinkedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8B1E3F]/20"
                >
                  <option value="">None (Generic Promotion)</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title_en} ({b.title_urdu})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Position & Type
                </label>
                <select
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value as 'home_popup' | 'header_banner' | 'interstitial_slide')
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8B1E3F]/20"
                >
                  <option value="home_popup">Home Launch Popup Dialog</option>
                  <option value="header_banner">Catalog Top Header Banner</option>
                  <option value="interstitial_slide">Chapter Interstitial Slide</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <label htmlFor="banner-active" className="text-xs font-bold text-[#2D1A1A] cursor-pointer">
                  Activate banner immediately upon save
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#ebd7c2]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold shadow-md hover:bg-[#721733]"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
