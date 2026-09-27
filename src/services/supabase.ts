import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Book,
  Chapter,
  BookStructureType,
  ContentDeliveryType,
  ChapterContentType,
  Category,
  Author,
  WriterRequest,
  UserMember,
  BannerPopup,
  RewardsConfig,
  WithdrawalRequest,
  AdControlSettings,
  AdminTeamMember,
  AdminRole,
  AdminPermissions,
  ROLE_DEFAULT_PERMISSIONS,
  PoetryLine
} from '../types';
import {
  initialBooks,
  initialChapters,
  initialCategories,
  initialAuthors,
  initialWriterRequests,
  initialUsers,
  initialBanners,
  initialRewardsConfig,
  initialWithdrawalRequests,
  initialAdSettings,
  initialAdminTeam,
  sampleDemoBooks,
  sampleDemoChapters,
  sampleDemoWithdrawalRequests
} from '../data/mockData';

export const DEFAULT_SUPABASE_URL = 'https://blkqwipoprumtejpluwj.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_rQUs58TAbKAP5SDtGrJH3g_9Ksg1cui';

const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

let supabaseClient: SupabaseClient | null = null;
let lastClientUrl = '';
let lastClientKey = '';

export function isUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getSupabaseCredentials(): { url: string; key: string; isConfigured: boolean } {
  let storedUrl = '';
  let storedKey = '';
  try {
    storedUrl = localStorage.getItem('kn_supabase_url') || '';
    storedKey = localStorage.getItem('kn_supabase_key') || '';
  } catch {
    // ignore
  }

  // Filter out any stale dummy placeholders
  if (storedUrl.includes('your-project') || storedUrl.includes('localhost')) {
    storedUrl = '';
  }
  if (storedKey.includes('your-anon-key')) {
    storedKey = '';
  }

  const url = (storedUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  const key = (storedKey || envKey || DEFAULT_SUPABASE_KEY).trim();
  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes('your-project') &&
    !key.includes('your-anon-key') &&
    url.startsWith('https://')
  );

  return { url, key, isConfigured };
}

export function saveSupabaseCredentials(url: string, key: string): void {
  try {
    localStorage.setItem('kn_supabase_url', url.trim());
    localStorage.setItem('kn_supabase_key', key.trim());
    supabaseClient = null; // force re-instantiation
  } catch (e) {
    console.error('Error saving Supabase credentials:', e);
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials().isConfigured;
}

export function getSupabase(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!supabaseClient || lastClientUrl !== url || lastClientKey !== key) {
    try {
      supabaseClient = createClient(url, key);
      lastClientUrl = url;
      lastClientKey = key;
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
}

// PDF Validation & Storage Helpers
export function isValidPdfUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface UploadPdfResult {
  url: string;
  storagePath: string;
  fileName: string;
  fileSize: string;
  pages: number;
  isCloudStorage: boolean;
  warning?: string;
}

export async function uploadPdfFile(
  file: File,
  bucket: 'chapter-pdfs' | 'book-pdfs',
  path: string
): Promise<UploadPdfResult> {
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
  const estimatedPages = Math.max(1, Math.round(file.size / (120 * 1024)));
  const cleanPath = path.replace(/^\/+/, '');
  const storagePath = `${bucket}/${cleanPath}`;

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.storage
        .from(bucket)
        .upload(cleanPath, file, { upsert: true, contentType: 'application/pdf' });

      if (!error && data) {
        const { data: pubData } = client.storage.from(bucket).getPublicUrl(cleanPath);
        const resolvedUrl = pubData?.publicUrl || '';
        return {
          url: resolvedUrl,
          storagePath,
          fileName: file.name,
          fileSize: fileSizeMb,
          pages: estimatedPages,
          isCloudStorage: true
        };
      } else if (error) {
        console.warn(`Supabase Storage upload warning (${bucket}):`, error.message);
        // Fallback to local Blob URL for immediate testing / offline preview
        const localBlobUrl = URL.createObjectURL(file);
        return {
          url: localBlobUrl,
          storagePath,
          fileName: file.name,
          fileSize: fileSizeMb,
          pages: estimatedPages,
          isCloudStorage: false,
          warning: error.message
        };
      }
    } catch (err: any) {
      console.warn(`Storage upload exception (${bucket}):`, err);
    }
  }

  // Local fallback
  const localBlobUrl = URL.createObjectURL(file);
  return {
    url: localBlobUrl,
    storagePath,
    fileName: file.name,
    fileSize: fileSizeMb,
    pages: estimatedPages,
    isCloudStorage: false
  };
}

export async function resolvePdfUrl(
  pdfUrl?: string | null,
  storagePath?: string | null
): Promise<string> {
  // 1. If explicit valid HTTP/HTTPS URL is provided, return it
  if (pdfUrl && isValidPdfUrl(pdfUrl)) {
    return pdfUrl.trim();
  }

  // 2. If storagePath is provided (e.g. "chapter-pdfs/chapters/book-1/ch-1.pdf" or "book-pdfs/books/book-1/full.pdf")
  if (storagePath) {
    const parts = storagePath.split('/');
    const bucket = parts[0] === 'chapter-pdfs' || parts[0] === 'book-pdfs' ? parts[0] : 'chapter-pdfs';
    const filePath = parts[0] === bucket ? parts.slice(1).join('/') : storagePath;

    const client = getSupabase();
    if (client) {
      try {
        // Try creating signed URL in case bucket is private
        const { data: signedData } = await client.storage.from(bucket).createSignedUrl(filePath, 3600);
        if (signedData?.signedUrl) {
          return signedData.signedUrl;
        }
      } catch {
        // Fall through to public URL
      }

      try {
        const { data: pubData } = client.storage.from(bucket).getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return pubData.publicUrl;
        }
      } catch {
        // Continue
      }
    }
  }

  // 3. Fallback to existing pdfUrl if non-empty (e.g. blob: or local object URL)
  if (pdfUrl) return pdfUrl;
  return '';
}

// Local Storage Keys
const STORAGE_KEYS = {
  BOOKS: 'kn_admin_books',
  CHAPTERS: 'kn_admin_chapters',
  CATEGORIES: 'kn_admin_categories',
  AUTHORS: 'kn_admin_authors',
  WRITERS: 'kn_admin_writers',
  USERS: 'kn_admin_users',
  BANNERS: 'kn_admin_banners',
  REWARDS_CONFIG: 'kn_admin_rewards_config',
  WITHDRAWALS: 'kn_admin_withdrawals',
  AD_SETTINGS: 'kn_admin_ad_settings',
  ADMIN_TEAM: 'kn_admin_team_members',
  CURRENT_ADMIN_ID: 'kn_current_admin_id',
  IS_LOGGED_IN: 'kn_admin_is_logged_in',
  POETRY: 'kn_admin_poetry'
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage:', e);
  }
}

// Helper to resolve or create author in Supabase
async function resolveSupabaseAuthorId(
  client: SupabaseClient,
  authorId: string,
  authorNameEn: string,
  authorNameUrdu?: string,
  photoUrl?: string
): Promise<string | null> {
  try {
    // If authorId is already a valid UUID, verify or use it
    if (isUUID(authorId)) {
      const { data } = await client.from('authors').select('id').eq('id', authorId).limit(1);
      if (data && data.length > 0) return data[0].id;
    }

    // Try finding by name_en
    if (authorNameEn && authorNameEn.trim()) {
      const { data } = await client
        .from('authors')
        .select('id')
        .ilike('name_en', authorNameEn.trim())
        .limit(1);
      if (data && data.length > 0 && isUUID(data[0].id)) {
        return data[0].id;
      }
    }

    // Insert new author if not found
    const newId = generateUUID();
    const { error: insErr } = await client.from('authors').insert([
      {
        id: newId,
        name_en: authorNameEn.trim() || 'Author',
        name_urdu: authorNameUrdu || null,
        photo_url: photoUrl || null
      }
    ]);

    if (!insErr) {
      return newId;
    }
  } catch (err) {
    console.warn('Could not resolve or create author in Supabase:', err);
  }
  return null;
}

// Helper to resolve or create category in Supabase
async function resolveSupabaseCategoryId(
  client: SupabaseClient,
  categoryId: string,
  catNameEn: string,
  catNameUrdu?: string
): Promise<string | null> {
  try {
    // If categoryId is already a valid UUID, check or use it
    if (isUUID(categoryId)) {
      const { data } = await client.from('categories').select('id').eq('id', categoryId).limit(1);
      if (data && data.length > 0) return data[0].id;
    }

    // Try finding by name_en
    if (catNameEn && catNameEn.trim()) {
      const { data } = await client
        .from('categories')
        .select('id')
        .ilike('name_en', catNameEn.trim())
        .limit(1);
      if (data && data.length > 0 && isUUID(data[0].id)) {
        return data[0].id;
      }
    }

    // Insert new category if not found
    const newId = generateUUID();
    const { error: insErr } = await client.from('categories').insert([
      {
        id: newId,
        name_en: catNameEn.trim() || 'General',
        name_urdu: catNameUrdu || null,
        books_count: 0
      }
    ]);

    if (!insErr) {
      return newId;
    }
  } catch (err) {
    console.warn('Could not resolve or create category in Supabase:', err);
  }
  return null;
}

