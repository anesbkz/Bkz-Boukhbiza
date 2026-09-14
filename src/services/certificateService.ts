import { db, functionsInstance } from '@/config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { SchoolCertificate, PublicCertificate } from '@/types/models';

export interface PublicCertificateVerificationResult {
  isValid: boolean;
  message?: string;
  status?: 'ACTIVE' | 'REVOKED';
  isRevoked?: boolean;
  certificateNumber?: string;
  recipientName?: string;
  courseTitle?: string;
  courseId?: string;
  issuer?: string;
  issuedAt?: string;
  completedAt?: string;
  certificateType?: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
  educationalDisclaimer?: string;
}

/**
 * Retrieves all issued educational certificates for the authenticated student.
 */
export async function getUserCertificates(userId: string): Promise<SchoolCertificate[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'certificates'),
      where('userId', '==', userId),
      orderBy('issuedAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SchoolCertificate, 'id'>),
    }));
  } catch (err) {
    console.warn('Fallback query without compound orderBy:', err);
    try {
      const qFallback = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        limit(50)
      );
      const snap = await getDocs(qFallback);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SchoolCertificate, 'id'>),
      }));
      list.sort((a, b) => new Date(b.issuedAt || 0).getTime() - new Date(a.issuedAt || 0).getTime());
      return list;
    } catch (fallbackErr) {
      console.error('Failed to retrieve student certificates:', fallbackErr);
      return [];
    }
  }
}

/**
 * Retrieves a single certificate document by ID.
 */
export async function getCertificateById(certificateId: string): Promise<SchoolCertificate | null> {
  if (!certificateId) return null;
  try {
    const snap = await getDoc(doc(db, 'certificates', certificateId));
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      ...(snap.data() as Omit<SchoolCertificate, 'id'>),
    };
  } catch (err) {
    console.error(`Failed to load certificate "${certificateId}":`, err);
    return null;
  }
}

/**
 * Authoritatively issues / claims a certificate upon 100% curriculum completion.
 * Fully idempotent: re-calling for an already issued course returns the existing certificate.
 */
export async function claimCourseCertificate(courseId: string): Promise<SchoolCertificate> {
  const callable = httpsCallable<
    { courseId: string },
    { success: boolean; certificate: SchoolCertificate }
  >(functionsInstance, 'issueCourseCertificate');

  try {
    const res = await callable({ courseId });
    return res.data.certificate;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to claim course certificate.');
  }
}

/**
 * Publicly verifies an educational certificate using its certificate number or verification token.
 * Non-enumerable: cannot list certificates; only validates specific presented credentials.
 */
export async function verifyCertificatePublic(identifier: string): Promise<PublicCertificateVerificationResult> {
  const clean = (identifier || '').trim();
  if (!clean) {
    return {
      isValid: false,
      message: 'Please provide a valid certificate number or verification token.',
    };
  }

  // Attempt authoritative Cloud Function verification first
  try {
    const callable = httpsCallable<
      { identifier: string },
      PublicCertificateVerificationResult
    >(functionsInstance, 'verifyCertificate');
    const res = await callable({ identifier: clean });
    return res.data;
  } catch (funcErr) {
    console.warn('Cloud Function verification fallback to direct Firestore read:', funcErr);

    // Fallback direct read to publicCertificates collection
    try {
      const pubDocRef = doc(db, 'publicCertificates', clean.toUpperCase());
      const snap = await getDoc(pubDocRef);
      if (snap.exists()) {
        const data = snap.data() as PublicCertificate;
        return {
          isValid: true,
          status: data.status,
          isRevoked: data.status === 'REVOKED',
          certificateNumber: data.certificateNumber,
          recipientName: data.recipientName,
          courseTitle: data.courseTitle,
          courseId: data.courseId,
          issuer: data.issuer,
          issuedAt: data.issuedAt,
          completedAt: data.completedAt,
          certificateType: data.certificateType,
          revokedAt: data.revokedAt,
          revocationReason: data.revocationReason,
          educationalDisclaimer:
            'Certificates issued by ZIRON Restart School are educational completion credentials only. They do not certify medical treatment, addiction recovery, scientific claims, or clinical outcomes.',
        };
      }
    } catch {
      // Ignored
    }

    return {
      isValid: false,
      message: 'Certificate not found or identifier is invalid.',
    };
  }
}

/**
 * Admin: List all certificates for administrative management and auditing.
 */
export async function listAllCertificatesAdmin(): Promise<SchoolCertificate[]> {
  try {
    const q = query(
      collection(db, 'certificates'),
      orderBy('issuedAt', 'desc'),
      limit(200)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SchoolCertificate, 'id'>),
    }));
  } catch (err) {
    console.warn('Fallback admin list query without orderBy:', err);
    try {
      const qFallback = query(collection(db, 'certificates'), limit(200));
      const snap = await getDocs(qFallback);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SchoolCertificate, 'id'>),
      }));
      list.sort((a, b) => new Date(b.issuedAt || 0).getTime() - new Date(a.issuedAt || 0).getTime());
      return list;
    } catch (fallbackErr) {
      console.error('Failed to load certificates for admin:', fallbackErr);
      return [];
    }
  }
}

/**
 * Admin: Authoritatively revoke a certificate with required compliance reasoning.
 */
export async function revokeCertificateAdmin(
  certificateId: string,
  reason: string
): Promise<{ success: boolean; certificateId: string; status: string }> {
  const callable = httpsCallable<
    { certificateId: string; reason: string },
    { success: boolean; certificateId: string; status: string }
  >(functionsInstance, 'revokeCertificate');

  try {
    const res = await callable({ certificateId, reason });
    return res.data;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to revoke certificate.');
  }
}
