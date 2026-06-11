import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useFourthTrimester } from '../hooks/useAppData';
import Icon from '../components/Icon';
import { renderNumberedText } from '../utils/textFormatting';
import type { Theme } from '../theme';
import GlassCard from '../components/ui/GlassCard';
import ProgressRing from '../components/ui/ProgressRing';
import AuroraBackground from '../components/ui/AuroraBackground';
import GradientText from '../components/ui/GradientText';
import Kicker from '../components/ui/Kicker';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

interface FourthTrimesterWeek {
  id: number;
  week_after_birth: number;
  title: string;
  description: string;
  baby_development?: string;
  relationship_tips?: string;
  self_care?: string;
  warning_signs?: string;
}

const WEEK_EMOJI: Record<number, string> = {
  1: '👶', 2: '😴', 3: '🍼', 4: '👀',
  5: '😊', 6: '🤱', 7: '✨', 8: '🎵',
  9: '🌱', 10: '💪', 11: '🌈', 12: '🎉',
};

export default function FourthTrimesterScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = React.useMemo(() => createStyles(theme, insets), [theme, insets]);
  const { data } = useFourthTrimester();
  const weeks: FourthTrimesterWeek[] = data?.weeks ?? [];

  const [expanded, setExpanded] = useState<number | null>(null);
  const currentWeek = 1;
  const weekProgress = (currentWeek / 12) * 100;

  const toggle = (idx: number) => setExpanded(expanded === idx ? null : idx);

  if (!data) {
    return (
      <View style={[s.c, s.center]}>
        <Text style={{ color: theme.colors.textMuted }}>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <AuroraBackground>
    <View style={{ flex: 1 }}>
      <View style={s.header}>
        <Kicker>IV Trymestr</Kicker>
        <View style={s.titleStack}>
          <Text style={s.title}>Nowe</Text>
          <GradientText style={s.title} colors={[theme.colors.fourthTrimester, theme.colors.violet]}>życie.</GradientText>
        </View>
        <Text style={s.subtitle}>Pierwsze tygodnie dziecka i matki po porodzie</Text>
      </View>
    <ScrollView style={s.c} contentContainerStyle={s.scrollContent}>
      <GlassCard elevated style={s.hero}>
        <ProgressRing value={weekProgress} size={80} stroke={7}>
          <Text style={s.ringText}>{currentWeek}</Text>
        </ProgressRing>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={s.heroTitle}>Czwarty trymestr</Text>
          <Text style={s.heroSub}>Tydzień {currentWeek} z 12</Text>
        </View>
      </GlassCard>

      <View style={s.infoCard}>
        <Text style={s.infoText}>
          Czwarty trymestr to pierwsze 12 tygodni życia noworodka poza łonem matki. Niemowlę powoli adaptuje się do nowych bodźców, dźwięków i bodźców, a dla Was to bardzo wymagający okres wdrażania się w nową rolę.
        </Text>
      </View>

      <View style={s.listContainer}>
        {weeks.map((w: FourthTrimesterWeek, idx: number) => {
          const isExpanded = expanded === idx;
          return (
            <View key={w.id} style={s.accordionWrap}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => toggle(idx)} style={[s.cardHeader, isExpanded && s.cardHeaderActive]}>
                <Text style={s.weekEmoji}>{WEEK_EMOJI[w.week_after_birth] ?? '👶'}</Text>
                <View style={s.headerLeft}>
                  <View style={s.weekBadge}>
                    <Text style={s.weekBadgeText}>Tydzień {w.week_after_birth}</Text>
                  </View>
                  <Text style={s.cardTitle}>{w.title}</Text>
                </View>
                <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={s.cardContent}>
                  <Text style={s.desc}>{w.description}</Text>

                  {w.baby_development ? (
                    <View style={s.section}>
                       <View style={s.sectionHeader}><Icon name="baby" size={16} color={theme.colors.primary} /><Text style={s.sectionLabel}> Rozwój dziecka:</Text></View>
                      {renderNumberedText(w.baby_development, s.sectionText)}
                    </View>
                  ) : null}

                  {w.relationship_tips ? (
                    <View style={[s.section, { backgroundColor: theme.colors.primaryLight }]}>
                       <View style={s.sectionHeader}><Icon name="couple" size={16} color={theme.colors.primary} /><Text style={s.sectionLabel}> Wy i Wasza relacja:</Text></View>
                      {renderNumberedText(w.relationship_tips, s.sectionText)}
                    </View>
                  ) : null}

                  {w.warning_signs ? (
                    <View style={[s.section, { backgroundColor: theme.colors.dangerLight }]}>
                       <View style={s.sectionHeader}><Icon name="warning" size={16} color={theme.colors.danger} /><Text style={[s.sectionLabel, { color: theme.colors.danger }]}> Zwróć uwagę (objawy alarmowe):</Text></View>
                      {renderNumberedText(w.warning_signs, s.sectionText)}
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          );
        })}
      </View>
      <MedicalDisclaimer />
      <View style={{ height: 40 }} />
    </ScrollView>
    </View>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, insets: { top: number; bottom: number }) => StyleSheet.create({
  c: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: insets.bottom + 80 + 16 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'flex-start', paddingHorizontal: theme.spacing.lg, paddingTop: insets.top + 16, paddingBottom: 24, gap: 8 },
  titleStack: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 },
  title: { fontSize: theme.fontSize.hero, fontFamily: theme.fonts.title, fontVariationSettings: '"wght" 700', color: theme.colors.text, letterSpacing: 1 },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: 8 },
  infoCard: { marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xl, backgroundColor: theme.colors.accentLight, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.accent + '33' },
  infoText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, lineHeight: 24 },
  listContainer: { paddingHorizontal: theme.spacing.lg },
  accordionWrap: { marginBottom: theme.spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.cardBorder },
  weekEmoji: { fontSize: 28 },
  cardHeaderActive: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  headerLeft: { flex: 1, paddingRight: theme.spacing.md },
  weekBadge: { backgroundColor: theme.colors.fourthTrimester, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.full, alignSelf: 'flex-start', marginBottom: theme.spacing.xs },
  weekBadgeText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
  cardTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  cardContent: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: theme.borderRadius.lg, borderBottomRightRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.cardBorder, borderTopWidth: 0, padding: theme.spacing.lg },
  desc: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, lineHeight: 24 },
  section: { marginTop: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.borderRadius.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionLabel: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
  sectionText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, lineHeight: 22 },

  hero: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
  ringText: { fontFamily: theme.fonts.title, fontVariationSettings: '"wght" 700', fontSize: 22, color: theme.colors.text },
  heroTitle: { fontFamily: theme.fonts.title, fontVariationSettings: '"wght" 700', fontSize: theme.fontSize.xl, color: theme.colors.text },
  heroSub: { fontFamily: theme.fonts.body, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
});
