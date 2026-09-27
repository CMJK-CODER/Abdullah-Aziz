import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { adminStore } from '../services/supabase';
import { AdminTeamMember } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (member: AdminTeamMember) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('abdullah');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('Please enter your username or email');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials against adminStore adminTeam list
      const result = adminStore.login(username.trim(), password);

      setIsLoading(false);
      if (result.success && result.member) {
        onLoginSuccess(result.member);
      } else {
        setErrorMsg(result.message || 'Invalid credentials. Please verify your username and password.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#8B1E3F] selection:text-white">
      {/* Decorative background blurs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8B1E3F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FF8C00]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <div className="inline-flex items-center justify-center p-1 bg-transparent mb-3">
          <img
            src="/logo.jpg"
            alt="Kitabistan Logo"
            className="w-24 h-24 rounded-3xl object-cover shadow-2xl shadow-[#8B1E3F]/40 border-2 border-amber-400/40"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-[#2D1A1A] tracking-tight font-serif">
          Kitabistan <span className="text-[#8B1E3F] font-urdu">کتابستان</span>
        </h1>
        <p className="text-sm font-medium text-[#786161] mt-1">
          Editorial & Administrative Management Portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-amber-950/5 rounded-3xl border border-[#ebd7c2]/80">
          <div className="flex items-center justify-between pb-5 border-b border-[#ebd7c2] mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#2D1A1A]">Admin Sign In</h2>
              <p className="text-xs text-gray-500">Access your role-based publishing tools</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              RBAC Protected
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                Username or Email
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="admin-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. abdullah or admin@kitabnagri.pk"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#FFFDF9] text-xs sm:text-sm text-[#2D1A1A] rounded-xl border border-[#ebd7c2] focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#2D1A1A]">
                  Password
                </label>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-[#FFFDF9] text-xs sm:text-sm text-[#2D1A1A] rounded-xl border border-[#ebd7c2] focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/20 focus:outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs sm:text-sm font-bold text-white bg-[#8B1E3F] hover:bg-[#721833] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B1E3F] transition-all disabled:opacity-50 cursor-pointer group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In to Admin Panel
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Kitabistan Supabase Cloud Synchronized
        </p>
      </div>
    </div>
  );
};
