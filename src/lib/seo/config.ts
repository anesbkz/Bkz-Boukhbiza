import { Locale, PublicRoute } from '@/types';
import { LOCALES } from '@/lib/i18n/config';

/**
 * Resolves the canonical origin for the application.
 * Follows precedence:
 * 1. Explicit environment variable VITE_APP_URL
 * 2. Window origin in browser if non-localhost
 * 3. Default production canonical domain (https://ziron.bio)
 */
export function resolveCanonicalOrigin(): string {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin.replace(/\/+$/, '');
    }
  }

  return 'https://ziron.bio';
}

/**
 * Builds a fully qualified canonical URL for a given public path and optional locale.
 */
export function buildCanonicalUrl(path: string, locale?: Locale): string {
  const origin = resolveCanonicalOrigin();
  const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
  
  if (locale && locale !== 'en') {
    return cleanPath ? `${origin}/${locale}/${cleanPath}` : `${origin}/${locale}`;
  }
  
  return cleanPath ? `${origin}/${cleanPath}` : origin;
}

export interface RouteSeoConfig {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  route: PublicRoute;
  ogType?: 'website' | 'article' | 'product';
  isPrivate?: boolean;
}

/**
 * Canonical registry of public routes and their baseline localized SEO metadata.
 * Uses strictly compliant, non-medical language matching the visible site content.
 */
