import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import { getUserCertificates } from '@/services/certificateService';
import { SchoolCertificate } from '@/types/models';
import {
  Award,
  GraduationCap,
  Shield,
  CheckCircle,
  Copy,
  Printer,
  X,
  Calendar,
  Building2,
  ExternalLink,
  Lock,
  RefreshCw,
} from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate, locale, dir } = useI18n();
  const t = getAppTranslations(locale);
  const { hasSchoolAccess } = useCustomerEntitlements();

  const [certificates, setCertificates] = useState<SchoolCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<SchoolCertificate | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadCertificates = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const list = await getUserCertificates(user.uid);
      setCertificates(list);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, [user?.uid]);

  const handleCopyLink = (certNumber: string) => {
    const origin = window.location.origin;
    const url = `${origin}/verify/certificate?number=${encodeURIComponent(certNumber)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA] min-h-screen" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Award className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{t.certificates.registryBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {t.certificates.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                {t.certificates.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <Button
                onClick={loadCertificates}
                variant="outline"
                size="sm"
                className="cursor-pointer inline-flex items-center gap-1.5"
                title="Refresh certificates"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs">Refresh</span>
              </Button>

              <Button
                onClick={() => navigate('app/school')}
                variant="primary"
                size="md"
                className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{t.certificates.browseCurriculaBtn}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Access Status Check */}
        {!hasSchoolAccess && (
          <div className="bg-amber-50/80 border border-amber-200 p-4 sm:p-5 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 space-y-1">
              <p className="font-bold">School Access Prerequisite</p>
              <p className="text-amber-800 leading-relaxed">
                Restart School access and certificate issuance are unlocked by activating 3 genuine product containers.
              </p>
            </div>
          </div>
        )}

        {/* Certificates Listing or Empty State */}
        {isLoading ? (
          <div className="bg-white border border-[#E2E8F0] p-12 text-center shadow-xs">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
              Loading verified credentials...
            </p>
          </div>
        ) : certificates.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#E2E8F0] p-10 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-2">
              {t.certificates.emptyTitle}
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
              {t.certificates.emptyDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('app/school')}
                variant="primary"
                size="md"
                className="bg-[#0B2346] cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{t.certificates.exploreSchoolBtn}</span>
              </Button>
              <Button
                onClick={() => navigate('app')}
                variant="outline"
                size="md"
                className="cursor-pointer justify-center"
              >
                {t.certificates.returnToDashboardBtn}
              </Button>
            </div>
          </div>
        ) : (
          /* Certificates Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => {
              const isRevoked = cert.status === 'REVOKED' || cert.isRevoked;
              return (
                <div
                  key={cert.id}
                  className="bg-white border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between hover:border-[#0B2346]/40 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          isRevoked
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isRevoked ? (
                          t.certificates.statusRevoked
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {t.certificates.statusActive}
                          </>
                        )}
                      </span>

                      <span className="text-[11px] font-mono text-gray-500">
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString(locale) : '—'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#0B2346] line-clamp-2">
                        {cert.courseTitle}
                      </h3>
                      <p className="text-xs font-mono text-gray-500 mt-1">
                        {cert.certificateNumber}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6 flex items-center justify-between gap-3">
                    <Button
                      onClick={() => setSelectedCert(cert)}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs flex-1 justify-center"
                    >
                      {t.certificates.viewCredential}
                    </Button>
                    <Button
                      onClick={() => handleCopyLink(cert.certificateNumber)}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs shrink-0 p-2"
                      title={t.certificates.copyVerificationLink}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Public Verification Link Helper */}
        <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0B2346]">Public Verification Gateway</h3>
            <p className="text-xs text-gray-600">
              Third parties, academic institutions, and employers can independently verify credentials at our official registry.
            </p>
          </div>
          <Button
            onClick={() => navigate('verify/certificate')}
            variant="outline"
            size="sm"
            className="cursor-pointer inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto text-xs"
          >
            <span>Open Verification Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Cryptographic Disclosure */}
        <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#0B2346] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-gray-600 leading-relaxed text-start">
              <span className="font-bold text-[#0B2346] uppercase tracking-wider text-[11px] block">
                {t.certificates.verificationStandardTitle}
              </span>
              <p>{t.certificates.verificationStandardDesc}</p>
              <p className="text-[11px] text-gray-500 pt-1">
                {t.certificates.educationalDisclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED CREDENTIAL MODAL / PRINT VIEW */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full border border-gray-300 shadow-2xl relative my-8 overflow-hidden print:m-0 print:border-none print:shadow-none">
            {/* Modal Actions Bar (hidden in print) */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between print:hidden">
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0B2346]">
                  {selectedCert.certificateNumber}
                </span>
                {copiedLink && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 font-semibold">
                    {t.certificates.linkCopied}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleCopyLink(selectedCert.certificateNumber)}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer inline-flex items-center gap-1 text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.certificates.copyVerificationLink}</span>
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="primary"
                  size="sm"
                  className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-1 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.certificates.printCertificate}</span>
                </Button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Certificate Layout */}
            <div className="p-8 sm:p-12 space-y-8 bg-white text-center relative border-8 border-double border-gray-100 m-4">
              <GridPattern />

              <div className="relative z-10 space-y-6">
                {/* Institutional Header */}
                <div className="space-y-1 border-b border-gray-200 pb-4">
                  <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                    VIREXON BIOSCIENCES • EDUCATION DIVISION
                  </div>
                  <h2 className="text-lg font-black text-[#0B2346] tracking-tight uppercase">
                    ZIRON Restart School
                  </h2>
                  <div className="text-[11px] text-gray-500">
                    Official Educational Completion Credential
                  </div>
                </div>

                {/* Status Badge if revoked */}
                {(selectedCert.status === 'REVOKED' || selectedCert.isRevoked) && (
                  <div className="bg-rose-50 border border-rose-300 p-3 text-rose-800 text-xs font-semibold">
                    FORMALLY REVOKED: {selectedCert.revocationReason || 'Administrative Review'}
                  </div>
                )}

                {/* Main Body */}
                <div className="space-y-4 py-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    This certifies that
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-wide">
                    {selectedCert.recipientName || selectedCert.userDisplayName || 'Participant'}
                  </h1>
                  <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                    has satisfactorily completed all required curricular modules, technical competencies, and applied assessments in
                  </p>
                  <h3 className="text-xl font-bold text-[#0B2346]">
                    {selectedCert.courseTitle}
                  </h3>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-gray-200 py-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                      Certificate Number
                    </span>
                    <span className="font-mono font-bold text-[#0B2346]">
                      {selectedCert.certificateNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                      Completion Date
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedCert.completedAt ? new Date(selectedCert.completedAt).toLocaleDateString(locale) : '—'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                      Issued Date
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedCert.issuedAt ? new Date(selectedCert.issuedAt).toLocaleDateString(locale) : '—'}
                    </span>
                  </div>
                </div>

                {/* Compliance Disclaimer */}
                <div className="text-[10px] text-gray-500 max-w-lg mx-auto leading-relaxed pt-2">
                  {t.certificates.educationalDisclaimer}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