export interface RlsWarning {
  table: string;
  message: string;
  timestamp: string;
}

export const SUPABASE_RLS_FIX_SQL = `-- =========================================================================
-- KITABISTAN ADMIN & USER APP - COMPLETE DATABASE SCHEMA & RLS REPAIR MIGRATION
-- Run this in Supabase Dashboard -> SQL Editor -> Click 'Run'
-- =========================================================================

-- 1. Ensure UUID generation extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure authors table exists with correct schema
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_urdu TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ensure categories table exists with correct schema
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_urdu TEXT,
  books_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ensure books table exists with all standard and full-book upgrade columns
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_urdu TEXT,
  author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_url TEXT,
  description TEXT,
  is_locked BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'approved',
  total_chapters INT DEFAULT 0,
  structure_type TEXT DEFAULT 'chapter_based',
  full_content TEXT,
  full_content_type TEXT DEFAULT 'text',
  full_pdf_url TEXT,
  full_pdf_storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- If books table already existed, add missing columns safely
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS structure_type TEXT DEFAULT 'chapter_based';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS full_content TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS full_content_type TEXT DEFAULT 'text';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS full_pdf_url TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS full_pdf_storage_path TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS total_chapters INT DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT true;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- 5. Ensure chapters table exists with isolated Chapter ID and Book ID
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_no INT NOT NULL DEFAULT 1,
  title_en TEXT NOT NULL,
  title_urdu TEXT,
  content_type TEXT DEFAULT 'text',
  content_text_urdu TEXT,
  content_pdf_url TEXT,
  pdf_storage_path TEXT,
  word_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- If chapters table already exists, add missing columns safely
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS content_text_urdu TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS content_pdf_url TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS word_count INT DEFAULT 0;

-- 6. Ensure indexes for high performance queries by User App and Admin App
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON public.chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_chapter_no ON public.chapters(book_id, chapter_no);
CREATE INDEX IF NOT EXISTS idx_books_structure_type ON public.books(structure_type);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);

-- 7. Ensure poetry_lines, app_settings, and withdrawal_requests exist
CREATE TABLE IF NOT EXISTS public.poetry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lines_urdu TEXT NOT NULL,
  poet_name TEXT NOT NULL,
  genre TEXT DEFAULT 'Sher',
  likes_count INT DEFAULT 0,
  status TEXT DEFAULT 'Published',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  points INT DEFAULT 0,
  pkr_amount NUMERIC DEFAULT 0,
  method TEXT DEFAULT 'JazzCash',
  account_title TEXT,
  account_number TEXT,
  tasks_chapters INT DEFAULT 0,
  tasks_ads INT DEFAULT 0,
  tasks_invites INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  admob_app_id TEXT,
  banner_ad_unit_id TEXT,
  interstitial_ad_unit_id TEXT,
  rewarded_ad_unit_id TEXT,
  app_open_ad_unit_id TEXT,
  interstitial_frequency_chapters INT DEFAULT 2,
  rewarded_gate_threshold_chapter INT DEFAULT 5,
  is_test_mode BOOLEAN DEFAULT true,
  enable_banner_ads BOOLEAN DEFAULT true,
  enable_interstitial_ads BOOLEAN DEFAULT true,
  enable_rewarded_unlock BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Fix Row-Level Security (RLS) policies for full read/write access
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access books" ON public.books;
CREATE POLICY "Public full access books" ON public.books FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access chapters" ON public.chapters;
CREATE POLICY "Public full access chapters" ON public.chapters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access categories" ON public.categories;
CREATE POLICY "Public full access categories" ON public.categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access authors" ON public.authors;
CREATE POLICY "Public full access authors" ON public.authors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.poetry_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access poetry_lines" ON public.poetry_lines;
CREATE POLICY "Public full access poetry_lines" ON public.poetry_lines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Public full access withdrawals" ON public.withdrawal_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access app_settings" ON public.app_settings;
CREATE POLICY "Public full access app_settings" ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. Storage Buckets and Storage RLS for PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chapter-pdfs', 'chapter-pdfs', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-pdfs', 'book-pdfs', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public access chapter-pdfs" ON storage.objects;
CREATE POLICY "Public access chapter-pdfs" ON storage.objects FOR ALL TO anon, authenticated USING (bucket_id = 'chapter-pdfs') WITH CHECK (bucket_id = 'chapter-pdfs');

DROP POLICY IF EXISTS "Public access book-pdfs" ON storage.objects;
CREATE POLICY "Public access book-pdfs" ON storage.objects FOR ALL TO anon, authenticated USING (bucket_id = 'book-pdfs') WITH CHECK (bucket_id = 'book-pdfs');
`;

// State Repository with live subscription callbacks
class AdminStore {
  books: Book[] = loadFromStorage(STORAGE_KEYS.BOOKS, []);
  chapters: Chapter[] = loadFromStorage(STORAGE_KEYS.CHAPTERS, []);
  categories: Category[] = loadFromStorage(STORAGE_KEYS.CATEGORIES, initialCategories);
  authors: Author[] = loadFromStorage(STORAGE_KEYS.AUTHORS, []);
  poetry: PoetryLine[] = loadFromStorage(STORAGE_KEYS.POETRY, []);
  writers: WriterRequest[] = loadFromStorage(STORAGE_KEYS.WRITERS, []);
  users: UserMember[] = loadFromStorage(STORAGE_KEYS.USERS, []);
  banners: BannerPopup[] = loadFromStorage(STORAGE_KEYS.BANNERS, []);
  rewardsConfig: RewardsConfig = loadFromStorage(STORAGE_KEYS.REWARDS_CONFIG, initialRewardsConfig);
  withdrawals: WithdrawalRequest[] = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
  adSettings: AdControlSettings = loadFromStorage(STORAGE_KEYS.AD_SETTINGS, initialAdSettings);
  adminTeam: AdminTeamMember[] = [initialAdminTeam[0]];
  currentAdminId: string = 'adm-super-1';
  isLoggedIn: boolean = loadFromStorage(STORAGE_KEYS.IS_LOGGED_IN, false);

  rlsWarning: RlsWarning | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    // Strictly enforce 1 Super Admin (Abdullah)
    this.adminTeam = [initialAdminTeam[0]];
    this.currentAdminId = this.adminTeam[0].id;
    saveToStorage(STORAGE_KEYS.ADMIN_TEAM, this.adminTeam);
    saveToStorage(STORAGE_KEYS.CURRENT_ADMIN_ID, this.currentAdminId);

