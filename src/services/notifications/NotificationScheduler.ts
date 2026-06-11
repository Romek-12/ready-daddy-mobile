import * as Notifications from 'expo-notifications';
import { addDays, addMonths, isFuture } from 'date-fns';
import { NOTIFICATION_TEMPLATES, getGenericTemplate } from '../../data/notification-templates';
import { MAX_PREGNANCY_WEEK, CONCEPTION_DAYS } from '../../constants';
import { logError } from '../../utils/logError';
import { FIRST_YEAR_CONTENT } from '../../data/first-year-content';

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

/**
 * Schedules monthly notifications for the first year after birth.
 * Birth date is derived from conceptionDate + PREGNANCY_DAYS.
 * Fires at 9:00 on the first day of each month milestone (months 1–12).
 */
export async function scheduleFirstYearNotifications(conceptionDate: Date): Promise<void> {
  const birthDate = addDays(conceptionDate, CONCEPTION_DAYS);

  for (let month = 1; month <= 12; month++) {
    const monthDate = addMonths(birthDate, month);
    monthDate.setHours(9, 0, 0, 0);

    if (isFuture(monthDate)) {
      const content = FIRST_YEAR_CONTENT.find(c => c.month === month);
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `👶 ${month}. miesiąc!`,
            body: content?.tipOfMonth ?? `${content?.title ?? `Miesiąc ${month}`} — sprawdź co nowego!`,
            data: { month, type: 'first-year' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: monthDate,
          },
        });
      } catch (err: unknown) {
        logError(`NotificationScheduler.scheduleFirstYear month=${month}`, err);
      }
    }
  }
}
