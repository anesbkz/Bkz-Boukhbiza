import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { EntitlementType } from '@/types/entitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Lock, QrCode, Loader2 } from 'lucide-react';
import { getAppTranslations } from '@/lib/i18n/appTranslations';

interface CustomerRouteGuardProps {
  children: React.ReactNode;
  requiredEntitlement?: EntitlementType;
}

export const CustomerRouteGuard: React.FC<CustomerRouteGuardProps> = ({
  children,
  requiredEntitlement,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { navigate, locale } = useI18n();
  const t = getAppTranslations(locale);
  const {
    loading: entLoading,
    hasCommunityAccess,
    hasSchoolAccess,
  } = useCustomerEntitlements();

  if (authLoading || (user && entLoading)) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
        {t.common.verifying}
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="py-16 bg-[#F5F7FA]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
            <Lock className="w-8 h-8 text-[#0B2346] mx-auto mb-3" />
            <h1 className="text-xl font-bold text-[#0B2346] mb-2">
              {t.shell.authRequiredTitle}
            </h1>
            <p className="text-xs text-gray-600 mb-6">
              {t.shell.authRequiredDesc}
            </p>
            <Button
              onClick={() => navigate('login')}
              variant="primary"
              size="md"
              className="w-full justify-center"
            >
              {t.common.signIn}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check specific entitlement gate if requested
  if (requiredEntitlement === 'COMMUNITY_ACCESS' && !hasCommunityAccess) {
    return (
      <div className="py-16 bg-[#F5F7FA]">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-white border border-[#E2E8F0] p-8 sm:p-10 shadow-sm relative">
            <GridPattern />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F28C28] font-bold block mb-1">
                {t.common.locked}: {t.shell.navCommunity}
              </span>
              <h2 className="text-xl font-black text-[#0B2346] mb-3">
                {t.community.lockedTitle}
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                {t.community.lockedDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="md"
                  className="cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t.dashboard.activateProductBtn}</span>
                </Button>
                <Button
                  onClick={() => navigate('app')}
                  variant="outline"
                  size="md"
                  className="cursor-pointer justify-center"
                >
                  {t.common.returnHome}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requiredEntitlement === 'SCHOOL_ACCESS' && !hasSchoolAccess) {
    return (
      <div className="py-16 bg-[#F5F7FA]">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-white border border-[#E2E8F0] p-8 sm:p-10 shadow-sm relative">
            <GridPattern />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F28C28] font-bold block mb-1">
                {t.common.locked}: {t.shell.navSchool}
              </span>
              <h2 className="text-xl font-black text-[#0B2346] mb-3">
                {t.school.lockedTitle}
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                {t.school.lockedDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="md"
                  className="cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t.dashboard.activateProductBtn}</span>
                </Button>
                <Button
                  onClick={() => navigate('app')}
                  variant="outline"
                  size="md"
                  className="cursor-pointer justify-center"
                >
                  {t.common.returnHome}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
