import { pickRandomFromPool, computeSaveSlot } from '../utils/nameDraw';

describe('pickRandomFromPool', () => {
  it('returns null for empty pool', () => {
    expect(pickRandomFromPool([])).toBeNull();
  });

  it('returns the single element when pool has one name', () => {
    expect(pickRandomFromPool(['Anna'])).toBe('Anna');
  });

  it('returns an element from the pool', () => {
    const pool = ['Anna', 'Jakub', 'Maria'];
    const result = pickRandomFromPool(pool);
    expect(pool).toContain(result);
  });

  it('filters empty and whitespace-only strings', () => {
    const pool = ['', '  ', 'Anna', '\t'];
    const result = pickRandomFromPool(pool);
    expect(result).toBe('Anna');
  });

  it('returns null when all entries are empty/whitespace', () => {
    expect(pickRandomFromPool(['', '  ', '\t'])).toBeNull();
  });
});

describe('computeSaveSlot', () => {
  it('returns slot 1 when both are empty', () => {
    const res = computeSaveSlot({ babyName1: null, babyName2: null, nextSlot: 1 });
    expect(res).toEqual({ slot: 1, advanceNextSlot: false });
  });

  it('returns slot 1 when only name2 is set', () => {
    const res = computeSaveSlot({ babyName1: null, babyName2: 'Anna', nextSlot: 1 });
    expect(res).toEqual({ slot: 1, advanceNextSlot: false });
  });

  it('returns slot 2 when only name1 is set', () => {
    const res = computeSaveSlot({ babyName1: 'Anna', babyName2: null, nextSlot: 1 });
    expect(res).toEqual({ slot: 2, advanceNextSlot: false });
  });

  it('rotates to nextSlot when both are set (nextSlot=1)', () => {
    const res = computeSaveSlot({ babyName1: 'Anna', babyName2: 'Maria', nextSlot: 1 });
    expect(res).toEqual({ slot: 1, advanceNextSlot: true });
  });

  it('rotates to nextSlot when both are set (nextSlot=2)', () => {
    const res = computeSaveSlot({ babyName1: 'Anna', babyName2: 'Maria', nextSlot: 2 });
    expect(res).toEqual({ slot: 2, advanceNextSlot: true });
  });

  it('treats empty string as unset', () => {
    const res = computeSaveSlot({ babyName1: '', babyName2: '', nextSlot: 1 });
    expect(res).toEqual({ slot: 1, advanceNextSlot: false });
  });
});
