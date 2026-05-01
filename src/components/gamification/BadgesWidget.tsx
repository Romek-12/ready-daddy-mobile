import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBadges } from '../../hooks/useBadges';
import { getBadgeDefinition } from '../../services/gamification/BadgeService';
import GlassCard from '../ui/GlassCard';
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
      style={s.wrap}
      onPress={onPressAll}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Zobacz odznaki"
    >
      <GlassCard elevated accent="cyan" style={s.card}>
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
      </GlassCard>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    card: {
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
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
