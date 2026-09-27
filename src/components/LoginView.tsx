import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  KeyRound,
  AlertCircle,
  Feather,
  CheckCircle2
} from 'lucide-react';
import { AdminTeamMember } from '../types';

interface LoginViewProps {
  onLogin: (usernameOrEmail: string, password: string) => { success: boolean; message: string };
  availableAccounts: AdminTeamMember[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, availableAccounts }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('abdullah');
  const [password, setPassword] = useState('admin12345');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!usernameOrEmail.trim()) {
      setErrorMsg('Please enter your username or email');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = onLogin(usernameOrEmail, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 350);
  };

  const handleQuickLogin = (account: AdminTeamMember) => {
    const userVal = account.username || account.email;
    const passVal = account.password || 'admin12345';
    setUsernameOrEmail(userVal);
    setPassword(passVal);
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      onLogin(userVal, passVal);
      setIsLoading(false);
    }, 200);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] via-[#f7ebd7] to-[#eddac2] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#8B1E3F] selection:text-white">
      <div className="max-w-4xl w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-1 bg-transparent mb-3">
            <img
              src="/logo.jpg"
              alt="Kitabistan Logo"
              className="w-20 h-20 rounded-3xl object-cover shadow-xl shadow-[#8B1E3F]/30 border-2 border-amber-400/40"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#2D1A1A] font-serif">
            Kitabistan Admin
          </h1>
          <p className="text-base font-urdu text-[#8B1E3F] font-bold mt-1 tracking-wide">
            کتابستان ایڈمن پورٹل — اردو ناولز مینیجمنٹ سسٹم
          </p>
          <p className="text-xs text-[#786161] max-w-md mx-auto mt-2">
            Secure portal for Urdu novels publishing, writer manuscript reviews, and telecom rewards disbursement.
          </p>
        </div>

        {/* Main Grid: Login Box on Left/Top, Available Accounts on Right/Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Login Form Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#ebd7c2] shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#2D1A1A]">Sign In to Portal</h2>
                <p className="text-xs text-[#786161]">Enter credentials to access your dashboard</p>
              </div>
              <span className="p-2 rounded-xl bg-[#8B1E3F]/10 text-[#8B1E3F]">
                <KeyRound className="w-5 h-5" />
              </span>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username or Email Input */}
              <div>
                <label className="block text-xs font-semibold text-[#2D1A1A] mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g. abdullah or lashari14abdullah@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 focus:border-[#8B1E3F] transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2D1A1A]">Password</label>
                  <span className="text-[11px] text-[#8B1E3F] font-medium">Default: admin12345</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 focus:border-[#8B1E3F] transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-[#554242] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#8B1E3F] focus:ring-[#8B1E3F] border-gray-300"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                  Role-Based Access
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#8B1E3F] hover:bg-[#721833] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#8B1E3F]/25 flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying session...</span>
                  </div>
                ) : (
                  <>
                    <span>Log In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#786161]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted RBAC Guard</span>
              </span>
              <span>Kitabistan v2.5</span>
            </div>
          </div>

          {/* Accounts & Passwords Cheat Sheet */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#ebd7c2] shadow-sm p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#2D1A1A] flex items-center gap-2">
                    <span>Available Admin Accounts & Passwords</span>
                    <Sparkles className="w-4 h-4 text-[#FF8C00]" />
                  </h3>
                  <p className="text-xs text-[#786161]">
                    Click <strong>"Quick Login"</strong> on any account to immediately test their specific permissions.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {availableAccounts.map((account) => {
                  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
                    'Super Admin': { bg: 'bg-[#8B1E3F]/10', text: 'text-[#8B1E3F]', border: 'border-[#8B1E3F]/30' },
                    Admin: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
                    Manager: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                    Editor: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                    Moderator: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' }
                  };
                  const styling = roleColors[account.role] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
                  const userHandle = account.username || account.email.split('@')[0];
                  const userPassword = account.password || 'admin12345';

                  return (
                    <div
                      key={account.id}
                      className="p-3.5 rounded-xl border border-gray-200/90 bg-stone-50/70 hover:bg-white hover:border-[#8B1E3F]/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Member Info */}
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={account.avatar_url}
                            alt={account.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-[#2D1A1A] truncate">{account.name}</p>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styling.bg} ${styling.text} ${styling.border}`}
                              >
                                {account.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#786161] truncate font-mono">{account.email}</p>
                          </div>
                        </div>

                        {/* Quick Login Action */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(account)}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                          title={`Log in as ${account.name} (${account.role})`}
                        >
                          <span>Quick Login</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Credentials Display */}
                      <div className="mt-3 pt-2.5 border-t border-gray-200/60 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                          <span className="text-gray-500 text-[10px]">User:</span>
                          <span className="font-mono font-semibold text-gray-800 truncate max-w-[90px]">{userHandle}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(userHandle, `user-${account.id}`)}
                            className="text-gray-400 hover:text-[#8B1E3F] p-0.5"
                            title="Copy Username"
                          >
                            {copiedField === `user-${account.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                          <span className="text-gray-500 text-[10px]">Pass:</span>
                          <span className="font-mono font-semibold text-gray-800">{userPassword}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(userPassword, `pass-${account.id}`)}
                            className="text-gray-400 hover:text-[#8B1E3F] p-0.5"
                            title="Copy Password"
                          >
                            {copiedField === `pass-${account.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
                <Feather className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <p>
                  <strong>Role Note:</strong> Logging in as <strong>Editor</strong> allows novel & chapter editing but locks payouts. Logging in as <strong>Super Admin</strong> grants complete master access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
