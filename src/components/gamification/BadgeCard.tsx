import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../theme';
import type { BadgeDefinition, EarnedBadge } from '../../types/badges.types';

interface Props {
  definition: BadgeDefinition;
  earned: EarnedBadge | undefined;
}

export default function BadgeCard({ definition, earned }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const isEarned = Boolean(earned);

  const earnedDate = earned
    ? new Date(earned.earnedAt).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <View style={[s.card, !isEarned && s.cardLocked]}>
      <Text style={[s.icon, !isEarned && s.iconLocked]}>{definition.icon}</Text>
      <Text style={[s.title, !isEarned && s.titleLocked]} numberOfLines={2}>
        {definition.title}
      </Text>
      {isEarned ? (
        <Text style={s.date}>{earnedDate}</Text>
      ) : (
        <Text style={s.hint} numberOfLines={2}>
          {definition.description}
        </Text>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      width: '30%',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '40',
      minHeight: 110,
    },
    cardLocked: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.cardBorder,
      opacity: 0.6,
    },
    icon: {
      fontSize: 32,
      marginBottom: theme.spacing.xs,
    },
    iconLocked: {
      opacity: 0.4,
    },
    title: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 2,
    },
    titleLocked: {
      color: theme.colors.textMuted,
    },
    date: {
      fontSize: 10,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    hint: {
      fontSize: 10,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 13,
    },
  });
