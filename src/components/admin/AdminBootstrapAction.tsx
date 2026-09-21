import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { invokeBootstrapGovernance, isBootstrapOwner, getBootstrapOwnerEmail } from '@/services/userService';
import { Button } from '@/components/design-system/Button';
import { ShieldCheck, ShieldAlert, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminBootstrapActionProps {
  onSuccess?: () => void;
  className?: string;
}

export const AdminBootstrapAction: React.FC<AdminBootstrapActionProps> = ({
  onSuccess,
  className = '',
}) => {
  const { user, isSuperAdmin, refreshProfile } = useAuth();
  const { navigate, locale } = useI18n();

  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [alreadyInitialized, setAlreadyInitialized] = useState(false);

  // 1 & 2. Allow ONLY the authenticated configured bootstrap owner account
  const configuredEmail = getBootstrapOwnerEmail();
  const isOwner = isBootstrapOwner(user?.email);

  // 7. If governance is already active for this account, or caller is not bootstrap owner, do not expose
  if (!user || !isOwner || isSuperAdmin) {
    return null;
  }

  const handleClaimSuperAdmin = async () => {
    if (!user || !isOwner) return;

    setIsInitializing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 4. Call authoritative initializeBootstrapGovernance Cloud Function
      const result = await invokeBootstrapGovernance();
      
      // 5. Success state
      setSuccessMessage(
        result.message || 'Permanent SUPER_ADMIN established. Bootstrap path closed.'
      );

      // 6. Refresh authentication and role state, then continue to admin dashboard
      await refreshProfile();

      setTimeout(() => {
        navigate('admin');
        onSuccess?.();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      
      // 7. Detect if governance is already initialized
      if (
        msg.includes('uninitialized system deployment') ||
        msg.includes('permission-denied') ||
        msg.includes('already initialized') ||
        msg.includes('closed')
      ) {
        setAlreadyInitialized(true);
        setError(
          locale === 'ar'
            ? 'تمت تهيئة الحوكمة مسبقًا على هذا النظام. تم إغلاق مسار التهيئة الأولية بشكل دائم.'
            : locale === 'fr'
            ? 'La gouvernance a déjà été initialisée sur ce déploiement. La voie d’amorçage initiale est définitivement clôturée.'
            : 'Governance has already been initialized on this deployment. The initial bootstrap path is permanently sealed.'
        );
      } else {
        setError(msg);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  if (alreadyInitialized) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 text-left ${className}`}>
        <div className="flex items-center gap-2 text-gray-700 font-bold text-xs mb-1">
          <ShieldAlert className="w-4 h-4 text-gray-500 shrink-0" />
          <span>Governance Already Initialized</span>
        </div>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          The initial root governance bootstrap pathway has already been completed and sealed. Administrative access is now governed strictly by authoritative Firestore roles.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-5 bg-gradient-to-b from-blue-50/80 to-white border border-blue-200 text-left shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-[#0B2346] text-white flex items-center justify-center shrink-0 mt-0.5">
          <KeyRound className="w-4 h-4" />
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block">
              INITIAL DEPLOYMENT BOOTSTRAP DETECTED
            </span>
            <h3 className="text-sm font-black text-[#0B2346]">
              Bootstrap Owner Identity Verified
            </h3>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Your authenticated session (
            <strong className="font-mono text-[#0B2346]">{user.email}</strong>
            ) matches the configured system bootstrap administrator (
            <span className="font-mono text-gray-500">{configuredEmail}</span>
            ). Initialize root governance to claim permanent{' '}
            <strong className="font-mono text-[#0B2346]">SUPER_ADMIN</strong> authority and seal the deployment.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Authority Granted</span>
                <span className="text-[11px] leading-tight block">{successMessage}</span>
                <span className="text-[10px] font-mono text-emerald-600 block pt-1">
                  Reloading security credentials and entering Command Center...
                </span>
              </div>
            </div>
          )}

          {!successMessage && (
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isInitializing}
                onClick={handleClaimSuperAdmin}
                className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 bg-[#0B2346] hover:bg-[#07162c] text-white"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initializing Governance & Provisioning SUPER_ADMIN...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Initialize Governance / Claim Super Admin Access</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
