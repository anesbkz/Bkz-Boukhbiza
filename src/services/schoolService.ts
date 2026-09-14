import { db, functionsInstance } from '@/config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { SchoolCategory, SchoolCourse, SchoolModule, SchoolLesson, SchoolProgress, EnrollmentRecord, UserProfile } from '@/types/models';
import { hasPermission } from '@/lib/rbac/permissions';
import { SEED_COURSES, SEED_MODULES, SEED_LESSONS } from '@/data/seedSchoolData';

const CATEGORIES_COLLECTION = 'schoolCategories';
const COURSES_COLLECTION = 'schoolCourses';
const MODULES_COLLECTION = 'schoolModules';
const LESSONS_COLLECTION = 'schoolLessons';
const ENROLLMENTS_COLLECTION = 'enrollments';
const PROGRESS_COLLECTION = 'schoolProgress';

export const DEFAULT_SEED_CATEGORIES: Omit<SchoolCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'skills',
    title: { en: 'Core Skills', fr: 'Compétences Fondamentales', ar: 'المهارات الأساسية' },
    description: {
      en: 'Foundational analytical, cognitive, and organizational execution frameworks.',
      fr: 'Cadres d\'exécution analytiques, cognitifs et organisationnels fondamentaux.',
      ar: 'أطر التنفيذ التحليلية والمعرفية والتنظيمية التأسيسية.',
    },
    iconName: 'Sparkles',
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: 'digital-skills',
    title: { en: 'Digital Skills', fr: 'Compétences Numériques', ar: 'المهارات الرقمية' },
    description: {
      en: 'Modern computational, data management, and software literacy competencies.',
      fr: 'Compétences modernes en informatique, gestion des données et logiciels.',
      ar: 'الكفاءات الحاسوبية الحديثة وإدارة البيانات واستخدام البرمجيات.',
    },
    iconName: 'Cpu',
    displayOrder: 2,
    isPublished: true,
  },
  {
    slug: 'agriculture',
    title: { en: 'Agriculture & Bio-Systems', fr: 'Agriculture & Bio-Systèmes', ar: 'الزراعة والأنظمة الحيوية' },
    description: {
      en: 'Modern precision farming, soil regeneration, and sustainable cultivation methods.',
      fr: 'Agriculture de précision moderne, régénération des sols et méthodes de culture durables.',
      ar: 'الزراعة الدقيقة الحديثة، وتجديد التربة، وأساليب الزراعة المستدامة.',
    },
    iconName: 'Sprout',
    displayOrder: 3,
    isPublished: true,
  },
  {
    slug: 'entrepreneurship',
    title: { en: 'Entrepreneurship & Commerce', fr: 'Entrepreneuriat & Commerce', ar: 'ريادة الأعمال والتجارة' },
    description: {
      en: 'Venture establishment, micro-enterprise economics, and product distribution.',
      fr: 'Création d\'entreprises, économie des micro-entreprises et distribution.',
      ar: 'تأسيس المشاريع، واقتصاد المشاريع المتناهية الصغر، وتوزيع المنتجات.',
    },
    iconName: 'TrendingUp',
    displayOrder: 4,
    isPublished: true,
  },
  {
    slug: 'personal-development',
    title: { en: 'Personal Development & Mastery', fr: 'Développement Personnel & Maîtrise', ar: 'التطوير الشخصي والتمكن' },
    description: {
      en: 'Cognitive resilience, behavioral discipline, and performance optimization.',
      fr: 'Résilience cognitive, discipline comportementale et optimisation des performances.',
      ar: 'المرونة المعرفية، والانضباط السلوكي، وتحسين الأداء.',
    },
    iconName: 'Compass',
    displayOrder: 5,
    isPublished: true,
  },
  {
    slug: 'trades',
    title: { en: 'Technical Trades', fr: 'Métiers Techniques', ar: 'الحرف والمهن التقنية' },
    description: {
      en: 'Applied mechanical, electrical, and fabrication technical capabilities.',
      fr: 'Capacités techniques appliquées en mécanique, électricité et fabrication.',
      ar: 'القدرات التقنية التطبيقية في الميكانيكا والكهرباء والتصنيع.',
    },
    iconName: 'Wrench',
    displayOrder: 6,
    isPublished: true,
  },
  {
    slug: 'livestock',
    title: { en: 'Livestock & Animal Husbandry', fr: 'Élevage & Soins Animaux', ar: 'تربية المواشي والإنتاج الحيواني' },
    description: {
      en: 'Veterinary hygiene, herd management, nutritional protocols, and biological resilience.',
      fr: 'Hygiène vétérinaire, gestion des troupeaux, protocoles nutritionnels et résilience.',
      ar: 'الصحة البيطرية، وإدارة القطعان، والبروتوكولات الغذائية، والمرونة البيولوجية.',
    },
    iconName: 'Activity',
    displayOrder: 7,
    isPublished: true,
  },
  {
    slug: 'beekeeping',
    title: { en: 'Beekeeping & Apiculture', fr: 'Apiculture & Systèmes Mellifères', ar: 'تربية النحل وعلم إنتاج العسل' },
    description: {
      en: 'Apiary installation, colony health diagnostics, honey extraction, and ecological pollination.',
      fr: 'Installation de ruchers, diagnostic sanitaire des colonies, extraction et pollinisation.',
      ar: 'إنشاء المناحل، وتشخيص صحة الخلايا، واستخلاص العسل، والتلقيح البيئي.',
    },
    iconName: 'Sun',
    displayOrder: 8,
    isPublished: true,
  },
  {
    slug: 'employment',
    title: { en: 'Professional Employment Readiness', fr: 'Préparation à l\'Emploi', ar: 'الجاهزية للتوظيف المهني' },
    description: {
      en: 'Professional articulation, interview strategies, and workplace coordination.',
      fr: 'Articulation professionnelle, stratégies d\'entretien et coordination.',
      ar: 'التواصل المهني، واستراتيجيات المقابلات، والتنسيق في بيئة العمل.',
    },
    iconName: 'Briefcase',
    displayOrder: 9,
    isPublished: true,
  },
  {
    slug: 'business',
    title: { en: 'Strategic Business Operations', fr: 'Opérations Commerciales Stratégiques', ar: 'إدارة الأعمال الاستراتيجية' },
    description: {
      en: 'Financial literacy, operational supply chains, and managerial governance.',
      fr: 'Littératie financière, chaînes d\'approvisionnement et gouvernance managériale.',
      ar: 'الثقافة المالية، وسلاسل التوريد التشغيلية، والحوكمة الإدارية.',
    },
    iconName: 'BarChart3',
    displayOrder: 10,
    isPublished: true,
  },
];

