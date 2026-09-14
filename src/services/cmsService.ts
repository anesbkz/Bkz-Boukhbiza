import { db, functionsInstance } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { UserProfile } from '@/types/models';

export interface CmsContentDoc {
  sectionKey: string;
  data: Record<string, unknown>;
  updatedAt: string;
  updatedBy: string;
}

export async function getCmsSection<T = Record<string, unknown>>(
  sectionKey: string
): Promise<T | null> {
  try {
    const docRef = doc(db, 'cmsContent', sectionKey);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return (snap.data() as CmsContentDoc).data as T;
  } catch (error) {
    console.warn(`CMS section ${sectionKey} not found or permission denied:`, error);
    return null;
  }
}

/**
 * Authoritative Server-Side CMS Section Update
 * Invocations route through Cloud Function `updateCmsSection`.
 * Client-side setDoc is forbidden by Firestore rules.
 * Server writes content and authoritative audit log atomically.
 */
export async function updateCmsSection(
  sectionKey: string,
  data: Record<string, unknown>,
  _actor?: UserProfile
): Promise<void> {
  const updateCmsCallable = httpsCallable<
    { sectionKey: string; data: Record<string, unknown> },
    { success: boolean; sectionKey: string }
  >(functionsInstance, 'updateCmsSection');

  try {
    await updateCmsCallable({ sectionKey, data });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update CMS section via server authority.');
  }
}

