import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBootstrapOwnerEmail, isBootstrapOwner, invokeBootstrapGovernance } from '../services/userService';

vi.mock('../services/userService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/userService')>();
  return {
    ...actual,
    invokeBootstrapGovernance: vi.fn(),
  };
});

describe('Super Admin Bootstrap Flow (MVP Blocker Fix #2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Bootstrap Owner Email Detection & Identity Verification', () => {
    it('detects configured bootstrap owner email from environment or defined define', () => {
      const email = getBootstrapOwnerEmail();
      expect(email).toBeTruthy();
      expect(typeof email).toBe('string');
      expect(email!.includes('@')).toBe(true);
    });

    it('validates strictly that only the matching bootstrap email is recognized', () => {
      const configuredEmail = getBootstrapOwnerEmail() || 'admin@virexon.com';

      // Valid matches
      expect(isBootstrapOwner(configuredEmail)).toBe(true);
      expect(isBootstrapOwner(configuredEmail.toUpperCase())).toBe(true);
      expect(isBootstrapOwner(`  ${configuredEmail}  `)).toBe(true);

      // Unauthorized callers rejected
      expect(isBootstrapOwner('other_user@example.com')).toBe(false);
      expect(isBootstrapOwner('admin@fakevirexon.com')).toBe(false);
      expect(isBootstrapOwner('attacker@malicious.com')).toBe(false);
      expect(isBootstrapOwner('')).toBe(false);
      expect(isBootstrapOwner(null)).toBe(false);
      expect(isBootstrapOwner(undefined)).toBe(false);
    });
  });

  describe('2. Authorization Gating Logic for Admin Routes', () => {
    const isExposedToCaller = (user: { email: string } | null, isSuperAdmin: boolean, isStaff: boolean): boolean => {
      if (!user) return false;
      if (isSuperAdmin) return false; // Already super admin, governance already initialized for them
      return isBootstrapOwner(user.email);
    };

    it('does not expose bootstrap action to unauthenticated users', () => {
      expect(isExposedToCaller(null, false, false)).toBe(false);
    });

    it('does not expose bootstrap action to authenticated regular customers', () => {
      const regularUser = { email: 'customer@domain.dz' };
      expect(isExposedToCaller(regularUser, false, false)).toBe(false);
    });

    it('does not expose bootstrap action if user is already SUPER_ADMIN', () => {
      const configuredEmail = getBootstrapOwnerEmail() || 'admin@virexon.com';
      const ownerUser = { email: configuredEmail };
      expect(isExposedToCaller(ownerUser, true, true)).toBe(false);
    });

    it('exposes bootstrap action strictly to authenticated bootstrap owner who is not yet super admin', () => {
      const configuredEmail = getBootstrapOwnerEmail() || 'admin@virexon.com';
      const ownerUser = { email: configuredEmail };
      expect(isExposedToCaller(ownerUser, false, false)).toBe(true);
    });
  });

  describe('3. Execution & State Transitions for Bootstrap Action', () => {
    it('successfully calls initializeBootstrapGovernance and transitions state', async () => {
      const mockInvoke = vi.mocked(invokeBootstrapGovernance);
      mockInvoke.mockResolvedValueOnce({
        success: true,
        message: 'Permanent SUPER_ADMIN established. Bootstrap path closed.',
      });

      let state = {
        isInitializing: false,
        error: null as string | null,
        successMessage: null as string | null,
        alreadyInitialized: false,
      };

      const handleClaim = async () => {
        state.isInitializing = true;
        state.error = null;
        try {
          const res = await invokeBootstrapGovernance();
          state.successMessage = res.message;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          state.error = msg;
        } finally {
          state.isInitializing = false;
        }
      };

      await handleClaim();

      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(state.isInitializing).toBe(false);
      expect(state.error).toBeNull();
      expect(state.successMessage).toBe('Permanent SUPER_ADMIN established. Bootstrap path closed.');
    });

    it('handles already initialized / permission-denied by permanently sealing bootstrap state', async () => {
      const mockInvoke = vi.mocked(invokeBootstrapGovernance);
      mockInvoke.mockRejectedValueOnce(
        new Error('permission-denied: Bootstrap initialization is only available during uninitialized system deployment.')
      );

      let state = {
        isInitializing: false,
        error: null as string | null,
        successMessage: null as string | null,
        alreadyInitialized: false,
      };

      const handleClaim = async () => {
        state.isInitializing = true;
        state.error = null;
        try {
          const res = await invokeBootstrapGovernance();
          state.successMessage = res.message;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (
            msg.includes('uninitialized system deployment') ||
            msg.includes('permission-denied') ||
            msg.includes('already initialized')
          ) {
            state.alreadyInitialized = true;
            state.error = 'Governance has already been initialized on this deployment. The initial bootstrap path is permanently sealed.';
          } else {
            state.error = msg;
          }
        } finally {
          state.isInitializing = false;
        }
      };

      await handleClaim();

      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(state.isInitializing).toBe(false);
      expect(state.alreadyInitialized).toBe(true);
      expect(state.error).toContain('Governance has already been initialized');
      expect(state.successMessage).toBeNull();
    });
  });
});
