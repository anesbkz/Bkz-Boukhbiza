import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import {
  XP_VALUES,
  calculateLevel,
  calculateStreakUpdate,
  MILESTONES,
  BADGES,
  INITIAL_REWARDS,
} from './gamification';

admin.initializeApp();

/**
 * Authoritative Named Firestore Database
 * Connects to the designated named Firestore database for the VIREXON / ZIRON platform.
 */
export const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  'ai-studio-zironvirexonbios-f7d3e78d-aa70-4ff3-ae14-d8f7ce2b420b';

const db = getFirestore(FIRESTORE_DATABASE_ID);

// Server-authoritative bootstrap identity configuration.
// Sourced securely from environment variables or Firebase Functions runtime config.
// Never hard-coded. Never exposed to client-side code.
export function getBootstrapSuperAdminEmail(): string | null {
  const email = (
    process.env.BOOTSTRAP_SUPERADMIN_EMAIL ||
    functions.config()?.system?.bootstrap_email ||
    ''
  ).toLowerCase().trim();
  return email || null;
}

/**
 * Canonical Application Roles
 */
export const CANONICAL_APP_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'PRODUCT_MANAGER',
  'SCHOOL_MANAGER',
  'COMMUNITY_MANAGER',
  'CONTENT_MANAGER',
  'SECURITY_OFFICER',
  'AUDITOR',
  'CUSTOMER',
  'BETA_TESTER',
  'RESEARCH_PARTICIPANT',
] as const;

export type AppRole = (typeof CANONICAL_APP_ROLES)[number];

/**
 * Bootstrap Lifecycle Helper
 * 
 * 1. Initial State: No active user profile in `users` holds the `SUPER_ADMIN` role, and
 *    `_system/governance` does not indicate bootstrap completion.
 *    In this state, the configured BOOTSTRAP_SUPERADMIN_EMAIL with a verified email is permitted
 *    to invoke initializeBootstrapGovernance once to establish the initial permanent SUPER_ADMIN account.
 * 
 * 2. Permanent State: Once an active user profile possesses the SUPER_ADMIN role (or bootstrapCompleted
 *    is marked true in `_system/governance`), the bootstrap shortcut is PERMANENTLY DISABLED.
 *    Any subsequent authentication by the bootstrap email alone will NOT grant administrative authority;
 *    authorization strictly requires authoritative Firestore user roles (`users/{uid}.roles`) or custom claims.
 */
export async function isBootstrapModeAuthorized(
  callerEmail: string,
  isEmailVerified: boolean
): Promise<boolean> {
  if (!callerEmail || !isEmailVerified) return false;
  const targetBootstrapEmail = getBootstrapSuperAdminEmail();
  if (!targetBootstrapEmail) {
    // If BOOTSTRAP_SUPERADMIN_EMAIL is not configured, fail safely. Never guess or use a fallback.
    return false;
  }
  if (callerEmail.toLowerCase().trim() !== targetBootstrapEmail) return false;

  try {
    const govSnap = await db.collection('_system').doc('governance').get();
    if (govSnap.exists && govSnap.data()?.bootstrapCompleted === true) {
      return false; // Bootstrap path permanently closed
    }
  } catch {
    // Continue to database role check
  }

  const existingSuperAdmins = await db
    .collection('users')
    .where('roles', 'array-contains', 'SUPER_ADMIN')
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (!existingSuperAdmins.empty) {
    return false; // Permanent active SUPER_ADMIN already established; shortcut closed
  }

  return true;
}

/**
 * Authoritative Server-Side SUPER_ADMIN Check
 * Permanent authorization strictly comes from authoritative users/{uid}.roles in Firestore
 * (or Firebase custom claims).
 * The bootstrap identity is ONLY temporary initialization authority for initializeBootstrapGovernance.
 * Email matching alone MUST NEVER authorize SUPER_ADMIN on any administrative endpoint.
 */
export async function checkIsSuperAdmin(
  callerUid: string,
  callerRoles: string[],
  _callerEmail?: string,
  _isEmailVerified?: boolean
): Promise<boolean> {
  if (callerRoles && callerRoles.includes('SUPER_ADMIN')) {
    return true;
  }
  return false;
}

/**
 * Trusted Server-Side Audit Helper
 * Authoritative audit logs must ONLY be created by trusted server-side execution.
 * Captures verified server timestamp and authenticated caller identity.
 */
export interface ServerAuditParams {
  actorUserId: string;
  actorEmail?: string;
  actorRoles: string[];
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuthoritativeAuditLog(
  firestore: admin.firestore.Firestore,
  params: ServerAuditParams,
  transaction?: admin.firestore.Transaction
): Promise<string> {
  const auditDocRef = firestore.collection('auditLogs').doc();
  const auditData = {
    id: auditDocRef.id,
    actorUserId: params.actorUserId,
    actorEmail: params.actorEmail || 'unknown',
    actorRoles: params.actorRoles || [],
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    timestamp: new Date().toISOString(),
    metadata: {
      ...params.metadata,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  };

  if (transaction) {
    transaction.set(auditDocRef, auditData);
  } else {
    await auditDocRef.set(auditData);
  }
  return auditDocRef.id;
}

/**
 * Callable Function: Initial System Bootstrap
 * Used once to establish the initial permanent SUPER_ADMIN and permanently seal bootstrap mode.
 */
export const initializeBootstrapGovernance = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;

  const targetBootstrapEmail = getBootstrapSuperAdminEmail();
  if (!targetBootstrapEmail) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'System bootstrap configuration missing. BOOTSTRAP_SUPERADMIN_EMAIL environment variable is not configured.'
    );
  }

  const canBootstrap = await isBootstrapModeAuthorized(callerEmail, isEmailVerified);
  if (!canBootstrap) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Bootstrap initialization is only available during uninitialized system deployment.'
    );
  }

  const now = new Date().toISOString();
  const userDocRef = db.collection('users').doc(callerUid);
  const govDocRef = db.collection('_system').doc('governance');

  const batch = db.batch();
  batch.set(
    userDocRef,
    {
      roles: ['SUPER_ADMIN'],
      status: 'active',
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(govDocRef, {
    bootstrapCompleted: true,
    completedAt: now,
    initialSuperAdminUid: callerUid,
    initialSuperAdminEmail: callerEmail,
  });

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: ['SUPER_ADMIN'],
    action: 'BOOTSTRAP_INITIALIZED',
    resourceType: '_system',
    resourceId: 'governance',
    timestamp: now,
    metadata: {
      bootstrapEmail: callerEmail,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, message: 'Permanent SUPER_ADMIN established. Bootstrap path closed.' };
});

/**
 * Callable Function: Authoritative Server-Side Role Governance
 * Strictly validates caller privilege and prevents privilege escalation.
 * ONLY SUPER_ADMIN may assign, alter, or remove the SUPER_ADMIN role.
 * ADMIN cannot grant SUPER_ADMIN or modify any SUPER_ADMIN account.
 */
