import React, { useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import DevelopmentMilestoneCard from '../../components/first-year/DevelopmentMilestone';
import VaccineItem from '../../components/first-year/VaccineItem';
import { FIRST_YEAR_CONTENT } from '../../data/first-year-content';
import AuroraBackground from '../../components/ui/AuroraBackground';
import type { Theme } from '../../theme';
import type { AppNavigation } from '../../types/navigation';

interface Props {
  navigation: AppNavigation;
  route: { params: { month: number } };
}

function getMonthColor(month: number, theme: Theme): string {
  if (month <= 3) return theme.colors.trimester1;
  if (month <= 6) return theme.colors.trimester2;
  if (month <= 9) return theme.colors.trimester3;
  return theme.colors.accent;
}

export default function MonthScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme), [theme]);

  const content = FIRST_YEAR_CONTENT.find((c) => c.month === route.params.month);

  if (!content) {
    return (
      <View style={s.errorContainer}>
        <Text style={s.errorText}>{'Nie znaleziono treści'}</Text>
        <TouchableOpacity style={s.backButtonFallback} onPress={() => navigation.goBack()}>
          <Text style={s.backButtonFallbackText}>{'← Wróć'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const circleColor = getMonthColor(content.month, theme);

  return (
    <AuroraBackground>
    <ScrollView
      style={s.scrollView}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header */}
      <View style={[s.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
          <Text style={s.backButtonText}>{'← Wróć'}</Text>
        </TouchableOpacity>

        <View style={s.headerMain}>
          <View style={[s.monthCircle, { backgroundColor: circleColor }]}>
            <Text style={s.monthCircleText}>{String(content.month)}</Text>
          </View>
          <Text style={s.title}>{content.title}</Text>
        </View>

        {/* Tip of month */}
        <View style={s.tipCard}>
          <Text style={s.tipText}>{content.tipOfMonth}</Text>
        </View>
      </View>

      {/* 2. Baby development */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{'👶 Rozwój dziecka'}</Text>
        {content.babyDevelopment.map((item, index) => (
          <View key={index} style={s.bulletRow}>
            <Text style={s.bullet}>{'•'}</Text>
            <Text style={s.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* 3. Dad role */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{'💪 Rola Taty'}</Text>
        {content.dadRole.map((item, index) => (
          <View key={index} style={s.bulletRow}>
            <Text style={s.bullet}>{'•'}</Text>
            <Text style={s.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* 4. Milestones (conditional) */}
      {content.milestones.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{'⭐ Kamienie milowe'}</Text>
          {content.milestones.map((milestone) => (
            <DevelopmentMilestoneCard key={milestone.id} milestone={milestone} />
          ))}
        </View>
      )}

      {/* 5. Vaccines (conditional) */}
      {content.vaccines.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{'💉 Szczepienia'}</Text>
          {content.vaccines.map((vaccine, index) => (
            <VaccineItem key={index} vaccine={vaccine} />
          ))}
        </View>
      )}

      {/* 6. Emotional note */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{'💙 Emocje'}</Text>
        <View style={s.emotionalCard}>
          <Text style={s.emotionalText}>{content.emotionalNote}</Text>
        </View>
      </View>

      {/* 7. Journal button */}
      <TouchableOpacity
        style={s.journalButton}
        onPress={() => navigation.navigate('AddEntry', {})}
        activeOpacity={0.8}
      >
        <Text style={s.journalButtonText}>{'Dodaj wpis do dziennika'}</Text>
      </TouchableOpacity>

      {/* 8. Bottom spacer */}
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

    /* Error state */
    errorContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    errorText: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    backButtonFallback: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    backButtonFallbackText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.semibold,
    },

    /* Header */
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    backButtonText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.semibold,
    },
    headerMain: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    monthCircle: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      flexShrink: 0,
    },
    monthCircleText: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.white,
    },
    title: {
      flex: 1,
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      lineHeight: 28,
    },
    tipCard: {
      backgroundColor: theme.colors.accent,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },
    tipText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.white,
      lineHeight: 22,
    },

    /* Sections */
    section: {
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },

    /* Bullet list */
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    bullet: {
      fontSize: theme.fontSize.md,
      color: theme.colors.primary,
      marginRight: theme.spacing.sm,
      lineHeight: 22,
      flexShrink: 0,
    },
    bulletText: {
      flex: 1,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      lineHeight: 22,
    },

    /* Emotional note card */
    emotionalCard: {
      backgroundColor: theme.colors.primary + '1A',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primary + '33',
    },
    emotionalText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      lineHeight: 22,
      fontStyle: 'italic',
    },

    /* Journal button */
    journalButton: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.xl,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    journalButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.white,
    },

    /* Spacer */
    bottomSpacer: {
      height: 40,
    },
  });
