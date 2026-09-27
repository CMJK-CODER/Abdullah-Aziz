import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Trash2,
  Copy,
  Check,
  Feather,
  Database,
  Share2,
  Code
} from 'lucide-react';
import { PoetryLine } from '../types';
import { SUPABASE_RLS_FIX_SQL } from '../services/supabase';

interface PoetryViewProps {
  poetryList: PoetryLine[];
  onOpenAddModal: () => void;
  onDeletePoetry: (id: string) => Promise<void> | void;
}

export const PoetryView: React.FC<PoetryViewProps> = ({
  poetryList,
  onOpenAddModal,
  onDeletePoetry
}) => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const filteredPoetry = poetryList.filter((item) => {
    const matchesSearch =
      item.lines_urdu.toLowerCase().includes(search.toLowerCase()) ||
      item.poet_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.genre && item.genre.toLowerCase().includes(search.toLowerCase()));
    const matchesGenre = selectedGenre === 'all' || item.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleCopy = (id: string, text: string, poet: string) => {
    const fullText = `${text}\n— ${poet}\n(Kitabistan)`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const uniquePoetsCount = new Set(poetryList.map((p) => p.poet_name)).size;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl lg:text-2xl font-bold text-[#2D1A1A]">
              Urdu Poetry & Ash'aar
            </h1>
            <span className="font-urdu text-base text-[#8B1E3F] font-bold">اردو شاعری</span>
          </div>
          <p className="text-xs text-[#786161] mt-0.5">
            Curate classic and modern Urdu couplets, ghazals, and nazms for the Kitabistan mobile reader
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSqlModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-[#ebd7c2] bg-white hover:bg-[#FAF3EA] text-xs font-semibold text-[#4A1025] transition-colors shadow-xs"
            title="View Supabase table SQL code"
          >
            <Code className="w-4 h-4 text-[#8B1E3F]" />
            <span>SQL Script</span>
          </button>

          <button
            id="add-poetry-btn"
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-md shadow-[#8B1E3F]/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add Poetry / اشعار</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs font-medium text-[#786161]">Total Poetry Couplets</p>
          <p className="text-xl sm:text-2xl font-black text-[#8B1E3F] mt-1">{poetryList.length}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Live in User App</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs font-medium text-[#786161]">Distinct Poets</p>
          <p className="text-xl sm:text-2xl font-black text-[#2D1A1A] mt-1">{uniquePoetsCount}</p>
          <p className="text-[11px] text-[#786161] mt-0.5">Classic & Contemporary</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs font-medium text-[#786161]">Font Typography</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1 font-urdu">نستعلیق</p>
          <p className="text-[11px] text-[#786161] mt-0.5">Noto Nastaliq Urdu</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs font-medium text-[#786161]">Cloud Table</p>
          <p className="text-xs font-mono font-bold text-emerald-800 mt-2 bg-emerald-50 px-2 py-1 rounded inline-block">
            poetry_lines
          </p>
          <p className="text-[11px] text-[#786161] mt-1">Supabase Realtime Sync</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8B1E3F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Urdu verses, poet name, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
          >
            <option value="all">All Genres (تمام اصناف)</option>
            <option value="Sher">Sher / شعر</option>
            <option value="Ghazal">Ghazal / غزل</option>
            <option value="Nazm">Nazm / نظم</option>
            <option value="Rubai">Rubai / رباعی</option>
            <option value="Romantic">Romantic / رومانوی</option>
            <option value="Sad">Sad / اداس</option>
            <option value="Sufi">Sufi / صوفیانہ</option>
          </select>
        </div>
      </div>

      {/* Poetry Cards Grid */}
      {filteredPoetry.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#ead4ba] shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF3EA] text-[#8B1E3F] flex items-center justify-center mx-auto mb-4 border border-[#ebd7c2]">
            <Feather className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#2D1A1A]">No Poetry Added Yet</h3>
          <p className="text-xs text-[#786161] max-w-md mx-auto mt-1 mb-5">
            Your Kitabistan poetry collection is clean. Tap "+ Add Poetry / اشعار" above to publish your first couplet directly to the user app and Supabase database.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold shadow-md hover:bg-[#721733] transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add First Poetry Line</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPoetry.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#ead4ba] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Top Meta */}
                <div className="flex items-center justify-between border-b border-[#F5EBE1] pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3EA] border border-[#E3CCA8] text-[10px] font-bold text-[#8B1E3F]">
                      {item.genre || 'Sher'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#786161]">{item.created_at}</span>
                </div>

                {/* Poetry Urdu Verses */}
                <div className="text-center my-4 py-2 px-3 rounded-xl bg-[#FFFDF9]">
                  <p
                    dir="rtl"
                    className="font-urdu text-base sm:text-lg text-[#2D1A1A] leading-loose whitespace-pre-line tracking-wide"
                  >
                    {item.lines_urdu}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#F5EBE1] flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Feather className="w-3.5 h-3.5 text-[#8B1E3F]" />
                  <span className="text-xs font-bold text-[#4A1025] font-serif">
                    {item.poet_name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(item.id, item.lines_urdu, item.poet_name)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#8B1E3F] hover:bg-[#FAF3EA] transition-colors"
                    title="Copy poetry"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onDeletePoetry(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete poetry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SQL Script Viewer Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#ebd7c2] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#4A1025] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Supabase SQL Schema & RLS</h3>
                  <p className="text-[11px] text-[#ebd7c2]">
                    Includes poetry_lines table creation & permissive access
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-gray-300 hover:text-white text-sm px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-[#1E1E2E] text-emerald-300 text-xs font-mono">
              <pre className="whitespace-pre-wrap">{SUPABASE_RLS_FIX_SQL}</pre>
            </div>

            <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Run this in Supabase Dashboard → SQL Editor to ensure instant sync
              </p>
              <button
                onClick={handleCopySql}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold hover:bg-[#721733] transition-colors"
              >
                {copiedSql ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
