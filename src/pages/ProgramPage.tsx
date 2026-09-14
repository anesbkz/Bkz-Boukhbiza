import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Clock,
  CheckCircle,
  ArrowRight,
  Shield,
  Droplet,
  Sun,
  Award,
} from 'lucide-react';

export const ProgramPage: React.FC = () => {
  const { locale, dir, navigate } = useI18n();
  const t = getPublicTranslations(locale);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);

  const phases = t.program.phases;
  const current = phases[selectedPhaseIndex] || phases[0];

  const routineIcons = [Sun, Droplet, Clock];

  const rules = [
    {
      title:
        locale === 'ar'
          ? 'الالتزام اليومي المنتظم'
          : locale === 'fr'
          ? 'Régularité Quotidienne'
          : 'Daily Adherence Discipline',
      desc:
        locale === 'ar'
          ? 'النجاح في البرنامج يعتمد على تناول الكبسولة يوميًا في الصباح مع تسجيل الحضور المنتظم في البوابة.'
          : locale === 'fr'
          ? 'Le succès repose sur la prise quotidienne le matin et la tenue assidue du journal.'
          : 'Success relies on regular morning intake paired with diligent daily logging.',
    },
    {
      title:
        locale === 'ar'
          ? 'نمط حياة تكاملي'
          : locale === 'fr'
          ? 'Approche Holistique'
          : 'Complementary Lifestyle',
      desc:
        locale === 'ar'
          ? 'المكمل الغذائي يعمل كعنصر محفز ضمن منظومة متكاملة تشمل شرب الماء الكافي والنوم والنشاط البدني.'
          : locale === 'fr'
          ? 'Le complément agit comme un catalyseur au sein d’une routine incluant hydratation, sommeil et mouvement.'
          : 'The supplement serves as an anchor within an ecosystem of hydration, sleep, and physical movement.',
    },
    {
      title:
        locale === 'ar'
          ? 'المتابعة دون انقطاع'
          : locale === 'fr'
          ? 'Continuité sans Rupture'
          : 'Unbroken Progression',
      desc:
        locale === 'ar'
          ? 'في حال فوات يوم، تابع من اليوم التالي مباشرة ولا تضاعف الجرعة للحفاظ على التوازن والأمان.'
          : locale === 'fr'
          ? 'En cas d’oubli, reprenez simplement le lendemain sans doubler la prise pour préserver votre sécurité.'
          : 'If a day is missed, simply resume the next morning without doubling the dose.',
    },
  ];

  const viewSpecsBtnText =
    locale === 'ar'
      ? 'استعراض مواصفات المنتج'
      : locale === 'fr'
      ? 'Consulter les Spécifications'
      : 'View Product Specifications';

  const exploreHubBtnText =
    locale === 'ar'
      ? 'التحقق من رمز العبوة'
      : locale === 'fr'
      ? 'Vérifier l’Authenticité'
      : 'Verify Container Serial';

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                {t.program.badge}
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                TRAJECTORY REF: 90D-CHRONO-PROTOCOL
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              {t.program.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              {t.program.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('ziron')}
                className="cursor-pointer flex items-center gap-2"
              >
                <span>{viewSpecsBtnText}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('verify')}
                className="cursor-pointer flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>{exploreHubBtnText}</span>
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: 3-MONTH VISUAL TRAJECTORY SELECTOR */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
                {locale === 'ar'
                  ? 'مخطط المراحل المتسلسلة'
                  : locale === 'fr'
                  ? 'PLAN DES JALONS PROGRESSIFS'
                  : 'PROGRESSIVE MILESTONE BLUEPRINT'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {locale === 'ar'
                  ? 'ثلاث مراحل متسلسلة لـ 30 يومًا'
                  : locale === 'fr'
                  ? 'Trois Phases Séquentielles de 30 Jours'
                  : 'Three Sequential 30-Day Phases'}
              </h2>
            </div>
            <span className="text-xs font-mono text-gray-500">
              {locale === 'ar'
                ? 'الحجم الإجمالي للبرنامج: 90 يومًا / 90 كبسولة'
                : locale === 'fr'
                ? 'VOLUME TOTAL DU PROGRAMME : 90 JOURS / 90 CAPSULES'
                : 'TOTAL PROGRAM VOLUME: 90 DAYS / 90 CAPSULES'}
            </span>
          </div>

          {/* Stepper Header Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {phases.map((p, idx) => {
              const isSelected = selectedPhaseIndex === idx;
              return (
                <button
                  key={p.phaseNum}
                  type="button"
                  onClick={() => setSelectedPhaseIndex(idx)}
                  className={`p-4 border text-start transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white border-[#0B2346] shadow-sm ring-1 ring-[#0B2346]'
                      : 'bg-gray-50 border-[#E2E8F0] hover:bg-white text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2 py-0.5 text-[10px] font-mono font-bold text-white uppercase"
                      style={{ backgroundColor: p.sealColor }}
                    >
                      {p.phaseNum}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gray-400">
                      {p.period}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0B2346]">{p.name}</h3>
                  <div className="text-[11px] text-gray-500 mt-1 font-mono">
                    {p.capsules}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Detailed Dossier Card */}
          <div
            className="bg-white border border-[#E2E8F0] p-6 sm:p-10 border-s-4 shadow-sm"
            style={{ borderInlineStartColor: current.sealColor }}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="max-w-3xl space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="navy">{current.phaseNum}</Badge>
                  <span className="text-xs font-mono text-gray-500 font-semibold">
                    {current.period}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {locale === 'ar' ? 'ختم الأمان:' : locale === 'fr' ? 'SCEAU :' : 'SEAL COLOR:'} {current.sealBadge}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-[#0B2346] tracking-tight">
                  {current.name}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {current.summary}
                </p>

                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                    {locale === 'ar'
                      ? 'الأهداف المقررة ونقاط المتابعة للمرحلة:'
                      : locale === 'fr'
                      ? 'Objectifs Prescrits & Jalons de la Phase :'
                      : 'Prescribed Phase Objectives & Habit Checkpoints:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {current.focusItems.map((focus, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#0B2346]" />
                    <span className="font-semibold text-gray-700">
                      {locale === 'ar'
                        ? 'إنجاز المرحلة المستهدف:'
                        : locale === 'fr'
                        ? 'Jalon Clé Visé :'
                        : 'Target Phase Milestone:'}
                    </span>
                    <span className="font-bold text-[#0B2346]">{current.milestone}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">
                    {locale === 'ar' ? 'معتمد' : locale === 'fr' ? 'VÉRIFIABLE' : 'VERIFIABLE'}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] shrink-0 w-full lg:w-72 space-y-4">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                  {locale === 'ar'
                    ? 'بيانات عبوة المرحلة'
                    : locale === 'fr'
                    ? 'MÉTRIQUES DU FLACON'
                    : 'PHASE CONTAINER METRICS'}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">
                      {locale === 'ar' ? 'الكمية:' : locale === 'fr' ? 'Volume :' : 'Unit Volume:'}
                    </span>
                    <span className="font-bold text-[#0B2346]">
                      {locale === 'ar' ? '30 كبسولة' : locale === 'fr' ? '30 Gélules' : '30 Capsules'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">
                      {locale === 'ar' ? 'الجدول:' : locale === 'fr' ? 'Prise :' : 'Intake Schedule:'}
                    </span>
                    <span className="font-bold text-[#0B2346]">
                      {locale === 'ar' ? '1 يوميًا (صباحًا)' : locale === 'fr' ? '1 / Jour (Matin)' : '1 / Day (Morning)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">
                      {locale === 'ar' ? 'الختم:' : locale === 'fr' ? 'Sceau :' : 'Physical Seal:'}
                    </span>
                    <span className="font-bold text-gray-700">{current.sealBadge}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">
                      {locale === 'ar' ? 'الرمز:' : locale === 'fr' ? 'Sécurité :' : 'Tamper Code:'}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {locale === 'ar' ? 'تسلسلي مشفر' : locale === 'fr' ? 'SÉRIALISÉ' : 'SERIALIZED'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('ziron')}
                  className="w-full justify-center cursor-pointer"
                >
                  {locale === 'ar' ? 'تفاصيل العبوة' : locale === 'fr' ? 'Voir Spécifications' : 'View Phase Specifications'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: DAILY ROUTINE ARCHITECTURE */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {t.program.dailyScheduleTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {t.program.dailyScheduleTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {t.program.dailyScheduleSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.program.dailySlots.map((slot, idx) => {
              const Icon = routineIcons[idx] || Clock;
              return (
                <div key={slot.time} className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0B2346] border border-blue-200 flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                    {slot.time}
                  </div>
                  <h3 className="text-base font-bold text-[#0B2346]">{slot.action}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{slot.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: ARCHITECTURAL & ENTITLEMENT CLARIFICATION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
              {locale === 'ar'
                ? 'إشعار الهيكلية التقنية'
                : locale === 'fr'
                ? 'AVIS D’ARCHITECTURE SYSTÈME'
                : 'SYSTEM ARCHITECTURE NOTICE'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              {locale === 'ar'
                ? 'مفهوم المراحل مقابل نموذج الصلاحيات الرقمية'
                : locale === 'fr'
                ? 'Concept de Phase vs Modèle d’Autorisation'
                : 'Phase Concept vs. Authorization Model'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'لضمان الشفافية وتوضيح نظام الوصول الرقمي، يُرجى التمييز بين المسار الزمني للبرنامج وصلاحيات النظام الرقمي:'
                : locale === 'fr'
                ? 'Pour garantir la transparence sur le contrôle d’accès numérique, veuillez distinguer la trajectoire éducative du modèle d’autorisation :'
                : 'To ensure transparency and prevent confusion regarding digital access controls, please note the distinction between the educational program presentation and platform authorization:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 mb-6">
            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
              <span className="font-bold text-[#0B2346] block mb-1">
                {locale === 'ar' ? 'المسار الزمني للبرنامج' : locale === 'fr' ? 'Trajectoire Publique du Programme' : 'Public Program Trajectory'}
              </span>
              {locale === 'ar'
                ? 'يمثل تسلسل المراحل الثلاث (01 و02 و03) الترتيب الزمني لاستهلاك العبوات وتثبيت العادات اليومية. وهو بمثابة خارطة طريق تعليمية وسلوكية.'
                : locale === 'fr'
                ? 'La progression en 3 mois (Phases 01, 02 et 03) représente l’ordre physique des flacons et le repère chronologique d’ancrage des habitudes.'
                : 'The 90-Day progression (Phase 01, 02, and 03) represents the physical product packaging sequence and chronological habit formation guidance. It serves as your behavioral calendar and educational milestone roadmap.'}
            </div>

            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
              <span className="font-bold text-[#0B2346] block mb-1">
                {locale === 'ar' ? 'صلاحيات المنصة الرقمية' : locale === 'fr' ? 'Autorisation de la Plateforme Numérique' : 'Digital Platform Authorization'}
              </span>
              {locale === 'ar'
                ? 'في المنصة الرقمية الموثقة (بوابة ZIRON)، يخضع الوصول للميزات (مثل المدرسة والمجتمع) للتحقق المشفر من رموز العبوات واستحقاقات الحساب، وليس لقيود تعسفية.'
                : locale === 'fr'
                ? 'Dans le système numérique ZIRON Hub, l’accès aux fonctionnalités (École et Communauté) est gouverné par les codes d’inviolabilité vérifiés et les droits réels.'
                : 'In the authenticated digital system (ZIRON Hub), access to digital features (such as School curricula and Community rooms) is governed by cryptographically verified container codes and server-authoritative account entitlements, not by artificial client-side locks.'}
            </div>
          </div>

          <Alert
            variant="info"
            title={locale === 'ar' ? 'التحقق والوصول الرقمي' : locale === 'fr' ? 'Vérification & Accès Numérique' : 'Verification & Digital Access'}
          >
            {locale === 'ar'
              ? 'يؤدي التحقق من رمز العبوة الأصلي إلى ربط الصلاحيات المقابلة بحسابك الشخصي في بوابة المشارك بأمان.'
              : locale === 'fr'
              ? 'L’authentification de votre numéro de série lie vos droits correspondants dans l’espace participant sécurisé.'
              : 'Authenticating your genuine container serial unlocks your corresponding participant capabilities in the secure customer portal.'}
          </Alert>
        </section>

        {/* SECTION 5: REALISTIC EXPECTATIONS & RESPONSIBLE FRAMING */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block mb-1">
              {locale === 'ar' ? 'التوقعات والالتزام' : locale === 'fr' ? 'ATTENTES & DISCIPLINE' : 'EXPECTATIONS & ADHERENCE'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              {locale === 'ar' ? 'مبادئ الانضباط والالتزام' : locale === 'fr' ? 'Principes d’Engagement & Discipline' : 'Commitment Principles & Discipline'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {locale === 'ar' ? 'إرشادات عملية واضحة لضمان أقصى فائدة واستدامة من بروتوكول ZIRON:' : locale === 'fr' ? 'Directives pratiques claires pour assurer un bénéfice maximal du protocole ZIRON :' : 'Clear operational guidelines to ensure maximum benefit and adherence from the ZIRON protocol:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600">
            {rules.map((rule) => (
              <div key={rule.title} className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="font-bold text-[#0B2346] block mb-1">{rule.title}</span>
                {rule.desc}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: CTA BANNER */}
        <section className="bg-[#0B2346] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {locale === 'ar'
                ? 'ابدأ خطوتك الأولى: تأسيس الشهر الأول'
                : locale === 'fr'
                ? 'Faites le Premier Pas : Fondation du Mois 01'
                : 'Take the First Step: Month 01 Foundation'}
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              {locale === 'ar'
                ? 'اطلب حزمة برنامج الـ 90 يومًا الكاملة أو ابدأ بعبوة المرحلة 01 في كتالوج منتجاتنا.'
                : locale === 'fr'
                ? 'Commandez le pack complet 90 Jours ou démarrez avec le flacon Phase 01 dans notre boutique.'
                : 'Acquire the complete 90-Day Program Bundle or begin with the Phase 01 container in our catalog.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('shop')}
              className="bg-white text-[#0B2346] hover:bg-gray-100 cursor-pointer"
            >
              {locale === 'ar'
                ? 'طلب حزمة الـ 90 يومًا'
                : locale === 'fr'
                ? 'Commander le Pack 90 Jours'
                : 'Order 90-Day Bundle'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('verify')}
              className="border-white/30 text-white hover:bg-white/10 cursor-pointer"
            >
              {locale === 'ar'
                ? 'التحقق من عبوة موجودة'
                : locale === 'fr'
                ? 'Vérifier un Flacon Existant'
                : 'Verify Existing Container'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

