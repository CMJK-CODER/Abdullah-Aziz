import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  Award,
  AlertCircle,
  X,
  Search,
  BookOpen,
  Send,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { WriterRequest } from '../types';

interface WritersRequestsViewProps {
  writers: WriterRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const WritersRequestsView: React.FC<WritersRequestsViewProps> = ({
  writers,
  onApprove,
  onReject
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingRequest, setInspectingRequest] = useState<WriterRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'synopsis' | 'sample_chapter' | 'checklist'>('synopsis');

  const pendingCount = writers.filter((w) => w.status === 'Pending').length;
  const approvedCount = writers.filter((w) => w.status === 'Approved').length;
  const rejectedCount = writers.filter((w) => w.status === 'Rejected').length;

  const filteredRequests = writers.filter((item) => {
    const matchesStatus = filterTab === 'All' || item.status === filterTab;
    const matchesSearch =
      item.writer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.book_title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.book_title_urdu.includes(searchQuery) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenRejectDialog = (req: WriterRequest) => {
    setInspectingRequest(req);
    setIsRejectDialogOpen(true);
    setRejectionReason('Does not meet Kitabistan editorial formatting guidelines.');
  };

  const handleConfirmReject = () => {
    if (inspectingRequest) {
      onReject(inspectingRequest.id, rejectionReason);
      setIsRejectDialogOpen(false);
      setInspectingRequest(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#4A1025] rounded-3xl p-6 text-white border border-[#5e1832] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-[#4A1025]/20">
        <div>
          <div className="flex items-center space-x-2 text-[#FF8C00] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Editorial Intake Queue</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold">Writer Manuscript Requests</h1>
          <p className="text-xs text-[#ebd7c2] mt-1">
            Review incoming original Urdu manuscripts, authenticate author rights, and approve for digital publishing.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#380b1b] px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
          <Clock className="w-5 h-5 text-[#FF8C00]" />
          <div>
            <p className="text-xs font-bold text-white">{pendingCount} Submissions Pending</p>
            <p className="text-[10px] text-[#ebd7c2]">Average review SLA: ~4.2 hrs</p>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Pending Reviews</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {pendingCount > 0 ? 'Awaiting editorial inspection' : 'All reviews completed'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Approved Authors</p>
          <p className="text-2xl font-black text-[#8B1E3F] mt-1">{approvedCount}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {approvedCount > 0 ? `${approvedCount} manuscripts accepted` : 'No accepted manuscripts yet'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Review Pipeline</p>
          <p className="text-2xl font-black text-[#2D1A1A] mt-1">
            {writers.filter((w) => w.is_first_novel).length} / {writers.filter((w) => !w.is_first_novel).length}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">Debut vs. Existing authors</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
          <p className="text-xs text-[#786161]">Total Submissions</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{writers.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {writers.reduce((acc, w) => acc + (w.word_count || 0), 0).toLocaleString()} words submitted
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#ead4ba] shadow-xs">
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
          {(['Pending', 'All', 'Approved', 'Rejected'] as const).map((tab) => (
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
                  ? pendingCount
                  : tab === 'Approved'
                  ? approvedCount
                  : tab === 'Rejected'
                  ? rejectedCount
                  : writers.length}
                )
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8B1E3F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by writer, title, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF9] border border-[#ebd7c2] rounded-xl text-xs text-[#2D1A1A] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-[#ead4ba] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8E7] text-[#574141] font-bold border-b border-[#ebd7c2]">
              <tr>
                <th className="py-3.5 px-4">Writer Profile</th>
                <th className="py-3.5 px-3">Novel Title</th>
                <th className="py-3.5 px-3">Genre</th>
                <th className="py-3.5 px-3">Volume & Format</th>
                <th className="py-3.5 px-3">Submitted</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4ebe1]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#786161]">
                    <FileText className="w-10 h-10 text-[#ebd7c2] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#2D1A1A]">No manuscript submissions found</p>
                    <p className="text-xs text-[#786161] mt-0.5">
                      {writers.length === 0
                        ? 'When writers submit new novels or chapter drafts through the writer portal, they will appear here.'
                        : 'No submissions match your search query or filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#FFFDF9] transition-colors">
                  {/* Writer Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B1E3F] to-[#FF8C00] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {req.writer_avatar || req.writer_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-[#2D1A1A] truncate">{req.writer_name}</p>
                          {req.is_verified_writer && (
                            <span title="Verified Author">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {req.is_first_novel ? 'First-time Novelist' : 'Published Novelist'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Title */}
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-[#2D1A1A]">{req.book_title_en}</p>
                    <p className="font-urdu text-[12px] text-[#8B1E3F]">{req.book_title_urdu}</p>
                  </td>

                  {/* Genre */}
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#8B1E3F] border border-[#ebd7c2] text-[10px] font-semibold whitespace-nowrap">
                      {req.genre}
                    </span>
                  </td>

                  {/* Volume & Format */}
                  <td className="py-3.5 px-3 text-[#2D1A1A]">
                    <p className="font-semibold">{req.submitted_chapters_count} Chapters ({req.word_count.toLocaleString()} Words)</p>
                    <p className="text-[10px] text-gray-500">{req.format}</p>
                  </td>

                  {/* Submitted */}
                  <td className="py-3.5 px-3 text-gray-500 whitespace-nowrap">
                    {req.submitted_date}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setInspectingRequest(req)}
                        className="px-2.5 py-1 bg-[#FFF8E7] hover:bg-[#ebd7c2] text-[#8B1E3F] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {req.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => onApprove(req.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                            title="Approve to Catalog"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenRejectDialog(req)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                            title="Reject Manuscript"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* Inspect Manuscript Drawer / Modal */}
      {inspectingRequest && !isRejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={() => setInspectingRequest(null)}
          />
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#ead4ba] my-8 overflow-hidden z-10 flex flex-col max-h-[92vh]">
            {/* Drawer Header */}
            <div className="bg-[#4A1025] text-white px-6 py-4 flex items-center justify-between border-b border-[#5e1832]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#8B1E3F] rounded-xl text-white">
                  <FileText className="w-5 h-5 text-[#FF8C00]" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{inspectingRequest.book_title_en}</h3>
                  <p className="font-urdu text-xs text-[#FF8C00]">
                    {inspectingRequest.book_title_urdu} • By {inspectingRequest.writer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingRequest(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FFFDF9]">
              {/* Quick Meta Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white border border-[#ebd7c2]">
                  <p className="text-[10px] text-gray-500">Genre</p>
                  <p className="text-xs font-bold text-[#8B1E3F]">{inspectingRequest.genre}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#ebd7c2]">
                  <p className="text-[10px] text-gray-500">Volume</p>
                  <p className="text-xs font-bold text-[#2D1A1A]">
                    {inspectingRequest.submitted_chapters_count} Chapters ({inspectingRequest.word_count.toLocaleString()} Words)
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#ebd7c2]">
                  <p className="text-[10px] text-gray-500">Format</p>
                  <p className="text-xs font-bold text-[#2D1A1A]">{inspectingRequest.format}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#ebd7c2]">
                  <p className="text-[10px] text-gray-500">Status</p>
                  <p className="text-xs font-bold text-amber-600">{inspectingRequest.status}</p>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex border-b border-[#ebd7c2]">
                <button
                  onClick={() => setActiveDrawerTab('synopsis')}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                    activeDrawerTab === 'synopsis'
                      ? 'border-[#8B1E3F] text-[#8B1E3F]'
                      : 'border-transparent text-gray-500 hover:text-[#2D1A1A]'
                  }`}
                >
                  Novel Synopsis
                </button>
                <button
                  onClick={() => setActiveDrawerTab('sample_chapter')}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                    activeDrawerTab === 'sample_chapter'
                      ? 'border-[#8B1E3F] text-[#8B1E3F]'
                      : 'border-transparent text-gray-500 hover:text-[#2D1A1A]'
                  }`}
                >
                  Sample Chapter Preview (نستعلیق)
                </button>
                <button
                  onClick={() => setActiveDrawerTab('checklist')}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                    activeDrawerTab === 'checklist'
                      ? 'border-[#8B1E3F] text-[#8B1E3F]'
                      : 'border-transparent text-gray-500 hover:text-[#2D1A1A]'
                  }`}
                >
                  Quality Checklist
                </button>
              </div>

              {/* Tab Content 1: Synopsis */}
              {activeDrawerTab === 'synopsis' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2]">
                    <p className="text-xs font-bold text-[#2D1A1A] mb-1">Urdu Synopsis</p>
                    <p className="font-urdu text-base leading-[2.3] text-[#2D1A1A]" dir="rtl">
                      {inspectingRequest.synopsis_urdu}
                    </p>
                  </div>
                  {inspectingRequest.synopsis_en && (
                    <div className="p-4 rounded-2xl bg-white border border-[#ebd7c2]">
                      <p className="text-xs font-bold text-[#2D1A1A] mb-1">English Summary</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {inspectingRequest.synopsis_en}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 2: Sample Chapter Preview */}
              {activeDrawerTab === 'sample_chapter' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#ebd7c2]">
                    <span className="text-xs font-bold text-[#2D1A1A]">
                      {inspectingRequest.sample_chapter_title}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      Nastaleeq Typeset Validated
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FFF8E7] border-2 border-[#8B1E3F]/20 max-h-72 overflow-y-auto">
                    <p className="font-urdu text-[20px] leading-[2.5] text-[#2D1A1A]" dir="rtl">
                      {inspectingRequest.sample_chapter_urdu}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Quality Checklist */}
              {activeDrawerTab === 'checklist' && (
                <div className="p-4 rounded-2xl bg-white border border-[#ebd7c2] space-y-3 text-xs">
                  <div className="flex items-center space-x-2.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">Plagiarism & Duplicate Content: PASSED (0% match found)</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">Unicode Nastaleeq Encoding: PASSED (Valid UTF-8 format)</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">High-Res Cover Artwork: PASSED (200x300 aspect ratio)</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">Writer Terms & Copyright Agreement: ACCEPTED</span>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#ebd7c2] bg-white flex items-center justify-between">
              <button
                onClick={() => setInspectingRequest(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close Drawer
              </button>

              {inspectingRequest.status === 'Pending' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenRejectDialog(inspectingRequest)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Reject Manuscript
                  </button>
                  <button
                    onClick={() => {
                      onApprove(inspectingRequest.id);
                      setInspectingRequest(null);
                    }}
                    className="px-5 py-2 bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold rounded-xl shadow-md shadow-[#8B1E3F]/20 transition-all active:scale-95"
                  >
                    Approve & Publish to Catalog
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {isRejectDialogOpen && inspectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsRejectDialogOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ead4ba] overflow-hidden z-10">
            <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-base">Reject Manuscript Submission</h3>
              </div>
              <button
                onClick={() => setIsRejectDialogOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#574141]">
                State the reason for rejecting <span className="font-bold text-[#2D1A1A]">{inspectingRequest.book_title_en}</span>. An automated editorial notification will be sent to the writer.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#2D1A1A] mb-1">
                  Rejection Reason / Guidance
                </label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 bg-white border border-[#ebd7c2] rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#ebd7c2]">
                <button
                  onClick={() => setIsRejectDialogOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
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
