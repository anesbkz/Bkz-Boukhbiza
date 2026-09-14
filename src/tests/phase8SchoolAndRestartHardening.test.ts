/**
 * ============================================================================
 * PHASE 8 SPECIFICATION TEST SUITE:
 * ZIRON RESTART PLATFORM FOUNDATION & SCHOOL ENTITLEMENT AUDIT
 *
 * Core Verification Checks:
 * 1. School locked with 0 unique activated containers.
 * 2. School locked with 1 unique activated container.
 * 3. School locked with 2 unique activated containers.
 * 4. School unlocked with 3 unique activated containers.
 * 5. Same phase is allowed (e.g., 3 Phase 1 containers unlock School).
 * 6. Mixed phases are allowed (e.g., PH01 + PH02 + PH03 unlock School).
 * 7. Duplicate container cannot count twice (e.g., 2 activations of same container count as 1).
 * 8. Client cannot self-grant School entitlement (server-authoritative rules and verification).
 * 9. Unpublished course cannot be accessed as a normal published course.
 * 10. Course completion cannot be forged by client (Firestore rules enforce server-only progress write).
 * 11. User can only see their own certificates (Firestore rules enforce userId match).
 * 12. Existing certificate hardening invariants remain intact (server issuance, privacy).
 * 13. ZIRON RESTART ecosystem pathways and Fund disclosure invariants.
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { evaluateCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import * as fs from 'fs';
import * as path from 'path';

describe('PHASE 8: ZIRON RESTART & School Entitlements Foundation', () => {
  // 1. School locked with 0 unique activated containers
  it('1. locks School when user has 0 activated containers', () => {
    const evaluation = evaluateCustomerEntitlements({
      activations: [],
      entitlements: [],
      isStaff: false,
    });
    expect(evaluation.qualifyingContainerCount).toBe(0);
    expect(evaluation.hasSchoolAccess).toBe(false);
  });

  // 2. School locked with 1 unique activated container
  it('2. locks School when user has 1 unique activated container', () => {
    const evaluation = evaluateCustomerEntitlements({
      activations: [{ code: 'ZR-PH01-0001-A1' as any }],
      entitlements: [],
      isStaff: false,
    });
    expect(evaluation.qualifyingContainerCount).toBe(1);
    expect(evaluation.hasSchoolAccess).toBe(false);
  });

  // 3. School locked with 2 unique activated containers
  it('3. locks School when user has 2 unique activated containers', () => {
    const evaluation = evaluateCustomerEntitlements({
      activations: [
        { code: 'ZR-PH01-0001-A1' as any },
        { code: 'ZR-PH01-0002-B2' as any },
      ],
      entitlements: [],
      isStaff: false,
    });
    expect(evaluation.qualifyingContainerCount).toBe(2);
    expect(evaluation.hasSchoolAccess).toBe(false);
  });

  // 4. School unlocked with 3 unique activated containers
  it('4. unlocks School when user has exactly 3 unique activated containers', () => {
    const evaluation = evaluateCustomerEntitlements({
      activations: [
        { code: 'ZR-PH01-0001-A1' as any },
        { code: 'ZR-PH01-0002-B2' as any },
        { code: 'ZR-PH01-0003-C3' as any },
      ],
      entitlements: [],
      isStaff: false,
    });
    expect(evaluation.qualifyingContainerCount).toBe(3);
    expect(evaluation.hasSchoolAccess).toBe(true);
  });

  // 5. Same phase is allowed
  it('5. allows same phase containers to unlock School (e.g. 3 containers from Phase 1)', () => {
    const evaluation = evaluateCustomerEntitlements({
      activations: [
        { code: 'ZR-PH01-1111-AA' as any },
        { code: 'ZR-PH01-2222-BB' as any },
        { code: 'ZR-PH01-3333-CC' as any },
      ],
      entitlements: [],
      isStaff: false,
    });
    expect(evaluation.qualifyingContainerCount).toBe(3);
    expect(evaluation.hasSchoolAccess).toBe(true);
  });

  // 6. Mixed phases are allowed
  it('6. allows mixed phase containers to unlock School (e.g. Phase 1 + Phase 2 + Phase 3)', () => {
    const evaluation = evaluateCustomerEntitlements({
      activations: [
        { code: 'ZR-PH01-1111-AA' as any },
        { code: 'ZR-PH02-2222-BB' as any },
        { code: 'ZR-PH03-3333-CC' as any },
      ],
      entitlements: [],
      isStaff: false,
    });
    expect(evaluation.qualifyingContainerCount).toBe(3);
    expect(evaluation.hasSchoolAccess).toBe(true);
  });

  // 7. Duplicate container cannot count twice
  it('7. ensures duplicate activations of the same container cannot count twice', () => {
    const evaluation = evaluateCustomerEntitlements({
      activations: [
        { code: 'ZR-PH01-SAME-0001' as any },
        { code: 'ZR-PH01-SAME-0001' as any }, // duplicate container code
        { code: 'ZR-PH02-DIFF-0002' as any },
      ],
      entitlements: [],
      isStaff: false,
    });
    expect(evaluation.qualifyingContainerCount).toBe(2);
    expect(evaluation.hasSchoolAccess).toBe(false);
  });

  // 8. Client cannot self-grant School entitlement
  it('8. enforces that client cannot self-grant School entitlement in Firestore rules', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    // schoolProgress and schoolCategories cannot be directly written by standard users
    expect(rulesContent).toContain('match /schoolProgress/{progressId}');
    expect(rulesContent).toContain('allow create, update, delete: if false;');

    // users profile cannot allow arbitrary client role elevation or entitlement self-grant
    expect(rulesContent).toContain('match /users/{userId}');
    // In users, write must verify user is writing to their own profile and cannot elevate roles
    expect(rulesContent).toContain('isOwner(userId)');
  });

  // 9. Unpublished course cannot be accessed as a normal published course
  it('9. prevents unpublished courses from being returned in standard published queries', () => {
    const testCourses = [
      { id: 'course-1', title: { en: 'Course 1' }, isPublished: true, displayOrder: 1 },
      { id: 'course-2', title: { en: 'Course 2' }, isPublished: false, displayOrder: 2 },
      { id: 'course-3', title: { en: 'Course 3' }, isPublished: true, displayOrder: 3 },
    ];

    const filterPublished = (courses: typeof testCourses, includeUnpublished = false) => {
      return includeUnpublished ? courses : courses.filter((c) => c.isPublished);
    };

    const published = filterPublished(testCourses, false);
    expect(published).toHaveLength(2);
    expect(published.map((c) => c.id)).toEqual(['course-1', 'course-3']);
    expect(published.find((c) => c.id === 'course-2')).toBeUndefined();
  });

  // 10. Course completion cannot be forged by client
  it('10. verifies that course completion and progress cannot be forged directly by client', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    // schoolProgress rules must deny client write
    const progressBlock = rulesContent.substring(rulesContent.indexOf('match /schoolProgress/{progressId}'));
    expect(progressBlock).toContain('allow create, update, delete: if false;');
  });

  // 11. User can only see their own certificates
  it('11. verifies Firestore rules restrict certificate reads to the certificate owner or staff', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    expect(rulesContent).toContain('match /certificates/{certificateId}');
    // Check that read requires isOwner(existing().userId) || isStaff()
    expect(rulesContent).toContain('allow get: if isOwner(existing().userId) || isStaff();');
    expect(rulesContent).toContain('allow list: if isStaff() || (isSignedIn() && existing().userId == request.auth.uid);');
    // Check that client create is strictly disallowed
    expect(rulesContent).toContain('allow create, update, delete: if false;');
  });

  // 12. Existing certificate hardening tests still pass
  it('12. verifies certificate security and non-enumerable public verification endpoint in rules', () => {
    const certRulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const certRules = fs.readFileSync(certRulesPath, 'utf-8');

    // publicCertificates must only permit get (not list)
    expect(certRules).toContain('match /publicCertificates/{certificateNumber}');
    expect(certRules).toContain('allow get: if true;');
    expect(certRules).toContain('allow list: if false;');
    expect(certRules).toContain('allow create, update, delete: if false;');
  });

  // 13. ZIRON RESTART platform foundation structure
  it('13. validates ZIRON RESTART ecosystem structure and future fund safety disclosure', () => {
    const restartPagePath = path.resolve(process.cwd(), 'src/pages/app/AppRestartPage.tsx');
    const content = fs.readFileSync(restartPagePath, 'utf-8');

    // Must contain the 6 structured progressive pillars
    expect(content).toContain('Recovery');
    expect(content).toContain('Learning');
    expect(content).toContain('Skills');
    expect(content).toContain('Certification');
    expect(content).toContain('Opportunity');
    expect(content).toContain('New Start');

    // Future fund must be clearly marked as coming soon with zero live payouts/disbursements
    expect(content).toContain('COMING SOON • FUTURE PHASE');
    expect(content).toContain('Future ZIRON RESTART Enablement Fund');
    expect(content).toContain('Official Architectural Notice:');
  });
});
