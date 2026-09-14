import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
  Activity,
} from 'lucide-react';

export const SciencePage: React.FC = () => {
  const { locale, dir, navigate } = useI18n();
  const t = getPublicTranslations(locale);
  const s = t.science;

  const tenetIcons = [Sparkles, Layers, Activity, ShieldCheck];

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SECTION 1: EDITORIAL DOSSIER HEADER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                {s.tag}
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                {s.docId}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              {s.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              {s.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('ziron')}
                className="cursor-pointer flex items-center gap-2"
              >
                <span>
                  {locale === 'ar'
                    ? 'فحص مواصفات ZIRON'
                    : locale === 'fr'
                    ? 'Inspecter Spécifications ZIRON'
                    : 'Inspect ZIRON Specifications'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('quality')}
                className="cursor-pointer"
              >
                <span>
                  {locale === 'ar'
                    ? 'معايير الجودة والتتبع'
                    : locale === 'fr'
                    ? 'Normes de Qualité & Traçabilité'
                    : 'Quality & Traceability Standards'}
                </span>
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: FORMULATION PHILOSOPHY & NUTRIENT SYNERGY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {s.tenetsTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {s.tenetsTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {s.tenetsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {s.tenets.map((tenet, idx) => {
              const Icon = tenetIcons[idx] || Sparkles;
              return (
                <div key={tenet.title} className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
                  <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0B2346]">{tenet.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{tenet.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: INGREDIENT OVERVIEW & FACTUAL POLICY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {s.evidenceTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {s.evidenceTitle}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {s.evidenceSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {s.evidenceItems.map((item) => (
              <div key={item.title} className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
                <div className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">
                  {item.status}
                </div>
                <h4 className="text-xs font-bold text-[#0B2346] uppercase mb-2">{item.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <Alert
            variant="info"
            title={
              locale === 'ar'
                ? 'إشعار نشر ملفات التركيبة والتحاليل'
                : locale === 'fr'
                ? 'Avis de Publication des Dossiers'
                : 'Formulation Dossier Release Notice'
            }
          >
            {locale === 'ar'
              ? 'يتم نشر المواصفات الكمية الدقيقة للمكونات وتفاصيل الجرعات وشهادات الفحص المخبري بالتزامن مع تسجيل دفعات الإنتاج الرسمية وفقاً للوائح التنظيمية.'
              : locale === 'fr'
              ? 'Les spécifications quantitatives précises des ingrédients, les dosages détaillés et les certificats d’analyse en laboratoire sont publiés parallèlement à l’enregistrement réglementaire de chaque lot.'
              : 'Precise quantitative ingredient specifications, milligram breakdowns, and laboratory testing certificates will be published alongside commercial batch registration in accordance with regulatory filing schedules.'}
          </Alert>
        </section>

        {/* SECTION 4: PRODUCT DEVELOPMENT & CHRONOBIOLOGY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {locale === 'ar' ? 'التكامل الحيوي اليومي' : locale === 'fr' ? 'INTÉGRATION MÉTABOLIQUE' : 'METABOLIC INTEGRATION'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {locale === 'ar'
                ? 'التوافق مع الإيقاع اليومي والترطيب'
                : locale === 'fr'
                ? 'Synchronisation Circadienne & Hydratation'
                : 'Circadian Timing & Daily Hydration Synergy'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'لا يحدث الامتصاص الغذائي في معزل عن البيولوجيا، بل يتأثر بالإيقاعات اليومية للهضم والتغذية الخلوية:'
                : locale === 'fr'
                ? 'L’absorption des nutriments répond aux rythmes métaboliques circadiens qui régissent la digestion et l’assimilation cellulaire :'
                : 'Nutrient absorption does not occur in a vacuum. The human body operates on circadian metabolic cycles that dictate gastric emptying, cellular nutrient uptake, and enzymatic activity:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'الرسو الصباحي مع الإفطار' : locale === 'fr' ? 'Ancrage Matinal au Petit-Déjeuner' : 'Morning Inception Anchor'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تناول الكبسولة مع وجبة الإفطار يعزز إفراز العصارات الهضمية وحركة المعدة، مما ييسر امتصاص العناصر الغذائية القابلة للذوبان في الماء والدهون.'
                  : locale === 'fr'
                  ? 'Prendre la gélule avec le petit-déjeuner active la motilité gastrique naturelle, facilitant l’absorption optimale des micronutriments.'
                  : 'Ingesting the capsule alongside breakfast leverages post-prandial bile acid release and gastric motility, facilitating optimal absorption of fat-soluble and water-soluble micronutrients alike.'}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'الاقتران بالترطيب الخلوي' : locale === 'fr' ? 'Couplage à l’Hydratation Cellulaire' : 'Cellular Hydration Coupling'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'الماء هو وسيط النقل الفسيولوجي الأساسي. تناول 250–300 مل مع الكبسولة و2+ لتر على مدار اليوم يدعم وظائف الكلى والتوازن المائي الطبيعي.'
                  : locale === 'fr'
                  ? 'L’eau est le vecteur physiologique fondamental. Boire 250–300 ml avec la gélule puis 2L+ dans la journée soutient l’élimination rénale saine.'
                  : 'Water is the essential physiological transport medium. Consuming 250–300 ml of water with the capsule, followed by 2.0+ liters across the day, supports healthy renal clearance and cellular hydration.'}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'استمرارية المسار (90 يومًا)' : locale === 'fr' ? 'Continuité de Phase (90 Jours)' : 'Phase Continuity (90 Days)'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'يتطلب التجدد الخلوي وتثبيت المسارات العصبية للعادات مدة زمنية كافية. يوفر بروتوكول الـ 90 يومًا النافذة الضرورية للتحول التلقائي.'
                  : locale === 'fr'
                  ? 'Le renouvellement cellulaire et l’ancrage des habitudes requièrent du temps. La trajectoire de 90 jours offre cette continuité indispensable.'
                  : 'Cellular turnover and neural habit consolidation require extended temporal continuity. The 90-day trajectory provides the sustained window needed to transform conscious efforts into automatic routines.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: ETHICAL BOUNDARIES & NON-MEDICAL LIMITATIONS */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block mb-1">
              {s.disclaimerTag}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              {s.disclaimerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {s.disclaimerBody}
            </p>
          </div>
        </section>

        {/* SECTION 6: SCIENTIFIC REFERENCES & EVIDENCE POLICY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="flex items-start gap-4">
            <FileText className="w-5 h-5 text-[#0B2346] shrink-0 mt-0.5" />
            <div className="space-y-2 max-w-3xl">
              <h3 className="text-sm font-bold text-[#0B2346] uppercase tracking-wider">
                {locale === 'ar' ? 'المراجع العلمية وسياسة الإثبات' : locale === 'fr' ? 'Références Scientifiques & Politique de Preuve' : 'Scientific References & Evidence Policy'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تلتزم VIREXON BIOSCIENCES بالأمانة العلمية الصارمة، دون ادعاء تجارب وهمية. سيتم نشر قوائم المراجع المحكمة والبيانات الفنية فور اعتمادها وتوفرها.'
                  : locale === 'fr'
                  ? 'VIREXON BIOSCIENCES respecte une stricte rigueur académique sans prétentions infondées. Les bibliographies évaluées par les pairs et livres blancs techniques sont publiés selon le calendrier réglementaire.'
                  : 'VIREXON BIOSCIENCES adheres to strict academic honesty. We do not invent fictional clinical trials or fabricate laboratory names. Comprehensive scientific references, peer-reviewed bibliography items, and formulation technical whitepapers will be published as available alongside formal product registration.'}
              </p>
              <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                {locale === 'ar'
                  ? 'لم يتم تقييم البيانات الواردة في هذه المنصة من قِبل هيئات الغذاء والدواء لأغراض علاجية أو تشخيصية سريرية.'
                  : locale === 'fr'
                  ? 'Les déclarations sur cette plateforme n’ont pas été évaluées par les autorités sanitaires à des fins thérapeutiques.'
                  : 'Statements on this platform have not been evaluated by regulatory food or drug administrations for therapeutic efficacy.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