export const assignUserRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The caller must be authenticated to invoke role governance.'
    );
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const { targetUid, newRoles } = data;

  if (!targetUid || !Array.isArray(newRoles) || newRoles.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing or invalid targetUid or newRoles parameters. User must retain at least one role.'
    );
  }

  // Validate every requested role against the canonical AppRole list
  for (const r of newRoles) {
    if (!CANONICAL_APP_ROLES.includes(r as AppRole)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Role "${r}" is not a recognized canonical application role.`
      );
    }
  }

  // 1. Fetch caller's profile to establish authority
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile does not exist.');
  }
  const callerData = callerSnap.data();
  if (callerData?.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData?.roles || [];
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
  const isCallerAdmin = isCallerSuperAdmin || callerRoles.includes('ADMIN');

  if (!isCallerAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller does not possess administrative authority (CUSTOMER cannot manage roles).'
    );
  }

  // 2. Fetch target user profile
  const targetDocRef = db.collection('users').doc(targetUid);
  const targetSnap = await targetDocRef.get();
  if (!targetSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Target user profile does not exist.');
  }
  const targetData = targetSnap.data();
  const currentTargetRoles: string[] = targetData?.roles || [];

  // 3. Anti-escalation check: Only SUPER_ADMIN can alter SUPER_ADMIN or grant SUPER_ADMIN
  const targetIsSuperAdmin = currentTargetRoles.includes('SUPER_ADMIN');
  const grantingSuperAdmin = newRoles.includes('SUPER_ADMIN');

  if ((targetIsSuperAdmin || grantingSuperAdmin) && !isCallerSuperAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Privilege Escalation Guard: Only root SUPER_ADMIN may assign, promote, or alter the SUPER_ADMIN role.'
    );
  }

  const now = new Date().toISOString();

  // 4. Update Target User Profile in Firestore
  await targetDocRef.update({
    roles: newRoles,
    updatedAt: now,
  });

  // 5. Append immutable Audit Record via authoritative helper
  await writeAuthoritativeAuditLog(db, {
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'USER_ROLE_CHANGED',
    resourceType: 'users',
    resourceId: targetUid,
    metadata: {
      targetEmail: targetData?.email,
      previousRoles: currentTargetRoles,
      newRoles,
    },
  });

  return { success: true, targetUid, newRoles };
});

/**
 * Canonical Product Catalog SKUs supported for serial generation
 */
export const CANONICAL_CATALOG_SKUS: Record<
  string,
  { name: string; phasePrefix: string; phase: number }
> = {
  'ZR-PH01-30C': { name: 'ZIRON Phase 01 (30 Capsules)', phasePrefix: 'PH01', phase: 1 },
  'ZR-PH02-30C': { name: 'ZIRON Phase 02 (30 Capsules)', phasePrefix: 'PH02', phase: 2 },
  'ZR-PH03-30C': { name: 'ZIRON Phase 03 (30 Capsules)', phasePrefix: 'PH03', phase: 3 },
  'ZR-BNDL-90C': { name: 'ZIRON Complete Bundle (90 Capsules)', phasePrefix: 'BNDL', phase: 1 },
};

export const CROCKFORD_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Normalizes user-submitted or generated product codes.
 * Removes spaces, hyphens, and punctuation, and uppercases.
 */
export function normalizeProductCode(code: string): string {
  return (code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Generates an unambiguous random Crockford Base32 segment of specified length.
 * Uses cryptographically secure random bytes from Node.js crypto.
 */
export function generateCrockfordSegment(length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CROCKFORD_ALPHABET[bytes[i] % CROCKFORD_ALPHABET.length];
  }
  return result;
}

/**
 * Generates a human-readable, cryptographically secure ZIRON container serial.
 * Format: ZR-<PHASE>-<XXXX>-<XXXX>-<XXXX> (e.g., ZR-PH01-7K9A-3F2W-M8PX)
 */
export function generateSecureProductCode(phasePrefix: string): string {
  const seg1 = generateCrockfordSegment(4);
  const seg2 = generateCrockfordSegment(4);
  const seg3 = generateCrockfordSegment(4);
  return `ZR-${phasePrefix}-${seg1}-${seg2}-${seg3}`;
}

/**
 * Authoritative RBAC verification for product code and batch management.
 * Strictly verifies SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER roles from the server Firestore profile.
 */
async function assertCanManageCodes(
  context: functions.https.CallableContext
): Promise<{ callerUid: string; callerEmail: string; callerRoles: string[] }> {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('PRODUCT_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to manage product codes (requires SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER).'
    );
  }

  return { callerUid, callerEmail, callerRoles };
}

/**
 * Callable Function: Public Container Serial Verification
 * Returns non-sensitive public validation status, phase, batch, and sku.
 */
export const verifyContainerCode = functions.https.onCall(async (data) => {
  const rawCode = (data?.code || '').trim().toUpperCase();

  if (!rawCode || rawCode.length < 5 || rawCode.length > 64 || !/^[A-Z0-9-]+$/.test(rawCode)) {
    return {
      isValid: false,
      isAuthentic: false,
      message: 'Invalid or malformed product verification code format.',
    };
  }

  // Pre-locate product code document reference (supports direct docId, code field, or normalized code)
  const codeDocRef = db.collection('productCodes').doc(rawCode);
  let codeSnap = await codeDocRef.get();

  if (!codeSnap.exists) {
    const codeQuery = await db
      .collection('productCodes')
      .where('code', '==', rawCode)
      .limit(1)
      .get();
    if (codeQuery.empty) {
      const normalized = normalizeProductCode(rawCode);
      const normQuery = await db
        .collection('productCodes')
        .where('normalizedCode', '==', normalized)
        .limit(1)
        .get();
      if (normQuery.empty) {
        return {
          isValid: false,
          isAuthentic: false,
          message: `Product container code "${rawCode}" not found in serialization catalog.`,
        };
      }
      codeSnap = normQuery.docs[0];
    } else {
      codeSnap = codeQuery.docs[0];
    }
  }

  const codeData = codeSnap.data()!;
  const now = new Date().toISOString();

  // Check batch status if associated with a manufacturing batch
  let batchStatus: string | null = null;
  if (codeData.batchId) {
    const batchSnap = await db.collection('batches').doc(codeData.batchId).get();
    if (batchSnap.exists) {
      batchStatus = batchSnap.data()?.status || null;
    }
  }

  const isCodeDisabled = codeData.status === 'DISABLED' || codeData.status === 'REVOKED';
  const isBatchDisabled = batchStatus === 'DISABLED' || batchStatus === 'ARCHIVED';

  return {
    isValid: !isCodeDisabled && !isBatchDisabled,
    isAuthentic: true,
    isActivated: !!codeData.isActivated || codeData.status === 'ACTIVATED',
    status: codeData.status || (codeData.isActivated ? 'ACTIVATED' : 'UNUSED'),
    phase: codeData.phase || null,
    batchNumber: codeData.batchNumber || codeData.batchId || null,
    batchStatus,
    productSku: codeData.productSku || 'ZIRON Bio-Formulation',
    verificationId: crypto.randomBytes(6).toString('hex').toUpperCase(),
    verifiedAt: now,
  };
});

/**
 * Callable Function: Authoritative Product Code Activation & Entitlement Granting
 * CONCURRENCY-SAFE ATOMIC TRANSACTION:
 * 1. Locates product code inside transaction
 * 2. Verifies code is unactivated and not DISABLED/REVOKED
 * 3. Verifies parent batch is ACTIVE (not DISABLED or ARCHIVED)
 * 4. Marks code activated and increments batch activatedCodes
 * 5. Creates activation record
 * 6. Creates authoritative entitlements
 * 7. Updates user cache flags, XP (+50 XP), and level
 * 8. Writes authoritative activation audit log
 */
export const activateContainerCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to activate a product container code.'
    );
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const callerSnap = await db.collection('users').doc(callerUid).get();
  const callerRoles: string[] = callerSnap.data()?.roles || ['CUSTOMER'];
  const rawCode = (data?.code || '').trim().toUpperCase();

  if (!rawCode) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Product verification code is required.'
    );
  }

  // Pre-locate product code document reference (supports direct docId, field lookup, or normalizedCode)
  let codeDocRef = db.collection('productCodes').doc(rawCode);
  const directSnap = await codeDocRef.get();
  if (!directSnap.exists) {
    const codeQuery = await db
      .collection('productCodes')
      .where('code', '==', rawCode)
      .limit(1)
      .get();
    if (codeQuery.empty) {
      const normalized = normalizeProductCode(rawCode);
      const normQuery = await db
        .collection('productCodes')
        .where('normalizedCode', '==', normalized)
        .limit(1)
        .get();
      if (normQuery.empty) {
        throw new functions.https.HttpsError(
          'not-found',
          `Product container code "${rawCode}" is not registered in the VIREXON serialization catalog.`
        );
      }
      codeDocRef = normQuery.docs[0].ref;
    } else {
      codeDocRef = codeQuery.docs[0].ref;
    }
  }

  // Concurrency-safe atomic transaction
  return await db.runTransaction(async (transaction) => {
    const codeSnap = await transaction.get(codeDocRef);
    if (!codeSnap.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Product container code "${rawCode}" not found in serialization catalog.`
      );
    }

    const codeData = codeSnap.data()!;
    if (codeData.status === 'ACTIVATED' || codeData.isActivated) {
      throw new functions.https.HttpsError(
        'already-exists',
        'This container has already been activated.'
      );
    }

    if (codeData.status === 'DISABLED' || codeData.status === 'REVOKED') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `This container code is ${codeData.status.toLowerCase()} and cannot be activated.`
      );
    }

    // Read parent batch using batchId if present
    let batchDocRef: admin.firestore.DocumentReference | null = null;
    if (codeData.batchId) {
      batchDocRef = db.collection('batches').doc(codeData.batchId);
      const batchSnap = await transaction.get(batchDocRef);
      if (batchSnap.exists) {
        const batchData = batchSnap.data()!;
        if (batchData.status === 'DISABLED') {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'This manufacturing batch is currently on hold or disabled.'
          );
        }
        if (batchData.status === 'ARCHIVED') {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'This manufacturing batch has been archived.'
          );
        }
      }
    }

    // Authoritative qualification logic:
    // Restart School access requires THREE DIFFERENT PRODUCT CONTAINERS successfully activated by the SAME user.
    // Uniqueness is strictly based on distinct container/code identity (not phase, not SKU).
    // Retrieve user's existing activation records within the transaction to calculate distinct activated containers.
    const userActivationsQuery = db.collection('activations').where('userId', '==', callerUid);
    const existingActivationsSnap = await transaction.get(userActivationsQuery);

    const distinctContainerCodes = new Set<string>();
    existingActivationsSnap.docs.forEach((doc) => {
      const codeVal = (doc.data().code || '').trim().toUpperCase();
      if (codeVal) {
        distinctContainerCodes.add(codeVal);
      }
    });
    // Add current container being activated
    distinctContainerCodes.add(codeData.code || rawCode);
    const qualifyingContainerCount = distinctContainerCodes.size;

    // Check if user already holds an earned SCHOOL_ACCESS entitlement (Earned Access Rule)
    // Once unlocked, School access is earned and not revoked by subsequent product state changes.
    const schoolEntDocRef = db.collection('entitlements').doc(`${callerUid}_SCHOOL_ACCESS`);
    const schoolEntSnap = await transaction.get(schoolEntDocRef);
    const hasEarnedSchoolAccess = schoolEntSnap.exists && schoolEntSnap.data()?.status === 'ACTIVE';

    const qualifiesForSchool = qualifyingContainerCount >= 3 || hasEarnedSchoolAccess;

    // Read current user document inside transaction for atomic XP and reward calculation
    const userDocRef = db.collection('users').doc(callerUid);
    const userSnap = await transaction.get(userDocRef);
    const userData = userSnap.exists ? userSnap.data() : null;
    const currentXp = typeof userData?.xp === 'number' ? userData.xp : 0;
    const awardedXp = XP_VALUES.PRODUCT_ACTIVATED; // 50 XP
    const totalXp = currentXp + awardedXp;
    const levelProgress = calculateLevel(totalXp);
    const level = levelProgress.currentLevel;

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const productSku = codeData.productSku || 'VIR-CONTAINER-DEFAULT';
    const activationDocRef = db.collection('activations').doc();

    // Streak calculation
    const currentStreak = typeof userData?.currentStreak === 'number' ? userData.currentStreak : 0;
    const longestStreak = typeof userData?.longestStreak === 'number' ? userData.longestStreak : 0;
    const lastActivityDate = userData?.lastActivityDate || null;
    const streakUpdate = calculateStreakUpdate(currentStreak, longestStreak, lastActivityDate, today);

    // 1. Mark code as activated (permanently bound to callerUid)
    transaction.update(codeDocRef, {
      status: 'ACTIVATED',
      isActivated: true,
      activatedByUserId: callerUid,
      activatedAt: now,
      activationId: activationDocRef.id,
      updatedAt: now,
    });

    // Increment parent batch's activatedCodes if batch exists
    if (batchDocRef) {
      transaction.update(batchDocRef, {
        activatedCodes: admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      });
    }

    // 2. Base container entitlements granted on every container
    const entitlementsToGrant: string[] = ['COMMUNITY_ACCESS', 'PHASE_TRAJECTORY'];
    if (qualifiesForSchool) {
      entitlementsToGrant.push('SCHOOL_ACCESS');
    }

    // 3. Create activation record
    transaction.set(activationDocRef, {
      id: activationDocRef.id,
      code: codeData.code || rawCode,
      normalizedCode: codeData.normalizedCode || normalizeProductCode(rawCode),
      userId: callerUid,
      productSku,
      batchId: codeData.batchId || null,
      batchNumber: codeData.batchNumber || null,
      activatedAt: now,
      entitlementsGranted: entitlementsToGrant,
      qualifyingContainerCount,
    });

    // 4. Create/update Authoritative Entitlement records for container perks
    for (const entType of ['COMMUNITY_ACCESS', 'PHASE_TRAJECTORY']) {
      const entDocRef = db.collection('entitlements').doc(`${callerUid}_${entType}`);
      transaction.set(entDocRef, {
        id: `${callerUid}_${entType}`,
        userId: callerUid,
        entitlementType: entType,
        sourceProductSku: productSku,
        sourceCode: codeData.code || rawCode,
        activationId: activationDocRef.id,
        status: 'ACTIVE',
        grantedAt: now,
        expiresAt: null,
        grantedBy: 'PRODUCT_ACTIVATION',
      }, { merge: true });
    }

    // 5. Authoritatively manage SCHOOL_ACCESS entitlement
    if (qualifiesForSchool) {
      transaction.set(schoolEntDocRef, {
        id: `${callerUid}_SCHOOL_ACCESS`,
        userId: callerUid,
        entitlementType: 'SCHOOL_ACCESS',
        sourceProductSku: productSku,
        sourceCode: codeData.code || rawCode,
        source: 'THREE_CONTAINERS',
        activationId: activationDocRef.id,
        status: 'ACTIVE',
        grantedAt: schoolEntSnap.exists && schoolEntSnap.data()?.grantedAt ? schoolEntSnap.data()?.grantedAt : now,
        unlockedAt: schoolEntSnap.exists && schoolEntSnap.data()?.unlockedAt ? schoolEntSnap.data()?.unlockedAt : now,
        expiresAt: null,
        grantedBy: 'THREE_CONTAINERS',
        qualifyingContainerCount,
      }, { merge: true });
    }

    // 6. Record immutable XP ledger transaction
    const xpTxRef = db.collection('xpTransactions').doc(`xp_act_${activationDocRef.id}`);
    transaction.set(xpTxRef, {
      id: xpTxRef.id,
      userId: callerUid,
      amount: awardedXp,
      type: 'EARNED',
      source: 'PRODUCT_ACTIVATED',
      sourceId: activationDocRef.id,
      createdAt: now,
      metadata: {
        code: codeData.code || rawCode,
        productSku,
        qualifyingContainerCount,
      },
    });

    // 7. Deterministic Milestones & Badges
    const milestoneFirstProdRef = db.collection('userMilestones').doc(`${callerUid}_FIRST_PRODUCT`);
    transaction.set(milestoneFirstProdRef, {
      id: `${callerUid}_FIRST_PRODUCT`,
      userId: callerUid,
      milestoneKey: 'FIRST_PRODUCT',
      title: MILESTONES.FIRST_PRODUCT.title,
      description: MILESTONES.FIRST_PRODUCT.description,
      achievedAt: now,
    }, { merge: true });

    const badgeFirstStepRef = db.collection('userBadges').doc(`${callerUid}_FIRST_STEP`);
    transaction.set(badgeFirstStepRef, {
      id: `${callerUid}_FIRST_STEP`,
      userId: callerUid,
      badgeKey: 'FIRST_STEP',
      name: BADGES.FIRST_STEP.name,
      description: BADGES.FIRST_STEP.description,
      icon: BADGES.FIRST_STEP.icon,
      requirement: BADGES.FIRST_STEP.requirement,
      awardedAt: now,
    }, { merge: true });

    if (qualifyingContainerCount >= 3) {
      const milestoneThreeRef = db.collection('userMilestones').doc(`${callerUid}_THREE_PRODUCTS`);
      transaction.set(milestoneThreeRef, {
        id: `${callerUid}_THREE_PRODUCTS`,
        userId: callerUid,
        milestoneKey: 'THREE_PRODUCTS',
        title: MILESTONES.THREE_PRODUCTS.title,
        description: MILESTONES.THREE_PRODUCTS.description,
        achievedAt: now,
      }, { merge: true });
    }

    if (qualifiesForSchool) {
      const milestoneSchoolRef = db.collection('userMilestones').doc(`${callerUid}_SCHOOL_UNLOCKED`);
      transaction.set(milestoneSchoolRef, {
        id: `${callerUid}_SCHOOL_UNLOCKED`,
        userId: callerUid,
        milestoneKey: 'SCHOOL_UNLOCKED',
        title: MILESTONES.SCHOOL_UNLOCKED.title,
        description: MILESTONES.SCHOOL_UNLOCKED.description,
        achievedAt: now,
      }, { merge: true });

      const badgeSchoolRef = db.collection('userBadges').doc(`${callerUid}_SCHOOL_READY`);
      transaction.set(badgeSchoolRef, {
        id: `${callerUid}_SCHOOL_READY`,
        userId: callerUid,
        badgeKey: 'SCHOOL_READY',
        name: BADGES.SCHOOL_READY.name,
        description: BADGES.SCHOOL_READY.description,
        icon: BADGES.SCHOOL_READY.icon,
        requirement: BADGES.SCHOOL_READY.requirement,
        awardedAt: now,
      }, { merge: true });
    }

    if (streakUpdate.currentStreak >= 7) {
      const badgeCommittedRef = db.collection('userBadges').doc(`${callerUid}_COMMITTED`);
      transaction.set(badgeCommittedRef, {
        id: `${callerUid}_COMMITTED`,
        userId: callerUid,
        badgeKey: 'COMMITTED',
        name: BADGES.COMMITTED.name,
        description: BADGES.COMMITTED.description,
        icon: BADGES.COMMITTED.icon,
        requirement: BADGES.COMMITTED.requirement,
        awardedAt: now,
      }, { merge: true });
    }

    if (streakUpdate.currentStreak >= 30) {
      const badgeDiscRef = db.collection('userBadges').doc(`${callerUid}_DISCIPLINED`);
      transaction.set(badgeDiscRef, {
        id: `${callerUid}_DISCIPLINED`,
        userId: callerUid,
        badgeKey: 'DISCIPLINED',
        name: BADGES.DISCIPLINED.name,
        description: BADGES.DISCIPLINED.description,
        icon: BADGES.DISCIPLINED.icon,
        requirement: BADGES.DISCIPLINED.requirement,
        awardedAt: now,
      }, { merge: true });
    }

    // 8. Update user profile quick access flags and reward/XP state
    transaction.set(userDocRef, {
      communityAccess: true,
      schoolAccess: qualifiesForSchool,
      qualifyingContainerCount,
      xp: totalXp,
      level,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastActivityDate: today,
      updatedAt: now,
    }, { merge: true });

    // 9. Sync userGamification document
    const gamificationRef = db.collection('userGamification').doc(callerUid);
    transaction.set(gamificationRef, {
      userId: callerUid,
      xp: totalXp,
      level,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastActivityDate: today,
      updatedAt: now,
    }, { merge: true });

    // 10. Authoritative activation audit log
    const auditDocRef = db.collection('auditLogs').doc();
    transaction.set(auditDocRef, {
      id: auditDocRef.id,
      actorUserId: callerUid,
      actorEmail: callerEmail,
      actorRoles: callerRoles,
      action: 'PRODUCT_CODE_ACTIVATED',
      resourceType: 'productCodes',
      resourceId: codeDocRef.id,
      timestamp: now,
      metadata: {
        code: codeData.code || rawCode,
        productSku,
        batchId: codeData.batchId || null,
        batchNumber: codeData.batchNumber || null,
        activationId: activationDocRef.id,
        qualifyingContainerCount,
        schoolUnlocked: qualifiesForSchool,
        xpAwarded: awardedXp,
        totalXp,
        level,
        currentStreak: streakUpdate.currentStreak,
        longestStreak: streakUpdate.longestStreak,
        enforcedBy: 'SERVER_TRANSACTION',
      },
    });

    return {
      success: true,
      activationId: activationDocRef.id,
      entitlements: entitlementsToGrant,
      qualifyingContainerCount,
      schoolUnlocked: qualifiesForSchool,
      xpAwarded: awardedXp,
      totalXp,
      level,
    };
  });
});

/**
 * Callable Function: Cryptographically Secure Product Code Generation
 * Generates unique, Crockford Base32-formatted serialization serials for containers.
 * Restricts access to SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER.
 * Validates batch existence and active status.
 * Updates batch totalCodes atomically.
 */
