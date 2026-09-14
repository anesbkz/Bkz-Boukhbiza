/**
 * ZIRON Product Code Generation & Normalization Utilities
 * Implements cryptographically secure Crockford Base32 container serial generation.
 */

export const CROCKFORD_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

export const CANONICAL_CATALOG_SKUS: Record<
  string,
  { name: string; phasePrefix: string; phase: number }
> = {
  'ZR-PH01-30C': { name: 'ZIRON Phase 01 (30 Capsules)', phasePrefix: 'PH01', phase: 1 },
  'ZR-PH02-30C': { name: 'ZIRON Phase 02 (30 Capsules)', phasePrefix: 'PH02', phase: 2 },
  'ZR-PH03-30C': { name: 'ZIRON Phase 03 (30 Capsules)', phasePrefix: 'PH03', phase: 3 },
  'ZR-BNDL-90C': { name: 'ZIRON Complete Bundle (90 Capsules)', phasePrefix: 'BNDL', phase: 1 },
};

/**
 * Canonical normalization helper for product codes.
 * - Trims whitespace
 * - Converts to uppercase
 * - Strips formatting separators (hyphens, spaces)
 */
export function normalizeProductCode(code: string): string {
  return (code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Validates whether a raw code matches the canonical human-readable ZIRON serial format.
 * Format: ZR-<PHASE>-<XXXX>-<XXXX>-<XXXX> (e.g. ZR-PH01-7K9A-3F2W-M8PX)
 */
export function isValidProductCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const pattern = /^ZR-(PH01|PH02|PH03|BNDL)-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;
  return pattern.test(code.trim().toUpperCase());
}

/**
 * Generates an unambiguous random Crockford Base32 segment of specified length.
 * Uses Web Crypto / Node crypto API for cryptographic randomness.
 */
export function generateCrockfordSegment(length: number): string {
  const chars = CROCKFORD_ALPHABET;
  let result = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  } else {
    // Fallback for Node.js environments if crypto.getRandomValues not globally mounted
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    const bytes = nodeCrypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  }
  return result;
}

/**
 * Generates a human-readable, cryptographically secure ZIRON container serial.
 * Format: ZR-<PHASE>-<XXXX>-<XXXX>-<XXXX>
 */
export function generateSecureProductCode(phasePrefix: string): string {
  const seg1 = generateCrockfordSegment(4);
  const seg2 = generateCrockfordSegment(4);
  const seg3 = generateCrockfordSegment(4);
  return `ZR-${phasePrefix}-${seg1}-${seg2}-${seg3}`;
}

/**
 * In-memory batch code generator with collision prevention and validation.
 */
export function generateBatchProductCodes(
  quantity: number,
  productSku: string,
  existingCodes: Set<string> = new Set()
): { code: string; normalizedCode: string; productSku: string; phase: number }[] {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
    throw new Error('Quantity must be an integer between 1 and 500.');
  }

  const skuInfo = CANONICAL_CATALOG_SKUS[productSku];
  if (!skuInfo) {
    throw new Error(`Invalid SKU "${productSku}". Must be one of: ${Object.keys(CANONICAL_CATALOG_SKUS).join(', ')}`);
  }

  const generatedInBatch = new Set<string>();
  const results: { code: string; normalizedCode: string; productSku: string; phase: number }[] = [];

  while (results.length < quantity) {
    const code = generateSecureProductCode(skuInfo.phasePrefix);
    const normalized = normalizeProductCode(code);

    // Collision check: both within this batch and against existing system codes
    if (!generatedInBatch.has(normalized) && !existingCodes.has(normalized) && !existingCodes.has(code)) {
      generatedInBatch.add(normalized);
      results.push({
        code,
        normalizedCode: normalized,
        productSku,
        phase: skuInfo.phase,
      });
    }
  }

  return results;
}
