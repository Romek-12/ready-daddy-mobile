export interface NotificationTemplate {
  week: number;
  daysBefore: number; // 0 = w dniu, 3 = 3 dni wcześniej
  title: string;
  body: string;
}

export interface ScheduledNotification {
  id: string;
  week: number;
  scheduledDate: Date;
  type: 'week-start' | 'preview';
}

export interface NotificationSettings {
  enabled: boolean;
  dueDate: string | null; // ISO date string
  weekStartNotifications: boolean;
  previewNotifications: boolean;
  previewDaysBefore: number; // domyślnie 3
}