export const generateProductCodes = functions.https.onCall(async (data, context) => {
  const { callerUid, callerEmail, callerRoles } = await assertCanManageCodes(context);

  const { quantity, productSku, batchId } = data || {};

  // 1. Validate quantity
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Quantity must be an integer between 1 and 500.'
    );
  }

  // 2. Validate productSku
  if (!productSku || typeof productSku !== 'string' || !CANONICAL_CATALOG_SKUS[productSku]) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Product SKU "${productSku}" is not recognized in the canonical catalog. Allowed: ${Object.keys(CANONICAL_CATALOG_SKUS).join(', ')}`
    );
  }

  // 3. Validate batchId and batch ACTIVE status
  if (!batchId || typeof batchId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid batchId is required.');
  }

  const batchDocRef = db.collection('batches').doc(batchId);
  const batchSnap = await batchDocRef.get();
  if (!batchSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Batch "${batchId}" does not exist.`);
  }

  const batchData = batchSnap.data()!;
  if (batchData.status !== 'ACTIVE') {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `Batch "${batchId}" is not ACTIVE (current status: ${batchData.status}). Codes can only be generated for ACTIVE batches.`
    );
  }

  const skuConfig = CANONICAL_CATALOG_SKUS[productSku];

  // 4. Cryptographically generate unique codes (in-memory candidate generation)
  const generatedCodes = new Set<string>();
  const codeItems: { code: string; normalizedCode: string }[] = [];

  while (codeItems.length < quantity) {
    const code = generateSecureProductCode(skuConfig.phasePrefix);
    const normalized = normalizeProductCode(code);
    if (!generatedCodes.has(normalized)) {
      generatedCodes.add(normalized);
      codeItems.push({ code, normalizedCode: normalized });
    }
  }

  // 5. Check collisions against existing productCodes in Firestore
  const validCodeItems: { code: string; normalizedCode: string }[] = [];
  const candidateDocRefs = codeItems.map((item) => db.collection('productCodes').doc(item.code));

  // Chunk reads to respect Firestore getAll limits
  const CHUNK_READ_SIZE = 100;
  const existingSnapshots: admin.firestore.DocumentSnapshot[] = [];
  for (let i = 0; i < candidateDocRefs.length; i += CHUNK_READ_SIZE) {
    const chunk = candidateDocRefs.slice(i, i + CHUNK_READ_SIZE);
    const snaps = await db.getAll(...chunk);
    existingSnapshots.push(...snaps);
  }

  for (let i = 0; i < existingSnapshots.length; i++) {
    if (!existingSnapshots[i].exists) {
      validCodeItems.push(codeItems[i]);
    } else {
      // Collision detected! Regenerate unique replacement
      let replacementFound = false;
      while (!replacementFound) {
        const repCode = generateSecureProductCode(skuConfig.phasePrefix);
        const repNorm = normalizeProductCode(repCode);
        if (!generatedCodes.has(repNorm)) {
          generatedCodes.add(repNorm);
          const repSnap = await db.collection('productCodes').doc(repCode).get();
          if (!repSnap.exists) {
            validCodeItems.push({ code: repCode, normalizedCode: repNorm });
            replacementFound = true;
          }
        }
      }
    }
  }

  const now = new Date().toISOString();
  const codeDocs = validCodeItems.map((item) => ({
    id: item.code,
    code: item.code,
    normalizedCode: item.normalizedCode,
    productSku,
    phase: skuConfig.phase,
    batchId,
    batchNumber: batchData.batchNumber || batchId,
    status: 'UNUSED',
    isActivated: false,
    activatedByUserId: null,
    activatedAt: null,
    activationId: null,
    grantsSchoolAccess: true,
    grantsCommunityAccess: true,
    createdAt: now,
    createdBy: callerUid,
    exportCount: 0,
    lastExportedAt: null,
  }));

  // 6. Commit documents in safe chunks of 400 (under Firestore's 500-op batch write limit)
  const WRITE_CHUNK_SIZE = 400;
  for (let i = 0; i < codeDocs.length; i += WRITE_CHUNK_SIZE) {
    const chunk = codeDocs.slice(i, i + WRITE_CHUNK_SIZE);
    const batchWrite = db.batch();
    for (const docData of chunk) {
      batchWrite.set(db.collection('productCodes').doc(docData.id), docData);
    }
    await batchWrite.commit();
  }

  // 7. Atomically increment batch totalCodes count
  await batchDocRef.update({
    totalCodes: admin.firestore.FieldValue.increment(quantity),
    updatedAt: now,
  });

  // 8. Write authoritative audit log
  await writeAuthoritativeAuditLog(db, {
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'PRODUCT_CODES_GENERATED',
    resourceType: 'productCodes',
    resourceId: batchId,
    metadata: {
      batchId,
      batchNumber: batchData.batchNumber || batchId,
      productSku,
      quantity,
      sampleCodes: codeDocs.slice(0, 3).map((d) => d.code),
    },
  });

  return {
    success: true,
    batchId,
    batchNumber: batchData.batchNumber || batchId,
    productSku,
    quantity,
    codes: codeDocs.map((d) => d.code),
  };
});

/**
 * Callable Function: Authoritative Manufacturing Batch Creation
 * Initializes a new manufacturing batch record with status ACTIVE and 0 initial codes.
 * Requires SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER role.
 */
export const createProductBatch = functions.https.onCall(async (data, context) => {
  const { callerUid, callerEmail, callerRoles } = await assertCanManageCodes(context);

  const {
    productSku,
    batchNumber: rawBatchNumber,
    manufactureDate,
    expiryDate,
    notes,
    coaUrl,
  } = data || {};

  if (!productSku || typeof productSku !== 'string' || !CANONICAL_CATALOG_SKUS[productSku]) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Valid productSku from catalog is required. Allowed: ${Object.keys(CANONICAL_CATALOG_SKUS).join(', ')}`
    );
  }

  const batchNumber = (rawBatchNumber || '').trim().toUpperCase();
  if (!batchNumber || batchNumber.length < 3) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid batchNumber is required (minimum 3 characters).'
    );
  }

  if (!manufactureDate || typeof manufactureDate !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid manufactureDate is required.'
    );
  }

  if (!expiryDate || typeof expiryDate !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid expiryDate is required.'
    );
  }

  // Ensure unique batchNumber across batches collection
  const existingBatchQuery = await db
    .collection('batches')
    .where('batchNumber', '==', batchNumber)
    .limit(1)
    .get();

  if (!existingBatchQuery.empty) {
    throw new functions.https.HttpsError(
      'already-exists',
      `Batch with batchNumber "${batchNumber}" already exists.`
    );
  }

  const batchRef = db.collection('batches').doc();
  const now = new Date().toISOString();
  const skuInfo = CANONICAL_CATALOG_SKUS[productSku];

  const batchDoc = {
    id: batchRef.id,
    batchNumber,
    productSku,
    productName: skuInfo.name,
    manufactureDate,
    expiryDate,
    status: 'ACTIVE',
    testingStatus: 'PENDING',
    totalCodes: 0,
    activatedCodes: 0,
    disabledCodes: 0,
    notes: typeof notes === 'string' ? notes.trim() : '',
    coaUrl: typeof coaUrl === 'string' ? coaUrl.trim() : null,
    createdAt: now,
    createdBy: callerUid,
    updatedAt: now,
  };

  await batchRef.set(batchDoc);

  await writeAuthoritativeAuditLog(db, {
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'BATCH_CREATED',
    resourceType: 'batches',
    resourceId: batchRef.id,
    metadata: {
      batchId: batchRef.id,
      batchNumber,
      productSku,
      productName: skuInfo.name,
      manufactureDate,
      expiryDate,
    },
  });

  return {
    success: true,
    batchId: batchRef.id,
    batchNumber,
    productSku,
    status: 'ACTIVE',
  };
});

/**
 * Callable Function: Authoritative Batch Status Transition
 * Allows SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER to transition batch status between ACTIVE, DISABLED, and ARCHIVED.
 * Centralized batch status protects all child codes without modifying every code document individually.
 */
export const updateBatchStatus = functions.https.onCall(async (data, context) => {
  const { callerUid, callerEmail, callerRoles } = await assertCanManageCodes(context);

  const { batchId, status } = data || {};

  if (!batchId || typeof batchId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid batchId is required.');
  }

  const allowedStatuses = ['ACTIVE', 'DISABLED', 'ARCHIVED'];
  if (!status || !allowedStatuses.includes(status)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Invalid status "${status}". Allowed: ${allowedStatuses.join(', ')}`
    );
  }

  const batchRef = db.collection('batches').doc(batchId);
  const batchSnap = await batchRef.get();
  if (!batchSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Batch "${batchId}" not found.`);
  }

  const batchData = batchSnap.data()!;
  const previousStatus = batchData.status;

  if (previousStatus === status) {
    return {
      success: true,
      batchId,
      previousStatus,
      newStatus: status,
      message: 'Status unchanged.',
    };
  }

  const now = new Date().toISOString();
  await batchRef.update({
    status,
    updatedAt: now,
    updatedBy: callerUid,
  });

  await writeAuthoritativeAuditLog(db, {
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'BATCH_STATUS_CHANGED',
    resourceType: 'batches',
    resourceId: batchId,
    metadata: {
      batchId,
      batchNumber: batchData.batchNumber || batchId,
      previousStatus,
      newStatus: status,
    },
  });

  return {
    success: true,
    batchId,
    previousStatus,
    newStatus: status,
  };
});

/**
 * Callable Function: Concurrency-Safe Community Post Liking
 * Deterministic single-like record at communityPostLikes/{postId_userId}.
 * Aggregate likesCount on communityPosts is managed exclusively by this server-side transaction.
 */
export const togglePostLike = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const postId = data.postId;
  if (!postId || typeof postId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid postId is required.');
  }

  const likeDocId = `${postId}_${callerUid}`;
  const likeDocRef = db.collection('communityPostLikes').doc(likeDocId);
  const postDocRef = db.collection('communityPosts').doc(postId);

  return await db.runTransaction(async (transaction) => {
    const postSnap = await transaction.get(postDocRef);
    if (!postSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Community post not found.');
    }

    const postData = postSnap.data()!;
    const currentLikes = typeof postData.likesCount === 'number' ? postData.likesCount : 0;
    const likeSnap = await transaction.get(likeDocRef);
    const now = new Date().toISOString();

    if (likeSnap.exists) {
      // User already liked -> unlike
      transaction.delete(likeDocRef);
      const newCount = Math.max(0, currentLikes - 1);
      transaction.update(postDocRef, { likesCount: newCount, updatedAt: now });
      return { liked: false, likesCount: newCount };
    } else {
      // User has not liked -> like
      transaction.set(likeDocRef, {
        id: likeDocId,
        postId,
        userId: callerUid,
        createdAt: now,
      });
      const newCount = currentLikes + 1;
      transaction.update(postDocRef, { likesCount: newCount, updatedAt: now });
      return { liked: true, likesCount: newCount };
    }
  });
});

/**
 * Callable Function: Authoritative Certificate Issuance
 * Writes full credential to /certificates and minimal non-enumerable public verification
 * record to /publicCertificates/{certNumber}.
 */
export const issueCertificate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  if (!isCallerSuperAdmin && !callerRoles.includes('SCHOOL_MANAGER') && !callerRoles.includes('ADMIN')) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only School Managers or Administrators may issue certificates.'
    );
  }

  const { targetUserId, courseId, recipientName, courseTitle } = data;
  if (!targetUserId || !courseId || !recipientName || !courseTitle) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required certificate issuance fields.');
  }

  // 1. Verify target user existence
  const targetUserSnap = await db.collection('users').doc(targetUserId).get();
  if (!targetUserSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Target student "${targetUserId}" does not exist.`);
  }

  // 2. Authoritatively validate course existence in schoolCourses (reject non-existent courses)
  const courseDocRef = db.collection('schoolCourses').doc(courseId);
  const courseSnap = await courseDocRef.get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `School course "${courseId}" does not exist in curriculum.`);
  }

  // 3. Prevent duplicate certificate issuance or reissuing revoked certificate
  const certificateId = `cert_${targetUserId}_${courseId}`;
  const certRef = db.collection('certificates').doc(certificateId);

  // Fast check: if certificate exists
  const existingCertSnap = await certRef.get();
  if (existingCertSnap.exists) {
    const existingData = existingCertSnap.data()!;
    if (existingData.status === 'REVOKED' || existingData.isRevoked) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `A certificate for student "${targetUserId}" on course "${courseId}" has been revoked by institutional authority and cannot be reissued.`
      );
    }
    return {
      success: true,
      certificateId: existingData.id || certificateId,
      certificateNumber: existingData.certificateNumber,
      alreadyIssued: true,
    };
  }

  const now = new Date().toISOString();
  const issuer = 'ZIRON Restart School - Virexon Biosciences Education Division';

  // Atomic transaction to guarantee collision check and concurrency safety
  const result = await db.runTransaction(async (transaction) => {
    const txCertSnap = await transaction.get(certRef);
    if (txCertSnap.exists) {
      const existingData = txCertSnap.data()!;
      if (existingData.status === 'REVOKED' || existingData.isRevoked) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `A certificate for student "${targetUserId}" on course "${courseId}" has been revoked by institutional authority and cannot be reissued.`
        );
      }
      return {
        success: true,
        certificateId: existingData.id || certificateId,
        certificateNumber: existingData.certificateNumber,
        alreadyIssued: true,
      };
    }

    let candidateNumber = generateCertificateNumber();
    let pubRef = db.collection('publicCertificates').doc(candidateNumber);
    let pubSnap = await transaction.get(pubRef);
    let collisionAttempts = 0;
    while (pubSnap.exists && collisionAttempts < 5) {
      candidateNumber = generateCertificateNumber();
      pubRef = db.collection('publicCertificates').doc(candidateNumber);
      pubSnap = await transaction.get(pubRef);
      collisionAttempts++;
    }

    if (pubSnap.exists) {
      throw new functions.https.HttpsError('already-exists', 'Certificate number collision encountered. Please retry.');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationUrl = `/verify/certificate?number=${candidateNumber}`;

    const certDoc = {
      id: certificateId,
      certificateId,
      certificateNumber: candidateNumber,
      userId: targetUserId,
      recipientName,
      userDisplayName: recipientName,
      courseId,
      courseTitle,
      issuedAt: now,
      issueDate: now,
      issuedByUid: callerUid,
      completedAt: now,
      issuer,
      status: 'ACTIVE',
      isRevoked: false,
      verificationToken,
      verificationHash: verificationToken,
      verificationUrl,
      certificateType: 'COURSE_COMPLETION',
      createdAt: now,
      updatedAt: now,
      revokedAt: null,
      revocationReason: null,
      revokedBy: null,
    };

    const publicCertDoc = {
      certificateNumber: candidateNumber,
      status: 'ACTIVE',
      courseTitle,
      courseId,
      recipientName,
      completedAt: now,
      issuedAt: now,
      issuer,
      certificateType: 'COURSE_COMPLETION',
      createdAt: now,
      updatedAt: now,
      revokedAt: null,
      revocationReason: null,
    };

    transaction.set(certRef, certDoc);
    transaction.set(pubRef, publicCertDoc);

    const auditRef = db.collection('auditLogs').doc();
    transaction.set(auditRef, {
      id: auditRef.id,
      actorUserId: callerUid,
      actorEmail: callerEmail,
      actorRoles: callerRoles,
      action: 'CERTIFICATE_ISSUED',
      resourceType: 'certificates',
      resourceId: certificateId,
      timestamp: now,
      metadata: {
        certificateNumber: candidateNumber,
        targetUserId,
        courseId,
        recipientName,
        enforcedBy: 'SERVER_AUTHORITY',
      },
    });

    return {
      success: true,
      certificateId,
      certificateNumber: candidateNumber,
    };
  });

  return result;
});

/**
 * Callable Function: Administrative Community Announcement Creation
 * Authoritative path ensuring validation and immediate audit logging.
 */
