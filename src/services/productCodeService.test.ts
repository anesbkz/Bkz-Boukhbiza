import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateProductCodes,
  createProductBatch,
  updateBatchStatus,
  getBatches,
  getProductCodes,
  getProductCode,
  getBatch,
} from './productCodeService';

// Mock Firebase functions and firestore modules
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn((_functions, functionName) => {
    return async (data: any) => {
      if (functionName === 'generateProductCodes') {
        return {
          data: {
            success: true,
            batchId: data.batchId,
            batchNumber: 'LOT-ZR26-001',
            productSku: data.productSku,
            quantity: data.quantity,
            codes: Array.from({ length: data.quantity }, (_, i) => `ZR-PH01-TEST-${i}`),
          },
        };
      }
      if (functionName === 'createProductBatch') {
        return {
          data: {
            success: true,
            batchId: 'mock-batch-id-123',
            batchNumber: data.batchNumber,
            productSku: data.productSku,
            status: 'ACTIVE',
          },
        };
      }
      if (functionName === 'updateBatchStatus') {
        return {
          data: {
            success: true,
            batchId: data.batchId,
            previousStatus: 'ACTIVE',
            newStatus: data.status,
            message: 'Batch status updated successfully',
          },
        };
      }
      throw new Error(`Unknown function ${functionName}`);
    };
  }),
}));

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn((_db, name) => ({ path: name })),
    doc: vi.fn((_db, coll, id) => ({ path: `${coll}/${id}`, id })),
    query: vi.fn((coll, ...constraints) => ({ coll, constraints })),
    where: vi.fn((field, op, val) => ({ type: 'where', field, op, val })),
    orderBy: vi.fn((field, dir) => ({ type: 'orderBy', field, dir })),
    startAfter: vi.fn((cursor) => ({ type: 'startAfter', cursor })),
    limit: vi.fn((val) => ({ type: 'limit', val })),
    getDoc: vi.fn(async (docRef) => {
      if (docRef.id === 'BATCH-EXISTING' || docRef.path?.includes('BATCH-EXISTING')) {
        return {
          exists: () => true,
          id: 'BATCH-EXISTING',
          data: () => ({
            batchNumber: 'LOT-2026-A',
            productSku: 'ZR-PH01-30C',
            status: 'ACTIVE',
            manufactureDate: '2026-09-01',
            expiryDate: '2028-09-01',
            totalCodes: 100,
          }),
        };
      }
      if (docRef.id === 'ZR-PH01-7K9A-3F2W-M8PX') {
        return {
          exists: () => true,
          id: 'ZR-PH01-7K9A-3F2W-M8PX',
          data: () => ({
            code: 'ZR-PH01-7K9A-3F2W-M8PX',
            normalizedCode: 'ZRPH017K9A3F2WM8PX',
            batchId: 'BATCH-EXISTING',
            productSku: 'ZR-PH01-30C',
            status: 'UNUSED',
            isActivated: false,
          }),
        };
      }
      return { exists: () => false };
    }),
    getDocs: vi.fn(async (queryObj) => {
      const collPath = queryObj?.coll?.path || queryObj?.path;
      if (collPath === 'batches') {
        const hasNonExistent = queryObj?.constraints?.some(
          (c: any) => c.field === 'batchNumber' && c.val === 'NON_EXISTENT_BATCH'
        );
        if (hasNonExistent) {
          return { empty: true, docs: [] };
        }
        return {
          empty: false,
          docs: [
            {
              id: 'BATCH-1',
              data: () => ({
                batchNumber: 'LOT-ZR26-01',
                productSku: 'ZR-PH01-30C',
                status: 'ACTIVE',
                createdAt: '2026-09-02T00:00:00Z',
              }),
            },
            {
              id: 'BATCH-2',
              data: () => ({
                batchNumber: 'LOT-ZR26-02',
                productSku: 'ZR-PH02-30C',
                status: 'ACTIVE',
                createdAt: '2026-09-01T00:00:00Z',
              }),
            },
          ],
        };
      }
      if (collPath === 'productCodes') {
        return {
          empty: false,
          docs: [
            {
              id: 'CODE-1',
              data: () => ({
                code: 'ZR-PH01-7K9A-3F2W-M8PX',
                normalizedCode: 'ZRPH017K9A3F2WM8PX',
                batchId: 'BATCH-1',
                batchNumber: 'LOT-ZR26-01',
                productSku: 'ZR-PH01-30C',
                status: 'UNUSED',
                isActivated: false,
              }),
            },
            {
              id: 'CODE-2',
              data: () => ({
                code: 'ZR-PH01-4M2N-9Q8R-6K3V',
                normalizedCode: 'ZRPH014M2N9Q8R6K3V',
                batchId: 'BATCH-1',
                batchNumber: 'LOT-ZR26-01',
                productSku: 'ZR-PH01-30C',
                status: 'UNUSED',
                isActivated: false,
              }),
            },
          ],
        };
      }
      return { empty: true, docs: [] };
    }),
  };
});

