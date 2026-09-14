import {
  BadgeDefinition,
  BadgeKey,
  LevelProgress,
  LevelThreshold,
  MilestoneDefinition,
  MilestoneKey,
  Reward,
  XpEventType,
} from '@/types/gamification';

/**
 * Centralized configurable XP values.
 * Preserves existing values (50 XP for product activation) and defines all canonical event weights.
 */
export const XP_VALUES: Record<XpEventType, number> = {
  PRODUCT_ACTIVATED: 50,
  JOURNEY_DAY_COMPLETED: 10,
  JOURNEY_PHASE_COMPLETED: 100,
  SCHOOL_LESSON_COMPLETED: 15,
  SCHOOL_COURSE_COMPLETED: 250,
  COMMUNITY_POST_CREATED: 10,
  COMMUNITY_COMMENT_CREATED: 5,
  CHALLENGE_COMPLETED: 0, // Prepared architecture; challenges not implemented in this phase
};

/**
 * Centralized Level System Configuration.
 * 10 Deterministic tiers scaling up to 10,000 XP.
 */
export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, minXp: 0, titleEn: 'Initiate', titleFr: 'Initié', titleAr: 'مبتدئ' },
  { level: 2, minXp: 100, titleEn: 'Observer', titleFr: 'Observateur', titleAr: 'ملاحظ' },
  { level: 3, minXp: 250, titleEn: 'Practitioner', titleFr: 'Pratiquant', titleAr: 'ممارس' },
  { level: 4, minXp: 500, titleEn: 'Adept', titleFr: 'Adepte', titleAr: 'متمرس' },
  { level: 5, minXp: 1000, titleEn: 'Biomarker Specialist', titleFr: 'Spécialiste Biomarqueurs', titleAr: 'أخصائي مؤشرات حيوية' },
  { level: 6, minXp: 2000, titleEn: 'Resilience Architect', titleFr: 'Architecte de Résilience', titleAr: 'مهندس مناعة وتكيف' },
  { level: 7, minXp: 3500, titleEn: 'Cellular Scholar', titleFr: 'Érudit Cellulaire', titleAr: 'عالم خلوي' },
  { level: 8, minXp: 5000, titleEn: 'Virexon Fellow', titleFr: 'Membre Associé Virexon', titleAr: 'زميل فيريكسون' },
  { level: 9, minXp: 7500, titleEn: 'Master of Protocols', titleFr: 'Maître des Protocoles', titleAr: 'أستاذ البروتوكولات' },
  { level: 10, minXp: 10000, titleEn: 'Grand Chancellor', titleFr: 'Grand Chancelier', titleAr: 'المستشار الأكبر' },
];

/**
 * Calculates current level, progression percentage, and XP needed for next tier deterministically.
 */
export function calculateLevel(xp: number): LevelProgress {
  const safeXp = Math.max(0, Math.floor(xp || 0));

  let currentTierIndex = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (safeXp >= LEVEL_THRESHOLDS[i].minXp) {
      currentTierIndex = i;
    } else {
      break;
    }
  }

  const currentTier = LEVEL_THRESHOLDS[currentTierIndex];
  const isMaxLevel = currentTierIndex === LEVEL_THRESHOLDS.length - 1;
  const nextTier = isMaxLevel ? null : LEVEL_THRESHOLDS[currentTierIndex + 1];

  const currentLevel = currentTier.level;
  const nextLevel = nextTier ? nextTier.level : null;
  const xpForCurrentLevel = currentTier.minXp;
  const xpForNextLevel = nextTier ? nextTier.minXp : null;

  let progressPercent = 100;
  let xpNeededForNextLevel = 0;

  if (nextTier) {
    const range = nextTier.minXp - currentTier.minXp;
    const gainedInRange = safeXp - currentTier.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((gainedInRange / range) * 100)));
    xpNeededForNextLevel = Math.max(0, nextTier.minXp - safeXp);
  }

  return {
    currentLevel,
    currentXp: safeXp,
    nextLevel,
    xpForCurrentLevel,
    xpForNextLevel,
    xpNeededForNextLevel,
    progressPercent,
    levelTitleEn: currentTier.titleEn,
    levelTitleFr: currentTier.titleFr,
    levelTitleAr: currentTier.titleAr,
  };
}

