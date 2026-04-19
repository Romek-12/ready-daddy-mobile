import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '../utils/logError';
import {
  NAME_DRAW_SLOTS,
  NAME_DRAW_STORAGE_KEY,
  NAME_DRAW_INPUT_DEBOUNCE_MS,
} from '../constants';

type Column = 'mama' | 'tata';

interface StoredState {
  mamaNames: string[];
  tataNames: string[];
  lastResult: string | null;
  nextSlot: 1 | 2;
}

function emptyNames(): string[] {
  return Array.from({ length: NAME_DRAW_SLOTS }, () => '');
}

function defaultState(): StoredState {
  return {
    mamaNames: emptyNames(),
    tataNames: emptyNames(),
    lastResult: null,
    nextSlot: 1,
  };
}

function normalize(raw: unknown): StoredState {
  const fallback = defaultState();
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Partial<StoredState>;
  return {
    mamaNames: Array.isArray(obj.mamaNames)
      ? [...obj.mamaNames.slice(0, NAME_DRAW_SLOTS), ...emptyNames()].slice(0, NAME_DRAW_SLOTS)
      : fallback.mamaNames,
    tataNames: Array.isArray(obj.tataNames)
      ? [...obj.tataNames.slice(0, NAME_DRAW_SLOTS), ...emptyNames()].slice(0, NAME_DRAW_SLOTS)
      : fallback.tataNames,
    lastResult: typeof obj.lastResult === 'string' ? obj.lastResult : null,
    nextSlot: obj.nextSlot === 2 ? 2 : 1,
  };
}

export function useNameDrawStorage() {
  const [state, setState] = useState<StoredState>(defaultState);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(NAME_DRAW_STORAGE_KEY)
      .then(raw => {
        if (raw) {
          try {
            setState(normalize(JSON.parse(raw)));
          } catch (e) {
            logError('useNameDrawStorage:parse', e);
          }
        }
      })
      .catch(e => logError('useNameDrawStorage:load', e))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((next: StoredState) => {
    AsyncStorage.setItem(NAME_DRAW_STORAGE_KEY, JSON.stringify(next)).catch(e =>
      logError('useNameDrawStorage:persist', e),
    );
  }, []);

  const persistDebounced = useCallback(
    (next: StoredState) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(next), NAME_DRAW_INPUT_DEBOUNCE_MS);
    },
    [persist],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const setName = useCallback(
    (column: Column, index: number, value: string) => {
      setState(prev => {
        const key = column === 'mama' ? 'mamaNames' : 'tataNames';
        const nextArr = [...prev[key]];
        nextArr[index] = value;
        const next: StoredState = { ...prev, [key]: nextArr };
        persistDebounced(next);
        return next;
      });
    },
    [persistDebounced],
  );

  const setLastResult = useCallback(
    (name: string) => {
      setState(prev => {
        const next: StoredState = { ...prev, lastResult: name };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearLastResult = useCallback(() => {
    setState(prev => {
      const next: StoredState = { ...prev, lastResult: null };
      persist(next);
      return next;
    });
  }, [persist]);

  const advanceSlot = useCallback(() => {
    setState(prev => {
      const next: StoredState = { ...prev, nextSlot: prev.nextSlot === 1 ? 2 : 1 };
      persist(next);
      return next;
    });
  }, [persist]);

  return {
    loading,
    names: { mama: state.mamaNames, tata: state.tataNames },
    setName,
    lastResult: state.lastResult,
    setLastResult,
    clearLastResult,
    nextSlot: state.nextSlot,
    advanceSlot,
  };
}
