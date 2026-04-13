import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

interface BadgeContextType {
  queueBadgeUnlock: (badgeId: string) => void;
  currentUnlock: string | null;
  dismissCurrent: () => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<string[]>([]);
  const [currentUnlock, setCurrentUnlock] = useState<string | null>(null);
  const processingRef = useRef(false);

  const processQueue = useCallback((q: string[]) => {
    if (processingRef.current || q.length === 0) return;
    processingRef.current = true;
    setCurrentUnlock(q[0]);
  }, []);

  const queueBadgeUnlock = useCallback(
    (badgeId: string) => {
      setQueue(prev => {
        const next = [...prev, badgeId];
        processQueue(next);
        return next;
      });
    },
    [processQueue],
  );

  const dismissCurrent = useCallback(() => {
    setCurrentUnlock(null);
    processingRef.current = false;
    setQueue(prev => {
      const remaining = prev.slice(1);
      if (remaining.length > 0) {
        setTimeout(() => {
          processingRef.current = true;
          setCurrentUnlock(remaining[0]);
        }, 300);
      }
      return remaining;
    });
  }, []);

  return (
    <BadgeContext.Provider value={{ queueBadgeUnlock, currentUnlock, dismissCurrent }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadgeContext(): BadgeContextType {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error('useBadgeContext must be used within BadgeProvider');
  return ctx;
}
