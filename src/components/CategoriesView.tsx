import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  BookOpen,
  Heart,
  Moon,
  Zap,
  Users,
  Shield,
  Eye,
  X,
  Sparkles
} from 'lucide-react';
import { Category, NavigationScreen } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  onAddCategory: (cat: Omit<Category, 'id' | 'books_count'>) => void;
  onDeleteCategory: (id: string) => void;
  onNavigateToBooks: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  onNavigateToBooks
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState('#8B1E3F');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return <Heart className="w-5 h-5" />;
      case 'moon':
        return <Moon className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'users':
        return <Users className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      default:
        return <Eye className="w-5 h-5" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameUrdu) return;

    onAddCategory({
      name_en: nameEn,
      name_urdu: nameUrdu,
      slug: slug || nameEn.toLowerCase().replace(/\s+/g, '-'),
      icon: 'heart',
      accent_color: accentColor,
      description: description
    });

    setIsAddModalOpen(false);
    setNameEn('');
    setNameUrdu('');
    setSlug('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#2D1A1A]">Genre & Categories</h1>
          <p className="text-xs text-[#786161]">
            Organize Urdu literature taxonomy, novel shelves, and reader discovery feeds
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-md shadow-[#8B1E3F]/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FF8C00]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-3xl bg-white border border-[#ead4ba] hover:border-[#8B1E3F] transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: cat.accent_color }}
                >
                  {getIcon(cat.icon)}
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF8E7] text-[#8B1E3F] border border-[#ebd7c2]">
                    {cat.books_count} Novels
                  </span>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-bold text-[#2D1A1A] group-hover:text-[#8B1E3F] transition-colors">
                    {cat.name_en}
                  </h3>
                  <span className="font-urdu text-base font-bold text-[#8B1E3F]">
                    {cat.name_urdu}
                  </span>
                </div>
                <p className="text-xs text-[#786161] mt-2 line-clamp-2">
                  {cat.description || 'Curated collection of authentic Urdu serials.'}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#f0e2d3] flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400">/{cat.slug}</span>
              <button
                onClick={onNavigateToBooks}
                className="text-xs font-bold text-[#8B1E3F] hover:text-[#721733] flex items-center gap-1"
              >
                <span>Browse Titles</span>
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ead4ba] overflow-hidden z-10">
            <div className="bg-[#4A1025] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Layers className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="font-bold text-base">Add New Genre Category</h3>
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
                  Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Romantic Drama"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Name (Urdu Nastaleeq) *
                </label>
                <input
                  type="text"
                  dir="rtl"
                  required
                  placeholder="مثلاً: رومانوی ڈرامہ"
                  value={nameUrdu}
                  onChange={(e) => setNameUrdu(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-sm font-urdu focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. romantic-drama"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-[#ebd7c2] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#574141]">{accentColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Category description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