/**
 * List all categories from Firestore.
 * Fallback to seed list if database collection is not yet populated.
 */
export async function listSchoolCategories(includeUnpublished = false): Promise<SchoolCategory[]> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      // Return formatted seed items if collection has not been seeded yet
      return DEFAULT_SEED_CATEGORIES.map((cat, idx) => ({
        ...cat,
        id: `seed-${cat.slug}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    const categories = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SchoolCategory, 'id'>),
    }));

    const filtered = includeUnpublished ? categories : categories.filter((c) => c.isPublished);
    return filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.warn('Error reading school categories from Firestore, using default seed:', error);
    return DEFAULT_SEED_CATEGORIES.map((cat, idx) => ({
      ...cat,
      id: `seed-${cat.slug}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

/**
 * Admin: Create a new School Category via authoritative Cloud Function.
 * Direct client addDoc is strictly forbidden by Firestore rules.
 */
export async function createSchoolCategory(
  data: Omit<SchoolCategory, 'id' | 'createdAt' | 'updatedAt'>,
  _actor?: UserProfile
): Promise<string> {
  const createCategoryCallable = httpsCallable<
    Omit<SchoolCategory, 'id' | 'createdAt' | 'updatedAt'>,
    { success: boolean; id: string }
  >(functionsInstance, 'createSchoolCategory');

  try {
    const res = await createCategoryCallable(data);
    return res.data.id;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to create school category.');
  }
}

/**
 * Admin: Update an existing School Category via authoritative Cloud Function.
 * Direct client updateDoc is strictly forbidden by Firestore rules.
 */
export async function updateSchoolCategory(
  id: string,
  data: Partial<SchoolCategory>,
  _actor?: UserProfile
): Promise<void> {
  const updateCategoryCallable = httpsCallable<
    { categoryId: string; updates: Partial<SchoolCategory> },
    { success: boolean; categoryId: string }
  >(functionsInstance, 'updateSchoolCategory');

  try {
    await updateCategoryCallable({ categoryId: id, updates: data });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update school category.');
  }
}

/**
 * Admin: Delete a School Category via authoritative Cloud Function.
 */
export async function deleteSchoolCategory(categoryId: string): Promise<void> {
  const deleteCategoryCallable = httpsCallable<
    { categoryId: string },
    { success: boolean; categoryId: string }
  >(functionsInstance, 'deleteSchoolCategory');

  try {
    await deleteCategoryCallable({ categoryId });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to delete school category.');
  }
}

/**
 * Admin: Create a new School Course via authoritative Cloud Function.
 */
export async function createSchoolCourse(
  data: Omit<SchoolCourse, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const createCourseCallable = httpsCallable<
    Omit<SchoolCourse, 'id' | 'createdAt' | 'updatedAt'>,
    { success: boolean; id: string }
  >(functionsInstance, 'createSchoolCourse');

  try {
    const res = await createCourseCallable(data);
    return res.data.id;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to create school course.');
  }
}

/**
 * Admin: Update an existing School Course via authoritative Cloud Function.
 */
export async function updateSchoolCourse(
  courseId: string,
  updates: Partial<SchoolCourse>
): Promise<void> {
  const updateCourseCallable = httpsCallable<
    { courseId: string; updates: Partial<SchoolCourse> },
    { success: boolean; courseId: string }
  >(functionsInstance, 'updateSchoolCourse');

  try {
    await updateCourseCallable({ courseId, updates });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update school course.');
  }
}

/**
 * Admin: Delete a School Course via authoritative Cloud Function.
 */
export async function deleteSchoolCourse(courseId: string): Promise<void> {
  const deleteCourseCallable = httpsCallable<
    { courseId: string },
    { success: boolean; courseId: string }
  >(functionsInstance, 'deleteSchoolCourse');

  try {
    await deleteCourseCallable({ courseId });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to delete school course.');
  }
}

/**
 * List courses for a specific category.
 */
export async function listCoursesByCategory(
  categoryId: string,
  includeUnpublished = false
): Promise<SchoolCourse[]> {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('categoryId', '==', categoryId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const courses = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SchoolCourse, 'id'>),
      }));
      return includeUnpublished ? courses : courses.filter((c) => c.isPublished);
    }

    // Fallback to seed courses matching categoryId or category slug
    const seedMatches = SEED_COURSES.filter(
      (c) => c.categoryId === categoryId || categoryId.includes(c.categoryId.replace('seed-', ''))
    );
    return includeUnpublished ? seedMatches : seedMatches.filter((c) => c.isPublished);
  } catch (error) {
    console.warn(`Could not load courses for category ${categoryId}:`, error);
    const seedMatches = SEED_COURSES.filter(
      (c) => c.categoryId === categoryId || categoryId.includes(c.categoryId.replace('seed-', ''))
    );
    return includeUnpublished ? seedMatches : seedMatches.filter((c) => c.isPublished);
  }
}

