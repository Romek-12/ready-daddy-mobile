import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '../utils/logError';

/**
 * A hook that persists a boolean Record<string, boolean> to AsyncStorage.
 * Useful for checklists (checkups, birth prep, shopping).
 *
 * @param storageKey Unique key to store the state under
 */
export function usePersistedChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Load on mount
  useEffect(() => {
    AsyncStorage.getItem(`checklist_${storageKey}`)
      .then(raw => {
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, boolean>;
          setChecked(parsed);
        }
      })
      .catch((e) => logError('usePersistedChecklist:load', e));
  }, [storageKey]);

  const toggleCheck = useCallback((key: string) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // Persist asynchronously
      AsyncStorage.setItem(`checklist_${storageKey}`, JSON.stringify(next)).catch((e) => logError('usePersistedChecklist:persist', e));
      return next;
    });
  }, [storageKey]);

  const resetChecklist = useCallback(() => {
    setChecked({});
    AsyncStorage.removeItem(`checklist_${storageKey}`).catch((e) => logError('usePersistedChecklist:persist', e));
  }, [storageKey]);

  return { checked, toggleCheck, resetChecklist };
}
