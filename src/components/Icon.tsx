import React from 'react';
import { createIconSet } from '@expo/vector-icons';

// Material Symbols Rounded, weight=200, GRAD=200, FILL=0 (outlined), opsz=24
// Statically instanced from the variable font via fontTools
const glyphMap: Record<string, number> = {
  // Navigation / Tabs
  'home': 0xE9B2,
  'bolt': 0xEA0B,
  'event': 0xE878,
  'savings': 0xE2EB,
  'menu_book': 0xEA19,

  // Module icons
  'psychology': 0xEA4A,
  'local_hospital': 0xE548,
  'face_6': 0xF8DE,
  'child_care': 0xEB41,
  'notifications': 0xE7F5,
  'genetics': 0xE0F3,
  'bedroom_baby': 0xEFE0,
  'water_bottle': 0xF69D,

  // Content icons
  'straighten': 0xE41C,
  'lightbulb': 0xE90F,
  'check_circle': 0xF0BE,
  'arrow_forward': 0xE5C8,
  'arrow_back': 0xE5C4,

  // Planning
  'shopping_cart': 0xE8CC,
  'calculate': 0xEA5F,
  'diamond': 0xEAD5,
  'date_range': 0xE916,

  // Birth prep
  'assignment': 0xE85D,
  'timer': 0xE425,
  'warning': 0xF083,
  'luggage': 0xF235,

  // Checkups
  'search': 0xE8B6,
  'help_outline': 0xE8FD,
  'event_note': 0xE616,

  // Dad module
  'science': 0xEA4B,
  'trending_down': 0xE8E3,
  'trending_up': 0xE8E5,
  'bedtime': 0xF159,
  'emergency': 0xE1EB,

  // Fourth trimester
  'favorite': 0xE87E,

  // Action card icons
  'sick': 0xF220,
  'chat_bubble_outline': 0xE0CB,
  'sentiment_dissatisfied': 0xE811,
  'sentiment_satisfied': 0xE813,
  'do_not_touch': 0xF1B0,
  'sleep': 0xE213,

  // Size comparison modes
  'nutrition': 0xE110,
  'pets': 0xE91D,
  'cookie': 0xEAAC,

  // Misc
  'edit_calendar': 0xE742,
  'schedule': 0xEFD6,
  'waving_hand': 0xE766,
  'settings': 0xE8B8,
  'expand_less': 0xE5CE,
  'expand_more': 0xE5CF,
  'check_box_outline_blank': 0xE835,
  'radio_button_unchecked': 0xE836,
  'fiber_manual_record': 0xE061,
  'tips_and_updates': 0xE79A,
  'show_chart': 0xE6E1,
  'info': 0xE88E,
  'face_3': 0xF8DB,
  'directions_car': 0xEFF7,
  'description': 0xE873,
  'book': 0xE86E,
  'add': 0xE145,
  'close': 0xE5CD,
  'delete': 0xE92E,
  'photo_camera': 0xE412,
  'lock': 0xE899,
};

const MaterialSymbols = createIconSet(
  glyphMap,
  'MaterialSymbolsRounded',
  require('../../assets/fonts/MaterialSymbolsRounded-w200.ttf')
);

// Semantic icon name → Material Symbols glyph name
const ICON_MAP: Record<string, string> = {
  // Navigation / Tabs
  'home': 'home',
  'bolt': 'bolt',
  'calendar': 'event',
  'money': 'savings',
  'menu-book': 'menu_book',

  // Module icons
  'fetus': 'genetics',
  'partner': 'psychology',
  'action-cards': 'bolt',
  'checkups': 'event_note',
  'planning': 'savings',
  'hospital': 'local_hospital',
  'dad': 'face_6',
  'baby': 'child_care',
  'baby-bottle': 'water_bottle',
  'dice': 'bedroom_baby',
  'notifications': 'notifications',

  // Content icons - WeekDetail
  'ruler': 'straighten',
  'brain': 'psychology',
  'lightbulb': 'lightbulb',
  'check-circle': 'check_circle',
  'arrow-forward': 'arrow_forward',

  // Planning
  'shopping-cart': 'shopping_cart',
  'calculate': 'calculate',
  'diamond': 'diamond',
  'date-range': 'date_range',

  // Birth prep
  'checklist': 'assignment',
  'timer': 'timer',
  'warning': 'warning',
  'luggage': 'luggage',
  'partner-role': 'face_6',

  // Checkups
  'search': 'search',
  'help': 'help_outline',

  // Dad module
  'science': 'science',
  'trending-down': 'trending_down',
  'trending-up': 'trending_up',
  'bedtime': 'bedtime',
  'emergency': 'emergency',

  // Fourth trimester
  'couple': 'favorite',

  // Action card icons
  'sick': 'sick',
  'chat': 'chat_bubble_outline',
  'sad': 'sentiment_dissatisfied',
  'anxious': 'sentiment_dissatisfied',
  'sleep': 'sleep',
  'do-not-touch': 'do_not_touch',

  // Size comparison modes
  'size-fruit': 'nutrition',
  'size-animal': 'pets',
  'size-sweet': 'cookie',

  // Misc
  'calendar-add': 'edit_calendar',
  'schedule': 'schedule',
  'wave': 'waving_hand',
  'gear': 'settings',
  'expand-less': 'expand_less',
  'expand-more': 'expand_more',
  'checkbox-blank': 'check_box_outline_blank',
  'radio-blank': 'radio_button_unchecked',
  'dot': 'fiber_manual_record',
  'tip': 'tips_and_updates',
  'progress': 'show_chart',
  'info': 'info',
  'mom': 'face_3',
  'shirt': 'description',
  'hygiene': 'waving_hand',
  'car': 'directions_car',
  'post-birth': 'description',
  'journal': 'book',
  'add': 'add',
  'close': 'close',
  'delete': 'delete',
  'photo': 'photo_camera',
  'back': 'arrow_back',
  'happy': 'sentiment_satisfied',
  'lock': 'lock',
};

interface IconProps {
  name: keyof typeof ICON_MAP | string;
  size?: number;
  color?: string;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

export default function Icon({ name, size = 24, color = '#FFFFFF' }: IconProps) {
  const glyphName = ICON_MAP[name] ?? name;
  return <MaterialSymbols name={glyphName as keyof typeof glyphMap} size={size} color={color} />;
}

export { ICON_MAP };
