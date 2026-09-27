import React, { useState, useEffect } from 'react';
import { adminStore, SUPABASE_RLS_FIX_SQL, RlsWarning } from './services/supabase';
import {
  NavigationScreen,
  Book,
  Chapter,
  Category,
  Author,
  WriterRequest,
  UserMember,
  BannerPopup,
  RewardsConfig,
  WithdrawalRequest,
  AdControlSettings,
  AdminTeamMember,
  PoetryLine
} from './types';
import { ShieldAlert, Copy, Check, ExternalLink, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { BooksView } from './components/BooksView';
import { PoetryView } from './components/PoetryView';
import { CategoriesView } from './components/CategoriesView';
import { AuthorsView } from './components/AuthorsView';
import { WritersRequestsView } from './components/WritersRequestsView';
import { UsersView } from './components/UsersView';
import { BannersView } from './components/BannersView';
import { RewardsConfigView } from './components/RewardsConfigView';
import { WithdrawalRequestsView } from './components/WithdrawalRequestsView';
import { SettingsView } from './components/SettingsView';
import { AdminTeamView } from './components/AdminTeamView';
import { AccessDeniedCard } from './components/AccessDeniedCard';
import { AddBookModal } from './components/AddBookModal';
import { AddPoetryModal } from './components/AddPoetryModal';
import { ChaptersEditorModal } from './components/ChaptersEditorModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LoginScreen } from './components/LoginScreen';

const screenTitles: Record<NavigationScreen, string> = {
  dashboard: 'Dashboard Overview',
  books: 'Urdu Novels Directory',
  poetry: "Urdu Poetry & Ash'aar (شاعری)",
  categories: 'Genre & Categories',
  authors: 'Authors & Novelists',
  'writers-requests': 'Writers Submission Requests',
  users: 'Readers & Community',
  'banners-popups': 'Banners & Promotion Popups',
  'rewards-config': 'Reward Points & Economy',
  'withdrawal-requests': 'Withdrawal Requests Queue',
  'admin-team': 'Admin Team & Roles (RBAC)',
  'settings-ad-control': 'Settings & Ad Control'
};

export default function App() {
  // Navigation State
  const [activeScreen, setActiveScreen] = useState<NavigationScreen>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // App Data State (Synced with AdminStore)
  const [books, setBooks] = useState<Book[]>(adminStore.getBooks());
  const [chapters, setChapters] = useState<Chapter[]>(adminStore.getChapters());
  const [categories, setCategories] = useState<Category[]>(adminStore.getCategories());
  const [authors, setAuthors] = useState<Author[]>(adminStore.getAuthors());
  const [poetry, setPoetry] = useState<PoetryLine[]>(adminStore.getPoetry());
  const [writers, setWriters] = useState<WriterRequest[]>(adminStore.getWriterRequests());
  const [users, setUsers] = useState<UserMember[]>(adminStore.getUsers());
  const [banners, setBanners] = useState<BannerPopup[]>(adminStore.getBanners());
  const [rewardsConfig, setRewardsConfig] = useState<RewardsConfig>(adminStore.getRewardsConfig());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(adminStore.getWithdrawals());
  const [adSettings, setAdSettings] = useState<AdControlSettings>(adminStore.getAdSettings());
  const [adminTeam, setAdminTeam] = useState<AdminTeamMember[]>(adminStore.getAdminTeam());
  const [currentAdmin, setCurrentAdmin] = useState<AdminTeamMember>(adminStore.getCurrentAdmin());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(adminStore.isLoggedIn);
  const [rlsWarning, setRlsWarning] = useState<RlsWarning | null>(adminStore.getRlsWarning());
  const [copiedRls, setCopiedRls] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookModalSession, setBookModalSession] = useState(0);
  const [isAddPoetryModalOpen, setIsAddPoetryModalOpen] = useState(false);

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [activeBookForChapter, setActiveBookForChapter] = useState<Book | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterModalSession, setChapterModalSession] = useState(0);

  // Subscribe to store updates and trigger cloud sync
  useEffect(() => {
    adminStore.syncFromSupabase().catch((err) => {
      console.info('Initial Supabase sync deferred:', err);
    });

    const unsubscribe = adminStore.subscribe(() => {
      setBooks(adminStore.getBooks());
      setChapters(adminStore.getChapters());
      setCategories(adminStore.getCategories());
      setAuthors(adminStore.getAuthors());
      setPoetry(adminStore.getPoetry());
      setWriters(adminStore.getWriterRequests());
      setUsers(adminStore.getUsers());
      setBanners(adminStore.getBanners());
      setRewardsConfig(adminStore.getRewardsConfig());
      setWithdrawals(adminStore.getWithdrawals());
      setAdSettings(adminStore.getAdSettings());
      setAdminTeam([...adminStore.getAdminTeam()]);
      setCurrentAdmin(adminStore.getCurrentAdmin());
      setIsAuthenticated(adminStore.isLoggedIn);
      setRlsWarning(adminStore.getRlsWarning());
    });
    return () => unsubscribe();
  }, []);

  const handleCopyRlsSql = () => {
    navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
    setCopiedRls(true);
    addToast('success', 'RLS Fix SQL copied! Paste & Run in Supabase SQL Editor.');
    setTimeout(() => setCopiedRls(false), 2500);
  };

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const toastType: 'success' | 'error' | 'info' = type === 'warning' ? 'info' : type;
    setToasts((prev) => [...prev, { id, type: toastType, title: message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Pending Counts for Sidebar Badges
  const pendingWritersCount = writers.filter((w) => w.status === 'Pending').length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'Pending').length;

  // Book Handlers
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookModalSession((s) => s + 1);
    setIsAddBookModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookModalSession((s) => s + 1);
    setIsAddBookModalOpen(true);
  };

  const handleSaveBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingBook) {
      const res = await adminStore.updateBook(editingBook.id, bookData);
      if (!res.success) {
        addToast('error', `Failed to update novel: ${res.error}`);
        return res;
      }
      addToast('success', `Updated novel "${bookData.title_en}"`);
      setIsAddBookModalOpen(false);
      setEditingBook(null);
      return res;
    } else {
      const res = await adminStore.addBook(bookData);
      if (!res.success) {
        addToast('error', `Failed to publish novel: ${res.error}`);
        return res;
      }
      const verifiedId = res.data?.id ? ` (ID: ${res.data.id.slice(0, 8)}...)` : '';
      addToast('success', `Novel "${bookData.title_en}" saved and published successfully!${verifiedId}`);
      setIsAddBookModalOpen(false);
      setEditingBook(null);
      return res;
    }
  };

  // Unified Delete Confirmation State
  interface DeleteTarget {
    type: 'book' | 'chapter' | 'author' | 'category' | 'poetry' | 'banner' | 'admin';
    id: string;
    title?: string;
    parentId?: string;
  }
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const handleDeleteBook = (id: string) => {
    const b = books.find((x) => x.id === id);
    setDeleteTarget({
      type: 'book',
      id,
      title: b?.title_en ? `"${b.title_en}"` : 'Selected Novel'
    });
  };

  // Poetry Handlers
  const handleOpenAddPoetry = () => {
    setIsAddPoetryModalOpen(true);
  };

  const handleSavePoetry = async (item: Omit<PoetryLine, 'id' | 'created_at' | 'likes_count'>) => {
    await adminStore.addPoetry(item);
    addToast('success', 'Urdu poetry published to Kitabistan app & Supabase!');
  };

  const handleDeletePoetry = (id: string) => {
    const p = poetry.find((x) => x.id === id);
    setDeleteTarget({
      type: 'poetry',
      id,
      title: p ? `${p.poet_name} couplet` : 'Selected Poetry'
    });
  };

  // Chapter Handlers
  const handleOpenAddChapter = (book: Book) => {
    setActiveBookForChapter(book);
    setEditingChapter(null);
    setChapterModalSession((s) => s + 1);
    setIsChapterModalOpen(true);
  };

  const handleEditChapter = (book: Book, chapter: Chapter) => {
    setActiveBookForChapter(book);
    setEditingChapter(chapter);
    setChapterModalSession((s) => s + 1);
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = async (chapterData: Omit<Chapter, 'id' | 'created_at'>, chapterId?: string) => {
    if (chapterId || editingChapter) {
      const targetId = chapterId || editingChapter!.id;
      const res = await adminStore.updateChapter(targetId, chapterData, activeBookForChapter?.id);
      if (!res.success) {
        addToast('error', `Failed to update chapter: ${res.error}`);
        return res;
      }
      addToast('success', `Chapter "${chapterData.title_en}" updated successfully`);
      setIsChapterModalOpen(false);
      setEditingChapter(null);
      return res;
    } else {
      const res = await adminStore.addChapter({
        ...chapterData,
        book_id: activeBookForChapter?.id || chapterData.book_id
      });
      if (!res.success) {
        addToast('error', `Failed to publish chapter: ${res.error}`);
        return res;
      }
      const verifiedId = res.data?.id ? ` (ID: ${res.data.id.slice(0, 8)}...)` : '';
      addToast('success', `New Chapter published successfully!${verifiedId}`);
      setIsChapterModalOpen(false);
      setEditingChapter(null);
      return res;
    }
  };

  const handleDeleteChapter = (id: string) => {
    const ch = chapters.find((x) => x.id === id);
    setDeleteTarget({
      type: 'chapter',
      id,
      title: ch?.title_en ? `"${ch.title_en}" (Ch. ${ch.chapter_no})` : 'Selected Chapter',
      parentId: ch?.book_id || activeBookForChapter?.id
    });
  };

  // Category Handlers
  const handleAddCategory = (cat: Omit<Category, 'id' | 'books_count'>) => {
    adminStore.addCategory(cat);
    addToast('success', `Genre "${cat.name_en}" created`);
  };

  const handleDeleteCategory = (id: string) => {
    const c = categories.find((x) => x.id === id);
    setDeleteTarget({
      type: 'category',
      id,
      title: c?.name_en ? `Genre "${c.name_en}"` : 'Selected Category'
    });
  };

  // Author Handlers
  const handleAddAuthor = (auth: Omit<Author, 'id' | 'total_books' | 'total_readers'>) => {
    adminStore.addAuthor(auth);
    addToast('success', `Author "${auth.name_en}" registered`);
  };

  const handleDeleteAuthor = (id: string) => {
    const a = authors.find((x) => x.id === id);
    setDeleteTarget({
      type: 'author',
      id,
      title: a?.name_en ? `Author "${a.name_en}"` : 'Selected Author'
    });
  };

  // Writer Requests Handlers
  const handleApproveWriter = (id: string) => {
    adminStore.approveWriterRequest(id);
    addToast('success', 'Manuscript approved and added to catalog pipeline!');
  };

  const handleRejectWriter = (id: string, reason: string) => {
    adminStore.rejectWriterRequest(id, reason);
    addToast('info', 'Manuscript submission rejected');
  };

  // User Handlers
  const handleUpdateUser = (id: string, updates: Partial<UserMember>) => {
    adminStore.updateUser(id, updates);
    addToast('success', 'User status updated');
  };

  const handleAdjustPoints = (id: string, deltaPoints: number) => {
    adminStore.adjustUserPoints(id, deltaPoints);
    addToast('success', `Adjusted ${deltaPoints > 0 ? '+' : ''}${deltaPoints} points`);
  };

  // Banners Handlers
  const handleAddBanner = (banner: Omit<BannerPopup, 'id' | 'clicks' | 'impressions' | 'created_at'>) => {
    adminStore.addBanner(banner);
    addToast('success', 'Promo banner activated');
  };

  const handleToggleBanner = (id: string) => {
    adminStore.toggleBannerStatus(id);
    addToast('info', 'Banner status toggled');
  };

  const handleDeleteBanner = (id: string) => {
    const b = banners.find((x) => x.id === id);
    setDeleteTarget({
      type: 'banner',
      id,
      title: b?.title ? `Banner "${b.title}"` : 'Selected Banner'
    });
  };

  // Rewards Config Handler
  const handleSaveRewardsConfig = (updated: RewardsConfig) => {
    adminStore.updateRewardsConfig(updated);
    addToast('success', 'Rewards economy config updated');
  };

  // Withdrawal Handlers
  const handleApproveWithdrawal = (id: string, note?: string) => {
    adminStore.approveWithdrawal(id, note);
    addToast('success', `Payout disbursed via Telecom Gateway`);
  };

  const handleRejectWithdrawal = (id: string, reason: string) => {
    adminStore.rejectWithdrawal(id, reason);
    addToast('warning', `Withdrawal rejected and points flagged`);
  };

  const handleBatchApproveWithdrawals = () => {
    adminStore.batchApprovePending();
    addToast('success', 'Batch approved all verified pending payouts!');
  };

  // Settings Handler
  const handleSaveSettings = (updated: AdControlSettings) => {
    adminStore.updateAdSettings(updated);
    addToast('success', 'Google AdMob settings saved');
  };

  // Admin Team & RBAC Handlers
  const handleAddAdmin = (newAdmin: Omit<AdminTeamMember, 'id' | 'created_at' | 'last_login'>) => {
    if (!adminStore.hasPermission('manage_team')) {
      addToast('error', 'Permission denied: Super Admin or "manage_team" permission required');
      return;
    }
    const added = adminStore.addAdminTeamMember(newAdmin);
    addToast('success', `Added ${added.name} as ${added.role}!`);
  };

  const handleUpdateAdmin = (id: string, updates: Partial<AdminTeamMember>) => {
    if (!adminStore.hasPermission('manage_team')) {
      addToast('error', 'Permission denied: Super Admin or "manage_team" permission required');
      return;
    }
    adminStore.updateAdminTeamMember(id, updates);
    addToast('success', 'Admin profile and permissions updated successfully');
  };

  const handleDeleteAdmin = (id: string) => {
    if (!adminStore.hasPermission('manage_team')) {
      addToast('error', 'Permission denied: Super Admin or "manage_team" permission required');
      return;
    }
    const m = adminTeam.find((x) => x.id === id);
    setDeleteTarget({
      type: 'admin',
      id,
      title: m?.name ? `Admin "${m.name}" (${m.role})` : 'Selected Admin'
    });
  };

  // Unified Delete Execution (Only runs after clicking "Confirm Delete")
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, parentId } = deleteTarget;
    setDeleteTarget(null);

    try {
      if (type === 'book') {
        await adminStore.deleteBook(id);
        addToast('success', 'Deleted successfully.');
      } else if (type === 'chapter') {
        await adminStore.deleteChapter(id, parentId);
        addToast('success', 'Deleted successfully.');
      } else if (type === 'author') {
        await adminStore.deleteAuthor(id);
        addToast('success', 'Deleted successfully.');
      } else if (type === 'category') {
        await adminStore.deleteCategory(id);
        addToast('success', 'Deleted successfully.');
      } else if (type === 'poetry') {
        await adminStore.deletePoetry(id);
        addToast('success', 'Deleted successfully.');
      } else if (type === 'banner') {
        await adminStore.deleteBanner(id);
        addToast('success', 'Deleted successfully.');
      } else if (type === 'admin') {
        const res = adminStore.deleteAdminTeamMember(id);
        if (res.success) {
          addToast('success', 'Deleted successfully.');
        } else {
          addToast('error', res.message);
        }
      }
    } catch (err: any) {
      addToast('error', 'Failed to delete: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleSwitchCurrentAdmin = (id: string) => {
    adminStore.setCurrentAdmin(id);
    const switched = adminStore.getCurrentAdmin();
    addToast('info', `Active session switched to ${switched.name} (${switched.role})`);
  };

  const handleLogout = () => {
    adminStore.logout();
    setIsAuthenticated(false);
    addToast('info', 'Logged out of admin panel');
  };

  // If not authenticated, render dedicated LoginScreen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] text-[#2D1A1A] antialiased selection:bg-[#8B1E3F] selection:text-white">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <LoginScreen
          onLoginSuccess={(member) => {
            setIsAuthenticated(true);
            setCurrentAdmin(member);
            addToast('success', `Welcome back, ${member.name} (${member.role})!`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7] text-[#2D1A1A] flex flex-col antialiased selection:bg-[#8B1E3F] selection:text-white">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main App Layout */}
      <div className="flex flex-1 min-h-screen overflow-hidden">
        {/* Fixed Desktop Sidebar & Mobile Slide-over Drawer */}
        <Sidebar
          currentScreen={activeScreen}
          onSelectScreen={(screen) => {
            setActiveScreen(screen);
            setIsMobileDrawerOpen(false);
          }}
          isOpenMobile={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
          pendingWritersCount={pendingWritersCount}
          pendingWithdrawalsCount={pendingWithdrawalsCount}
          currentAdmin={currentAdmin}
          adminTeamCount={adminTeam.length}
          onLogout={handleLogout}
        />

        {/* Right Main Content Area (offset by 260px on desktop) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
          {/* Top Sticky Header */}
          <Header
            onOpenMobileSidebar={() => setIsMobileDrawerOpen(true)}
            onNavigate={(screen) => setActiveScreen(screen)}
            onOpenAddBookModal={handleOpenAddBook}
            searchQuery={globalSearchQuery}
            onSearchChange={setGlobalSearchQuery}
            currentScreenTitle={screenTitles[activeScreen]}
            currentAdmin={currentAdmin}
            onLogout={handleLogout}
          />

          {/* Main Scrollable Canvas */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto overflow-y-auto">
            {/* Supabase Row-Level Security Banner */}
            {rlsWarning && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0 mt-0.5 md:mt-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-amber-950">
                        Supabase RLS Policy Notice: table "{rlsWarning.table}"
                      </p>
                      <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                        Saved Locally
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      Your novel/chapter is safely stored in browser storage. Supabase rejected cloud insert because Row-Level Security is active without policies for the anon key.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyRlsSql}
                    className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    {copiedRls ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRls ? 'Copied SQL!' : 'Copy SQL Fix'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveScreen('settings-ad-control')}
                    className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 rounded-xl text-xs font-bold transition-all"
                  >
                    View Guide
                  </button>

                  <button
                    type="button"
                    onClick={() => adminStore.clearRlsWarning()}
                    className="p-1.5 text-amber-800 hover:bg-amber-200/60 rounded-xl transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeScreen === 'dashboard' && (
              <DashboardView
                books={books}
                writers={writers}
                withdrawals={withdrawals}
                users={users}
                onNavigate={(screen) => setActiveScreen(screen)}
                onApproveWriter={handleApproveWriter}
                onApproveWithdrawal={handleApproveWithdrawal}
                onOpenAddBookModal={handleOpenAddBook}
              />
            )}

            {activeScreen === 'books' && (
              !adminStore.hasPermission('manage_books') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_books"
                  sectionTitle="Urdu Novels Directory"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <BooksView
                  books={books}
                  chapters={chapters}
                  authors={authors}
                  categories={categories}
                  onOpenAddBookModal={handleOpenAddBook}
                  onEditBook={handleEditBook}
                  onDeleteBook={handleDeleteBook}
                  onOpenAddChapterModal={handleOpenAddChapter}
                  onEditChapter={handleEditChapter}
                  onDeleteChapter={handleDeleteChapter}
                  onOpenAddPoetryModal={handleOpenAddPoetry}
                />
              )
            )}

            {activeScreen === 'poetry' && (
              !adminStore.hasPermission('manage_books') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_books"
                  sectionTitle="Urdu Poetry & Ash'aar"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <PoetryView
                  poetryList={poetry}
                  onOpenAddModal={handleOpenAddPoetry}
                  onDeletePoetry={handleDeletePoetry}
                />
              )
            )}

            {activeScreen === 'categories' && (
              !adminStore.hasPermission('manage_books') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_books"
                  sectionTitle="Genre & Categories"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <CategoriesView
                  categories={categories}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onNavigateToBooks={() => setActiveScreen('books')}
                />
              )
            )}

            {activeScreen === 'authors' && (
              !adminStore.hasPermission('manage_books') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_books"
                  sectionTitle="Authors & Novelists"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <AuthorsView
                  authors={authors}
                  onAddAuthor={handleAddAuthor}
                  onDeleteAuthor={handleDeleteAuthor}
                />
              )
            )}

            {activeScreen === 'writers-requests' && (
              !adminStore.hasPermission('approve_writers') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="approve_writers"
                  sectionTitle="Writers Submission Requests"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <WritersRequestsView
                  writers={writers}
                  onApprove={handleApproveWriter}
                  onReject={handleRejectWriter}
                />
              )
            )}

            {activeScreen === 'users' && (
              !adminStore.hasPermission('manage_users') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_users"
                  sectionTitle="Readers & Community"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <UsersView
                  users={users}
                  onUpdateUser={handleUpdateUser}
                  onAdjustPoints={handleAdjustPoints}
                />
              )
            )}

            {activeScreen === 'banners-popups' && (
              !adminStore.hasPermission('manage_monetization') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_monetization"
                  sectionTitle="Banners & Promotion Popups"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <BannersView
                  banners={banners}
                  books={books}
                  onAddBanner={handleAddBanner}
                  onToggleStatus={handleToggleBanner}
                  onDeleteBanner={handleDeleteBanner}
                />
              )
            )}

            {activeScreen === 'rewards-config' && (
              !adminStore.hasPermission('manage_rewards') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_rewards"
                  sectionTitle="Reward Points & Economy"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <RewardsConfigView
                  config={rewardsConfig}
                  onSaveConfig={handleSaveRewardsConfig}
                />
              )
            )}

            {activeScreen === 'withdrawal-requests' && (
              !adminStore.hasPermission('manage_withdrawals') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_withdrawals"
                  sectionTitle="Withdrawal Requests Queue"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <WithdrawalRequestsView
                  withdrawals={withdrawals}
                  onApprove={handleApproveWithdrawal}
                  onReject={handleRejectWithdrawal}
                  onBatchApprove={handleBatchApproveWithdrawals}
                />
              )
            )}

            {activeScreen === 'admin-team' && (
              <AdminTeamView
                adminTeam={adminTeam}
                currentAdmin={currentAdmin}
                onAddAdmin={handleAddAdmin}
                onUpdateAdmin={handleUpdateAdmin}
                onDeleteAdmin={handleDeleteAdmin}
                onSwitchCurrentAdmin={handleSwitchCurrentAdmin}
              />
            )}

            {activeScreen === 'settings-ad-control' && (
              !adminStore.hasPermission('manage_settings') ? (
                <AccessDeniedCard
                  currentAdmin={currentAdmin}
                  requiredPermission="manage_settings"
                  sectionTitle="Settings & Ad Control"
                  onNavigateBack={() => setActiveScreen('dashboard')}
                />
              ) : (
                <SettingsView
                  settings={adSettings}
                  onSaveSettings={handleSaveSettings}
                />
              )
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      {/* 1. Add / Edit Book Modal */}
      <AddBookModal
        key={editingBook ? `edit-book-${editingBook.id}-${bookModalSession}` : `new-book-${bookModalSession}`}
        isOpen={isAddBookModalOpen}
        onClose={() => {
          setIsAddBookModalOpen(false);
          setEditingBook(null);
        }}
        onSaveBook={handleSaveBook}
        authors={authors}
        categories={categories}
        existingBook={editingBook}
      />

      {/* 2. Chapter Editor (Screen 11) Modal */}
      {isChapterModalOpen && (activeBookForChapter || books[0]) && (
        <ChaptersEditorModal
          key={editingChapter ? `edit-ch-${editingChapter.id}-${chapterModalSession}` : `new-ch-${(activeBookForChapter || books[0]).id}-${chapterModalSession}`}
          isOpen={isChapterModalOpen}
          onClose={() => {
            setIsChapterModalOpen(false);
            setEditingChapter(null);
            setActiveBookForChapter(null);
          }}
          book={activeBookForChapter || books[0]}
          existingChapter={editingChapter}
          onSaveChapter={handleSaveChapter}
          nextChapterNo={
            (chapters.filter((c) => c.book_id === (activeBookForChapter?.id || books[0]?.id)).length || 0) + 1
          }
        />
      )}

      {/* 3. Add Poetry Modal */}
      <AddPoetryModal
        isOpen={isAddPoetryModalOpen}
        onClose={() => setIsAddPoetryModalOpen(false)}
        onSavePoetry={handleSavePoetry}
      />

      {/* 4. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemTitle={deleteTarget?.title}
        itemType={deleteTarget ? deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1) : undefined}
      />
    </div>
  );
}
