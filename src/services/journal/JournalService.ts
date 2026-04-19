import { supabase } from '../../lib/supabase';
import type { JournalEntry } from '../../types/journal.types';
import { logError } from '../../utils/logError';

// ---------- helpers ----------

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Użytkownik niezalogowany');
  return session.user.id;
}

function rowToEntry(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    type: row.type as JournalEntry['type'],
    title: row.title as string,
    date: row.date as string,
    week: row.week as number | undefined,
    notes: row.notes as string | undefined,
    doctor: row.doctor as string | undefined,
    location: row.location as string | undefined,
    photos: row.photos as string[] | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ---------- public API ----------

export async function getAllEntries(): Promise<JournalEntry[]> {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(row => rowToEntry(row as Record<string, unknown>));
  } catch (err: unknown) {
    logError('JournalService.getAllEntries', err);
    return [];
  }
}

export async function addEntry(
  entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<JournalEntry> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      type: entry.type,
      title: entry.title,
      date: entry.date,
      week: entry.week ?? null,
      notes: entry.notes ?? null,
      doctor: entry.doctor ?? null,
      location: entry.location ?? null,
      photos: entry.photos ?? [],
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToEntry(data as Record<string, unknown>);
}

export async function updateEntry(
  id: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>,
): Promise<JournalEntry | null> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.week !== undefined) updateData.week = updates.week;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.doctor !== undefined) updateData.doctor = updates.doctor;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.photos !== undefined) updateData.photos = updates.photos;

  const { data, error } = await supabase
    .from('journal_entries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToEntry(data as Record<string, unknown>);
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getEntriesForWeek(week: number): Promise<JournalEntry[]> {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('week', week)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(row => rowToEntry(row as Record<string, unknown>));
  } catch (err: unknown) {
    logError('JournalService.getEntriesForWeek', err);
    return [];
  }
}
