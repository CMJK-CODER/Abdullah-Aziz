import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Feather,
  FileText,
  Users,
  Image as ImageIcon,
  Coins,
  Banknote,
  Settings,
  X,
  Sparkles,
  BookMarked,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { NavigationScreen, AdminTeamMember } from '../types';

interface SidebarProps {
  currentScreen: NavigationScreen;
  onSelectScreen: (screen: NavigationScreen) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingWritersCount: number;
  pendingWithdrawalsCount: number;
  currentAdmin?: AdminTeamMember;
  adminTeamCount?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  isOpenMobile,
  onCloseMobile,
  pendingWritersCount,
  pendingWithdrawalsCount,
  currentAdmin,
  adminTeamCount,
  onLogout
}) => {
  const menuItems: {
    id: NavigationScreen;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'poetry', label: 'Poetry / اشعار', icon: Sparkles },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'authors', label: 'Authors', icon: Feather },
    {
      id: 'writers-requests',
      label: 'Writers Requests',
      icon: FileText,
      badge: pendingWritersCount,
      badgeColor: 'bg-[#FF8C00] text-white'
    },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'banners-popups', label: 'Banners / Popups', icon: ImageIcon },
    { id: 'rewards-config', label: 'Rewards Config', icon: Coins },
    {
      id: 'withdrawal-requests',
      label: 'Withdrawal Requests',
      icon: Banknote,
      badge: pendingWithdrawalsCount,
      badgeColor: 'bg-[#FF8C00] text-white'
    },
    {
      id: 'admin-team',
      label: 'Admin Team & Roles',
      icon: ShieldCheck,
      badge: adminTeamCount,
      badgeColor: 'bg-[#FF8C00] text-white'
    },
    { id: 'settings-ad-control', label: 'Settings / Ad Control', icon: Settings }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#4A1025] text-white select-none border-r border-[#380b1b]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#5e1832] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.jpg"
            alt="Kitabistan Logo"
            className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-black/30 border border-amber-400/30"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-lg font-bold tracking-tight text-white font-serif">Kitabistan</h1>
              <span className="font-urdu text-sm text-[#FFB703] font-bold">کتابستان</span>
            </div>
            <p className="text-[10px] text-[#e8b4c2] font-medium tracking-wider uppercase">Admin Portal</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          id="close-mobile-sidebar-btn"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Production Status Banner */}
      <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-[#390b1c] border border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-white/90">Library Engine</span>
        </div>
        <span className="text-[10px] bg-white/10 text-emerald-300 font-mono px-1.5 py-0.5 rounded">v2.4 ONLINE</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-1.5 text-[10px] uppercase font-bold text-white/40 tracking-wider">
          Library Management
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              id={`sidebar-nav-${item.id}`}
              key={item.id}
              onClick={() => {
                onSelectScreen(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#8B1E3F] text-white shadow-md shadow-[#8B1E3F]/30 font-semibold border-l-4 border-[#FF8C00]'
                  : 'text-white/80 hover:bg-white/8 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-white/70'
                  }`}
                />
                <span className="tracking-wide text-left">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                    item.badgeColor || 'bg-[#8B1E3F] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Storage/Supabase Status Badge */}
      <div className="px-4 py-2 border-t border-[#5e1832] bg-[#390b1c]">
        <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8C00]" />
            <span>Supabase Sync</span>
          </span>
          <span className="text-[#FF8C00] font-semibold">Active</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF8C00] to-emerald-400 h-1.5 rounded-full w-[84%]"></div>
        </div>
      </div>

      {/* Admin User Footer Card */}
      <div className="p-3 border-t border-[#5e1832] bg-[#420e21]">
        <div className="flex items-center justify-between gap-1">
          <div
            onClick={() => onSelectScreen('admin-team')}
            className="flex-1 flex items-center space-x-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer min-w-0"
            title="Manage Team & Roles"
          >
            <div className="relative shrink-0">
              <img
                src={currentAdmin?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={currentAdmin?.name || 'Admin'}
                className="w-8 h-8 rounded-xl object-cover border border-white/20"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#4A1025]"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentAdmin?.name || 'Abdullah Aziz'}
              </p>
              <p className="text-[10px] text-[#FF8C00] font-medium truncate flex items-center gap-1">
                <span>{currentAdmin?.role || 'Super Admin'}</span>
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors shrink-0"
              title="Log Out of Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer container */}
          <div className="relative w-72 max-w-[85%] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
