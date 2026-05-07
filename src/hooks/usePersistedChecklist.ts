import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '../utils/logError';

export interface ChecklistItemMeta {
  calendarEventId?: string;
  journalEntryId?: string;
}

interface ChecklistEntry {
  checked: boolean;
  meta?: ChecklistItemMeta;
}

type StoredState = Record<string, ChecklistEntry>;
type LegacyState = Record<string, boolean>;

function migrate(raw: unknown): StoredState {
  if (!raw || typeof raw !== 'object') return {};
  const out: StoredState = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'boolean') {
      out[key] = { checked: value };
    } else if (value && typeof value === 'object' && 'checked' in value) {
      const v = value as ChecklistEntry;
      out[key] = { checked: !!v.checked, meta: v.meta };
    }
  }
  return out;
}

/**
 * A hook that persists checklist state with optional per-item metadata
 * (calendar event id, journal entry id).
 *
 * Backward-compatible: legacy `Record<string, boolean>` storage is migrated
 * on load.
 */
export function usePersistedChecklist(storageKey: string) {
  const [state, setState] = useState<StoredState>({});
  const stateRef = useRef<StoredState>({});
  stateRef.current = state;

  useEffect(() => {
    AsyncStorage.getItem(`checklist_${storageKey}`)
      .then(raw => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as LegacyState | StoredState;
        setState(migrate(parsed));
      })
      .catch((e) => logError('usePersistedChecklist:load', e));
  }, [storageKey]);

  const persist = useCallback((next: StoredState) => {
    AsyncStorage.setItem(`checklist_${storageKey}`, JSON.stringify(next))
      .catch((e) => logError('usePersistedChecklist:persist', e));
  }, [storageKey]);

  const checked = useMemo(() => {
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(state)) out[k] = v.checked;
    return out;
  }, [state]);

  const toggleCheck = useCallback((key: string) => {
    setState(prev => {
      const wasChecked = prev[key]?.checked ?? false;
      const next: StoredState = { ...prev, [key]: { checked: !wasChecked } };
      persist(next);
      return next;
    });
  }, [persist]);

  const setCheckedWithMeta = useCallback(
    (key: string, isChecked: boolean, meta?: ChecklistItemMeta) => {
      setState(prev => {
        const next: StoredState = {
          ...prev,
          [key]: { checked: isChecked, meta: isChecked ? meta : undefined },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const getMeta = useCallback((key: string): ChecklistItemMeta | undefined => {
    return stateRef.current[key]?.meta;
  }, []);

  const resetChecklist = useCallback(() => {
    setState({});
    AsyncStorage.removeItem(`checklist_${storageKey}`).catch((e) => logError('usePersistedChecklist:reset', e));
  }, [storageKey]);

  return { checked, toggleCheck, setCheckedWithMeta, getMeta, resetChecklist };
}
