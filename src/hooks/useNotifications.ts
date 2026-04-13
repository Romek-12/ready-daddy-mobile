import { useState, useEffect } from 'react';
import {
  getNotificationSettings,
  setupNotificationsForDueDate,
  disableNotifications,
} from '../services/notifications/NotificationService';
import type { NotificationSettings } from '../types/notifications.types';
import { logError } from '../utils/logError';

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotificationSettings()
      .then(s => setSettings(s))
      .catch(err => logError('useNotifications.init', err))
      .finally(() => setLoading(false));
  }, []);

  const enable = async (dueDate: Date): Promise<boolean> => {
    const success = await setupNotificationsForDueDate(dueDate);
    if (success) {
      const updated = await getNotificationSettings();
      setSettings(updated);
    }
    return success;
  };

  const disable = async (): Promise<void> => {
    await disableNotifications();
    setSettings(prev => (prev ? { ...prev, enabled: false } : null));
  };

  return { settings, loading, enable, disable };
}
