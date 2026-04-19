export function pickRandomFromPool(pool: string[]): string | null {
  const filtered = pool.map(n => n.trim()).filter(n => n.length > 0);
  if (filtered.length === 0) return null;
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}

export interface SaveSlotInput {
  babyName1: string | null | undefined;
  babyName2: string | null | undefined;
  nextSlot: 1 | 2;
}

export interface SaveSlotResult {
  slot: 1 | 2;
  advanceNextSlot: boolean;
}

export function computeSaveSlot(input: SaveSlotInput): SaveSlotResult {
  const has1 = !!(input.babyName1 && input.babyName1.trim());
  const has2 = !!(input.babyName2 && input.babyName2.trim());

  if (!has1 && !has2) return { slot: 1, advanceNextSlot: false };
  if (has1 && !has2) return { slot: 2, advanceNextSlot: false };
  if (!has1 && has2) return { slot: 1, advanceNextSlot: false };
  return { slot: input.nextSlot, advanceNextSlot: true };
}
