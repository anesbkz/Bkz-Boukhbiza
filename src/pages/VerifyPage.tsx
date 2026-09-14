import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  verifyContainerCode,
  VerificationResult,
} from '@/services/productCodeService';
import {
  Shield,
  QrCode,
  CheckCircle2,
  Lock,
  AlertTriangle,
  BookOpen,
  Users,
  Calendar,
  Loader2,
  XCircle,
  Clock,
} from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { locale, navigate } = useI18n();
  const t = getPublicTranslations(locale);
  const v = t.verify;

  const [code, setCode] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Check URL query parameters on mount (e.g. from QR code scan: /verify?code=ZR-PH01-...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode && urlCode.trim()) {
        const clean = urlCode.trim().toUpperCase();
        setCode(clean);
      }
    } catch {
      // Ignore URL parsing errors in sandboxed environments
    }
  }, []);

  const executeVerification = async (codeToVerify: string) => {
    const clean = codeToVerify.trim().toUpperCase();
    if (!clean) return;

    setIsLoading(true);
    setHasSubmitted(true);
    setErrorMessage(null);
    setVerifyResult(null);

    try {
      const res = await verifyContainerCode(clean);
      setVerifyResult(res);
    } catch (err: unknown) {
      // Authoritative verification rule: If Cloud Functions are unavailable or fail,
      // a product code MUST NEVER be considered authentic merely because it matches a prefix or pattern.
      // Return a neutral verification-unavailable error.
      setVerifyResult({
        isValid: false,
        isAuthentic: false,
        message:
          locale === 'ar'
            ? 'خدمة التحقق من الأصالة غير متاحة حالياً. يُرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'
            : locale === 'fr'
            ? 'Le service de vérification officiel est temporairement indisponible. Veuillez vérifier votre connexion et réessayer.'
            : 'Authoritative verification service is temporarily unavailable. Please check your connection and try again.',
      });
      setErrorMessage(
        locale === 'ar'
          ? 'تعذر الوصول إلى سجل التشفير المعتمد حالياً.'
          : locale === 'fr'
          ? 'Impossible de joindre le registre officiel de sérialisation.'
          : 'Unable to reach the authoritative product serialization registry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    executeVerification(code);
  };

  const handleUseDemoCode = () => {
    const demo = 'ZR-PH01-DEMO-001';
    setCode(demo);
    executeVerification(demo);
  };

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                <Shield className="w-3.5 h-3.5 text-[#0B2346]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold">
                  {v.badge}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('verify/certificate')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-[#0B2346] border border-blue-200 text-[10px] font-mono uppercase font-bold hover:bg-blue-100 cursor-pointer"
              >
                <span>
                  {locale === 'ar'
                    ? 'التحقق من الشهادات والاعتمادات التعليمية ←'
                    : locale === 'fr'
                    ? 'Vérifier un Certificat d’Études ←'
                    : 'Verify Educational Certificate ←'}
                </span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              {v.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
              {v.subtitle}
            </p>
          </div>
        </section>

        {/* SECTION 2: VERIFICATION TERMINAL */}
        <section className="bg-white border-2 border-[#0B2346] p-6 sm:p-10 shadow-sm relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                {locale === 'ar' ? 'حالة المنظومة: جاهزة للاستعلام' : locale === 'fr' ? 'STATUT TERMINAL : PRÊT' : 'TERMINAL STATUS: READY'}
              </span>
              <h2 className="text-xl font-bold text-[#0B2346]">
                {locale === 'ar' ? 'أدخل الرمز التسلسلي المكون من 16 خانة' : locale === 'fr' ? 'Saisissez le Code Sérialisé à 16 Caractères' : 'Enter 16-Character Serialized Code'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleUseDemoCode}
              className="text-xs font-mono text-[#0B2346] hover:underline bg-gray-100 px-3 py-1.5 border border-gray-200 cursor-pointer self-start lg:self-auto"
            >
              {v.useDemoCodeBtn}: ZR-PH01-DEMO-001
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="verification-code-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2"
              >
                {v.inputLabel} ({locale === 'ar' ? 'النمط:' : locale === 'fr' ? 'Format :' : 'Format:'} ZR-XXXX-XXXX-XXXX)
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="verification-code-input"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setHasSubmitted(false);
                  }}
                  placeholder={v.inputPlaceholder}
                  className="flex-1 px-4 py-3 bg-[#F5F7FA] border border-[#E2E8F0] font-mono text-base uppercase tracking-wider text-[#0B2346] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2346] transition-colors"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="shrink-0 cursor-pointer"
                  disabled={!code.trim()}
                >
                  <Shield className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{v.verifyBtn}</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsQrModalOpen(true)}
                  className="shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{v.scanQrBtn}</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Verification Result Feedback */}
          {isLoading && (
            <div className="mt-8 p-6 bg-gray-50 border border-gray-200 flex items-center justify-center gap-3 text-[#0B2346]">
              <Loader2 className="w-5 h-5 animate-spin text-[#0B2346]" />
              <span className="font-mono text-xs uppercase font-bold tracking-wider">
                {locale === 'ar' ? 'جارٍ التحقق من سجل التشفير المصنعي...' : locale === 'fr' ? 'Vérification du registre cryptographique...' : 'Querying Authoritative Serialization Registry...'}
              </span>
            </div>
          )}

          {!isLoading && hasSubmitted && verifyResult && (
            <div
              className={`mt-8 p-6 border space-y-4 ${
                !verifyResult.isAuthentic || !verifyResult.isValid
                  ? 'bg-red-50/80 border-red-200'
                  : verifyResult.isActivated || verifyResult.status === 'ACTIVATED'
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-emerald-50/80 border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {!verifyResult.isAuthentic || !verifyResult.isValid ? (
                  <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                ) : verifyResult.isActivated || verifyResult.status === 'ACTIVATED' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                )}

                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#0B2346] text-sm uppercase font-mono">
                      {locale === 'ar' ? 'نتيجة التحقق للرمز:' : locale === 'fr' ? 'Code analysé :' : 'Query Logged:'} {code}
                    </span>
                    {!verifyResult.isAuthentic || !verifyResult.isValid ? (
                      <Badge variant="red">
                        {locale === 'ar' ? 'غير موثق / ملغى' : locale === 'fr' ? 'NON CONFORME' : 'UNVERIFIED / INVALID'}
                      </Badge>
                    ) : verifyResult.isActivated || verifyResult.status === 'ACTIVATED' ? (
                      <Badge variant="amber">
                        {locale === 'ar' ? 'مفعل مسبقاً' : locale === 'fr' ? 'DÉJÀ ACTIVÉ' : 'PREVIOUSLY ACTIVATED'}
                      </Badge>
                    ) : (
                      <Badge variant="emerald">{v.verifiedStatus}</Badge>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed font-medium">
                    {!verifyResult.isAuthentic || !verifyResult.isValid
                      ? verifyResult.message || (locale === 'ar'
                          ? 'لم نتمكن من مطابقة هذا الرمز في السجل التسلسلي المعتمد. يرجى التأكد من كشط الرمز بشكل صحيح.'
                          : locale === 'fr'
                          ? 'Ce code ne correspond à aucun flacon authentifié. Veuillez vérifier le code sous le sceau.'
                          : 'This code could not be verified against the official serialization registry. Please inspect your security label.')
                      : verifyResult.isActivated || verifyResult.status === 'ACTIVATED'
                      ? (locale === 'ar'
                          ? 'تنبيه الأمان: هذه العبوة تم تفعيلها وتسجيلها مسبقاً في المنظومة. إذا كانت هذه عبوة جديدة ومشتراة حديثاً، يرجى فحص سلامة شريط الأمان.'
                          : locale === 'fr'
                          ? 'Avertissement : Ce flacon a déjà été activé sur la plateforme. Si vous venez de l’acquérir scellé, vérifiez l’état du sceau de sécurité.'
                          : 'Security Notice: This container was already activated in the platform. If you purchased this brand new, check the tamper-evident collar seal.')
                      : v.verifiedBody}
                  </p>

                  <div className="p-3 bg-white border border-gray-200 font-mono text-[11px] text-gray-600 space-y-1">
                    {verifyResult.verificationId && (
                      <div>{locale === 'ar' ? 'معرّف الاستعلام:' : locale === 'fr' ? 'ID Requête :' : 'Query ID:'} {verifyResult.verificationId}</div>
                    )}
                    {verifyResult.productSku && (
                      <div>{locale === 'ar' ? 'المنتج:' : locale === 'fr' ? 'Produit :' : 'Product SKU:'} <strong className="text-[#0B2346]">{verifyResult.productSku}</strong></div>
                    )}
                    {verifyResult.batchNumber && (
                      <div>{locale === 'ar' ? 'رقم الدفعة:' : locale === 'fr' ? 'N° Lot :' : 'Batch Number:'} {verifyResult.batchNumber}</div>
                    )}
                    <div>
                      {locale === 'ar' ? 'حالة التشفير:' : locale === 'fr' ? 'Statut Validation :' : 'Validation Status:'}{' '}
                      <strong className={verifyResult.isAuthentic && verifyResult.isValid ? 'text-emerald-700' : 'text-red-700'}>
                        {verifyResult.isAuthentic && verifyResult.isValid
                          ? (locale === 'ar' ? 'معتمد وموثق' : 'PASS (GENUINE VIREXON SPECIFICATION)')
                          : (locale === 'ar' ? 'فشل التحقق' : 'FAIL (UNVERIFIED SERIAL)')}
                      </strong>
                    </div>
                    <div>{locale === 'ar' ? 'النطاق الجغرافي: الجزائر (58 ولاية)' : locale === 'fr' ? 'Marché cible : ALGÉRIE (DZD)' : 'Target Market: ALGERIA (DZD)'}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex flex-wrap gap-3">
                {verifyResult.isAuthentic && verifyResult.isValid && !verifyResult.isActivated && verifyResult.status !== 'ACTIVATED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('app/products/activate')}
                    className="cursor-pointer"
                  >
                    {v.activateBtn}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCode('');
                    setHasSubmitted(false);
                    setVerifyResult(null);
                  }}
                  className="cursor-pointer"
                >
                  {locale === 'ar' ? 'التحقق من عبوة أخرى' : locale === 'fr' ? 'Vérifier un Autre Flacon' : 'Verify Another Container'}
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: WHERE TO FIND YOUR CODE & TAMPER SEAL */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0B2346]">
              {locale === 'ar' ? 'أين تجد رمز الأمان الخاص بك' : locale === 'fr' ? 'Où Trouver Votre Code' : 'Where to Locate Your Code'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'تحتوي كل عبوة أصلية من ZIRON على ملصق أمان فردي يقع مباشرة أسفل طوق العنق. اكشط الطبقة الفضية الواقية برفق باستخدام عملة معدنية لكشف الرمز المكون من 16 خانة.'
                : locale === 'fr'
                ? 'Chaque flacon ZIRON authentique comporte une étiquette de sécurité individualisée située juste sous le col. Grattez délicatement le revêtement protecteur avec une pièce pour révéler votre code de 16 caractères.'
                : 'Every genuine ZIRON container features an individualized security label positioned directly beneath the neck collar. Scratch off the opaque protective coating gently with a coin to reveal your 16-character code.'}
            </p>
            <div className="p-3 bg-gray-50 border border-gray-200 font-mono text-xs text-gray-700">
              Format: ZR-XXXX-XXXX-XXXX (Alphanumeric)
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0B2346]">
              {v.securityTitle}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {v.securityDesc}
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>{locale === 'ar' ? 'المرحلة 01: شريط أحمر للأمان' : locale === 'fr' ? 'Phase 01 : Sceau de Sécurité Rouge' : 'Phase 01: Red Security Seal'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>{locale === 'ar' ? 'المرحلة 02: شريط برتقالي للأمان' : locale === 'fr' ? 'Phase 02 : Sceau de Sécurité Orange' : 'Phase 02: Orange Security Seal'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{locale === 'ar' ? 'المرحلة 03: شريط أخضر للأمان' : locale === 'fr' ? 'Phase 03 : Sceau de Sécurité Vert' : 'Phase 03: Green Security Seal'}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION 4: WHAT VERIFICATION UNLOCKS */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
              {locale === 'ar' ? 'الاستحقاقات الرقمية' : locale === 'fr' ? 'DROITS NUMÉRIQUES' : 'DIGITAL ENTITLEMENTS'}
            </span>
            <h2 className="text-2xl font-black text-[#0B2346] tracking-tight">
              {locale === 'ar' ? 'ماذا يمنحك التحقق الموثق' : locale === 'fr' ? 'Ce Que Débloque la Vérification' : 'What Happens After Verification'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {locale === 'ar'
                ? 'يربط التحقق بين روتينك الغذائي الفيزيائي وبين إمكانيات المنصة الرقمية الآمنة:'
                : locale === 'fr'
                ? 'La vérification relie votre routine nutritionnelle physique aux fonctionnalités numériques sécurisées :'
                : 'Verification bridges your physical nutritional routine with secure digital platform capabilities:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Shield className="w-6 h-6 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase text-[#0B2346]">
                {locale === 'ar' ? 'فحص الأصالة' : locale === 'fr' ? 'Contrôle d’Authenticité' : 'Authenticity Check'}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تأكيد بأن العبوة أنتجت وفق معايير VIREXON ولم تتعرض للتزوير أو التلاعب.'
                  : locale === 'fr'
                  ? 'Confirmation que le flacon respecte les normes certifiées VIREXON et n’a pas été contrefait.'
                  : 'Confirmation that your container was produced under documented VIREXON standards and was not subject to counterfeit duplication.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Calendar className="w-6 h-6 text-[#0B2346]" />
              <h4 className="text-xs font-bold uppercase text-[#0B2346]">
                {locale === 'ar' ? 'الرفيق اليومي' : locale === 'fr' ? 'Compagnon Quotidien' : 'Daily Companion'}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تفعيل متتبع الالتزام لمدة 30 يومًا، وتذكيرات الجرعة الصباحية ومتابعة شرب الماء.'
                  : locale === 'fr'
                  ? 'Active votre suivi de régularité sur 30 jours et les rappels matinaux dans le portail ZIRON.'
                  : 'Activates your 30-day streak tracker, morning intake reminder logs, and hydration tracking metrics inside ZIRON Hub.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <BookOpen className="w-6 h-6 text-[#0B2346]" />
              <h4 className="text-xs font-bold uppercase text-[#0B2346]">
                {locale === 'ar' ? 'مدرسة ZIRON' : locale === 'fr' ? 'ZIRON School' : 'ZIRON School'}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'فتح المناهج التعليمية المتقدمة في بناء العادات والانضباط والمهارات الحياتية.'
                  : locale === 'fr'
                  ? 'Ouvre l’accès aux modules pratiques de formation aux habitudes, à l’énergie et aux compétences clés.'
                  : 'Unlocks access to practical curriculum modules covering habit formation, circadian health, digital skills, and trade ventures.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Users className="w-6 h-6 text-[#0B2346]" />
              <h4 className="text-xs font-bold uppercase text-[#0B2346]">
                {locale === 'ar' ? 'مجتمع الأقران' : locale === 'fr' ? 'Cohorte Communautaire' : 'Community Cohort'}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'منح حق المشاركة والتفاعل في غرف الدعم المتبادل للمشاركين المعتمدين.'
                  : locale === 'fr'
                  ? 'Permet d’échanger dans les groupes d’entraide et de soutien entre pairs vérifiés.'
                  : 'Grants participant posting rights within moderated peer cohort rooms for ongoing mutual accountability.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: SAFETY & INTEGRITY WARNING */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="flex items-start gap-4 text-amber-900">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs leading-relaxed">
              <h3 className="text-sm font-bold text-amber-900 uppercase">
                {locale === 'ar' ? 'تحذير أمان جوهري والإبلاغ' : locale === 'fr' ? 'Avertissement de Sécurité & Signalement' : 'Critical Safety Warning & Support Reporting'}
              </h3>
              <p>
                <strong>{locale === 'ar' ? 'لا تتناول المنتج:' : locale === 'fr' ? 'NE PAS CONSOMMER :' : 'DO NOT CONSUME:'}</strong>{' '}
                {locale === 'ar'
                  ? 'إذا وصلك المنتج وكان شريط الأمان مكسورًا أو ممزقًا أو أعيد لصقه، لا تفتح العبوة ولا تتناول الكبسولات. ارفض استلام الطرد وأبلغ فريق الدعم على الفور.'
                  : locale === 'fr'
                  ? 'Si le sceau de sécurité est rompu, déchiré ou recollé à la réception, n’ouvrez pas le flacon et ne consommez pas les gélules. Refusez le colis et contactez l’assistance immédiatement.'
                  : 'If the neck seal appears broken, sliced, torn, or re-adhered upon delivery, do not open the inner container or consume the capsules. Refuse delivery or contact our support team immediately.'}
              </p>
              <p>
                <strong>{locale === 'ar' ? 'الإبلاغ عن رموز غير صالحة:' : locale === 'fr' ? 'SIGNALER UN CODE INVALIDE :' : 'REPORT INVALID CODES:'}</strong>{' '}
                {locale === 'ar'
                  ? 'إذا تم رفض الرمز أو ذُكر أنه مسجل مسبقًا، احتفظ بالعبوة وتواصل فورًا مع أمان VIREXON برقم طلبك لإجراء تحقيق فوري.'
                  : locale === 'fr'
                  ? 'Si le code est indiqué comme déjà enregistré ou non valide, conservez l’emballage et contactez la sécurité VIREXON avec votre numéro de commande.'
                  : 'If your code is flagged as already registered or invalid, immediately retain the container packaging and contact VIREXON Security Support with your order confirmation number for investigation.'}
              </p>
            </div>
          </div>
        </section>

        {/* QR SCAN MODAL */}
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white max-w-md w-full p-6 border border-[#E2E8F0] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#0B2346]" />
                  <span className="font-bold text-sm text-[#0B2346]">
                    {v.qrModalTitle}
                  </span>
                </div>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-gray-100 border border-dashed border-gray-300 mx-auto flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-sm font-bold text-[#0B2346]">{v.qrModalTitle}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {v.qrModalDesc}
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsQrModalOpen(false);
                      handleUseDemoCode();
                    }}
                    className="w-full cursor-pointer"
                  >
                    {locale === 'ar' ? 'محاكاة المسح برمز تجريبي' : locale === 'fr' ? 'Simuler le Scan avec Code Démo' : 'Simulate Scan with Demo Code'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

