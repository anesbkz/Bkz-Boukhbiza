import { db, functions } from '@/config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  Product,
  ProductVariant,
  CreateProductPayload,
  CreateVariantPayload,
} from '@/types/commerce';
import { ZIRON_CATALOG } from '@/lib/content/catalog';

/**
 * Fallback Canonical Products when Firestore collection is unpopulated
 */
export const CANONICAL_SEED_PRODUCTS: Product[] = ZIRON_CATALOG.map((cat) => ({
  id: cat.id,
  sku: cat.sku,
  name: {
    en: cat.name,
    fr: cat.name,
    ar: cat.name,
  },
  slug: cat.id,
  description: {
    en: cat.description,
    fr: cat.description,
    ar: cat.description,
  },
  shortDescription: {
    en: cat.badgeText || cat.name,
    fr: cat.badgeText || cat.name,
    ar: cat.badgeText || cat.name,
  },
  brand: 'ZIRON / VIREXON BIOSCIENCES',
  status: 'ACTIVE',
  productType: cat.phase === 'BUNDLE' ? 'BUNDLE' : 'PHYSICAL',
  images: [`/assets/products/${cat.id}.png`],
  availableVariants: [`var-${cat.sku.toLowerCase()}`],
  phaseNumber: cat.phase,
  capsuleCount: cat.capsuleCount,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

export const CANONICAL_SEED_VARIANTS: ProductVariant[] = ZIRON_CATALOG.map((cat) => ({
  id: `var-${cat.sku.toLowerCase()}`,
  productId: cat.id,
  sku: cat.sku,
  name: {
    en: `${cat.name} (${cat.capsuleCount} Capsules)`,
    fr: `${cat.name} (${cat.capsuleCount} Gélules)`,
    ar: `${cat.name} (${cat.capsuleCount} كبسولة)`,
  },
  quantity: cat.capsuleCount,
  unit: 'capsules',
  price: cat.priceDzd || 3500,
  currency: 'DZD',
  status: 'ACTIVE',
  inventoryId: `inv-${cat.sku.toLowerCase()}`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

/**
 * Loads all active products from Firestore (falls back to canonical if empty)
 */
export async function getActiveProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'ACTIVE'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
    }
  } catch (err) {
    console.warn('Could not read products from Firestore, using canonical seed:', err);
  }
  return CANONICAL_SEED_PRODUCTS;
}

/**
 * Loads all products for administrative view (including drafts/archived)
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
    }
  } catch (err) {
    console.warn('Could not read admin products from Firestore:', err);
  }
  return CANONICAL_SEED_PRODUCTS;
}

/**
 * Gets product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const ref = doc(db, 'products', productId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
    }
  } catch (err) {
    console.warn(`Error fetching product ${productId}:`, err);
  }
  const fallback = CANONICAL_SEED_PRODUCTS.find((p) => p.id === productId || p.sku === productId);
  return fallback || null;
}

/**
 * Gets all variants for a product
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const q = query(
      collection(db, 'productVariants'),
      where('productId', '==', productId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProductVariant, 'id'>) }));
    }
  } catch (err) {
    console.warn(`Error fetching variants for ${productId}:`, err);
  }
  return CANONICAL_SEED_VARIANTS.filter((v) => v.productId === productId);
}

/**
 * Admin: Create Product via authoritative Cloud Function
 */
export async function createCommerceProduct(payload: CreateProductPayload): Promise<Product> {
  const callFn = httpsCallable<CreateProductPayload, { success: boolean; product: Product }>(
    functions,
    'createCommerceProduct'
  );
  const result = await callFn(payload);
  return result.data.product;
}

/**
 * Admin: Update Product via authoritative Cloud Function
 */
export async function updateCommerceProduct(
  productId: string,
  updates: Partial<Product>
): Promise<Product> {
  const callFn = httpsCallable<
    { productId: string; updates: Partial<Product> },
    { success: boolean; product: Product }
  >(functions, 'updateCommerceProduct');
  const result = await callFn({ productId, updates });
  return result.data.product;
}

/**
 * Admin: Create Variant via authoritative Cloud Function
 */
export async function createCommerceVariant(payload: CreateVariantPayload): Promise<ProductVariant> {
  const callFn = httpsCallable<CreateVariantPayload, { success: boolean; variant: ProductVariant }>(
    functions,
    'createCommerceVariant'
  );
  const result = await callFn(payload);
  return result.data.variant;
}

/**
 * Admin: Update Variant via authoritative Cloud Function
 */
export async function updateCommerceVariant(
  variantId: string,
  updates: Partial<ProductVariant>
): Promise<ProductVariant> {
  const callFn = httpsCallable<
    { variantId: string; updates: Partial<ProductVariant> },
    { success: boolean; variant: ProductVariant }
  >(functions, 'updateCommerceVariant');
  const result = await callFn({ variantId, updates });
  return result.data.variant;
}

/**
 * Admin: Loads all variants across products
 */
export async function getAllVariantsAdmin(): Promise<ProductVariant[]> {
  try {
    const snap = await getDocs(collection(db, 'productVariants'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProductVariant, 'id'>) }));
    }
  } catch (err) {
    console.warn('Could not read admin variants from Firestore:', err);
  }
  return CANONICAL_SEED_VARIANTS;
}

// Convenience Aliases
export const getAllProducts = getAllProductsAdmin;
export const getAllVariants = getAllVariantsAdmin;
export const createProductAdmin = createCommerceProduct;
export const updateProductAdmin = updateCommerceProduct;
export const createVariantAdmin = createCommerceVariant;
export const updateVariantAdmin = updateCommerceVariant;
