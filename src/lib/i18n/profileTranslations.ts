import { Locale } from '@/types';

export interface ProfileTranslations {
  // Section Headings
  personalInfo: string;
  contactInfo: string;
  locationInfo: string;
  preferencesInfo: string;
  accountInfo: string;
  legalInfo: string;

  // Field Labels
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  country: string;
  wilaya: string;
  city: string;
  address: string;
  preferredLanguage: string;
  password: string;
  confirmPassword: string;

  // Field Indicators
  required: string;
  optional: string;

  // Verification & Status
  emailVerified: string;
  emailUnverified: string;
  phoneVerified: string;
  phoneUnverified: string;
  phoneVerificationNotice: string;
  resendVerificationEmail: string;
  verificationEmailSent: string;

  // Completeness & Profile Meta
  profileCompleteness: string;
  profileComplete: string;
  profileIncomplete: string;
  completeProfilePrompt: string;
  accountCreated: string;
  lastUpdated: string;
  termsAccepted: string;
  privacyAccepted: string;

  // Privacy Notices
  dobPrivacyNotice: string;
  phonePrivacyNotice: string;

  // Actions
  saveChanges: string;
  saving: string;
  cancel: string;
  editProfile: string;
  profileUpdatedSuccess: string;
  enrollSubmit: string;
  enrolling: string;
  backToDashboard: string;
  signInLink: string;

  // Terms & Legal
  termsCheckbox: string;
  termsOfService: string;
  and: string;
  privacyPolicy: string;

  // Placeholders
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  dobPlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  cityPlaceholder: string;
  addressPlaceholder: string;
  selectCountry: string;
  selectWilaya: string;

  // Language options
  langArabic: string;
  langFrench: string;
  langEnglish: string;

  // New Profile Dossier Specific Labels
  subjectDossier: string;
  defaultParticipantName: string;
  rolePrefix: string;
  statusPrefix: string;
  editDossierTitle: string;
  accountProfileTitle: string;
  confidentialDataNotice: string;
  profilePhotoUrlLabel: string;
  profilePhotoUrlHelper: string;
  noneConfigured: string;
  legalAcceptanceTitle: string;
  termsAndPrivacyAccepted: string;
  initializingProfile: string;
  phoneHelperAlgeria: string;
  phoneHelperInternational: string;
  stateProvincePlaceholder: string;
}