/**
 * List all courses across categories.
 */
export async function listAllCourses(includeUnpublished = false): Promise<SchoolCourse[]> {
  try {
    const colRef = collection(db, COURSES_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const courses = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SchoolCourse, 'id'>),
      }));
      const sorted = courses.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      return includeUnpublished ? sorted : sorted.filter((c) => c.isPublished);
    }
    return includeUnpublished ? SEED_COURSES : SEED_COURSES.filter((c) => c.isPublished);
  } catch (error) {
    console.warn('Error reading courses:', error);
    return includeUnpublished ? SEED_COURSES : SEED_COURSES.filter((c) => c.isPublished);
  }
}

/**
 * Fetch a single course by its ID or slug.
 */
export async function getCourseById(courseId: string): Promise<SchoolCourse | null> {
  if (!courseId) return null;
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    const snap = await getDoc(courseRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<SchoolCourse, 'id'>) };
    }
    const seed = SEED_COURSES.find((c) => c.id === courseId || c.slug === courseId);
    return seed || null;
  } catch (error) {
    console.warn(`Error reading course ${courseId}:`, error);
    const seed = SEED_COURSES.find((c) => c.id === courseId || c.slug === courseId);
    return seed || null;
  }
}

/**
 * Checks whether user has valid entitlement to ZIRON School curriculum.
 * Entitlement must be backend-derived from verified product activations
 * or staff permissions, not arbitrary client claims.
 */
