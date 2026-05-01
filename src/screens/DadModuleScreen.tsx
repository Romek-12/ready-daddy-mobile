import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme';
import type { AppNavigation } from '../types/navigation';
import Icon from '../components/Icon';
import { useDadModule } from '../hooks/useAppData';
import GlassCard from '../components/ui/GlassCard';
import GlowPill from '../components/ui/GlowPill';
import AuroraBackground from '../components/ui/AuroraBackground';
import GradientText from '../components/ui/GradientText';
import Kicker from '../components/ui/Kicker';

const resolveIconColor = (colorKey: string, theme: Theme): string => {
  const colorMap: Record<string, string> = {
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    danger: theme.colors.danger,
    dadModule: theme.colors.dadModule,
    rose: theme.colors.partner,
  };
  return colorMap[colorKey] || theme.colors.primary;
};

export default function DadModuleScreen({ navigation }: { navigation: AppNavigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: content, isLoading, error, refetch } = useDadModule();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const s = React.useMemo(() => createStyles(theme, insets), [theme, insets]);

  if (isLoading) {
    return (
      <View style={[s.c, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.dadModule} />
      </View>
    );
  }

  if (error || !content) {
    return (
      <View style={[s.c, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ color: theme.colors.danger, textAlign: 'center', marginBottom: 16 }}>
          {error?.message || 'Nie udało się załadować zawartości'}
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: theme.colors.dadModule }}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'ciaza':
        return (
          <View style={s.sectionContent}>
            <Text style={s.subheading}>Emocje, które mogą towarzyszyć ciąży partnera:</Text>
            {content.emotions.map((e, i) => (
              <View key={i} style={s.emotionCard}>
                <Icon name={e.icon} size={24} color={resolveIconColor('primary', theme)} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.emotionLabel}>{e.label}</Text>
                  <Text style={s.emotionDesc}>{e.desc}</Text>
                </View>
              </View>
            ))}
            <Text style={[s.subheading, { marginTop: 24 }]}>Statystyki depresji poporodowej u ojców:</Text>
            {content.stats.map((stat, i) => (
              <View key={i} style={s.statCard}>
                <Text style={s.statNum}>{stat.num}</Text>
                <Text style={s.statDesc}>{stat.desc}</Text>
              </View>
            ))}
          </View>
        );

      case 'konflikty':
        return (
          <View style={s.sectionContent}>
            {content.conflicts.map((conf, i) => (
              <View key={i} style={s.conflictCard}>
                <Text style={s.conflictFeel}>{conf.feel}</Text>
                <Icon name="arrow-forward" size={16} color={theme.colors.textMuted} style={{ marginVertical: 8 }} />
                <Text style={s.conflictClash}>{conf.clash}</Text>
              </View>
            ))}
          </View>
        );

      case 'sygnaly':
        return (
          <View style={s.sectionContent}>
            {content.warnings.map((w, i) => (
              <View key={i} style={s.warningCard}>
                <Icon name={w.icon} size={20} color={theme.colors.danger} />
                <Text style={[s.warningText, { marginLeft: 12, flex: 1 }]}>{w.text}</Text>
              </View>
            ))}
          </View>
        );

      case 'pomoc':
        return (
          <View style={s.sectionContent}>
            {content.helpSteps.map((step, i) => (
              <View key={i} style={s.stepCard}>
                <View style={s.stepNumber}>
                  <Text style={s.stepNumberText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      case 'specjalista':
        return (
          <View style={s.sectionContent}>
            {content.specialists.map((spec, i) => (
              <View key={i} style={s.specialistCard}>
                <Icon name={spec.icon} size={32} color={resolveIconColor('accent', theme)} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.specialistTitle}>{spec.title}</Text>
                  <Text style={s.specialistDesc}>{spec.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      case 'wspolzycie':
        return (
          <View style={s.sectionContent}>
            {content.trimesterLibido.map((lib, i) => (
              <View key={i} style={[s.libidoCard, { borderLeftColor: lib.colorHex }]}>
                <Text style={[s.badgeText, { backgroundColor: lib.colorHex, color: lib.textColorHex }]}>
                  {lib.badge}
                </Text>
                <Text style={s.libidoTitle}>{lib.title}</Text>
                <Text style={s.libidoDesc}>{lib.desc}</Text>
                <View style={s.tagsContainer}>
                  {lib.tags.map((tag, j) => (
                    <Text key={j} style={[s.tag, { color: tag.type === 'down' ? theme.colors.danger : theme.colors.primary }]}>
                      {tag.text}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
            <Text style={[s.subheading, { marginTop: 16 }]}>Bezpieczne praktyki:</Text>
            {content.safePractices.map((prac, i) => (
              <View key={i} style={s.practiceCard}>
                <Text style={s.practiceTitle}>{prac.title}</Text>
                <Text style={s.practiceDesc}>{prac.desc}</Text>
              </View>
            ))}
            <Text style={[s.subheading, { marginTop: 16 }]}>Kiedy powstrzymać się od zbliżeń:</Text>
            {content.stopReasons.map((reason, i) => (
              <Text key={i} style={s.reasonText}>
                {i + 1}. {reason}
              </Text>
            ))}
            <Text style={[s.subheading, { marginTop: 16 }]}>Okres poporodowy:</Text>
            {content.postBirthSex.map((post, i) => (
              <View key={i} style={s.postCard}>
                <Text style={s.postTitle}>{post.title}</Text>
                <Text style={s.postDesc}>{post.desc}</Text>
              </View>
            ))}
            <Text style={[s.subheading, { marginTop: 16 }]}>Jak rozmawiać o intymności:</Text>
            {content.talkSteps.map((talk, i) => (
              <View key={i} style={s.talkCard}>
                <Text style={s.talkTitle}>{talk.title}</Text>
                <Text style={s.talkDesc}>{talk.desc}</Text>
              </View>
            ))}
          </View>
        );

      case 'bibliografia':
        return (
          <View style={s.sectionContent}>
            {content.bibliography.map((bib) => (
              <View key={bib.id} style={s.bibCard}>
                <Text style={s.bibAuthors}>{bib.authors}</Text>
                <Text style={s.bibTitle}>{bib.title}</Text>
                <Text style={s.bibJournal}>{bib.journal}</Text>
              </View>
            ))}
          </View>
        );

      case 'po-porodzie':
      default:
        return (
          <View style={s.sectionContent}>
            <Text style={s.placeholder}>Zawartość dla tego rozdziału — przygotowywana</Text>
          </View>
        );
    }
  };

  return (
    <AuroraBackground>
    <ScrollView style={s.c} contentContainerStyle={s.scrollContent}>
      <View style={s.header}>
        <Kicker style={s.headerKicker}>Moduł taty</Kicker>
        <View style={s.titleStack}>
          <Text style={s.title}>Twój</Text>
          <GradientText style={s.title}>poradnik.</GradientText>
        </View>
        <Text style={s.subtitle}>Praktyczne porady dla ojców — od narodzin do pierwszego roku.</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <GlassCard elevated style={s.tipCard}>
          <GlowPill label="Wskazówka dnia" />
          <Text style={s.tipQuote}>„Twoja obecność na sali porodowej robi różnicę — nawet jeśli czujesz się bezradny."</Text>
          <Text style={s.tipMeta}>Moduł: Poród · Rozdział 3</Text>
        </GlassCard>
      </View>

      <View style={s.sectionsHeader}>
        <Kicker>Sekcje</Kicker>
      </View>

      <View style={s.sectionList}>
        {content.sections.map((section, i) => {
          const isActive = activeSection === section.id;
          const accent: 'cyan' | 'violet' = i % 2 === 0 ? 'cyan' : 'violet';
          return (
            <TouchableOpacity
              key={section.id}
              activeOpacity={0.85}
              onPress={() => setActiveSection(isActive ? null : section.id)}
              style={s.sectionRowWrap}
            >
              <GlassCard
                accent={accent}
                elevated={isActive}
                style={s.sectionRow}
              >
                <View style={s.sectionRowIcon}>
                  <Icon name={section.icon} size={36} color={resolveIconColor(section.iconColorKey, theme)} />
                </View>
                <View style={s.sectionRowText}>
                  <Text style={s.sectionRowTitle}>{section.title}</Text>
                  {section.subtitle ? (
                    <Text style={s.sectionRowSubtitle} numberOfLines={2}>{section.subtitle}</Text>
                  ) : null}
                </View>
                <Icon
                  name={isActive ? 'expand-less' : 'arrow-forward'}
                  size={20}
                  color={theme.colors.textMuted}
                />
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeSection && renderSectionContent(activeSection)}

      <View style={{ height: 32 }} />
    </ScrollView>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    c: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: insets.bottom + 80 + 16 },
    header: { alignItems: 'flex-start', paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: 16, gap: 8 },
    headerKicker: { marginBottom: 4 },
    titleStack: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 },
    title: { fontSize: theme.fontSize.hero, fontFamily: theme.fonts.title, color: theme.colors.text, letterSpacing: 1 },
    subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: 8 },
    sectionsHeader: { paddingHorizontal: 16, marginBottom: 8 },

    sectionList: { paddingHorizontal: 16, marginBottom: 24, gap: 12 },
    sectionRowWrap: {},
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 14,
    },
    sectionRowIcon: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surfaceHi,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionRowText: { flex: 1 },
    sectionRowTitle: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    sectionRowSubtitle: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.body,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    sectionContent: { paddingHorizontal: 16, marginBottom: 24 },
    subheading: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: 12 },

    emotionCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    emotionLabel: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
    emotionDesc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 4 },

    statCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: theme.colors.dadModule },
    statNum: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.dadModule },
    statDesc: { fontSize: theme.fontSize.sm, color: theme.colors.text, marginTop: 4 },

    conflictCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    conflictFeel: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.primary, fontStyle: 'italic' },
    conflictClash: { fontSize: theme.fontSize.sm, color: theme.colors.text },

    warningCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    warningText: { fontSize: theme.fontSize.sm, color: theme.colors.text },

    stepCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.dadModule, justifyContent: 'center', alignItems: 'center' },
    stepNumberText: { color: '#fff', fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.sm },
    stepTitle: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginLeft: 12 },
    stepDesc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginLeft: 12, marginTop: 4 },

    specialistCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    specialistTitle: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
    specialistDesc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 4 },

    libidoCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12, borderLeftWidth: 3 },
    badgeText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
    libidoTitle: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
    libidoDesc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 6 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    tag: { fontSize: theme.fontSize.xs, fontStyle: 'italic' },

    practiceCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    practiceTitle: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
    practiceDesc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 4 },

    reasonText: { fontSize: theme.fontSize.sm, color: theme.colors.text, marginBottom: 8, paddingLeft: 8 },

    postCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    postTitle: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
    postDesc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 4 },

    talkCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    talkTitle: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
    talkDesc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 4 },

    bibCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
    bibAuthors: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.dadModule },
    bibTitle: { fontSize: theme.fontSize.xs, color: theme.colors.text, marginTop: 4, fontStyle: 'italic' },
    bibJournal: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },

    placeholder: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, fontStyle: 'italic', padding: 16, textAlign: 'center' },

    tipCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md },
    tipText: { marginTop: 8, fontFamily: theme.fonts.body, fontSize: theme.fontSize.md, color: theme.colors.text, lineHeight: 22 },
    tipQuote: { marginTop: 12, fontFamily: theme.fonts.semibold, fontSize: theme.fontSize.lg, color: theme.colors.text, lineHeight: 26, fontStyle: 'italic' },
    tipMeta: { marginTop: 12, fontFamily: theme.fonts.medium, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1 },
  });
