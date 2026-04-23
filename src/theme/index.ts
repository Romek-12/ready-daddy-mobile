const sharedTheme = {
  fonts: {
    title: 'ClimateCrisis',
    display: 'ClimateCrisis',
    body: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    semibold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
    light: 'SpaceGrotesk_300Light',
    mono: 'SpaceGrotesk_500Medium',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 28,
    xxl: 32,
    full: 9999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    hero: 34,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

const darkColors = {
  background: '#0B1512',
  bg2: '#0E1A17',
  surface: 'rgba(255,255,255,0.04)',
  surfaceHi: 'rgba(255,255,255,0.07)',
  surfaceLight: 'rgba(255,255,255,0.07)',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardBorderHi: 'rgba(255,255,255,0.14)',

  primary: '#4DD9C0',
  primaryDark: '#2FB8A0',
  primaryLight: 'rgba(77,217,192,0.22)',
  violet: '#9B7FD4',
  violetSoft: 'rgba(155,127,212,0.22)',
  accent: '#FFB547',
  accentLight: 'rgba(255,181,71,0.20)',

  text: '#E8F4F1',
  textSecondary: 'rgba(232,244,241,0.62)',
  textMuted: 'rgba(232,244,241,0.38)',

  danger: '#E8705A',
  dangerLight: 'rgba(232,112,90,0.18)',
  white: '#FFFFFF',
  black: '#051015',

  gradientStart: '#0B1512',
  gradientEnd: '#0E1A17',
  tabBar: 'rgba(255,255,255,0.04)',
  tabBarBorder: 'rgba(255,255,255,0.08)',

  trimester1: '#3B82F6',
  trimester2: '#10B981',
  trimester3: '#F59E0B',
  fetus: '#4DD9C0',
  partner: '#EC4899',
  actionCards: '#7C3AED',
  checkups: '#3B82F6',
  planning: '#F59E0B',
  birth: '#EC4899',
  dadModule: '#10B981',
  notifications: '#FFB547',
  fourthTrimester: '#8B5CF6',
  postBirth: '#06B6D4',
};

const lightColors = {
  background: '#EEF3F1',
  bg2: '#E4ECE9',
  surface: 'rgba(255,255,255,0.60)',
  surfaceHi: 'rgba(255,255,255,0.80)',
  surfaceLight: 'rgba(255,255,255,0.80)',
  card: 'rgba(255,255,255,0.60)',
  cardBorder: 'rgba(15,35,30,0.08)',
  cardBorderHi: 'rgba(15,35,30,0.16)',

  primary: '#1A9E8A',
  primaryDark: '#147A6A',
  primaryLight: 'rgba(26,158,138,0.18)',
  violet: '#7B5EA7',
  violetSoft: 'rgba(123,94,167,0.18)',
  accent: '#D97706',
  accentLight: 'rgba(217,119,6,0.18)',

  text: '#0B1512',
  textSecondary: 'rgba(11,21,18,0.62)',
  textMuted: 'rgba(11,21,18,0.42)',

  danger: '#C0392B',
  dangerLight: 'rgba(192,57,43,0.15)',
  white: '#FFFFFF',
  black: '#0B1512',

  gradientStart: '#EEF3F1',
  gradientEnd: '#E4ECE9',
  tabBar: 'rgba(255,255,255,0.80)',
  tabBarBorder: 'rgba(15,35,30,0.08)',

  trimester1: '#3B82F6',
  trimester2: '#10B981',
  trimester3: '#F59E0B',
  fetus: '#1A9E8A',
  partner: '#EC4899',
  actionCards: '#7C3AED',
  checkups: '#3B82F6',
  planning: '#F59E0B',
  birth: '#EC4899',
  dadModule: '#10B981',
  notifications: '#D97706',
  fourthTrimester: '#8B5CF6',
  postBirth: '#06B6D4',
};

export const darkTheme = { ...sharedTheme, colors: darkColors };
export const lightTheme = { ...sharedTheme, colors: lightColors };

export const theme = darkTheme;

export type Theme = typeof darkTheme;