export const createCommunityAnnouncement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data();
  if (callerData?.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Account is not active.');
  }

  const callerRoles: string[] = callerData?.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to create announcements (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).'
    );
  }

  const { title, content, body, tags = [], isPinned = false } = data;
  if (!title) {
    throw new functions.https.HttpsError('invalid-argument', 'Announcement title is required.');
  }
  const announcementBody = content || body;
  if (!announcementBody) {
    throw new functions.https.HttpsError('invalid-argument', 'Announcement body is required.');
  }

  const now = new Date().toISOString();
  const announcementRef = db.collection('communityAnnouncements').doc();
  const announcementDoc = {
    id: announcementRef.id,
    title,
    content: announcementBody,
    body: announcementBody,
    tags: Array.isArray(tags) ? tags : [],
    isPinned: Boolean(isPinned),
    authorId: callerUid,
    authorName: callerData.displayName || callerEmail || 'Staff',
    authorRoles: callerRoles,
    status: 'published',
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(announcementRef, announcementDoc);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_ANNOUNCEMENT_CREATED',
    resourceType: 'communityAnnouncements',
    resourceId: announcementRef.id,
    timestamp: now,
    metadata: {
      isPinned: Boolean(isPinned),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, id: announcementRef.id };
});

/**
 * Callable Function: Authoritative Community Post Moderation
 * Updates status, lock, and pin fields, and writes authoritative audit logs.
 */
export const moderateCommunityPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data();
  if (callerData?.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Account is not active.');
  }

  const callerRoles: string[] = callerData?.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to moderate posts (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).'
    );
  }

  const { postId, newStatus, isLocked, isPinned } = data;
  const allowedStatuses = ['published', 'hidden', 'flagged'];
  if (!postId || (newStatus && !allowedStatuses.includes(newStatus))) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid postId or newStatus.');
  }

  const postRef = db.collection('communityPosts').doc(postId);
  const postSnap = await postRef.get();
  if (!postSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Post "${postId}" does not exist.`);
  }
  const existingPost = postSnap.data()!;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    updatedAt: now,
    moderatedBy: callerUid,
    moderatedAt: now,
  };

  if (newStatus) updates.status = newStatus;
  if (typeof isLocked === 'boolean') updates.isLocked = isLocked;
  if (typeof isPinned === 'boolean') updates.isPinned = isPinned;

  const batch = db.batch();
  batch.update(postRef, updates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_POST_MODERATED',
    resourceType: 'communityPosts',
    resourceId: postId,
    timestamp: now,
    metadata: {
      previousStatus: existingPost.status,
      newStatus: updates.status || existingPost.status,
      isLocked: updates.isLocked,
      isPinned: updates.isPinned,
      authorId: existingPost.authorId,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, postId, updates };
});

/**
 * Callable Function: Authoritative Community Report Resolution
 */
export const resolveCommunityReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data();
  if (callerData?.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Account is not active.');
  }

  const callerRoles: string[] = callerData?.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to resolve community reports.'
    );
  }

  const { reportId, status, notes = '' } = data;
  const allowedStatuses = ['RESOLVED', 'DISMISSED', 'INVESTIGATING'];
  if (!reportId || !allowedStatuses.includes(status)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid reportId or status.');
  }

  const reportRef = db.collection('communityReports').doc(reportId);
  const reportSnap = await reportRef.get();
  if (!reportSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Report "${reportId}" does not exist.`);
  }
  const existingReport = reportSnap.data()!;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    status,
    resolvedBy: callerUid,
    resolvedAt: now,
    resolutionNotes: notes,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.update(reportRef, updates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_REPORT_RESOLVED',
    resourceType: 'communityReports',
    resourceId: reportId,
    timestamp: now,
    metadata: {
      targetType: existingReport.targetType,
      targetId: existingReport.targetId,
      reporterUserId: existingReport.reporterUserId,
      resolutionStatus: status,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, reportId, status };
});

/**
 * Callable Function: Administrative Account Status Governance
 */
export const updateUserStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
  const isCallerAdmin = isCallerSuperAdmin || callerRoles.includes('ADMIN') || callerRoles.includes('SECURITY_OFFICER');

  if (!isCallerAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks MANAGE_USERS permission.');
  }

  const { targetUid, newStatus } = data;
  const validStatuses = ['active', 'pending', 'suspended', 'archived'];
  if (!targetUid || !validStatuses.includes(newStatus)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid targetUid or status parameter.');
  }

  const targetDocRef = db.collection('users').doc(targetUid);
  const targetSnap = await targetDocRef.get();
  if (!targetSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Target user profile does not exist.');
  }

  const targetData = targetSnap.data()!;
  const targetRoles: string[] = targetData.roles || [];

  if (targetRoles.includes('SUPER_ADMIN') && !isCallerSuperAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Privilege boundary: Only a SUPER_ADMIN can modify the status of a SUPER_ADMIN account.'
    );
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.update(targetDocRef, {
    status: newStatus,
    updatedAt: now,
  });

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'USER_STATUS_CHANGED',
    resourceType: 'users',
    resourceId: targetUid,
    timestamp: now,
    metadata: {
      targetEmail: targetData.email,
      previousStatus: targetData.status,
      newStatus,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, targetUid, newStatus };
});

/**
 * Callable Function: Administrative Manual Entitlement Grant
 * For special clinical trial or VIP grants.
 */
export const grantEntitlement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
  const isCallerAdmin = isCallerSuperAdmin || callerRoles.includes('ADMIN');

  if (!isCallerAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Actor lacks authority to grant entitlements.');
  }

  const { targetUserId, entitlementType } = data;
  const validTypes = ['COMMUNITY_ACCESS', 'SCHOOL_ACCESS', 'PHASE_TRAJECTORY'];
  if (!targetUserId || !validTypes.includes(entitlementType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid targetUserId or entitlementType.');
  }

  const targetUserSnap = await db.collection('users').doc(targetUserId).get();
  if (!targetUserSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Target user "${targetUserId}" does not exist.`);
  }

  const now = new Date().toISOString();
  const entId = `${targetUserId}_${entitlementType}`;
  const entRef = db.collection('entitlements').doc(entId);

  const batch = db.batch();
  batch.set(entRef, {
    id: entId,
    userId: targetUserId,
    entitlementType,
    sourceProductSku: 'MANUAL_OVERRIDE',
    sourceCode: 'STAFF_GRANT',
    activationId: 'STAFF_ACTION',
    status: 'ACTIVE',
    grantedAt: now,
    expiresAt: null,
    grantedBy: `STAFF_${callerUid}`,
  });

  const userRef = db.collection('users').doc(targetUserId);
  const userUpdates: Record<string, unknown> = { updatedAt: now };
  if (entitlementType === 'COMMUNITY_ACCESS') userUpdates.communityAccess = true;
  if (entitlementType === 'SCHOOL_ACCESS') userUpdates.schoolAccess = true;
  batch.update(userRef, userUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'ENTITLEMENT_GRANTED',
    resourceType: 'entitlements',
    resourceId: entId,
    timestamp: now,
    metadata: { targetUserId, entitlementType, enforcedBy: 'SERVER_CLOUD_FUNCTION' },
  });

  await batch.commit();

  return { success: true, entitlementId: entId };
});

/**
 * Callable Function: Authoritative CMS Content Management
 * Replaces direct client setDoc on /cmsContent.
 * Verifies staff privilege, validates payload schema/size, and logs authoritative audit events.
 */
export const updateCmsSection = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('CONTENT_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to manage CMS content (requires SUPER_ADMIN, ADMIN, or CONTENT_MANAGER).'
    );
  }

  const { sectionKey, data: sectionData } = data;
  if (!sectionKey || typeof sectionKey !== 'string' || sectionKey.trim().length === 0 || sectionKey.length > 100) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid or missing sectionKey.');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(sectionKey)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'sectionKey must contain only alphanumeric characters, underscores, and hyphens.'
    );
  }

  if (!sectionData || typeof sectionData !== 'object' || Array.isArray(sectionData)) {
    throw new functions.https.HttpsError('invalid-argument', 'CMS section payload must be an object.');
  }

  const payloadString = JSON.stringify(sectionData);
  if (payloadString.length > 100000) {
    throw new functions.https.HttpsError('invalid-argument', 'CMS section payload exceeds maximum allowed size (100KB).');
  }

  const now = new Date().toISOString();
  const cmsDocRef = db.collection('cmsContent').doc(sectionKey);

  const batch = db.batch();
  batch.set(
    cmsDocRef,
    {
      sectionKey,
      data: sectionData,
      updatedAt: now,
      updatedBy: callerUid,
    },
    { merge: true }
  );

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'CMS_CONTENT_UPDATED',
    resourceType: 'cmsContent',
    resourceId: sectionKey,
    timestamp: now,
    metadata: {
      sectionKey,
      keysUpdated: Object.keys(sectionData),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, sectionKey };
});

/**
 * Callable Function: Authoritative School Category Creation
 */
export const createSchoolCategory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to manage school categories (requires SUPER_ADMIN, ADMIN, or SCHOOL_MANAGER).'
    );
  }

  const { slug, title, description = {}, displayOrder = 0, isPublished = false } = data;
  if (!slug || typeof slug !== 'string' || !title || typeof title !== 'object' || !title.en) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Category requires a valid slug and at least an English title (title.en).'
    );
  }

  const now = new Date().toISOString();
  const categoryRef = db.collection('schoolCategories').doc();
  const categoryDoc = {
    id: categoryRef.id,
    slug: slug.trim().toLowerCase(),
    title,
    description: typeof description === 'object' ? description : {},
    displayOrder: Number(displayOrder) || 0,
    isPublished: Boolean(isPublished),
    createdBy: callerUid,
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(categoryRef, categoryDoc);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_CATEGORY_CREATED',
    resourceType: 'schoolCategories',
    resourceId: categoryRef.id,
    timestamp: now,
    metadata: {
      slug: categoryDoc.slug,
      isPublished: categoryDoc.isPublished,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, id: categoryRef.id };
});

/**
 * Callable Function: Authoritative School Category Update
 */
export const updateSchoolCategory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to update school categories.'
    );
  }

  const { categoryId, updates } = data;
  if (!categoryId || !updates || typeof updates !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing categoryId or updates payload.');
  }

  const categoryRef = db.collection('schoolCategories').doc(categoryId);
  const categorySnap = await categoryRef.get();
  if (!categorySnap.exists) {
    throw new functions.https.HttpsError('not-found', `Category "${categoryId}" not found.`);
  }

  const allowedFields = ['title', 'description', 'slug', 'displayOrder', 'isPublished'];
  const sanitizedUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  const now = new Date().toISOString();
  sanitizedUpdates.updatedAt = now;

  const batch = db.batch();
  batch.update(categoryRef, sanitizedUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_CATEGORY_UPDATED',
    resourceType: 'schoolCategories',
    resourceId: categoryId,
    timestamp: now,
    metadata: {
      updatedFields: Object.keys(sanitizedUpdates),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, categoryId };
});

/**
 * Callable Function: Authoritative School Category Deletion
 */
export const deleteSchoolCategory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to delete school categories.');
  }

  const { categoryId } = data;
  if (!categoryId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid categoryId is required.');
  }

  const categoryRef = db.collection('schoolCategories').doc(categoryId);
  const categorySnap = await categoryRef.get();
  if (!categorySnap.exists) {
    throw new functions.https.HttpsError('not-found', `Category "${categoryId}" not found.`);
  }

  // Prevent orphaned courses: verify no courses are linked to this category
  const courseQuery = await db
    .collection('schoolCourses')
    .where('categoryId', '==', categoryId)
    .limit(1)
    .get();

  if (!courseQuery.empty) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Cannot delete category containing existing courses. Reassign or delete courses first.'
    );
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.delete(categoryRef);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_CATEGORY_DELETED',
    resourceType: 'schoolCategories',
    resourceId: categoryId,
    timestamp: now,
    metadata: {
      categorySlug: categorySnap.data()?.slug,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, categoryId };
});

/**
 * Callable Function: Authoritative School Course Creation
 */
export const createSchoolCourse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to create courses.');
  }

  const {
    categoryId,
    slug,
    title,
    description = {},
    level = 'beginner',
    displayOrder = 0,
    isPublished = false,
    lessonsCount = 0,
    estimatedMinutes = 30,
  } = data;

  if (!categoryId || !slug || !title || !title.en) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Course requires categoryId, slug, and at least title.en.'
    );
  }

  const catSnap = await db.collection('schoolCategories').doc(categoryId).get();
  if (!catSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Category "${categoryId}" not found.`);
  }

  const now = new Date().toISOString();
  const courseRef = db.collection('schoolCourses').doc();
  const courseDoc = {
    id: courseRef.id,
    categoryId,
    slug: slug.trim().toLowerCase(),
    title,
    description: typeof description === 'object' ? description : {},
    level,
    displayOrder: Number(displayOrder) || 0,
    isPublished: Boolean(isPublished),
    lessonsCount: Number(lessonsCount) || 0,
    estimatedMinutes: Number(estimatedMinutes) || 30,
    createdBy: callerUid,
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(courseRef, courseDoc);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_COURSE_CREATED',
    resourceType: 'schoolCourses',
    resourceId: courseRef.id,
    timestamp: now,
    metadata: {
      courseSlug: courseDoc.slug,
      categoryId,
      isPublished: courseDoc.isPublished,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, id: courseRef.id };
});

/**
 * Callable Function: Authoritative School Course Update
 */
export const updateSchoolCourse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to update courses.');
  }

  const { courseId, updates } = data;
  if (!courseId || !updates || typeof updates !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing courseId or updates payload.');
  }

  const courseRef = db.collection('schoolCourses').doc(courseId);
  const courseSnap = await courseRef.get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Course "${courseId}" not found.`);
  }

  const allowedFields = [
    'categoryId',
    'slug',
    'title',
    'description',
    'level',
    'displayOrder',
    'isPublished',
    'lessonsCount',
    'estimatedMinutes',
  ];

  const sanitizedUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  const now = new Date().toISOString();
  sanitizedUpdates.updatedAt = now;

  const batch = db.batch();
  batch.update(courseRef, sanitizedUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_COURSE_UPDATED',
    resourceType: 'schoolCourses',
    resourceId: courseId,
    timestamp: now,
    metadata: {
      updatedFields: Object.keys(sanitizedUpdates),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, courseId };
});

/**
 * Callable Function: Authoritative School Course Deletion
 */
export const deleteSchoolCourse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to delete courses.');
  }

  const { courseId } = data;
  if (!courseId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid courseId is required.');
  }

  const courseRef = db.collection('schoolCourses').doc(courseId);
  const courseSnap = await courseRef.get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Course "${courseId}" not found.`);
  }

  // Check if certificates have been issued for this course
  const certQuery = await db
    .collection('certificates')
    .where('courseId', '==', courseId)
    .limit(1)
    .get();

  if (!certQuery.empty) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Cannot delete a course that has issued student certificates. Unpublish the course instead to preserve certification provenance.'
    );
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.delete(courseRef);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_COURSE_DELETED',
    resourceType: 'schoolCourses',
    resourceId: courseId,
    timestamp: now,
    metadata: {
      courseSlug: courseSnap.data()?.slug,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, courseId };
});

/**
 * Callable Function: Authoritative Community Announcement Update
 */
