import React, { useState, useEffect } from 'react';
import {
  FileText,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { isValidPdfUrl } from '../services/supabase';

interface PdfPreviewBoxProps {
  url: string;
  title?: string;
  label?: string;
  onClear?: () => void;
  className?: string;
  showToggle?: boolean;
}

export const PdfPreviewBox: React.FC<PdfPreviewBoxProps> = ({
  url,
  title = 'PDF Manuscript Preview',
  label = 'PDF Preview',
  onClear,
  className = '',
  showToggle = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const cleanUrl = (url || '').trim();
  const isValid = isValidPdfUrl(cleanUrl);

  // Whenever the URL changes (e.g. URL-A -> URL-B), immediately switch to the new URL and reset state
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setReloadKey((k) => k + 1);
  }, [cleanUrl]);

  if (!cleanUrl) {
    return null;
  }

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setReloadKey((k) => k + 1);
  };

  if (!isValid) {
    return (
      <div className={`p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold">Invalid PDF URL Format</p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Please enter a full HTTP/HTTPS URL (e.g. <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">https://example.com/novel.pdf</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-[#ebd7c2] bg-white overflow-hidden shadow-xs transition-all ${className}`}>
      {/* Header Bar */}
      <div className="bg-[#FAF3EA] px-3.5 py-2.5 border-b border-[#ebd7c2] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-[#8B1E3F] text-white">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#2D1A1A] block">{title}</span>
            <span className="text-[10px] text-[#786161] font-mono truncate max-w-[280px] sm:max-w-md block">
              {cleanUrl}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {showToggle && (
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="p-1.5 rounded-lg text-[#574141] hover:text-[#2D1A1A] hover:bg-white text-xs font-medium flex items-center gap-1 transition-colors"
              title={isVisible ? 'Hide PDF Preview' : 'Show PDF Preview'}
            >
              {isVisible ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Preview</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleRetry}
            className="p-1.5 rounded-lg text-[#574141] hover:text-[#2D1A1A] hover:bg-white transition-colors"
            title="Reload PDF preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-[#8B1E3F] hover:bg-[#8B1E3F]/10 flex items-center gap-1 text-[11px] font-semibold transition-colors"
            title="Open direct PDF link in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open URL</span>
          </a>
        </div>
      </div>

      {/* Preview Body */}
      {isVisible && (
        <div className="relative w-full bg-slate-900 min-h-[300px] max-h-[460px] flex flex-col items-center justify-center overflow-hidden">
          {/* Loading Indicator */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 z-10 bg-[#FFFDF9]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
              <RefreshCw className="w-6 h-6 text-[#8B1E3F] animate-spin mb-2" />
              <p className="text-xs font-bold text-[#2D1A1A]">Loading PDF preview...</p>
              <p className="text-[11px] text-[#786161] mt-1 font-mono truncate max-w-sm">
                Fetching document from source URL
              </p>
            </div>
          )}

          {/* Error State */}
          {hasError ? (
            <div className="p-8 text-center bg-[#FFF8E7] w-full h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-rose-800">
                PDF could not be loaded. Please check the URL.
              </h5>
              <p className="text-xs text-rose-700/80 mt-1 max-w-md">
                The URL may be private, blocked by browser CORS policy, or unavailable. You can test it in a new window or verify the address.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-3.5 py-1.5 bg-[#8B1E3F] text-white text-xs font-bold rounded-xl hover:bg-[#721733] transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-white border border-[#ebd7c2] text-[#2D1A1A] text-xs font-bold rounded-xl hover:bg-[#FAF3EA] transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#8B1E3F]" />
                  <span>Test URL in New Window</span>
                </a>
              </div>
            </div>
          ) : (
            <iframe
              key={`${cleanUrl}-${reloadKey}`}
              src={`${cleanUrl}#toolbar=0&navpanes=0`}
              title={label}
              className="w-full h-[360px] border-0 bg-white"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}

          {/* Quick status bar */}
          <div className="w-full bg-[#FAF3EA] border-t border-[#ebd7c2] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#786161]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Target: Verified PDF URL</span>
            </span>
            <span className="font-mono text-[10px]">
              Ready for publication
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
