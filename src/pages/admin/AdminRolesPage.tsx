import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types/models';
import { AppRole, AppPermission } from '@/types/rbac';
import { listAllUsers, adminUpdateUserRoles } from '@/services/userService';
import {
  ALL_ROLES,
  validateRoleTransition,
  getEffectivePermissions,
  isSuperAdmin as checkIsSuperAdmin,
} from '@/lib/rbac/permissions';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  Check,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const AdminRolesPage: React.FC = () => {
  const { profile, isSuperAdmin, isAdmin, hasPermission } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pendingRoles, setPendingRoles] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmPrompt, setConfirmPrompt] = useState(false);

  const canManageRoles = isSuperAdmin || hasPermission('MANAGE_ROLES');

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const data = await listAllUsers(100);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.uid?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const openRoleEditor = (user: UserProfile) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setConfirmPrompt(false);
    setSelectedUser(user);
    setPendingRoles([...user.roles]);
  };

  const closeRoleEditor = () => {
    setSelectedUser(null);
    setPendingRoles([]);
    setErrorMessage(null);
    setConfirmPrompt(false);
  };

  const toggleRoleSelection = (role: AppRole) => {
    if (pendingRoles.includes(role)) {
      setPendingRoles(pendingRoles.filter((r) => r !== role));
    } else {
      setPendingRoles([...pendingRoles, role]);
    }
  };

  // Preview effective permissions calculated dynamically
  const previewEffectivePermissions = useMemo(() => {
    return getEffectivePermissions(pendingRoles);
  }, [pendingRoles]);

  const validation = useMemo(() => {
    if (!profile || !selectedUser) return { allowed: false, reason: 'No selection' };
    return validateRoleTransition(profile, selectedUser, pendingRoles);
  }, [profile, selectedUser, pendingRoles]);

  const isGrantingPrivilegedRole = useMemo(() => {
    return pendingRoles.includes('SUPER_ADMIN') || pendingRoles.includes('ADMIN');
  }, [pendingRoles]);

  const handleApplyRoles = async () => {
    if (!profile || !selectedUser) return;
    if (!validation.allowed) {
      setErrorMessage(validation.reason || 'Invalid role transition.');
      return;
    }

    if (isGrantingPrivilegedRole && !confirmPrompt) {
      setConfirmPrompt(true);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await adminUpdateUserRoles(selectedUser.uid, pendingRoles, profile);
      setSuccessMessage(
        `Successfully updated roles for ${selectedUser.displayName || selectedUser.email}.`
      );
      closeRoleEditor();
      await loadDirectory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update roles.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Governance Dossier */}
      <div className="bg-white border border-[#E2E8F0] p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              PRIVILEGE GOVERNANCE & ROLE MATRIX
            </div>
            <h1 className="text-xl font-black text-[#0B2346]">Role & Privilege Governance</h1>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              Inspect subject permissions, promote qualified personnel, and enforce strict least-privilege role boundaries. Changes are authoritative, protected by Firestore rules, and permanently logged.
            </p>
          </div>

          <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] shrink-0 font-mono text-xs">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Your Governance Clearance</div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 font-bold text-[10px] uppercase ${
                  isSuperAdmin
                    ? 'bg-red-100 text-red-800'
                    : isAdmin
                    ? 'bg-blue-100 text-[#0B2346]'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isSuperAdmin ? 'ROOT SUPER_ADMIN' : isAdmin ? 'SYSTEM ADMIN' : 'STAFF MEMBER'}
              </span>
              <span className="text-gray-500 text-[10px]">
                {isSuperAdmin ? 'Full Elevation Authority' : 'Standard Delegation (No Escalation)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold font-mono text-xs cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Directory Controls */}
      <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject name, email, or UID..."
            className="w-full ps-9 pe-3 py-2 text-xs border border-[#E2E8F0] focus:outline-none focus:border-[#0B2346]"
          />
        </div>

        <button
          onClick={loadDirectory}
          className="px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-mono font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer shrink-0"
        >
          Refresh Directory
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
            SYNCHRONIZING AUTHORITATIVE ROLES FROM CLOUD FIRESTORE...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center bg-[#F5F7FA]">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700">No matching subjects found</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {searchQuery ? 'Adjust your search query.' : 'Subject accounts will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-gray-600 font-mono text-[11px]">
                  <th className="py-3 px-4 text-start font-bold">SUBJECT / EMAIL</th>
                  <th className="py-3 px-4 text-start font-bold">ASSIGNED ROLES</th>
                  <th className="py-3 px-4 text-start font-bold">STATUS</th>
                  <th className="py-3 px-4 text-start font-bold">PERMISSIONS</th>
                  <th className="py-3 px-4 text-end font-bold">GOVERNANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const targetIsSuperAdmin = checkIsSuperAdmin(u);
                  const effectivePerms = getEffectivePermissions(u.roles || ['CUSTOMER']);
                  const isBlockedForActor = targetIsSuperAdmin && !isSuperAdmin;

                  return (
                    <tr key={u.uid} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B2346]">{u.displayName || 'Subject'}</div>
                        <div className="text-gray-500 text-[11px] font-mono">{u.email}</div>
                        <div className="text-[10px] text-gray-400 font-mono">UID: {u.uid.slice(0, 14)}...</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.map((r) => (
                            <span
                              key={r}
                              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                                r === 'SUPER_ADMIN'
                                  ? 'bg-red-100 text-red-800'
                                  : r === 'ADMIN'
                                  ? 'bg-blue-100 text-[#0B2346]'
                                  : r === 'CUSTOMER'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-indigo-50 text-indigo-800'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="font-bold text-[#0B2346]">{effectivePerms.length}</span>{' '}
                        <span className="text-gray-500">grants active</span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        {canManageRoles && (
                          <button
                            onClick={() => openRoleEditor(u)}
                            disabled={isBlockedForActor}
                            title={
                              isBlockedForActor
                                ? 'Privilege Guard: Only a SUPER_ADMIN can modify a SUPER_ADMIN'
                                : 'Configure subject privileges'
                            }
                            className={`px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                              isBlockedForActor
                                ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                                : 'border-[#0B2346] text-[#0B2346] hover:bg-[#0B2346] hover:text-white'
                            }`}
                          >
                            {isBlockedForActor ? (
                              <span className="inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            ) : (
                              'Govern Roles'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Modification Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">
                  Privilege Governance Inspection
                </div>
                <h2 className="text-base font-bold text-[#0B2346]">
                  {selectedUser.displayName || selectedUser.email}
                </h2>
              </div>
              <span className="text-[11px] font-mono text-gray-500">{selectedUser.email}</span>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Current vs New Visual Comparison */}
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-[#F5F7FA] border border-[#E2E8F0] text-xs">
              <div>
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold mb-1">
                  Current Roles
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.roles.map((r) => (
                    <span key={r} className="px-1.5 py-0.5 bg-gray-200 text-gray-800 text-[10px] font-mono">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-[#0B2346] font-bold mb-1 flex items-center gap-1">
                  <span>Target Roles</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {pendingRoles.map((r) => (
                    <span
                      key={r}
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                        r === 'SUPER_ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : r === 'ADMIN'
                          ? 'bg-blue-100 text-[#0B2346]'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Role Checkboxes */}
            <div className="space-y-1.5 mb-6">
              <div className="text-[11px] font-mono uppercase font-bold text-gray-500 mb-2">
                Select Authorized Roles
              </div>
              {ALL_ROLES.map((role) => {
                const isSelected = pendingRoles.includes(role);
                const isSuperAdminOption = role === 'SUPER_ADMIN';
                const isSuperAdminDisabled = isSuperAdminOption && !isSuperAdmin;

                return (
                  <button
                    key={role}
                    type="button"
                    disabled={isSuperAdminDisabled}
                    onClick={() => toggleRoleSelection(role)}
                    className={`w-full flex items-center justify-between p-2.5 border text-xs font-mono font-semibold cursor-pointer transition-colors ${
                      isSuperAdminDisabled
                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#0B2346] text-white border-[#0B2346]'
                        : 'bg-white text-gray-700 border-[#E2E8F0] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{role}</span>
                      {isSuperAdminDisabled && (
                        <span className="text-[10px] font-normal text-gray-400 font-sans">
                          (Requires root SUPER_ADMIN)
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Effective Permissions Preview */}
            <div className="mb-6 border border-[#E2E8F0] p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase font-bold text-[#0B2346]">
                  Calculated Effective Permissions Preview
                </span>
                <span className="px-1.5 py-0.5 bg-blue-50 text-[#0B2346] text-[10px] font-mono font-bold">
                  {previewEffectivePermissions.length} Active Grants
                </span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 bg-[#F5F7FA]">
                {previewEffectivePermissions.length === 0 ? (
                  <span className="text-gray-400 text-[11px] italic">No permissions assigned.</span>
                ) : (
                  previewEffectivePermissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-1.5 py-0.5 bg-white border border-gray-200 text-[10px] font-mono text-gray-700"
                    >
                      {perm}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Privileged Escalation Confirmation Prompt */}
            {confirmPrompt && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Elevated Authority Confirmation Required
                </div>
                <p className="text-amber-800 text-[11px] mb-3">
                  You are about to grant administrative access ({pendingRoles.join(', ')}). This operation will be authoritatively committed to Firestore and permanently recorded in the immutable audit log.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmPrompt(false)}
                    className="px-3 py-1 bg-white border border-amber-300 text-amber-900 text-xs font-semibold cursor-pointer"
                  >
                    Back to Review
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyRoles}
                    disabled={saving}
                    className="px-4 py-1 bg-red-700 text-white text-xs font-bold hover:bg-red-800 cursor-pointer"
                  >
                    {saving ? 'Executing Authority...' : 'Confirm & Commit Privileges'}
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!confirmPrompt && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeRoleEditor}
                  className="px-3 py-1.5 border border-[#E2E8F0] text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyRoles}
                  disabled={saving || !validation.allowed}
                  className="px-4 py-1.5 bg-[#0B2346] text-white text-xs font-semibold hover:bg-[#07162c] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? 'Validating...' : 'Review & Apply Roles'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
