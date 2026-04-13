import { useState, useEffect, useCallback } from 'react';
import {
  getAllEntries,
  addEntry,
  updateEntry,
  deleteEntry,
} from '../services/journal/JournalService';
import type { JournalEntry } from '../types/journal.types';
import { logError } from '../utils/logError';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getAllEntries();
      setEntries(data);
    } catch (err: unknown) {
      logError('useJournal.load', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (
    entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<JournalEntry> => {
    const newEntry = await addEntry(entry);
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const update = async (
    id: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>,
  ): Promise<void> => {
    const updated = await updateEntry(id, updates);
    if (updated) {
      setEntries(prev => prev.map(e => (e.id === id ? updated : e)));
    }
  };

  const remove = async (id: string): Promise<void> => {
    await deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return { entries, loading, reload: load, add, update, remove };
}
