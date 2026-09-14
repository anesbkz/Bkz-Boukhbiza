import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  listAllCertificatesAdmin,
  revokeCertificateAdmin,
} from '@/services/certificateService';
import { SchoolCertificate } from '@/types/models';
import {
  Award,
  Shield,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
  Copy,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const AdminCertificatesPage: React.FC = () => {
  const { profile } = useAuth();
  const { navigate, locale, dir } = useI18n();
  const t = getAppTranslations(locale);

  const [certificates, setCertificates] = useState<SchoolCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL');

  // Revocation Modal State
  const [revokeCertTarget, setRevokeCertTarget] = useState<SchoolCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState('');

  // Detail Modal State
  const [inspectCert, setInspectCert] = useState<SchoolCertificate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await listAllCertificatesAdmin();
      setCertificates(data);
    } catch (err) {
      console.error('Failed to load certificates for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = async () => {
    if (!revokeCertTarget) return;
    const cleanReason = revokeReason.trim();
    if (!cleanReason) {
      setRevokeError('A formal compliance reason is mandatory for certificate revocation.');
      return;
    }

    setIsRevoking(true);
    setRevokeError('');
    try {
      await revokeCertificateAdmin(revokeCertTarget.id, cleanReason);
      setRevokeCertTarget(null);
      setRevokeReason('');
      await loadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setRevokeError(error.message || 'Failed to revoke certificate.');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered dataset
  const filteredCerts = certificates.filter((cert) => {
    const isRevoked = cert.status === 'REVOKED' || cert.isRevoked;
    if (statusFilter === 'ACTIVE' && isRevoked) return false;
    if (statusFilter === 'REVOKED' && !isRevoked) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = cert.certificateNumber?.toLowerCase().includes(q);
      const nameMatch = (cert.recipientName || cert.userDisplayName || '').toLowerCase().includes(q);
      const courseMatch = cert.courseTitle?.toLowerCase().includes(q);
      return numMatch || nameMatch || courseMatch;
    }
    return true;
  });

  const totalCount = certificates.length;
  const activeCount = certificates.filter((c) => c.status !== 'REVOKED' && !c.isRevoked).length;
  const revokedCount = certificates.filter((c) => c.status === 'REVOKED' || c.isRevoked).length;

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA] min-h-screen" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Shield className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{t.certificates.adminTitle}</span>
              </div>
              <h1 className="text-2xl font-black text-[#0B2346] tracking-tight">
                {t.certificates.adminTitle}
              </h1>
              <p className="text-xs text-gray-600">
                {t.certificates.adminSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                className="cursor-pointer inline-flex items-center gap-1 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={() => navigate('verify/certificate')}
                variant="outline"
                size="sm"
                className="cursor-pointer inline-flex items-center gap-1 text-xs"
              >
                <span>Public Registry</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E2E8F0] p-5 shadow-xs">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider">
              Total Issued
            </span>
            <p className="text-2xl font-black text-[#0B2346] mt-1">{totalCount}</p>
          </div>
          <div className="bg-white border border-[#E2E8F0] p-5 shadow-xs">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 tracking-wider">
              Active & Verified
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white border border-[#E2E8F0] p-5 shadow-xs">
            <span className="text-[10px] uppercase font-mono font-bold text-rose-600 tracking-wider">
              Formally Revoked
            </span>
            <p className="text-2xl font-black text-rose-700 mt-1">{revokedCount}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border border-[#E2E8F0] p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by certificate number, recipient name, or course..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 text-xs text-[#0B2346] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'ACTIVE', 'REVOKED'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1.5 text-xs font-semibold cursor-pointer border transition-colors ${
                  statusFilter === filterKey
                    ? 'bg-[#0B2346] text-white border-[#0B2346]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-[#E2E8F0] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 font-mono">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
              Loading credential records...
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              No certificate records matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Certificate Number</th>
                    <th className="p-3.5">Recipient</th>
                    <th className="p-3.5">Course Curriculum</th>
                    <th className="p-3.5">Issued At</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCerts.map((cert) => {
                    const isRevoked = cert.status === 'REVOKED' || cert.isRevoked;
                    return (
                      <tr key={cert.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#0B2346]">
                          <div className="flex items-center gap-1.5">
                            <span>{cert.certificateNumber}</span>
                            <button
                              onClick={() => handleCopy(cert.certificateNumber, cert.id)}
                              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                              title="Copy certificate number"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === cert.id && (
                              <span className="text-[9px] text-emerald-600">Copied!</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-gray-900">
                          {cert.recipientName || cert.userDisplayName || '—'}
                        </td>
                        <td className="p-3.5 text-gray-700 max-w-xs truncate">
                          {cert.courseTitle}
                        </td>
                        <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                          {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString(locale) : '—'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                              isRevoked
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isRevoked ? (
                              <>
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                <span>REVOKED</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                <span>ACTIVE</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setInspectCert(cert)}
                            className="text-[#0B2346] hover:underline font-semibold cursor-pointer text-xs"
                          >
                            Inspect
                          </button>
                          {!isRevoked && (
                            <button
                              onClick={() => {
                                setRevokeCertTarget(cert);
                                setRevokeReason('');
                                setRevokeError('');
                              }}
                              className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer text-xs ml-2"
                            >
                              Revoke
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
      </div>

      {/* INSPECT DETAIL MODAL */}
      {inspectCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full border border-gray-300 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0B2346]" />
                <h3 className="font-bold text-base text-[#0B2346]">Certificate Audit Record</h3>
              </div>
              <button
                onClick={() => setInspectCert(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-mono text-gray-500 uppercase text-[10px] block">Certificate Number:</span>
                <span className="font-mono font-bold text-[#0B2346] text-sm">{inspectCert.certificateNumber}</span>
              </div>
              <div>
                <span className="font-mono text-gray-500 uppercase text-[10px] block">Recipient Student Name:</span>
                <span className="font-medium text-gray-900">{inspectCert.recipientName}</span>
              </div>
              <div>
                <span className="font-mono text-gray-500 uppercase text-[10px] block">Course ID & Title:</span>
                <span className="text-gray-900">{inspectCert.courseTitle} ({inspectCert.courseId})</span>
              </div>
              <div>
                <span className="font-mono text-gray-500 uppercase text-[10px] block">Verification Token:</span>
                <span className="font-mono text-gray-700 break-all">{inspectCert.verificationToken || '—'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-mono text-gray-500 uppercase text-[10px] block">Issued At:</span>
                  <span className="font-mono text-gray-800">{inspectCert.issuedAt || '—'}</span>
                </div>
                <div>
                  <span className="font-mono text-gray-500 uppercase text-[10px] block">Completed At:</span>
                  <span className="font-mono text-gray-800">{inspectCert.completedAt || '—'}</span>
                </div>
              </div>

              {(inspectCert.status === 'REVOKED' || inspectCert.isRevoked) && (
                <div className="bg-rose-50 border border-rose-200 p-3 text-rose-900 space-y-1 mt-3">
                  <span className="font-bold text-[10px] uppercase font-mono block text-rose-800">
                    Revocation Compliance Record
                  </span>
                  <p>Reason: {inspectCert.revocationReason || 'Administrative Compliance'}</p>
                  <p className="text-[10px] text-rose-700">Revoked At: {inspectCert.revokedAt || '—'}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <Button
                onClick={() => setInspectCert(null)}
                variant="outline"
                size="sm"
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REVOCATION MODAL */}
      {revokeCertTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full border border-gray-300 shadow-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
              <div className="w-8 h-8 bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-rose-950">
                  {t.certificates.revokeModalTitle}
                </h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  {revokeCertTarget.certificateNumber}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {t.certificates.revokeModalDesc}
            </p>

            <div className="bg-gray-50 border border-gray-200 p-3 text-xs space-y-1">
              <div>
                <span className="font-bold text-gray-600">Recipient:</span>{' '}
                <span className="text-gray-900">{revokeCertTarget.recipientName}</span>
              </div>
              <div>
                <span className="font-bold text-gray-600">Course:</span>{' '}
                <span className="text-gray-900">{revokeCertTarget.courseTitle}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0B2346] uppercase tracking-wider">
                {t.certificates.revocationReason} *
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder={t.certificates.revokeReasonPlaceholder}
                rows={3}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-xs text-[#0B2346] focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {revokeError && (
              <div className="bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {revokeError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
              <Button
                onClick={() => setRevokeCertTarget(null)}
                variant="outline"
                size="sm"
                disabled={isRevoking}
                className="cursor-pointer text-xs"
              >
                {t.certificates.cancel}
              </Button>
              <Button
                onClick={handleRevoke}
                variant="primary"
                size="sm"
                disabled={isRevoking || !revokeReason.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer text-xs font-semibold"
              >
                {isRevoking ? t.certificates.revokingAction : t.certificates.confirmRevocation}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
