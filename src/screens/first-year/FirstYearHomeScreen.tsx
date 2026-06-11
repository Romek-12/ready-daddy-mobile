import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import GradientProgressBar from '../../components/ui/GradientProgressBar';
import AuroraBackground from '../../components/ui/AuroraBackground';
import type { Theme } from '../../theme';
import type { AppNavigation } from '../../types/navigation';
import { CONCEPTION_DAYS } from '../../constants';

interface Props {
  navigation: AppNavigation;
}

/**
 * Derives birth date from conceptionDate + PREGNANCY_DAYS (280d),
 * then returns how many months have passed since birth (0–12).
 * Returns -1 if not yet born or more than 12 months have passed.
 */
function getCurrentFirstYearMonth(conceptionDate: string | undefined): number {
  if (!conceptionDate) return -1;
  const conception = new Date(conceptionDate);
  const birth = new Date(conception.getTime() + CONCEPTION_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  if (now < birth) return -1;
  const monthsDiff =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (monthsDiff < 0 || monthsDiff > 12) return -1;
  return monthsDiff;
}

export default function FirstYearHomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme), [theme]);

  const currentMonth = getCurrentFirstYearMonth(user?.conceptionDate ?? undefined);

  const progressPercent = currentMonth >= 0 ? (currentMonth / 12) * 100 : 0;

  return (
    <AuroraBackground>
    <ScrollView
      style={s.scrollView}
      contentContainerStyle={[s.content, { paddingTop: insets.top + theme.spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>{'👶 Pierwszy Rok'}</Text>
        <Text style={s.subtitle}>{'Śledź rozwój miesiąc po miesiącu'}</Text>
      </View>

      {/* Progress card */}
      {currentMonth >= 0 && (
        <GlassCard elevated accent="cyan" style={s.progressCard}>
          <Text style={s.progressLabel}>{`Miesiąc ${currentMonth} z 12`}</Text>
          <GradientProgressBar value={Math.round(progressPercent)} height={6} glow />
        </GlassCard>
      )}

      {/* Month grid */}
      <View style={s.listContainer}>
        <View style={s.grid}>
          {Array.from({ length: 12 }).map((_, i) => {
            const month = i + 1;
            const isActive = month === currentMonth;
            const isDone = currentMonth >= 0 && month < currentMonth;
            const isFuture = currentMonth >= 0 && month > currentMonth;
            return (
              <TouchableOpacity key={month} onPress={() => navigation.navigate('Month', { month })} style={s.tileWrap}>
                <GlassCard style={[
                  s.tile,
                  isActive ? {
                    borderColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                    shadowOpacity: 0.6,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 5,
                  } : undefined,
                  isFuture ? { opacity: 0.45 } : undefined,
                ]}>
                  {/* violet tint overlay for done months */}
                  {isDone && (
                    <LinearGradient
                      colors={[theme.colors.violetSoft, 'transparent']}
                      style={s.doneTint}
                      pointerEvents="none"
                    />
                  )}
                  <Text style={[s.tileNum, isActive && { color: theme.colors.primary }, isDone && { color: theme.colors.violet }]}>
                    {month}
                  </Text>
                  <View style={s.tileBar}>
                    <View style={[
                      s.tileBarFill,
                      {
                        width: isDone ? '100%' : isActive ? '50%' : '0%',
                        backgroundColor: isDone ? theme.colors.violet : theme.colors.primary,
                      },
                    ]} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Badge teaser */}
      <GlassCard style={s.badgeTeaser}>
        <Text style={s.badgeTitle}>{'🏆 Tata Pierwszego Roku'}</Text>
        <Text style={s.badgeSubtitle}>
          {'Odznaka za przejście całego pierwszego roku'}
        </Text>
      </GlassCard>

      <View style={s.bottomSpacer} />
    </ScrollView>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      paddingBottom: theme.spacing.xl,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontFamily: theme.fonts.title,
      fontVariationSettings: '"wght" 700',
      fontSize: theme.fontSize.xxl,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    progressCard: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md,
    },
    progressLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    listContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    badgeTeaser: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    badgeTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    badgeSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    bottomSpacer: {
      height: 40,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tileWrap: { width: '23%' },
    tile: { aspectRatio: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    doneTint: { ...StyleSheet.absoluteFillObject, opacity: 0.45 },
    tileNum: { fontFamily: theme.fonts.title, fontVariationSettings: '"wght" 700', fontSize: 26, color: theme.colors.text },
    tileBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 0 },
    tileBarFill: { height: 3, borderRadius: 0 },
  });
