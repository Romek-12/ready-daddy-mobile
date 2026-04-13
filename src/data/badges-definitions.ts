import type { BadgeDefinition } from '../types/badges.types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // — Ciąża —
  {
    id: 'first_trimester',
    title: 'Pierwszy Trymestr',
    description: 'Dotrwaliście do końca 13. tygodnia',
    icon: '🌱',
    category: 'pregnancy',
    triggerEvent: 'week_reached',
  },
  {
    id: 'second_trimester',
    title: 'Drugi Trymestr',
    description: 'Weszliście w 28. tydzień ciąży',
    icon: '👶',
    category: 'pregnancy',
    triggerEvent: 'week_reached',
  },
  {
    id: 'third_trimester',
    title: 'Trzeci Trymestr',
    description: 'Ostatnia prosta — 29. tydzień!',
    icon: '🌟',
    category: 'pregnancy',
    triggerEvent: 'week_reached',
  },
  // — Zadania —
  {
    id: 'packed_bag',
    title: 'Spakowany Tata',
    description: 'Ukończona lista na porodówkę',
    icon: '🧳',
    category: 'tasks',
    triggerEvent: 'checklist_completed',
  },
  {
    id: 'layette_ready',
    title: 'Gotowa Wyprawka',
    description: 'Ukończona lista zakupów wyprawki',
    icon: '🛒',
    category: 'tasks',
    triggerEvent: 'checklist_completed',
  },
  {
    id: 'post_birth_done',
    title: 'Mistrz Formalności',
    description: 'Załatwione wszystkie formalności po porodzie',
    icon: '📋',
    category: 'tasks',
    triggerEvent: 'checklist_completed',
  },
  // — Dziennik —
  {
    id: 'first_note',
    title: 'Kronikarz',
    description: 'Pierwsza notatka w dzienniku',
    icon: '📓',
    category: 'journal',
    triggerEvent: 'journal_entry_added',
  },
  {
    id: 'first_usg',
    title: 'Pierwsze USG',
    description: 'Dodano pierwsze zdjęcie z badania',
    icon: '🔬',
    category: 'journal',
    triggerEvent: 'photo_added',
  },
  {
    id: 'active_dad',
    title: 'Aktywny Tata',
    description: '10 wpisów w dzienniku',
    icon: '⭐',
    category: 'journal',
    triggerEvent: 'journal_entries_count',
  },
  // — Zaangażowanie —
  {
    id: 'notifications_on',
    title: 'Czujny Tata',
    description: 'Włączono powiadomienia tygodniowe',
    icon: '🔔',
    category: 'engagement',
    triggerEvent: 'notifications_enabled',
  },
];