export const PUBLIC_SEO_CONFIGS: Record<string, RouteSeoConfig> = {
  '': {
    route: '',
    title: {
      en: 'ZIRON | VIREXON BIOSCIENCES — Structured Wellness Protocol',
      fr: 'ZIRON | VIREXON BIOSCIENCES — Protocole de Bien-être Structuré',
      ar: 'ZIRON | فيريكسون بيوساينسز — بروتوكول العافية الغذائية المنتظمة',
    },
    description: {
      en: 'Sequential 90-day dietary wellness protocol structured across three designated phases. Combining daily nutritional routines, education, and serial verification.',
      fr: 'Protocole de bien-être nutritionnel en trois phases séquentielles sur 90 jours. Alliant discipline quotidienne, pédagogie et vérification unitaire.',
      ar: 'بروتوكول عافية غذائية منتظم على مدى 90 يومًا عبر ثلاث مراحل متسلسلة يجمع بين الانضباط والتعليم والتحقق التسلسلي.',
    },
    ogType: 'website',
  },
  'ziron': {
    route: 'ziron',
    title: {
      en: 'ZIRON Product System — Phase-Based Daily Nutrition | VIREXON',
      fr: 'Système Produit ZIRON — Nutrition Séquentielle Quotidienne | VIREXON',
      ar: 'نظام منتجات ZIRON — التغذية اليومية المتسلسلة | فيريكسون',
    },
    description: {
      en: 'Explore the 30-day sequential dietary supplement containers engineered for disciplined morning intake habits and routine consistency.',
      fr: 'Découvrez les contenants de 30 jours conçus pour instaurer une régularité matinale et accompagner chaque phase du programme.',
      ar: 'استكشف عبوات المكملات الغذائية الشهرية المصممة لترسيخ عادات الصباح المنتظمة والالتزام المتسلسل.',
    },
    ogType: 'product',
  },
  'program': {
    route: 'program',
    title: {
      en: 'The 90-Day Protocol — Structured Program Timeline | ZIRON',
      fr: 'Le Protocole 90 Jours — Calendrier Chronologique Structuré | ZIRON',
      ar: 'بروتوكول الـ 90 يومًا — الجدول الزمني للمراحل | ZIRON',
    },
    description: {
      en: 'Sequential 90-day progression divided into three 30-day stages: habit foundation, routine continuity, and long-term wellness autonomy.',
      fr: 'Progression ordonnée en trois phases de 30 jours : instauration des habitudes, continuité de la routine et autonomie durable.',
      ar: 'تدرج منتظم عبر ثلاث مراحل تمتد كل منها 30 يومًا لترسيخ العادات واستدامة نمط الحياة الصحي.',
    },
    ogType: 'website',
  },
  'science': {
    route: 'science',
    title: {
      en: 'Formulation Principles & Transparency | VIREXON BIOSCIENCES',
      fr: 'Démarche Scientifique & Transparence | VIREXON BIOSCIENCES',
      ar: 'المنهج العلمي وشفافية التركيب | فيريكسون بيوساينسز',
    },
    description: {
      en: 'Transparent compound selection, bioavailable forms, and clear quantitative disclosures without proprietary ingredient masking.',
      fr: 'Sélection rigoureuse d’ingrédients biodisponibles, dosages précis et transparence totale sans mélanges propriétaires opaques.',
      ar: 'معايير اختيار دقيقة للمركبات المتاحة حيوياً وشفافية كاملة في المقادير دون خلطات احتكارية مبهمة.',
    },
    ogType: 'website',
  },
  'quality': {
    route: 'quality',
    title: {
      en: 'Quality Standards & Unit Serialization | VIREXON BIOSCIENCES',
      fr: 'Normes de Qualité & Sérialisation Unitaire | VIREXON BIOSCIENCES',
      ar: 'معايير الجودة والتحقق التسلسلي للعبوات | فيريكسون بيوساينسز',
    },
    description: {
      en: 'Methodical manufacturing oversight, internal quality controls, batch compliance, and anti-counterfeiting security identifiers.',
      fr: 'Supervision rigoureuse de la fabrication, contrôles de pureté et identifiants unitaires infalsifiables sur chaque boîte.',
      ar: 'إشراف تصنيعي صارم وفحوصات داخلية لمطابقة الدفعات ومعرفات أمان فريدة لكل عبوة.',
    },
    ogType: 'website',
  },
  'verify': {
    route: 'verify',
    title: {
      en: 'Verify Product Code — Authenticity Verification | ZIRON',
      fr: 'Vérifier l’Authenticité du Produit — Code Contenant | ZIRON',
      ar: 'التحقق من أصالة المنتج — فحص رمز العبوة | ZIRON',
    },
    description: {
      en: 'Validate the Unique Product Verification Code printed on your packaging to confirm authenticity before beginning your protocol.',
      fr: 'Vérifiez le code d’authenticité unique imprimé sur votre boîte ZIRON pour confirmer la conformité officielle de votre produit.',
      ar: 'تحقق من الرمز التسلسلي الفريد المطبوع على عبوة ZIRON للتأكد من أصالتها قبل بدء البرنامج.',
    },
    ogType: 'website',
  },
  'verify/certificate': {
    route: 'verify/certificate',
    title: {
      en: 'Verify Academic Certificate — Official Registry | ZIRON School',
      fr: 'Vérification de Certificat — Registre Officiel | ZIRON School',
      ar: 'التحقق من الشهادات — السجل الأكاديمي الرسمي | مدرسة ZIRON',
    },
    description: {
      en: 'Official public credential verification for ZIRON Restart School course completion certificates.',
      fr: 'Vérification publique officielle des certificats de réussite délivrés par la ZIRON Restart School.',
      ar: 'التحقق العام الرسمي من صحة شهادات إتمام الدورات الصادرة عن مدرسة ZIRON ريستارت.',
    },
    ogType: 'website',
  },
  'shop': {
    route: 'shop',
    title: {
      en: 'ZIRON Official Shop — Purchase 90-Day Bundle & Monthly Packs',
      fr: 'Boutique Officielle ZIRON — Programme 90 Jours & Contenants 30 Jours',
      ar: 'متجر ZIRON الرسمي — شراء باقة الـ 90 يومًا والعبوات الشهرية',
    },
    description: {
      en: 'Acquire the Complete 90-Day Program Bundle (22,000 DZD) or the 1-Month Pack (8,000 DZD). Authoritative pricing in Algerian Dinars.',
      fr: 'Commandez le Pack Complet 90 Jours (22 000 DZD) ou le Contenant 1 Mois (8 000 DZD). Tarifs officiels en Dinars Algériens.',
      ar: 'اطلب باقة البرنامج الكاملة لـ 90 يومًا (22,000 دج) أو عبوة الشهر الواحد (8,000 دج) بالدينار الجزائري.',
    },
    ogType: 'product',
  },
  'about': {
    route: 'about',
    title: {
      en: 'About VIREXON BIOSCIENCES — Corporate Governance & Mission',
      fr: 'À Propos de VIREXON BIOSCIENCES — Gouvernance & Mission',
      ar: 'عن فيريكسون بيوساينسز — الحوكمة المؤسسية والرسالة',
    },
    description: {
      en: 'VIREXON BIOSCIENCES is dedicated to transparent biomedical protocols, quality standards, and ethical wellness support.',
      fr: 'VIREXON BIOSCIENCES se consacre au développement de protocoles de bien-être rigoureux, éthiques et traçables.',
      ar: 'تلتزم فيريكسون بيوساينسز بتقديم بروتوكولات عافية موثوقة ومبنية على معايير الجودة والشفافية المؤسسية.',
    },
    ogType: 'website',
  },
  'restart': {
    route: 'restart',
    title: {
      en: 'ZIRON Restart Initiative — Education, Enterprise & Social Impact',
      fr: 'Initiative ZIRON Restart — Formation, Entreprise & Impact Social',
      ar: 'مبادرة ZIRON ريستارت — التعليم والمشاريع والأثر المجتمعي',
    },
    description: {
      en: 'Empowering protocol participants with applied vocational education, verified merchant opportunities, and community reinvestment.',
      fr: 'Accompagnement des participants au programme par la formation pratique, l’accès à l’entrepreneuriat et l’investissement social.',
      ar: 'تمكين المشاركين في البرنامج من خلال التدريب العملي وفرص الأعمال وإعادة الاستثمار المجتمعي.',
    },
    ogType: 'website',
  },
  'restart/fund': {
    route: 'restart/fund',
    title: {
      en: 'The Restart Fund — Transparent Reinvestment & Social Grants | ZIRON',
      fr: 'Le Fonds Restart — Réinvestissement Transparent & Soutien Social | ZIRON',
      ar: 'صندوق ريستارت — إعادة الاستثمار والمنح الاجتماعية الشفافة | ZIRON',
    },
    description: {
      en: 'Transparent micro-grant and educational funding mechanism sustained through ZIRON commerce and community contributions.',
      fr: 'Dispositif de micro-financement et de soutien pédagogique transparent alimenté par l’écosystème ZIRON.',
      ar: 'آلية شفافة للتمويل التعليمي والمنح المصغرة مستدامة عبر مساهمات مجتمع ومنتجات ZIRON.',
    },
    ogType: 'website',
  },
  'school': {
    route: 'school',
    title: {
      en: 'ZIRON Restart School — Curricula, Biology & Enterprise Mastery',
      fr: 'ZIRON Restart School — Cursus Pédagogiques & Compétences Pratiques',
      ar: 'مدرسة ZIRON ريستارت — المناهج التعليمية والمهارات العملية',
    },
    description: {
      en: 'Continuous curriculum bridging applied nutrition, metabolic health habits, digital literacy, and sustainable enterprise execution.',
      fr: 'Cursus de formation continue reliant hygiène de vie, connaissances nutritionnelles, outils numériques et esprit d’entreprise.',
      ar: 'مناهج تعليمية وتدريبية تربط بين نمط الحياة الصحي والثقافة الرقمية وإدارة المشاريع.',
    },
    ogType: 'website',
  },
  'community': {
    route: 'community',
    title: {
      en: 'ZIRON Community — Peer Support & Accountability Network',
      fr: 'Communauté ZIRON — Réseau de Soutien & Engagement Mutuel',
      ar: 'مجتمع ZIRON — شبكة الدعم والالتزام المشترك',
    },
    description: {
      en: 'A constructive peer environment designed to encourage adherence to daily wellness habits and shared milestone achievements.',
      fr: 'Un espace d’échange constructif dédié au maintien de la discipline quotidienne et au partage des étapes franchies.',
      ar: 'بيئة تفاعلية لتعزيز الانضباط اليومي ومشاركة مراحل التقدم في البرنامج.',
    },
    ogType: 'website',
  },
  'faq': {
    route: 'faq',
    title: {
      en: 'Frequently Asked Questions — Protocol, Orders & Verification | ZIRON',
      fr: 'Foire Aux Questions — Protocole, Commandes & Vérification | ZIRON',
      ar: 'الأسئلة الشائعة — البرنامج والطلبات والتحقق | ZIRON',
    },
    description: {
      en: 'Answers to common questions regarding the 90-day protocol structure, daily routines, order fulfillment, and container authenticity.',
      fr: 'Réponses aux questions courantes sur le déroulement du protocole, les prises quotidiennes, la livraison et la vérification.',
      ar: 'إجابات على الأسئلة الشائعة حول بروتوكول الـ 90 يومًا والتوصيل والتحقق من أصالة العبوات.',
    },
    ogType: 'website',
  },
};

/**
 * List of private route prefixes that must ALWAYS be set to noindex, nofollow.
 */
export const PRIVATE_ROUTE_PREFIXES = [
  'app',
  'admin',
  'login',
  'register',
  'profile',
];

/**
 * Checks whether a given route string is private/authenticated.
 */
export function isPrivateRoute(route: string): boolean {
  if (!route) return false;
  const clean = route.replace(/^\/+/, '');
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`)
  );
}
