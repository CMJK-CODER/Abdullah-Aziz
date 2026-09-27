import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Key,
  Shield,
  Sparkles,
  Users,
  BookOpen,
  FileCheck,
  Coins,
  Banknote,
  Sliders,
  Database,
  Info,
  X,
  Lock,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import {
  AdminTeamMember,
  AdminRole,
  AdminPermissions,
  ROLE_DEFAULT_PERMISSIONS
} from '../types';

interface AdminTeamViewProps {
  adminTeam: AdminTeamMember[];
  currentAdmin: AdminTeamMember;
  onAddAdmin: (member: Omit<AdminTeamMember, 'id' | 'created_at' | 'last_login'>) => void;
  onUpdateAdmin: (id: string, updates: Partial<AdminTeamMember>) => void;
  onDeleteAdmin: (id: string) => void;
  onSwitchCurrentAdmin: (id: string) => void;
}

const ALL_PERMISSIONS_CONFIG: {
  key: keyof AdminPermissions;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'content' | 'users_finance' | 'system';
}[] = [
  {
    key: 'manage_books',
    label: 'Novels & Chapters',
    description: 'Create, edit, publish, and delete books, chapters, and categories.',
    icon: BookOpen,
    category: 'content'
  },
  {
    key: 'approve_writers',
    label: 'Writer Applications',
    description: 'Review and approve/reject writer manuscript submissions.',
    icon: FileCheck,
    category: 'content'
  },
  {
    key: 'manage_users',
    label: 'Reader Moderation',
    description: 'Inspect reader member accounts and manually adjust points.',
    icon: Users,
    category: 'users_finance'
  },
  {
    key: 'manage_rewards',
    label: 'Rewards Economy',
    description: 'Modify point conversion rates (PKR) and minimum withdrawal hurdles.',
    icon: Coins,
    category: 'users_finance'
  },
  {
    key: 'manage_withdrawals',
    label: 'Financial Payouts',
    description: 'Approve or reject JazzCash / Easypaisa cash disbursement requests.',
    icon: Banknote,
    category: 'users_finance'
  },
  {
    key: 'manage_monetization',
    label: 'AdMob & Banners',
    description: 'Configure AdMob unit IDs, interstitial intervals, and banner popups.',
    icon: Sliders,
    category: 'system'
  },
  {
    key: 'manage_team',
    label: 'Staff & Roles',
    description: 'Invite new admins, managers, editors, and assign security roles.',
    icon: ShieldCheck,
    category: 'system'
  },
  {
    key: 'manage_settings',
    label: 'Database & Supabase',
    description: 'Manage Supabase keys, run cloud sync, or wipe data.',
    icon: Database,
    category: 'system'
  }
];

const ROLE_BADGE_STYLES: Record<AdminRole, { bg: string; text: string; border: string }> = {
  'Super Admin': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300'
  },
  Admin: {
    bg: 'bg-[#8B1E3F]/10',
    text: 'text-[#8B1E3F]',
    border: 'border-[#8B1E3F]/30'
  },
  Manager: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-300'
  },
  Editor: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300'
  },
  Moderator: {
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-300'
  }
};

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
];

