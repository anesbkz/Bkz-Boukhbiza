import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { getLocalizedCatalog, formatDzdPrice } from '@/lib/content/catalog';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Shield,
  Check,
  ArrowRight,
  Clock,
  Droplet,
  Sun,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const ZironProductPage: React.FC = () => {
  const { navigate, locale, dir } = useI18n();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const localizedCatalog = getLocalizedCatalog(locale);
  const phaseItems = localizedCatalog.filter((item) => item.phase !== 'BUNDLE');
  const bundleItem = localizedCatalog.find((item) => item.phase === 'BUNDLE');

  const productFaqs = [
    {
      q:
        locale === 'ar'
          ? 'ما هو عدد الكبسولات والجدول الزمني للعبوات؟'
          : locale === 'fr'
          ? 'Quel est le nombre de gélules et le calendrier des flacons ?'
          : 'What is the capsule count and container schedule?',
      a:
        locale === 'ar'
          ? 'ينقسم ZIRON إلى ثلاث عبوات متسلسلة مدة كل منها 30 يومًا. تحتوي المرحلة 01 على 30 كبسولة (الأيام 01–30)، والمرحلة 02 على 30 كبسولة (الأيام 31–60)، والمرحلة 03 على 30 كبسولة (الأيام 61–90). تحتوي الحزمة الكاملة على 90 كبسولة بالضبط عبر العبوات الثلاث.'
          : locale === 'fr'
          ? 'ZIRON est organisé en trois flacons séquentiels de 30 jours. La Phase 01 contient 30 gélules (jours 01 à 30), la Phase 02 contient 30 gélules (jours 31 à 60), et la Phase 03 contient 30 gélules (jours 61 à 90). Le pack complet contient exactement 90 gélules.'
          : 'ZIRON is organized into three sequential 30-day containers. Phase 01 contains 30 capsules (Days 01–30), Phase 02 contains 30 capsules (Days 31–60), and Phase 03 contains 30 capsules (Days 61–90). The complete program bundle contains exactly 90 capsules across all three containers.',
    },
    {
      q:
        locale === 'ar'
          ? 'كيف يجب تناول كبسولات ZIRON يوميًا؟'
          : locale === 'fr'
          ? 'Comment prendre les gélules ZIRON chaque jour ?'
          : 'How should ZIRON capsules be taken each day?',
      a:
        locale === 'ar'
          ? 'تناول كبسولة واحدة يوميًا كل صباح مع كوب كامل من الماء (حوالي 250–300 مل)، ويفضل مع وجبة الإفطار. تجنب تناولها على معدة فارغة إذا كنت تعاني من حساسية معوية. حافظ على شرب الماء بانتظام طوال اليوم.'
          : locale === 'fr'
          ? 'Prenez une gélule par jour chaque matin avec un grand verre d’eau (250–300 ml environ), de préférence pendant le petit-déjeuner. Évitez la prise à jeun en cas de sensibilité. Maintenez une bonne hydratation continue.'
          : 'Take one capsule daily each morning with a full glass of water (approx. 250–300 ml), preferably alongside breakfast. Avoid consuming on an empty stomach if you experience sensitivity. Maintain regular hydration throughout the day.',
    },
    {
      q:
        locale === 'ar'
          ? 'هل يحتوي ZIRON على خلطات غامضة تخفي كميات المكونات؟'
          : locale === 'fr'
          ? 'ZIRON utilise-t-il des mélanges exclusifs masquant les doses ?'
          : 'Does ZIRON use proprietary blends that mask ingredient doses?',
      a:
        locale === 'ar'
          ? 'كلا. ترفض VIREXON BIOSCIENCES تمامًا الخلطات غير المعلنة. يتم اختيار كل مركب بناءً على التوافر الحيوي. سيتم نشر الملفات الفنية وشهادات التحليل المعملية المعتمدة فور تسجيل دفعات الإنتاج.'
          : locale === 'fr'
          ? 'Non. VIREXON BIOSCIENCES refuse strictement les mélanges exclusifs non divulgués. Chaque composé est sélectionné pour sa biodisponibilité. Les dossiers techniques et certificats d’analyse seront publiés lors de l’enregistrement des lots.'
          : 'No. VIREXON BIOSCIENCES strictly avoids undisclosed proprietary blends. Each compound is selected for biological bioavailability. Quantitative technical dossiers and batch certificates of analysis will be published as production milestones are registered.',
    },
    {
      q:
        locale === 'ar'
          ? 'هل ZIRON علاج طبي أو دواء للإدمان؟'
          : locale === 'fr'
          ? 'ZIRON est-il un traitement médical ou un remède anti-addiction ?'
          : 'Is ZIRON a medical treatment or pharmaceutical addiction cure?',
      a:
        locale === 'ar'
          ? 'كلا. ZIRON هو بروتوكول عافية غذائي ونمط حياة منظم. وهو ليس علاجًا ولا دواءً لتشخيص أو شفاء أو علاج اضطرابات تعاطي المواد أو الاكتئاب أو القلق أو أي مرض سريري. صُمم خصيصًا كروتين غذائي للبالغين الأصحاء.'
          : locale === 'fr'
          ? 'Non. ZIRON est un protocole de bien-être et de mode de vie structuré. Il ne traite, ne guérit et ne prévient aucun trouble lié à l’usage de substances, aucune dépression ni maladie clinique. Il est destiné uniquement aux adultes en bonne santé.'
          : 'No. ZIRON is a structured dietary wellness and lifestyle protocol. It does not treat, cure, mitigate, or prevent substance use disorders, clinical depression, anxiety, or any medical disease. It is designed solely as a nutritional routine for healthy adults.',
    },
    {
      q:
        locale === 'ar'
          ? 'كيف أتأكد من أصالة عبوتي قبل فتحها؟'
          : locale === 'fr'
          ? 'Comment confirmer l’authenticité de mon flacon avant ouverture ?'
          : 'How do I confirm my container is authentic before opening?',
      a:
        locale === 'ar'
          ? 'تتميز كل عبوة ZIRON أصلية بختم أمان فريد مقاوم للتلاعب مع رمز تحقق أبجدي رقمي مكون من 16 حرفًا (ZR-XXXX-XXXX-XXXX). أدخل هذا الرمز في بوابة التحقق من المنتج قبل البدء.'
          : locale === 'fr'
          ? 'Chaque flacon ZIRON authentique possède un sceau de sécurité individuel inviolable avec un code de vérification à 16 caractères (ZR-XXXX-XXXX-XXXX). Saisissez ce code dans notre portail de vérification.'
          : 'Every genuine ZIRON container features an individualized, tamper-evident security seal with a unique 16-character alphanumeric verification code (ZR-XXXX-XXXX-XXXX). Enter this code into our Product Verification portal before starting.',
    },
  ];

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION 1: HERO DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                {locale === 'ar'
                  ? 'VIREXON BIOSCIENCES • بطاقة المواصفات الفنية'
                  : locale === 'fr'
                  ? 'VIREXON BIOSCIENCES • FICHE TECHNIQUE'
                  : 'VIREXON BIOSCIENCES • SPECIFICATION SHEET'}
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                {locale === 'ar'
                  ? 'مرجع الملف: VX-ZR-90D-SPEC'
                  : locale === 'fr'
                  ? 'RÉF DOSSIER : VX-ZR-90D-SPEC'
                  : 'DOSSIER REF: VX-ZR-90D-SPEC'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              {locale === 'ar'
                ? 'منظومة منتجات ZIRON'
                : locale === 'fr'
                ? 'Système de Produits ZIRON'
                : 'ZIRON Product System'}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              {locale === 'ar'
                ? 'تركيبة عافية غذائية متقدمة مصممة بالمراحل لدعم الروتين اليومي المنظم، والانتظام التغذوي، وترسيخ العادات المنضبطة على مدار 90 يومًا.'
                : locale === 'fr'
                ? 'Une formulation nutritionnelle avancée par phases conçue pour soutenir les routines quotidiennes structurées, la régularité nutritionnelle et l\'ancrage d\'habitudes saines sur 90 jours.'
                : 'An advanced phase-based dietary wellness formulation engineered to support structured daily routines, nutritional consistency, and disciplined habit formation over 90 days.'}
            </p>

            {/* Metric Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F5F7FA] border border-[#E2E8F0] mb-8">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">
                  {locale === 'ar' ? 'الحجم الإجمالي للمنظومة' : locale === 'fr' ? 'Volume Total du Système' : 'Total System Volume'}
                </span>
                <span className="text-lg font-black text-[#0B2346]">
                  {locale === 'ar' ? '90 كبسولة' : locale === 'fr' ? '90 Gélules' : '90 Capsules'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">
                  {locale === 'ar' ? 'مدة البرنامج' : locale === 'fr' ? 'Durée du Programme' : 'Program Duration'}
                </span>
                <span className="text-lg font-black text-[#0B2346]">
                  {locale === 'ar' ? '3 × 30 يومًا' : locale === 'fr' ? '3 × 30 Jours' : '3 × 30 Days'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">
                  {locale === 'ar' ? 'الجرعة اليومية' : locale === 'fr' ? 'Prise Quotidienne' : 'Daily Dosage'}
                </span>
                <span className="text-lg font-black text-[#0B2346]">
                  {locale === 'ar' ? 'كبسولة واحدة / يوم' : locale === 'fr' ? '1 Gélule / Jour' : '1 Capsule / Day'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">
                  {locale === 'ar' ? 'التوثيق والأصالة' : locale === 'fr' ? 'Authentification' : 'Authentication'}
                </span>
                <span className="text-lg font-black text-[#0B2346]">
                  {locale === 'ar' ? 'رمز تسلسلي مشفر' : locale === 'fr' ? 'Code Sérialisé' : 'Serialized Code'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('shop')}
                className="cursor-pointer flex items-center gap-2"
              >
                <span>
                  {locale === 'ar' ? 'عرض في المتجر' : locale === 'fr' ? 'Voir dans la Boutique' : 'View in Catalog'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('verify')}
                className="cursor-pointer flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>
                  {locale === 'ar' ? 'التحقق من رمز العبوة' : locale === 'fr' ? 'Vérifier le Code du Flacon' : 'Verify Container Code'}
                </span>
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: PRODUCT OVERVIEW & PHILOSOPHY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {locale === 'ar' ? 'الفلسفة التأسيسية' : locale === 'fr' ? 'PHILOSOPHIE FONDATRICE' : 'FOUNDATIONAL PHILOSOPHY'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {locale === 'ar' ? 'الاستمرارية التغذوية المنظمة' : locale === 'fr' ? 'Continuité Nutritionnelle Structurée' : 'Structured Nutritional Continuity'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'تم ابتكار ZIRON لحل السبب الرئيسي لفشل المكملات الغذائية: غياب الهيكلية والتوقف المبكر. فبدلاً من زجاجة واحدة مجمعة، يقسم ZIRON الاستهلاك إلى التزامات متسلسلة مدتها 30 يومًا متوافقة مع محطات سلوكية تصاعدية.'
                : locale === 'fr'
                ? 'ZIRON a été créé pour résoudre la cause principale d\'échec des compléments : le manque de structure et l\'arrêt prématuré. Au lieu d\'un flacon en vrac non différencié, ZIRON organise la prise en engagements séquentiels de 30 jours alignés sur des jalons comportementaux progressifs.'
                : 'ZIRON was created to solve the primary failure mode of dietary supplementation: lack of structure and premature discontinuation. Rather than an undifferentiated bulk bottle, ZIRON organizes physical intake into sequential 30-day commitments aligned with progressive behavioral checkpoints.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                {locale === 'ar' ? 'إيقاع الصباح اليومي' : locale === 'fr' ? 'Rythme Circadien Matinal' : 'Circadian Morning Rhythm'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تُؤخذ الكبسولة يوميًا مع وجبة الإفطار لتعزيز انتظام الاستيقاظ، والانضباط في شرب الماء، والتركيز الصباحي.'
                  : locale === 'fr'
                  ? 'Prise quotidienne au petit-déjeuner pour renforcer la régularité du cycle d\'éveil, l\'hydratation et la concentration matinale.'
                  : 'Ingested once daily at breakfast to reinforce wake-cycle consistency, hydration discipline, and morning focus.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                {locale === 'ar' ? 'التدرج المرحلي المنظم' : locale === 'fr' ? 'Progression par Phases' : 'Phase-Based Segregation'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تمثل كل عبوة من 30 كبسولة محطة تشغيلية فارقة: التأسيس، الاستمرارية، وإتقان الالتزام المستقل.'
                  : locale === 'fr'
                  ? 'Chaque flacon de 30 gélules représente un jalon distinct : établir, maintenir et maîtriser la régularité.'
                  : 'Each 30-capsule container represents a distinct operational milestone: establishing, sustaining, and mastering adherence.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                {locale === 'ar' ? 'التتبع الفردي الموثق' : locale === 'fr' ? 'Traçabilité Individuelle' : 'Individual Traceability'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تحمل كل عبوة رمز أمان تسلسلي فريد مقاوم للتلاعب يربط المنتج المادي بالبوابة الرقمية الشخصية.'
                  : locale === 'fr'
                  ? 'Chaque flacon dispose d\'un code d\'inviolabilité sérialisé individuel, liant le produit physique à l\'espace numérique.'
                  : 'Every container features an individual tamper-evident serialized identity code, linking physical goods with digital accountability.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE THREE PHASE CONTAINERS */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block mb-2">
              {locale === 'ar' ? 'مكونات المنظومة المادية' : locale === 'fr' ? 'COMPOSANTS PHYSIQUES DU SYSTÈME' : 'PHYSICAL SYSTEM COMPONENTS'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-2">
              {locale === 'ar' ? 'ثلاث عبوات متسلسلة لـ 30 يومًا' : locale === 'fr' ? 'Trois Flacons Séquentiels de 30 Jours' : 'Three Sequential 30-Day Containers'}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'تحتوي كل عبوة على 30 كبسولة دقيقة، مغلقة بأختام أمان ملونة مقاومة للتلاعب.'
                : locale === 'fr'
                ? 'Chaque unité contient exactement 30 gélules scellées sous pastilles de sécurité colorées.'
                : 'Each unit contains exactly 30 capsules, sealed under individual color-coded tamper security tags.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {phaseItems.map((item) => (
              <Card
                key={item.id}
                variant="default"
                className="flex flex-col justify-between border-t-4"
                style={{ borderTopColor: item.containerColorHex }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="navy">{item.badgeText}</Badge>
                    <span className="text-[11px] font-mono text-gray-400">{item.sku}</span>
                  </div>

                  <div className="text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                    {item.phase === 1
                      ? (locale === 'ar' ? 'الشهر 01 (الأيام 01–30)' : locale === 'fr' ? 'Mois 01 (Jours 01–30)' : 'Month 01 (Days 01–30)')
                      : item.phase === 2
                      ? (locale === 'ar' ? 'الشهر 02 (الأيام 31–60)' : locale === 'fr' ? 'Mois 02 (Jours 31–60)' : 'Month 02 (Days 31–60)')
                      : (locale === 'ar' ? 'الشهر 03 (الأيام 61–90)' : locale === 'fr' ? 'Mois 03 (Jours 61–90)' : 'Month 03 (Days 61–90)')}
                  </div>

                  <h3 className="text-xl font-bold text-[#0B2346] mb-1">{item.name}</h3>

                  <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-3 my-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">
                        {locale === 'ar' ? 'سعة العبوة:' : locale === 'fr' ? 'Volume du Flacon :' : 'Container Volume:'}
                      </span>
                      <span className="font-bold text-[#0B2346]">
                        {item.capsuleCount} {locale === 'ar' ? 'كبسولة' : locale === 'fr' ? 'gélules' : 'capsules'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">
                        {locale === 'ar' ? 'فترة الروتين:' : locale === 'fr' ? 'Période Ciblée :' : 'Routine Target:'}
                      </span>
                      <span className="font-bold text-[#0B2346]">
                        {locale === 'ar' ? `تكفي ${item.supplyDays} يومًا` : locale === 'fr' ? `approvisionnement ${item.supplyDays} jours` : `${item.supplyDays}-day supply`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                      <span className="text-gray-500 font-medium">
                        {locale === 'ar' ? 'سعر العملة المحلية:' : locale === 'fr' ? 'Devise Marché :' : 'Retail Currency:'}
                      </span>
                      <span className="font-bold text-gray-700 font-mono">
                        {formatDzdPrice(item.priceDzd, locale)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-gray-600 mb-4 bg-gray-50 p-3 border border-gray-100">
                    <div className="font-bold text-[#0B2346] uppercase text-[10px] mb-1">
                      {locale === 'ar' ? 'أهداف ومحطات المرحلة:' : locale === 'fr' ? 'Objectifs & Jalons de la Phase :' : 'Phase Focus & Checkpoints:'}
                    </div>
                    {item.phase === 1 && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {locale === 'ar' ? 'ترسيخ عادة التناول الصباحي المنضبط' : locale === 'fr' ? 'Établir la discipline de prise matinale' : 'Establish morning intake discipline'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {locale === 'ar' ? 'بدء تسجيل شرب الماء وانتظام النوم' : locale === 'fr' ? 'Journalisation du sommeil et de l’hydratation' : 'Initial hydration & sleep logging'}
                          </span>
                        </div>
                      </>
                    )}
                    {item.phase === 2 && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {locale === 'ar' ? 'النشاط الحركي البدني واستمرارية العادات' : locale === 'fr' ? 'Mouvement physique & continuité des routines' : 'Physical movement & habit continuity'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {locale === 'ar' ? 'المشاركة في نقاشات مجتمع الأقران' : locale === 'fr' ? 'Participation aux échanges de cohorte' : 'Participate in peer cohort discussions'}
                          </span>
                        </div>
                      </>
                    )}
                    {item.phase === 3 && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {locale === 'ar' ? 'تثبيت الروتين الذاتي واستقراره المستقل' : locale === 'fr' ? 'Stabilisation autonome des routines' : 'Autonomous routine stabilization'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {locale === 'ar' ? 'استكمال شهادات مدرسة ZIRON التعليمية' : locale === 'fr' ? 'Certification du cursus École ZIRON' : 'ZIRON School curriculum certification'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-500">
                    {locale === 'ar' ? `ختم ${item.colorName}` : locale === 'fr' ? `SCEAU ${item.colorName}` : `${item.colorName} SEAL`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('shop')}
                    className="cursor-pointer"
                  >
                    {locale === 'ar' ? 'اختيار العبوة' : locale === 'fr' ? 'Choisir le Flacon' : 'Select Container'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Complete Bundle Highlight */}
          {bundleItem && (
            <div className="bg-white border-2 border-[#0B2346] p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Badge variant="navy">{bundleItem.badgeText}</Badge>
                    <span className="text-xs font-mono text-gray-500">{bundleItem.sku}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0B2346] mb-2">
                    {bundleItem.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {bundleItem.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#2E9E45]" />
                      <span>
                        {locale === 'ar'
                          ? '3 عبوات × 30 كبسولة = 90 كبسولة إجمالاً'
                          : locale === 'fr'
                          ? '3 flacons × 30 gélules = 90 gélules au total'
                          : '3 containers × 30 capsules = 90 capsules total'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#2E9E45]" />
                      <span>
                        {locale === 'ar'
                          ? 'تغطية متسلسلة كاملة (من اليوم 01 حتى 90)'
                          : locale === 'fr'
                          ? 'Couverture séquentielle complète (Jours 01 à 90)'
                          : 'Full sequential coverage (Days 01 through 90)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#2E9E45]" />
                      <span>
                        {locale === 'ar'
                          ? 'رموز توثيق تسلسلية مستقلة لكل عبوة'
                          : locale === 'fr'
                          ? 'Codes de vérification sérialisés individuels'
                          : 'Individual serialized container verification codes'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 shrink-0">
                  <div className="text-start lg:text-end">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500">
                      {locale === 'ar' ? 'السعر في الكتالوج (د.ج)' : locale === 'fr' ? 'Prix Catalogue (DZD)' : 'Catalog Price (DZD)'}
                    </div>
                    <div className="text-xl font-bold font-mono text-[#0B2346]">
                      {formatDzdPrice(bundleItem.priceDzd, locale)}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('shop')}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    {locale === 'ar' ? 'طلب الحزمة في المتجر' : locale === 'fr' ? 'Voir le Pack dans la Boutique' : 'View Bundle in Shop'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: COMPOUND SELECTION & FORMULATION PHILOSOPHY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {locale === 'ar' ? 'الشفافية في التركيب' : locale === 'fr' ? 'DIVULGATION DES FORMULES' : 'FORMULATION DISCLOSURE'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {locale === 'ar' ? 'فلسفة الشفافية التامة في المكونات' : locale === 'fr' ? 'Philosophie de Transparence des Ingrédients' : 'Transparent Compound Philosophy'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'ترفض VIREXON BIOSCIENCES إخفاء التركيبات خلف خلطات تجارية غامضة. يتم تقييم كل مركب بناءً على التوافر الحيوي، والتحمل الأيضي، والتناغم الغذائي المتكامل.'
                : locale === 'fr'
                ? 'VIREXON BIOSCIENCES refuse la pratique consistant à masquer les formulations derrière des mélanges exclusifs. Chaque composé est évalué pour sa biodisponibilité, sa tolérance métabolique et sa synergie.'
                : 'VIREXON BIOSCIENCES refuses the industry habit of hiding formulations behind arbitrary proprietary names. Every compound is evaluated for biological bioavailability, metabolic tolerability, and harmonious nutrient synergy.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2">
                {locale === 'ar' ? 'خالٍ من الخلطات الغامضة' : locale === 'fr' ? 'Sans Mélanges Propriétaires Masqués' : 'No Proprietary Blends'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'لا نجمع المكونات تحت أرقام إجمالية لإخفاء نسب المواد المالئة الرخيصة. جميع المركبات معلنة بدقة.'
                  : locale === 'fr'
                  ? 'Nous ne regroupons pas les ingrédients sous un chiffre unique pour masquer les proportions. Tous les composés sont déclarés.'
                  : 'We do not group ingredients under single aggregate numbers to obscure cheap filler proportions. All compounds follow declared standards.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2">
                {locale === 'ar' ? 'دون مواد مالئة اصطناعية' : locale === 'fr' ? 'Zéro Excipient Inutile' : 'Zero Gratuitous Fillers'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تُنتج الكبسولات دون ألوان صناعية أو إضافات كيميائية غير ضرورية ليس لها أي قيمة غذائية.'
                  : locale === 'fr'
                  ? 'Les gélules sont produites sans colorants artificiels, sans agents d\'écoulement superflus ni composés masquants synthétiques.'
                  : 'Capsules are produced without artificial dyes, unnecessary flow agents, or synthetic masking compounds that provide no nutritional value.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2">
                {locale === 'ar' ? 'سياسة التوثيق والأدلة' : locale === 'fr' ? 'Documentation Analytique Documentée' : 'Documented Evidence Policy'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'سيتم نشر الملفات الفنية ونماذج شهادات التحليل والمواصفات المعملية فور اعتماد دفعات الإنتاج.'
                  : locale === 'fr'
                  ? 'Les dossiers techniques, certificats d\'analyse (CoA) et spécifications seront publiés au fur et à mesure des lots de production.'
                  : 'Technical dossiers, certificate of analysis (CoA) templates, and analytical specifications will be published as production lots are released.'}
              </p>
            </div>
          </div>

          <Alert variant="info" title={locale === 'ar' ? 'إشعار الوثائق الفنية' : locale === 'fr' ? 'Avis de Documentation Technique' : 'Technical Documentation Notice'}>
            {locale === 'ar'
              ? 'سيتم نشر المواصفات الكمية الدقيقة للمكونات ووثائق التحقق المخبري فور تسجيل الدفعات التجارية.'
              : locale === 'fr'
              ? 'Les spécifications quantitatives précises et les vérifications de laboratoire seront publiées dès l\'enregistrement des lots commerciaux.'
              : 'Precise quantitative ingredient specifications and analytical laboratory verification documents will be published upon commercial batch registration.'}
          </Alert>
        </section>

        {/* SECTION 5: HOW IT FITS INTO THE DAILY PROTOCOL */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {locale === 'ar' ? 'التكامل مع الروتين اليومي' : locale === 'fr' ? 'INTÉGRATION DANS LA ROUTINE QUOTIDIENNE' : 'DAILY PROTOCOL INTEGRATION'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {locale === 'ar' ? 'كيف يتكامل ZIRON مع يومك' : locale === 'fr' ? 'Comment ZIRON s\'Intègre à Votre Journée' : 'How ZIRON Fits into Your Day'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'التغذية وحدها لا تكفي. يعمل ZIRON كنقطة ارتكاز لروتين عافية يومي منظم يتألف من ثلاث محطات منضبطة:'
                : locale === 'fr'
                ? 'La nutrition seule ne suffit pas. ZIRON sert de point d\'ancrage à une routine quotidienne structurée articulée en trois repères :'
                : 'Nutritional intake alone is insufficient. ZIRON acts as an anchor for a structured daily wellness routine composed of three disciplined checkpoints:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center gap-2 text-[#0B2346]">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {locale === 'ar' ? '07:00–09:00 • التناول الصباحي' : locale === 'fr' ? '07h00–09h00 • Prise Matinale' : '07:00–09:00 • Morning Intake'}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تناول كبسولة واحدة مع وجبة الإفطار وما لا يقل عن 250 مل من الماء. سجّل حضورك الصباحي في بوابة ZIRON.'
                  : locale === 'fr'
                  ? 'Prendre 1 gélule au petit-déjeuner avec au moins 250 ml d\'eau. Validez votre pointage matinal dans l\'espace ZIRON Hub.'
                  : 'Take 1 capsule with breakfast and at least 250 ml of room-temperature water. Log your morning check-in in the ZIRON Hub companion dossier.'}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center gap-2 text-[#0B2346]">
                <Droplet className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {locale === 'ar' ? '12:00–14:00 • الترطيب والتعلم' : locale === 'fr' ? '12h00–14h00 • Hydratation & Apprentissage' : '12:00–14:00 • Hydration & Learning'}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'تأكد من شرب كمية كافية من الماء (هدف 2.0-2.5 لتر يوميًا). أكمل درسًا عمليًا قصيرًا في مناهج مدرسة ZIRON.'
                  : locale === 'fr'
                  ? 'Veillez à une bonne hydratation (objectif 2,0–2,5 L). Suivez une courte leçon pratique du cursus ZIRON Restart.'
                  : 'Ensure adequate hydration (2.0–2.5 L daily target). Complete one bite-sized practical lesson in the ZIRON Restart educational curriculum.'}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center gap-2 text-[#0B2346]">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {locale === 'ar' ? '21:00–22:30 • تهيئة النوم' : locale === 'fr' ? '21h00–22h30 • Préparation au Sommeil' : '21:00–22:30 • Sleep Alignment'}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'ابتعد عن الشاشات والمنبهات. راجع مؤشرات التزامك اليومي واستعد لنوم هادئ ومريح لمدة 7-8 ساعات متواصلة.'
                  : locale === 'fr'
                  ? 'Éteignez les écrans stimulants. Passez en revue votre régularité et préparez-vous pour 7 à 8 heures de sommeil réparateur.'
                  : 'Disconnect from high-stimulation screens. Review daily consistency metrics and prepare for 7–8 hours of uninterrupted restorative sleep.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6: RESPONSIBLE USE & REGULATORY BOUNDARIES */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-2 text-amber-700 font-mono text-[10px] uppercase tracking-wider font-bold mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {locale === 'ar' ? 'إرشادات الاستخدام المسؤول' : locale === 'fr' ? 'CONSIGNES D\'UTILISATION RESPONSABLE' : 'RESPONSIBLE USE GUIDELINES'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {locale === 'ar' ? 'إفصاحات الصحة والسلامة الإلزامية' : locale === 'fr' ? 'Divulgations Obligatoires de Santé & Sécurité' : 'Mandatory Health & Safety Disclosures'}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'تلتزم VIREXON BIOSCIENCES بأعلى معايير التواصل الأخلاقي. نوضح بشفافية تامة طبيعة ZIRON وما لا يمثله.'
                : locale === 'fr'
                ? 'VIREXON BIOSCIENCES applique des normes éthiques strictes. Nous indiquons en toute transparence ce qu\'est ZIRON et ce qu\'il n\'est pas.'
                : 'VIREXON BIOSCIENCES enforces strict ethical communication standards. We provide transparent guidance on what ZIRON is—and what it is not.'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-1">
                {locale === 'ar' ? 'ليس علاجًا طبيًا ولا دواءً للإدمان' : locale === 'fr' ? 'PAS UN TRAITEMENT MÉDICAL NI UN REMÈDE CONTRE LES ADDICTIONS' : 'NOT A MEDICAL TREATMENT OR ADDICTION CURE'}
              </p>
              <p>
                {locale === 'ar'
                  ? 'ZIRON هو برنامج عافية غذائي منظم. وليس مخصصًا لتشخيص أو علاج أو شفاء أو الوقاية من أي مرض أو اضطراب نفسي أو إدماني. ولا يحل بديلاً عن الرعاية الطبية أو العلاج النفسي المتخصص.'
                  : locale === 'fr'
                  ? 'ZIRON est un programme de bien-être nutritionnel. Il n\'est pas destiné à diagnostiquer, traiter, guérir ou prévenir une maladie, un trouble psychologique ou une dépendance. Il ne remplace pas une prise en charge médicale ou psychiatrique.'
                  : 'ZIRON is a dietary wellness program. It is not intended to diagnose, treat, cure, or prevent any disease, psychological condition, substance use disorder, or physiological dependence. It is not a substitute for clinical medical care, psychiatric therapy, or medically supervised rehabilitation programs.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="font-bold text-[#0B2346] block mb-1">
                  {locale === 'ar' ? 'الفئة المستهدفة' : locale === 'fr' ? 'Public Cible' : 'Target Demographic'}
                </span>
                {locale === 'ar'
                  ? 'مخصص حصريًا للبالغين الأصحاء من سن 18 عامًا فما فوق. لا تتجاوز الجرعة اليومية المقررة وهي كبسولة واحدة يوميًا.'
                  : locale === 'fr'
                  ? 'Réservé exclusivement aux adultes en bonne santé de 18 ans et plus. Ne pas dépasser la dose recommandée d\'une gélule par jour.'
                  : 'Intended exclusively for healthy adults aged 18 and older. Do not exceed the recommended daily serving size of one capsule per day.'}
              </div>

              <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="font-bold text-[#0B2346] block mb-1">
                  {locale === 'ar' ? 'الاستشارة الطبية' : locale === 'fr' ? 'Avis Médical' : 'Medical Consultation'}
                </span>
                {locale === 'ar'
                  ? 'يجب على الحوامل والمرضعات ومن يتناولون أدوية بوصفة طبية أو يخضعون لإشراف طبي استشارة طبيب مرخص قبل البدء.'
                  : locale === 'fr'
                  ? 'Les femmes enceintes ou allaitantes, les personnes sous traitement ou sous suivi médical doivent consulter un médecin agréé.'
                  : 'Individuals who are pregnant, nursing, taking prescription medications, or under medical supervision must consult a licensed physician before beginning.'}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: QUALITY & SERIALIZATION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
                {locale === 'ar' ? 'بنية الأمان والحماية' : locale === 'fr' ? 'ARCHITECTURE DE SÉCURITÉ' : 'SECURITY ARCHITECTURE'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
                {locale === 'ar' ? 'التوثيق التسلسلي لأصالة المنتج' : locale === 'fr' ? 'Authentification Sérialisée du Produit' : 'Serialized Product Authentication'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                {locale === 'ar'
                  ? 'تشكل المنتجات المقلدة والمغشوشة خطرًا كبيرًا على الصحة. تتميز كل عبوة ZIRON برمز أمان أبجدي رقمي فريد أسفل ختم الحماية.'
                  : locale === 'fr'
                  ? 'Les contrefaçons représentent un risque sanitaire majeur. Chaque flacon ZIRON comporte un code alphanumérique individuel sous pastille d\'inviolabilité.'
                  : 'Counterfeit and adulterated health supplements represent a severe public health hazard. Every individual ZIRON container features an individualized alphanumeric security code under a tamper-evident seal.'}
              </p>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {locale === 'ar' ? 'رمز تسلسلي أبجدي رقمي فريد لكل عبوة (ZR-XXXX-XXXX-XXXX)' : locale === 'fr' ? 'Numéro de série alphanumérique unique (ZR-XXXX-XXXX-XXXX)' : 'Unique alphanumeric container serial (ZR-XXXX-XXXX-XXXX)'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {locale === 'ar' ? 'ختم أمان ملون مقاوم للتلاعب مطابق للون المرحلة المقابلة' : locale === 'fr' ? 'Sceau d\'inviolabilité avec code couleur adapté à chaque phase' : 'Tamper-evident color-coded seal matched to the respective phase'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {locale === 'ar' ? 'تحقق فوري من الأصالة قبل فتح غلاف العبوة' : locale === 'fr' ? 'Vérification d\'authenticité instantanée avant ouverture' : 'Instant authenticity check prior to opening packaging'}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('verify')}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>
                    {locale === 'ar' ? 'الدخول لبوابة التحقق' : locale === 'fr' ? 'Consulter le Portail de Vérification' : 'Check Verification Portal'}
                  </span>
                </Button>
              </div>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                {locale === 'ar' ? 'نموذج بيانات العبوة الموثقة' : locale === 'fr' ? 'EXEMPLE DE FLACON SPÉCIMEN' : 'CONTAINER SPECIMEN BREAKDOWN'}
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-white border border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-gray-500">
                    {locale === 'ar' ? 'الرقم التسلسلي للعبوة' : locale === 'fr' ? 'Série du Flacon' : 'Container Serial'}
                  </span>
                  <span className="font-bold text-[#0B2346]">ZR-PH01-DEMO-001</span>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-gray-500">
                    {locale === 'ar' ? 'حالة الختم' : locale === 'fr' ? 'État du Sceau' : 'Seal Status'}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {locale === 'ar' ? 'أصلي وموثق' : locale === 'fr' ? 'AUTHENTIQUE VÉRIFIÉ' : 'VERIFIED AUTHENTIC'}
                  </span>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-gray-500">
                    {locale === 'ar' ? 'عدد الكبسولات' : locale === 'fr' ? 'Nombre de Gélules' : 'Capsule Count'}
                  </span>
                  <span className="font-bold text-[#0B2346]">
                    {locale === 'ar' ? '30 كبسولة (تكفي 30 يومًا)' : locale === 'fr' ? '30 GÉLULES (30 JOURS)' : '30 CAPSULES (30-DAY SUPPLY)'}
                  </span>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-gray-500">
                    {locale === 'ar' ? 'السوق المستهدف' : locale === 'fr' ? 'Marché Cible' : 'Market Target'}
                  </span>
                  <span className="font-bold text-gray-700">
                    {locale === 'ar' ? 'الجزائر (د.ج)' : locale === 'fr' ? 'ALGÉRIE (DZD)' : 'ALGERIA (DZD)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: PRODUCT FAQ ACCORDION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {locale === 'ar' ? 'قاعدة المعرفة' : locale === 'fr' ? 'BASE DE CONNAISSANCES' : 'KNOWLEDGE BASE'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-2">
              {locale === 'ar' ? 'الأسئلة الشائعة حول المنتج' : locale === 'fr' ? 'Foire Aux Questions' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {locale === 'ar'
                ? 'إرشادات فنية وتشغيلية واضحة حول منظومة منتجات ZIRON.'
                : locale === 'fr'
                ? 'Conseils techniques et pratiques clairs sur le système de produits ZIRON.'
                : 'Clear technical and operational guidance regarding the ZIRON product system.'}
            </p>
          </div>

          <div className="space-y-3 max-w-4xl">
            {productFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-[#E2E8F0] bg-[#F5F7FA] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-start flex items-center justify-between gap-4 cursor-pointer hover:bg-white"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#0B2346]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0B2346]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 bg-white border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 9: CALL TO ACTION */}
        <section className="bg-[#0B2346] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {locale === 'ar'
                ? 'ابدأ رحلتك المنظمة لـ 90 يومًا'
                : locale === 'fr'
                ? 'Démarrez Votre Trajectoire de 90 Jours'
                : 'Begin Your 90-Day Trajectory'}
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              {locale === 'ar'
                ? 'استكشف عبوات المراحل وخيارات الحزم في المتجر، أو تحقق من رمز عبوة في حوزتك.'
                : locale === 'fr'
                ? 'Explorez les flacons de phase et les options de pack, ou vérifiez un flacon en votre possession.'
                : 'Explore available phase containers and bundle options in the catalog, or verify an existing container in your possession.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('shop')}
              className="bg-white text-[#0B2346] hover:bg-gray-100 cursor-pointer"
            >
              {locale === 'ar' ? 'استعراض المتجر' : locale === 'fr' ? 'Explorer la Boutique' : 'Explore Catalog'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('verify')}
              className="border-white/30 text-white hover:bg-white/10 cursor-pointer"
            >
              {locale === 'ar' ? 'التحقق من رمز المنتج' : locale === 'fr' ? 'Vérifier le Code Produit' : 'Verify Product Code'}
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
};
