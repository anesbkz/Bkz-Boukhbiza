import { db, functions } from '@/config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  InventoryRecord,
  InventoryStatus,
  AdjustInventoryRequest,
} from '@/types/commerce';
import { CANONICAL_SEED_VARIANTS } from './productService';

/**
 * Fallback Canonical Inventory
 */
export const CANONICAL_SEED_INVENTORY: Record<string, InventoryRecord> = {};
CANONICAL_SEED_VARIANTS.forEach((v) => {
  CANONICAL_SEED_INVENTORY[v.id] = {
    id: `inv-${v.sku.toLowerCase()}`,
    variantId: v.id,
    productId: v.productId,
    sku: v.sku,
    availableQuantity: 100,
    reservedQuantity: 0,
    soldQuantity: 0,
    lowStockThreshold: 10,
    status: 'IN_STOCK',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
});

/**
 * Computes status based on quantity and threshold
 */
export function computeInventoryStatus(
  availableQuantity: number,
  lowStockThreshold: number = 10
): InventoryStatus {
  if (availableQuantity <= 0) return 'OUT_OF_STOCK';
  if (availableQuantity <= lowStockThreshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

/**
 * Gets inventory record for a variant
 */
export async function getInventoryByVariantId(variantId: string): Promise<InventoryRecord | null> {
  try {
    const invId = `inv-${variantId.replace('var-', '')}`;
    const ref = doc(db, 'inventory', invId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<InventoryRecord, 'id'>) };
    }
  } catch (err) {
    console.warn(`Could not fetch inventory for ${variantId}:`, err);
  }
  return CANONICAL_SEED_INVENTORY[variantId] || null;
}

/**
 * Admin: Loads all inventory records
 */
export async function getAllInventoryAdmin(): Promise<InventoryRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'inventory'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<InventoryRecord, 'id'>) }));
    }
  } catch (err) {
    console.warn('Could not read admin inventory:', err);
  }
  return Object.values(CANONICAL_SEED_INVENTORY);
}

/**
 * Admin: Adjusts inventory via authoritative Cloud Function
 */
export async function adjustCommerceInventory(
  payload: AdjustInventoryRequest
): Promise<InventoryRecord> {
  const callFn = httpsCallable<
    AdjustInventoryRequest,
    { success: boolean; inventory: InventoryRecord }
  >(functions, 'updateCommerceInventory');
  const result = await callFn(payload);
  return result.data.inventory;
}

// Convenience Aliases
export const getAllInventory = getAllInventoryAdmin;
export const updateInventoryAdmin = adjustCommerceInventory;
