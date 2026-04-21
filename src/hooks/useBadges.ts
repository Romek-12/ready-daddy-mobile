import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEarnedBadges, syncFromSupabase } from '../services/gamification/BadgeService';
import { BADGE_DEFINITIONS } from '../data/badges-definitions';
import type { EarnedBadge } from '../types/badges.types';
import { logError } from '../utils/logError';

interface UseBadgesReturn {
  earned: EarnedBadge[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  totalCount: number;
  earnedCount: number;
}

export function useBadges(): UseBadgesReturn {
  const { user } = useAuth();
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const badges = await getEarnedBadges(user.id);
    setEarned(badges);
    setIsLoading(false);

    syncFromSupabase(user.id).then(setEarned).catch((e: unknown) => logError('useBadges.syncFromSupabase', e));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const badges = await syncFromSupabase(user.id);
    setEarned(badges);
  }, [user]);

  return {
    earned,
    isLoading,
    refresh,
    totalCount: BADGE_DEFINITIONS.length,
    earnedCount: earned.length,
  };
}
