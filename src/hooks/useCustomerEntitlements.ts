import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getUserEntitlements,
  getUserActivations,
} from '@/services/entitlementService';
import { EntitlementRecord, ActivationRecord } from '@/types/entitlements';

export interface CustomerEntitlementState {
  loading: boolean;
  hasActivatedProduct: boolean;
  hasCommunityAccess: boolean;
  hasSchoolAccess: boolean;
  qualifyingContainerCount: number;
  activations: ActivationRecord[];
  entitlements: EntitlementRecord[];
  latestActivation: ActivationRecord | null;
  refresh: () => Promise<void>;
}

export function evaluateCustomerEntitlements(params: {
  activations: Pick<ActivationRecord, 'code'>[];
  entitlements: Pick<EntitlementRecord, 'entitlementType' | 'status'>[];
  isStaff: boolean;
  profile?: { schoolAccess?: boolean } | null;
}) {
  // Qualification logic:
  // Count distinct activated container identities (code values) belonging to user from trusted activation records
  const distinctContainerCodes = new Set<string>();
  params.activations.forEach((a) => {
    const codeVal = (a.code || '').trim().toUpperCase();
    if (codeVal) {
      distinctContainerCodes.add(codeVal);
    }
  });
  const qualifyingContainerCount = distinctContainerCodes.size;

  // Authoritative entitlement check: Staff bypass OR authoritative ACTIVE entitlement document.
  const hasCommunityAccess = Boolean(
    params.isStaff ||
    params.entitlements.some(
      (e) => e.entitlementType === 'COMMUNITY_ACCESS' && e.status === 'ACTIVE'
    )
  );

  // Authoritative School authorization rule:
  // isStaff OR qualifyingContainerCount >= 3 OR authoritative active SCHOOL_ACCESS entitlement.
  // Note: Never relies on client-controlled profile flags or non-active entitlement states.
  const hasSchoolAccess = Boolean(
    params.isStaff ||
    qualifyingContainerCount >= 3 ||
    params.entitlements.some(
      (e) => e.entitlementType === 'SCHOOL_ACCESS' && e.status === 'ACTIVE'
    )
  );

  return {
    qualifyingContainerCount,
    hasCommunityAccess,
    hasSchoolAccess,
  };
}

export function useCustomerEntitlements(): CustomerEntitlementState {
  const { user, profile, refreshProfile, isStaff } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [activations, setActivations] = useState<ActivationRecord[]>([]);
  const [entitlements, setEntitlements] = useState<EntitlementRecord[]>([]);

  const loadData = useCallback(async () => {
    if (!user) {
      setActivations([]);
      setEntitlements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [acts, ents] = await Promise.all([
        getUserActivations(user.uid),
        getUserEntitlements(user.uid),
      ]);
      setActivations(acts);
      setEntitlements(ents);
    } catch (err) {
      console.warn('Error loading customer entitlements or activations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await refreshProfile();
    await loadData();
  }, [refreshProfile, loadData]);

  const hasActivatedProduct = activations.length > 0;

  const { qualifyingContainerCount, hasCommunityAccess, hasSchoolAccess } =
    evaluateCustomerEntitlements({
      activations,
      entitlements,
      isStaff,
      profile,
    });

  const latestActivation = activations.length > 0 ? activations[0] : null;

  return {
    loading,
    hasActivatedProduct,
    hasCommunityAccess,
    hasSchoolAccess,
    qualifyingContainerCount,
    activations,
    entitlements,
    latestActivation,
    refresh,
  };
}
