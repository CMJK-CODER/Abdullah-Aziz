import React from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemTitle?: string;
  itemType?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
  itemType
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ead4ba] overflow-hidden z-10">
        {/* Accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-rose-600 via-[#8B1E3F] to-rose-700" />

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-bold text-[#2D1A1A]">
              Are you sure you want to delete this?
            </h3>

            {itemTitle && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#FFF8E7] border border-[#ebd7c2] text-xs">
                {itemType && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#8B1E3F] block mb-0.5">
                    {itemType}
                  </span>
                )}
                <span className="font-semibold text-[#2D1A1A] line-clamp-2">
                  {itemTitle}
                </span>
              </div>
            )}

            <p className="text-xs text-[#786161] mt-2.5 leading-relaxed">
              This action cannot be undone. The selected record will be permanently deleted from the database.
            </p>
          </div>

          {/* Modal Action Buttons: Cancel & Confirm Delete */}
          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#ebd7c2] bg-white hover:bg-[#FAF3EA] text-xs font-bold text-[#574141] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
