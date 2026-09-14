import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, functionsInstance } from '@/config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  XpTransaction,
  UserMilestone,
  UserBadge,
  Reward,
  RewardRedemption,
  UserGamificationState,
} from '@/types/gamification';
import {
  calculateLevel,
  INITIAL_REWARDS,
  BADGE_CATALOG,
  MILESTONE_CATALOG,
} from '@/lib/gamification/constants';

export function useGamification() {
  const { user, profile } = useAuth();
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userMilestones, setUserMilestones] = useState<UserMilestone[]>([]);
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const levelProgress = calculateLevel(xp);

  // 1. Subscribe to XP Transactions
  useEffect(() => {
    if (!user) {
      setXpTransactions([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'xpTransactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const txs: XpTransaction[] = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<XpTransaction, 'id'>),
          }));
          setXpTransactions(txs);
        },
        (err) => {
          console.warn('[useGamification] xpTransactions listener warning:', err.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('[useGamification] Error attaching xpTransactions listener:', err);
    }
  }, [user]);

  // 2. Subscribe to Badges
  useEffect(() => {
    if (!user) {
      setUserBadges([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'userBadges'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const badges: UserBadge[] = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<UserBadge, 'id'>),
          }));
          setUserBadges(badges);
        },
        (err) => {
          console.warn('[useGamification] userBadges listener warning:', err.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('[useGamification] Error attaching userBadges listener:', err);
    }
  }, [user]);

  // 3. Subscribe to Milestones
  useEffect(() => {
    if (!user) {
      setUserMilestones([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'userMilestones'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const milestones: UserMilestone[] = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<UserMilestone, 'id'>),
          }));
          setUserMilestones(milestones);
        },
        (err) => {
          console.warn('[useGamification] userMilestones listener warning:', err.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('[useGamification] Error attaching userMilestones listener:', err);
    }
  }, [user]);

  // 4. Subscribe to Rewards Catalogue
  useEffect(() => {
    try {
      const q = query(collection(db, 'rewards'), where('isActive', '==', true));

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const fetched: Reward[] = snap.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<Reward, 'id'>),
            }));
            setRewards(fetched);
          } else {
            // Keep default initial catalogue if none in DB
            setRewards(INITIAL_REWARDS);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('[useGamification] rewards listener fallback:', err.message);
          setRewards(INITIAL_REWARDS);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('[useGamification] Error fetching rewards:', err);
      setRewards(INITIAL_REWARDS);
      setLoading(false);
    }
  }, []);

  // 5. Subscribe to Redemptions
  useEffect(() => {
    if (!user) {
      setRedemptions([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'rewardRedemptions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list: RewardRedemption[] = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<RewardRedemption, 'id'>),
          }));
          setRedemptions(list);
        },
        (err) => {
          console.warn('[useGamification] redemptions listener warning:', err.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('[useGamification] Error attaching redemptions listener:', err);
    }
  }, [user]);

  // Authoritative Reward Redemption
  const redeem = useCallback(
    async (rewardId: string) => {
      if (!user) {
        throw new Error('Authentication required to redeem rewards.');
      }

      setError(null);
      const idempotencyKey = `red_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      try {
        const redeemCallable = httpsCallable<
          { rewardId: string; idempotencyKey: string },
          { success: boolean; redemptionId: string; rewardTitle: string; remainingXp: number }
        >(functionsInstance, 'redeemReward');

        const result = await redeemCallable({ rewardId, idempotencyKey });
        return result.data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Redemption failed.';
        setError(message);
        throw err;
      }
    },
    [user]
  );

  return {
    xp,
    level,
    levelProgress,
    currentStreak,
    longestStreak,
    xpTransactions,
    userBadges,
    userMilestones,
    rewards,
    redemptions,
    redeem,
    loading,
    error,
    badgeCatalog: BADGE_CATALOG,
    milestoneCatalog: MILESTONE_CATALOG,
  };
}
