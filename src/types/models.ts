import { AppRole } from './rbac';

export type UserStatus = 'active' | 'pending' | 'suspended' | 'archived';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // Normalized YYYY-MM-DD
  phone?: string;
  phoneNumber?: string; // Backwards-compatible alias
  country?: string;
  wilaya?: string;
  city?: string;
  address?: string;
  preferredLanguage?: 'ar' | 'fr' | 'en';
  profilePhotoUrl?: string | null;
  photoURL?: string; // Backwards-compatible alias
  emailVerified?: boolean;
  phoneVerified?: boolean;
  termsAcceptedAt?: string | null;
  privacyAcceptedAt?: string | null;
  termsVersion?: string;
  privacyVersion?: string;
  profileCompleteness?: number;
  status: UserStatus;
  roles: AppRole[];
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
  communityAccess: boolean;
  schoolAccess: boolean;
  qualifyingContainerCount?: number;
  xp: number;
  level: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: string | null;
  locale: string;
}

export interface CustomerRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string; // YYYY-MM-DD
  phone: string;
  country: string;
  wilaya: string;
  city: string;
  address?: string;
  preferredLanguage: 'ar' | 'fr' | 'en';
  agreeTerms: boolean;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  serialCode?: string;
}

export interface CustomerProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  dateOfBirth?: string;
  phone?: string;
  phoneNumber?: string;
  country?: string;
  wilaya?: string;
  city?: string;
  address?: string;
  preferredLanguage?: 'ar' | 'fr' | 'en';
  profilePhotoUrl?: string | null;
  photoURL?: string;
  locale?: string;
  onboardingCompleted?: boolean;
  profileCompleteness?: number;
}

/* ==========================================================================
   SCHOOL MODELS (Dynamic Firestore-Driven)
   ========================================================================== */

export interface MultilingualText {
  en: string;
  fr: string;
  ar: string;
}

export interface SchoolCategory {
  id: string;
  slug: string;
  title: MultilingualText;
  description: MultilingualText;
  iconName?: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  courseCount?: number;
}

