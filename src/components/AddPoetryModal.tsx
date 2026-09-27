import React, { useState } from 'react';
import { X, Sparkles, Feather, Tag, Check, AlertCircle } from 'lucide-react';
import { PoetryLine } from '../types';

interface AddPoetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePoetry: (poetry: Omit<PoetryLine, 'id' | 'created_at' | 'likes_count'>) => Promise<void> | void;
}

export const AddPoetryModal: React.FC<AddPoetryModalProps> = ({
  isOpen,
  onClose,
  onSavePoetry
}) => {
  const [linesUrdu, setLinesUrdu] = useState('');
  const [poetName, setPoetName] = useState('');
  const [genre, setGenre] = useState('Sher');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linesUrdu.trim()) {
      setError('Please write or paste the Urdu poetry lines (اشعار لکھیں).');
      return;
    }
    if (!poetName.trim()) {
      setError('Please enter the poet name (شاعر کا نام درج کریں).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSavePoetry({
        lines_urdu: linesUrdu.trim(),
        poet_name: poetName.trim(),
        genre,
        status
      });
      // reset form
      setLinesUrdu('');
      setPoetName('');
      setGenre('Sher');
      setStatus('Published');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save poetry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const samplePoets = [
    'علامہ اقبال (Allama Iqbal)',
    'مرزا غالب (Mirza Ghalib)',
    'فیض احمد فیض (Faiz Ahmad Faiz)',
    'جون ایلیا (Jaun Elia)',
    'پروین شاکر (Parveen Shakir)',
    'احمد فراز (Ahmad Faraz)',
    'میر تقی میر (Mir Taqi Mir)',
    'نامعلوم (Anonymous)'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF9] w-full max-w-xl rounded-3xl border border-[#ebd7c2] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#4A1025] via-[#631431] to-[#8B1E3F] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Add Urdu Poetry / اشعار</span>
                <span className="text-xs font-urdu text-amber-300">نیا کلام</span>
              </h2>
              <p className="text-[11px] text-[#ebd7c2]">
                Instant publication to Kitabistan app and Supabase database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#ebd7c2] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Urdu Poetry Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-[#8B1E3F]" />
                <span>Poetry Lines (اردو اشعار / کلام)</span>
              </label>
              <span className="text-[11px] font-urdu text-[#8B1E3F] font-bold">نستعلیق فارمیٹ</span>
            </div>
            <textarea
              dir="rtl"
              rows={4}
              value={linesUrdu}
              onChange={(e) => setLinesUrdu(e.target.value)}
              placeholder="ستاروں سے آگے جہاں اور بھی ہیں&#10;ابھی عشق کے امتحاں اور بھی ہیں..."
              className="w-full px-4 py-3 rounded-2xl bg-white border border-[#ead4ba] text-sm md:text-base font-urdu text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] leading-loose resize-none shadow-xs"
              required
            />
            <p className="text-[11px] text-[#786161] mt-1">
              Tip: Press Enter between verses (شعر کے مصرعے علیحدہ سطر پر لکھیں)
            </p>
          </div>

          {/* Poet Name & Suggestions */}
          <div>
            <label className="text-xs font-bold text-[#2D1A1A] block mb-1.5">
              Poet Name / شاعر کا نام
            </label>
            <input
              type="text"
              value={poetName}
              onChange={(e) => setPoetName(e.target.value)}
              placeholder="e.g. Allama Iqbal / علامہ اقبال"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ead4ba] text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] shadow-xs"
              required
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {samplePoets.map((poet) => (
                <button
                  key={poet}
                  type="button"
                  onClick={() => setPoetName(poet.split(' (')[0])}
                  className="px-2.5 py-1 rounded-lg bg-[#F5EBE1] hover:bg-[#8B1E3F] hover:text-white text-[10px] text-[#4A1025] font-medium transition-colors"
                >
                  {poet}
                </button>
              ))}
            </div>
          </div>

          {/* Genre & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#8B1E3F]" />
                <span>Poetry Genre / صنف</span>
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#ead4ba] text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
              >
                <option value="Sher">Sher / شعر (Two Verses)</option>
                <option value="Ghazal">Ghazal / غزل</option>
                <option value="Nazm">Nazm / نظم</option>
                <option value="Rubai">Rubai / رباعی</option>
                <option value="Romantic">Romantic / رومانوی شاعری</option>
                <option value="Sad">Sad / اداس و درد بھری شاعری</option>
                <option value="Sufi">Sufi / صوفیانہ کلام</option>
                <option value="Motivational">Motivational / انقلابی شاعری</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2D1A1A] block mb-1.5">
                Publishing Status / حالت
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft')}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#ead4ba] text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
              >
                <option value="Published">Published (Live on User App)</option>
                <option value="Draft">Draft (Only Admin View)</option>
              </select>
            </div>
          </div>

          {/* Live Preview Box */}
          {linesUrdu && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF3EA] to-[#F3E5D3] border border-[#E3CCA8] text-center shadow-xs">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#8B1E3F] text-amber-200 text-[10px] font-bold mb-2 uppercase tracking-wide">
                Live App Preview
              </span>
              <p
                dir="rtl"
                className="font-urdu text-base md:text-lg text-[#2D1A1A] leading-relaxed whitespace-pre-line"
              >
                {linesUrdu}
              </p>
              <p className="text-xs font-serif text-[#8B1E3F] font-bold mt-2">
                — {poetName || 'شاعر کا نام'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#ebd7c2] text-xs font-semibold text-[#786161] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-md shadow-[#8B1E3F]/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Publish Poetry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
