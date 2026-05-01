import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../ui/GlassCard';
import type { Theme } from '../../theme';
import type { DevelopmentMilestone } from '../../types/first-year.types';

interface Props {
  milestone: DevelopmentMilestone;
}

export default function DevelopmentMilestoneCard({ milestone }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  return (
    <GlassCard accent="cyan" style={s.card}>
      <View style={s.topRow}>
        <Text style={s.trophy}>{'🏆'}</Text>
        <Text style={s.title} numberOfLines={2}>
          {milestone.title}
        </Text>
      </View>

      <Text style={s.description}>{milestone.description}</Text>

      <View style={s.forDadRow}>
        <Text style={s.forDadLabel}>{'Dla taty: '}</Text>
        <Text style={s.forDadText}>{milestone.forDad}</Text>
      </View>
    </GlassCard>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    trophy: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
      lineHeight: 26,
    },
    title: {
      flex: 1,
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      lineHeight: 22,
    },
    description: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    forDadRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'baseline',
    },
    forDadLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    forDadText: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      color: theme.colors.accent,
      fontStyle: 'italic',
      lineHeight: 20,
    },
  });