    // Ensure completely clean state for user's own data
    const cleaned = typeof localStorage !== 'undefined' ? localStorage.getItem('kitabistan_clean_slate_v3') : null;
    if (!cleaned) {
      this.books = [];
      this.chapters = [];
      this.authors = [];
      this.banners = [];
      this.withdrawals = [];
      this.writers = [];
      this.users = [];
      this.poetry = [];
      this.categories = this.categories.map((c) => ({ ...c, books_count: 0 }));
      saveToStorage(STORAGE_KEYS.BOOKS, []);
      saveToStorage(STORAGE_KEYS.CHAPTERS, []);
      saveToStorage(STORAGE_KEYS.AUTHORS, []);
      saveToStorage(STORAGE_KEYS.BANNERS, []);
      saveToStorage(STORAGE_KEYS.WITHDRAWALS, []);
      saveToStorage(STORAGE_KEYS.WRITERS, []);
      saveToStorage(STORAGE_KEYS.USERS, []);
      saveToStorage(STORAGE_KEYS.POETRY, []);
      saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('kitabistan_clean_slate_v3', 'true');
      }
      setTimeout(() => {
        this.deleteAllDummyData();
      }, 300);
    }
  }

  // Delete all dummy data from Supabase Cloud and local storage
  async deleteAllDummyData(): Promise<{ success: boolean; message: string }> {
    const client = getSupabase();
    let cloudResult = '';
    if (client) {
      try {
        // Delete in cascade order:
        // 1. Delete all chapters
        const { error: chErr } = await client
          .from('chapters')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        // 2. Delete all books
        const { error: bErr } = await client
          .from('books')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        // 3. Delete all withdrawal requests
        const { error: wErr } = await client
          .from('withdrawal_requests')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        // 4. Delete poetry lines
        await client
          .from('poetry_lines')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (chErr || bErr || wErr) {
          const errs = [chErr?.message, bErr?.message, wErr?.message].filter(Boolean).join('; ');
          console.warn('Supabase delete warning:', errs);
          if (errs.includes('row-level security') || errs.includes('policy')) {
            this.handleRlsError('delete', errs);
          }
          cloudResult = ' (Supabase table wipe attempted)';
        } else {
          cloudResult = ' and wiped from Supabase database';
        }
      } catch (e: any) {
        console.warn('Cloud delete error:', e);
        cloudResult = ` (${e.message || 'Cloud delete issue'})`;
      }
    }

    this.books = [];
    this.chapters = [];
    this.authors = [];
    this.banners = [];
    this.withdrawals = [];
    this.writers = [];
    this.users = [];
    this.poetry = [];
    saveToStorage(STORAGE_KEYS.BOOKS, []);
    saveToStorage(STORAGE_KEYS.CHAPTERS, []);
    saveToStorage(STORAGE_KEYS.AUTHORS, []);
    saveToStorage(STORAGE_KEYS.BANNERS, []);
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, []);
    saveToStorage(STORAGE_KEYS.WRITERS, []);
    saveToStorage(STORAGE_KEYS.USERS, []);
    saveToStorage(STORAGE_KEYS.POETRY, []);

    this.categories = this.categories.map((c) => ({ ...c, books_count: 0 }));
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kn_dummy_purged_v2', 'true');
    }
    this.notify();

    return {
      success: true,
      message: `All dummy data deleted successfully${cloudResult}! Ready for your own novels.`
    };
  }

  // Seed sample demo books if requested
  async seedSampleData(): Promise<{ success: boolean; message: string }> {
    this.books = [...sampleDemoBooks];
    this.chapters = [...sampleDemoChapters];
    this.withdrawals = [...sampleDemoWithdrawalRequests];
    saveToStorage(STORAGE_KEYS.BOOKS, this.books);
    saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);
    this.notify();
    return this.pushAllCurrentDataToSupabase();
  }

  getRlsWarning(): RlsWarning | null {
    return this.rlsWarning;
  }

  clearRlsWarning() {
    this.rlsWarning = null;
    this.notify();
  }

  handleRlsError(table: string, message: string) {
    this.rlsWarning = {
      table,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    console.warn(`[Supabase RLS Warning] Table "${table}" blocked operation due to Row-Level Security: ${message}`);
    this.notify();
  }

  getBooks(): Book[] {
    return this.books;
  }

  getChapters(): Chapter[] {
    return this.chapters;
  }

  getChapter(bookId: string, chapterId: string): Chapter | undefined {
    return this.chapters.find((c) => c.id === chapterId && (!bookId || c.book_id === bookId));
  }

  getChaptersForBook(bookId: string): Chapter[] {
    return this.chapters
      .filter((c) => c.book_id === bookId)
      .sort((a, b) => a.chapter_no - b.chapter_no);
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getAuthors(): Author[] {
    return this.authors;
  }

  getWriterRequests(): WriterRequest[] {
    return this.writers;
  }

  getUsers(): UserMember[] {
    return this.users;
  }

  getBanners(): BannerPopup[] {
    return this.banners;
  }

  getRewardsConfig(): RewardsConfig {
    return this.rewardsConfig;
  }

  getWithdrawals(): WithdrawalRequest[] {
    return this.withdrawals;
  }

  getAdSettings(): AdControlSettings {
    return this.adSettings;
  }

  getStats() {
    const activeUsersCount = this.users.filter((u) => u.status === 'active').length;
    const approvedWithdrawalsPkr = this.withdrawals
      .filter((w) => w.status === 'Approved')
      .reduce((sum, w) => sum + (w.amount_pkr || 0), 0);

    return {
      totalBooks: this.books.length,
      activeUsers: activeUsersCount,
      monthlyEarningsPkr: approvedWithdrawalsPkr,
      pendingRequests:
        this.writers.filter((w) => w.status === 'Pending').length +
        this.withdrawals.filter((w) => w.status === 'Pending').length
    };
  }

  batchApprovePending() {
    this.batchApprovePendingWithdrawals();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Sync all entities from Supabase if connected
  async syncFromSupabase() {
    const client = getSupabase();
    if (!client) return { success: false, message: 'Supabase credentials not configured' };

    try {
      // 1. Fetch categories
      const { data: dbCategories, error: catErr } = await client.from('categories').select('*');
      if (!catErr && dbCategories && dbCategories.length > 0) {
        this.categories = dbCategories.map((c: any) => ({
          id: c.id,
          name_en: c.name_en || 'Category',
          name_urdu: c.name_urdu || '',
          slug: (c.name_en || 'cat').toLowerCase().replace(/\s+/g, '-'),
          icon: 'book',
          books_count: Number(c.books_count) || 0,
          accent_color: '#8B1E3F',
          description: c.name_en
        }));
        saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
      }

      // 2. Fetch authors
      const { data: dbAuthors, error: authErr } = await client.from('authors').select('*');
      if (!authErr && dbAuthors && dbAuthors.length > 0) {
        this.authors = dbAuthors.map((a: any) => ({
          id: a.id,
          name_en: a.name_en || 'Author',
          name_urdu: a.name_urdu || '',
          avatar_url: a.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: 'Kitab Nagri Author',
          total_books: 1,
          total_readers: '10K',
          is_verified: true,
          email: `${(a.name_en || 'author').toLowerCase().replace(/\s+/g, '.')}@kitabnagri.pk`
        }));
        saveToStorage(STORAGE_KEYS.AUTHORS, this.authors);
      }

      // 3. Fetch books
      const { data: dbBooks, error: booksError } = await client
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (booksError) {
        console.warn('Could not fetch books from Supabase:', booksError.message);
        return { success: false, message: booksError.message };
      }

      if (dbBooks && dbBooks.length > 0) {
        this.books = dbBooks.map((b: any) => {
          const matchedAuthor = this.authors.find((a) => a.id === b.author_id);
          const matchedCategory = this.categories.find((c) => c.id === b.category_id);
          const statusVal = b.status?.toLowerCase() || 'pending';
          const normalizedStatus: 'Approved' | 'Pending' | 'In Review' | 'Draft' =
            statusVal === 'approved' ? 'Approved' : statusVal === 'rejected' ? 'Draft' : 'Pending';
          const structureType: BookStructureType = b.structure_type === 'full_book' ? 'full_book' : 'chapter_based';

          return {
            id: b.id,
            title_en: b.title_en || 'Untitled Novel',
            title_urdu: b.title_urdu || undefined,
            author_id: b.author_id || '',
            author_name: matchedAuthor ? matchedAuthor.name_en : 'Author',
            author_urdu: matchedAuthor?.name_urdu,
            category_id: b.category_id || '',
            category_name: matchedCategory ? matchedCategory.name_en : 'General',
            category_urdu: matchedCategory?.name_urdu,
            cover_url: b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
            description: b.description || '',
            total_chapters: structureType === 'full_book' ? 0 : (Number(b.total_chapters) || 0),
            word_count: b.word_count || (b.full_content ? b.full_content.split(/\s+/).filter(Boolean).length : 12000),
            reads_count: b.reads_count || 120,
            rating: b.rating || 5.0,
            is_locked: Boolean(b.is_locked),
            status: normalizedStatus,
            structure_type: structureType,
            full_content: b.full_content || undefined,
            full_content_type: (b.full_content_type as ContentDeliveryType) || 'text',
            full_pdf_url: b.full_pdf_url || undefined,
            full_pdf_storage_path: b.full_pdf_storage_path || undefined,
            full_pdf_file_name: b.full_pdf_url ? 'manuscript.pdf' : undefined,
            created_at: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0]
          };
        });
        saveToStorage(STORAGE_KEYS.BOOKS, this.books);
      }

      // 4. Fetch chapters
      const { data: dbChapters, error: chapError } = await client
        .from('chapters')
        .select('*')
        .order('chapter_no', { ascending: true });

      if (!chapError && dbChapters && dbChapters.length > 0) {
        this.chapters = dbChapters.map((ch: any) => {
          let cType: ChapterContentType = 'text';
          if (ch.content_type === 'text_and_pdf') cType = 'text_and_pdf';
          else if (ch.content_type === 'pdf_upload') cType = 'pdf_upload';
          else if (ch.content_type === 'pdf_url') cType = 'pdf_url';
          else if (ch.content_type === 'pdf') {
            cType = (ch.content_pdf_url && isValidPdfUrl(ch.content_pdf_url)) ? 'pdf_url' : 'pdf_upload';
          }

          return {
            id: ch.id,
            book_id: ch.book_id,
            chapter_no: Number(ch.chapter_no) || 1,
            title_en: ch.title_en || `Chapter ${ch.chapter_no}`,
            title_urdu: ch.title_urdu || undefined,
            content_type: cType,
            content_text_urdu: ch.content_text_urdu || undefined,
            content_pdf_url: ch.content_pdf_url || undefined,
            pdf_storage_path: ch.pdf_storage_path || undefined,
            pdf_file_name: ch.content_pdf_url ? 'document.pdf' : undefined,
            pdf_file_size: ch.content_pdf_url ? '4.2 MB' : undefined,
            word_count: Number(ch.word_count) || (ch.content_text_urdu ? ch.content_text_urdu.split(/\s+/).filter(Boolean).length : 1200),
            is_locked: false,
            ad_gate: 'free',
            status: 'Published',
            created_at: ch.created_at ? new Date(ch.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          };
        });
        saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);
      }

      // 5. Fetch withdrawal requests
      const { data: dbWithdrawals, error: wError } = await client.from('withdrawal_requests').select('*');
      if (!wError && dbWithdrawals && dbWithdrawals.length > 0) {
        this.withdrawals = dbWithdrawals.map((w: any) => ({
          id: w.id,
          user_id: w.user_id || 'user-1',
          user_name: w.account_title || 'Reader',
          user_name_urdu: w.account_title || undefined,
          user_email: 'reader@kitabnagri.pk',
          user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          user_tier: 'Gold Reader',
          points_redeemed: Number(w.points) || 0,
          amount_pkr: Number(w.pkr_amount) || 0,
          payment_method: (w.method?.toLowerCase() === 'jazzcash' ? 'JazzCash' : 'Easypaisa') as 'Easypaisa' | 'JazzCash',
          account_title: w.account_title || '',
          account_number: w.account_number || '',
          created_at: w.created_at ? new Date(w.created_at).toLocaleString() : new Date().toLocaleString(),
          tasks_chapters_completed: Number(w.tasks_chapters) || 0,
          tasks_chapters_required: 50,
          tasks_ads_watched: Number(w.tasks_ads) || 0,
          tasks_ads_required: 20,
          tasks_invites_completed: Number(w.tasks_invites) || 0,
          tasks_invites_required: 3,
          is_flagged_fraud: false,
          status: w.status === 'approved' ? 'Approved' : w.status === 'rejected' ? 'Rejected' : 'Pending',
          admin_note: undefined
        }));
        saveToStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);
      }

      // 6. Fetch poetry lines
      try {
        const { data: dbPoetry, error: poetryErr } = await client
          .from('poetry_lines')
          .select('*')
          .order('created_at', { ascending: false });

        if (!poetryErr && dbPoetry) {
          this.poetry = dbPoetry.map((p: any) => ({
            id: p.id,
            lines_urdu: p.lines_urdu || '',
            poet_name: p.poet_name || 'Anonymous',
            genre: p.genre || 'Sher',
            likes_count: Number(p.likes_count) || 0,
            status: p.status === 'Draft' ? 'Draft' : 'Published',
            created_at: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }));
          saveToStorage(STORAGE_KEYS.POETRY, this.poetry);
        }
      } catch (pe) {
        console.warn('Poetry lines table check:', pe);
      }

      this.notify();
      return {
        success: true,
        message: `Synced ${this.books.length} books, ${this.chapters.length} chapters, ${this.poetry.length} poetry lines from Supabase`
      };
    } catch (e: any) {
      console.error('Supabase sync error:', e);
      return { success: false, message: e.message || 'Network error' };
    }
  }

  // Get live counts directly from Supabase database
  async getSupabaseTableCounts(): Promise<{ books: number; chapters: number; authors: number; categories: number; withdrawals: number } | null> {
    const client = getSupabase();
    if (!client) return null;
    try {
      const [b, ch, a, c, w] = await Promise.all([
        client.from('books').select('*', { count: 'exact', head: true }),
        client.from('chapters').select('*', { count: 'exact', head: true }),
        client.from('authors').select('*', { count: 'exact', head: true }),
        client.from('categories').select('*', { count: 'exact', head: true }),
        client.from('withdrawal_requests').select('*', { count: 'exact', head: true })
      ]);
      return {
        books: b.count || 0,
        chapters: ch.count || 0,
        authors: a.count || 0,
        categories: c.count || 0,
        withdrawals: w.count || 0
      };
    } catch {
      return null;
    }
  }

  // Push ALL current app data into Supabase
  async pushAllCurrentDataToSupabase(): Promise<{ success: boolean; message: string }> {
    const client = getSupabase();
    if (!client) return { success: false, message: 'Supabase credentials not configured' };

    try {
      // 1. Categories
      let catSuccess = 0;
      const catMap = new Map<string, string>();
      for (const cat of this.categories) {
        const catId = isUUID(cat.id) ? cat.id : generateUUID();
        catMap.set(cat.id, catId);
        catMap.set(cat.name_en.toLowerCase(), catId);
        const { error } = await client.from('categories').upsert(
          [
            {
              id: catId,
              name_en: cat.name_en,
              name_urdu: cat.name_urdu || null,
              books_count: cat.books_count || 0
            }
          ],
          { onConflict: 'id' }
        );
        if (!error) catSuccess++;
      }

      // 2. Authors
      let authSuccess = 0;
      const authMap = new Map<string, string>();
      for (const auth of this.authors) {
        const authId = isUUID(auth.id) ? auth.id : generateUUID();
        authMap.set(auth.id, authId);
        authMap.set(auth.name_en.toLowerCase(), authId);
        const { error } = await client.from('authors').upsert(
          [
            {
              id: authId,
              name_en: auth.name_en,
              name_urdu: auth.name_urdu || null,
              photo_url: auth.avatar_url || null
            }
          ],
          { onConflict: 'id' }
        );
        if (!error) authSuccess++;
      }

      // 3. Books
      let bookSuccess = 0;
      const bookMap = new Map<string, string>();
      for (const b of this.books) {
        const bookId = isUUID(b.id) ? b.id : generateUUID();
        bookMap.set(b.id, bookId);

        let resolvedAuthId = (b.author_id && isUUID(b.author_id)) ? b.author_id : (authMap.get(b.author_id) || authMap.get(b.author_name?.toLowerCase()));
        if (!resolvedAuthId && this.authors.length > 0) {
          resolvedAuthId = authMap.get(this.authors[0].id) || this.authors[0].id;
        }

        let resolvedCatId = (b.category_id && isUUID(b.category_id)) ? b.category_id : (catMap.get(b.category_id) || catMap.get(b.category_name?.toLowerCase()));
        if (!resolvedCatId && this.categories.length > 0) {
          resolvedCatId = catMap.get(this.categories[0].id) || this.categories[0].id;
        }

        const { error } = await client.from('books').upsert(
          [
            {
              id: bookId,
              title_en: b.title_en || 'Untitled Novel',
              title_urdu: b.title_urdu || null,
              author_id: resolvedAuthId || null,
              category_id: resolvedCatId || null,
              cover_url: b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
              description: b.description || null,
              is_locked: Boolean(b.is_locked),
              status: (b.status || 'pending').toLowerCase(),
              total_chapters: Number(b.total_chapters) || 0
            }
          ],
          { onConflict: 'id' }
        );
        if (!error) bookSuccess++;
      }

      // 4. Chapters
      let chapSuccess = 0;
      for (const ch of this.chapters) {
        const chapId = isUUID(ch.id) ? ch.id : generateUUID();
        const resolvedBookId = (ch.book_id && isUUID(ch.book_id)) ? ch.book_id : bookMap.get(ch.book_id);
        if (resolvedBookId) {
          const { error } = await client.from('chapters').upsert(
            [
              {
                id: chapId,
                book_id: resolvedBookId,
                chapter_no: Number(ch.chapter_no) || 1,
                title_en: ch.title_en || '',
                title_urdu: ch.title_urdu || null,
                content_type: ch.content_type === 'pdf' ? 'pdf' : 'text',
                content_text_urdu: ch.content_text_urdu || null,
                content_pdf_url: ch.content_pdf_url || null,
                word_count: Number(ch.word_count) || 0
              }
            ],
            { onConflict: 'id' }
          );
          if (!error) chapSuccess++;
        }
      }

      // 5. Withdrawals
      let wrSuccess = 0;
      for (const w of this.withdrawals) {
        const wId = isUUID(w.id) ? w.id : generateUUID();
        const { error } = await client.from('withdrawal_requests').upsert(
          [
            {
              id: wId,
              user_id: null,
              points: Number(w.points_redeemed) || 0,
              pkr_amount: Number(w.amount_pkr) || 0,
              method: w.payment_method || 'JazzCash',
              account_title: w.account_title || '',
              account_number: w.account_number || '',
              tasks_chapters: Number(w.tasks_chapters_completed) || 0,
              tasks_ads: Number(w.tasks_ads_watched) || 0,
              tasks_invites: Number(w.tasks_invites_completed) || 0,
              status: (w.status || 'pending').toLowerCase()
            }
          ],
          { onConflict: 'id' }
        );
        if (!error) wrSuccess++;
      }

      await this.syncFromSupabase();

      return {
        success: true,
        message: `Successfully pushed to Supabase: ${bookSuccess} books, ${chapSuccess} chapters, ${authSuccess} authors, ${catSuccess} categories, ${wrSuccess} withdrawals!`
      };
    } catch (e: any) {
      if (e.message?.includes('row-level security') || e.code === '42501') {
        this.handleRlsError('push', e.message);
        return { success: false, message: 'Row-Level Security blocked push. Run the SQL fix script.' };
      }
      return { success: false, message: e.message || 'Push failed' };
    }
  }

  // Seed sample demo dataset to Supabase conforming to user schema
  async seedInitialDataToSupabase() {
    return this.seedSampleData();
  }

  // Book actions
  async addBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Book; error?: string }> {
    const client = getSupabase();

    // Generate guaranteed unique UUID for new book
    const newBookId = generateUUID();
    const newBook: Book = {
      ...book,
      id: newBookId,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    if (client) {
      try {
        // Resolve or create author in Supabase
        const authorUuid = await resolveSupabaseAuthorId(
          client,
          newBook.author_id,
          newBook.author_name,
          newBook.author_urdu
        );

        // Resolve or create category in Supabase
        const categoryUuid = await resolveSupabaseCategoryId(
          client,
          newBook.category_id,
          newBook.category_name,
          newBook.category_urdu
        );

        // Construct standard columns payload
        const bookPayload: Record<string, any> = {
          id: newBook.id,
          title_en: newBook.title_en,
          title_urdu: newBook.title_urdu || null,
          cover_url: newBook.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
          description: newBook.description || null,
          is_locked: Boolean(newBook.is_locked),
          status: (newBook.status || 'pending').toLowerCase(),
          total_chapters: newBook.structure_type === 'full_book' ? 0 : (Number(newBook.total_chapters) || 0)
        };

        if (authorUuid && isUUID(authorUuid)) {
          bookPayload.author_id = authorUuid;
        }
        if (categoryUuid && isUUID(categoryUuid)) {
          bookPayload.category_id = categoryUuid;
        }

        // Full payload with upgrade columns
        const fullBookPayload: Record<string, any> = {
          ...bookPayload,
          structure_type: newBook.structure_type || 'chapter_based',
          full_content: newBook.full_content || null,
          full_content_type: newBook.full_content_type || 'text',
          full_pdf_url: newBook.full_pdf_url || null,
          full_pdf_storage_path: newBook.full_pdf_storage_path || null
        };

        let insertRes = await client.from('books').insert([fullBookPayload]).select().single();
        let error = insertRes.error;
        let insertedData = insertRes.data;

        if (error && error.message?.includes('does not exist')) {
          // Gracefully fallback to standard columns if table hasn't been migrated yet
          const fallback = await client.from('books').insert([bookPayload]).select().single();
          error = fallback.error;
          insertedData = fallback.data;
        }

        if (error) {
          if (error.message?.includes('row-level security') || error.code === '42501') {
            this.handleRlsError('books', error.message);
            return {
              success: false,
              error: 'Database permission blocked by Supabase Row-Level Security (RLS). Please run the provided SQL migration in Supabase SQL Editor.'
            };
          }
          return {
            success: false,
            error: `Failed to insert book into Supabase: ${error.message}`
          };
        }

        // Real confirmed ID from Supabase
        const confirmedId = insertedData?.id || newBook.id;
        newBook.id = confirmedId;
      } catch (err: any) {
        console.warn('Failed to sync book to Supabase:', err?.message || err);
        return {
          success: false,
          error: err?.message || 'Database connection error'
        };
      }
    }

    // Save to local store only after verification
    this.books = [newBook, ...this.books.filter(b => b.id !== newBook.id)];
    saveToStorage(STORAGE_KEYS.BOOKS, this.books);

    // If author doesn't exist in local state, add it
    if (
      newBook.author_name &&
      !this.authors.some(
        (a) => a.id === newBook.author_id || a.name_en.toLowerCase() === newBook.author_name.toLowerCase()
      )
    ) {
      const newAuth: Author = {
        id: newBook.author_id,
        name_en: newBook.author_name,
        name_urdu: newBook.author_urdu || '',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'Author',
        total_books: 1,
        total_readers: '0',
        is_verified: true,
        email: `${newBook.author_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@kitabnagri.pk`
      };
      this.authors = [newAuth, ...this.authors];
      saveToStorage(STORAGE_KEYS.AUTHORS, this.authors);
    }

    // If category doesn't exist in local state, add it, or increment count
    if (
      newBook.category_name &&
      !this.categories.some(
        (c) => c.id === newBook.category_id || c.name_en.toLowerCase() === newBook.category_name.toLowerCase()
      )
    ) {
      const newCat: Category = {
        id: newBook.category_id,
        name_en: newBook.category_name,
        name_urdu: newBook.category_urdu || '',
        slug: newBook.category_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        icon: 'book',
        books_count: 1,
        accent_color: '#8B1E3F',
        description: newBook.category_name
      };
      this.categories = [...this.categories, newCat];
      saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    } else {
      this.categories = this.categories.map((c) =>
        c.id === newBook.category_id ? { ...c, books_count: (c.books_count || 0) + 1 } : c
      );
      saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    }

    this.notify();

    // Refresh books from Supabase if connected
    if (client) {
      this.syncFromSupabase().catch(() => {});
    }

    return { success: true, data: newBook };
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<{ success: boolean; data?: Book; error?: string }> {
    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        // Filter updates to columns that exist in Supabase 'books' table
        const filteredUpdates: Record<string, any> = {};
        if (updates.title_en !== undefined) filteredUpdates.title_en = updates.title_en;
        if (updates.title_urdu !== undefined) filteredUpdates.title_urdu = updates.title_urdu || null;
        if (updates.cover_url !== undefined) filteredUpdates.cover_url = updates.cover_url;
        if (updates.description !== undefined) filteredUpdates.description = updates.description || null;
        if (updates.is_locked !== undefined) filteredUpdates.is_locked = Boolean(updates.is_locked);
        if (updates.status !== undefined) filteredUpdates.status = updates.status.toLowerCase();
        if (updates.total_chapters !== undefined) filteredUpdates.total_chapters = Number(updates.total_chapters) || 0;
        if (updates.author_id && isUUID(updates.author_id)) filteredUpdates.author_id = updates.author_id;
        if (updates.category_id && isUUID(updates.category_id)) filteredUpdates.category_id = updates.category_id;
        if (updates.structure_type !== undefined) filteredUpdates.structure_type = updates.structure_type;
        if (updates.full_content !== undefined) filteredUpdates.full_content = updates.full_content || null;
        if (updates.full_content_type !== undefined) filteredUpdates.full_content_type = updates.full_content_type;
        if (updates.full_pdf_url !== undefined) filteredUpdates.full_pdf_url = updates.full_pdf_url || null;
        if (updates.full_pdf_storage_path !== undefined) filteredUpdates.full_pdf_storage_path = updates.full_pdf_storage_path || null;

        if (Object.keys(filteredUpdates).length > 0) {
          let { error } = await client.from('books').update(filteredUpdates).eq('id', id);
          if (error && error.message?.includes('does not exist')) {
            // Strip upgrade columns and re-attempt
            delete filteredUpdates.structure_type;
            delete filteredUpdates.full_content;
            delete filteredUpdates.full_content_type;
            delete filteredUpdates.full_pdf_url;
            delete filteredUpdates.full_pdf_storage_path;
            if (Object.keys(filteredUpdates).length > 0) {
              const fallback = await client.from('books').update(filteredUpdates).eq('id', id);
              error = fallback.error;
            }
          }

          if (error) {
            if (error.message?.includes('row-level security') || error.code === '42501') {
              this.handleRlsError('books', error.message);
              return { success: false, error: 'Row-Level Security blocked updating book. Run the SQL migration script.' };
            }
            return { success: false, error: error.message };
          }
        }
      } catch (err: any) {
        console.warn('Supabase update book error:', err?.message || err);
        return { success: false, error: err?.message || 'Update failed' };
      }
    }

    this.books = this.books.map((b) =>
      b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString().split('T')[0] } : b
    );
    saveToStorage(STORAGE_KEYS.BOOKS, this.books);
    this.notify();
    const updated = this.books.find((b) => b.id === id);
    return { success: true, data: updated };
  }

  async deleteBook(id: string) {
    this.books = this.books.filter((b) => b.id !== id);
    this.chapters = this.chapters.filter((ch) => ch.book_id !== id);
    saveToStorage(STORAGE_KEYS.BOOKS, this.books);
    saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);
    this.notify();

    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        const { error: chErr } = await client.from('chapters').delete().eq('book_id', id);
        if (chErr && (chErr.message?.includes('row-level security') || chErr.code === '42501')) {
          this.handleRlsError('chapters', chErr.message);
        }
        const { error: bErr } = await client.from('books').delete().eq('id', id);
        if (bErr && (bErr.message?.includes('row-level security') || bErr.code === '42501')) {
          this.handleRlsError('books', bErr.message);
        }
      } catch (err: any) {
        console.warn('Supabase delete error:', err?.message || err);
      }
    }
  }

  // Chapter actions
  async addChapter(chapter: Omit<Chapter, 'id' | 'created_at'> & { id?: string }): Promise<{ success: boolean; data?: Chapter; error?: string }> {
    const client = getSupabase();

    // Ensure guaranteed unique chapter ID
    const newChapterId = (chapter.id && isUUID(chapter.id) && !this.chapters.some((c) => c.id === chapter.id))
      ? chapter.id
      : generateUUID();

    const newChapter: Chapter = {
      ...chapter,
      id: newChapterId,
      created_at: new Date().toISOString().split('T')[0]
    };

    if (client) {
      try {
        // Ensure book_id is valid UUID
        let targetBookId = newChapter.book_id;
        if (!isUUID(targetBookId)) {
          const found = this.books.find((b) => b.id === newChapter.book_id);
          if (found && isUUID(found.id)) targetBookId = found.id;
        }

        if (isUUID(targetBookId)) {
          const chapPayload: Record<string, any> = {
            id: newChapter.id,
            book_id: targetBookId,
            chapter_no: Number(newChapter.chapter_no) || 1,
            title_en: newChapter.title_en || '',
            title_urdu: newChapter.title_urdu || null,
            content_type: newChapter.content_type || 'text',
            content_text_urdu: (newChapter.content_type === 'text' || newChapter.content_type === 'text_and_pdf') ? (newChapter.content_text_urdu || null) : null,
            content_pdf_url: (newChapter.content_type !== 'text') ? (newChapter.content_pdf_url || null) : null,
            word_count: Number(newChapter.word_count) || 0
          };

          const fullChapPayload = {
            ...chapPayload,
            pdf_storage_path: newChapter.pdf_storage_path || null
          };

          let insertRes = await client.from('chapters').insert([fullChapPayload]).select().single();
          let error = insertRes.error;
          let insertedData = insertRes.data;

          if (error && error.message?.includes('does not exist')) {
            // Fallback without pdf_storage_path if table doesn't have it yet
            const retry = await client.from('chapters').insert([chapPayload]).select().single();
            error = retry.error;
            insertedData = retry.data;
          }

          if (error) {
            if (error.message?.includes('row-level security') || error.code === '42501') {
              this.handleRlsError('chapters', error.message);
              return { success: false, error: 'Database blocked by Supabase Row-Level Security (RLS). Please run the SQL migration script.' };
            }
            return { success: false, error: `Failed to insert chapter into Supabase: ${error.message}` };
          }

          if (insertedData?.id) {
            newChapter.id = insertedData.id;
          }
        }
      } catch (err: any) {
        console.warn('Failed to sync chapter to Supabase:', err?.message || err);
        return { success: false, error: err?.message || 'Database error while saving chapter' };
      }
    }

    this.chapters = [...this.chapters, newChapter];
    // Update book total_chapters count
    this.updateBook(chapter.book_id, {
      total_chapters: this.chapters.filter((c) => c.book_id === chapter.book_id).length
    });
    saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);
    this.notify();

    return { success: true, data: newChapter };
  }

  async updateChapter(id: string, updates: Partial<Chapter>, bookId?: string): Promise<{ success: boolean; data?: Chapter; error?: string }> {
    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        const filtered: Record<string, any> = {};
        if (updates.chapter_no !== undefined) filtered.chapter_no = Number(updates.chapter_no) || 1;
        if (updates.title_en !== undefined) filtered.title_en = updates.title_en;
        if (updates.title_urdu !== undefined) filtered.title_urdu = updates.title_urdu || null;
        if (updates.content_type !== undefined) filtered.content_type = updates.content_type;
        if (updates.content_text_urdu !== undefined) filtered.content_text_urdu = updates.content_text_urdu || null;
        if (updates.content_pdf_url !== undefined) filtered.content_pdf_url = updates.content_pdf_url || null;
        if (updates.word_count !== undefined) filtered.word_count = Number(updates.word_count) || 0;
        if (updates.pdf_storage_path !== undefined) filtered.pdf_storage_path = updates.pdf_storage_path || null;

        if (Object.keys(filtered).length > 0) {
          let query = client.from('chapters').update(filtered).eq('id', id);
          if (bookId && isUUID(bookId)) {
            query = query.eq('book_id', bookId);
          }
          let { error } = await query;
          if (error && error.message?.includes('does not exist') && filtered.pdf_storage_path !== undefined) {
            delete filtered.pdf_storage_path;
            if (Object.keys(filtered).length > 0) {
              let query2 = client.from('chapters').update(filtered).eq('id', id);
              if (bookId && isUUID(bookId)) {
                query2 = query2.eq('book_id', bookId);
              }
              const res = await query2;
              error = res.error;
            }
          }

          if (error) {
            if (error.message?.includes('row-level security') || error.code === '42501') {
              this.handleRlsError('chapters', error.message);
              return { success: false, error: 'Row-Level Security blocked updating chapter. Run SQL script.' };
            }
            return { success: false, error: error.message };
          }
        }
      } catch (err: any) {
        console.warn('Supabase chapter update error:', err?.message || err);
        return { success: false, error: err?.message || 'Update failed' };
      }
    }

    // Isolated update strictly matching target unique chapter id and parent book id if provided
    this.chapters = this.chapters.map((ch) => {
      if (ch.id === id && (!bookId || ch.book_id === bookId)) {
        return { ...ch, ...updates };
      }
      return ch;
    });
    saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);
    this.notify();
    const updated = this.chapters.find((c) => c.id === id);
    return { success: true, data: updated };
  }

  async deleteChapter(id: string, bookId?: string) {
    const target = this.chapters.find((c) => c.id === id && (!bookId || c.book_id === bookId));
    this.chapters = this.chapters.filter((ch) => !(ch.id === id && (!bookId || ch.book_id === bookId)));
    if (target) {
      this.updateBook(target.book_id, {
        total_chapters: this.chapters.filter((c) => c.book_id === target.book_id).length
      });
    }
    saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);
    this.notify();

    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        let query = client.from('chapters').delete().eq('id', id);
        if (bookId && isUUID(bookId)) {
          query = query.eq('book_id', bookId);
        }
        const { error } = await query;
        if (error) {
          if (error.message?.includes('row-level security') || error.code === '42501') {
            this.handleRlsError('chapters', error.message);
          } else {
            console.warn('[Supabase Sync Warning] Delete chapter:', error.message);
          }
        }
      } catch (err: any) {
        console.warn('Supabase chapter delete error:', err?.message || err);
      }
    }
  }

  // Poetry Lines (Ash'aar / Shayari) actions
  getPoetry(): PoetryLine[] {
    return this.poetry;
  }

  async addPoetry(item: Omit<PoetryLine, 'id' | 'created_at' | 'likes_count'>): Promise<PoetryLine> {
    const newP: PoetryLine = {
      ...item,
      id: generateUUID(),
      likes_count: 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.poetry = [newP, ...this.poetry];
    saveToStorage(STORAGE_KEYS.POETRY, this.poetry);
    this.notify();

    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('poetry_lines').insert([
          {
            id: newP.id,
            lines_urdu: newP.lines_urdu,
            poet_name: newP.poet_name,
            genre: newP.genre || 'Sher',
            likes_count: 0,
            status: newP.status || 'Published'
          }
        ]);
        if (error) {
          if (error.message?.includes('row-level security') || error.code === '42501') {
            this.handleRlsError('poetry_lines', error.message);
          } else {
            console.warn('[Supabase Sync Warning] Insert poetry:', error.message);
          }
        } else {
          console.log('Poetry successfully synced to Supabase "poetry_lines":', newP.id);
        }
      } catch (err: any) {
        console.warn('Supabase poetry insert error:', err?.message || err);
      }
    }
    return newP;
  }

  async deletePoetry(id: string): Promise<void> {
    this.poetry = this.poetry.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.POETRY, this.poetry);
    this.notify();

    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        const { error } = await client.from('poetry_lines').delete().eq('id', id);
        if (error) {
          if (error.message?.includes('row-level security') || error.code === '42501') {
            this.handleRlsError('poetry_lines', error.message);
          }
        }
      } catch (err: any) {
        console.warn('Supabase poetry delete error:', err?.message || err);
      }
    }
  }

  // Category actions
  async addCategory(category: Omit<Category, 'id' | 'books_count'>) {
    const newCat: Category = {
      ...category,
      id: generateUUID(),
      books_count: 0
    };
    this.categories = [...this.categories, newCat];
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    this.notify();

    const client = getSupabase();
    if (client) {
      try {
        await client.from('categories').insert([
          {
            id: newCat.id,
            name_en: newCat.name_en,
            name_urdu: newCat.name_urdu || null,
            books_count: 0
          }
        ]);
      } catch (e) {
        console.warn('Could not sync new category to Supabase:', e);
      }
    }

    return newCat;
  }

  async deleteCategory(id: string) {
    this.categories = this.categories.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    this.notify();

    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        await client.from('categories').delete().eq('id', id);
      } catch (e) {
        console.warn('Could not delete category from Supabase:', e);
      }
    }
  }

  // Author actions
  async addAuthor(author: Omit<Author, 'id' | 'total_books' | 'total_readers'>) {
    const newAuth: Author = {
      ...author,
      id: generateUUID(),
      total_books: 0,
      total_readers: '0K'
    };
    this.authors = [newAuth, ...this.authors];
    saveToStorage(STORAGE_KEYS.AUTHORS, this.authors);
    this.notify();

    const client = getSupabase();
    if (client) {
      try {
        await client.from('authors').insert([
          {
            id: newAuth.id,
            name_en: newAuth.name_en,
            name_urdu: newAuth.name_urdu || null,
            photo_url: newAuth.avatar_url || null
          }
        ]);
      } catch (e) {
        console.warn('Could not sync new author to Supabase:', e);
      }
    }

    return newAuth;
  }

  async deleteAuthor(id: string) {
    this.authors = this.authors.filter((a) => a.id !== id);
    saveToStorage(STORAGE_KEYS.AUTHORS, this.authors);
    this.notify();

    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        await client.from('authors').delete().eq('id', id);
      } catch (e) {
        console.warn('Could not delete author from Supabase:', e);
      }
    }
  }

  // Writers Requests
  approveWriterRequest(id: string) {
    const req = this.writers.find((w) => w.id === id);
    if (!req) return;

    req.status = 'Approved';

    const matchingAuthor = this.authors.find((a) => a.name_en.toLowerCase() === req.writer_name.toLowerCase());
    const authorId = matchingAuthor ? matchingAuthor.id : generateUUID();
    if (!matchingAuthor) {
      this.addAuthor({
        name_en: req.writer_name,
        name_urdu: req.writer_name,
        avatar_url: req.cover_url,
        bio: 'Published author via Kitab Nagri editorial board.',
        is_verified: true,
        email: `${req.writer_name.toLowerCase().replace(/\s+/g, '.')}@kitabnagri.pk`
      });
    }

    const newBook = this.addBook({
      title_en: req.book_title_en,
      title_urdu: req.book_title_urdu,
      author_id: authorId,
      author_name: req.writer_name,
      author_urdu: req.writer_name,
      category_id: this.categories[0]?.id || generateUUID(),
      category_name: req.genre,
      category_urdu: 'رومانوی',
      cover_url: req.cover_url,
      description: req.synopsis_urdu,
      total_chapters: req.submitted_chapters_count,
      word_count: req.word_count,
      reads_count: 0,
      rating: 5.0,
      is_locked: false,
      status: 'Approved'
    });

    newBook.then((res) => {
      if (res.data) {
        this.addChapter({
          book_id: res.data.id,
          chapter_no: 1,
          title_en: req.sample_chapter_title,
          title_urdu: req.sample_chapter_title,
          content_type: 'text',
          content_text_urdu: req.sample_chapter_urdu,
          word_count: 1200,
          is_locked: false,
          ad_gate: 'free',
          status: 'Published'
        });
      }
    });

    saveToStorage(STORAGE_KEYS.WRITERS, this.writers);
    this.notify();
  }

  rejectWriterRequest(id: string, reason: string) {
    this.writers = this.writers.map((w) =>
      w.id === id ? { ...w, status: 'Rejected', rejection_reason: reason } : w
    );
    saveToStorage(STORAGE_KEYS.WRITERS, this.writers);
    this.notify();
  }

  // Users actions
  updateUser(id: string, updates: Partial<UserMember>) {
    this.users = this.users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.notify();
  }

  adjustUserPoints(id: string, deltaPoints: number) {
    this.users = this.users.map((u) =>
      u.id === id ? { ...u, points_balance: Math.max(0, u.points_balance + deltaPoints) } : u
    );
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.notify();
  }

  // Banners
  addBanner(banner: Omit<BannerPopup, 'id' | 'clicks' | 'impressions' | 'created_at'>) {
    const newBanner: BannerPopup = {
      ...banner,
      id: 'ban-' + Date.now(),
      clicks: 0,
      impressions: 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.banners = [newBanner, ...this.banners];
    saveToStorage(STORAGE_KEYS.BANNERS, this.banners);
    this.notify();
    return newBanner;
  }

  toggleBannerStatus(id: string) {
    this.banners = this.banners.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b));
    saveToStorage(STORAGE_KEYS.BANNERS, this.banners);
    this.notify();
  }

  deleteBanner(id: string) {
    this.banners = this.banners.filter((b) => b.id !== id);
    saveToStorage(STORAGE_KEYS.BANNERS, this.banners);
    this.notify();
  }

  // Rewards Config
  updateRewardsConfig(config: RewardsConfig) {
    this.rewardsConfig = { ...config };
    saveToStorage(STORAGE_KEYS.REWARDS_CONFIG, this.rewardsConfig);
    this.notify();
  }

  // Withdrawal Requests
  async approveWithdrawal(id: string, adminNote?: string) {
    this.withdrawals = this.withdrawals.map((w) =>
      w.id === id
        ? {
            ...w,
            status: 'Approved',
            approved_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            admin_note: adminNote || 'Dispatched via Corporate API Gateway'
          }
        : w
    );
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);
    this.notify();

    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        await client.from('withdrawal_requests').update({ status: 'approved' }).eq('id', id);
      } catch (e) {
        console.warn('Could not sync approved withdrawal to Supabase:', e);
      }
    }
  }

  async rejectWithdrawal(id: string, reason: string) {
    this.withdrawals = this.withdrawals.map((w) =>
      w.id === id ? { ...w, status: 'Rejected', admin_note: reason } : w
    );
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);
    this.notify();

    const client = getSupabase();
    if (client && isUUID(id)) {
      try {
        await client.from('withdrawal_requests').update({ status: 'rejected' }).eq('id', id);
      } catch (e) {
        console.warn('Could not sync rejected withdrawal to Supabase:', e);
      }
    }
  }

  batchApprovePendingWithdrawals() {
    this.withdrawals = this.withdrawals.map((w) =>
      w.status === 'Pending' && !w.is_flagged_fraud
        ? {
            ...w,
            status: 'Approved',
            approved_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            admin_note: 'Batch approved via Automated Settlement'
          }
        : w
    );
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);
    this.notify();
  }

  // Ad Settings
  async updateAdSettings(settings: AdControlSettings) {
    this.adSettings = { ...settings };
    saveToStorage(STORAGE_KEYS.AD_SETTINGS, this.adSettings);
    this.notify();

    const client = getSupabase();
    if (client) {
      try {
        await client.from('app_settings').upsert({
          id: 'default',
          admob_app_id: settings.admob_app_id,
          banner_ad_unit_id: settings.banner_ad_unit_id,
          interstitial_ad_unit_id: settings.interstitial_ad_unit_id,
          rewarded_ad_unit_id: settings.rewarded_ad_unit_id,
          app_open_ad_unit_id: settings.app_open_ad_unit_id,
          interstitial_frequency_chapters: settings.interstitial_frequency_chapters,
          rewarded_gate_threshold_chapter: settings.rewarded_gate_threshold_chapter,
          is_test_mode: settings.is_test_mode,
          enable_banner_ads: settings.enable_banner_ads ?? true,
          enable_interstitial_ads: settings.enable_interstitial_ads ?? true,
          enable_rewarded_unlock: settings.enable_rewarded_unlock ?? true,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not sync ad settings to Supabase app_settings:', err);
      }
    }
  }

  // Admin Team & RBAC Management
  getCurrentAdmin(): AdminTeamMember {
    const found = this.adminTeam.find((m) => m.id === this.currentAdminId);
    return found || this.adminTeam[0] || initialAdminTeam[0];
  }

  setCurrentAdmin(id: string): void {
    const target = this.adminTeam.find((m) => m.id === id);
    if (target) {
      this.currentAdminId = id;
      saveToStorage(STORAGE_KEYS.CURRENT_ADMIN_ID, id);
      this.notify();
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.isLoggedIn);
  }

  login(
    usernameOrEmail: string,
    passwordAttempt: string
  ): { success: boolean; member?: AdminTeamMember; message: string } {
    const query = usernameOrEmail.trim().toLowerCase();
    const pass = passwordAttempt.trim();

    // Match by email, username, or "admin" shorthand for Super Admin
    const member = this.adminTeam.find((m) => {
      const emailMatch = m.email.toLowerCase() === query;
      const userMatch = m.username && m.username.toLowerCase() === query;
      const adminAlias = query === 'admin' && m.role === 'Super Admin';
      return emailMatch || userMatch || adminAlias;
    });

    if (!member) {
      return {
        success: false,
        message: 'Invalid credentials. No account matches this username or email.'
      };
    }

    if (member.status === 'Suspended') {
      return {
        success: false,
        message: 'This account has been suspended. Please contact the Super Admin.'
      };
    }

    const expectedPass = member.password || 'admin12345';
    if (pass !== expectedPass) {
      return {
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      };
    }

    // Successful login: update session and timestamp
    member.last_login = 'Just now';
    this.currentAdminId = member.id;
    this.isLoggedIn = true;
    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
    saveToStorage(STORAGE_KEYS.CURRENT_ADMIN_ID, member.id);
    saveToStorage(STORAGE_KEYS.ADMIN_TEAM, this.adminTeam);
    this.notify();

    return {
      success: true,
      member,
      message: `Welcome back, ${member.name} (${member.role})!`
    };
  }

  logout(): void {
    this.isLoggedIn = false;
    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, false);
    this.notify();
  }

  hasPermission(permission: keyof AdminPermissions): boolean {
    const current = this.getCurrentAdmin();
    if (!current) return false;
    if (current.role === 'Super Admin') return true;
    return Boolean(current.permissions?.[permission]);
  }

  getAdminTeam(): AdminTeamMember[] {
    return this.adminTeam;
  }

  addAdminTeamMember(member: Omit<AdminTeamMember, 'id' | 'created_at' | 'last_login'>): AdminTeamMember {
    const newMember: AdminTeamMember = {
      ...member,
      id: generateUUID(),
      created_at: new Date().toISOString().split('T')[0],
      last_login: 'Never'
    };
    this.adminTeam = [newMember, ...this.adminTeam];
    saveToStorage(STORAGE_KEYS.ADMIN_TEAM, this.adminTeam);
    this.notify();
    return newMember;
  }

  updateAdminTeamMember(id: string, updates: Partial<AdminTeamMember>): void {
    this.adminTeam = this.adminTeam.map((m) => (m.id === id ? { ...m, ...updates } : m));
    saveToStorage(STORAGE_KEYS.ADMIN_TEAM, this.adminTeam);
    this.notify();
  }

  deleteAdminTeamMember(id: string): { success: boolean; message: string } {
    const target = this.adminTeam.find((m) => m.id === id);
    if (!target) return { success: false, message: 'Member not found' };
    if (target.role === 'Super Admin') {
      const superAdmins = this.adminTeam.filter((m) => m.role === 'Super Admin');
      if (superAdmins.length <= 1) {
        return { success: false, message: 'Cannot remove the primary Super Admin account' };
      }
    }
    this.adminTeam = this.adminTeam.filter((m) => m.id !== id);
    if (this.currentAdminId === id) {
      this.currentAdminId = this.adminTeam[0]?.id || 'adm-super-1';
      saveToStorage(STORAGE_KEYS.CURRENT_ADMIN_ID, this.currentAdminId);
    }
    saveToStorage(STORAGE_KEYS.ADMIN_TEAM, this.adminTeam);
    this.notify();
    return { success: true, message: `Removed ${target.name} from admin team` };
  }

  resetAllData() {
    localStorage.clear();
    this.books = initialBooks;
    this.chapters = initialChapters;
    this.categories = initialCategories;
    this.authors = initialAuthors;
    this.writers = initialWriterRequests;
    this.users = initialUsers;
    this.banners = initialBanners;
    this.rewardsConfig = initialRewardsConfig;
    this.withdrawals = initialWithdrawalRequests;
    this.adSettings = initialAdSettings;
    this.notify();
  }
}

