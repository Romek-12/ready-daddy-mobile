import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import MonthCard from '../../components/first-year/MonthCard';
import { FIRST_YEAR_CONTENT } from '../../data/first-year-content';
import type { Theme } from '../../theme';
import type { AppNavigation } from '../../types/navigation';

interface Props {
  navigation: AppNavigation;
}

function getCurrentFirstYearMonth(dueDate: string | undefined): number {
  if (!dueDate) return -1;
  const birth = new Date(dueDate);
  const now = new Date();
  if (now < birth) return -1; // still pregnant
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

  // User type has conceptionDate but not dueDate — use conceptionDate as fallback
  // The spec says dueDate for simplicity; we derive from available field.
  const dueDate = (user as { dueDate?: string } & typeof user)?.dueDate;
  const currentMonth = getCurrentFirstYearMonth(dueDate);

  const progressPercent = currentMonth >= 0 ? (currentMonth / 12) * 100 : 0;

  return (
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
        <View style={s.progressCard}>
          <Text style={s.progressLabel}>{`Miesiąc ${currentMonth} z 12`}</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      )}

      {/* Month cards */}
      <View style={s.listContainer}>
        {FIRST_YEAR_CONTENT.map((content) => (
          <MonthCard
            key={content.month}
            content={content}
            isCurrentMonth={content.month === currentMonth}
            onPress={() => navigation.navigate('Month', { month: content.month })}
          />
        ))}
      </View>

      {/* Badge teaser */}
      <View style={s.badgeTeaser}>
        <Text style={s.badgeTitle}>{'🏆 Tata Pierwszego Roku'}</Text>
        <Text style={s.badgeSubtitle}>
          {'Odznaka za przejście całego pierwszego roku'}
        </Text>
      </View>

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    progressLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    progressTrack: {
      height: 6,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
    },
    listContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    badgeTeaser: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
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
  });
