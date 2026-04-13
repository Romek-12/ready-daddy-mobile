import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useBadges } from '../hooks/useBadges';
import BadgeCard from '../components/gamification/BadgeCard';
import Icon from '../components/Icon';
import { BADGE_DEFINITIONS } from '../data/badges-definitions';
import type { Theme } from '../theme';
import type { BadgeCategory } from '../types/badges.types';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'Badges'>;

const CATEGORIES: { key: BadgeCategory; label: string }[] = [
  { key: 'pregnancy', label: 'Ciąża' },
  { key: 'tasks', label: 'Zadania' },
  { key: 'journal', label: 'Dziennik' },
  { key: 'engagement', label: 'Zaangażowanie' },
];

export default function BadgesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const { earned, isLoading, totalCount, earnedCount } = useBadges();

  const progress = totalCount > 0 ? earnedCount / totalCount : 0;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Twoje Odznaki</Text>
        <Text style={s.counter}>{earnedCount}/{totalCount}</Text>
      </View>

      {/* Progress bar */}
      <View style={s.progressContainer}>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={s.progressLabel}>{Math.round(progress * 100)}% odblokowanych</Text>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {CATEGORIES.map(cat => {
            const defs = BADGE_DEFINITIONS.filter(b => b.category === cat.key);
            return (
              <View key={cat.key} style={s.section}>
                <Text style={s.sectionTitle}>{cat.label}</Text>
                <View style={s.grid}>
                  {defs.map(def => {
                    const earnedBadge = earned.find(e => e.badgeId === def.id);
                    return (
                      <BadgeCard key={def.id} definition={def} earned={earnedBadge} />
                    );
                  })}
                </View>
              </View>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: topInset + 16,
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    backBtn: { padding: theme.spacing.sm, width: 40 },
    counter: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primary,
      width: 40,
      textAlign: 'right',
    },
    progressContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.cardBorder,
    },
    progressBg: {
      height: 6,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
    },
    progressLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs,
    },
    scroll: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    section: { marginBottom: theme.spacing.xl },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
