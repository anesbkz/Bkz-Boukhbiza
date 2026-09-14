/**
 * Safe Public Application Build & Version Metadata
 * Exposes non-sensitive build commit SHA and build timestamp.
 * Strictly forbidden from exposing secrets, tokens, or credentials.
 */

export const ZIRON_VERSION = '1.0.0';

export const BUILD_SHA: string =
  (typeof __BUILD_SHA__ !== 'undefined' && __BUILD_SHA__ ? __BUILD_SHA__ : '') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUILD_SHA ? import.meta.env.VITE_BUILD_SHA : '') ||
  'e64dc34b68e7343e8c07c11f7c3dc8329623724e';

export const BUILD_TIME: string =
  (typeof __BUILD_TIME__ !== 'undefined' && __BUILD_TIME__ ? __BUILD_TIME__ : '') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUILD_TIME ? import.meta.env.VITE_BUILD_TIME : '') ||
  '2026-09-06T22:00:00Z';

// Expose safe global on window for automated health/consistency verifications
if (typeof window !== 'undefined') {
  (window as unknown as { ZIRON_VERSION: string; BUILD_SHA: string }).ZIRON_VERSION = ZIRON_VERSION;
  (window as unknown as { ZIRON_VERSION: string; BUILD_SHA: string }).BUILD_SHA = BUILD_SHA;
}
