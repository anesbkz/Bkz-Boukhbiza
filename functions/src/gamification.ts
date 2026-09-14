/**
 * Centralized Gamification & XP Configuration for Cloud Functions.
 * Server-authoritative engine for XP ledger, levels, milestones, badges, streaks, and reward redemption.
 */

export type XpEventType =
  | 'PRODUCT_ACTIVATED'
  | 'JOURNEY_DAY_COMPLETED'
  | 'JOURNEY_PHASE_COMPLETED'
  | 'SCHOOL_LESSON_COMPLETED'
  | 'SCHOOL_COURSE_COMPLETED'
  | 'COMMUNITY_POST_CREATED'
  | 'COMMUNITY_COMMENT_CREATED'
  | 'CHALLENGE_COMPLETED';

export type XpTransactionType = 'EARNED' | 'REDEEMED' | 'ADJUSTMENT';

export const XP_VALUES: Record<XpEventType, number> = {
  PRODUCT_ACTIVATED: 50,
  JOURNEY_DAY_COMPLETED: 10,
  JOURNEY_PHASE_COMPLETED: 100,
  SCHOOL_LESSON_COMPLETED: 15,
  SCHOOL_COURSE_COMPLETED: 250,
  COMMUNITY_POST_CREATED: 10,
  COMMUNITY_COMMENT_CREATED: 5,
  CHALLENGE_COMPLETED: 0,
};

export interface LevelThreshold {
  level: number;
  minXp: number;
  titleEn: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, minXp: 0, titleEn: 'Initiate' },
  { level: 2, minXp: 100, titleEn: 'Observer' },
  { level: 3, minXp: 250, titleEn: 'Practitioner' },
  { level: 4, minXp: 500, titleEn: 'Adept' },
  { level: 5, minXp: 1000, titleEn: 'Biomarker Specialist' },
  { level: 6, minXp: 2000, titleEn: 'Resilience Architect' },
  { level: 7, minXp: 3500, titleEn: 'Cellular Scholar' },
  { level: 8, minXp: 5000, titleEn: 'Virexon Fellow' },
  { level: 9, minXp: 7500, titleEn: 'Master of Protocols' },
  { level: 10, minXp: 10000, titleEn: 'Grand Chancellor' },
];

export function calculateLevel(xp: number): {
  currentLevel: number;
  nextLevel: number | null;
  xpForCurrentLevel: number;
  xpForNextLevel: number | null;
  progressPercent: number;
} {
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

  let progressPercent = 100;
  if (nextTier) {
    const range = nextTier.minXp - currentTier.minXp;
    const gained = safeXp - currentTier.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  }

  return {
    currentLevel: currentTier.level,
    nextLevel: nextTier ? nextTier.level : null,
    xpForCurrentLevel: currentTier.minXp,
    xpForNextLevel: nextTier ? nextTier.minXp : null,
    progressPercent,
  };
}

export type MilestoneKey =
  | 'FIRST_PRODUCT'
  | 'THREE_PRODUCTS'
  | 'SCHOOL_UNLOCKED'
  | 'FIRST_LESSON'
  | 'FIRST_COURSE_COMPLETED'
  | 'FIRST_PHASE_COMPLETED'
  | 'FULL_90_DAY_PROGRAM';

export interface MilestoneMeta {
  key: MilestoneKey;
  title: string;
  description: string;
}

export const MILESTONES: Record<MilestoneKey, MilestoneMeta> = {
  FIRST_PRODUCT: {
    key: 'FIRST_PRODUCT',
    title: 'First Container Verified',
    description: 'Successfully activated your first ZIRON container code.',
  },
  THREE_PRODUCTS: {
    key: 'THREE_PRODUCTS',
    title: 'Three Containers Verified',
    description: 'Linked 3 physical containers across your continuous wellness regimen.',
  },
  SCHOOL_UNLOCKED: {
    key: 'SCHOOL_UNLOCKED',
    title: 'ZIRON School Unlocked',
    description: 'Earned official curriculum access through 3 container activations.',
  },
  FIRST_LESSON: {
    key: 'FIRST_LESSON',
    title: 'First Lesson Completed',
    description: 'Completed your first structured lesson in the ZIRON School.',
  },
  FIRST_COURSE_COMPLETED: {
    key: 'FIRST_COURSE_COMPLETED',
    title: 'First Course Completed',
    description: 'Mastered 100% of all lessons within a curriculum track.',
  },
  FIRST_PHASE_COMPLETED: {
    key: 'FIRST_PHASE_COMPLETED',
    title: 'Phase 1 Completed',
    description: 'Finished the foundational 30 days of the 90-day protocol.',
  },
  FULL_90_DAY_PROGRAM: {
    key: 'FULL_90_DAY_PROGRAM',
    title: 'Full 90-Day Protocol Mastered',
    description: 'Successfully completed the entire 90-day cellular trajectory.',
  },
};

