/**
 * Product Code & Manufacturing Batch Client Service
 * Authoritative interface calling backend Cloud Functions and querying Firestore collections.
 *
 * CRITICAL SECURITY ENFORCEMENT:
 * Direct client creation or mutation of productCodes, activations, entitlements,
 * auditLogs, or batch statistics is strictly forbidden and prohibited.
 * All mutations are handled exclusively through server-authoritative Cloud Functions.
 */
import { db, functionsInstance } from '@/config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as firestoreLimit,
  orderBy,
  query,
  startAfter,
  where,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  ProductBatch,
  ProductCode,
  ProductCodeStatus,
  BatchStatus,
  GenerationRequest,
  GenerationResult,
  BatchCreationRequest,
  BatchCreationResult,
  BatchStatusUpdateRequest,
  BatchStatusUpdateResult,
} from '@/types/models';
import { normalizeProductCode } from '@/lib/codes/productCodeGenerator';

export interface GetProductCodesFilters {
  productSku?: string;
  batchId?: string;
  status?: ProductCodeStatus;
  search?: string;
  limit?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface GetProductCodesResult {
  codes: ProductCode[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  totalReturned: number;
}

export interface GetBatchesFilters {
  productSku?: string;
  status?: BatchStatus;
  batchNumber?: string;
  limit?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface GetBatchesResult {
  batches: ProductBatch[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  totalReturned: number;
}

/* ==========================================================================
   MUTATIONS (SERVER-AUTHORITATIVE VIA CLOUD FUNCTIONS ONLY)
   ========================================================================== */

/**
 * Invokes the authoritative `generateProductCodes` callable Cloud Function.
 * Strictly verifies caller role on the server before generating codes.
 */
export async function generateProductCodes(
  params: GenerationRequest
): Promise<GenerationResult> {
  const callable = httpsCallable<GenerationRequest, GenerationResult>(
    functionsInstance,
    'generateProductCodes'
  );
  const result = await callable(params);
  return result.data;
}

/**
 * Invokes the authoritative `createProductBatch` callable Cloud Function.
 */
export async function createProductBatch(
  params: BatchCreationRequest
): Promise<BatchCreationResult> {
  const callable = httpsCallable<BatchCreationRequest, BatchCreationResult>(
    functionsInstance,
    'createProductBatch'
  );
  const result = await callable(params);
  return result.data;
}

/**
 * Invokes the authoritative `updateBatchStatus` callable Cloud Function.
 */
export async function updateBatchStatus(
  params: BatchStatusUpdateRequest
): Promise<BatchStatusUpdateResult> {
  const callable = httpsCallable<BatchStatusUpdateRequest, BatchStatusUpdateResult>(
    functionsInstance,
    'updateBatchStatus'
  );
  const result = await callable(params);
  return result.data;
}

// Backwards-compatible aliases for Phase 1 references
export const generateProductCodesCallable = generateProductCodes;
export const createProductBatchCallable = createProductBatch;
export const updateBatchStatusCallable = updateBatchStatus;

/* ==========================================================================
   QUERY LAYER (READ-ONLY FIRESTORE QUERIES RESPECTING SECURITY RULES)
   ========================================================================== */

/**
 * Retrieves a list of manufacturing batches ordered by creation date desc.
 * Supports filtering by product SKU, status, and batch number.
 */
export async function getBatches(
  filters?: GetBatchesFilters
): Promise<GetBatchesResult> {
  try {
    const pageSize = Math.min(filters?.limit || 50, 200);
    const constraints: QueryConstraint[] = [];

    if (filters?.productSku) {
      constraints.push(where('productSku', '==', filters.productSku));
    }
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.batchNumber && filters.batchNumber.trim()) {
      constraints.push(
        where('batchNumber', '==', filters.batchNumber.trim().toUpperCase())
      );
    }

    // Try standard query ordered by createdAt desc
    let snapshot;
    try {
      const q = query(
        collection(db, 'batches'),
        ...constraints,
        orderBy('createdAt', 'desc'),
        ...(filters?.cursor ? [startAfter(filters.cursor)] : []),
        firestoreLimit(pageSize + 1)
      );
      snapshot = await getDocs(q);
    } catch {
      // Fallback in case composite index is missing or building: query without orderBy and sort in memory
      const fallbackQ = query(
        collection(db, 'batches'),
        ...constraints,
        firestoreLimit(pageSize + 1)
      );
      snapshot = await getDocs(fallbackQ);
    }

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const nextCursor = hasMore ? resultDocs[resultDocs.length - 1] : null;

    const batches: ProductBatch[] = resultDocs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ProductBatch, 'id'>),
    }));

    // In case fallback was triggered, ensure descending order by createdAt
    batches.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return {
      batches,
      nextCursor,
      hasMore,
      totalReturned: batches.length,
    };
  } catch (error) {
    console.error('Failed to query batches from Firestore:', error);
    return {
      batches: [],
      nextCursor: null,
      hasMore: false,
      totalReturned: 0,
    };
  }
}

/**
 * Retrieves a single manufacturing batch by ID or batchNumber.
 */
