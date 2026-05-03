import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../Icon';
import GlassCard from '../ui/GlassCard';
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
    <GlassCard
      elevated={isEarned}
      style={[s.card, isEarned ? s.cardEarned : s.cardLocked]}
    >
      {/* Grayscale overlay for locked — desaturates content visually */}
      {!isEarned && <View style={s.grayscaleOverlay} pointerEvents="none" />}

      {isEarned ? (
        <Text style={s.icon}>{definition.icon}</Text>
      ) : (
        <View style={s.lockWrap}>
          <Icon name="lock" size={24} color={theme.colors.textMuted} />
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
    </GlassCard>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      width: '48%',
      padding: theme.spacing.md,
      alignItems: 'center',
      minHeight: 130,
      overflow: 'hidden',
    },
    cardEarned: {
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.55,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6,
    },
    cardLocked: {
      opacity: 0.4,
    },
    // Semi-transparent dark overlay that mutes colors to near-grayscale
    grayscaleOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(20,20,20,0.55)',
      zIndex: 1,
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