export function checkSchoolEntitlement(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return hasPermission(user, 'ACCESS_SCHOOL');
}

/**
 * Public Certificate Verification
 * Queries /publicCertificates/{certificateNumber} directly by known certificate number.
 * Contains only non-sensitive verification data (certificateNumber, recipientName, courseTitle, issuedAt, status).
 * Prevents enumeration / listing of all student certificates and leaks zero PII.
 */
export async function verifyPublicCertificate(
  certificateNumber: string
): Promise<{ certificateNumber: string; recipientName: string; courseTitle: string; issuedAt: string; status: string } | null> {
  const cleanNumber = certificateNumber.trim().toUpperCase();
  if (!cleanNumber) return null;

  try {
    const certDocRef = doc(db, 'publicCertificates', cleanNumber);
    const snap = await getDoc(certDocRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as {
      certificateNumber: string;
      recipientName: string;
      courseTitle: string;
      issuedAt: string;
      status: string;
    };
  } catch (error) {
    console.warn('Public certificate verification error:', error);
    return null;
  }
}

/**
 * Lists private certificates issued to a specific student.
 * Firestore rules restrict this to the student owner or staff.
 */
export async function getUserCertificates(userId: string) {
  try {
    const q = query(collection(db, 'certificates'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Error reading certificates:', error);
    return [];
  }
}

/* ==========================================================================
   MODULES API
   ========================================================================== */

/**
 * List modules belonging to a course.
 */
export async function listModulesByCourse(
  courseId: string,
  includeUnpublished = false
): Promise<SchoolModule[]> {
  try {
    const q = query(
      collection(db, MODULES_COLLECTION),
      where('courseId', '==', courseId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const modules = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SchoolModule, 'id'>),
      }));
      return includeUnpublished ? modules : modules.filter((m) => m.isPublished);
    }
    const seedModules = SEED_MODULES.filter((m) => m.courseId === courseId);
    return includeUnpublished ? seedModules : seedModules.filter((m) => m.isPublished);
  } catch (error) {
    console.warn(`Could not load modules for course ${courseId}:`, error);
    const seedModules = SEED_MODULES.filter((m) => m.courseId === courseId);
    return includeUnpublished ? seedModules : seedModules.filter((m) => m.isPublished);
  }
}

/**
 * Admin/Staff: Create a School Module via authoritative Cloud Function.
 */
export async function createSchoolModule(
  data: Omit<SchoolModule, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const callable = httpsCallable<
    Omit<SchoolModule, 'id' | 'createdAt' | 'updatedAt'>,
    { success: boolean; id: string }
  >(functionsInstance, 'createSchoolModule');

  try {
    const res = await callable(data);
    return res.data.id;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to create school module.');
  }
}

/**
 * Admin/Staff: Update a School Module via authoritative Cloud Function.
 */
export async function updateSchoolModule(
  moduleId: string,
  updates: Partial<SchoolModule>
): Promise<void> {
  const callable = httpsCallable<
    { moduleId: string; updates: Partial<SchoolModule> },
    { success: boolean; moduleId: string }
  >(functionsInstance, 'updateSchoolModule');

  try {
    await callable({ moduleId, updates });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update school module.');
  }
}

