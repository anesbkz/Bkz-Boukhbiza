import { db, functionsInstance } from '@/config/firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { UserProfile } from '@/types/models';
import {
  EntitlementRecord,
  EntitlementType,
  ActivationRecord,
} from '@/types/entitlements';

const ENTITLEMENTS_COLLECTION = 'entitlements';
const ACTIVATIONS_COLLECTION = 'activations';

/**
 * Lists all verified entitlements for a given user.
 * Queries the authoritative `entitlements` collection.
 */
export async function getUserEntitlements(userId: string): Promise<EntitlementRecord[]> {
  try {
    const q = query(
      collection(db, ENTITLEMENTS_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EntitlementRecord, 'id'>),
    }));
  } catch (error) {
    console.warn(`Could not load entitlements for user ${userId}:`, error);
    return [];
  }
}

/**
 * Lists all verified product container activations for a given user.
 * Queries the authoritative `activations` collection.
 */
export async function getUserActivations(userId: string): Promise<ActivationRecord[]> {
  try {
    const q = query(
      collection(db, ACTIVATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ActivationRecord, 'id'>),
    }));
  } catch (error) {
    console.warn(`Could not load activations for user ${userId}:`, error);
    return [];
  }
}

/**
 * Checks whether user has an active entitlement for a specific domain.
 * Evaluates the authoritative `entitlements` collection.
 */
export async function hasActiveEntitlement(
  userId: string,
  type: EntitlementType
): Promise<boolean> {
  try {
    const q = query(
      collection(db, ENTITLEMENTS_COLLECTION),
      where('userId', '==', userId),
      where('entitlementType', '==', type),
      where('status', '==', 'ACTIVE')
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.warn('Error checking active entitlement:', error);
    return false;
  }
}

/**
 * Activates a serialized product container code for an authenticated subject.
 * AUTHORITATIVE ARCHITECTURE:
 * Calls the server-side Cloud Function `activateContainerCode`.
 * All mutations (code validation, concurrency-safe locking, activation record creation,
 * entitlement issuance, user cache flag update, and authoritative audit logging)
 * execute atomically inside a server-side Firestore transaction.
 *
 * Direct client mutations to productCodes, activations, entitlements, or auditLogs
 * are strictly forbidden.
 */
export async function activateProductCode(
  rawCode: string,
  actor: UserProfile
): Promise<{ activation: ActivationRecord; entitlements: EntitlementRecord[] }> {
  if (!actor || !actor.uid) {
    throw new Error('Authentication required to activate product code.');
  }

  const cleanCode = rawCode.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Please enter a valid product verification code.');
  }

  // Invoke authoritative Cloud Function
  const activateCallable = httpsCallable<
    { code: string },
    { success: boolean; activationId: string; entitlements: EntitlementType[] }
  >(functionsInstance, 'activateContainerCode');

  try {
    const response = await activateCallable({ code: cleanCode });
    const { activationId, entitlements } = response.data;

    // Fetch freshly issued authoritative entitlement records for client state
    const issuedEntitlements = await getUserEntitlements(actor.uid);

    const activationRecord: ActivationRecord = {
      id: activationId,
      code: cleanCode,
      userId: actor.uid,
      productSku: 'VERIFIED_CONTAINER',
      activatedAt: new Date().toISOString(),
      entitlementsGranted: entitlements,
    };

    return {
      activation: activationRecord,
      entitlements: issuedEntitlements,
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error('Product activation failed due to a server authorization error.');
  }
}

/**
 * Administrative manual grant of entitlement (e.g. for clinical trials or VIP subjects).
 * Delegates to the authoritative Cloud Function `grantEntitlement`.
 */
export async function adminGrantEntitlement(
  userId: string,
  entType: EntitlementType,
  actor: UserProfile
): Promise<EntitlementRecord> {
  if (!actor || !actor.uid) {
    throw new Error('Authentication required.');
  }

  const grantCallable = httpsCallable<
    { targetUserId: string; entitlementType: EntitlementType },
    { success: boolean; entitlementId: string }
  >(functionsInstance, 'grantEntitlement');

  try {
    const response = await grantCallable({
      targetUserId: userId,
      entitlementType: entType,
    });

    return {
      id: response.data.entitlementId,
      userId,
      entitlementType: entType,
      sourceProductSku: 'MANUAL_OVERRIDE',
      sourceCode: 'STAFF_GRANT',
      activationId: 'STAFF_ACTION',
      status: 'ACTIVE',
      grantedAt: new Date().toISOString(),
      expiresAt: null,
      grantedBy: `STAFF_${actor.uid}`,
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to grant entitlement.');
  }
}