export interface SchoolCourse {
  id: string;
  categoryId: string;
  slug: string;
  title: MultilingualText;
  description: MultilingualText;
  difficulty: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  isPublished: boolean;
  displayOrder: number;
  requiredPhase?: 1 | 2 | 3;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolModule {
  id: string;
  courseId: string;
  title: MultilingualText;
  description?: MultilingualText;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export interface SchoolLesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: MultilingualText;
  contentMarkdown: MultilingualText;
  durationMinutes: number;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export interface SchoolQuizQuestion {
  id: string;
  prompt: MultilingualText;
  options: MultilingualText[];
  correctOptionIndex: number;
  explanation?: MultilingualText;
}

export interface SchoolQuiz {
  id: string;
  courseId: string;
  moduleId?: string;
  title: MultilingualText;
  passingScorePercent: number;
  questions: SchoolQuizQuestion[];
  isPublished: boolean;
}

export interface SchoolCertificate {
  id: string;
  certificateId: string;
  certificateNumber: string;
  userId: string;
  recipientName: string;
  userDisplayName?: string;
  courseId: string;
  courseTitle: string;
  categoryTitle?: string;
  issuedAt: string;
  issueDate?: string;
  completedAt: string;
  issuer: string;
  status: 'ACTIVE' | 'REVOKED';
  isRevoked?: boolean;
  verificationToken: string;
  verificationHash?: string;
  verificationUrl: string;
  certificateType: 'COURSE_COMPLETION';
  createdAt: string;
  updatedAt: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
  revokedBy?: string | null;
}

export interface PublicCertificate {
  certificateNumber: string;
  status: 'ACTIVE' | 'REVOKED';
  courseTitle: string;
  courseId: string;
  recipientName: string;
  completedAt: string;
  issuedAt: string;
  issuer: string;
  certificateType: string;
  createdAt?: string;
  updatedAt?: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
}

export interface EnrollmentRecord {
  id: string; // `${userId}_${courseId}`
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'ACTIVE' | 'COMPLETED';
  lastAccessedLessonId?: string;
  lastAccessedAt?: string;
  completedAt?: string | null;
}

export interface SchoolProgress {
  id: string; // `${userId}_${courseId}`
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  completedCount: number;
  totalLessonsCount: number;
  progressPercent: number; // 0 to 100
  isCompleted: boolean;
  completedAt: string | null; // Deterministic ISO string
  lastAccessedLessonId?: string;
  lastUpdated: string;
}

/* ==========================================================================
   COMMUNITY MODELS
   ========================================================================== */

export interface CommunityAnnouncement {
  id: string;
  title: MultilingualText;
  content: MultilingualText;
  isPinned: boolean;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRoles: AppRole[];
  categorySlug?: string;
  title: string;
  body: string;
  tags?: string[];
  likesCount: number;
  commentsCount: number;
  isLocked: boolean;
  isPinned: boolean;
  status: 'published' | 'hidden' | 'flagged';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  status: 'published' | 'hidden' | 'flagged';
  createdAt: string;
}

export interface CommunityReport {
  id: string;
  reporterUserId: string;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

/* ==========================================================================
   PRODUCTS & CODES
   ========================================================================== */

export interface ProductModel {
  id: string;
  sku: string;
  title: MultilingualText;
  subtitle: MultilingualText;
  phaseNumber: number;
  capsuleCount: number;
  priceDzd: number | null;
  isActive: boolean;
  createdAt: string;
}

export type BatchStatus = 'ACTIVE' | 'DISABLED' | 'ARCHIVED';
export type ProductCodeStatus = 'UNUSED' | 'ACTIVATED' | 'DISABLED' | 'REVOKED';

export interface BatchModel {
  id: string;
  batchNumber: string;
  productSku: string;
  productName?: string;
  manufactureDate: string;
  expiryDate: string;
  status: BatchStatus;
  testingStatus: 'PENDING' | 'PASS' | 'FLAGGED';
  totalCodes: number;
  activatedCodes: number;
  disabledCodes: number;
  coaUrl?: string | null;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface ProductCodeModel {
  id: string;
  code: string; // e.g. ZR-PH01-XXXX-XXXX-XXXX
  normalizedCode?: string;
  batchId: string;
  batchNumber?: string;
  productSku: string;
  phase?: number;
  status: ProductCodeStatus;
  isActivated: boolean;
  activatedByUserId?: string | null;
  activatedAt?: string | null;
  activationId?: string | null;
  grantsSchoolAccess: boolean;
  grantsCommunityAccess: boolean;
  exportCount?: number;
  lastExportedAt?: string | null;
  qrPayload?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}

export type ProductBatch = BatchModel;
export type ProductCode = ProductCodeModel;

export interface GenerationRequest {
  quantity: number;
  productSku: string;
  batchId: string;
}

export interface GenerationResult {
  success: boolean;
  batchId: string;
  batchNumber: string;
  productSku: string;
  quantity: number;
  codes: string[];
}

export interface BatchCreationRequest {
  productSku: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  notes?: string;
  coaUrl?: string | null;
}

export interface BatchCreationResult {
  success: boolean;
  batchId: string;
  batchNumber: string;
  productSku: string;
  status: BatchStatus;
}

export interface BatchStatusUpdateRequest {
  batchId: string;
  status: BatchStatus;
}

export interface BatchStatusUpdateResult {
  success: boolean;
  batchId: string;
  previousStatus: string;
  newStatus: BatchStatus;
  message?: string;
}

/* ==========================================================================
   AUDIT LOGGING
   ========================================================================== */

export type AuditActionType =
  | 'USER_ROLE_CHANGED'
  | 'USER_STATUS_CHANGED'
  | 'USER_CREATED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_CODE_CREATED'
  | 'PRODUCT_CODES_GENERATED'
  | 'PRODUCT_CODE_ACTIVATED'
  | 'BATCH_CREATED'
  | 'BATCH_STATUS_CHANGED'
  | 'PRODUCT_CODES_EXPORTED'
  | 'ENTITLEMENT_GRANTED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_ARCHIVED'
  | 'COURSE_CREATED'
  | 'COURSE_UPDATED'
  | 'COURSE_PUBLISHED'
  | 'COMMUNITY_POST_REMOVED'
  | 'COMMUNITY_ANNOUNCEMENT_CREATED'
  | 'CERTIFICATE_ISSUED'
  | 'CERTIFICATE_REVOKED'
  | 'SETTINGS_CHANGED'
  | 'CMS_CONTENT_UPDATED';

export interface AuditLogEntry {
  id: string;
  actorUserId: string;
  actorEmail?: string;
  actorRoles: AppRole[];
  action: AuditActionType;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type AuditLog = AuditLogEntry;

/* ==========================================================================
   NOTIFICATIONS
   ========================================================================== */

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  link?: string;
  createdAt: string;
}
