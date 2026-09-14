import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  UserPlus,
  Shield,
  AlertCircle,
  Loader2,
  Lock,
  Globe,
  MapPin,
  Phone,
  Calendar,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  ALGERIA_WILAYAS,
  SUPPORTED_COUNTRIES,
  isAlgeria,
  formatWilayaDisplay,
} from '@/lib/location/algeriaWilayas';
import {
  validateCustomerRegistration,
  normalizePhoneNumber,
  MINIMUM_REGISTRATION_AGE,
} from '@/lib/validation/profileValidation';
import { getProfileTranslations } from '@/lib/i18n/profileTranslations';
import { CustomerRegistrationPayload } from '@/types/models';

export const RegisterPage: React.FC = () => {
  const { locale, dir, navigate } = useI18n();
  const { register } = useAuth();
  const t = getProfileTranslations(locale);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Algeria');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'ar' | 'fr' | 'en'>(locale);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [serialCode, setSerialCode] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const isAlg = isAlgeria(country);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    const payload: CustomerRegistrationPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      dateOfBirth,
      phone: phone.trim(),
      country: country.trim(),
      wilaya: isAlg ? wilaya.trim() : '',
      city: city.trim(),
      address: address.trim(),
      preferredLanguage,
      agreeTerms,
      serialCode: serialCode.trim() || undefined,
    };

    const validation = validateCustomerRegistration(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setGeneralError('Please resolve the highlighted validation errors before proceeding.');
      return;
    }

    setLoading(true);
    try {
      // Normalize phone before sending
      const normalizedPhoneResult = normalizePhoneNumber(payload.phone, payload.country);
      if (normalizedPhoneResult.isValid) {
        payload.phone = normalizedPhoneResult.normalized;
      }

      await register(payload);
      navigate('app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('auth/email-already-in-use')) {
        setGeneralError('An account with this electronic mail address is already enrolled.');
      } else if (msg.includes('auth/weak-password')) {
        setGeneralError('Passphrase entropy is insufficient. Minimum 6 characters required.');
      } else {
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-16 bg-[#F5F7FA]" dir={dir}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E2E8F0] mb-3 shadow-xs">
            <UserPlus className="w-3.5 h-3.5 text-[#0B2346]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0B2346]">
              {t.accountInfo}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B2346] mb-2">
            Enroll in ZIRON Ecosystem
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Create your certified subject profile to initiate protocol telemetry, track phased shipments, and access personalized dietary insights.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-10 shadow-sm relative">
          <GridPattern />
          <div className="relative z-10">
            {generalError && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0B2346] text-white flex items-center justify-center text-[11px] font-bold">
                    1
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                    {t.personalInfo}
                  </h2>
                </div>

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
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{t.dobPrivacyNotice} (Age &ge; {MINIMUM_REGISTRATION_AGE})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT INFORMATION */}
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0B2346] text-white flex items-center justify-center text-[11px] font-bold">
                    2
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                    {t.contactInfo}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label={`${t.email} *`}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder={t.emailPlaceholder}
                      error={errors.email}
                      helperText="Used for authentication and dispatch manifests."
                    />
                  </div>

                  <div>
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
                      helperText={isAlg ? 'Format: 05/06/07 XX XX XX or +213' : 'Include international dialing code'}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: LOCATION & JURISDICTION */}
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0B2346] text-white flex items-center justify-center text-[11px] font-bold">
                    3
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                    {t.locationInfo}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Country Dropdown */}
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

                  {/* Wilaya Dropdown (or State text for foreign countries) */}
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
                        placeholder="State / Province / Region"
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

                  {/* Physical Address (Optional) */}
                  <div>
                    <Input
                      label={`${t.address} (${t.optional})`}
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t.addressPlaceholder}
                      error={errors.address}
                      helperText="Can be completed or updated later in your dashboard."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: SECURITY CREDENTIALS */}
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0B2346] text-white flex items-center justify-center text-[11px] font-bold">
                    4
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                    Security Passphrase
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label={`${t.password} *`}
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      placeholder="••••••••"
                      error={errors.password}
                      helperText="Minimum 6 characters."
                    />
                  </div>

                  <div>
                    <Input
                      label={`${t.confirmPassword} *`}
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      placeholder="••••••••"
                      error={errors.confirmPassword}
                      helperText="Must match passphrase exactly."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: PREFERENCES & ACTIVATION */}
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0B2346] text-white flex items-center justify-center text-[11px] font-bold">
                    5
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                    {t.preferencesInfo}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div>
                    <Input
                      label="Product Serial Code (Optional)"
                      type="text"
                      value={serialCode}
                      onChange={(e) => setSerialCode(e.target.value.toUpperCase())}
                      placeholder="ZR-XXXX-XXXX-XXXX"
                      helperText="Optional at registration. Can be activated anytime."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: TERMS & PRIVACY CONSENT */}
              <div className="p-4 bg-gray-50 border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: '' }));
                    }}
                    className="mt-0.5 h-4 w-4 rounded-none border-gray-300 text-[#0B2346] focus:ring-[#0B2346]"
                  />
                  <div className="text-xs text-gray-700 leading-relaxed">
                    <span>{t.termsCheckbox} </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      By proceeding, you consent to secure cryptographic profile storage under Virexon Biosciences bio-governance protocols (Version 1.0).
                    </span>
                  </div>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-2 text-[11px] text-red-600 font-medium">{errors.agreeTerms}</p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full cursor-pointer py-3 text-xs uppercase tracking-widest font-bold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.enrolling}
                  </span>
                ) : (
                  t.enrollSubmit
                )}
              </Button>
            </form>

            {/* Footer Navigation */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <button
                onClick={() => navigate('login')}
                className="text-[#0B2346] font-semibold hover:underline cursor-pointer"
              >
                {t.signInLink}
              </button>
              <button
                onClick={() => navigate('verify')}
                className="text-gray-500 hover:text-[#0B2346] cursor-pointer"
              >
                Verify Product Authentication First →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