export const AdminTeamView: React.FC<AdminTeamViewProps> = ({
  adminTeam,
  currentAdmin,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onSwitchCurrentAdmin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminTeamMember | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: AdminRole;
    status: 'Active' | 'Suspended' | 'Pending';
    avatar_url: string;
    permissions: AdminPermissions;
    notes: string;
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'Editor',
    status: 'Active',
    avatar_url: DEFAULT_AVATARS[0],
    permissions: { ...ROLE_DEFAULT_PERMISSIONS['Editor'] },
    notes: ''
  });

  const canManageTeam = currentAdmin.role === 'Super Admin' || currentAdmin.permissions.manage_team;

  // Filtered members list
  const filteredTeam = useMemo(() => {
    return adminTeam.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.notes && member.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [adminTeam, searchQuery, roleFilter, statusFilter]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Manager',
      status: 'Active',
      avatar_url: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      permissions: { ...ROLE_DEFAULT_PERMISSIONS['Manager'] },
      notes: ''
    });
    setEditingAdmin(null);
    setIsAddModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (member: AdminTeamMember) => {
    setEditingAdmin(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      status: member.status,
      avatar_url: member.avatar_url,
      permissions: { ...member.permissions },
      notes: member.notes || ''
    });
    setIsAddModalOpen(true);
  };

  // When changing role, auto-fill default permissions for that role
  const handleRoleChange = (newRole: AdminRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: { ...ROLE_DEFAULT_PERMISSIONS[newRole] }
    }));
  };

  // Toggle individual permission checkbox
  const handleTogglePermission = (key: keyof AdminPermissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  // Submit form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingAdmin) {
      onUpdateAdmin(editingAdmin.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        status: formData.status,
        avatar_url: formData.avatar_url.trim() || DEFAULT_AVATARS[0],
        permissions: formData.permissions,
        notes: formData.notes.trim() || undefined
      });
    } else {
      onAddAdmin({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        status: formData.status,
        avatar_url: formData.avatar_url.trim() || DEFAULT_AVATARS[0],
        permissions: formData.permissions,
        assigned_by: currentAdmin.name,
        notes: formData.notes.trim() || undefined
      });
    }

    setIsAddModalOpen(false);
    setEditingAdmin(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2D1A1A] font-serif">
              Admin Team & Role Permissions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/20">
              RBAC Control
            </span>
          </div>
          <p className="text-xs text-[#786161] mt-1">
            Manage administrative staff, assign role permissions (Super Admin, Manager, Editor, Moderator), and govern system access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#ead4ba] hover:bg-[#FFF8E7] text-xs font-semibold text-[#2D1A1A] transition-all shadow-xs flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>{showMatrix ? 'Hide Role Matrix' : 'Role Matrix Guide'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            disabled={!canManageTeam}
            className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
              canManageTeam
                ? 'bg-[#8B1E3F] hover:bg-[#721733]'
                : 'bg-gray-400 cursor-not-allowed opacity-70'
            }`}
            title={canManageTeam ? 'Add New Staff Member' : 'Requires Super Admin / Manage Team permission'}
          >
            <UserPlus className="w-4 h-4 text-[#FF8C00]" />
            <span>Add Admin / Manager</span>
          </button>
        </div>
      </div>

      {/* Role Simulation / Active Admin Switcher Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4A1025] to-[#721733] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <img
              src={currentAdmin.avatar_url}
              alt={currentAdmin.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-[#FF8C00] shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-[#4A1025]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#e8b4c2] font-medium uppercase tracking-wider">
                Current Active Session:
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                ROLE_BADGE_STYLES[currentAdmin.role].bg
              } ${ROLE_BADGE_STYLES[currentAdmin.role].text}`}>
                {currentAdmin.role}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{currentAdmin.name}</span>
              <span className="text-xs font-normal text-white/70">({currentAdmin.email})</span>
            </h3>
            <p className="text-[11px] text-white/70 mt-0.5">
              {currentAdmin.role === 'Super Admin'
                ? 'You have unrestricted access to all chapters, writers, payouts, ads, and Supabase settings.'
                : `Permissions: ${Object.entries(currentAdmin.permissions)
                    .filter(([, val]) => val)
                    .map(([k]) => k.replace('manage_', ''))
                    .join(', ')}`}
            </p>
          </div>
        </div>

        {/* Quick Switcher dropdown to test roles */}
        <div className="flex items-center gap-2.5 bg-black/20 p-2 rounded-xl border border-white/10 self-start md:self-auto">
          <Key className="w-4 h-4 text-[#FF8C00] shrink-0" />
          <div className="text-left">
            <label htmlFor="active-admin-select" className="block text-[10px] text-white/70 font-semibold uppercase">
              Switch Admin Profile (Test Roles):
            </label>
            <select
              id="active-admin-select"
              value={currentAdmin.id}
              onChange={(e) => onSwitchCurrentAdmin(e.target.value)}
              className="mt-0.5 bg-white text-[#2D1A1A] font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
            >
              {adminTeam.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.role} {member.status === 'Suspended' ? '(Suspended)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Role Matrix Guide (Collapsible) */}
      {showMatrix && (
        <div className="p-5 rounded-2xl bg-white border border-[#ead4ba] shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#8B1E3F]" />
              <h3 className="text-sm font-bold text-[#2D1A1A]">Default Role Permission Matrix</h3>
            </div>
            <span className="text-xs text-gray-500">Preset permissions can be customized per staff member</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#f0e4d7] bg-[#FFF8E7]/50 text-[#512900]">
                  <th className="py-2.5 px-3 font-bold">Permission / Power</th>
                  <th className="py-2.5 px-3 text-center font-bold text-amber-800">Super Admin</th>
                  <th className="py-2.5 px-3 text-center font-bold text-[#8B1E3F]">Admin</th>
                  <th className="py-2.5 px-3 text-center font-bold text-indigo-700">Manager</th>
                  <th className="py-2.5 px-3 text-center font-bold text-emerald-700">Editor</th>
                  <th className="py-2.5 px-3 text-center font-bold text-sky-700">Moderator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7ede2]">
                {ALL_PERMISSIONS_CONFIG.map((perm) => {
                  const Icon = perm.icon;
                  return (
                    <tr key={perm.key} className="hover:bg-[#FFFDF9]">
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-3.5 h-3.5 text-[#8B1E3F]" />
                          <div>
                            <span className="font-bold text-[#2D1A1A]">{perm.label}</span>
                            <p className="text-[10px] text-gray-500">{perm.description}</p>
                          </div>
                        </div>
                      </td>
                      {(['Super Admin', 'Admin', 'Manager', 'Editor', 'Moderator'] as AdminRole[]).map((r) => {
                        const allowed = ROLE_DEFAULT_PERMISSIONS[r][perm.key];
                        return (
                          <td key={r} className="py-2 px-3 text-center">
                            {allowed ? (
                              <span className="inline-flex p-1 rounded-md bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex p-1 rounded-md bg-gray-100 text-gray-400">
                                <XCircle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Total Staff</span>
            <Users className="w-4 h-4 text-[#8B1E3F]" />
          </div>
          <p className="text-xl font-bold text-[#2D1A1A]">{adminTeam.length}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
            {adminTeam.filter((m) => m.status === 'Active').length} Active Accounts
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Super Admins</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-[#2D1A1A]">
            {adminTeam.filter((m) => m.role === 'Super Admin').length}
          </p>
          <p className="text-[10px] text-amber-700 font-medium mt-0.5">Master Root Access</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Content Managers</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-[#2D1A1A]">
            {adminTeam.filter((m) => m.role === 'Manager' || m.role === 'Editor').length}
          </p>
          <p className="text-[10px] text-indigo-700 font-medium mt-0.5">Books & Manuscripts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Financial Handlers</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-[#2D1A1A]">
            {adminTeam.filter((m) => m.permissions.manage_withdrawals).length}
          </p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Disbursement Rights</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B1E3F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, role, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-[#2D1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#ebd7c2] rounded-xl text-[#2D1A1A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
          >
            <option value="all">All Roles ({adminTeam.length})</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Editor">Editor</option>
            <option value="Moderator">Moderator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#ebd7c2] rounded-xl text-[#2D1A1A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Team Members List / Table */}
      <div className="rounded-2xl bg-white border border-[#ead4ba] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#ebd7c2] bg-[#FFF8E7] text-[#512900]">
                <th className="py-3 px-4 font-bold">Admin Member</th>
                <th className="py-3 px-3 font-bold">Assigned Role</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold">Active Permissions</th>
                <th className="py-3 px-3 font-bold">Contact / Notes</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5ebdf]">
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    <p className="font-semibold text-sm">No admin team members found.</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member) => {
                  const isCurrent = member.id === currentAdmin.id;
                  const isMasterSuperAdmin = member.role === 'Super Admin';
                  const activePermsCount = Object.values(member.permissions).filter(Boolean).length;

                  return (
                    <tr
                      key={member.id}
                      className={`transition-colors ${
                        isCurrent ? 'bg-[#8B1E3F]/5 border-l-4 border-[#8B1E3F]' : 'hover:bg-[#FFFDF9]'
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#2D1A1A] truncate text-sm">
                                {member.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#8B1E3F] text-white">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span>{member.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1 ${
                            ROLE_BADGE_STYLES[member.role].bg
                          } ${ROLE_BADGE_STYLES[member.role].text} ${
                            ROLE_BADGE_STYLES[member.role].border
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{member.role}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            member.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : member.status === 'Suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>

                      {/* Permissions Summary */}
                      <td className="py-3 px-3">
                        <div className="space-y-1 max-w-xs">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#2D1A1A]">
                            <span>{activePermsCount} of 8 powers active</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {member.permissions.manage_books && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-medium">
                                Books
                              </span>
                            )}
                            {member.permissions.approve_writers && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[9px] font-medium">
                                Writers
                              </span>
                            )}
                            {member.permissions.manage_withdrawals && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[9px] font-medium">
                                Payouts
                              </span>
                            )}
                            {member.permissions.manage_team && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[9px] font-medium">
                                Staff
                              </span>
                            )}
                            {member.permissions.manage_settings && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200 text-[9px] font-medium">
                                DB
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact / Notes */}
                      <td className="py-3 px-3 text-[11px] text-gray-600">
                        {member.phone && (
                          <p className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{member.phone}</span>
                          </p>
                        )}
                        {member.notes ? (
                          <p className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">
                            "{member.notes}"
                          </p>
                        ) : (
                          <span className="text-[10px] text-gray-400">No notes</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Quick Switch */}
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => onSwitchCurrentAdmin(member.id)}
                              className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-[#8B1E3F] hover:text-white text-gray-700 text-[10px] font-bold transition-colors"
                              title="Act as this admin to test permissions"
                            >
                              Act As
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(member)}
                            disabled={!canManageTeam}
                            className={`p-1.5 rounded-lg transition-colors ${
                              canManageTeam
                                ? 'hover:bg-gray-100 text-gray-600 hover:text-[#8B1E3F]'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title="Edit Role & Permissions"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button (guarded for super admin) */}
                          <button
                            type="button"
                            onClick={() => onDeleteAdmin(member.id)}
                            disabled={!canManageTeam || (isMasterSuperAdmin && adminTeam.filter((m) => m.role === 'Super Admin').length <= 1)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              canManageTeam && !(isMasterSuperAdmin && adminTeam.filter((m) => m.role === 'Super Admin').length <= 1)
                                ? 'hover:bg-rose-50 text-gray-400 hover:text-rose-600'
                                : 'text-gray-200 cursor-not-allowed'
                            }`}
                            title={
                              isMasterSuperAdmin && adminTeam.filter((m) => m.role === 'Super Admin').length <= 1
                                ? 'Cannot delete the only Super Admin'
                                : 'Remove Admin'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#ead4ba] my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#FFF8E7] border-b border-[#ebd7c2] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#8B1E3F] text-white">
                  <ShieldCheck className="w-5 h-5 text-[#FF8C00]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D1A1A]">
                    {editingAdmin ? 'Edit Admin Role & Permissions' : 'Add New Admin / Manager'}
                  </h3>
                  <p className="text-xs text-[#786161]">
                    Assign roles, fine-tune access controls, and designate operational responsibilities.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-500 hover:text-[#2D1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-5">
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Ullah, Fatima Noor"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#ebd7c2] rounded-xl text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. asad@kitabnagri.pk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#ebd7c2] rounded-xl text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#ebd7c2] rounded-xl text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#ebd7c2] rounded-xl text-[#2D1A1A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  >
                    <option value="Active">Active (Full Access)</option>
                    <option value="Suspended">Suspended (Access Revoked)</option>
                    <option value="Pending">Pending Verification</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Role Selector with Visual Explainer */}
              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                  Select System Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['Super Admin', 'Admin', 'Manager', 'Editor', 'Moderator'] as AdminRole[]).map((role) => {
                    const isSelected = formData.role === role;
                    return (
                      <div
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#8B1E3F]/10 border-[#8B1E3F] shadow-xs ring-1 ring-[#8B1E3F]'
                            : 'bg-[#FFFDF9] border-[#ead4ba] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#8B1E3F]' : 'text-[#2D1A1A]'}`}>
                            {role}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#8B1E3F]" />}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-snug">
                          {role === 'Super Admin' && 'Master unrestricted root control over entire platform.'}
                          {role === 'Admin' && 'Full catalog, payouts, and readers management.'}
                          {role === 'Manager' && 'Organizes books, chapters, and author requests.'}
                          {role === 'Editor' && 'Composes chapters and uploads Nastaleeq / PDFs.'}
                          {role === 'Moderator' && 'Reader points and reviews moderation.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Fine-Grained Permissions Checkboxes */}
              <div className="p-4 rounded-2xl bg-[#FFF8E7]/60 border border-[#ebd7c2] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D1A1A] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#8B1E3F]" />
                    <span>Granular Permission Toggles</span>
                  </span>
                  <span className="text-[10px] text-[#786161]">
                    Checked powers are active for this account
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_PERMISSIONS_CONFIG.map((perm) => {
                    const isChecked = formData.permissions[perm.key];
                    const Icon = perm.icon;
                    return (
                      <label
                        key={perm.key}
                        className={`p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-white border-[#8B1E3F]/40 shadow-2xs'
                            : 'bg-white/50 border-gray-200 opacity-70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.key)}
                          className="mt-0.5 rounded text-[#8B1E3F] focus:ring-[#8B1E3F]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3 text-[#8B1E3F]" />
                            <span className="text-xs font-bold text-[#2D1A1A]">{perm.label}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Notes & Department */}
              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Department / Operational Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lead Urdu translator, handles author royalties and Easypaisa settlement..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#ebd7c2] rounded-xl text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#ebd7c2]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FF8C00]" />
                  <span>{editingAdmin ? 'Save Role & Permissions' : 'Create Admin Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
