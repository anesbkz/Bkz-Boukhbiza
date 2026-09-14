import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  GraduationCap,
  Award,
  ArrowRight,
  Compass,
  Cpu,
  Sprout,
  TrendingUp,
  Activity,
  Sun,
  Wrench,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  HelpCircle,
  Briefcase,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export const AppRestartPage: React.FC = () => {
  const { locale, navigate } = useI18n();
  const { hasSchoolAccess, qualifyingContainerCount } = useCustomerEntitlements();

  const isArabic = locale === 'ar';
  const isFrench = locale === 'fr';

  const pathways = [
    {
      step: '01',
      title: isArabic ? 'التعافي' : isFrench ? 'Rétablissement' : 'Recovery',
      subtitle: isArabic ? 'استعادة التوازن الفسيولوجي' : isFrench ? 'Restauration physiologique' : 'Physiological baseline restoration',
      desc: isArabic
        ? 'الانتظام البيولوجي والتثبيت السريري من خلال بروتوكول ZIRON اليومي الدقيق.'
        : isFrench
        ? 'Stabilisation clinique et régulation métabolique via la prise quotidienne ZIRON.'
        : 'Clinical stabilization and metabolic baseline reset through disciplined daily ZIRON intake.',
      status: 'active',
      icon: Activity,
    },
    {
      step: '02',
      title: isArabic ? 'التعلم' : isFrench ? 'Apprentissage' : 'Learning',
      subtitle: isArabic ? 'مدرسة ZIRON للتمكن' : isFrench ? 'ZIRON School' : 'ZIRON School Access',
      desc: isArabic
        ? 'تفتح مدرسة ZIRON فور تفعيل 3 عبوات منتجات فريدة، لتوفير مناهج تطبيقية متطورة.'
        : isFrench
        ? 'Accès débloqué dès l’activation de 3 contenants uniques ZIRON pour des cursus de pointe.'
        : 'Full curriculum unlocks upon activation of 3 unique product containers, offering real-world tracks.',
      status: hasSchoolAccess ? 'active' : 'pending',
      icon: GraduationCap,
    },
    {
      step: '03',
      title: isArabic ? 'المهارات' : isFrench ? 'Compétences' : 'Skills',
      subtitle: isArabic ? 'تأهيل تقني وميداني' : isFrench ? 'Capacités pratiques' : 'Applied Capabilities',
      desc: isArabic
        ? 'اكتساب مهارات عالية القيمة في الزراعة الدقيقة، التكنولوجيا الرقمية، وتربية النحل والمشاريع.'
        : isFrench
        ? 'Acquisition de savoir-faire à haute valeur : agro-technologie, numérique, apiculture et gestion.'
        : 'High-leverage capabilities in bio-agriculture, digital operations, technical trades, and ventures.',
      status: hasSchoolAccess ? 'active' : 'upcoming',
      icon: Wrench,
    },
    {
      step: '04',
      title: isArabic ? 'الاعتماد والشهادة' : isFrench ? 'Certification' : 'Certification',
      subtitle: isArabic ? 'شهادات مشفرة موثقة' : isFrench ? 'Titres infalsifiables' : 'Cryptographic Proof',
      desc: isArabic
        ? 'إصدار شهادات معتمدة برقم تسلسلي مشفر يمكن التحقق منه علنًا دون كشف البيانات الشخصية.'
        : isFrench
        ? 'Émission de certificats immuables avec numéro cryptographique vérifiable publiquement.'
        : 'Tamper-proof verifiable credentials with cryptographic serials and privacy preservation.',
      status: 'upcoming',
      icon: Award,
    },
    {
      step: '05',
      title: isArabic ? 'الفرص' : isFrench ? 'Opportunités' : 'Opportunity',
      subtitle: isArabic ? 'ربط بالعمل والإنتاج' : isFrench ? 'Intégration productive' : 'Productive Pathways',
      desc: isArabic
        ? 'شبكة شراكات للتوجيه المهني، ورش العمل الميدانية، وتطبيقات الأعمال الواقعية.'
        : isFrench
        ? 'Réseau d’intégration pour stages professionnels, collaborations et incubation locale.'
        : 'Placement partnerships, mentorship pipelines, and field implementation frameworks.',
      status: 'upcoming',
      icon: Briefcase,
    },
    {
      step: '06',
      title: isArabic ? 'الانطلاقة الجديدة' : isFrench ? 'Nouveau Départ' : 'New Start',
      subtitle: isArabic ? 'استقلالية وإنتاجية مستدامة' : isFrench ? 'Autonomie pérenne' : 'Sustainable Autonomy',
      desc: isArabic
        ? 'تحقيق الاستقلال المالي والاجتماعي الكامل كأعضاء فاعلين ومنتجين في المجتمع.'
        : isFrench
        ? 'Autonomie économique durable et accomplissement personnel pérenne.'
        : 'Full economic independence, community leadership, and autonomous personal agency.',
      status: 'future',
      icon: Sparkles,
    },
  ];

  const skillTracks = [
    {
      id: 'digital-skills',
      title: isArabic ? 'المهارات الرقمية' : isFrench ? 'Compétences Numériques' : 'Digital Skills',
      desc: isArabic
        ? 'بنية البيانات الحديثة، سير العمل الآلي، وإدارة المنظومات البرمجية.'
        : isFrench
        ? 'Architecture de données, automatisation opérationnelle et logiciels modernes.'
        : 'Data architectures, operational workflow automation, and modern systems.',
      icon: Cpu,
    },
    {
      id: 'agriculture',
      title: isArabic ? 'الزراعة الحيوية الدقيقة' : isFrench ? 'Agriculture Bio-Durable' : 'Precision Agriculture',
      desc: isArabic
        ? 'إدارة الركائز، تجديد التربة، ودورات الري عالية الكفاءة.'
        : isFrench
        ? 'Optimisation des substrats, régénération des sols et irrigation haute précision.'
        : 'Substrate balance, soil biology, and high-efficiency water cycles.',
      icon: Sprout,
    },
    {
      id: 'livestock',
      title: isArabic ? 'تربية المواشي والحيوانات' : isFrench ? 'Élevage & Nutrition' : 'Livestock Management',
      desc: isArabic
        ? 'الوقاية البيطرية، بروتوكولات التغذية المتوازنة، والحوكمة الحيوية.'
        : isFrench
        ? 'Santé du cheptel, protocoles nutritionnels et hygiène vétérinaire rationnelle.'
        : 'Herd biosecurity, balanced nutrition protocols, and animal husbandry.',
      icon: Activity,
    },
    {
      id: 'beekeeping',
      title: isArabic ? 'تربية النحل وإنتاج العسل' : isFrench ? 'Apiculture & Ruches' : 'Beekeeping & Apiculture',
      desc: isArabic
        ? 'إنشاء المناحل، تشخيص صحة المستعمرات، وتكنولوجيا استخلاص العسل.'
        : isFrench
        ? 'Implantation de ruchers, santé des colonies et récolte de haute qualité.'
        : 'Apiary installation, colony health monitoring, and precision harvesting.',
      icon: Sun,
    },
    {
      id: 'trades',
      title: isArabic ? 'الحرف والمهن التطبيقية' : isFrench ? 'Métiers Pratiques' : 'Practical Trades',
      desc: isArabic
        ? 'الميكانيكا الأساسية، الشبكات الكهربائية، والمهارات الفنية الميدانية.'
        : isFrench
        ? 'Mécanique fondamentale, électro-technique et fabrication appliquée.'
        : 'Applied mechanics, field electrical setups, and physical infrastructure.',
      icon: Wrench,
    },
    {
      id: 'entrepreneurship',
      title: isArabic ? 'ريادة الأعمال والمشاريع' : isFrench ? 'Entrepreneuriat' : 'Venture Economics',
      desc: isArabic
        ? 'اقتصاديات المشاريع الصغيرة، هوامش الربح، وإدارة السيولة النقدية.'
        : isFrench
        ? 'Viabilité des micro-entreprises, seuil de rentabilité et gestion de trésorerie.'
        : 'Micro-enterprise economics, unit margins, and disciplined cash governance.',
      icon: TrendingUp,
    },
    {
      id: 'personal-development',
      title: isArabic ? 'التطوير الشخصي والتمكن' : isFrench ? 'Développement Personnel' : 'Personal Mastery',
      desc: isArabic
        ? 'الانضباط السلوكي، استراتيجيات اتخاذ القرار، وإدارة الضغوط المعقدة.'
        : isFrench
        ? 'Discipline comportementale, matrices de décision et résilience mentale.'
        : 'Behavioral discipline, decision matrices, and stress equilibrium.',
      icon: Compass,
    },
  ];

  return (
    <div className="space-y-12 pb-16" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* 1. HERO DOSSIER */}
      <section className="relative bg-[#0B2346] text-white border border-[#1E3A8A] p-6 sm:p-10 overflow-hidden shadow-sm">
        <GridPattern opacity={0.07} />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 text-blue-200 px-2.5 py-1 border border-white/15">
              ZIRON RESTART PROTOCOL • VX-RST-2026
            </span>
            <span className="text-[10px] font-mono text-gray-300 uppercase">
              {isArabic ? 'منصة التمكين الشامل' : isFrench ? 'Écosystème de Réinsertion' : 'Comprehensive Enablement Platform'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {isArabic
              ? 'أكثر من مجرد منتج — مسار كامل نحو انطلاقة جديدة'
              : isFrench
              ? 'Plus qu’un produit : une trajectoire vers un nouveau départ'
              : 'More than a product. A structured pathway to a new start.'}
          </h1>

          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-3xl">
            {isArabic
              ? 'تم تصميم ZIRON كمنظومة متكاملة تنقلك من استعادة التوازن الصحي والتعافي، إلى التمكن المعرفي، واكتساب المهارات الحقيقية، والاعتماد الرسمي، وفتح آفاق العمل والإنتاج المستقل.'
              : isFrench
              ? 'ZIRON est conçu comme un écosystème global articulant stabilisation biologique, apprentissage appliqué, certification immuable et émancipation économique.'
              : 'ZIRON is engineered as an integrated human re-emergence protocol: moving from biological recovery to structured learning, verified skills, cryptographic certification, and independent economic vitality.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('app/school')}
              className="bg-white text-[#0B2346] hover:bg-gray-100 border-none font-bold text-xs"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              {isArabic ? 'الدخول إلى مدرسة ZIRON' : isFrench ? 'Accéder à ZIRON School' : 'Enter ZIRON School'}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('app/school/courses')}
              className="border-white/30 text-white hover:bg-white/10 font-bold text-xs"
            >
              <Layers className="w-4 h-4 mr-2" />
              {isArabic ? 'استعراض المسارات التدريبية' : isFrench ? 'Explorer les Formations' : 'Browse Course Catalog'}
            </Button>
          </div>
        </div>
      </section>

      {/* 2. THE 6-STAGE PATHWAY */}
      <section className="space-y-6">
        <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
              THE RESTART ARCHITECTURE
            </span>
            <h2 className="text-2xl font-black text-[#0B2346] tracking-tight">
              {isArabic ? 'المسار المنهجي: من التعافي إلى الانطلاقة' : isFrench ? 'La Trajectoire en 6 Étapes' : 'The 6-Stage Integrated Pathway'}
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {isArabic ? 'استمرارية ممنهجة' : isFrench ? 'Continuité Méthodique' : 'Sequential Progression'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathways.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-6 border border-[#E2E8F0] bg-white flex flex-col justify-between hover:border-[#0B2346] transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 text-[#0B2346] border border-gray-200">
                      STAGE {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0B2346] flex items-center justify-center border border-blue-100">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-[#0B2346]">{item.title}</h3>
                    <p className="text-xs font-bold text-blue-900/70">{item.subtitle}</p>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400 uppercase tracking-wider">
                    {idx === 0
                      ? isArabic ? 'مرحلة حالية' : isFrench ? 'En cours' : 'Active Phase'
                      : idx === 1
                      ? hasSchoolAccess
                        ? isArabic ? 'مفتوح ومتاح' : isFrench ? 'Débloqué' : 'Unlocked'
                        : isArabic ? 'مغلق (يتطلب 3 عبوات)' : isFrench ? 'Verrouillé (3 requis)' : 'Locked (3 req.)'
                      : isArabic ? 'مرحلة لاحقة' : isFrench ? 'Phase Suivante' : 'Sequential'}
                  </span>
                  {idx === 1 && (
                    <button
                      onClick={() => navigate('app/school')}
                      className="text-[#0B2346] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isArabic ? 'عرض' : isFrench ? 'Voir' : 'View'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. MY JOURNEY INTEGRATION */}
      <section className="bg-white border border-[#E2E8F0] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block">
              MY JOURNEY TRACKER
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B2346] tracking-tight">
              {isArabic ? 'متابعة مسارك الشخصي اليومي' : isFrench ? 'Suivi Personnalisé de Votre Parcours' : 'Track Your Personal Journey & Adherence'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isArabic
                ? 'سجل التزامك اليومي بالجرعات، راقب تطور مؤشراتك الحيوية، واكسب نقاط التميز مع كل يوم التزام مستمر.'
                : isFrench
                ? 'Consignez votre adhésion quotidienne aux prises, observez vos jalons et gagnez des points d’assiduité.'
                : 'Log daily intake adherence, visualize recovery milestones, and accumulate progress metrics as your baseline stabilizes.'}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('app/journey')}
            className="border-[#0B2346] text-[#0B2346] font-bold text-xs shrink-0 self-start md:self-center"
          >
            <span>{isArabic ? 'فتح صفحة مساري' : isFrench ? 'Ouvrir Mon Parcours' : 'Open My Journey'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      </section>

      {/* 4. ZIRON SCHOOL FOCUS */}
      <section className="bg-white border border-[#E2E8F0] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#0B2346] text-white font-bold">
                PILLAR 02 • APPLIED EDUCATION
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 border font-bold ${
                hasSchoolAccess
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {hasSchoolAccess
                  ? isArabic ? 'متاح بالكامل' : isFrench ? 'Accès Débloqué' : 'Full Access Active'
                  : isArabic ? 'مغلق حاليًا' : isFrench ? 'Accès Restreint' : 'Access Locked'}
              </span>
            </div>

            <h2 className="text-2xl font-black text-[#0B2346] tracking-tight">
              {isArabic ? 'مدرسة ZIRON للتمكن التطبيقي' : isFrench ? 'ZIRON School de Maîtrise Appliquée' : 'ZIRON School of Applied Mastery'}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isArabic
                ? 'مناهج عملية مكثفة تركز على المهارات الحقيقية ذات الجدوى الاقتصادية والميدانية المباشرة. تفتح المدرسة تلقائيًا بمجرد تفعيل 3 عبوات مختلفة من منتجات ZIRON.'
                : isFrench
                ? 'Formations intensives axées sur l’utilité pratique et la viabilité économique directe. La plateforme se déverrouille à l’activation de 3 contenants ZIRON uniques.'
                : 'Structured applied learning tracks focused on tangible economic utility. Access unlocks automatically upon authenticating 3 unique ZIRON product containers.'}
            </p>

            <div className="p-4 bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-600">
                  {isArabic ? 'العبوات الفريدة المفعلة:' : isFrench ? 'Contenants uniques activés :' : 'Activated Unique Containers:'}
                </span>
                <span className="font-bold text-[#0B2346]">{qualifyingContainerCount} / 3</span>
              </div>
              <div className="w-full bg-gray-200 h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${hasSchoolAccess ? 'bg-emerald-600' : 'bg-[#0B2346]'}`}
                  style={{ width: `${Math.min(100, (qualifyingContainerCount / 3) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                {hasSchoolAccess
                  ? isArabic ? 'تهانينا! اكتملت متطلبات الأهلية وتم فتح المدرسة بالكامل.' : isFrench ? 'Félicitations ! Votre accès complet est validé.' : 'Requirement fulfilled. Full curriculum access granted.'
                  : isArabic
                  ? 'تفتح مدرسة ZIRON فور تفعيل 3 عبوات فريدة من منتجات ZIRON.'
                  : isFrench
                  ? 'ZIRON School se débloque après activation de 3 contenants ZIRON uniques.'
                  : 'ZIRON School unlocks after activation of 3 unique ZIRON product containers.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('app/school')}
                className="bg-[#0B2346] text-white hover:bg-[#0B2346]/90 font-bold text-xs"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                {isArabic ? 'لوحة تحكم المدرسة' : isFrench ? 'Tableau de bord School' : 'School Dashboard'}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('app/school/courses')}
                className="border-[#0B2346] text-[#0B2346] font-bold text-xs"
              >
                <Layers className="w-4 h-4 mr-2" />
                {isArabic ? 'دليل الدورات التدريبية' : isFrench ? 'Catalogue de Cours' : 'Course Catalog'}
              </Button>

              {!hasSchoolAccess && (
                <Button
                  variant="outline"
                  onClick={() => navigate('app/products/activate')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs"
                >
                  {isArabic ? 'تفعيل عبوة جديدة' : isFrench ? 'Activer un Contenant' : 'Activate Container'}
                </Button>
              )}
            </div>
          </div>

          {/* Quick Preview Cards */}
          <div className="w-full lg:w-80 p-5 bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B2346]">
              {isArabic ? 'المسارات الأكاديمية' : isFrench ? 'Filières d’Apprentissage' : 'Curriculum Tracks'}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Cpu className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{isArabic ? 'المهارات الرقمية وأنظمة البيانات' : isFrench ? 'Compétences Numériques' : 'Digital & Modern Operations'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Sprout className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{isArabic ? 'الزراعة الحيوية الدقيقة' : isFrench ? 'Agriculture Bio-Durable' : 'Precision Bio-Agriculture'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Sun className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{isArabic ? 'تربية النحل وإنتاج العسل' : isFrench ? 'Apiculture Rationnelle' : 'Apiculture & Bee Systems'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Activity className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{isArabic ? 'تربية وإدارة الثروة الحيوانية' : isFrench ? 'Élevage & Santé Animale' : 'Livestock Biosecurity'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <TrendingUp className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{isArabic ? 'اقتصاديات المشاريع وريادة الأعمال' : isFrench ? 'Économie des Entreprises' : 'Venture Economics'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Wrench className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{isArabic ? 'المهن والحرف الميدانية' : isFrench ? 'Métiers Pratiques' : 'Technical Trades'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SKILLS & CURRICULUM OVERVIEW */}
      <section className="space-y-6">
        <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
              FIELD CAPABILITIES
            </span>
            <h2 className="text-2xl font-black text-[#0B2346] tracking-tight">
              {isArabic ? 'المهارات الميدانية والتطبيقية' : isFrench ? 'Compétences Opérationnelles' : 'Applied Practical Skills'}
            </h2>
          </div>
          <span className="text-xs text-gray-500">
            {isArabic ? 'مناهج قابلة للتطبيق الفوري' : isFrench ? 'Utilité concrète sur le terrain' : 'Grounded in Real-World Utility'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillTracks.map((track) => {
            const Icon = track.icon;
            return (
              <Card key={track.id} className="p-6 border border-[#E2E8F0] bg-white space-y-3 hover:border-[#0B2346] transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0B2346] flex items-center justify-center border border-blue-100">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#0B2346]">{track.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{track.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 6. CERTIFICATES & CREDENTIALS */}
      <section className="bg-[#0B2346] text-white p-6 sm:p-10 border border-[#1E3A8A] relative overflow-hidden">
        <GridPattern opacity={0.05} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-white/10 text-blue-200 px-2.5 py-1 border border-white/15">
              CRYPTOGRAPHIC CREDENTIALS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isArabic ? 'شهادات إتمام معتمدة وغير قابلة للتزوير' : isFrench ? 'Certificats d’Excellence Infalsifiables' : 'Tamper-Proof Authoritative Certificates'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              {isArabic
                ? 'يتم إصدار الشهادات عند إتمام جميع وحدات واختبارات المسار التدريبي من خلال خوادم موثوقة. يحمل كل مستند رقمًا تسلسليًا مشفرًا يتيح التحقق العام مع الحفاظ الكامل على سرية بيانات الطالب.'
                : isFrench
                ? 'Chaque formation complétée donne lieu à un certificat émis de manière souveraine par le backend, doté d’un numéro cryptographique vérifiable publiquement sans exposer de données personnelles.'
                : 'Course completion generates cryptographically verified credentials issued strictly by backend Cloud Functions. Each certificate features an authoritative alphanumeric serial verifiable worldwide.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('app/school/certificates')}
                className="bg-white text-[#0B2346] hover:bg-gray-100 border-none font-bold text-xs"
              >
                <Award className="w-4 h-4 mr-2" />
                {isArabic ? 'شهاداتي التعليمية' : isFrench ? 'Mes Certificats' : 'My Certificates'}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('verify')}
                className="border-white/30 text-white hover:bg-white/10 font-bold text-xs"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {isArabic ? 'بوابة التحقق العامة' : isFrench ? 'Portail de Vérification' : 'Public Verification Portal'}
              </Button>
            </div>
          </div>

          <div className="p-6 bg-white/5 border border-white/15 w-full lg:w-80 space-y-3">
            <h4 className="text-xs font-mono text-blue-200 uppercase tracking-wider font-bold">
              {isArabic ? 'معايير الأمان المعتمدة' : isFrench ? 'Normes de Sécurité' : 'Security Standards'}
            </h4>
            <ul className="text-xs space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isArabic ? 'إصدار خادمي حصري' : isFrench ? 'Émission serveur souveraine' : 'Server-authoritative issuance'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isArabic ? 'معرف مشفر فريد' : isFrench ? 'Identifiant cryptographique unique' : 'Cryptographic serial identifier'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isArabic ? 'حماية خصوصية الطالب' : isFrench ? 'Zéro fuite de données personnelles' : 'Zero PII leak on public verification'}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. OPPORTUNITIES & REINTEGRATION */}
      <section className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-6">
        <div className="space-y-2 max-w-3xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block">
            ECOSYSTEM VALUE INTEGRATION
          </span>
          <h2 className="text-2xl font-black text-[#0B2346] tracking-tight">
            {isArabic ? 'الفرص العملية والشراكات الإنتاجية' : isFrench ? 'Opportunités & Passerelles Productives' : 'Practical Opportunities & Industry Partnerships'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {isArabic
              ? 'الهدف الأسمى لـ ZIRON RESTART ليس التوقف عند اجتياز المناهج النظرية، بل ربط الخريجين الحاصلين على الشهادات بفرص حقيقية، كالتدريب الميداني والشراكات الزراعية والتجارية.'
              : isFrench
              ? 'L’ambition de ZIRON RESTART dépasse l’acquisition de connaissances : elle crée des passerelles directes vers des opportunités de stage, d’approvisionnement et d’incubation.'
              : 'The ultimate purpose of ZIRON RESTART extends beyond coursework: connecting certified graduates with practical field apprenticeships, commercial distribution partnerships, and enterprise networks.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 bg-gray-50 border border-gray-200 space-y-2">
            <h4 className="text-sm font-bold text-[#0B2346]">
              {isArabic ? 'حاضنات المشاريع الصغيرة' : isFrench ? 'Micro-Incubateurs' : 'Venture Incubation'}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isArabic
                ? 'إرشاد تكتيكي لتأسيس المشروعات الزراعية والخدمية والتقنية المستقلة.'
                : isFrench
                ? 'Accompagnement méthodologique pour le lancement d’activités viables.'
                : 'Structured guidance for launching viable micro-ventures in agro-tech and services.'}
            </p>
          </div>

          <div className="p-5 bg-gray-50 border border-gray-200 space-y-2">
            <h4 className="text-sm font-bold text-[#0B2346]">
              {isArabic ? 'شبكة التوريد والتعاقد' : isFrench ? 'Réseau de Co-Traitance' : 'Contracting Network'}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isArabic
                ? 'إمكانية التعاقد مع شركاء الإنتاج الزراعي وتوريد المنتجات الحيوانية والعسل.'
                : isFrench
                ? 'Accords de distribution pour les récoltes apicoles et produits agricoles.'
                : 'Distribution and supply agreements for honey harvests, crops, and local products.'}
            </p>
          </div>

          <div className="p-5 bg-gray-50 border border-gray-200 space-y-2">
            <h4 className="text-sm font-bold text-[#0B2346]">
              {isArabic ? 'التوجيه المهني المباشر' : isFrench ? 'Mentorat Spécialisé' : 'Direct Mentorship'}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isArabic
                ? 'جلسات مراجعة مع خبراء التخصصات لمراجعة خطط العمل والجدوى الاقتصادية.'
                : isFrench
                ? 'Sessions d’analyse critique avec des pairs et des professionnels confirmés.'
                : 'Peer reviews and feasibility advisory with established technical specialists.'}
            </p>
          </div>
        </div>
      </section>

      {/* 8. FUTURE RESTART FUND (CLEARLY MARKED COMING SOON) */}
      <section className="bg-gradient-to-br from-amber-50/50 via-white to-gray-50 border border-amber-200 p-6 sm:p-10 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-amber-600 text-white font-black px-2.5 py-1">
              COMING SOON • FUTURE PHASE
            </span>
            <span className="text-[10px] font-mono text-amber-900 uppercase font-bold">
              {isArabic ? 'صندوق RESTART للمنح والتمويل' : isFrench ? 'Fonds ZIRON RESTART' : 'ZIRON RESTART FUND'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
            {isArabic ? 'صندوق ZIRON RESTART المستقبلي لدعم الخريجين' : isFrench ? 'Futur Fonds de Financement ZIRON RESTART' : 'Future ZIRON RESTART Enablement Fund'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {isArabic
              ? 'تعتزم مبادرة ZIRON RESTART في مرحلة قادمة إطلاق صندوق تمويل ومنح متناهية الصغر مخصص لدعم الخريجين المعتمدين لتأسيس أدوات ومعدات الإنتاج المستقلة.'
              : isFrench
              ? 'L’initiative ZIRON RESTART prévoit d’intégrer un dispositif de micro-financement et de bourses d’équipement dédié aux lauréats certifiés de ZIRON School.'
              : 'The ZIRON RESTART initiative plans a structured micro-grant facility to seed essential equipment and launch capital for top certified graduates of ZIRON School.'}
          </p>

          <div className="p-4 bg-white border border-amber-300 text-xs text-amber-950 space-y-1">
            <p className="font-bold">
              {isArabic ? 'إشعار توضيحي رسمي:' : isFrench ? 'Avis de Développement :' : 'Official Architectural Notice:'}
            </p>
            <p className="text-amber-900 leading-relaxed">
              {isArabic
                ? 'هذا القسم يمثل مفهومًا مستقبليًا قيد التطوير الهندسي. لا توجد طلبات منح، ولا دفعات مالية، ولا آليات صرف مفعلة في هذه المرحلة.'
                : isFrench
                ? 'Cette section présente un jalon prospectif. Aucune demande de subvention, aucun paiement et aucune distribution de fonds ne sont actifs dans cette phase.'
                : 'This section details a future conceptual milestone. Grant applications, payment rails, eligibility scoring, and fund disbursements are strictly inactive during this platform foundation phase.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
