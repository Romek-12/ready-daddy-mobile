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
import AuroraBackground from '../components/ui/AuroraBackground';
import GradientText from '../components/ui/GradientText';
import Kicker from '../components/ui/Kicker';
import ProgressRing from '../components/ui/ProgressRing';
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
      {/* Back button */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Hero header */}
      <View style={s.heroHeader}>
        <Kicker>Gamifikacja</Kicker>
        <View style={s.titleRow}>
          <Text style={s.titleWhite}>Twoje </Text>
          <GradientText style={s.titleGradient}>odznaki.</GradientText>
        </View>
        <Text style={s.subtitle}>Zbieraj odznaki i śledź swój postęp jako tata.</Text>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <RingLoader size={120} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <GlassCard elevated style={s.levelHero}>
            <ProgressRing value={Math.round(progress * 100)} size={80} stroke={7}>
              <Text style={s.ringPercent}>{Math.round(progress * 100)}%</Text>
            </ProgressRing>
            <View style={s.levelInfo}>
              <Text style={s.levelTitle}>Poziom wtajemniczenia</Text>
              <Text style={s.levelSub}>{earnedCount}/{totalCount} odblokowanych</Text>
            </View>
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
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: topInset + 16,
      paddingBottom: theme.spacing.sm,
    },
    backBtn: { padding: theme.spacing.sm },
    heroHeader: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      gap: 6,
    },
    titleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'baseline',
    },
    titleWhite: {
      fontSize: theme.fontSize.hero,
      fontFamily: theme.fonts.title,
      fontVariationSettings: '"wght" 700',
      color: theme.colors.text,
      letterSpacing: 1,
    },
    titleGradient: {
      fontSize: theme.fontSize.hero,
      fontFamily: theme.fonts.title,
      fontVariationSettings: '"wght" 700',
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginTop: 4,
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
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    levelInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    ringPercent: {
      fontFamily: theme.fonts.title,
      fontVariationSettings: '"wght" 700',
      fontSize: 16,
      color: theme.colors.text,
    },
    levelTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: theme.fontSize.lg,
      color: theme.colors.text,
    },
    levelSub: {
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSize.sm,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
  });
