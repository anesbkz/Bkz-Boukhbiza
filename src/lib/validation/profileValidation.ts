import { CustomerRegistrationPayload, CustomerProfileUpdatePayload, UserProfile } from '@/types/models';
import { isAlgeria } from '@/lib/location/algeriaWilayas';

export const MINIMUM_REGISTRATION_AGE = 18;
export const MAXIMUM_REGISTRATION_AGE = 120;
export const TERMS_CURRENT_VERSION = '1.0';
export const PRIVACY_CURRENT_VERSION = '1.0';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface PhoneNormalizationResult {
  raw: string;
  normalized: string;
  isValid: boolean;
  error?: string;
}

/**
 * Normalizes phone numbers, specifically supporting Algerian mobile/landline prefixes (05, 06, 07)
 * and international E.164-compatible standards.
 */
export function normalizePhoneNumber(rawInput: string, country: string = 'Algeria'): PhoneNormalizationResult {
  if (!rawInput) {
    return { raw: '', normalized: '', isValid: false, error: 'Phone number is required.' };
  }

  const raw = rawInput.trim();
  // Strip whitespace, dashes, parentheses, dots
  let digits = raw.replace(/[\s\-\(\)\.]/g, '');

  const algerian = isAlgeria(country);

  if (algerian) {
    // Handling 05/06/07 or 02/03/04 (landlines)
    if (digits.startsWith('0') && digits.length === 10) {
      const normalized = `+213${digits.substring(1)}`;
      return { raw, normalized, isValid: true };
    }
    if (digits.startsWith('+213') && digits.length === 13) {
      return { raw, normalized: digits, isValid: true };
    }
    if (digits.startsWith('00213') && digits.length === 14) {
      const normalized = `+${digits.substring(2)}`;
      return { raw, normalized, isValid: true };
    }
    if (digits.startsWith('213') && digits.length === 12) {
      const normalized = `+${digits}`;
      return { raw, normalized, isValid: true };
    }

    // If it's 9 digits without leading 0 (e.g. 555123456)
    if (digits.length === 9 && /^[5-7]/.test(digits)) {
      const normalized = `+213${digits}`;
      return { raw, normalized, isValid: true };
    }

    return {
      raw,
      normalized: digits,
      isValid: false,
      error: 'Invalid Algerian phone number. Expected 10 digits (e.g. 0555 12 34 56 or +213 555 12 34 56).',
    };
  }

  // International phone validation: standard E.164 pattern
  // Must start with + or digits, between 7 and 15 digits
  const internationalRegex = /^\+?[0-9]{7,15}$/;
  if (internationalRegex.test(digits)) {
    const normalized = digits.startsWith('+') ? digits : `+${digits}`;
    return { raw, normalized, isValid: true };
  }

  return {
    raw,
    normalized: digits,
    isValid: false,
    error: 'Invalid phone number format. Include country code (e.g. +33 6 12 34 56 78).',
  };
}

/**
 * Validates a normalized YYYY-MM-DD date of birth string.
 */
export function validateDateOfBirth(dob: string, minAge: number = MINIMUM_REGISTRATION_AGE): { isValid: boolean; error?: string } {
  if (!dob) {
    return { isValid: false, error: 'Date of birth is required.' };
  }

  // Check format YYYY-MM-DD
  const formatRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!formatRegex.test(dob)) {
    return { isValid: false, error: 'Date of birth must be in YYYY-MM-DD format.' };
  }

  const [yearStr, monthStr, dayStr] = dob.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { isValid: false, error: 'Invalid calendar date.' };
  }

  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return { isValid: false, error: 'Invalid calendar date.' };
  }

  const today = new Date();
  if (dateObj > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future.' };
  }

  // Calculate age
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }

  if (age < minAge) {
    return {
      isValid: false,
      error: `Participant must be at least ${minAge} years of age to enroll.`,
    };
  }

  if (age > MAXIMUM_REGISTRATION_AGE || year < 1900) {
    return {
      isValid: false,
      error: 'Please enter a valid, realistic date of birth.',
    };
  }

  return { isValid: true };
}

/**
 * Validates the full customer registration form payload.
 */
