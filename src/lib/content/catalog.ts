import { PublicCatalogItem } from './types';
import { Locale } from '@/types';

export type CatalogItem = PublicCatalogItem;
export type { PublicCatalogItem };

/**
 * ZIRON Product Catalog Model
 * Initial target market: Algeria (DZD).
 * 
 * Strict Phase 10.1 specifications:
 * - Phase 01: 30 capsules / 30-day supply (8,000 DZD)
 * - Phase 02: 30 capsules / 30-day supply (8,000 DZD)
 * - Phase 03: 30 capsules / 30-day supply (8,000 DZD)
 * - Complete 90-Day Program Bundle: 3 x 30 capsules = 90 capsules total (22,000 DZD, Free Shipping)
 */
export const ZIRON_CATALOG: PublicCatalogItem[] = [
  {
    id: 'ziron-1-month',
    sku: 'ZR-1M-30C',
    phase: 1,
    name: 'ZIRON 1 Month',
    capsuleCount: 30,
    supplyDays: 30,
    priceDzd: 8000,
    description: 'Authentic 30-capsule monthly container engineered for structured 30-day biological protocol adherence. Available across all 58 Algerian wilayas.',
    badgeText: 'CANONICAL 1-MONTH CONTAINER',
    containerColorHex: '#0B2346',
    colorName: 'CANONICAL NAVY',
  },
  {
    id: 'ziron-phase-01',
    sku: 'ZR-PH01-30C',
    phase: 1,
    name: 'ZIRON Phase 01',
    capsuleCount: 30,
    supplyDays: 30,
    priceDzd: 8000,
    description: 'Phase 01 nutritional formulation container designed for the initial 30-day program phase.',
    badgeText: 'PHASE 01 — PROGRAM PHASE',
    containerColorHex: '#D62828',
    colorName: 'CRIMSON',
  },
  {
    id: 'ziron-phase-02',
    sku: 'ZR-PH02-30C',
    phase: 2,
    name: 'ZIRON Phase 02',
    capsuleCount: 30,
    supplyDays: 30,
    priceDzd: 8000,
    description: 'Phase 02 nutritional formulation container designed for the intermediate 30-day program phase.',
    badgeText: 'PHASE 02 — PROGRAM PHASE',
    containerColorHex: '#F28C28',
    colorName: 'AMBER',
  },
  {
    id: 'ziron-phase-03',
    sku: 'ZR-PH03-30C',
    phase: 3,
    name: 'ZIRON Phase 03',
    capsuleCount: 30,
    supplyDays: 30,
    priceDzd: 8000,
    description: 'Phase 03 nutritional formulation container designed for the final 30-day program phase.',
    badgeText: 'PHASE 03 — PROGRAM PHASE',
    containerColorHex: '#2E9E45',
    colorName: 'EMERALD',
  },
  {
    id: 'ziron-complete-bundle',
    sku: 'ZR-BNDL-90C',
    phase: 'BUNDLE',
    name: 'ZIRON 90-Day Complete Program Bundle',
    capsuleCount: 90, // Exactly 3 x 30 capsules = 90 capsules total
    supplyDays: 90,
    priceDzd: 22000,
    description: 'Complete three-phase protocol kit comprising three 30-capsule containers (Phase 01, Phase 02, and Phase 03) providing 90 capsules total with free shipping included.',
    badgeText: 'COMPLETE 90-DAY PROTOCOL BUNDLE',
    containerColorHex: '#0B2346',
    colorName: 'TRI-PHASE NAVY',
  },
];

/**
 * Formats DZD pricing for Algeria target market or returns localized configuration status.
 */
export function formatDzdPrice(priceDzd: number | null, locale: Locale = 'en'): string {
  if (priceDzd === null || priceDzd === undefined) {
    if (locale === 'ar') return 'السعر قيد التحديد';
    if (locale === 'fr') return 'Prix à configurer';
    return 'Price to be configured';
  }

  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(priceDzd);
  return locale === 'ar' ? `${formatted} د.ج` : `${formatted} DZD`;
}

/**
 * Returns catalog items localized for the active locale.
 */