export const updateCommunityAnnouncement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to update announcements (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).'
    );
  }

  const { announcementId, updates } = data;
  if (!announcementId || !updates || typeof updates !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid announcementId and updates object are required.');
  }

  const announcementRef = db.collection('communityAnnouncements').doc(announcementId);
  const announcementSnap = await announcementRef.get();
  if (!announcementSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Announcement "${announcementId}" not found.`);
  }

  const allowedFields = ['title', 'content', 'body', 'tags', 'isPinned', 'priority', 'status'];
  const sanitizedUpdates: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      sanitizedUpdates[key] = val;
    }
  }

  const now = new Date().toISOString();
  sanitizedUpdates.updatedAt = now;

  const batch = db.batch();
  batch.update(announcementRef, sanitizedUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_ANNOUNCEMENT_UPDATED',
    resourceType: 'communityAnnouncements',
    resourceId: announcementId,
    timestamp: now,
    metadata: {
      updatedFields: Object.keys(sanitizedUpdates),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, announcementId };
});

/**
 * Callable Function: Authoritative Community Announcement Deletion
 */
export const deleteCommunityAnnouncement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to delete announcements.'
    );
  }

  const { announcementId } = data;
  if (!announcementId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid announcementId is required.');
  }

  const announcementRef = db.collection('communityAnnouncements').doc(announcementId);
  const announcementSnap = await announcementRef.get();
  if (!announcementSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Announcement "${announcementId}" not found.`);
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.delete(announcementRef);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_ANNOUNCEMENT_DELETED',
    resourceType: 'communityAnnouncements',
    resourceId: announcementId,
    timestamp: now,
    metadata: {
      title: announcementSnap.data()?.title,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, announcementId };
});

/* ==========================================================================
   SCHOOL LMS CLOUD FUNCTIONS (MODULES, LESSONS, ENROLLMENT, PROGRESS)
   ========================================================================== */

/**
 * Authoritative School Access Helper:
 * Determines if user qualifies for ZIRON School curriculum.
 * School access requires 3 UNIQUE ACTIVATED PRODUCT CONTAINERS, or an active SCHOOL_ACCESS entitlement,
 * or staff permissions (SUPER_ADMIN, ADMIN, SCHOOL_MANAGER).
 */
export async function checkUserSchoolAccess(
  uid: string,
  roles: string[] = [],
  email: string = '',
  isEmailVerified: boolean = false
): Promise<{ hasAccess: boolean; qualifyingContainerCount: number; isStaff: boolean }> {
  const isSuperAdmin = await checkIsSuperAdmin(uid, roles, email, isEmailVerified);
  const isStaffMember = isSuperAdmin || roles.includes('ADMIN') || roles.includes('SCHOOL_MANAGER');
  if (isStaffMember) {
    return { hasAccess: true, qualifyingContainerCount: 3, isStaff: true };
  }

  // Check earned entitlement
  const schoolEntDocRef = db.collection('entitlements').doc(`${uid}_SCHOOL_ACCESS`);
  const schoolEntSnap = await schoolEntDocRef.get();
  if (schoolEntSnap.exists && schoolEntSnap.data()?.status === 'ACTIVE') {
    return { hasAccess: true, qualifyingContainerCount: 3, isStaff: false };
  }

  // Count distinct activated container codes
  const activationsSnap = await db.collection('activations').where('userId', '==', uid).get();
  const distinctContainerCodes = new Set<string>();
  activationsSnap.docs.forEach((d) => {
    const codeVal = (d.data().code || '').trim().toUpperCase();
    if (codeVal) {
      distinctContainerCodes.add(codeVal);
    }
  });

  const qualifyingContainerCount = distinctContainerCodes.size;
  const hasAccess = qualifyingContainerCount >= 3;

  return { hasAccess, qualifyingContainerCount, isStaff: false };
}

/**
 * Callable Function: Query Authoritative School Access Status
 */
export const getSchoolAccessStatus = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    return { hasAccess: false, qualifyingContainerCount: 0, isStaff: false, authenticated: false };
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;

  const userSnap = await db.collection('users').doc(callerUid).get();
  const userData = userSnap.exists ? userSnap.data() : null;
  const roles: string[] = userData?.roles || [];

  const status = await checkUserSchoolAccess(callerUid, roles, callerEmail, isEmailVerified);
  return { ...status, authenticated: true };
});

/**
 * Callable Function: Authoritative School Module Creation
 */
export const createSchoolModule = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to create school modules.');
  }

  const { courseId, title, description = {}, displayOrder = 0, isPublished = false } = data;
  if (!courseId || !title || !title.en) {
    throw new functions.https.HttpsError('invalid-argument', 'Module requires courseId and title.en.');
  }

  const courseSnap = await db.collection('schoolCourses').doc(courseId).get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Course "${courseId}" not found.`);
  }

  const now = new Date().toISOString();
  const moduleRef = db.collection('schoolModules').doc();
  const moduleDoc = {
    id: moduleRef.id,
    courseId,
    title,
    description: typeof description === 'object' ? description : {},
    displayOrder: Number(displayOrder) || 0,
    isPublished: Boolean(isPublished),
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(moduleRef, moduleDoc);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_MODULE_CREATED',
    resourceType: 'schoolModules',
    resourceId: moduleRef.id,
    timestamp: now,
    metadata: { courseId, title: title.en, enforcedBy: 'SERVER_AUTHORITY' },
  });

  await batch.commit();
  return { success: true, id: moduleRef.id };
});

/**
 * Callable Function: Authoritative School Module Update
 */
export const updateSchoolModule = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to update school modules.');
  }

  const { moduleId, updates } = data;
  if (!moduleId || !updates || typeof updates !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid moduleId and updates object are required.');
  }

  const moduleRef = db.collection('schoolModules').doc(moduleId);
  const moduleSnap = await moduleRef.get();
  if (!moduleSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Module "${moduleId}" not found.`);
  }

  const allowedFields = ['title', 'description', 'displayOrder', 'isPublished'];
  const sanitizedUpdates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in updates) {
      sanitizedUpdates[field] = updates[field];
    }
  }

  const batch = db.batch();
  batch.update(moduleRef, sanitizedUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_MODULE_UPDATED',
    resourceType: 'schoolModules',
    resourceId: moduleId,
    timestamp: new Date().toISOString(),
    metadata: { updatedFields: Object.keys(sanitizedUpdates), enforcedBy: 'SERVER_AUTHORITY' },
  });

  await batch.commit();
  return { success: true, moduleId };
});

/**
 * Callable Function: Authoritative School Module Deletion
 */
export const deleteSchoolModule = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to delete school modules.');
  }

  const { moduleId } = data;
  if (!moduleId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid moduleId is required.');
  }

  const moduleRef = db.collection('schoolModules').doc(moduleId);
  const moduleSnap = await moduleRef.get();
  if (!moduleSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Module "${moduleId}" not found.`);
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.delete(moduleRef);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_MODULE_DELETED',
    resourceType: 'schoolModules',
    resourceId: moduleId,
    timestamp: now,
    metadata: { courseId: moduleSnap.data()?.courseId, enforcedBy: 'SERVER_AUTHORITY' },
  });

  await batch.commit();
  return { success: true, moduleId };
});

/**
 * Callable Function: Authoritative School Lesson Creation
 */
export const createSchoolLesson = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to create school lessons.');
  }

  const {
    courseId,
    moduleId,
    title,
    contentMarkdown = { en: '' },
    durationMinutes = 15,
    displayOrder = 0,
    isPublished = false,
  } = data;

  if (!courseId || !moduleId || !title || !title.en) {
    throw new functions.https.HttpsError('invalid-argument', 'Lesson requires courseId, moduleId, and title.en.');
  }

  const courseRef = db.collection('schoolCourses').doc(courseId);
  const courseSnap = await courseRef.get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Course "${courseId}" not found.`);
  }

  const moduleSnap = await db.collection('schoolModules').doc(moduleId).get();
  if (!moduleSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Module "${moduleId}" not found.`);
  }

  const now = new Date().toISOString();
  const lessonRef = db.collection('schoolLessons').doc();
  const lessonDoc = {
    id: lessonRef.id,
    courseId,
    moduleId,
    title,
    contentMarkdown: typeof contentMarkdown === 'object' ? contentMarkdown : { en: String(contentMarkdown) },
    durationMinutes: Number(durationMinutes) || 15,
    displayOrder: Number(displayOrder) || 0,
    isPublished: Boolean(isPublished),
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(lessonRef, lessonDoc);

  // Increment course lessonsCount
  const currentLessonsCount = Number(courseSnap.data()?.lessonsCount) || 0;
  batch.update(courseRef, {
    lessonsCount: currentLessonsCount + 1,
    updatedAt: now,
  });

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_LESSON_CREATED',
    resourceType: 'schoolLessons',
    resourceId: lessonRef.id,
    timestamp: now,
    metadata: { courseId, moduleId, title: title.en, enforcedBy: 'SERVER_AUTHORITY' },
  });

  await batch.commit();
  return { success: true, id: lessonRef.id };
});

/**
 * Callable Function: Authoritative School Lesson Update
 */
export const updateSchoolLesson = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to update school lessons.');
  }

  const { lessonId, updates } = data;
  if (!lessonId || !updates || typeof updates !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid lessonId and updates object are required.');
  }

  const lessonRef = db.collection('schoolLessons').doc(lessonId);
  const lessonSnap = await lessonRef.get();
  if (!lessonSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Lesson "${lessonId}" not found.`);
  }

  const allowedFields = ['title', 'contentMarkdown', 'durationMinutes', 'displayOrder', 'isPublished', 'moduleId'];
  const sanitizedUpdates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in updates) {
      sanitizedUpdates[field] = updates[field];
    }
  }

  const batch = db.batch();
  batch.update(lessonRef, sanitizedUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_LESSON_UPDATED',
    resourceType: 'schoolLessons',
    resourceId: lessonId,
    timestamp: new Date().toISOString(),
    metadata: { updatedFields: Object.keys(sanitizedUpdates), enforcedBy: 'SERVER_AUTHORITY' },
  });

  await batch.commit();
  return { success: true, lessonId };
});

/**
 * Callable Function: Authoritative School Lesson Deletion
 */
export const deleteSchoolLesson = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to delete school lessons.');
  }

  const { lessonId } = data;
  if (!lessonId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid lessonId is required.');
  }

  const lessonRef = db.collection('schoolLessons').doc(lessonId);
  const lessonSnap = await lessonRef.get();
  if (!lessonSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Lesson "${lessonId}" not found.`);
  }

  const lessonData = lessonSnap.data()!;
  const courseId = lessonData.courseId;

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.delete(lessonRef);

  if (courseId) {
    const courseRef = db.collection('schoolCourses').doc(courseId);
    const courseSnap = await courseRef.get();
    if (courseSnap.exists) {
      const currentLessonsCount = Math.max(0, (Number(courseSnap.data()?.lessonsCount) || 1) - 1);
      batch.update(courseRef, { lessonsCount: currentLessonsCount, updatedAt: now });
    }
  }

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_LESSON_DELETED',
    resourceType: 'schoolLessons',
    resourceId: lessonId,
    timestamp: now,
    metadata: { courseId, enforcedBy: 'SERVER_AUTHORITY' },
  });

  await batch.commit();
  return { success: true, lessonId };
});

/**
 * Callable Function: Authoritative Course Enrollment
 * Validates School access entitlement before enrolling student.
 */
export const enrollInCourse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated to enroll.');
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;

  const userSnap = await db.collection('users').doc(callerUid).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'User profile not found.');
  }
  const userData = userSnap.data()!;
  const roles: string[] = userData.roles || [];

  // Authoritative entitlement check
  const access = await checkUserSchoolAccess(callerUid, roles, callerEmail, isEmailVerified);
  if (!access.hasAccess) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'School curriculum access requires 3 verified product container activations.'
    );
  }

  const { courseId } = data;
  if (!courseId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid courseId is required.');
  }

  const courseRef = db.collection('schoolCourses').doc(courseId);
  const courseSnap = await courseRef.get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Course "${courseId}" not found.`);
  }

  const courseData = courseSnap.data()!;
  if (!courseData.isPublished && !access.isStaff) {
    throw new functions.https.HttpsError('permission-denied', 'This course is currently not published.');
  }

  const enrollmentId = `${callerUid}_${courseId}`;
  const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
  const progressRef = db.collection('schoolProgress').doc(enrollmentId);

  const [enrollmentSnap, progressSnap] = await Promise.all([enrollmentRef.get(), progressRef.get()]);

  const now = new Date().toISOString();

  // Query published lessons to know totalLessonsCount
  const lessonsSnap = await db
    .collection('schoolLessons')
    .where('courseId', '==', courseId)
    .where('isPublished', '==', true)
    .get();

  const totalLessonsCount = lessonsSnap.size;

  const batch = db.batch();

  if (!enrollmentSnap.exists) {
    batch.set(enrollmentRef, {
      id: enrollmentId,
      userId: callerUid,
      courseId,
      enrolledAt: now,
      status: 'ACTIVE',
      lastAccessedAt: now,
      completedAt: null,
    });
  } else {
    batch.update(enrollmentRef, {
      lastAccessedAt: now,
    });
  }

  if (!progressSnap.exists) {
    batch.set(progressRef, {
      id: enrollmentId,
      userId: callerUid,
      courseId,
      completedLessonIds: [],
      completedCount: 0,
      totalLessonsCount,
      progressPercent: 0,
      isCompleted: false,
      completedAt: null,
      lastUpdated: now,
    });
  } else {
    batch.update(progressRef, {
      totalLessonsCount,
      lastUpdated: now,
    });
  }

  await batch.commit();

  return {
    success: true,
    enrollmentId,
    courseId,
    isAlreadyEnrolled: enrollmentSnap.exists,
    totalLessonsCount,
  };
});

/**
 * Callable Function: Authoritative Lesson Completion and Progress Calculation
 * Calculates deterministic completion percent and marks completion upon 100% finish.
 */
