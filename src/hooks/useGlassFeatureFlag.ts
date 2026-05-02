import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ready_daddy/glass_ui';
const DEFAULT_VALUE = true;

let _value = DEFAULT_VALUE;
const _listeners = new Set<(v: boolean) => void>();

function notify(v: boolean) {
  _listeners.forEach(fn => fn(v));
}

export async function setGlassUI(enabled: boolean): Promise<void> {
  _value = enabled;
  notify(enabled);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
  } catch {}
}

export async function loadGlassUI(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      _value = JSON.parse(stored) as boolean;
      notify(_value);
    }
  } catch {}
}

export function useGlassFeatureFlag(): boolean {
  const [value, setValue] = useState(_value);

  useEffect(() => {
    setValue(_value);
    _listeners.add(setValue);
    return () => { _listeners.delete(setValue); };
  }, []);

  return value;
}

export function useGlassToggle(): [boolean, () => void] {
  const value = useGlassFeatureFlag();
  const toggle = useCallback(() => setGlassUI(!_value), []);
  return [value, toggle];
}
