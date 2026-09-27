import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Eye,
  FileText,
  FileUp,
  Sparkles,
  Star,
  CheckCircle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Book, Chapter, Author, Category } from '../types';
import { UserAppReaderModal } from './UserAppReaderModal';

interface BooksViewProps {
  books: Book[];
  chapters: Chapter[];
  authors: Author[];
  categories: Category[];
  onOpenAddBookModal: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onOpenAddChapterModal: (book: Book) => void;
  onEditChapter: (book: Book, chapter: Chapter) => void;
  onDeleteChapter: (id: string) => void;
  onOpenAddPoetryModal?: () => void;
}

export const BooksView: React.FC<BooksViewProps> = ({
  books,
  chapters,
  authors,
  categories,
  onOpenAddBookModal,
  onEditBook,
  onDeleteBook,
  onOpenAddChapterModal,
  onEditChapter,
  onDeleteChapter,
  onOpenAddPoetryModal
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [structureFilter, setStructureFilter] = useState<'all' | 'chapter_based' | 'full_book'>('all');
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'chapters' | 'content' | 'synopsis' | 'gates'>('chapters');

  // User App Reader Simulator State
  const [readerModalOpen, setReaderModalOpen] = useState(false);
  const [readerBookId, setReaderBookId] = useState<string>('');
  const [readerChapterId, setReaderChapterId] = useState<string | undefined>(undefined);

  const openReader = (bookId: string, chapterId?: string) => {
    setReaderBookId(bookId);
    setReaderChapterId(chapterId);
    setReaderModalOpen(true);
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title_en.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (b.title_urdu && b.title_urdu.includes(searchFilter)) ||
      b.author_name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || b.category_id === selectedCategory;
    const matchesStructure =
      structureFilter === 'all' ||
      (structureFilter === 'full_book' ? b.structure_type === 'full_book' : b.structure_type !== 'full_book');
    return matchesSearch && matchesCategory && matchesStructure;
  });

  const selectedBook = books.find((b) => b.id === selectedBookId) || books[0];
  const isSelectedFullBook = selectedBook?.structure_type === 'full_book';

  const bookChapters = selectedBook
    ? chapters
        .filter((c) => c.book_id === selectedBook.id)
        .sort((a, b) => a.chapter_no - b.chapter_no)
    : [];

  const textChaptersCount = chapters.filter((c) => c.content_type === 'text').length;
  const pdfChaptersCount = chapters.filter((c) => c.content_type === 'pdf').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#2D1A1A]">Urdu Novels Catalog</h1>
          <p className="text-xs text-[#786161]">
            Comprehensive manuscript management, chapter typesetting, and ad-gate rules
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {onOpenAddPoetryModal && (
            <button
              id="books-add-poetry-btn"
              onClick={onOpenAddPoetryModal}
              className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-[#ebd7c2] bg-white hover:bg-[#FAF3EA] text-[#4A1025] text-xs font-bold shadow-xs transition-all active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#8B1E3F]" />
              <span>Add Poetry / اشعار</span>
            </button>
          )}

          <button
            id="books-add-novel-btn"
            onClick={onOpenAddBookModal}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-md shadow-[#8B1E3F]/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FF8C00]" />
            <span>Add New Novel</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs font-medium text-[#786161]">Total Library Novels</p>
          <p className="text-xl sm:text-2xl font-black text-[#8B1E3F] mt-1">{books.length}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Published & In Catalog</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs font-medium text-[#786161]">Active Chapters</p>
          <p className="text-xl sm:text-2xl font-black text-[#2D1A1A] mt-1">1,840</p>
          <p className="text-[11px] text-[#786161] mt-0.5">Across all serialized novels</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs font-medium text-[#786161]">Text Mode (Nastaleeq)</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">1,420</p>
          <p className="text-[11px] text-[#786161] mt-0.5">77% reader preferred format</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs font-medium text-[#786161]">PDF Releases</p>
          <p className="text-xl sm:text-2xl font-black text-[#FF8C00] mt-1">420</p>
          <p className="text-[11px] text-[#786161] mt-0.5">Scanned historic releases</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8B1E3F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter novels by title or author..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={structureFilter}
            onChange={(e) => setStructureFilter(e.target.value as any)}
            className="w-full sm:w-36 px-2.5 py-2 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
          >
            <option value="all">All Structures</option>
            <option value="chapter_based">Chapter-Based</option>
            <option value="full_book">Full-Book</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en} ({c.name_urdu})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Master-Detail Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Urdu Novels Directory Table */}
        <div className="xl:col-span-7 bg-white rounded-3xl border border-[#ead4ba] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#ebd7c2] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2D1A1A]">Novels Directory</h3>
              <p className="text-[11px] text-[#786161]">Click any novel to inspect chapters and details</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F]">
              {filteredBooks.length} Novels
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8E7] text-[#574141] font-bold border-b border-[#ebd7c2]">
                <tr>
                  <th className="py-3 px-4">Cover & Novel</th>
                  <th className="py-3 px-3">Author</th>
                  <th className="py-3 px-3">Structure</th>
                  <th className="py-3 px-3">Chapters</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4ebe1]">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-4 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] flex items-center justify-center text-[#8B1E3F] mb-3">
                          <BookOpen className="w-6 h-6 text-[#8B1E3F]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#2D1A1A]">No Novels in Catalog</h3>
                        <p className="text-xs text-[#786161] mt-1 mb-4">
                          All dummy novels have been wiped. You can now upload your own novels using direct image URLs or file uploads!
                        </p>
                        <button
                          onClick={onOpenAddBookModal}
                          className="px-4 py-2 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#FF8C00]" />
                          <span>Add Your First Novel</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => {
                  const isSelected = selectedBook?.id === book.id;
                  const isFull = book.structure_type === 'full_book';
                  return (
                    <tr
                      key={book.id}
                      onClick={() => setSelectedBookId(book.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#8B1E3F]/8 border-l-4 border-[#8B1E3F]'
                          : 'hover:bg-[#FFFDF9]'
                      }`}
                    >
                      {/* Cover & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={book.cover_url}
                            alt={book.title_en}
                            className="w-10 h-14 object-cover rounded-lg shadow-xs border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#2D1A1A] truncate">{book.title_en}</p>
                            {book.title_urdu && (
                              <p className="font-urdu text-[11px] text-[#8B1E3F] truncate">
                                {book.title_urdu}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>{book.rating}</span>
                              <span>•</span>
                              <span>{book.reads_count.toLocaleString()} reads</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-3 font-medium text-[#2D1A1A]">
                        <p>{book.author_name}</p>
                        {book.author_urdu && (
                          <p className="font-urdu text-[11px] text-gray-500">{book.author_urdu}</p>
                        )}
                      </td>

                      {/* Structure Badge */}
                      <td className="py-3 px-3">
                        {isFull ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold whitespace-nowrap">
                            Full Book
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold whitespace-nowrap">
                            Chapter-Based
                          </span>
                        )}
                      </td>

                      {/* Chapters & Gate */}
                      <td className="py-3 px-3 font-semibold text-[#2D1A1A]">
                        <div className="flex items-center gap-1.5">
                          {isFull ? (
                            <span className="text-[11px] text-[#786161]">Single Novel</span>
                          ) : (
                            <span>{book.total_chapters} Ch.</span>
                          )}
                          {book.is_locked ? (
                            <span title="Ad / VIP Gate Active">
                              <Lock className="w-3 h-3 text-[#8B1E3F]" />
                            </span>
                          ) : (
                            <span title="Free Reading">
                              <Unlock className="w-3 h-3 text-emerald-600" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            book.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {book.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openReader(book.id)}
                            className="p-1.5 rounded-lg hover:bg-[#FFF8E7] text-[#8B1E3F]"
                            title="Preview in User App"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditBook(book)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#574141] hover:text-[#8B1E3F]"
                            title="Edit Novel"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteBook(book.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600"
                            title="Delete Novel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Selected Book Active Details & Chapters Inspector */}
        {selectedBook ? (
          <div className="xl:col-span-5 space-y-4">
            {/* Book Overview Card */}
            <div className="p-5 rounded-3xl bg-white border border-[#ead4ba] shadow-xs">
              <div className="flex gap-4">
                {/* 200x300 Aspect Ratio Cover */}
                <div className="relative w-28 h-40 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-[#8B1E3F]/30 bg-gray-100">
                  <img
                    src={selectedBook.cover_url}
                    alt={selectedBook.title_en}
                    className="w-full h-full object-cover"
                  />
                  {selectedBook.is_locked && (
                    <span className="absolute top-1.5 left-1.5 bg-[#8B1E3F] text-white p-1 rounded-md shadow-xs">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF8E7] text-[#8B1E3F] border border-[#ebd7c2]">
                      {selectedBook.category_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isSelectedFullBook
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isSelectedFullBook ? 'Full Book' : 'Chapter-Based'}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      {selectedBook.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#2D1A1A] mt-1.5 truncate">
                    {selectedBook.title_en}
                  </h3>
                  {selectedBook.title_urdu && (
                    <p className="font-urdu text-sm text-[#8B1E3F] font-bold">
                      {selectedBook.title_urdu}
                    </p>
                  )}

                  <p className="text-xs text-[#786161] mt-0.5">
                    By <span className="font-semibold text-[#2D1A1A]">{selectedBook.author_name}</span>
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#f0e2d3] text-xs">
                    <div>
                      <p className="text-[10px] text-[#786161]">Total Reads</p>
                      <p className="font-bold text-[#2D1A1A]">{selectedBook.reads_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#786161]">Word Count</p>
                      <p className="font-bold text-[#2D1A1A]">{selectedBook.word_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#786161]">Rating</p>
                      <p className="font-bold text-amber-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{selectedBook.rating}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quick User App Preview Button */}
                  <div className="mt-3 pt-2">
                    <button
                      onClick={() => openReader(selectedBook.id)}
                      className="w-full py-2 px-3 rounded-xl bg-[#FFF8E7] hover:bg-[#ffeec2] border border-[#ebd7c2] text-[#8B1E3F] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Test / Read in User App Simulator</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex border-b border-[#f0e2d3] mt-5">
                {isSelectedFullBook ? (
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
                      activeTab === 'content' || activeTab === 'chapters'
                        ? 'border-[#8B1E3F] text-[#8B1E3F]'
                        : 'border-transparent text-gray-500 hover:text-[#2D1A1A]'
                    }`}
                  >
                    Full Book Content
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('chapters')}
                    className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
                      activeTab === 'chapters'
                        ? 'border-[#8B1E3F] text-[#8B1E3F]'
                        : 'border-transparent text-gray-500 hover:text-[#2D1A1A]'
                    }`}
                  >
                    Chapters ({bookChapters.length})
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('synopsis')}
                  className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
                    activeTab === 'synopsis'
                      ? 'border-[#8B1E3F] text-[#8B1E3F]'
                      : 'border-transparent text-gray-500 hover:text-[#2D1A1A]'
                  }`}
                >
                  Synopsis
                </button>
                <button
                  onClick={() => setActiveTab('gates')}
                  className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
                    activeTab === 'gates'
                      ? 'border-[#8B1E3F] text-[#8B1E3F]'
                      : 'border-transparent text-gray-500 hover:text-[#2D1A1A]'
                  }`}
                >
                  Ad Gates
                </button>
              </div>

              {/* MODE A: CHAPTER-BASED BOOK TAB */}
              {!isSelectedFullBook && activeTab === 'chapters' && (
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#2D1A1A]">Chapter-Based Catalog</p>
                      <p className="text-[10px] text-gray-500">Each chapter has isolated ID and content</p>
                    </div>
                    <button
                      onClick={() => onOpenAddChapterModal(selectedBook)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FF8C00]" />
                      <span>+ Add Chapter</span>
                    </button>
                  </div>

                  {bookChapters.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-dashed border-[#ebd7c2] text-center">
                      <p className="text-xs text-gray-500">No chapters published yet.</p>
                      <button
                        onClick={() => onOpenAddChapterModal(selectedBook)}
                        className="mt-2 text-xs font-bold text-[#8B1E3F] hover:underline"
                      >
                        + Add Chapter 1 now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {bookChapters.map((ch) => {
                        const hasPdf = Boolean(ch.content_pdf_url || ch.pdf_storage_path);
                        const isCloudStorage = Boolean(ch.pdf_storage_path);
                        const isExternalUrl = Boolean(ch.content_pdf_url && !ch.pdf_storage_path);

                        let contentTypeLabel = '1. Text';
                        if (ch.content_type === 'pdf_upload' || ch.content_type === 'pdf') {
                          contentTypeLabel = '2. PDF Upload';
                        } else if (ch.content_type === 'pdf_url') {
                          contentTypeLabel = '3. PDF URL';
                        } else if (ch.content_type === 'text_and_pdf') {
                          contentTypeLabel = '4. Text + PDF';
                        }

                        return (
                          <div
                            key={ch.id}
                            className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#ebd7c2] hover:border-[#8B1E3F] transition-all space-y-2 shadow-2xs"
                          >
                            {/* Card Top: Chapter Number & Title */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-[#8B1E3F] bg-[#FFF8E7] px-2 py-0.5 rounded-md border border-[#ebd7c2]">
                                    Chapter {ch.chapter_no}
                                  </span>
                                  <h4 className="font-bold text-xs text-[#2D1A1A] truncate max-w-[200px]">
                                    {ch.title_en}
                                  </h4>
                                </div>
                                {ch.title_urdu && (
                                  <p className="font-urdu text-[12px] text-[#8B1E3F] mt-0.5">
                                    {ch.title_urdu}
                                  </p>
                                )}
                              </div>

                              {/* Card Actions: Test, Edit, Delete */}
                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  onClick={() => openReader(selectedBook.id, ch.id)}
                                  className="p-1.5 rounded-lg hover:bg-[#FFF8E7] text-[#8B1E3F]"
                                  title="Test chapter in User App"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onEditChapter(selectedBook, ch)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#8B1E3F]"
                                  title="Edit chapter content"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteChapter(ch.id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600"
                                  title="Delete chapter"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Card Attributes: Content Type & PDF Status */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#f4ebe1] text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#786161]">Content Type:</span>
                                <span className="font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                  {contentTypeLabel}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[#786161]">PDF Status:</span>
                                {hasPdf ? (
                                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    {isCloudStorage ? 'Cloud Storage' : isExternalUrl ? 'Direct URL' : 'Attached'}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-normal">
                                    None (Text only)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Storage path or URL details preview if available */}
                            {ch.pdf_storage_path && (
                              <p className="text-[10px] text-gray-400 font-mono truncate">
                                Path: {ch.pdf_storage_path}
                              </p>
                            )}
                            {isExternalUrl && ch.content_pdf_url && (
                              <p className="text-[10px] text-[#8B1E3F] font-mono truncate">
                                URL: {ch.content_pdf_url}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: FULL-BOOK CONTENT TAB */}
              {isSelectedFullBook && (activeTab === 'content' || activeTab === 'chapters') && (
                <div className="pt-4 space-y-4">
                  {/* Full Book Content Card */}
                  <div className="p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#8B1E3F]/30 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#ebd7c2]">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#8B1E3F]" />
                        <h4 className="text-xs font-bold text-[#2D1A1A]">
                          Full Book Content
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        Full-Book Mode (No Chapters)
                      </span>
                    </div>

                    {/* Content Type Row */}
                    <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                      <span className="text-[#786161]">Content Type:</span>
                      <span className="font-bold px-2 py-0.5 rounded-lg bg-[#8B1E3F] text-white">
                        {selectedBook.full_content_type === 'text' && '1. Text'}
                        {selectedBook.full_content_type === 'pdf_upload' && '2. PDF Upload'}
                        {selectedBook.full_content_type === 'pdf_url' && '3. PDF URL'}
                        {selectedBook.full_content_type === 'text_and_pdf' && '4. Text + PDF'}
                        {!selectedBook.full_content_type && '1. Text'}
                      </span>
                    </div>

                    {/* PDF Status Row */}
                    <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                      <span className="text-[#786161]">PDF Status:</span>
                      {selectedBook.full_pdf_storage_path ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Cloud Storage ({selectedBook.full_pdf_file_name || 'Attached PDF'})
                        </span>
                      ) : selectedBook.full_pdf_url ? (
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          External Direct URL
                        </span>
                      ) : (
                        <span className="text-gray-400">No PDF Attached</span>
                      )}
                    </div>

                    {/* PDF Storage Path or URL details */}
                    {selectedBook.full_pdf_storage_path && (
                      <div className="p-2 bg-white rounded-xl border border-[#ebd7c2] text-[10px] font-mono text-[#574141] break-all">
                        Storage Path: {selectedBook.full_pdf_storage_path}
                      </div>
                    )}
                    {selectedBook.full_pdf_url && (
                      <div className="p-2 bg-white rounded-xl border border-[#ebd7c2] text-[10px] font-mono text-[#8B1E3F] break-all">
                        PDF URL: {selectedBook.full_pdf_url}
                      </div>
                    )}

                    {/* Text Manuscript Excerpt (if Text or Text + PDF) */}
                    {(selectedBook.full_content_type === 'text' || selectedBook.full_content_type === 'text_and_pdf' || !selectedBook.full_content_type) && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-[#786161]">
                          <span>Urdu Manuscript Excerpt:</span>
                          <span className="font-semibold text-[#8B1E3F]">
                            {selectedBook.full_content ? selectedBook.full_content.trim().split(/\s+/).filter(Boolean).length : 0} Words
                          </span>
                        </div>
                        <div
                          dir="rtl"
                          className="p-3 bg-white rounded-xl border border-[#ebd7c2] text-right font-urdu text-[15px] leading-relaxed text-[#2D1A1A] max-h-24 overflow-y-auto line-clamp-3"
                        >
                          {selectedBook.full_content || '(کوئی متن تحریر نہیں کیا گیا)'}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons: Edit Full Book & Test in User App */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#ebd7c2]">
                      <button
                        onClick={() => onEditBook(selectedBook)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Full Book Content</span>
                      </button>
                      <button
                        onClick={() => openReader(selectedBook.id)}
                        className="py-2 px-3.5 rounded-xl border border-[#ebd7c2] bg-white hover:bg-[#FAF3EA] text-[#574141] text-xs font-bold flex items-center gap-1.5 transition-all"
                        title="Open in User App Simulator"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#8B1E3F]" />
                        <span>User App</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Synopsis */}
              {activeTab === 'synopsis' && (
                <div className="pt-4 space-y-3 text-xs text-[#2D1A1A]">
                  <p className="leading-relaxed bg-[#FFFDF9] p-3.5 rounded-2xl border border-[#ebd7c2]">
                    {selectedBook.description || 'No synopsis provided for this novel yet.'}
                  </p>
                  <button
                    onClick={() => onEditBook(selectedBook)}
                    className="text-xs text-[#8B1E3F] font-bold hover:underline"
                  >
                    Edit Novel Metadata
                  </button>
                </div>
              )}

              {/* Tab 3: Ad Gates */}
              {activeTab === 'gates' && (
                <div className="pt-4 space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#ebd7c2] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2D1A1A]">Lock Status</span>
                      <span className="font-semibold text-[#8B1E3F]">
                        {selectedBook.is_locked ? 'Monetization Active' : 'Free Open Access'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      When locked, readers access this content via rewarded video ads or VIP points deduction.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="xl:col-span-5 p-8 rounded-3xl bg-white border border-[#ead4ba] text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] flex items-center justify-center text-[#8B1E3F] mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#2D1A1A]">No Novel Selected</h3>
            <p className="text-xs text-[#786161] max-w-sm mt-1 mb-4">
              Add a novel to compose chapters, attach Nastaleeq text or PDF manuscripts, and configure ad monetization.
            </p>
            <button
              onClick={onOpenAddBookModal}
              className="px-4 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#FF8C00]" />
              <span>Add New Novel</span>
            </button>
          </div>
        )}
      </div>

      {/* User App Reader Simulator Modal */}
      {readerModalOpen && (
        <UserAppReaderModal
          isOpen={readerModalOpen}
          onClose={() => setReaderModalOpen(false)}
          bookId={readerBookId}
          initialChapterId={readerChapterId}
        />
      )}
    </div>
  );
};
