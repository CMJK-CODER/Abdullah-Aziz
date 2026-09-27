import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  Coins,
  Bookmark,
  BookOpen,
  UserCheck,
  UserX,
  Plus,
  Minus,
  X,
  Sparkles,
  Award
} from 'lucide-react';
import { UserMember } from '../types';

interface UsersViewProps {
  users: UserMember[];
  onUpdateUser: (id: string, updates: Partial<UserMember>) => void;
  onAdjustPoints: (id: string, deltaPoints: number) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onUpdateUser,
  onAdjustPoints
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedUserForPoints, setSelectedUserForPoints] = useState<UserMember | null>(null);
  const [pointDeltaInput, setPointDeltaInput] = useState<number>(500);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name_urdu && u.name_urdu.includes(searchQuery));
    const matchesTier = tierFilter === 'all' || u.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleConfirmPoints = (isAddition: boolean) => {
    if (selectedUserForPoints) {
      const delta = isAddition ? Math.abs(pointDeltaInput) : -Math.abs(pointDeltaInput);
      onAdjustPoints(selectedUserForPoints.id, delta);
      setSelectedUserForPoints(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#2D1A1A]">Registered Readers & Community</h1>
          <p className="text-xs text-[#786161]">
            Manage user profiles, readership loyalty tiers, rewarded coins, and access permissions
          </p>
        </div>
      </div>

      {/* 4 Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Total Readers</p>
          <p className="text-2xl font-black text-[#2D1A1A] mt-1">{users.length}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {users.length > 0 ? `${users.length} accounts created` : 'No registered users yet'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Active Readers</p>
          <p className="text-2xl font-black text-[#8B1E3F] mt-1">
            {users.filter((u) => u.status === 'active').length}
          </p>
          <p className="text-[11px] text-[#786161] mt-0.5">Active status accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Gold Readers</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {users.filter((u) => u.tier === 'Gold Reader').length}
          </p>
          <p className="text-[11px] text-[#786161] mt-0.5">50+ chapters read tier</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">VIP Scholars</p>
          <p className="text-2xl font-black text-[#FF8C00] mt-1">
            {users.filter((u) => u.tier === 'VIP Scholar').length}
          </p>
          <p className="text-[11px] text-[#786161] mt-0.5">Subscribed patrons</p>
        </div>
      </div>

      {/* Search & Tier Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8B1E3F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search readers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs font-medium text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
        >
          <option value="all">All Reader Tiers</option>
          <option value="Standard">Standard</option>
          <option value="Gold Reader">Gold Reader</option>
          <option value="Avid Reader">Avid Reader</option>
          <option value="VIP Scholar">VIP Scholar</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#ead4ba] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8E7] text-[#574141] font-bold border-b border-[#ebd7c2]">
              <tr>
                <th className="py-3.5 px-4">Reader Profile</th>
                <th className="py-3.5 px-3">Loyalty Tier</th>
                <th className="py-3.5 px-3">Reading Stats</th>
                <th className="py-3.5 px-3">Points Balance</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4ebe1]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#786161]">
                    <Users className="w-10 h-10 text-[#ebd7c2] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#2D1A1A]">No readers found</p>
                    <p className="text-xs text-[#786161] mt-0.5">
                      {users.length === 0
                        ? 'New reader profiles will automatically appear here as users sign in to the Kitabistan app.'
                        : 'No readers match your search query or filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FFFDF9] transition-colors">
                  {/* Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-[#2D1A1A] truncate">{u.name}</p>
                          {u.name_urdu && (
                            <span className="font-urdu text-[11px] text-[#8B1E3F] truncate">
                              ({u.name_urdu})
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        u.tier === 'VIP Scholar'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : u.tier === 'Gold Reader'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : u.tier === 'Avid Reader'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {u.tier}
                    </span>
                  </td>

                  {/* Stats */}
                  <td className="py-3.5 px-3 text-[#2D1A1A]">
                    <p className="font-semibold">{u.chapters_read} Chapters Read</p>
                    <p className="text-[10px] text-gray-500">{u.bookmarks_count} Bookmarks saved</p>
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-1 font-bold text-[#8B1E3F]">
                      <Coins className="w-3.5 h-3.5 text-[#FF8C00]" />
                      <span>{u.points_balance.toLocaleString()} Pts</span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      ≈ Rs. {(u.points_balance / 100).toFixed(0)} PKR
                    </p>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-3">
                    {u.is_admin ? (
                      <span className="px-2 py-0.5 rounded bg-[#4A1025] text-white text-[10px] font-bold">
                        Super Admin
                      </span>
                    ) : u.is_writer ? (
                      <span className="px-2 py-0.5 rounded bg-[#8B1E3F]/10 text-[#8B1E3F] text-[10px] font-bold">
                        Author
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[11px]">Reader</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setSelectedUserForPoints(u)}
                        className="px-2.5 py-1 bg-[#FFF8E7] hover:bg-[#ebd7c2] text-[#8B1E3F] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Coins className="w-3.5 h-3.5 text-[#FF8C00]" />
                        <span>Adjust Pts</span>
                      </button>

                      <button
                        onClick={() =>
                          onUpdateUser(u.id, {
                            status: u.status === 'active' ? 'suspended' : 'active'
                          })
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.status === 'active'
                            ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                      >
                        {u.status === 'active' ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Points Modal */}
      {selectedUserForPoints && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedUserForPoints(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#ead4ba] overflow-hidden z-10">
            <div className="bg-[#4A1025] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="font-bold text-base">Adjust Reader Points</h3>
              </div>
              <button
                onClick={() => setSelectedUserForPoints(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-[#FFF8E7] rounded-xl border border-[#ebd7c2] text-xs">
                <p className="font-bold text-[#2D1A1A]">{selectedUserForPoints.name}</p>
                <p className="text-gray-500">{selectedUserForPoints.email}</p>
                <p className="text-[#8B1E3F] font-bold mt-1">
                  Current Balance: {selectedUserForPoints.points_balance.toLocaleString()} Points
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Points Quantity
                </label>
                <input
                  type="number"
                  min="10"
                  step="50"
                  value={pointDeltaInput}
                  onChange={(e) => setPointDeltaInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmPoints(true)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Grant Points</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmPoints(false)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Deduct Points</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
