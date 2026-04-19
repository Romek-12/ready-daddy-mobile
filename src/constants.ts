/** Average pregnancy duration in days (40 weeks). Used to convert due date → conception date. */
export const PREGNANCY_DAYS = 280;

/** Weeks added to conception-to-now diff to get gestational age (medical convention). */
export const CONCEPTION_OFFSET_WEEKS = 2;

/** Maximum pregnancy week tracked in the app. */
export const MAX_PREGNANCY_WEEK = 42;

/** Trimester boundaries (inclusive upper bounds). */
export const TRIMESTER_BOUNDARIES = {
  first: 13,
  second: 27,
} as const;

/** Height of the bottom tab bar in pixels. */
export const TAB_BAR_HEIGHT = 80;

/** Badge thresholds */
export const BADGE_T1_WEEK = 14;   // tydzień po końcu T1 (T1 = 1-13)
export const BADGE_T2_WEEK = 28;   // pierwszy tydzień T3 (T2 kończy się w 27)
export const BADGE_T3_WEEK = 29;   // głębiej w T3
export const BADGE_ACTIVE_DAD_ENTRIES = 10;  // wpisy dziennika dla odznaki

/** Name draw — slots per parent column */
export const NAME_DRAW_SLOTS = 5;

/** Name draw — maximum characters for a single name input */
export const NAME_DRAW_MAX_NAME_LENGTH = 30;

/** Name draw — total slot-machine animation duration in ms */
export const NAME_DRAW_ANIMATION_TOTAL_MS = 2500;

/** Name draw — fast tick interval during animation (first phase) in ms */
export const NAME_DRAW_FAST_TICK_MS = 80;

/** Name draw — debounce for persisting input changes to AsyncStorage in ms */
export const NAME_DRAW_INPUT_DEBOUNCE_MS = 500;

/** Name draw — AsyncStorage key */
export const NAME_DRAW_STORAGE_KEY = '@readyDaddy:nameDraw';
