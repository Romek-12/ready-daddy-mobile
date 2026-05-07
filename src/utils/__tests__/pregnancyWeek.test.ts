import { getPregnancyWeekAndDay, formatWeekDay } from '../pregnancyWeek';

describe('getPregnancyWeekAndDay', () => {
  it('returns week+day for date after conception (with offset)', () => {
    // conception 2026-01-01, target 2026-01-22 → 21 days after, +14 offset = 35 days = 5 weeks + 0 days
    const result = getPregnancyWeekAndDay('2026-01-01', new Date(2026, 0, 22));
    expect(result).toEqual({ week: 5, day: 0 });
  });

  it('returns week+day with non-zero day component', () => {
    // conception 2026-01-01, target 2026-01-25 → 24 days, +14 offset = 38 days = 5 weeks + 3 days
    const result = getPregnancyWeekAndDay('2026-01-01', new Date(2026, 0, 25));
    expect(result).toEqual({ week: 5, day: 3 });
  });

  it('returns null for date before conception (after offset)', () => {
    // conception 2026-03-01, target 2026-01-01 — way before, even with +14 days offset
    const result = getPregnancyWeekAndDay('2026-03-01', new Date(2026, 0, 1));
    expect(result).toBeNull();
  });

  it('clamps to {week: 42, day: 0} for date past 42+0', () => {
    // conception 2025-01-01, target 2026-12-01 — way after 42 weeks
    const result = getPregnancyWeekAndDay('2025-01-01', new Date(2026, 11, 1));
    expect(result).toEqual({ week: 42, day: 0 });
  });

  it('handles same day as conception', () => {
    // conception 2026-01-01, target 2026-01-01 → 0 days + 14 offset = 14 days = 2+0
    const result = getPregnancyWeekAndDay('2026-01-01', new Date(2026, 0, 1));
    expect(result).toEqual({ week: 2, day: 0 });
  });
});

describe('formatWeekDay', () => {
  it('formats {week, day} as "week+day"', () => {
    expect(formatWeekDay({ week: 21, day: 3 })).toBe('21+3');
    expect(formatWeekDay({ week: 22, day: 0 })).toBe('22+0');
    expect(formatWeekDay({ week: 5, day: 6 })).toBe('5+6');
  });
});
