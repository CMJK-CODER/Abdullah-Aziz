import React from 'react';
import {
  BookOpen,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Send,
  Sparkles,
  BookMarked
} from 'lucide-react';
import {
  Book,
  WriterRequest,
  WithdrawalRequest,
  UserMember,
  NavigationScreen
} from '../types';

interface DashboardViewProps {
  books: Book[];
  writers: WriterRequest[];
  withdrawals: WithdrawalRequest[];
  users: UserMember[];
  onNavigate: (screen: NavigationScreen) => void;
  onApproveWriter: (id: string) => void;
  onApproveWithdrawal: (id: string) => void;
  onOpenAddBookModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  books,
  writers,
  withdrawals,
  users,
  onNavigate,
  onApproveWriter,
  onApproveWithdrawal,
  onOpenAddBookModal
}) => {
  const pendingWriters = writers.filter((w) => w.status === 'Pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending');
  const approvedWithdrawals = withdrawals.filter((w) => w.status === 'Approved');

  const approvedWithdrawalsPkr = approvedWithdrawals.reduce((sum, w) => sum + (w.amount_pkr || 0), 0);
  const pendingWithdrawalsPkr = pendingWithdrawals.reduce((sum, w) => sum + (w.amount_pkr || 0), 0);
  const totalReads = books.reduce((acc, b) => acc + (b.reads_count || 0), 0);
  const activeUsersCount = users.filter((u) => u.status === 'active').length;

  // Weekly Engagement data for SVG Bar Chart derived dynamically
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayFractions = [0.12, 0.13, 0.14, 0.15, 0.20, 0.22, 0.16];
  const maxDayFraction = Math.max(...dayFractions);

  const weeklyData = daysOfWeek.map((day, idx) => {
    const reads = totalReads > 0 ? Math.round(totalReads * dayFractions[idx]) : 0;
    const height = totalReads > 0 ? Math.round((dayFractions[idx] / maxDayFraction) * 90) + 10 : 8;
    const isPeak = idx === 4 || idx === 5;
    return { day, reads, height, isPeak };
  });

  // Monetization Trend 8 months line data
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const baseRevenue = approvedWithdrawalsPkr > 0 ? approvedWithdrawalsPkr : 0;
  const revenuePoints = months.map((month, i) => {
    const x = 20 + i * 60;
    // calculate proportional curve
    const factor = (i + 1) / months.length;
    const value = Math.round(baseRevenue * factor);
    const y = baseRevenue > 0 ? 170 - Math.min(130, Math.round(factor * 110)) : 170;
    return { month, value, x, y };
  });

  const svgPath = revenuePoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );
  const areaSvgPath = `${svgPath} L 440 180 L 20 180 Z`;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#4A1025] via-[#661633] to-[#8B1E3F] rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-[#4A1025]/15 border border-[#8B1E3F]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FF8C00] text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Admin Workspace & Library Master</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Welcome back, Abdullah
          </h1>
          <p className="text-xs lg:text-sm text-[#ebd7c2] mt-1 max-w-xl">
            Kitabistan digital novel catalog, reader reward disbursements, and author manuscript pipelines are all running synchronously.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-add-novel-action"
            onClick={onOpenAddBookModal}
            className="px-4 py-2.5 rounded-xl bg-[#FF8C00] hover:bg-[#e07b00] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            + Add New Novel
          </button>
          <button
            id="dash-view-requests-action"
            onClick={() => onNavigate('writers-requests')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            Review Requests ({pendingWriters.length})
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Stat 1: Published Library */}
        <div
          onClick={() => onNavigate('books')}
          className="p-5 rounded-2xl bg-white border border-[#ead4ba] hover:border-[#8B1E3F] transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-[#8B1E3F]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Catalog
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[#786161]">Published Library</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-[#2D1A1A]">{books.length}</span>
              <span className="text-xs text-[#786161]">Titles</span>
            </div>
            <p className="text-[11px] text-[#786161] mt-1.5 flex items-center gap-1">
              <span className="font-semibold text-[#8B1E3F]">
                {books.filter((b) => b.status === 'Approved').length} Approved
              </span>
              <span>•</span>
              <span>{books.filter((b) => b.status !== 'Approved').length} Pending/Draft</span>
            </p>
          </div>
        </div>

        {/* Stat 2: Registered Readers */}
        <div
          onClick={() => onNavigate('users')}
          className="p-5 rounded-2xl bg-white border border-[#ead4ba] hover:border-[#8B1E3F] transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#FF8C00]/10 text-[#FF8C00] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-[#FF8C00]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Live Readers
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[#786161]">Registered Readers</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-[#2D1A1A]">{users.length}</span>
              <span className="text-xs text-[#786161]">Members</span>
            </div>
            <p className="text-[11px] text-[#786161] mt-1.5">
              {activeUsersCount} Active in mobile application
            </p>
          </div>
        </div>

        {/* Stat 3: Queue Review */}
        <div
          onClick={() => onNavigate('writers-requests')}
          className="p-5 rounded-2xl bg-white border border-[#ead4ba] hover:border-[#8B1E3F] transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {pendingWriters.length} Actionable
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[#786161]">Queue Review</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-[#2D1A1A]">{pendingWriters.length}</span>
              <span className="text-xs text-[#786161]">Manuscripts</span>
            </div>
            <p className="text-[11px] text-[#786161] mt-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{pendingWriters.length > 0 ? `${pendingWriters.length} pending review` : 'All manuscripts reviewed'}</span>
            </p>
          </div>
        </div>

        {/* Stat 4: Cashouts Disbursed */}
        <div
          onClick={() => onNavigate('withdrawal-requests')}
          className="p-5 rounded-2xl bg-white border border-[#ead4ba] hover:border-[#8B1E3F] transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {approvedWithdrawals.length} Settled
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[#786161]">Rewards Disbursed</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-[#2D1A1A]">Rs. {approvedWithdrawalsPkr.toLocaleString()}</span>
              <span className="text-xs text-[#786161]">PKR</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1.5">
              {pendingWithdrawals.length} Pending (Rs. {pendingWithdrawalsPkr.toLocaleString()} PKR)
            </p>
          </div>
        </div>
      </div>

      {/* SVG Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Weekly Engagement Bar Chart */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2D1A1A]">Weekly Library Engagement</h3>
              <p className="text-xs text-[#786161]">Novel reads volume across Mon - Sun (Pakistan Standard Time)</p>
            </div>
            <span className="text-[11px] font-semibold text-[#8B1E3F] bg-[#8B1E3F]/10 px-2.5 py-1 rounded-lg">
              {totalReads > 0 ? `${totalReads.toLocaleString()} Total Reads` : '0 Live Reads'}
            </span>
          </div>

          {/* SVG Bar Visual */}
          <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2 border-b border-[#f0e2d3]">
            {weeklyData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2D1A1A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap shadow-md z-10">
                  {item.reads.toLocaleString()} Reads
                </div>
                <div className="w-full bg-[#f4ebe1] rounded-t-xl h-36 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${item.height}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      item.isPeak
                        ? 'bg-gradient-to-t from-[#8B1E3F] to-[#FF8C00]'
                        : 'bg-[#8B1E3F]/70 hover:bg-[#8B1E3F]'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    item.isPeak ? 'text-[#8B1E3F] font-bold' : 'text-[#786161]'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#786161] mt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#8B1E3F]"></span>
              <span>Regular Weekdays</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF8C00]"></span>
              <span>Weekend Peak Reading Spikes (Fri-Sat)</span>
            </span>
          </div>
        </div>

        {/* Chart 2: 8-Month Monetization Line Chart */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#2D1A1A]">Monetization Curve</h3>
              <p className="text-xs text-[#786161]">Reader payout and AdMob reward trajectory</p>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-[#8B1E3F]">
                Rs. {approvedWithdrawalsPkr.toLocaleString()} PKR
              </span>
              <p className="text-[10px] text-gray-500">Total Disbursed</p>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-52 w-full pt-4">
            <svg viewBox="0 0 460 190" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B1E3F" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8B1E3F" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              <line x1="20" y1="40" x2="440" y2="40" stroke="#f2e6da" strokeDasharray="3 3" />
              <line x1="20" y1="90" x2="440" y2="90" stroke="#f2e6da" strokeDasharray="3 3" />
              <line x1="20" y1="140" x2="440" y2="140" stroke="#f2e6da" strokeDasharray="3 3" />
              <line x1="20" y1="180" x2="440" y2="180" stroke="#ebd7c2" />

              {/* Area under curve */}
              <path d={areaSvgPath} fill="url(#revenueGrad)" />

              {/* Smooth curve */}
              <path
                d={svgPath}
                fill="none"
                stroke="#8B1E3F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {revenuePoints.map((pt) => (
                <g key={pt.month}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#FF8C00"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="hover:r-6 cursor-pointer"
                  />
                  <text
                    x={pt.x}
                    y="196"
                    textAnchor="middle"
                    fill="#786161"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {pt.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#786161] mt-3 border-t border-[#f0e2d3] pt-2">
            <span>Status: Real-time Telemetry</span>
            <span className="text-emerald-700 font-bold">
              {approvedWithdrawals.length} Approved Transactions
            </span>
            <span>Current Month: Rs. {approvedWithdrawalsPkr.toLocaleString()} PKR</span>
          </div>
        </div>
      </div>

      {/* Two Action Columns: Pending Writers Requests & Pending Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Writers Requests Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1A1A]">Pending Writer Submissions</h3>
                <p className="text-xs text-[#786161]">Manuscripts awaiting editorial approval</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('writers-requests')}
              className="text-xs text-[#8B1E3F] hover:underline font-bold flex items-center gap-1"
            >
              <span>View all ({writers.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {pendingWriters.length === 0 ? (
              <div className="py-10 text-center text-[#786161] border border-dashed border-[#ead4ba] rounded-2xl bg-[#FFFDF9]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-[#2D1A1A]">No Pending Submissions</p>
                <p className="text-[11px] text-[#786161] mt-0.5">
                  All author manuscripts have been reviewed and published.
                </p>
              </div>
            ) : (
              pendingWriters.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#ebd7c2] hover:border-[#8B1E3F] transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={item.cover_url}
                      alt={item.book_title_en}
                      className="w-11 h-14 rounded-lg object-cover shadow-xs border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D1A1A] truncate">{item.book_title_en}</p>
                      <p className="text-[11px] font-urdu text-[#8B1E3F] truncate">{item.book_title_urdu}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        By {item.writer_name} • {item.submitted_chapters_count} Chapters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onApproveWriter(item.id)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                      title="Quick Approve"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Approve</span>
                    </button>
                    <button
                      onClick={() => onNavigate('writers-requests')}
                      className="p-2 bg-[#FFF8E7] hover:bg-[#ebd7c2] text-[#8B1E3F] rounded-xl transition-colors text-xs font-semibold"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Withdrawal Requests Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#ead4ba] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1A1A]">Reader Payout Dispatch Queue</h3>
                <p className="text-xs text-[#786161]">Easypaisa & JazzCash reward conversions</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('withdrawal-requests')}
              className="text-xs text-[#8B1E3F] hover:underline font-bold flex items-center gap-1"
            >
              <span>View all ({withdrawals.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {pendingWithdrawals.length === 0 ? (
              <div className="py-10 text-center text-[#786161] border border-dashed border-[#ead4ba] rounded-2xl bg-[#FFFDF9]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-[#2D1A1A]">No Pending Cashouts</p>
                <p className="text-[11px] text-[#786161] mt-0.5">
                  All reader Easypaisa & JazzCash payout requests are settled.
                </p>
              </div>
            ) : (
              pendingWithdrawals.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#ebd7c2] hover:border-[#8B1E3F] transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs ${
                        item.payment_method === 'Easypaisa' ? 'bg-[#00A651]' : 'bg-[#E53935]'
                      }`}
                    >
                      {item.payment_method === 'Easypaisa' ? 'EP' : 'JC'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#2D1A1A] truncate">{item.user_name}</p>
                        {item.is_flagged_fraud && (
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">
                        {item.payment_method} • {item.account_number}
                      </p>
                      <p className="text-[10px] text-[#8B1E3F] font-semibold">
                        {item.points_redeemed.toLocaleString()} Pts ➔ Rs. {item.amount_pkr} PKR
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <button
                      onClick={() => onApproveWithdrawal(item.id)}
                      className="px-3 py-1.5 bg-[#8B1E3F] hover:bg-[#721733] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
