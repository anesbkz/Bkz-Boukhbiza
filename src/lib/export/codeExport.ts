/**
 * Commercial Packaging Print & Serialization Export Engine
 * Generates verified, RFC 4180 compliant CSV and operational JSON manifests
 * for printing companies and packaging serialization machinery.
 */
import { ProductBatch, ProductCode } from '@/types/models';
import { normalizeProductCode } from '@/lib/codes/productCodeGenerator';

export class ExportValidationError extends Error {
  public readonly validationErrors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'ExportValidationError';
    this.validationErrors = errors;
  }
}

export interface ExportManifestMetadata {
  exportType: 'ZIRON_PRODUCT_CODES_MANIFEST';
  exportTimestamp: string;
  batchId: string;
  batchNumber: string;
  productSku: string;
  productName: string;
  manufactureDate: string;
  expiryDate: string;
  totalCodes: number;
  sequenceStart: number;
  sequenceEnd: number;
  verificationDomain: string;
}

export interface ExportOptions {
  baseDomain?: string;
  includeManifestHeader?: boolean;
  startSequence?: number;
  productNameOverride?: string;
}

export interface CsvExportResult {
  csvString: string;
  blob: Blob;
  filename: string;
  manifest: ExportManifestMetadata;
  rowCount: number;
}

export interface JsonExportCodeItem {
  sequence: number;
  code: string;
  productSku: string;
  productName: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  verificationUrl: string;
}

export interface JsonExportPayload {
  exportType: 'ZIRON_PRODUCT_CODES';
  exportedAt: string;
  batch: {
    id: string;
    number: string;
    productSku: string;
    productName: string;
    manufactureDate: string;
    expiryDate: string;
  };
  manifest: ExportManifestMetadata;
  codes: JsonExportCodeItem[];
}

export interface JsonExportResult {
  data: JsonExportPayload;
  jsonString: string;
  blob: Blob;
  filename: string;
}

/**
 * Standard CSV header columns for commercial packaging printers.
 */
export const CSV_COLUMNS = [
  'Sequence',
  'Serial_Code',
  'Product_SKU',
  'Product_Name',
  'Batch_Number',
  'Manufacture_Date',
  'Expiry_Date',
  'Verification_URL',
] as const;

/**
 * Resolves the default public verification domain for QR and URL construction.
 * Avoids hardcoded localhost in production/export outputs.
 */
export function resolveVerificationDomain(baseDomainOverride?: string): string {
  if (baseDomainOverride && baseDomainOverride.trim()) {
    return baseDomainOverride.trim().replace(/\/+$/, '');
  }

  // Check client environment variables if available
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Check window location origin if in browser context and not localhost
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin.replace(/\/+$/, '');
    }
  }

  // Canonical default public domain
  return 'https://ziron.bio';
}

/**
 * Constructs a fully qualified, safely URL-encoded verification link for a product serial.
 * Example: https://ziron.bio/verify?code=ZR-PH01-7K9A-3F2W-M8PX
 */
export function buildVerificationUrl(code: string, baseDomain: string): string {
  const cleanDomain = baseDomain.replace(/\/+$/, '');
  return `${cleanDomain}/verify?code=${encodeURIComponent(code.trim())}`;
}

/**
 * Escapes an individual field per RFC 4180 CSV specifications:
 * - Null/undefined converted to empty string
 * - If field contains quotes, commas, or linebreaks (\r or \n), wrap in double quotes
 * - Any embedded quotes are doubled ("" per standard)
 */
export function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // Check if string contains comma, double-quote, or newline characters
  const needsQuoting = str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r');

  if (needsQuoting) {
    // Escape all double-quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return str;
}

/**
 * Validates consistency and integrity of product codes before generation.
 * Throws ExportValidationError if any rule is violated.
 */
