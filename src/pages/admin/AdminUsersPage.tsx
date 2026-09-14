import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types/models';
import { AppRole } from '@/types/rbac';
import { listAllUsers, adminUpdateUserRoles } from '@/services/userService';
import {
  Users,
  Shield,
  Loader2,
  Check,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
  FileCheck,
  Globe,
} from 'lucide-react';
import { calculateProfileCompleteness, maskPhoneNumber } from '@/lib/validation/profileValidation';

const AVAILABLE_ROLES: AppRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'CONTENT_MANAGER',
  'COMMUNITY_MANAGER',
  'SCHOOL_MANAGER',
  'PRODUCT_MANAGER',
  'ORDER_MANAGER',
  'SUPPORT',
  'ANALYST',
  'CUSTOMER',
];

export const AdminUsersPage: React.FC = () => {
  const { profile, isSuperAdmin, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unmaskedPhones, setUnmaskedPhones] = useState<Record<string, boolean>>({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await listAllUsers(100);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEditRoles = (u: UserProfile) => {
    setEditingUser(u);
    setSelectedRoles([...u.roles]);
    setErrorMessage(null);
  };

  const toggleRole = (role: AppRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const togglePhoneMask = (uid: string) => {
    setUnmaskedPhones((prev) => ({ ...prev, [uid]: !prev[uid] }));
  };

  const handleSaveRoles = async () => {
    if (!profile || !editingUser) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      await adminUpdateUserRoles(editingUser.uid, selectedRoles, profile);
      setEditingUser(null);
      await loadUsers();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Failed to update user roles.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            SUBJECT & STAFF REGISTRY
          </div>
          <h1 className="text-xl font-black text-[#0B2346]">User & Customer Directory</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Inspect verified customer profiles, contact records, geographical distribution, and govern privileges.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="px-3 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-mono font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer self-start sm:self-auto"
        >
          Refresh Directory
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E2E8F0] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
            FETCHING USER PROFILES FROM FIRESTORE...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center bg-[#F5F7FA]">
            <p className="text-xs font-bold text-gray-700">No user accounts found in Firestore</p>
            <p className="text-xs text-gray-500 mt-1">
              Registered subjects and staff profiles will appear here as accounts authenticate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-gray-600 font-mono text-[11px]">
                  <th className="py-3 px-4 text-start font-bold">PARTICIPANT / LOCATION</th>
                  <th className="py-3 px-4 text-start font-bold">CONTACT & VERIFICATION</th>
                  <th className="py-3 px-4 text-start font-bold">COMPLETENESS</th>
                  <th className="py-3 px-4 text-start font-bold">ROLES & ACCESS</th>
                  <th className="py-3 px-4 text-start font-bold">STATUS</th>
                  <th className="py-3 px-4 text-end font-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const completeness = u.profileCompleteness ?? calculateProfileCompleteness(u);
                  const phoneVal = u.phone || u.phoneNumber;
                  const isUnmasked = !!unmaskedPhones[u.uid];

                  return (
                    <tr key={u.uid} className="hover:bg-gray-50/70 transition-colors">
                      {/* Name & Location */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B2346]">
                          {u.firstName && u.lastName
                            ? `${u.firstName} ${u.lastName}`
                            : u.displayName || 'Subject'}
                        </div>
                        <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>
                            {u.city ? `${u.city}, ` : ''}
                            {u.wilaya ? `${u.wilaya}, ` : ''}
                            {u.country || 'Algeria'}
                          </span>
                        </div>
                      </td>

                      {/* Contact & Verification */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{u.email}</span>
                          {u.emailVerified ? (
                            <span title="Email Verified">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            </span>
                          ) : (
                            <span title="Email Unverified">
                              <AlertCircle className="w-3 h-3 text-amber-500" />
                            </span>
                          )}
                        </div>

                        {phoneVal && (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-600 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{isUnmasked ? phoneVal : maskPhoneNumber(phoneVal)}</span>
                            <button
                              onClick={() => togglePhoneMask(u.uid)}
                              className="text-[10px] text-blue-600 hover:underline cursor-pointer ml-1"
                            >
                              {isUnmasked ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Completeness */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600"
                              style={{ width: `${completeness}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-gray-700">
                            {completeness}%
                          </span>
                        </div>
                      </td>

                      {/* Roles & Access */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {u.roles?.map((r) => (
                            <span
                              key={r}
                              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                                r === 'SUPER_ADMIN'
                                  ? 'bg-red-100 text-red-800'
                                  : r === 'ADMIN'
                                  ? 'bg-blue-100 text-[#0B2346]'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] font-mono text-gray-400">
                          COM: {u.communityAccess ? 'YES' : 'NO'} • SCH: {u.schoolAccess ? 'YES' : 'NO'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-end">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectingUser(u)}
                            className="px-2 py-1 text-[11px] font-semibold border border-[#E2E8F0] hover:bg-gray-50 text-gray-700 cursor-pointer inline-flex items-center gap-1"
                            title="Inspect Complete Customer Dossier"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Dossier</span>
                          </button>
                          {(isSuperAdmin || isAdmin) && (
                            <button
                              onClick={() => openEditRoles(u)}
                              className="px-2 py-1 text-[11px] font-semibold border border-[#E2E8F0] hover:bg-gray-100 text-[#0B2346] cursor-pointer"
                            >
                              Roles
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOMER DOSSIER INSPECTOR MODAL */}
      {inspectingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] max-w-2xl w-full p-6 sm:p-8 shadow-xl relative my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider mb-1">
                  <FileCheck className="w-3 h-3" />
                  PARTICIPANT PROFILE DOSSIER
                </div>
                <h2 className="text-lg font-bold text-[#0B2346]">
                  {inspectingUser.firstName && inspectingUser.lastName
                    ? `${inspectingUser.firstName} ${inspectingUser.lastName}`
                    : inspectingUser.displayName || 'Subject'}
                </h2>
                <p className="text-xs font-mono text-gray-500">
                  UID: {inspectingUser.uid}
                </p>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Grid */}
            <div className="space-y-6 text-xs">
              {/* Personal */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Personal Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 border border-gray-100">
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">First Name</span>
                    <span className="font-semibold text-[#0B2346]">{inspectingUser.firstName || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Last Name</span>
                    <span className="font-semibold text-[#0B2346]">{inspectingUser.lastName || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Date of Birth</span>
                    <span className="font-mono font-semibold text-[#0B2346]">
                      {inspectingUser.dateOfBirth || '—'}
                    </span>
                    <span className="block text-[9px] text-emerald-700">Strictly Private</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Contact & Telemetry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-100">
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Electronic Mail</span>
                    <span className="font-mono text-[#0B2346]">{inspectingUser.email}</span>
                    <span className="block text-[10px] mt-0.5">
                      {inspectingUser.emailVerified ? (
                        <span className="text-emerald-600 font-semibold">Email Verified</span>
                      ) : (
                        <span className="text-amber-600 font-semibold">Email Verification Pending</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Telephone</span>
                    <span className="font-mono text-[#0B2346]">
                      {inspectingUser.phone || inspectingUser.phoneNumber || '—'}
                    </span>
                    <span className="block text-[10px] mt-0.5">
                      {inspectingUser.phoneVerified ? (
                        <span className="text-emerald-600 font-semibold">Phone Verified</span>
                      ) : (
                        <span className="text-gray-500">Phone Verification Pending</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Jurisdiction & Shipping Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-gray-50 border border-gray-100">
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Country</span>
                    <span className="font-semibold text-[#0B2346]">{inspectingUser.country || 'Algeria'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Wilaya / State</span>
                    <span className="font-semibold text-[#0B2346]">{inspectingUser.wilaya || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">City</span>
                    <span className="font-semibold text-[#0B2346]">{inspectingUser.city || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Physical Address</span>
                    <span className="text-[#0B2346]">{inspectingUser.address || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Preferences & Meta */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-gray-500 mb-2">
                  System Preferences & Acceptance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 border border-gray-100">
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Preferred Language</span>
                    <span className="font-semibold uppercase text-[#0B2346]">
                      {inspectingUser.preferredLanguage || inspectingUser.locale || 'en'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Profile Completeness</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {inspectingUser.profileCompleteness ?? calculateProfileCompleteness(inspectingUser)}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase">Enrolled Since</span>
                    <span className="font-mono text-gray-600">
                      {inspectingUser.createdAt ? new Date(inspectingUser.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-4 py-1.5 bg-[#0B2346] text-white text-xs font-semibold hover:bg-[#07162c] cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modification Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] max-w-md w-full p-6 shadow-xl relative">
            <h2 className="text-base font-bold text-[#0B2346] mb-1">
              Govern Roles for {editingUser.displayName || editingUser.email}
            </h2>
            <p className="text-xs text-gray-600 mb-4 font-mono">
              UID: {editingUser.uid}
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2 mb-6">
              {AVAILABLE_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role);
                const isSuperAdminOption = role === 'SUPER_ADMIN';
                if (isSuperAdminOption && !isSuperAdmin) return null;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`w-full flex items-center justify-between p-2.5 border text-xs font-mono font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0B2346] text-white border-[#0B2346]'
                        : 'bg-white text-gray-700 border-[#E2E8F0] hover:bg-gray-50'
                    }`}
                  >
                    <span>{role}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-3 py-1.5 border border-[#E2E8F0] text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoles}
                disabled={saving}
                className="px-4 py-1.5 bg-[#0B2346] text-white text-xs font-semibold hover:bg-[#07162c] cursor-pointer"
              >
                {saving ? 'Saving...' : 'Apply Roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