/**
 * Canonical Milestone Definitions
 */
export const MILESTONE_DEFINITIONS: Record<MilestoneKey, MilestoneDefinition> = {
  FIRST_PRODUCT: {
    key: 'FIRST_PRODUCT',
    titleEn: 'First Container Verified',
    titleFr: 'Premier Flacon Vérifié',
    titleAr: 'توثيق العبوة الأولى',
    descriptionEn: 'Successfully activated your first ZIRON container code.',
    descriptionFr: 'Activation réussie de votre premier code de flacon ZIRON.',
    descriptionAr: 'تم تفعيل كود أول عبوة ZIRON بنجاح.',
    icon: 'PackageCheck',
  },
  THREE_PRODUCTS: {
    key: 'THREE_PRODUCTS',
    titleEn: 'Three Containers Verified',
    titleFr: 'Trois Flacons Vérifiés',
    titleAr: 'توثيق 3 عبوات',
    descriptionEn: 'Linked 3 physical containers across your continuous wellness regimen.',
    descriptionFr: '3 flacons physiques liés à votre protocole continu.',
    descriptionAr: 'ربط 3 عبوات فيزيائية ضمن بروتوكولك الصحي المستمر.',
    icon: 'Boxes',
  },
  SCHOOL_UNLOCKED: {
    key: 'SCHOOL_UNLOCKED',
    titleEn: 'ZIRON School Unlocked',
    titleFr: 'École ZIRON Débloquée',
    titleAr: 'فتح مدرسة ZIRON',
    descriptionEn: 'Earned official curriculum access through 3 container activations.',
    descriptionFr: 'Accès au programme officiel débloqué via 3 flacons vérifiés.',
    descriptionAr: 'الحصول على صلاحية المناهج الدراسية بعد توثيق 3 عبوات.',
    icon: 'GraduationCap',
  },
  FIRST_LESSON: {
    key: 'FIRST_LESSON',
    titleEn: 'First Lesson Completed',
    titleFr: 'Première Leçon Terminée',
    titleAr: 'إكمال أول درس',
    descriptionEn: 'Completed your first structured lesson in the ZIRON School.',
    descriptionFr: 'Première leçon structurée terminée dans l\'École ZIRON.',
    descriptionAr: 'إكمال أول درس منظم في مدرسة ZIRON.',
    icon: 'BookOpen',
  },
  FIRST_COURSE_COMPLETED: {
    key: 'FIRST_COURSE_COMPLETED',
    titleEn: 'First Course Completed',
    titleFr: 'Premier Cours Terminé',
    titleAr: 'إكمال أول دورة تدريبية',
    descriptionEn: 'Mastered 100% of all lessons within a curriculum track.',
    descriptionFr: 'Maîtrise à 100% de toutes les leçons d\'un parcours.',
    descriptionAr: 'إتقان 100% من جميع دروس مسار تعليمي كامل.',
    icon: 'Award',
  },
  FIRST_PHASE_COMPLETED: {
    key: 'FIRST_PHASE_COMPLETED',
    titleEn: 'Phase 1 Completed',
    titleFr: 'Phase 1 Terminée',
    titleAr: 'إتمام المرحلة الأولى',
    descriptionEn: 'Finished the foundational 30 days of the 90-day protocol.',
    descriptionFr: 'Achèvement des 30 premiers jours du protocole de 90 jours.',
    descriptionAr: 'إتمام الـ 30 يوماً التأسيسية الأولى من بروتوكول الـ 90 يوماً.',
    icon: 'ShieldCheck',
  },
  FULL_90_DAY_PROGRAM: {
    key: 'FULL_90_DAY_PROGRAM',
    titleEn: 'Full 90-Day Protocol Mastered',
    titleFr: 'Protocole de 90 Jours Accompli',
    titleAr: 'إتمام بروتوكول الـ 90 يوماً كاملاً',
    descriptionEn: 'Successfully completed the entire 90-day cellular trajectory.',
    descriptionFr: 'Réalisation complète du parcours cellulaire de 90 jours.',
    descriptionAr: 'إكمال مسار الـ 90 يوماً الخلوي بالكامل بنجاح.',
    icon: 'Flame',
  },
};