/**
 * Admin/Staff: Delete a School Module via authoritative Cloud Function.
 */
export async function deleteSchoolModule(moduleId: string): Promise<void> {
  const callable = httpsCallable<
    { moduleId: string },
    { success: boolean; moduleId: string }
  >(functionsInstance, 'deleteSchoolModule');

  try {
    await callable({ moduleId });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to delete school module.');
  }
}

/* ==========================================================================
   LESSONS API
   ========================================================================== */

/**
 * List lessons belonging to a specific module.
 */
export async function listLessonsByModule(
  moduleId: string,
  includeUnpublished = false
): Promise<SchoolLesson[]> {
  try {
    const q = query(
      collection(db, LESSONS_COLLECTION),
      where('moduleId', '==', moduleId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const lessons = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SchoolLesson, 'id'>),
      }));
      return includeUnpublished ? lessons : lessons.filter((l) => l.isPublished);
    }
    const seedLessons = SEED_LESSONS.filter((l) => l.moduleId === moduleId);
    return includeUnpublished ? seedLessons : seedLessons.filter((l) => l.isPublished);
  } catch (error) {
    console.warn(`Could not load lessons for module ${moduleId}:`, error);
    const seedLessons = SEED_LESSONS.filter((l) => l.moduleId === moduleId);
    return includeUnpublished ? seedLessons : seedLessons.filter((l) => l.isPublished);
  }
}

/**
 * List all lessons belonging to a course.
 */
export async function listLessonsByCourse(
  courseId: string,
  includeUnpublished = false
): Promise<SchoolLesson[]> {
  try {
    const q = query(
      collection(db, LESSONS_COLLECTION),
      where('courseId', '==', courseId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const lessons = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SchoolLesson, 'id'>),
      }));
      return includeUnpublished ? lessons : lessons.filter((l) => l.isPublished);
    }
    const seedLessons = SEED_LESSONS.filter((l) => l.courseId === courseId);
    return includeUnpublished ? seedLessons : seedLessons.filter((l) => l.isPublished);
  } catch (error) {
    console.warn(`Could not load lessons for course ${courseId}:`, error);
    const seedLessons = SEED_LESSONS.filter((l) => l.courseId === courseId);
    return includeUnpublished ? seedLessons : seedLessons.filter((l) => l.isPublished);
  }
}

/**
 * Admin/Staff: Create a School Lesson via authoritative Cloud Function.
 */
export async function createSchoolLesson(
  data: Omit<SchoolLesson, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const callable = httpsCallable<
    Omit<SchoolLesson, 'id' | 'createdAt' | 'updatedAt'>,
    { success: boolean; id: string }
  >(functionsInstance, 'createSchoolLesson');

  try {
    const res = await callable(data);
    return res.data.id;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to create school lesson.');
  }
}

/**
 * Admin/Staff: Update a School Lesson via authoritative Cloud Function.
 */
export async function updateSchoolLesson(
  lessonId: string,
  updates: Partial<SchoolLesson>
): Promise<void> {
  const callable = httpsCallable<
    { lessonId: string; updates: Partial<SchoolLesson> },
    { success: boolean; lessonId: string }
  >(functionsInstance, 'updateSchoolLesson');

  try {
    await callable({ lessonId, updates });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update school lesson.');
  }
}

/**
 * Admin/Staff: Delete a School Lesson via authoritative Cloud Function.
 */
export async function deleteSchoolLesson(lessonId: string): Promise<void> {
  const callable = httpsCallable<
    { lessonId: string },
    { success: boolean; lessonId: string }
  >(functionsInstance, 'deleteSchoolLesson');

  try {
    await callable({ lessonId });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to delete school lesson.');
  }
}

/* ==========================================================================
   ENROLLMENT & PROGRESS API
   ========================================================================== */

/**
 * Query Authoritative School Access Status from backend
 */