export const completeSchoolLesson = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;

  const userSnap = await db.collection('users').doc(callerUid).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'User profile not found.');
  }
  const userData = userSnap.data()!;
  const roles: string[] = userData.roles || [];

  // Authoritative entitlement check
  const access = await checkUserSchoolAccess(callerUid, roles, callerEmail, isEmailVerified);
  if (!access.hasAccess) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'School curriculum access requires 3 verified product container activations.'
    );
  }

  const { courseId, lessonId } = data;
  if (!courseId || !lessonId) {
    throw new functions.https.HttpsError('invalid-argument', 'Both courseId and lessonId are required.');
  }

  const lessonRef = db.collection('schoolLessons').doc(lessonId);
  const lessonSnap = await lessonRef.get();
  if (!lessonSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Lesson "${lessonId}" not found.`);
  }

  const lessonData = lessonSnap.data()!;
  if (lessonData.courseId !== courseId) {
    throw new functions.https.HttpsError('invalid-argument', 'Lesson does not belong to specified course.');
  }

  // Authoritatively query all published lessons for this course to calculate real progress
  const publishedLessonsSnap = await db
    .collection('schoolLessons')
    .where('courseId', '==', courseId)
    .where('isPublished', '==', true)
    .get();

  const totalLessonsCount = publishedLessonsSnap.size;
  const publishedLessonIds = new Set(publishedLessonsSnap.docs.map((d) => d.id));

  // Ensure current lesson is accounted for even if just published
  publishedLessonIds.add(lessonId);
  const effectiveTotalLessons = Math.max(totalLessonsCount, publishedLessonIds.size);

  const progressId = `${callerUid}_${courseId}`;
  const progressRef = db.collection('schoolProgress').doc(progressId);
  const enrollmentRef = db.collection('enrollments').doc(progressId);
  const userDocRef = db.collection('users').doc(callerUid);

  const [progressSnap, enrollmentSnap, freshUserSnap] = await Promise.all([
    progressRef.get(),
    enrollmentRef.get(),
    userDocRef.get(),
  ]);

  const existingCompletedIds: string[] = progressSnap.exists
    ? progressSnap.data()?.completedLessonIds || []
    : [];

  const completedSet = new Set<string>(existingCompletedIds);
  completedSet.add(lessonId);

  const updatedCompletedIds = Array.from(completedSet);
  const completedCount = updatedCompletedIds.length;

  const progressPercent = effectiveTotalLessons > 0
    ? Math.min(100, Math.round((completedCount / effectiveTotalLessons) * 100))
    : 100;

  const isCompleted = progressPercent >= 100;
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const batch = db.batch();

  // Gamification & XP Awarding
  const freshUserData = freshUserSnap.exists ? freshUserSnap.data() : null;
  const currentXp = typeof freshUserData?.xp === 'number' ? freshUserData.xp : 0;
  let totalAwardedXp = 0;

  const isNewLessonCompletion = !existingCompletedIds.includes(lessonId);
  const wasCourseCompleted = progressSnap.exists && progressSnap.data()?.isCompleted === true;
  const isNewCourseCompletion = isCompleted && !wasCourseCompleted;

  if (isNewLessonCompletion) {
    const lessonXp = XP_VALUES.SCHOOL_LESSON_COMPLETED; // 15 XP
    totalAwardedXp += lessonXp;
    const lessonXpTxRef = db.collection('xpTransactions').doc(`xp_lesson_${callerUid}_${courseId}_${lessonId}`);
    batch.set(lessonXpTxRef, {
      id: lessonXpTxRef.id,
      userId: callerUid,
      amount: lessonXp,
      type: 'EARNED',
      source: 'SCHOOL_LESSON_COMPLETED',
      sourceId: `${courseId}_${lessonId}`,
      createdAt: now,
      metadata: { courseId, lessonId },
    });

    const milestoneFirstLessonRef = db.collection('userMilestones').doc(`${callerUid}_FIRST_LESSON`);
    batch.set(milestoneFirstLessonRef, {
      id: `${callerUid}_FIRST_LESSON`,
      userId: callerUid,
      milestoneKey: 'FIRST_LESSON',
      title: MILESTONES.FIRST_LESSON.title,
      description: MILESTONES.FIRST_LESSON.description,
      achievedAt: now,
    }, { merge: true });
  }

  if (isNewCourseCompletion) {
    const courseXp = XP_VALUES.SCHOOL_COURSE_COMPLETED; // 250 XP
    totalAwardedXp += courseXp;
    const courseXpTxRef = db.collection('xpTransactions').doc(`xp_course_${callerUid}_${courseId}`);
    batch.set(courseXpTxRef, {
      id: courseXpTxRef.id,
      userId: callerUid,
      amount: courseXp,
      type: 'EARNED',
      source: 'SCHOOL_COURSE_COMPLETED',
      sourceId: courseId,
      createdAt: now,
      metadata: { courseId },
    });

    const milestoneCourseRef = db.collection('userMilestones').doc(`${callerUid}_FIRST_COURSE_COMPLETED`);
    batch.set(milestoneCourseRef, {
      id: `${callerUid}_FIRST_COURSE_COMPLETED`,
      userId: callerUid,
      milestoneKey: 'FIRST_COURSE_COMPLETED',
      title: MILESTONES.FIRST_COURSE_COMPLETED.title,
      description: MILESTONES.FIRST_COURSE_COMPLETED.description,
      achievedAt: now,
    }, { merge: true });

    const badgeLearnerRef = db.collection('userBadges').doc(`${callerUid}_LEARNER`);
    batch.set(badgeLearnerRef, {
      id: `${callerUid}_LEARNER`,
      userId: callerUid,
      badgeKey: 'LEARNER',
      name: BADGES.LEARNER.name,
      description: BADGES.LEARNER.description,
      icon: BADGES.LEARNER.icon,
      requirement: BADGES.LEARNER.requirement,
      awardedAt: now,
    }, { merge: true });

    const completedCoursesSnap = await db.collection('schoolProgress')
      .where('userId', '==', callerUid)
      .where('isCompleted', '==', true)
      .get();
    const totalCompleted = completedCoursesSnap.docs.filter((d) => d.id !== progressId).length + 1;
    if (totalCompleted >= 3) {
      const badgeScholarRef = db.collection('userBadges').doc(`${callerUid}_SCHOLAR`);
      batch.set(badgeScholarRef, {
        id: `${callerUid}_SCHOLAR`,
        userId: callerUid,
        badgeKey: 'SCHOLAR',
        name: BADGES.SCHOLAR.name,
        description: BADGES.SCHOLAR.description,
        icon: BADGES.SCHOLAR.icon,
        requirement: BADGES.SCHOLAR.requirement,
        awardedAt: now,
      }, { merge: true });
    }
  }

  // Streak update on lesson completion
  const currentStreak = typeof userData?.currentStreak === 'number' ? userData.currentStreak : 0;
  const longestStreak = typeof userData?.longestStreak === 'number' ? userData.longestStreak : 0;
  const lastActivityDate = userData?.lastActivityDate || null;
  const streakUpdate = calculateStreakUpdate(currentStreak, longestStreak, lastActivityDate, today);

  if (streakUpdate.currentStreak >= 7) {
    const badgeCommittedRef = db.collection('userBadges').doc(`${callerUid}_COMMITTED`);
    batch.set(badgeCommittedRef, {
      id: `${callerUid}_COMMITTED`,
      userId: callerUid,
      badgeKey: 'COMMITTED',
      name: BADGES.COMMITTED.name,
      description: BADGES.COMMITTED.description,
      icon: BADGES.COMMITTED.icon,
      requirement: BADGES.COMMITTED.requirement,
      awardedAt: now,
    }, { merge: true });
  }

  if (streakUpdate.currentStreak >= 30) {
    const badgeDiscRef = db.collection('userBadges').doc(`${callerUid}_DISCIPLINED`);
    batch.set(badgeDiscRef, {
      id: `${callerUid}_DISCIPLINED`,
      userId: callerUid,
      badgeKey: 'DISCIPLINED',
      name: BADGES.DISCIPLINED.name,
      description: BADGES.DISCIPLINED.description,
      icon: BADGES.DISCIPLINED.icon,
      requirement: BADGES.DISCIPLINED.requirement,
      awardedAt: now,
    }, { merge: true });
  }

  const newTotalXp = currentXp + totalAwardedXp;
  const newLevel = calculateLevel(newTotalXp).currentLevel;

  batch.set(userDocRef, {
    xp: newTotalXp,
    level: newLevel,
    currentStreak: streakUpdate.currentStreak,
    longestStreak: streakUpdate.longestStreak,
    lastActivityDate: today,
    updatedAt: now,
  }, { merge: true });

  const gamificationRef = db.collection('userGamification').doc(callerUid);
  batch.set(gamificationRef, {
    userId: callerUid,
    xp: newTotalXp,
    level: newLevel,
    currentStreak: streakUpdate.currentStreak,
    longestStreak: streakUpdate.longestStreak,
    lastActivityDate: today,
    updatedAt: now,
  }, { merge: true });

  // Progress update
  const progressDoc = {
    id: progressId,
    userId: callerUid,
    courseId,
    completedLessonIds: updatedCompletedIds,
    completedCount,
    totalLessonsCount: effectiveTotalLessons,
    progressPercent,
    isCompleted,
    completedAt: isCompleted ? (progressSnap.data()?.completedAt || now) : null,
    lastAccessedLessonId: lessonId,
    lastUpdated: now,
  };

  batch.set(progressRef, progressDoc, { merge: true });

  // Enrollment update
  if (!enrollmentSnap.exists) {
    batch.set(enrollmentRef, {
      id: progressId,
      userId: callerUid,
      courseId,
      enrolledAt: now,
      status: isCompleted ? 'COMPLETED' : 'ACTIVE',
      lastAccessedLessonId: lessonId,
      lastAccessedAt: now,
      completedAt: isCompleted ? now : null,
    });
  } else {
    batch.update(enrollmentRef, {
      status: isCompleted ? 'COMPLETED' : enrollmentSnap.data()?.status || 'ACTIVE',
      lastAccessedLessonId: lessonId,
      lastAccessedAt: now,
      completedAt: isCompleted ? (enrollmentSnap.data()?.completedAt || now) : null,
    });
  }

  // Audit log
  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: roles,
    action: isCompleted ? 'SCHOOL_COURSE_COMPLETED' : 'SCHOOL_LESSON_COMPLETED',
    resourceType: 'schoolProgress',
    resourceId: progressId,
    timestamp: now,
    metadata: {
      courseId,
      lessonId,
      progressPercent,
      completedCount,
      effectiveTotalLessons,
      isCompleted,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  // Authoritative automatic certificate issuance upon 100% curriculum completion
  let issuedCertificate: Record<string, unknown> | null = null;
  let certIssuanceError: string | null = null;
  let certificateStatus: 'ISSUED' | 'PENDING_RECONCILIATION' | 'NOT_APPLICABLE' = 'NOT_APPLICABLE';

  if (isCompleted) {
    try {
      issuedCertificate = await authoritativelyIssueCertificate(
        callerUid,
        courseId,
        progressDoc.completedAt || now,
        callerEmail,
        roles
      );
      certificateStatus = 'ISSUED';
      await progressRef.update({
        certificateStatus: 'ISSUED',
        certificateId: (issuedCertificate as any).id || `cert_${callerUid}_${courseId}`,
        certificateNumber: (issuedCertificate as any).certificateNumber,
        updatedAt: now,
      });
    } catch (certError) {
      console.error('Authoritative automatic certificate issuance deferred/failed in completeSchoolLesson:', certError);
      certIssuanceError = certError instanceof Error ? certError.message : 'Certificate issuance deferred for reconciliation.';
      certificateStatus = 'PENDING_RECONCILIATION';
      await progressRef.update({
        certificateStatus: 'PENDING_RECONCILIATION',
        certificateError: certIssuanceError,
        updatedAt: now,
      });
    }
  }

  return {
    success: true,
    courseId,
    lessonId,
    progressPercent,
    completedCount,
    totalLessonsCount: effectiveTotalLessons,
    isCompleted,
    completedAt: progressDoc.completedAt,
    xpAwarded: totalAwardedXp,
    totalXp: newTotalXp,
    level: newLevel,
    certificate: issuedCertificate,
    certificateStatus,
    certificateError: certIssuanceError,
  };
});

/* ==========================================================================
   PHASE 7: AUTHORITATIVE CERTIFICATES & CREDENTIALS
   ========================================================================== */

/**
 * Generates a unique, non-predictable, human-readable certificate number.
 * Format: ZRN-CERT-YYYY-XXXX-XXXX
 * Uses cryptographic randomness (crypto.randomBytes) and Crockford Base32 characters
 * (eliminates confusing glyphs like I, L, O, U) with zero modulo bias (256 % 32 == 0).
 */
const CERT_CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export function generateCertificateNumber(year = new Date().getFullYear()): string {
  const bytes = crypto.randomBytes(8);
  let seg1 = '';
  let seg2 = '';
  for (let i = 0; i < 4; i++) {
    seg1 += CERT_CROCKFORD_ALPHABET.charAt(bytes[i] & 31);
    seg2 += CERT_CROCKFORD_ALPHABET.charAt(bytes[i + 4] & 31);
  }
  return `ZRN-CERT-${year}-${seg1}-${seg2}`;
}

/**
 * Authoritative Server-Side Helper: Issue a Course Completion Certificate.
 * Strictly verifies prerequisites, enforces idempotency via Firestore transaction, prevents duplicate
 * certificates, and maintains immutable audit logs and privacy-minimized public verification projection.
 */
export async function authoritativelyIssueCertificate(
  userId: string,
  courseId: string,
  completedAt: string,
  actorEmail: string = '',
  actorRoles: string[] = []
): Promise<Record<string, unknown>> {
  const certificateId = `cert_${userId}_${courseId}`;
  const certRef = db.collection('certificates').doc(certificateId);

  // Fast check: if certificate already exists, return it immediately (idempotent)
  const quickSnap = await certRef.get();
  if (quickSnap.exists) {
    const data = quickSnap.data() as Record<string, unknown>;
    if (data.status === 'REVOKED' || data.isRevoked) {
      throw new Error('This certificate has been revoked by institutional authority and cannot be reissued.');
    }
    return data;
  }

  // Pre-validate eligibility before transaction
  const access = await checkUserSchoolAccess(userId, actorRoles, actorEmail, false);
  if (!access.hasAccess) {
    throw new Error('School eligibility requirement not met: 3 unique activated containers are required.');
  }

  // Load recipient and course data
  const [userSnap, courseSnap] = await Promise.all([
    db.collection('users').doc(userId).get(),
    db.collection('schoolCourses').doc(courseId).get(),
  ]);

  const userData = userSnap.exists ? userSnap.data() : null;
  const courseData = courseSnap.exists ? courseSnap.data() : null;

  const recipientName =
    userData?.displayName ||
    (userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`.trim()
      : 'ZIRON Scholar');

  let courseTitle = 'ZIRON Restart Curriculum';
  if (courseData?.title) {
    if (typeof courseData.title === 'string') {
      courseTitle = courseData.title;
    } else if (courseData.title.en) {
      courseTitle = courseData.title.en;
    } else {
      const firstLang = Object.values(courseData.title)[0];
      if (typeof firstLang === 'string') courseTitle = firstLang;
    }
  }

  // Atomic Firestore Transaction guarantees true concurrency safety and idempotency
  return await db.runTransaction(async (transaction) => {
    // Read deterministic certRef inside transaction
    const txCertSnap = await transaction.get(certRef);
    if (txCertSnap.exists) {
      const data = txCertSnap.data() as Record<string, unknown>;
      if (data.status === 'REVOKED' || data.isRevoked) {
        throw new Error('This certificate has been revoked by institutional authority and cannot be reissued.');
      }
      return data;
    }

    // Generate cryptographic certificate number with collision check within transaction
    let candidateNumber = generateCertificateNumber();
    let pubRef = db.collection('publicCertificates').doc(candidateNumber);
    let pubSnap = await transaction.get(pubRef);
    let collisionAttempts = 0;
    while (pubSnap.exists && collisionAttempts < 5) {
      candidateNumber = generateCertificateNumber();
      pubRef = db.collection('publicCertificates').doc(candidateNumber);
      pubSnap = await transaction.get(pubRef);
      collisionAttempts++;
    }

    if (pubSnap.exists) {
      throw new Error('Certificate number collision encountered. Transaction will retry.');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const now = new Date().toISOString();
    const issuer = 'ZIRON Restart School - Virexon Biosciences Education Division';
    const verificationUrl = `/verify/certificate?number=${candidateNumber}`;

    const certDoc = {
      id: certificateId,
      certificateId,
      certificateNumber: candidateNumber,
      userId,
      recipientName,
      userDisplayName: recipientName,
      courseId,
      courseTitle,
      issuedAt: now,
      issueDate: now,
      completedAt: completedAt || now,
      issuer,
      status: 'ACTIVE',
      isRevoked: false,
      verificationToken,
      verificationHash: verificationToken,
      verificationUrl,
      certificateType: 'COURSE_COMPLETION',
      createdAt: now,
      updatedAt: now,
      revokedAt: null,
      revocationReason: null,
      revokedBy: null,
    };

    // Safe public projection (no sensitive user data, no email, phone, user IDs, XP, streaks, or verificationToken)
    const publicCertDoc = {
      certificateNumber: candidateNumber,
      status: 'ACTIVE',
      courseTitle,
      courseId,
      recipientName,
      completedAt: completedAt || now,
      issuedAt: now,
      issuer,
      certificateType: 'COURSE_COMPLETION',
      createdAt: now,
      updatedAt: now,
      revokedAt: null,
      revocationReason: null,
    };

    transaction.set(certRef, certDoc);
    transaction.set(pubRef, publicCertDoc);

    const auditRef = db.collection('auditLogs').doc();
    transaction.set(auditRef, {
      id: auditRef.id,
      actorUserId: userId,
      actorEmail: actorEmail || null,
      actorRoles: actorRoles.length > 0 ? actorRoles : ['CUSTOMER'],
      action: 'CERTIFICATE_ISSUED',
      resourceType: 'certificates',
      resourceId: certificateId,
      timestamp: now,
      metadata: {
        certificateNumber: candidateNumber,
        courseId,
        recipientName,
        completedAt: completedAt || now,
        enforcedBy: 'SERVER_AUTHORITY',
      },
    });

    return certDoc;
  });
}