/**
 * Canonical Badge Definitions
 */
export const BADGE_DEFINITIONS: Record<BadgeKey, BadgeDefinition> = {
  FIRST_STEP: {
    key: 'FIRST_STEP',
    nameEn: 'First Step',
    nameFr: 'Premier Pas',
    nameAr: 'الخطوة الأولى',
    descriptionEn: 'Activated your very first authentic ZIRON container.',
    descriptionFr: 'Activation de votre premier flacon authentique ZIRON.',
    descriptionAr: 'تفعيل أول عبوة ZIRON أصلية وموثقة.',
    icon: 'Sparkles',
    requirementEn: '1 container activation',
    requirementFr: '1 flacon activé',
    requirementAr: 'تفعيل عبوة واحدة',
  },
  COMMITTED: {
    key: 'COMMITTED',
    nameEn: 'Committed',
    nameFr: 'Engagé',
    nameAr: 'ملتزم',
    descriptionEn: 'Maintained a 7-day consecutive activity streak on the platform.',
    descriptionFr: 'Maintien d\'une série d\'activité de 7 jours consécutifs.',
    descriptionAr: 'الحفاظ على سلسلة نشاط متواصلة لمدة 7 أيام متتالية.',
    icon: 'Flame',
    requirementEn: '7-day activity streak',
    requirementFr: 'Série de 7 jours',
    requirementAr: 'سلسلة 7 أيام',
  },
  DISCIPLINED: {
    key: 'DISCIPLINED',
    nameEn: 'Disciplined',
    nameFr: 'Discipliné',
    nameAr: 'منضبط',
    descriptionEn: 'Achieved an exemplary 30-day consecutive activity streak.',
    descriptionFr: 'Série exemplaire de 30 jours consécutifs d\'activité.',
    descriptionAr: 'تحقيق سلسلة نشاط نموذجية لمدة 30 يوماً متتالياً.',
    icon: 'Zap',
    requirementEn: '30-day activity streak',
    requirementFr: 'Série de 30 jours',
    requirementAr: 'سلسلة 30 يوماً',
  },
  SCHOOL_READY: {
    key: 'SCHOOL_READY',
    nameEn: 'School Ready',
    nameFr: 'Prêt pour l\'École',
    nameAr: 'مؤهل للمدرسة',
    descriptionEn: 'Unlocked full access to the ZIRON School learning tracks.',
    descriptionFr: 'Accès complet aux parcours de l\'École ZIRON débloqué.',
    descriptionAr: 'فتح الصلاحية الكاملة لمسارات مدرسة ZIRON التعليمية.',
    icon: 'GraduationCap',
    requirementEn: '3 verified container activations',
    requirementFr: '3 flacons vérifiés',
    requirementAr: '3 عبوات مفعلة وموثقة',
  },
  LEARNER: {
    key: 'LEARNER',
    nameEn: 'Learner',
    nameFr: 'Apprenant',
    nameAr: 'متعلم',
    descriptionEn: 'Graduated from your first complete ZIRON School course.',
    descriptionFr: 'Diplômé de votre premier cours complet de l\'École ZIRON.',
    descriptionAr: 'التخرج من أول دورة تدريبية كاملة في مدرسة ZIRON.',
    icon: 'BookOpen',
    requirementEn: '1 completed course',
    requirementFr: '1 cours terminé',
    requirementAr: 'إكمال دورة واحدة',
  },
  SCHOLAR: {
    key: 'SCHOLAR',
    nameEn: 'Scholar',
    nameFr: 'Érudit',
    nameAr: 'باحث',
    descriptionEn: 'Completed 3 distinct curriculum courses in the School.',
    descriptionFr: 'Validation de 3 cours distincts de l\'École.',
    descriptionAr: 'إكمال 3 دورات تدريبية مختلفة في المدرسة.',
    icon: 'Award',
    requirementEn: '3 completed courses',
    requirementFr: '3 cours terminés',
    requirementAr: 'إكمال 3 دورات',
  },
  JOURNEY_COMPLETE: {
    key: 'JOURNEY_COMPLETE',
    nameEn: 'Journey Complete',
    nameFr: 'Parcours Accompli',
    nameAr: 'إتمام المسار',
    descriptionEn: 'Completed all 90 days of the structured wellness protocol.',
    descriptionFr: 'Réalisation complète des 90 jours du protocole.',
    descriptionAr: 'إكمال جميع أيام البروتوكول الـ 90 المنظم بنجاح.',
    icon: 'Compass',
    requirementEn: '90 days completed',
    requirementFr: '90 jours validés',
    requirementAr: 'إتمام 90 يوماً',
  },
};

