import { db } from '@/config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { AuditLogEntry, AuditActionType } from '@/types/models';
import { AppRole } from '@/types/rbac';

export interface CreateAuditLogParams {
  actorUserId: string;
  actorEmail?: string;
  actorRoles: AppRole[];
  action: AuditActionType;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Client-Side Telemetry Logger
 * NOTE ON SECURITY ARCHITECTURE:
 * Direct client creation of authoritative audit logs in Firestore is strictly forbidden by rules.
 * All authoritative security audit events (role mutations, code activations, certificate issuance,
 * status changes) are written authoritatively on the server via Cloud Functions.
 * This client helper provides harmless client logging / telemetry without forging secure audit trails.
 */
export async function logAuditEvent(params: CreateAuditLogParams): Promise<string> {
  try {
    console.debug(
      `[Audit Telemetry - Client Event] ${params.action} on ${params.resourceType}:${params.resourceId}`,
      params.metadata
    );
    return 'client-telemetry-logged';
  } catch (error) {
    console.warn('Audit telemetry logging exception:', error);
    return '';
  }
}

/**
 * Lists authoritative recent audit logs.
 * Restricted by Firestore rules to SUPER_ADMIN, ADMIN, and ANALYST roles.
 */
export async function listRecentAuditLogs(maxEntries: number = 50): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(maxEntries)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<AuditLogEntry, 'id'>),
    }));
  } catch (error) {
    console.warn('Unable to load authoritative audit logs:', error);
    return [];
  }
}