export function validateExportBatch(
  batch: ProductBatch,
  codes: ProductCode[],
  options?: ExportOptions
): void {
  const errors: string[] = [];

  if (!batch || typeof batch !== 'object') {
    errors.push('A valid manufacturing batch object is required.');
  } else {
    if (!batch.id || !batch.id.trim()) {
      errors.push('Batch is missing a valid batch id.');
    }
    if (!batch.batchNumber || !batch.batchNumber.trim()) {
      errors.push('Batch is missing a valid batch number.');
    }
    if (!batch.productSku || !batch.productSku.trim()) {
      errors.push('Batch is missing a valid product SKU.');
    }
    if (!batch.manufactureDate || !batch.manufactureDate.trim()) {
      errors.push('Batch is missing manufactureDate.');
    }
    if (!batch.expiryDate || !batch.expiryDate.trim()) {
      errors.push('Batch is missing expiryDate.');
    }
  }

  if (!Array.isArray(codes) || codes.length === 0) {
    errors.push('Cannot export an empty code list. At least 1 code is required.');
  } else {
    const seenCodes = new Set<string>();
    const seenNormalized = new Set<string>();

    codes.forEach((codeObj, index) => {
      const idx = index + 1;
      if (!codeObj || typeof codeObj !== 'object') {
        errors.push(`Row ${idx}: Invalid code record.`);
        return;
      }

      if (!codeObj.code || !codeObj.code.trim()) {
        errors.push(`Row ${idx}: Serial code is missing or blank.`);
        return;
      }

      const trimmedCode = codeObj.code.trim();
      const norm = normalizeProductCode(trimmedCode);

      // Verify code uniqueness
      if (seenCodes.has(trimmedCode) || seenNormalized.has(norm)) {
        errors.push(`Row ${idx}: Duplicate serial code detected "${trimmedCode}".`);
      }
      seenCodes.add(trimmedCode);
      seenNormalized.add(norm);

      // Verify batch association
      if (batch?.id && codeObj.batchId && codeObj.batchId !== batch.id) {
        errors.push(
          `Row ${idx}: Code "${trimmedCode}" belongs to batch "${codeObj.batchId}", expected "${batch.id}".`
        );
      }

      // Verify SKU association
      if (batch?.productSku && codeObj.productSku && codeObj.productSku !== batch.productSku) {
        errors.push(
          `Row ${idx}: Code "${trimmedCode}" has SKU "${codeObj.productSku}", expected "${batch.productSku}".`
        );
      }
    });
  }

  if (errors.length > 0) {
    throw new ExportValidationError(
      `Batch export validation failed with ${errors.length} error(s).`,
      errors
    );
  }
}

/**
 * Builds the packaging print manifest metadata structure.
 */
export function buildManifestMetadata(
  batch: ProductBatch,
  codes: ProductCode[],
  options?: ExportOptions
): ExportManifestMetadata {
  const startSeq = options?.startSequence || 1;
  const endSeq = startSeq + codes.length - 1;
  const verificationDomain = resolveVerificationDomain(options?.baseDomain);
  const productName = options?.productNameOverride || batch.productName || batch.productSku;

  return {
    exportType: 'ZIRON_PRODUCT_CODES_MANIFEST',
    exportTimestamp: new Date().toISOString(),
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    productSku: batch.productSku,
    productName,
    manufactureDate: batch.manufactureDate,
    expiryDate: batch.expiryDate,
    totalCodes: codes.length,
    sequenceStart: startSeq,
    sequenceEnd: endSeq,
    verificationDomain,
  };
}

/**
 * Generates an RFC 4180-compliant, packaging-ready CSV string and Blob for commercial printers.
 * Prepend UTF-8 BOM (\uFEFF) for broad compatibility with Excel and print RIP software.
 */