export async function getBatch(batchId: string): Promise<ProductBatch | null> {
  if (!batchId || typeof batchId !== 'string' || !batchId.trim()) {
    return null;
  }

  const cleanId = batchId.trim();

  try {
    // 1. Direct document lookup by ID
    const batchDocRef = doc(db, 'batches', cleanId);
    const snap = await getDoc(batchDocRef);
    if (snap.exists()) {
      return {
        id: snap.id,
        ...(snap.data() as Omit<ProductBatch, 'id'>),
      };
    }

    // 2. Lookup by batchNumber field
    const q = query(
      collection(db, 'batches'),
      where('batchNumber', '==', cleanId.toUpperCase()),
      firestoreLimit(1)
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const docSnap = querySnap.docs[0];
      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<ProductBatch, 'id'>),
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to load batch "${cleanId}":`, error);
    return null;
  }
}

/**
 * Retrieves product codes with safe pagination and filtering.
 *
 * SEARCH IMPLEMENTATION STRATEGY & LIMITATIONS:
 * Firestore does not natively support arbitrary substring full-text search.
 * 1. If `search` matches or starts with a serial code, we attempt exact or normalized code lookup.
 * 2. If filtering by batchId (standard admin workflow), Firestore filters by batch and pagination,
 *    and any free-text search term is evaluated in-memory over the returned window.
 * This guarantees security, avoids downloading entire collections, and prevents missing-index crashes.
 */
export async function getProductCodes(
  filters?: GetProductCodesFilters
): Promise<GetProductCodesResult> {
  try {
    const pageSize = Math.min(filters?.limit || 50, 200);
    const searchRaw = filters?.search?.trim() || '';

    // If a standalone search term looks like a specific code, perform direct targeted query
    if (searchRaw && !filters?.batchId && !filters?.status && !filters?.productSku) {
      const exactCode = await getProductCode(searchRaw);
      if (exactCode) {
        return {
          codes: [exactCode],
          nextCursor: null,
          hasMore: false,
          totalReturned: 1,
        };
      }
    }

    const constraints: QueryConstraint[] = [];

    if (filters?.batchId) {
      constraints.push(where('batchId', '==', filters.batchId));
    }
    if (filters?.productSku) {
      constraints.push(where('productSku', '==', filters.productSku));
    }
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.cursor) {
      constraints.push(startAfter(filters.cursor));
    }

    constraints.push(firestoreLimit(pageSize + 1));

    const q = query(collection(db, 'productCodes'), ...constraints);
    const snapshot = await getDocs(q);

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const nextCursor = hasMore ? resultDocs[resultDocs.length - 1] : null;

    let codes: ProductCode[] = resultDocs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ProductCode, 'id'>),
    }));

    // In-memory filter for search substring if requested
    if (searchRaw) {
      const term = searchRaw.toUpperCase();
      const normTerm = normalizeProductCode(searchRaw);
      codes = codes.filter(
        (c) =>
          c.code.toUpperCase().includes(term) ||
          (c.normalizedCode && c.normalizedCode.includes(normTerm)) ||
          (c.batchNumber && c.batchNumber.toUpperCase().includes(term))
      );
    }

    return {
      codes,
      nextCursor,
      hasMore,
      totalReturned: codes.length,
    };
  } catch (error) {
    console.error('Failed to query product codes from Firestore:', error);
    return {
      codes: [],
      nextCursor: null,
      hasMore: false,
      totalReturned: 0,
    };
  }
}

/**
 * Retrieves a single product code by docId, code, or normalizedCode.
 */
export async function getProductCode(code: string): Promise<ProductCode | null> {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return null;
  }

  const raw = code.trim().toUpperCase();

  try {
    // 1. Direct document ID lookup
    const codeRef = doc(db, 'productCodes', raw);
    const snap = await getDoc(codeRef);
    if (snap.exists()) {
      return {
        id: snap.id,
        ...(snap.data() as Omit<ProductCode, 'id'>),
      };
    }

    // 2. Query by code field
    const codeQ = query(
      collection(db, 'productCodes'),
      where('code', '==', raw),
      firestoreLimit(1)
    );
    const codeSnap = await getDocs(codeQ);
    if (!codeSnap.empty) {
      const docSnap = codeSnap.docs[0];
      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<ProductCode, 'id'>),
      };
    }

    // 3. Query by normalizedCode field
    const norm = normalizeProductCode(raw);
    const normQ = query(
      collection(db, 'productCodes'),
      where('normalizedCode', '==', norm),
      firestoreLimit(1)
    );
    const normSnap = await getDocs(normQ);
    if (!normSnap.empty) {
      const docSnap = normSnap.docs[0];
      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<ProductCode, 'id'>),
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to load product code "${raw}":`, error);
    return null;
  }
}

/* ==========================================================================
   PUBLIC VERIFICATION (SERVER-AUTHORITATIVE VIA CLOUD FUNCTIONS ONLY)
   ========================================================================== */

export interface VerificationResult {
  isValid: boolean;
  isAuthentic: boolean;
  isActivated?: boolean;
  status?: string;
  phase?: number | null;
  batchNumber?: string | null;
  batchStatus?: string | null;
  productSku?: string;
  verificationId?: string;
  verifiedAt?: string;
  message?: string;
}

/**
 * Invokes the authoritative `verifyContainerCode` callable Cloud Function.
 * Verifies authenticity, activation state, and batch validity without leaking sensitive data.
 */
export async function verifyContainerCode(rawCode: string): Promise<VerificationResult> {
  const cleanCode = (rawCode || '').trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Please enter a product verification code.');
  }

  const callable = httpsCallable<{ code: string }, VerificationResult>(
    functionsInstance,
    'verifyContainerCode'
  );
  const result = await callable({ code: cleanCode });
  return result.data;
}