describe('ProductCodeService Client Layer (Phase 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mutations via Cloud Functions', () => {
    it('generateProductCodes calls the authoritative Cloud Function and returns generated result', async () => {
      const result = await generateProductCodes({
        quantity: 5,
        productSku: 'ZR-PH01-30C',
        batchId: 'batch-001',
      });

      expect(result.success).toBe(true);
      expect(result.quantity).toBe(5);
      expect(result.codes).toHaveLength(5);
      expect(result.codes[0]).toBe('ZR-PH01-TEST-0');
    });

    it('createProductBatch creates a new batch via Cloud Function', async () => {
      const result = await createProductBatch({
        productSku: 'ZR-PH01-30C',
        batchNumber: 'LOT-2026-001',
        manufactureDate: '2026-09-01',
        expiryDate: '2028-09-01',
      });

      expect(result.success).toBe(true);
      expect(result.batchId).toBe('mock-batch-id-123');
      expect(result.status).toBe('ACTIVE');
    });

    it('updateBatchStatus updates status via Cloud Function', async () => {
      const result = await updateBatchStatus({
        batchId: 'mock-batch-id-123',
        status: 'DISABLED',
      });

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('DISABLED');
    });
  });

  describe('Query Layer', () => {
    it('getBatches fetches batches with descending sort and pagination metrics', async () => {
      const result = await getBatches();
      expect(result.batches).toHaveLength(2);
      expect(result.batches[0].id).toBe('BATCH-1');
      expect(result.totalReturned).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it('getBatch retrieves a single batch by ID or batchNumber', async () => {
      const batch = await getBatch('BATCH-EXISTING');
      expect(batch).not.toBeNull();
      expect(batch?.id).toBe('BATCH-EXISTING');
      expect(batch?.batchNumber).toBe('LOT-2026-A');
    });

    it('getBatch returns null for non-existent batch', async () => {
      const batch = await getBatch('NON_EXISTENT_BATCH');
      expect(batch).toBeNull();
    });

    it('getProductCode retrieves a single code by ID or code string', async () => {
      const code = await getProductCode('ZR-PH01-7K9A-3F2W-M8PX');
      expect(code).not.toBeNull();
      expect(code?.code).toBe('ZR-PH01-7K9A-3F2W-M8PX');
      expect(code?.status).toBe('UNUSED');
    });

    it('getProductCodes retrieves codes list with search filter matching', async () => {
      const result = await getProductCodes({ batchId: 'BATCH-1' });
      expect(result.codes).toHaveLength(2);
      expect(result.codes[0].code).toBe('ZR-PH01-7K9A-3F2W-M8PX');

      // Search matching first code
      const searchResult = await getProductCodes({
        batchId: 'BATCH-1',
        search: '7K9A',
      });
      expect(searchResult.codes).toHaveLength(1);
      expect(searchResult.codes[0].code).toBe('ZR-PH01-7K9A-3F2W-M8PX');
    });
  });
});
