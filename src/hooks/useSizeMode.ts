import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SizeComparisonMode = 'fruit' | 'animal' | 'sweet';

const SIZE_MODE_KEY = 'size_comparison_mode';

export function useSizeMode(): [SizeComparisonMode, (mode: SizeComparisonMode) => void] {
  const [mode, setModeState] = useState<SizeComparisonMode>('fruit');

  useEffect(() => {
    AsyncStorage.getItem(SIZE_MODE_KEY).then(val => {
      if (val === 'animal' || val === 'sweet' || val === 'fruit') {
        setModeState(val);
      }
    });
  }, []);

  const setMode = useCallback((newMode: SizeComparisonMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(SIZE_MODE_KEY, newMode);
  }, []);

  return [mode, setMode];
}
