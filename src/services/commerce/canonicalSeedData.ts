import { Product, ProductVariant, InventoryRecord } from '@/types/commerce';

/**
 * Authoritative Canonical Production Commerce Baseline
 * 
 * Defines the minimum required canonical commerce data for production operations:
 * - Public Purchasable Products:
 *   1. ZIRON 1 Month / 30 Capsules — 8,000 DZD (SKU: ZR-1M-30C)
 *   2. ZIRON 90-Day Program / 3 Months — 22,000 DZD (SKU: ZR-BNDL-90C)
 * - Canonical Variants:
 *   - var-zr-1m-30c
 *   - var-zr-bndl-90c
 *   - var-zr-3m-90c (alias)
 * - Authoritative Server Inventory:
 *   - inv-zr-1m-30c
 *   - inv-zr-bndl-90c
 * - Restricted Internal Phase SKUs:
 *   - ZR-PH01-30C, ZR-PH02-30C, ZR-PH03-30C (strictly non-purchasable on public storefront)
 */

export const DEFAULT_CANONICAL_STOCK_QUANTITY = 100;
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export const RESTRICTED_PHASE_SKUS = [
  'ZR-PH01-30C',
  'ZR-PH02-30C',
  'ZR-PH03-30C',
] as const;

export function isRestrictedPhaseSku(sku: string): boolean {
  if (!sku) return false;
  return RESTRICTED_PHASE_SKUS.includes(sku.toUpperCase().trim() as any);
}

