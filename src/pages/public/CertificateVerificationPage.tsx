import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  verifyCertificatePublic,
  PublicCertificateVerificationResult,
} from '@/services/certificateService';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  Search,
  Shield,
  ExternalLink,
  Calendar,
  Building2,
  FileCheck,
  Printer,
} from 'lucide-react';

export const CertificateVerificationPage: React.FC = () => {
  const { navigate, locale, dir } = useI18n();
  const t = getAppTranslations(locale);

  const [inputQuery, setInputQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<PublicCertificateVerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-verify if URL contains ?number= or ?token=
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get('number') || params.get('token') || params.get('q');
      if (queryParam) {
        setInputQuery(queryParam);
        handleVerify(queryParam);
      }
    } catch {
      // Ignored
    }
  }, []);

  const handleVerify = async (queryToUse?: string) => {
    const raw = (queryToUse || inputQuery).trim();
    if (!raw) return;

    setIsVerifying(true);
    setHasSearched(true);
    try {
      const res = await verifyCertificatePublic(raw);
      setResult(res);
    } catch (err: unknown) {
      setResult({
        isValid: false,
        message: 'Unable to reach the certificate verification registry. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 sm:py-16" dir={dir}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Verification Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Shield className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{t.certificates.verifyTitle}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {t.certificates.verifyTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                {t.certificates.verifySubtitle}
              </p>
            </div>

            <Button
              onClick={() => navigate('school')}
              variant="outline"
              size="sm"
              className="cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto text-xs"
            >
              <span>{t.certificates.exploreSchoolBtn}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Verification Search Bar */}
        <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-bold text-[#0B2346] uppercase tracking-wider">
              {t.certificates.enterCertificateNumber}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="e.g. ZRN-CERT-2026-XXXX-XXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 text-sm text-[#0B2346] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2346] font-mono tracking-wider"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isVerifying || !inputQuery.trim()}
                className="bg-[#0B2346] cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 px-6 font-semibold"
              >
                {isVerifying ? (
                  <span>{t.certificates.verifying}</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>{t.certificates.verifyButton}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Results Presentation */}
        {hasSearched && result && (
          <div className="space-y-6">
            {result.isValid && !result.isRevoked ? (
              /* ACTIVE VALID CERTIFICATE */
              <div className="bg-white border-2 border-emerald-500 p-6 sm:p-10 shadow-sm relative overflow-hidden print:border-none print:p-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-200 mb-1">
                        {t.certificates.statusActive}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0B2346]">
                        {t.certificates.validCredentialTitle}
                      </h2>
                    </div>
                  </div>

                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer inline-flex items-center gap-2 print:hidden text-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t.certificates.printCertificate}</span>
                  </Button>
                </div>

                {/* Credential Specification Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                  <div className="bg-gray-50 border border-gray-200 p-4 space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider">
                      {t.certificates.issuedTo}
                    </span>
                    <p className="text-lg font-black text-[#0B2346]">
                      {result.recipientName}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider">
                      {t.certificates.certificateNumber}
                    </span>
                    <p className="text-lg font-mono font-bold text-[#0B2346] tracking-wider">
                      {result.certificateNumber}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 space-y-1 md:col-span-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider">
                      {t.certificates.course}
                    </span>
                    <p className="text-base font-bold text-[#0B2346]">
                      {result.courseTitle}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {t.certificates.issuedDate}
                    </span>
                    <p className="font-semibold text-gray-800">
                      {result.issuedAt ? new Date(result.issuedAt).toLocaleDateString(locale, { dateStyle: 'long' }) : '—'}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      {t.certificates.issuingAuthority}
                    </span>
                    <p className="font-semibold text-gray-800">
                      {result.issuer}
                    </p>
                  </div>
                </div>

                {/* Educational Compliance Disclaimer */}
                <div className="bg-blue-50/50 border border-blue-200 p-4 text-xs text-[#0B2346] leading-relaxed flex items-start gap-3">
                  <Shield className="w-4 h-4 text-[#0B2346] shrink-0 mt-0.5" />
                  <p>
                    <strong className="block mb-0.5 uppercase tracking-wider text-[10px]">
                      Educational Credential Notice:
                    </strong>
                    {t.certificates.educationalDisclaimer}
                  </p>
                </div>
              </div>
            ) : result.isValid && result.isRevoked ? (
              /* REVOKED CERTIFICATE */
              <div className="bg-white border-2 border-rose-500 p-6 sm:p-10 shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-6 mb-6">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-mono font-bold uppercase tracking-wider border border-rose-200 mb-1">
                      {t.certificates.statusRevoked}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-rose-900">
                      {t.certificates.revokedCredentialTitle}
                    </h2>
                  </div>
                </div>

                <div className="bg-rose-50/60 border border-rose-200 p-4 mb-6 text-sm text-rose-900 space-y-2">
                  <p className="font-semibold">
                    This educational credential has been formally revoked by institutional administrative authority.
                  </p>
                  {result.revocationReason && (
                    <div className="text-xs">
                      <span className="font-bold uppercase tracking-wider text-[10px] block text-rose-800">
                        {t.certificates.revocationReason}:
                      </span>
                      <span className="italic">{result.revocationReason}</span>
                    </div>
                  )}
                  {result.revokedAt && (
                    <div className="text-[11px] text-rose-700">
                      Revocation recorded: {new Date(result.revokedAt).toLocaleString(locale)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-500">
                      {t.certificates.certificateNumber}:
                    </span>
                    <p className="font-mono font-bold text-gray-800">{result.certificateNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-500">
                      {t.certificates.course}:
                    </span>
                    <p className="font-semibold text-gray-800">{result.courseTitle}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* NOT FOUND */
              <div className="bg-white border border-gray-300 p-8 sm:p-12 text-center shadow-xs">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-[#0B2346] mb-2">
                  {t.certificates.notFoundTitle}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                  {result.message || t.certificates.notFoundDesc}
                </p>
                <Button
                  onClick={() => setInputQuery('')}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                >
                  Try Another Identifier
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Verification Standards & Legal Notice */}
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
    </div>
  );
};
