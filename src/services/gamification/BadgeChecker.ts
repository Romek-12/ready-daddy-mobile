import { awardBadge } from './BadgeService';
import {
  BADGE_T1_WEEK,
  BADGE_T2_WEEK,
  BADGE_T3_WEEK,
  BADGE_ACTIVE_DAD_ENTRIES,
} from '../../constants';

export async function checkWeekBadges(
  userId: string,
  currentWeek: number,
): Promise<string[]> {
  const newBadges: string[] = [];

  // Use >= so users who install mid-pregnancy still earn earlier milestones.
  // awardBadge is idempotent — safe to call multiple times for the same badge.
  const milestones: [number, string][] = [
    [BADGE_T1_WEEK, 'first_trimester'],
    [BADGE_T2_WEEK, 'second_trimester'],
    [BADGE_T3_WEEK, 'third_trimester'],
  ];

  for (const [week, badgeId] of milestones) {
    if (currentWeek >= week) {
      const isNew = await awardBadge(userId, badgeId);
      if (isNew) newBadges.push(badgeId);
    }
  }

  return newBadges;
}

export async function checkChecklistBadge(
  userId: string,
  checklistId: 'hospital_bag' | 'layette' | 'post_birth',
): Promise<string | null> {
  const checklistMap: Record<string, string> = {
    hospital_bag: 'packed_bag',
    layette: 'layette_ready',
    post_birth: 'post_birth_done',
  };

  const badgeId = checklistMap[checklistId];
  if (!badgeId) return null;

  const isNew = await awardBadge(userId, badgeId);
  return isNew ? badgeId : null;
}

export async function checkJournalBadges(
  userId: string,
  totalEntries: number,
  hasPhoto: boolean,
): Promise<string[]> {
  const newBadges: string[] = [];

  if (totalEntries === 1) {
    const isNew = await awardBadge(userId, 'first_note');
    if (isNew) newBadges.push('first_note');
  }

  if (totalEntries >= BADGE_ACTIVE_DAD_ENTRIES) {
    const isNew = await awardBadge(userId, 'active_dad');
    if (isNew) newBadges.push('active_dad');
  }

  if (hasPhoto) {
    const isNew = await awardBadge(userId, 'first_usg');
    if (isNew) newBadges.push('first_usg');
  }

  return newBadges;
}

export async function checkNotificationsBadge(userId: string): Promise<string | null> {
  const isNew = await awardBadge(userId, 'notifications_on');
  return isNew ? 'notifications_on' : null;
}
