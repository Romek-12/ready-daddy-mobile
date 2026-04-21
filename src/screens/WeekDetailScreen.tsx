import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';
import { useWeekDetail } from '../hooks/useAppData';
import Icon from '../components/Icon';
import SkeletonBox from '../components/SkeletonBox';
import FetusVisualizer from '../components/FetusVisualizer';
import type { Theme } from '../theme';
import type { ActionCard, CheckupItem } from '../services/api';
import AuroraBackground from '../components/ui/AuroraBackground';

type Props = { route?: { params?: { week?: number } } };

const MIN_WEEK = 2;
const MAX_WEEK = 40;

export default function WeekDetailScreen({ route }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);
  const initialWeek = route?.params?.week || 12;
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);
  const [sliderValue, setSliderValue] = useState<number>(initialWeek);

  const { data, isLoading, error } = useWeekDetail(selectedWeek);

  const trimesterColor = (t?: number) => t === 1
    ? theme.colors.trimester1
    : t === 2
    ? theme.colors.trimester2
    : theme.colors.trimester3;

  if (isLoading) return (
    <ScrollView style={s.c} bounces={false}>
      <View style={s.sliderSection}>
        <SkeletonBox width={200} height={36} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={32} borderRadius={16} />
      </View>
      <SkeletonBox width="100%" height={240} style={{ marginHorizontal: 0, marginBottom: 16 }} />
      {[...Array(3)].map((_, i) => (
        <View key={i} style={s.card}>
          <SkeletonBox width={140} height={24} style={{ marginBottom: 16 }} />
          <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonBox width="80%" height={16} />
        </View>
      ))}
    </ScrollView>
  );

  if (error) return (
    <View style={[s.c, s.center]}>
      <Text style={s.errorText}>{error instanceof Error ? error.message : 'Nie udało się załadować danych'}</Text>
    </View>
  );

  const w = data?.week;
  const tColor = trimesterColor(w?.trimester);

  return (
    <AuroraBackground>
    <ScrollView style={s.c} stickyHeaderIndices={[0]}>
      {/* Sticky slider header */}
      <View style={s.sliderSection}>
        <View style={s.sliderHeader}>
          <TouchableOpacity
            style={s.weekBtn}
            onPress={() => { const v = Math.max(MIN_WEEK, selectedWeek - 1); setSelectedWeek(v); setSliderValue(v); }}
          >
            <Icon name="arrow-back" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={s.weekLabelWrap}>
            <Text style={[s.weekLabel, { color: tColor }]}>Tydzień {sliderValue}</Text>
            {w?.trimester && (
              <Text style={[s.trimLabel, { color: tColor }]}>
                {w.trimester === 1 ? 'I' : w.trimester === 2 ? 'II' : 'III'} trymestr
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={s.weekBtn}
            onPress={() => { const v = Math.min(MAX_WEEK, selectedWeek + 1); setSelectedWeek(v); setSliderValue(v); }}
          >
            <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Slider
          style={s.slider}
          minimumValue={MIN_WEEK}
          maximumValue={MAX_WEEK}
          step={1}
          value={sliderValue}
          minimumTrackTintColor={tColor}
          maximumTrackTintColor={theme.colors.surfaceLight}
          thumbTintColor={tColor}
          onValueChange={(v) => setSliderValue(Math.round(v))}
          onSlidingComplete={(v) => setSelectedWeek(Math.round(v))}
        />
        <View style={s.sliderLabels}>
          <Text style={s.sliderLabelText}>Tydzień 6</Text>
          <Text style={s.sliderLabelText}>Tydzień 40</Text>
        </View>
      </View>

      {/* Fetus visualizer */}
      <View style={s.visualizerCard}>
        <FetusVisualizer
          week={selectedWeek}
          sizeMm={w?.fetus_size_mm ?? 0}
          weightG={w?.fetus_weight_g ?? 0}
          trimester={w?.trimester ?? 1}
          weekData={w ?? undefined}
        />
      </View>

      {/* Content cards */}
      {w ? (
        <>
          <View style={s.card}>
            <View style={s.cardHeader}><Icon name="fetus" size={20} color={theme.colors.fetus} /><Text style={s.cardTitle}> Rozwój płodu</Text></View>
            <Text style={s.desc}>{w.fetus_description}</Text>
          </View>

          {w.partner_emotional && (
            <View style={s.card}>
              <View style={s.cardHeader}><Icon name="brain" size={20} color={theme.colors.partner} /><Text style={s.cardTitle}> Co czuje Twoja partnerka</Text></View>
              <Text style={s.desc}>{w.partner_emotional}</Text>
            </View>
          )}

          {w.partner_tips && (
            <View style={s.card}>
              <View style={s.cardHeader}><Icon name="lightbulb" size={20} color={theme.colors.accent} /><Text style={s.cardTitle}> Co możesz zrobić</Text></View>
              <Text style={s.desc}>{w.partner_tips}</Text>
            </View>
          )}

          {w.dad_symptoms && (
            <View style={s.card}>
              <View style={s.cardHeader}><Icon name="dad" size={20} color={theme.colors.dadModule} /><Text style={s.cardTitle}> Co mi się dzieje?</Text></View>
              <Text style={s.desc}>{w.dad_symptoms}</Text>
              {w.dad_tips && <><Text style={s.tipLabel}>Porada:</Text><Text style={s.tipText}>{w.dad_tips}</Text></>}
            </View>
          )}
        </>
      ) : (
        <View style={[s.card, s.center]}>
          <Text style={s.empty}>Brak danych dla tygodnia {selectedWeek}</Text>
        </View>
      )}

      {(data?.actionCards?.length ?? 0) > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}><Icon name="bolt" size={20} color={theme.colors.accent} /><Text style={s.sectionTitle}> Karty na ten tydzień</Text></View>
          {data!.actionCards.map((card: ActionCard) => (
            <View key={card.id} style={s.actionCard}>
              <Text style={s.actionTitle}>{card.emoji} {card.title}</Text>
              {card.herSide?.[0] && <Text style={s.desc}>{card.herSide[0]}</Text>}
              {card.herSide?.[1] && <Text style={s.science}>{card.herSide[1]}</Text>}
              {card.do?.[0] && (
                <View style={s.actionBox}>
                  <View style={s.actionBoxHeader}><Icon name="check-circle" size={16} color={theme.colors.primary} /><Text style={s.actionBoxLabel}> Co zrobić:</Text></View>
                  <Text style={s.actionBoxText}>{card.do[0]}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {(data?.checkups?.length ?? 0) > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}><Icon name="calendar" size={20} color={theme.colors.checkups} /><Text style={s.sectionTitle}> Badania w tym tygodniu</Text></View>
          {data!.checkups.map((ch: CheckupItem) => (
            <View key={ch.id} style={s.checkupCard}>
              <Text style={s.checkupName}>{ch.name}</Text>
              <Text style={s.desc}>{ch.description}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  c: { flex: 1, backgroundColor: 'transparent' },
  center: { justifyContent: 'center', alignItems: 'center' },
  empty: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  errorText: { fontSize: theme.fontSize.md, color: theme.colors.danger, textAlign: 'center', marginHorizontal: theme.spacing.xl },

  sliderSection: {
    backgroundColor: theme.colors.background,
    paddingTop: 50,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorderHi,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekBtn: {
    padding: 8,
  },
  weekLabelWrap: {
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fonts.title,
  },
  trimLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    marginTop: 2,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderLabelText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },

  visualizerCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  card: { marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  cardTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  desc: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, lineHeight: 24, marginTop: theme.spacing.sm },
  tipLabel: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.primary, marginTop: theme.spacing.md },
  tipText: { fontSize: theme.fontSize.md, color: theme.colors.text, lineHeight: 24, marginTop: 4 },
  section: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  actionCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl, marginBottom: theme.spacing.md },
  actionTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.accent },
  science: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, fontStyle: 'italic', marginTop: theme.spacing.sm, lineHeight: 20 },
  actionBox: { backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginTop: theme.spacing.md },
  actionBoxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  actionBoxLabel: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
  actionBoxText: { fontSize: theme.fontSize.sm, color: theme.colors.text, lineHeight: 22 },
  checkupCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  checkupName: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.checkups },
});
