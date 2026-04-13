import * as Notifications from 'expo-notifications';
import { addDays, isFuture } from 'date-fns';
import { NOTIFICATION_TEMPLATES, getGenericTemplate } from '../../data/notification-templates';
import { MAX_PREGNANCY_WEEK } from '../../constants';
import { logError } from '../../utils/logError';

// Oblicz datę początku danego tygodnia ciąży na podstawie daty porodu.
// Tydzień 40 = data porodu, tydzień 1 = 39 tygodni przed porodem.
export function getWeekStartDate(dueDate: Date, week: number): Date {
  const weeksFromDue = MAX_PREGNANCY_WEEK - week;
  return addDays(dueDate, -(weeksFromDue * 7));
}

export async function scheduleAllNotifications(dueDate: Date): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err: unknown) {
    logError('NotificationScheduler.cancelAll', err);
    return;
  }

  for (let week = 1; week <= MAX_PREGNANCY_WEEK; week++) {
    const weekStartDate = getWeekStartDate(dueDate, week);

    // Powiadomienie W DNIU startu tygodnia (godz. 9:00)
    const dayOfTemplate =
      NOTIFICATION_TEMPLATES.find(t => t.week === week && t.daysBefore === 0) ??
      getGenericTemplate(week, 0);

    const dayOfDate = new Date(weekStartDate);
    dayOfDate.setHours(9, 0, 0, 0);

    if (isFuture(dayOfDate)) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: dayOfTemplate.title,
            body: dayOfTemplate.body,
            data: { week, type: 'week-start' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: dayOfDate,
          },
        });
      } catch (err: unknown) {
        logError(`NotificationScheduler.scheduleWeekStart week=${week}`, err);
      }
    }

    // Powiadomienie 3 DNI WCZEŚNIEJ (godz. 18:00)
    const previewTemplate =
      NOTIFICATION_TEMPLATES.find(t => t.week === week && t.daysBefore === 3) ??
      getGenericTemplate(week, 3);

    const previewDate = addDays(new Date(weekStartDate), -3);
    previewDate.setHours(18, 0, 0, 0);

    if (isFuture(previewDate)) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: previewTemplate.title,
            body: previewTemplate.body,
            data: { week, type: 'preview' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: previewDate,
          },
        });
      } catch (err: unknown) {
        logError(`NotificationScheduler.schedulePreview week=${week}`, err);
      }
    }
  }
}
