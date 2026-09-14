import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { RESTART_FUND_TRANSLATIONS } from '@/lib/i18n/restartFundTranslations';
import { RestartSubNav } from '@/components/navigation/RestartSubNav';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  Coins,
  ShieldCheck,
  Lock,
  Sparkles,
  GraduationCap,
  Award,
  Briefcase,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  HelpCircle,
  Home,
  ShoppingBag,
  BookOpen,
  DollarSign,
  Heart,
  FileCheck,
  Compass,
} from 'lucide-react';

export const RestartFundPage: React.FC = () => {
  const { locale, navigate } = useI18n();
  const { user } = useAuth();
  const t = RESTART_FUND_TRANSLATIONS[locale];

  const isArabic = locale === 'ar';
  const isFrench = locale === 'fr';

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    living: ShoppingBag,
    housing: Home,
    education: BookOpen,
    employment: Briefcase,
    obligations: DollarSign,
    activity: Compass,
    family: Heart,
    newstart: Sparkles,
  };

  return (
    <div id="restart-fund-page" className="min-h-screen bg-[#FDFDFD] text-gray-900 pb-20">
      {/* Sub-Navigation Ribbon */}
      <RestartSubNav activeItem="fund" />

      {/* SECTION 1 — HERO */}
      <section
        id="restart-fund-hero"
        className="relative bg-[#07172C] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20 overflow-hidden"
      >
        <GridPattern className="opacity-15" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Eyebrow & Status Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.hero.eyebrow}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3 text-rose-400" />
              <span>{t.hero.statusBadge}</span>
            </span>

            <span className="hidden sm:inline-block text-[11px] font-mono text-gray-400">
              {t.hero.protocolRef}
            </span>
          </div>

          {/* Main Headline */}
          <h1
            id="restart-fund-main-headline"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-mono"
          >
            {t.hero.headline}
          </h1>

          {/* Supporting Message */}
          <p
            id="restart-fund-supporting-message"
            className="text-lg sm:text-xl text-amber-100/90 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            {t.hero.supportingMessage}
          </p>

          {/* Closed Status Notice Bar */}
          <div className="max-w-2xl mx-auto p-3.5 bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span id="restart-fund-hero-status-notice">{t.hero.statusNotice}</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* SECTION 2 — WHAT IS THE RESTART FUND? */}
        <section id="what-is-restart-fund" className="space-y-6">
          <div className="space-y-2 text-start">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-700 font-bold tracking-wider">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.whatIs.tag}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {t.whatIs.title}
            </h2>
            <p className="text-gray-700 leading-relaxed max-w-4xl text-base">
              {t.whatIs.description}
            </p>
          </div>

          {/* Core Progression Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-gray-600 font-bold">
              {t.whatIs.coreProgressionTitle}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {t.whatIs.progression.map((step, idx) => (
                <div
                  key={step.step}
                  className={`p-3.5 border transition-all text-start ${
                    idx === 5
                      ? 'bg-amber-50/80 border-amber-400 shadow-2xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                    <span className={idx === 5 ? 'text-amber-700' : 'text-gray-500'}>
                      {step.step}
                    </span>
                    {idx === 5 && (
                      <span className="text-[9px] px-1 bg-amber-600 text-white font-mono uppercase">
                        {isArabic ? 'الصندوق' : isFrench ? 'FONDS' : 'FUND'}
                      </span>
                    )}
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${idx === 5 ? 'text-amber-950' : 'text-gray-900'}`}>
                    {step.name}
                  </h4>
                  <p className="text-xs text-gray-600 leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed text-start">
            <p className="font-mono text-gray-900 font-bold mb-1">
              {isArabic ? 'الدور التمكيني ضمن المنظومة:' : isFrench ? 'Rôle dans le dispositif :' : 'Empowerment Role in Trajectory:'}
            </p>
            <p>{t.whatIs.roleInRestart}</p>
          </div>
        </section>

        {/* SECTION 3 — NOT A LOAN ("ليست قرضًا") */}
        <section id="not-a-loan-section">
          <div className="p-6 sm:p-8 bg-amber-50/60 border-2 border-amber-400 text-start space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-200/80 px-2 py-0.5">
                  {t.notALoan.badge}
                </span>
                <h3 id="not-a-loan-title" className="text-2xl sm:text-3xl font-black text-amber-950">
                  {t.notALoan.title}
                </h3>
              </div>

              <div className="px-3 py-1.5 bg-white border border-amber-300 text-xs font-mono text-amber-900 font-bold">
                {isArabic ? 'منحة تمكينية • غير مستردة' : isFrench ? 'Aide non remboursable' : 'Non-Repayable Grant Framework'}
              </div>
            </div>

            <div className="space-y-4">
              <p id="not-a-loan-statement" className="text-base sm:text-lg font-bold text-amber-950 leading-relaxed">
                {t.notALoan.statement}
              </p>
              <p id="not-a-loan-explanation" className="text-sm text-amber-900 leading-relaxed">
                {t.notALoan.explanation}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {t.notALoan.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-white border border-amber-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-800 font-medium leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>

            <div className="text-xs font-mono text-amber-800 bg-amber-100/70 p-3 border border-amber-300">
              {t.notALoan.noDebtNotice}
            </div>
          </div>
        </section>

        {/* SECTION 4 — FREEDOM OF USE */}
        <section id="freedom-of-use-section" className="space-y-6">
          <div className="space-y-2 text-start">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-700 font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.freedomOfUse.tag}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {t.freedomOfUse.title}
            </h3>
            <p id="freedom-of-use-core-statement" className="text-base font-bold text-gray-800 leading-relaxed">
              {t.freedomOfUse.coreStatement}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
              {t.freedomOfUse.subStatement}
            </p>
          </div>

          {/* Categories Grid (Illustrative Examples) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.freedomOfUse.categories.map((cat) => {
              const Icon = categoryIcons[cat.id] || Sparkles;
              return (
                <div
                  key={cat.id}
                  className="p-4 bg-white border border-gray-200 hover:border-emerald-300 transition-colors text-start space-y-2"
                >
                  <div className="w-8 h-8 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{cat.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Non-Mandatory Category Disclaimer */}
          <div
            id="freedom-of-use-disclaimer"
            className="p-4 bg-gray-50 border-l-4 rtl:border-l-0 rtl:border-r-4 border-gray-400 text-xs text-gray-700 leading-relaxed text-start"
          >
            <p className="font-mono text-gray-900 font-bold mb-1">
              {isArabic ? 'إيضاح إرشادي رسمي:' : isFrench ? 'Précision réglementaire :' : 'Official Architectural Guidance:'}
            </p>
            <p>{t.freedomOfUse.disclaimerNotice}</p>
          </div>
        </section>

        {/* SECTION 5 — MAXIMUM ASSISTANCE */}
        <section id="maximum-assistance-section">
          <div className="p-8 sm:p-12 bg-[#07172C] text-white border-2 border-amber-400 text-center space-y-6 relative overflow-hidden">
            <GridPattern className="opacity-10" />

            <div className="relative z-10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold px-3 py-1 bg-amber-950/60 border border-amber-500/30">
                {t.maxAssistance.tag}
              </span>

              {/* Numerical Highlight */}
              <div className="pt-2">
                <div
                  id="maximum-assistance-amount"
                  className="text-4xl sm:text-6xl lg:text-7xl font-black text-amber-400 font-mono tracking-tight"
                >
                  {t.maxAssistance.amount}{' '}
                  <span className="text-2xl sm:text-3xl text-white font-medium">
                    {t.maxAssistance.currency}
                  </span>
                </div>
                <p
                  id="maximum-assistance-caption"
                  className="text-sm sm:text-base font-mono uppercase tracking-wider text-amber-200/90 mt-2 font-bold"
                >
                  {t.maxAssistance.caption}
                </p>
              </div>

              {/* Headline qualifier */}
              <p className="text-sm font-mono text-gray-300 font-medium">
                {t.maxAssistance.qualifier}
              </p>

              {/* Explanatory caveat */}
              <div className="max-w-2xl mx-auto p-4 bg-white/5 border border-white/10 text-xs text-gray-300 leading-relaxed text-center mt-4">
                <p id="maximum-assistance-explanation">{t.maxAssistance.explanation}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — HOW IT FITS INTO ZIRON RESTART */}
        <section id="ecosystem-fit-section" className="space-y-6">
          <div className="space-y-2 text-start">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-blue-700 font-bold tracking-wider">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.ecosystemFit.tag}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {t.ecosystemFit.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
              {t.ecosystemFit.description}
            </p>
          </div>

          {/* Pillars Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.ecosystemFit.pillars.map((pillar) => (
              <div
                key={pillar.step}
                className="p-4 bg-white border border-gray-200 text-start space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-gray-500">PILLAR {pillar.step}</span>
                  <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 font-bold">
                    {pillar.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-gray-900">{pillar.name}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{pillar.focus}</p>
              </div>
            ))}
          </div>

          {/* Crucial Invariant: No Automatic Financial Entitlement */}
          <div
            id="no-auto-entitlement-notice"
            className="p-4 bg-amber-50 border-l-4 rtl:border-l-0 rtl:border-r-4 border-amber-600 text-xs text-amber-950 leading-relaxed text-start space-y-1"
          >
            <div className="flex items-center gap-2 font-mono font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isArabic
                  ? 'قاعدة الحوكمة الصارمة:'
                  : isFrench
                  ? 'Principe d’Intégrité Réglementaire :'
                  : 'Mandatory Governance Invariant:'}
              </span>
            </div>
            <p>{t.ecosystemFit.noAutoEntitlementNotice}</p>
          </div>
        </section>

        {/* SECTION 7 — CURRENT STATUS (LOCKED / COMING SOON) */}
        <section id="current-status-section">
          <div className="p-6 sm:p-8 bg-rose-50/50 border-2 border-rose-300 text-start space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-200 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-800 font-bold bg-rose-100 px-2 py-0.5">
                  {t.currentStatus.tag}
                </span>
                <h3 id="current-status-headline" className="text-2xl sm:text-3xl font-black text-rose-950">
                  {t.currentStatus.headline}
                </h3>
              </div>

              <div className="px-3 py-1.5 bg-rose-600 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>{isArabic ? 'مغلق حاليًا' : isFrench ? 'FERMÉ' : 'CLOSED'}</span>
              </div>
            </div>

            <p id="current-status-message" className="text-base text-gray-800 leading-relaxed font-medium">
              {t.currentStatus.message}
            </p>

            {/* 4 Explicit Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.currentStatus.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-white border border-rose-200">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-xs text-gray-800 leading-relaxed font-medium">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-white border border-rose-200 text-xs font-mono text-rose-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{t.currentStatus.securityNotice}</span>
            </div>
          </div>
        </section>

        {/* SECTION 8 — FUTURE PROGRAM FRAMEWORK */}
        <section id="future-framework-section" className="space-y-6">
          <div className="space-y-2 text-start">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-gray-600 font-bold tracking-wider">
              <Award className="w-3.5 h-3.5 text-gray-600" />
              <span>{t.futureFramework.tag}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {t.futureFramework.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
              {t.futureFramework.description}
            </p>
          </div>

          {/* 7 Future Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.futureFramework.pillars.map((pillar, i) => (
              <div key={i} className="p-4 bg-white border border-gray-200 text-start space-y-1.5">
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">
                  {isArabic ? `ركيزة 0${i + 1}` : isFrench ? `PILIER 0${i + 1}` : `STANDARD 0${i + 1}`}
                </span>
                <h4 className="text-sm font-bold text-gray-900">{pillar.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 font-mono text-start">
            * {t.futureFramework.disclaimer}
          </p>
        </section>

        {/* SECTION 9 — RESTART PHILOSOPHY */}
        <section id="philosophy-section">
          <div className="p-8 sm:p-12 bg-gradient-to-b from-gray-900 to-[#07172C] text-white border border-gray-800 text-center space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              {t.philosophy.tag}
            </span>

            {/* Core Proverb */}
            <div
              id="philosophy-core-proverb"
              className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-mono tracking-tight"
            >
              "{t.philosophy.coreProverb}"
            </div>

            {/* Philosophy Quote */}
            <blockquote
              id="philosophy-quote"
              className="text-base sm:text-lg text-gray-200 italic max-w-3xl mx-auto leading-relaxed"
            >
              "{t.philosophy.quote}"
            </blockquote>

            <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {t.philosophy.missionBody}
            </p>
          </div>
        </section>

        {/* SECTION 10 — CALL TO ACTION (NO APPLICATION BUTTONS) */}
        <section id="cta-section">
          <div className="p-8 bg-gray-50 border border-gray-200 text-center space-y-6">
            <div className="space-y-2 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900">{t.cta.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{t.cta.subtitle}</p>
            </div>

            {/* CTA Buttons: Educational & Navigational, NOT Applications */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                id="cta-explore-restart"
                variant="primary"
                onClick={() => navigate(user ? 'app/restart' : 'restart')}
                className="font-mono text-xs uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                <span>{t.cta.exploreRestartBtn}</span>
              </Button>

              <Button
                id="cta-discover-school"
                variant="outline"
                onClick={() => navigate(user ? 'app/school' : 'school')}
                className="font-mono text-xs uppercase tracking-wider"
              >
                <GraduationCap className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                <span>{t.cta.discoverSchoolBtn}</span>
              </Button>

              <Button
                id="cta-verify-certificate"
                variant="ghost"
                onClick={() => navigate('verify')}
                className="font-mono text-xs uppercase tracking-wider text-gray-600"
              >
                <FileCheck className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                <span>{t.cta.verifyCertificateBtn}</span>
              </Button>
            </div>

            <div className="text-[11px] font-mono text-gray-500">
              {isArabic
                ? 'لا يتم استقبال أي ملفات طلبات منح عبر هذه المنصة في الوقت الراهن.'
                : isFrench
                ? 'Aucune demande de subvention n’est recueillie sur cette plateforme à ce stade.'
                : 'No grant submissions or financial applications are processed via this platform at this time.'}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
