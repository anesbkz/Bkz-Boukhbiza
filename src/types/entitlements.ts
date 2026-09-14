/**
 * Entitlement Authority Architecture:
 * - AUTHORITATIVE: `entitlements` collection (checked directly via exists() in Firestore rules and queried by user).
 * - CACHE / UI ONLY: `UserProfile.communityAccess` and `UserProfile.schoolAccess` (hints for immediate local client display, never used as security boundary).
 */
export type EntitlementType = 'COMMUNITY_ACCESS' | 'SCHOOL_ACCESS' | 'PHASE_TRAJECTORY';

export type EntitlementStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

/**
 * Authoritative Entitlement Record
 * Stored in /entitlements/{userId}_{entitlementType} for deterministic idempotency.
 */
export interface EntitlementRecord {
  id: string;
  userId: string;
  entitlementType: EntitlementType;
  sourceProductSku: string;
  sourceCode: string;
  activationId: string;
  status: EntitlementStatus;
  grantedAt: string;
  expiresAt: string | null;
  grantedBy: string; // 'PRODUCT_ACTIVATION' | 'ADMIN_OVERRIDE'
}

export interface ProductCodeRecord {
  id: string;
  code: string;
  batchId: string;
  productSku: string;
  isActivated: boolean;
  activatedByUserId?: string;
  activatedAt?: string;
  grantsSchoolAccess: boolean;
  grantsCommunityAccess: boolean;
  createdAt: string;
}

export interface ActivationRecord {
  id: string;
  code: string;
  userId: string;
  productSku: string;
  activatedAt: string;
  entitlementsGranted: EntitlementType[];
}

/**
 * Non-enumerable public certificate record with zero PII
 * Stored in /publicCertificates/{certificateNumber}
 */
export interface PublicCertificateRecord {
  certificateNumber: string;
  recipientName: string;
  courseTitle: string;
  issuedAt: string;
  status: 'VALID' | 'REVOKED';
}

/**
 * Concurrency-safe post like record
 * Stored in /communityPostLikes/{postId}_{userId}
 */
export interface CommunityPostLikeRecord {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

