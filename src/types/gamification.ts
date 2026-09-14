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

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  type: XpTransactionType;
  source: XpEventType | 'REWARD_REDEMPTION' | 'ADMIN_ADJUSTMENT';
  sourceId: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface LevelThreshold {
  level: number;
  minXp: number;
  titleEn: string;
  titleFr: string;
  titleAr: string;
}

export interface LevelProgress {
  currentLevel: number;
  currentXp: number;
  nextLevel: number | null;
  xpForCurrentLevel: number;
  xpForNextLevel: number | null;
  xpNeededForNextLevel: number;
  progressPercent: number;
  levelTitleEn: string;
  levelTitleFr: string;
  levelTitleAr: string;
}

export type MilestoneKey =
  | 'FIRST_PRODUCT'
  | 'THREE_PRODUCTS'
  | 'SCHOOL_UNLOCKED'
  | 'FIRST_LESSON'
  | 'FIRST_COURSE_COMPLETED'
  | 'FIRST_PHASE_COMPLETED'
  | 'FULL_90_DAY_PROGRAM';

export interface UserMilestone {
  id: string; // `${userId}_${milestoneKey}`
  userId: string;
  milestoneKey: MilestoneKey;
  title: string;
  description: string;
  achievedAt: string;
  metadata?: Record<string, unknown>;
}

export interface MilestoneDefinition {
  key: MilestoneKey;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descriptionEn: string;
  descriptionFr: string;
  descriptionAr: string;
  icon: string;
}

export type BadgeKey =
  | 'FIRST_STEP'
  | 'COMMITTED'
  | 'DISCIPLINED'
  | 'SCHOOL_READY'
  | 'LEARNER'
  | 'SCHOLAR'
  | 'JOURNEY_COMPLETE';

export interface UserBadge {
  id: string; // `${userId}_${badgeKey}`
  userId: string;
  badgeKey: BadgeKey;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  awardedAt: string;
}

export interface BadgeDefinition {
  key: BadgeKey;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  descriptionEn: string;
  descriptionFr: string;
  descriptionAr: string;
  icon: string;
  requirementEn: string;
  requirementFr: string;
  requirementAr: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  updatedAt: string;
}

export type RewardType = 'DIGITAL' | 'PLATFORM_BENEFIT' | 'BADGE' | 'EDUCATIONAL';

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: RewardType;
  xpCost: number;
  isActive: boolean;
  stock: number | null; // null represents unlimited supply
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  xpCost: number;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface UserGamificationState {
  userId: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  updatedAt: string;
}
