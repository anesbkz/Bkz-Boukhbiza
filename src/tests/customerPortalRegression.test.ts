import { describe, it, expect } from 'vitest';
import { CUSTOMER_NAV_ITEMS } from '@/components/shells/CustomerAppShell';
import { evaluateCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import { getProfileTranslations } from '@/lib/i18n/profileTranslations';

describe('Customer Portal Regression & Security Suite', () => {
  describe('1. Navigation — 9 Persistent Destinations & Arabic Labels', () => {
    it('always defines exactly nine customer navigation destinations', () => {
      expect(CUSTOMER_NAV_ITEMS).toHaveLength(9);
      const ids = CUSTOMER_NAV_ITEMS.map((item) => item.id);
      expect(ids).toEqual([
        'app',
        'app/journey',
        'app/products',
        'app/products/activate',
        'app/community',
        'app/school',
        'app/rewards',
        'app/certificates',
        'app/profile',
      ]);
    });

    it('faithfully matches the required Arabic navigation labels', () => {
      const arabicMap = Object.fromEntries(
        CUSTOMER_NAV_ITEMS.map((item) => [item.id, item.labelAr])
      );

      expect(arabicMap['app']).toBe('لوحة التحكم');
      expect(arabicMap['app/journey']).toBe('مساري');
      expect(arabicMap['app/products']).toBe('منتجاتي');
      expect(arabicMap['app/products/activate']).toBe('تفعيل عبوة');
      expect(arabicMap['app/community']).toBe('المجتمع');
      expect(arabicMap['app/school']).toBe('مدرسة Restart');
      expect(arabicMap['app/rewards']).toBe('المكافآت');
      expect(arabicMap['app/certificates']).toBe('الشهادات');
      expect(arabicMap['app/profile']).toBe('الملف الشخصي');
    });

    it('marks Community and School as gated rather than filtering them out', () => {
      const communityItem = CUSTOMER_NAV_ITEMS.find((i) => i.id === 'app/community');
      const schoolItem = CUSTOMER_NAV_ITEMS.find((i) => i.id === 'app/school');

      expect(communityItem).toBeDefined();
      expect(communityItem?.gatedBy).toBe('COMMUNITY_ACCESS');

      expect(schoolItem).toBeDefined();
      expect(schoolItem?.gatedBy).toBe('SCHOOL_ACCESS');
    });
  });

  describe('2. Authorization — School 3-Container & Entitlement Rules', () => {
    it('locks School when user has 0 containers', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [],
        isStaff: false,
        profile: null,
      });
      expect(result.qualifyingContainerCount).toBe(0);
      expect(result.hasSchoolAccess).toBe(false);
    });

    it('locks School when user has 1 container', () => {
      const result = evaluateCustomerEntitlements({
        activations: [{ code: 'ZIR-BOTTLE-01' }],
        entitlements: [],
        isStaff: false,
        profile: null,
      });
      expect(result.qualifyingContainerCount).toBe(1);
      expect(result.hasSchoolAccess).toBe(false);
    });

    it('locks School when user has 2 containers', () => {
      const result = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZIR-BOTTLE-01' },
          { code: 'ZIR-BOTTLE-02' },
        ],
        entitlements: [],
        isStaff: false,
        profile: null,
      });
      expect(result.qualifyingContainerCount).toBe(2);
      expect(result.hasSchoolAccess).toBe(false);
    });

    it('unlocks School when user has 3 distinct containers', () => {
      const result = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZIR-BOTTLE-01' },
          { code: 'ZIR-BOTTLE-02' },
          { code: 'ZIR-BOTTLE-03' },
        ],
        entitlements: [],
        isStaff: false,
        profile: null,
      });
      expect(result.qualifyingContainerCount).toBe(3);
      expect(result.hasSchoolAccess).toBe(true);
    });

    it('does NOT unlock School when 3 activations have duplicate codes (counts as 1 distinct container)', () => {
      const result = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZIR-BOTTLE-01' },
          { code: 'ZIR-BOTTLE-01' },
          { code: 'ZIR-BOTTLE-01' },
        ],
        entitlements: [],
        isStaff: false,
        profile: null,
      });
      expect(result.qualifyingContainerCount).toBe(1);
      expect(result.hasSchoolAccess).toBe(false);
    });

    it('does NOT unlock School when 3 activations have only 2 distinct codes', () => {
      const result = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZIR-BOTTLE-01' },
          { code: 'ZIR-BOTTLE-02' },
          { code: 'ZIR-BOTTLE-01' },
        ],
        entitlements: [],
        isStaff: false,
        profile: null,
      });
      expect(result.qualifyingContainerCount).toBe(2);
      expect(result.hasSchoolAccess).toBe(false);
    });

    it('MUST NOT unlock School if profile.schoolAccess = true alone without 3 containers or active entitlement', () => {
      const result = evaluateCustomerEntitlements({
        activations: [{ code: 'ZIR-BOTTLE-01' }],
        entitlements: [],
        isStaff: false,
        profile: { schoolAccess: true },
      });
      expect(result.qualifyingContainerCount).toBe(1);
      expect(result.hasSchoolAccess).toBe(false);
    });

    it('unlocks School when authoritative SCHOOL_ACCESS entitlement is ACTIVE', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [{ entitlementType: 'SCHOOL_ACCESS', status: 'ACTIVE' }],
        isStaff: false,
        profile: null,
      });
      expect(result.hasSchoolAccess).toBe(true);
    });

    it('locks School when authoritative SCHOOL_ACCESS entitlement is EXPIRED', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [{ entitlementType: 'SCHOOL_ACCESS', status: 'EXPIRED' }],
        isStaff: false,
        profile: null,
      });
      expect(result.hasSchoolAccess).toBe(false);
    });

    it('locks School when authoritative SCHOOL_ACCESS entitlement is REVOKED', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [{ entitlementType: 'SCHOOL_ACCESS', status: 'REVOKED' }],
        isStaff: false,
        profile: null,
      });
      expect(result.hasSchoolAccess).toBe(false);
    });

    it('unlocks School for staff members via staff bypass', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [],
        isStaff: true,
        profile: null,
      });
      expect(result.hasSchoolAccess).toBe(true);
    });
  });

  describe('3. Authorization — Community Entitlement Rules', () => {
    it('locks Community when user has no active COMMUNITY_ACCESS entitlement and is not staff', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [],
        isStaff: false,
        profile: null,
      });
      expect(result.hasCommunityAccess).toBe(false);
    });

    it('unlocks Community when authoritative COMMUNITY_ACCESS entitlement is ACTIVE', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [{ entitlementType: 'COMMUNITY_ACCESS', status: 'ACTIVE' }],
        isStaff: false,
        profile: null,
      });
      expect(result.hasCommunityAccess).toBe(true);
    });

    it('locks Community when authoritative COMMUNITY_ACCESS entitlement is EXPIRED', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [{ entitlementType: 'COMMUNITY_ACCESS', status: 'EXPIRED' }],
        isStaff: false,
        profile: null,
      });
      expect(result.hasCommunityAccess).toBe(false);
    });

    it('unlocks Community for staff members via staff bypass', () => {
      const result = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [],
        isStaff: true,
        profile: null,
      });
      expect(result.hasCommunityAccess).toBe(true);
    });
  });

  describe('4. Complete Arabic Localization Architecture', () => {
    const arabicApp = getAppTranslations('ar');
    const arabicProfile = getProfileTranslations('ar');

    it('contains all required Arabic sections without undefined values', () => {
      expect(arabicApp.common).toBeDefined();
      expect(arabicApp.shell).toBeDefined();
      expect(arabicApp.school).toBeDefined();
      expect(arabicApp.community).toBeDefined();
      expect(arabicApp.dashboard).toBeDefined();
      expect(arabicApp.journey).toBeDefined();
      expect(arabicApp.products).toBeDefined();
      expect(arabicApp.activate).toBeDefined();
      expect(arabicApp.rewards).toBeDefined();
      expect(arabicApp.certificates).toBeDefined();
    });

    it('contains valid non-empty Arabic strings for School 3-container rules', () => {
      expect(arabicApp.school.lockedTitle).toBeTruthy();
      expect(arabicApp.school.lockedDesc).toBeTruthy();
      expect(arabicApp.school.ruleExplanation).toContain('3');
      expect(arabicApp.school.zeroContainersMsg).toBeTruthy();
      expect(arabicApp.school.oneContainerMsg).toBeTruthy();
      expect(arabicApp.school.twoContainersMsg).toBeTruthy();
      expect(arabicApp.school.threeContainersMsg).toBeTruthy();
    });

    it('contains genuine Arabic characters in Arabic translations', () => {
      const arabicRegex = /[\u0600-\u06FF]/;
      expect(arabicRegex.test(arabicApp.shell.navSchool)).toBe(true);
      expect(arabicRegex.test(arabicApp.shell.navCommunity)).toBe(true);
      expect(arabicRegex.test(arabicApp.school.title)).toBe(true);
      expect(arabicRegex.test(arabicApp.community.title)).toBe(true);
      expect(arabicRegex.test(arabicProfile.personalInfo)).toBe(true);
      expect(arabicProfile.subjectDossier).toBe('ملف المشترك المعتمد');
    });
  });
});
