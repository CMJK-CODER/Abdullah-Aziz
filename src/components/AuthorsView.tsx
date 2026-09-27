import React, { useState } from 'react';
import {
  Feather,
  Plus,
  BadgeCheck,
  BookOpen,
  Users,
  Mail,
  X,
  UploadCloud,
  Check,
  Trash2
} from 'lucide-react';
import { Author } from '../types';

interface AuthorsViewProps {
  authors: Author[];
  onAddAuthor: (auth: Omit<Author, 'id' | 'total_books' | 'total_readers'>) => void;
  onDeleteAuthor?: (id: string) => void;
}

export const AuthorsView: React.FC<AuthorsViewProps> = ({ authors, onAddAuthor, onDeleteAuthor }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );
  const [isVerified, setIsVerified] = useState(true);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameUrdu) return;

    onAddAuthor({
      name_en: nameEn,
      name_urdu: nameUrdu,
      avatar_url: avatarUrl,
      bio: bio,
      is_verified: isVerified,
      email: email || `${nameEn.toLowerCase().replace(/\s+/g, '.')}@kitabnagri.pk`
    });

    setIsAddModalOpen(false);
    setNameEn('');
    setNameUrdu('');
    setBio('');
    setEmail('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#2D1A1A]">Literary Authors & Novelists</h1>
          <p className="text-xs text-[#786161]">
            Verified authors, copyright profiles, and direct writer correspondence
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-md shadow-[#8B1E3F]/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FF8C00]" />
          <span>Add New Author</span>
        </button>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {authors.map((author) => (
          <div
            key={author.id}
            className="p-5 rounded-3xl bg-white border border-[#ead4ba] hover:border-[#8B1E3F] transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={author.avatar_url}
                    alt={author.name_en}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#8B1E3F]/20 shadow-xs"
                  />
                  {author.is_verified && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-sm font-bold text-[#2D1A1A] group-hover:text-[#8B1E3F] transition-colors truncate">
                      {author.name_en}
                    </h3>
                    {onDeleteAuthor && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAuthor(author.id);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                        title="Delete Author"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="font-urdu text-sm text-[#8B1E3F] font-bold">
                    {author.name_urdu}
                  </p>
                  {author.email && (
                    <p className="text-[10px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>{author.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#786161] mt-3.5 line-clamp-2 leading-relaxed">
                {author.bio || 'Renowned Urdu fiction author on Kitabistan platform.'}
              </p>
            </div>

            {/* Bottom Stats */}
            <div className="mt-5 pt-3.5 border-t border-[#f0e2d3] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-[#574141]">
                <BookOpen className="w-3.5 h-3.5 text-[#8B1E3F]" />
                <span className="font-bold">{author.total_books}</span>
                <span className="text-[11px] text-gray-500">Novels</span>
              </div>

              <div className="flex items-center space-x-1.5 text-[#574141]">
                <Users className="w-3.5 h-3.5 text-[#FF8C00]" />
                <span className="font-bold">{author.total_readers}</span>
                <span className="text-[11px] text-gray-500">Readers</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Author Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ead4ba] overflow-hidden z-10">
            <div className="bg-[#4A1025] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Feather className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="font-bold text-base">Register Novel Author</h3>
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
                  Author Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nimra Ahmed"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Author Name (Urdu Nastaleeq) *
                </label>
                <input
                  type="text"
                  dir="rtl"
                  required
                  placeholder="مثلاً: نمرہ احمد"
                  value={nameUrdu}
                  onChange={(e) => setNameUrdu(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-sm font-urdu focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="author@kitabnagri.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Short Biography
                </label>
                <textarea
                  rows={3}
                  placeholder="Author profile and literary accolades..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="verified-checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <label htmlFor="verified-checkbox" className="text-xs font-bold text-[#2D1A1A] cursor-pointer">
                  Mark as Verified Official Author (Badge)
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
                  Save Author
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
