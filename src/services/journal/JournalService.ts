import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { JournalEntry, JournalState } from '../../types/journal.types';
import { logError } from '../../utils/logError';

const JOURNAL_KEY = '@journal_entries';

export async function getAllEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    const state = JSON.parse(raw) as JournalState;
    return [...state.entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  } catch (err: unknown) {
    logError('JournalService.getAllEntries', err);
    return [];
  }
}

export async function addEntry(
  entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<JournalEntry> {
  const entries = await getAllEntries();
  const now = new Date().toISOString();
  const newEntry: JournalEntry = {
    ...entry,
    id: Crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  entries.unshift(newEntry);
  await saveEntries(entries);
  return newEntry;
}

export async function updateEntry(
  id: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>,
): Promise<JournalEntry | null> {
  const entries = await getAllEntries();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  const updated: JournalEntry = {
    ...entries[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  entries[idx] = updated;
  await saveEntries(entries);
  return updated;
}

export async function deleteEntry(id: string): Promise<void> {
  const entries = await getAllEntries();
  const filtered = entries.filter(e => e.id !== id);
  await saveEntries(filtered);
}

export async function getEntriesForWeek(week: number): Promise<JournalEntry[]> {
  const entries = await getAllEntries();
  return entries.filter(e => e.week === week);
}

async function saveEntries(entries: JournalEntry[]): Promise<void> {
  try {
    const state: JournalState = { entries, lastUpdated: new Date().toISOString() };
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(state));
  } catch (err: unknown) {
    logError('JournalService.saveEntries', err);
  }
}
