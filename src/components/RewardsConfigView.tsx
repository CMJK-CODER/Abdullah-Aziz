import React, { useState } from 'react';
import {
  Coins,
  ShieldAlert,
  Save,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  DollarSign,
  HelpCircle
} from 'lucide-react';
import { RewardsConfig } from '../types';

interface RewardsConfigViewProps {
  config: RewardsConfig;
  onSaveConfig: (updated: RewardsConfig) => void;
}

export const RewardsConfigView: React.FC<RewardsConfigViewProps> = ({
  config,
  onSaveConfig
}) => {
  const [form, setForm] = useState<RewardsConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Math calculations
  const minPkr = (form.min_withdrawal_points / form.conversion_points_per_pkr).toFixed(0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#2D1A1A]">Reader Rewards & Payout Rules</h1>
          <p className="text-xs text-[#786161]">
            Tune point accrual rates, minimum redemption thresholds, and difficulty unlock tasks
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Rules Updated Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Points Economy (8 Cols) */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#f0e2d3]">
              <div className="p-2.5 rounded-2xl bg-[#8B1E3F]/10 text-[#8B1E3F]">
                <Coins className="w-5 h-5 text-[#8B1E3F]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1A1A]">Points Accrual Economy</h3>
                <p className="text-xs text-[#786161]">Base values awarded for app engagements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                  Points per Chapter Read
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.points_per_chapter}
                  onChange={(e) =>
                    setForm({ ...form, points_per_chapter: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
                <p className="text-[10px] text-gray-500 mt-1">Default: 10 pts after finishing text</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                  Points per Rewarded Video Ad
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.points_per_ad}
                  onChange={(e) =>
                    setForm({ ...form, points_per_ad: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
                <p className="text-[10px] text-gray-500 mt-1">Default: 20 pts per 30s ad</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                  Daily Check-in Streak Reward
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.points_per_checkin}
                  onChange={(e) =>
                    setForm({ ...form, points_per_checkin: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
                <p className="text-[10px] text-gray-500 mt-1">Default: 50 pts once every 24h</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5">
                  Friend Invite / Referral Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.points_per_invite}
                  onChange={(e) =>
                    setForm({ ...form, points_per_invite: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                />
                <p className="text-[10px] text-gray-500 mt-1">Default: 100 pts on first chapter read</p>
              </div>
            </div>

            {/* Currency conversion formulas */}
            <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2D1A1A]">Conversion Rate</span>
                <span className="text-xs font-black text-[#8B1E3F]">
                  {form.conversion_points_per_pkr} Points = Rs. 1.00 PKR
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2D1A1A] mb-1">
                    Points per 1.00 PKR
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={form.conversion_points_per_pkr}
                    onChange={(e) =>
                      setForm({ ...form, conversion_points_per_pkr: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#8B1E3F]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2D1A1A] mb-1">
                    Minimum Withdrawal Points
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={form.min_withdrawal_points}
                    onChange={(e) =>
                      setForm({ ...form, min_withdrawal_points: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#8B1E3F]/20"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#786161]">
                Min Redemption: <span className="font-bold text-[#8B1E3F]">{form.min_withdrawal_points.toLocaleString()} Points</span> = <span className="font-bold text-emerald-700">Rs. {minPkr} PKR</span>
              </p>
            </div>
          </div>

          {/* Card 2: Difficulty Tasks (Withdrawal Unlock Conditions) */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#f0e2d3]">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D1A1A]">Withdrawal Unlock Conditions</h3>
                  <p className="text-xs text-[#786161]">Retention gating before money leaves app</p>
                </div>
              </div>

              {/* Strategic Advice Callout */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold">Monetization Protection Rule:</p>
                    <p className="mt-0.5 italic">
                      "Make it difficult so admin doesn't have to pay easily, but keep user interested through high engagement milestones."
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5 flex items-center justify-between">
                    <span>Min Chapters Read to Unlock</span>
                    <span className="text-[10px] text-gray-500">Requires 50 deep reads</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.min_chapters_read_to_unlock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        min_chapters_read_to_unlock: Number(e.target.value)
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5 flex items-center justify-between">
                    <span>Min Ads Watched to Unlock</span>
                    <span className="text-[10px] text-gray-500">Ensures positive ad unit profit</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.min_ads_watched_to_unlock}
                    onChange={(e) =>
                      setForm({ ...form, min_ads_watched_to_unlock: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5 flex items-center justify-between">
                    <span>Min Friends Invited (Viral Loop)</span>
                    <span className="text-[10px] text-gray-500">App growth prerequisite</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.min_friends_invited_to_unlock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        min_friends_invited_to_unlock: Number(e.target.value)
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D1A1A] mb-1.5 flex items-center justify-between">
                    <span>Cooldown Days Between Payouts</span>
                    <span className="text-[10px] text-gray-500">Prevents rapid drain</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.cooldown_days}
                    onChange={(e) =>
                      setForm({ ...form, cooldown_days: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#ebd7c2] rounded-xl text-xs font-bold text-[#2D1A1A] focus:ring-2 focus:ring-[#8B1E3F]/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0e2d3] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold rounded-xl shadow-md shadow-[#8B1E3F]/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#FF8C00]" />
                <span>Save Rewards Config</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Ad Revenue vs Points Payout Stats & Projection */}
        <div className="p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2D1A1A]">Ad Revenue vs. Points Payout Yield</h3>
              <p className="text-xs text-[#786161]">Net profit spread maintained by current difficulty gating</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
              78.4% Net Margin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#ebd7c2]">
              <p className="text-xs text-gray-500">Monthly Ad Revenue Earned</p>
              <p className="text-xl font-black text-emerald-700 mt-1">Rs. 1,460,000 PKR</p>
              <p className="text-[11px] text-gray-500 mt-0.5">($5,260 USD Google AdMob)</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#ebd7c2]">
              <p className="text-xs text-gray-500">Reader Rewards Disbursed</p>
              <p className="text-xl font-black text-[#8B1E3F] mt-1">Rs. 315,000 PKR</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Dispatched to Easypaisa & JazzCash</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#ebd7c2]">
              <p className="text-xs text-gray-500">Retained Net Profit</p>
              <p className="text-xl font-black text-[#2D1A1A] mt-1">Rs. 1,145,000 PKR</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Healthy unit economics</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