export async function queryAuthoritativeSchoolAccess(): Promise<{
  hasAccess: boolean;
  qualifyingContainerCount: number;
  isStaff: boolean;
  authenticated: boolean;
}> {
  const callable = httpsCallable<
    unknown,
    { hasAccess: boolean; qualifyingContainerCount: number; isStaff: boolean; authenticated: boolean }
  >(functionsInstance, 'getSchoolAccessStatus');

  try {
    const res = await callable({});
    return res.data;
  } catch (err) {
    console.warn('Could not query authoritative school access status:', err);
    return { hasAccess: false, qualifyingContainerCount: 0, isStaff: false, authenticated: false };
  }
}

/**
 * Enroll user in a school course via authoritative Cloud Function.
 */
export async function enrollInCourse(courseId: string): Promise<{
  success: boolean;
  enrollmentId: string;
  courseId: string;
  isAlreadyEnrolled: boolean;
  totalLessonsCount: number;
}> {
  const callable = httpsCallable<
    { courseId: string },
    { success: boolean; enrollmentId: string; courseId: string; isAlreadyEnrolled: boolean; totalLessonsCount: number }
  >(functionsInstance, 'enrollInCourse');

  try {
    const res = await callable({ courseId });
    return res.data;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to enroll in course.');
  }
}

/**
 * Fetch a student's enrollment record for a specific course.
 */
export async function getUserEnrollment(
  userId: string,
  courseId: string
): Promise<EnrollmentRecord | null> {
  try {
    const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, `${userId}_${courseId}`);
    const snap = await getDoc(enrollmentRef);
    if (!snap.exists()) return null;
    return snap.data() as EnrollmentRecord;
  } catch (error) {
    console.warn('Error reading enrollment:', error);
    return null;
  }
}

/**
 * Fetch all enrollment records for a student.
 */
export async function listUserEnrollments(userId: string): Promise<EnrollmentRecord[]> {
  try {
    const q = query(collection(db, ENROLLMENTS_COLLECTION), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as EnrollmentRecord);
  } catch (error) {
    console.warn('Error reading user enrollments:', error);
    return [];
  }
}

/**
 * Fetch a student's authoritative progress for a course.
 */
export async function getUserSchoolProgress(
  userId: string,
  courseId: string
): Promise<SchoolProgress | null> {
  try {
    const progressRef = doc(db, PROGRESS_COLLECTION, `${userId}_${courseId}`);
    const snap = await getDoc(progressRef);
    if (!snap.exists()) return null;
    return snap.data() as SchoolProgress;
  } catch (error) {
    console.warn('Error reading school progress:', error);
    return null;
  }
}

/**
 * Fetch all school progress records for a student.
 */
export async function listUserProgress(userId: string): Promise<SchoolProgress[]> {
  try {
    const q = query(collection(db, PROGRESS_COLLECTION), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SchoolProgress);
  } catch (error) {
    console.warn('Error reading user progress list:', error);
    return [];
  }
}

/**
 * Mark a lesson as completed via authoritative Cloud Function.
 * Returns updated progress calculation and completion status.
 */
export async function completeSchoolLesson(
  courseId: string,
  lessonId: string
): Promise<{
  success: boolean;
  courseId: string;
  lessonId: string;
  progressPercent: number;
  completedCount: number;
  totalLessonsCount: number;
  isCompleted: boolean;
  completedAt: string | null;
  certificate?: any;
  certificateStatus?: string;
  certificateError?: string | null;
}> {
  const callable = httpsCallable<
    { courseId: string; lessonId: string },
    {
      success: boolean;
      courseId: string;
      lessonId: string;
      progressPercent: number;
      completedCount: number;
      totalLessonsCount: number;
      isCompleted: boolean;
      completedAt: string | null;
      certificate?: any;
      certificateStatus?: string;
      certificateError?: string | null;
    }
  >(functionsInstance, 'completeSchoolLesson');

  try {
    const res = await callable({ courseId, lessonId });
    return res.data;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to complete school lesson.');
  }
}