export function generateCodesCsv(
  batch: ProductBatch,
  codes: ProductCode[],
  options?: ExportOptions
): CsvExportResult {
  validateExportBatch(batch, codes, options);

  const manifest = buildManifestMetadata(batch, codes, options);
  const includeManifest = options?.includeManifestHeader !== false;
  const startSeq = options?.startSequence || 1;

  const lines: string[] = [];

  // 1. Metadata Section (Comments formatted for machine ingestion)
  if (includeManifest) {
    lines.push(`# ==============================================================================`);
    lines.push(`# ZIRON MANUFACTURING PACKAGING & SERIALIZATION MANIFEST`);
    lines.push(`# ==============================================================================`);
    lines.push(`# Export_Type: ${manifest.exportType}`);
    lines.push(`# Export_Timestamp: ${manifest.exportTimestamp}`);
    lines.push(`# Batch_Number: ${manifest.batchNumber}`);
    lines.push(`# Batch_ID: ${manifest.batchId}`);
    lines.push(`# Product_SKU: ${manifest.productSku}`);
    lines.push(`# Product_Name: ${manifest.productName}`);
    lines.push(`# Total_Codes: ${manifest.totalCodes}`);
    lines.push(`# Sequence_Start: ${manifest.sequenceStart}`);
    lines.push(`# Sequence_End: ${manifest.sequenceEnd}`);
    lines.push(`# Verification_Domain: ${manifest.verificationDomain}`);
    lines.push(`# ==============================================================================`);
  }

  // 2. CSV Column Header Row
  lines.push(CSV_COLUMNS.join(','));

  // 3. Data Rows
  codes.forEach((codeObj, index) => {
    const sequence = startSeq + index;
    const serialCode = codeObj.code.trim();
    const productSku = codeObj.productSku || batch.productSku;
    const productName = manifest.productName;
    const batchNumber = batch.batchNumber;
    const manufactureDate = batch.manufactureDate;
    const expiryDate = batch.expiryDate;
    const verificationUrl = buildVerificationUrl(serialCode, manifest.verificationDomain);

    const row = [
      escapeCsvField(sequence),
      escapeCsvField(serialCode),
      escapeCsvField(productSku),
      escapeCsvField(productName),
      escapeCsvField(batchNumber),
      escapeCsvField(manufactureDate),
      escapeCsvField(expiryDate),
      escapeCsvField(verificationUrl),
    ];

    lines.push(row.join(','));
  });

  // Join lines using standard CRLF (\r\n) per RFC 4180
  const rawCsv = lines.join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) to guarantee proper character rendering in Microsoft Excel and packaging RIPs
  const bom = '\uFEFF';
  const csvString = `${bom}${rawCsv}`;

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const sanitizedBatchNumber = batch.batchNumber.replace(/[^A-Za-z0-9-_]/g, '_');
  const filename = `ZIRON_CODES_${batch.productSku}_${sanitizedBatchNumber}_${manifest.totalCodes}.csv`;

  return {
    csvString,
    blob,
    filename,
    manifest,
    rowCount: codes.length,
  };
}

/**
 * Generates an operational JSON manifest for internal system integration and serialization verification.
 */
export function generateCodesJson(
  batch: ProductBatch,
  codes: ProductCode[],
  options?: ExportOptions
): JsonExportResult {
  validateExportBatch(batch, codes, options);

  const manifest = buildManifestMetadata(batch, codes, options);
  const startSeq = options?.startSequence || 1;

  const codeItems: JsonExportCodeItem[] = codes.map((codeObj, index) => {
    const sequence = startSeq + index;
    const serialCode = codeObj.code.trim();
    const productSku = codeObj.productSku || batch.productSku;
    const productName = manifest.productName;
    const batchNumber = batch.batchNumber;
    const manufactureDate = batch.manufactureDate;
    const expiryDate = batch.expiryDate;
    const verificationUrl = buildVerificationUrl(serialCode, manifest.verificationDomain);

    return {
      sequence,
      code: serialCode,
      productSku,
      productName,
      batchNumber,
      manufactureDate,
      expiryDate,
      verificationUrl,
    };
  });

  const payload: JsonExportPayload = {
    exportType: 'ZIRON_PRODUCT_CODES',
    exportedAt: manifest.exportTimestamp,
    batch: {
      id: batch.id,
      number: batch.batchNumber,
      productSku: batch.productSku,
      productName: manifest.productName,
      manufactureDate: batch.manufactureDate,
      expiryDate: batch.expiryDate,
    },
    manifest,
    codes: codeItems,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const sanitizedBatchNumber = batch.batchNumber.replace(/[^A-Za-z0-9-_]/g, '_');
  const filename = `ZIRON_CODES_${batch.productSku}_${sanitizedBatchNumber}_${manifest.totalCodes}.json`;

  return {
    data: payload,
    jsonString,
    blob,
    filename,
  };
}

/**
 * Browser-safe file download trigger for CSV / JSON artifacts.
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || !window.document) return;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
