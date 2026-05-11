import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '../utils/logError';

const MODULE_ORDER_KEY = 'home_module_order';

let cachedOrder: string[] | null = null;
let loadPromise: Promise<void> | null = null;
const subscribers = new Set<(order: string[]) => void>();

function loadOnce(defaults: string[]) {
  if (loadPromise) return loadPromise;
  loadPromise = AsyncStorage.getItem(MODULE_ORDER_KEY).then(val => {
    if (!val) { cachedOrder = defaults; return; }
    try {
      const saved: string[] = JSON.parse(val);
      const valid = saved.filter(k => defaults.includes(k));
      const added = defaults.filter(k => !saved.includes(k));
      cachedOrder = [...valid, ...added];
    } catch {
      cachedOrder = defaults;
    }
  }).catch(e => {
    logError('useModuleOrder:load', e);
    cachedOrder = defaults;
  });
  return loadPromise;
}

function publish(next: string[]) {
  cachedOrder = next;
  subscribers.forEach(fn => fn(next));
}

export function useModuleOrder(defaultKeys: string[]): [string[], (keys: string[]) => void] {
  const [order, setOrder] = useState<string[]>(cachedOrder ?? defaultKeys);

  useEffect(() => {
    subscribers.add(setOrder);
    if (cachedOrder == null) {
      loadOnce(defaultKeys).then(() => {
        if (cachedOrder) setOrder(cachedOrder);
      });
    } else {
      setOrder(cachedOrder);
    }
    return () => { subscribers.delete(setOrder); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((keys: string[]) => {
    publish(keys);
    AsyncStorage.setItem(MODULE_ORDER_KEY, JSON.stringify(keys))
      .catch(e => logError('useModuleOrder:save', e));
  }, []);

  return [order, update];
}
