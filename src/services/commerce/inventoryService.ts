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

/**
 * Computes status based on quantity and threshold
 */
export function computeInventoryStatus(
  availableQuantity: number,
  lowStockThreshold: number = 10
): InventoryStatus {
  if (typeof availableQuantity !== 'number' || isNaN(availableQuantity) || availableQuantity <= 0) return 'OUT_OF_STOCK';
  if (availableQuantity <= lowStockThreshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

/**
 * Gets inventory record for a variant.
 * Strictly fail-closed: returns null if no authoritative inventory record exists in Firestore.
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
  return null;
}

/**
 * Admin: Loads all inventory records.
 * Strictly returns documents found in Firestore without fallback fake stock.
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
  return [];
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
