import React, { useState } from 'react';
import {
  Menu,
  Search,
  Users,
  Bell,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { NavigationScreen, AdminTeamMember } from '../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (screen: NavigationScreen) => void;
  onOpenAddBookModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentScreenTitle: string;
  currentAdmin?: AdminTeamMember;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onNavigate,
  onOpenAddBookModal,
  searchQuery,
  onSearchChange,
  currentScreenTitle,
  currentAdmin,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-20 bg-[#FFF8E7]/95 backdrop-blur-md border-b border-[#ebd7c2] px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left section: Hamburger button & Screen Title */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        <button
          id="hamburger-menu-btn"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar menu"
          className="lg:hidden p-2 rounded-xl bg-white border border-[#ead4ba] text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white transition-colors shadow-xs"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg lg:text-xl font-bold text-[#2D1A1A] flex items-center gap-2">
            <span>{currentScreenTitle}</span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/20">
              Urdu Library
            </span>
          </h2>
          <p className="hidden md:block text-[11px] text-[#786161]">
            Kitabistan Digital Catalog & Reader Economy
          </p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-3 lg:mx-6 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8B1E3F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-header-search-input"
            type="text"
            placeholder="Search novels, authors, readers, or payout requests..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#ebd7c2] rounded-xl text-[#2D1A1A] placeholder-[#947d7d] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 focus:border-[#8B1E3F] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons & Admin Profile */}
      <div className="flex items-center space-x-2.5 lg:space-x-3.5">
        {/* Active Readers live counter badge */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-semibold">Active Readers: <span className="font-bold">14.2K</span></span>
        </div>

        {/* Quick Add Novel button */}
        <button
          id="header-add-novel-btn"
          onClick={onOpenAddBookModal}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-semibold hover:bg-[#721733] transition-all shadow-sm shadow-[#8B1E3F]/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-[#FF8C00]" />
          <span className="hidden md:inline">Add New Novel</span>
        </button>

        {/* Notifications Icon with red dot */}
        <button
          id="header-notifications-btn"
          onClick={() => onNavigate('writers-requests')}
          title="13 Pending Editorial Reviews"
          className="relative p-2 rounded-xl bg-white border border-[#ebd7c2] text-[#2D1A1A] hover:bg-[#8B1E3F]/5 transition-colors shadow-xs"
        >
          <Bell className="w-4 h-4 text-[#8B1E3F]" />
          <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF8C00] ring-2 ring-white"></span>
        </button>

        {/* Admin Avatar & Role */}
        <div
          onClick={() => onNavigate('admin-team')}
          className="flex items-center space-x-2.5 pl-1.5 sm:pl-2.5 py-1 pr-2 rounded-xl bg-white border border-[#ebd7c2] hover:border-[#8B1E3F] transition-colors cursor-pointer shadow-xs group"
          title="Admin Profile & Role Permissions"
        >
          <div className="relative">
            <img
              src={currentAdmin?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={currentAdmin?.name || 'Admin'}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#8B1E3F]/30"
            />
            <span className="absolute -top-1 -right-1 bg-[#FF8C00] text-white p-0.5 rounded-full ring-1 ring-white">
              <ShieldCheck className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-[#2D1A1A] group-hover:text-[#8B1E3F] transition-colors truncate max-w-[120px]">
              {currentAdmin?.name || 'Abdullah Aziz'}
            </p>
            <p className="text-[10px] text-[#786161] font-medium flex items-center gap-1">
              <span>{currentAdmin?.role || 'Super Admin'}</span>
              <Sparkles className="w-2.5 h-2.5 text-[#FF8C00]" />
            </p>
          </div>
        </div>

        {/* Header Quick Logout */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-white border border-[#ebd7c2] text-gray-500 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50 transition-colors shadow-xs"
            title="Log Out of Admin Panel"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
