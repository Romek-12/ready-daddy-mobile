import { CONCEPTION_OFFSET_WEEKS, MAX_PREGNANCY_WEEK } from '../constants';

export interface WeekAndDay {
  week: number;
  day: number;
}

const MS_PER_DAY = 86400000;

/**
 * Compute pregnancy week+day (gestational age) for a target date given the conception date.
 * Returns null if target is before the start of pregnancy (after applying CONCEPTION_OFFSET_WEEKS).
 * Clamps to {week: MAX_PREGNANCY_WEEK, day: 0} when past the maximum.
 */
export function getPregnancyWeekAndDay(
  conceptionDate: string,
  target: Date,
): WeekAndDay | null {
  // Parse ISO date string directly to avoid UTC-offset drift on negative-offset devices
  const [cy, cm, cd] = conceptionDate.split('-').map(Number);
  const conceptionDayUtc = Date.UTC(cy, cm - 1, cd);
  const targetDayUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.floor((targetDayUtc - conceptionDayUtc) / MS_PER_DAY);
  const totalDays = diffDays + CONCEPTION_OFFSET_WEEKS * 7;
  if (totalDays < 0) return null;
  const week = Math.floor(totalDays / 7);
  const day = totalDays % 7;
  if (week >= MAX_PREGNANCY_WEEK) return { week: MAX_PREGNANCY_WEEK, day: 0 };
  return { week, day };
}

export function formatWeekDay({ week, day }: WeekAndDay): string {
  return `${week}+${day}`;
}
