import { describe, it, expect } from 'vitest';
import {
  CSV_COLUMNS,
  escapeCsvField,
  buildVerificationUrl,
  resolveVerificationDomain,
  validateExportBatch,
  buildManifestMetadata,
  generateCodesCsv,
  generateCodesJson,
  ExportValidationError,
} from './codeExport';
import { ProductBatch, ProductCode } from '@/types/models';

describe('ZIRON Commercial Code Export Engine (Phase 2)', () => {
  // Test Fixtures
  const mockBatch: ProductBatch = {
    id: 'batch-2026-001',
    batchNumber: 'LOT-ZR26-09A',
    productSku: 'ZR-PH01-30C',
    productName: 'ZIRON Phase 01 (30 Capsules)',
    manufactureDate: '2026-09-01',
    expiryDate: '2028-09-01',
    status: 'ACTIVE',
    testingStatus: 'PASS',
    totalCodes: 3,
    activatedCodes: 0,
    disabledCodes: 0,
    createdAt: '2026-09-01T08:00:00Z',
    createdBy: 'staff-admin-01',
    updatedAt: '2026-09-01T08:00:00Z',
  };

  const mockCodes: ProductCode[] = [
    {
      id: 'ZR-PH01-7K9A-3F2W-M8PX',
      code: 'ZR-PH01-7K9A-3F2W-M8PX',
      normalizedCode: 'ZRPH017K9A3F2WM8PX',
      batchId: 'batch-2026-001',
      batchNumber: 'LOT-ZR26-09A',
      productSku: 'ZR-PH01-30C',
      phase: 1,
      status: 'UNUSED',
      isActivated: false,
      grantsSchoolAccess: true,
      grantsCommunityAccess: true,
      createdAt: '2026-09-01T08:10:00Z',
    },
    {
      id: 'ZR-PH01-4M2N-9Q8R-6K3V',
      code: 'ZR-PH01-4M2N-9Q8R-6K3V',
      normalizedCode: 'ZRPH014M2N9Q8R6K3V',
      batchId: 'batch-2026-001',
      batchNumber: 'LOT-ZR26-09A',
      productSku: 'ZR-PH01-30C',
      phase: 1,
      status: 'UNUSED',
      isActivated: false,
      grantsSchoolAccess: true,
      grantsCommunityAccess: true,
      createdAt: '2026-09-01T08:10:00Z',
    },
    {
      id: 'ZR-PH01-2B5C-8D3E-1F4G',
      code: 'ZR-PH01-2B5C-8D3E-1F4G',
      normalizedCode: 'ZRPH012B5C8D3E1F4G',
      batchId: 'batch-2026-001',
      batchNumber: 'LOT-ZR26-09A',
      productSku: 'ZR-PH01-30C',
      phase: 1,
      status: 'UNUSED',
      isActivated: false,
      grantsSchoolAccess: true,
      grantsCommunityAccess: true,
      createdAt: '2026-09-01T08:10:00Z',
    },
  ];

  // =========================================================================
  // 1. CSV ESCAPING & QUALITY
  // =========================================================================
  describe('1. CSV Escaping & RFC 4180 Quality', () => {
    it('leaves standard alphanumeric strings unquoted', () => {
      expect(escapeCsvField('ZR-PH01-7K9A-3F2W-M8PX')).toBe('ZR-PH01-7K9A-3F2W-M8PX');
      expect(escapeCsvField(123)).toBe('123');
    });

    it('handles empty, null, and undefined values cleanly', () => {
      expect(escapeCsvField(null)).toBe('');
      expect(escapeCsvField(undefined)).toBe('');
      expect(escapeCsvField('')).toBe('');
    });

    it('escapes fields containing commas with enclosing quotes', () => {
      const field = 'ZIRON Phase 01, 30 Capsules';
      expect(escapeCsvField(field)).toBe('"ZIRON Phase 01, 30 Capsules"');
    });

    it('escapes fields containing quotes by doubling quotes and wrapping', () => {
      const field = 'ZIRON "Bio-Active" Phase 01';
      expect(escapeCsvField(field)).toBe('"ZIRON ""Bio-Active"" Phase 01"');
    });

    it('escapes fields containing newlines (\n and \r\n)', () => {
      const fieldWithNl = 'Batch Notes Line 1\nBatch Notes Line 2';
      expect(escapeCsvField(fieldWithNl)).toBe('"Batch Notes Line 1\nBatch Notes Line 2"');

      const fieldWithCrLf = 'Line 1\r\nLine 2';
      expect(escapeCsvField(fieldWithCrLf)).toBe('"Line 1\r\nLine 2"');
    });

    it('safely handles Unicode and Arabic text without corruption', () => {
      const arabicTitle = 'زيرون المرحلة الأولى (٣٠ كبسولة)';
      const escaped = escapeCsvField(arabicTitle);
      expect(escaped).toBe(arabicTitle);

      const arabicWithComma = 'زيرون, مرحلة ١';
      expect(escapeCsvField(arabicWithComma)).toBe('"زيرون, مرحلة ١"');
    });
  });

  // =========================================================================
  // 2. VERIFICATION URL GENERATION
  // =========================================================================
  describe('2. Verification URL Generation', () => {
    it('constructs correct URL with proper query param and encoding', () => {
      const url = buildVerificationUrl('ZR-PH01-7K9A-3F2W-M8PX', 'https://ziron.bio');
      expect(url).toBe('https://ziron.bio/verify?code=ZR-PH01-7K9A-3F2W-M8PX');
    });

    it('strips trailing slashes from the base domain', () => {
      const url = buildVerificationUrl('ZR-PH01-7K9A-3F2W-M8PX', 'https://ziron.bio///');
      expect(url).toBe('https://ziron.bio/verify?code=ZR-PH01-7K9A-3F2W-M8PX');
    });

    it('encodes special characters in codes if present', () => {
      const url = buildVerificationUrl('ZR+CODE/TEST', 'https://ziron.bio');
      expect(url).toBe('https://ziron.bio/verify?code=ZR%2BCODE%2FTEST');
    });

    it('resolves default public domain correctly without hardcoding localhost', () => {
      const domain = resolveVerificationDomain();
      expect(domain).toBeDefined();
      expect(domain).not.toContain('localhost');
      expect(domain).not.toContain('127.0.0.1');

      const customDomain = resolveVerificationDomain('https://custom.virexon.com');
      expect(customDomain).toBe('https://custom.virexon.com');
    });
  });

  // =========================================================================
  // 3. EXPORT VALIDATION
  // =========================================================================
  describe('3. Pre-Export Data Validation', () => {
    it('validates a correct batch and code list successfully', () => {
      expect(() => validateExportBatch(mockBatch, mockCodes)).not.toThrow();
    });

    it('throws ExportValidationError on empty codes array', () => {
      expect(() => validateExportBatch(mockBatch, [])).toThrow(ExportValidationError);
    });

    it('detects duplicate codes in export list and throws', () => {
      const duplicateCodes = [
        ...mockCodes,
        { ...mockCodes[0] }, // duplicate code
      ];

      expect(() => validateExportBatch(mockBatch, duplicateCodes)).toThrow(ExportValidationError);
      try {
        validateExportBatch(mockBatch, duplicateCodes);
      } catch (err: unknown) {
        const error = err as ExportValidationError;
        expect(error.validationErrors.some((e) => e.includes('Duplicate serial code'))).toBe(true);
      }
    });

    it('detects code belonging to wrong batch and throws', () => {
      const mismatchedBatchCodes = [
        mockCodes[0],
        {
          ...mockCodes[1],
          batchId: 'wrong-batch-999',
        },
      ];

      expect(() => validateExportBatch(mockBatch, mismatchedBatchCodes)).toThrow(ExportValidationError);
      try {
        validateExportBatch(mockBatch, mismatchedBatchCodes);
      } catch (err: unknown) {
        const error = err as ExportValidationError;
        expect(error.validationErrors.some((e) => e.includes('belongs to batch'))).toBe(true);
      }
    });

    it('detects code with mismatched product SKU and throws', () => {
      const mismatchedSkuCodes = [
        mockCodes[0],
        {
          ...mockCodes[1],
          productSku: 'ZR-PH02-30C', // mismatched SKU
        },
      ];

      expect(() => validateExportBatch(mockBatch, mismatchedSkuCodes)).toThrow(ExportValidationError);
      try {
        validateExportBatch(mockBatch, mismatchedSkuCodes);
      } catch (err: unknown) {
        const error = err as ExportValidationError;
        expect(error.validationErrors.some((e) => e.includes('expected "ZR-PH01-30C"'))).toBe(true);
      }
    });

    it('validates missing batch required fields', () => {
      const invalidBatch = { ...mockBatch, batchNumber: '' };
      expect(() => validateExportBatch(invalidBatch, mockCodes)).toThrow(ExportValidationError);
    });
  });

  // =========================================================================
  // 4. CSV GENERATION & MANIFEST
  // =========================================================================
  describe('4. CSV Export Generation & Formatting', () => {
    it('prepends UTF-8 BOM (\\uFEFF) at the start of CSV', () => {
      const result = generateCodesCsv(mockBatch, mockCodes);
      expect(result.csvString.charCodeAt(0)).toBe(0xfeff);
    });

    it('includes required metadata manifest comments before CSV data', () => {
      const result = generateCodesCsv(mockBatch, mockCodes);
      const csv = result.csvString;

      expect(csv).toContain('# Export_Type: ZIRON_PRODUCT_CODES_MANIFEST');
      expect(csv).toContain('# Batch_Number: LOT-ZR26-09A');
      expect(csv).toContain('# Batch_ID: batch-2026-001');
      expect(csv).toContain('# Product_SKU: ZR-PH01-30C');
      expect(csv).toContain('# Total_Codes: 3');
      expect(csv).toContain('# Sequence_Start: 1');
      expect(csv).toContain('# Sequence_End: 3');
      expect(csv).toContain('# Verification_Domain: https://ziron.bio');
    });

    it('can optionally omit the manifest comments if requested', () => {
      const result = generateCodesCsv(mockBatch, mockCodes, {
        includeManifestHeader: false,
      });
      expect(result.csvString).not.toContain('# Export_Type');
      // Stripping BOM for comparison
      const clean = result.csvString.replace(/^\uFEFF/, '');
      expect(clean.startsWith(CSV_COLUMNS.join(','))).toBe(true);
    });

    it('contains exact required column headers in order', () => {
      const result = generateCodesCsv(mockBatch, mockCodes);
      const expectedColumns = [
        'Sequence',
        'Serial_Code',
        'Product_SKU',
        'Product_Name',
        'Batch_Number',
        'Manufacture_Date',
        'Expiry_Date',
        'Verification_URL',
      ].join(',');

      expect(result.csvString).toContain(expectedColumns);
    });

    it('outputs the exact number of rows matching the code count', () => {
      const result = generateCodesCsv(mockBatch, mockCodes);
      expect(result.rowCount).toBe(3);

      // Verify sequence numbering 1, 2, 3
      expect(result.csvString).toContain('1,ZR-PH01-7K9A-3F2W-M8PX');
      expect(result.csvString).toContain('2,ZR-PH01-4M2N-9Q8R-6K3V');
      expect(result.csvString).toContain('3,ZR-PH01-2B5C-8D3E-1F4G');
    });

    it('supports custom sequence start number (e.g. sequence continuation)', () => {
      const result = generateCodesCsv(mockBatch, mockCodes, {
        startSequence: 501,
      });
      expect(result.manifest.sequenceStart).toBe(501);
      expect(result.manifest.sequenceEnd).toBe(503);
      expect(result.csvString).toContain('501,ZR-PH01-7K9A-3F2W-M8PX');
      expect(result.csvString).toContain('502,ZR-PH01-4M2N-9Q8R-6K3V');
      expect(result.csvString).toContain('503,ZR-PH01-2B5C-8D3E-1F4G');
    });

    it('produces valid Blob with text/csv mime type', () => {
      const result = generateCodesCsv(mockBatch, mockCodes);
      expect(result.blob).toBeDefined();
      expect(result.blob.type).toContain('text/csv');
      expect(result.filename).toBe('ZIRON_CODES_ZR-PH01-30C_LOT-ZR26-09A_3.csv');
    });
  });

  // =========================================================================
  // 5. JSON EXPORT
  // =========================================================================
  describe('5. Operational JSON Export', () => {
    it('generates compliant JSON manifest matching schema', () => {
      const result = generateCodesJson(mockBatch, mockCodes);

      expect(result.data.exportType).toBe('ZIRON_PRODUCT_CODES');
      expect(result.data.batch.id).toBe('batch-2026-001');
      expect(result.data.batch.number).toBe('LOT-ZR26-09A');
      expect(result.data.batch.productSku).toBe('ZR-PH01-30C');
      expect(result.data.codes).toHaveLength(3);

      expect(result.data.codes[0]).toEqual({
        sequence: 1,
        code: 'ZR-PH01-7K9A-3F2W-M8PX',
        productSku: 'ZR-PH01-30C',
        productName: 'ZIRON Phase 01 (30 Capsules)',
        batchNumber: 'LOT-ZR26-09A',
        manufactureDate: '2026-09-01',
        expiryDate: '2028-09-01',
        verificationUrl: 'https://ziron.bio/verify?code=ZR-PH01-7K9A-3F2W-M8PX',
      });

      // Does not expose sensitive credentials or internal auth tokens
      const jsonText = result.jsonString;
      expect(jsonText).not.toContain('privateKey');
      expect(jsonText).not.toContain('secret');
      expect(jsonText).not.toContain('token');
      expect(jsonText).not.toContain('password');
    });

    it('produces valid JSON Blob and filename', () => {
      const result = generateCodesJson(mockBatch, mockCodes);
      expect(result.blob).toBeDefined();
      expect(result.blob.type).toContain('application/json');
      expect(result.filename).toBe('ZIRON_CODES_ZR-PH01-30C_LOT-ZR26-09A_3.json');
    });
  });
});
