import { functionsInstance, db } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';

export interface CompleteJourneyDayResult {
  success: boolean;
  dayNumber: number;
  awardedXp?: number;
  totalXp?: number;
  level?: number;
  currentStreak?: number;
  alreadyCompleted?: boolean;
}

/**
 * Authoritatively logs protocol adherence for a day in the 90-Day Journey.
 * Awards 10 XP, updates activity streaks, and triggers phase milestones.
 */
export async function logJourneyDayAdherence(
  dayNumber: number,
  notes?: string
): Promise<CompleteJourneyDayResult> {
  const callable = httpsCallable<
    { dayNumber: number; notes?: string },
    CompleteJourneyDayResult
  >(functionsInstance, 'completeJourneyDay');

  try {
    const res = await callable({ dayNumber, notes });
    return res.data;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to record protocol adherence.');
  }
}

/**
 * Checks if a specific journey day has been recorded for the user.
 */
export async function isJourneyDayCompleted(userId: string, dayNumber: number): Promise<boolean> {
  if (!userId || dayNumber < 1 || dayNumber > 90) return false;
  try {
    const ref = doc(db, 'journeyLogs', `${userId}_day_${dayNumber}`);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch {
    return false;
  }
}
