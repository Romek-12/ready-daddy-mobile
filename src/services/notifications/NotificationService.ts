import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions, configureNotificationHandler } from './NotificationPermissions';
import { scheduleAllNotifications } from './NotificationScheduler';
import type { NotificationSettings } from '../../types/notifications.types';
import { logError } from '../../utils/logError';

const SETTINGS_KEY = '@notification_settings';

export async function initializeNotifications(): Promise<void> {
  configureNotificationHandler();
  try {
    const settings = await getNotificationSettings();
    if (!settings?.enabled || !settings?.dueDate) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    await scheduleAllNotifications(new Date(settings.dueDate));
  } catch (err: unknown) {
    logError('NotificationService.initialize', err);
  }
}

export async function setupNotificationsForDueDate(dueDate: Date): Promise<boolean> {
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  const settings: NotificationSettings = {
    enabled: true,
    dueDate: dueDate.toISOString(),
    weekStartNotifications: true,
    previewNotifications: true,
    previewDaysBefore: 3,
  };

  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    await scheduleAllNotifications(dueDate);
    return true;
  } catch (err: unknown) {
    logError('NotificationService.setup', err);
    return false;
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NotificationSettings;
  } catch (err: unknown) {
    logError('NotificationService.getSettings', err);
    return null;
  }
}

export async function disableNotifications(): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    if (settings) {
      const updated: NotificationSettings = { ...settings, enabled: false };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err: unknown) {
    logError('NotificationService.disable', err);
  }
}
