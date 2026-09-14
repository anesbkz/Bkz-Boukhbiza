import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { AppPermission } from '@/types/rbac';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { GridPattern } from '@/components/design-system/GridPattern';

interface AdminRouteGuardProps {
  requiredPermission?: AppPermission;
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  requiredPermission,
  children,
}) => {
  const { user, profile, loading, isStaff, isSuperAdmin, hasPermission } = useAuth();
  const { navigate } = useI18n();

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center font-mono text-xs text-gray-500">
        <div className="w-6 h-6 border-2 border-[#0B2346]/20 border-t-[#0B2346] animate-spin mb-3" />
        <span>EVALUATING AUTHORITATIVE SECURITY TOKENS...</span>
      </div>
    );
  }

  // 1. Unauthenticated or Non-staff
  if (!user || !isStaff) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-8 max-w-lg mx-auto text-center relative overflow-hidden my-8">
        <GridPattern />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-red-50 border border-red-200 text-[#D62828] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D62828] font-bold block mb-1">
            HTTP 403 • RESTRICTED GOVERNANCE NODE
          </span>
          <h2 className="text-lg font-black text-[#0B2346] mb-2">
            Staff Authorization Required
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            Direct navigation to this operational command route is prohibited. Your account does not possess active staff or administrative clearance.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('')}
              className="px-4 py-2 bg-[#0B2346] text-white text-xs font-bold hover:bg-[#07162c] cursor-pointer"
            >
              Return to Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Inactive or Suspended Account
  if (profile?.status !== 'active') {
    return (
      <div className="bg-white border border-amber-300 p-8 max-w-lg mx-auto text-center relative overflow-hidden my-8">
        <GridPattern />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block mb-1">
            ACCOUNT INACTIVE / SUSPENDED
          </span>
          <h2 className="text-lg font-black text-[#0B2346] mb-2">
            Administrative Clearance Suspended
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            Your account status is currently marked as <strong className="font-mono uppercase">{profile?.status || 'SUSPENDED'}</strong>. Administrative mutations and subsystem read access are locked until resolved by root governance.
          </p>
          <button
            onClick={() => navigate('')}
            className="px-4 py-2 bg-[#0B2346] text-white text-xs font-bold hover:bg-[#07162c] cursor-pointer"
          >
            Exit to Home
          </button>
        </div>
      </div>
    );
  }

  // 3. Subsystem Granular Permission Check
  if (requiredPermission && !isSuperAdmin && !hasPermission(requiredPermission)) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-8 max-w-lg mx-auto text-center relative overflow-hidden my-8 shadow-sm">
        <GridPattern />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
            HTTP 403 • INSUFFICIENT SUB-SYSTEM PRIVILEGES
          </span>
          <h2 className="text-lg font-black text-[#0B2346] mb-2">
            Privilege Boundary Enforced
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            Your staff credentials do not grant the required privilege to access or mutate this administrative subsystem.
          </p>

          <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] text-start font-mono text-xs space-y-1.5 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Required Grant:</span>
              <span className="font-bold text-red-700">{requiredPermission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Assigned Roles:</span>
              <span className="font-bold text-[#0B2346]">{profile?.roles?.join(', ')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('admin')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B2346] text-white text-xs font-bold hover:bg-[#07162c] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Command Overview
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
