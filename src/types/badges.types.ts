export type BadgeCategory = 'pregnancy' | 'tasks' | 'journal' | 'engagement';

export type BadgeTrigger =
  | 'week_reached'
  | 'checklist_completed'
  | 'journal_entry_added'
  | 'journal_entries_count'
  | 'photo_added'
  | 'notifications_enabled'
  | 'month_reached'
  | 'first_year_complete';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  triggerEvent: BadgeTrigger;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string; // ISO datetime
}
