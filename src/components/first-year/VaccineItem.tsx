import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../ui/GlassCard';
import type { Theme } from '../../theme';
import type { VaccineInfo } from '../../types/first-year.types';

interface Props {
  vaccine: VaccineInfo;
}

export default function VaccineItem({ vaccine }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  return (
    <GlassCard style={s.row}>
      <View style={[s.dot, { backgroundColor: vaccine.mandatory ? theme.colors.primary : theme.colors.accent }]} />

      <View style={s.center}>
        <Text style={s.name}>{vaccine.name}</Text>
        <Text style={s.description} numberOfLines={2}>
          {vaccine.description}
        </Text>
        <Text style={s.when}>{vaccine.when}</Text>
      </View>

      <View style={[s.badge, vaccine.mandatory ? s.badgeMandatory : s.badgeOptional]}>
        <Text style={[s.badgeText, vaccine.mandatory ? s.badgeTextMandatory : s.badgeTextOptional]}>
          {vaccine.mandatory ? 'Obowiązkowe' : 'Zalecane'}
        </Text>
      </View>
    </GlassCard>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: theme.borderRadius.full,
      marginTop: 5,
      marginRight: theme.spacing.sm,
      flexShrink: 0,
    },
    center: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    name: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: 2,
    },
    description: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: 2,
    },
    when: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textMuted,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
      marginTop: 2,
    },
    badgeMandatory: {
      backgroundColor: theme.colors.primary + '22',
      borderWidth: 1,
      borderColor: theme.colors.primary + '55',
    },
    badgeOptional: {
      backgroundColor: theme.colors.accent + '22',
      borderWidth: 1,
      borderColor: theme.colors.accent + '55',
    },
    badgeText: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.semibold,
    },
    badgeTextMandatory: {
      color: theme.colors.primary,
    },
    badgeTextOptional: {
      color: theme.colors.accent,
    },
  });
