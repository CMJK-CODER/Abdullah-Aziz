import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  FileText,
  FileUp,
  Globe,
  Layers,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Type,
  Moon,
  Sun,
  ShieldCheck,
  Download,
  Loader2
} from 'lucide-react';
import { Book, Chapter } from '../types';
import {
  userAppFetchBook,
  userAppFetchChapters,
  userAppFetchChapter,
  resolvePdfUrl
} from '../services/supabase';

interface UserAppReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  initialChapterId?: string;
}

export const UserAppReaderModal: React.FC<UserAppReaderModalProps> = ({
  isOpen,
  onClose,
  bookId,
  initialChapterId
}) => {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(initialChapterId || null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedPdf, setResolvedPdf] = useState<string>('');
  const [isResolvingPdf, setIsResolvingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [fontSize, setFontSize] = useState<number>(20);
  const [nightMode, setNightMode] = useState<boolean>(false);

  // Fetch Book and Chapters using User App query services
  useEffect(() => {
    if (!isOpen || !bookId) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        const fetchedBook = await userAppFetchBook(bookId);
        if (!isMounted) return;
        setBook(fetchedBook);

        if (fetchedBook?.structure_type === 'chapter_based') {
          const chaps = await userAppFetchChapters(bookId);
          if (!isMounted) return;
          setChapters(chaps);

          const targetChapId =
            initialChapterId && chaps.some((c) => c.id === initialChapterId)
              ? initialChapterId
              : chaps[0]?.id || null;

          setSelectedChapterId(targetChapId);
        } else {
          // Full-Book: no chapters needed
          setChapters([]);
          setSelectedChapterId(null);
        }
      } catch (err) {
        console.error('Failed to load in User App Reader mode:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, bookId, initialChapterId]);

  // Fetch isolated chapter when selectedChapterId changes
  useEffect(() => {
    if (!selectedChapterId || !bookId) {
      setCurrentChapter(null);
      return;
    }

    let isMounted = true;
    async function loadChap() {
      const chap = await userAppFetchChapter(bookId, selectedChapterId!);
      if (!isMounted) return;
      setCurrentChapter(chap);
    }

    loadChap();

    return () => {
      isMounted = false;
    };
  }, [bookId, selectedChapterId]);

  // Resolve PDF URL when chapter or full book changes
  useEffect(() => {
    let isMounted = true;
    setIsResolvingPdf(true);

    async function resolve() {
      let targetPdfUrl: string | undefined;
      let targetStoragePath: string | undefined;

      if (book?.structure_type === 'full_book') {
        targetPdfUrl = book.full_pdf_url;
        targetStoragePath = book.full_pdf_storage_path;
        if (book.full_content_type === 'pdf_upload' || book.full_content_type === 'pdf_url') {
          setActiveTab('pdf');
        } else {
          setActiveTab('text');
        }
      } else if (currentChapter) {
        targetPdfUrl = currentChapter.content_pdf_url;
        targetStoragePath = currentChapter.pdf_storage_path;
        if (currentChapter.content_type === 'pdf_upload' || currentChapter.content_type === 'pdf_url' || currentChapter.content_type === 'pdf') {
          setActiveTab('pdf');
        } else {
          setActiveTab('text');
        }
      }

      const resolved = await resolvePdfUrl(targetPdfUrl, targetStoragePath);
      if (isMounted) {
        setResolvedPdf(resolved);
        setIsResolvingPdf(false);
      }
    }

    resolve();

    return () => {
      isMounted = false;
    };
  }, [book?.structure_type, book?.full_pdf_url, book?.full_pdf_storage_path, book?.full_content_type, currentChapter]);

  if (!isOpen) return null;

  const isFullBook = book?.structure_type === 'full_book';
  const effectiveContentType = isFullBook
    ? book?.full_content_type || 'text'
    : currentChapter?.content_type || 'text';

  const hasTextContent =
    effectiveContentType === 'text' ||
    effectiveContentType === 'text_and_pdf';

  const hasPdfContent =
    effectiveContentType === 'pdf_upload' ||
    effectiveContentType === 'pdf_url' ||
    effectiveContentType === 'pdf' ||
    effectiveContentType === 'text_and_pdf';

  const textToDisplay = isFullBook
    ? book?.full_content || ''
    : currentChapter?.content_text_urdu || '';

  const liveWordCount = textToDisplay.trim()
    ? textToDisplay.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#ead4ba] overflow-hidden z-10 flex flex-col max-h-[94vh]">
        {/* Top Header Bar */}
        <div className="bg-[#4A1025] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#5e1832]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#8B1E3F] rounded-xl text-white shadow-xs">
              <BookOpen className="w-5 h-5 text-[#FF8C00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF8C00] text-black">
                  Kitabistan User App Mode
                </span>
                <span className="text-xs text-[#e8b4c2]">
                  {isFullBook ? 'Full-Book Manuscript' : 'Chapter-Based Reader'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span>{book?.title_en || 'Book Title'}</span>
                {book?.title_urdu && (
                  <span className="font-urdu text-[#FF8C00]">({book.title_urdu})</span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dark/Night mode toggle for authentic reader feel */}
            <button
              onClick={() => setNightMode(!nightMode)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              title={nightMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              {nightMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="bg-[#FFF8E7] px-5 py-2.5 border-b border-[#ebd7c2] flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-[#2D1A1A]">
              Supabase → User App Resolution:
            </span>
            <span className="font-mono text-[11px] text-[#786161]">
              Book ID: <code className="bg-white px-1 py-0.5 rounded border border-[#ebd7c2] text-[#8B1E3F]">{book?.id}</code>
            </span>
            {!isFullBook && currentChapter && (
              <span className="font-mono text-[11px] text-[#786161]">
                Chapter ID: <code className="bg-white px-1 py-0.5 rounded border border-[#ebd7c2] text-[#8B1E3F]">{currentChapter.id}</code>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Format: {effectiveContentType.toUpperCase().replace('_', ' ')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B1E3F] text-white">
              {isFullBook ? 'Full Book' : `Ch. ${currentChapter?.chapter_no || 1}`}
            </span>
          </div>
        </div>

        {/* Reader Sub-Bar: Chapter Navigator & View Switcher */}
        <div className="bg-white px-5 py-2.5 border-b border-[#ebd7c2] flex flex-wrap items-center justify-between gap-3">
          {/* Chapter Selector (if Chapter-Based) */}
          {!isFullBook ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#2D1A1A]">Chapters:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
                {chapters.map((chap) => (
                  <button
                    key={chap.id}
                    onClick={() => setSelectedChapterId(chap.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedChapterId === chap.id
                        ? 'bg-[#8B1E3F] text-white shadow-xs'
                        : 'bg-[#FFF8E7] text-[#574141] hover:bg-[#ebd7c2]/50'
                    }`}
                  >
                    Ch. {chap.chapter_no}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs font-semibold text-[#574141] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full Book Mode — Single complete manuscript (No Chapter 1 required)</span>
            </div>
          )}

          {/* Tab switcher (Text vs PDF if both available) */}
          <div className="flex items-center space-x-2">
            {hasTextContent && hasPdfContent && (
              <div className="flex bg-[#FFF8E7] p-1 rounded-xl border border-[#ebd7c2]">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'text'
                      ? 'bg-[#8B1E3F] text-white shadow-xs'
                      : 'text-[#786161] hover:text-[#2D1A1A]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Nastaleeq Text</span>
                </button>
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'pdf'
                      ? 'bg-[#8B1E3F] text-white shadow-xs'
                      : 'text-[#786161] hover:text-[#2D1A1A]'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>PDF Document</span>
                </button>
              </div>
            )}

            {/* Font size adjustment (when reading text) */}
            {hasTextContent && (activeTab === 'text' || !hasPdfContent) && (
              <div className="flex items-center space-x-1 bg-[#FFF8E7] px-2 py-1 rounded-xl border border-[#ebd7c2]">
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="w-6 h-6 rounded text-xs font-bold hover:bg-white text-[#8B1E3F]"
                  title="Smaller text"
                >
                  A-
                </button>
                <span className="text-[11px] font-mono font-bold text-[#2D1A1A] px-1">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className="w-6 h-6 rounded text-xs font-bold hover:bg-white text-[#8B1E3F]"
                  title="Larger text"
                >
                  A+
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Reader Viewport */}
        <div
          className={`flex-1 overflow-y-auto p-6 transition-colors ${
            nightMode
              ? 'bg-[#1C1618] text-[#F3EFE0]'
              : 'bg-[#FFFDF9] text-[#2D1A1A]'
          }`}
        >
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#8B1E3F] animate-spin" />
              <p className="text-xs text-[#786161]">Fetching content from Supabase pipeline...</p>
            </div>
          ) : (
            <div>
              {/* DISPLAY TEXT MANUSCRIPT */}
              {(activeTab === 'text' || !hasPdfContent) && hasTextContent && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Chapter or Book Title Header */}
                  <div className="text-center pb-6 border-b border-[#ebd7c2]/40">
                    <p className={`text-xs font-semibold ${nightMode ? 'text-amber-400' : 'text-[#8B1E3F]'}`}>
                      {isFullBook ? 'مکمل ناول' : `باب نمبر ${currentChapter?.chapter_no || 1}`}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold mt-1">
                      {isFullBook ? book?.title_en : currentChapter?.title_en}
                    </h2>
                    {(isFullBook ? book?.title_urdu : currentChapter?.title_urdu) && (
                      <h3 className="font-urdu text-2xl text-[#FF8C00] mt-1">
                        {isFullBook ? book?.title_urdu : currentChapter?.title_urdu}
                      </h3>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-3 text-[11px] opacity-70">
                      <span>مصنف: {book?.author_name}</span>
                      <span>•</span>
                      <span>{liveWordCount.toLocaleString()} الفاظ</span>
                      <span>•</span>
                      <span>جمیل نوری نستعلیق خط</span>
                    </div>
                  </div>

                  {/* Urdu Calligraphy Text */}
                  <div
                    dir="rtl"
                    className="font-urdu leading-[2.6] text-right whitespace-pre-line tracking-wide px-2 sm:px-6"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {textToDisplay || (
                      <div className="text-center py-12 opacity-60 text-sm font-sans">
                        (اس حصے کے لیے کوئی متن فراہم نہیں کیا گیا)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DISPLAY PDF MANUSCRIPT */}
              {(activeTab === 'pdf' || !hasTextContent) && hasPdfContent && (
                <div className="max-w-4xl mx-auto space-y-4">
                  {/* PDF Diagnostic & Resolution Card */}
                  <div
                    className={`p-4 rounded-2xl border ${
                      nightMode
                        ? 'bg-[#2A2024] border-[#4A323A]'
                        : 'bg-white border-[#ebd7c2] shadow-xs'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileUp className="w-4 h-4 text-[#8B1E3F]" />
                          <h4 className="text-xs font-bold">
                            {isFullBook ? 'Full Book PDF Manuscript' : `Chapter ${currentChapter?.chapter_no} PDF Attachment`}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            {effectiveContentType === 'pdf_url' ? 'External URL' : 'Supabase Storage'}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-75 mt-1 break-all font-mono">
                          Resolved URL: <span className="text-[#8B1E3F] font-semibold">{resolvedPdf || 'Resolving...'}</span>
                        </p>
                      </div>

                      {resolvedPdf && (
                        <div className="flex items-center gap-2">
                          <a
                            href={resolvedPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open in New Tab</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Embed / Preview */}
                  {isResolvingPdf ? (
                    <div className="p-12 text-center">
                      <Loader2 className="w-6 h-6 text-[#8B1E3F] animate-spin mx-auto mb-2" />
                      <p className="text-xs opacity-70">Generating signed PDF URL...</p>
                    </div>
                  ) : resolvedPdf ? (
                    <div className="rounded-2xl overflow-hidden border border-[#ebd7c2] shadow-md bg-white">
                      <iframe
                        src={resolvedPdf}
                        title="PDF Manuscript Viewer"
                        className="w-full h-[580px] border-0"
                      />
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#ebd7c2]">
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs font-bold">PDF Not Available</p>
                      <p className="text-[11px] opacity-70 mt-0.5">
                        Please attach a PDF file or enter a valid PDF URL in the Admin editor.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with quick chapter navigation */}
        <div className="bg-[#FFF8E7] px-6 py-3 border-t border-[#ebd7c2] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#786161]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kitabistan Reader Simulator • Production-grade Supabase schema</span>
          </div>

          <div className="flex items-center space-x-2">
            {!isFullBook && chapters.length > 1 && (
              <>
                <button
                  disabled={chapters.findIndex((c) => c.id === selectedChapterId) <= 0}
                  onClick={() => {
                    const idx = chapters.findIndex((c) => c.id === selectedChapterId);
                    if (idx > 0) setSelectedChapterId(chapters[idx - 1].id);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#ebd7c2] bg-white text-[#574141] font-bold hover:bg-[#FAF3EA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Ch.</span>
                </button>
                <button
                  disabled={chapters.findIndex((c) => c.id === selectedChapterId) >= chapters.length - 1}
                  onClick={() => {
                    const idx = chapters.findIndex((c) => c.id === selectedChapterId);
                    if (idx < chapters.length - 1) setSelectedChapterId(chapters[idx + 1].id);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#ebd7c2] bg-white text-[#574141] font-bold hover:bg-[#FAF3EA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Next Ch.</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white font-bold transition-all shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
