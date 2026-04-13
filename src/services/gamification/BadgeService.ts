import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { logError } from '../../utils/logError';
import type { EarnedBadge } from '../../types/badges.types';
import { BADGE_DEFINITIONS } from '../../data/badges-definitions';

const BADGES_CACHE_KEY = '@ready_daddy/badges_cache';

export async function getEarnedBadges(userId: string): Promise<EarnedBadge[]> {
  try {
    const raw = await AsyncStorage.getItem(BADGES_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw) as EarnedBadge[];
    }
  } catch (err: unknown) {
    logError('BadgeService:getEarnedBadges:cache', err);
  }
  return syncFromSupabase(userId);
}

export async function syncFromSupabase(userId: string): Promise<EarnedBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId);

  if (error) {
    logError('BadgeService:syncFromSupabase', error);
    return [];
  }

  const earned: EarnedBadge[] = (data ?? []).map(row => ({
    badgeId: row.badge_id as string,
    earnedAt: row.earned_at as string,
  }));

  try {
    await AsyncStorage.setItem(BADGES_CACHE_KEY, JSON.stringify(earned));
  } catch (err: unknown) {
    logError('BadgeService:syncFromSupabase:cache', err);
  }

  return earned;
}

export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  let earned: EarnedBadge[] = [];
  try {
    const raw = await AsyncStorage.getItem(BADGES_CACHE_KEY);
    if (raw) {
      earned = JSON.parse(raw) as EarnedBadge[];
    }
  } catch (err: unknown) {
    logError('BadgeService:awardBadge:cacheRead', err);
  }

  if (earned.some(b => b.badgeId === badgeId)) {
    return false;
  }

  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId });

  if (error) {
    if (!error.message.includes('unique') && !error.message.includes('duplicate')) {
      logError('BadgeService:awardBadge:supabase', error);
    }
    return false;
  }

  const newBadge: EarnedBadge = {
    badgeId,
    earnedAt: new Date().toISOString(),
  };
  earned.push(newBadge);

  try {
    await AsyncStorage.setItem(BADGES_CACHE_KEY, JSON.stringify(earned));
  } catch (err: unknown) {
    logError('BadgeService:awardBadge:cacheWrite', err);
  }

  return true;
}

export async function isBadgeEarned(userId: string, badgeId: string): Promise<boolean> {
  const earned = await getEarnedBadges(userId);
  return earned.some(b => b.badgeId === badgeId);
}

export function getBadgeDefinition(badgeId: string) {
  return BADGE_DEFINITIONS.find(b => b.id === badgeId) ?? null;
}

export async function clearBadgeCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BADGES_CACHE_KEY);
  } catch (err: unknown) {
    logError('BadgeService:clearBadgeCache', err);
  }
}
