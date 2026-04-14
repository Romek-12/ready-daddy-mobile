import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../theme';
import type { MonthContent } from '../../types/first-year.types';

interface Props {
  content: MonthContent;
  isCurrentMonth: boolean;
  onPress: () => void;
}

function getMonthCircleColor(month: number, theme: Theme): string {
  if (month <= 3) return theme.colors.trimester1;
  if (month <= 6) return theme.colors.trimester2;
  if (month <= 9) return theme.colors.trimester3;
  return theme.colors.accent;
}

export default function MonthCard({ content, isCurrentMonth, onPress }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const circleColor = getMonthCircleColor(content.month, theme);
  const monthLabel = content.month === 0 ? '0' : String(content.month);
  const hasVaccines = content.vaccines.length > 0;

  return (
    <TouchableOpacity
      style={[s.card, isCurrentMonth && s.cardHighlighted]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Left: month circle */}
      <View style={[s.circle, { backgroundColor: circleColor + '22', borderColor: circleColor }]}>
        <Text style={[s.monthNumber, { color: circleColor }]}>{monthLabel}</Text>
      </View>

      {/* Center: title + subtitle */}
      <View style={s.center}>
        <Text style={s.title} numberOfLines={1}>
          {content.title}
        </Text>
        {hasVaccines && (
          <Text style={s.subtitle} numberOfLines={1}>
            {'💉 szczepienia'}
          </Text>
        )}
      </View>

      {/* Right: chevron */}
      <Text style={s.chevron}>{'›'}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    cardHighlighted: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
    circle: {
      width: 52,
      height: 52,
      borderRadius: theme.borderRadius.full,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    monthNumber: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    chevron: {
      fontSize: 28,
      color: theme.colors.textMuted,
      marginLeft: theme.spacing.sm,
      lineHeight: 32,
    },
  });