export const CANONICAL_PRODUCTION_PRODUCTS: Product[] = [
  {
    id: 'ziron-1-month',
    sku: 'ZR-1M-30C',
    name: {
      en: 'ZIRON 1 Month',
      fr: 'ZIRON 1 Mois',
      ar: 'ZIRON شهر واحد',
    },
    slug: 'ziron-1-month',
    description: {
      en: 'Authentic 30-capsule monthly container engineered for structured 30-day biological protocol adherence. Available across all 58 Algerian wilayas with tamper-evident seal and serialized verification code.',
      fr: 'Flacon mensuel authentique de 30 gélules conçu pour un protocole structuré de 30 jours, avec scellé d’inviolabilité et code de vérification sérialisé.',
      ar: 'عبوة التركيبة التغذوية للشهر الواحد (30 كبسولة) للالتزام المنضبط ببرنامج الـ 30 يومًا، تشمل ختم أمان وكود تحقق مشفر.',
    },
    shortDescription: {
      en: 'CANONICAL 1-MONTH CONTAINER (30 CAPSULES)',
      fr: 'FLACON CANONIQUE 1 MOIS (30 GÉLULES)',
      ar: 'العبوة الشهرية القانونية (30 كبسولة)',
    },
    brand: 'ZIRON / VIREXON BIOSCIENCES',
    category: 'CELLULAR_RECOVERY',
    status: 'ACTIVE',
    productType: 'PHYSICAL',
    images: ['/assets/products/ziron-1-month.png'],
    availableVariants: ['var-zr-1m-30c'],
    phaseNumber: 1,
    capsuleCount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ziron-complete-bundle',
    sku: 'ZR-BNDL-90C',
    name: {
      en: 'ZIRON 90-Day Complete Program Bundle',
      fr: 'Pack Complet 90 Jours ZIRON',
      ar: 'حزمة برنامج ZIRON الكاملة لـ 90 يومًا',
    },
    slug: 'ziron-complete-bundle',
    description: {
      en: 'Complete 3-phase course (Phase 01, Phase 02, and Phase 03) totalizing 90 capsules for complete mitochondrial, neurochemical, and hormonal recalibration. Includes free priority shipping across Algeria.',
      fr: 'Protocole complet en 3 phases (Phase 01, Phase 02 et Phase 03) totalisant 90 gélules pour une recalibration cellulaire complète. Livraison gratuite incluse.',
      ar: 'بروتوكول متكامل من 3 مراحل (المرحلة 01، المرحلة 02، والمرحلة 03) بإجمالي 90 كبسولة لرحلة الـ 90 يومًا مع شحن مجاني متضمن لكافة ولايات الجزائر.',
    },
    shortDescription: {
      en: 'COMPLETE 90-DAY PROTOCOL BUNDLE (90 CAPSULES)',
      fr: 'PACK PROTOCOLE COMPLET 90 JOURS (90 GÉLULES)',
      ar: 'حزمة البروتوكول المتكامل لـ 90 يومًا (90 كبسولة)',
    },
    brand: 'ZIRON / VIREXON BIOSCIENCES',
    category: 'CELLULAR_RECOVERY',
    status: 'ACTIVE',
    productType: 'BUNDLE',
    images: ['/assets/products/ziron-complete-bundle.png'],
    availableVariants: ['var-zr-bndl-90c'],
    phaseNumber: 'BUNDLE',
    capsuleCount: 90,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ziron-3m-program',
    sku: 'ZR-BNDL-90C',
    name: {
      en: 'ZIRON 90-Day Complete Program Bundle',
      fr: 'Pack Complet 90 Jours ZIRON',
      ar: 'حزمة برنامج ZIRON الكاملة لـ 90 يومًا',
    },
    slug: 'ziron-3m-program',
    description: {
      en: 'Complete 3-phase course (Phase 01, Phase 02, and Phase 03) totalizing 90 capsules for complete mitochondrial, neurochemical, and hormonal recalibration.',
      fr: 'Protocole complet en 3 phases (Phase 01, Phase 02 et Phase 03) totalisant 90 gélules.',
      ar: 'بروتوكول متكامل من 3 مراحل بإجمالي 90 كبسولة.',
    },
    shortDescription: {
      en: 'COMPLETE 90-DAY PROTOCOL BUNDLE',
      fr: 'PACK PROTOCOLE COMPLET 90 JOURS',
      ar: 'حزمة البروتوكول المتكامل لـ 90 يومًا',
    },
    brand: 'ZIRON / VIREXON BIOSCIENCES',
    category: 'CELLULAR_RECOVERY',
    status: 'ACTIVE',
    productType: 'BUNDLE',
    images: ['/assets/products/ziron-complete-bundle.png'],
    availableVariants: ['var-zr-bndl-90c'],
    phaseNumber: 'BUNDLE',
    capsuleCount: 90,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const CANONICAL_PRODUCTION_VARIANTS: ProductVariant[] = [
  {
    id: 'var-zr-1m-30c',
    productId: 'ziron-1-month',
    sku: 'ZR-1M-30C',
    name: {
      en: 'ZIRON 1 Month (30 Capsules)',
      fr: 'ZIRON 1 Mois (30 Gélules)',
      ar: 'ZIRON شهر واحد (30 كبسولة)',
    },
    quantity: 30,
    unit: 'capsules',
    price: 8000,
    currency: 'DZD',
    status: 'ACTIVE',
    inventoryId: 'inv-zr-1m-30c',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'var-zr-bndl-90c',
    productId: 'ziron-complete-bundle',
    sku: 'ZR-BNDL-90C',
    name: {
      en: 'ZIRON 90-Day Complete Program Bundle (90 Capsules)',
      fr: 'Pack Complet 90 Jours ZIRON (90 Gélules)',
      ar: 'حزمة برنامج ZIRON الكاملة لـ 90 يومًا (90 كبسولة)',
    },
    quantity: 90,
    unit: 'capsules',
    price: 22000,
    currency: 'DZD',
    status: 'ACTIVE',
    inventoryId: 'inv-zr-bndl-90c',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'var-zr-3m-90c',
    productId: 'ziron-complete-bundle',
    sku: 'ZR-3M-90C',
    name: {
      en: 'ZIRON 90-Day Program (90 Capsules)',
      fr: 'ZIRON Programme 90 Jours (90 Gélules)',
      ar: 'برنامج ZIRON لـ 90 يومًا (90 كبسولة)',
    },
    quantity: 90,
    unit: 'capsules',
    price: 22000,
    currency: 'DZD',
    status: 'ACTIVE',
    inventoryId: 'inv-zr-bndl-90c',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export interface CanonicalInventoryDefinition {
  id: string;
  variantId: string;
  productId: string;
  sku: string;
}

export const CANONICAL_PRODUCTION_INVENTORY: CanonicalInventoryDefinition[] = [
  {
    id: 'inv-zr-1m-30c',
    variantId: 'var-zr-1m-30c',
    productId: 'ziron-1-month',
    sku: 'ZR-1M-30C',
  },
  {
    id: 'inv-zr-bndl-90c',
    variantId: 'var-zr-bndl-90c',
    productId: 'ziron-complete-bundle',
    sku: 'ZR-BNDL-90C',
  },
];

/**
 * Pure Idempotent Inventory Calculation
 * 
 * Guarantees that if an inventory record already has active quantities
 * (e.g., from ongoing production operations or customer purchases),
 * THOSE QUANTITIES ARE PRESERVED 100% and never blindly overwritten.
 */
export function computeIdempotentInventorySeed(
  definition: CanonicalInventoryDefinition,
  existingRecord?: Partial<InventoryRecord> | null,
  options?: {
    initialStock?: number;
    lowStockThreshold?: number;
    timestamp?: string;
  }
): {
  record: InventoryRecord;
  preservedExistingStock: boolean;
} {
  const now = options?.timestamp || new Date().toISOString();
  const initialStock =
    typeof options?.initialStock === 'number' && options.initialStock >= 0
      ? Math.floor(options.initialStock)
      : DEFAULT_CANONICAL_STOCK_QUANTITY;
  const threshold =
    typeof options?.lowStockThreshold === 'number' && options.lowStockThreshold >= 0
      ? Math.floor(options.lowStockThreshold)
      : DEFAULT_LOW_STOCK_THRESHOLD;

  // Check if live operational stock exists
  if (existingRecord && typeof existingRecord.availableQuantity === 'number') {
    const available = existingRecord.availableQuantity;
    const reserved = existingRecord.reservedQuantity ?? 0;
    const sold = existingRecord.soldQuantity ?? 0;
    const total = existingRecord.totalQuantity ?? (available + reserved + sold);
    const existingThreshold = existingRecord.lowStockThreshold ?? threshold;
    const status =
      existingRecord.status ??
      (available <= 0
        ? 'OUT_OF_STOCK'
        : available <= existingThreshold
        ? 'LOW_STOCK'
        : 'IN_STOCK');

    return {
      record: {
        id: definition.id,
        variantId: definition.variantId,
        productId: definition.productId,
        sku: definition.sku,
        totalQuantity: total,
        availableQuantity: available,
        reservedQuantity: reserved,
        soldQuantity: sold,
        lowStockThreshold: existingThreshold,
        status,
        createdAt: existingRecord.createdAt || now,
        updatedAt: now,
      },
      preservedExistingStock: true,
    };
  }

  // Brand new inventory initialization
  return {
    record: {
      id: definition.id,
      variantId: definition.variantId,
      productId: definition.productId,
      sku: definition.sku,
      totalQuantity: initialStock,
      availableQuantity: initialStock,
      reservedQuantity: 0,
      soldQuantity: 0,
      lowStockThreshold: threshold,
      status: initialStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      createdAt: now,
      updatedAt: now,
    },
    preservedExistingStock: false,
  };
}
