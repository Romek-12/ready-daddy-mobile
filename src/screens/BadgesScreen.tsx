import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import RingLoader from '../components/ui/RingLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useBadges } from '../hooks/useBadges';
import BadgeCard from '../components/gamification/BadgeCard';
import Icon from '../components/Icon';
import GlassCard from '../components/ui/GlassCard';
import GlowPill from '../components/ui/GlowPill';
import AuroraBackground from '../components/ui/AuroraBackground';
import GradientProgressBar from '../components/ui/GradientProgressBar';
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
    <AuroraBackground>
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
        <GradientProgressBar value={Math.round(progress * 100)} height={6} glow />
        <Text style={s.progressLabel}>{Math.round(progress * 100)}% odblokowanych</Text>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <RingLoader size={120} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <GlassCard elevated style={s.levelHero}>
            <View style={s.levelBlob} pointerEvents="none" />
            <GlowPill variant="violet" label={`Poziom ${Math.floor(earnedCount / 3) + 1}`} />
            <Text style={s.levelText}>{earnedCount} z {totalCount} odznak odblokowanych</Text>
          </GlassCard>
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
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: topInset + 16,
      paddingBottom: theme.spacing.md,
      backgroundColor: 'transparent',
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    backBtn: { padding: theme.spacing.sm, width: 40 },
    counter: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.bold,
      color: theme.colors.primary,
      width: 40,
      textAlign: 'right',
    },
    progressContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: 'transparent',
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
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    levelHero: {
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
      position: 'relative',
    },
    levelBlob: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      top: -80,
      right: -60,
      backgroundColor: theme.colors.violetSoft,
      opacity: 0.6,
    },
    levelText: {
      marginTop: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.body,
    },
  });
