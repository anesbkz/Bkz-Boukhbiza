import { db, functionsInstance } from '@/config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { UserProfile, CustomerRegistrationPayload, CustomerProfileUpdatePayload } from '@/types/models';
import { AppRole } from '@/types/rbac';
import { validateRoleTransition, isSuperAdmin, hasPermission } from '@/lib/rbac/permissions';
import { calculateProfileCompleteness } from '@/lib/validation/profileValidation';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data() as UserProfile;
    
    // Lazy migration / backwards compatibility for existing user accounts
    const completeness = data.profileCompleteness ?? calculateProfileCompleteness(data);
    return {
      ...data,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || data.phoneNumber || '',
      phoneNumber: data.phoneNumber || data.phone || '',
      country: data.country || '',
      wilaya: data.wilaya || '',
      city: data.city || '',
      address: data.address || '',
      preferredLanguage: data.preferredLanguage || (data.locale as 'ar' | 'fr' | 'en') || 'en',
      profilePhotoUrl: data.profilePhotoUrl ?? data.photoURL ?? null,
      emailVerified: data.emailVerified ?? false,
      phoneVerified: data.phoneVerified ?? false,
      profileCompleteness: completeness,
    };
  } catch (error) {
    console.error(`Error getting user profile for ${uid}:`, error);
    return null;
  }
}

export async function createInitialUserProfile(
  uid: string,
  email: string,
  displayName: string,
  _initialRoles: AppRole[] = ['CUSTOMER'],
  registrationData?: Partial<CustomerRegistrationPayload>
): Promise<UserProfile> {
  const now = new Date().toISOString();

  const firstName = registrationData?.firstName?.trim() || '';
  const lastName = registrationData?.lastName?.trim() || '';
  const calculatedDisplayName = displayName || 
    (firstName && lastName ? `${firstName} ${lastName}` : '') || 
    email.split('@')[0];

  const phone = registrationData?.phone?.trim() || '';
  const country = registrationData?.country?.trim() || 'Algeria';
  const wilaya = registrationData?.wilaya?.trim() || '';
  const city = registrationData?.city?.trim() || '';
  const address = registrationData?.address?.trim() || '';
  const preferredLanguage = registrationData?.preferredLanguage || 'en';
  const dateOfBirth = registrationData?.dateOfBirth?.trim() || '';
  const termsAcceptedAt = registrationData?.agreeTerms ? now : null;
  const privacyAcceptedAt = registrationData?.agreeTerms ? now : null;

  // Base profile conforming strictly to Firestore rule constraints:
  // Customer registration flow ALWAYS creates roles: ['CUSTOMER'] with safe defaults.
  // NEVER elevates privileges, NEVER assigns SUPER_ADMIN or ADMIN, NEVER grants
  // communityAccess or schoolAccess without product activation.
  // Server-authoritative verification flags (emailVerified, phoneVerified) are excluded
  // entirely from the client-created document. emailVerified is derived from Firebase Auth,
  // and phoneVerified requires verified OTP workflow.
  const docData = {
    uid,
    email,
    displayName: calculatedDisplayName,
    firstName,
    lastName,
    dateOfBirth,
    phone,
    phoneNumber: phone,
    country,
    wilaya,
    city,
    address,
    preferredLanguage,
    profilePhotoUrl: null,
    photoURL: '',
    termsAcceptedAt,
    privacyAcceptedAt,
    termsVersion: '1.0',
    privacyVersion: '1.0',
    status: 'active' as const,
    roles: ['CUSTOMER'] as AppRole[],
    createdAt: now,
    updatedAt: now,
    onboardingCompleted: false,
    communityAccess: false,
    schoolAccess: false,
    xp: 0,
    level: 1,
    locale: preferredLanguage,
    profileCompleteness: 0,
  };

  docData.profileCompleteness = calculateProfileCompleteness(docData as unknown as UserProfile);

  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, docData);

  const profile: UserProfile = {
    ...docData,
    emailVerified: false,
    phoneVerified: false,
  };

  return profile;
}

/**
 * Dedicated Initial Bootstrap Invocation
 * Dedicated server-authoritative mechanism to initialize root SUPER_ADMIN.
 * Completely isolated from customer registration.
 */
export async function invokeBootstrapGovernance(): Promise<{ success: boolean; message: string }> {
  const callable = httpsCallable<void, { success: boolean; message: string }>(
    functionsInstance,
    'initializeBootstrapGovernance'
  );
  const result = await callable();
  return result.data;
}