export function getLocalizedCatalog(locale: Locale = 'en'): PublicCatalogItem[] {
  const findItem = (id: string) => ZIRON_CATALOG.find((it) => it.id === id) || ZIRON_CATALOG[0];

  const canonical1m = findItem('ziron-1-month');
  const ph01 = findItem('ziron-phase-01');
  const ph02 = findItem('ziron-phase-02');
  const ph03 = findItem('ziron-phase-03');
  const bundle = findItem('ziron-complete-bundle');

  if (locale === 'ar') {
    return [
      {
        ...canonical1m,
        name: 'ZIRON شهر واحد',
        description: 'عبوة التركيبة التغذوية للشهر الواحد (30 كبسولة) للالتزام المنضبط ببرنامج الـ 30 يومًا، تشمل كود التحقق المشفر.',
        badgeText: 'عبوة شهر واحد (30 كبسولة)',
        colorName: 'كحلي كلاسيكي',
      },
      {
        ...ph01,
        name: 'ZIRON المرحلة 01',
        description: 'عبوة التركيبة التغذوية للمرحلة 01 صُممت لروتين أول 30 يومًا من البرنامج لتأسيس الانضباط الصباحي.',
        badgeText: 'المرحلة 01 — مرحلة البرنامج',
        colorName: 'قرمزي',
      },
      {
        ...ph02,
        name: 'ZIRON المرحلة 02',
        description: 'عبوة التركيبة التغذوية للمرحلة 02 صُممت للأيام من 31 إلى 60 لتعزيز الاستمرارية وترسيخ العادات.',
        badgeText: 'المرحلة 02 — مرحلة البرنامج',
        colorName: 'كهرماني',
      },
      {
        ...ph03,
        name: 'ZIRON المرحلة 03',
        description: 'عبوة التركيبة التغذوية للمرحلة 03 صُممت للأيام من 61 إلى 90 لتثبيت استقلالية العادات الصحية على المدى الطويل.',
        badgeText: 'المرحلة 03 — مرحلة البرنامج',
        colorName: 'زمردي',
      },
      {
        ...bundle,
        name: 'حزمة برنامج ZIRON الكاملة لـ 90 يومًا',
        description: 'طقم بروتوكول متكامل يضم العبوات الثلاث (المرحلة 01، المرحلة 02، والمرحلة 03) بإجمالي 90 كبسولة لرحلة الـ 90 يومًا كاملة مع شحن مجاني متضمن.',
        badgeText: 'حزمة بروتوكول الـ 90 يومًا الكاملة',
        colorName: 'أزرق ملكي ثلاثي المراحل',
      },
    ];
  }

  if (locale === 'fr') {
    return [
      {
        ...canonical1m,
        name: 'ZIRON 1 Mois',
        description: 'Flacon mensuel authentique de 30 gélules conçu pour un protocole structuré de 30 jours, avec code de vérification cryptographique.',
        badgeText: 'FLACON 1 MOIS (30 GÉLULES)',
        colorName: 'BLEU MARINE CANONIQUE',
      },
      {
        ...ph01,
        name: 'ZIRON Phase 01',
        description: 'Flacon de formulation nutritionnelle Phase 01 conçu pour la période initiale de 30 jours du programme.',
        badgeText: 'PHASE 01 — PROGRAMME',
        colorName: 'POURPRE',
      },
      {
        ...ph02,
        name: 'ZIRON Phase 02',
        description: 'Flacon de formulation nutritionnelle Phase 02 conçu pour la période intermédiaire de 30 jours (jours 31 à 60).',
        badgeText: 'PHASE 02 — PROGRAMME',
        colorName: 'AMBRE',
      },
      {
        ...ph03,
        name: 'ZIRON Phase 03',
        description: 'Flacon de formulation nutritionnelle Phase 03 conçu pour la phase finale de 30 jours (jours 61 à 90).',
        badgeText: 'PHASE 03 — PROGRAMME',
        colorName: 'ÉMERAUDE',
      },
      {
        ...bundle,
        name: 'Pack Complet 90 Jours ZIRON',
        description: 'Kit complet articulé en 3 phases comprenant les 3 flacons de 30 gélules (Phase 01, Phase 02 et Phase 03) totalisant 90 gélules avec livraison gratuite incluse.',
        badgeText: 'PACK COMPLET PROTOCOLE 90 JOURS',
        colorName: 'BLEU MARINE TRI-PHASE',
      },
    ];
  }

  return ZIRON_CATALOG;
}
