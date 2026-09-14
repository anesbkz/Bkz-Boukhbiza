import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { getLocalizedCatalog } from '@/lib/content/catalog';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  ArrowRight,
  Shield,
  Compass,
  Sparkles,
  Package,
  GraduationCap,
  MessageSquare,
  Award,
  Calendar,
  Activity,
  Check,
  Cpu,
  Sprout,
  Briefcase,
  Wrench,
  TrendingUp,
  FileCheck2,
  Flame,
} from 'lucide-react';
import { PublicRoute } from '@/types';

export const HomePage: React.FC = () => {
  const { locale, navigate, dir } = useI18n();
  const t = getPublicTranslations(locale);
  const localizedCatalog = getLocalizedCatalog(locale);
  const phaseItems = localizedCatalog.filter((item) => item.phase !== 'BUNDLE');

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    digital: Cpu,
    entrepreneurship: TrendingUp,
    agritech: Sprout,
    beekeeping: Flame,
    trades: Wrench,
    business: Briefcase,
  };

  const ecosystemIcons = [Package, Calendar, Compass, GraduationCap, MessageSquare];

  return (
    <div className="relative">
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden bg-white border-b border-[#E2E8F0] pt-14 pb-20 sm:pt-20 sm:pb-28">
        <GridPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-[#E2E8F0] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#0B2346]" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#0B2346] font-mono">
                {t.home.heroBadge}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-[1.15] mb-6">
              {t.home.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
              {t.home.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('ziron')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>{t.home.discoverBtn}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('program')}
                className="cursor-pointer"
              >
                {t.home.exploreBtn}
              </Button>
            </div>

            {/* Quick Safety Positioning Notice */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-[11px] text-gray-500 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#0B2346] shrink-0" />
              <span>{t.home.heroNotice}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — ZIRON ECOSYSTEM ARCHITECTURE */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#0B2346] font-bold mb-2">
              {t.home.ecosystemTag}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {t.home.ecosystemTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {t.home.ecosystemSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {t.home.ecosystemItems.map((item, index) => {
              const Icon = ecosystemIcons[index] || Package;
              return (
                <div
                  key={item.step}
                  className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                      {item.step}
                    </div>
                    <h3 className="text-base font-bold text-[#0B2346] mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-200/60">
                    <button
                      onClick={() => navigate(item.route as PublicRoute)}
                      className="text-[11px] font-bold text-[#0B2346] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.cta}</span>
                      <span>{dir === 'rtl' ? '←' : '→'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 — THE 90-DAY PROGRAM (VISUAL TRAJECTORY) */}
      <section className="py-16 sm:py-24 bg-[#F5F7FA] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[11px] font-mono uppercase tracking-widest text-gray-500 font-bold mb-2">
              {t.home.trajectoryTag}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B2346] mb-3">
              {t.home.trajectoryTitle}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t.home.trajectorySubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.home.trajectoryPhases.map((phase, idx) => {
              const catalogItem = phaseItems[idx];
              return (
                <Card
                  key={phase.phaseNum}
                  variant="default"
                  className="relative overflow-hidden flex flex-col justify-between border-t-4"
                  style={{ borderTopColor: phase.sealColor }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="navy">{phase.phaseNum}</Badge>
                      <span className="text-xs font-mono font-semibold text-gray-400">
                        {catalogItem?.sku || `ZR-PH0${idx + 1}`}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                      {phase.days}
                    </div>

                    <h3 className="text-lg font-bold text-[#0B2346] mb-1">{phase.title}</h3>

                    <div className="flex items-baseline gap-2 text-xs text-gray-500 font-medium mb-4">
                      <span className="font-semibold text-[#0B2346]">{phase.capsules}</span>
                      <span>•</span>
                      <span className="font-mono">{phase.sealBadge}</span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-6">
                      {phase.desc}
                    </p>

                    <div className="space-y-2 bg-gray-50 p-3 border border-gray-100 text-xs mb-4">
                      <div className="font-bold text-[#0B2346] text-[11px] uppercase tracking-wider">
                        {locale === 'ar'
                          ? 'أهداف المرحلة الرئيسية:'
                          : locale === 'fr'
                          ? 'Objectifs Clés de la Phase :'
                          : 'Key Milestone Objectives:'}
                      </div>
                      <ul className="space-y-1.5 text-gray-600 text-[11px]">
                        {phase.focus.map((point) => (
                          <li key={point} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-400">
                      {phase.sealBadge}
                    </span>
                    <button
                      onClick={() => navigate('ziron')}
                      className="text-xs font-bold text-[#0B2346] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {locale === 'ar'
                          ? 'تفاصيل العبوة'
                          : locale === 'fr'
                          ? 'Spécifications'
                          : 'Full Specifications'}
                      </span>
                      <span>{dir === 'rtl' ? '←' : '→'}</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('shop')}
              className="cursor-pointer"
            >
              {locale === 'ar'
                ? 'عرض حزمة الـ 90 يومًا في المتجر ←'
                : locale === 'fr'
                ? 'Voir le Pack 90 Jours dans la Boutique →'
                : 'View Complete 90-Day Bundle in Catalog →'}
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 4 — ZIRON HUB (AUTHENTICATED CUSTOMER ECOSYSTEM) */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0B2346] border border-blue-100">
                <Compass className="w-3.5 h-3.5 text-[#0B2346]" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  {locale === 'ar'
                    ? 'منصة تجربة المشارك'
                    : locale === 'fr'
                    ? 'PLATEFORME EXPÉRIENCE PARTICIPANT'
                    : 'CUSTOMER EXPERIENCE PLATFORM'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B2346] tracking-tight">
                {locale === 'ar'
                  ? 'بوابة ZIRON: مساحتك الرقمية الشخصية.'
                  : locale === 'fr'
                  ? 'Espace ZIRON : Votre centre de suivi personnalisé.'
                  : 'ZIRON Hub: Your personal command center.'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'عند توثيق عبوة ZIRON برمز الأمان المشفر، تفتح المنصة بوابتك الرقمية لمتابعة إنجازاتك والتواصل مع الفوج.'
                  : locale === 'fr'
                  ? 'Lorsque vous activez votre flacon physique grâce à son code d’inviolabilité, votre espace personnalisé s’ouvre.'
                  : 'When you activate your physical ZIRON container with its cryptographic tamper code, the ZIRON Hub opens your personalized participant workspace.'}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-blue-50 border border-blue-200 text-[#0B2346] flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                      {locale === 'ar'
                        ? 'المسار الشخصي وتسجيل الالتزام'
                        : locale === 'fr'
                        ? 'Parcours Personnel & Trajectoire'
                        : 'Personal Journey & Trajectory'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {locale === 'ar'
                        ? 'متابعة مرئية لـ 90 يومًا مع تسجيل روتين التناول الصباحي، وشرب الماء، واستقرار العادات.'
                        : locale === 'fr'
                        ? 'Suivi visuel des 90 jours avec validation quotidienne, repères d’hydratation et journal d’habitudes.'
                        : 'Visual 90-day progress tracker with daily routine check-ins, hydration milestones, and habit logs.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 text-[#2E9E45] flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                      {locale === 'ar'
                        ? 'مجتمع الأقران الموثق'
                        : locale === 'fr'
                        ? 'Communauté de Pairs Vérifiée'
                        : 'Verified Peer Community'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {locale === 'ar'
                        ? 'نقاشات هادفة وتبادل تشجيع متبادل مخصص حصرًا للمشاركين الذين قاموا بتفعيل عبواتهم.'
                        : locale === 'fr'
                        ? 'Discussions modérées et entraide réciproque exclusivement entre participants vérifiés.'
                        : 'Private discussions, moderated topic threads, and mutual encouragement strictly with verified participants.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                      {locale === 'ar'
                        ? 'سجل الأوسمة والشهادات التقديرية'
                        : locale === 'fr'
                        ? 'Registre des Jalons & Certificats'
                        : 'Milestones & Rewards Registry'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {locale === 'ar'
                        ? 'تحقيق أوسمة التميز عند اجتياز المراحل بنجاح واستخراج شهادات الالتزام المعتمدة.'
                        : locale === 'fr'
                        ? 'Obtenez des badges de régularité et générez vos attestations officielles à chaque étape validée.'
                        : 'Earn verified achievement badges, track trajectory consistency, and generate verifiable certificates.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('login')}
                  className="cursor-pointer"
                >
                  {locale === 'ar'
                    ? 'تسجيل الدخول للمنصة'
                    : locale === 'fr'
                    ? 'Accéder à l’Espace'
                    : 'Access Participant Hub'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('verify')}
                  className="cursor-pointer"
                >
                  {locale === 'ar'
                    ? 'التحقق من رمز العبوة'
                    : locale === 'fr'
                    ? 'Vérifier le Code du Flacon'
                    : 'Verify Container Code'}
                </Button>
              </div>
            </div>

            {/* Hub Preview Visual Matrix */}
            <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 text-xs">
                <span className="font-mono font-bold text-[#0B2346] uppercase">
                  {locale === 'ar'
                    ? 'معاينة واجهة المشارك'
                    : locale === 'fr'
                    ? 'APERÇU INTERFACE PARTICIPANT'
                    : 'PARTICIPANT INTERFACE PREVIEW'}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 font-bold border border-emerald-200">
                  {locale === 'ar' ? 'المنظومة نشطة' : locale === 'fr' ? 'SYSTÈME ACTIF' : 'SYSTEM ACTIVE'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white border border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B2346]">
                      {locale === 'ar' ? 'المرحلة الحالية' : locale === 'fr' ? 'Phase Actuelle' : 'Current Protocol Phase'}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#0B2346] px-2 py-0.5">
                      {locale === 'ar' ? 'المرحلة 01: التأسيس' : locale === 'fr' ? 'PHASE 01 : FONDATION' : 'PHASE 01: FOUNDATION'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2">
                    <div className="bg-[#0B2346] h-2 w-[42%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                    <span>{locale === 'ar' ? 'اليوم 13 من 90' : locale === 'fr' ? 'Jour 13 sur 90' : 'Day 13 of 90'}</span>
                    <span>42% {locale === 'ar' ? 'نسبة الالتزام' : locale === 'fr' ? 'd’assiduité' : 'Adherence'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-[#E2E8F0]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">
                      {locale === 'ar' ? 'غرفة المجتمع' : locale === 'fr' ? 'Salon Communauté' : 'Community Room'}
                    </div>
                    <div className="text-xs font-bold text-[#0B2346] mt-1">
                      {locale === 'ar' ? 'فوج تأسيس العادات' : locale === 'fr' ? 'Cohorte Fondation' : 'Foundational Habits Cohort'}
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-1">
                      ● {locale === 'ar' ? 'نقاشات نشطة' : locale === 'fr' ? 'Discussions actives' : 'Active discussions'}
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-[#E2E8F0]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">
                      {locale === 'ar' ? 'مناهج المدرسة' : locale === 'fr' ? 'Cours de l’École' : 'School Curricula'}
                    </div>
                    <div className="text-xs font-bold text-[#0B2346] mt-1">
                      {locale === 'ar' ? 'المهارات الرقمية: الوحدة 1' : locale === 'fr' ? 'Compétences Web : Module 1' : 'Digital Skills Module 1'}
                    </div>
                    <div className="text-[10px] text-blue-700 mt-1">
                      ● {locale === 'ar' ? 'تم إنجاز 3 دروس' : locale === 'fr' ? '3 leçons terminées' : '3 lessons completed'}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-700">ZR-PH01-VERIFIED</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">
                    {locale === 'ar' ? 'أصلي وموثق' : locale === 'fr' ? 'AUTHENTIQUE' : 'AUTHENTIC'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — ZIRON RESTART (EDUCATIONAL ECOSYSTEM) */}
      <section className="py-16 sm:py-24 bg-[#F5F7FA] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="max-w-2xl">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#0B2346] font-bold mb-2">
                {t.home.skillsTag}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
                {t.home.skillsTitle}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t.home.skillsSubtitle}
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('restart')}
              className="cursor-pointer shrink-0 self-start md:self-auto"
            >
              {locale === 'ar' ? 'استكشف المناهج كاملة ←' : locale === 'fr' ? 'Explorer Tout le Cursus →' : 'Explore Full Curriculum →'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.home.skillsItems.map((cat) => {
              const Icon = categoryIcons[cat.id] || Cpu;
              return (
                <div key={cat.id} className="p-6 bg-white border border-[#E2E8F0] flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="w-10 h-10 bg-gray-100 text-[#0B2346] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#0B2346] mb-2">{cat.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{cat.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-gray-400">
                      {locale === 'ar' ? 'مسار منظم' : locale === 'fr' ? 'PARCOURS STRUCTURÉ' : 'STRUCTURED TRACK'}
                    </span>
                    <button
                      onClick={() => navigate('restart')}
                      className="font-bold text-[#0B2346] hover:underline cursor-pointer"
                    >
                      {locale === 'ar' ? 'عرض الدروس ←' : locale === 'fr' ? 'Voir les Modules →' : 'View Modules →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6 — SCIENCE & QUALITY ASSURANCE */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#0B2346] font-bold mb-2">
              {t.home.qualityTag}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {t.home.qualityTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {t.home.qualitySubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">
                {t.home.qualityItems[0]?.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.home.qualityItems[0]?.desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('science')}
                  className="text-xs font-bold text-[#0B2346] hover:underline cursor-pointer"
                >
                  {locale === 'ar' ? 'قراءة الأساس العلمي ←' : locale === 'fr' ? 'Lire la Science des Formules →' : 'Read Formulation Science →'}
                </button>
              </div>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">
                {t.home.qualityItems[1]?.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.home.qualityItems[1]?.desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('quality')}
                  className="text-xs font-bold text-[#0B2346] hover:underline cursor-pointer"
                >
                  {locale === 'ar' ? 'فحص معايير الجودة ←' : locale === 'fr' ? 'Examiner les Normes Qualité →' : 'Inspect Quality Standards →'}
                </button>
              </div>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">
                {t.home.qualityItems[2]?.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.home.qualityItems[2]?.desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('faq')}
                  className="text-xs font-bold text-[#0B2346] hover:underline cursor-pointer"
                >
                  {t.home.viewAllFaqsBtn} {dir === 'rtl' ? '←' : '→'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — CRYPTOGRAPHIC VERIFICATION BANNER */}
      <section className="py-14 bg-[#0B2346] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-2 font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>
                {locale === 'ar'
                  ? 'أصالة العبوة والتحقق الرقمي'
                  : locale === 'fr'
                  ? 'AUTHENTICITÉ CRYPTOGRAPHIQUE DU FLACON'
                  : 'CRYPTOGRAPHIC CONTAINER AUTHENTICITY'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {locale === 'ar'
                ? 'تحقق من أصالة عبوة ZIRON الخاصة بك'
                : locale === 'fr'
                ? 'Authentifiez Votre Flacon Physique ZIRON'
                : 'Authenticate Your Physical ZIRON Container'}
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              {locale === 'ar'
                ? 'تحمل كل عبوة ZIRON أصلية رمز أمان فريدًا أسفل شريط الحماية. تحقق من الرمز لتأكيد أصالة المنتج وربطه بحسابك.'
                : locale === 'fr'
                ? 'Chaque flacon authentique ZIRON porte un sceau individuel sous pastille. Validez votre unité pour lier vos accès numériques.'
                : 'Every authentic ZIRON container features an individualized alphanumeric security seal. Verify your unit to confirm authorized provenance and link digital privileges.'}
            </p>
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('verify')}
            className="shrink-0 bg-white text-[#0B2346] hover:bg-gray-100 cursor-pointer"
          >
            {locale === 'ar' ? 'فحص رمز المنتج الآن ←' : locale === 'fr' ? 'Lancer la Vérification →' : 'Launch Product Verification →'}
          </Button>
        </div>
      </section>
    </div>
  );
};

