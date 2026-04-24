import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../Icon';
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
    <View style={[s.card, isEarned ? s.cardEarned : s.cardLocked]}>
      {isEarned ? (
        <Text style={s.icon}>{definition.icon}</Text>
      ) : (
        <View style={s.lockWrap}>
          <Icon name="lock" size={28} color={theme.colors.textMuted} />
        </View>
      )}
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
      width: '48%',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      minHeight: 130,
    },
    cardEarned: {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.5,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 },
      elevation: 5,
    },
    cardLocked: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.cardBorder,
      opacity: 0.55,
    },
    icon: {
      fontSize: 40,
      marginBottom: theme.spacing.sm,
    },
    lockWrap: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
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
