import React, { useState, useEffect } from 'react';
import {
  Settings,
  Radio,
  Shield,
  Save,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Sliders,
  Tv,
  Smartphone,
  Sparkles,
  Lock,
  Database,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
  FileText,
  Copy,
  ShieldAlert,
  Terminal,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { AdControlSettings } from '../types';
import {
  adminStore,
  getSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabase,
  SUPABASE_RLS_FIX_SQL
} from '../services/supabase';

interface SettingsViewProps {
  settings: AdControlSettings;
  onSaveSettings: (updated: AdControlSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings }) => {
  const [form, setForm] = useState<AdControlSettings>({ ...settings });
  const [libraryName, setLibraryName] = useState('Kitabistan - Urdu Novels Library');
  const [adminEmail, setAdminEmail] = useState('admin@kitabistan.pk');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [forceAppUpdate, setForceAppUpdate] = useState(false);
  const [appVersion, setAppVersion] = useState('v2.4.1');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Supabase State
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.key);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connMessage, setConnMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [tableCounts, setTableCounts] = useState<{ books: number; chapters: number; authors: number; categories: number; withdrawals: number } | null>(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  const fetchLiveCounts = async () => {
    setIsLoadingCounts(true);
    const counts = await adminStore.getSupabaseTableCounts();
    if (counts) setTableCounts(counts);
    setIsLoadingCounts(false);
  };

  useEffect(() => {
    fetchLiveCounts();
  }, []);

  const handleCopySqlFix = () => {
    navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setConnStatus('idle');
    setConnMessage('');

    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    const client = getSupabase();

    if (!client) {
      setIsTestingConn(false);
      setConnStatus('error');
      setConnMessage('Please verify Supabase URL and API Key.');
      return;
    }

    try {
      // Test querying books table
      const { error } = await client.from('books').select('id').limit(1);
      if (error) {
        setConnStatus('error');
        setConnMessage(`Connected, but query returned: ${error.message}`);
      } else {
        setConnStatus('success');
        setConnMessage(`Successfully linked with Supabase project "blkqwipoprumtejpluwj"!`);
        fetchLiveCounts();
      }
    } catch (err: any) {
      setConnStatus('error');
      setConnMessage(err.message || 'Connection test failed');
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSyncFromSupabase = async () => {
    setIsSyncing(true);
    const res = await adminStore.syncFromSupabase();
    setIsSyncing(false);
    if (res.success) {
      setConnStatus('success');
      setConnMessage(res.message);
      fetchLiveCounts();
    } else {
      setConnStatus('error');
      setConnMessage(res.message);
    }
  };

  const handlePushToSupabase = async () => {
    setIsPushing(true);
    const res = await adminStore.pushAllCurrentDataToSupabase();
    setIsPushing(false);
    if (res.success) {
      setConnStatus('success');
      setConnMessage(res.message);
      fetchLiveCounts();
    } else {
      setConnStatus('error');
      setConnMessage(res.message);
    }
  };

  const handleSeedToSupabase = async () => {
    setIsSeeding(true);
    const res = await adminStore.seedSampleData();
    setIsSeeding(false);
    if (res.success) {
      setConnStatus('success');
      setConnMessage(res.message);
      fetchLiveCounts();
    } else {
      setConnStatus('error');
      setConnMessage(res.message);
    }
  };

  const [isDeletingDummy, setIsDeletingDummy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAllDummyData = async () => {
    setIsDeletingDummy(true);
    const res = await adminStore.deleteAllDummyData();
    setIsDeletingDummy(false);
    setShowDeleteConfirm(false);
    if (res.success) {
      setConnStatus('success');
      setConnMessage(res.message);
      fetchLiveCounts();
    } else {
      setConnStatus('error');
      setConnMessage(res.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#2D1A1A]">Settings & Database</h1>
          <p className="text-xs text-[#786161]">
            Supabase PostgreSQL cloud sync, Google AdMob monetization unit IDs, and catalog controls
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Supabase Connection Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#f0e2d3] gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#2D1A1A]">Supabase Database & Backend</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Linked: blkqwipoprumtejpluwj
                </span>
              </div>
              <p className="text-xs text-[#786161]">
                Real-time PostgreSQL sync for books, chapters, categories, authors, and withdrawals
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePushToSupabase}
              disabled={isPushing}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <UploadCloud className={`w-3.5 h-3.5 text-emerald-200 ${isPushing ? 'animate-bounce' : ''}`} />
              <span>{isPushing ? 'Pushing Data...' : 'Push Data to Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncFromSupabase}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FF8C00] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync From Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingConn}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#ebd7c2] hover:bg-[#FFF8E7] text-xs font-bold text-[#2D1A1A] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#8B1E3F] ${isTestingConn ? 'animate-spin' : ''}`} />
              <span>{isTestingConn ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {connMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              connStatus === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {connStatus === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{connMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://blkqwipoprumtejpluwj.supabase.co"
              className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
              Supabase Anon / Publishable API Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="sb_publishable_..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
            />
          </div>
        </div>

        {/* Live Supabase Cloud Database Counts */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <div>
                <p className="text-xs font-bold text-[#2D1A1A]">
                  Live Supabase Records (<span className="font-mono text-emerald-800">blkqwipoprumtejpluwj</span>)
                </p>
                <p className="text-[11px] text-[#786161]">
                  Current table rows stored in your remote PostgreSQL database
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchLiveCounts}
                disabled={isLoadingCounts}
                className="px-2.5 py-1 bg-[#FFF8E7] border border-[#ebd7c2] hover:bg-[#8B1E3F] hover:text-white rounded-lg text-xs font-semibold text-[#8B1E3F] transition-all flex items-center gap-1"
                title="Refresh row counts from Supabase"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingCounts ? 'animate-spin' : ''}`} />
                <span>Refresh Counts</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-lg font-black text-[#8B1E3F] block">
                {tableCounts ? tableCounts.books : '12'}
              </span>
              <span className="text-[10px] font-bold text-[#786161] uppercase tracking-wider">Books</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-lg font-black text-[#8B1E3F] block">
                {tableCounts ? tableCounts.chapters : '7'}
              </span>
              <span className="text-[10px] font-bold text-[#786161] uppercase tracking-wider">Chapters</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-lg font-black text-[#8B1E3F] block">
                {tableCounts ? tableCounts.authors : '8'}
              </span>
              <span className="text-[10px] font-bold text-[#786161] uppercase tracking-wider">Authors</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-lg font-black text-[#8B1E3F] block">
                {tableCounts ? tableCounts.categories : '8'}
              </span>
              <span className="text-[10px] font-bold text-[#786161] uppercase tracking-wider">Categories</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 col-span-2 sm:col-span-1">
              <span className="text-lg font-black text-[#8B1E3F] block">
                {tableCounts ? tableCounts.withdrawals : '3'}
              </span>
              <span className="text-[10px] font-bold text-[#786161] uppercase tracking-wider">Payout Requests</span>
            </div>
          </div>
        </div>

        {/* Catalog Dummy Data Cleaner Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-950 flex items-center gap-2">
                  <span>Clear All Dummy Data (Supabase & Local)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                    Clean Slate
                  </span>
                </h4>
                <p className="text-[11px] text-rose-800/90 mt-0.5">
                  Wipes test novels, dummy chapters, and sample payout requests so you can start uploading your own novels.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAllDummyData}
                    disabled={isDeletingDummy}
                    className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${isDeletingDummy ? 'animate-spin' : ''}`} />
                    <span>{isDeletingDummy ? 'Wiping Data...' : 'Yes, Delete All Dummy Data'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-semibold hover:bg-rose-100/60"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                  <span>Delete All Dummy Data</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Database Schema Map Badges */}
        <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-[#2D1A1A] uppercase tracking-wider">
                SQL Schema Mapped Tables
              </p>
              <p className="text-[11px] text-[#786161]">
                Columns and foreign keys mapped to your PostgreSQL tables
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSeedToSupabase}
                disabled={isSeeding}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#ebd7c2] hover:bg-[#8B1E3F] hover:text-white text-xs font-bold text-[#8B1E3F] transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF8C00]" />
                <span>{isSeeding ? 'Seeding...' : 'Seed Catalog & Test Data'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-[#ead4ba] flex items-center justify-between">
              <span className="font-mono font-semibold text-[#2D1A1A]">books</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">UUID PK</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#ead4ba] flex items-center justify-between">
              <span className="font-mono font-semibold text-[#2D1A1A]">chapters</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Text & PDF</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#ead4ba] flex items-center justify-between">
              <span className="font-mono font-semibold text-[#2D1A1A]">authors</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Rel FK</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#ead4ba] flex items-center justify-between">
              <span className="font-mono font-semibold text-[#2D1A1A]">categories</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Rel FK</span>
            </div>
          </div>
        </div>

        {/* Row-Level Security (RLS) Policy Guide Card */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300/60">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2D1A1A]">
                  Row-Level Security (RLS) Configuration & 1-Click SQL Fix
                </h4>
                <p className="text-[11px] text-[#786161]">
                  If you encounter <span className="font-mono text-rose-700 bg-rose-50 px-1 rounded">"violates row-level security policy for table books"</span>, run this quick script in your Supabase SQL editor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowSqlPreview(!showSqlPreview)}
                className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 rounded-xl text-xs font-medium text-[#2D1A1A] transition-all flex items-center gap-1"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-700" />
                <span>{showSqlPreview ? 'Hide SQL' : 'View SQL'}</span>
                {showSqlPreview ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleCopySqlFix}
                className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL Fix</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-[#553C3C] space-y-1.5">
            <p className="font-semibold text-amber-950">How to apply in 15 seconds:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#6b4c4c]">
              <li>Click <strong>Copy SQL Fix</strong> above.</li>
              <li>Go to your Supabase Dashboard (<a href="https://supabase.com/dashboard/project/blkqwipoprumtejpluwj" target="_blank" rel="noreferrer" className="underline font-mono text-amber-900 hover:text-[#8B1E3F]">blkqwipoprumtejpluwj</a>) &rarr; click <strong>SQL Editor</strong> on the left.</li>
              <li>Click <strong>New query</strong>, paste the copied SQL, and click <strong>Run</strong>.</li>
            </ol>
          </div>

          {showSqlPreview && (
            <div className="p-3.5 bg-[#1F1919] rounded-xl border border-[#3D2828] text-amber-100 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-56">
              <pre>{SUPABASE_RLS_FIX_SQL}</pre>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AdMob Configuration Block */}
        <div className="p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#f0e2d3] gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-[#8B1E3F]/10 text-[#8B1E3F]">
                <Tv className="w-5 h-5 text-[#8B1E3F]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1A1A]">Google AdMob Integration</h3>
                <p className="text-xs text-[#786161]">Ad unit slots and rewarded monetization policies</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Connected & Serving Ads
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                AdMob App ID (Android)
              </label>
              <input
                type="text"
                value={form.admob_app_id}
                onChange={(e) => setForm({ ...form, admob_app_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                Banner Ad Unit ID
              </label>
              <input
                type="text"
                value={form.banner_ad_unit_id}
                onChange={(e) => setForm({ ...form, banner_ad_unit_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                Interstitial Ad Unit ID
              </label>
              <input
                type="text"
                value={form.interstitial_ad_unit_id}
                onChange={(e) =>
                  setForm({ ...form, interstitial_ad_unit_id: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                Rewarded Video Ad Unit ID
              </label>
              <input
                type="text"
                value={form.rewarded_ad_unit_id}
                onChange={(e) => setForm({ ...form, rewarded_ad_unit_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                App Open Ad Unit ID
              </label>
              <input
                type="text"
                value={form.app_open_ad_unit_id}
                onChange={(e) => setForm({ ...form, app_open_ad_unit_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-mono text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
              />
            </div>
          </div>

          {/* Ad Master Switches */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#ebd7c2] space-y-3">
            <h4 className="text-xs font-bold text-[#2D1A1A] uppercase tracking-wider">
              Live Ad Placement Toggles (User App Control)
            </h4>
            <p className="text-[11px] text-[#786161]">
              Instantly enable or disable specific ad formats in the Kitabistan User App without releasing an app update:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-[#ead4ba] cursor-pointer hover:border-[#8B1E3F] transition-all">
                <input
                  type="checkbox"
                  checked={form.enable_banner_ads ?? true}
                  onChange={(e) => setForm({ ...form, enable_banner_ads: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <div>
                  <p className="text-xs font-bold text-[#2D1A1A]">Banner Ads</p>
                  <p className="text-[10px] text-gray-500">Sticky banner at bottom of catalog & reader</p>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-[#ead4ba] cursor-pointer hover:border-[#8B1E3F] transition-all">
                <input
                  type="checkbox"
                  checked={form.enable_interstitial_ads ?? true}
                  onChange={(e) => setForm({ ...form, enable_interstitial_ads: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <div>
                  <p className="text-xs font-bold text-[#2D1A1A]">Interstitial Ads</p>
                  <p className="text-[10px] text-gray-500">Full-screen ads during chapter navigation</p>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-[#ead4ba] cursor-pointer hover:border-[#8B1E3F] transition-all">
                <input
                  type="checkbox"
                  checked={form.enable_rewarded_unlock ?? true}
                  onChange={(e) => setForm({ ...form, enable_rewarded_unlock: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
                />
                <div>
                  <p className="text-xs font-bold text-[#2D1A1A]">Rewarded Video</p>
                  <p className="text-[10px] text-gray-500">Watch video to unlock chapters & earn points</p>
                </div>
              </label>
            </div>
          </div>

          {/* Ad Frequency Controls */}
          <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] space-y-4">
            <h4 className="text-xs font-bold text-[#2D1A1A] uppercase tracking-wider">
              Ad Frequency & Gate Thresholds
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Chapters between Interstitials
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.interstitial_frequency_chapters}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      interstitial_frequency_chapters: parseInt(e.target.value) || 2
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Rewarded Gate Threshold (Chapter #)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.rewarded_gate_threshold_chapter}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rewarded_gate_threshold_chapter: parseInt(e.target.value) || 5
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="test-mode"
                checked={form.is_test_mode}
                onChange={(e) => setForm({ ...form, is_test_mode: e.target.checked })}
                className="w-4 h-4 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
              />
              <label htmlFor="test-mode" className="text-xs font-bold text-[#2D1A1A] cursor-pointer">
                Google Test Ad Mode (Use during local device simulation before production store push)
              </label>
            </div>
          </div>
        </div>

        {/* General Applet & Storage Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Library Configuration */}
          <div className="p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#f0e2d3]">
              <div className="p-2.5 rounded-2xl bg-[#8B1E3F]/10 text-[#8B1E3F]">
                <Settings className="w-5 h-5 text-[#8B1E3F]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1A1A]">Application Configuration</h3>
                <p className="text-xs text-[#786161]">Branding and update policies</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                Library Name
              </label>
              <input
                type="text"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8B1E3F]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                Primary Admin Notification Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8B1E3F]/20"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#ebd7c2]">
              <div>
                <p className="text-xs font-bold text-[#2D1A1A]">Maintenance Mode</p>
                <p className="text-[10px] text-gray-500">Show maintenance screen to app readers</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFDF9] border border-[#ebd7c2]">
              <div>
                <p className="text-xs font-bold text-[#2D1A1A]">Force App Store Update</p>
                <p className="text-[10px] text-gray-500">Block outdated versions (Current {appVersion})</p>
              </div>
              <input
                type="checkbox"
                checked={forceAppUpdate}
                onChange={(e) => setForceAppUpdate(e.target.checked)}
                className="w-4 h-4 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
              />
            </div>
          </div>

          {/* Supabase Storage Bucket Metrics */}
          <div className="p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#f0e2d3]">
                <div className="p-2.5 rounded-2xl bg-[#8B1E3F]/10 text-[#8B1E3F]">
                  <HardDrive className="w-5 h-5 text-[#8B1E3F]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D1A1A]">Supabase Object Storage</h3>
                  <p className="text-xs text-[#786161]">Cloud asset buckets telemetry</p>
                </div>
              </div>

              {/* Bucket 1: book-covers */}
              <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2D1A1A]">Bucket: book-covers</span>
                  <span className="font-semibold text-[#8B1E3F]">Public CDN (Active)</span>
                </div>
                <div className="w-full bg-[#ebd7c2] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#8B1E3F] h-full w-[24%]" />
                </div>
                <p className="text-[10px] text-gray-500">Public CDN cached, Urdu novel cover images</p>
              </div>

              {/* Bucket 2: chapter-pdfs */}
              <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2D1A1A]">Bucket: chapter-pdfs</span>
                  <span className="font-semibold text-[#FF8C00]">Public CDN (Active)</span>
                </div>
                <div className="w-full bg-[#ebd7c2] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FF8C00] h-full w-[34%]" />
                </div>
                <p className="text-[10px] text-gray-500">Scanned Urdu novel issues & serialized PDFs</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0e2d3] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold rounded-xl shadow-md shadow-[#8B1E3F]/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#FF8C00]" />
                <span>Save All Settings</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