export async function updateSafeProfileFields(
  uid: string,
  fields: CustomerProfileUpdatePayload,
  currentProfile?: Partial<UserProfile>
): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  const now = new Date().toISOString();

  // Construct clean payload containing only permitted safe fields
  const safeData: Record<string, unknown> = {
    updatedAt: now,
  };

  if (fields.displayName !== undefined) safeData.displayName = fields.displayName.trim();
  if (fields.firstName !== undefined) safeData.firstName = fields.firstName.trim();
  if (fields.lastName !== undefined) safeData.lastName = fields.lastName.trim();
  if (fields.dateOfBirth !== undefined) safeData.dateOfBirth = fields.dateOfBirth.trim();
  if (fields.phone !== undefined) {
    safeData.phone = fields.phone.trim();
    safeData.phoneNumber = fields.phone.trim();
  }
  if (fields.phoneNumber !== undefined && safeData.phone === undefined) {
    safeData.phone = fields.phoneNumber.trim();
    safeData.phoneNumber = fields.phoneNumber.trim();
  }
  if (fields.country !== undefined) safeData.country = fields.country.trim();
  if (fields.wilaya !== undefined) safeData.wilaya = fields.wilaya.trim();
  if (fields.city !== undefined) safeData.city = fields.city.trim();
  if (fields.address !== undefined) safeData.address = fields.address.trim();
  if (fields.preferredLanguage !== undefined) {
    safeData.preferredLanguage = fields.preferredLanguage;
    safeData.locale = fields.preferredLanguage;
  }
  if (fields.profilePhotoUrl !== undefined) {
    safeData.profilePhotoUrl = fields.profilePhotoUrl;
    safeData.photoURL = fields.profilePhotoUrl || '';
  }
  if (fields.locale !== undefined && safeData.preferredLanguage === undefined) {
    safeData.locale = fields.locale;
  }
  if (fields.onboardingCompleted !== undefined) {
    safeData.onboardingCompleted = fields.onboardingCompleted;
  }

  // Update auto-calculated completeness score
  if (currentProfile) {
    const merged = { ...currentProfile, ...safeData };
    safeData.profileCompleteness = calculateProfileCompleteness(merged);
  }

  await updateDoc(userDocRef, safeData);
}

/**
 * Administrative Role Governance
 * AUTHORITATIVE ARCHITECTURE:
 * Calls the server-side Cloud Function `assignUserRoles`.
 * Prevents client-side privilege escalation and ensures SUPER_ADMIN guard enforcement.
 */
export async function adminUpdateUserRoles(
  targetUid: string,
  newRoles: AppRole[],
  actor: UserProfile
): Promise<void> {
  // 1. Fetch current target user profile to inspect existing roles
  const targetUser = await getUserProfile(targetUid);
  if (!targetUser) {
    throw new Error(`Target user profile ${targetUid} not found.`);
  }

  // 2. Client-side sanity validation for immediate UX feedback
  const validation = validateRoleTransition(actor, targetUser, newRoles);
  if (!validation.allowed) {
    throw new Error(validation.reason || 'Unauthorized role transition.');
  }

  // 3. Invoke authoritative server-side Cloud Function
  const assignCallable = httpsCallable<
    { targetUid: string; newRoles: string[] },
    { success: boolean }
  >(functionsInstance, 'assignUserRoles');

  try {
    await assignCallable({ targetUid, newRoles });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update user roles via server authority.');
  }
}

/**
 * Administrative Account Status Governance
 * AUTHORITATIVE ARCHITECTURE:
 * Calls the server-side Cloud Function `updateUserStatus`.
 */
export async function adminUpdateUserStatus(
  targetUid: string,
  newStatus: UserProfile['status'],
  actor: UserProfile
): Promise<void> {
  if (!isSuperAdmin(actor) && !hasPermission(actor, 'MANAGE_USERS')) {
    throw new Error('Actor lacks MANAGE_USERS permission to change account status.');
  }

  const targetUser = await getUserProfile(targetUid);
  if (!targetUser) {
    throw new Error(`Target user profile ${targetUid} not found.`);
  }

  if (isSuperAdmin(targetUser) && !isSuperAdmin(actor)) {
    throw new Error('Privilege boundary: Only a SUPER_ADMIN can modify the status of a SUPER_ADMIN account.');
  }

  const statusCallable = httpsCallable<
    { targetUid: string; newStatus: string },
    { success: boolean }
  >(functionsInstance, 'updateUserStatus');

  try {
    await statusCallable({ targetUid, newStatus });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update user status via server authority.');
  }
}

export async function listAllUsers(maxUsers: number = 50): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), limit(maxUsers));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    console.warn('Unable to list users:', error);
    return [];
  }
}
