import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { activateProductCode } from '@/services/entitlementService';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import {
  QrCode,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Package,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';

export const ActivateProductPage: React.FC = () => {
  const { profile } = useAuth();
  const { locale, dir, navigate } = useI18n();
  const t = getAppTranslations(locale);
  const { refresh, qualifyingContainerCount } = useCustomerEntitlements();

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    code: string;
    productSku: string;
    entitlements: string[];
  } | null>(null);

  // Check URL query parameters on mount (e.g. redirected from /verify: /app/products/activate?code=ZR-...)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode && urlCode.trim()) {
        setCode(urlCode.trim().toUpperCase());
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessData(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg(t.activate.invalidCodeError);
      return;
    }

    if (!profile) {
      setErrorMsg(t.shell.authRequiredDesc);
      return;
    }

    setSubmitting(true);
    try {
      const result = await activateProductCode(cleanCode, profile);
      setSuccessData({
        code: cleanCode,
        productSku: result.activation.productSku || 'ZIRON Bio-Formulation',
        entitlements: result.activation.entitlementsGranted || [
          'COMMUNITY_ACCESS',
          'SCHOOL_ACCESS',
        ],
      });
      setCode('');
      // Refresh user profile and entitlements state
      await refresh();
    } catch (err: unknown) {
      const error = err as { message?: string };
      const rawMessage = error.message || 'Activation failed';
      
      // Categorize common server-authoritative error conditions
      if (rawMessage.toLowerCase().includes('already activated') || rawMessage.toLowerCase().includes('already been activated')) {
        setErrorMsg(t.activate.alreadyActivatedError);
      } else if (rawMessage.toLowerCase().includes('not found') || rawMessage.toLowerCase().includes('invalid')) {
        setErrorMsg(t.activate.invalidCodeError);
      } else {
        setErrorMsg(rawMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#F5F7FA]" dir={dir}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E2E8F0] shadow-xs">
            <Shield className="w-3.5 h-3.5 text-[#0B2346]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0B2346]">
              {t.activate.tamperSealBadge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
            {t.activate.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            {t.activate.subtitle}
          </p>
        </div>

        {/* Success Banner */}
        {successData && (
          <div className="bg-white border-2 border-emerald-500 p-6 sm:p-8 shadow-sm relative animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 block mb-0.5">
                    {t.activate.successBadge}
                  </span>
                  <h2 className="text-xl font-black text-[#0B2346]">
                    {t.activate.successTitle}
                  </h2>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {t.activate.successDesc}{' '}
                    <span dir="ltr" className="font-mono font-bold text-[#0B2346]">{successData.code}</span>
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 space-y-2">
                  <div className="text-[10px] font-mono uppercase font-bold text-gray-500">
                    {t.activate.grantedEntitlements}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5">
                      <MessageSquare className="w-3 h-3 text-[#2E9E45]" />
                      COMMUNITY_ACCESS
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5">
                      <GraduationCap className="w-3 h-3 text-[#0B2346]" />
                      SCHOOL_ACCESS ({Math.min(qualifyingContainerCount, 3)}/3)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => navigate('app')}
                    variant="primary"
                    size="md"
                    className="cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <span>{t.activate.goToDashboardBtn}</span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => navigate('app/community')}
                    variant="outline"
                    size="md"
                    className="cursor-pointer justify-center"
                  >
                    {t.activate.enterCommunityBtn}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Form Card */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-10 shadow-xs relative">
          <GridPattern />
          <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="product-activation-code-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2"
                >
                  {t.activate.inputLabel}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="product-activation-code-input"
                    dir="ltr"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={t.activate.inputPlaceholder}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-[#E2E8F0] font-mono text-sm uppercase tracking-wider text-[#0B2346] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2346] focus:border-[#0B2346] transition-colors text-start"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={submitting || !code.trim()}
                    className="bg-[#0B2346] cursor-pointer inline-flex items-center justify-center gap-2 shrink-0"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.activate.verifyingBtn}</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>{t.activate.submitBtn}</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-gray-500 font-mono">
                  {locale === 'ar'
                    ? 'ابحث عن الرمز الأبجدي الرقمي المكون من 12 إلى 16 حرفاً على شريط الأمان الفضي للعبوة.'
                    : locale === 'fr'
                    ? 'Recherchez le code alphanumérique de 12 à 16 caractères sur le sceau inviolable de votre flacon.'
                    : 'Look for the 12 to 16-character alphanumeric code on your container\'s tamper-evident foil seal.'}
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{errorMsg}</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Verification Architecture Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white border border-[#E2E8F0] space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-[#0B2346]">
              <Shield className="w-4 h-4 text-[#0B2346]" />
              <span>{t.activate.containerSpecsTitle}</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              {t.activate.containerSpecsDesc}
            </p>
          </div>

          <div className="p-4 bg-white border border-[#E2E8F0] space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-[#0B2346]">
              <Package className="w-4 h-4 text-[#0B2346]" />
              <span>
                {locale === 'ar'
                  ? 'منح فوري للصلاحيات'
                  : locale === 'fr'
                  ? 'Attribution instantanée des droits'
                  : 'Instant Entitlement Provisioning'}
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              {locale === 'ar'
                ? 'بمجرد التحقق، يحصل ملفك على COMMUNITY_ACCESS مع تسجيل تقدم تفعيل العبوات لفتح مدرسة ZIRON عند بلوغ 3 عبوات.'
                : locale === 'fr'
                ? 'Une fois vérifié, votre profil reçoit COMMUNITY_ACCESS et enregistre la progression pour l\'accès à l\'École ZIRON (3 flacons requis).'
                : 'Once verified, your profile receives COMMUNITY_ACCESS and records container activation progress toward unlocking ZIRON School (3 containers required).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
