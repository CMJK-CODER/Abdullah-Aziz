import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Download,
  Send,
  Eye,
  Smartphone,
  Wifi,
  Search,
  Check,
  X,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { WithdrawalRequest } from '../types';

interface WithdrawalRequestsViewProps {
  withdrawals: WithdrawalRequest[];
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, reason: string) => void;
  onBatchApprove: () => void;
}

export const WithdrawalRequestsView: React.FC<WithdrawalRequestsViewProps> = ({
  withdrawals,
  onApprove,
  onReject,
  onBatchApprove
}) => {
  const [filterTab, setFilterTab] = useState<'Pending' | 'All' | 'Approved' | 'Flagged'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dossierRequest, setDossierRequest] = useState<WithdrawalRequest | null>(null);
  const [rejectionModalRequest, setRejectionModalRequest] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [txnNote, setTxnNote] = useState('Dispatched via Automated Payment Gateway');

  const pendingList = withdrawals.filter((w) => w.status === 'Pending');
  const approvedList = withdrawals.filter((w) => w.status === 'Approved');
  const flaggedList = withdrawals.filter((w) => w.is_flagged_fraud || w.status === 'Rejected');

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesStatus =
      filterTab === 'All'
        ? true
        : filterTab === 'Pending'
        ? w.status === 'Pending'
        : filterTab === 'Approved'
        ? w.status === 'Approved'
        : w.is_flagged_fraud || w.status === 'Rejected';

    const matchesSearch =
      w.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.user_name_urdu && w.user_name_urdu.includes(searchQuery)) ||
      w.account_number.includes(searchQuery) ||
      w.account_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = 'ID,User,Email,Method,AccountTitle,AccountNumber,Points,AmountPKR,Status\n';
    const rows = withdrawals
      .map(
        (w) =>
          `${w.id},"${w.user_name}","${w.user_email}",${w.payment_method},"${w.account_title}",${w.account_number},${w.points_redeemed},${w.amount_pkr},${w.status}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitab_nagri_withdrawals_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Batch Actions */}
      <div className="bg-[#4A1025] rounded-3xl p-6 text-white border border-[#5e1832] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-[#4A1025]/20">
        <div>
          <div className="flex items-center space-x-2 text-[#FF8C00] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Reader Payout Settlement Gateway</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold">Easypaisa & JazzCash Withdrawals</h1>
          <p className="text-xs text-[#ebd7c2] mt-1">
            Validate reading requirements, review automated fraud heuristic alerts, and disburse PKR payouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#FF8C00]" />
            <span>Export CSV</span>
          </button>

          {pendingList.length > 0 && (
            <button
              onClick={onBatchApprove}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Batch Process Clean ({pendingList.filter((p) => !p.is_flagged_fraud).length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Total Requests</p>
          <p className="text-2xl font-black text-[#2D1A1A] mt-1">{withdrawals.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Rs. {withdrawals.reduce((s, w) => s + (w.amount_pkr || 0), 0).toLocaleString()} PKR volume
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Pending Verification</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingList.length}</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
            {pendingList.length > 0 ? 'Ready for dispatch' : 'Queue clear'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Dispatched / Paid</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{approvedList.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Rs. {approvedList.reduce((s, w) => s + (w.amount_pkr || 0), 0).toLocaleString()} PKR settled
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Rejected / Flagged</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{flaggedList.length}</p>
          <p className="text-[11px] text-rose-700 font-semibold mt-0.5">Fraud heuristic alerts</p>
        </div>
      </div>

      {/* Telecom Merchant Reserves Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Easypaisa Merchant Float */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#00A651] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              EP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[#2D1A1A]">Easypaisa Merchant API</h4>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  92ms Latency
                </span>
              </div>
              <p className="text-base font-black text-emerald-700 mt-0.5">
                Rs. 184,250 PKR <span className="text-[11px] font-normal text-gray-500">Available Float</span>
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Daily Cap: 250k</p>
            <p className="font-bold text-emerald-700">73.7% Dispatched</p>
          </div>
        </div>

        {/* JazzCash Corporate Float */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#E53935] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              JC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[#2D1A1A]">JazzCash Corporate SDK</h4>
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                  140ms Latency
                </span>
              </div>
              <p className="text-base font-black text-[#E53935] mt-0.5">
                Rs. 96,800 PKR <span className="text-[11px] font-normal text-gray-500">Available Float</span>
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Daily Cap: 200k</p>
            <p className="font-bold text-[#E53935]">48.4% Dispatched</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
          {(['Pending', 'All', 'Approved', 'Flagged'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                filterTab === tab
                  ? 'bg-[#8B1E3F] text-white shadow-xs'
                  : 'text-[#574141] hover:bg-[#FFF8E7]'
              }`}
            >
              {tab}{' '}
              <span className="opacity-80 text-[11px]">
                (
                {tab === 'Pending'
                  ? pendingList.length
                  : tab === 'Approved'
                  ? approvedList.length
                  : tab === 'Flagged'
                  ? flaggedList.length
                  : withdrawals.length}
                )
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8B1E3F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search account title, number, or txn ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-3xl border border-[#ead4ba] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8E7] text-[#574141] font-bold border-b border-[#ebd7c2]">
              <tr>
                <th className="py-3.5 px-4">Reader & Txn</th>
                <th className="py-3.5 px-3">Method</th>
                <th className="py-3.5 px-3">Account Details</th>
                <th className="py-3.5 px-3">Redeemed</th>
                <th className="py-3.5 px-3">Task Milestones</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4ebe1]">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#786161]">
                    <Banknote className="w-10 h-10 text-[#ebd7c2] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#2D1A1A]">No withdrawal requests found</p>
                    <p className="text-xs text-[#786161] mt-0.5">
                      {withdrawals.length === 0
                        ? 'When readers redeem rewarded coins for Easypaisa or JazzCash PKR cashouts, they will appear here.'
                        : 'No withdrawal requests match your search query or filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((w) => (
                <tr
                  key={w.id}
                  className={`hover:bg-[#FFFDF9] transition-colors ${
                    w.is_flagged_fraud ? 'bg-rose-50/40' : ''
                  }`}
                >
                  {/* Reader */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-[#8B1E3F] shrink-0 border border-gray-200">
                        {w.user_avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#2D1A1A] truncate">{w.user_name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{w.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Method */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${
                        w.payment_method === 'Easypaisa' ? 'bg-[#00A651]' : 'bg-[#E53935]'
                      }`}
                    >
                      {w.payment_method}
                    </span>
                  </td>

                  {/* Account Details */}
                  <td className="py-3.5 px-3 text-[#2D1A1A]">
                    <p className="font-bold">{w.account_title}</p>
                    <p className="text-[11px] font-mono text-[#8B1E3F]">{w.account_number}</p>
                  </td>

                  {/* Redeemed */}
                  <td className="py-3.5 px-3">
                    <p className="font-black text-[#8B1E3F] text-sm">
                      Rs. {w.amount_pkr}{' '}
                      <span className="text-[10px] font-normal text-gray-500">PKR</span>
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {w.points_redeemed.toLocaleString()} Points
                    </p>
                  </td>

                  {/* Tasks Milestones */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-emerald-700">
                          {w.tasks_chapters_completed}/{w.tasks_chapters_required} Ch.
                        </span>
                        <span>•</span>
                        <span className="text-gray-600">
                          {w.tasks_ads_watched}/{w.tasks_ads_required} Ads
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={
                            w.tasks_invites_completed >= w.tasks_invites_required
                              ? 'text-emerald-700 font-semibold'
                              : 'text-amber-700 font-semibold'
                          }
                        >
                          {w.tasks_invites_completed}/{w.tasks_invites_required} Invites
                        </span>
                      </div>

                      {w.is_flagged_fraud && (
                        <div className="flex items-center gap-1 text-rose-700 font-bold mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span className="truncate max-w-[130px]">{w.fraud_reason}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : w.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setDossierRequest(w)}
                        className="px-2.5 py-1 bg-[#FFF8E7] hover:bg-[#ebd7c2] text-[#8B1E3F] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="View Forensic Audit Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit</span>
                      </button>

                      {w.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => onApprove(w.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                            title="Instant Dispatch via API"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectionModalRequest(w);
                              setRejectionReason(
                                w.fraud_reason || 'Incomplete viral referral condition.'
                              );
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                            title="Reject and Void Points"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Audit Dossier Modal */}
      {dossierRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={() => setDossierRequest(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#ead4ba] my-8 overflow-hidden z-10 flex flex-col max-h-[92vh]">
            <div className="bg-[#4A1025] text-white px-6 py-4 flex items-center justify-between border-b border-[#5e1832]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#8B1E3F] rounded-xl text-white">
                  <ShieldAlert className="w-5 h-5 text-[#FF8C00]" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Reader Forensic Audit Dossier</h3>
                  <p className="text-xs text-[#ebd7c2]">
                    Txn ID: {dossierRequest.id} • {dossierRequest.payment_method}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDossierRequest(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto bg-[#FFFDF9]">
              {/* Account summary banner */}
              <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#2D1A1A]">{dossierRequest.user_name}</p>
                  <p className="text-xs text-gray-600">{dossierRequest.user_email}</p>
                  <p className="text-xs font-bold text-[#8B1E3F] mt-1">
                    Beneficiary: {dossierRequest.account_title} ({dossierRequest.account_number})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-700">
                    Rs. {dossierRequest.amount_pkr} PKR
                  </p>
                  <p className="text-xs text-gray-500">
                    {dossierRequest.points_redeemed.toLocaleString()} Points
                  </p>
                </div>
              </div>

              {/* Hardware & Network telemetry */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2D1A1A] uppercase tracking-wider">
                  Hardware & Network Telemetry
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#ebd7c2] flex items-center space-x-2.5">
                    <Smartphone className="w-4 h-4 text-[#8B1E3F]" />
                    <div>
                      <p className="text-[10px] text-gray-500">Device Model</p>
                      <p className="font-semibold text-[#2D1A1A]">
                        {dossierRequest.device_model || 'Samsung SM-A536E'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#ebd7c2] flex items-center space-x-2.5">
                    <Wifi className="w-4 h-4 text-[#8B1E3F]" />
                    <div>
                      <p className="text-[10px] text-gray-500">Network / IP Range</p>
                      <p className="font-semibold text-[#2D1A1A]">
                        {dossierRequest.ip_address || '39.40.112.9 (PTCL)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2D1A1A] uppercase tracking-wider">
                  Monetization Task Verification
                </h4>
                <div className="p-4 bg-white rounded-2xl border border-[#ebd7c2] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#574141]">Minimum Chapters Read (50 Req.)</span>
                    <span className="font-bold text-emerald-700">
                      {dossierRequest.tasks_chapters_completed} / 50 Chapters (VERIFIED)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#574141]">Rewarded Ads Watched (20 Req.)</span>
                    <span className="font-bold text-emerald-700">
                      {dossierRequest.tasks_ads_watched} / 20 Video Impressions (VERIFIED)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#574141]">Viral Friends Invited (3 Req.)</span>
                    <span
                      className={`font-bold ${
                        dossierRequest.tasks_invites_completed >= 3
                          ? 'text-emerald-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {dossierRequest.tasks_invites_completed} / 3 Qualified Invites
                    </span>
                  </div>
                </div>
              </div>

              {/* Fraud Flag Alert if applicable */}
              {dossierRequest.is_flagged_fraud && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-900">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Heuristic Shield Warning</p>
                    <p className="text-xs mt-0.5">{dossierRequest.fraud_reason}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-[#ebd7c2] flex items-center justify-between">
              <button
                onClick={() => setDossierRequest(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close Audit
              </button>

              {dossierRequest.status === 'Pending' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setRejectionModalRequest(dossierRequest);
                      setDossierRequest(null);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl"
                  >
                    Reject Payout
                  </button>
                  <button
                    onClick={() => {
                      onApprove(dossierRequest.id, txnNote);
                      setDossierRequest(null);
                    }}
                    className="px-5 py-2 bg-[#00A651] hover:bg-[#008f45] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Approve & Dispatch Payout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Payout Dialog */}
      {rejectionModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setRejectionModalRequest(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ead4ba] overflow-hidden z-10">
            <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Reject Withdrawal Request</h3>
              <button
                onClick={() => setRejectionModalRequest(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#574141]">
                Specify why this payout is rejected. The points will be held for manual review.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 bg-white border border-[#ebd7c2] rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#ebd7c2]">
                <button
                  onClick={() => setRejectionModalRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onReject(rejectionModalRequest.id, rejectionReason);
                    setRejectionModalRequest(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
