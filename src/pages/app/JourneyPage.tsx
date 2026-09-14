import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import {
  Compass,
  CheckCircle2,
  GraduationCap,
  MessageSquare,
  QrCode,
  Clock,
} from 'lucide-react';

export const JourneyPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { navigate, locale, dir } = useI18n();
  const t = getAppTranslations(locale);
  const {
    loading,
    hasActivatedProduct,
    hasCommunityAccess,
    hasSchoolAccess,
    activations,
    entitlements,
    latestActivation,
  } = useCustomerEntitlements();

  const startDate = latestActivation?.activatedAt
    ? new Date(latestActivation.activatedAt).toLocaleDateString()
    : null;

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA]" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Journey Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Compass className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{t.journey.headerBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {t.journey.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                {t.journey.subtitle}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {!hasActivatedProduct ? (
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="md"
                  className="bg-[#F28C28] hover:bg-[#e07b1d] text-white border-none cursor-pointer inline-flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t.dashboard.activateProductBtn}</span>
                </Button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-start">
                  <div className="text-[10px] font-mono font-bold uppercase text-emerald-800">
                    {t.journey.statusActive}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    {startDate ? `${t.journey.startedDate}: ${startDate}` : t.shell.participant}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Activation Status & Phase Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phase 01: Foundation */}
          <div className={`bg-white border p-6 flex flex-col justify-between shadow-xs ${hasActivatedProduct ? 'border-[#0B2346]' : 'border-[#E2E8F0]'}`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-blue-50 text-[#0B2346]">
                  {t.journey.phaseDays}
                </span>
                {hasActivatedProduct ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.products.linkedEntitlements}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-gray-400">0/1</span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                {t.journey.phase1Title}
              </h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {t.journey.phase1Desc}
              </p>
            </div>
            <div className="text-xs font-mono text-gray-500">
              {hasActivatedProduct ? t.journey.currentStage : t.shell.lockHintCommunity}
            </div>
          </div>

          {/* Phase 02: Regeneration */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between opacity-85 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600">
                  {t.journey.phaseDays}
                </span>
                <span className="text-[10px] font-mono text-gray-400">0/2</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                {t.journey.phase2Title}
              </h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {t.journey.phase2Desc}
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400">
              {locale === 'ar' ? 'يتطلب تفعيل عبوة إضافية' : locale === 'fr' ? 'Nécessite l\'activation d\'un flacon supplémentaire' : 'Requires additional container activation'}
            </div>
          </div>

          {/* Phase 03: Mastery */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between opacity-85 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600">
                  {t.journey.phaseDays}
                </span>
                <span className="text-[10px] font-mono text-gray-400">0/3</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                {t.journey.phase3Title}
              </h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {t.journey.phase3Desc}
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400">
              {locale === 'ar' ? 'يتطلب 3 عبوات مفعّلة' : locale === 'fr' ? 'Nécessite 3 flacons vérifiés' : 'Requires 3 verified containers'}
            </div>
          </div>
        </div>

        {/* Available Resources & Next Steps */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-[#0B2346]">{t.journey.resourcesTitle}</h2>
            <p className="text-xs text-gray-500">
              {t.journey.resourcesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Learning Resource */}
            <div className="p-4 border border-[#E2E8F0] bg-gray-50/50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#0B2346]" />
                  <span className="text-xs font-bold text-[#0B2346]">{t.journey.learningCardTitle}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t.journey.learningCardDesc}
                </p>
              </div>
              <Button
                onClick={() => navigate('app/school')}
                variant="outline"
                size="sm"
                className="shrink-0 cursor-pointer"
              >
                {hasSchoolAccess ? t.school.viewCurriculumBtn : t.common.locked}
              </Button>
            </div>

            {/* Community Resource */}
            <div className="p-4 border border-[#E2E8F0] bg-gray-50/50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2E9E45]" />
                  <span className="text-xs font-bold text-[#0B2346]">{t.journey.communityCardTitle}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t.journey.communityCardDesc}
                </p>
              </div>
              <Button
                onClick={() => navigate('app/community')}
                variant="outline"
                size="sm"
                className="shrink-0 cursor-pointer"
              >
                {hasCommunityAccess ? t.community.newPostBtn : t.common.locked}
              </Button>
            </div>
          </div>
        </div>

        {/* Future Milestones: Clean empty state */}
        <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B2346]">
              {t.journey.milestonesTitle}
            </h2>
            <span className="text-[10px] font-mono text-gray-400">{t.journey.currentStage}</span>
          </div>

          {!hasActivatedProduct ? (
            <div className="p-8 text-center bg-[#F5F7FA] border border-dashed border-[#E2E8F0]">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-[#0B2346] mb-1">
                {t.journey.milestonesEmptyTitle}
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-4 leading-relaxed">
                {t.journey.milestonesEmptyDesc}
              </p>
              <Button
                onClick={() => navigate('app/products/activate')}
                variant="primary"
                size="sm"
                className="cursor-pointer inline-flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{t.dashboard.activateProductBtn}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#0B2346]">
                    {t.journey.verificationComplete}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    <span dir="ltr">ZIRON</span> {latestActivation?.code ? `• ${latestActivation.code}` : ''} {startDate ? `(${startDate})` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-dashed border-gray-300">
                <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-gray-700">
                    {t.journey.day30Review}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {t.rewards.checkpoint30Desc}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
