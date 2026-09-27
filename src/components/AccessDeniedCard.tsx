import React from 'react';
import { ShieldAlert, ArrowLeft, Key } from 'lucide-react';
import { AdminTeamMember } from '../types';

interface AccessDeniedCardProps {
  currentAdmin: AdminTeamMember;
  requiredPermission: string;
  sectionTitle: string;
  onNavigateBack?: () => void;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  currentAdmin,
  requiredPermission,
  sectionTitle,
  onNavigateBack
}) => {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#ead4ba] text-center max-w-xl mx-auto my-12 shadow-sm space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          Access Restricted • Role Permission Guard
        </span>
        <h2 className="text-xl font-bold text-[#2D1A1A] font-serif mt-2">
          Permission Required for {sectionTitle}
        </h2>
        <p className="text-xs text-[#786161] leading-relaxed max-w-md mx-auto">
          Your current account (<span className="font-bold text-[#2D1A1A]">{currentAdmin.name}</span>, role:{' '}
          <span className="font-bold text-[#8B1E3F]">{currentAdmin.role}</span>) does not possess the{' '}
          <code className="px-1.5 py-0.5 rounded bg-gray-100 text-rose-700 font-mono text-[11px]">
            {requiredPermission}
          </code>{' '}
          privilege.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#ebd7c2] text-left text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#512900]">
          <Key className="w-3.5 h-3.5 text-[#8B1E3F]" />
          <span>How to unlock this section:</span>
        </div>
        <p className="text-[11px] text-[#786161]">
          Request a Super Admin to elevate your role to <span className="font-semibold text-[#2D1A1A]">Admin / Manager</span> or grant this custom permission under <span className="font-semibold text-[#8B1E3F]">Admin Team & Roles</span>.
        </p>
      </div>

      {onNavigateBack && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onNavigateBack}
            className="px-4 py-2 rounded-xl bg-[#8B1E3F] hover:bg-[#721733] text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      )}
    </div>
  );
};
