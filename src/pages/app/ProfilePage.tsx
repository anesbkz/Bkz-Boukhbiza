import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Globe,
  MapPin,
  FileCheck,
  Edit3,
  Save,
  X,
  Loader2,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import {
  ALGERIA_WILAYAS,
  SUPPORTED_COUNTRIES,
  isAlgeria,
  formatWilayaDisplay,
} from '@/lib/location/algeriaWilayas';
import {
  validateCustomerProfileUpdate,
  calculateProfileCompleteness,
  normalizePhoneNumber,
  maskPhoneNumber,
} from '@/lib/validation/profileValidation';
import { getProfileTranslations } from '@/lib/i18n/profileTranslations';
import { CustomerProfileUpdatePayload } from '@/types/models';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfileData, sendEmailVerificationLink, refreshProfile } = useAuth();
  const { locale, dir, navigate } = useI18n();
  const t = getProfileTranslations(locale);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  // Editable fields form state
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth || '');
  const [phone, setPhone] = useState(profile?.phone || profile?.phoneNumber || '');
  const [country, setCountry] = useState(profile?.country || 'Algeria');
  const [wilaya, setWilaya] = useState(profile?.wilaya || '16 - Alger');
  const [city, setCity] = useState(profile?.city || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState<'ar' | 'fr' | 'en'>(
    profile?.preferredLanguage || (profile?.locale as 'ar' | 'fr' | 'en') || 'en'
  );
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile?.profilePhotoUrl || '');

  // Reset editable form state when entering edit mode or when profile changes
  const startEditing = () => {
    setFirstName(profile?.firstName || '');
    setLastName(profile?.lastName || '');
    setDateOfBirth(profile?.dateOfBirth || '');
    setPhone(profile?.phone || profile?.phoneNumber || '');
    setCountry(profile?.country || 'Algeria');
    setWilaya(profile?.wilaya || '16 - Alger');
    setCity(profile?.city || '');
    setAddress(profile?.address || '');
    setPreferredLanguage(profile?.preferredLanguage || (profile?.locale as 'ar' | 'fr' | 'en') || 'en');
    setProfilePhotoUrl(profile?.profilePhotoUrl || '');
    setErrors({});
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setErrors({});
    setErrorMessage('');
  };

  const handleSendEmailVerification = async () => {
    try {
      await sendEmailVerificationLink();
      setEmailVerificationSent(true);
      setTimeout(() => setEmailVerificationSent(false), 8000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send verification email';
      setErrorMessage(msg);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setErrors({});

    const updatePayload: CustomerProfileUpdatePayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      displayName: `${firstName.trim()} ${lastName.trim()}`.trim() || undefined,
      dateOfBirth: dateOfBirth.trim() || undefined,
      phone: phone.trim(),
      phoneNumber: phone.trim(),
      country: country.trim(),
      wilaya: isAlgeria(country) ? wilaya.trim() : (wilaya.trim() || undefined),
      city: city.trim(),
      address: address.trim(),
      preferredLanguage,
      profilePhotoUrl: profilePhotoUrl.trim() || null,
      locale: preferredLanguage,
    };

    const validation = validateCustomerProfileUpdate(updatePayload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setErrorMessage('Please correct the validation errors below before saving.');
      return;
    }

    setLoading(true);
    try {
      // Normalize phone if valid
      const normalizedPhoneResult = normalizePhoneNumber(updatePayload.phone || '', updatePayload.country);
      if (normalizedPhoneResult.isValid) {
        updatePayload.phone = normalizedPhoneResult.normalized;
        updatePayload.phoneNumber = normalizedPhoneResult.normalized;
      }

      await updateProfileData(updatePayload);
      setSuccessMessage(t.profileUpdatedSuccess);
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500">
        {t.initializingProfile}
      </div>
    );
  }

  const completeness = profile.profileCompleteness ?? calculateProfileCompleteness(profile);
  const isAlg = isAlgeria(country);

  return (
    <div className="py-10 bg-[#F5F7FA]" dir={dir}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Back Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('app')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[#0B2346] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToDashboard}</span>
          </button>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#E2E8F0] shadow-xs">
            <User className="w-3.5 h-3.5 text-[#0B2346]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0B2346]">
              {t.subjectDossier}
            </span>
          </div>
        </div>

        {/* Hero Dossier Card with Completeness */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0B2346] text-white flex items-center justify-center font-bold text-lg">
                  {profile.firstName ? profile.firstName[0] : (profile.displayName ? profile.displayName[0] : 'S')}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#0B2346]">
                    {profile.firstName && profile.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : profile.displayName || t.defaultParticipantName}
                  </h1>
                  <p dir="ltr" className="text-xs font-mono text-gray-500 text-start">
                    {profile.email} • UID: {profile.uid.slice(0, 12)}...
                  </p>
                </div>
              </div>

              {/* Roles Badge List */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {profile.roles.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 bg-[#0B2346]/10 text-[#0B2346] font-mono text-[10px] font-bold uppercase"
                  >
                    {t.rolePrefix}: {r}
                  </span>
                ))}
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                  {t.statusPrefix}: {profile.status}
                </span>
              </div>
            </div>

            {/* Profile Completeness Gauge */}
            <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-4 min-w-[240px] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#0B2346]">
                <span>{t.profileCompleteness}</span>
                <span className="font-mono text-emerald-700">{completeness}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500">
                {completeness === 100 ? t.profileComplete : t.completeProfilePrompt}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & Action Banners */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {emailVerificationSent && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{t.verificationEmailSent}</span>
          </div>
        )}

        {/* MAIN PROFILE DETAILS & EDIT FORM */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2346]">
              {isEditing ? t.editDossierTitle : t.accountProfileTitle}
            </h2>
            {!isEditing ? (
              <Button
                onClick={startEditing}
                variant="outline"
                size="sm"
                className="cursor-pointer inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.editProfile}</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer inline-flex items-center gap-1 text-gray-600"
                  disabled={loading}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t.cancel}</span>
                </Button>
              </div>
            )}
          </div>

          {!isEditing ? (
            /* ================= READ-ONLY VIEW ================= */
            <div className="space-y-8">
              {/* Section 1: Personal Information */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#0B2346]" />
                  <span>{t.personalInfo}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-100">
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.firstName}</span>
                    <span className="text-xs font-bold text-[#0B2346]">{profile.firstName || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.lastName}</span>
                    <span className="text-xs font-bold text-[#0B2346]">{profile.lastName || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.dateOfBirth}</span>
                    <span dir="ltr" className="text-xs font-mono font-bold text-[#0B2346] block text-start">
                      {profile.dateOfBirth || '—'}
                    </span>
                    <span className="block text-[10px] text-emerald-700 mt-0.5">
                      {t.confidentialDataNotice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Verification Information */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#0B2346]" />
                  <span>{t.contactInfo}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-100">
                  {/* Email & Status */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] text-gray-500 uppercase">{t.email}</span>
                    <div className="flex items-center gap-2">
                      <span dir="ltr" className="text-xs font-bold text-[#0B2346]">{profile.email}</span>
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {t.emailVerified}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          {t.emailUnverified}
                        </span>
                      )}
                    </div>
                    {!user.emailVerified && (
                      <button
                        onClick={handleSendEmailVerification}
                        className="text-[11px] text-[#0B2346] font-semibold underline hover:text-blue-800 cursor-pointer block mt-1"
                      >
                        {t.resendVerificationEmail} →
                      </button>
                    )}
                  </div>

                  {/* Phone & Status */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] text-gray-500 uppercase">{t.phone}</span>
                    <div className="flex items-center gap-2">
                      <span dir="ltr" className="text-xs font-mono font-bold text-[#0B2346]">
                        {profile.phone || profile.phoneNumber || '—'}
                      </span>
                      {profile.phoneVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {t.phoneVerified}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {t.phoneUnverified}
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-gray-500">
                      {t.phoneVerificationNotice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Location & Jurisdiction */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0B2346]" />
                  <span>{t.locationInfo}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-100">
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.country}</span>
                    <span className="text-xs font-bold text-[#0B2346]">{profile.country || (locale === 'ar' ? 'الجزائر' : locale === 'fr' ? 'Algérie' : 'Algeria')}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.wilaya}</span>
                    <span className="text-xs font-bold text-[#0B2346]">{profile.wilaya || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.city}</span>
                    <span className="text-xs font-bold text-[#0B2346]">{profile.city || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.address}</span>
                    <span className="text-xs text-[#0B2346]">{profile.address || `— (${t.optional})`}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Preferences & Localization */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#0B2346]" />
                  <span>{t.preferencesInfo}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-100">
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.preferredLanguage}</span>
                    <span className="text-xs font-bold uppercase text-[#0B2346]">
                      {profile.preferredLanguage === 'ar'
                        ? t.langArabic
                        : profile.preferredLanguage === 'fr'
                        ? t.langFrench
                        : t.langEnglish}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.profilePhotoUrlLabel}</span>
                    <span dir="ltr" className="text-xs font-mono text-gray-600 truncate block text-start">
                      {profile.profilePhotoUrl || t.noneConfigured}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Account Metadata & Legal Acceptance */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-[#0B2346]" />
                  <span>{t.accountInfo}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-100 text-xs">
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.accountCreated}</span>
                    <span dir="ltr" className="font-mono text-gray-700 block text-start">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-US') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.lastUpdated}</span>
                    <span dir="ltr" className="font-mono text-gray-700 block text-start">
                      {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-US') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">{t.legalAcceptanceTitle}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {t.termsAndPrivacyAccepted}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= EDIT MODE FORM ================= */
            <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={`${t.firstName} *`}
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                    }}
                    placeholder={t.firstNamePlaceholder}
                    error={errors.firstName}
                  />
                </div>

                <div>
                  <Input
                    label={`${t.lastName} *`}
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                    }}
                    placeholder={t.lastNamePlaceholder}
                    error={errors.lastName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    {t.dateOfBirth} *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => {
                        setDateOfBirth(e.target.value);
                        if (errors.dateOfBirth) setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
                      }}
                      className={`w-full px-3 py-2 bg-white border ${
                        errors.dateOfBirth ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E2E8F0]'
                      } text-xs text-[#0B2346] focus:outline-none focus:border-[#0B2346]`}
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.dateOfBirth}</p>
                  )}
                  <p className="mt-1 text-[10px] text-gray-500">{t.dobPrivacyNotice}</p>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label={`${t.phone} *`}
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder={t.phonePlaceholder}
                    error={errors.phone}
                    helperText={isAlg ? t.phoneHelperAlgeria : t.phoneHelperInternational}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    {t.country} *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (errors.country) setErrors((prev) => ({ ...prev, country: '' }));
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] text-xs text-[#0B2346] focus:outline-none focus:border-[#0B2346]"
                  >
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.nameEn}>
                        {locale === 'ar' ? c.nameAr : locale === 'fr' ? c.nameFr : c.nameEn} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.country}</p>
                  )}
                </div>

                {/* Wilaya */}
                <div>
                  {isAlg ? (
                    <>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                        {t.wilaya} *
                      </label>
                      <select
                        value={wilaya}
                        onChange={(e) => {
                          setWilaya(e.target.value);
                          if (errors.wilaya) setErrors((prev) => ({ ...prev, wilaya: '' }));
                        }}
                        className={`w-full px-3 py-2 bg-white border ${
                          errors.wilaya ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E2E8F0]'
                        } text-xs text-[#0B2346] focus:outline-none focus:border-[#0B2346]`}
                      >
                        <option value="">-- {t.selectWilaya} --</option>
                        {ALGERIA_WILAYAS.map((w) => (
                          <option key={w.code} value={`${String(w.code).padStart(2, '0')} - ${w.nameFr}`}>
                            {formatWilayaDisplay(w, locale)}
                          </option>
                        ))}
                      </select>
                      {errors.wilaya && (
                        <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.wilaya}</p>
                      )}
                    </>
                  ) : (
                    <Input
                      label={t.wilaya}
                      type="text"
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      placeholder={t.stateProvincePlaceholder}
                    />
                  )}
                </div>

                {/* City */}
                <div>
                  <Input
                    label={`${t.city} *`}
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                    }}
                    placeholder={t.cityPlaceholder}
                    error={errors.city}
                  />
                </div>

                {/* Physical Address */}
                <div>
                  <Input
                    label={`${t.address} (${t.optional})`}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.addressPlaceholder}
                    error={errors.address}
                  />
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    {t.preferredLanguage} *
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as 'ar' | 'fr' | 'en')}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] text-xs text-[#0B2346] focus:outline-none focus:border-[#0B2346]"
                  >
                    <option value="en">{t.langEnglish}</option>
                    <option value="fr">{t.langFrench}</option>
                    <option value="ar">{t.langArabic}</option>
                  </select>
                </div>

                {/* Profile Photo URL */}
                <div>
                  <Input
                    label={`${t.profilePhotoUrlLabel} (${t.optional})`}
                    type="url"
                    value={profilePhotoUrl}
                    onChange={(e) => setProfilePhotoUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    helperText={t.profilePhotoUrlHelper}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={cancelEditing}
                  variant="outline"
                  size="md"
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="cursor-pointer inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.saving}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t.saveChanges}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
