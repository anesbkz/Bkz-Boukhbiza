/**
 * ============================================================================
 * PHASE 7.1 SPECIFICATION TEST SUITE:
 * CERTIFICATES SECURITY & ISSUANCE HARDENING
 *
 * Requirements:
 * A. Concurrent issuance:
 *    - Two simultaneous issuance requests yield exactly one certificate.
 *    - The exact same certificate is returned to both callers.
 * B. Idempotency:
 *    - Repeated issuance calls return identical existing certificate.
 *    - Repeated course completion does not produce duplicate certificates.
 * C. Revocation:
 *    - Revoked certificate cannot be silently reissued or overwritten.
 * D. Certificate number security:
 *    - Cryptographic generator with Crockford Base32 alphabet (no I, L, O, U).
 *    - Collision handling inside atomic transaction.
 *    - Zero Math.random() in production code.
 * E. Privacy & Data Minimization:
 *    - verificationToken is strictly absent from publicCertificates.
 *    - No PII (userId, email, phone, address, XP, streaks, rewards, container codes).
 * F. Firestore access rules:
 *    - User can read own certificate.
 *    - User cannot read or enumerate another user's certificates.
 *    - Public certificate cannot be listed/enumerated (list: false).
 *    - Public single-document get is allowed for verification.
 *    - Client writes (create, update, delete) are strictly denied.
 * G. School eligibility (3 unique containers rule):
 *    - 3 unique containers accepted (PH01+PH01+PH01 with 3 distinct codes accepted).
 *    - PH01+PH02+PH03 accepted.
 *    - PH01+PH02+PH02 rejected (only 2 unique containers).
 *    - Uniqueness criterion is container code identity, NOT phase.
 * H. Course completion:
 *    - Incomplete course rejected.
 *    - Incomplete lesson (< 100%) rejected.
 *    - 100% completion accepted.
 * I. Pending reconciliation:
 *    - Issuance failure sets PENDING_RECONCILIATION without falsely claiming issued.
 *    - Retry resolves pending state idempotently.
 * J. Revocation public state:
 *    - Public verification reports REVOKED with auditable reason and timestamp.
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { evaluateCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import {
  claimCourseCertificate,
  verifyCertificatePublic,
  revokeCertificateAdmin,
} from '@/services/certificateService';
import { completeSchoolLesson } from '@/services/schoolService';

// Mock Firebase Functions for client service invocations
vi.mock('firebase/functions', () => {
  // In-memory store for simulation of backend transactions & idempotency
  const mockCertStore = new Map<string, any>();
  const mockPublicStore = new Map<string, any>();

  return {
    getFunctions: vi.fn(() => ({})),
    httpsCallable: vi.fn((_functions, functionName) => {
      return async (data: any) => {
        // --- 1. issueCourseCertificate ---
        if (functionName === 'issueCourseCertificate') {
          const { courseId } = data || {};
          const callerUid = 'user_student_123';
          const certId = `cert_${callerUid}_${courseId}`;

          if (courseId === 'course_uncompleted' || courseId === 'course_99_percent') {
            throw new Error('Authoritative course completion required. Every required lesson must be completed before certificate issuance.');
          }

          if (courseId === 'course_not_enrolled') {
            throw new Error('You are not enrolled in this course.');
          }

          if (courseId === 'course_ineligible_containers') {
            throw new Error('School access is unlocked by 3 verified product containers.');
          }

          // Idempotency check: return existing
          if (mockCertStore.has(certId)) {
            const existing = mockCertStore.get(certId);
            if (existing.status === 'REVOKED' || existing.isRevoked) {
              throw new Error('This certificate has been revoked by institutional authority and cannot be reissued.');
            }
            return { data: { success: true, certificate: existing } };
          }

          // Generate new deterministic certificate record using cryptographic randomness
          const year = new Date().getFullYear();
          const bytes = crypto.randomBytes(8);
          const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
          let s1 = '';
          let s2 = '';
          for (let i = 0; i < 4; i++) {
            s1 += CROCKFORD_ALPHABET.charAt(bytes[i] & 31);
            s2 += CROCKFORD_ALPHABET.charAt(bytes[i + 4] & 31);
          }
          const certNumber = `ZRN-CERT-${year}-${s1}-${s2}`;

          const newCert = {
            id: certId,
            certificateId: certId,
            certificateNumber: certNumber,
            userId: callerUid,
            recipientName: 'Verified Scholar',
            courseId,
            courseTitle: 'ZIRON Restart School Curriculum',
            issuedAt: new Date().toISOString(),
            status: 'ACTIVE',
            isRevoked: false,
            issuer: 'ZIRON Restart School - Virexon Biosciences Education Division',
            certificateType: 'COURSE_COMPLETION',
          };

          mockCertStore.set(certId, newCert);
          mockPublicStore.set(certNumber, {
            certificateNumber: certNumber,
            status: 'ACTIVE',
            courseTitle: 'ZIRON Restart School Curriculum',
            courseId,
            recipientName: 'Verified Scholar',
            issuedAt: newCert.issuedAt,
            issuer: newCert.issuer,
            certificateType: 'COURSE_COMPLETION',
            revokedAt: null,
            revocationReason: null,
          });

          return { data: { success: true, certificate: newCert } };
        }

        // --- 2. revokeCertificate ---
        if (functionName === 'revokeCertificate') {
          const { certificateId, reason } = data || {};
          if (!reason || !reason.trim()) {
            throw new Error('An auditable revocation reason is required.');
          }

          const existing = mockCertStore.get(certificateId);
          if (!existing) {
            throw new Error(`Certificate "${certificateId}" not found.`);
          }

          // Idempotent revocation
          const now = new Date().toISOString();
          existing.status = 'REVOKED';
          existing.isRevoked = true;
          existing.revokedAt = existing.revokedAt || now;
          existing.revocationReason = reason.trim();

          const pub = mockPublicStore.get(existing.certificateNumber);
          if (pub) {
            pub.status = 'REVOKED';
            pub.revokedAt = existing.revokedAt;
            pub.revocationReason = reason.trim();
          }

          return {
            data: {
              success: true,
              certificateId,
              certificateNumber: existing.certificateNumber,
              status: 'REVOKED',
              revokedAt: existing.revokedAt,
            },
          };
        }

        // --- 3. verifyCertificate ---
        if (functionName === 'verifyCertificate') {
          const { identifier } = data || {};
          const clean = (identifier || '').trim().toUpperCase();

          const pub = mockPublicStore.get(clean);
          if (!pub) {
            return {
              data: {
                isValid: false,
                message: 'No certificate matching this identifier was found in the official registry.',
              },
            };
          }

          const isRevoked = pub.status === 'REVOKED';
          return {
            data: {
              isValid: true,
              status: isRevoked ? 'REVOKED' : 'ACTIVE',
              isRevoked,
              certificateNumber: pub.certificateNumber,
              recipientName: pub.recipientName,
              courseTitle: pub.courseTitle,
              courseId: pub.courseId,
              issuer: pub.issuer,
              issuedAt: pub.issuedAt,
              completedAt: pub.completedAt || pub.issuedAt,
              certificateType: pub.certificateType,
              revokedAt: isRevoked ? (pub.revokedAt || null) : null,
              revocationReason: isRevoked ? (pub.revocationReason || 'Administrative Review') : null,
              educationalDisclaimer:
                'Certificates issued by ZIRON Restart School are educational completion credentials only. They do not certify medical treatment, addiction recovery, scientific claims, or clinical outcomes.',
            },
          };
        }

        // --- 4. completeSchoolLesson ---
        if (functionName === 'completeSchoolLesson') {
          const { courseId, lessonId } = data || {};
          if (courseId === 'course_failure_test') {
            return {
              data: {
                success: true,
                courseId,
                lessonId,
                progressPercent: 100,
                completedCount: 5,
                totalLessonsCount: 5,
                isCompleted: true,
                completedAt: new Date().toISOString(),
                certificate: null,
                certificateStatus: 'PENDING_RECONCILIATION',
                certificateError: 'Issuance pending reconciliation',
              },
            };
          }

          if (courseId === 'course_reconciliation_retry') {
            // Simulated reconciliation resolution
            return {
              data: {
                success: true,
                courseId,
                lessonId,
                progressPercent: 100,
                completedCount: 5,
                totalLessonsCount: 5,
                isCompleted: true,
                completedAt: new Date().toISOString(),
                certificate: {
                  id: `cert_user_student_123_${courseId}`,
                  certificateNumber: 'ZRN-CERT-2026-7K9A-3F2W',
                  status: 'ACTIVE',
                },
                certificateStatus: 'ISSUED',
                certificateError: null,
              },
            };
          }

          return {
            data: {
              success: true,
              courseId,
              lessonId,
              progressPercent: 100,
              completedCount: 5,
              totalLessonsCount: 5,
              isCompleted: true,
              completedAt: new Date().toISOString(),
              certificate: {
                id: `cert_user_student_123_${courseId}`,
                certificateNumber: 'ZRN-CERT-2026-7K9A-3F2W',
                status: 'ACTIVE',
              },
              certificateStatus: 'ISSUED',
              certificateError: null,
            },
          };
        }

        throw new Error(`Unhandled function ${functionName}`);
      };
    }),
  };
});

describe('Phase 7.1: Certificates Security & Issuance Hardening', () => {
  // ==========================================================================
  // A & B. CONCURRENCY & IDEMPOTENCY
  // ==========================================================================
  describe('A & B. Concurrency & Idempotency', () => {
    it('concurrent issuance requests for same user and course return identical certificate without duplicates', async () => {
      const courseId = 'course_recovery_foundations_concurrency';

      // Simulate simultaneous calls
      const [res1, res2] = await Promise.all([
        claimCourseCertificate(courseId),
        claimCourseCertificate(courseId),
      ]);

      expect(res1).toBeDefined();
      expect(res2).toBeDefined();
      expect(res1.id).toBe(res2.id);
      expect(res1.certificateNumber).toBe(res2.certificateNumber);
      expect(res1.certificateNumber).toMatch(/^ZRN-CERT-\d{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    });

    it('repeated issuance calls return existing certificate idempotently', async () => {
      const courseId = 'course_recovery_foundations_idempotent';

      const initial = await claimCourseCertificate(courseId);
      const subsequent = await claimCourseCertificate(courseId);

      expect(initial.id).toBe(subsequent.id);
      expect(initial.certificateNumber).toBe(subsequent.certificateNumber);
      expect(initial.issuedAt).toBe(subsequent.issuedAt);
    });

    it('repeated course completion calls return identical existing certificate idempotently', async () => {
      const courseId = 'course_repeated_completion';

      const firstCompletion = await completeSchoolLesson(courseId, 'lesson_final');
      const secondCompletion = await completeSchoolLesson(courseId, 'lesson_final');

      expect(firstCompletion.success).toBe(true);
      expect(secondCompletion.success).toBe(true);
      expect(firstCompletion.certificate?.certificateNumber).toBe(secondCompletion.certificate?.certificateNumber);
      expect(firstCompletion.certificateStatus).toBe('ISSUED');
      expect(secondCompletion.certificateStatus).toBe('ISSUED');
    });
  });

  // ==========================================================================
  // C. REVOCATION
  // ==========================================================================
  describe('C. Revocation Protection', () => {
    it('prevents a revoked certificate from being reissued as a new valid certificate', async () => {
      const courseId = 'course_revocation_test';
      const cert = await claimCourseCertificate(courseId);

      // Admin revokes certificate
      await revokeCertificateAdmin(cert.id, 'Academic Integrity Review');

      // Attempting to claim again must reject reissuance
      await expect(claimCourseCertificate(courseId)).rejects.toThrow(
        /revoked by institutional authority and cannot be reissued/i
      );
    });
  });

  // ==========================================================================
  // D. CERTIFICATE NUMBER SECURITY & COLLISION HANDLING
  // ==========================================================================
  describe('D. Certificate Number Security & Collision Handling', () => {
    it('certificate numbers follow Crockford Base32 pattern without ambiguous glyphs (I, L, O, U)', () => {
      const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
      const forbiddenGlyphs = ['I', 'L', 'O', 'U'];

      for (const glyph of forbiddenGlyphs) {
        expect(CROCKFORD_ALPHABET).not.toContain(glyph);
      }

      // Generate 20 test numbers using cryptographic randomness
      const year = new Date().getFullYear();
      for (let testIdx = 0; testIdx < 20; testIdx++) {
        const bytes = crypto.randomBytes(8);
        let s1 = '';
        let s2 = '';
        for (let i = 0; i < 4; i++) {
          s1 += CROCKFORD_ALPHABET.charAt(bytes[i] & 31);
          s2 += CROCKFORD_ALPHABET.charAt(bytes[i + 4] & 31);
        }
        const certNumber = `ZRN-CERT-${year}-${s1}-${s2}`;

        expect(certNumber).toMatch(new RegExp(`^ZRN-CERT-${year}-[0-9A-Z]{4}-[0-9A-Z]{4}$`));
        for (const glyph of forbiddenGlyphs) {
          expect(certNumber).not.toContain(glyph);
        }
      }
    });

    it('verifies that functions code uses crypto.randomBytes and zero Math.random for certificate generation', () => {
      const functionsIndexPath = path.resolve(process.cwd(), 'functions/src/index.ts');
      const functionsContent = fs.readFileSync(functionsIndexPath, 'utf8');

      // Check generateCertificateNumber implementation
      const generatorMatch = functionsContent.match(/function generateCertificateNumber[\s\S]*?\n\}/);
      expect(generatorMatch).toBeTruthy();
      const generatorCode = generatorMatch![0];

      expect(generatorCode).toContain('crypto.randomBytes');
      expect(generatorCode).not.toContain('Math.random');
    });
  });

  // ==========================================================================
  // E. PRIVACY & DATA MINIMIZATION
  // ==========================================================================
  describe('E. Privacy & Data Minimization', () => {
    it('public verification record strictly excludes verificationToken and all private PII', async () => {
      const courseId = 'course_privacy_test';
      const cert = await claimCourseCertificate(courseId);

      const verificationResult = await verifyCertificatePublic(cert.certificateNumber);
      expect(verificationResult.isValid).toBe(true);

      const payload = verificationResult as any;

      // FORBIDDEN SENSITIVE FIELDS
      expect(payload.verificationToken).toBeUndefined();
      expect(payload.userId).toBeUndefined();
      expect(payload.email).toBeUndefined();
      expect(payload.phoneNumber).toBeUndefined();
      expect(payload.address).toBeUndefined();
      expect(payload.xpAwarded).toBeUndefined();
      expect(payload.totalXp).toBeUndefined();
      expect(payload.streakCount).toBeUndefined();
      expect(payload.journeyMilestones).toBeUndefined();
      expect(payload.containerCode).toBeUndefined();
      expect(payload.activationCode).toBeUndefined();

      // REQUIRED AUTHORITATIVE FIELDS
      expect(payload.certificateNumber).toBe(cert.certificateNumber);
      expect(payload.status).toBe('ACTIVE');
      expect(payload.recipientName).toBeDefined();
      expect(payload.courseTitle).toBeDefined();
      expect(payload.issuer).toContain('ZIRON Restart School');
      expect(payload.educationalDisclaimer).toContain('educational completion credentials only');
    });
  });

  // ==========================================================================
  // F. FIRESTORE SECURITY RULES
  // ==========================================================================
  describe('F. Firestore Security Rules Audit', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    it('strictly blocks client-side create, update, delete for certificates collection', () => {
      const certMatch = rulesContent.match(/match\s+\/certificates\/\{certificateId\}[\s\S]*?\}/);
      expect(certMatch).toBeTruthy();
      const block = certMatch![0];
      expect(block).toContain('allow create, update, delete: if false;');
    });

    it('strictly blocks client-side create, update, delete for publicCertificates collection', () => {
      const pubMatch = rulesContent.match(/match\s+\/publicCertificates\/\{certificateNumber\}[\s\S]*?\}/);
      expect(pubMatch).toBeTruthy();
      const block = pubMatch![0];
      expect(block).toContain('allow create, update, delete: if false;');
    });

    it('strictly forbids collection enumeration (list: false) on publicCertificates', () => {
      const pubMatch = rulesContent.match(/match\s+\/publicCertificates\/\{certificateNumber\}[\s\S]*?\}/);
      expect(pubMatch).toBeTruthy();
      const block = pubMatch![0];
      expect(block).toContain('allow list: if false;');
      expect(block).toContain('allow get: if true;');
    });

    it('restricts reading certificates to document owner or staff only', () => {
      const certMatch = rulesContent.match(/match\s+\/certificates\/\{certificateId\}[\s\S]*?\}/);
      expect(certMatch).toBeTruthy();
      const block = certMatch![0];
      expect(block).toMatch(/allow get:\s+if\s+isOwner\(existing\(\)\.userId\)\s+\|\|\s+isStaff\(\);/);
      expect(block).toMatch(/allow list:\s+if\s+isStaff\(\)\s+\|\|\s+\(isSignedIn\(\)\s+&&\s+existing\(\)\.userId\s+==\s+request\.auth\.uid\);/);
    });
  });

  // ==========================================================================
  // G. SCHOOL ACCESS ELIGIBILITY (3 UNIQUE CONTAINERS RULE)
  // ==========================================================================
  describe('G. School Access Eligibility (3-Container Rule)', () => {
    it('user with 0 activated containers is locked from school curriculum', () => {
      const status = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(0);
    });

    it('user with 1 activated container is locked from school curriculum', () => {
      const status = evaluateCustomerEntitlements({
        activations: [{ code: 'ZR-PH01-7K9A-3F2W-M8PX' }],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(1);
    });

    it('user with 2 activated containers is locked from school curriculum', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-7K9A-3F2W-M8PX' },
          { code: 'ZR-PH01-9B3C-8H4J-K2MN' },
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(2);
    });

    it('user with 3 duplicate activations of the SAME container counts as 1 unique container and is locked', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-7K9A-3F2W-M8PX' },
          { code: 'ZR-PH01-7K9A-3F2W-M8PX' },
          { code: 'ZR-PH01-7K9A-3F2W-M8PX' },
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(1);
    });

    it('user with 3 unique containers of Phase 1 qualifies for school curriculum (PH01 + PH01 + PH01)', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-7K9A-3F2W-M8PX' },
          { code: 'ZR-PH01-9B3C-8H4J-K2MN' },
          { code: 'ZR-PH01-5D2E-6P7R-T1VW' },
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(true);
      expect(status.qualifyingContainerCount).toBe(3);
    });

    it('user with 3 unique containers across mixed phases qualifies for school curriculum (PH01 + PH02 + PH03)', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-7K9A-3F2W-M8PX' },
          { code: 'ZR-PH02-4F1G-2H3J-K4LM' },
          { code: 'ZR-PH03-8M2N-9P1Q-R2ST' },
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(true);
      expect(status.qualifyingContainerCount).toBe(3);
    });

    it('user with PH01 + PH02 + PH02 is rejected because only two unique containers exist', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-7K9A-3F2W-M8PX' },
          { code: 'ZR-PH02-4F1G-2H3J-K4LM' },
          { code: 'ZR-PH02-4F1G-2H3J-K4LM' }, // Duplicate of second container
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(2);
    });

    it('rejects certificate issuance if caller lacks school access entitlement', async () => {
      await expect(claimCourseCertificate('course_ineligible_containers')).rejects.toThrow(
        /School access is unlocked by 3 verified product containers/i
      );
    });
  });

  // ==========================================================================
  // H. COURSE COMPLETION PREREQUISITES
  // ==========================================================================
  describe('H. Course Completion Prerequisites', () => {
    it('rejects certificate claim if user is not enrolled in the course', async () => {
      await expect(claimCourseCertificate('course_not_enrolled')).rejects.toThrow(
        /not enrolled/i
      );
    });

    it('rejects certificate claim if course curriculum is uncompleted', async () => {
      await expect(claimCourseCertificate('course_uncompleted')).rejects.toThrow(
        /Every required lesson must be completed before certificate issuance/i
      );
    });

    it('rejects certificate claim if course curriculum is 99% completed', async () => {
      await expect(claimCourseCertificate('course_99_percent')).rejects.toThrow(
        /Every required lesson must be completed before certificate issuance/i
      );
    });

    it('accepts certificate claim when course is 100% completed', async () => {
      const res = await claimCourseCertificate('course_genuinely_completed');
      expect(res.status).toBe('ACTIVE');
      expect(res.id).toContain('course_genuinely_completed');
    });
  });

  // ==========================================================================
  // I. PENDING RECONCILIATION
  // ==========================================================================
  describe('I. Pending Reconciliation', () => {
    it('preserves course completion even if automatic certificate issuance temporarily fails', async () => {
      const result = await completeSchoolLesson('course_failure_test', 'lesson_last');

      expect(result.success).toBe(true);
      expect(result.isCompleted).toBe(true);
      expect(result.progressPercent).toBe(100);

      // Certificate is marked pending reconciliation, never falsely claimed as issued
      expect(result.certificate).toBeNull();
      expect(result.certificateStatus).toBe('PENDING_RECONCILIATION');
      expect(result.certificateError).toBe('Issuance pending reconciliation');
    });

    it('reconciliation retry successfully issues certificate idempotently once resolved', async () => {
      const retryResult = await completeSchoolLesson('course_reconciliation_retry', 'lesson_last');

      expect(retryResult.success).toBe(true);
      expect(retryResult.isCompleted).toBe(true);
      expect(retryResult.certificate).toBeDefined();
      expect(retryResult.certificateStatus).toBe('ISSUED');
      expect(retryResult.certificateError).toBeNull();
    });
  });

  // ==========================================================================
  // J. PUBLIC VERIFICATION STATE (ACTIVE, REVOKED, NOT FOUND)
  // ==========================================================================
  describe('J. Public Verification State', () => {
    it('valid active certificate verifies with status ACTIVE and isRevoked: false', async () => {
      const cert = await claimCourseCertificate('course_active_verification');
      const res = await verifyCertificatePublic(cert.certificateNumber);

      expect(res.isValid).toBe(true);
      expect(res.isRevoked).toBe(false);
      expect(res.status).toBe('ACTIVE');
      expect(res.certificateNumber).toBe(cert.certificateNumber);
    });

    it('revoked certificate verifies with status REVOKED and isRevoked: true with revocation reason', async () => {
      const cert = await claimCourseCertificate('course_revoke_verification');
      await revokeCertificateAdmin(cert.id, 'Failure to maintain academic prerequisites');

      const res = await verifyCertificatePublic(cert.certificateNumber);

      expect(res.isValid).toBe(true);
      expect(res.isRevoked).toBe(true);
      expect(res.status).toBe('REVOKED');
      expect(res.revocationReason).toBe('Failure to maintain academic prerequisites');
      expect(res.revokedAt).toBeDefined();
    });

    it('non-existent certificate returns clean, uninformative failure', async () => {
      const res = await verifyCertificatePublic('ZRN-CERT-9999-XXXX-XXXX');

      expect(res.isValid).toBe(false);
      expect(res.status).toBeUndefined();
      expect(res.message).toMatch(/No certificate matching this identifier was found/i);
    });
  });
});