export const PROFILE_TRANSLATIONS: Record<Locale, ProfileTranslations> = {
  en: {
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    locationInfo: 'Location & Jurisdiction',
    preferencesInfo: 'Preferences & Localization',
    accountInfo: 'Account Dossier',
    legalInfo: 'Legal & Consent Acknowledgement',

    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    email: 'Email Address',
    phone: 'Phone Number',
    country: 'Country',
    wilaya: 'Wilaya / Province',
    city: 'City / Municipality',
    address: 'Physical Address',
    preferredLanguage: 'Preferred Language',
    password: 'Password',
    confirmPassword: 'Confirm Password',

    required: 'Required',
    optional: 'Optional',

    emailVerified: 'Email Verified',
    emailUnverified: 'Email Verification Pending',
    phoneVerified: 'Phone Verified',
    phoneUnverified: 'Phone Verification Pending',
    phoneVerificationNotice: 'Phone verification coming soon',
    resendVerificationEmail: 'Resend Verification Link',
    verificationEmailSent: 'Verification link sent to your inbox',

    profileCompleteness: 'Profile Completeness',
    profileComplete: 'Profile 100% Complete',
    profileIncomplete: 'Profile Incomplete',
    completeProfilePrompt: 'Please complete your participant profile to ensure accurate order delivery and cohort telemetry.',
    accountCreated: 'Account Enrolled',
    lastUpdated: 'Last Updated',
    termsAccepted: 'Terms of Service Accepted',
    privacyAccepted: 'Privacy Policy Accepted',

    dobPrivacyNotice: 'Date of birth is strictly confidential. It will never be displayed in community forums or public directories.',
    phonePrivacyNotice: 'Phone number is securely stored and never disclosed publicly.',

    saveChanges: 'Save Profile Changes',
    saving: 'Saving Changes...',
    cancel: 'Cancel',
    editProfile: 'Edit Profile Dossier',
    profileUpdatedSuccess: 'Profile dossier updated successfully.',
    enrollSubmit: 'Complete Enrollment',
    enrolling: 'Enrolling Subject Identity...',
    backToDashboard: 'Back to Dashboard',
    signInLink: 'Already enrolled? Sign in here →',

    termsCheckbox: 'I agree to the Terms of Service and Privacy Policy.',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',

    firstNamePlaceholder: 'e.g. Karim',
    lastNamePlaceholder: 'e.g. Benali',
    dobPlaceholder: 'YYYY-MM-DD',
    emailPlaceholder: 'subject@virexon-biosciences.com',
    phonePlaceholder: '0555 12 34 56 or +213...',
    cityPlaceholder: 'e.g. Algiers / Sidi M’Hamed',
    addressPlaceholder: 'Street, Building, Apartment (optional for delivery)',
    selectCountry: 'Select Country',
    selectWilaya: 'Select Wilaya (1 to 58)',

    langArabic: 'العربية (Arabic)',
    langFrench: 'Français (French)',
    langEnglish: 'English (English)',

    subjectDossier: 'Subject Dossier',
    defaultParticipantName: 'Subject Participant',
    rolePrefix: 'Role',
    statusPrefix: 'Status',
    editDossierTitle: 'Edit Customer Dossier',
    accountProfileTitle: 'Customer Account Profile',
    confidentialDataNotice: 'Confidential Subject Data',
    profilePhotoUrlLabel: 'Profile Photo URL',
    profilePhotoUrlHelper: 'Direct image URL for avatar display.',
    noneConfigured: 'None configured',
    legalAcceptanceTitle: 'Legal Acceptance',
    termsAndPrivacyAccepted: 'Terms & Privacy v1.0',
    initializingProfile: 'Initializing Participant Profile...',
    phoneHelperAlgeria: 'Format: 05/06/07 XX XX XX or +213',
    phoneHelperInternational: 'Include country code',
    stateProvincePlaceholder: 'State / Province / Region',
  },

  fr: {
    personalInfo: 'Informations Personnelles',
    contactInfo: 'Coordonnées de Contact',
    locationInfo: 'Localisation & Juridiction',
    preferencesInfo: 'Préférences & Localisation',
    accountInfo: 'Dossier de Compte',
    legalInfo: 'Consentement & Mentions Légales',

    firstName: 'Prénom',
    lastName: 'Nom',
    dateOfBirth: 'Date de Naissance',
    email: 'Adresse Électronique',
    phone: 'Numéro de Téléphone',
    country: 'Pays',
    wilaya: 'Wilaya / Province',
    city: 'Commune / Ville',
    address: 'Adresse Postale',
    preferredLanguage: 'Langue Préférée',
    password: 'Mot de Passe',
    confirmPassword: 'Confirmer le Mot de Passe',

    required: 'Obligatoire',
    optional: 'Facultatif',

    emailVerified: 'E-mail Vérifié',
    emailUnverified: 'Vérification E-mail en Attente',
    phoneVerified: 'Téléphone Vérifié',
    phoneUnverified: 'Vérification Téléphone en Attente',
    phoneVerificationNotice: 'Vérification téléphonique bientôt disponible',
    resendVerificationEmail: 'Renvoyer le lien de vérification',
    verificationEmailSent: 'Lien de vérification envoyé sur votre boîte mail',

    profileCompleteness: 'Complétude du Profil',
    profileComplete: 'Profil 100% Complété',
    profileIncomplete: 'Profil Incomplet',
    completeProfilePrompt: 'Veuillez compléter votre dossier participant pour garantir l’acheminement logistique et le suivi protocolé.',
    accountCreated: 'Compte Enregistré',
    lastUpdated: 'Dernière Mise à Jour',
    termsAccepted: 'Conditions Générales Acceptées',
    privacyAccepted: 'Politique de Confidentialité Acceptée',

    dobPrivacyNotice: 'La date de naissance est strictement confidentielle. Elle ne figurera jamais sur le forum public ou les annuaires.',
    phonePrivacyNotice: 'Le numéro de téléphone est sécurisé et ne sera jamais rendu public.',

    saveChanges: 'Enregistrer les Modifications',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    editProfile: 'Modifier le Dossier',
    profileUpdatedSuccess: 'Dossier participant mis à jour avec succès.',
    enrollSubmit: 'Finaliser l’Inscription',
    enrolling: 'Enregistrement de l’Identité...',
    backToDashboard: 'Retour au Tableau de Bord',
    signInLink: 'Déjà inscrit ? Connectez-vous ici →',

    termsCheckbox: 'J’accepte les Conditions d’Utilisation et la Politique de Confidentialité.',
    termsOfService: 'Conditions d’Utilisation',
    and: 'et la',
    privacyPolicy: 'Politique de Confidentialité',

    firstNamePlaceholder: 'ex. Karim',
    lastNamePlaceholder: 'ex. Benali',
    dobPlaceholder: 'AAAA-MM-JJ',
    emailPlaceholder: 'participant@virexon-biosciences.com',
    phonePlaceholder: '0555 12 34 56 ou +213...',
    cityPlaceholder: 'ex. Alger / Sidi M’Hamed',
    addressPlaceholder: 'Rue, Bâtiment, Appartement (optionnel pour livraison)',
    selectCountry: 'Sélectionnez le pays',
    selectWilaya: 'Sélectionnez la wilaya (1 à 58)',

    langArabic: 'العربية (Arabe)',
    langFrench: 'Français (Français)',
    langEnglish: 'English (Anglais)',

    subjectDossier: 'Dossier Sujet',
    defaultParticipantName: 'Participant Sujet',
    rolePrefix: 'Rôle',
    statusPrefix: 'Statut',
    editDossierTitle: 'Modifier le Dossier Client',
    accountProfileTitle: 'Profil du Compte Client',
    confidentialDataNotice: 'Données Confidentielles du Sujet',
    profilePhotoUrlLabel: 'URL de la Photo de Profil',
    profilePhotoUrlHelper: 'URL directe de l’image pour l’avatar.',
    noneConfigured: 'Aucune configurée',
    legalAcceptanceTitle: 'Acceptation Légale',
    termsAndPrivacyAccepted: 'Conditions & Confidentialité v1.0',
    initializingProfile: 'Initialisation du profil participant...',
    phoneHelperAlgeria: 'Format: 05/06/07 XX XX XX ou +213',
    phoneHelperInternational: 'Inclure l’indicatif du pays',
    stateProvincePlaceholder: 'État / Province / Région',
  },

  ar: {
    personalInfo: 'المعلومات الشخصية',
    contactInfo: 'معلومات الاتصال',
    locationInfo: 'الموقع الجغرافي والولاية',
    preferencesInfo: 'التفضيلات واللغة',
    accountInfo: 'ملف الحساب والبيانات',
    legalInfo: 'الموافقة القانونية والشروط',

    firstName: 'الاسم',
    lastName: 'اللقب',
    dateOfBirth: 'تاريخ الميلاد',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    country: 'الدولة',
    wilaya: 'الولاية',
    city: 'البلدية / المدينة',
    address: 'العنوان البريدي',
    preferredLanguage: 'اللغة المفضلة',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',

    required: 'إجباري',
    optional: 'اختياري',

    emailVerified: 'تم التحقق من البريد',
    emailUnverified: 'في انتظار التحقق من البريد',
    phoneVerified: 'تم التحقق من الهاتف',
    phoneUnverified: 'في انتظار التحقق من الهاتف',
    phoneVerificationNotice: 'التحقق من الهاتف عبر الرسائل القصيرة قريباً',
    resendVerificationEmail: 'إعادة إرسال رابط التحقق',
    verificationEmailSent: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني',

    profileCompleteness: 'نسبة اكتمال الملف الشخصي',
    profileComplete: 'الملف الشخصي مكتمل 100%',
    profileIncomplete: 'الملف الشخصي غير مكتمل',
    completeProfilePrompt: 'يرجى استكمال بيانات ملفك الشخصي لضمان دقة التوصيل وتتبع البرنامج الغذائي.',
    accountCreated: 'تاريخ التسجيل',
    lastUpdated: 'آخر تحديث',
    termsAccepted: 'تمت الموافقة على شروط الاستخدام',
    privacyAccepted: 'تمت الموافقة على سياسة الخصوصية',

    dobPrivacyNotice: 'تاريخ الميلاد محمي بسرية تامة، ولن يظهر أبداً في المجتمع أو الأدلة العامة.',
    phonePrivacyNotice: 'رقم الهاتف مشفر ومحمي ولا يتم إظهاره للعامة أبداً.',

    saveChanges: 'حفظ التعديلات',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    editProfile: 'تعديل الملف الشخصي',
    profileUpdatedSuccess: 'تم تحديث الملف الشخصي بنجاح.',
    enrollSubmit: 'إتمام التسجيل والاشتراك',
    enrolling: 'جاري تسجيل هوية المشترك...',
    backToDashboard: 'العودة إلى لوحة التحكم',
    signInLink: 'مسجل بالفعل؟ تسجيل الدخول هنا ←',

    termsCheckbox: 'أوافق على شروط الاستخدام وسياسة الخصوصية.',
    termsOfService: 'شروط الاستخدام',
    and: 'و',
    privacyPolicy: 'سياسة الخصوصية',

    firstNamePlaceholder: 'مثال: كريم',
    lastNamePlaceholder: 'مثال: بن علي',
    dobPlaceholder: 'يوم-شهر-سنة',
    emailPlaceholder: 'subject@virexon-biosciences.com',
    phonePlaceholder: '0555 12 34 56 أو ...213+',
    cityPlaceholder: 'مثال: الجزائر / سيدي امحمد',
    addressPlaceholder: 'الشارع، العمارة، رقم الشقة (اختياري للشحن)',
    selectCountry: 'اختر الدولة',
    selectWilaya: 'اختر الولاية (من 1 إلى 58)',

    langArabic: 'العربية',
    langFrench: 'الفرنسية (Français)',
    langEnglish: 'الإنجليزية (English)',

    subjectDossier: 'ملف المشترك المعتمد',
    defaultParticipantName: 'مشارك معتمد',
    rolePrefix: 'الدور',
    statusPrefix: 'الحالة',
    editDossierTitle: 'تعديل ملف العميل',
    accountProfileTitle: 'ملف حساب المشترك',
    confidentialDataNotice: 'بيانات سرية خاصة بالمشترك',
    profilePhotoUrlLabel: 'رابط الصورة الشخصية',
    profilePhotoUrlHelper: 'رابط مباشر للصورة لعرضها في الملف الشخصي.',
    noneConfigured: 'لم يتم تعيين صورة',
    legalAcceptanceTitle: 'الموافقة القانونية',
    termsAndPrivacyAccepted: 'الشروط والخصوصية الإصدار 1.0',
    initializingProfile: 'جارٍ تهيئة ملف المشترك...',
    phoneHelperAlgeria: 'الصيغة: 05/06/07 XX XX XX أو 213+',
    phoneHelperInternational: 'يرجى تضمين رمز الدولة',
    stateProvincePlaceholder: 'الولاية / المقاطعة / المنطقة',
  },
};

export function getProfileTranslations(locale: Locale): ProfileTranslations {
  return PROFILE_TRANSLATIONS[locale] || PROFILE_TRANSLATIONS.en;
}