export const adminStore = new AdminStore();

// ====================================
// USER APP COMPATIBILITY API
// ====================================
// Both Admin App and User App use these identical query methods
// ensuring single source of truth and full schema compatibility.

export async function userAppFetchBook(bookId: string): Promise<Book | null> {
  // 1. Try memory/local cache first for instant response
  const local = adminStore.getBooks().find((b) => b.id === bookId);
  if (local) return local;

  // 2. Query Supabase directly
  const client = getSupabase();
  if (client && isUUID(bookId)) {
    try {
      const { data, error } = await client.from('books').select('*').eq('id', bookId).single();
      if (!error && data) {
        const structureType: BookStructureType = data.structure_type === 'full_book' ? 'full_book' : 'chapter_based';
        return {
          id: data.id,
          title_en: data.title_en || 'Book',
          title_urdu: data.title_urdu || undefined,
          author_id: data.author_id || '',
          author_name: 'Author',
          category_id: data.category_id || '',
          category_name: 'General',
          cover_url: data.cover_url || '',
          description: data.description || '',
          total_chapters: structureType === 'full_book' ? 0 : (Number(data.total_chapters) || 0),
          word_count: data.word_count || 12000,
          reads_count: data.reads_count || 0,
          rating: data.rating || 5.0,
          is_locked: Boolean(data.is_locked),
          status: 'Approved',
          structure_type: structureType,
          full_content: data.full_content || undefined,
          full_content_type: (data.full_content_type as ContentDeliveryType) || 'text',
          full_pdf_url: data.full_pdf_url || undefined,
          full_pdf_storage_path: data.full_pdf_storage_path || undefined,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.created_at || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('userAppFetchBook exception:', e);
    }
  }
  return null;
}

export async function userAppFetchChapters(bookId: string): Promise<Chapter[]> {
  const local = adminStore.getChaptersForBook(bookId);
  if (local.length > 0) return local;

  const client = getSupabase();
  if (client && isUUID(bookId)) {
    try {
      const { data, error } = await client
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('chapter_no', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((ch: any) => ({
          id: ch.id,
          book_id: ch.book_id,
          chapter_no: Number(ch.chapter_no) || 1,
          title_en: ch.title_en || `Chapter ${ch.chapter_no}`,
          title_urdu: ch.title_urdu || undefined,
          content_type: (ch.content_type as ChapterContentType) || 'text',
          content_text_urdu: ch.content_text_urdu || undefined,
          content_pdf_url: ch.content_pdf_url || undefined,
          pdf_storage_path: ch.pdf_storage_path || undefined,
          pdf_file_name: ch.content_pdf_url ? 'chapter.pdf' : undefined,
          pdf_file_size: ch.content_pdf_url ? '4.2 MB' : undefined,
          word_count: Number(ch.word_count) || 0,
          is_locked: false,
          ad_gate: 'free',
          status: 'Published',
          created_at: ch.created_at || new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('userAppFetchChapters exception:', e);
    }
  }
  return [];
}

export async function userAppFetchChapter(bookId: string, chapterId: string): Promise<Chapter | null> {
  const local = adminStore.getChapter(bookId, chapterId);
  if (local) return local;

  const client = getSupabase();
  if (client && isUUID(chapterId)) {
    try {
      let query = client.from('chapters').select('*').eq('id', chapterId);
      if (bookId && isUUID(bookId)) {
        query = query.eq('book_id', bookId);
      }
      const { data, error } = await query.single();
      if (!error && data) {
        return {
          id: data.id,
          book_id: data.book_id,
          chapter_no: Number(data.chapter_no) || 1,
          title_en: data.title_en || `Chapter ${data.chapter_no}`,
          title_urdu: data.title_urdu || undefined,
          content_type: (data.content_type as ChapterContentType) || 'text',
          content_text_urdu: data.content_text_urdu || undefined,
          content_pdf_url: data.content_pdf_url || undefined,
          pdf_storage_path: data.pdf_storage_path || undefined,
          word_count: Number(data.word_count) || 0,
          is_locked: false,
          ad_gate: 'free',
          status: 'Published',
          created_at: data.created_at || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('userAppFetchChapter exception:', e);
    }
  }
  return null;
}