export function validateCustomerRegistration(payload: CustomerRegistrationPayload): ValidationResult {
  const errors: Record<string, string> = {};

  // First name
  const firstName = payload.firstName ? payload.firstName.trim() : '';
  if (!firstName) {
    errors.firstName = 'First name is required.';
  } else if (firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  } else if (firstName.length > 100) {
    errors.firstName = 'First name cannot exceed 100 characters.';
  }

  // Last name
  const lastName = payload.lastName ? payload.lastName.trim() : '';
  if (!lastName) {
    errors.lastName = 'Last name is required.';
  } else if (lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  } else if (lastName.length > 100) {
    errors.lastName = 'Last name cannot exceed 100 characters.';
  }

  // Date of birth
  const dobResult = validateDateOfBirth(payload.dateOfBirth);
  if (!dobResult.isValid && dobResult.error) {
    errors.dateOfBirth = dobResult.error;
  }

  // Email
  const email = payload.email ? payload.email.trim().toLowerCase() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  // Phone
  const phoneResult = normalizePhoneNumber(payload.phone, payload.country);
  if (!phoneResult.isValid && phoneResult.error) {
    errors.phone = phoneResult.error;
  }

  // Country
  const country = payload.country ? payload.country.trim() : '';
  if (!country) {
    errors.country = 'Country is required.';
  }

  // Wilaya (Required for Algeria)
  if (isAlgeria(country)) {
    const wilaya = payload.wilaya ? payload.wilaya.trim() : '';
    if (!wilaya) {
      errors.wilaya = 'Wilaya is required for Algerian participants.';
    }
  }

  // City
  const city = payload.city ? payload.city.trim() : '';
  if (!city) {
    errors.city = 'City / Municipality is required.';
  } else if (city.length > 100) {
    errors.city = 'City name cannot exceed 100 characters.';
  }

  // Address (optional at registration, but if provided, validate length)
  if (payload.address && payload.address.trim().length > 250) {
    errors.address = 'Address cannot exceed 250 characters.';
  }

  // Password
  if (!payload.password) {
    errors.password = 'Password is required.';
  } else if (payload.password.length < 6) {
    errors.password = 'Password must be at least 6 characters in length.';
  }

  // Confirm password
  if (!payload.confirmPassword) {
    errors.confirmPassword = 'Password confirmation is required.';
  } else if (payload.confirmPassword !== payload.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  // Preferred language
  if (!payload.preferredLanguage || !['ar', 'fr', 'en'].includes(payload.preferredLanguage)) {
    errors.preferredLanguage = 'Please select a valid preferred language.';
  }

  // Terms & Privacy
  if (!payload.agreeTerms && !payload.acceptTerms) {
    errors.agreeTerms = 'You must review and agree to the Terms of Service and Privacy Policy to proceed.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a profile update payload.
 */
export function validateCustomerProfileUpdate(payload: CustomerProfileUpdatePayload): ValidationResult {
  const errors: Record<string, string> = {};

  if (payload.firstName !== undefined) {
    const trimmed = payload.firstName.trim();
    if (!trimmed) {
      errors.firstName = 'First name cannot be empty.';
    } else if (trimmed.length < 2 || trimmed.length > 100) {
      errors.firstName = 'First name must be between 2 and 100 characters.';
    }
  }

  if (payload.lastName !== undefined) {
    const trimmed = payload.lastName.trim();
    if (!trimmed) {
      errors.lastName = 'Last name cannot be empty.';
    } else if (trimmed.length < 2 || trimmed.length > 100) {
      errors.lastName = 'Last name must be between 2 and 100 characters.';
    }
  }

  if (payload.dateOfBirth !== undefined && payload.dateOfBirth !== '') {
    const dobResult = validateDateOfBirth(payload.dateOfBirth);
    if (!dobResult.isValid && dobResult.error) {
      errors.dateOfBirth = dobResult.error;
    }
  }

  if (payload.phone !== undefined && payload.phone !== '') {
    const phoneResult = normalizePhoneNumber(payload.phone, payload.country || 'Algeria');
    if (!phoneResult.isValid && phoneResult.error) {
      errors.phone = phoneResult.error;
    }
  }

  if (payload.country !== undefined) {
    if (!payload.country.trim()) {
      errors.country = 'Country cannot be empty.';
    }
  }

  if (payload.country && isAlgeria(payload.country)) {
    if (payload.wilaya !== undefined && !payload.wilaya.trim()) {
      errors.wilaya = 'Wilaya is required for Algeria.';
    }
  }

  if (payload.city !== undefined) {
    if (!payload.city.trim()) {
      errors.city = 'City cannot be empty.';
    } else if (payload.city.length > 100) {
      errors.city = 'City cannot exceed 100 characters.';
    }
  }

  if (payload.address !== undefined && payload.address.length > 250) {
    errors.address = 'Address cannot exceed 250 characters.';
  }

  if (payload.preferredLanguage !== undefined) {
    if (!['ar', 'fr', 'en'].includes(payload.preferredLanguage)) {
      errors.preferredLanguage = 'Invalid language selection.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculates account completion percentage (0 - 100) based on profile completeness.
 * Strictly UX metric, NOT an authorization mechanism.
 *
 * Weighting:
 * - Personal: firstName (10%), lastName (10%), dateOfBirth (15%) = 35%
 * - Contact: email (10%), phone (15%) = 25%
 * - Location: country (5%), wilaya (5%), city (5%), address (10%) = 25%
 * - Preferences: preferredLanguage (5%) = 5%
 * - Legal: terms/privacy accepted (10%) = 10%
 * Total = 100%
 */
export function calculateProfileCompleteness(profile: Partial<UserProfile> | null | undefined): number {
  if (!profile) return 0;

  let points = 0;

  // Personal (35%)
  if (profile.firstName && profile.firstName.trim().length > 0) points += 10;
  if (profile.lastName && profile.lastName.trim().length > 0) points += 10;
  if (profile.dateOfBirth && profile.dateOfBirth.trim().length > 0) points += 15;

  // Contact (25%)
  if (profile.email && profile.email.trim().length > 0) points += 10;
  if (profile.phone && profile.phone.trim().length > 0) points += 15;
  else if (profile.phoneNumber && profile.phoneNumber.trim().length > 0) points += 15;

  // Location (25%)
  if (profile.country && profile.country.trim().length > 0) points += 5;
  if (profile.wilaya && profile.wilaya.trim().length > 0) points += 5;
  if (profile.city && profile.city.trim().length > 0) points += 5;
  if (profile.address && profile.address.trim().length > 0) points += 10;

  // Preferences (5%)
  if (profile.preferredLanguage && ['ar', 'fr', 'en'].includes(profile.preferredLanguage)) points += 5;

  // Legal (10%)
  if (profile.termsAcceptedAt || profile.privacyAcceptedAt) points += 10;

  return Math.min(100, Math.max(0, points));
}

/**
 * Masks phone numbers to protect privacy in administrative list views or public contexts.
 * Example: "+213 555 12 34 56" -> "+213 ••••••••56"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return '—';
  const clean = phone.trim();
  if (clean.length < 6) return '••••••';

  // Keep first 4 characters and last 2 characters
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-2);
  const maskedLength = Math.max(4, clean.length - 6);
  const dots = '•'.repeat(maskedLength);

  return `${prefix} ${dots} ${suffix}`;
}