/**
 * Initial canonical seed rewards catalogue (Digital / Educational / Platform only).
 * No physical goods or delivery promised in this phase.
 */
export const SEED_REWARDS: Reward[] = [
  {
    id: 'reward_digital_bio_guide',
    title: 'ZIRON Biomarker Optimization Protocol (PDF Edition)',
    description: 'A 42-page comprehensive scientific guide covering micronutrient bioavailability, chronobiology timing optimization, and cellular biomarker checkpoints.',
    type: 'DIGITAL',
    xpCost: 100,
    isActive: true,
    stock: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'reward_school_masterclass',
    title: 'Exclusive Masterclass: Advanced Metabolic Resilience',
    description: 'On-demand high-definition seminar series taught by clinical researchers on mitochondrial health, NAD+ cascades, and stress adaptation.',
    type: 'EDUCATIONAL',
    xpCost: 250,
    isActive: true,
    stock: 200,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'reward_community_badge_patron',
    title: 'Distinguished Community Patron Status',
    description: 'Unlocks a prestigious patron badge and glowing accent beside your name across all ZIRON Community discussion boards and research forums.',
    type: 'PLATFORM_BENEFIT',
    xpCost: 500,
    isActive: true,
    stock: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'reward_clinical_qa_session',
    title: 'VIP Roundtable Seat: Monthly Scientific Review',
    description: 'Reserved participant seat in the live virtual monthly roundtable with Virexon Biosciences lead research biochemists and formulators.',
    type: 'EDUCATIONAL',
    xpCost: 1000,
    isActive: true,
    stock: 50,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_REWARDS = SEED_REWARDS;

export const BADGE_CATALOG: BadgeDefinition[] = Object.values(BADGE_DEFINITIONS);
export const MILESTONE_CATALOG: MilestoneDefinition[] = Object.values(MILESTONE_DEFINITIONS);

/**
 * Calculates updated streak state given previous streak record and an activity date (YYYY-MM-DD).
 * Server-authoritative logic avoiding false increments on same-day activity.
 */
export function calculateStreakUpdate(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | null,
  activityDate: string
): { currentStreak: number; longestStreak: number; isConsecutive: boolean; isSameDay: boolean } {
  if (!lastActivityDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      isConsecutive: false,
      isSameDay: false,
    };
  }

  if (lastActivityDate === activityDate) {
    // Same day activity: preserve existing streak without increment
    return {
      currentStreak,
      longestStreak,
      isConsecutive: false,
      isSameDay: true,
    };
  }

  // Calculate day difference
  const lastTime = new Date(`${lastActivityDate}T00:00:00Z`).getTime();
  const currTime = new Date(`${activityDate}T00:00:00Z`).getTime();
  const diffDays = Math.round((currTime - lastTime) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Exact next consecutive day
    const updatedCurrent = currentStreak + 1;
    return {
      currentStreak: updatedCurrent,
      longestStreak: Math.max(longestStreak, updatedCurrent),
      isConsecutive: true,
      isSameDay: false,
    };
  } else if (diffDays > 1) {
    // Missed one or more days: reset streak to 1
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      isConsecutive: false,
      isSameDay: false,
    };
  } else {
    // Activity date is earlier than lastActivityDate (e.g. out of order log): leave streak unchanged
    return {
      currentStreak,
      longestStreak,
      isConsecutive: false,
      isSameDay: false,
    };
  }
}