export type BadgeKey =
  | 'FIRST_STEP'
  | 'COMMITTED'
  | 'DISCIPLINED'
  | 'SCHOOL_READY'
  | 'LEARNER'
  | 'SCHOLAR'
  | 'JOURNEY_COMPLETE';

export interface BadgeMeta {
  key: BadgeKey;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export const BADGES: Record<BadgeKey, BadgeMeta> = {
  FIRST_STEP: {
    key: 'FIRST_STEP',
    name: 'First Step',
    description: 'Activated your very first authentic ZIRON container.',
    icon: 'Sparkles',
    requirement: '1 container activation',
  },
  COMMITTED: {
    key: 'COMMITTED',
    name: 'Committed',
    description: 'Maintained a 7-day consecutive activity streak on the platform.',
    icon: 'Flame',
    requirement: '7-day activity streak',
  },
  DISCIPLINED: {
    key: 'DISCIPLINED',
    name: 'Disciplined',
    description: 'Achieved an exemplary 30-day consecutive activity streak.',
    icon: 'Zap',
    requirement: '30-day activity streak',
  },
  SCHOOL_READY: {
    key: 'SCHOOL_READY',
    name: 'School Ready',
    description: 'Unlocked full access to the ZIRON School learning tracks.',
    icon: 'GraduationCap',
    requirement: '3 verified container activations',
  },
  LEARNER: {
    key: 'LEARNER',
    name: 'Learner',
    description: 'Graduated from your first complete ZIRON School course.',
    icon: 'BookOpen',
    requirement: '1 completed course',
  },
  SCHOLAR: {
    key: 'SCHOLAR',
    name: 'Scholar',
    description: 'Completed 3 distinct curriculum courses in the School.',
    icon: 'Award',
    requirement: '3 completed courses',
  },
  JOURNEY_COMPLETE: {
    key: 'JOURNEY_COMPLETE',
    name: 'Journey Complete',
    description: 'Completed all 90 days of the structured wellness protocol.',
    icon: 'Compass',
    requirement: '90 days completed',
  },
};

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
    return {
      currentStreak,
      longestStreak,
      isConsecutive: false,
      isSameDay: true,
    };
  }

  const lastTime = new Date(`${lastActivityDate}T00:00:00Z`).getTime();
  const currTime = new Date(`${activityDate}T00:00:00Z`).getTime();
  const diffDays = Math.round((currTime - lastTime) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const updatedCurrent = currentStreak + 1;
    return {
      currentStreak: updatedCurrent,
      longestStreak: Math.max(longestStreak, updatedCurrent),
      isConsecutive: true,
      isSameDay: false,
    };
  } else if (diffDays > 1) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      isConsecutive: false,
      isSameDay: false,
    };
  } else {
    return {
      currentStreak,
      longestStreak,
      isConsecutive: false,
      isSameDay: false,
    };
  }
}

export const INITIAL_REWARDS = [
  {
    id: 'reward_digital_bio_guide',
    title: 'ZIRON Biomarker Optimization Protocol (PDF Edition)',
    description: 'A 42-page comprehensive scientific guide covering micronutrient bioavailability, chronobiology timing optimization, and cellular biomarker checkpoints.',
    type: 'DIGITAL',
    xpCost: 100,
    isActive: true,
    stock: null,
  },
  {
    id: 'reward_school_masterclass',
    title: 'Exclusive Masterclass: Advanced Metabolic Resilience',
    description: 'On-demand high-definition seminar series taught by clinical researchers on mitochondrial health, NAD+ cascades, and stress adaptation.',
    type: 'EDUCATIONAL',
    xpCost: 250,
    isActive: true,
    stock: 200,
  },
  {
    id: 'reward_community_badge_patron',
    title: 'Distinguished Community Patron Status',
    description: 'Unlocks a prestigious patron badge and glowing accent beside your name across all ZIRON Community discussion boards and research forums.',
    type: 'PLATFORM_BENEFIT',
    xpCost: 500,
    isActive: true,
    stock: null,
  },
  {
    id: 'reward_clinical_qa_session',
    title: 'VIP Roundtable Seat: Monthly Scientific Review',
    description: 'Reserved participant seat in the live virtual monthly roundtable with Virexon Biosciences lead research biochemists and formulators.',
    type: 'EDUCATIONAL',
    xpCost: 1000,
    isActive: true,
    stock: 50,
  },
];