/**
 * Callable Function: Authoritatively Issue Course Certificate
 * Allows explicit claim / idempotent issuance verification by authenticated enrolled students.
 */
export const issueCourseCertificate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required to claim certificate.');
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const { courseId } = data || {};

  if (!courseId || typeof courseId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'A valid courseId is required.');
  }

  const userSnap = await db.collection('users').doc(callerUid).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'User profile not found.');
  }
  const roles = userSnap.data()?.roles || [];

  // Check School access entitlement
  const access = await checkUserSchoolAccess(callerUid, roles, callerEmail, isEmailVerified);
  if (!access.hasAccess) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'School access is unlocked by 3 verified product containers.'
    );
  }

  // Check legitimate enrollment
  const enrollmentRef = db.collection('enrollments').doc(`${callerUid}_${courseId}`);
  const enrollmentSnap = await enrollmentRef.get();
  if (!enrollmentSnap.exists) {
    throw new functions.https.HttpsError('failed-precondition', 'You are not enrolled in this course.');
  }

  // Check curriculum completion
  const lessonsSnap = await db.collection('schoolLessons')
    .where('courseId', '==', courseId)
    .where('isPublished', '==', true)
    .get();

  if (lessonsSnap.empty) {
    throw new functions.https.HttpsError('failed-precondition', 'Curriculum has no published lessons.');
  }

  const progressRef = db.collection('schoolProgress').doc(`${callerUid}_${courseId}`);
  const progressSnap = await progressRef.get();

  if (!progressSnap.exists) {
    throw new functions.https.HttpsError('failed-precondition', 'No progress recorded for this course.');
  }

  const progressData = progressSnap.data()!;
  const completedIds = new Set<string>(progressData.completedLessonIds || []);
  const allLessonsCompleted = lessonsSnap.docs.every((d) => completedIds.has(d.id));

  if (!allLessonsCompleted || progressData.progressPercent < 100) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Authoritative course completion required. Every required lesson must be completed before certificate issuance.'
    );
  }

  // Check if certificate already exists and has been revoked
  const certId = `cert_${callerUid}_${courseId}`;
  const existingCertSnap = await db.collection('certificates').doc(certId).get();
  if (existingCertSnap.exists) {
    const existingData = existingCertSnap.data()!;
    if (existingData.status === 'REVOKED' || existingData.isRevoked) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This certificate has been revoked by institutional authority and cannot be reissued.'
      );
    }
  }

  const certificate = await authoritativelyIssueCertificate(
    callerUid,
    courseId,
    progressData.completedAt || new Date().toISOString(),
    callerEmail,
    roles
  );

  return {
    success: true,
    certificate,
  };
});

/**
 * Callable Function: Authoritatively Revoke Certificate
 * Administrative action with required audit reasoning. Idempotent on repeated calls.
 */
export const revokeCertificate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;

  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }

  const callerData = callerSnap.data()!;
  const callerRoles: string[] = callerData.roles || [];
  const isSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Administrative authority required to revoke educational certificates.'
    );
  }

  const { certificateId, reason } = data || {};
  if (!certificateId || typeof certificateId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid certificateId is required.');
  }
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'An auditable revocation reason is required.');
  }

  const certRef = db.collection('certificates').doc(certificateId);
  const certSnap = await certRef.get();
  if (!certSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Certificate "${certificateId}" not found.`);
  }

  const certData = certSnap.data()!;
  const certificateNumber = certData.certificateNumber;
  const now = new Date().toISOString();

  // Idempotency: if already revoked, return status cleanly without redundant writes
  if (certData.status === 'REVOKED' || certData.isRevoked) {
    return {
      success: true,
      certificateId,
      certificateNumber,
      status: 'REVOKED',
      revokedAt: certData.revokedAt || now,
      alreadyRevoked: true,
    };
  }

  const batch = db.batch();
  batch.update(certRef, {
    status: 'REVOKED',
    isRevoked: true,
    revokedAt: now,
    revocationReason: reason.trim(),
    revokedBy: callerUid,
    updatedAt: now,
  });

  if (certificateNumber) {
    const pubCertRef = db.collection('publicCertificates').doc(certificateNumber);
    batch.set(
      pubCertRef,
      {
        status: 'REVOKED',
        revokedAt: now,
        revocationReason: reason.trim(),
        updatedAt: now,
      },
      { merge: true }
    );
  }

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'CERTIFICATE_REVOKED',
    resourceType: 'certificates',
    resourceId: certificateId,
    timestamp: now,
    metadata: {
      certificateNumber,
      courseId: certData.courseId,
      recipientUserId: certData.userId,
      reason: reason.trim(),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return {
    success: true,
    certificateId,
    certificateNumber,
    status: 'REVOKED',
    revokedAt: now,
  };
});

/**
 * Callable Function: Public Certificate Verification
 * Resolves safe public verification information from non-enumerable records.
 */
export const verifyCertificate = functions.https.onCall(async (data) => {
  const { identifier } = data || {};
  if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
    return {
      isValid: false,
      message: 'Certificate number or verification token is required.',
    };
  }

  const clean = identifier.trim();

  // 1. Direct lookup by certificateNumber (e.g. ZRN-CERT-...)
  let pubDoc = await db.collection('publicCertificates').doc(clean.toUpperCase()).get();

  // 2. Fallback lookup by private verificationToken (if presented by holder via QR or direct link)
  if (!pubDoc.exists) {
    const tokenQuery = await db.collection('certificates')
      .where('verificationToken', '==', clean)
      .limit(1)
      .get();
    if (!tokenQuery.empty) {
      const privateData = tokenQuery.docs[0].data();
      const certNum = privateData.certificateNumber;
      if (certNum) {
        pubDoc = await db.collection('publicCertificates').doc(certNum).get();
      }
    }
  }

  // Not found: uninformative error that cannot be used for user enumeration or oracle attacks
  if (!pubDoc.exists) {
    return {
      isValid: false,
      message: 'No certificate matching this identifier was found in the official registry.',
    };
  }

  const d = pubDoc.data()!;
  const isRevoked = d.status === 'REVOKED';

  return {
    isValid: true,
    status: isRevoked ? 'REVOKED' : 'ACTIVE',
    isRevoked,
    certificateNumber: d.certificateNumber,
    recipientName: d.recipientName,
    courseTitle: d.courseTitle,
    courseId: d.courseId,
    issuer: d.issuer || 'ZIRON Restart School - Virexon Biosciences Education Division',
    issuedAt: d.issuedAt,
    completedAt: d.completedAt,
    certificateType: d.certificateType || 'COURSE_COMPLETION',
    revokedAt: isRevoked ? (d.revokedAt || null) : null,
    revocationReason: isRevoked ? (d.revocationReason || 'Administrative Compliance Review') : null,
    educationalDisclaimer:
      'Certificates issued by ZIRON Restart School are educational completion credentials only. They do not certify medical treatment, addiction recovery, scientific claims, or clinical outcomes.',
  };
});

/**
 * =============================================================================
 * AUTHORITATIVE GAMIFICATION & REWARDS CLOUD FUNCTIONS
 * Server-authoritative engine for XP redemption, journey milestones, community XP,
 * and seed catalogue.
 * =============================================================================
 */

/**
 * Redeem Reward via Authoritative Cloud Function.
 * Atomic, transactional XP deduction and stock verification.
 */
export const redeemReward = functions.https.onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication is required to redeem rewards.'
    );
  }

  const { rewardId, idempotencyKey } = request.data || {};
  if (!rewardId || typeof rewardId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid rewardId string is required.'
    );
  }

  const rewardDocRef = db.collection('rewards').doc(rewardId);
  const userDocRef = db.collection('users').doc(callerUid);
  const redemptionDocRef = db.collection('rewardRedemptions').doc(
    idempotencyKey && typeof idempotencyKey === 'string'
      ? `${callerUid}_${idempotencyKey}`
      : db.collection('rewardRedemptions').doc().id
  );

  return await db.runTransaction(async (transaction) => {
    // Check if already redeemed with this idempotency key
    const existingRedemptionSnap = await transaction.get(redemptionDocRef);
    if (existingRedemptionSnap.exists) {
      const data = existingRedemptionSnap.data();
      return {
        success: true,
        alreadyRedeemed: true,
        redemptionId: redemptionDocRef.id,
        rewardTitle: data?.rewardTitle || 'Reward',
        remainingXp: data?.remainingXp || 0,
      };
    }

    const [rewardSnap, userSnap] = await Promise.all([
      transaction.get(rewardDocRef),
      transaction.get(userDocRef),
    ]);

    if (!rewardSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'The requested reward does not exist.');
    }

    const rewardData = rewardSnap.data();
    if (!rewardData?.isActive) {
      throw new functions.https.HttpsError('failed-precondition', 'This reward is not currently active.');
    }

    if (rewardData.stock !== null && typeof rewardData.stock === 'number' && rewardData.stock <= 0) {
      throw new functions.https.HttpsError('resource-exhausted', 'This reward is currently out of stock.');
    }

    if (!userSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    const userData = userSnap.data();
    const currentXp = typeof userData?.xp === 'number' ? userData.xp : 0;
    const xpCost = typeof rewardData.xpCost === 'number' ? rewardData.xpCost : 0;

    if (currentXp < xpCost) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Insufficient XP balance. You have ${currentXp} XP, but this reward requires ${xpCost} XP.`
      );
    }

    const remainingXp = currentXp - xpCost;
    const newLevel = calculateLevel(remainingXp).currentLevel;
    const now = new Date().toISOString();

    // 1. Decrement user XP
    transaction.update(userDocRef, {
      xp: remainingXp,
      level: newLevel,
      updatedAt: now,
    });

    // 2. Decrement stock if finite
    if (rewardData.stock !== null && typeof rewardData.stock === 'number') {
      transaction.update(rewardDocRef, {
        stock: admin.firestore.FieldValue.increment(-1),
        updatedAt: now,
      });
    }

    // 3. Create XP debit transaction in authoritative ledger
    const xpTxRef = db.collection('xpTransactions').doc(`xp_redeem_${redemptionDocRef.id}`);
    transaction.set(xpTxRef, {
      id: xpTxRef.id,
      userId: callerUid,
      amount: -xpCost,
      type: 'REDEEMED',
      source: 'REWARD_REDEMPTION',
      sourceId: rewardId,
      createdAt: now,
      metadata: {
        rewardTitle: rewardData.title,
        rewardType: rewardData.type,
        xpCost,
      },
    });

    // 4. Record authoritative redemption record
    transaction.set(redemptionDocRef, {
      id: redemptionDocRef.id,
      userId: callerUid,
      rewardId,
      rewardTitle: rewardData.title,
      xpCost,
      status: 'COMPLETED',
      createdAt: now,
      metadata: {
        rewardType: rewardData.type,
        remainingXp,
      },
    });

    // 5. Update userGamification snapshot
    const gamificationRef = db.collection('userGamification').doc(callerUid);
    transaction.set(gamificationRef, {
      userId: callerUid,
      xp: remainingXp,
      level: newLevel,
      updatedAt: now,
    }, { merge: true });

    // 6. Audit log
    const auditDocRef = db.collection('auditLogs').doc();
    transaction.set(auditDocRef, {
      id: auditDocRef.id,
      actorUserId: callerUid,
      actorEmail: request.auth?.token.email || null,
      actorRoles: request.auth?.token.roles || ['CUSTOMER'],
      action: 'REWARD_REDEEMED',
      resourceType: 'rewards',
      resourceId: rewardId,
      timestamp: now,
      metadata: {
        redemptionId: redemptionDocRef.id,
        rewardTitle: rewardData.title,
        xpCost,
        remainingXp,
      },
    });

    return {
      success: true,
      redemptionId: redemptionDocRef.id,
      rewardTitle: rewardData.title,
      remainingXp,
    };
  });
});

/**
 * Complete a 90-Day Journey Protocol Day via Authoritative Cloud Function.
 * Awards daily adherence XP (10 XP), evaluates milestones (Day 30 Phase 1, Day 90 Full Program),
 * updates streak, and awards badges.
 */
