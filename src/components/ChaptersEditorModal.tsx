import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  FileUp,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  Feather,
  Check,
  AlignRight,
  AlignCenter,
  AlignJustify,
  Bold,
  Italic,
  Quote,
  Trash2,
  Globe,
  Layers,
  Loader2
} from 'lucide-react';
import { Book, Chapter, ChapterContentType } from '../types';
import { uploadPdfFile, isValidPdfUrl } from '../services/supabase';
import { PdfPreviewBox } from './PdfPreviewBox';

interface ChaptersEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSaveChapter: (chapter: Omit<Chapter, 'id' | 'created_at'>, chapterId?: string) => Promise<{ success: boolean; data?: Chapter; error?: string } | void> | void;
  existingChapter?: Chapter | null;
  nextChapterNo: number;
}

export const ChaptersEditorModal: React.FC<ChaptersEditorModalProps> = ({
  isOpen,
  onClose,
  book,
  onSaveChapter,
  existingChapter,
  nextChapterNo
}) => {
  const [chapterNo, setChapterNo] = useState(existingChapter ? existingChapter.chapter_no : nextChapterNo);
  const [titleEn, setTitleEn] = useState(existingChapter ? existingChapter.title_en : `Chapter ${nextChapterNo}`);
  const [titleUrdu, setTitleUrdu] = useState(existingChapter?.title_urdu || '');
  const [contentType, setContentType] = useState<ChapterContentType>(existingChapter?.content_type || 'text');
  const [contentTextUrdu, setContentTextUrdu] = useState(existingChapter?.content_text_urdu || '');
  const [pdfUrl, setPdfUrl] = useState(existingChapter?.content_pdf_url || '');
  const [pdfStoragePath, setPdfStoragePath] = useState(existingChapter?.pdf_storage_path || '');
  const [pdfFileName, setPdfFileName] = useState(existingChapter?.pdf_file_name || '');
  const [pdfFileSize, setPdfFileSize] = useState(existingChapter?.pdf_file_size || '');
  const [pdfPages, setPdfPages] = useState<number>(existingChapter?.pdf_pages || 14);
  const [isLocked, setIsLocked] = useState(existingChapter ? existingChapter.is_locked : nextChapterNo > 1);
  const [adGate, setAdGate] = useState<'free' | 'reward_ad' | 'vip_points'>(existingChapter?.ad_gate || 'reward_ad');
  const [pushNotification, setPushNotification] = useState(true);

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadSuccessMsg, setPdfUploadSuccessMsg] = useState('');
  const [pdfUrlError, setPdfUrlError] = useState('');
  const [isPdfDragOver, setIsPdfDragOver] = useState(false);
  const [textAndPdfMode, setTextAndPdfMode] = useState<'upload' | 'url'>('upload');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Synchronize and completely reset or load editor state when switching chapters or opening
  useEffect(() => {
    if (!isOpen) return;

    if (existingChapter) {
      // Editing Chapter: Load ONLY selected chapter's own isolated content
      setChapterNo(existingChapter.chapter_no);
      setTitleEn(existingChapter.title_en);
      setTitleUrdu(existingChapter.title_urdu || '');
      setContentType(existingChapter.content_type || 'text');
      setContentTextUrdu(existingChapter.content_text_urdu || '');
      setPdfUrl(existingChapter.content_pdf_url || '');
      setPdfStoragePath(existingChapter.pdf_storage_path || '');
      setPdfFileName(existingChapter.pdf_file_name || '');
      setPdfFileSize(existingChapter.pdf_file_size || '');
      setPdfPages(existingChapter.pdf_pages || 14);
      setIsLocked(existingChapter.is_locked);
      setAdGate(existingChapter.ad_gate || 'reward_ad');
      setPdfUploadSuccessMsg('');
      setPdfUrlError('');
      if (existingChapter.content_pdf_url && isValidPdfUrl(existingChapter.content_pdf_url) && !existingChapter.pdf_storage_path) {
        setTextAndPdfMode('url');
      } else {
        setTextAndPdfMode('upload');
      }
    } else {
      // New Chapter: Completely fresh empty editor with no cached data
      setChapterNo(nextChapterNo);
      setTitleEn(`Chapter ${nextChapterNo}`);
      setTitleUrdu('');
      setContentType('text');
      setContentTextUrdu(''); // Chapter starts strictly with empty editor
      setPdfUrl('');
      setPdfStoragePath('');
      setPdfFileName('');
      setPdfFileSize('');
      setPdfPages(14);
      setIsLocked(nextChapterNo > 1);
      setAdGate('reward_ad');
      setPdfUploadSuccessMsg('');
      setPdfUrlError('');
      setTextAndPdfMode('upload');
    }
  }, [existingChapter?.id, book.id, nextChapterNo, isOpen]);

  if (!isOpen) return null;

  // Calculate live word count for Urdu or English text
  const liveWordCount = contentTextUrdu.trim()
    ? contentTextUrdu.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const handleRealPdfUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setPdfUrlError('Please select a valid PDF file.');
      return;
    }
    setPdfUrlError('');
    setIsUploadingPdf(true);
    setPdfUploadSuccessMsg('');

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `chapters/${book.id}/${existingChapter?.id || 'ch'}_${Date.now()}_${sanitizedName}`;

      const res = await uploadPdfFile(file, 'chapter-pdfs', storagePath);
      setPdfUrl(res.url);
      setPdfStoragePath(res.storagePath);
      setPdfFileName(res.fileName);
      setPdfFileSize(res.fileSize);
      setPdfPages(res.pages);
      setPdfUploadSuccessMsg(
        res.isCloudStorage
          ? `Uploaded to Supabase Storage: ${res.fileName} (${res.fileSize})`
          : `PDF file attached: ${res.fileName} (${res.fileSize})`
      );
    } catch (err: any) {
      console.warn('PDF upload error:', err);
      setPdfUrlError(err?.message || 'Failed to upload PDF');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleInsertPoetry = () => {
    const sher = '\n\nدل سے جو بات نکلتی ہے اثر رکھتی ہے\nپر نہیں، طاقت پرواز مگر رکھتی ہے\n\n';
    setContentTextUrdu((prev) => prev + sher);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || isSubmitting) return;

    // Validate external URL if URL format selected
    if (contentType === 'pdf_url' || (contentType === 'text_and_pdf' && textAndPdfMode === 'url')) {
      if (pdfUrl.trim() && !isValidPdfUrl(pdfUrl.trim())) {
        setPdfUrlError('Please enter a valid HTTP/HTTPS URL (e.g. https://example.com/book/chapter1.pdf)');
        return;
      }
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await onSaveChapter({
        book_id: book.id,
        chapter_no: Number(chapterNo),
        title_en: titleEn.trim(),
        title_urdu: titleUrdu.trim() || undefined,
        content_type: contentType,
        content_text_urdu: (contentType === 'text' || contentType === 'text_and_pdf') ? contentTextUrdu : undefined,
        content_pdf_url: contentType !== 'text' ? (pdfUrl.trim() || undefined) : undefined,
        pdf_storage_path: contentType !== 'text' ? (pdfStoragePath || undefined) : undefined,
        pdf_file_name: contentType !== 'text' ? (pdfFileName || 'chapter.pdf') : undefined,
        pdf_file_size: contentType !== 'text' ? (pdfFileSize || '4.2 MB') : undefined,
        pdf_pages: contentType !== 'text' ? pdfPages : undefined,
        word_count: (contentType === 'text' || contentType === 'text_and_pdf') ? liveWordCount : 2500,
        is_locked: isLocked,
        ad_gate: isLocked ? adGate : 'free',
        status: 'Published'
      }, existingChapter?.id);

      if (res && res.success === false) {
        setServerError(res.error || 'Failed to save chapter to Supabase');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Error occurred while saving chapter');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#ead4ba] my-8 overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#4A1025] text-white px-6 py-4 flex items-center justify-between border-b border-[#5e1832]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#8B1E3F] rounded-xl text-white shadow-xs">
              <Feather className="w-5 h-5 text-[#FF8C00]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {existingChapter ? 'Edit Chapter Manuscript' : 'Compose & Publish Chapter'}
              </h3>
              <p className="text-xs text-[#e8b4c2]">
                Novel: <span className="font-semibold text-white">{book.title_en}</span>
                {book.title_urdu && (
                  <span className="font-urdu ml-1.5 text-[#FF8C00]">({book.title_urdu})</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFFDF9]">
          {/* Server Error Alert */}
          {serverError && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-rose-900 text-sm">Chapter Save Failed (Database Notice)</p>
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
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                Chapter No. *
              </label>
              <input
                type="number"
                min="1"
                required
                value={chapterNo}
                onChange={(e) => {
                  setChapterNo(Number(e.target.value));
                  if (!existingChapter && titleEn.startsWith('Chapter ')) {
                    setTitleEn(`Chapter ${e.target.value}`);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                Chapter Title (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chapter 4: Raaz-e-Ulfat"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5 flex items-center justify-between">
                <span>Chapter Title (Urdu)</span>
                <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثلاً: باب ۴: راز الفت"
                value={titleUrdu}
                onChange={(e) => setTitleUrdu(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-sm font-urdu text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
              />
            </div>
          </div>

          {/* Content Type Selector Switch */}
          <div className="p-4 rounded-2xl bg-white border border-[#ebd7c2] shadow-xs">
            <label className="block text-xs font-bold text-[#2D1A1A] mb-2.5">
              Select Chapter Delivery Format *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setContentType('text');
                  setPdfUrlError('');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  contentType === 'text'
                    ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-md shadow-[#8B1E3F]/20'
                    : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFF8E7]'
                }`}
              >
                <FileText className="w-4 h-4 text-[#FF8C00] mb-1" />
                <span>1. Text</span>
                <span className="text-[9px] opacity-80 font-normal">نستعلیق ٹائپ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setContentType('pdf_upload');
                  setPdfUrlError('');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  contentType === 'pdf_upload' || contentType === 'pdf'
                    ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-md shadow-[#8B1E3F]/20'
                    : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFF8E7]'
                }`}
              >
                <FileUp className="w-4 h-4 text-[#FF8C00] mb-1" />
                <span>2. PDF Upload</span>
                <span className="text-[9px] opacity-80 font-normal">اسٹوریج فائل</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setContentType('pdf_url');
                  setPdfUrlError('');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  contentType === 'pdf_url'
                    ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-md shadow-[#8B1E3F]/20'
                    : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFF8E7]'
                }`}
              >
                <Globe className="w-4 h-4 text-[#FF8C00] mb-1" />
                <span>3. PDF URL</span>
                <span className="text-[9px] opacity-80 font-normal">براہ راست لنک</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setContentType('text_and_pdf');
                  setPdfUrlError('');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  contentType === 'text_and_pdf'
                    ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-md shadow-[#8B1E3F]/20'
                    : 'bg-white text-[#574141] border-[#ebd7c2] hover:bg-[#FFF8E7]'
                }`}
              >
                <Layers className="w-4 h-4 text-[#FF8C00] mb-1" />
                <span>4. Text + PDF</span>
                <span className="text-[9px] opacity-80 font-normal">متن اور فائل</span>
              </button>
            </div>

            <p className="text-[11px] text-[#786161] mt-2.5">
              {contentType === 'text' && '✅ Text mode delivers authentic Jameel Noori Nastaleeq calligraphy with night mode & font resizing.'}
              {(contentType === 'pdf_upload' || contentType === 'pdf') && '📦 Uploads chapter manuscript directly to Supabase Storage chapter-pdfs bucket.'}
              {contentType === 'pdf_url' && '🌐 Links an external direct PDF manuscript URL with HTTPS validation.'}
              {contentType === 'text_and_pdf' && '✨ Readers can switch between Nastaleeq text reading and original PDF document.'}
            </p>
          </div>

          {/* IF TEXT SELECTED (or TEXT + PDF): NASTALEEQ BENCH */}
          {(contentType === 'text' || contentType === 'text_and_pdf') && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-[#ebd7c2] rounded-2xl shadow-xs">
                {/* Urdu Typography Toolbar */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    title="Bold"
                    className="p-1.5 rounded-lg hover:bg-[#FFF8E7] text-[#2D1A1A]"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Italic"
                    className="p-1.5 rounded-lg hover:bg-[#FFF8E7] text-[#2D1A1A]"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <span className="w-px h-4 bg-gray-300 mx-1" />
                  <button
                    type="button"
                    title="Right Align"
                    className="p-1.5 rounded-lg bg-[#8B1E3F]/10 text-[#8B1E3F]"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Center Align"
                    className="p-1.5 rounded-lg hover:bg-[#FFF8E7] text-[#2D1A1A]"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Justify"
                    className="p-1.5 rounded-lg hover:bg-[#FFF8E7] text-[#2D1A1A]"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                  <span className="w-px h-4 bg-gray-300 mx-1" />
                  <button
                    type="button"
                    onClick={handleInsertPoetry}
                    className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-[#FFF8E7] hover:bg-[#ffeec2] border border-[#ebd7c2] text-[#8B1E3F] font-medium"
                  >
                    <Quote className="w-3.5 h-3.5 text-[#FF8C00]" />
                    <span>شعر شامل کریں</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-semibold text-[#8B1E3F]">
                    {liveWordCount} <span className="text-gray-500 font-normal">Words</span>
                  </span>
                  {contentTextUrdu && (
                    <button
                      type="button"
                      onClick={() => setContentTextUrdu('')}
                      className="text-gray-400 hover:text-red-500"
                      title="Clear content"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Large Nastaleeq Textarea */}
              <div className="relative">
                <textarea
                  dir="rtl"
                  rows={9}
                  value={contentTextUrdu}
                  onChange={(e) => setContentTextUrdu(e.target.value)}
                  placeholder="یہاں باب کا متن جمیل نوری نستعلیق فونٹ میں تحریر کریں یا ان پیج سے پیسٹ کریں..."
                  className="w-full p-5 bg-[#FFF8E7] border-2 border-[#8B1E3F]/30 focus:border-[#8B1E3F] rounded-2xl text-[#2D1A1A] font-urdu text-[21px] leading-[2.4] focus:outline-none focus:ring-4 focus:ring-[#8B1E3F]/10 shadow-inner"
                  style={{ minHeight: '230px' }}
                />
                <span className="absolute bottom-3 left-4 text-[11px] text-gray-400 font-sans pointer-events-none bg-white/70 px-2 py-0.5 rounded-md">
                  Jameel Noori Nastaleeq Canvas
                </span>
              </div>
            </div>
          )}

          {/* IF PDF UPLOAD (Selected Option 2) */}
          {(contentType === 'pdf_upload' || contentType === 'pdf') && (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#ebd7c2]">
              <label className="block text-xs font-bold text-[#2D1A1A]">
                Chapter PDF Upload (Supabase Storage) *
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
                  if (e.dataTransfer.files?.[0]) handleRealPdfUpload(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors relative cursor-pointer ${
                  isPdfDragOver
                    ? 'border-[#8B1E3F] bg-[#8B1E3F]/10'
                    : 'border-[#8B1E3F]/40 bg-[#FFFDF9] hover:bg-[#FFF8E7]/40'
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={isUploadingPdf}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleRealPdfUpload(e.target.files[0]);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#8B1E3F]/10 flex items-center justify-center text-[#8B1E3F] mb-2.5">
                  <FileUp className="w-6 h-6 text-[#8B1E3F]" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#2D1A1A]">
                  {isUploadingPdf ? 'Uploading to Supabase Storage...' : 'Drag & Drop Chapter PDF or Click to Upload'}
                </h4>
                <p className="text-[11px] text-[#786161] mt-1">
                  Uploads directly to Supabase Storage bucket <code className="bg-[#FFF8E7] px-1 py-0.5 rounded font-mono text-[#8B1E3F]">chapter-pdfs</code>
                </p>

                {pdfFileName && (
                  <div className="mt-3 inline-flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Selected: {pdfFileName} ({pdfFileSize || 'PDF'}, ~{pdfPages} Pages)</span>
                  </div>
                )}
              </div>

              {pdfUploadSuccessMsg && (
                <p className="text-[11px] text-emerald-700 font-semibold">{pdfUploadSuccessMsg}</p>
              )}

              {/* LIVE PDF PREVIEW FOR UPLOADED FILE */}
              {pdfUrl && (
                <div className="mt-3 pt-3 border-t border-[#ebd7c2]/70">
                  <PdfPreviewBox
                    url={pdfUrl}
                    title={`Chapter ${chapterNo} Uploaded PDF Preview`}
                    label={`Chapter ${chapterNo} PDF`}
                    onClear={() => { setPdfUrl(''); setPdfStoragePath(''); setPdfFileName(''); setPdfUploadSuccessMsg(''); }}
                  />
                </div>
              )}
            </div>
          )}

          {/* IF PDF URL (Selected Option 3) */}
          {contentType === 'pdf_url' && (
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#ebd7c2]">
              <label className="block text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#8B1E3F]" />
                <span>PDF URL *</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/book/chapter1.pdf"
                value={pdfUrl}
                onChange={(e) => {
                  setPdfUrl(e.target.value);
                  setPdfUrlError('');
                }}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
              />
              <p className="text-[10px] text-gray-500">
                Example: <code className="bg-gray-100 px-1 py-0.5 rounded">https://example.com/book/chapter1.pdf</code>
              </p>

              {pdfUrlError && (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pdfUrlError}</span>
                </p>
              )}

              {/* LIVE PDF PREVIEW BEFORE PUBLISH */}
              {pdfUrl && (
                <div className="mt-3 pt-3 border-t border-[#ebd7c2]/70">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#8B1E3F]" />
                      <span>Live PDF Preview (Before Publishing)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setPdfUrl(''); setPdfStoragePath(''); setPdfFileName(''); }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear URL</span>
                    </button>
                  </div>
                  <PdfPreviewBox
                    url={pdfUrl}
                    title={`Chapter ${chapterNo} PDF Preview`}
                    label={`Chapter ${chapterNo} Document`}
                  />
                </div>
              )}
            </div>
          )}

          {/* IF TEXT + PDF (Selected Option 4) */}
          {contentType === 'text_and_pdf' && (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#ebd7c2]">
              <div className="flex items-center justify-between pb-2 border-b border-[#ebd7c2]">
                <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8B1E3F]" />
                  <span>Attached PDF Document (Upload or Direct URL)</span>
                </label>

                {/* Sub-toggle: Upload vs URL */}
                <div className="flex bg-[#FFF8E7] p-1 rounded-xl border border-[#ebd7c2]">
                  <button
                    type="button"
                    onClick={() => setTextAndPdfMode('upload')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      textAndPdfMode === 'upload'
                        ? 'bg-[#8B1E3F] text-white shadow-xs'
                        : 'text-[#786161] hover:text-[#2D1A1A]'
                    }`}
                  >
                    PDF Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAndPdfMode('url')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      textAndPdfMode === 'url'
                        ? 'bg-[#8B1E3F] text-white shadow-xs'
                        : 'text-[#786161] hover:text-[#2D1A1A]'
                    }`}
                  >
                    PDF URL
                  </button>
                </div>
              </div>

              {textAndPdfMode === 'upload' ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsPdfDragOver(true);
                  }}
                  onDragLeave={() => setIsPdfDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsPdfDragOver(false);
                    if (e.dataTransfer.files?.[0]) handleRealPdfUpload(e.dataTransfer.files[0]);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-colors relative cursor-pointer ${
                    isPdfDragOver
                      ? 'border-[#8B1E3F] bg-[#8B1E3F]/10'
                      : 'border-[#8B1E3F]/40 bg-[#FFFDF9] hover:bg-[#FFF8E7]/40'
                  }`}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    disabled={isUploadingPdf}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleRealPdfUpload(e.target.files[0]);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#8B1E3F]/10 flex items-center justify-center text-[#8B1E3F] mb-2">
                    <FileUp className="w-5 h-5 text-[#8B1E3F]" />
                  </div>
                  <h4 className="text-xs font-bold text-[#2D1A1A]">
                    {isUploadingPdf ? 'Uploading to Supabase Storage...' : 'Upload PDF to Supabase Storage'}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Bucket: <code className="bg-[#FFF8E7] px-1 py-0.5 rounded font-mono text-[#8B1E3F]">chapter-pdfs</code>
                  </p>

                  {pdfFileName && (
                    <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{pdfFileName} ({pdfFileSize || 'PDF'})</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="url"
                    placeholder="https://example.com/book/chapter1.pdf"
                    value={pdfUrl}
                    onChange={(e) => {
                      setPdfUrl(e.target.value);
                      setPdfUrlError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F]"
                  />
                  <p className="text-[10px] text-gray-500">
                    Direct HTTPS link to the chapter PDF.
                  </p>
                </div>
              )}

              {pdfUrlError && (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pdfUrlError}</span>
                </p>
              )}

              {/* LIVE PDF PREVIEW FOR ATTACHED PDF */}
              {pdfUrl && (
                <div className="mt-3 pt-3 border-t border-[#ebd7c2]/70">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#8B1E3F]" />
                      <span>Attached Chapter PDF Preview</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setPdfUrl(''); setPdfStoragePath(''); setPdfFileName(''); }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove PDF</span>
                    </button>
                  </div>
                  <PdfPreviewBox
                    url={pdfUrl}
                    title={`Chapter ${chapterNo} Attached PDF Preview`}
                    label={`Chapter ${chapterNo} Attached PDF`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Access Gating & Monetization */}
          <div className="p-4 rounded-2xl bg-white border border-[#ebd7c2] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isLocked ? (
                  <Lock className="w-4 h-4 text-[#8B1E3F]" />
                ) : (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                )}
                <span className="text-xs font-bold text-[#2D1A1A]">Monetization Gate</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B1E3F]"></div>
                <span className="ml-2 text-xs font-medium text-[#2D1A1A]">
                  {isLocked ? 'Locked (Requires Action)' : 'Free for all readers'}
                </span>
              </label>
            </div>

            {isLocked && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center p-3 rounded-xl border border-[#ebd7c2] hover:bg-[#FFF8E7] cursor-pointer">
                  <input
                    type="radio"
                    name="adGate"
                    value="reward_ad"
                    checked={adGate === 'reward_ad'}
                    onChange={() => setAdGate('reward_ad')}
                    className="w-4 h-4 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                  />
                  <div className="ml-3">
                    <p className="text-xs font-bold text-[#2D1A1A]">Rewarded Video Ad</p>
                    <p className="text-[10px] text-gray-500">Reader watches 1 Ad to unlock chapter</p>
                  </div>
                </label>

                <label className="flex items-center p-3 rounded-xl border border-[#ebd7c2] hover:bg-[#FFF8E7] cursor-pointer">
                  <input
                    type="radio"
                    name="adGate"
                    value="vip_points"
                    checked={adGate === 'vip_points'}
                    onChange={() => setAdGate('vip_points')}
                    className="w-4 h-4 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                  />
                  <div className="ml-3">
                    <p className="text-xs font-bold text-[#2D1A1A]">VIP Reader Points</p>
                    <p className="text-[10px] text-gray-500">Deducts 20 points from reader balance</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Broadcast Notification Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2]">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#FF8C00]" />
              <div>
                <p className="text-xs font-bold text-[#2D1A1A]">Notify Novel Followers</p>
                <p className="text-[11px] text-[#786161]">
                  Send push notification to all 48.6K subscribed readers
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={pushNotification}
              onChange={(e) => setPushNotification(e.target.checked)}
              className="w-4 h-4 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
            />
          </div>

          {/* Modal Actions */}
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
                  <span>Verifying & Saving Chapter...</span>
                </>
              ) : (
                <span>{existingChapter ? 'Update Chapter' : 'Publish Chapter Now'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
