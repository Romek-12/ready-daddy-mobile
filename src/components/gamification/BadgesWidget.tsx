import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBadges } from '../../hooks/useBadges';
import { getBadgeDefinition } from '../../services/gamification/BadgeService';
import type { Theme } from '../../theme';

interface Props {
  onPressAll: () => void;
}

export default function BadgesWidget({ onPressAll }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const { earned, totalCount, earnedCount, isLoading } = useBadges();

  if (isLoading) return null;

  const lastEarned = earned.length > 0
    ? [...earned].sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())[0]
    : null;
  const lastDef = lastEarned ? getBadgeDefinition(lastEarned.badgeId) : null;

  return (
    <TouchableOpacity
      style={s.card}
      onPress={onPressAll}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Zobacz odznaki"
    >
      <View style={s.left}>
        <Text style={s.emoji}>{lastDef ? lastDef.icon : '🏆'}</Text>
        <View style={s.textCol}>
          <Text style={s.title}>
            {lastDef ? lastDef.title : 'Zdobądź pierwszą odznakę!'}
          </Text>
          <Text style={s.sub}>
            {earnedCount > 0
              ? `${earnedCount} z ${totalCount} odznaki`
              : 'Brak odznak — zacznij działać!'}
          </Text>
        </View>
      </View>
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
      elevation: 1,
    },
    left: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    emoji: { fontSize: 28 },
    textCol: { flex: 1 },
    title: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    sub: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    arrow: {
      fontSize: 22,
      color: theme.colors.textMuted,
      marginLeft: theme.spacing.sm,
    },
  });