export const completeJourneyDay = functions.https.onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication is required.');
  }

  const { dayNumber, notes } = request.data || {};
  const day = parseInt(dayNumber, 10);
  if (isNaN(day) || day < 1 || day > 90) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'dayNumber must be an integer between 1 and 90.'
    );
  }

  const userDocRef = db.collection('users').doc(callerUid);
  const journeyLogRef = db.collection('journeyLogs').doc(`${callerUid}_day_${day}`);
  const xpTxDayRef = db.collection('xpTransactions').doc(`xp_journey_day_${callerUid}_${day}`);

  return await db.runTransaction(async (transaction) => {
    // Check if day already logged
    const [userSnap, logSnap, xpSnap] = await Promise.all([
      transaction.get(userDocRef),
      transaction.get(journeyLogRef),
      transaction.get(xpTxDayRef),
    ]);

    if (!userSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    const userData = userSnap.data();
    const hasLinkedProduct =
      (typeof userData?.qualifyingContainerCount === 'number' && userData.qualifyingContainerCount > 0) ||
      userData?.communityAccess === true;

    if (!hasLinkedProduct) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You must activate at least one authentic ZIRON container to log protocol days.'
      );
    }

    if (logSnap.exists || xpSnap.exists) {
      return {
        success: true,
        alreadyCompleted: true,
        dayNumber: day,
        totalXp: userData?.xp || 0,
        currentStreak: userData?.currentStreak || 0,
      };
    }

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const dayXp = XP_VALUES.JOURNEY_DAY_COMPLETED; // 10 XP
    let totalAwardedXp = dayXp;

    // 1. Record day adherence XP transaction
    transaction.set(xpTxDayRef, {
      id: xpTxDayRef.id,
      userId: callerUid,
      amount: dayXp,
      type: 'EARNED',
      source: 'JOURNEY_DAY_COMPLETED',
      sourceId: `day_${day}`,
      createdAt: now,
      metadata: { dayNumber: day, notes: notes || null },
    });

    // 2. Record journey log doc
    transaction.set(journeyLogRef, {
      id: journeyLogRef.id,
      userId: callerUid,
      dayNumber: day,
      notes: notes || null,
      completedAt: now,
    });

    // 3. Phase 1 Milestone & XP (Day 30)
    if (day === 30) {
      const phaseXp = XP_VALUES.JOURNEY_PHASE_COMPLETED; // 100 XP
      totalAwardedXp += phaseXp;
      const phaseTxRef = db.collection('xpTransactions').doc(`xp_phase1_${callerUid}`);
      transaction.set(phaseTxRef, {
        id: phaseTxRef.id,
        userId: callerUid,
        amount: phaseXp,
        type: 'EARNED',
        source: 'JOURNEY_PHASE_COMPLETED',
        sourceId: 'phase_1',
        createdAt: now,
        metadata: { phase: 1, dayNumber: 30 },
      });

      const milestonePhaseRef = db.collection('userMilestones').doc(`${callerUid}_FIRST_PHASE_COMPLETED`);
      transaction.set(milestonePhaseRef, {
        id: `${callerUid}_FIRST_PHASE_COMPLETED`,
        userId: callerUid,
        milestoneKey: 'FIRST_PHASE_COMPLETED',
        title: MILESTONES.FIRST_PHASE_COMPLETED.title,
        description: MILESTONES.FIRST_PHASE_COMPLETED.description,
        achievedAt: now,
      }, { merge: true });
    }

    // 4. Full 90-Day Milestone & Badge (Day 90)
    if (day === 90) {
      const milestone90Ref = db.collection('userMilestones').doc(`${callerUid}_FULL_90_DAY_PROGRAM`);
      transaction.set(milestone90Ref, {
        id: `${callerUid}_FULL_90_DAY_PROGRAM`,
        userId: callerUid,
        milestoneKey: 'FULL_90_DAY_PROGRAM',
        title: MILESTONES.FULL_90_DAY_PROGRAM.title,
        description: MILESTONES.FULL_90_DAY_PROGRAM.description,
        achievedAt: now,
      }, { merge: true });

      const badgeJourneyRef = db.collection('userBadges').doc(`${callerUid}_JOURNEY_COMPLETE`);
      transaction.set(badgeJourneyRef, {
        id: `${callerUid}_JOURNEY_COMPLETE`,
        userId: callerUid,
        badgeKey: 'JOURNEY_COMPLETE',
        name: BADGES.JOURNEY_COMPLETE.name,
        description: BADGES.JOURNEY_COMPLETE.description,
        icon: BADGES.JOURNEY_COMPLETE.icon,
        requirement: BADGES.JOURNEY_COMPLETE.requirement,
        awardedAt: now,
      }, { merge: true });
    }

    // 5. Streak update
    const currentStreak = typeof userData?.currentStreak === 'number' ? userData.currentStreak : 0;
    const longestStreak = typeof userData?.longestStreak === 'number' ? userData.longestStreak : 0;
    const lastActivityDate = userData?.lastActivityDate || null;
    const streakUpdate = calculateStreakUpdate(currentStreak, longestStreak, lastActivityDate, today);

    if (streakUpdate.currentStreak >= 7) {
      const badgeCommittedRef = db.collection('userBadges').doc(`${callerUid}_COMMITTED`);
      transaction.set(badgeCommittedRef, {
        id: `${callerUid}_COMMITTED`,
        userId: callerUid,
        badgeKey: 'COMMITTED',
        name: BADGES.COMMITTED.name,
        description: BADGES.COMMITTED.description,
        icon: BADGES.COMMITTED.icon,
        requirement: BADGES.COMMITTED.requirement,
        awardedAt: now,
      }, { merge: true });
    }

    if (streakUpdate.currentStreak >= 30) {
      const badgeDiscRef = db.collection('userBadges').doc(`${callerUid}_DISCIPLINED`);
      transaction.set(badgeDiscRef, {
        id: `${callerUid}_DISCIPLINED`,
        userId: callerUid,
        badgeKey: 'DISCIPLINED',
        name: BADGES.DISCIPLINED.name,
        description: BADGES.DISCIPLINED.description,
        icon: BADGES.DISCIPLINED.icon,
        requirement: BADGES.DISCIPLINED.requirement,
        awardedAt: now,
      }, { merge: true });
    }

    const currentXp = typeof userData?.xp === 'number' ? userData.xp : 0;
    const newTotalXp = currentXp + totalAwardedXp;
    const newLevel = calculateLevel(newTotalXp).currentLevel;

    // 6. Update user doc
    transaction.set(userDocRef, {
      xp: newTotalXp,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastActivityDate: today,
      updatedAt: now,
    }, { merge: true });

    // 7. Update userGamification doc
    const gamificationRef = db.collection('userGamification').doc(callerUid);
    transaction.set(gamificationRef, {
      userId: callerUid,
      xp: newTotalXp,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastActivityDate: today,
      updatedAt: now,
    }, { merge: true });

    // 8. Audit log
    const auditDocRef = db.collection('auditLogs').doc();
    transaction.set(auditDocRef, {
      id: auditDocRef.id,
      actorUserId: callerUid,
      actorEmail: request.auth?.token.email || null,
      actorRoles: request.auth?.token.roles || ['CUSTOMER'],
      action: 'JOURNEY_DAY_COMPLETED',
      resourceType: 'journeyLogs',
      resourceId: journeyLogRef.id,
      timestamp: now,
      metadata: {
        dayNumber: day,
        awardedXp: totalAwardedXp,
        newTotalXp,
        currentStreak: streakUpdate.currentStreak,
      },
    });

    return {
      success: true,
      dayNumber: day,
      awardedXp: totalAwardedXp,
      totalXp: newTotalXp,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
    };
  });
});

/**
 * Authoritative Community Post Creation Cloud Function.
 * Verifies entitlement, persists discussion post, awards 10 XP, and maintains activity streak.
 */
export const createCommunityPost = functions.https.onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication is required.');
  }

  const { title, body, tags } = request.data || {};
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'A non-empty title is required.');
  }
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'A non-empty body is required.');
  }

  const entDocRef = db.collection('entitlements').doc(`${callerUid}_COMMUNITY_ACCESS`);
  const userDocRef = db.collection('users').doc(callerUid);

  return await db.runTransaction(async (transaction) => {
    const [entSnap, userSnap] = await Promise.all([
      transaction.get(entDocRef),
      transaction.get(userDocRef),
    ]);

    const isAuthorized =
      (entSnap.exists && entSnap.data()?.status === 'ACTIVE') ||
      (userSnap.exists && userSnap.data()?.communityAccess === true);

    if (!isAuthorized) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Active community entitlement is required to publish discussions.'
      );
    }

    const userData = userSnap.data();
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const postRef = db.collection('communityPosts').doc();

    const postDoc = {
      id: postRef.id,
      title: title.trim(),
      body: body.trim(),
      authorId: callerUid,
      authorName:
        userData?.displayName ||
        (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : 'Community Member'),
      authorRole: Array.isArray(userData?.roles) && userData.roles.length > 0 ? userData.roles[0] : 'CUSTOMER',
      tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
      likesCount: 0,
      commentsCount: 0,
      isLocked: false,
      status: 'published',
      createdAt: now,
      updatedAt: now,
    };

    transaction.set(postRef, postDoc);

    // Award 10 XP for post creation
    const postXp = XP_VALUES.COMMUNITY_POST_CREATED; // 10 XP
    const xpTxRef = db.collection('xpTransactions').doc(`xp_post_${callerUid}_${postRef.id}`);
    transaction.set(xpTxRef, {
      id: xpTxRef.id,
      userId: callerUid,
      amount: postXp,
      type: 'EARNED',
      source: 'COMMUNITY_POST_CREATED',
      sourceId: postRef.id,
      createdAt: now,
      metadata: { title: title.trim() },
    });

    // Streak update
    const currentStreak = typeof userData?.currentStreak === 'number' ? userData.currentStreak : 0;
    const longestStreak = typeof userData?.longestStreak === 'number' ? userData.longestStreak : 0;
    const lastActivityDate = userData?.lastActivityDate || null;
    const streakUpdate = calculateStreakUpdate(currentStreak, longestStreak, lastActivityDate, today);

    if (streakUpdate.currentStreak >= 7) {
      const badgeCommittedRef = db.collection('userBadges').doc(`${callerUid}_COMMITTED`);
      transaction.set(badgeCommittedRef, {
        id: `${callerUid}_COMMITTED`,
        userId: callerUid,
        badgeKey: 'COMMITTED',
        name: BADGES.COMMITTED.name,
        description: BADGES.COMMITTED.description,
        icon: BADGES.COMMITTED.icon,
        requirement: BADGES.COMMITTED.requirement,
        awardedAt: now,
      }, { merge: true });
    }

    if (streakUpdate.currentStreak >= 30) {
      const badgeDiscRef = db.collection('userBadges').doc(`${callerUid}_DISCIPLINED`);
      transaction.set(badgeDiscRef, {
        id: `${callerUid}_DISCIPLINED`,
        userId: callerUid,
        badgeKey: 'DISCIPLINED',
        name: BADGES.DISCIPLINED.name,
        description: BADGES.DISCIPLINED.description,
        icon: BADGES.DISCIPLINED.icon,
        requirement: BADGES.DISCIPLINED.requirement,
        awardedAt: now,
      }, { merge: true });
    }

    const currentXp = typeof userData?.xp === 'number' ? userData.xp : 0;
    const newTotalXp = currentXp + postXp;
    const newLevel = calculateLevel(newTotalXp).currentLevel;

    transaction.set(userDocRef, {
      xp: newTotalXp,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastActivityDate: today,
      updatedAt: now,
    }, { merge: true });

    const gamificationRef = db.collection('userGamification').doc(callerUid);
    transaction.set(gamificationRef, {
      userId: callerUid,
      xp: newTotalXp,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastActivityDate: today,
      updatedAt: now,
    }, { merge: true });

    return {
      success: true,
      postId: postRef.id,
      awardedXp: postXp,
      totalXp: newTotalXp,
    };
  });
});

/**
 * Authoritative Community Comment Creation Cloud Function.
 * Awards 5 XP and maintains activity streak.
 */
export const createCommunityComment = functions.https.onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication is required.');
  }

  const { postId, body } = request.data || {};
  if (!postId || typeof postId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'postId is required.');
  }
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'A non-empty body is required.');
  }

  const postDocRef = db.collection('communityPosts').doc(postId);
  const userDocRef = db.collection('users').doc(callerUid);
  const entDocRef = db.collection('entitlements').doc(`${callerUid}_COMMUNITY_ACCESS`);

  return await db.runTransaction(async (transaction) => {
    const [postSnap, userSnap, entSnap] = await Promise.all([
      transaction.get(postDocRef),
      transaction.get(userDocRef),
      transaction.get(entDocRef),
    ]);

    if (!postSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Discussion post not found.');
    }

    const isAuthorized =
      (entSnap.exists && entSnap.data()?.status === 'ACTIVE') ||
      (userSnap.exists && userSnap.data()?.communityAccess === true);

    if (!isAuthorized) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Active community entitlement is required to participate in discussions.'
      );
    }

    const userData = userSnap.data();
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const commentRef = db.collection('communityComments').doc();

    transaction.set(commentRef, {
      id: commentRef.id,
      postId,
      authorId: callerUid,
      authorName:
        userData?.displayName ||
        (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : 'Community Member'),
      body: body.trim(),
      createdAt: now,
    });

    transaction.update(postDocRef, {
      commentsCount: admin.firestore.FieldValue.increment(1),
      updatedAt: now,
    });

    // Award 5 XP for comment creation
    const commentXp = XP_VALUES.COMMUNITY_COMMENT_CREATED; // 5 XP
    const xpTxRef = db.collection('xpTransactions').doc(`xp_comment_${callerUid}_${commentRef.id}`);
    transaction.set(xpTxRef, {
      id: xpTxRef.id,
      userId: callerUid,
      amount: commentXp,
      type: 'EARNED',
      source: 'COMMUNITY_COMMENT_CREATED',
      sourceId: commentRef.id,
      createdAt: now,
      metadata: { postId },
    });

    // Streak update
    const currentStreak = typeof userData?.currentStreak === 'number' ? userData.currentStreak : 0;
    const longestStreak = typeof userData?.longestStreak === 'number' ? userData.longestStreak : 0;
    const lastActivityDate = userData?.lastActivityDate || null;
    const streakUpdate = calculateStreakUpdate(currentStreak, longestStreak, lastActivityDate, today);

    const currentXp = typeof userData?.xp === 'number' ? userData.xp : 0;
    const newTotalXp = currentXp + commentXp;
    const newLevel = calculateLevel(newTotalXp).currentLevel;

    transaction.set(userDocRef, {
      xp: newTotalXp,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastActivityDate: today,
      updatedAt: now,
    }, { merge: true });

    const gamificationRef = db.collection('userGamification').doc(callerUid);
    transaction.set(gamificationRef, {
      userId: callerUid,
      xp: newTotalXp,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastActivityDate: today,
      updatedAt: now,
    }, { merge: true });

    return {
      success: true,
      commentId: commentRef.id,
      awardedXp: commentXp,
      totalXp: newTotalXp,
    };
  });
});

/**
 * Seed Initial Rewards Catalogue via Cloud Function.
 */
export const seedInitialRewards = functions.https.onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication is required.');
  }

  const batch = db.batch();
  const now = new Date().toISOString();

  for (const reward of INITIAL_REWARDS) {
    const docRef = db.collection('rewards').doc(reward.id);
    batch.set(
      docRef,
      {
        ...reward,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  await batch.commit();

  return { success: true, count: INITIAL_REWARDS.length };
});


