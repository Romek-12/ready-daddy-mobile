import {
  PREGNANCY_DAYS,
  CONCEPTION_OFFSET_WEEKS,
  MAX_PREGNANCY_WEEK,
  TRIMESTER_BOUNDARIES,
  TAB_BAR_HEIGHT,
} from '../constants';

describe('constants', () => {
  it('PREGNANCY_DAYS is 280 (40 weeks)', () => {
    expect(PREGNANCY_DAYS).toBe(280);
    expect(PREGNANCY_DAYS / 7).toBe(40);
  });

  it('CONCEPTION_OFFSET_WEEKS is 2 (medical convention)', () => {
    expect(CONCEPTION_OFFSET_WEEKS).toBe(2);
  });

  it('MAX_PREGNANCY_WEEK is 42', () => {
    expect(MAX_PREGNANCY_WEEK).toBe(42);
  });

  it('trimester boundaries are correct', () => {
    expect(TRIMESTER_BOUNDARIES.first).toBe(13);
    expect(TRIMESTER_BOUNDARIES.second).toBe(27);
  });

  it('TAB_BAR_HEIGHT is a positive number', () => {
    expect(TAB_BAR_HEIGHT).toBeGreaterThan(0);
  });
});
