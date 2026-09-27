import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Check,
  BookOpen,
  Lock,
  Unlock,
  AlertCircle,
  Link as LinkIcon,
  Clipboard,
  Sparkles,
  PlusCircle,
  FolderOpen,
  Layers,
  FileText,
  FileUp,
  Quote,
  Trash2,
  CheckCircle2,
  Globe,
  Loader2
} from 'lucide-react';
import { Book, Author, Category, BookStructureType, ContentDeliveryType } from '../types';
import { uploadPdfFile, isValidPdfUrl } from '../services/supabase';
import { PdfPreviewBox } from './PdfPreviewBox';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBook: (book: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data?: Book; error?: string } | void> | void;
  existingBook?: Book | null;
  authors: Author[];
  categories: Category[];
}

const SAMPLE_COVERS = [
  {
    name: 'Romantic Bloom',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Antique Manuscript',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Spiritual Classic',
    url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Night Mystery',
    url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80'
  }
];

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onSaveBook,
  existingBook,
  authors,
  categories
}) => {
  const [titleEn, setTitleEn] = useState(existingBook?.title_en || '');
  const [titleUrdu, setTitleUrdu] = useState(existingBook?.title_urdu || '');

  // Author State: select existing or create new
  const [authorMode, setAuthorMode] = useState<'select' | 'custom'>(
    authors.length === 0 ? 'custom' : 'select'
  );
  const [authorId, setAuthorId] = useState(existingBook?.author_id || (authors[0]?.id || ''));
  const [customAuthorEn, setCustomAuthorEn] = useState(existingBook?.author_name || '');
  const [customAuthorUrdu, setCustomAuthorUrdu] = useState(existingBook?.author_urdu || '');

  // Category State: select existing or create new
  const [categoryMode, setCategoryMode] = useState<'select' | 'custom'>(
    categories.length === 0 ? 'custom' : 'select'
  );
  const [categoryId, setCategoryId] = useState(existingBook?.category_id || (categories[0]?.id || ''));
  const [customCategoryEn, setCustomCategoryEn] = useState(existingBook?.category_name || '');
  const [customCategoryUrdu, setCustomCategoryUrdu] = useState(existingBook?.category_urdu || '');

  // Cover Image State: URL vs File Upload
  const [coverMode, setCoverMode] = useState<'url' | 'file'>('url');
  const [coverUrl, setCoverUrl] = useState(
    existingBook?.cover_url ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
  );
  const [coverFileName, setCoverFileName] = useState(existingBook ? 'current_cover.jpg' : '');
  const [imageLoadError, setImageLoadError] = useState(false);

  const [description, setDescription] = useState(existingBook?.description || '');
  const [totalChapters, setTotalChapters] = useState(existingBook?.total_chapters || (existingBook?.structure_type === 'full_book' ? 0 : 1));
  const [isLocked, setIsLocked] = useState(existingBook?.is_locked ?? true);
  const [status, setStatus] = useState<'Approved' | 'Pending' | 'In Review' | 'Draft'>(
    existingBook?.status || 'Approved'
  );
  const [isDragOver, setIsDragOver] = useState(false);

  // Book Structure Mode
  const [structureType, setStructureType] = useState<BookStructureType>(
    existingBook?.structure_type || 'chapter_based'
  );

  // Full-Book Content States
  const [fullContentType, setFullContentType] = useState<ContentDeliveryType>(
    existingBook?.full_content_type || 'text'
  );
  const [fullContent, setFullContent] = useState<string>(existingBook?.full_content || '');
  const [fullPdfUrl, setFullPdfUrl] = useState<string>(existingBook?.full_pdf_url || '');
  const [fullPdfStoragePath, setFullPdfStoragePath] = useState<string>(existingBook?.full_pdf_storage_path || '');
  const [fullPdfFileName, setFullPdfFileName] = useState<string>(existingBook?.full_pdf_file_name || '');
  const [fullPdfFileSize, setFullPdfFileSize] = useState<string>(existingBook?.full_pdf_file_size || '');
  const [fullPdfPages, setFullPdfPages] = useState<number>(existingBook?.full_pdf_pages || 25);
  const [isUploadingFullPdf, setIsUploadingFullPdf] = useState(false);
  const [pdfUploadSuccessMsg, setPdfUploadSuccessMsg] = useState<string>('');
  const [pdfUrlError, setPdfUrlError] = useState<string>('');
  const [isPdfDragOver, setIsPdfDragOver] = useState(false);

  // Form submission and server error feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  // Critical State Isolation: When opening or toggling between Create mode and Edit mode, completely reset state
  useEffect(() => {
    if (!isOpen) return;

    if (existingBook) {
      // EDIT MODE: Populate strictly with target existing book's data
      setTitleEn(existingBook.title_en || '');
      setTitleUrdu(existingBook.title_urdu || '');
      setAuthorMode('select');
      setAuthorId(existingBook.author_id || (authors[0]?.id || ''));
      setCustomAuthorEn(existingBook.author_name || '');
      setCustomAuthorUrdu(existingBook.author_urdu || '');
      setCategoryMode('select');
      setCategoryId(existingBook.category_id || (categories[0]?.id || ''));
      setCustomCategoryEn(existingBook.category_name || '');
      setCustomCategoryUrdu(existingBook.category_urdu || '');
      setCoverMode('url');
      setCoverUrl(existingBook.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
      setCoverFileName('current_cover.jpg');
      setImageLoadError(false);
      setDescription(existingBook.description || '');
      setTotalChapters(existingBook.structure_type === 'full_book' ? 0 : (existingBook.total_chapters || 1));
      setIsLocked(existingBook.is_locked ?? true);
      setStatus(existingBook.status || 'Approved');
      setStructureType(existingBook.structure_type || 'chapter_based');
      setFullContentType(existingBook.full_content_type || 'text');
      setFullContent(existingBook.full_content || '');
      setFullPdfUrl(existingBook.full_pdf_url || '');
      setFullPdfStoragePath(existingBook.full_pdf_storage_path || '');
      setFullPdfFileName(existingBook.full_pdf_file_name || (existingBook.full_pdf_url ? 'manuscript.pdf' : ''));
      setFullPdfFileSize(existingBook.full_pdf_file_size || '');
      setFullPdfPages(existingBook.full_pdf_pages || 25);
      setPdfUploadSuccessMsg('');
      setPdfUrlError('');
      setServerError('');
    } else {
      // CREATE MODE: COMPLETELY CLEAN BLANK FORM. PREVIOUS BOOK DATA / PDF URL MUST NEVER APPEAR.
      setTitleEn('');
      setTitleUrdu('');
      setAuthorMode(authors.length === 0 ? 'custom' : 'select');
      setAuthorId(authors[0]?.id || '');
      setCustomAuthorEn('');
      setCustomAuthorUrdu('');
      setCategoryMode(categories.length === 0 ? 'custom' : 'select');
      setCategoryId(categories[0]?.id || '');
      setCustomCategoryEn('');
      setCustomCategoryUrdu('');
      setCoverMode('url');
      setCoverUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
      setCoverFileName('');
      setImageLoadError(false);
      setDescription('');
      setTotalChapters(1);
      setIsLocked(true);
      setStatus('Approved');
      setStructureType('chapter_based');
      setFullContentType('text');
      setFullContent('');
      setFullPdfUrl('');
      setFullPdfStoragePath('');
      setFullPdfFileName('');
      setFullPdfFileSize('');
      setFullPdfPages(25);
      setPdfUploadSuccessMsg('');
      setPdfUrlError('');
      setServerError('');
    }
  }, [isOpen, existingBook?.id]);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    setCoverFileName(file.name);
    setImageLoadError(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCoverUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image'))) {
        setCoverUrl(text.trim());
        setImageLoadError(false);
      }
    } catch {
      // Ignore if clipboard access denied
    }
  };

  const handleFullPdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setPdfUrlError('Please select a valid PDF file.');
      return;
    }
    setPdfUrlError('');
    setIsUploadingFullPdf(true);
    setPdfUploadSuccessMsg('');

    try {
      const bookPrefix = existingBook?.id || 'book-' + Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `books/${bookPrefix}_${Date.now()}_${sanitizedName}`;

      const res = await uploadPdfFile(file, 'book-pdfs', storagePath);
      setFullPdfUrl(res.url);
      setFullPdfStoragePath(res.storagePath);
      setFullPdfFileName(res.fileName);
      setFullPdfFileSize(res.fileSize);
      setFullPdfPages(res.pages);

      setPdfUploadSuccessMsg(
        res.isCloudStorage
          ? `Uploaded to Supabase Storage: ${res.fileName} (${res.fileSize})`
          : `PDF loaded: ${res.fileName} (${res.fileSize})`
      );
    } catch (err: any) {
      console.warn('PDF upload error:', err);
      setPdfUrlError(err?.message || 'Failed to upload PDF');
    } finally {
      setIsUploadingFullPdf(false);
    }
  };

  const handleInsertPoetryInFullBook = () => {
    const sher = '\n\nدل سے جو بات نکلتی ہے اثر رکھتی ہے\nپر نہیں، طاقت پرواز مگر رکھتی ہے\n\n';
    setFullContent((prev) => prev + sher);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || isSubmitting) return;

    // Validate PDF URL if in Full-Book mode with URL
    if (structureType === 'full_book' && (fullContentType === 'pdf_url' || fullContentType === 'text_and_pdf')) {
      if (fullPdfUrl.trim() && !isValidPdfUrl(fullPdfUrl.trim())) {
        setPdfUrlError('Please enter a valid HTTP/HTTPS URL (e.g. https://example.com/novel.pdf)');
        return;
      }
    }

    setIsSubmitting(true);
    setServerError('');

    // Resolve Author
    let finalAuthorId = authorId;
    let finalAuthorName = 'Author';
    let finalAuthorUrdu: string | undefined = undefined;

    if (authorMode === 'custom' || authors.length === 0) {
      if (!customAuthorEn.trim()) {
        setIsSubmitting(false);
        return;
      }
      finalAuthorName = customAuthorEn.trim();
      finalAuthorUrdu = customAuthorUrdu.trim() || undefined;
      finalAuthorId = 'auth-' + Date.now();
    } else {
      const found = authors.find((a) => a.id === authorId);
      if (found) {
        finalAuthorId = found.id;
        finalAuthorName = found.name_en;
        finalAuthorUrdu = found.name_urdu;
      }
    }

    // Resolve Category
    let finalCategoryId = categoryId;
    let finalCategoryName = 'General';
    let finalCategoryUrdu: string | undefined = undefined;

    if (categoryMode === 'custom' || categories.length === 0) {
      if (!customCategoryEn.trim()) {
        setIsSubmitting(false);
        return;
      }
      finalCategoryName = customCategoryEn.trim();
      finalCategoryUrdu = customCategoryUrdu.trim() || undefined;
      finalCategoryId = 'cat-' + Date.now();
    } else {
      const found = categories.find((c) => c.id === categoryId);
      if (found) {
        finalCategoryId = found.id;
        finalCategoryName = found.name_en;
        finalCategoryUrdu = found.name_urdu;
      }
    }

    const finalCover = coverUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';

    const liveWordCount = structureType === 'full_book' && fullContent.trim()
      ? fullContent.trim().split(/\s+/).filter(Boolean).length
      : (existingBook?.word_count || 12000);

    try {
      const res = await onSaveBook({
        title_en: titleEn.trim(),
        title_urdu: titleUrdu.trim() || undefined,
        author_id: finalAuthorId,
        author_name: finalAuthorName,
        author_urdu: finalAuthorUrdu,
        category_id: finalCategoryId,
        category_name: finalCategoryName,
        category_urdu: finalCategoryUrdu,
        cover_url: finalCover,
        description: description.trim() || undefined,
        total_chapters: structureType === 'full_book' ? 0 : (Number(totalChapters) || 0),
        word_count: liveWordCount,
        reads_count: existingBook?.reads_count || 0,
        rating: existingBook?.rating || 5.0,
        is_locked: isLocked,
        status: status,
        structure_type: structureType,
        full_content: structureType === 'full_book' ? (fullContent.trim() || undefined) : undefined,
        full_content_type: structureType === 'full_book' ? fullContentType : undefined,
        full_pdf_url: structureType === 'full_book' ? (fullPdfUrl.trim() || undefined) : undefined,
        full_pdf_storage_path: structureType === 'full_book' ? (fullPdfStoragePath || undefined) : undefined,
        full_pdf_file_name: structureType === 'full_book' ? (fullPdfFileName || undefined) : undefined,
        full_pdf_file_size: structureType === 'full_book' ? (fullPdfFileSize || undefined) : undefined,
        full_pdf_pages: structureType === 'full_book' ? fullPdfPages : undefined
      });

      if (res && res.success === false) {
        setServerError(res.error || 'Failed to save book to Supabase');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Error occurred while saving book');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#ead4ba] my-8 overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#4A1025] text-white px-6 py-4 flex items-center justify-between border-b border-[#5e1832]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#8B1E3F] rounded-xl text-white">
              <BookOpen className="w-5 h-5 text-[#FF8C00]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {existingBook ? 'Edit Novel Metadata' : 'Add New Urdu Novel'}
              </h3>
              <p className="text-xs text-[#e8b4c2]">Kitabistan Manuscript Index</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FFFDF9]">
          {/* Server Error Alert (e.g. Supabase RLS or connection error) */}
          {serverError && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-rose-900 text-sm">Save Failed (Database Notice)</p>
                <p className="mt-1 leading-relaxed text-rose-800">{serverError}</p>
                <p className="text-[11px] text-rose-700/80 mt-1.5 font-medium">
                  If this is a permissions/RLS error, run the SQL script in your Supabase SQL Editor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setServerError('')}
                className="text-rose-500 hover:text-rose-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Prominent Book Cover Art Section (URL + File Upload) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#8B1E3F]" />
                  <span>Book Cover Art * (URL or Upload)</span>
                </label>
                <p className="text-[11px] text-[#786161]">
                  Aspect ratio 2:3 (e.g. 400×600 or 600×900). Supports direct web URLs and file uploads.
                </p>
              </div>

              {/* Cover Mode Switcher Tabs */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-[#ebd7c2] shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCoverMode('url')}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    coverMode === 'url'
                      ? 'bg-[#8B1E3F] text-white shadow-xs'
                      : 'text-[#786161] hover:text-[#2D1A1A]'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode('file')}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    coverMode === 'file'
                      ? 'bg-[#8B1E3F] text-white shadow-xs'
                      : 'text-[#786161] hover:text-[#2D1A1A]'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Cover Preview (2:3 Aspect Ratio) */}
              <div className="relative w-28 sm:w-32 h-42 sm:h-48 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-[#8B1E3F]/40 bg-gray-100 flex flex-col items-center justify-center group">
                {coverUrl && !imageLoadError ? (
                  <img
                    src={coverUrl}
                    alt="Cover Preview"
                    onError={() => setImageLoadError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-3 text-center text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-1 text-gray-300" />
                    <span className="text-[10px] leading-tight">
                      {imageLoadError ? 'Image URL Unreachable' : 'No Cover Selected'}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs">
                  2:3 Art
                </span>
              </div>

              {/* Cover Input Container */}
              <div className="flex-1 w-full space-y-3">
                {coverMode === 'url' ? (
                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-4 h-4 text-[#8B1E3F] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          placeholder="https://... Enter or paste image URL (e.g. Unsplash, Pinterest, CDN)"
                          value={coverUrl}
                          onChange={(e) => {
                            setCoverUrl(e.target.value);
                            setImageLoadError(false);
                          }}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handlePasteClipboard}
                        className="px-3 py-2 bg-white border border-[#ebd7c2] hover:bg-[#ebd7c2]/50 text-xs font-semibold text-[#8B1E3F] rounded-xl flex items-center gap-1 shrink-0"
                        title="Paste from clipboard"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Paste</span>
                      </button>
                      {coverUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setCoverUrl('');
                            setImageLoadError(false);
                          }}
                          className="px-2.5 py-2 bg-white border border-[#ebd7c2] hover:bg-rose-50 text-xs font-semibold text-rose-600 rounded-xl"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {imageLoadError && (
                      <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Image failed to load from this URL. Please verify the link.</span>
                      </div>
                    )}

                    {/* Quick Preset Samples */}
                    <div>
                      <p className="text-[10px] font-bold text-[#786161] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#FF8C00]" />
                        <span>Or click a sample cover for testing:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SAMPLE_COVERS.map((sample) => (
                          <button
                            key={sample.name}
                            type="button"
                            onClick={() => {
                              setCoverUrl(sample.url);
                              setImageLoadError(false);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              coverUrl === sample.url
                                ? 'bg-[#8B1E3F] text-white border-[#8B1E3F]'
                                : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFFDF9]'
                            }`}
                          >
                            {sample.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* File Upload Dropzone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors relative cursor-pointer ${
                      isDragOver
                        ? 'border-[#8B1E3F] bg-[#8B1E3F]/10'
                        : 'border-[#ebd7c2] bg-white hover:bg-white/80'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-7 h-7 mx-auto text-[#8B1E3F] mb-1" />
                    <p className="text-xs font-bold text-[#2D1A1A]">
                      Click to choose image file or drag & drop cover art
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      JPG, PNG, WebP recommended
                    </p>

                    {coverFileName && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate max-w-[200px]">{coverFileName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                English Title * Required
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Peer-e-Kamil or Siyah Shaam"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-semibold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5 flex items-center justify-between">
                <span>Urdu Title (نستعلیق)</span>
                <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثلاً: پیر کامل یا سیاہ شام"
                value={titleUrdu}
                onChange={(e) => setTitleUrdu(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-sm font-urdu text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
              />
            </div>
          </div>

          {/* Book Structure Selection Mode */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebd7c2] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8B1E3F]" />
                  <span>Book Structure *</span>
                </label>
                <p className="text-[11px] text-[#786161]">
                  Choose how this book's content is formatted and released to readers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Chapter-Based Book */}
              <label
                onClick={() => {
                  setStructureType('chapter_based');
                  if (totalChapters === 0) setTotalChapters(1);
                }}
                className={`flex items-start p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  structureType === 'chapter_based'
                    ? 'border-[#8B1E3F] bg-[#8B1E3F]/5 shadow-xs'
                    : 'border-[#ebd7c2] hover:bg-[#FFF8E7]/50'
                }`}
              >
                <input
                  type="radio"
                  name="bookStructure"
                  value="chapter_based"
                  checked={structureType === 'chapter_based'}
                  onChange={() => {
                    setStructureType('chapter_based');
                    if (totalChapters === 0) setTotalChapters(1);
                  }}
                  className="w-4 h-4 text-[#8B1E3F] focus:ring-[#8B1E3F] mt-0.5"
                />
                <div className="ml-3">
                  <p className="text-xs font-bold text-[#2D1A1A]">Chapter-Based Book</p>
                  <p className="text-[11px] text-[#786161] mt-0.5">
                    Serialized novel with chapters added one by one (Chapter 1, 2, 3...)
                  </p>
                </div>
              </label>

              {/* Option B: Full Book */}
              <label
                onClick={() => {
                  setStructureType('full_book');
                  setTotalChapters(0);
                }}
                className={`flex items-start p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  structureType === 'full_book'
                    ? 'border-[#8B1E3F] bg-[#8B1E3F]/5 shadow-xs'
                    : 'border-[#ebd7c2] hover:bg-[#FFF8E7]/50'
                }`}
              >
                <input
                  type="radio"
                  name="bookStructure"
                  value="full_book"
                  checked={structureType === 'full_book'}
                  onChange={() => {
                    setStructureType('full_book');
                    setTotalChapters(0);
                  }}
                  className="w-4 h-4 text-[#8B1E3F] focus:ring-[#8B1E3F] mt-0.5"
                />
                <div className="ml-3">
                  <p className="text-xs font-bold text-[#2D1A1A]">Full Book</p>
                  <p className="text-[11px] text-[#786161] mt-0.5">
                    Single complete manuscript. Does NOT create or require chapters.
                  </p>
                </div>
              </label>
            </div>

            {structureType === 'chapter_based' ? (
              <div className="p-3 bg-[#FFF8E7] rounded-xl border border-[#ebd7c2] text-[11px] text-[#786161] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8B1E3F] shrink-0" />
                <span>
                  <strong>Chapter-Based Mode:</strong> Once saved, you can add and manage chapters one-by-one with dedicated Chapter IDs, isolated content, and independent PDF attachments.
                </span>
              </div>
            ) : null}
          </div>

          {/* IF FULL BOOK MODE: FULL BOOK CONTENT EDITOR */}
          {structureType === 'full_book' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E7] border-2 border-[#8B1E3F]/40 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#ebd7c2] pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-[#8B1E3F]" />
                  <h4 className="text-xs sm:text-sm font-bold text-[#2D1A1A]">
                    Full Book Content
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B1E3F] text-white">
                  Full-Book Mode
                </span>
              </div>

              {/* Full Book Content Type Selector */}
              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-2">
                  Full Book Content Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFullContentType('text');
                      setPdfUrlError('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      fullContentType === 'text'
                        ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs'
                        : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>1. Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFullContentType('pdf_upload');
                      setPdfUrlError('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      fullContentType === 'pdf_upload'
                        ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs'
                        : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    <span>2. PDF Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFullContentType('pdf_url');
                      setPdfUrlError('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      fullContentType === 'pdf_url'
                        ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs'
                        : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>3. PDF URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFullContentType('text_and_pdf');
                      setPdfUrlError('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      fullContentType === 'text_and_pdf'
                        ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs'
                        : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>4. Text + PDF</span>
                  </button>
                </div>
              </div>

              {/* TEXT EDITOR (if Text or Text + PDF) */}
              {(fullContentType === 'text' || fullContentType === 'text_and_pdf') && (
                <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#ebd7c2]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#8B1E3F]" />
                      <span>Full Novel Manuscript (Urdu/English)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleInsertPoetryInFullBook}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-[#FFF8E7] hover:bg-[#ffeec2] border border-[#ebd7c2] text-[#8B1E3F] font-medium"
                      >
                        <Quote className="w-3 h-3 text-[#FF8C00]" />
                        <span>شعر شامل کریں</span>
                      </button>
                      <span className="text-[11px] font-semibold text-[#8B1E3F]">
                        {fullContent.trim() ? fullContent.trim().split(/\s+/).filter(Boolean).length : 0} Words
                      </span>
                    </div>
                  </div>

                  <textarea
                    dir="rtl"
                    rows={8}
                    value={fullContent}
                    onChange={(e) => setFullContent(e.target.value)}
                    placeholder="یہاں مکمل ناول کا متن جمیل نوری نستعلیق فونٹ میں تحریر کریں یا ان پیج سے پیسٹ کریں..."
                    className="w-full p-4 bg-[#FFFDF9] border border-[#ebd7c2] focus:border-[#8B1E3F] rounded-xl text-[#2D1A1A] font-urdu text-[19px] leading-[2.2] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/10"
                  />
                </div>
              )}

              {/* PDF UPLOAD (if PDF Upload or Text + PDF) */}
              {(fullContentType === 'pdf_upload' || fullContentType === 'text_and_pdf') && (
                <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#ebd7c2]">
                  <label className="block text-xs font-bold text-[#2D1A1A]">
                    Upload Full Book PDF (Supabase Storage)
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsPdfDragOver(true);
                    }}
                    onDragLeave={() => setIsPdfDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsPdfDragOver(false);
                      if (e.dataTransfer.files?.[0]) handleFullPdfFile(e.dataTransfer.files[0]);
                    }}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors relative cursor-pointer ${
                      isPdfDragOver
                        ? 'border-[#8B1E3F] bg-[#8B1E3F]/10'
                        : 'border-[#8B1E3F]/30 bg-[#FFFDF9] hover:bg-[#FFF8E7]/40'
                    }`}
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={isUploadingFullPdf}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFullPdfFile(e.target.files[0]);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />

                    <FileUp className="w-8 h-8 mx-auto text-[#8B1E3F] mb-1.5" />
                    <p className="text-xs font-bold text-[#2D1A1A]">
                      {isUploadingFullPdf ? 'Uploading to Supabase Storage...' : 'Click to select Full Book PDF or Drag & Drop'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Uploads to storage bucket <code className="bg-[#FFF8E7] px-1 py-0.5 rounded font-mono text-[#8B1E3F]">book-pdfs</code>
                    </p>

                    {fullPdfFileName && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Attached: {fullPdfFileName} ({fullPdfFileSize || 'PDF'}, ~{fullPdfPages} pages)</span>
                      </div>
                    )}
                  </div>

                  {pdfUploadSuccessMsg && (
                    <p className="text-[11px] text-emerald-700 font-semibold">{pdfUploadSuccessMsg}</p>
                  )}
                </div>
              )}

              {/* PDF URL (if PDF URL or Text + PDF) */}
              {(fullContentType === 'pdf_url' || fullContentType === 'text_and_pdf') && (
                <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#ebd7c2]">
                  <label className="block text-xs font-bold text-[#2D1A1A]">
                    External PDF URL
                  </label>
                  <p className="text-[11px] text-[#786161]">
                    Enter a direct public HTTP/HTTPS URL pointing to the complete PDF manuscript.
                  </p>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#8B1E3F] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://example.com/books/complete-novel.pdf"
                      value={fullPdfUrl}
                      onChange={(e) => {
                        setFullPdfUrl(e.target.value);
                        setPdfUrlError('');
                      }}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
                    />
                  </div>

                  {pdfUrlError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{pdfUrlError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* LIVE PDF PREVIEW BEFORE PUBLISH (URL or Uploaded PDF) */}
              {fullPdfUrl && (
                <div className="space-y-2 pt-2 border-t border-[#ebd7c2]/70">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#8B1E3F]" />
                      <span>Live PDF Manuscript Preview (Verify Before Publishing)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFullPdfUrl('');
                        setFullPdfStoragePath('');
                        setFullPdfFileName('');
                        setPdfUploadSuccessMsg('');
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear PDF</span>
                    </button>
                  </div>
                  <PdfPreviewBox
                    url={fullPdfUrl}
                    title="Full Book Manuscript PDF Preview"
                    label="Full Novel Manuscript"
                  />
                </div>
              )}
            </div>
          )}

          {/* Author Selection or Custom Author */}
          <div className="p-4 rounded-2xl bg-white border border-[#ebd7c2]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#2D1A1A]">
                Author * Required
              </label>
              {authors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAuthorMode(authorMode === 'select' ? 'custom' : 'select')}
                  className="text-[11px] font-bold text-[#8B1E3F] hover:underline flex items-center gap-1"
                >
                  {authorMode === 'select' ? (
                    <>
                      <PlusCircle className="w-3 h-3" />
                      <span>+ Type New Author</span>
                    </>
                  ) : (
                    <span>← Choose Existing Author</span>
                  )}
                </button>
              )}
            </div>

            {authorMode === 'select' && authors.length > 0 ? (
              <select
                required
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
              >
                {authors.map((auth) => (
                  <option key={auth.id} value={auth.id}>
                    {auth.name_en} {auth.name_urdu ? `(${auth.name_urdu})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Author Name (English) e.g. Umera Ahmed"
                  value={customAuthorEn}
                  onChange={(e) => setCustomAuthorEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
                />
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مصنف کا نام (اردو) مثلاً: عمیرہ احمد"
                  value={customAuthorUrdu}
                  onChange={(e) => setCustomAuthorUrdu(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-sm font-urdu text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
                />
              </div>
            )}
          </div>

          {/* Category Selection or Custom Category */}
          <div className="p-4 rounded-2xl bg-white border border-[#ebd7c2]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#2D1A1A]">
                Category * Required
              </label>
              {categories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCategoryMode(categoryMode === 'select' ? 'custom' : 'select')}
                  className="text-[11px] font-bold text-[#8B1E3F] hover:underline flex items-center gap-1"
                >
                  {categoryMode === 'select' ? (
                    <>
                      <PlusCircle className="w-3 h-3" />
                      <span>+ Type New Category</span>
                    </>
                  ) : (
                    <span>← Choose Existing Category</span>
                  )}
                </button>
              )}
            </div>

            {categoryMode === 'select' && categories.length > 0 ? (
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_en} {cat.name_urdu ? `(${cat.name_urdu})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Category Name (English) e.g. Romantic, Suspense"
                  value={customCategoryEn}
                  onChange={(e) => setCustomCategoryEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
                />
                <input
                  type="text"
                  dir="rtl"
                  placeholder="کیٹیگری نام (اردو) مثلاً: رومانوی"
                  value={customCategoryUrdu}
                  onChange={(e) => setCustomCategoryUrdu(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-sm font-urdu text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5 flex items-center justify-between">
              <span>Novel Synopsis / Description</span>
              <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter novel synopsis for catalog readers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
            />
          </div>

          {/* Total Chapters & Lock Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                Total Chapters
              </label>
              {structureType === 'full_book' ? (
                <div className="px-3.5 py-2.5 bg-[#FFF8E7] border border-[#ebd7c2] rounded-xl text-xs font-semibold text-[#8B1E3F]">
                  0 (Full Book Mode — No separate chapters required)
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={totalChapters}
                  onChange={(e) => setTotalChapters(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
                />
              )}
            </div>

            <div className="pt-2 sm:pt-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <div>
                  <p className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                    {isLocked ? <Lock className="w-3.5 h-3.5 text-[#8B1E3F]" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>Is Locked Novel (Ad / VIP Gate)</span>
                  </p>
                  <p className="text-[10px] text-gray-500">Require rewarded ad watch for subsequent chapters</p>
                </div>
              </label>
            </div>
          </div>

          {/* Status Radios */}
          <div>
            <label className="block text-xs font-bold text-[#2D1A1A] mb-2">
              Publication Status *
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="bookStatus"
                  value="Approved"
                  checked={status === 'Approved'}
                  onChange={() => setStatus('Approved')}
                  className="w-4 h-4 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Approved & Live
                </span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="bookStatus"
                  value="Pending"
                  checked={status === 'Pending'}
                  onChange={() => setStatus('Pending')}
                  className="w-4 h-4 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  Pending Review
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#ebd7c2]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#ebd7c2] text-xs font-bold text-[#574141] hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-md shadow-[#8B1E3F]/30 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF8C00]" />
                  <span>Verifying & Saving...</span>
                </>
              ) : (
                <span>{existingBook ? 'Save Changes' : 'Save & Publish Novel'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
